import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';

export const submissionsRouter = Router();

let inMemorySubmissions: any[] = readDataFile<any[]>('submissions.json', []);

function generateTicketCode(brandSlug: string): string {
  const prefix = (brandSlug || '707').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 5) || '707';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const time = Date.now().toString(36).substring(4).toUpperCase();
  return `${prefix}-${rand}${time}`;
}

// POST /api/submissions - Submit raffle or RSVP entry
submissionsRouter.post('/', async (req: Request, res: Response) => {
  const { page_id, brand_slug, submission_type, form_data } = req.body;

  if (!form_data || !form_data.fullName || !form_data.email) {
    return res.status(400).json({ success: false, error: 'Full name and email are required.' });
  }

  const ticketCode = generateTicketCode(brand_slug);
  const now = new Date().toISOString();

  const submission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    page_id: page_id || 'test-page',
    brand_slug: brand_slug || 'atmos',
    submission_type: submission_type || 'raffle',
    form_data,
    ticket_code: ticketCode,
    ip_address: req.ip || '127.0.0.1',
    user_agent: req.get('user-agent') || '',
    status: submission_type === 'rsvp' ? 'confirmed' : 'registered',
    checked_in_at: null,
    checked_in_by: null,
    created_at: now
  };

  if (getDbStatus().isConnected) {
    try {
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
      console.error('Error inserting submission into DB:', err.message);
    }
  }

  inMemorySubmissions.unshift(submission);
  writeDataFile('submissions.json', inMemorySubmissions);
  return res.status(201).json({ success: true, data: submission, message: 'Entry recorded successfully' });
});

