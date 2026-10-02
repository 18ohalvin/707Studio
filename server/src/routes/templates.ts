import { Router, Request, Response } from 'express';
import { pool, getDbStatus } from '../db.js';

export const templatesRouter = Router();

const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Hype Sneaker Raffle Standard',
    slug: 'hype-sneaker-raffle-std',
    description: 'Official 707 Sneaker Raffle template with countdown timer, shoe sizing selector (US/UK/EU), Instagram verification, and terms accordion.',
    category: 'raffle',
    widget_tree: [
      {
        id: 'hero_1',
        type: 'HeroDrop',
        props: {
          title: 'EXCLUSIVE DROP',
          subtitle: 'LIMITED ALLOCATION RAFFLE',
          badge: 'ONLINE EXCLUSIVE',
          imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
          dropDate: '2026-10-01T10:00:00Z'
        }
      },
      {
        id: 'countdown_1',
        type: 'CountdownTimer',
        props: {
          label: 'RAFFLE CLOSES IN',
          targetDate: '2026-10-01T23:59:59Z',
          expiredText: 'RAFFLE CLOSED'
        }
      },
      {
        id: 'raffle_form_1',
        type: 'RaffleForm',
        props: {
          heading: 'ENTER RAFFLE',
          subheading: 'One entry per verified ID/KTP',
          sizeSystem: 'US Mens',
          sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
          requireInstagram: true,
          requirePhone: true,
          ctaLabel: 'SUBMIT ENTRY'
        }
      },
      {
        id: 'rules_1',
        type: 'RulesAccordion',
        props: {
          title: 'TERMS & CONDITIONS',
          items: [
            { title: 'Eligibility', content: 'Open to Indonesian residents with valid KTP/ID.' },
            { title: 'Winning Notification', content: 'Winners will receive WhatsApp and Email confirmation with payment instructions.' },
            { title: 'Payment & Collection', content: 'Must complete payment within 2 hours of notification.' }
          ]
        }
      }
    ],
    is_global_preset: true,
    status: 'published',
    created_by: 'Head of UI/UX'
  },
  {
    id: 'tpl-2',
    name: 'VIP Brand Event RSVP Pass',
    slug: 'vip-brand-event-rsvp',
    description: 'Exclusive brand opening and secret pop-up RSVP with digital pass preview and capacity quota.',
    category: 'rsvp',
    widget_tree: [
      {
        id: 'hero_rsvp_1',
        type: 'HeroDrop',
        props: {
          title: 'PRIVATE VIP PREVIEW',
          subtitle: 'AUTUMN / WINTER ACTIVATION',
          badge: 'INVITATION ONLY',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
          dropDate: '2026-10-15T18:00:00Z'
        }
      },
      {
        id: 'rsvp_form_1',
        type: 'RsvpForm',
        props: {
          heading: 'CONFIRM ATTENDANCE',
          subheading: 'Limited to 150 passes',
          sessions: [
            { label: 'Session A: 18:00 - 20:00', remaining: 24 },
            { label: 'Session B: 20:00 - 22:00', remaining: 18 }
          ],
          includePlusOne: true,
          ctaLabel: 'RESERVE MY PASS'
        }
      },
      {
        id: 'location_1',
        type: 'LocationCard',
        props: {
          venueName: '707 Space Jakarta',
          address: 'Jl. Kemang Raya No. 707, Jakarta Selatan',
          googleMapsUrl: 'https://maps.google.com'
        }
      }
    ],
    is_global_preset: true,
    status: 'published',
    created_by: 'Head of UI/UX'
  }
];

// In-memory cache
let inMemoryTemplates = [...DEFAULT_TEMPLATES];

// GET /api/templates
templatesRouter.get('/', async (req: Request, res: Response) => {
  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
      return res.json({ success: true, data: result.rows });
    } catch (err: any) {
      console.error('Error fetching templates from DB:', err.message);
    }
  }
  return res.json({ success: true, data: inMemoryTemplates });
});

// POST /api/templates - Build new template (Superadmin)
templatesRouter.post('/', async (req: Request, res: Response) => {
  const { name, slug, description, category, widget_tree, status, created_by } = req.body;
  const newTemplate = {
    id: `tpl-${Date.now()}`,
    name,
    slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    category: category || 'custom',
    widget_tree: widget_tree || [],
    status: status || 'draft',
    is_global_preset: true,
    created_by: created_by || 'Superadmin'
  };

  if (getDbStatus().isConnected) {
    try {
      const result = await pool.query(
        `INSERT INTO templates (name, slug, description, category, widget_tree, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [newTemplate.name, newTemplate.slug, newTemplate.description, newTemplate.category, JSON.stringify(newTemplate.widget_tree), newTemplate.status, newTemplate.created_by]
      );
      return res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err: any) {
      console.error('Error saving template to DB:', err.message);
    }
  }

  inMemoryTemplates.unshift(newTemplate);
  return res.status(201).json({ success: true, data: newTemplate });
});

// PUT /api/templates/:id - Update existing template / toggle publish status
templatesRouter.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = inMemoryTemplates.findIndex(t => t.id === id);
  if (idx !== -1) {
    inMemoryTemplates[idx] = { ...inMemoryTemplates[idx], ...updates };
  }

  if (getDbStatus().isConnected) {
    try {
      const fields = Object.keys(updates);
      if (fields.length > 0) {
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const values = fields.map(f => typeof updates[f] === 'object' ? JSON.stringify(updates[f]) : updates[f]);
        values.push(id);
        const result = await pool.query(
          `UPDATE templates SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
          values
        );
        if (result.rows.length > 0) {
          return res.json({ success: true, data: result.rows[0] });
        }
      }
    } catch (err: any) {
      console.error('Error updating template in DB:', err.message);
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
      console.error('Error deleting template from DB:', err.message);
    }
  }

  return res.json({ success: true, message: 'Template removed successfully' });
});
