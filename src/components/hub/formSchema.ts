/**
 * Dynamic Form Schema engine for the Guest Database.
 *
 * Derives column definitions, field semantic types, discrete filter options,
 * and historical-to-current answer resolution directly from the campaign's
 * Editor widget tree (`pages[].widget_tree`).
 */
import type { ActivationPage, FormFieldItem, WidgetItem } from '../../types/editor.ts';
import type { Submission } from './hubUtils.ts';
import { customFieldKeys, formatValue } from './hubUtils.ts';

export type SchemaFieldKind =
  | 'text'
  | 'email'
  | 'phone'
  | 'date'
  | 'select'
  | 'choice'
  | 'file';

export type IdentityRole = 'name' | 'first_name' | 'last_name' | 'email' | 'phone';

export interface FormFieldDef {
  /** Stable identifier linking editor widgets/fields across label renames. */
  key: string;
  widgetId: string;
  fieldId?: string;
  pageIndex: number;
  pageName: string;
  /** Human-facing column header synced from the Editor. */
  label: string;
  kind: SchemaFieldKind;
  /** All known form_data keys this field may have been stored under. */
  answerKeys: string[];
  /** Discrete preset/option labels when kind === 'select' | 'choice'. */
  options?: string[];
  required?: boolean;
  /** Semantic identity role (used to coordinate with core Guest/WhatsApp/Email columns). */
  identityRole?: IdentityRole;
  /** True for the single primary Full Name / Email / WhatsApp column surfaced by default. */
  isPrimaryIdentity?: boolean;
}

export interface DocumentAttachment {
  url: string;
  name: string;
  size?: number;
  type?: string;
}

