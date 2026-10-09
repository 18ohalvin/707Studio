/**
 * Shared helpers for the Campaign Hub (guest database, door scanner, raffle).
 * Guest answers are stored as free-form JSON keyed by the field label the brand
 * typed in the editor, so everything here works off that loose shape.
 */
import { apiJson } from '../../services/apiClient.ts';

export interface Submission {
  id: string;
  page_id: string;
  brand_slug: string;
  submission_type: string;
  form_data: Record<string, any>;
  ticket_code?: string | null;
  checked_in_at?: string | null;
  checked_in_by?: string | null;
  ip_address?: string;
  status: string;
  created_at: string;
  /** Set on an entry that was registered twice before duplicates were prevented: the id of the original. */
  duplicate_of?: string | null;
  /** When the guest's ticket email last went out; absent if they never got one. */
  ticket_emailed_at?: string | null;
}

export type GuestStatus = 'registered' | 'confirmed' | 'waitlisted' | 'winner' | 'declined';

export const STATUS_OPTIONS: { value: GuestStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'waitlisted', label: 'Waitlisted' },
  { value: 'winner', label: 'Winner' },
  { value: 'declined', label: 'Declined' }
];

/** Older entries were stored as "submitted" — treat them as registered everywhere. */
export function normalizeStatus(status?: string): GuestStatus {
  if (!status || status === 'submitted') return 'registered';
  return (STATUS_OPTIONS.some(o => o.value === status) ? status : 'registered') as GuestStatus;
}

export function statusLabel(status?: string): string {
  const s = normalizeStatus(status);
  return STATUS_OPTIONS.find(o => o.value === s)?.label || 'Registered';
}

export function statusBadgeClass(status?: string): string {
  switch (normalizeStatus(status)) {
    case 'confirmed': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'waitlisted': return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'winner': return 'bg-black text-white border-black';
    case 'declined': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-neutral-100 text-neutral-600 border-neutral-300';
  }
}

export function statusDotClass(status?: string): string {
  switch (normalizeStatus(status)) {
    case 'confirmed': return 'bg-emerald-500';
    case 'waitlisted': return 'bg-amber-500';
    case 'winner': return 'bg-white';
    case 'declined': return 'bg-red-500';
    default: return 'bg-neutral-400';
  }
}

const SYSTEM_KEYS = new Set(['fullName', 'email', 'submittedAt', 'name']);
const PHONE_RE = /whats\s?app|phone|telp|telepon|\bwa\b|mobile|hp\b/i;
const NAME_RE = /name|nama/i;
const EMAIL_RE = /e-?mail/i;

export function guestName(s: Submission): string {
  const fd = s.form_data || {};
  return String(fd.fullName || fd.name || 'Guest Participant').trim();
}

export function guestEmail(s: Submission): string {
  const email = String(s.form_data?.email || '').trim();
  return email === 'guest@activation.internal' ? '' : email;
}

export function guestPhone(s: Submission): string {
  const fd = s.form_data || {};
  const key = Object.keys(fd).find(k => PHONE_RE.test(k) && fd[k]);
  return key ? String(fd[key]) : '';
}

/** Pass type the guest was issued (VIP / Public), from the campaign's Ticket Summary preset. */
export function guestType(s: Submission): string {
  return String(s.form_data?.['Guest Type'] || '').trim();
}

export function formatValue(value: any): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    // Picked sessions are stored as { label, sublabel } so the pass can print them.
    return value.map(v => (v && typeof v === 'object' ? [v.label, v.sublabel].filter(Boolean).join(' · ') : String(v))).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Answer keys that aren't already surfaced as name / email / phone. */
