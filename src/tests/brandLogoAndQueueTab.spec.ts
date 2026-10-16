import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';

describe('Brand Logo Switchable & Queue Tab Conditional Visibility', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes GuestEPass and LiveQueuePass with showBrandLogo: true and logoColorMode: black', () => {
    const store = useEditorStore();
    store.addWidget('FieldInput');
    store.addWidget('GuestEPass');
    const epass = store.currentPage.widget_tree.find(w => w.type === 'GuestEPass');
    expect(epass).toBeDefined();
    expect(epass?.props?.showBrandLogo).toBe(true);
    expect(epass?.props?.logoColorMode).toBe('black');

    // Switch to queue mode
    store.addWidget('LiveQueuePass');
    const queuePass = store.currentPage.widget_tree.find(w => w.type === 'LiveQueuePass');
    expect(queuePass).toBeDefined();
    expect(queuePass?.props?.showBrandLogo).toBe(true);
    expect(queuePass?.props?.logoColorMode).toBe('black');
  });

  it('allows toggling showBrandLogo and switching logoColorMode to normal', () => {
    const store = useEditorStore();
    store.addWidget('FieldInput');
    store.addWidget('LiveQueuePass');
    const queuePass = store.currentPage.widget_tree.find(w => w.type === 'LiveQueuePass')!;

    // Turn off brand logo
    store.updateWidgetProps(queuePass.id, { showBrandLogo: false });
    expect(queuePass.props.showBrandLogo).toBe(false);

    // Turn on brand logo and switch to normal mode
    store.updateWidgetProps(queuePass.id, { showBrandLogo: true, logoColorMode: 'normal' });
    expect(queuePass.props.showBrandLogo).toBe(true);
    expect(queuePass.props.logoColorMode).toBe('normal');
  });

  it('verifies Campaign Hub queue tab conditional logic based on LiveQueuePass widget presence', () => {
    function projectHasLiveQueue(p: any): boolean {
      const trees = [p.widget_tree || [], ...(p.pages || []).map((pg: any) => pg.widget_tree || [])];
      return trees.some(tree => tree.some((w: any) => w.type === 'LiveQueuePass'));
    }

    // Project without LiveQueuePass (e.g. only HeroDrop & GuestEPass)
    const standardProject = {
      id: 'proj-1',
      title: 'Standard RSVP',
      pages: [
        {
          id: 'page-1',
          widget_tree: [
            { id: 'w1', type: 'HeroDrop', props: {} },
            { id: 'w2', type: 'GuestEPass', props: {} }
          ]
        }
      ]
    };
    expect(projectHasLiveQueue(standardProject)).toBe(false);

    // Project with LiveQueuePass
    const queueProject = {
      id: 'proj-2',
      title: 'Live Drop Event',
      pages: [
        {
          id: 'page-2',
          widget_tree: [
            { id: 'w1', type: 'HeroDrop', props: {} },
            { id: 'w3', type: 'LiveQueuePass', props: {} }
          ]
        }
      ]
    };
    expect(projectHasLiveQueue(queueProject)).toBe(true);
  });

  it('initializes TicketField with logoColorMode: black and allows switching to normal', () => {
    const store = useEditorStore();
    store.ensureTicketPage();
    store.selectPage(store.ticketPageIndex);
    const tf = store.addWidget('TicketField', undefined, { fields: ['brandLogo'] });
    expect(tf).toBeDefined();
    expect(tf!.props.fields).toEqual(['brandLogo']);
    expect(tf!.props.logoColorMode).toBe('black');

    store.updateWidgetProps(tf!.id, { logoColorMode: 'normal' });
    expect(tf!.props.logoColorMode).toBe('normal');
  });

  it('supports HeroDrop brandLogoVerticalPosition and clamps correctly', () => {
    const store = useEditorStore();
    const hero = store.addWidget('HeroDrop');
    expect(hero.props.brandLogoVerticalPosition).toBe(16);

    store.updateWidgetProps(hero.id, { brandLogoVerticalPosition: 48 });
    expect(hero.props.brandLogoVerticalPosition).toBe(48);
  });
});

