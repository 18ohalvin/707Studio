import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { externalizeInlineImages } from '../inlineImages.js';
import { requireAuth, getClaims, isSuperAdminClaims, optionalClaims } from '../auth.js';
import { canAccessProject, findProject } from '../access.js';
import { clearSlotCache } from '../slots.js';
import {
  rowToProject, forClient, liveView, isLive, listHistory,
  submitForReview, publishProject, declineProject, discardChanges, restoreFromHistory
} from '../publishing.js';

export const pagesRouter = Router();

// Persistent fallback pages storage (survives restarts and standalone sessions)
let inMemoryPages: any[] = readDataFile<any[]>('pages.json', []);

/**
 * Refuses a write to a project this account cannot see. A missing project is
 * allowed through — that is a create. Without this, a device holding a stale
 * local copy of another team's project would overwrite it on its next sync.
 */
async function denyIfForeign(res: Response, id: string): Promise<boolean> {
  const existing = await findProject(id);
  if (existing && !canAccessProject(getClaims(res), existing)) {
    res.status(403).json({ success: false, error: 'This project belongs to another account.' });
    return true;
  }
  return false;
}

/** Display name for history entries ("who did this"), sent by the studio UI. */
function actorFrom(req: Request): string | undefined {
  const name = String(req.body?.actor || '').trim();
  return name ? name.slice(0, 150) : undefined;
}

