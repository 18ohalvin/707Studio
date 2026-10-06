import crypto from 'crypto';
import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { requireAuth, getClaims } from '../auth.js';
import { accessiblePageIds, findProjectForPageId } from '../access.js';

export const submissionsRouter = Router();

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

function normalizeRow(row: any) {
  if (!row) return row;
  return {
    ...row,
    form_data: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data
  };
}

/**
 * When the database is up it is the only store anything reads, so a failed
 * query must surface as an error. Falling back to the JSON file here is what
 * let a write "succeed" into a file the Campaign Hub never reads.
 */
function dbFailure(res: Response, action: string, err: any) {
  console.error(`[DB] Error ${action}:`, err?.message);
  return res.status(500).json({ success: false, error: `Could not ${action} — please try again.` });
}

/** Human-readable door code in the same shape the e-pass already prints: DDMMYY-HHMM-XXXX */
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
async function scopedPageIds(req: Request, res: Response): Promise<string[] | null> {
  const requested = parsePageIds(req);
  if (req.query.page_id) requested.push(String(req.query.page_id));
  const allowed = await accessiblePageIds(getClaims(res));
  if (!allowed) return requested.length ? requested : null;
  return requested.length ? requested.filter(id => allowed.has(id)) : [...allowed];
}

const inScope = (scope: string[] | null, pageId: string) => scope === null || scope.includes(pageId);

// POST /api/submissions - Submit raffle or RSVP entry (public)
submissionsRouter.post('/', async (req: Request, res: Response) => {
  const { page_id, submission_type, form_data } = req.body || {};

  if (!form_data || typeof form_data !== 'object' || !String(form_data.fullName || '').trim() || !String(form_data.email || '').trim()) {
    return res.status(400).json({ success: false, error: 'Full name and email are required.' });
  }
  if (Buffer.byteLength(JSON.stringify(form_data)) > MAX_FORM_DATA_BYTES) {
    return res.status(413).json({ success: false, error: 'This entry is too large.' });
  }

  // The campaign — and therefore the brand — comes from the server's own
  // record, never from the visitor. An entry for an unknown page would never
  // appear in any Campaign Hub, so refuse it instead of storing an orphan.
  const project = await findProjectForPageId(String(page_id || ''));
  if (!project) {
    return res.status(404).json({ success: false, error: 'This campaign is not available.' });
  }

  const submission = {
    id: `sub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    page_id: String(project.id),
    brand_slug: project.brand_slug || 'atmos',
    submission_type: submission_type || 'raffle',
    form_data,
    ticket_code: generateTicketCode(),
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.get('user-agent') || '',
    status: 'registered',
    created_at: new Date().toISOString()
  };
  const emailKey = String(form_data.email).trim().toLowerCase();
  const isPlaceholderEmail = emailKey === 'guest@activation.internal';

  if (getDbStatus().isConnected) {
    try {
      // Idempotent per (campaign, email) so a guest who re-taps the CTA keeps one entry and one pass.
      if (!isPlaceholderEmail) {
        const existing = await pool.query(
          `SELECT * FROM submissions WHERE page_id = $1 AND LOWER(form_data->>'email') = $2 LIMIT 1`,
          [submission.page_id, emailKey]
        );
        if (existing.rows[0]) {
          return res.status(200).json({ success: true, data: normalizeRow(existing.rows[0]), duplicate: true, message: 'Entry already recorded' });
        }
      }

      const result = await pool.query(
        `INSERT INTO submissions (id, page_id, brand_slug, submission_type, form_data, ticket_code, ip_address, user_agent, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          submission.id,
          submission.page_id,
          submission.brand_slug,
          submission.submission_type,
          JSON.stringify(submission.form_data),
          submission.ticket_code,
          submission.ip_address,
          submission.user_agent,
          submission.status,
          submission.created_at
        ]
      );
      return res.status(201).json({ success: true, data: normalizeRow(result.rows[0]), message: 'Entry recorded successfully' });
    } catch (err: any) {
      return dbFailure(res, 'record your entry', err);
    }
  }

  refreshMemory();
  if (!isPlaceholderEmail) {
    const existing = inMemorySubmissions.find(
      s => s.page_id === submission.page_id && String(s.form_data?.email || '').trim().toLowerCase() === emailKey
    );
    if (existing) {
      return res.status(200).json({ success: true, data: existing, duplicate: true, message: 'Entry already recorded' });
    }
  }
  inMemorySubmissions.unshift(submission);
  persistMemory();
  return res.status(201).json({ success: true, data: submission, message: 'Entry recorded successfully' });
});

// GET /api/submissions - Query submissions (by page_id, page_ids=a,b,c and/or brand_slug)
submissionsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { brand_slug } = req.query;
  const scope = await scopedPageIds(req, res);
  if (scope && scope.length === 0) return res.json({ success: true, data: [] });

  if (getDbStatus().isConnected) {
    try {
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
    } catch (err: any) {
      return dbFailure(res, 'load the guest list', err);
    }
  }

  refreshMemory();
  let filtered = inMemorySubmissions.filter(s => inScope(scope, s.page_id));
  if (brand_slug) {
    filtered = filtered.filter(s => (s.brand_slug || '').toLowerCase() === (brand_slug as string).toLowerCase());
  }
  return res.json({ success: true, data: filtered });
});

