import crypto from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import { pool, ensureDbReady, dbRequired } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { requireAuth, getClaims, optionalClaims } from '../auth.js';
import { accessiblePageIds, canViewPublicPage, findProjectForEntry } from '../access.js';
import { PLACEHOLDER_EMAIL, emailKeyOf, clientKeyOf, publicEntry, stripInternal, isTransientDbError } from '../submissionHelpers.js';

export const submissionsRouter = Router();

/**
 * Where entries live.
 *
 * With a database in use (production, or any deployment with a connection
 * string) the database is the only store: if it cannot be reached the request
 * is answered "try again" (503) — never written to a local file, which the
 * Campaign Hub and the door scanner do not read, so a guest would hold a pass
 * that the door does not know. The JSON file is only the storage of a
 * development machine that has no database at all.
 */
let inMemorySubmissions: any[] = readDataFile<any[]>('submissions.json', []);

/** Statuses a studio operator may assign. Check-in state lives in checked_in_at, not here. */
const ALLOWED_STATUSES = ['registered', 'submitted', 'confirmed', 'waitlisted', 'winner', 'declined'];

/** Guest answers are a handful of short fields; anything this big is not a form entry. */
const MAX_FORM_DATA_BYTES = 32 * 1024;

function refreshMemory() {
  inMemorySubmissions = readDataFile<any[]>('submissions.json', inMemorySubmissions);
}

function persistMemory() {
  writeDataFile('submissions.json', inMemorySubmissions);
}

/** A row as staff see it: parsed answers, without the database's own bookkeeping keys. */
function normalizeRow(row: any) {
  if (!row) return row;
  const clean: any = stripInternal(row);
  return {
    ...clean,
    form_data: typeof clean.form_data === 'string' ? JSON.parse(clean.form_data) : clean.form_data
  };
}

function unavailable(res: Response) {
  res.setHeader('Retry-After', '2');
  return res.status(503).json({
    success: false,
    retryable: true,
    error: 'The guest database is not reachable right now — please try again in a moment.'
  });
}

/** Answers a failed request: transient database trouble is "try again" (503), anything else a plain 500. */
function failure(res: Response, action: string, err: any) {
  console.error(`[Submissions] Could not ${action}:`, err?.message || err);
  if (res.headersSent) return;
  if (isTransientDbError(err)) return unavailable(res);
  return res.status(500).json({ success: false, error: `Could not ${action} — please try again.` });
}

/** Express 4 does not catch a rejected async handler; without this a database error would leave the request hanging. */
type Handler = (req: Request, res: Response) => Promise<unknown>;
const route = (action: string, fn: Handler) => (req: Request, res: Response, _next: NextFunction) => {
  fn(req, res).catch(err => failure(res, action, err));
};

/** 'db', 'file' (development without a database), or null after answering "try again". */
async function storeFor(res: Response): Promise<'db' | 'file' | null> {
  if (await ensureDbReady()) return 'db';
  if (dbRequired()) {
    unavailable(res);
    return null;
  }
  return 'file';
}

/**
 * Human-readable door code in the same shape the e-pass already prints:
 * DDMMYY-HHMM-XXXX. Four random characters leave about a million codes a
 * minute; the database refuses a repeat and the caller draws again.
 */
function generateTicketCode(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += alphabet[crypto.randomInt(alphabet.length)];
  return `${pad(now.getDate())}${pad(now.getMonth() + 1)}${String(now.getFullYear()).slice(-2)}-${pad(now.getHours())}${pad(now.getMinutes())}-${suffix}`;
}

function parsePageIds(req: Request): string[] {
  const raw = [req.query.page_ids, req.body?.page_ids].find(Boolean);
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(',');
  return list.map(s => String(s).trim()).filter(Boolean);
}

/**
 * The page ids a staff request may touch: what it asked for, narrowed to the
 * campaigns its account can access. null = no restriction (superadmin asking
 * for everything). An empty array means nothing is visible.
 */
