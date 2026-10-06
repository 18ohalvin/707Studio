/**
 * Places ("slots") on a Multiple Choice block: reading the limits out of a
 * campaign's design, and understanding what a guest picked. Pure, no imports,
 * so it is unit-tested from the frontend test run.
 *
 * A limit is something the editor switches on ("Limit places") and fills in.
 * Older blocks carry a leftover default of 25 that was only ever a label, so a
 * number alone is never treated as a limit.
 */

export interface SlotDef {
  widget: string;
  option: string;
  label: string;
  /** null = no limit. */
  capacity: number | null;
  /** The editor closed this option by hand. */
  closed: boolean;
  /** When full, guests may join a waitlist instead of being turned away. */
  waitlist: boolean;
}

export interface SlotPick {
  widget: string;
  option: string;
}

export const slotKey = (widget: string, option: string) => `${widget}::${option}`;

/** "500", 500, " 40 " → the number; blank, negative or junk → null. */
export function parseCapacity(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

/** Every option of every Multiple Choice block in a design, with the limit that applies to it. */
export function slotDefsFromDesign(design: any): Map<string, SlotDef> {
  const defs = new Map<string, SlotDef>();
  const widgets: any[] = [];
  const pages = Array.isArray(design?.pages) ? design.pages : [];
  if (pages.length) {
    for (const page of pages) if (Array.isArray(page?.widget_tree)) widgets.push(...page.widget_tree);
  } else if (Array.isArray(design?.widget_tree)) {
    widgets.push(...design.widget_tree);
  }

  for (const w of widgets) {
    if (w?.type !== 'MultipleChoice' || !w.id) continue;
    const limited = w.props?.limitPlaces === true;
    const shared = parseCapacity(w.props?.globalSlotsCapacity);
    const options = Array.isArray(w.props?.options) ? w.props.options : [];
    for (const opt of options) {
      if (!opt?.id) continue;
      const own = parseCapacity(opt.slotsCapacity);
      defs.set(slotKey(String(w.id), String(opt.id)), {
        widget: String(w.id),
        option: String(opt.id),
        label: String(opt.label ?? ''),
        capacity: limited ? (own ?? shared) : null,
        closed: opt.disabled === true,
        waitlist: w.props?.waitlistEnabled !== false
      });
    }
  }
  return defs;
}

/** What the guest's page says they picked: valid ids only, no repeats, bounded. */
export function normalizePicks(raw: unknown): SlotPick[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const picks: SlotPick[] = [];
  for (const item of raw.slice(0, 50)) {
    const widget = String((item as any)?.widget ?? '').trim();
    const option = String((item as any)?.option ?? '').trim();
    if (!/^[\w.-]{1,100}$/.test(widget) || !/^[\w.-]{1,100}$/.test(option)) continue;
    const key = slotKey(widget, option);
    if (seen.has(key)) continue;
    seen.add(key);
    picks.push({ widget, option });
  }
  return picks;
}

export interface Availability {
  capacity: number | null;
  taken: number;
  /** null when there is no limit. */
  remaining: number | null;
  closed: boolean;
  waitlist: boolean;
}

/** The numbers a guest's page needs for one option. */
export function availabilityOf(def: SlotDef, taken: number): Availability {
  return {
    capacity: def.capacity,
    taken,
    remaining: def.capacity === null ? null : Math.max(0, def.capacity - taken),
    closed: def.closed,
    waitlist: def.waitlist
  };
}

/**
 * Re-matches a stored answer (option labels, as printed on the pass) to the
 * options of the design, for entries made before picks were recorded by id.
 * A label that fits more than one option is ambiguous and skipped.
 */
export function picksFromLabels(labels: unknown, defs: Iterable<SlotDef>): SlotPick[] {
  if (!Array.isArray(labels)) return [];
  const byLabel = new Map<string, SlotDef[]>();
  for (const def of defs) {
    const key = def.label.trim().toLowerCase();
    if (!key) continue;
    byLabel.set(key, [...(byLabel.get(key) || []), def]);
  }
  const picks: SlotPick[] = [];
  for (const item of labels) {
    const label = String(typeof item === 'object' && item ? (item as any).label ?? '' : item ?? '').trim().toLowerCase();
    const matches = byLabel.get(label);
    if (matches && matches.length === 1) picks.push({ widget: matches[0].widget, option: matches[0].option });
  }
  return normalizePicks(picks);
}

/**
 * Whether a registration may take the places it asks for.
 *
 * Every limited option the guest picked must have a place left. If one does
 * not, the registration goes on the waitlist when the guest asked for that
 * and every full option allows it; otherwise it is turned away. A guest who
 * asked for the waitlist after a place has opened up simply gets the place.
 */
export function decidePlaces(
  limited: SlotDef[],
  takenOf: (def: SlotDef) => number,
  wantsWaitlist: boolean
): { ok: true; waitlisted: boolean; full: SlotDef[] } | { ok: false; full: SlotDef[] } {
  const full = limited.filter(def => def.capacity !== null && takenOf(def) >= def.capacity);
  if (full.length === 0) return { ok: true, waitlisted: false, full };
  if (wantsWaitlist && full.every(def => def.waitlist)) return { ok: true, waitlisted: true, full };
  return { ok: false, full };
}
