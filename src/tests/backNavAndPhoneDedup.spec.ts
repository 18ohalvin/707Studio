// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import { phoneKeyOf, stripInternal } from '../../server/src/submissionHelpers.ts';
import ProjectInfoSettingsModal from '../components/editor/Modals/ProjectInfoSettingsModal.vue';
import PublicDropView from '../views/PublicDropView.vue';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useAuthStore } from '../stores/authStore.ts';

describe('WhatsApp / Phone Deduplication Helper (phoneKeyOf)', () => {
  it('normalizes all Indonesian WhatsApp variants to the same canonical 628... key', () => {
    expect(phoneKeyOf('+62 812-3456-7890')).toBe('6281234567890');
    expect(phoneKeyOf('0812-3456-7890')).toBe('6281234567890');
    expect(phoneKeyOf('81234567890')).toBe('6281234567890');
    expect(phoneKeyOf('+62 0812 3456 7890')).toBe('6281234567890');
    expect(phoneKeyOf('6281234567890')).toBe('6281234567890');
  });

  it('extracts normalized phone keys from arbitrary form_data field names', () => {
    expect(phoneKeyOf({ whatsapp: '+62 811-2233-4455' })).toBe('6281122334455');
    expect(phoneKeyOf({ phone: '081122334455' })).toBe('6281122334455');
    expect(phoneKeyOf({ 'WhatsApp Number*': '+62 812 9999 0000' })).toBe('6281299990000');
    expect(phoneKeyOf({ 'No. HP': '085612345678' })).toBe('6285612345678');
    expect(phoneKeyOf({ 'Phone': '+65 9123 4567' })).toBe('6591234567');
  });

  it('returns null for blank, non-numeric, or too-short values and strips phone_key from public/staff output', () => {
    expect(phoneKeyOf('')).toBeNull();
    expect(phoneKeyOf('-')).toBeNull();
    expect(phoneKeyOf('12345')).toBeNull();
    expect(phoneKeyOf({})).toBeNull();

    const cleaned = stripInternal({
      id: 'sub_1',
      email_key: 'a@b.com',
      client_key: 'key_12345678',
      phone_key: '6281234567890',
      slot_picks: [],
      status: 'registered'
    });
    expect(cleaned).toEqual({ id: 'sub_1', status: 'registered' });
  });
});

