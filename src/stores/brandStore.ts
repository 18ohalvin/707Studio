import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Brand, GlobalTemplate } from '../types/editor.ts';

export const useBrandStore = defineStore('brand', () => {
  const brands = ref<Brand[]>([
    { id: '1', name: 'atmos Indonesia', slug: 'atmos', description: 'atmos streetwear & sneaker destination', primary_color: '#000000' },
    { id: '2', name: 'Fred Perry', slug: 'fred-perry', description: 'Iconic British laurel wreath sportswear', primary_color: '#1a1a1a' },
    { id: '3', name: 'Vans Store Indonesia', slug: 'vans', description: 'Action sports footwear and apparel', primary_color: '#c8102e' },
    { id: '4', name: 'Converse Flagship', slug: 'converse', description: 'Classic Chuck Taylor and collaborative drops', primary_color: '#000000' },
    { id: '5', name: 'ASICS SportStyle', slug: 'asics', description: 'Performance and lifestyle sneaker collaborations', primary_color: '#001e62' },
    { id: '6', name: 'New Balance Heritage', slug: 'new-balance', description: 'Craftsmanship and running silhouette drops', primary_color: '#cc0000' },
    { id: '7', name: 'Salomon Sportstyle', slug: 'salomon', description: 'Trail running and technical outdoor footwear', primary_color: '#111111' },
    { id: '8', name: 'Carhartt WIP', slug: 'carhartt-wip', description: 'Workwear in progress and streetwear essentials', primary_color: '#d49b42' },
    { id: '9', name: 'Stüssy Chapter', slug: 'stussy', description: 'Tribe culture and seasonal hype collections', primary_color: '#000000' },
    { id: '10', name: 'Pleasures', slug: 'pleasures', description: 'Punk, grunge, and modern graphic apparel', primary_color: '#000000' },
    { id: '11', name: 'Neighborhood Japan', slug: 'neighborhood', description: 'Craft with pride Tokyo streetwear', primary_color: '#1f1f1f' },
    { id: '12', name: 'Beams Plus', slug: 'beams-plus', description: 'Japanese timeless menswear aesthetics', primary_color: '#e65c00' },
    { id: '13', name: 'Puma Select', slug: 'puma', description: 'Heritage motorsport and street collaborations', primary_color: '#000000' },
    { id: '14', name: 'Mizuno Sportstyle', slug: 'mizuno', description: 'Japanese performance running and Kazoku drops', primary_color: '#0d1b2a' },
    { id: '15', name: 'Hoka One One', slug: 'hoka', description: 'Maximalist cushioning footwear releases', primary_color: '#0072ce' },
    { id: '16', name: 'On Running', slug: 'on-running', description: 'CloudTec footwear and apparel launches', primary_color: '#000000' },
    { id: '17', name: 'Dickies 1922', slug: 'dickies', description: 'Authentic rugged workwear collections', primary_color: '#b32025' },
    { id: '18', name: 'Gramicci', slug: 'gramicci', description: 'Yosemite climbing and lifestyle apparel', primary_color: '#9e2a2b' },
    { id: '19', name: 'Dr. Martens', slug: 'dr-martens', description: 'Iconic yellow-stitched boots and shoes', primary_color: '#ffcc00' },
    { id: '20', name: '707 Vault / Exclusive', slug: '707-vault', description: 'The 707 Company private archive and VIP drop hub', primary_color: '#000000' }
  ]);

  const activeBrand = ref<Brand>(brands.value[0]);

  const templates = ref<GlobalTemplate[]>([
    {
      id: 'tpl-1',
      name: 'Hype Sneaker Raffle Standard',
      slug: 'hype-sneaker-raffle-std',
      description: 'Official 707 Sneaker Raffle template with countdown timer, shoe sizing selector (US/UK/EU), Instagram verification, and terms accordion.',
      category: 'raffle',
      is_global_preset: true,
      created_by: 'Head of UI/UX',
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
              { title: 'Winning Notification', content: 'Winners will receive WhatsApp and Email confirmation with payment instructions.' }
            ]
          }
        }
      ]
    },
    {
      id: 'tpl-2',
      name: 'VIP Brand Event RSVP Pass',
      slug: 'vip-brand-event-rsvp',
      description: 'Exclusive brand opening and secret pop-up RSVP with digital pass preview and capacity quota.',
      category: 'rsvp',
      is_global_preset: true,
      created_by: 'Head of UI/UX',
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
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  function setActiveBrand(brand: Brand) {
    activeBrand.value = brand;
  }

  function addTemplate(template: GlobalTemplate) {
    templates.value.unshift(template);
    // Optionally sync with backend
    try {
      fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      }).catch(() => {});
    } catch {}
  }

  function updateTemplate(id: string, updates: Partial<GlobalTemplate>) {
    const idx = templates.value.findIndex(t => t.id === id);
    if (idx !== -1) {
      templates.value[idx] = { 
        ...templates.value[idx], 
        ...updates,
        updated_at: new Date().toISOString()
      };
      try {
        fetch(`/api/templates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        }).catch(() => {});
      } catch {}
    }
  }

  function removeTemplate(id: string) {
    templates.value = templates.value.filter(t => t.id !== id);
    try {
      fetch(`/api/templates/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}
  }

  function toggleTemplateStatus(id: string) {
    const tpl = templates.value.find(t => t.id === id);
    if (tpl) {
      const nextStatus = (tpl.status === 'published' ? 'draft' : 'published') as 'published' | 'draft';
      updateTemplate(id, { status: nextStatus });
    }
  }

  async function loadTemplates() {
    try {
      const res = await fetch('/api/templates');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          templates.value = json.data;
        }
      }
    } catch (err) {
      console.warn('Failed to load templates from server, keeping local default:', err);
    }
  }

  function removeBrand(idOrSlug: string) {
    brands.value = brands.value.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug);
  }

  return {
    brands,
    activeBrand,
    templates,
    setActiveBrand,
    removeBrand,
    addTemplate,
    updateTemplate,
    removeTemplate,
    toggleTemplateStatus,
    loadTemplates
  };
});
