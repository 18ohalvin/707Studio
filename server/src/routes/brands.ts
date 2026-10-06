import { Router, Request, Response, NextFunction } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';
import { requireAuth, getClaims, isSuperAdminClaims } from '../auth.js';
import { isReservedSlug, normalizeSlug } from '../reservedSlugs.js';

function requireSuperAdmin(_req: Request, res: Response, next: NextFunction) {
  if (!isSuperAdminClaims(getClaims(res))) {
    return res.status(403).json({ success: false, error: 'Only the superadmin can manage brands.' });
  }
  next();
}

export const brandsRouter = Router();

// Dynamic persistent storage for offline/standalone execution
let inMemoryBrands: any[] = readDataFile<any[]>('brands.json', []);

// GET /api/brands - list all brands from cloud/database
brandsRouter.get('/', async (req: Request, res: Response) => {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM brands WHERE is_active = true ORDER BY name ASC');
      return res.json({ success: true, data: result.rows });
    } catch (err: any) {
      console.error('[DB] Error fetching brands from DB:', err.message);
    }
  }
  inMemoryBrands = readDataFile<any[]>('brands.json', inMemoryBrands);
  return res.json({ success: true, data: inMemoryBrands });
});

// GET /api/brands/:slug - get single brand details
brandsRouter.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM brands WHERE slug = $1 AND is_active = true', [slug]);
      if (result.rows.length > 0) {
        return res.json({ success: true, data: result.rows[0] });
      }
    } catch (err: any) {
      console.error('[DB] Error fetching brand from DB:', err.message);
    }
  }
  inMemoryBrands = readDataFile<any[]>('brands.json', inMemoryBrands);
  const brand = inMemoryBrands.find(b => b.slug === slug);
  if (brand) {
    return res.json({ success: true, data: brand });
  }
  return res.status(404).json({ success: false, error: 'Brand not found' });
});

// POST /api/brands - create new brand in database
brandsRouter.post('/', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  const { name, slug, description, primary_color, logo_url } = req.body;
  if (!String(name || '').trim()) {
    return res.status(400).json({ success: false, error: 'Brand name is required.' });
  }
  const brandSlug = normalizeSlug(slug || name);
  if (!brandSlug || isReservedSlug(brandSlug)) {
    return res.status(400).json({ success: false, error: `"${brandSlug}" is reserved by the studio — choose another brand slug.` });
  }
  const newBrand = {
    id: `brand-${Date.now()}`,
    name,
    slug: brandSlug,
    description: description || '',
    primary_color: primary_color || '#000000',
    logo_url: logo_url || '',
    is_active: true,
    created_at: new Date().toISOString()
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO brands (name, slug, description, primary_color, logo_url, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (slug) DO UPDATE SET 
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           primary_color = EXCLUDED.primary_color,
           logo_url = EXCLUDED.logo_url,
           is_active = true
         RETURNING *`,
        [newBrand.name, newBrand.slug, newBrand.description, newBrand.primary_color, newBrand.logo_url]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err: any) {
      console.error('[DB] Error saving brand to DB:', err.message);
    }
  }

  inMemoryBrands = readDataFile<any[]>('brands.json', inMemoryBrands);
  inMemoryBrands.unshift(newBrand);
  writeDataFile('brands.json', inMemoryBrands);
  return res.status(201).json({ success: true, data: newBrand });
});

// PUT /api/brands/:id - update brand details
/** Columns a brand update may touch. Keys come from the request body and end up in SQL, so nothing else passes. */
const UPDATABLE_BRAND_FIELDS = ['name', 'slug', 'description', 'logo_url', 'primary_color', 'is_active'];

brandsRouter.put('/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: Record<string, any> = Object.fromEntries(
    Object.entries(req.body || {}).filter(([k]) => UPDATABLE_BRAND_FIELDS.includes(k))
  );
  if (updates.slug !== undefined) {
    updates.slug = normalizeSlug(updates.slug);
    if (!updates.slug || isReservedSlug(updates.slug)) {
      return res.status(400).json({ success: false, error: `"${updates.slug}" is reserved by the studio — choose another brand slug.` });
    }
  }

  inMemoryBrands = readDataFile<any[]>('brands.json', inMemoryBrands);
  const idx = inMemoryBrands.findIndex(b => b.id === id || b.slug === id);
  if (idx !== -1) {
    inMemoryBrands[idx] = { ...inMemoryBrands[idx], ...updates };
    writeDataFile('brands.json', inMemoryBrands);
  }

  if (getDbStatus().isConnected) {
    try {
      const fields = Object.keys(updates);
      if (fields.length > 0) {
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = fields.map(f => updates[f]);
        values.push(id);
        const result = await pool.query(
          `UPDATE brands SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE (id::text = $${values.length} OR slug = $${values.length}) RETURNING *`,
          values
        );
        if (result.rows.length > 0) {
          return res.json({ success: true, data: result.rows[0] });
        }
      }
    } catch (err: any) {
      console.error('[DB] Error updating brand in DB:', err.message);
    }
  }

  const updated = inMemoryBrands.find(b => b.id === id || b.slug === id);
  return res.json({ success: true, data: updated || updates });
});

// DELETE /api/brands/:id - delete brand from database
brandsRouter.delete('/:id', requireAuth, requireSuperAdmin, async (req: Request, res: Response) => {
  const { id } = req.params;
  inMemoryBrands = inMemoryBrands.filter(b => b.id !== id && b.slug !== id);
  writeDataFile('brands.json', inMemoryBrands);

  if (getDbStatus().isConnected) {
    try {
      await pool.query('DELETE FROM brands WHERE id::text = $1 OR slug = $1', [id]);
    } catch (err: any) {
      console.error('[DB] Error deleting brand from DB:', err.message);
    }
  }

  return res.json({ success: true, message: 'Brand removed successfully' });
});
