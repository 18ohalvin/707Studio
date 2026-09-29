import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';

export const pagesRouter = Router();

// In-memory fallback pages storage
let inMemoryPages: any[] = [
  {
    id: 'proj-asics-1',
    brand_id: '1',
    brand_slug: 'atmos',
    title: 'atmos x ASICS Gel Kayano',
    slug: 'asics-gel-kayano-pandan',
    description: 'Exclusive limited RSVP activation for atmos x ASICS',
    status: 'draft',
    current_version: 1,
    widget_tree: [
      {
        id: 'hero_asics_1',
        type: 'HeroDrop',
        props: {
          ratio: '4:5',
          title: 'ATMOS X ASICS',
          headline: 'GEL KAYANO PANDAN',
          subtitle: 'LIMITED RAFFLE LAUNCH'
        }
      },
      {
        id: 'text_asics_1',
        type: 'TextBanner',
        props: {
          text: 'SELECT YOUR SIZE',
          placeholder: 'WRITE YOUR TEXT HERE',
          typographyStyle: 'headline-1'
        }
      },
      {
        id: 'raffle_asics_1',
        type: 'RaffleForm',
        props: {
          heading: 'OFFICIAL ENTRY FORM'
        }
      }
    ],
    page_settings: {
      seoTitle: 'atmos x ASICS Gel Kayano Pandan RSVP',
      seoDescription: 'Enter the official 707 activation for atmos x ASICS.',
      theme: 'the-707-standard'
    },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'proj-raffle-2',
    brand_id: '1',
    brand_slug: 'atmos',
    title: 'Raffle Projects',
    slug: 'raffle-projects',
    description: 'Multi-brand seasonal raffle drop hub',
    status: 'draft',
    current_version: 1,
    widget_tree: [
      {
        id: 'hero_raffle_1',
        type: 'HeroDrop',
        props: {
          ratio: '16:9',
          title: 'SEASONAL RAFFLE HUB',
          headline: 'SUMMER 2026',
          subtitle: 'EXCLUSIVE ENTRIES'
        }
      },
      {
        id: 'raffle_form_2',
        type: 'RaffleForm',
        props: {
          heading: 'ENTER RAFFLE DETAILS'
        }
      }
    ],
    page_settings: {
      seoTitle: 'Raffle Projects',
      seoDescription: '707 Raffle Hub',
      theme: 'the-707-standard'
    },
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month ago
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// GET /api/pages - list pages (optionally filter by brand_id or status)
pagesRouter.get('/', async (req: Request, res: Response) => {
  const { brand_slug, status } = req.query;

  if (getDbStatus().isConnected) {
    try {
      let query = `
        SELECT p.*, b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo
        FROM pages p
        JOIN brands b ON p.brand_id = b.id
        WHERE 1=1
      `;
      const params: any[] = [];
      if (brand_slug) {
        params.push(brand_slug);
        query += ` AND b.slug = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND p.status = $${params.length}`;
      }
      query += ' ORDER BY p.updated_at DESC';
      const result = await pool.query(query, params);
      return res.json({ success: true, data: result.rows });
    } catch (err: any) {
      console.error('Error querying pages from DB:', err.message);
    }
  }

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
        `SELECT p.*, b.name as brand_name, b.slug as brand_slug, b.logo_url as brand_logo
         FROM pages p
         JOIN brands b ON p.brand_id = b.id
         WHERE b.slug = $1 AND p.slug = $2`,
        [brandSlug, pageSlug]
      );
      if (result.rows.length > 0) {
        return res.json({ success: true, data: result.rows[0] });
      }
    } catch (err: any) {
      console.error('Error querying single page from DB:', err.message);
    }
  }

  const page = inMemoryPages.find(p => p.brand_slug === brandSlug && p.slug === pageSlug);
  if (page) {
    return res.json({ success: true, data: page });
  }
  return res.status(404).json({ success: false, error: 'Activation page not found' });
});

// POST /api/pages - Create or update a page draft
pagesRouter.post('/', async (req: Request, res: Response) => {
  const { id, brand_slug, title, slug, widget_tree, page_settings, status } = req.body;

  const now = new Date().toISOString();
  const existingIdx = inMemoryPages.findIndex(p => p.id === id || (p.brand_slug === brand_slug && p.slug === slug));

  const pageData = {
    id: id || `page-${Date.now()}`,
    brand_slug: brand_slug || 'atmos',
    title: title || 'Untitled Activation Drop',
    slug: slug || 'untitled-drop',
    status: status || 'draft',
    current_version: 1,
    widget_tree: widget_tree || [],
    page_settings: page_settings || {},
    updated_at: now,
    created_at: existingIdx >= 0 ? inMemoryPages[existingIdx].created_at : now
  };

  if (existingIdx >= 0) {
    inMemoryPages[existingIdx] = { ...inMemoryPages[existingIdx], ...pageData };
  } else {
    inMemoryPages.unshift(pageData);
  }

  return res.json({ success: true, data: pageData });
});

// PATCH /api/pages/:id/review - Review status change (Submit for Review, Approve, Reject, Publish)
pagesRouter.patch('/:id/review', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewed_by, review_notes } = req.body;

  const page = inMemoryPages.find(p => p.id === id);
  if (!page) {
    return res.status(404).json({ success: false, error: 'Page not found' });
  }

  page.status = status;
  page.reviewed_by = reviewed_by || 'Head of UI/UX';
  page.review_notes = review_notes || '';
  page.updated_at = new Date().toISOString();

  if (status === 'published') {
    page.published_at = new Date().toISOString();
  }

  return res.json({ success: true, data: page });
});
