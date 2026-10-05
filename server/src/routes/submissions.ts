import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { requireAuth } from '../auth.js';

export const submissionsRouter = Router();

let inMemorySubmissions: any[] = readDataFile<any[]>('submissions.json', []);

// POST /api/submissions - Submit raffle or RSVP entry
submissionsRouter.post('/', async (req: Request, res: Response) => {
  const { page_id, brand_slug, submission_type, form_data } = req.body;

  if (!form_data || !form_data.fullName || !form_data.email) {
    return res.status(400).json({ success: false, error: 'Full name and email are required.' });
  }

  const submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    page_id: page_id || 'test-page',
    brand_slug: brand_slug || 'atmos',
    submission_type: submission_type || 'raffle',
    form_data,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.get('user-agent') || '',
    status: 'submitted',
    created_at: new Date().toISOString()
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO submissions (id, page_id, brand_slug, submission_type, form_data, ip_address, user_agent, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          submission.id,
          submission.page_id,
          submission.brand_slug,
          submission.submission_type,
          JSON.stringify(submission.form_data),
          submission.ip_address,
          submission.user_agent,
          submission.status,
          submission.created_at
        ]
      );
      const row = result.rows[0];
      return res.status(201).json({
        success: true,
        data: {
          ...row,
          form_data: typeof row.form_data === 'string' ? JSON.parse(row.form_data) : row.form_data
        },
        message: 'Entry recorded successfully'
      });
    } catch (err: any) {
      console.error('[DB] Error inserting submission into DB:', err.message);
    }
  }

  inMemorySubmissions.unshift(submission);
  writeDataFile('submissions.json', inMemorySubmissions);
  return res.status(201).json({ success: true, data: submission, message: 'Entry recorded successfully' });
});

// GET /api/submissions - Query submissions (optionally by page_id and brand_slug)
submissionsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { page_id, brand_slug } = req.query;

  if (getDbStatus().isConnected) {
    try {
      let query = 'SELECT * FROM submissions WHERE 1=1';
      const params: any[] = [];
      if (page_id) {
        params.push(page_id);
        query += ` AND page_id = $${params.length}`;
      }
      if (brand_slug) {
        params.push(brand_slug);
        query += ` AND brand_slug = $${params.length}`;
      }
      query += ' ORDER BY created_at DESC';

      const result = await pool.query(query, params);
      const rows = result.rows.map(r => ({
        ...r,
        form_data: typeof r.form_data === 'string' ? JSON.parse(r.form_data) : r.form_data
      }));
      return res.json({ success: true, data: rows });
    } catch (err: any) {
      console.error('[DB] Error querying submissions from DB:', err.message);
    }
  }

  inMemorySubmissions = readDataFile<any[]>('submissions.json', inMemorySubmissions);
  let filtered = [...inMemorySubmissions];
  if (page_id) {
    filtered = filtered.filter(s => s.page_id === page_id);
  }
  if (brand_slug) {
    filtered = filtered.filter(s => (s.brand_slug || '').toLowerCase() === (brand_slug as string).toLowerCase());
  }
  return res.json({ success: true, data: filtered });
});

// DELETE /api/submissions/:id - Remove submission
submissionsRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  inMemorySubmissions = inMemorySubmissions.filter(s => s.id !== id);
  writeDataFile('submissions.json', inMemorySubmissions);

  if (getDbStatus().isConnected) {
    try {
      await pool.query('DELETE FROM submissions WHERE id = $1', [id]);
    } catch (err: any) {
      console.error('[DB] Error deleting submission from DB:', err.message);
    }
  }

  return res.json({ success: true, message: 'Submission removed successfully' });
});
