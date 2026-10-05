import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';
import { readDataFile, writeDataFile } from '../fileStorage.js';

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
brandsRouter.post('/', async (req: Request, res: Response) => {
  const { name, slug, description, primary_color, logo_url } = req.body;
  const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
brandsRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

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
brandsRouter.delete('/:id', async (req: Request, res: Response) => {
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
