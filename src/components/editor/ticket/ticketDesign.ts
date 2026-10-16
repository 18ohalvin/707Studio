import type { ActivationPage } from '../../../types/editor.ts';
import { defaultTicketWidgets, type TicketContext } from './ticketFields.ts';

/**
 * Which ticket design and which details a campaign's PDF is made from. Shared by
 * the live page, the editor and the hub so a ticket never differs by where it is made.
 */
const isPass = (w: any) => w?.type === 'GuestEPass' || w?.type === 'LiveQueuePass';
const hasBrandLogoField = (w: any) =>
  w?.type === 'TicketField' && (Array.isArray(w.props?.fields) ? w.props.fields.includes('brandLogo') : w.props?.field === 'brandLogo');

/** The standard ticket layout, for campaigns that never got a Ticket page of their own. */
export function defaultTicketPage(brandSlug = ''): ActivationPage {
  const now = new Date().toISOString();
  return {
    id: 'ticket_default',
    brand_id: '1',
    brand_slug: brandSlug,
    kind: 'ticket',
    title: 'Ticket',
    page_name: 'Ticket (PDF)',
    slug: 'ticket',
    description: 'Design of the downloadable PDF ticket',
    status: 'published',
    current_version: 1,
    widget_tree: defaultTicketWidgets().map((w, i) => ({ id: `${w.type.toLowerCase()}_default_${i}`, type: w.type, props: w.props })),
    page_settings: { seoTitle: 'Ticket', seoDescription: '', theme: 'the-707-standard' },
    created_at: now,
    updated_at: now
  } as ActivationPage;
}

/** The campaign's own Ticket page, or the standard layout — the PDF always uses the current ticket design. */
export function resolveTicketDesign(pages: ActivationPage[], title = '', brandSlug = ''): { page: ActivationPage; context: TicketContext } {
  const ticketPage = pages.find(p => p.kind === 'ticket') || null;
  const page = ticketPage || defaultTicketPage(brandSlug);
  const widgets = pages.flatMap(p => p.widget_tree || []);
  const pass = widgets.find(isPass) || null;
  const logoOwner = (pass?.props?.brandLogoUrl ? pass : null)
    || widgets.find(w => w.type === 'HeroDrop' && w.props?.brandLogoUrl)
    || widgets.find(w => w.props?.brandLogoUrl)
    || null;
  const ticketField = page.widget_tree?.find(hasBrandLogoField);
  return {
    page,
    context: {
      passWidget: pass,
      logoUrl: String(logoOwner?.props?.brandLogoUrl || ''),
      campaignTitle: title,
      logoColorMode: ticketField?.props?.logoColorMode || pass?.props?.logoColorMode || 'black'
    }
  };
}
