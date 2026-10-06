import crypto from 'crypto';
import { pool, getDbStatus } from './db.js';
import { readDataFile, writeDataFile } from './fileStorage.js';
import type { SessionClaims } from './auth.js';

/**
 * Working copy vs live copy, and the project's history.
 *
 * The editor saves into the working copy continuously. The public URL serves
 * `live_snapshot`, which only changes when the superadmin publishes. Every
 * submit / publish / discard / restore is recorded in project_history with the
 * content at that moment, so a project has a numbered build history.
 */

export type HistoryKind = 'submitted' | 'published' | 'declined' | 'discarded' | 'restored';

export interface ProjectContent {
  title: string;
  slug: string;
  description: string;
  widget_tree: any[];
  pages: any[];
  page_settings: Record<string, any>;
}

const parse = (v: any, fallback: any) => {
  if (typeof v !== 'string') return v ?? fallback;
  try { return JSON.parse(v); } catch { return fallback; }
};

/** A pages row (DB or file) in the shape the client uses, including versioning fields. */
export function rowToProject(r: any) {
  const liveSnapshot = parse(r.live_snapshot, null);
  const project = {
    id: r.id,
    brand_id: r.brand_id || '1',
    brand_slug: r.brand_slug || 'atmos',
    title: r.title,
    slug: r.slug,
    description: r.description || '',
    status: r.status || 'draft',
    current_version: r.current_version || 1,
    widget_tree: parse(r.widget_tree, []),
    pages: parse(r.pages, []),
    page_settings: parse(r.page_settings, {}),
    owner_id: r.owner_id || '',
    owner_email: r.owner_email || '',
    created_by: r.created_by || '',
    created_at: r.created_at,
    updated_at: r.updated_at,
    live_version: Number(r.live_version || 0),
    published_at: r.published_at || null,
    published_by: r.published_by || '',
    pending_update_at: r.pending_update_at || null,
    live_snapshot: liveSnapshot as ProjectContent | null,
    has_unpublished_changes: false
  };
  // Both sides normalised the same way (a NULL description in a backfilled
  // snapshot is the same as '' in the working copy).
  project.has_unpublished_changes = Boolean(liveSnapshot) && canonical(contentOf(project)) !== canonical(contentOf(liveSnapshot));
  return project;
}

/** What the client receives: the live snapshot itself is server-side only. */
export function forClient(project: ReturnType<typeof rowToProject>) {
  const { live_snapshot, ...rest } = project;
  return rest;
}

export function contentOf(p: any): ProjectContent {
  return {
    title: p.title || '',
    slug: p.slug || '',
    description: p.description || '',
    widget_tree: parse(p.widget_tree, []),
    pages: parse(p.pages, []),
    page_settings: parse(p.page_settings, {})
  };
}

/** Key-order-independent JSON, so "changed?" means the content changed, not its serialisation. */
export function canonical(value: any): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().filter(k => value[k] !== undefined).map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** The version visitors get: live snapshot over the working row. */
export function liveView(project: ReturnType<typeof rowToProject>) {
  if (!project.live_snapshot) return project;
  return { ...project, ...project.live_snapshot };
}

export function isLive(project: { live_version?: number; status?: string; live_snapshot?: any }): boolean {
  return Boolean(project.live_snapshot) || ['approved', 'published'].includes(String(project.status));
}

function actorName(claims: SessionClaims, fallbackName?: string): string {
  return (fallbackName || claims.email || claims.sub).slice(0, 150);
}

/* ---------------- storage ---------------- */