// GET /api/pages - list this account's projects (optionally filter by brand_slug or status)
pagesRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { brand_slug, status } = req.query;
  const claims = getClaims(res);

  if (getDbStatus().isConnected) {
    try {
      let query = 'SELECT * FROM pages WHERE 1=1';
      const params: any[] = [];
      if (brand_slug) {
        params.push(brand_slug);
        query += ` AND brand_slug = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }
      query += ' ORDER BY updated_at DESC';
      const result = await pool.query(query, params);
      const tombstones = await pool.query('SELECT id FROM deleted_pages');
      const rows = result.rows.map(rowToProject).filter(r => canAccessProject(claims, r)).map(forClient);
      // Devices prune their local copies from this list; without it a stale
      // copy keeps reappearing in the project list after a delete.
      return res.json({ success: true, data: rows, deleted: tombstones.rows.map(t => t.id) });
    } catch (err: any) {
      console.error('[DB] Error querying pages from DB:', err.message);
    }
  }

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  let filtered = [...inMemoryPages];
  if (brand_slug) {
    filtered = filtered.filter(p => p.brand_slug === brand_slug);
  }
  if (status) {
    filtered = filtered.filter(p => p.status === status);
  }
  return res.json({ success: true, data: filtered.map(rowToProject).filter(p => canAccessProject(claims, p)).map(forClient) });
});

// GET /api/pages/:id/history/entries - Build history of a project, newest first.
// Three segments so it can never collide with the public /:brandSlug/:pageSlug
// route (a campaign could be called "history").
pagesRouter.get('/:id/history/entries', requireAuth, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  if (await denyIfForeign(res, id)) return;
  try {
    return res.json({ success: true, data: await listHistory(id) });
  } catch (err: any) {
    console.error('[DB] Error reading project history:', err.message);
    return res.status(500).json({ success: false, error: 'Could not load the history.' });
  }
});

// GET /api/pages/:brandSlug/:pageSlug - Public live page endpoint
// Visitors get the live version — the snapshot frozen at the last publish —
// never the working copy being edited. A campaign that was never published
// answers only to its owner and the superadmin (recognised by their token);
// anyone else gets the same 404 as a page that does not exist.
pagesRouter.get('/:brandSlug/:pageSlug', async (req: Request, res: Response) => {
  const brandSlug = String(req.params.brandSlug || '');
  const pageSlug = String(req.params.pageSlug || '');
  const normalize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normBrand = normalize(brandSlug);
  const normPage = normalize(pageSlug);

  let row: any = null;

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `SELECT * FROM pages
         WHERE (brand_slug = $1 OR regexp_replace(lower(brand_slug), '[^a-z0-9]', '', 'g') = $2)
           AND (slug = $3 OR regexp_replace(lower(slug), '[^a-z0-9]', '', 'g') = $4
                OR regexp_replace(lower(live_snapshot->>'slug'), '[^a-z0-9]', '', 'g') = $4)
         ORDER BY (live_snapshot IS NOT NULL) DESC, updated_at DESC
         LIMIT 1`,
        [brandSlug, normBrand, pageSlug, normPage]
      );
      row = result.rows[0] || null;
    } catch (err: any) {
      console.error('[DB] Error querying single page from DB:', err.message);
      return res.status(500).json({ success: false, error: 'Could not load this page — please try again.' });
    }
  } else {
    inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
    const matches = inMemoryPages.filter(p => {
      const pBrand = normalize(p.brand_slug);
      const slugs = [p.slug, p.live_snapshot?.slug].filter(Boolean).map(normalize);
      return (pBrand === normBrand || p.brand_slug === brandSlug) && (slugs.includes(normPage) || p.slug === pageSlug);
    });
    row = matches.find(p => p.live_snapshot) || matches.find(p => ['approved', 'published'].includes(p.status)) || matches[0] || null;
  }

  if (!row) return res.status(404).json({ success: false, error: 'Activation page not found' });
  const project = rowToProject(row);
  const claims = optionalClaims(req);
  const isStaff = Boolean(claims && canAccessProject(claims, project));

  if (isLive(project)) {
    const live = forClient(liveView(project));
    if (isStaff) return res.json({ success: true, data: live });
    // Visitors get the page, not who on the team made it.
    const { owner_id, owner_email, created_by, published_by, ...publicPage } = live;
    return res.json({ success: true, data: publicPage });
  }

  if (!isStaff) return res.status(404).json({ success: false, error: 'Activation page not found' });
  return res.json({ success: true, data: forClient(project) });
});

/**
 * Status transitions. Autosave never changes status; these are the only way a
 * project moves between draft, in review and live.
 */
function transition(handler: (id: string, req: Request, res: Response) => Promise<any>, opts: { superadminOnly?: boolean } = {}) {
  return async (req: Request, res: Response) => {
    const id = String(req.params.id);
    if (opts.superadminOnly && !isSuperAdminClaims(getClaims(res))) {
      return res.status(403).json({ success: false, error: 'Only the superadmin can publish or decline a project.' });
    }
    if (await denyIfForeign(res, id)) return;
    try {
      const project = await handler(id, req, res);
      // Publishing, discarding or restoring can change the places a campaign offers: apply them now, not in ten seconds.
      clearSlotCache(id);
      if (res.headersSent) return;
      if (!project) return res.status(404).json({ success: false, error: 'Project not found.' });
      return res.json({ success: true, data: forClient(project) });
    } catch (err: any) {
      console.error('[Publishing] Transition failed:', err.message);
      return res.status(500).json({ success: false, error: 'Could not update the project — please try again.' });
    }
  };
}

// POST /api/pages/:id/submit - Owner asks the superadmin to review (first publish or an update)
pagesRouter.post('/:id/submit', requireAuth, transition((id, req, res) =>
  submitForReview(id, getClaims(res), String(req.body?.note || ''), actorFrom(req))
));

// POST /api/pages/:id/publish - Superadmin makes the working copy the live version
pagesRouter.post('/:id/publish', requireAuth, transition((id, req, res) =>
  publishProject(id, getClaims(res), String(req.body?.note || ''), actorFrom(req))
, { superadminOnly: true }));

// POST /api/pages/:id/decline - Superadmin sends a submission back
pagesRouter.post('/:id/decline', requireAuth, transition((id, req, res) =>
  declineProject(id, getClaims(res), String(req.body?.note || ''), actorFrom(req))
, { superadminOnly: true }));

// POST /api/pages/:id/discard - Drop unpublished edits; working copy returns to the live version
pagesRouter.post('/:id/discard', requireAuth, transition((id, req, res) =>
  discardChanges(id, getClaims(res), actorFrom(req))
));

// POST /api/pages/:id/history/:entryId/restore - Load an older build into the working copy
pagesRouter.post('/:id/history/:entryId/restore', requireAuth, transition((id, req, res) =>
  restoreFromHistory(id, String(req.params.entryId), getClaims(res), actorFrom(req))
));

// POST /api/pages - Create or update a project's working copy (the editor's autosave)
pagesRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const { id, brand_slug, title, slug, widget_tree, pages, page_settings, owner_id, owner_email, created_by } = req.body;

  const now = new Date().toISOString();
  const pageId = id || `page-${Date.now()}`;
  const targetBrandSlug = brand_slug || 'atmos';
  const pageTitle = title || 'Untitled Activation Drop';
  const pageSlug = slug || pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (await denyIfForeign(res, pageId)) return;
  // Refuse to resurrect a project someone deleted. An older client that does
  // not know about tombstones still cannot bring it back this way.
  if (getDbStatus().isConnected) {
    try {
      const gone = await pool.query('SELECT 1 FROM deleted_pages WHERE id = $1', [pageId]);
      if (gone.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'This project was deleted and cannot be restored by a sync from another device.'
        });
      }
    } catch (err: any) {
      console.warn('[DB] Could not check deleted_pages:', err.message);
    }
  }

  // Embedded base64 images are moved to the uploads volume before storing, so
  // a project stays a few KB instead of tens of MB that every device re-polls.
  const pageWidgets = externalizeInlineImages(widget_tree || []);
  const pageList = externalizeInlineImages(pages || []);
  const settings = externalizeInlineImages(page_settings || {});

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  const existingIdx = inMemoryPages.findIndex(p => p.id === pageId);
  const existing = existingIdx >= 0 ? inMemoryPages[existingIdx] : null;

  // Status is deliberately not taken from the body: a new project starts as a
  // draft, and only the transition endpoints above move it after that.
  const pageData = {
    id: pageId,
    brand_slug: targetBrandSlug,
    title: pageTitle,
    slug: pageSlug,
    status: existing?.status || 'draft',
    current_version: 1,
    widget_tree: pageWidgets,
    pages: pageList,
    page_settings: settings,
    owner_id: owner_id || existing?.owner_id || '',
    owner_email: owner_email || existing?.owner_email || '',
    created_by: created_by || existing?.created_by || '',
    updated_at: now,
    created_at: existing?.created_at || now
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO pages (id, brand_slug, title, slug, status, current_version, widget_tree, pages, page_settings, owner_id, owner_email, created_by, updated_at, created_at)
         VALUES ($1, $2, $3, $4, 'draft', $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           brand_slug = EXCLUDED.brand_slug,
           slug = EXCLUDED.slug,
           widget_tree = EXCLUDED.widget_tree,
           pages = EXCLUDED.pages,
           page_settings = EXCLUDED.page_settings,
           owner_id = COALESCE(EXCLUDED.owner_id, pages.owner_id),
           owner_email = COALESCE(EXCLUDED.owner_email, pages.owner_email),
           created_by = COALESCE(EXCLUDED.created_by, pages.created_by),
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [
          pageData.id,
          pageData.brand_slug,
          pageData.title,
          pageData.slug,
          pageData.current_version,
          JSON.stringify(pageData.widget_tree),
          JSON.stringify(pageData.pages),
          JSON.stringify(pageData.page_settings),
          pageData.owner_id || null,
          pageData.owner_email || null,
          pageData.created_by || null,
          pageData.updated_at,
          pageData.created_at
        ]
      );
      // The saved row tells the editor whether it now differs from the live version.
      return res.json({ success: true, data: forClient(rowToProject(result.rows[0])) });
    } catch (err: any) {
      // The database is up but rejected the write, so the file fallback below
      // would strand this project where nothing reads it: GET serves from the
      // database whenever it is connected. Answering 200 here is what hid a
      // broken schema for days — every device reported "Saved" while the
      // database stayed empty and nothing synced. Fail loudly instead.
      console.error('[DB] Error saving page to DB:', err.message);
      return res.status(500).json({
        success: false,
        error: 'Could not save to the database — your changes are NOT synced to other devices.',
        detail: err.message
      });
    }
  }

  if (existingIdx >= 0) {
    inMemoryPages[existingIdx] = { ...inMemoryPages[existingIdx], ...pageData };
  } else {
    inMemoryPages.unshift(pageData);
  }
  writeDataFile('pages.json', inMemoryPages);

  return res.json({ success: true, data: forClient(rowToProject(existingIdx >= 0 ? inMemoryPages[existingIdx] : pageData)) });
});

// PUT /api/pages/:id - Update a project's content fields. Status moves only
// through the transition endpoints, so a status in the body is ignored.
pagesRouter.put('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status: _ignored, ...updates } = req.body || {};
  const now = new Date().toISOString();
  if (await denyIfForeign(res, id)) return;

  const allowed = ['title', 'slug', 'widget_tree', 'pages', 'page_settings'];
  const fields = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));

  if (getDbStatus().isConnected) {
    try {
      const keys = Object.keys(fields);
      const values = keys.map(k => (['widget_tree', 'pages', 'page_settings'].includes(k) ? JSON.stringify(fields[k]) : fields[k]));
      const set = [...keys.map((k, i) => `${k} = $${i + 1}`), `updated_at = $${keys.length + 1}`].join(', ');
      const result = await pool.query(`UPDATE pages SET ${set} WHERE id = $${keys.length + 2} RETURNING *`, [...values, now, id]);
      if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Project not found.' });
      return res.json({ success: true, data: forClient(rowToProject(result.rows[0])) });
    } catch (err: any) {
      console.error('[DB] Error updating page in DB:', err.message);
      return res.status(500).json({ success: false, error: 'Could not update the project.' });
    }
  }

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  const idx = inMemoryPages.findIndex(p => p.id === id);
  if (idx < 0) return res.status(404).json({ success: false, error: 'Project not found.' });
  inMemoryPages[idx] = { ...inMemoryPages[idx], ...fields, updated_at: now };
  writeDataFile('pages.json', inMemoryPages);
  return res.json({ success: true, data: forClient(rowToProject(inMemoryPages[idx])) });
});

// DELETE /api/pages/:id - Delete page / project permanently from cloud DB
pagesRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  if (await denyIfForeign(res, String(id))) return;
  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  inMemoryPages = inMemoryPages.filter(p => p.id !== id);
  writeDataFile('pages.json', inMemoryPages);

  if (getDbStatus().isConnected) {
    try {
      await pool.query('DELETE FROM pages WHERE id = $1', [id]);
      // Remember the deletion so a device still holding this project cannot
      // upload it again on its next poll.
      await pool.query(
        'INSERT INTO deleted_pages (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
        [id]
      );
    } catch (err: any) {
      console.error('[DB] Error deleting page from DB:', err.message);
      return res.status(500).json({ success: false, error: 'Could not delete on the server.' });
    }
  }

  return res.json({ success: true, message: 'Page removed successfully' });
});

// PATCH /api/pages/:id/review - Older review call, kept for compatibility:
// maps onto the transition endpoints.
pagesRouter.patch('/:id/review', requireAuth, transition((id, req, res) => {
  const status = String(req.body?.status || '');
  const claims = getClaims(res);
  const actor = actorFrom(req) || req.body?.reviewed_by;
  const note = String(req.body?.review_notes || '');
  if (status === 'pending_review') return submitForReview(id, claims, note, actor);
  if (!isSuperAdminClaims(claims)) {
    res.status(403).json({ success: false, error: 'Only the superadmin can publish or decline a project.' });
    return Promise.resolve(null);
  }
  if (status === 'approved' || status === 'published') return publishProject(id, claims, note, actor);
  return declineProject(id, claims, note, actor);
}));
