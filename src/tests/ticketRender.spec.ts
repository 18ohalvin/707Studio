// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';
import MobileArtboard from '../components/editor/MobileArtboard.vue';
import { LIVE_PASS_KEY, type LivePassState } from '../components/editor/livePass.ts';
import { TICKET_CONTEXT_KEY } from '../components/editor/ticket/ticketFields.ts';

describe('Ticket page rendering', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  function ticketPage() {
    const store = useEditorStore();
    store.ensureTicketPage();
    return store.pages[store.ticketPageIndex];
  }

  it('renders as a fixed 9:16 canvas without the 707 header, with sample data in the editor', async () => {
    const page = ticketPage();
    const wrapper = mount(MobileArtboard, { props: { page, pageIndex: 1, isSelected: true }, global: { plugins: [pinia] } });
    await flushPromises();

    expect(wrapper.html()).toContain('h-[604px]');
    expect(wrapper.find('img[alt="707 Logo"]').exists()).toBe(false);
    const text = wrapper.text();
    expect(text).toContain('GUEST NAME');
    expect(text).toContain('ACCESS ID');
    // Sample Access ID in the server's format, never the old fixed code
    expect(text).toMatch(/\d{6}-\d{4}-[A-Z2-9]{4}/);
    expect(text).not.toContain('020305-1008-1245');
  });

  it('prints the guest\'s own recorded data when rendered for their PDF', async () => {
    const page = ticketPage();
    const livePass: LivePassState = {
      status: 'ready',
      code: '061026-1136-RVD5',
      guestName: 'Rian Pratama',
      email: 'rian@atmos.co',
      guestType: 'VIP',
      sessions: [{ label: 'Day 2 — Raffle Draw', sublabel: '3 Sept 2026' }],
      error: '',
      retry: () => {}
    };
    const wrapper = mount(MobileArtboard, {
      props: { page, pageIndex: 0, isSelected: false, isPreviewModal: true, isLivePage: true },
      global: {
        plugins: [pinia],
        provide: {
          [LIVE_PASS_KEY as symbol]: livePass,
          [TICKET_CONTEXT_KEY as symbol]: { passWidget: { type: 'GuestEPass', props: { venue: 'Plaza Senayan' } }, logoUrl: '', campaignTitle: 'Atmos Drop' }
        }
      }
    });
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('RIAN PRATAMA');
    expect(text).toContain('061026-1136-RVD5');
    expect(text).toContain('VIP');
    expect(text).toContain('Plaza Senayan'); // shown uppercase by CSS
    expect(text).toContain('Day 2 — Raffle Draw');
    // No logo uploaded: the campaign title stands in
    expect(text).toContain('Atmos Drop');
  });
});
