/**
 * What a CTA button does when tapped — shared by the Button, Hero banner and
 * Ticket Summary setup sidebars so every CTA offers the same choices.
 *
 * "Submit & Next Page" replaces the former separate "Submit Form" and
 * "Next Page" presets. They were the same step from the guest's side: check
 * the fields on this page, keep the answers, move on. A page without fields
 * simply moves on. Splitting them let a designer pick "Next Page" under a form,
 * which skipped validation and dropped the answers.
 */
export type CtaAction = 'submit' | 'download-pass' | 'link' | 'modal';

export const CTA_ACTION_OPTIONS: ReadonlyArray<{ label: string; value: CtaAction }> = [
  { label: 'Submit & Go to Page', value: 'submit' },
  { label: 'Download E-Pass', value: 'download-pass' },
  { label: 'External URL', value: 'link' },
  { label: 'Popup Modal', value: 'modal' }
];

export interface FunnelTargetPageOption {
  id: string;
  label: string;
  index: number;
  isCurrent: boolean;
}

/**
 * Non-ticket pages that a CTA button can navigate to after submitting/validating.
 */
export function getFunnelTargetPages(
  pages: ReadonlyArray<{ id: string; title?: string; page_name?: string; kind?: string }>,
  currentPageId?: string
): FunnelTargetPageOption[] {
  return pages
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => p.kind !== 'ticket')
    .map(({ p, index }, stepIdx) => ({
      id: p.id,
      index,
      label: `Page ${stepIdx + 1}: ${p.title || p.page_name || `Step ${stepIdx + 1}`}`,
      isCurrent: Boolean(currentPageId && p.id === currentPageId)
    }));
}

/**
 * Resolves the destination index in `pages` for a submit/navigation CTA.
 * - Empty `targetPageId` (or `'next'`) advances sequentially (`currentIdx + 1`),
 *   stopping before any `'ticket'` design page.
 * - Specific `targetPageId` jumps directly to that page (e.g. skipping Page 2 to land on Page 3).
 * - Returns `-1` when there is no further non-ticket funnel step (end of flow).
 */
export function resolveTargetPageIndex(
  pages: ReadonlyArray<{ id: string; kind?: string }>,
  currentIdx: number,
  targetPageId?: string | null
): number {
  const target = String(targetPageId || '').trim();
  if (target && target !== 'next') {
    const explicitIdx = pages.findIndex(p => p.id === target && p.kind !== 'ticket');
    if (explicitIdx >= 0) return explicitIdx;
  }
  const next = pages[currentIdx + 1];
  if (next && next.kind !== 'ticket') {
    return currentIdx + 1;
  }
  return -1;
}

/** Saved projects still hold the old 'next_page' value; it now means the merged action. */
export function normalizeCtaAction(value: string | undefined | null): CtaAction | '' {
  if (!value) return '';
  if (value === 'next_page') return 'submit';
  return (CTA_ACTION_OPTIONS.some(o => o.value === value) ? value : '') as CtaAction | '';
}

export function ctaActionLabel(value: string | undefined | null): string {
  const action = normalizeCtaAction(value);
  return CTA_ACTION_OPTIONS.find(o => o.value === action)?.label || 'Submit & Go to Page';
}

/**
 * Normalizes external URLs so that protocol-less inputs like "google.com" or "example.org/path"
 * are safely prepended with "https://", avoiding accidental relative route navigation.
 * Also preserves "http://", "https://", "mailto:", and "tel:".
 */
export function normalizeExternalUrl(rawUrl: string | undefined | null): string {
  const url = String(rawUrl || '').trim();
  if (!url) return '';
  if (/^(https?:|mailto:|tel:|\/\/)/i.test(url)) {
    return url;
  }
  return `https://${url}`;
}

export interface DualButtonPreset {
  id: string;
  label: string;
  primaryLabel: string;
  secondaryLabel: string;
}

export const DUAL_BUTTON_PRESETS: DualButtonPreset[] = [
  { id: 'agree-disagree', label: 'Agree / Disagree', primaryLabel: 'I AGREE', secondaryLabel: 'I DISAGREE' },
  { id: 'yes-no', label: 'Yes / No', primaryLabel: 'YES', secondaryLabel: 'NO' },
  { id: 'accept-decline', label: 'Accept / Decline', primaryLabel: 'ACCEPT', secondaryLabel: 'DECLINE' },
  { id: 'confirm-cancel', label: 'Confirm / Cancel', primaryLabel: 'CONFIRM', secondaryLabel: 'CANCEL' }
];

