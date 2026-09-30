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
      placeholder: 'Enter your email*',
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
});