async function scopedPageIds(req: Request, res: Response, strict: boolean): Promise<string[] | null> {
  const requested = parsePageIds(req);
  if (req.query.page_id) requested.push(String(req.query.page_id));
  const allowed = await accessiblePageIds(getClaims(res), { strict });
  if (!allowed) return requested.length ? requested : null;
  return requested.length ? requested.filter(id => allowed.has(id)) : [...allowed];
}

const inScope = (scope: string[] | null, pageId: string) => scope === null || scope.includes(pageId);

/** The existing entry for this visit's key or this email, if either has registered already. */
async function findExisting(pageId: string, clientKey: string | null, emailKey: string | null) {
  if (!clientKey && !emailKey) return null;
  const result = await pool.query(
    `SELECT * FROM submissions
      WHERE page_id = $1
        AND (($2::text IS NOT NULL AND client_key = $2::text) OR ($3::text IS NOT NULL AND email_key = $3::text))
      ORDER BY created_at ASC, id ASC
      LIMIT 1`,
    [pageId, clientKey, emailKey]
  );
  return result.rows[0] || null;
}

// POST /api/submissions - Submit raffle or RSVP entry (public)
submissionsRouter.post('/', route('record your entry', async (req, res) => {
  const { page_id, submission_type, form_data } = req.body || {};

  if (!form_data || typeof form_data !== 'object' || Array.isArray(form_data) || !String(form_data.fullName ?? '').trim() || !String(form_data.email ?? '').trim()) {
    return res.status(400).json({ success: false, error: 'Full name and email are required.' });
  }
  const fullName = String(form_data.fullName).trim();
  const email = String(form_data.email).trim();
  if (fullName.length > 200 || email.length > 254) {
    return res.status(400).json({ success: false, error: 'The name or email is too long.' });
  }
  if (Buffer.byteLength(JSON.stringify(form_data)) > MAX_FORM_DATA_BYTES) {
    return res.status(413).json({ success: false, error: 'This entry is too large.' });
  }

  const store = await storeFor(res);
  if (!store) return;

  // The campaign — and therefore the brand — comes from the server's own
  // record, never from the visitor. An entry for an unknown page would never
  // appear in any Campaign Hub, so refuse it instead of storing an orphan.
  const project = await findProjectForEntry(String(page_id || ''), store === 'db');
  // An unpublished campaign takes entries only from its owner or the
  // superadmin testing the funnel — the public cannot sign up to it yet.
  if (!project || !canViewPublicPage(optionalClaims(req), project)) {
    return res.status(404).json({ success: false, error: 'This campaign is not available.' });
  }

  const pageId = String(project.id);
  const emailKey = emailKeyOf(email);
  const clientKey = clientKeyOf(req.body?.client_key);
  const answers = { ...form_data, fullName, email };

  const draft = () => ({
    id: `sub-${Date.now()}-${crypto.randomBytes(5).toString('hex')}`,
    page_id: pageId,
    brand_slug: project.brand_slug || 'atmos',
    submission_type: submission_type || 'raffle',
    form_data: answers,
    ticket_code: generateTicketCode(),
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.get('user-agent') || '',
    status: 'registered',
    created_at: new Date().toISOString(),
    email_key: emailKey,
    client_key: clientKey
  });

  const alreadyRecorded = (row: any) =>
    res.status(200).json({ success: true, data: publicEntry(row), duplicate: true, message: 'Entry already recorded' });

  if (store === 'db') {
    // A retry, a double tap or a repeat registration: hand back the entry that exists.
    const existing = await findExisting(pageId, clientKey, emailKey);
    if (existing) return alreadyRecorded(existing);

    // The database itself refuses a second entry for the same visit/email and a repeated
    // Access ID, however many requests arrive at once (ON CONFLICT DO NOTHING, no error).
    for (let attempt = 0; attempt < 5; attempt++) {
      const entry = draft();
      const inserted = await pool.query(
        `INSERT INTO submissions
           (id, page_id, brand_slug, submission_type, form_data, ticket_code, ip_address, user_agent, status, created_at, email_key, client_key)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [entry.id, entry.page_id, entry.brand_slug, entry.submission_type, JSON.stringify(entry.form_data), entry.ticket_code,
          entry.ip_address, entry.user_agent, entry.status, entry.created_at, entry.email_key, entry.client_key]
      );
      if (inserted.rows[0]) {
        return res.status(201).json({ success: true, data: publicEntry(inserted.rows[0]), message: 'Entry recorded successfully' });
      }
      // Nothing inserted: either a simultaneous request for the same guest won (return its entry),
      // or the id / Access ID was taken (draw new ones and go again).
      const raced = await findExisting(pageId, clientKey, emailKey);
      if (raced) return alreadyRecorded(raced);
    }
    return unavailable(res);
  }

  // Development without a database.
  refreshMemory();
  const existing = inMemorySubmissions.find(
    s => s.page_id === pageId && ((clientKey && s.client_key === clientKey) || (emailKey && s.email_key === emailKey))
  );
  if (existing) return alreadyRecorded(existing);
  const entry = draft();
  inMemorySubmissions.unshift(entry);
  persistMemory();
  return res.status(201).json({ success: true, data: publicEntry(entry), message: 'Entry recorded successfully' });
}));

// GET /api/submissions - Query submissions (by page_id, page_ids=a,b,c and/or brand_slug)
submissionsRouter.get('/', requireAuth, route('load the guest list', async (req, res) => {
  const { brand_slug } = req.query;
  const store = await storeFor(res);
  if (!store) return;
  const scope = await scopedPageIds(req, res, store === 'db');
  if (scope && scope.length === 0) return res.json({ success: true, data: [] });

  if (store === 'db') {
    let query = 'SELECT * FROM submissions WHERE 1=1';
    const params: any[] = [];
    if (scope) {
      params.push(scope);
      query += ` AND page_id = ANY($${params.length})`;
    }
    if (brand_slug) {
      params.push(String(brand_slug).toLowerCase());
      query += ` AND LOWER(brand_slug) = $${params.length}`;
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return res.json({ success: true, data: result.rows.map(normalizeRow) });
  }

  refreshMemory();
  let filtered = inMemorySubmissions.filter(s => inScope(scope, s.page_id));
  if (brand_slug) {
    filtered = filtered.filter(s => (s.brand_slug || '').toLowerCase() === (brand_slug as string).toLowerCase());
  }
  return res.json({ success: true, data: filtered.map(normalizeRow) });
}));

// POST /api/submissions/bulk-status - Update status for many entries at once
submissionsRouter.post('/bulk-status', requireAuth, route('update these guests', async (req, res) => {
  const { ids, status } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status "${status}".` });
  }
  const store = await storeFor(res);
  if (!store) return;
  const scope = await scopedPageIds(req, res, store === 'db');

  if (store === 'db') {
    const result = scope
      ? await pool.query('UPDATE submissions SET status = $1 WHERE id = ANY($2) AND page_id = ANY($3) RETURNING *', [status, ids, scope])
      : await pool.query('UPDATE submissions SET status = $1 WHERE id = ANY($2) RETURNING *', [status, ids]);
    return res.json({ success: true, data: result.rows.map(normalizeRow), updated: result.rowCount });
  }

  refreshMemory();
  const updated: any[] = [];
  inMemorySubmissions = inMemorySubmissions.map(s => {
    if (!ids.includes(s.id) || !inScope(scope, s.page_id)) return s;
    const next = { ...s, status };
    updated.push(next);
    return next;
  });
  persistMemory();
  return res.json({ success: true, data: updated.map(normalizeRow), updated: updated.length });
}));

