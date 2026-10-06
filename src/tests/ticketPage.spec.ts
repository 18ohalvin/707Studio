import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';

function addPassPrerequisites(store: ReturnType<typeof useEditorStore>) {
  store.addWidget('FieldInput', undefined, { label: 'Full Name', placeholder: 'Your Name*' });
  store.addWidget('MultipleChoice', undefined, { variant: 'detailed-card', options: [{ id: 'd1', label: 'Day 1', sublabel: '2 Sept 2026' }] });
}

describe('Ticket page (PDF ticket design)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('is created, last, when a Ticket Summary is added — once', () => {
    const store = useEditorStore();
    addPassPrerequisites(store);
    store.addWidget('GuestEPass');

    expect(store.ticketPageIndex).toBe(store.pages.length - 1);
    const ticket = store.pages[store.ticketPageIndex];
    expect(ticket.kind).toBe('ticket');
    expect(ticket.widget_tree.some(w => w.type === 'TicketField' && w.props.fields[0] === 'qr')).toBe(true);

    store.selectPage(0);
    store.addWidget('GuestEPass');
    expect(store.pages.filter(p => p.kind === 'ticket').length).toBe(1);
  });

  it('keeps the Ticket page last when pages are added or moved', () => {
    const store = useEditorStore();
    addPassPrerequisites(store);
    store.addWidget('GuestEPass');

    store.addPage();
    expect(store.pages[store.pages.length - 1].kind).toBe('ticket');
    expect(store.activePageIndex).toBe(store.pages.length - 2);

    store.movePage(store.ticketPageIndex, 0);
    expect(store.pages[store.pages.length - 1].kind).toBe('ticket');

    store.duplicatePage(store.ticketPageIndex);
    expect(store.pages.filter(p => p.kind === 'ticket').length).toBe(1);
  });

  it('only takes printable blocks, and ticket blocks only go there', () => {
    const store = useEditorStore();
    expect(store.canAddWidget('TicketField').allowed).toBe(false);

    store.ensureTicketPage();
    store.selectPage(store.ticketPageIndex);
    expect(store.canAddWidget('TicketField').allowed).toBe(true);
    expect(store.canAddWidget('TextBanner').allowed).toBe(true);
    expect(store.canAddWidget('HeroDrop').allowed).toBe(true);
    expect(store.canAddWidget('FieldInput').allowed).toBe(false);
    expect(store.canAddWidget('ActionButton').allowed).toBe(false);

    const block = store.addWidget('TicketField', undefined, { fields: ['guestName', 'guestType'] });
    expect(block?.props.fields).toEqual(['guestName', 'guestType']);
    expect(store.isTicketSidebarOpen).toBe(true);
  });

  it('turns a gallery image dropped on the Ticket into a normal, removable 16:9 banner', () => {
    const store = useEditorStore();
    store.ensureTicketPage();
    store.selectPage(store.ticketPageIndex);
    const before = store.currentPage.widget_tree.length;
    // What the Media Gallery adds on click / drag
    const banner = store.addWidget('HeroDrop', undefined, { imageUrl: '/uploads/a.jpeg', isSolidSpace: false, ratio: 'Full screen landing page' })!;
    expect(banner.props.ratio).toBe('16:9');
    expect(store.currentPage.widget_tree.length).toBe(before + 1);
    store.removeWidget(banner.id);
    expect(store.currentPage.widget_tree.some(w => w.id === banner.id)).toBe(false);
  });
});
