import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { pool, ensureDbReady } from '../db.js';
import { getClaims, forgetAccountCache } from '../auth.js';
import { canAccessProject, findProject } from '../access.js';
import { hashPassword } from '../password.js';

/**
 * Door-security accounts, managed by whoever runs the campaign (brand editors and the
 * superadmin) from that campaign's Campaign Hub — not from the superadmin's team page.
 * Every call is checked against the campaign: an editor can only touch gate accounts of a
 * campaign they can open themselves. A gate account itself can never reach this router
 * (the gate guard in front of /api refuses it).
 */
export const gateAccountsRouter = Router();

/** Longest a gate account may be valid for: door staff are for an event, not for good. */
const MAX_VALID_DAYS = 31;
const USERNAME_RE = /^[A-Za-z0-9][A-Za-z0-9 ._-]{2,39}$/;

function randomPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from({ length: 12 }, () => alphabet[crypto.randomInt(alphabet.length)]).join('');
}

function clientAccount(r: any) {
  return {
    id: r.id,
    username: r.name,
    status: r.status || 'active',
    expiresAt: r.expires_at || null,
    createdAt: r.created_at,
    project: r.assigned_project
  };
}

/** The campaign this request is about, if the caller may open it; otherwise answers and returns null. */
async function campaignFor(req: Request, res: Response, projectId: string) {
  const project = projectId ? await findProject(projectId) : null;
  if (!project || !canAccessProject(getClaims(res), project)) {
    res.status(404).json({ success: false, error: 'Campaign not found.' });
    return null;
  }
  return project;
}

/** A gate account the caller may manage (its campaign must be one they can open), or null after answering. */
async function accountFor(req: Request, res: Response) {
  const found = await pool.query("SELECT * FROM users WHERE id = $1 AND role = 'gate'", [String(req.params.id)]);
  const row = found.rows[0];
  const project = row ? await findProject(String(row.assigned_project || '')) : null;
  if (!row || !project || !canAccessProject(getClaims(res), project)) {
    res.status(404).json({ success: false, error: 'Gate account not found.' });
    return null;
  }
  return row;
}

gateAccountsRouter.use(async (_req, res, next) => {
  if (!(await ensureDbReady())) {
    return res.status(503).json({ success: false, error: 'Gate accounts need the database. Please try again in a moment.' });
  }
  next();
});

// GET /api/gate-accounts?project=ID
gateAccountsRouter.get('/', async (req: Request, res: Response) => {
  const project = await campaignFor(req, res, String(req.query.project || ''));
  if (!project) return;
  const result = await pool.query(
    "SELECT * FROM users WHERE role = 'gate' AND assigned_project = $1 ORDER BY created_at DESC",
    [String(project.id)]
  );
  return res.json({ success: true, data: result.rows.map(clientAccount) });
});

// POST /api/gate-accounts { project, username, expiresAt } -> the password is returned once, here
gateAccountsRouter.post('/', async (req: Request, res: Response) => {
  const { project: projectId, username, expiresAt } = req.body || {};
  const project = await campaignFor(req, res, String(projectId || ''));
  if (!project) return;

  const name = String(username || '').trim().replace(/\s+/g, ' ');
  if (!USERNAME_RE.test(name)) {
    return res.status(400).json({ success: false, error: 'Username: 3–40 characters, letters, numbers, spaces, dot, dash or underscore.' });
  }
  const at = new Date(String(expiresAt || '')).getTime();
  if (!expiresAt || Number.isNaN(at) || at <= Date.now()) {
    return res.status(400).json({ success: false, error: 'Set an expiry date and time in the future.' });
  }
  if (at > Date.now() + MAX_VALID_DAYS * 86_400_000) {
    return res.status(400).json({ success: false, error: `A gate account can be valid for at most ${MAX_VALID_DAYS} days.` });
  }

  // The username is what they sign in with, so it must not be anyone else's name, email or id.
  const clash = await pool.query('SELECT 1 FROM users WHERE LOWER(name) = LOWER($1) OR LOWER(email) = LOWER($1) OR LOWER(id) = LOWER($1) LIMIT 1', [name]);
  if (clash.rows.length) {
    return res.status(409).json({ success: false, error: 'That username is already taken. Choose another.' });
  }

  const id = `gate_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const password = randomPassword();
  const result = await pool.query(
    `INSERT INTO users (id, name, email, phone, password, role, assigned_brands, avatar_url, status, created_at, last_active_at, assigned_project, expires_at)
     VALUES ($1, $2, $3, '', $4, 'gate', '[]'::jsonb, '', 'active', NOW(), 'Never', $5, $6)
     RETURNING *`,
    [id, name, `${id}@gate.707.internal`, hashPassword(password), String(project.id), new Date(at).toISOString()]
  );
  return res.status(201).json({ success: true, data: clientAccount(result.rows[0]), password });
});

// POST /api/gate-accounts/:id/reset-password -> a new password, shown once
gateAccountsRouter.post('/:id/reset-password', async (req: Request, res: Response) => {
  const row = await accountFor(req, res);
  if (!row) return;
  const password = randomPassword();
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashPassword(password), row.id]);
  return res.json({ success: true, password });
});

// PATCH /api/gate-accounts/:id { status?, expiresAt? }
gateAccountsRouter.patch('/:id', async (req: Request, res: Response) => {
  const row = await accountFor(req, res);
  if (!row) return;
  const { status, expiresAt } = req.body || {};
  const sets: string[] = [];
  const params: any[] = [];

  if (status !== undefined) {
    if (!['active', 'suspended'].includes(status)) return res.status(400).json({ success: false, error: 'Status must be active or suspended.' });
    params.push(status);
    sets.push(`status = $${params.length}`);
  }
  if (expiresAt !== undefined) {
    const at = new Date(String(expiresAt)).getTime();
    if (Number.isNaN(at) || at <= Date.now()) return res.status(400).json({ success: false, error: 'Set an expiry date and time in the future.' });
    if (at > Date.now() + MAX_VALID_DAYS * 86_400_000) return res.status(400).json({ success: false, error: `A gate account can be valid for at most ${MAX_VALID_DAYS} days.` });
    params.push(new Date(at).toISOString());
    sets.push(`expires_at = $${params.length}`);
  }
  if (!sets.length) return res.status(400).json({ success: false, error: 'Nothing to change.' });

  params.push(row.id);
  const result = await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
  forgetAccountCache(String(row.id)); // a suspension or new expiry applies to a tablet already signed in
  return res.json({ success: true, data: clientAccount(result.rows[0]) });
});

// DELETE /api/gate-accounts/:id
gateAccountsRouter.delete('/:id', async (req: Request, res: Response) => {
  const row = await accountFor(req, res);
  if (!row) return;
  await pool.query('DELETE FROM users WHERE id = $1', [row.id]);
  forgetAccountCache(String(row.id));
  return res.json({ success: true });
});
