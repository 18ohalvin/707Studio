import nodemailer, { Transporter } from 'nodemailer';

interface Attachment { filename: string; content: Buffer; contentType: string }

/**
 * Guest email.
 *
 * Uses the same SMTP settings as the FNF event app — the credentials already in
 * use for the707.co@sosco.id — so nothing new has to be set up or paid for.
 *
 * Sending is off unless ENABLE_EMAIL_DISPATCH is "true", which keeps a
 * misconfigured environment from quietly mailing real guests.
 */

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || process.env.FROM_EMAIL || 'the707.co@sosco.id';
const FROM_NAME = process.env.SMTP_FROM_NAME || '707 Events';
const HOST = process.env.SMTP_HOST || '';
const PORT = Number(process.env.SMTP_PORT || 587);
const SECURE = process.env.SMTP_SECURE === 'true';
const USER = process.env.SMTP_USER || '';
const PASS = process.env.SMTP_PASS || '';

const ENABLED = process.env.ENABLE_EMAIL_DISPATCH === 'true';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!HOST || !USER) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: SECURE,
      auth: { user: USER, pass: PASS }
    });
  }
  return transporter;
}

export function mailerStatus() {
  return {
    enabled: ENABLED,
    configured: Boolean(HOST && USER),
    from: FROM_EMAIL,
    host: HOST
  };
}

function escape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title: string, lead: string, rows: Array<[string, string]>, footer: string): string {
  const cells = rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:6px 0;color:#8a8a8a;font-size:12px;letter-spacing:.08em;text-transform:uppercase;">${escape(label)}</td>
          <td style="padding:6px 0;color:#111;font-size:15px;font-weight:600;text-align:right;">${escape(value)}</td>
        </tr>`
    )
    .join('');

  return `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;padding:32px;" cellpadding="0" cellspacing="0">
        <tr><td style="font-size:13px;letter-spacing:.34em;color:#111;font-weight:700;padding-bottom:24px;">707</td></tr>
        <tr><td style="font-size:22px;font-weight:700;color:#111;padding-bottom:8px;">${escape(title)}</td></tr>
        <tr><td style="font-size:15px;color:#555;line-height:1.6;padding-bottom:24px;">${escape(lead)}</td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0">${cells}</table></td></tr>
        <tr><td style="padding-top:28px;border-top:1px solid #eee;margin-top:24px;font-size:13px;color:#8a8a8a;line-height:1.6;">${escape(footer)}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/**
 * One at a time, with a gap.
 *
 * Promoting a waitlist can touch hundreds of guests in a single click — this
 * campaign has 1,282 waiting — and firing that many sends at once would be
 * throttled by the mail provider and could get the sending address flagged.
 * Queueing keeps a bulk promotion to a steady trickle instead.
 */
const SEND_GAP_MS = 700;
let chain: Promise<unknown> = Promise.resolve();

function queued<T>(task: () => Promise<T>): Promise<T> {
  const result = chain.then(task);
  chain = result.then(
    () => new Promise(resolve => setTimeout(resolve, SEND_GAP_MS)),
    () => new Promise(resolve => setTimeout(resolve, SEND_GAP_MS))
  );
  return result;
}

async function send(to: string, subject: string, html: string, label: string, attachments: Attachment[] = []) {
  if (!ENABLED) {
    console.log(`[Mailer] Disabled (ENABLE_EMAIL_DISPATCH is not "true") — would have sent "${label}" to ${to}`);
    return { success: false, skipped: true };
  }

  const tx = getTransporter();
  if (!tx) {
    console.warn('[Mailer] SMTP is not configured; no mail sent.');
    return { success: false, skipped: true };
  }

  try {
    await queued(() => tx.sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to, subject, html, attachments }));
    console.log(`[Mailer] Sent "${label}" to ${to}`);
    return { success: true };
  } catch (err: any) {
    // Never let a mail failure break the guest's registration — the entry is
    // already recorded, and they can still download the pass on screen.
    console.error(`[Mailer] Could not send "${label}" to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

interface GuestMail {
  email: string;
  fullName?: string;
  ticketCode?: string;
  campaign?: string;
  liveUrl?: string;
  /** The guest's e-ticket, the same PDF they can download. */
  ticketPdf?: Buffer | null;
}

const eventLabel = (guest: GuestMail) => guest.campaign || '707 event';

/** File name of the ticket, matching the one the guest's own download gets. */
function ticketFileName(guest: GuestMail): string {
  const title = (guest.campaign || 'ticket').replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase() || 'ticket';
  return `${title}-${guest.ticketCode || 'ticket'}.pdf`;
}

function ticketAttachment(guest: GuestMail): Attachment[] {
  return guest.ticketPdf
    ? [{ filename: ticketFileName(guest), content: guest.ticketPdf, contentType: 'application/pdf' }]
    : [];
}

/**
 * The ticket email. With the PDF attached it only says "this is your ticket";
 * without it (the PDF never reached us) the access code is in the email itself,
 * so the guest still holds something that gets them in.
 */
function ticketMail(guest: GuestMail, title: string, intro: string) {
  const withPdf = Boolean(guest.ticketPdf);
  return shell(
    title,
    `Hi ${guest.fullName || 'there'}, ${intro}`,
    withPdf
      ? [['Name', guest.fullName || ''], ['Event', guest.campaign || '']]
      : [['Access code', guest.ticketCode || ''], ['Name', guest.fullName || ''], ['Event', guest.campaign || '']],
    withPdf
      ? 'Keep this email. Your ticket is the attached PDF.'
      : 'Keep this email. Your access code is your entry.'
  );
}

const TICKET_INTRO = (guest: GuestMail) => guest.ticketPdf
  ? 'this is your ticket. Your e-ticket is attached to this email as a PDF. Show it at the door.'
  : 'this is your ticket. Show the access code below at the door.';

/** Sent when a guest registers and has a place. */
export function sendPassEmail(guest: GuestMail) {
  if (!guest.email) return Promise.resolve({ success: false, skipped: true });
  return send(
    guest.email,
    `Your 707 ticket for ${eventLabel(guest)}`,
    ticketMail(guest, 'Your ticket', TICKET_INTRO(guest)),
    'ticket',
    ticketAttachment(guest)
  );
}

/** Sent when a guest registers but every place is taken. */
export function sendWaitlistEmail(guest: GuestMail) {
  if (!guest.email) return Promise.resolve({ success: false, skipped: true });

  const html = shell(
    'You are on the waitlist',
    `Hi ${guest.fullName || 'there'}, ${eventLabel(guest)} is full right now. You are on the waitlist, and we will email you your ticket the moment a place opens.`,
    [
      ['Name', guest.fullName || ''],
      ['Event', guest.campaign || '']
    ],
    'No action needed. This is not a ticket yet. Wait for the confirmation email.'
  );

  return send(guest.email, `You're on the waitlist for ${eventLabel(guest)}`, html, 'waitlist notice');
}

/** Sent when a waitlisted guest is moved up and now has a place. */
export function sendPromotedEmail(guest: GuestMail) {
  if (!guest.email) return Promise.resolve({ success: false, skipped: true });
  return send(
    guest.email,
    `A place opened up: your 707 ticket for ${eventLabel(guest)}`,
    ticketMail(guest, 'A place opened up', `good news, you are off the waitlist. ${TICKET_INTRO(guest).replace(/^this is your ticket\. /, 'This is your ticket. ')}`),
    'waitlist promotion',
    ticketAttachment(guest)
  );
}

export default { sendPassEmail, sendWaitlistEmail, sendPromotedEmail, mailerStatus };
