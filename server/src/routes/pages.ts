import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { externalizeInlineImages } from '../inlineImages.js';

export const pagesRouter = Router();

// Persistent fallback pages storage (survives restarts and standalone sessions)
let inMemoryPages: any[] = readDataFile<any[]>('pages.json', []);

// GET /api/pages - list pages (optionally filter by brand_slug or status)
pagesRouter.get('/', async (req: Request, res: Response) => {
  const { brand_slug, status } = req.query;

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
      const rows = result.rows.map(r => ({
        id: r.id,
        brand_id: r.brand_id || '1',
        brand_slug: r.brand_slug || 'atmos',
        title: r.title,
        slug: r.slug,
        description: r.description || '',
        status: r.status || 'draft',
        current_version: r.current_version || 1,
        widget_tree: typeof r.widget_tree === 'string' ? JSON.parse(r.widget_tree) : (r.widget_tree || []),
        pages: typeof r.pages === 'string' ? JSON.parse(r.pages) : (r.pages || []),
        page_settings: typeof r.page_settings === 'string' ? JSON.parse(r.page_settings) : (r.page_settings || {}),
        owner_id: r.owner_id || '',
        owner_email: r.owner_email || '',
        created_by: r.created_by || '',
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
      return res.json({ success: true, data: rows });
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
  return res.json({ success: true, data: filtered });
});

// GET /api/pages/:brandSlug/:pageSlug - Public live page endpoint
pagesRouter.get('/:brandSlug/:pageSlug', async (req: Request, res: Response) => {
  const { brandSlug, pageSlug } = req.params;

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        'SELECT * FROM pages WHERE brand_slug = $1 AND slug = $2 LIMIT 1',
        [brandSlug, pageSlug]
      );
      if (result.rows.length > 0) {
        const r = result.rows[0];
        return res.json({
          success: true,
          data: {
            id: r.id,
            brand_id: r.brand_id || '1',
            brand_slug: r.brand_slug || 'atmos',
            title: r.title,
            slug: r.slug,
            description: r.description || '',
            status: r.status || 'draft',
            current_version: r.current_version || 1,
            widget_tree: typeof r.widget_tree === 'string' ? JSON.parse(r.widget_tree) : (r.widget_tree || []),
            pages: typeof r.pages === 'string' ? JSON.parse(r.pages) : (r.pages || []),
            page_settings: typeof r.page_settings === 'string' ? JSON.parse(r.page_settings) : (r.page_settings || {}),
            owner_id: r.owner_id || '',
            owner_email: r.owner_email || '',
            created_by: r.created_by || '',
            created_at: r.created_at,
            updated_at: r.updated_at
          }
        });
      }
    } catch (err: any) {
      console.error('[DB] Error querying single page from DB:', err.message);
    }
  }

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  const page = inMemoryPages.find(p => p.brand_slug === brandSlug && p.slug === pageSlug);
  if (page) {
    return res.json({ success: true, data: page });
  }
  return res.status(404).json({ success: false, error: 'Activation page not found' });
});