export async function loadProjectRow(id: string): Promise<any | null> {
  if (getDbStatus().isConnected) {
    const result = await pool.query('SELECT * FROM pages WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] || null;
  }
  return readDataFile<any[]>('pages.json', []).find(p => p.id === id) || null;
}

async function updateProjectRow(id: string, fields: Record<string, any>): Promise<any | null> {
  if (getDbStatus().isConnected) {
    const keys = Object.keys(fields);
    const jsonCols = new Set(['live_snapshot', 'widget_tree', 'pages', 'page_settings']);
    const values = keys.map(k => (jsonCols.has(k) && fields[k] !== null ? JSON.stringify(fields[k]) : fields[k]));
    const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await pool.query(`UPDATE pages SET ${set} WHERE id = $${keys.length + 1} RETURNING *`, [...values, id]);
    return result.rows[0] || null;
  }
  const all = readDataFile<any[]>('pages.json', []);
  const idx = all.findIndex(p => p.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...fields };
  writeDataFile('pages.json', all);
  return all[idx];
}

async function nextRevision(pageId: string): Promise<number> {
  if (getDbStatus().isConnected) {
    const r = await pool.query('SELECT COALESCE(MAX(revision), 0) + 1 AS next FROM project_history WHERE page_id = $1', [pageId]);
    return Number(r.rows[0].next);
  }
  const rows = readDataFile<any[]>('project_history.json', []).filter(h => h.page_id === pageId);
  return rows.reduce((m, h) => Math.max(m, h.revision), 0) + 1;
}

export async function recordHistory(pageId: string, kind: HistoryKind, content: ProjectContent, claims: SessionClaims, opts: { liveVersion?: number; note?: string; actor?: string } = {}) {
  const entry = {
    id: `hist-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    page_id: pageId,
    revision: await nextRevision(pageId),
    kind,
    live_version: opts.liveVersion ?? null,
    snapshot: content,
    note: (opts.note || '').slice(0, 500),
    created_by: actorName(claims, opts.actor),
    created_at: new Date().toISOString()
  };
  if (getDbStatus().isConnected) {
    await pool.query(
      `INSERT INTO project_history (id, page_id, revision, kind, live_version, snapshot, note, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [entry.id, entry.page_id, entry.revision, entry.kind, entry.live_version, JSON.stringify(entry.snapshot), entry.note, entry.created_by, entry.created_at]
    );
  } else {
    const all = readDataFile<any[]>('project_history.json', []);
    all.unshift(entry);
    writeDataFile('project_history.json', all);
  }
  return entry;
}

/** History entries without their content (the list view); newest first. */
export async function listHistory(pageId: string) {
  if (getDbStatus().isConnected) {
    const r = await pool.query(
      'SELECT id, page_id, revision, kind, live_version, note, created_by, created_at FROM project_history WHERE page_id = $1 ORDER BY revision DESC LIMIT 200',
      [pageId]
    );
    return r.rows;
  }
  return readDataFile<any[]>('project_history.json', [])
    .filter(h => h.page_id === pageId)
    .sort((a, b) => b.revision - a.revision)
    .map(({ snapshot, ...meta }) => meta);
}

export async function getHistoryEntry(pageId: string, entryId: string) {
  if (getDbStatus().isConnected) {
    const r = await pool.query('SELECT * FROM project_history WHERE page_id = $1 AND id = $2', [pageId, entryId]);
    return r.rows[0] ? { ...r.rows[0], snapshot: parse(r.rows[0].snapshot, null) } : null;
  }
  return readDataFile<any[]>('project_history.json', []).find(h => h.page_id === pageId && h.id === entryId) || null;
}

/** Recent history across the given projects, for notifications. */
export async function recentHistory(pageIds: string[] | null, kinds: HistoryKind[], limit = 40) {
  if (getDbStatus().isConnected) {
    const params: any[] = [kinds];
    let where = 'kind = ANY($1)';
    if (pageIds) {
      params.push(pageIds);
      where += ` AND page_id = ANY($${params.length})`;
    }
    const r = await pool.query(
      `SELECT id, page_id, revision, kind, live_version, note, created_by, created_at FROM project_history WHERE ${where} ORDER BY created_at DESC LIMIT ${limit}`,
      params
    );
    return r.rows;
  }
  return readDataFile<any[]>('project_history.json', [])
    .filter(h => kinds.includes(h.kind) && (!pageIds || pageIds.includes(h.page_id)))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
    .slice(0, limit)
    .map(({ snapshot, ...meta }) => meta);
}

/* ---------------- transitions ---------------- */

/** Owner asks for review: first publication, or an update to a live campaign. */
export async function submitForReview(id: string, claims: SessionClaims, note?: string, actor?: string) {
  const row = await loadProjectRow(id);
  if (!row) return null;
  const project = rowToProject(row);
  const now = new Date().toISOString();
  const fields = isLive(project)
    ? { pending_update_at: now }
    : { status: 'pending_review', pending_update_at: now };
  const updated = await updateProjectRow(id, fields);
  await recordHistory(id, 'submitted', contentOf(project), claims, { liveVersion: project.live_version, note, actor });
  return rowToProject(updated);
}

/** Superadmin publishes the working copy: it becomes the new live version. */
export async function publishProject(id: string, claims: SessionClaims, note?: string, actor?: string) {
  const row = await loadProjectRow(id);
  if (!row) return null;
  const project = rowToProject(row);
  const content = contentOf(project);
  const liveVersion = (project.live_version || 0) + 1;
  const now = new Date().toISOString();
  const updated = await updateProjectRow(id, {
    status: 'approved',
    live_snapshot: content,
    live_version: liveVersion,
    published_at: now,
    published_by: actorName(claims, actor),
    pending_update_at: null
  });
  await recordHistory(id, 'published', content, claims, { liveVersion, note, actor });
  return rowToProject(updated);
}

/**
 * Superadmin sends a submission back. A never-published project returns to
 * draft; a live campaign stays live and its pending update is closed.
 */
export async function declineProject(id: string, claims: SessionClaims, note?: string, actor?: string) {
  const row = await loadProjectRow(id);
  if (!row) return null;
  const project = rowToProject(row);
  const fields: Record<string, any> = { pending_update_at: null };
  if (!project.live_snapshot) fields.status = 'draft';
  const updated = await updateProjectRow(id, fields);
  await recordHistory(id, 'declined', contentOf(project), claims, { note, actor });
  return rowToProject(updated);
}

/** Throw away unpublished edits: the working copy goes back to the live version. */
export async function discardChanges(id: string, claims: SessionClaims, actor?: string) {
  const row = await loadProjectRow(id);
  if (!row) return null;
  const project = rowToProject(row);
  if (!project.live_snapshot) return project;
  // Keep what is being thrown away in history, so a discard can be undone.
  await recordHistory(id, 'discarded', contentOf(project), claims, { actor });
  const live = project.live_snapshot;
  const updated = await updateProjectRow(id, {
    title: live.title,
    slug: live.slug,
    description: live.description,
    widget_tree: live.widget_tree,
    pages: live.pages,
    page_settings: live.page_settings,
    pending_update_at: null,
    updated_at: new Date().toISOString()
  });
  return rowToProject(updated);
}

/** Load an older build into the working copy. Nothing goes live until it is published. */
export async function restoreFromHistory(id: string, entryId: string, claims: SessionClaims, actor?: string) {
  const entry = await getHistoryEntry(id, entryId);
  if (!entry?.snapshot) return null;
  const row = await loadProjectRow(id);
  if (!row) return null;
  const snap = entry.snapshot as ProjectContent;
  const updated = await updateProjectRow(id, {
    title: snap.title,
    slug: snap.slug,
    description: snap.description,
    widget_tree: snap.widget_tree,
    pages: snap.pages,
    page_settings: snap.page_settings,
    updated_at: new Date().toISOString()
  });
  await recordHistory(id, 'restored', snap, claims, { note: `Restored from build #${entry.revision}`, actor });
  return rowToProject(updated);
}
