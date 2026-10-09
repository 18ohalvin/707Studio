import crypto from 'crypto';
import express, { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { requireAuth, getClaims, optionalClaims } from '../auth.js';
import { accessiblePageIds, canViewPublicPage, findProjectForEntry } from '../access.js';
import { PLACEHOLDER_EMAIL, emailKeyOf, clientKeyOf, publicEntry, stripInternal } from '../submissionHelpers.js';
import { sendPassEmail, sendWaitlistEmail, sendPromotedEmail } from '../mailer.js';
import { route, storeFor, unavailable } from '../routeSupport.js';
import { slotKey, normalizePicks, decidePlaces, type SlotDef, type SlotPick } from '../slotHelpers.js';
import { getSlotDefs, getAvailability, touchAvailability } from '../slots.js';
import { withClient } from '../dbClient.js';

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
/** Statuses that mean the guest now holds a place. */
const HAS_PLACE = ['registered', 'confirmed', 'winner'];

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

type InsertOutcome =
  | { kind: 'inserted'; row: any }
  | { kind: 'conflict' }
  | { kind: 'full'; full: SlotDef[] };

/**
 * Stores an entry together with the places it takes, in one transaction.
 *
 * Places are counted and the entry written while holding a lock per limited
 * option, so however many guests reach for the last place at once, exactly as
 * many get it as there are places — nobody ends up one over the limit. Locks
 * are taken in a fixed order, so two guests picking the same two options can
 * never wait on each other. The entry's own uniqueness (email, visit key,
 * Access ID) is enforced by ON CONFLICT DO NOTHING as before.
 */
async function insertWithPlaces(entry: any, chosen: SlotDef[], wantsWaitlist: boolean): Promise<InsertOutcome> {
  const limited = chosen.filter(d => d.capacity !== null).sort((a, b) => slotKey(a.widget, a.option).localeCompare(slotKey(b.widget, b.option)));
  return withClient(pool, async (client) => {
  try {
    await client.query('BEGIN');
    let status: string = entry.status;

    if (limited.length) {
      for (const d of limited) {
        await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`places:${entry.page_id}:${slotKey(d.widget, d.option)}`]);
      }
      const taken = new Map<string, number>();
      for (const d of limited) {
        const r = await client.query(
          `SELECT COUNT(*)::int AS taken
             FROM submission_slots ss JOIN submissions s ON s.id = ss.submission_id
            WHERE ss.page_id = $1 AND ss.widget_id = $2 AND ss.option_id = $3 AND s.status NOT IN ('waitlisted', 'declined')`,
          [entry.page_id, d.widget, d.option]
        );
        taken.set(slotKey(d.widget, d.option), r.rows[0].taken);
      }
      const decision = decidePlaces(limited, d => taken.get(slotKey(d.widget, d.option)) ?? 0, wantsWaitlist);
      if (!decision.ok) {
        await client.query('ROLLBACK');
        return { kind: 'full', full: decision.full };
      }
      if (decision.waitlisted) status = 'waitlisted';
    }

    const inserted = await client.query(
      `INSERT INTO submissions
         (id, page_id, brand_slug, submission_type, form_data, ticket_code, ip_address, user_agent, status, created_at, email_key, client_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [entry.id, entry.page_id, entry.brand_slug, entry.submission_type, JSON.stringify(entry.form_data), entry.ticket_code,
        entry.ip_address, entry.user_agent, status, entry.created_at, entry.email_key, entry.client_key]
    );
    if (!inserted.rows[0]) {
      await client.query('ROLLBACK');
      return { kind: 'conflict' };
    }
    if (chosen.length) {
      await client.query(
        `INSERT INTO submission_slots (submission_id, page_id, widget_id, option_id)
         SELECT $1, $2, w, o FROM unnest($3::text[], $4::text[]) AS t(w, o)
         ON CONFLICT DO NOTHING`,
        [entry.id, entry.page_id, chosen.map(d => d.widget), chosen.map(d => d.option)]
      );
    }
    await client.query('COMMIT');
    return { kind: 'inserted', row: inserted.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  }
  });
}

/** Places taken per option in development mode (no database): from the entries held in memory. */
function fileTakenCounts(pageId: string): Map<string, number> {
  refreshMemory();
  const taken = new Map<string, number>();
  for (const s of inMemorySubmissions) {
    if (s.page_id !== pageId || ['waitlisted', 'declined'].includes(s.status)) continue;
    for (const pick of Array.isArray(s.slot_picks) ? s.slot_picks : []) {
      const key = slotKey(pick.widget, pick.option);
      taken.set(key, (taken.get(key) || 0) + 1);
    }
  }
  return taken;
}

/** Why a registration could not take its places, in the shape the guest's page acts on. */
async function placesRefusal(res: Response, pageId: string, useDb: boolean, full: SlotDef[], fileTaken?: Map<string, number>) {
  return res.status(409).json({
    success: false,
    code: 'slots_full',
    error: 'One of the places you chose has just been reserved.',
    full: full.map(d => ({ widget: d.widget, option: d.option, label: d.label, waitlist: d.waitlist })),
    availability: await getAvailability(pageId, useDb, { fresh: true, fileTaken })
  });
}

/**
 * Emails the guest about their entry. Fire-and-forget on purpose: the entry is
 * already stored, so a mail problem must never fail a registration or hold up
 * the response the guest is waiting on.
 *
 * The ticket email carries the guest's e-ticket PDF — the file their own
 * browser makes right after they register. A guest with a place therefore
 * waits briefly for that file (see awaitingTicket); one who is waitlisted is
 * told so at once, and the PDF, already stored by then, goes out when they
 * come off the waitlist.
 */
async function notifyGuest(row: any, kind: 'new' | 'promoted', ticketPdf?: Buffer | null) {
  try {
    const form = typeof row?.form_data === 'string' ? JSON.parse(row.form_data) : (row?.form_data || {});
    const email = String(form.email || '').trim();
    if (!email || email === PLACEHOLDER_EMAIL) return;

    let campaign = '';
    try {
      if (getDbStatus().isConnected && row.page_id) {
        const r = await pool.query('SELECT title FROM pages WHERE id = $1', [row.page_id]);
        campaign = r.rows[0]?.title || '';
      }
    } catch { /* the title is a nicety, not a reason to skip the mail */ }

    let pdf = ticketPdf ?? null;
    if (!pdf && kind === 'promoted') pdf = await storedTicket(String(row.id));

    const guest = {
      email,
      fullName: String(form.fullName || '').trim(),
      ticketCode: row.ticket_code || '',
      campaign,
      ticketPdf: pdf
    };

    if (kind === 'promoted') await sendPromotedEmail(guest).then(r => markTicketEmailed(row.id, r));
    else if (row.status === 'waitlisted') await sendWaitlistEmail(guest);
    else await sendPassEmail(guest).then(r => markTicketEmailed(row.id, r));
  } catch (err: any) {
    console.warn('[Submissions] Could not notify guest:', err?.message || err);
  }
}

/** Remembers that a ticket email went out, so a bulk send skips this guest. */
async function markTicketEmailed(id: string, result: { success?: boolean }) {
  if (!result?.success) return;
  try {
    await pool.query('UPDATE submissions SET ticket_emailed_at = NOW() WHERE id = $1', [id]);
  } catch (err: any) {
    console.warn('[Submissions] Could not record the ticket email:', err?.message || err);
  }
}

/** How long a new registration waits for its ticket PDF before the email goes out without it. */
const TICKET_WAIT_MS = 30_000;
/** Registrations holding a place whose email is waiting for the PDF, by entry id. */
const awaitingTicket = new Map<string, { row: any; timer: NodeJS.Timeout }>();

/** Entry point for a fresh registration: waitlist notice now, ticket email once the PDF is in (or after the wait). */
function notifyNewEntry(row: any) {
  if (row.status === 'waitlisted' || !getDbStatus().isConnected) {
    void notifyGuest(row, 'new');
    return;
  }
  const id = String(row.id);
  const timer = setTimeout(() => {
    awaitingTicket.delete(id);
    void sendIfStillDue(id, null);
  }, TICKET_WAIT_MS);
  awaitingTicket.set(id, { row, timer });
}

/**
 * The guest's ticket email, sent when its wait is over — unless things changed meanwhile:
 * staff may have emailed the ticket themselves, moved the guest to the waitlist, or removed them.
 */
async function sendIfStillDue(id: string, pdf: Buffer | null) {
  try {
    const r = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
    const row = r.rows[0];
    if (!row || row.ticket_emailed_at || !HAS_PLACE.includes(String(row.status))) return;
    await notifyGuest(row, 'new', pdf);
  } catch (err: any) {
    console.warn('[Submissions] Could not send the ticket email:', err?.message || err);
  }
}

async function storedTicket(id: string): Promise<Buffer | null> {
  try {
    const r = await pool.query('SELECT pdf FROM submission_tickets WHERE submission_id = $1', [id]);
    return r.rows[0]?.pdf || null;
  } catch {
    return null;
  }
}

const MAX_TICKET_PDF_BYTES = 3 * 1024 * 1024;

/**
 * PUT /api/submissions/:id/ticket-pdf - the guest's browser hands in the e-ticket it just made.
 * Only the browser that registered may do it (it alone holds the visit key), only
 * once, and only a real PDF of reasonable size is kept. If the guest's email is
 * waiting for it, the email goes out now with the file attached.
 */
submissionsRouter.put('/:id/ticket-pdf', express.raw({ type: 'application/pdf', limit: MAX_TICKET_PDF_BYTES }), route('store your ticket', async (req, res) => {
  const { id } = req.params;
  const key = clientKeyOf(req.get('x-entry-key'));
  const pdf: Buffer | undefined = Buffer.isBuffer(req.body) ? req.body : undefined;

  if (!pdf || pdf.length < 100 || pdf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return res.status(400).json({ success: false, error: 'That is not a PDF.' });
  }
  const store = await storeFor(res);
  if (!store) return;
  if (store !== 'db') return res.status(204).end(); // development without a database keeps no tickets

  const found = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
  const row = found.rows[0];
  if (!row || !key || row.client_key !== key) {
    return res.status(403).json({ success: false, error: 'This ticket does not belong to you.' });
  }

  const saved = await pool.query(
    'INSERT INTO submission_tickets (submission_id, pdf) VALUES ($1, $2) ON CONFLICT (submission_id) DO NOTHING',
    [id, pdf]
  );
  const waiting = awaitingTicket.get(String(id));
  if (saved.rowCount && waiting) {
    clearTimeout(waiting.timer);
    awaitingTicket.delete(String(id));
    void sendIfStillDue(String(id), pdf);
  }
  return res.status(204).end();
}));


/**
 * PUT /api/submissions/:id/send-ticket - staff re-send a guest's e-ticket.
 * The body is the PDF the staff's browser just made from the guest's own entry
 * (same design, details and QR as the one on their screen at registration).
 * Only guests who hold a place, only within this account's campaigns, and
 * never twice: someone who already got a ticket email is skipped.
 * With ?store_only=1 the PDF is only kept (any status), and nothing is sent.
 * With ?force=1 a guest who already got the email gets it again.
 */
submissionsRouter.put('/:id/send-ticket', requireAuth, express.raw({ type: 'application/pdf', limit: MAX_TICKET_PDF_BYTES }), route('send this ticket', async (req, res) => {
  const id = String(req.params.id);
  const pdf: Buffer | undefined = Buffer.isBuffer(req.body) ? req.body : undefined;
  if (!pdf || pdf.length < 100 || pdf.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return res.status(400).json({ success: false, error: 'That is not a PDF.' });
  }
  const store = await storeFor(res);
  if (!store) return;
  if (store !== 'db') return res.status(409).json({ success: false, error: 'Sending tickets needs the database.' });

  const scope = await scopedPageIds(req, res, true);
  const found = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
  const row = found.rows[0];
  if (!row || !inScope(scope, row.page_id)) return res.status(404).json({ success: false, error: 'Submission not found.' });

  // store_only: keep the ticket for later, send nothing. Used before guests are taken off the
  // waitlist, so the email that goes out when they are promoted already has their PDF.
  if (req.query.store_only === '1') {
    await pool.query(
      `INSERT INTO submission_tickets (submission_id, pdf) VALUES ($1, $2)
       ON CONFLICT (submission_id) DO UPDATE SET pdf = EXCLUDED.pdf, created_at = NOW()`,
      [id, pdf]
    );
    return res.json({ success: true, result: 'stored' });
  }

  if (!HAS_PLACE.includes(String(row.status))) return res.json({ success: true, result: 'no_place' });
  // force: staff asked to send it again (the guest lost it or never saw it).
  if (row.ticket_emailed_at && req.query.force !== '1') return res.json({ success: true, result: 'already_sent' });

  const form = typeof row.form_data === 'string' ? JSON.parse(row.form_data) : (row.form_data || {});
  const email = String(form.email || '').trim();
  if (!email || email === PLACEHOLDER_EMAIL) return res.json({ success: true, result: 'no_email' });

  await pool.query(
    `INSERT INTO submission_tickets (submission_id, pdf) VALUES ($1, $2)
     ON CONFLICT (submission_id) DO UPDATE SET pdf = EXCLUDED.pdf, created_at = NOW()`,
    [id, pdf]
  );

  let campaign = '';
  try {
    const r = await pool.query('SELECT title FROM pages WHERE id = $1', [row.page_id]);
    campaign = r.rows[0]?.title || '';
  } catch { /* the title is a nicety */ }

  const outcome: any = await sendPassEmail({
    email,
    fullName: String(form.fullName || '').trim(),
    ticketCode: row.ticket_code || '',
    campaign,
    ticketPdf: pdf,
    resend: true
  });
  if (outcome.skipped) return res.json({ success: true, result: 'mail_off' });
  if (!outcome.success) return res.json({ success: true, result: 'failed', error: outcome.error || 'The mail server refused it.' });
  await markTicketEmailed(id, outcome);
  return res.json({ success: true, result: 'sent' });
}));

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
  const picks: SlotPick[] = normalizePicks(req.body?.slot_picks);
  const wantsWaitlist = req.body?.waitlist === true;

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

    // Which of the guest's picks are options of this campaign, and which of those are limited or closed.
    const defs = picks.length ? await getSlotDefs(pageId, true) : new Map<string, SlotDef>();
    const chosen = picks.map(p => defs.get(slotKey(p.widget, p.option))).filter((d): d is SlotDef => !!d);
    const closed = chosen.filter(d => d.closed);
    if (closed.length) {
      return res.status(409).json({
        success: false, code: 'option_closed', error: 'This option is no longer open for registration.',
        full: closed.map(d => ({ widget: d.widget, option: d.option, label: d.label, waitlist: false })),
        availability: await getAvailability(pageId, true, { fresh: true })
      });
    }

    // The database itself refuses a second entry for the same visit/email and a repeated
    // Access ID, however many requests arrive at once (ON CONFLICT DO NOTHING, no error).
    for (let attempt = 0; attempt < 5; attempt++) {
      const outcome = await insertWithPlaces(draft(), chosen, wantsWaitlist);
      if (outcome.kind === 'inserted') {
        touchAvailability(pageId);
        notifyNewEntry(outcome.row);
        return res.status(201).json({ success: true, data: publicEntry(outcome.row), message: 'Entry recorded successfully' });
      }
      if (outcome.kind === 'full') return placesRefusal(res, pageId, true, outcome.full);
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

  const fileDefs = picks.length ? await getSlotDefs(pageId, false) : new Map<string, SlotDef>();
  const fileChosen = picks.map(p => fileDefs.get(slotKey(p.widget, p.option))).filter((d): d is SlotDef => !!d);
  if (fileChosen.some(d => d.closed)) {
    return res.status(409).json({ success: false, code: 'option_closed', error: 'This option is no longer open for registration.', full: fileChosen.filter(d => d.closed).map(d => ({ widget: d.widget, option: d.option, label: d.label, waitlist: false })) });
  }
  const fileTaken = fileTakenCounts(pageId);
  const decision = decidePlaces(fileChosen.filter(d => d.capacity !== null), d => fileTaken.get(slotKey(d.widget, d.option)) ?? 0, wantsWaitlist);
  if (!decision.ok) return placesRefusal(res, pageId, false, decision.full, fileTaken);

  const entry = { ...draft(), status: decision.waitlisted ? 'waitlisted' : 'registered', slot_picks: fileChosen.map(d => ({ widget: d.widget, option: d.option })) };
  inMemorySubmissions.unshift(entry);
  persistMemory();
  void notifyGuest(entry, 'new');
  return res.status(201).json({ success: true, data: publicEntry(entry), message: 'Entry recorded successfully' });
}));

// GET /api/submissions/availability/:pageId - Live places left, polled by the guests' pages (public, like registering)
submissionsRouter.get('/availability/:pageId', route('load availability', async (req, res) => {
  const store = await storeFor(res);
  if (!store) return;
  const project = await findProjectForEntry(String(req.params.pageId || ''), store === 'db');
  if (!project || !canViewPublicPage(optionalClaims(req), project)) {
    return res.status(404).json({ success: false, error: 'This campaign is not available.' });
  }
  const pageId = String(project.id);
  const availability = await getAvailability(pageId, store === 'db', store === 'file' ? { fileTaken: fileTakenCounts(pageId) } : {});
  res.setHeader('Cache-Control', 'no-store');
  return res.json({ success: true, data: availability, generated_at: new Date().toISOString() });
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
    // Who was waiting before this change, so we can tell the ones who just got
    // a place. Read first: the update overwrites the old status.
    const before = await pool.query('SELECT id, status FROM submissions WHERE id = ANY($1)', [ids]);
    const wasWaiting = new Set(
      before.rows.filter((r: any) => r.status === 'waitlisted').map((r: any) => String(r.id))
    );

    const result = scope
      ? await pool.query('UPDATE submissions SET status = $1 WHERE id = ANY($2) AND page_id = ANY($3) RETURNING *', [status, ids, scope])
      : await pool.query('UPDATE submissions SET status = $1 WHERE id = ANY($2) RETURNING *', [status, ids]);
    // A guest declined or reinstated changes how many places are left: show it on the next look.
    new Set(result.rows.map((r: any) => String(r.page_id))).forEach(touchAvailability);

    if (HAS_PLACE.includes(status)) {
      for (const row of result.rows) {
        if (wasWaiting.has(String(row.id))) void notifyGuest(row, 'promoted');
      }
    }

    return res.json({ success: true, data: result.rows.map(normalizeRow), updated: result.rowCount });
  }

  refreshMemory();
  const updated: any[] = [];
  inMemorySubmissions = inMemorySubmissions.map(s => {
    if (!ids.includes(s.id) || !inScope(scope, s.page_id)) return s;
    const wasWaiting = s.status === 'waitlisted';
    const next = { ...s, status };
    updated.push(next);
    if (wasWaiting && HAS_PLACE.includes(status)) void notifyGuest(next, 'promoted');
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
      ? await pool.query('DELETE FROM submissions WHERE id = ANY($1) AND page_id = ANY($2) RETURNING id, page_id', [ids, scope])
      : await pool.query('DELETE FROM submissions WHERE id = ANY($1) RETURNING id, page_id', [ids]);
    new Set(result.rows.map((r: any) => String(r.page_id))).forEach(touchAvailability);
    await pool.query('DELETE FROM submission_tickets WHERE submission_id = ANY($1)', [result.rows.map((r: any) => r.id)]);
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

    if (mode === 'in' && (row.status === 'waitlisted' || row.status === 'declined')) {
      return res.json({ success: false, result: row.status, data: normalizeRow(row) });
    }
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

  if (mode === 'in' && (current.status === 'waitlisted' || current.status === 'declined')) {
    return res.json({ success: false, result: current.status, data: normalizeRow(current) });
  }
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
    // Read the old status first so we can tell a guest who just came off the
    // waitlist; the update is about to overwrite it.
    const prior = status !== undefined
      ? await pool.query('SELECT status FROM submissions WHERE id = $1', [id])
      : null;

    const result = await pool.query(`UPDATE submissions SET ${sets.join(', ')} WHERE ${where} RETURNING *`, params);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Submission not found.' });
    touchAvailability(String(result.rows[0].page_id));

    if (prior?.rows[0]?.status === 'waitlisted' && HAS_PLACE.includes(status)) {
      void notifyGuest(result.rows[0], 'promoted');
    }

    return res.json({ success: true, data: normalizeRow(result.rows[0]) });
  }

  refreshMemory();
  const idx = inMemorySubmissions.findIndex(s => s.id === id && inScope(scope, s.page_id));
  if (idx < 0) return res.status(404).json({ success: false, error: 'Submission not found.' });
  const next = { ...inMemorySubmissions[idx] };
  const wasWaiting = next.status === 'waitlisted';
  if (status !== undefined) next.status = status;
  if (wasWaiting && status !== undefined && HAS_PLACE.includes(status)) void notifyGuest(next, 'promoted');
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
      ? await pool.query('DELETE FROM submissions WHERE id = $1 AND page_id = ANY($2) RETURNING page_id', [id, scope])
      : await pool.query('DELETE FROM submissions WHERE id = $1 RETURNING page_id', [id]);
    if (!result.rowCount) return res.status(404).json({ success: false, error: 'Submission not found.' });
    touchAvailability(String(result.rows[0].page_id));
    await pool.query('DELETE FROM submission_tickets WHERE submission_id = $1', [id]);
    return res.json({ success: true, message: 'Submission removed successfully' });
  }

  refreshMemory();
  const before = inMemorySubmissions.length;
  inMemorySubmissions = inMemorySubmissions.filter(s => !(s.id === id && inScope(scope, s.page_id)));
  if (inMemorySubmissions.length === before) return res.status(404).json({ success: false, error: 'Submission not found.' });
  persistMemory();
  return res.json({ success: true, message: 'Submission removed successfully' });
}));
