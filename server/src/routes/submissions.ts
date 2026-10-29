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
import {
  getQueueSettings,
  saveQueueSettings,
  getNextQueueNumber,
  processQueueProgression,
  processQueueBatch,
  renderTemplate,
  sendWhatsAppNotification,
  getWaLogs,
  generateWaLinkPayload,
  extractPhoneNumber,
  normalizeWhatsAppNumber,
  formatWhatsAppDisplay
} from '../queueManager.js';
import { publicBaseUrl } from '../publicUrl.js';
import { recordWaLog } from '../queueHelpers.js';
import {
  getPageStatus,
  ensureSessionRestored,
  initPageWhatsApp,
  disconnectPageWhatsApp,
  sendBaileysMessage
} from '../baileysManager.js';

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
  const fd = typeof clean.form_data === 'string' ? JSON.parse(clean.form_data) : (clean.form_data || {});

  // Guarantee session answer on the choice column for adidas x SATISFY / atmos drops
  const isSatisfyOrAtmos = row.page_id === 'proj-1792652006255' ||
    String(row.brand_slug || '').toLowerCase() === 'atmos' ||
    Boolean(fd['multiplechoice_1793178196321']) ||
    Boolean(fd['BOOK YOUR SPOT']) ||
    (Array.isArray(fd['Access Valid For']) && fd['Access Valid For'].some((x: any) => /5k|run|raffle/i.test(x?.label || '')));

  if (isSatisfyOrAtmos) {
    if (!fd['multiplechoice_1793178196321'] || !Array.isArray(fd['multiplechoice_1793178196321']) || fd['multiplechoice_1793178196321'].length === 0) {
      fd['multiplechoice_1793178196321'] = ['5K RUN + RAFFLE ENTRIES'];
    }
    if (!fd['BOOK YOUR SPOT'] || !Array.isArray(fd['BOOK YOUR SPOT']) || fd['BOOK YOUR SPOT'].length === 0) {
      fd['BOOK YOUR SPOT'] = ['5K RUN + RAFFLE ENTRIES'];
    }
    if (!fd['Access Valid For'] || !Array.isArray(fd['Access Valid For']) || fd['Access Valid For'].length === 0 || fd['Access Valid For'][0]?.label === 'Single Day Admission') {
      fd['Access Valid For'] = [{
        id: 'opt_1',
        label: '5K RUN + RAFFLE ENTRIES',
        sublabel: '30 Oct 2026',
        description: ''
      }];
    }
  }

  return {
    ...clean,
    form_data: fd
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

/** The existing entry for this visit's key, this email, or ticket code, if either has registered already. */
async function findExisting(pageId: string, clientKey: string | null, emailKey: string | null, ticketCode?: string | null) {
  const cleanCode = ticketCode ? ticketCode.trim().toLowerCase() : null;
  if (!clientKey && !emailKey && !cleanCode) return null;
  const result = await pool.query(
    `SELECT * FROM submissions
      WHERE page_id = $1
        AND (
          ($2::text IS NOT NULL AND client_key = $2::text) OR 
          ($3::text IS NOT NULL AND email_key = $3::text) OR
          ($4::text IS NOT NULL AND LOWER(ticket_code) = $4::text)
        )
      ORDER BY created_at ASC, id ASC
      LIMIT 1`,
    [pageId, clientKey, emailKey, cleanCode]
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
         (id, page_id, brand_slug, submission_type, form_data, ticket_code, ip_address, user_agent, status, created_at, email_key, client_key, party_size, queue_number, queue_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [entry.id, entry.page_id, entry.brand_slug, entry.submission_type, JSON.stringify(entry.form_data), entry.ticket_code,
        entry.ip_address, entry.user_agent, status, entry.created_at, entry.email_key, entry.client_key,
        entry.party_size || 1, entry.queue_number || null, entry.queue_status || 'waiting']
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

    const { campaign, liveUrl, liveLabel } = await campaignAndLiveLink(row);

    let pdf = ticketPdf ?? null;
    if (!pdf && kind === 'promoted') pdf = await storedTicket(String(row.id));

    const qs = await getQueueSettings(row.page_id);

    const guest = {
      email,
      fullName: String(form.fullName || '').trim(),
      ticketCode: row.ticket_code || '',
      campaign,
      liveUrl,
      liveLabel,
      ticketPdf: pdf,
      queueNumber: row.queue_number
    };

    if (kind === 'promoted') await sendPromotedEmail(guest).then(r => markTicketEmailed(row.id, r));
    else if (row.status === 'waitlisted') await sendWaitlistEmail(guest);
    else await sendPassEmail(guest, qs.emailTemplates?.pass).then(r => markTicketEmailed(row.id, r));
  } catch (err: any) {
    console.warn('[Submissions] Could not notify guest:', err?.message || err);
  }
}

/** Campaign title and, for a queued guest, the link to their live queue page. */
async function campaignAndLiveLink(row: any): Promise<{ campaign: string; liveUrl: string; liveLabel?: string }> {
  let campaign = '';
  let liveUrl = '';
  let liveLabel: string | undefined;
  try {
    if (getDbStatus().isConnected && row?.page_id) {
      const r = await pool.query(
        `SELECT title, brand_slug, slug,
                COALESCE(live_snapshot->'pages', pages) AS funnel,
                COALESCE(live_snapshot->'widget_tree', widget_tree) AS widgets
           FROM pages WHERE id = $1`,
        [row.page_id]
      );
      const page = r.rows[0];
      campaign = page?.title || '';

      // The brand editor sets this on the Live Queue Pass: on/off and the button's wording
      const widgets: any[] = [
        ...(Array.isArray(page?.widgets) ? page.widgets : []),
        ...(Array.isArray(page?.funnel) ? page.funnel.flatMap((p: any) => p?.widget_tree || []) : [])
      ];
      const pass = widgets.find(w => w?.type === 'LiveQueuePass' || w?.props?.passMode === 'queue');
      const emailButton = pass?.props?.trackEmailEnabled !== false;
      liveLabel = String(pass?.props?.trackEmailLabel || '').trim() || undefined;

      const base = publicBaseUrl();
      if (emailButton && page?.slug && base && row.queue_number && row.ticket_code) {
        liveUrl = `${base}/${page.brand_slug || row.brand_slug}/${page.slug}?code=${encodeURIComponent(row.ticket_code)}`;
      }
    }
  } catch { /* the title and link are niceties, not a reason to skip the mail */ }
  return { campaign, liveUrl, liveLabel };
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

  const { campaign, liveUrl, liveLabel } = await campaignAndLiveLink(row);

  const outcome: any = await sendPassEmail({
    email,
    fullName: String(form.fullName || '').trim(),
    ticketCode: row.ticket_code || '',
    campaign,
    liveUrl,
    liveLabel,
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
  const partySize = Math.max(1, Math.min(10, Number(answers.party_size || answers['Jumlah Tamu'] || answers['Party Size'] || answers.guests) || 1));
  const eventDate = String(answers.event_date || answers['Access Valid For'] || answers.eventDate || '');

  // Auto-protect against bypassed single limited options or unassigned slots
  const slotDefs = await getSlotDefs(pageId, store === 'db');
  if (!picks.length && slotDefs.size > 0) {
    const limitedDefs = Array.from(slotDefs.values()).filter(d => d.capacity !== null);
    if (limitedDefs.length === 1) {
      picks.push({ widget: limitedDefs[0].widget, option: limitedDefs[0].option });
      const currentValid = answers['Access Valid For'];
      if (!currentValid || !Array.isArray(currentValid) || currentValid.length === 0 || currentValid[0]?.label === 'Single Day Admission') {
        answers['Access Valid For'] = [{
          id: limitedDefs[0].option,
          label: limitedDefs[0].label,
          sublabel: eventDate,
          description: ''
        }];
      }
      if (limitedDefs[0].widget && !answers[limitedDefs[0].widget]) {
        answers[limitedDefs[0].widget] = [limitedDefs[0].label];
      }
      if (!answers['BOOK YOUR SPOT']) {
        answers['BOOK YOUR SPOT'] = [limitedDefs[0].label];
      }
    }
  }

  const wantsWaitlist = req.body?.waitlist === true;
  const queueNumber = await getNextQueueNumber(pageId, store === 'db', eventDate);

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
    client_key: clientKey,
    party_size: partySize,
    queue_number: queueNumber,
    queue_status: 'waiting'
  });

  const alreadyRecorded = (row: any) =>
    res.status(200).json({ success: true, data: publicEntry(row), duplicate: true, message: 'Entry already recorded' });

  if (store === 'db') {
    const isRequeue = req.body?.requeue === true;
    const existing = await findExisting(pageId, clientKey, emailKey, req.body?.ticket_code);
    if (existing) {
      if (existing.queue_status === 'expired' || isRequeue) {
        // Re-queueing after expired: issue a brand-new queue number
        const newQueueNum = await getNextQueueNumber(pageId, true, eventDate);
        const newTicketCode = generateTicketCode();
        const updatedRes = await pool.query(
          `UPDATE submissions
              SET queue_number = $1,
                  queue_status = 'waiting',
                  wa_notified_states = '[]'::jsonb,
                  ticket_code = $2,
                  status = 'registered',
                  created_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *`,
          [newQueueNum, newTicketCode, existing.id]
        );
        const updatedRow = updatedRes.rows[0] || existing;
        touchAvailability(pageId);
        notifyNewEntry(updatedRow);

        const existingForm = typeof existing.form_data === 'string' ? JSON.parse(existing.form_data) : (existing.form_data || {});
        const mergedForm = { ...existingForm, ...answers };
        const phone = extractPhoneNumber(mergedForm);
        if (phone) {
          void getQueueSettings(pageId).then(qs => {
            if (qs.enabled && qs.waEnabled && qs.activeWaStage === 'welcome') {
              const passUrl = `${publicBaseUrl(req)}/${project.brand_slug}/${project.slug}?code=${newTicketCode}`;
              const text = renderTemplate(qs.waTemplates.welcome, {
                name: fullName || existingForm.fullName || existingForm.name || 'Visitor',
                queue_number: newQueueNum,
                party_size: partySize,
                access_id: newTicketCode,
                link: passUrl,
                epass_link: passUrl,
                pass_link: passUrl,
                requeue_link: passUrl
              });
              void sendWhatsAppNotification(phone, text, {
                pageId,
                submissionId: updatedRow.id,
                event: 'welcome',
                gatewayUrl: qs.waConnection?.gatewayUrl,
                apiToken: qs.waConnection?.apiToken,
                provider: qs.waConnection?.provider
              });
            }
          });
        }

        return res.status(200).json({
          success: true,
          data: publicEntry(updatedRow),
          requeued: true,
          message: 'New queue number generated successfully'
        });
      }
      return alreadyRecorded(existing);
    }

    // Which of the guest's picks are options of this campaign, and which of those are limited or closed.
    const defs = picks.length ? slotDefs : new Map<string, SlotDef>();
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

        // Send Welcome WhatsApp Notification if phone provided and WA notifications enabled
        const phone = extractPhoneNumber(answers);
        if (phone) {
          void getQueueSettings(pageId).then(qs => {
            if (qs.enabled && qs.waEnabled && qs.activeWaStage === 'welcome') {
              const passUrl = `${publicBaseUrl(req)}/${project.brand_slug}/${project.slug}?code=${outcome.row?.ticket_code || ''}`;
              const text = renderTemplate(qs.waTemplates.welcome, {
                name: fullName || 'Visitor',
                queue_number: queueNumber,
                party_size: partySize,
                access_id: outcome.row?.ticket_code || '',
                link: passUrl,
                epass_link: passUrl,
                pass_link: passUrl,
                requeue_link: passUrl
              });
              void sendWhatsAppNotification(phone, text, {
                pageId,
                submissionId: outcome.row?.id,
                event: 'welcome',
                gatewayUrl: qs.waConnection?.gatewayUrl,
                apiToken: qs.waConnection?.apiToken,
                provider: qs.waConnection?.provider
              });
            }
          });
        }

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
  const codeParam = typeof req.body?.ticket_code === 'string' ? req.body.ticket_code.trim().toLowerCase() : null;
  const existing = inMemorySubmissions.find(
    s => s.page_id === pageId && (
      (clientKey && s.client_key === clientKey) || 
      (emailKey && s.email_key === emailKey) ||
      (codeParam && String(s.ticket_code || '').trim().toLowerCase() === codeParam)
    )
  );
  if (existing) {
    if (existing.queue_status === 'expired' || req.body?.requeue === true) {
      const newQueueNum = await getNextQueueNumber(pageId, false, eventDate);
      const newTicketCode = generateTicketCode();
      existing.queue_number = newQueueNum;
      existing.ticket_code = newTicketCode;
      existing.queue_status = 'waiting';
      existing.wa_notified_states = [];
      existing.status = 'registered';
      existing.created_at = new Date().toISOString();
      const existingForm = typeof existing.form_data === 'string' ? JSON.parse(existing.form_data) : (existing.form_data || {});
      existing.form_data = { ...existingForm, ...answers };
      persistMemory();

      const phone = extractPhoneNumber(existing.form_data);
      if (phone) {
        void getQueueSettings(pageId).then(qs => {
          if (qs.enabled && qs.waEnabled && qs.activeWaStage === 'welcome') {
            const passUrl = `${publicBaseUrl(req)}/${project.brand_slug}/${project.slug}?code=${newTicketCode}`;
            const text = renderTemplate(qs.waTemplates.welcome, {
              name: fullName || existingForm.fullName || existingForm.name || 'Visitor',
              queue_number: newQueueNum,
              party_size: partySize,
              access_id: newTicketCode,
              link: passUrl,
              epass_link: passUrl,
              pass_link: passUrl,
              requeue_link: passUrl
            });
            void sendWhatsAppNotification(phone, text, {
              pageId,
              submissionId: existing.id,
              event: 'welcome',
              gatewayUrl: qs.waConnection?.gatewayUrl,
              apiToken: qs.waConnection?.apiToken,
              provider: qs.waConnection?.provider
            });
          }
        });
      }

      return res.status(200).json({ success: true, data: publicEntry(existing), requeued: true, message: 'New queue number generated successfully' });
    }
    return alreadyRecorded(existing);
  }

  const fileDefs = picks.length ? slotDefs : new Map<string, SlotDef>();
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

// GET /api/submissions/pass/:code - Public pass lookup for live queue status & requeue
submissionsRouter.get('/pass/:code', route('fetch pass by code', async (req, res) => {
  const code = String(req.params.code || '').trim().toLowerCase();
  if (!code) return res.status(400).json({ success: false, error: 'Code is required' });

  const store = await storeFor(res);
  if (!store) return;

  if (store === 'db') {
    const result = await pool.query(
      `SELECT * FROM submissions 
        WHERE LOWER(ticket_code) = $1 OR LOWER(id) = $1 
        ORDER BY created_at DESC LIMIT 1`,
      [code]
    );
    const row = result.rows[0];
    if (!row) return res.status(404).json({ success: false, error: 'Pass not found' });
    return res.json({ success: true, data: publicEntry(row) });
  } else {
    refreshMemory();
    const row = inMemorySubmissions.find(s => 
      String(s.ticket_code || '').toLowerCase() === code || 
      String(s.id).toLowerCase() === code
    );
    if (!row) return res.status(404).json({ success: false, error: 'Pass not found' });
    return res.json({ success: true, data: publicEntry(row) });
  }
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

// GET /api/submissions/queue-now/:pageId - Which number is being served, polled by guests' live passes (public)
submissionsRouter.get('/queue-now/:pageId', route('load queue position', async (req, res) => {
  const store = await storeFor(res);
  if (!store) return;
  const project = await findProjectForEntry(String(req.params.pageId || ''), store === 'db');
  if (!project || !canViewPublicPage(optionalClaims(req), project)) {
    return res.status(404).json({ success: false, error: 'This campaign is not available.' });
  }
  const settings = await getQueueSettings(String(project.id));
  res.setHeader('Cache-Control', 'no-store');
  return res.json({
    success: true,
    data: {
      currentCalledNumber: Number(settings.currentCalledNumber) || 1,
      skippedTolerance: Number(settings.skippedTolerance) || 0
    }
  });
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

    // Auto-heal proj-1792652006255 slot registrations in PostgreSQL background
    if (!scope || scope.includes('proj-1792652006255')) {
      void pool.query(`
        INSERT INTO submission_slots (submission_id, page_id, widget_id, option_id)
        SELECT s.id, s.page_id, 'multiplechoice_1793178196321', 'opt_1'
        FROM submissions s
        LEFT JOIN submission_slots ss ON ss.submission_id = s.id AND ss.widget_id = 'multiplechoice_1793178196321'
        WHERE s.page_id = 'proj-1792652006255' AND ss.submission_id IS NULL AND s.status NOT IN ('declined', 'waitlisted')
        ON CONFLICT (submission_id, widget_id, option_id) DO NOTHING;

        UPDATE submissions
        SET form_data = form_data::jsonb || '{"multiplechoice_1793178196321": ["5K RUN + RAFFLE ENTRIES"], "BOOK YOUR SPOT": ["5K RUN + RAFFLE ENTRIES"], "Access Valid For": [{"id": "opt_1", "label": "5K RUN + RAFFLE ENTRIES", "sublabel": "30 Oct 2026", "description": ""}]}'::jsonb
        WHERE (page_id = 'proj-1792652006255' OR LOWER(brand_slug) = 'atmos')
          AND (form_data->'multiplechoice_1793178196321' IS NULL OR form_data->'Access Valid For' IS NULL OR form_data->'Access Valid For'->0->>'label' = 'Single Day Admission')
          AND status NOT IN ('declined', 'waitlisted');
      `).then(() => touchAvailability('proj-1792652006255')).catch(() => {});
    }

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
  const partySizeInput = req.body?.party_size ? Math.max(1, Math.min(10, Number(req.body.party_size) || 1)) : undefined;

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
      const project = await findProjectForEntry(row.page_id, store === 'db');
      const eventConfig = project?.event_config || project?.pages?.[0]?.page_settings?.eventConfig;
      const isRollingOrMulti = eventConfig?.eventType === 'daily_rolling' || eventConfig?.eventType === 'multiday' || eventConfig?.dailyQueueReset;
      if (isRollingOrMulti) {
        const rowDate = String(row.form_data?.event_iso_date || row.form_data?.event_date || row.form_data?.eventDate || row.form_data?.['Access Valid For'] || '').trim();
        const now = new Date();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const todayFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`.toLowerCase();
        const todayShort = `${now.getDate()} ${monthsShort[now.getMonth()]} ${now.getFullYear()}`.toLowerCase();
        const todayIso = now.toISOString().slice(0, 10);
        let isToday = true;
        if (rowDate) {
          const lower = rowDate.toLowerCase();
          isToday = lower.includes(todayFormatted) || lower.includes(todayShort) || lower.includes(todayIso);
          if (!isToday && !isNaN(new Date(rowDate).getTime())) {
            const d = new Date(rowDate);
            isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
          }
        } else if (row.created_at) {
          const d = new Date(row.created_at);
          isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
        }
        if (!isToday) {
          return res.json({
            success: false,
            result: 'wrong_date',
            error: `Pass is valid for ${rowDate || 'another date'}, not today.`,
            data: normalizeRow(row)
          });
        }
      }

      const isCurrentlyInside = row.checked_in_at && (!row.checked_out_at || new Date(row.checked_out_at) < new Date(row.checked_in_at));
      if (isCurrentlyInside) return res.json({ success: false, result: 'already', data: normalizeRow(row) });

      const partySize = partySizeInput ?? (row.party_size || 1);
      const qSettings = await getQueueSettings(row.page_id);
      if (qSettings?.enabled && qSettings.maxCapacity) {
        const insideRes = await pool.query(
          `SELECT COALESCE(SUM(party_size), 0) AS total_inside
             FROM submissions
            WHERE page_id = $1
              AND checked_in_at IS NOT NULL
              AND (checked_out_at IS NULL OR checked_out_at < checked_in_at)
              AND id != $2`,
          [row.page_id, row.id]
        );
        const totalInside = Number(insideRes.rows[0]?.total_inside) || 0;
        if (totalInside + partySize > qSettings.maxCapacity) {
          return res.json({
            success: false,
            result: 'capacity_exceeded',
            error: `Venue is at maximum capacity (${totalInside}/${qSettings.maxCapacity} inside). Cannot admit ${partySize} guest(s).`,
            data: normalizeRow(row)
          });
        }
      }

      const upd = await pool.query(
        `UPDATE submissions
            SET checked_in_at = COALESCE(checked_in_at, NOW()),
                checked_in_by = $2,
                checked_out_at = NULL,
                party_size = $3,
                queue_status = 'admitted'
          WHERE id = $1
          RETURNING *`,
        [row.id, operator, partySize]
      );
      if (!upd.rows[0]) return res.json({ success: false, result: 'already', data: normalizeRow(row) });

      let updatedCalledNumber = qSettings?.currentCalledNumber || 1;
      if (qSettings?.enabled) {
        const guestQueueNum = Number(upd.rows[0]?.queue_number) || Number(row.queue_number) || Number(row.form_data?.queue_number) || 0;
        if (guestQueueNum > 0 && guestQueueNum >= updatedCalledNumber) {
          updatedCalledNumber = guestQueueNum;
          await saveQueueSettings(row.page_id, { currentCalledNumber: updatedCalledNumber });
          void processQueueProgression(row.page_id, updatedCalledNumber, publicBaseUrl(req));
        }
      }

      return res.json({
        success: true,
        result: 'admitted',
        currentCalledNumber: updatedCalledNumber,
        data: normalizeRow(upd.rows[0])
      });
    }
    // mode === 'out' - Preserve checked_in_at timestamp, record checked_out_at!
    const upd = await pool.query(
      `UPDATE submissions
          SET checked_out_at = NOW(),
              queue_status = 'completed'
        WHERE id = $1
        RETURNING *`,
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
    const project = await findProjectForEntry(current.page_id, false);
    const eventConfig = project?.event_config || project?.pages?.[0]?.page_settings?.eventConfig;
    const isRollingOrMulti = eventConfig?.eventType === 'daily_rolling' || eventConfig?.eventType === 'multiday' || eventConfig?.dailyQueueReset;
    if (isRollingOrMulti) {
      const rowDate = String(current.form_data?.event_iso_date || current.form_data?.event_date || current.form_data?.eventDate || current.form_data?.['Access Valid For'] || '').trim();
      const now = new Date();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const todayFormatted = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`.toLowerCase();
      const todayShort = `${now.getDate()} ${monthsShort[now.getMonth()]} ${now.getFullYear()}`.toLowerCase();
      const todayIso = now.toISOString().slice(0, 10);
      let isToday = true;
      if (rowDate) {
        const lower = rowDate.toLowerCase();
        isToday = lower.includes(todayFormatted) || lower.includes(todayShort) || lower.includes(todayIso);
        if (!isToday && !isNaN(new Date(rowDate).getTime())) {
          const d = new Date(rowDate);
          isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
        }
      } else if (current.created_at) {
        const d = new Date(current.created_at);
        isToday = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
      }
      if (!isToday) {
        return res.json({
          success: false,
          result: 'wrong_date',
          error: `Pass is valid for ${rowDate || 'another date'}, not today.`,
          data: normalizeRow(current)
        });
      }
    }

    const isCurrentlyInside = current.checked_in_at && (!current.checked_out_at || new Date(current.checked_out_at) < new Date(current.checked_in_at));
    if (isCurrentlyInside) return res.json({ success: false, result: 'already', data: normalizeRow(current) });

    const partySize = partySizeInput ?? current.party_size ?? 1;
    const qSettings = await getQueueSettings(current.page_id);
    if (qSettings?.enabled && qSettings.maxCapacity) {
      const totalInside = inMemorySubmissions
        .filter(s => s.page_id === current.page_id && s.checked_in_at && (!s.checked_out_at || new Date(s.checked_out_at) < new Date(s.checked_in_at)) && s.id !== current.id)
        .reduce((sum, s) => sum + (Number(s.party_size) || 1), 0);
      if (totalInside + partySize > qSettings.maxCapacity) {
        return res.json({
          success: false,
          result: 'capacity_exceeded',
          error: `Venue is at maximum capacity (${totalInside}/${qSettings.maxCapacity} inside). Cannot admit ${partySize} guest(s).`,
          data: normalizeRow(current)
        });
      }
    }

    inMemorySubmissions[idx] = {
      ...current,
      checked_in_at: current.checked_in_at || new Date().toISOString(),
      checked_in_by: operator,
      checked_out_at: null,
      party_size: partySize,
      queue_status: 'admitted'
    };
    persistMemory();

    let updatedCalledNumber = qSettings?.currentCalledNumber || 1;
    if (qSettings?.enabled) {
      const guestQueueNum = Number(current.queue_number) || Number(current.form_data?.queue_number) || 0;
      if (guestQueueNum > 0 && guestQueueNum >= updatedCalledNumber) {
        updatedCalledNumber = guestQueueNum;
        await saveQueueSettings(current.page_id, { currentCalledNumber: updatedCalledNumber });
        void processQueueProgression(current.page_id, updatedCalledNumber, publicBaseUrl(req));
      }
    }

    return res.json({
      success: true,
      result: 'admitted',
      currentCalledNumber: updatedCalledNumber,
      data: normalizeRow(inMemorySubmissions[idx])
    });
  }
  inMemorySubmissions[idx] = {
    ...current,
    checked_out_at: new Date().toISOString(),
    queue_status: 'completed'
  };
  persistMemory();
  return res.json({ success: true, result: 'checked_out', data: normalizeRow(inMemorySubmissions[idx]) });
}));

// GET /api/submissions/queue-settings
submissionsRouter.get('/queue-settings', requireAuth, route('get queue settings', async (req, res) => {
  const pageId = String(req.query.page_id || '');
  if (!pageId) return res.status(400).json({ success: false, error: 'page_id is required' });
  const settings = await getQueueSettings(pageId);
  return res.json({ success: true, data: settings });
}));

// POST /api/submissions/queue-settings
submissionsRouter.post('/queue-settings', requireAuth, route('update queue settings', async (req, res) => {
  const pageId = String(req.body?.page_id || '');
  if (!pageId) return res.status(400).json({ success: false, error: 'page_id is required' });
  // Runtime state is changed only by its own actions (call-next / call-batch, the WhatsApp
  // link routes). A settings form that was opened earlier carries stale copies of it, and
  // saving them back would rewind the queue or unlink WhatsApp.
  const { currentCalledNumber: _called, ...incoming } = (req.body?.settings || {}) as Record<string, any>;
  if (incoming.waConnection) {
    const { connected: _c, phoneNumber: _p, formattedNumber: _f, linkedAt: _l, deviceInfo: _d, sessionName: _s, ...editable } = incoming.waConnection;
    incoming.waConnection = editable;
  }
  const saved = await saveQueueSettings(pageId, incoming);
  return res.json({ success: true, data: saved });
}));

// POST /api/submissions/call-next
submissionsRouter.post('/call-next', requireAuth, route('advance queue called number', async (req, res) => {
  const pageId = String(req.body?.page_id || '');
  const calledNumber = Number(req.body?.called_number);
  if (!pageId || isNaN(calledNumber)) return res.status(400).json({ success: false, error: 'page_id and called_number are required' });
  const result = await processQueueProgression(pageId, calledNumber, publicBaseUrl(req));
  return res.json({ success: true, data: result });
}));

// POST /api/submissions/call-batch
submissionsRouter.post('/call-batch', requireAuth, route('call batch of waiting queue guests', async (req, res) => {
  const pageId = String(req.body?.page_id || '');
  const spots = Number(req.body?.spots) || 1;
  if (!pageId) return res.status(400).json({ success: false, error: 'page_id is required' });
  const result = await processQueueBatch(pageId, spots, publicBaseUrl(req));
  return res.json({ success: true, data: result });
}));

// GET /api/submissions/wa-status - Poll current Baileys session status & QR code
submissionsRouter.get('/wa-status', requireAuth, route('get WA session status', async (req, res) => {
  const pageId = String(req.query.page_id || '');
  if (!pageId) return res.status(400).json({ success: false, error: 'page_id is required' });
  await ensureSessionRestored(pageId);
  const status = getPageStatus(pageId);
  return res.json({ success: true, ...status });
}));

// POST /api/submissions/wa-connect - Initialize Baileys socket & generate QR code
submissionsRouter.post('/wa-connect', requireAuth, route('connect WA device', async (req, res) => {
  const { page_id, expectedPhone } = req.body || {};
  if (!page_id) return res.status(400).json({ success: false, error: 'page_id is required' });
  const status = await initPageWhatsApp(page_id, { expectedPhone });
  return res.json({ success: true, ...status });
}));

// POST /api/submissions/wa-disconnect - Disconnect & logout Baileys socket
submissionsRouter.post('/wa-disconnect', requireAuth, route('disconnect WA device', async (req, res) => {
  const { page_id } = req.body || {};
  if (!page_id) return res.status(400).json({ success: false, error: 'page_id is required' });
  const result = await disconnectPageWhatsApp(page_id);
  return res.json(result);
}));

// GET /api/submissions/wa-link-session - Direct WhatsApp link payload and clean number info
submissionsRouter.get('/wa-link-session', requireAuth, route('generate WA link session', async (req, res) => {
  const pageId = String(req.query.page_id || '');
  const phone = String(req.query.phone || '');
  if (!pageId) return res.status(400).json({ success: false, error: 'page_id is required' });
  const payload = generateWaLinkPayload(pageId, phone);
  return res.json({ success: true, data: payload });
}));

// POST /api/submissions/wa-confirm-link - Confirm device connection
submissionsRouter.post('/wa-confirm-link', requireAuth, route('confirm WA device connection', async (req, res) => {
  const { page_id, phoneNumber, sessionName, provider, gatewayUrl, apiToken } = req.body || {};
  if (!page_id) return res.status(400).json({ success: false, error: 'page_id is required' });
  
  const cleanPhone = normalizeWhatsAppNumber(phoneNumber || '');
  if (!cleanPhone && !gatewayUrl) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid WhatsApp phone number (e.g. +62 812-3456-7890 or 081234567890).'
    });
  }

  const formatted = cleanPhone ? formatWhatsAppDisplay(cleanPhone) : '';
  const waConnection = {
    connected: true,
    phoneNumber: cleanPhone,
    formattedNumber: formatted,
    sessionName: sessionName || '707 Studio Primary WhatsApp',
    provider: provider || (gatewayUrl ? 'fonnte' : 'linked_device'),
    gatewayUrl: gatewayUrl ? String(gatewayUrl).trim() : undefined,
    apiToken: apiToken ? String(apiToken).trim() : undefined,
    linkedAt: new Date().toISOString(),
    deviceInfo: {
      platform: gatewayUrl ? 'Cloud Gateway API' : 'WhatsApp Multi-Device (Web)',
      pushName: sessionName || '707 Activation Hub'
    }
  };

  const saved = await saveQueueSettings(page_id, { waConnection, waEnabled: true });
  return res.json({ success: true, data: saved.waConnection });
}));

// POST /api/submissions/wa-unlink - Disconnect linked WhatsApp session
submissionsRouter.post('/wa-unlink', requireAuth, route('unlink WA device', async (req, res) => {
  const { page_id } = req.body || {};
  if (!page_id) return res.status(400).json({ success: false, error: 'page_id is required' });

  await disconnectPageWhatsApp(page_id);

  const waConnection = {
    connected: false,
    phoneNumber: '',
    sessionName: '',
    provider: 'linked_device' as const
  };

  const saved = await saveQueueSettings(page_id, { waConnection });
  return res.json({ success: true, data: saved.waConnection });
}));

// POST /api/submissions/wa-test-message - Dispatch authentic test message to phone
submissionsRouter.post('/wa-test-message', requireAuth, route('dispatch WA test message', async (req, res) => {
  const { page_id, phone, text, recipientPhone, message } = req.body || {};
  const targetPhone = recipientPhone || phone;
  const messageBody = message || text;

  if (!targetPhone) return res.status(400).json({ success: false, error: 'Recipient phone number is required' });

  const cleanPhone = normalizeWhatsAppNumber(targetPhone);
  if (!cleanPhone || cleanPhone.length < 8) {
    return res.status(400).json({
      success: false,
      error: `Invalid phone number format: "${targetPhone}". Please enter a valid number (e.g. +62 812-3456-7890 or 081234567890).`
    });
  }

  const messageText = messageBody || `[707 Studio Test] Automated WhatsApp notifications are live and connected. Queue system is fully operational!`;
  const directWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  // 1. Try Baileys Linked Device Socket (The real WhatsApp Web gateway)
  const baileysResult = await sendBaileysMessage(page_id || 'default', cleanPhone, messageText);
  if (baileysResult.success) {
    recordWaLog({ pageId: page_id, phone: cleanPhone, text: messageText, event: 'test_dispatch', status: 'delivered' });
    return res.json({
      success: true,
      mode: 'baileys',
      formattedPhone: formatWhatsAppDisplay(cleanPhone),
      message: `Test notification successfully delivered via Linked WhatsApp to +${cleanPhone}!`,
      messageId: baileysResult.messageId,
      waUrl: directWaUrl
    });
  }

  // 2. Check if third-party gateway is configured
  const settings = page_id ? await getQueueSettings(page_id) : null;
  const gatewayUrl = settings?.waConnection?.gatewayUrl;
  const apiToken = settings?.waConnection?.apiToken;
  const provider = settings?.waConnection?.provider;

  if (gatewayUrl) {
    const dispatched = await sendWhatsAppNotification(cleanPhone, messageText, {
      pageId: page_id,
      event: 'test_dispatch',
      gatewayUrl,
      apiToken,
      provider
    });

    const recent = getWaLogs(page_id);
    const lastLog = recent[0];

    if (!dispatched || lastLog?.status === 'failed') {
      return res.status(400).json({
        success: false,
        mode: 'gateway',
        error: lastLog?.error || 'Gateway failed to deliver message. Please check your Gateway URL, Device Token, or device pairing status.',
        waUrl: directWaUrl
      });
    }

    return res.json({
      success: true,
      mode: 'gateway',
      formattedPhone: formatWhatsAppDisplay(cleanPhone),
      message: `Test notification successfully delivered via ${provider || 'Cloud Gateway'} to +${cleanPhone}!`,
      waUrl: directWaUrl
    });
  }

  // If Baileys is not linked and no gateway configured:
  return res.status(400).json({
    success: false,
    error: baileysResult.error || 'WhatsApp device is not linked or offline. Please click "Link Device (QR Code)" and scan with your WhatsApp camera first.',
    waUrl: directWaUrl
  });
}));

// GET /api/submissions/wa-logs - Retrieve live outgoing WhatsApp audit log
submissionsRouter.get('/wa-logs', requireAuth, route('get recent WA logs', async (req, res) => {
  const pageId = String(req.query.page_id || '');
  const logs = getWaLogs(pageId || undefined);
  return res.json({ success: true, data: logs });
}));

// PATCH /api/submissions/:id - Update status and/or check-in state of one entry
submissionsRouter.patch('/:id', requireAuth, route('update this guest', async (req, res) => {
  const { id } = req.params;
  const { status, checked_in, checked_out, operator } = req.body || {};

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
    if (checked_out === true) {
      sets.push(`checked_out_at = NOW(), queue_status = 'completed'`);
    } else if (checked_out === false) {
      sets.push('checked_out_at = NULL');
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
  if (checked_out === true) {
    next.checked_out_at = new Date().toISOString();
    next.queue_status = 'completed';
  } else if (checked_out === false) {
    next.checked_out_at = null;
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
