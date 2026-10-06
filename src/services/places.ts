/**
 * Places on a Multiple Choice block, as a guest sees them.
 *
 * The numbers come from the server (it counts the entries); this file only
 * decides how an option is worded and whether it can be picked. The wording is
 * deliberately quiet — a fashion house says "Fully reserved", not "SOLD OUT!".
 */
import type { InjectionKey, Ref } from 'vue';

export interface PlacesInfo {
  capacity: number | null;
  taken: number;
  remaining: number | null;
  closed: boolean;
  waitlist: boolean;
}

/** Availability keyed "widget::option", as GET /api/submissions/availability/:pageId returns it. */
export type PlacesMap = Record<string, PlacesInfo>;

export type PlaceState = 'open' | 'few' | 'full' | 'closed';

export interface PlaceStatus {
  state: PlaceState;
  /** The line shown on the option; '' when the option has nothing to say. */
  label: string;
  /** Whether a guest can tick it (a full option with a waitlist can still be ticked). */
  selectable: boolean;
  /** Ticking it means joining the waitlist. */
  waitlist: boolean;
}

export const PLACES_KEY: InjectionKey<Ref<PlacesMap>> = Symbol('places');

export const placeKey = (widgetId: string, optionId: string) => `${widgetId}::${optionId}`;

/** "Few" starts at the last tenth of a limit, and never above 5 places. */
export function isRunningLow(remaining: number, capacity: number): boolean {
  return remaining > 0 && remaining <= Math.min(5, Math.max(1, Math.ceil(capacity / 10)));
}

const plural = (n: number) => `${n} ${n === 1 ? 'place' : 'places'}`;

/**
 * What an option says about its places.
 *
 * - A live page passes the server's numbers (`info`).
 * - The editor has none, so it shows the configured limit as a preview.
 * - No limit and not closed → nothing to say.
 */
export function placeStatus(info: PlacesInfo | undefined, preview: { limited: boolean; capacity: number | null; closed: boolean; waitlist: boolean }): PlaceStatus {
  const closed = info ? info.closed : preview.closed;
  if (closed) return { state: 'closed', label: 'Registration closed', selectable: false, waitlist: false };

  if (info) {
    if (info.capacity === null || info.remaining === null) return { state: 'open', label: '', selectable: true, waitlist: false };
    if (info.remaining <= 0) {
      return info.waitlist
        ? { state: 'full', label: 'Fully reserved · Join the waitlist', selectable: true, waitlist: true }
        : { state: 'full', label: 'Fully reserved', selectable: false, waitlist: false };
    }
    if (isRunningLow(info.remaining, info.capacity)) {
      return { state: 'few', label: info.remaining === 1 ? 'Last place' : `Last ${plural(info.remaining)}`, selectable: true, waitlist: false };
    }
    return { state: 'open', label: `${plural(info.remaining)} remaining`, selectable: true, waitlist: false };
  }

  if (!preview.limited || preview.capacity === null) return { state: 'open', label: '', selectable: true, waitlist: false };
  if (preview.capacity <= 0) {
    return preview.waitlist
      ? { state: 'full', label: 'Fully reserved · Join the waitlist', selectable: true, waitlist: true }
      : { state: 'full', label: 'Fully reserved', selectable: false, waitlist: false };
  }
  return { state: 'open', label: `${plural(preview.capacity)} available`, selectable: true, waitlist: false };
}

/** Parses a limit the way the server does: blank or junk is "no limit". */
export function parseLimit(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

/** The limit the editor configured for one option (its own, else the block's shared one) — only if limiting is on. */
export function configuredLimit(widgetProps: any, opt: any): number | null {
  if (widgetProps?.limitPlaces !== true) return null;
  return parseLimit(opt?.slotsCapacity) ?? parseLimit(widgetProps?.globalSlotsCapacity);
}

export interface PickInput { widget: string; option: string }

/** Every option the guest ticked on any Multiple Choice block, as the server wants them. */
export function collectPicks(pages: Array<{ widget_tree?: any[] }>): PickInput[] {
  const picks: PickInput[] = [];
  for (const page of pages) {
    for (const w of page.widget_tree || []) {
      if (w?.type !== 'MultipleChoice' || !w.id) continue;
      const known = new Set((w.props?.options || []).map((o: any) => o.id));
      for (const id of (w.props?.selectedValues || []) as string[]) {
        if (known.has(id)) picks.push({ widget: String(w.id), option: String(id) });
      }
    }
  }
  return picks;
}

/** Whether any ticked option is full — then the guest is asking for the waitlist. */
export function wantsWaitlist(picks: PickInput[], map: PlacesMap): boolean {
  return picks.some(p => {
    const info = map[placeKey(p.widget, p.option)];
    return Boolean(info && info.capacity !== null && info.remaining !== null && info.remaining <= 0 && info.waitlist && !info.closed);
  });
}

/** Re-read the numbers every few seconds while a guest is on the page. */
export const PLACES_POLL_MS = 5000;

export async function fetchPlaces(pageId: string, fetchImpl: typeof fetch = fetch): Promise<PlacesMap | null> {
  try {
    const res = await fetchImpl(`/api/submissions/availability/${encodeURIComponent(pageId)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json?.availability ?? null;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}