const PHONE_RE = /whats\s?app|phone|telp|telepon|\bwa\b|mobile|hp\b/i;
const EMAIL_RE = /e-?mail/i;
const DATE_RE = /birth|dob|\bdate\b|lahir|tanggal|dd\s*\/\s*mm\s*\/\s*yyyy/i;
const GENDER_RE = /\bgender\b|jenis\s*kelamin/i;
const FIRST_NAME_RE = /first|given|depan/i;
const LAST_NAME_RE = /last|family|sur\s?name|belakang/i;
const NAME_RE = /name|nama/i;
const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif|bmp|avif|svg)(\?|#|$)/i;

const GENDER_OPTIONS = ['Female', 'Male', 'Custom'];

/** Strip trailing required asterisks and normalize whitespace for resilient matching. */
export function normalizeFieldKey(raw: string): string {
  return String(raw || '')
    .replace(/\*+$/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function cleanDisplayLabel(raw: string | undefined | null, fallback = 'Custom Field'): string {
  const cleaned = String(raw || '').replace(/\*+$/g, '').trim();
  return cleaned || fallback;
}

function detectIdentityRole(label: string, explicitType?: string): IdentityRole | undefined {
  if (explicitType === 'email' || EMAIL_RE.test(label)) return 'email';
  if (explicitType === 'tel' || PHONE_RE.test(label)) return 'phone';
  if (NAME_RE.test(label)) {
    if (FIRST_NAME_RE.test(label)) return 'first_name';
    if (LAST_NAME_RE.test(label)) return 'last_name';
    // Exclude non-person names like "Instagram Handle", "Company Name", "Shoe Name", etc.
    if (/^(full\s*)?name$|^nama(\s*lengkap)?$/i.test(normalizeFieldKey(label))) {
      return 'name';
    }
  }
  return undefined;
}

function detectFieldKind(
  label: string,
  placeholder: string,
  explicitType?: string
): { kind: SchemaFieldKind; options?: string[] } {
  const t = String(explicitType || '').toLowerCase();
  if (t === 'file') return { kind: 'file' };
  if (t === 'email' || EMAIL_RE.test(label)) return { kind: 'email' };
  if (t === 'tel' || PHONE_RE.test(label)) return { kind: 'phone' };
  if (t === 'date' || DATE_RE.test(label) || DATE_RE.test(placeholder)) return { kind: 'date' };
  if (GENDER_RE.test(label) || GENDER_RE.test(placeholder)) {
    return { kind: 'select', options: [...GENDER_OPTIONS] };
  }
  return { kind: 'text' };
}

function uniqueStrings(list: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const v = String(item || '').trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function isLegacyAtmosRow(s: Submission): boolean {
  return s.page_id === 'proj-1792652006255' || String(s.brand_slug || '').toLowerCase() === 'atmos';
}

/**
 * Extracts an ordered list of form fields across all funnel pages in a campaign.
 * Mirrors exact Editor page + widget ordering and skips hidden widgets / PDF ticket pages.
 */
export function extractProjectFormSchema(pages?: ActivationPage[] | null): FormFieldDef[] {
  if (!Array.isArray(pages) || !pages.length) return [];

  const result: FormFieldDef[] = [];
  const usedPrimaryRoles = new Set<'name' | 'email' | 'phone'>();
  let funnelPageIdx = 0;

  const registerIdentity = (role?: IdentityRole): boolean => {
    if (!role || role === 'first_name' || role === 'last_name') return false;
    if (!usedPrimaryRoles.has(role)) {
      usedPrimaryRoles.add(role);
      return true;
    }
    return false;
  };

  for (const page of pages) {
    if (!page || page.kind === 'ticket') continue;
    const pageName = page.page_name || page.title || `Page ${funnelPageIdx + 1}`;
    const widgets: WidgetItem[] = Array.isArray(page.widget_tree) ? page.widget_tree : [];

    for (const w of widgets) {
      if (!w || w.isHidden) continue;

      if (w.type === 'FieldInput') {
        const rawKey = String(w.props?.label || w.props?.placeholder || w.id || '').trim();
        const label = cleanDisplayLabel(w.props?.label || w.props?.placeholder, 'Custom Field');
        const placeholder = String(w.props?.placeholder || '');
        const explicitType = w.props?.countryCode ? 'tel' : w.props?.inputType;
        const { kind, options } = detectFieldKind(label, placeholder, explicitType);
        const role = detectIdentityRole(label, explicitType);
        result.push({
          key: `fi:${w.id}`,
          widgetId: w.id,
          pageIndex: funnelPageIdx,
          pageName,
          label,
          kind,
          options,
          required: Boolean(w.props?.required),
          identityRole: role,
          isPrimaryIdentity: registerIdentity(role),
          answerKeys: uniqueStrings([rawKey, label, w.props?.label, w.props?.placeholder, w.id])
        });
      } else if (w.type === 'RegistrationForm') {
        const fields: FormFieldItem[] = Array.isArray(w.props?.fields) ? w.props.fields : [];
        for (const f of fields) {
          if (!f) continue;
          const rawKey = String(f.name || f.placeholder || f.id || 'field').trim();
          const label = cleanDisplayLabel(f.name || f.placeholder, 'Field');
          const placeholder = String(f.placeholder || '');
          const explicitType = f.countryCode ? 'tel' : f.type;
          const { kind, options } = detectFieldKind(label, placeholder, explicitType);
          const role = detectIdentityRole(label, explicitType);
          result.push({
            key: `rf:${w.id}:${f.id}`,
            widgetId: w.id,
            fieldId: f.id,
            pageIndex: funnelPageIdx,
            pageName,
            label,
            kind,
            options,
            required: f.required !== false,
            identityRole: role,
            isPrimaryIdentity: registerIdentity(role),
            answerKeys: uniqueStrings([rawKey, label, f.name, f.placeholder, f.id, `${w.id}:${f.id}`])
          });
        }
      } else if (w.type === 'DocumentUpload') {
        const rawKey = String(w.props?.fieldName || w.props?.title || 'Uploaded Document').trim();
        const label = cleanDisplayLabel(w.props?.title || w.props?.fieldName, 'Uploaded Document');
        result.push({
          key: `doc:${w.id}`,
          widgetId: w.id,
          pageIndex: funnelPageIdx,
          pageName,
          label,
          kind: 'file',
          required: Boolean(w.props?.required),
          answerKeys: uniqueStrings([rawKey, label, w.props?.title, w.props?.fieldName, w.id, 'Uploaded Document'])
        });
      } else if (w.type === 'MultipleChoice') {
        const rawKey = String(w.props?.question || w.props?.title || w.id).trim();
        const label = cleanDisplayLabel(w.props?.question || w.props?.title, 'Selection');
        const options = uniqueStrings((w.props?.options || []).map((o: any) => o?.label || o?.id));
        result.push({
          key: `mc:${w.id}`,
          widgetId: w.id,
          pageIndex: funnelPageIdx,
          pageName,
          label,
          kind: 'choice',
          options,
          required: Boolean(w.props?.required),
          answerKeys: uniqueStrings([rawKey, label, w.props?.question, w.props?.title, w.id, 'BOOK YOUR SPOT', 'Access Valid For'])
        });
      }
    }

    funnelPageIdx++;
  }

  return result;
}

function isPlaceholderChoice(val: any): boolean {
  const formatted = formatValue(val).trim();
  return !formatted || formatted === '—' || formatted.includes('Single Day Admission');
}

function isEmptyAnswer(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === 'string') return val.trim() === '';
  if (Array.isArray(val)) return val.length === 0;
  return false;
}

/**
 * Resolves the raw answer stored in `submission.form_data` for a schema field:
 *  1. Direct stable ID mapping via `form_data._field_map[field.key]` (survives renames!)
 *  2. Exact key lookup across `field.answerKeys`
 *  3. Case-insensitive / asterisk-trimmed normalized key lookup
 */
export function resolveFieldValue(s: Submission | null | undefined, field: FormFieldDef): any {
  const fd = s?.form_data;
  if (!fd || typeof fd !== 'object') return undefined;

  // 1. Stable ID mapping recorded at submission time
  const mappedKey = fd._field_map?.[field.key];
  if (typeof mappedKey === 'string' && mappedKey && !isEmptyAnswer(fd[mappedKey])) {
    const val = fd[mappedKey];
    if (field.kind !== 'choice' || !isPlaceholderChoice(val)) return val;
  }

  // 2. Exact match along known labels / IDs
  for (const key of field.answerKeys) {
    if (!(key in fd) || isEmptyAnswer(fd[key])) continue;
    const val = fd[key];
    // For MultipleChoice columns, only use 'Access Valid For' if it isn't a synthetic fallback
    if (key === 'Access Valid For' && isPlaceholderChoice(val)) continue;
    return val;
  }

  // 3. Normalized label fallback (handles whitespace / trailing '*' changes in older rows)
  const wantedNorms = new Set(field.answerKeys.map(normalizeFieldKey).filter(Boolean));
  wantedNorms.add(normalizeFieldKey(field.label));
  for (const [k, v] of Object.entries(fd)) {
    if (k.startsWith('_') || k === 'Access Valid For') continue;
    if (isEmptyAnswer(v)) continue;
    if (wantedNorms.has(normalizeFieldKey(k))) {
      return v;
    }
  }

  // Legacy Atmos safeguard only (never bleed onto other brands/campaigns)
  if (s && field.kind === 'choice' && isLegacyAtmosRow(s)) {
    return '5K RUN + RAFFLE ENTRIES';
  }

  return undefined;
}

/** Extracts normalized document/image objects from an uploaded answer. */
export function extractDocuments(val: any): DocumentAttachment[] {
  if (!val) return [];
  const toDoc = (item: any): DocumentAttachment | null => {
    if (!item) return null;
    if (typeof item === 'string') {
      if (item.startsWith('/uploads/') || /^https?:\/\//i.test(item)) {
        return { url: item, name: item.split('/').pop()?.split('?')[0] || 'Attachment' };
      }
      return null;
    }
    if (typeof item === 'object' && item.url) {
      return {
        url: String(item.url),
        name: String(item.name || String(item.url).split('/').pop()?.split('?')[0] || 'Attachment'),
        size: typeof item.size === 'number' ? item.size : undefined,
        type: item.type ? String(item.type) : undefined
      };
    }
    return null;
  };

  if (Array.isArray(val)) {
    return val.map(toDoc).filter((d): d is DocumentAttachment => Boolean(d));
  }
  const single = toDoc(val);
  return single ? [single] : [];
}

export function isImageDocument(doc: DocumentAttachment): boolean {
  if (doc.type && doc.type.startsWith('image/')) return true;
  return IMAGE_EXT_RE.test(doc.url) || IMAGE_EXT_RE.test(doc.name);
}

/** Extracts discrete option tags for MultipleChoice / Select columns. */
export function extractChoiceChips(val: any): string[] {
  if (isEmptyAnswer(val)) return [];
  if (Array.isArray(val)) {
    return val
      .map(v => (v && typeof v === 'object' ? [v.label, v.sublabel].filter(Boolean).join(' · ') : String(v)))
      .map(s => s.trim())
      .filter(s => Boolean(s) && !s.includes('Single Day Admission'));
  }
  const text = formatValue(val).trim();
  return text ? [text] : [];
}

/** Formats a resolved field value cleanly for text display, sorting, searching, and CSV export. */
export function formatSchemaAnswer(s: Submission | null | undefined, field: FormFieldDef): string {
  if (!s) return '';
  const raw = resolveFieldValue(s, field);
  if (isEmptyAnswer(raw)) return '';

  if (field.kind === 'file') {
    const docs = extractDocuments(raw);
    if (docs.length) {
      return docs.map(d => `${d.name} (${d.url})`).join(', ');
    }
  }
  if (field.kind === 'choice') {
    const chips = extractChoiceChips(raw);
    return chips.join(', ');
  }
  return formatValue(raw).trim();
}

/**
 * Returns form_data keys present in historical submissions that are NOT covered by
 * the current Editor schema, so renamed/deleted legacy fields are still preserved.
 */
export function archivedAnswerKeys(rows: Submission[], schemaFields: FormFieldDef[]): string[] {
  const claimedExact = new Set<string>();
  const claimedNorm = new Set<string>();

  for (const f of schemaFields) {
    claimedExact.add(f.label);
    claimedNorm.add(normalizeFieldKey(f.label));
    for (const ak of f.answerKeys) {
      claimedExact.add(ak);
      claimedNorm.add(normalizeFieldKey(ak));
    }
  }

  for (const s of rows) {
    const fmap = s.form_data?._field_map;
    if (fmap && typeof fmap === 'object') {
      for (const field of schemaFields) {
        const mapped = fmap[field.key];
        if (typeof mapped === 'string' && mapped) {
          claimedExact.add(mapped);
          claimedNorm.add(normalizeFieldKey(mapped));
        }
      }
    }
  }

  return customFieldKeys(rows).filter(k => {
    if (claimedExact.has(k) || claimedNorm.has(normalizeFieldKey(k))) return false;
    return true;
  });
}

/** Collects distinct categorical options for a `select` / `choice` field (schema presets + observed values). */
export function fieldFilterOptions(field: FormFieldDef, rows: Submission[]): string[] {
  const seen = new Map<string, string>();
  const add = (label: string) => {
    const trimmed = String(label || '').trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  };

  for (const opt of field.options || []) add(opt);
  for (const s of rows) {
    const raw = resolveFieldValue(s, field);
    if (isEmptyAnswer(raw)) continue;
    for (const chip of extractChoiceChips(raw)) add(chip);
  }
  return [...seen.values()];
}
