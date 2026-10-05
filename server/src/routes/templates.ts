import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';

export const templatesRouter = Router();

// In-memory cache (clean fresh state with 0 ghost data)
let inMemoryTemplates: any[] = [];

// GET /api/templates
templatesRouter.get('/', async (req: Request, res: Response) => {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
      const rows = result.rows.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || '',
        category: r.category || 'custom',
        thumbnail_url: r.thumbnail_url || '',
        widget_tree: typeof r.widget_tree === 'string' ? JSON.parse(r.widget_tree) : (r.widget_tree || []),
        is_global_preset: r.is_global_preset ?? true,
        status: r.status || 'published',
        created_by: r.created_by || 'Superadmin',
        created_at: r.created_at,
        updated_at: r.updated_at
      }));
      return res.json({ success: true, data: rows });
    } catch (err: any) {
      console.error('[DB] Error fetching templates from DB:', err.message);
    }
  }
  return res.json({ success: true, data: inMemoryTemplates });
});

// POST /api/templates - Build new template (Superadmin)
templatesRouter.post('/', async (req: Request, res: Response) => {
  const { id, name, slug, description, category, widget_tree, status, created_by } = req.body;
  const tplId = id || `tpl-${Date.now()}`;
  const tplName = name || 'Untitled Template';
  const tplSlug = slug || tplName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const now = new Date().toISOString();

  const newTemplate = {
    id: tplId,
    name: tplName,
    slug: tplSlug,
    description: description || '',
    category: category || 'custom',
    widget_tree: widget_tree || [],
    status: status || 'draft',
    is_global_preset: true,
    created_by: created_by || 'Superadmin',
    created_at: now,
    updated_at: now
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO templates (id, name, slug, description, category, widget_tree, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           slug = EXCLUDED.slug,
           description = EXCLUDED.description,
           category = EXCLUDED.category,
           widget_tree = EXCLUDED.widget_tree,
           status = EXCLUDED.status,
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [
          newTemplate.id,
          newTemplate.name,
          newTemplate.slug,
          newTemplate.description,
          newTemplate.category,
          JSON.stringify(newTemplate.widget_tree),
          newTemplate.status,
          newTemplate.created_by,
          newTemplate.created_at,
          newTemplate.updated_at
        ]
      );
      if (result.rows.length > 0) {
        const r = result.rows[0];
        return res.status(201).json({
          success: true,
          data: {
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            category: r.category,
            thumbnail_url: r.thumbnail_url,
            widget_tree: typeof r.widget_tree === 'string' ? JSON.parse(r.widget_tree) : r.widget_tree,
            is_global_preset: r.is_global_preset,
            status: r.status,
            created_by: r.created_by,
            created_at: r.created_at,
            updated_at: r.updated_at
          }
        });
      }
    } catch (err: any) {
      console.error('[DB] Error saving template to DB:', err.message);
    }
  }

  inMemoryTemplates.unshift(newTemplate);
  return res.status(201).json({ success: true, data: newTemplate });
});

// PUT /api/templates/:id - Update existing template / toggle publish status
templatesRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const now = new Date().toISOString();

  const idx = inMemoryTemplates.findIndex(t => t.id === id);
  if (idx !== -1) {
    inMemoryTemplates[idx] = { ...inMemoryTemplates[idx], ...updates, updated_at: now };
  }

  if (getDbStatus().isConnected) {
    try {
      const dbUpdates: any = { updated_at: now };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.widget_tree !== undefined) dbUpdates.widget_tree = JSON.stringify(updates.widget_tree);

      const fields = Object.keys(dbUpdates);
      if (fields.length > 0) {
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = fields.map(f => dbUpdates[f]);
        values.push(id);
        const result = await pool.query(
          `UPDATE templates SET ${setClause} WHERE id = $${values.length} RETURNING *`,
          values
        );
        if (result.rows.length > 0) {
          const r = result.rows[0];
          return res.json({
            success: true,
            data: {
              id: r.id,
              name: r.name,
              slug: r.slug,
              description: r.description,
              category: r.category,
              thumbnail_url: r.thumbnail_url,
              widget_tree: typeof r.widget_tree === 'string' ? JSON.parse(r.widget_tree) : r.widget_tree,
              is_global_preset: r.is_global_preset,
              status: r.status,
              created_by: r.created_by,
              created_at: r.created_at,
              updated_at: r.updated_at
            }
          });
        }
      }
    } catch (err: any) {
      console.error('[DB] Error updating template in DB:', err.message);
    }
  }

  const updated = inMemoryTemplates.find(t => t.id === id);
  return res.json({ success: true, data: updated || updates });
});

// DELETE /api/templates/:id - Remove template
templatesRouter.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryTemplates = inMemoryTemplates.filter(t => t.id !== id);

  if (getDbStatus().isConnected) {
    try {
      await pool.query('DELETE FROM templates WHERE id = $1', [id]);
    } catch (err: any) {
      console.error('[DB] Error deleting template from DB:', err.message);
    }
  }

  return res.json({ success: true, message: 'Template removed successfully' });
});