// POST /api/submissions/bulk-delete - Remove many entries at once
submissionsRouter.post('/bulk-delete', requireAuth, route('delete these guests', async (req, res) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' });
  }
  const store = await storeFor(res);
  if (!store) return;
  const scope = await scopedPageIds(req, res, store === 'db');

  if (store === 'db') {
    const result = scope
      ? await pool.query('DELETE FROM submissions WHERE id = ANY($1) AND page_id = ANY($2) RETURNING id', [ids, scope])
      : await pool.query('DELETE FROM submissions WHERE id = ANY($1) RETURNING id', [ids]);
    return res.json({ success: true, deleted: result.rowCount, ids: result.rows.map(r => r.id) });
  }

  refreshMemory();
  const removed: string[] = [];
  inMemorySubmissions = inMemorySubmissions.filter(s => {
    if (ids.includes(s.id) && inScope(scope, s.page_id)) {
      removed.push(s.id);
      return false;
    }
    return true;
  });
  persistMemory();
  return res.json({ success: true, deleted: removed.length, ids: removed });
}));

/**
 * POST /api/submissions/check-in - Door scanner endpoint.
 * Body: { code, page_ids?, mode?: 'in' | 'out', operator? }
 * The update is conditional on the current state so two door staff scanning the
 * same pass at once can't both admit it. If the guest database cannot be
 * reached the answer is an error, never "invalid pass": door staff must not
 * turn a valid guest away because of a connection problem.
 */