// GET /api/submissions - Query submissions (optionally by page_id and brand_slug)
submissionsRouter.get('/', async (req: Request, res: Response) => {
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
      console.error('Error querying submissions from DB:', err.message);
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

// POST /api/submissions/checkin - Validate and Check-in Guest via Ticket/QR Code
submissionsRouter.post('/checkin', async (req: Request, res: Response) => {
  const { ticket_code, page_id, checked_in_by } = req.body;
  const cleanCode = (ticket_code || '').trim().toUpperCase();

  if (!cleanCode) {
    return res.status(400).json({ success: false, error: 'Ticket or QR code is required.' });
  }

  const now = new Date().toISOString();
  const staff = checked_in_by || 'Staff Door Scanner';

  if (getDbStatus().isConnected) {
    try {
      let query = 'SELECT * FROM submissions WHERE (ticket_code = $1 OR id = $1)';
      const params: any[] = [cleanCode];
      if (page_id) {
        params.push(page_id);
        query += ` AND page_id = $${params.length}`;
      }
      const findRes = await pool.query(query, params);

      if (findRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Invalid or unrecognized ticket code.' });
      }

      const guest = findRes.rows[0];
      const parsedFormData = typeof guest.form_data === 'string' ? JSON.parse(guest.form_data) : guest.form_data;

      // Check if already checked in
      if (guest.status === 'checked_in') {
        return res.status(200).json({
          success: false,
          alreadyCheckedIn: true,
          data: { ...guest, form_data: parsedFormData },
          message: `Already checked in at ${new Date(guest.checked_in_at || now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        });
      }

      // Check if raffle and not winner
      if (guest.submission_type === 'raffle' && guest.status !== 'winner' && guest.status !== 'confirmed') {
        return res.status(200).json({
          success: false,
          notWinner: true,
          data: { ...guest, form_data: parsedFormData },
          message: 'Entry is registered but was not drawn as an approved winner for this drop.'
        });
      }

      const updateRes = await pool.query(
        `UPDATE submissions 
         SET status = 'checked_in', checked_in_at = $1, checked_in_by = $2 
         WHERE id = $3 
         RETURNING *`,
        [now, staff, guest.id]
      );

      const updated = updateRes.rows[0];
      return res.json({
        success: true,
        data: { ...updated, form_data: parsedFormData },
        message: `Welcome, ${parsedFormData.fullName || 'Guest'}! Checked in successfully.`
      });
    } catch (err: any) {
      console.error('[DB] Error during checkin:', err.message);
    }
  }

  // Fallback in-memory
  inMemorySubmissions = readDataFile<any[]>('submissions.json', inMemorySubmissions);
  const foundIdx = inMemorySubmissions.findIndex(s => 
    (s.ticket_code === cleanCode || s.id === cleanCode) && (!page_id || s.page_id === page_id)
  );

  if (foundIdx < 0) {
    return res.status(404).json({ success: false, error: 'Invalid or unrecognized ticket code.' });
  }

  const guest = inMemorySubmissions[foundIdx];
  if (guest.status === 'checked_in') {
    return res.status(200).json({
      success: false,
      alreadyCheckedIn: true,
      data: guest,
      message: `Already checked in at ${new Date(guest.checked_in_at || now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    });
  }

  guest.status = 'checked_in';
  guest.checked_in_at = now;
  guest.checked_in_by = staff;
  writeDataFile('submissions.json', inMemorySubmissions);

  return res.json({
    success: true,
    data: guest,
    message: `Welcome, ${guest.form_data?.fullName || 'Guest'}! Checked in successfully.`
  });
});

// PATCH /api/submissions/:id/status - Update attendee status (e.g. winner, confirmed, cancelled)
submissionsRouter.patch('/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, checked_in_by } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, error: 'Status is required.' });
  }

  const now = new Date().toISOString();

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `UPDATE submissions 
         SET status = $1, 
             checked_in_at = CASE WHEN $1 = 'checked_in' THEN COALESCE(checked_in_at, $2) ELSE checked_in_at END,
             checked_in_by = CASE WHEN $1 = 'checked_in' THEN COALESCE(checked_in_by, $3) ELSE checked_in_by END
         WHERE id = $4 RETURNING *`,
        [status, now, checked_in_by || 'Staff', id]
      );
      if (result.rows.length > 0) {
        const r = result.rows[0];
        return res.json({
          success: true,
          data: { ...r, form_data: typeof r.form_data === 'string' ? JSON.parse(r.form_data) : r.form_data }
        });
      }
    } catch (err: any) {
      console.error('[DB] Error updating submission status:', err.message);
    }
  }

  inMemorySubmissions = readDataFile<any[]>('submissions.json', inMemorySubmissions);
  const idx = inMemorySubmissions.findIndex(s => s.id === id);
  if (idx >= 0) {
    inMemorySubmissions[idx].status = status;
    if (status === 'checked_in' && !inMemorySubmissions[idx].checked_in_at) {
      inMemorySubmissions[idx].checked_in_at = now;
      inMemorySubmissions[idx].checked_in_by = checked_in_by || 'Staff';
    }
    writeDataFile('submissions.json', inMemorySubmissions);
    return res.json({ success: true, data: inMemorySubmissions[idx] });
  }

  return res.status(404).json({ success: false, error: 'Submission not found' });
});

// POST /api/submissions/draw-raffle - Pick random winners from registered attendees
submissionsRouter.post('/draw-raffle', async (req: Request, res: Response) => {
  const { page_id, count } = req.body;
  const winnerCount = Math.max(1, parseInt(count, 10) || 1);

  if (getDbStatus().isConnected) {
    try {
      const candidatesRes = await pool.query(
        `SELECT id FROM submissions 
         WHERE page_id = $1 AND status = 'registered' 
         ORDER BY RANDOM() 
         LIMIT $2`,
        [page_id, winnerCount]
      );

      const winnerIds = candidatesRes.rows.map(r => r.id);
      if (winnerIds.length > 0) {
        await pool.query(
          `UPDATE submissions SET status = 'winner' WHERE id = ANY($1::varchar[])`,
          [winnerIds]
        );
      }

      return res.json({ success: true, winnerIds, count: winnerIds.length });
    } catch (err: any) {
      console.error('[DB] Error drawing raffle:', err.message);
    }
  }

  inMemorySubmissions = readDataFile<any[]>('submissions.json', inMemorySubmissions);
  const eligible = inMemorySubmissions.filter(s => s.page_id === page_id && s.status === 'registered');
  // Shuffle
  const shuffled = [...eligible].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, winnerCount);
  const winnerIds = selected.map(s => {
    s.status = 'winner';
    return s.id;
  });
  writeDataFile('submissions.json', inMemorySubmissions);

  return res.json({ success: true, winnerIds, count: winnerIds.length });
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
