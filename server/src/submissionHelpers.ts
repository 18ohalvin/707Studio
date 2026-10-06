/**
 * Small pure helpers for guest entries. No imports on purpose: they are
 * unit-tested from the frontend test run (src/tests/submissionHelpers.spec.ts).
 */

/** Stands in for the email of a funnel that never asked for one. */
export const PLACEHOLDER_EMAIL = 'guest@activation.internal';

/** Key under which a guest's picked sessions are stored (printed on their pass). */
export const SESSIONS_KEY = 'Access Valid For';

/**
 * The normalised email used to recognise the same person registering twice
 * (case and surrounding spaces ignored). null when there is nothing to
 * recognise them by: no email, or the placeholder.
 */
export function emailKeyOf(email: unknown): string | null {
  const key = String(email ?? '').trim().toLowerCase();
  return key && key !== PLACEHOLDER_EMAIL ? key : null;
}

/**
 * The per-visit key a guest's page sends with every attempt, so a retry or a
 * double tap is recognised as the same registration. Anything that does not
 * look like one is ignored rather than rejected.
 */
export function clientKeyOf(value: unknown): string | null {
  const key = typeof value === 'string' ? value.trim() : '';
  return /^[A-Za-z0-9_-]{8,100}$/.test(key) ? key : null;
}

/** The only parts of an entry a guest's own page gets back — enough to print the pass, nothing else. */
const PUBLIC_FORM_KEYS = ['fullName', 'email', 'Guest Type', SESSIONS_KEY];

/**
 * What the public endpoint returns. A repeat registration with someone's
 * email hands back the existing entry, so it must not carry their phone
 * number, other answers, IP address or browser.
 */
export function publicEntry(row: any) {
  const form = typeof row?.form_data === 'string' ? safeParse(row.form_data) : (row?.form_data || {});
  const form_data: Record<string, unknown> = {};
  for (const key of PUBLIC_FORM_KEYS) {
    if (form[key] !== undefined) form_data[key] = form[key];
  }
  return {
    id: row.id,
    ticket_code: row.ticket_code,
    status: row.status,
    submission_type: row.submission_type,
    created_at: row.created_at,
    form_data
  };
}

function safeParse(text: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Columns that exist for the database's own bookkeeping and are not part of an entry. */
export function stripInternal<T extends Record<string, any>>(row: T): Omit<T, 'email_key' | 'client_key' | 'slot_picks'> {
  const { email_key, client_key, slot_picks, ...rest } = row;
  return rest;
}

/**
 * Whether a database error is the kind that goes away by itself (connection
 * dropped, server restarting, pool exhausted, lock or deadlock timeout) — the
 * guest is told to retry — as opposed to a bug, which is reported as such.
 */
export function isTransientDbError(err: any): boolean {
  const code = String(err?.code || '');
  const message = String(err?.message || '').toLowerCase();
  if (code.startsWith('08') || code.startsWith('57P') || code.startsWith('53') || code.startsWith('40') || code === '55P03') return true;
  if (['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ENOTFOUND', 'EAI_AGAIN'].includes(code)) return true;
  return (
    message.includes('connection terminated') ||
    message.includes('connection timeout') ||
    message.includes('timeout exceeded when trying to connect') ||
    message.includes('too many clients') ||
    message.includes('the database system is') ||
    message.includes('client has encountered a connection error')
  );
}
