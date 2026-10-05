import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';

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
        `INSERT INTO submissions (page_id, brand_id, submission_type, form_data, ip_address, user_agent)
         VALUES ($1, (SELECT id FROM brands WHERE slug = $2 LIMIT 1), $3, $4, $5, $6) RETURNING *`,
        [submission.page_id, submission.brand_slug, submission.submission_type, JSON.stringify(submission.form_data), submission.ip_address, submission.user_agent]
      );
      return res.status(201).json({ success: true, data: result.rows[0], message: 'Entry recorded successfully' });
    } catch (err: any) {
      console.error('Error inserting submission into DB:', err.message);
    }
  }

  inMemorySubmissions.unshift(submission);
  writeDataFile('submissions.json', inMemorySubmissions);
  return res.status(201).json({ success: true, data: submission, message: 'Entry recorded successfully' });
});

// GET /api/submissions - Query submissions
submissionsRouter.get('/', async (req: Request, res: Response) => {
  const { page_id } = req.query;

  if (getDbStatus().isConnected) {
    try {
      const query = page_id
        ? 'SELECT * FROM submissions WHERE page_id = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM submissions ORDER BY created_at DESC LIMIT 100';
      const params = page_id ? [page_id] : [];
      const result = await pool.query(query, params);
      return res.json({ success: true, data: result.rows });
    } catch (err: any) {
      console.error('Error querying submissions from DB:', err.message);
    }
  }

  inMemorySubmissions = readDataFile<any[]>('submissions.json', inMemorySubmissions);
  let filtered = [...inMemorySubmissions];
  if (page_id) {
    filtered = filtered.filter(s => s.page_id === page_id);
  }
  return res.json({ success: true, data: filtered });
});

// DELETE /api/submissions/:id - Remove submission
submissionsRouter.delete('/:id', async (req: Request, res: Response) => {
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
