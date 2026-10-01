import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '../stores/editorStore.ts';

describe('707 Activation Builder Stores', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes with default blank canvas and matching title', () => {
    const editorStore = useEditorStore();
    expect(editorStore.currentPage.widget_tree.length).toBe(0);
    expect(editorStore.currentPage.title).toBe('Landing Page');
    expect(editorStore.currentPage.brand_slug).toBe('atmos');
  });

  it('can add, move, and remove widgets in the stack', () => {
    const editorStore = useEditorStore();
    expect(editorStore.currentPage.widget_tree.length).toBe(0);

    editorStore.addWidget('HeroDrop');
    expect(editorStore.currentPage.widget_tree.length).toBe(1);

    editorStore.addWidget('LocationCard');
    expect(editorStore.currentPage.widget_tree.length).toBe(2);

    const added = editorStore.currentPage.widget_tree[1];
    expect(added.type).toBe('LocationCard');

    editorStore.removeWidget(added.id);
    expect(editorStore.currentPage.widget_tree.length).toBe(1);
  });

  it('supports UI/UX review status transitions', () => {
    const editorStore = useEditorStore();
    expect(editorStore.currentPage.status).toBe('draft');

    editorStore.setPageStatus('pending_review', 'Brand Manager', 'Ready for Head of UI/UX review');
    expect(editorStore.currentPage.status).toBe('pending_review');

    editorStore.setPageStatus('published', 'Head of UI/UX', 'Approved for production drop');
    expect(editorStore.currentPage.status).toBe('published');
  });

  it('handles multi-page overview toggling, focusing, and centering', () => {
    const editorStore = useEditorStore();
    expect(editorStore.pages.length).toBe(1);
    expect(editorStore.isPagesOpen).toBe(false);

    // Add another page
    editorStore.addPage();
    expect(editorStore.pages.length).toBe(2);

    // Open pages overview
    editorStore.openPages();
    expect(editorStore.isPagesOpen).toBe(true);
    expect(editorStore.panX).toBe(0);

    // Focus page 1
    editorStore.focusPage(1);
    expect(editorStore.isPagesOpen).toBe(false);
    expect(editorStore.activePageIndex).toBe(1);
    expect(editorStore.panX).toBeCloseTo(-171.7, 1); // -(1 - 0.5) * 404 * 0.85

    // Focus page 0
    editorStore.focusPage(0);
    expect(editorStore.activePageIndex).toBe(0);
    expect(editorStore.panX).toBeCloseTo(171.7, 1); // -(0 - 0.5) * 404 * 0.85
  });

  it('automatically closes level 2 add menu when sidebars or text tools are invoked', () => {
    const editorStore = useEditorStore();
    expect(editorStore.isAddMenuOpen).toBe(false);

    // Open Level 2 add menu
    editorStore.toggleAddMenu();
    expect(editorStore.isAddMenuOpen).toBe(true);

    // Opening layers should close level 2 menu
    editorStore.openLayers();
    expect(editorStore.isAddMenuOpen).toBe(false);
    expect(editorStore.isLayersOpen).toBe(true);

    // Open Level 2 add menu again
    editorStore.toggleAddMenu();
    expect(editorStore.isAddMenuOpen).toBe(true);
    expect(editorStore.isLayersOpen).toBe(false);

    // Adding text tool or closing sidebars should close add menu
    editorStore.closeAllSidebars();
    expect(editorStore.isAddMenuOpen).toBe(false);
  });

  it('creates TextBanner with WRITE YOUR TEXT HERE and retains it even if left unedited', () => {
    const editorStore = useEditorStore();
    const textWidget = editorStore.addWidget('TextBanner');
    expect(textWidget.props.placeholder).toBe('WRITE YOUR TEXT HERE');
    expect(textWidget.props.text).toBe('');
    expect(editorStore.currentPage.widget_tree.length).toBe(1);

    // If user clicks away (deselects or selects another widget) without editing, widget is NOT auto-removed
    editorStore.selectWidget(null);
    expect(editorStore.currentPage.widget_tree.length).toBe(1);
    expect(editorStore.currentPage.widget_tree[0].id).toBe(textWidget.id);

    // If user inputs text, it updates properly
    editorStore.updateWidgetProps(textWidget.id, { text: 'CUSTOM HEADING' });
    editorStore.selectWidget(null);
    expect(editorStore.currentPage.widget_tree.length).toBe(1);
    expect(editorStore.currentPage.widget_tree[0].props.text).toBe('CUSTOM HEADING');
  });

  it('supports FieldInput widget creation and state variants (Figma 236:11400)', () => {
    const editorStore = useEditorStore();
    const fieldWidget = editorStore.addWidget('FieldInput', undefined, {
      label: 'Email',
      placeholder: 'Email*',
      value: '',
      required: true,
      inputType: 'email',
      stateVariant: 'Default',
      errorMessage: 'Please enter a valid email address.'
    });

    expect(fieldWidget.type).toBe('FieldInput');
    expect(fieldWidget.props.stateVariant).toBe('Default');
    expect(fieldWidget.props.label).toBe('Email');

    // Switch to Input variant
    editorStore.updateWidgetProps(fieldWidget.id, {
      stateVariant: 'Input',
      value: 'lioviani@gmail.com'
    });
    expect(fieldWidget.props.stateVariant).toBe('Input');
    expect(fieldWidget.props.value).toBe('lioviani@gmail.com');

    // Switch to Wrong alert variant
    editorStore.updateWidgetProps(fieldWidget.id, {
      stateVariant: 'Wrong alert'
    });
    expect(fieldWidget.props.stateVariant).toBe('Wrong alert');

    // Switch to Wrong variant
    editorStore.updateWidgetProps(fieldWidget.id, {
      stateVariant: 'Wrong'
    });
    expect(fieldWidget.props.stateVariant).toBe('Wrong');
  });

  it('supports ActionButton widget creation and variants (Figma 244:11560)', () => {
    const editorStore = useEditorStore();
    const blackBtn = editorStore.addWidget('ActionButton', undefined, {
      label: 'BUTTON CTA',
      variant: 'black',
      actionType: 'submit',
      height: 48
    });

    expect(blackBtn.type).toBe('ActionButton');
    expect(blackBtn.props.variant).toBe('black');
    expect(blackBtn.props.label).toBe('BUTTON CTA');
    expect(blackBtn.props.height).toBe(48);

    const whiteBtn = editorStore.addWidget('ActionButton', undefined, {
      label: 'BUTTON CTA',
      variant: 'white',
      actionType: 'submit',
      height: 48
    });

    expect(whiteBtn.type).toBe('ActionButton');
    expect(whiteBtn.props.variant).toBe('white');
    expect(editorStore.currentPage.widget_tree.length).toBe(2);
  });

  it('supports Button Setup sidebar toggling and sticky button scope targeting', () => {
    const editorStore = useEditorStore();
    expect(editorStore.isButtonSidebarOpen).toBe(false);

    // Opening button sidebar
    editorStore.openButtonSidebar();
    expect(editorStore.isButtonSidebarOpen).toBe(true);

    // Closing all sidebars
    editorStore.closeAllSidebars();
    expect(editorStore.isButtonSidebarOpen).toBe(false);

    // Adding ActionButton automatically opens button sidebar
    const btn = editorStore.addWidget('ActionButton', undefined, {
      positionMode: 'sticky-bottom',
      stickyScope: 'custom',
      stickyPageIds: ['page_1']
    });

    expect(editorStore.isButtonSidebarOpen).toBe(true);
    expect(btn.props.positionMode).toBe('sticky-bottom');
    expect(btn.props.stickyScope).toBe('custom');
    expect(btn.props.stickyPageIds).toContain('page_1');
  });

  it('supports MultipleChoice widget creation, 4 variants, and sidebar management (Figma 276:4224)', () => {
    const editorStore = useEditorStore();
    expect(editorStore.isChoiceSidebarOpen).toBe(false);

    // Adding MultipleChoice widget
    const choiceWidget = editorStore.addWidget('MultipleChoice', undefined, {
      title: 'SELECT ARRIVALS',
      subtitle: 'Select one or more entry slots',
      variant: 'detailed-card',
      allowMultiple: true,
      options: [
        { id: 'opt_1', label: 'VIP Pass', sublabel: '24 Oct 2026', description: 'Early access' },
        { id: 'opt_2', label: 'General Admission', sublabel: '25 Oct 2026', description: 'Standard access' }
      ]
    });

    expect(choiceWidget.type).toBe('MultipleChoice');
    expect(choiceWidget.props.title).toBe('SELECT ARRIVALS');
    expect(choiceWidget.props.allowMultiple).toBe(true);
    expect(choiceWidget.props.variant).toBe('detailed-card');
    expect(choiceWidget.props.options.length).toBe(2);
    expect(editorStore.isChoiceSidebarOpen).toBe(true);

    // Toggle choice sidebar
    editorStore.toggleChoiceSidebar();
    expect(editorStore.isChoiceSidebarOpen).toBe(false);
    editorStore.openChoiceSidebar();
    expect(editorStore.isChoiceSidebarOpen).toBe(true);

    // Update variant to image-grid
    editorStore.updateWidgetProps(choiceWidget.id, { variant: 'image-grid' });
    expect(choiceWidget.props.variant).toBe('image-grid');

    // Remove widget closes choice sidebar
    editorStore.removeWidget(choiceWidget.id);
    expect(editorStore.currentPage.widget_tree.length).toBe(0);
    expect(editorStore.isChoiceSidebarOpen).toBe(false);
  });

  it('supports ModalOverlay widget creation, 5 variants, and modal sidebar management (Figma 276:4722)', () => {
    const editorStore = useEditorStore();
    expect(editorStore.isModalSidebarOpen).toBe(false);

    // Adding ModalOverlay widget
    const modalWidget = editorStore.addWidget('ModalOverlay', undefined, {
      title: 'SELECT ARRIVAL DATE',
      subtitle: 'Please provide a valid email address. We will resend your E-Pass immediately.',
      variant: 'choice-detailed',
      buttonText: 'DONE',
      buttonVariant: 'black',
      options: [
        { id: 'opt_1', label: 'Day 1', sublabel: '2 September 2026', description: 'Your Event Descriptions Detail', selected: true },
        { id: 'opt_2', label: 'Day 2', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail', selected: false }
      ]
    });

    expect(modalWidget.type).toBe('ModalOverlay');
    expect(modalWidget.props.title).toBe('SELECT ARRIVAL DATE');
    expect(modalWidget.props.variant).toBe('choice-detailed');
    expect(modalWidget.props.options.length).toBe(2);
    expect(editorStore.isModalSidebarOpen).toBe(true);

    // Toggle modal sidebar
    editorStore.toggleModalSidebar();
    expect(editorStore.isModalSidebarOpen).toBe(false);
    editorStore.openModalSidebar();
    expect(editorStore.isModalSidebarOpen).toBe(true);

    // Update variant to image-matrix
    editorStore.updateWidgetProps(modalWidget.id, { variant: 'image-matrix' });
    expect(modalWidget.props.variant).toBe('image-matrix');

    // Remove widget closes modal sidebar
    editorStore.removeWidget(modalWidget.id);
    expect(editorStore.currentPage.widget_tree.length).toBe(0);
    expect(editorStore.isModalSidebarOpen).toBe(false);
  });

  it('supports HeroDrop widget creation and directly opens MediaBannerSidebar even from widget drawer', () => {
    const editorStore = useEditorStore();
    editorStore.openWidgetSidebar();
    expect(editorStore.isWidgetSidebarOpen).toBe(true);
    expect(editorStore.isMediaSidebarOpen).toBe(false);

    // Add media banner widget
    editorStore.addMediaBannerWidget('Full screen landing page');
    expect(editorStore.currentPage.widget_tree.length).toBe(1);
    expect(editorStore.currentPage.widget_tree[0].type).toBe('HeroDrop');
    expect(editorStore.currentPage.widget_tree[0].props.ratio).toBe('Full screen landing page');
    expect(editorStore.isWidgetSidebarOpen).toBe(false);
    expect(editorStore.isMediaSidebarOpen).toBe(true);
    expect(editorStore.selectedMediaRatio).toBe('Full screen landing page');

    // Closing media sidebar keeps widget selected
    editorStore.isMediaSidebarOpen = false;
    expect(editorStore.selectedWidgetId).toBe(editorStore.currentPage.widget_tree[0].id);
  });

  it('supports Dynamic Fit preset, 1-screen responsive layout and enforces layer limits (1 Hero + 1 Text + 1 Button)', () => {
    const editorStore = useEditorStore();
    editorStore.currentPage.widget_tree = [];

    // 1. Add Hero Banner with Dynamic Fit
    const hero = editorStore.addWidget('HeroDrop', undefined, { ratio: 'Dynamic Fit' });
    expect(hero).toBeTruthy();
    expect(editorStore.isCurrentPageDynamicFit).toBe(true);

    // 2. Add 1 Text block (Allowed)
    const text = editorStore.addWidget('TextBanner', undefined, { text: 'DYNAMIC FIT HEADING' });
    expect(text).toBeTruthy();
    expect(editorStore.currentPage.widget_tree.length).toBe(2);

    // 3. Add a 2nd Text block (Blocked by limit)
    const secondText = editorStore.addWidget('TextBanner', undefined, { text: 'ANOTHER TEXT' });
    expect(secondText).toBeNull();
    expect(editorStore.currentPage.widget_tree.length).toBe(2);
    expect(editorStore.activeToastMessage).toContain('Dynamic Fit preset allows only 1 Text Block');

    // 4. Add 1 Action Button (Allowed)
    const btn = editorStore.addWidget('ActionButton', undefined, { label: 'EXPLORE NOW' });
    expect(btn).toBeTruthy();
    expect(editorStore.currentPage.widget_tree.length).toBe(3);

    // 5. Try adding another ActionButton or MultipleChoice (Blocked)
    const extraChoice = editorStore.addWidget('MultipleChoice');
    expect(extraChoice).toBeNull();
    expect(editorStore.currentPage.widget_tree.length).toBe(3);
    expect(editorStore.activeToastMessage).toContain('Dynamic Fit preset is optimized for 1 Banner + 1 Text + 1 Action Button');
  });

  it('supports GuestEPass widget creation and dedicated setup sidebar (Figma 222:4188)', () => {
    const editorStore = useEditorStore();
    expect(editorStore.isEPassSidebarOpen).toBe(false);

    // Rule 1 & Rule 2: Cannot add GuestEPass if no Form Input or Date Choice exists
    const blockedWithoutPrereqs = editorStore.addWidget('GuestEPass');
    expect(blockedWithoutPrereqs).toBeNull();
    expect(editorStore.activeToastMessage).toContain('Please create form inputs');

    // Add Form Input (FieldInput)
    const field = editorStore.addWidget('FieldInput', undefined, { label: 'First Name', placeholder: 'Your Name*' });
    expect(field).toBeTruthy();

    // Still blocked without Date Choice
    const blockedWithoutChoice = editorStore.addWidget('GuestEPass');
    expect(blockedWithoutChoice).toBeNull();
    expect(editorStore.activeToastMessage).toContain('Please add a Date / Session Selection widget');

    // Add Date Choice (MultipleChoice)
    const choice = editorStore.addWidget('MultipleChoice', undefined, {
      variant: 'detailed-card',
      options: [{ id: 'd1', label: 'Day 1', sublabel: '2 Sept 2026' }]
    });
    expect(choice).toBeTruthy();

    // Now adding GuestEPass with default props
    const defaultEPass = editorStore.addWidget('GuestEPass');
    expect(defaultEPass).toBeTruthy();
    expect(defaultEPass.type).toBe('GuestEPass');
    expect(defaultEPass.props.showQrCode).toBe(true);
    expect(defaultEPass.props.heading).toContain('SUCCESS.');
    expect(defaultEPass.props.guestType).toBe('VIP');
    expect(defaultEPass.props.accessIdFallback).toBe('020305-1008-1245');
    expect(defaultEPass.props.actionType).toBe('download-pass');
    expect(defaultEPass.props.validForFallback[0].label).toBe('Day 1');
    expect(defaultEPass.props.showTerms).toBe(false);
    expect(defaultEPass.props.terms[0]).toBe('[ENTRY CONDITION OR LEGAL RULE 1]');
    expect(editorStore.isEPassSidebarOpen).toBe(true);

    // Toggle QR code off and test props update
    editorStore.updateWidgetProps(defaultEPass.id, { showQrCode: false, isCtaEnabled: true, buttonText: 'DOWNLOAD E-PASS', showTerms: true });
    const updatedEPass = editorStore.currentPage.widget_tree.find(w => w.id === defaultEPass.id);
    expect(updatedEPass?.props.showQrCode).toBe(false);
    expect(updatedEPass?.props.isCtaEnabled).toBe(true);
    expect(updatedEPass?.props.showTerms).toBe(true);

    // Toggle EPass sidebar
    editorStore.toggleEPassSidebar();
    expect(editorStore.isEPassSidebarOpen).toBe(false);
    editorStore.openEPassSidebar();
    expect(editorStore.isEPassSidebarOpen).toBe(true);

    // Remove widget closes EPass sidebar
    editorStore.removeWidget(defaultEPass.id);
    expect(editorStore.isEPassSidebarOpen).toBe(false);
  });

  it('supports hero banner CTA button color preset and drag-to-reorder pages', () => {
    const editorStore = useEditorStore();

    // 1. Hero banner CTA button preset
    const hero = editorStore.addWidget('HeroDrop', undefined, {
      buttonText: 'ENTER RAFFLE',
      isCtaEnabled: true,
      buttonVariant: 'black',
      variant: 'black'
    });
    expect(hero.props.buttonVariant).toBe('black');

    editorStore.updateWidgetProps(hero.id, {
      buttonVariant: 'white',
      variant: 'white'
    });
    expect(editorStore.selectedWidget?.props.buttonVariant).toBe('white');
    expect(editorStore.selectedWidget?.props.variant).toBe('white');

    // 2. Multi-page creation and drag-to-order page swapping
    editorStore.addPage();
    editorStore.addPage();
    expect(editorStore.pages.length).toBe(3);
    const initialPage0Id = editorStore.pages[0].id;
    const initialPage1Id = editorStore.pages[1].id;
    const initialPage2Id = editorStore.pages[2].id;

    // Move page 0 to index 2
    editorStore.movePage(0, 2);
    expect(editorStore.pages[0].id).toBe(initialPage1Id);
    expect(editorStore.pages[1].id).toBe(initialPage2Id);
    expect(editorStore.pages[2].id).toBe(initialPage0Id);
    expect(editorStore.activePageIndex).toBe(2);

    // Move page 2 back to index 0
    editorStore.movePage(2, 0);
    expect(editorStore.pages[0].id).toBe(initialPage0Id);
    expect(editorStore.pages[1].id).toBe(initialPage1Id);
    expect(editorStore.pages[2].id).toBe(initialPage2Id);
    expect(editorStore.activePageIndex).toBe(0);
  });

  it('supports RegistrationForm unified widget, fields stack, and satisfies GuestEPass prerequisites', () => {
    const editorStore = useEditorStore();
    expect(editorStore.isFormSidebarOpen).toBe(false);

    // 1. Adding RegistrationForm in 1 click
    const regForm = editorStore.addWidget('RegistrationForm');
    expect(regForm.type).toBe('RegistrationForm');
    expect(regForm.props.title).toBe('REGISTRATION FORM');
    expect(regForm.props.fields.length).toBe(5);
    expect(regForm.props.fields[0].name).toBe('First Name');
    expect(regForm.props.fields[3].name).toBe('WhatsApp Number');
    expect(regForm.props.fields[3].countryCode).toBe('+62');
    expect(editorStore.isFormSidebarOpen).toBe(true);

    // 2. Toggle form sidebar
    editorStore.toggleFormSidebar();
    expect(editorStore.isFormSidebarOpen).toBe(false);
    editorStore.openFormSidebar();
    expect(editorStore.isFormSidebarOpen).toBe(true);

    // 3. Verify RegistrationForm satisfies GuestEPass requirement for form inputs
    const checkBeforeDate = editorStore.canAddWidget('GuestEPass');
    expect(checkBeforeDate.allowed).toBe(false);
    expect(checkBeforeDate.reason).toContain('Date / Session Selection widget');

    // Add Date choice widget
    editorStore.addWidget('MultipleChoice');
    const checkAfterBoth = editorStore.canAddWidget('GuestEPass');
    expect(checkAfterBoth.allowed).toBe(true);
  });
});
