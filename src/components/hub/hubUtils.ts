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
  checked_out_at?: string | null;
  party_size?: number;
  queue_number?: number;
  queue_status?: 'waiting' | 'called' | 'admitted' | 'completed' | 'expired';
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
    case 'confirmed': return 'bg-moss-50 text-moss-800 border-moss-300';
    case 'waitlisted': return 'bg-bronze-50 text-bronze-800 border-bronze-300';
    case 'winner': return 'bg-black text-white border-black';
    case 'declined': return 'bg-oxblood-50 text-oxblood-700 border-oxblood-200';
    default: return 'bg-neutral-100 text-neutral-600 border-neutral-300';
  }
}

export function statusDotClass(status?: string): string {
  switch (normalizeStatus(status)) {
    case 'confirmed': return 'bg-moss-500';
    case 'waitlisted': return 'bg-bronze-500';
    case 'winner': return 'bg-white';
    case 'declined': return 'bg-oxblood-600';
    default: return 'bg-neutral-400';
  }
}

const SYSTEM_KEYS = new Set(['fullName', 'email', 'submittedAt', 'name']);
const PHONE_RE = /whats\s?app|phone|telp|telepon|\bwa\b|mobile|hp\b/i;
const NAME_RE = /name|nama/i;
const EMAIL_RE = /e-?mail/i;

const FIRST_NAME_RE = /first|given|depan/i;
const LAST_NAME_RE = /last|family|sur\s?name|belakang/i;

/**
 * Entries made while only the surname was kept as the name: when the answers hold both a
 * First Name and a Last Name field, the full name is rebuilt from them.
 */
function nameFromParts(fd: Record<string, any>): string {
  let first = '';
  let last = '';
  for (const [key, value] of Object.entries(fd)) {
    const text = typeof value === 'string' ? value.trim() : '';
    if (!text || !NAME_RE.test(key)) continue;
    if (!first && FIRST_NAME_RE.test(key)) first = text;
    else if (!last && LAST_NAME_RE.test(key)) last = text;
  }
  return first && last ? `${first} ${last}` : '';
}

export function guestName(s: Submission): string {
  const fd = s.form_data || {};
  const stored = String(fd.fullName || fd.name || '').trim();
  const rebuilt = nameFromParts(fd);
  if (rebuilt && (!stored || stored.toLowerCase() !== rebuilt.toLowerCase())) return rebuilt;
  return stored || 'Guest Participant';
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

export type CheckInResult = 'admitted' | 'already' | 'invalid' | 'checked_out' | 'capacity_exceeded';

export function isGuestInside(g: Submission): boolean {
  if (!g.checked_in_at) return false;
  if (!g.checked_out_at) return true;
  return new Date(g.checked_out_at).getTime() < new Date(g.checked_in_at).getTime();
}

export function totalInsideGuests(rows: Submission[]): number {
  return rows.reduce((total, g) => {
    if (isGuestInside(g) && !g.duplicate_of) {
      return total + (Number(g.party_size) || 1);
    }
    return total;
  }, 0);
}

export async function checkInCode(code: string, pageIds: string[] | null, mode: 'in' | 'out', operator: string, partySize?: number): Promise<{ result: CheckInResult; data?: Submission; error?: string }> {
  return apiJson('/api/submissions/check-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, page_ids: pageIds || undefined, mode, operator, party_size: partySize })
  });
}

export interface WhatsAppDeviceInfo {
  platform?: string;
  battery?: number;
  pushName?: string;
}

/** Normalizes any international or Indonesian phone format to strict E.164 digits without leading zeros */
export function normalizeWhatsAppNumber(raw: string, defaultCountry = '62'): string {
  if (!raw) return '';
  let digits = String(raw).replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  digits = digits.replace(/\D/g, '');
  if (!digits) return '';

  // Local Indonesian format e.g. 0812... -> 62812...
  if (digits.startsWith('0')) {
    digits = defaultCountry + digits.slice(1);
  }
  // Missing country code e.g. 8123456789 (9 to 13 digits) -> 628123456789
  else if (digits.startsWith('8') && digits.length >= 9 && digits.length <= 13) {
    digits = defaultCountry + digits;
  }
  return digits;
}

/** Formats clean digits into an international display string e.g. +62 812-3456-7890 */
export function formatWhatsAppDisplay(raw: string): string {
  const norm = normalizeWhatsAppNumber(raw);
  if (!norm) return '';
  if (norm.startsWith('62') && norm.length >= 10) {
    const rest = norm.slice(2);
    const p1 = rest.slice(0, 3);
    const p2 = rest.slice(3, 7);
    const p3 = rest.slice(7);
    return `+62 ${p1}-${p2}${p3 ? `-${p3}` : ''}`;
  }
  return `+${norm}`;
}

export interface WhatsAppConnection {
  connected: boolean;
  phoneNumber?: string;
  formattedNumber?: string;
  sessionName?: string;
  provider?: 'direct_sender' | 'fonnte' | 'wablas' | 'custom_gateway' | 'linked_device' | 'pairing_code';
  gatewayUrl?: string;
  apiToken?: string;
  linkedAt?: string;
  deviceInfo?: WhatsAppDeviceInfo;
}

export interface WhatsAppLogEntry {
  id: string;
  pageId?: string;
  phone: string;
  text: string;
  event: string;
  status: 'sent' | 'delivered' | 'failed';
  error?: string;
  timestamp: string;
}

