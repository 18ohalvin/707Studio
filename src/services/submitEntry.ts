/**
 * Sending a guest's registration.
 *
 * Mobile signal at a venue drops requests, and the server may be briefly
 * unable to reach its database, so one failed attempt does not mean the guest
 * is not registered — and trying again must not register them twice. Every
 * attempt for the same answers therefore carries the same client key, which
 * the server uses to recognise a repeat and hand back the first entry (and
 * the same Access ID), and failures that can pass by themselves are retried
 * automatically before the guest is shown an error.
 */

export interface EntryPayload {
  page_id: string;
  submission_type: string;
  form_data: Record<string, any>;
  /** Options ticked on limited blocks, so the server can count the places. */
  slot_picks?: Array<{ widget: string; option: string }>;
  /** The guest accepts the waitlist for any option that turns out to be full. */
  waitlist?: boolean;
}

export interface RecordedEntry {
  ticket_code: string;
  form_data?: Record<string, any>;
  [key: string]: any;
}

export type EntryOutcome =
  | { ok: true; entry: RecordedEntry; duplicate: boolean }
  | { ok: false; message: string; retryable: boolean; code?: string; full?: Array<{ widget: string; option: string; label: string; waitlist: boolean }>; availability?: Record<string, any> };

/** Waits before the 1st, 2nd, … retry: about 13 s in all, enough to ride out a database restart. */
export const RETRY_DELAYS_MS = [1000, 2000, 4000, 6000];

export interface PostEntryOptions {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  delays?: number[];
  headers?: Record<string, string>;
  onRetry?: (attempt: number) => void;
}

const NO_CONNECTION = 'No connection — check your signal and try again.';

export async function postEntry(payload: EntryPayload, clientKey: string, opts: PostEntryOptions = {}): Promise<EntryOutcome> {
  const doFetch = opts.fetchImpl ?? fetch;
  const sleep = opts.sleep ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)));
  const delays = opts.delays ?? RETRY_DELAYS_MS;
  let lastMessage = NO_CONNECTION;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    if (attempt > 0) {
      opts.onRetry?.(attempt);
      await sleep(delays[attempt - 1]);
    }
    try {
      const res = await doFetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
        body: JSON.stringify({ ...payload, client_key: clientKey })
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.success && json.data?.ticket_code) {
        return { ok: true, entry: json.data, duplicate: Boolean(json.duplicate) };
      }
      lastMessage = json?.error || 'We could not register your entry.';
      // The entry itself was refused (missing name, unknown campaign…): trying again cannot help.
      if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
        return { ok: false, message: lastMessage, retryable: false, code: json?.code, full: json?.full, availability: json?.availability };
      }
    } catch {
      lastMessage = NO_CONNECTION;
    }
  }
  return { ok: false, message: lastMessage, retryable: true };
}

/** A fresh random key for one registration attempt-group. */
export function newClientKey(): string {
  const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
  if (c?.randomUUID) return c.randomUUID();
  const bytes = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hands out the key for a set of answers: the same answers always get the
 * same key (a retry, a second tap), changed answers get a new one (the guest
 * went back and corrected something — that is a different registration).
 */
export function createEntryKeyring(makeKey: () => string = newClientKey) {
  let key = '';
  let fingerprint = '';
  return {
    keyFor(answers: Record<string, any>): string {
      const next = JSON.stringify(answers);
      if (!key || next !== fingerprint) {
        key = makeKey();
        fingerprint = next;
      }
      return key;
    },
    reset() {
      key = '';
      fingerprint = '';
    }
  };
}
