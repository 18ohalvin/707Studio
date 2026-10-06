// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import MobileArtboard from '../components/editor/MobileArtboard.vue';
import { clampLogoHeight, LOGO_HEIGHT, TICKET_LOGO_HEIGHT, logoImageWidth } from '../components/editor/logoSize.ts';
import { TICKET_CONTEXT_KEY } from '../components/editor/ticket/ticketFields.ts';

function heroPage(extra: Record<string, any> = {}, kind?: 'ticket') {
  return {
    id: 'p', kind, brand_id: '1', brand_slug: 'x', title: 't', slug: 's', status: 'published', current_version: 1,
    created_at: '', updated_at: '', page_settings: { seoTitle: '', seoDescription: '', theme: 'x' },
    widget_tree: [{
      id: 'h1', type: 'HeroDrop',
      props: { ratio: '16:9', isSolidSpace: true, isBrandLogoEnabled: true, brandLogoUrl: '/uploads/logo.png', ...extra }
    }]
  } as any;
}

function logoStyle(html: string): string {
  const img = new DOMParser().parseFromString(html, 'text/html').querySelector('img[alt="Brand Logo"]') as HTMLElement | null;
  return img?.getAttribute('style') || '';
}

describe('brand logo height', () => {
  const mountLive = (page: any) => mount(MobileArtboard, {
    props: { page, pageIndex: 0, isSelected: false, isPreviewModal: true, isLivePage: true },
    global: { plugins: [createPinia()] }
  });

  it('keeps 48px unless the editor sets another height', async () => {
    const wrapper = mountLive(heroPage());
    await flushPromises();
    expect(logoStyle(wrapper.html())).toContain('height: 48px');
  });

  it('draws the logo at the height the editor chose, small or large', async () => {
    for (const height of [20, 120, 200]) {
      const wrapper = mountLive(heroPage({ brandLogoHeight: height }));
      await flushPromises();
      expect(logoStyle(wrapper.html())).toContain(`height: ${height}px`);
    }
  });

  it('keeps text clear of a tall logo when the banner text sits at the top', async () => {
    const wrapper = mountLive(heroPage({ brandLogoHeight: 120, textPosition: 'top', showBannerText: true, headline: 'DNA NIGHT' }));
    await flushPromises();
    expect(wrapper.html()).toContain('padding-top: 140px');
  });

  it('clamps heights to a sane range and falls back for junk values', () => {
    expect(clampLogoHeight(undefined)).toBe(LOGO_HEIGHT.default);
    expect(clampLogoHeight('abc')).toBe(LOGO_HEIGHT.default);
    expect(clampLogoHeight(0)).toBe(LOGO_HEIGHT.default);
    expect(clampLogoHeight(5)).toBe(LOGO_HEIGHT.min);
    expect(clampLogoHeight(9999)).toBe(LOGO_HEIGHT.max);
    expect(clampLogoHeight('73')).toBe(73);
    expect(clampLogoHeight(300, TICKET_LOGO_HEIGHT)).toBe(TICKET_LOGO_HEIGHT.max);
  });

  it('asks the server for a bigger file when the logo is shown larger', () => {
    expect(logoImageWidth(48)).toBeLessThan(logoImageWidth(120));
  });

  it('sizes the logo block on the Ticket by its own setting', async () => {
    const page = heroPage({}, 'ticket');
    page.widget_tree = [{ id: 'tf', type: 'TicketField', props: { fields: ['brandLogo'], logoHeight: 64 } }];
    const wrapper = mount(MobileArtboard, {
      props: { page, pageIndex: 1, isSelected: true },
      global: {
        plugins: [createPinia()],
        provide: { [TICKET_CONTEXT_KEY as symbol]: { passWidget: null, logoUrl: '/uploads/logo.png', campaignTitle: 'Atmos Drop' } }
      }
    });
    await flushPromises();
    const img = new DOMParser().parseFromString(wrapper.html(), 'text/html').querySelector('img[alt="Brand logo"]');
    expect(img?.getAttribute('style')).toContain('height: 64px');
  });
});
