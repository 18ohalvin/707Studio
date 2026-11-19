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

export type ChoiceRouteOverride =
  | { kind: 'link'; url: string }
  | { kind: 'page'; targetPageId: string }
  | { kind: 'modal'; modalProps: Record<string, any> };

export const DEFAULT_CHOICE_ROUTE_MODAL_PROPS: Record<string, any> = {
  variant: 'message-alert',
  title: 'Before You Continue',
  subtitle: 'Explore our collection to qualify for this event.',
  buttonLayout: 'dual',
  dualOrientation: 'horizontal',
  buttonText: 'Visit Shop',
  buttonVariant: 'black',
  buttonAction: 'link',
  buttonUrl: '',
  buttonOpenInNewTab: true,
  secondaryButtonText: 'Close',
  secondaryButtonVariant: 'ghost',
  secondaryButtonAction: 'submit-close',
  dismissible: true
};

/** Returns true if a MultipleChoice widget has any option with a non-default On Next override. */
export function choiceWidgetHasRoutingRules(widget: { type?: string; props?: Record<string, any> } | undefined | null): boolean {
  if (!widget || widget.type !== 'MultipleChoice') return false;
  const options = Array.isArray(widget.props?.options) ? widget.props!.options : [];
  return options.some(
    (opt: any) => opt && (opt.routeAction === 'page' || opt.routeAction === 'link' || opt.routeAction === 'modal')
  );
}

/**
 * Finds the single MultipleChoice widget on a page that owns conditional Next routing.
 * Only one question per page controls conditional Next routing to avoid conflicting overrides.
 */
export function findRoutingChoiceWidget<T extends { id?: string; type?: string; props?: Record<string, any> }>(
  widgetTree: ReadonlyArray<T> | undefined | null
): T | null {
  if (!Array.isArray(widgetTree)) return null;
  for (const w of widgetTree) {
    if (choiceWidgetHasRoutingRules(w)) return w;
  }
  return null;
}

/**
 * Checks selected options on the page's single routing MultipleChoice widget for an option-level
 * route override (e.g. "No" opens a Shop Catalogue pop-up modal or redirects to an external URL,
 * while "Yes" stays on Default CTA Flow and advances to the registration form).
 */
export function resolveChoiceRouteOverride(
  widgetTree: ReadonlyArray<{ id?: string; type?: string; props?: Record<string, any> }> | undefined | null
): ChoiceRouteOverride | null {
  const routingWidget = findRoutingChoiceWidget(widgetTree);
  if (!routingWidget) return null;

  const selected = Array.isArray(routingWidget.props?.selectedValues) ? routingWidget.props!.selectedValues : [];
  const options = Array.isArray(routingWidget.props?.options) ? routingWidget.props!.options : [];
  let pageOverride: ChoiceRouteOverride | null = null;

  for (const opt of options) {
    if (!opt || (!selected.includes(opt.id) && !opt.selected)) continue;
    if (opt.routeAction === 'modal') {
      return {
        kind: 'modal',
        modalProps: {
          ...DEFAULT_CHOICE_ROUTE_MODAL_PROPS,
          ...(opt.routeModalProps || {})
        }
      };
    }
    if (opt.routeAction === 'link') {
      const url = normalizeExternalUrl(opt.routeUrl);
      if (url) return { kind: 'link', url };
    } else if (opt.routeAction === 'page' && opt.routeTargetPageId && !pageOverride) {
      pageOverride = { kind: 'page', targetPageId: String(opt.routeTargetPageId) };
    }
  }
  return pageOverride;
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