export interface WaLinkSessionData {
  qrString: string;
  pairingCode: string;
  cleanPhone?: string;
  formattedDisplay?: string;
  directLink?: string;
  expiresInSeconds: number;
  generatedAt: string;
}

export interface QueueSettingsData {
  enabled: boolean;
  waEnabled: boolean;
  emailNotificationEnabled?: boolean;
  activeWaStage?: 'ready' | 'welcome' | 'approaching' | 'expired';
  maxCapacity: number;
  notifyThreshold: number;
  skippedTolerance: number;
  currentCalledNumber: number;
  waConnection?: WhatsAppConnection;
  waTemplates: Record<string, string>;
  stages?: any[];
}

export async function fetchQueueSettings(pageId: string): Promise<QueueSettingsData | null> {
  const json = await apiJson<{ success: boolean; data: QueueSettingsData }>(`/api/submissions/queue-settings?page_id=${encodeURIComponent(pageId)}`);
  return json?.data || null;
}

/** Public (no sign-in): the number currently being served, for guests' live passes. */
export async function fetchPublicQueueNow(pageId: string): Promise<{ currentCalledNumber: number; skippedTolerance: number } | null> {
  try {
    const res = await fetch(`/api/submissions/queue-now/${encodeURIComponent(pageId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function saveQueueSettingsApi(pageId: string, settings: Partial<QueueSettingsData>): Promise<QueueSettingsData | null> {
  const json = await apiJson<{ success: boolean; data: QueueSettingsData }>('/api/submissions/queue-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_id: pageId, settings })
  });
  return json?.data || null;
}

export async function callNextQueue(pageId: string, calledNumber: number): Promise<{ calledNumber: number; approachingCount: number; expiredCount: number } | null> {
  const json = await apiJson<{ success: boolean; data: any }>('/api/submissions/call-next', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_id: pageId, called_number: calledNumber })
  });
  return json?.data || null;
}

export async function callBatchQueue(pageId: string, spots: number): Promise<{ calledGuests: any[]; calledCount: number; newCalledNumber: number; approachingCount: number; expiredCount: number } | null> {
  const json = await apiJson<{ success: boolean; data: any }>('/api/submissions/call-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_id: pageId, spots })
  });
  return json?.data || null;
}

export async function fetchWaLinkSession(pageId: string, phone?: string): Promise<WaLinkSessionData | null> {
  const q = new URLSearchParams({ page_id: pageId });
  if (phone) q.set('phone', phone);
  const json = await apiJson<{ success: boolean; data: WaLinkSessionData }>(`/api/submissions/wa-link-session?${q.toString()}`);
  return json?.data || null;
}

export interface WaDeviceStatus {
  pageId?: string;
  status: 'disconnected' | 'connecting' | 'qr_ready' | 'connected' | 'rejected_mismatch' | 'saved_offline';
  connected: boolean;
  phone?: string | null;
  qr?: string | null;
  pairingCode?: string | null;
  error?: string | null;
  lastUpdated?: string;
}

export async function fetchWaStatusApi(pageId: string): Promise<WaDeviceStatus> {
  const json = await apiJson<{ success: boolean } & WaDeviceStatus>(`/api/whatsapp/${encodeURIComponent(pageId)}/status`);
  return {
    status: json?.status || 'disconnected',
    connected: Boolean(json?.connected),
    phone: json?.phone || null,
    qr: json?.qr || null,
    pairingCode: json?.pairingCode || null,
    error: json?.error || null,
    lastUpdated: json?.lastUpdated
  };
}

export async function connectWaDeviceApi(pageId: string, expectedPhone?: string): Promise<WaDeviceStatus> {
  const json = await apiJson<{ success: boolean } & WaDeviceStatus>(`/api/whatsapp/${encodeURIComponent(pageId)}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expectedPhone })
  });
  return {
    status: json?.status || 'connecting',
    connected: Boolean(json?.connected),
    phone: json?.phone || null,
    qr: json?.qr || null,
    pairingCode: json?.pairingCode || null,
    error: json?.error || null,
    lastUpdated: json?.lastUpdated
  };
}

export async function disconnectWaDeviceApi(pageId: string): Promise<boolean> {
  const json = await apiJson<{ success: boolean }>(`/api/whatsapp/${encodeURIComponent(pageId)}/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return Boolean(json?.success);
}

export async function confirmWaLinkApi(
  pageId: string,
  payload: { phoneNumber: string; sessionName?: string; provider?: string; gatewayUrl?: string; apiToken?: string }
): Promise<WhatsAppConnection | null> {
  const json = await apiJson<{ success: boolean; data: WhatsAppConnection }>('/api/submissions/wa-confirm-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_id: pageId, ...payload })
  });
  return json?.data || null;
}

export async function unlinkWaApi(pageId: string): Promise<boolean> {
  return disconnectWaDeviceApi(pageId);
}

export interface WaTestResult {
  success: boolean;
  mode?: 'gateway' | 'direct';
  waUrl?: string;
  formattedPhone?: string;
  message?: string;
  error?: string;
}

export async function sendWaTestMessageApi(pageId: string, phone: string, text?: string): Promise<WaTestResult> {
  const json = await apiJson<WaTestResult>('/api/submissions/wa-test-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_id: pageId, phone, text })
  });
  return json;
}

export async function fetchWaLogs(pageId: string): Promise<WhatsAppLogEntry[]> {
  const json = await apiJson<{ success: boolean; data: WhatsAppLogEntry[] }>(`/api/submissions/wa-logs?page_id=${encodeURIComponent(pageId)}`);
  return json?.data || [];
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
