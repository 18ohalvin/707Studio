// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import MobileArtboard from '../components/editor/MobileArtboard.vue';

/** A published page: the widgets belong to the visitor's copy, not to the editor store. */
function livePage(required: boolean) {
  return {
    id: 'pg_live', brand_id: '1', brand_slug: 'fredperry', title: 'Claim', slug: 'claim', status: 'published',
    current_version: 1, created_at: '', updated_at: '', page_settings: { seoTitle: '', seoDescription: '', theme: 'x' },
    widget_tree: [
      {
        id: 'choice1', type: 'MultipleChoice',
        props: {
          variant: 'detailed-card', title: 'CLAIM YOUR TICKET', required, allowMultiple: false, selectedValues: [],
          options: [{ id: 'opt1', label: 'DNA NIGHT 2026', sublabel: '10 Oct 2026', description: 'Valid for one person only' }]
        }
      },
      { id: 'btn1', type: 'ActionButton', props: { label: 'CLAIM NOW', variant: 'black', actionType: 'submit', positionMode: 'in-flow' } }
    ]
  } as any;
}

describe('guests picking options on a published page', () => {
  beforeEach(() => setActivePinia(createPinia()));

  function mountLive(page: any) {
    return mount(MobileArtboard, {
      props: { page, pageIndex: 0, isSelected: false, isPreviewModal: true, isLivePage: true },
      global: { plugins: [createPinia()] }
    });
  }

  it('records the pick on the page the visitor is looking at', async () => {
    const page = livePage(true);
    const wrapper = mountLive(page);
    await flushPromises();

    await wrapper.findAll('span, p, div').find(el => el.text() === 'DNA NIGHT 2026')!.trigger('click');
    expect(page.widget_tree[0].props.selectedValues).toEqual(['opt1']);

    // Tapping it again unselects it
    await wrapper.findAll('span, p, div').find(el => el.text() === 'DNA NIGHT 2026')!.trigger('click');
    expect(page.widget_tree[0].props.selectedValues).toEqual([]);
  });

  it('lets the guest continue only once a required option is picked', async () => {
    const page = livePage(true);
    const wrapper = mountLive(page);
    await flushPromises();
    const next = () => wrapper.find('button');

    await next().trigger('click');
    expect(wrapper.emitted('next-page')).toBeUndefined(); // blocked: nothing picked

    await wrapper.findAll('span, p, div').find(el => el.text() === 'DNA NIGHT 2026')!.trigger('click');
    await next().trigger('click');
    expect(wrapper.emitted('next-page')).toHaveLength(1);
  });
});