// POST /api/submissions/bulk-status - Update status for many entries at once
submissionsRouter.post('/bulk-status', requireAuth, async (req: Request, res: Response) => {
  const { ids, status } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status "${status}".` });
  }
  const scope = await scopedPageIds(req, res);

  if (getDbStatus().isConnected) {
    try {
      const result = scope
        ? await pool.query('UPDATE submissions SET status = $1 WHERE id = ANY($2) AND page_id = ANY($3) RETURNING *', [status, ids, scope])
        : await pool.query('UPDATE submissions SET status = $1 WHERE id = ANY($2) RETURNING *', [status, ids]);
      return res.json({ success: true, data: result.rows.map(normalizeRow), updated: result.rowCount });
    } catch (err: any) {
      return dbFailure(res, 'update these guests', err);
    }
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
  return res.json({ success: true, data: updated, updated: updated.length });
});

// POST /api/submissions/bulk-delete - Remove many entries at once
submissionsRouter.post('/bulk-delete', requireAuth, async (req: Request, res: Response) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'ids must be a non-empty array.' });
  }
  const scope = await scopedPageIds(req, res);

  if (getDbStatus().isConnected) {
    try {
      const result = scope
        ? await pool.query('DELETE FROM submissions WHERE id = ANY($1) AND page_id = ANY($2) RETURNING id', [ids, scope])
        : await pool.query('DELETE FROM submissions WHERE id = ANY($1) RETURNING id', [ids]);
      return res.json({ success: true, deleted: result.rowCount, ids: result.rows.map(r => r.id) });
    } catch (err: any) {
      return dbFailure(res, 'delete these guests', err);
    }
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
});

/**
 * POST /api/submissions/check-in - Door scanner endpoint.
 * Body: { code, page_ids?, mode?: 'in' | 'out', operator? }
 * The update is conditional on the current state so two door staff scanning the
 * same pass at once can't both admit it.
 */
submissionsRouter.post('/check-in', requireAuth, async (req: Request, res: Response) => {
  const code = String(req.body?.code || '').trim();
  const mode: 'in' | 'out' = req.body?.mode === 'out' ? 'out' : 'in';
  const operator = String(req.body?.operator || 'door').slice(0, 100);

  if (!code) {
    return res.status(400).json({ success: false, result: 'invalid', error: 'Scan or enter an Access ID.' });
  }
  const codeKey = code.toLowerCase();
  const scope = await scopedPageIds(req, res);
  if (scope && scope.length === 0) {
    return res.json({ success: false, result: 'invalid', error: 'No pass matches this Access ID.' });
  }

  const matches = (s: any) =>
    inScope(scope, s.page_id) &&
    (String(s.ticket_code || '').toLowerCase() === codeKey ||
      String(s.id).toLowerCase() === codeKey ||
      String(s.form_data?.email || '').toLowerCase() === codeKey);

  if (getDbStatus().isConnected) {
    try {
      const params: any[] = [codeKey];
      let where = `(LOWER(ticket_code) = $1 OR LOWER(id) = $1 OR LOWER(form_data->>'email') = $1)`;
      if (scope) {
        params.push(scope);
        where += ` AND page_id = ANY($${params.length})`;
      }
      const found = await pool.query(`SELECT * FROM submissions WHERE ${where} LIMIT 1`, params);
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
    } catch (err: any) {
      return dbFailure(res, 'check this pass', err);
    }
  }

  refreshMemory();
  const idx = inMemorySubmissions.findIndex(matches);
  if (idx < 0) return res.json({ success: false, result: 'invalid', error: 'No pass matches this Access ID.' });
  const current = inMemorySubmissions[idx];

  if (mode === 'in') {
    if (current.checked_in_at) return res.json({ success: false, result: 'already', data: current });
    inMemorySubmissions[idx] = { ...current, checked_in_at: new Date().toISOString(), checked_in_by: operator };
    persistMemory();
    return res.json({ success: true, result: 'admitted', data: inMemorySubmissions[idx] });
  }
  inMemorySubmissions[idx] = { ...current, checked_in_at: null, checked_in_by: null };
  persistMemory();
  return res.json({ success: true, result: 'checked_out', data: inMemorySubmissions[idx] });
});

// PATCH /api/submissions/:id - Update status and/or check-in state of one entry
submissionsRouter.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, checked_in, operator } = req.body || {};

  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status "${status}".` });
  }
  const scope = await scopedPageIds(req, res);

  if (getDbStatus().isConnected) {
    try {
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
    } catch (err: any) {
      return dbFailure(res, 'update this guest', err);
    }
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
  return res.json({ success: true, data: next });
});

// DELETE /api/submissions/:id - Remove submission
submissionsRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const scope = await scopedPageIds(req, res);

  if (getDbStatus().isConnected) {
    try {
      const result = scope
        ? await pool.query('DELETE FROM submissions WHERE id = $1 AND page_id = ANY($2)', [id, scope])
        : await pool.query('DELETE FROM submissions WHERE id = $1', [id]);
      if (!result.rowCount) return res.status(404).json({ success: false, error: 'Submission not found.' });
      return res.json({ success: true, message: 'Submission removed successfully' });
    } catch (err: any) {
      return dbFailure(res, 'remove this guest', err);
    }
  }

  refreshMemory();
  const before = inMemorySubmissions.length;
  inMemorySubmissions = inMemorySubmissions.filter(s => !(s.id === id && inScope(scope, s.page_id)));
  if (inMemorySubmissions.length === before) return res.status(404).json({ success: false, error: 'Submission not found.' });
  persistMemory();
  return res.json({ success: true, message: 'Submission removed successfully' });
});
