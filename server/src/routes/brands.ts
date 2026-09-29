import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';

export const brandsRouter = Router();

// Fallback seed list of the 20 brands
const DEFAULT_BRANDS = [
  { id: '1', name: 'atmos Indonesia', slug: 'atmos', description: 'atmos streetwear & sneaker destination', primary_color: '#000000', logo_url: '' },
  { id: '2', name: 'Fred Perry', slug: 'fred-perry', description: 'Iconic British laurel wreath sportswear and apparel', primary_color: '#1a1a1a', logo_url: '' },
  { id: '3', name: 'Vans Store Indonesia', slug: 'vans', description: 'Action sports footwear and apparel', primary_color: '#c8102e', logo_url: '' },
  { id: '4', name: 'Converse Flagship', slug: 'converse', description: 'Classic Chuck Taylor and collaborative drops', primary_color: '#000000', logo_url: '' },
  { id: '5', name: 'ASICS SportStyle', slug: 'asics', description: 'Performance and lifestyle sneaker collaborations', primary_color: '#001e62', logo_url: '' },
  { id: '6', name: 'New Balance Heritage', slug: 'new-balance', description: 'Craftsmanship and running silhouette drops', primary_color: '#cc0000', logo_url: '' },
  { id: '7', name: 'Salomon Sportstyle', slug: 'salomon', description: 'Trail running and technical outdoor footwear', primary_color: '#111111', logo_url: '' },
  { id: '8', name: 'Carhartt WIP', slug: 'carhartt-wip', description: 'Workwear in progress and streetwear essentials', primary_color: '#d49b42', logo_url: '' },
  { id: '9', name: 'Stüssy Chapter', slug: 'stussy', description: 'Tribe culture and seasonal hype collections', primary_color: '#000000', logo_url: '' },
  { id: '10', name: 'Pleasures', slug: 'pleasures', description: 'Punk, grunge, and modern graphic apparel', primary_color: '#000000', logo_url: '' },
  { id: '11', name: 'Neighborhood Japan', slug: 'neighborhood', description: 'Craft with pride Tokyo streetwear', primary_color: '#1f1f1f', logo_url: '' },
  { id: '12', name: 'Beams Plus', slug: 'beams-plus', description: 'Japanese timeless menswear aesthetics', primary_color: '#e65c00', logo_url: '' },
  { id: '13', name: 'Puma Select', slug: 'puma', description: 'Heritage motorsport and street collaborations', primary_color: '#000000', logo_url: '' },
  { id: '14', name: 'Mizuno Sportstyle', slug: 'mizuno', description: 'Japanese performance running and Kazoku drops', primary_color: '#0d1b2a', logo_url: '' },
  { id: '15', name: 'Hoka One One', slug: 'hoka', description: 'Maximalist cushioning footwear releases', primary_color: '#0072ce', logo_url: '' },
  { id: '16', name: 'On Running', slug: 'on-running', description: 'CloudTec footwear and apparel launches', primary_color: '#000000', logo_url: '' },
  { id: '17', name: 'Dickies 1922', slug: 'dickies', description: 'Authentic rugged workwear collections', primary_color: '#b32025', logo_url: '' },
  { id: '18', name: 'Gramicci', slug: 'gramicci', description: 'Yosemite climbing and lifestyle apparel', primary_color: '#9e2a2b', logo_url: '' },
  { id: '19', name: 'Dr. Martens', slug: 'dr-martens', description: 'Iconic yellow-stitched boots and shoes', primary_color: '#ffcc00', logo_url: '' },
  { id: '20', name: '707 Vault / Exclusive', slug: '707-vault', description: 'The 707 Company private archive and VIP drop hub', primary_color: '#000000', logo_url: '' }
];

// GET /api/brands - list all brands
brandsRouter.get('/', async (req: Request, res: Response) => {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM brands WHERE is_active = true ORDER BY name ASC');
      return res.json({ success: true, data: result.rows });
    } catch (err: any) {
      console.error('Error fetching brands from DB:', err.message);
    }
  }
  return res.json({ success: true, data: DEFAULT_BRANDS });
});

// GET /api/brands/:slug - get single brand details
brandsRouter.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM brands WHERE slug = $1', [slug]);
      if (result.rows.length > 0) {
        return res.json({ success: true, data: result.rows[0] });
      }
    } catch (err: any) {
      console.error('Error fetching brand from DB:', err.message);
    }
  }
  const brand = DEFAULT_BRANDS.find(b => b.slug === slug);
  if (brand) {
    return res.json({ success: true, data: brand });
  }
  return res.status(404).json({ success: false, error: 'Brand not found' });
});
