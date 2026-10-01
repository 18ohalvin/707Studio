import { apiFetch } from '../services/apiClient.ts';
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { WidgetItem, WidgetType, ActivationPage, ViewportMode, PageStatus, ProjectItem } from '../types/editor.ts';

export type MediaGalleryTarget = 'bannerImage' | 'brandLogo' | 'replaceBannerImage' | 'addNewMedia' | 'choiceOptionImage';

export const useEditorStore = defineStore('editor', () => {
  // Realtime Projects List (Synced with API & Local Storage)
  const projects = ref<ProjectItem[]>([]);

  const currentProjectId = ref<string>('');

  // Global Project Campaign Title (Applies to entire project, independent of page switching)
  const projectTitle = ref<string>('Untitled Project');

  // Multi-page Activation Pages Array (Default single page for new project)
  const pages = ref<ActivationPage[]>([
    {
      id: 'page_1',
      brand_id: '1',
      brand_slug: 'atmos',
      title: 'Landing Page',
      page_name: 'Landing Page',
      slug: 'landing-page',
      description: 'New 707 Activation Campaign',
      status: 'draft',
      current_version: 1,
      widget_tree: [], // Blank space canvas by default as per Figma design
      page_settings: {
        seoTitle: '707 Activation Page',
        seoDescription: 'Enter the official 707 activation.',
        theme: 'the-707-standard'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  const activePageIndex = ref<number>(0);

  // Active Selected Page
  const currentPage = computed<ActivationPage>(() => {
    return pages.value[activePageIndex.value] || pages.value[0];
  });

  // Selected Widget State
  const selectedWidgetId = ref<string | null>(null);
  const hoveredWidgetId = ref<string | null>(null);

  // Editor Viewport, Zoom & Canvas Pan State (Adobe Infinite Pan/Zoom Behavior)
  const viewportMode = ref<ViewportMode>('iphone-16-pro');
  const zoomLevel = ref<number>(85);
  const panX = ref<number>(0);
  const panY = ref<number>(0);
  const isPreviewMode = ref<boolean>(false);
  const isSaving = ref<boolean>(false);
  const lastSavedAt = ref<Date>(new Date());
  const activeTab = ref<'widgets' | 'layers' | 'settings' | 'templates'>('widgets');

  // Drag and Drop State
  const draggedWidget = ref<{ type: WidgetType; customProps?: Record<string, any>; label?: string } | null>(null);
  const isDraggingOverCanvas = ref<boolean>(false);
  const draggedPageIndex = ref<number | null>(null);
  const dragOverPageIndex = ref<number | null>(null);

  // Sidebar Overlay States
  const isAddMenuOpen = ref<boolean>(false);
  const isWidgetSidebarOpen = ref<boolean>(false);
  const isMediaSidebarOpen = ref<boolean>(false);
  const isMediaGalleryOpen = ref<boolean>(false);
  // 'replaceBannerImage' is read by MediaGallerySidebar to swap the image on an
  // already-selected hero widget. Nothing sets it yet — the Change/Replace
  // trigger still has to be wired up — so it is declared here to keep the
  // consumer side type-correct until that lands.
  const mediaGalleryTarget = ref<MediaGalleryTarget>('bannerImage');
  const choiceOptionTargetId = ref<string | null>(null);
  const isTextSidebarOpen = ref<boolean>(false);
  const isButtonSidebarOpen = ref<boolean>(false);
  const isChoiceSidebarOpen = ref<boolean>(false);
  const isModalSidebarOpen = ref<boolean>(false);
  const isEPassSidebarOpen = ref<boolean>(false);
  const isLayersOpen = ref<boolean>(false);
  const isPagesOpen = ref<boolean>(false);
  const selectedMediaRatio = ref<string>('Full screen landing page');

  // Project Loading Curtain State (Figma Node 224:9099)
  const isProjectLoading = ref<boolean>(false);

  function triggerProjectLoading(duration = 3000): Promise<void> {
    isProjectLoading.value = true;
    return new Promise((resolve) => {
      setTimeout(() => {
        isProjectLoading.value = false;
        resolve();
      }, duration);
    });
  }

  // Modal Dialogs
  const isReviewModalOpen = ref<boolean>(false);
  const isTestFormModalOpen = ref<boolean>(false);
  const isRequestWidgetModalOpen = ref<boolean>(false);

  // Floating Toast Notification
  const activeToastMessage = ref<string | null>(null);
  let toastTimer: any = null;

  function showToast(message: string, durationMs = 3200) {
    if (toastTimer) clearTimeout(toastTimer);
    activeToastMessage.value = message;
    toastTimer = setTimeout(() => {
      activeToastMessage.value = null;
    }, durationMs);
  }

  const isCurrentPageDynamicFit = computed(() => {
    const tree = currentPage.value?.widget_tree || [];
    const hero = tree.find(w => w.type === 'HeroDrop');
    return hero?.props?.ratio === 'Dynamic Fit';
  });

  function canAddWidget(type: WidgetType): { allowed: boolean; reason?: string } {
    const tree = currentPage.value?.widget_tree || [];
    const hero = tree.find(w => w.type === 'HeroDrop');
    if (hero?.props?.ratio === 'Dynamic Fit') {
      if (type === 'HeroDrop') {
        return { allowed: false, reason: 'Dynamic Fit preset is limited to 1 Hero Banner, 1 Text Block, and 1 Action Button.' };
      }
      if (type === 'TextBanner') {
        const hasText = tree.some(w => w.type === 'TextBanner');
        if (hasText) {
          return { allowed: false, reason: 'Dynamic Fit preset allows only 1 Text Block.' };
        }
        return { allowed: true };
      }
      if (type === 'ActionButton') {
        const hasBtn = tree.some(w => w.type === 'ActionButton');
        if (hasBtn) {
          return { allowed: false, reason: 'Dynamic Fit preset allows only 1 Action Button.' };
        }
        return { allowed: true };
      }
      return { 
        allowed: false, 
        reason: 'Dynamic Fit preset is optimized for 1 Banner + 1 Text + 1 Action Button. Switch preset to add more widget types.' 
      };
    }

    if (type === 'GuestEPass') {
      const allWidgets = pages.value.flatMap(p => p.widget_tree);
      const hasFormInput = allWidgets.some(w => w.type === 'FieldInput');
      const hasDateChoice = allWidgets.some(w => w.type === 'MultipleChoice');

      if (!hasFormInput && !hasDateChoice) {
        return {
          allowed: false,
          reason: 'Please create form inputs (e.g. Name) and a Date/Session Selection widget on Page 1 or 2 first.'
        };
      }
      if (!hasFormInput) {
        return {
          allowed: false,
          reason: 'Please create a Form Input widget (e.g. Name) on your page before adding the Summary Ticket.'
        };
      }
      if (!hasDateChoice) {
        return {
          allowed: false,
          reason: 'Please add a Date / Session Selection widget on your page before adding the Summary Ticket.'
        };
      }
    }

    return { allowed: true };
  }

  // History Stack (Undo / Redo)
  const historyStack = ref<string[]>([]);
  const historyIndex = ref<number>(-1);

  const selectedWidget = computed(() => {
    if (!selectedWidgetId.value) return null;
    return currentPage.value.widget_tree.find(w => w.id === selectedWidgetId.value) || null;
  });

  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1);

  function pushHistory() {
    const snapshot = JSON.stringify(pages.value);
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }
    historyStack.value.push(snapshot);
    historyIndex.value = historyStack.value.length - 1;
  }

  function undo() {
    if (canUndo.value) {
      historyIndex.value--;
      pages.value = JSON.parse(historyStack.value[historyIndex.value]);
    }
  }

  function redo() {
    if (canRedo.value) {
      historyIndex.value++;
      pages.value = JSON.parse(historyStack.value[historyIndex.value]);
    }
  }

  function selectPage(index: number) {
    if (index >= 0 && index < pages.value.length) {
      activePageIndex.value = index;
      selectedWidgetId.value = null;
      if (!isPagesOpen.value) {
        panX.value = getPageCenterOffsetX(index);
        panY.value = 0;
      }
    }
  }

  function getPageCenterOffsetX(index: number): number {
    const totalPages = pages.value.length;
    const centerIndex = (totalPages - 1) / 2;
    const visualScale = zoomLevel.value / 100;
    return -(index - centerIndex) * 404 * visualScale; // 340px artboard + 64px gap scaled to screen coordinate space
  }

  function focusPage(index: number) {
    if (index < 0 || index >= pages.value.length) return;
    zoomLevel.value = 85;
    selectPage(index);
    isPagesOpen.value = false;
    panX.value = getPageCenterOffsetX(index);
    panY.value = 0;
  }

  function addPage() {
    const pageNumber = pages.value.length + 1;
    const newPage: ActivationPage = {
      id: `page_${Date.now()}`,
      brand_id: currentPage.value?.brand_id || '1',
      brand_slug: currentPage.value?.brand_slug || 'atmos',
      title: `Page ${pageNumber}: Untitled Page`,
      page_name: 'Untitled Page',
      slug: `page-${pageNumber}`,
      description: `Page ${pageNumber} of campaign activation`,
      status: 'draft',
      current_version: 1,
      widget_tree: [],
      page_settings: {
        seoTitle: `Page ${pageNumber}`,
        seoDescription: '',
        theme: 'the-707-standard'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    pages.value.push(newPage);
    activePageIndex.value = pages.value.length - 1;
    if (!isPagesOpen.value) {
      panX.value = getPageCenterOffsetX(activePageIndex.value);
      panY.value = 0;
    }
    pushHistory();
    return newPage;
  }

  function removePage(index: number) {
    if (pages.value.length <= 1) return;
    pages.value.splice(index, 1);
    if (activePageIndex.value >= pages.value.length) {
      activePageIndex.value = pages.value.length - 1;
    }
    if (!isPagesOpen.value) {
      panX.value = getPageCenterOffsetX(activePageIndex.value);
      panY.value = 0;
    }
    pushHistory();
  }

  function duplicatePage(index: number) {
    const source = pages.value[index];
    if (!source) return;
    const newPageNumber = pages.value.length + 1;
    const clonedPage: ActivationPage = {
      id: `page_${Date.now()}`,
      brand_id: source.brand_id,
      brand_slug: source.brand_slug,
      title: `Page ${newPageNumber}: ${source.page_name || 'Untitled Page'} (Copy)`,
      page_name: `${source.page_name || 'Untitled Page'} (Copy)`,
      slug: `page-${newPageNumber}`,
      description: source.description,
      status: 'draft',
      current_version: 1,
      widget_tree: JSON.parse(JSON.stringify(source.widget_tree)),
      page_settings: JSON.parse(JSON.stringify(source.page_settings)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    pages.value.splice(index + 1, 0, clonedPage);
    activePageIndex.value = index + 1;
    if (!isPagesOpen.value) {
      panX.value = getPageCenterOffsetX(activePageIndex.value);
      panY.value = 0;
    }
    pushHistory();
  }

  function movePage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= pages.value.length) return;
    const item = pages.value.splice(fromIndex, 1)[0];
    pages.value.splice(toIndex, 0, item);
    activePageIndex.value = toIndex;
    if (!isPagesOpen.value) {
      panX.value = getPageCenterOffsetX(activePageIndex.value);
      panY.value = 0;
    }
    pushHistory();
  }

  function cleanupEmptyTextWidgets(_exceptId?: string) {
    // Retain unedited/empty TextBanner widgets when deselecting or leaving them
  }

  function selectWidget(id: string | null) {
    cleanupEmptyTextWidgets(id || undefined);
    selectedWidgetId.value = id;
  }

  function setDraggedWidget(type: WidgetType, customProps?: Record<string, any>, label?: string) {
    draggedWidget.value = { type, customProps, label };
  }

  function addWidget(type: WidgetType, index?: number, customProps?: Record<string, any>) {
    const newId = `${type.toLowerCase()}_${Date.now()}`;
    let defaultProps: Record<string, any> = {};

    switch (type) {
      case 'HeroDrop':
        defaultProps = {
          title: '',
          headline: '',
          subtitle: '',
          subheadline: '',
          badge: '',
          imageUrl: '',
          isSolidSpace: true,
          ratio: 'Full screen landing page',
          mediaFit: 'Fill the screen',
          showBannerText: false,
          buttonText: '',
          isCtaEnabled: false,
          isOverlayEnabled: false,
          overlayOpacity: 50,
          isBrandLogoEnabled: false,
          brandLogoUrl: ''
        };
        break;
      case 'CountdownTimer':
        defaultProps = {
          label: 'RAFFLE CLOSES IN',
          targetDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          expiredText: 'RAFFLE CLOSED'
        };
        break;
      case 'RaffleForm':
        defaultProps = {
          heading: 'ENTER RAFFLE',
          subheading: 'One entry per verified ID/KTP',
          sizeSystem: 'US Mens',
          sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
          requireInstagram: true,
          requirePhone: true,
          ctaLabel: 'SUBMIT ENTRY'
        };
        break;
      case 'RsvpForm':
        defaultProps = {
          heading: 'CONFIRM ATTENDANCE',
          subheading: 'Limited to 150 passes',
          sessions: [
            { label: 'Session A: 18:00 - 20:00', remaining: 24 },
            { label: 'Session B: 20:00 - 22:00', remaining: 18 }
          ],
          includePlusOne: true,
          ctaLabel: 'CLAIM PASS'
        };
        break;
      case 'RulesAccordion':
        defaultProps = {
          title: 'TERMS & CONDITIONS',
          items: [
            { title: 'Eligibility', content: 'Open to Indonesian residents with valid KTP/ID.' },
            { title: 'Winning Notification', content: 'Winners will receive WhatsApp and Email confirmation.' }
          ]
        };
        break;
      case 'LocationCard':
        defaultProps = {
          venueName: '707 Space Jakarta',
          address: 'Jl. Kemang Raya No. 707, Jakarta Selatan',
          googleMapsUrl: 'https://maps.google.com'
        };
        break;
      case 'TextBanner':
        defaultProps = {
          text: '',
          placeholder: 'WRITE YOUR TEXT HERE',
          typographyStyle: 'headline-1',
          fontSize: '32px',
          fontWeight: 'medium',
          textAlign: 'left',
          color: '#000000'
        };
        break;
      case 'ActionButton':
        defaultProps = {
          label: 'BUTTON CTA',
          variant: 'black',
          actionType: 'submit',
          url: '',
          modalType: 'center',
          positionMode: 'in-flow',
          stickyScope: 'current',
          stickyPageIds: [currentPage.value.id],
          backdropStyle: 'glass',
          showIcon: false,
          iconName: 'arrow-right',
          iconPosition: 'leading',
          height: 48,
          disabled: false
        };
        break;
      case 'MultipleChoice':
        defaultProps = {
          title: 'SELECT ARRIVALS',
          subtitle: 'Choose your preferred attendance day below.',
          variant: 'detailed-card',
          titleTypographyStyle: 'heading-3',
          typographyStyle: 'heading-3',
          optionTypographyStyle: 'body-text-medium',
          allowMultiple: true,
          required: false,
          showSlotsCapacity: true,
          globalSlotsCapacity: 25,
          selectedValues: [],
          options: [
            {
              id: 'opt_1',
              label: 'Pass Option 1',
              sublabel: '24 Oct 2026',
              description: 'Access to activation area and special event lounge'
            },
            {
              id: 'opt_2',
              label: 'Pass Option 2',
              sublabel: '25 Oct 2026',
              description: 'Access to activation area and special event lounge'
            }
          ]
        };
        break;
      case 'GuestEPass':
        defaultProps = {
          venue: '',
          guestNameFallback: '',
          validForFallback: [
            { id: 'opt_1', label: '[SESSION / DAY 1]', sublabel: '[EVENT DATE]', description: '[EVENT DESCRIPTION DETAIL]' },
            { id: 'opt_2', label: '[SESSION / DAY 2]', sublabel: '[EVENT DATE]', description: '[EVENT DESCRIPTION DETAIL]' }
          ],
          terms: [
            '[ENTRY CONDITION OR LEGAL RULE 1]',
            '[ENTRY CONDITION OR LEGAL RULE 2]',
            '[ENTRY CONDITION OR LEGAL RULE 3]'
          ]
        };
        break;
      default:
        defaultProps = { text: 'Custom block content' };
    }

    const check = canAddWidget(type);
    if (!check.allowed) {
      if (check.reason) showToast(check.reason);
      return null as any;
    }

    const newWidget: WidgetItem = {
      id: newId,
      type,
      props: { ...defaultProps, ...(customProps || {}) }
    };

    if (typeof index === 'number') {
      currentPage.value.widget_tree.splice(index, 0, newWidget);
    } else {
      currentPage.value.widget_tree.push(newWidget);
    }

    selectedWidgetId.value = newId;
    pushHistory();

    // Auto open corresponding sidebar when widget is added
    if (type === 'HeroDrop') {
      openMediaSidebar(newWidget.props.ratio);
    } else if (type === 'TextBanner') {
      openTextSidebar();
    } else if (type === 'ActionButton') {
      openButtonSidebar();
    } else if (type === 'MultipleChoice') {
      openChoiceSidebar();
    } else if (type === 'ModalOverlay') {
      openModalSidebar();
    } else if (type === 'GuestEPass') {
      openEPassSidebar();
    } else {
      openWidgetSidebar();
    }

    return newWidget;
  }

  function duplicateWidget(id: string) {
    const index = currentPage.value.widget_tree.findIndex(w => w.id === id);
    if (index === -1) return;
    const source = currentPage.value.widget_tree[index];
    const check = canAddWidget(source.type);
    if (!check.allowed) {
      if (check.reason) showToast(check.reason);
      return;
    }
    const newId = `${source.type.toLowerCase()}_${Date.now()}`;
    const clonedWidget: WidgetItem = {
      id: newId,
      type: source.type,
      props: JSON.parse(JSON.stringify(source.props))
    };
    currentPage.value.widget_tree.splice(index + 1, 0, clonedWidget);
    selectedWidgetId.value = newId;
    pushHistory();
  }

  function removeWidget(id: string) {
    const wasSelected = selectedWidgetId.value === id;
    currentPage.value.widget_tree = currentPage.value.widget_tree.filter(w => w.id !== id);
    if (wasSelected) {
      selectedWidgetId.value = currentPage.value.widget_tree[0]?.id || null;
      // Auto close sidebar modal if user removed the widget from canvas
      isWidgetSidebarOpen.value = false;
      isMediaSidebarOpen.value = false;
      isTextSidebarOpen.value = false;
      isButtonSidebarOpen.value = false;
      isChoiceSidebarOpen.value = false;
      isModalSidebarOpen.value = false;
      isEPassSidebarOpen.value = false;
      isMediaGalleryOpen.value = false;
    }
    if (currentPage.value.widget_tree.length === 0) {
      selectedWidgetId.value = null;
      closeAllSidebars();
    }
    pushHistory();
  }

  function moveWidget(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= currentPage.value.widget_tree.length) return;
    const item = currentPage.value.widget_tree.splice(fromIndex, 1)[0];
    currentPage.value.widget_tree.splice(toIndex, 0, item);
    pushHistory();
  }

  function updateWidgetProps(id: string, newProps: Record<string, any>) {
    const widget = currentPage.value.widget_tree.find(w => w.id === id);
    if (widget) {
      widget.props = { ...widget.props, ...newProps };
      pushHistory();
    }
  }

  function loadTemplate(template: { widget_tree: WidgetItem[]; title?: string }) {
    currentPage.value.widget_tree = JSON.parse(JSON.stringify(template.widget_tree));
    selectedWidgetId.value = currentPage.value.widget_tree[0]?.id || null;
    pushHistory();
  }

  function setPageStatus(status: PageStatus, reviewedBy = 'Head of UI/UX', notes = '') {
    currentPage.value.status = status;
    currentPage.value.reviewed_by = reviewedBy;
    currentPage.value.review_notes = notes;
    currentPage.value.updated_at = new Date().toISOString();
  }

  function openAddMenu() {
    closeAllSidebars();
    isAddMenuOpen.value = true;
  }

  function closeAddMenu() {
    isAddMenuOpen.value = false;
  }

  function toggleAddMenu() {
    if (isAddMenuOpen.value) {
      closeAddMenu();
    } else {
      openAddMenu();
    }
  }

  function openMediaSidebar(ratio?: string) {
    if (ratio) {
      selectedMediaRatio.value = ratio;
    }
    const existingHero = currentPage.value?.widget_tree.find(w => w.type === 'HeroDrop');
    if (existingHero && selectedWidgetId.value !== existingHero.id) {
      selectWidget(existingHero.id);
    }
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isMediaSidebarOpen.value = true;
  }

  function openWidgetSidebar() {
    isAddMenuOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isWidgetSidebarOpen.value = true;
  }

  function openMediaGallery(target: MediaGalleryTarget = 'bannerImage') {
    mediaGalleryTarget.value = target;
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isMediaGalleryOpen.value = true;
  }

  function openMediaGalleryForChoiceOption(optionId: string) {
    choiceOptionTargetId.value = optionId;
    openMediaGallery('choiceOptionImage');
  }

  function closeMediaGallery() {
    isMediaGalleryOpen.value = false;
  }

  function openTextSidebar() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isTextSidebarOpen.value = true;
  }

  function closeTextSidebar() {
    cleanupEmptyTextWidgets();
    isTextSidebarOpen.value = false;
  }

  function openButtonSidebar() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isButtonSidebarOpen.value = true;
  }

  function closeButtonSidebar() {
    isButtonSidebarOpen.value = false;
  }

  function toggleButtonSidebar() {
    if (isButtonSidebarOpen.value) {
      closeButtonSidebar();
    } else {
      openButtonSidebar();
    }
  }

  function openChoiceSidebar() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isChoiceSidebarOpen.value = true;
  }

  function closeChoiceSidebar() {
    isChoiceSidebarOpen.value = false;
  }

  function toggleChoiceSidebar() {
    if (isChoiceSidebarOpen.value) {
      closeChoiceSidebar();
    } else {
      openChoiceSidebar();
    }
  }

  function openModalSidebar() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isEPassSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isModalSidebarOpen.value = true;
  }

  function closeModalSidebar() {
    isModalSidebarOpen.value = false;
  }

  function toggleModalSidebar() {
    if (isModalSidebarOpen.value) {
      closeModalSidebar();
    } else {
      openModalSidebar();
    }
  }

  function openEPassSidebar() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = false;
    isEPassSidebarOpen.value = true;
  }

  function closeEPassSidebar() {
    isEPassSidebarOpen.value = false;
  }

  function toggleEPassSidebar() {
    if (isEPassSidebarOpen.value) {
      closeEPassSidebar();
    } else {
      openEPassSidebar();
    }
  }

  function openLayers() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isPagesOpen.value = false;
    isLayersOpen.value = true;
  }

  function closeLayers() {
    isLayersOpen.value = false;
  }

  function toggleLayers() {
    if (isLayersOpen.value) {
      closeLayers();
    } else {
      openLayers();
    }
  }

  function openPages() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isLayersOpen.value = false;
    isPagesOpen.value = true;
    // Reset canvas pan and zoom so thumbnail overview is always centered in the viewport
    panX.value = 0;
    panY.value = 0;
    zoomLevel.value = 85;
  }

  function closePages() {
    isPagesOpen.value = false;
    // Center the selected page in the viewport when exiting pages overview
    zoomLevel.value = 85;
    panX.value = getPageCenterOffsetX(activePageIndex.value);
    panY.value = 0;
  }

  function togglePages() {
    if (isPagesOpen.value) {
      closePages();
    } else {
      openPages();
    }
  }

  function togglePreviewMode() {
    isPreviewMode.value = !isPreviewMode.value;
    isTestFormModalOpen.value = isPreviewMode.value;
    if (isPreviewMode.value) {
      closeAllSidebars();
    }
  }

  function openPreviewMode() {
    closeAllSidebars();
    isPreviewMode.value = true;
    isTestFormModalOpen.value = true;
  }

  function closePreviewMode() {
    isPreviewMode.value = false;
    isTestFormModalOpen.value = false;
  }

  function closeAllSidebars() {
    cleanupEmptyTextWidgets();
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isEPassSidebarOpen.value = false;
    isLayersOpen.value = false;
  }

  function addMediaBannerWidget(ratio: string, index?: number) {
    const check = canAddWidget('HeroDrop');
    if (!check.allowed) {
      if (check.reason) showToast(check.reason);
      return;
    }
    const isButtonsRatio = ratio === 'Buttons';
    addWidget('HeroDrop', index, {
      ratio,
      isSolidSpace: true,
      title: '',
      headline: '',
      subtitle: '',
      subheadline: '',
      showBannerText: !isButtonsRatio,
      buttonText: isButtonsRatio ? 'Action' : '',
      badge: '',
      mediaFit: 'Fill the screen',
      isOverlayEnabled: false,
      overlayOpacity: 50,
      isCtaEnabled: isButtonsRatio,
      isBrandLogoEnabled: false
    });
    openMediaSidebar(ratio);
  }

  function resetPan() {
    panX.value = 0;
    panY.value = 0;
  }

  function formatRelativeTime(dateString: string): string {
    if (!dateString) return 'Just now';
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diff = Math.max(0, now - date);
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
    return `${years} year${years === 1 ? '' : 's'} ago`;
  }

  async function loadProjects() {
    try {
      const res = await apiFetch('/api/pages');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          projects.value = json.data;
          saveProjectsToStorage();
          return;
        }
      }
    } catch (e) {
      console.warn('API fetch failed, reading from localStorage', e);
    }
    loadProjectsFromStorage();
  }

  function saveProjectsToStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('707_saved_projects', JSON.stringify(projects.value));
      }
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }

  function loadProjectsFromStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem('707_saved_projects');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            projects.value = parsed;
          }
        }
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
  }

  function saveCurrentProject() {
    isSaving.value = true;
    const now = new Date().toISOString();
    const existingIndex = projects.value.findIndex(p => p.id === currentProjectId.value);
    
    const projectData: ProjectItem = {
      id: currentProjectId.value || `proj-${Date.now()}`,
      title: projectTitle.value.trim() || 'Untitled Activation Drop',
      brand_slug: currentPage.value?.brand_slug || 'atmos',
      slug: currentPage.value?.slug || 'untitled-drop',
      status: currentPage.value?.status || 'draft',
      current_version: currentPage.value?.current_version || 1,
      widget_tree: JSON.parse(JSON.stringify(currentPage.value?.widget_tree || [])),
      pages: JSON.parse(JSON.stringify(pages.value)),
      page_settings: currentPage.value?.page_settings,
      created_at: existingIndex >= 0 ? projects.value[existingIndex].created_at : now,
      updated_at: now
    };

    if (existingIndex >= 0) {
      projects.value[existingIndex] = projectData;
    } else {
      projects.value.unshift(projectData);
      currentProjectId.value = projectData.id;
    }

    // Sort projects so newest is at the top
    projects.value.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    saveProjectsToStorage();
    lastSavedAt.value = new Date();

    // Async sync to server
    apiFetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    })
      .catch(err => console.warn('Failed to sync page to API:', err))
      .finally(() => {
        isSaving.value = false;
      });
  }

  function createNewProject(title: string, slug?: string, widgets?: WidgetItem[]): ProjectItem {
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const cleanTitle = title.trim() || 'Untitled Activation Drop';
    const cleanSlug = slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const initialWidgets = widgets ? JSON.parse(JSON.stringify(widgets)) : [];

    const newProject: ProjectItem = {
      id,
      title: cleanTitle,
      brand_slug: 'atmos',
      slug: cleanSlug,
      status: 'draft',
      current_version: 1,
      widget_tree: initialWidgets,
      created_at: now,
      updated_at: now
    };

    projects.value.unshift(newProject);
    currentProjectId.value = id;
    projectTitle.value = cleanTitle;

    pages.value = [
      {
        id: `page_${Date.now()}`,
        brand_id: '1',
        brand_slug: 'atmos',
        title: 'Landing Page',
        page_name: 'Landing Page',
        slug: cleanSlug,
        description: `RSVP activation for ${cleanTitle}`,
        status: 'draft',
        current_version: 1,
        widget_tree: initialWidgets,
        page_settings: {
          seoTitle: cleanTitle,
          seoDescription: `Enter the official 707 activation for ${cleanTitle}.`,
          theme: 'the-707-standard'
        },
        created_at: now,
        updated_at: now
      }
    ];
    activePageIndex.value = 0;
    panX.value = getPageCenterOffsetX(0);
    panY.value = 0;
    selectedWidgetId.value = initialWidgets.length > 0 ? initialWidgets[0].id : null;
    closeAllSidebars();

    saveProjectsToStorage();
    return newProject;
  }

  function openProjectById(projectId: string) {
    const proj = projects.value.find(p => p.id === projectId || p.title === projectId);
    if (!proj) return;

    currentProjectId.value = proj.id;
    projectTitle.value = proj.title;

    if (proj.pages && proj.pages.length > 0) {
      pages.value = JSON.parse(JSON.stringify(proj.pages));
    } else {
      pages.value = [
        {
          id: `page_${Date.now()}`,
          brand_id: proj.brand_id || '1',
          brand_slug: proj.brand_slug || 'atmos',
          title: 'Landing Page',
          page_name: 'Landing Page',
          slug: proj.slug,
          description: proj.description || '',
          status: proj.status || 'draft',
          current_version: proj.current_version || 1,
          widget_tree: JSON.parse(JSON.stringify(proj.widget_tree || [])),
          page_settings: proj.page_settings || {
            seoTitle: proj.title,
            seoDescription: proj.description || '',
            theme: 'the-707-standard'
          },
          created_at: proj.created_at,
          updated_at: proj.updated_at
        }
      ];
    }
    activePageIndex.value = 0;
    panX.value = getPageCenterOffsetX(0);
    panY.value = 0;
    selectedWidgetId.value = pages.value[0]?.widget_tree?.length ? pages.value[0].widget_tree[0].id : null;
    closeAllSidebars();
  }

  // Auto-sync project updates when editing
  let saveDebounceTimer: any = null;
  watch(
    [projectTitle, pages],
    () => {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(() => {
        saveCurrentProject();
      }, 500);
    },
    { deep: true }
  );

  // Initialize storage
  loadProjectsFromStorage();

  // Initialize history
  pushHistory();

  return {
    projects,
    currentProjectId,
    projectTitle,
    pages,
    activePageIndex,
    currentPage,
    loadProjects,
    saveCurrentProject,
    createNewProject,
    openProjectById,
    formatRelativeTime,
    selectPage,
    focusPage,
    getPageCenterOffsetX,
    addPage,
    removePage,
    duplicatePage,
    movePage,
    selectedWidgetId,
    selectedWidget,
    hoveredWidgetId,
    viewportMode,
    zoomLevel,
    panX,
    panY,
    resetPan,
    isPreviewMode,
    isSaving,
    lastSavedAt,
    activeTab,
    draggedWidget,
    isDraggingOverCanvas,
    draggedPageIndex,
    dragOverPageIndex,
    isAddMenuOpen,
    isWidgetSidebarOpen,
    isMediaSidebarOpen,
    isMediaGalleryOpen,
    mediaGalleryTarget,
    choiceOptionTargetId,
    openMediaGalleryForChoiceOption,
    isTextSidebarOpen,
    isButtonSidebarOpen,
    isChoiceSidebarOpen,
    isModalSidebarOpen,
    isEPassSidebarOpen,
    isLayersOpen,
    isPagesOpen,
    selectedMediaRatio,
    isReviewModalOpen,
    isTestFormModalOpen,
    isRequestWidgetModalOpen,
    isProjectLoading,
    triggerProjectLoading,
    canUndo,
    canRedo,
    undo,
    redo,
    selectWidget,
    addWidget,
    addMediaBannerWidget,
    openAddMenu,
    closeAddMenu,
    toggleAddMenu,
    openMediaSidebar,
    openWidgetSidebar,
    openMediaGallery,
    closeMediaGallery,
    openTextSidebar,
    closeTextSidebar,
    openButtonSidebar,
    closeButtonSidebar,
    toggleButtonSidebar,
    openChoiceSidebar,
    closeChoiceSidebar,
    toggleChoiceSidebar,
    openModalSidebar,
    closeModalSidebar,
    toggleModalSidebar,
    openEPassSidebar,
    closeEPassSidebar,
    toggleEPassSidebar,
    openLayers,
    closeLayers,
    toggleLayers,
    openPages,
    closePages,
    togglePages,
    togglePreviewMode,
    openPreviewMode,
    closePreviewMode,
    closeAllSidebars,
    removeWidget,
    duplicateWidget,
    moveWidget,
    updateWidgetProps,
    isCurrentPageDynamicFit,
    canAddWidget,
    activeToastMessage,
    showToast,
    loadTemplate,
    setPageStatus,
    setDraggedWidget,
    cleanupEmptyTextWidgets
  };
});