// POST /api/pages - Create or update a page draft
pagesRouter.post('/', async (req: Request, res: Response) => {
  const { id, brand_slug, title, slug, widget_tree, pages, page_settings, status, owner_id, owner_email, created_by } = req.body;

  const now = new Date().toISOString();
  const pageId = id || `page-${Date.now()}`;
  const targetBrandSlug = brand_slug || 'atmos';
  const pageTitle = title || 'Untitled Activation Drop';
  const pageSlug = slug || pageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const pageStatus = status || 'draft';
  // Embedded base64 images are moved to the uploads volume before storing, so
  // a project stays a few KB instead of tens of MB that every device re-polls.
  const pageWidgets = externalizeInlineImages(widget_tree || []);
  const pageList = externalizeInlineImages(pages || []);
  const settings = externalizeInlineImages(page_settings || {});

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  const existingIdx = inMemoryPages.findIndex(p => p.id === pageId);

  const pageData = {
    id: pageId,
    brand_slug: targetBrandSlug,
    title: pageTitle,
    slug: pageSlug,
    status: pageStatus,
    current_version: 1,
    widget_tree: pageWidgets,
    pages: pageList,
    page_settings: settings,
    owner_id: owner_id || (existingIdx >= 0 ? inMemoryPages[existingIdx].owner_id : '') || '',
    owner_email: owner_email || (existingIdx >= 0 ? inMemoryPages[existingIdx].owner_email : '') || '',
    created_by: created_by || (existingIdx >= 0 ? inMemoryPages[existingIdx].created_by : '') || '',
    updated_at: now,
    created_at: existingIdx >= 0 ? inMemoryPages[existingIdx].created_at : now
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO pages (id, brand_slug, title, slug, status, current_version, widget_tree, pages, page_settings, owner_id, owner_email, created_by, updated_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           brand_slug = EXCLUDED.brand_slug,
           slug = EXCLUDED.slug,
           status = EXCLUDED.status,
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
          pageData.status,
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
      if (result.rows.length > 0) {
        const r = result.rows[0];
        pageData.created_at = r.created_at;
      }
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

  return res.json({ success: true, data: pageData });
});

// PUT /api/pages/:id - Update page fields / status
pagesRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const now = new Date().toISOString();

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  const idx = inMemoryPages.findIndex(p => p.id === id);
  if (idx !== -1) {
    inMemoryPages[idx] = { ...inMemoryPages[idx], ...updates, updated_at: now };
    writeDataFile('pages.json', inMemoryPages);
  }

  if (getDbStatus().isConnected) {
    try {
      const dbUpdates: any = { updated_at: now };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.widget_tree !== undefined) dbUpdates.widget_tree = JSON.stringify(updates.widget_tree);
      if (updates.pages !== undefined) dbUpdates.pages = JSON.stringify(updates.pages);
      if (updates.page_settings !== undefined) dbUpdates.page_settings = JSON.stringify(updates.page_settings);

      const fields = Object.keys(dbUpdates);
      if (fields.length > 0) {
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = fields.map(f => dbUpdates[f]);
        values.push(id);
        const result = await pool.query(
          `UPDATE pages SET ${setClause} WHERE id = $${values.length} RETURNING *`,
          values
        );
        if (result.rows.length > 0) {
          return res.json({ success: true, data: result.rows[0] });
        }
      }
    } catch (err: any) {
      console.error('[DB] Error updating page in DB:', err.message);
    }
  }

  const updated = inMemoryPages.find(p => p.id === id);
  return res.json({ success: true, data: updated || updates });
});

// DELETE /api/pages/:id - Delete page / project permanently from cloud DB
pagesRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  inMemoryPages = inMemoryPages.filter(p => p.id !== id);
  writeDataFile('pages.json', inMemoryPages);

  if (getDbStatus().isConnected) {
    try {
      await pool.query('DELETE FROM pages WHERE id = $1', [id]);
    } catch (err: any) {
      console.error('[DB] Error deleting page from DB:', err.message);
    }
  }

  return res.json({ success: true, message: 'Page removed successfully' });
});

// PATCH /api/pages/:id/review - Review status change
pagesRouter.patch('/:id/review', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewed_by, review_notes } = req.body;
  const now = new Date().toISOString();

  inMemoryPages = readDataFile<any[]>('pages.json', inMemoryPages);
  const page = inMemoryPages.find(p => p.id === id);
  if (page) {
    page.status = status;
    page.reviewed_by = reviewed_by || 'Head of UI/UX';
    page.review_notes = review_notes || '';
    page.updated_at = now;
    writeDataFile('pages.json', inMemoryPages);
  }

  if (getDbStatus().isConnected) {
    try {
      await pool.query(
        'UPDATE pages SET status = $1, updated_at = $2 WHERE id = $3',
        [status, now, id]
      );
    } catch (err: any) {
      console.error('[DB] Error updating page review in DB:', err.message);
    }
  }

  return res.json({ success: true, data: page || { id, status } });
});