export function customFieldKeys(rows: Submission[]): string[] {
  const keys = new Map<string, number>();
  rows.forEach(s => {
    const fd = s.form_data || {};
    Object.keys(fd).forEach(k => {
      if (SYSTEM_KEYS.has(k)) return;
      if (PHONE_RE.test(k) || EMAIL_RE.test(k)) return;
      // The labelled "Full Name" field duplicates fullName — hide it.
      if (NAME_RE.test(k) && formatValue(fd[k]).trim() === guestName(s)) return;
      keys.set(k, (keys.get(k) || 0) + 1);
    });
  });
  return [...keys.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'G';
}

export function accessId(s: Submission): string {
  return s.ticket_code || s.id;
}

/** Upper-case letters and digits only, so "061026-1103-487t" and "0610261103487T" are the same code. */
const alnum = (v: string) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

/** The part of an Access ID door staff read out and type: its last four characters. */
export function codeTail(s: Submission): string {
  return alnum(accessId(s)).slice(-4);
}

/** The last four digits of the guest's WhatsApp / phone number, or '' if they gave none. */
export function phoneTail(s: Submission): string {
  return guestPhone(s).replace(/\D/g, '').slice(-4);
}

export interface GuestMatch {
  guest: Submission;
  /** What the typed text matched: the end of the Access ID, the end of the phone number, or the name. */
  via: 'code' | 'phone' | 'name';
}

/**
 * Finds guests from what door staff can type quickly: the last characters of the
 * Access ID (4 is enough), the last digits of the WhatsApp number, or part of the
 * name. Four characters are not unique — in a list of ~1,800 a few guests share
 * the same ending — so this returns every match, best first, and the door picks
 * the right person. A whole Access ID typed or scanned matches exactly one.
 * A guest registered twice appears once (the original).
 */
export function findGuestsByShortCode(rows: Submission[], query: string, limit = 8): GuestMatch[] {
  const text = String(query || '').trim();
  const key = alnum(text);
  if (key.length < 3) return [];
  const digitsOnly = /^\d+$/.test(key);
  const lower = text.toLowerCase();
  const order = { code: 0, phone: 1, name: 2 } as const;

  const found: GuestMatch[] = [];
  for (const guest of rows) {
    if (guest.duplicate_of) continue;
    let via: GuestMatch['via'] | null = null;
    if (alnum(guest.ticket_code || '').endsWith(key)) via = 'code';
    else if (digitsOnly && guestPhone(guest).replace(/\D/g, '').endsWith(key)) via = 'phone';
    else if (/[a-z]/i.test(text) && guestName(guest).toLowerCase().includes(lower)) via = 'name';
    if (via) found.push({ guest, via });
  }
  found.sort((a, b) =>
    order[a.via] - order[b.via] ||
    Number(Boolean(a.guest.checked_in_at)) - Number(Boolean(b.guest.checked_in_at)) ||
    guestName(a.guest).localeCompare(guestName(b.guest))
  );
  return found.slice(0, limit);
}

export function maskEmail(email: string): string {
  if (!email.includes('@')) return email;
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}${'•'.repeat(Math.max(2, user.length - 2))}@${domain}`;
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/* ---------------- CSV export ---------------- */

function csvCell(value: string): string {
  const v = value ?? '';
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function buildCsv(rows: Submission[], extraKeys: string[], campaignTitle: (pageId: string) => string): string {
  const header = ['Access ID', 'Full Name', 'Email', 'WhatsApp / Phone', 'Campaign', 'Status', 'Checked In At', ...extraKeys, 'Submitted At'];
  const lines = rows.map(s => [
    accessId(s),
    guestName(s),
    guestEmail(s),
    guestPhone(s),
    campaignTitle(s.page_id),
    statusLabel(s.status),
    s.checked_in_at ? new Date(s.checked_in_at).toISOString() : '',
    ...extraKeys.map(k => formatValue(s.form_data?.[k])),
    new Date(s.created_at).toISOString()
  ].map(v => csvCell(String(v))).join(','));
  // BOM so Excel opens UTF-8 names correctly
  return '\uFEFF' + [header.map(csvCell).join(','), ...lines].join('\r\n');
}

export function downloadText(filename: string, content: string, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------------- API ---------------- */

export async function fetchSubmissions(pageIds: string[] | null): Promise<Submission[]> {
  const qs = pageIds && pageIds.length ? `?page_ids=${encodeURIComponent(pageIds.join(','))}` : '';
  const json = await apiJson<{ success: boolean; data: Submission[] }>(`/api/submissions${qs}`);
  return Array.isArray(json?.data) ? json.data : [];
}

export async function patchSubmission(id: string, body: { status?: string; checked_in?: boolean; operator?: string }): Promise<Submission | null> {
  const json = await apiJson<{ success: boolean; data: Submission }>(`/api/submissions/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return json?.data || null;
}

export async function bulkSetStatus(ids: string[], status: GuestStatus): Promise<Submission[]> {
  const json = await apiJson<{ success: boolean; data: Submission[] }>('/api/submissions/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status })
  });
  return json?.data || [];
}

/** Returns the ids the server actually removed (it skips entries outside this account's campaigns). */
export async function bulkDelete(ids: string[]): Promise<string[]> {
  const json = await apiJson<{ success: boolean; ids?: string[] }>('/api/submissions/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
  return Array.isArray(json?.ids) ? json.ids : ids;
}

export type CheckInResult = 'admitted' | 'already' | 'invalid' | 'checked_out';

export async function checkInCode(code: string, pageIds: string[] | null, mode: 'in' | 'out', operator: string): Promise<{ result: CheckInResult; data?: Submission; error?: string }> {
  return apiJson('/api/submissions/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, page_ids: pageIds || undefined, mode, operator })
  });
}

/** Unbiased random int in [0, max) using the platform CSPRNG — raffle fairness matters. */
export function secureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : null;
  if (!cryptoObj?.getRandomValues) return Math.floor(Math.random() * max);
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  do {
    cryptoObj.getRandomValues(buf);
  } while (buf[0] >= limit);
  return buf[0] % max;
}

export function secureSample<T>(items: T[], count: number): T[] {
  const arr = [...items];
  const n = Math.min(count, arr.length);
  for (let i = 0; i < n; i++) {
    const j = i + secureRandomInt(arr.length - i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}
