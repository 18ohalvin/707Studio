import { pool } from './db.js';
import { readDataFile } from './fileStorage.js';
import { slotDefsFromDesign, availabilityOf, slotKey, type SlotDef, type Availability } from './slotHelpers.js';

/**
 * Live places for a campaign.
 *
 * The limits come from the campaign's design as the public sees it (the
 * published snapshot, or the working copy of a campaign not yet published);
 * how many places are taken comes from the entries themselves, so deleting or
 * declining a guest gives their place back and nothing has to be kept in step
 * by hand.
 *
 * Both are cached for a moment: a campaign page polls for the numbers every
 * few seconds from every guest looking at it, and those requests must cost
 * the database one query a second, not one each.
 */

const DESIGN_TTL_MS = 10_000;
const AVAILABILITY_TTL_MS = 1_000;

const designCache = new Map<string, { at: number; defs: Map<string, SlotDef> }>();
const availabilityCache = new Map<string, { at: number; value: Promise<Record<string, Availability>> }>();

/** A registration changed the numbers: the next poll recounts instead of waiting out the second. */
export function touchAvailability(pageId: string) {
  availabilityCache.delete(pageId);
}

/** Called when a campaign is published or its design otherwise changes, so new limits apply at once. */
export function clearSlotCache(pageId?: string) {
  if (pageId) {
    designCache.delete(pageId);
    availabilityCache.delete(pageId);
  } else {
    designCache.clear();
    availabilityCache.clear();
  }
}

export async function getSlotDefs(pageId: string, useDb: boolean): Promise<Map<string, SlotDef>> {
  const hit = designCache.get(pageId);
  if (hit && Date.now() - hit.at < DESIGN_TTL_MS) return hit.defs;

  let design: any = null;
  if (useDb) {
    const r = await pool.query(
      `SELECT COALESCE(live_snapshot, jsonb_build_object('pages', pages, 'widget_tree', widget_tree)) AS design FROM pages WHERE id = $1`,
      [pageId]
    );
    design = r.rows[0]?.design ?? null;
  } else {
    const row = readDataFile<any[]>('pages.json', []).find(p => p.id === pageId);
    design = row ? (row.live_snapshot || row) : null;
  }
  if (typeof design === 'string') {
    try { design = JSON.parse(design); } catch { design = null; }
  }
  const defs = slotDefsFromDesign(design);
  designCache.set(pageId, { at: Date.now(), defs });
  return defs;
}

/** Places taken per option: every entry except waitlisted and declined ones. */
export async function takenCounts(pageId: string): Promise<Map<string, number>> {
  const r = await pool.query(
    `SELECT ss.widget_id, ss.option_id, COUNT(*)::int AS taken
       FROM submission_slots ss
       JOIN submissions s ON s.id = ss.submission_id
      WHERE ss.page_id = $1 AND s.status NOT IN ('waitlisted', 'declined')
      GROUP BY ss.widget_id, ss.option_id`,
    [pageId]
  );
  return new Map(r.rows.map((row: any) => [slotKey(row.widget_id, row.option_id), Number(row.taken)]));
}

function describe(defs: Map<string, SlotDef>, taken: Map<string, number>): Record<string, Availability> {
  const out: Record<string, Availability> = {};
  for (const [key, def] of defs) {
    // Only options a guest's page has something to say about.
    if (def.capacity === null && !def.closed) continue;
    out[key] = availabilityOf(def, taken.get(key) ?? 0);
  }
  return out;
}

/** The numbers for a campaign's limited / closed options, keyed "widget::option". */
export function getAvailability(pageId: string, useDb: boolean, opts: { fresh?: boolean; fileTaken?: Map<string, number> } = {}): Promise<Record<string, Availability>> {
  const hit = availabilityCache.get(pageId);
  if (!opts.fresh && useDb && hit && Date.now() - hit.at < AVAILABILITY_TTL_MS) return hit.value;

  const value = (async () => {
    const defs = await getSlotDefs(pageId, useDb);
    const taken = useDb ? await takenCounts(pageId) : (opts.fileTaken ?? new Map<string, number>());
    return describe(defs, taken);
  })();
  if (useDb) {
    availabilityCache.set(pageId, { at: Date.now(), value });
    // A failed lookup must not be served again for the rest of the second.
    value.catch(() => availabilityCache.delete(pageId));
  }
  return value;
}
