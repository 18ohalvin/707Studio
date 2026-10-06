// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import MobileArtboard from '../components/editor/MobileArtboard.vue';

function ticketPage(props: Record<string, any>) {
  return {
    id: 'pt', kind: 'ticket', brand_id: '1', brand_slug: 'x', title: 'Ticket', slug: 'ticket', status: 'draft', current_version: 1,
    created_at: '', updated_at: '', page_settings: { seoTitle: '', seoDescription: '', theme: 'x' },
    widget_tree: [{ id: 'b1', type: 'HeroDrop', props: { imageUrl: '/uploads/shoot.jpg', isSolidSpace: false, ratio: '16:9', mediaFit: 'Fill the screen', ...props } }]
  } as any;
}

async function mountBanner(props: Record<string, any> = {}, natural?: { w: number; h: number }) {
  const wrapper = mount(MobileArtboard, { props: { page: ticketPage(props), pageIndex: 1, isSelected: true }, global: { plugins: [createPinia()] } });
  await flushPromises();
  const img = wrapper.find('img[alt="Ticket banner"]');
  if (natural) {
    Object.defineProperty(img.element, 'naturalWidth', { value: natural.w, configurable: true });
    Object.defineProperty(img.element, 'naturalHeight', { value: natural.h, configurable: true });
    await img.trigger('load');
    await flushPromises();
  }
  return { wrapper, img, style: (img.element as HTMLElement).style };
}

describe('Ticket banners are drawn sharp', () => {
  it('uses a real image from the full-size upload, not a CSS background the PDF capture would soften', async () => {
    const { wrapper, img } = await mountBanner();
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe('/uploads/shoot.jpg?w=1600');
    expect(wrapper.html()).not.toContain('background-image');
  });

  it('stays hidden until its size is known, so it never flashes at the wrong size', async () => {
    const { style } = await mountBanner();
    expect(style.opacity).toBe('0');
  });

  it('covers the box exactly when the picture has the banner\'s own proportions', async () => {
    const { style } = await mountBanner({}, { w: 1600, h: 900 });
    expect(parseFloat(style.width)).toBeCloseTo(340, 2);
    expect(parseFloat(style.height)).toBeCloseTo(191.25, 2);
    expect(parseFloat(style.left)).toBeCloseTo(0, 2);
    expect(parseFloat(style.top)).toBeCloseTo(0, 2);
    expect(style.opacity).toBe('');
  });

  it('crops a square picture to the banner (cover), centred', async () => {
    const { style } = await mountBanner({}, { w: 1000, h: 1000 });
    expect(parseFloat(style.width)).toBeCloseTo(340, 2);
    expect(parseFloat(style.height)).toBeCloseTo(340, 2);
    expect(parseFloat(style.top)).toBeCloseTo((191.25 - 340) / 2, 2);
  });

  it('shows the whole picture with "Fit to screen" (contain), centred', async () => {
    const { style } = await mountBanner({ mediaFit: 'Fit to screen' }, { w: 1000, h: 1000 });
    expect(parseFloat(style.width)).toBeCloseTo(191.25, 2);
    expect(parseFloat(style.height)).toBeCloseTo(191.25, 2);
    expect(parseFloat(style.left)).toBeCloseTo((340 - 191.25) / 2, 2);
  });

  it('keeps its natural size with "Center"', async () => {
    const { style } = await mountBanner({ mediaFit: 'Center' }, { w: 400, h: 100 });
    expect(parseFloat(style.width)).toBeCloseTo(400, 2);
    expect(parseFloat(style.left)).toBeCloseTo((340 - 400) / 2, 2);
  });

  it('follows the banner ratio (4:3 is taller than 16:9)', async () => {
    const { style } = await mountBanner({ ratio: '4:3' }, { w: 1000, h: 1000 });
    // box is 340 × 255: a square picture covers it at 340 × 340
    expect(parseFloat(style.top)).toBeCloseTo((255 - 340) / 2, 2);
  });
});
