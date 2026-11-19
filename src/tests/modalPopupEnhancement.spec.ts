// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import MobileArtboard from '../components/editor/MobileArtboard.vue';
import ModalSetupSidebar from '../components/editor/ModalSetupSidebar.vue';
import ChoiceSetupSidebar from '../components/editor/ChoiceSetupSidebar.vue';
import { useEditorStore } from '../stores/editorStore.ts';
import { resolveChoiceRouteOverride } from '../components/editor/ctaActions.ts';

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

  it('triggers choice-bound Pop-up Modal on CONFIRM for Question 2 "No" and advances to Registration Form for "Yes"', async () => {
    const store = useEditorStore();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const q1 = {
      id: 'mc_q1',
      type: 'MultipleChoice',
      props: {
        title: '1. How often do you play tennis?',
        options: [
          { id: 'q1_a', label: 'Less than once a week', routeAction: 'default' },
          { id: 'q1_b', label: '1-2 times a week', routeAction: 'default' }
        ],
        selectedValues: ['q1_a']
      }
    };
    const q2 = {
      id: 'mc_q2',
      type: 'MultipleChoice',
      props: {
        title: '2. Do you currently own an On Tennis product?',
        options: [
          { id: 'q2_yes', label: 'Yes', routeAction: 'default' },
          {
            id: 'q2_no',
            label: 'No',
            routeAction: 'modal',
            routeModalProps: {
              variant: 'message-alert',
              title: 'On Tennis Product Required',
              subtitle: 'Visit our catalog to explore the On Tennis collection.',
              buttonLayout: 'dual',
              buttonText: 'Visit Shop',
              buttonAction: 'link',
              buttonUrl: 'https://events.707.co.id/shop',
              buttonOpenInNewTab: true,
              secondaryButtonText: 'Close',
              secondaryButtonAction: 'submit-close'
            }
          }
        ],
        selectedValues: ['q2_no']
      }
    };
    const stickyConfirm = {
      id: 'btn_confirm',
      type: 'ActionButton',
      props: {
        label: 'CONFIRM',
        positionMode: 'sticky-bottom',
        actionType: 'submit'
      }
    };

    store.pages = [
      makePage('page_eligibility', 'Eligibility Check', [q1, q2, stickyConfirm]),
      makePage('page_form', 'Registration Form', [])
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

    // Pick "No" on Q2 -> CONFIRM opens the Shop Catalogue modal and stays on page 0
    await confirmBtn!.trigger('click');
    await wrapper.vm.$nextTick();
    expect(store.activePageIndex).toBe(0);
    const modal = wrapper.find('[data-name="Bottom Modal Popup"]');
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toContain('On Tennis Product Required');

    // Click primary modal CTA -> opens Shop URL
    await modal.find('[data-modal-btn="primary"]').trigger('click');
    expect(openSpy).toHaveBeenCalledWith('https://events.707.co.id/shop', '_blank', 'noopener,noreferrer');
    expect(store.activePageIndex).toBe(0);

    // Now switch Q2 to "Yes" -> CONFIRM proceeds to Registration Form (page 1)
    store.pages[0].widget_tree[1].props.selectedValues = ['q2_yes'];
    await wrapper.vm.$nextTick();
    await confirmBtn!.trigger('click');
    await wrapper.vm.$nextTick();
    expect(store.activePageIndex).toBe(1);

    openSpy.mockRestore();
  });

  it('enforces single routing question per page in ChoiceSetupSidebar and edits option pop-up via ModalSetupSidebar', async () => {
    const store = useEditorStore();
    const q1 = {
      id: 'mc_q1',
      type: 'MultipleChoice',
      props: {
        title: '1. How often do you play tennis?',
        options: [
          { id: 'q1_a', label: 'Less than once a week', routeAction: 'default' }
        ],
        selectedValues: ['q1_a']
      }
    };
    const q2 = {
      id: 'mc_q2',
      type: 'MultipleChoice',
      props: {
        title: '2. Do you currently own an On Tennis product?',
        options: [
          { id: 'q2_yes', label: 'Yes', routeAction: 'default' },
          { id: 'q2_no', label: 'No', routeAction: 'modal', routeModalProps: { variant: 'message-alert', title: 'Shop Required' } }
        ],
        selectedValues: ['q2_no']
      }
    };

    store.pages = [makePage('page_eligibility', 'Eligibility Check', [q1, q2])];
    store.activePageIndex = 0;

    // 1. Selecting Q1 shows the 1-question-per-page notice referencing Q2 and hides On Next dropdown
    store.selectWidget('mc_q1');
    const q1Sidebar = mount(ChoiceSetupSidebar, { props: { isOpen: true } });
    expect(q1Sidebar.text()).toContain('2. Do you currently own an On Tennis product?');
    expect(q1Sidebar.text()).toContain('1 question per page');
    expect(q1Sidebar.find('option[value="modal"]').exists()).toBe(false);

    // 2. Selecting Q2 shows On Next with Show Pop-up Modal and opens ModalSetupSidebar bound to q2_no
    store.selectWidget('mc_q2');
    const q2Sidebar = mount(ChoiceSetupSidebar, { props: { isOpen: true } });
    expect(q2Sidebar.find('option[value="modal"]').exists()).toBe(true);

    const customizeBtn = q2Sidebar.findAll('button').find(b => b.text().includes('Customize Pop-up'));
    expect(customizeBtn).toBeTruthy();
    await customizeBtn!.trigger('click');
    expect(store.isModalSidebarOpen).toBe(true);
    expect(store.activeChoiceModalOptionId).toBe('q2_no');

    // 3. ModalSetupSidebar edits persist directly to q2_no.routeModalProps
    const modalSidebar = mount(ModalSetupSidebar, { props: { isOpen: true } });
    const titleTextarea = modalSidebar.find('textarea');
    await titleTextarea.setValue('Explore On Tennis Gear');
    expect(store.pages[0].widget_tree[1].props.options[1].routeModalProps.title).toBe('Explore On Tennis Gear');

    // 4. resolveChoiceRouteOverride returns modal override strictly from the routing widget
    const resolved = resolveChoiceRouteOverride(store.pages[0].widget_tree);
    expect(resolved?.kind).toBe('modal');
    if (resolved?.kind === 'modal') {
      expect(resolved.modalProps.title).toBe('Explore On Tennis Gear');
    }
  });
});
