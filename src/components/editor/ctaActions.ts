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
  { label: 'Submit & Next Page', value: 'submit' },
  { label: 'Download E-Pass', value: 'download-pass' },
  { label: 'External URL', value: 'link' },
  { label: 'Popup Modal', value: 'modal' }
];

/** Saved projects still hold the old 'next_page' value; it now means the merged action. */
export function normalizeCtaAction(value: string | undefined | null): CtaAction | '' {
  if (!value) return '';
  if (value === 'next_page') return 'submit';
  return (CTA_ACTION_OPTIONS.some(o => o.value === value) ? value : '') as CtaAction | '';
}

export function ctaActionLabel(value: string | undefined | null): string {
  const action = normalizeCtaAction(value);
  return CTA_ACTION_OPTIONS.find(o => o.value === action)?.label || 'Submit & Next Page';
}
