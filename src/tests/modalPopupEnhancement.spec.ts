// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import MobileArtboard from '../components/editor/MobileArtboard.vue';
import ModalSetupSidebar from '../components/editor/ModalSetupSidebar.vue';
import { useEditorStore } from '../stores/editorStore.ts';

function makePage(id: string, title: string, widgets: any[]) {
  return {
    id,
    brand_id: 'brand_1',
    brand_slug: 'test-brand',
    title,
    slug: id,
    status: 'draft' as const,
    current_version: 1,
    widget_tree: widgets,
    page_settings: {
      seoTitle: title,
      seoDescription: '',
      theme: 'the-707-standard' as const
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

describe('Modal Pop-up Enhancements (Dual Message/Alert Buttons, Padding, No Swipe Handle)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders dual buttons on Message/Alert modal with increased padding and no top swipe indicator', async () => {
    const store = useEditorStore();
    const modalBtnWidget = {
      id: 'btn_modal_1',
      type: 'ActionButton',
      props: {
        label: 'OPEN ALERT',
        actionType: 'modal',
        modalProps: {
          variant: 'message-alert',
          title: 'Confirm Your Selection',
          subtitle: 'Choose whether to continue or visit the event guide.',
          buttonLayout: 'dual',
          dualOrientation: 'horizontal',
          buttonText: 'Continue',
          buttonVariant: 'black',
          buttonAction: 'next_page',
          buttonTargetPageId: 'page_2',
          secondaryButtonText: 'Event Guide',
          secondaryButtonVariant: 'ghost',
          secondaryButtonAction: 'link',
          secondaryButtonUrl: 'https://events.707.co.id/guide',
          secondaryButtonOpenInNewTab: true,
          dismissible: true
        }
      }
    };

    store.pages = [
      makePage('page_1', 'Page 1', [modalBtnWidget]),
      makePage('page_2', 'Page 2', []),
      makePage('page_3', 'Page 3', [])
    ];
    store.activePageIndex = 0;
    store.selectWidget('btn_modal_1');
    store.openModalSidebar();

    const wrapper = mount(MobileArtboard, {
      props: {
        page: store.pages[0],
        pageIndex: 0,
        isSelected: true,
        isPreviewModal: true
      }
    });

    const modalCard = wrapper.find('[data-name="Bottom Modal Popup"]');
    expect(modalCard.exists()).toBe(true);

    // 3. Top swipe indicator removed
    expect(modalCard.html()).not.toContain('w-10 h-1 rounded-full bg-neutral-300');

    // 2. Top (+8px -> pt-[24px]) and bottom (+16px -> pb-[36px]) padding applied
    expect(modalCard.html()).toContain('pt-[24px]');
    expect(modalCard.html()).toContain('pb-[36px]');

    // 1. Dual buttons rendered side by side with distinct labels
    const dualWrap = modalCard.find('[data-name="Modal Dual Buttons"]');
    expect(dualWrap.exists()).toBe(true);
    expect(dualWrap.classes()).toContain('grid-cols-2');

    const primaryBtn = modalCard.find('[data-modal-btn="primary"]');
    const secondaryBtn = modalCard.find('[data-modal-btn="secondary"]');
    expect(primaryBtn.exists()).toBe(true);
    expect(secondaryBtn.exists()).toBe(true);
    expect(primaryBtn.text().toUpperCase()).toContain('CONTINUE');
    expect(secondaryBtn.text().toUpperCase()).toContain('EVENT GUIDE');
  });

  it('executes independent actions for Button 1 (Go to Page) and Button 2 (Link URL)', async () => {
    const store = useEditorStore();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const modalBtnWidget = {
      id: 'btn_modal_dual',
      type: 'ActionButton',
      props: {
        label: 'OPEN',
        actionType: 'modal',
        modalProps: {
          variant: 'message-alert',
          title: 'Proceed?',
          subtitle: 'Pick an independent action.',
          buttonLayout: 'dual',
          dualOrientation: 'vertical',
          buttonText: 'Go Page 3',
          buttonAction: 'next_page',
          buttonTargetPageId: 'page_3',
          secondaryButtonText: 'Open Docs',
          secondaryButtonAction: 'link',
          secondaryButtonUrl: 'https://707.co.id/docs',
          secondaryButtonOpenInNewTab: true,
          dismissible: true
        }
      }
    };

    store.pages = [
      makePage('page_1', 'Page 1', [modalBtnWidget]),
      makePage('page_2', 'Page 2', []),
      makePage('page_3', 'Page 3', [])
    ];
    store.activePageIndex = 0;
    store.selectWidget('btn_modal_dual');
    store.openModalSidebar();

    const wrapper = mount(MobileArtboard, {
      props: {
        page: store.pages[0],
        pageIndex: 0,
        isSelected: true,
        isPreviewModal: true
      }
    });

    // Click secondary button -> opens independent Link URL
    await wrapper.find('[data-modal-btn="secondary"]').trigger('click');
    expect(openSpy).toHaveBeenCalledWith('https://707.co.id/docs', '_blank', 'noopener,noreferrer');
    expect(store.activePageIndex).toBe(0);

    // Reopen modal and click primary button -> navigates to independent Target Page (page_3 -> index 2)
    store.openModalSidebar();
    await wrapper.vm.$nextTick();
    await wrapper.find('[data-modal-btn="primary"]').trigger('click');
    expect(store.activePageIndex).toBe(2);

    openSpy.mockRestore();
  });

  it('configures Dual mode and independent Button 2 settings in ModalSetupSidebar for message-alert', async () => {
    const store = useEditorStore();
    const widget = {
      id: 'btn_setup_1',
      type: 'ActionButton',
      props: {
        label: 'INFO',
        actionType: 'modal',
        modalProps: {
          variant: 'message-alert',
          title: 'Notice',
          subtitle: 'Details here',
          buttonText: 'Confirm',
          buttonAction: 'submit-close'
        }
      }
    };

    store.pages = [
      makePage('page_1', 'Page 1', [widget]),
      makePage('page_2', 'Page 2', [])
    ];
    store.activePageIndex = 0;
    store.selectWidget('btn_setup_1');
    store.openModalSidebar();

    const wrapper = mount(ModalSetupSidebar, {
      props: { isOpen: true }
    });

    // Switch to Action tab
    const actionTabBtn = wrapper.findAll('button').find(b => b.text().trim() === 'Action');
    expect(actionTabBtn).toBeTruthy();
    await actionTabBtn!.trigger('click');

    // Click Dual button layout
    const dualBtn = wrapper.findAll('button').find(b => b.text().trim() === 'Dual');
    expect(dualBtn).toBeTruthy();
    await dualBtn!.trigger('click');

    const updated = store.currentPage.widget_tree[0].props.modalProps;
    expect(updated.buttonLayout).toBe('dual');
    expect(updated.secondaryButtonText).toBe('Cancel');
    expect(updated.secondaryButtonAction).toBe('submit-close');
    expect(wrapper.text()).toContain('Button 1 (Primary)');
    expect(wrapper.text()).toContain('Button 2 (Secondary)');
  });
});