submissionsRouter.post('/check-in', requireAuth, route('check this pass', async (req, res) => {
  const code = String(req.body?.code || '').trim();
  const mode: 'in' | 'out' = req.body?.mode === 'out' ? 'out' : 'in';
  const operator = String(req.body?.operator || 'door').slice(0, 100);

  if (!code) {
    return res.status(400).json({ success: false, result: 'invalid', error: 'Scan or enter an Access ID.' });
  }
  const codeKey = code.toLowerCase();
  const store = await storeFor(res);
  if (!store) return;
  const scope = await scopedPageIds(req, res, store === 'db');
  if (scope && scope.length === 0) {
    return res.json({ success: false, result: 'invalid', error: 'No pass matches this Access ID.' });
  }

  // Typing a guest's email also finds them — but never by the shared placeholder.
  const emailLookup = codeKey !== PLACEHOLDER_EMAIL;
  const matches = (s: any) =>
    inScope(scope, s.page_id) &&
    (String(s.ticket_code || '').toLowerCase() === codeKey ||
      String(s.id).toLowerCase() === codeKey ||
      (emailLookup && String(s.form_data?.email || '').toLowerCase() === codeKey));

  if (store === 'db') {
    const params: any[] = [codeKey, emailLookup];
    let where = `(LOWER(ticket_code) = $1 OR LOWER(id) = $1 OR ($2::boolean AND LOWER(form_data->>'email') = $1))`;
    if (scope) {
      params.push(scope);
      where += ` AND page_id = ANY($${params.length})`;
    }
    // A pass code matches one entry; an email can match a flagged duplicate too — prefer the original.
    const found = await pool.query(
      `SELECT * FROM submissions WHERE ${where}
        ORDER BY (LOWER(ticket_code) = $1) DESC, (duplicate_of IS NULL) DESC, created_at ASC LIMIT 1`,
      params
    );
    const row = found.rows[0];
    if (!row) return res.json({ success: false, result: 'invalid', error: 'No pass matches this Access ID.' });

    if (mode === 'in') {
      const upd = await pool.query(
        `UPDATE submissions SET checked_in_at = NOW(), checked_in_by = $2 WHERE id = $1 AND checked_in_at IS NULL RETURNING *`,
        [row.id, operator]
      );
      if (!upd.rows[0]) return res.json({ success: false, result: 'already', data: normalizeRow(row) });
      return res.json({ success: true, result: 'admitted', data: normalizeRow(upd.rows[0]) });
    }
    const upd = await pool.query(
      `UPDATE submissions SET checked_in_at = NULL, checked_in_by = NULL WHERE id = $1 RETURNING *`,
      [row.id]
    );
    return res.json({ success: true, result: 'checked_out', data: normalizeRow(upd.rows[0]) });
  }

  refreshMemory();
  const idx = inMemorySubmissions.findIndex(matches);
  if (idx < 0) return res.json({ success: false, result: 'invalid', error: 'No pass matches this Access ID.' });
  const current = inMemorySubmissions[idx];

  if (mode === 'in') {
    if (current.checked_in_at) return res.json({ success: false, result: 'already', data: normalizeRow(current) });
    inMemorySubmissions[idx] = { ...current, checked_in_at: new Date().toISOString(), checked_in_by: operator };
    persistMemory();
    return res.json({ success: true, result: 'admitted', data: normalizeRow(inMemorySubmissions[idx]) });
  }
  inMemorySubmissions[idx] = { ...current, checked_in_at: null, checked_in_by: null };
  persistMemory();
  return res.json({ success: true, result: 'checked_out', data: normalizeRow(inMemorySubmissions[idx]) });
}));

