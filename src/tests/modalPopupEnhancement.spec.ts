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

  it('keeps sticky modal submit button disabled until required RegistrationForm fields are complete and prevents skipping', async () => {
    const store = useEditorStore();
    const regForm = {
      id: 'reg_form_1',
      type: 'RegistrationForm',
      props: {
        heading: 'REGISTRATION FORM',
        fields: [
          { id: 'f_name', name: 'Full Name', type: 'text', required: true, value: '' },
          { id: 'f_email', name: 'E-Mail', type: 'email', required: true, value: '' },
          { id: 'f_phone', name: 'WhatsApp Number', type: 'tel', required: true, value: '' }
        ]
      }
    };
    const stickyModalBtn = {
      id: 'btn_sticky_submit',
      type: 'ActionButton',
      props: {
        label: 'SUBMIT APPLICATION',
        positionMode: 'sticky-bottom',
        actionType: 'modal',
        modalProps: {
          variant: 'message-alert',
          title: 'Confirm Submission',
          subtitle: 'Submit your application now?',
          buttonLayout: 'dual',
          buttonText: 'Yes, Submit',
          buttonAction: 'next_page',
          buttonTargetPageId: 'page_2',
          secondaryButtonText: 'Cancel',
          secondaryButtonAction: 'submit-close'
        }
      }
    };

    store.pages = [
      makePage('page_1', 'Registration Form', [regForm, stickyModalBtn]),
      makePage('page_2', 'Thank You', [])
    ];
    store.activePageIndex = 0;

    const wrapper = mount(MobileArtboard, {
      props: {
        page: store.pages[0],
        pageIndex: 0,
        isSelected: true,
        isPreviewModal: true
      }
    });

    // 1. With empty fields, sticky button MUST be disabled and inactive
    const stickyBtn = wrapper.findAll('button').find(b => b.text().toUpperCase().includes('SUBMIT APPLICATION'));
    expect(stickyBtn).toBeTruthy();
    expect(stickyBtn!.attributes('disabled')).toBeDefined();

    // 2. Clicking the sticky wrapper MUST NOT open the modal or skip the form; it should set field errors
    await stickyBtn!.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-name="Bottom Modal Popup"]').exists()).toBe(false);
    expect(store.activePageIndex).toBe(0);
    const reactiveFields = store.pages[0].widget_tree[0].props.fields as any[];
    expect(reactiveFields[0].errorMessage).toBeTruthy();

    // 3. Fill all fields via reactive store state with an invalid email -> still disabled
    reactiveFields[0].value = 'Alvin';
    reactiveFields[1].value = 'not-an-email';
    reactiveFields[2].value = '081234567890';
    await wrapper.vm.$nextTick();
    expect(stickyBtn!.attributes('disabled')).toBeDefined();

    // 4. Fix email -> sticky button becomes enabled, opens modal, and Button 1 advances to page_2
    reactiveFields[1].value = 'alvin@707.co.id';
    await wrapper.vm.$nextTick();
    expect(stickyBtn!.attributes('disabled')).toBeUndefined();

    await stickyBtn!.trigger('click');
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-name="Bottom Modal Popup"]').exists()).toBe(true);

    await wrapper.find('[data-modal-btn="primary"]').trigger('click');
    expect(store.activePageIndex).toBe(1);
  });

  it('prevents disabled sticky submit button from skipping a required MultipleChoice page when clicking wrapper', async () => {
    const store = useEditorStore();
    const choiceWidget = {
      id: 'mc_1',
      type: 'MultipleChoice',
      props: {
        heading: 'How often do you play tennis?',
        options: [
          { id: 'opt_1', label: 'Less than once a week' },
          { id: 'opt_2', label: '1-2 times a week' }
        ],
        selectedValues: []
      }
    };
    const stickySubmitBtn = {
      id: 'btn_sticky_mc',
      type: 'ActionButton',
      props: {
        label: 'CONFIRM',
        positionMode: 'sticky-bottom',
        actionType: 'submit'
      }
    };

    store.pages = [
      makePage('page_1', 'Questions', [choiceWidget, stickySubmitBtn]),
      makePage('page_2', 'Registration', [])
    ];
    store.activePageIndex = 0;

    const wrapper = mount(MobileArtboard, {
      props: {
        page: store.pages[0],
        pageIndex: 0,
        isSelected: true,
        isPreviewModal: true
      }
    });

    const confirmBtn = wrapper.findAll('button').find(b => b.text().toUpperCase().includes('CONFIRM'));
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn!.attributes('disabled')).toBeDefined();

    // Clicking parent wrapper must NOT advance past unselected MultipleChoice
    await confirmBtn!.element.parentElement!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(store.activePageIndex).toBe(0);
  });
});