describe('Back-Navigation Guard (Project Settings & PublicDropView)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.stubGlobal('BroadcastChannel', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('persists backNavigationMode across all pages in ProjectInfoSettingsModal', async () => {
    const store = useEditorStore();
    store.addPage();
    expect(store.pages.length).toBeGreaterThanOrEqual(2);

    const wrapper = mount(ProjectInfoSettingsModal, {
      props: { isOpen: true }
    });

    const restartBtn = wrapper.findAll('button').find(b => b.text().includes('Restart Flow'));
    expect(restartBtn).toBeTruthy();
    await restartBtn!.trigger('click');

    await wrapper.find('form').trigger('submit');
    for (const page of store.pages) {
      expect(page.page_settings.backNavigationMode).toBe('restart');
    }
  });

  it('moves an existing campaign from general to atmos via Brand Workspace selector in ProjectInfoSettingsModal', async () => {
    const store = useEditorStore();
    const brandStore = useBrandStore();
    const authStore = useAuthStore();

    authStore.isSuperAdmin = true;
    brandStore.brands = [
      { id: 'b_gen', name: 'General', slug: 'general' },
      { id: 'b_atmos', name: 'atmos Indonesia', slug: 'atmos' }
    ];

    store.pages[0].brand_slug = 'general';
    store.pages[0].slug = 'clubhouse';
    store.addPage();
    store.pages[1].brand_slug = 'general';
    store.projects = [
      {
        id: store.currentProjectId || 'proj_move_1',
        brand_id: 'b_gen',
        brand_slug: 'general',
        title: 'Clubhouse',
        slug: 'clubhouse',
        status: 'published',
        live_version: 1,
        current_version: 1,
        widget_tree: [],
        pages: store.pages,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    store.currentProjectId = store.projects[0].id;

    const wrapper = mount(ProjectInfoSettingsModal, {
      props: { isOpen: true }
    });

    const brandSelect = wrapper.find('select');
    expect(brandSelect.exists()).toBe(true);
    await brandSelect.setValue('atmos');
    await wrapper.vm.$nextTick();

    // Live campaign warning should appear when moving brand slug
    expect(wrapper.text()).toContain('/atmos/clubhouse');

    await wrapper.find('form').trigger('submit');
    expect(store.projects[0].brand_slug).toBe('atmos');
    for (const page of store.pages) {
      expect(page.brand_slug).toBe('atmos');
    }
  });

  async function mountLiveDrop(backNavigationMode: 'allow' | 'block' | 'restart') {
    const pages = [
      {
        id: 'p1',
        brand_id: 'b1',
        brand_slug: 'on',
        title: 'Landing',
        slug: 'clubhouse',
        status: 'published',
        current_version: 1,
        widget_tree: [
          { id: 'cta_1', type: 'ActionButton', props: { label: 'APPLY', actionType: 'submit', positionMode: 'sticky-bottom' } }
        ],
        page_settings: { seoTitle: 'Clubhouse', seoDescription: '', theme: 'the-707-standard', backNavigationMode }
      },
      {
        id: 'p2',
        brand_id: 'b1',
        brand_slug: 'on',
        title: 'Questions',
        slug: 'questions',
        status: 'published',
        current_version: 1,
        widget_tree: [
          {
            id: 'mc_1',
            type: 'MultipleChoice',
            props: {
              title: 'Own On Tennis?',
              options: [{ id: 'o1', label: 'Yes' }, { id: 'o2', label: 'No' }],
              selectedValues: []
            }
          },
          { id: 'cta_2', type: 'ActionButton', props: { label: 'CONFIRM', actionType: 'submit', positionMode: 'sticky-bottom' } }
        ],
        page_settings: { seoTitle: 'Clubhouse', seoDescription: '', theme: 'the-707-standard', backNavigationMode }
      },
      {
        id: 'p3',
        brand_id: 'b1',
        brand_slug: 'on',
        title: 'Thanks',
        slug: 'thanks',
        status: 'published',
        current_version: 1,
        widget_tree: [
          { id: 'txt_3', type: 'TextBanner', props: { text: 'Thank you for registering.' } }
        ],
        page_settings: { seoTitle: 'Clubhouse', seoDescription: '', theme: 'the-707-standard', backNavigationMode }
      }
    ];

    const fetchMock = vi.fn(async (url: string) => {
      if (String(url).includes('/api/pages/')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'proj_1', brand_slug: 'on', slug: 'clubhouse', title: 'Clubhouse', status: 'published', pages }
          })
        } as any;
      }
      if (String(url).includes('/api/submissions')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            data: { id: 'sub_1', page_id: 'proj_1', ticket_code: '707-TEST', status: 'pending', form_data: { fullName: 'Alvin', email: 'a@707.co.id' } }
          })
        } as any;
      }
      return { ok: true, json: async () => ({ success: true, data: {} }) } as any;
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:brandSlug/:pageSlug', name: 'PublicDrop', component: PublicDropView }]
    });
    await router.push('/on/clubhouse');
    await router.isReady();

    const wrapper = mount(PublicDropView, {
      global: { plugins: [router] }
    });
    await flushPromises();
    return wrapper;
  }

  it('blocks browser Back (popstate) when backNavigationMode is "block"', async () => {
    const wrapper = await mountLiveDrop('block');
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    // Advance from Page 1 -> Page 2
    const applyBtn = wrapper.findAll('button').find(b => b.text().toUpperCase().includes('APPLY'));
    expect(applyBtn).toBeTruthy();
    await applyBtn!.trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Own On Tennis?');

    // Simulate browser Back button (popstate) -> MUST stay on Page 2
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flushPromises();
    expect(wrapper.text()).toContain('Own On Tennis?');
    expect(pushStateSpy).toHaveBeenCalled();

    wrapper.unmount();
    vi.unstubAllGlobals();
  });

  it('restarts at Page 1 and clears answers on Back when backNavigationMode is "restart"', async () => {
    const wrapper = await mountLiveDrop('restart');

    // Advance Page 1 -> Page 2
    const applyBtn = wrapper.findAll('button').find(b => b.text().toUpperCase().includes('APPLY'));
    await applyBtn!.trigger('click');
    await flushPromises();
    expect(wrapper.text()).toContain('Own On Tennis?');

    // Simulate browser Back -> restarts at Page 1 ("APPLY")
    window.dispatchEvent(new PopStateEvent('popstate'));
    await flushPromises();
    expect(wrapper.text()).toContain('APPLY');
    expect(wrapper.text()).not.toContain('Own On Tennis?');

    wrapper.unmount();
    vi.unstubAllGlobals();
  });
});