// PATCH /api/submissions/:id - Update status and/or check-in state of one entry
submissionsRouter.patch('/:id', requireAuth, route('update this guest', async (req, res) => {
  const { id } = req.params;
  const { status, checked_in, operator } = req.body || {};

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status "${status}".` });
  }
  const store = await storeFor(res);
  if (!store) return;
  const scope = await scopedPageIds(req, res, store === 'db');

  if (store === 'db') {
    const sets: string[] = [];
    const params: any[] = [id];
    if (status !== undefined) {
      params.push(status);
      sets.push(`status = $${params.length}`);
    }
    if (checked_in === true) {
      params.push(String(operator || 'studio').slice(0, 100));
      sets.push(`checked_in_at = COALESCE(checked_in_at, NOW()), checked_in_by = $${params.length}`);
    } else if (checked_in === false) {
      sets.push('checked_in_at = NULL, checked_in_by = NULL');
    }
    if (sets.length === 0) return res.status(400).json({ success: false, error: 'Nothing to update.' });

    let where = 'id = $1';
    if (scope) {
      params.push(scope);
      where += ` AND page_id = ANY($${params.length})`;
    }
    const result = await pool.query(`UPDATE submissions SET ${sets.join(', ')} WHERE ${where} RETURNING *`, params);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Submission not found.' });
    return res.json({ success: true, data: normalizeRow(result.rows[0]) });
  }

  refreshMemory();
  const idx = inMemorySubmissions.findIndex(s => s.id === id && inScope(scope, s.page_id));
  if (idx < 0) return res.status(404).json({ success: false, error: 'Submission not found.' });
  const next = { ...inMemorySubmissions[idx] };
  if (status !== undefined) next.status = status;
  if (checked_in === true) {
    next.checked_in_at = next.checked_in_at || new Date().toISOString();
    next.checked_in_by = String(operator || 'studio').slice(0, 100);
  } else if (checked_in === false) {
    next.checked_in_at = null;
    next.checked_in_by = null;
  }
  inMemorySubmissions[idx] = next;
  persistMemory();
  return res.json({ success: true, data: normalizeRow(next) });
}));

// DELETE /api/submissions/:id - Remove submission
submissionsRouter.delete('/:id', requireAuth, route('remove this guest', async (req, res) => {
  const { id } = req.params;
  const store = await storeFor(res);
  if (!store) return;
  const scope = await scopedPageIds(req, res, store === 'db');

  if (store === 'db') {
    const result = scope
      ? await pool.query('DELETE FROM submissions WHERE id = $1 AND page_id = ANY($2)', [id, scope])
      : await pool.query('DELETE FROM submissions WHERE id = $1', [id]);
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Submission not found.' });
    return res.json({ success: true, message: 'Submission removed successfully' });
  }

  refreshMemory();
  const before = inMemorySubmissions.length;
  inMemorySubmissions = inMemorySubmissions.filter(s => !(s.id === id && inScope(scope, s.page_id)));
  if (inMemorySubmissions.length === before) return res.status(404).json({ success: false, error: 'Submission not found.' });
  persistMemory();
  return res.json({ success: true, message: 'Submission removed successfully' });
}));
