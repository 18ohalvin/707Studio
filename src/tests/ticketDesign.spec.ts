import { describe, it, expect } from 'vitest';
import { resolveTicketDesign } from '../components/editor/ticket/ticketDesign.ts';

const page = (widgets: any[], kind?: string): any => ({ id: 'p', kind, widget_tree: widgets });

describe('resolveTicketDesign', () => {
  it('finds the hero banner logo when the pass has none', () => {
    const { context } = resolveTicketDesign([
      page([{ type: 'HeroDrop', props: { brandLogoUrl: '/uploads/stanley.png' } }, { type: 'GuestEPass', props: { brandLogoUrl: '' } }])
    ], 'Stanley');
    expect(context.logoUrl).toBe('/uploads/stanley.png');
  });

  it('uses the standard ticket layout when the campaign has no Ticket page', () => {
    const { page: ticket } = resolveTicketDesign([page([])]);
    expect(ticket.kind).toBe('ticket');
    expect(ticket.widget_tree.length).toBeGreaterThan(0);
  });

  it('prefers the campaign\'s own Ticket page', () => {
    const own = page([{ type: 'TicketField', props: { fields: ['qr'] } }], 'ticket');
    expect(resolveTicketDesign([page([]), own]).page).toBe(own);
  });
});
