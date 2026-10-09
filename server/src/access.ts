import { pool, getDbStatus } from './db.js';
import { readDataFile } from './fileStorage.js';
import { SessionClaims, isSuperAdminClaims } from './auth.js';

/**
 * Which projects an account may see — the server-side twin of `userProjects`
 * in the editor store. The client filter only hides; this one is what actually
 * keeps one brand's projects and guest lists away from another brand's team.
 */

const normalizeBrand = (s: string) => String(s || '').toLowerCase().replace(/_/g, '-').trim();

export function canAccessProject(claims: SessionClaims, project: any): boolean {
  if (!project) return false;
  if (isSuperAdminClaims(claims)) return true;

  // Gate security sees the one campaign they were assigned, whoever owns it or whatever brand it is.
  if (claims.role === 'gate') return Boolean(claims.project) && String(project.id) === claims.project;

  const ownerId = String(project.owner_id || '');
  const ownerEmail = String(project.owner_email || '').toLowerCase().trim();
  const email = claims.email.toLowerCase().trim();

  if (ownerId && ownerId === claims.sub) return true;
  if (ownerEmail && email && ownerEmail === email) return true;

  // Everyone assigned to a brand shares its projects: an owner is who made
  // it, not the only person who may see it. Exact match, so "atmos" never
  // reaches a brand that merely contains the word.
  const brands = claims.brands.map(normalizeBrand);
  if (brands.includes('all')) return true;
  const slug = normalizeBrand(project.brand_slug);
  if (!slug) return false;
  return brands.includes(slug);
}

/**
 * Approved projects are published automatically, so both count as live.
 * Anything else is visible only to its owner and the superadmin.
 */
export const LIVE_STATUSES = ['approved', 'published'];

export function isLiveProject(project: any): boolean {
  return LIVE_STATUSES.includes(String(project?.status || '')) || Number(project?.live_version || 0) > 0;
}

/** Who may open a project's public URL: everyone once live, otherwise only those who may edit it. */
export function canViewPublicPage(claims: SessionClaims | null, project: any): boolean {
  if (isLiveProject(project)) return true;
  return Boolean(claims && canAccessProject(claims, project));
}

/** Every id a submission may carry for this project: the project id and each funnel page id. */
export function projectPageIds(project: any): string[] {
  let pages = project?.pages;
  if (typeof pages === 'string') {
    try { pages = JSON.parse(pages); } catch { pages = []; }
  }
  const ids = [project?.id, ...(Array.isArray(pages) ? pages.map((p: any) => p?.id) : [])];
  return ids.filter(Boolean).map(String);
}

/**
 * strict: the caller is deciding about guest data and must not be handed
 * stale or empty results. When the database is in use and a query fails, the
 * error is thrown (the route answers "try again") instead of quietly reading
 * pages.json, which would make an existing campaign look missing.
 */
async function loadAllProjects(strict = false): Promise<any[]> {
  if (getDbStatus().isConnected || strict) {
    try {
      // status / live_version are needed by callers that decide whether a
      // campaign is public (findProjectForPageId → canViewPublicPage).
      const result = await pool.query('SELECT id, brand_slug, owner_id, owner_email, pages, status, live_version FROM pages');
      return result.rows;
    } catch (err: any) {
      console.error('[Access] Could not read projects:', err.message);
      if (strict) throw err;
    }
  }
  return readDataFile<any[]>('pages.json', []);
}

export async function findProject(id: string): Promise<any | null> {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM pages WHERE id = $1 LIMIT 1', [id]);
      if (result.rows[0]) return result.rows[0];
      return null;
    } catch (err: any) {
      console.error('[Access] Could not read project:', err.message);
    }
  }
  return readDataFile<any[]>('pages.json', []).find(p => p.id === id) || null;
}

/**
 * Page ids whose submissions this account may read or change.
 * null means unrestricted (superadmin).
 */
export async function accessiblePageIds(claims: SessionClaims, opts: { strict?: boolean } = {}): Promise<Set<string> | null> {
  if (isSuperAdminClaims(claims)) return null;
  const ids = new Set<string>();
  (await loadAllProjects(opts.strict))
    .filter(p => canAccessProject(claims, p))
    .forEach(p => projectPageIds(p).forEach(id => ids.add(id)));
  return ids;
}

/** Resolves a submission's page id (project id or funnel page id) to its project. */
export async function findProjectForPageId(pageId: string): Promise<any | null> {
  if (!pageId) return null;
  const direct = await findProject(pageId);
  if (direct) return direct;
  return (await loadAllProjects()).find(p => projectPageIds(p).includes(pageId)) || null;
}

/**
 * The campaign a guest's entry belongs to, for the public endpoint that runs
 * on every registration. It reads only the few columns that decide access (a
 * project row can carry hundreds of KB of design) and finds a funnel page id
 * with an index-friendly JSON containment query rather than loading every
 * project. Throws on a database error so the guest is told to retry — a
 * lookup that quietly returned "not found" would reject a real campaign.
 */
export async function findProjectForEntry(pageId: string, useDb: boolean): Promise<any | null> {
  if (!pageId) return null;
  if (useDb) {
    const columns = 'id, brand_slug, owner_id, owner_email, status, live_version';
    const direct = await pool.query(`SELECT ${columns} FROM pages WHERE id = $1 LIMIT 1`, [pageId]);
    if (direct.rows[0]) return direct.rows[0];
    const viaFunnelPage = await pool.query(`SELECT ${columns} FROM pages WHERE pages @> $1::jsonb LIMIT 1`, [JSON.stringify([{ id: pageId }])]);
    return viaFunnelPage.rows[0] || null;
  }
  const all = readDataFile<any[]>('pages.json', []);
  return all.find(p => p.id === pageId) || all.find(p => projectPageIds(p).includes(pageId)) || null;
}
