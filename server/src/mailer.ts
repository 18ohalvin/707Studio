import nodemailer, { Transporter } from 'nodemailer';

import { LOGO_707_PNG_BASE64 } from './brandLogo.js';

interface Attachment { filename: string; content: Buffer; contentType: string; cid?: string; contentDisposition?: 'inline' | 'attachment' }

/** Inline image shown at the top of every email (referenced as cid:logo707). */
const LOGO_ATTACHMENT: Attachment = {
  filename: '707-logo.png',
  content: Buffer.from(LOGO_707_PNG_BASE64, 'base64'),
  contentType: 'image/png',
  cid: 'logo707',
  contentDisposition: 'inline'
};

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

function shell(title: string, lead: string, rows: Array<[string, string]>, footer: string, cta?: { label: string; url: string; hint?: string }): string {
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
        <tr><td style="padding-bottom:24px;"><img src="cid:logo707" alt="707" width="84" height="26" style="display:block;border:0;width:84px;height:auto;" /></td></tr>
        <tr><td style="font-size:22px;font-weight:700;color:#111;padding-bottom:8px;">${escape(title)}</td></tr>
        <tr><td style="font-size:15px;color:#555;line-height:1.6;padding-bottom:24px;">${escape(lead)}</td></tr>
        <tr><td><table width="100%" cellpadding="0" cellspacing="0">${cells}</table></td></tr>
        ${cta ? `<tr><td style="padding-top:24px;"><a href="${escape(cta.url)}" style="display:block;background:#111;color:#fff;text-decoration:none;text-align:center;font-size:14px;font-weight:700;letter-spacing:.04em;padding:14px 20px;border-radius:10px;">${escape(cta.label)}</a>${cta.hint ? `<p style="margin:8px 0 0 0;text-align:center;font-size:12px;color:#888;">${escape(cta.hint)}</p>` : ''}</td></tr>` : ''}
        <tr><td style="padding-top:28px;border-top:1px solid #eee;margin-top:24px;font-size:13px;color:#8a8a8a;line-height:1.6;">${escape(footer)}</td></tr>
      </table>`
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
    await queued(() => tx.sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to, subject, html, attachments: [LOGO_ATTACHMENT, ...attachments] }));
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
  /** Wording of the live-tracking button, set by the brand editor. */
  liveLabel?: string;
  /** The guest's e-ticket, the same PDF they can download. */
  ticketPdf?: Buffer | null;
  /** The guest already had a ticket email (or a download that did not work); this is a second copy. */
  resend?: boolean;
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

function renderEmailText(template: string, vars: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g, (_, key) => {
    return vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : '';
  });
}

export interface EmailTemplateConfig {
  subject?: string;
  heading?: string;
  body?: string;
}

/**
 * The ticket email. With the PDF attached it only says "this is your ticket";
 * without it (the PDF never reached us) the access code is in the email itself,
 * so the guest still holds something that gets them in.
 */
function ticketMail(guest: GuestMail, title: string, intro: string) {
  const withPdf = Boolean(guest.ticketPdf);
  const formattedIntro = (/^(hi|hello|dear)\b/i.test(intro.trim()))
    ? intro
    : `Hi ${guest.fullName || 'there'}, ${intro}`;
  return shell(
    title,
    formattedIntro,
    withPdf
      ? [['Name', guest.fullName || ''], ['Event', guest.campaign || '']]
      : [['Access code', guest.ticketCode || ''], ['Name', guest.fullName || ''], ['Event', guest.campaign || '']],
    guest.liveUrl ? {
      label: guest.liveLabel || 'VIEW LIVE QUEUE',
      url: guest.liveUrl,
      hint: 'Your live position and QR code update automatically on this page.'
    } : undefined
  );
}

const TICKET_INTRO = (guest: GuestMail) => guest.resend
  ? 'here is your ticket again, in case the download did not work. Your e-ticket is attached to this email as a PDF, with the same details and QR code. Show it at the door.'
  : guest.ticketPdf
    ? 'this is your ticket. Your e-ticket is attached to this email as a PDF. Show it at the door.'
    : 'this is your ticket. Show the access code below at the door.';

/** Sent when a guest registers and has a place. */
export function sendPassEmail(guest: GuestMail, template?: EmailTemplateConfig) {
  if (!guest.email) return Promise.resolve({ success: false, skipped: true });
  const vars = {
    name: guest.fullName || 'there',
    fullName: guest.fullName || 'there',
    campaign: eventLabel(guest),
    queue_number: (guest as any).queueNumber || guest.ticketCode || '',
    access_id: guest.ticketCode || '',
    link: guest.liveUrl || ''
  };
  const subject = template?.subject?.trim()
    ? renderEmailText(template.subject, vars)
    : `Your 707 ticket for ${eventLabel(guest)}`;
  const heading = template?.heading?.trim()
    ? renderEmailText(template.heading, vars)
    : 'Your ticket';
  const intro = template?.body?.trim()
    ? renderEmailText(template.body, vars)
    : TICKET_INTRO(guest);

  return send(
    guest.email,
    subject,
    ticketMail(guest, heading, intro),
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

/** Sent when a queued guest's number is called to enter the venue at the door. */
export function sendTurnReadyEmail(guest: GuestMail, template?: EmailTemplateConfig) {
  if (!guest.email) return Promise.resolve({ success: false, skipped: true });
  const vars = {
    name: guest.fullName || 'there',
    fullName: guest.fullName || 'there',
    campaign: eventLabel(guest),
    queue_number: (guest as any).queueNumber || guest.ticketCode || '',
    access_id: guest.ticketCode || '',
    link: guest.liveUrl || ''
  };
  const subject = template?.subject?.trim()
    ? renderEmailText(template.subject, vars)
    : `It's your turn to enter: ${eventLabel(guest)}`;
  const heading = template?.heading?.trim()
    ? renderEmailText(template.heading, vars)
    : "It's Your Turn to Enter!";
  const bodyText = template?.body?.trim()
    ? renderEmailText(template.body, vars)
    : `Hi ${guest.fullName || 'there'}, your turn has arrived for ${eventLabel(guest)}. Please proceed to the entrance area now and present your live pass to the door staff.`;

  const html = shell(
    heading,
    bodyText,
    [
      ['Queue Number', (guest as any).queueNumber ? `#${(guest as any).queueNumber}` : (guest.ticketCode ? `#${guest.ticketCode}` : '')],
      ['Access Code', guest.ticketCode || ''],
      ['Name', guest.fullName || ''],
      ['Event', guest.campaign || '']
    ],
    'Please proceed to the entrance promptly. Present your pass on screen at the door.',
    guest.liveUrl ? {
      label: 'VIEW LIVE QUEUE',
      url: guest.liveUrl,
      hint: 'Your live pass is active and ready for door scanning.'
    } : undefined
  );
  return send(guest.email, subject, html, 'turn ready notification');
}

export default { sendPassEmail, sendWaitlistEmail, sendPromotedEmail, sendTurnReadyEmail, mailerStatus };

