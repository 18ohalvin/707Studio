import { uploadMediaDirectly } from '../services/mediaService.ts';
import { apiFetch, apiJson } from '../services/apiClient.ts';
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import type { WidgetItem, WidgetType, ActivationPage, ViewportMode, PageStatus, ProjectItem, ProjectHistoryEntry } from '../types/editor.ts';
import { useAuthStore } from './authStore.ts';
import { defaultTicketWidgets } from '../components/editor/ticket/ticketFields.ts';
import { stripTextAnswers } from '../components/editor/guestAnswers.ts';
import { useBrandStore } from './brandStore.ts';

export type MediaGalleryTarget = 'bannerImage' | 'brandLogo' | 'replaceBannerImage' | 'addNewMedia' | 'choiceOptionImage';

const STORAGE_PROJECTS_KEY = '707_cloud_projects';

function getStoredProjects(): ProjectItem[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return [];
}

export const useEditorStore = defineStore('editor', () => {
  // Realtime Projects List (Synced with Cloud API & Local Mirror)
  const projects = ref<ProjectItem[]>(getStoredProjects());

  // Filtered Projects: Strictly visible ONLY to the signed-in account owner or Superadmin
  /** Mirrors canAccessProject on the server, which is the check that actually enforces this. */
  function isVisibleToCurrentUser(p: ProjectItem): boolean {
    const authStore = useAuthStore();

    // 1. When not authenticated (signed out), nobody can see any projects
    if (!authStore.isAuthenticated) return false;

    // 2. Superadmin has oversight across all projects
    if (authStore.isSuperAdmin) return true;

    // 3. Authenticated account / Brand editor
    if (!authStore.currentUser) return false;
    // Door security sees the one campaign it was assigned.
    if (authStore.currentUser.role === 'gate') return Boolean(authStore.currentUser.assignedProject) && p.id === authStore.currentUser.assignedProject;
    const currentUserId = authStore.currentUser.id;
    const currentUserEmail = (authStore.currentUser.email || '').toLowerCase().trim();
    const userBrands = (authStore.currentUser.assignedBrands || []).map(b => b.toLowerCase().replace(/_/g, '-').trim());

    // Direct owner match: account ID or email matches
    const matchesOwnerId = Boolean(p.owner_id && p.owner_id === currentUserId);
    const matchesOwnerEmail = Boolean(p.owner_email && p.owner_email.toLowerCase().trim() === currentUserEmail);
    if (matchesOwnerId || matchesOwnerEmail) return true;

    // Everyone assigned to a brand shares its projects (owner = who made it).
    if (userBrands.includes('all')) return true;
    const slug = (p.brand_slug || '').toLowerCase().replace(/_/g, '-').trim();
    if (!slug) return false;
    return userBrands.includes(slug);
  }

  const userProjects = computed<ProjectItem[]>(() => projects.value.filter(isVisibleToCurrentUser));

  const currentProjectId = ref<string>('');

  // Global Project Campaign Title (Applies to entire project, independent of page switching)
  const projectTitle = ref<string>('Untitled Project');

  function getInitialBrandSlug(): string {
    try {
      if (typeof localStorage !== 'undefined') {
        const auth = localStorage.getItem('707_current_user');
        if (auth) {
          const parsed = JSON.parse(auth);
          if (parsed.assignedBrands?.[0] && parsed.assignedBrands[0] !== 'all') {
            return parsed.assignedBrands[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');
          }
        }
        const brand = localStorage.getItem('707_active_brand');
        if (brand) {
          const parsed = JSON.parse(brand);
          if (parsed.slug) return parsed.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        }
      }
    } catch {}
    return 'atmos';
  }

  // Multi-page Activation Pages Array (Default single page for new project)
  const pages = ref<ActivationPage[]>([
    {
      id: 'page_1',
      brand_id: '1',
      brand_slug: getInitialBrandSlug(),
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
  const panX = ref<number>(171.7);
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
  const isFormSidebarOpen = ref<boolean>(false);
  const isModalSidebarOpen = ref<boolean>(false);
  const isEPassSidebarOpen = ref<boolean>(false);
  const isTicketSidebarOpen = ref<boolean>(false);
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
  const isProjectSettingsOpen = ref<boolean>(false);

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
    // The Ticket page holds only what can be printed on a pass.
    if (currentPage.value?.kind === 'ticket') {
      if (['TicketField', 'TextBanner', 'HeroDrop'].includes(type)) return { allowed: true };
      return { allowed: false, reason: 'The Ticket page takes text, images and ticket data blocks only.' };
    }
    if (type === 'TicketField') {
      return { allowed: false, reason: 'Ticket data blocks go on the Ticket page.' };
    }
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
      const hasFormInput = allWidgets.some(w => 
        w.type === 'FieldInput' || 
        w.type === 'RegistrationForm' ||
        (w.props?.modalProps && (w.props.modalProps.variant === 'message-field' || w.props.modalProps.fieldType)) ||
        (w.type === 'ModalOverlay' && (w.props?.variant === 'message-field' || w.props?.fieldType))
      );
      const hasDateChoice = allWidgets.some(w => 
        w.type === 'MultipleChoice' ||
        (w.props?.modalProps && (w.props.modalProps.variant === 'choice-detailed' || w.props.modalProps.variant === 'choice-simple' || w.props.modalProps.variant === 'image-matrix' || (w.props.modalProps.options && w.props.modalProps.options.length > 0))) ||
        (w.type === 'ModalOverlay' && (w.props?.variant === 'choice-detailed' || w.props?.variant === 'choice-simple' || w.props?.variant === 'image-matrix' || (w.props?.options && w.props.options.length > 0)))
      );

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

  function getPageCenterOffsetX(index: number, zoom = zoomLevel.value): number {
    const totalPages = pages.value.length;
    // Total items in flex row = totalPages + 1 (including the Add Page canvas card)
    // Geometric center of the flex row is at item index totalPages / 2
    const centerIndex = totalPages / 2;
    const offset = -(index - centerIndex) * 404 * (zoom / 100);
    return Math.abs(offset) < 0.001 ? 0 : Math.round(offset * 100) / 100;
  }

  function focusPage(index: number) {
    if (index < 0 || index >= pages.value.length) return;
    zoomLevel.value = 85;
    selectPage(index);
    isPagesOpen.value = false;
    panX.value = getPageCenterOffsetX(index);
    panY.value = 0;
  }

  /** Index of the Ticket page (always last), or -1. */
  const ticketPageIndex = computed(() => pages.value.findIndex(p => p.kind === 'ticket'));

  /**
   * Adds the Ticket page when the campaign gets a Ticket Summary. It sits after
   * every funnel page and is never shown to guests as a step.
   * Returns true when a page was created.
   */
  function ensureTicketPage(): boolean {
    if (ticketPageIndex.value >= 0) return false;
    const now = new Date().toISOString();
    const base = pages.value[0];
    pages.value.push({
      id: `page_ticket_${Date.now()}`,
      kind: 'ticket',
      brand_id: base?.brand_id || '1',
      brand_slug: base?.brand_slug || 'atmos',
      title: 'Ticket',
      page_name: 'Ticket (PDF)',
      slug: 'ticket',
      description: 'Design of the downloadable PDF ticket',
      status: 'draft',
      current_version: 1,
      widget_tree: defaultTicketWidgets().map((w, i) => ({ id: `${w.type.toLowerCase()}_${Date.now()}_${i}`, type: w.type, props: w.props })),
      page_settings: { seoTitle: 'Ticket', seoDescription: '', theme: 'the-707-standard' },
      created_at: now,
      updated_at: now
    });
    return true;
  }

  function addPage() {
    const pageNumber = (ticketPageIndex.value >= 0 ? ticketPageIndex.value : pages.value.length) + 1;
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
    // New funnel pages go before the Ticket page, which stays last.
    const insertAt = ticketPageIndex.value >= 0 ? ticketPageIndex.value : pages.value.length;
    pages.value.splice(insertAt, 0, newPage);
    activePageIndex.value = insertAt;
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
    if (source.kind === 'ticket') {
      showToast('A campaign has one Ticket page.');
      return;
    }
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
    // The Ticket page is not a funnel step: it stays last.
    if (pages.value[fromIndex]?.kind === 'ticket' || pages.value[toIndex]?.kind === 'ticket') return;
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

  /** A banner added to the Ticket page gets a fixed ratio: screen-sized ones collapse on a page whose height follows its content. */
  function ticketSafeProps(type: WidgetType, props: Record<string, any>): Record<string, any> {
    if (type !== 'HeroDrop' || currentPage.value?.kind !== 'ticket') return props;
    const screenRatios = ['Full screen landing page', 'Dynamic Fit', 'Buttons'];
    if (!props.ratio || screenRatios.includes(props.ratio)) {
      return { ...props, ratio: '16:9', isCtaEnabled: false, buttonText: '' };
    }
    return props;
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
          limitPlaces: false,
          waitlistEnabled: true,
          globalSlotsCapacity: '',
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
      case 'RegistrationForm':
        defaultProps = {
          title: 'REGISTRATION FORM',
          subtitle: 'Fill in your details below to register.',
          titleTypographyStyle: 'heading-3',
          typographyStyle: 'heading-3',
          fields: [
            { id: 'f_fn', name: 'First Name', placeholder: 'First Name*', type: 'text', required: true, value: '' },
            { id: 'f_ln', name: 'Last Name', placeholder: 'Last Name*', type: 'text', required: true, value: '' },
            { id: 'f_em', name: 'Email Address', placeholder: 'Email Address*', type: 'email', required: true, value: '' },
            { id: 'f_wa', name: 'WhatsApp Number', placeholder: 'WhatsApp Number*', type: 'tel', countryCode: '+62', required: true, value: '' },
            { id: 'f_ig', name: 'Instagram Handle', placeholder: 'Instagram Handle*', type: 'text', required: true, value: '' }
          ]
        };
        break;
      case 'TicketField':
        defaultProps = { fields: ['guestName'], align: 'left' };
        break;
      case 'GuestEPass':
        defaultProps = {
          showQrCode: true,
          heading: 'SUCCESS.\nYOUR PASS HAS\nBEEN SENT.',
          venue: 'PLAZA SENAYAN 4th FLOOR',
          guestType: 'Public',
          showFooterNotice: true,
          footerNoticeTitle: "DIDN'T RECEIVE THE EMAIL?",
          footerNoticeText: 'Check your spam folder or contact support',
          footerNoticeLinkWords: 'contact support',
          footerNoticeLinkUrl: '',
          isCtaEnabled: false,
          showButton: false,
          showStickyButton: false,
          buttonText: 'DOWNLOAD E-PASS',
          ctaLabel: 'DOWNLOAD E-PASS',
          buttonVariant: 'black',
          variant: 'black',
          actionType: 'download-pass',
          positionMode: 'sticky-bottom',
          ctaPositionMode: 'sticky-bottom',
          showIcon: false,
          iconName: 'ticket',
          validForFallback: [
            { id: 'opt_1', label: 'Pass Option 1', sublabel: '2 September 2026', description: 'Access to main floor & VIP lounge' },
            { id: 'opt_2', label: 'Pass Option 2', sublabel: '3 September 2026', description: 'Access to main floor & VIP lounge' }
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
      props: ticketSafeProps(type, { ...defaultProps, ...(customProps || {}) })
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
    } else if (type === 'RegistrationForm') {
      openFormSidebar();
    } else if (type === 'ModalOverlay') {
      openModalSidebar();
    } else if (type === 'GuestEPass') {
      openEPassSidebar();
      if (ensureTicketPage()) showToast('A Ticket page was added at the end — design the downloadable PDF ticket there.', 5000);
    } else if (type === 'TicketField') {
      openTicketSidebar();
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
      isFormSidebarOpen.value = false;
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

  /**
   * Takes a project as the server returned it (after a save or a status
   * transition). Versioning fields always come from the server; with
   * loadContent the editor also switches to the returned content, e.g. after
   * a discard or a restore from history.
   */
  function applyServerProject(serverProj: ProjectItem, opts: { loadContent?: boolean } = {}) {
    const idx = projects.value.findIndex(p => p.id === serverProj.id);
    if (idx >= 0) {
      projects.value[idx] = { ...projects.value[idx], ...serverProj };
    } else {
      projects.value.unshift(serverProj);
    }
    if (opts.loadContent && currentProjectId.value === serverProj.id) {
      projectTitle.value = serverProj.title;
      if (serverProj.pages && serverProj.pages.length > 0) {
        pages.value = JSON.parse(JSON.stringify(serverProj.pages));
        activePageIndex.value = Math.min(activePageIndex.value, pages.value.length - 1);
      }
    }
    persistProjectsLocally();
    broadcastProjectUpdate();
  }

  type ProjectTransition = 'submit' | 'publish' | 'decline' | 'discard';

  /**
   * Moves a project through review: submit (owner), publish / decline
   * (superadmin), discard unpublished edits. The server records each step in
   * the project's history and notifies the other side.
   */
  async function transitionProject(projectId: string, action: ProjectTransition, note = ''): Promise<{ ok: boolean; error?: string }> {
    const authStore = useAuthStore();
    // Whatever is on screen is what gets submitted or published.
    if (currentProjectId.value === projectId) await flushPendingSave();
    try {
      const json = await apiJson<{ success: boolean; data: ProjectItem }>(`/api/pages/${encodeURIComponent(projectId)}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, actor: authStore.currentUser?.name || (authStore.isSuperAdmin ? 'Superadmin' : '') })
      });
      applyServerProject(json.data, { loadContent: action === 'discard' });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Could not reach the server.' };
    }
  }

  async function fetchProjectHistory(projectId: string): Promise<ProjectHistoryEntry[]> {
    const json = await apiJson<{ success: boolean; data: ProjectHistoryEntry[] }>(`/api/pages/${encodeURIComponent(projectId)}/history/entries`);
    return Array.isArray(json?.data) ? json.data : [];
  }

  /** Loads an older build into the editor. Visitors keep seeing the live version until it is published. */
  async function restoreProjectBuild(projectId: string, entryId: string): Promise<{ ok: boolean; error?: string }> {
    const authStore = useAuthStore();
    if (currentProjectId.value === projectId) await flushPendingSave();
    try {
      const json = await apiJson<{ success: boolean; data: ProjectItem }>(
        `/api/pages/${encodeURIComponent(projectId)}/history/${encodeURIComponent(entryId)}/restore`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor: authStore.currentUser?.name || '' }) }
      );
      applyServerProject(json.data, { loadContent: true });
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Could not reach the server.' };
    }
  }

  /** Older call sites (superadmin review list): status names mapped onto transitions. */
  function updateProjectStatus(projectId: string, status: PageStatus) {
    const action: ProjectTransition = status === 'approved' || status === 'published' ? 'publish' : status === 'pending_review' ? 'submit' : 'decline';
    return transitionProject(projectId, action);
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

  function openFormSidebar() {
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
    isPagesOpen.value = false;
    isFormSidebarOpen.value = true;
  }

  function closeFormSidebar() {
    isFormSidebarOpen.value = false;
  }

  function toggleFormSidebar() {
    if (isFormSidebarOpen.value) {
      closeFormSidebar();
    } else {
      openFormSidebar();
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
    isFormSidebarOpen.value = false;
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

  // Other sidebars open by setting their own flag; whichever opens, the
  // Ticket setup sidebar gives way so the two never overlap.
  watch(
    () => [isWidgetSidebarOpen.value, isMediaSidebarOpen.value, isTextSidebarOpen.value, isButtonSidebarOpen.value,
      isChoiceSidebarOpen.value, isFormSidebarOpen.value, isModalSidebarOpen.value, isEPassSidebarOpen.value, isLayersOpen.value],
    (open) => {
      if (open.some(Boolean)) isTicketSidebarOpen.value = false;
    }
  );

  function openTicketSidebar() {
    closeAllSidebars();
    isTicketSidebarOpen.value = true;
  }

  function openEPassSidebar() {
    isAddMenuOpen.value = false;
    isWidgetSidebarOpen.value = false;
    isMediaSidebarOpen.value = false;
    isMediaGalleryOpen.value = false;
    isTextSidebarOpen.value = false;
    isButtonSidebarOpen.value = false;
    isChoiceSidebarOpen.value = false;
    isFormSidebarOpen.value = false;
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
    isFormSidebarOpen.value = false;
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
    isFormSidebarOpen.value = false;
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

  /**
   * Preview is where the funnel is tested like a guest would: typing, picking
   * options, submitting. None of that is design. The pages are snapshotted on
   * the way in and restored on the way out, and autosave waits meanwhile, so
   * a test run never changes the project (designers' pre-selected options
   * included).
   */
  let previewSnapshot: string | null = null;

  function enterPreview() {
    closeAllSidebars();
    if (previewSnapshot === null) previewSnapshot = JSON.stringify(pages.value);
    isPreviewMode.value = true;
    isTestFormModalOpen.value = true;
  }

  function exitPreview() {
    isPreviewMode.value = false;
    isTestFormModalOpen.value = false;
    if (previewSnapshot !== null) {
      const snapshot = previewSnapshot;
      previewSnapshot = null;
      pages.value = JSON.parse(snapshot);
    }
  }

  function togglePreviewMode() {
    if (isPreviewMode.value) exitPreview();
    else enterPreview();
  }

  function openPreviewMode() {
    enterPreview();
  }

  function closePreviewMode() {
    exitPreview();
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
    isFormSidebarOpen.value = false;
    isModalSidebarOpen.value = false;
    isEPassSidebarOpen.value = false;
    isTicketSidebarOpen.value = false;
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
    panX.value = getPageCenterOffsetX(activePageIndex.value);
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

  function persistProjectsLocally() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects.value));
      }
    } catch (e) {
      console.warn('[EditorStore] Failed to persist projects locally:', e);
    }
  }

  const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('707_project_sync') : null;

  function broadcastProjectUpdate() {
    try {
      syncChannel?.postMessage({ type: 'PROJECTS_UPDATED', timestamp: Date.now() });
    } catch {}
  }

  async function loadProjects() {
    try {
      const res = await apiFetch('/api/pages');
      if (res.ok) {
        const json = await res.json();
        if (json && json.success && Array.isArray(json.data)) {
          const serverList: ProjectItem[] = json.data;
          // Projects the server says were deleted. A local copy of one of these
          // must be dropped, not treated as an offline draft — re-uploading it
          // is what made deletes undo themselves across devices.
          const deletedIds = new Set<string>(Array.isArray(json.deleted) ? json.deleted : []);
          const localList = getStoredProjects().filter(p => !deletedIds.has(p.id));

          const mergedMap = new Map<string, ProjectItem>();
          
          // 1. Cloud server data is authoritative across devices
          serverList.forEach(p => mergedMap.set(p.id, p));

          // 2. Preserve any local-only offline projects or local edits with newer timestamp
          const pendingSync: ProjectItem[] = [];
          localList.forEach(localProj => {
            const existing = mergedMap.get(localProj.id);
            if (!existing) {
              // The server only lists this account's projects, so a local copy
              // of someone else's (cached before that was enforced) is stale,
              // not an offline draft — drop it instead of re-uploading it.
              if (!isVisibleToCurrentUser(localProj)) return;
              mergedMap.set(localProj.id, localProj);
              pendingSync.push(localProj);
            } else {
              const localTime = new Date(localProj.updated_at || 0).getTime();
              const serverTime = new Date(existing.updated_at || 0).getTime();
              if (localTime > serverTime) {
                mergedMap.set(localProj.id, localProj);
                pendingSync.push(localProj);
              }
            }
          });
          
          const combined = Array.from(mergedMap.values()).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          projects.value = combined;
          persistProjectsLocally();

          // Push any local offline drafts up to cloud server so other devices see them
          if (pendingSync.length > 0) {
            Promise.allSettled(
              pendingSync.map(p =>
                apiFetch('/api/pages', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(p),
                  keepalive: true
                })
              )
            ).catch(err => console.warn('[EditorStore] Background cloud sync error:', err));
          }

          return;
        }
      }
    } catch (e) {
      console.warn('[EditorStore] API fetch pages error:', e);
    }
  }

  async function deleteProject(projectId: string) {
    // A save queued for the project being deleted must not run after it.
    if (currentProjectId.value === projectId && saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = null;
    }
    projects.value = projects.value.filter(p => p.id !== projectId);
    persistProjectsLocally();
    broadcastProjectUpdate();
    if (currentProjectId.value === projectId) {
      currentProjectId.value = '';
      projectTitle.value = 'Untitled Activation Drop';
      pages.value = [
        {
          id: `page_${Date.now()}`,
          brand_id: '1',
          brand_slug: 'atmos',
          title: 'Landing Page',
          page_name: 'Landing Page',
          slug: 'landing-page',
          description: '',
          status: 'draft',
          current_version: 1,
          widget_tree: [],
          page_settings: {
            seoTitle: 'Landing Page',
            seoDescription: '',
            theme: 'the-707-standard'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    }
    try {
      await apiFetch(`/api/pages/${projectId}`, {
        method: 'DELETE',
        keepalive: true
      });
    } catch (e) {
      console.error('[EditorStore] Failed to delete project on cloud server:', e);
    }
  }

  async function duplicateProject(projectId: string): Promise<ProjectItem | null> {
    const sourceProj = projects.value.find(p => p.id === projectId);
    if (!sourceProj) return null;

    const authStore = useAuthStore();
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const newTitle = `${sourceProj.title} (Copy)`;
    const newSlug = `${sourceProj.slug || 'drop'}-copy`.replace(/-+/g, '-');

    const sourcePages = (sourceProj.pages && sourceProj.pages.length > 0)
      ? sourceProj.pages
      : [
          {
            id: `page_${Date.now()}`,
            brand_id: sourceProj.brand_id || '1',
            brand_slug: sourceProj.brand_slug || 'atmos',
            title: 'Landing Page',
            page_name: 'Landing Page',
            slug: newSlug,
            description: sourceProj.description || '',
            status: 'draft' as const,
            current_version: 1,
            widget_tree: sourceProj.widget_tree || [],
            page_settings: sourceProj.page_settings,
            created_at: now,
            updated_at: now
          }
        ];

    const clonedPages: ActivationPage[] = sourcePages.map((p, idx) => ({
      ...JSON.parse(JSON.stringify(p)),
      id: `page_${Date.now()}_${idx}`,
      slug: idx === 0 ? newSlug : (p.slug || `page-${idx + 1}`),
      status: 'draft' as const,
      current_version: 1,
      created_at: now,
      updated_at: now
    }));

    const newProject: ProjectItem = {
      id,
      title: newTitle,
      brand_slug: sourceProj.brand_slug,
      slug: newSlug,
      status: 'draft',
      current_version: 1,
      widget_tree: JSON.parse(JSON.stringify(clonedPages[0]?.widget_tree || [])),
      pages: clonedPages,
      page_settings: clonedPages[0]?.page_settings,
      owner_id: authStore.currentUser?.id || sourceProj.owner_id || '',
      owner_email: authStore.currentUser?.email || sourceProj.owner_email || '',
      created_by: authStore.currentUser?.name || authStore.currentUser?.email || 'User',
      created_at: now,
      updated_at: now
    };

    projects.value.unshift(newProject);
    persistProjectsLocally();
    broadcastProjectUpdate();

    apiFetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
      keepalive: true
    }).catch(err => console.warn('Failed to sync duplicated project to API:', err));

    return newProject;
  }

  /**
   * Replaces any embedded base64 image in the live pages with an uploaded URL.
   *
   * An 18 MB image becomes ~24 MB of base64, and the tree is sent twice
   * (widget_tree and pages), so one image pushed the save body to 47 MB and the
   * request died at the proxy with a 502 — the project, and the image with it,
   * was never stored. Uploading first keeps the save payload a few KB no matter
   * how large the picture is.
   */
  async function uploadInlineImages(): Promise<void> {
    const pending: Array<{ holder: any; key: string; dataUrl: string }> = [];

    const scan = (node: any) => {
      if (Array.isArray(node)) return node.forEach(scan);
      if (!node || typeof node !== 'object') return;
      for (const [key, child] of Object.entries(node)) {
        if (typeof child === 'string' && child.startsWith('data:image/')) {
          if (child.length > 12000) pending.push({ holder: node, key, dataUrl: child });
        } else {
          scan(child);
        }
      }
    };
    scan(pages.value);

    if (pending.length === 0) return;

    // Identical images share one upload.
    const uploaded = new Map<string, string>();
    for (const item of pending) {
      try {
        let url = uploaded.get(item.dataUrl);
        if (!url) {
          const saved = await uploadMediaDirectly({ dataUrl: item.dataUrl, category: 'Photos' });
          if (!saved?.url || saved.url.startsWith('data:')) continue;
          url = saved.url;
          uploaded.set(item.dataUrl, url);
        }
        item.holder[item.key] = url;
      } catch (err) {
        // Keep the inline copy: the picture still shows, and the server
        // externalises it on save as a second line of defence.
        console.warn('[EditorStore] Could not upload an embedded image before saving:', err);
      }
    }
  }

  /** True when the most recent save never reached the server. */
  const saveFailed = ref<boolean>(false);

  async function retrySave(projectData: ProjectItem): Promise<boolean> {
    for (const wait of [700, 1800]) {
      await new Promise(resolve => setTimeout(resolve, wait));
      try {
        const res = await apiFetch('/api/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectData)
        });
        if (res.ok) return true;
        // A refusal from the server is an answer, not a dropped packet.
        if (res.status >= 400 && res.status < 500) return false;
      } catch {
        /* try again */
      }
    }
    return false;
  }

  async function saveCurrentProject(): Promise<ProjectItem | null> {
    // Saving only ever updates the open project; projects are created by
    // New Project / Duplicate / templates, which give them an id. Without
    // this, deleting the open project reset the editor to a blank
    // "Untitled Activation Drop", autosave saw no id and created a new
    // project from it — the ghost that appeared after every delete.
    if (!currentProjectId.value) return null;
    isSaving.value = true;
    await uploadInlineImages();
    const now = new Date().toISOString();
    const existingIndex = projects.value.findIndex(p => p.id === currentProjectId.value);
    const existingProj = existingIndex >= 0 ? projects.value[existingIndex] : null;
    
    const brandStore = useBrandStore();
    const authStore = useAuthStore();
    const userBrand = authStore.currentUser?.assignedBrands?.[0];

    let resolvedBrandSlug = currentPage.value?.brand_slug;
    if (!authStore.isSuperAdmin && userBrand && userBrand !== 'all') {
      resolvedBrandSlug = userBrand.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    } else if (!resolvedBrandSlug || (resolvedBrandSlug === 'atmos' && userBrand && userBrand !== 'atmos')) {
      if (userBrand && userBrand !== 'all') {
        resolvedBrandSlug = userBrand.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      } else if (brandStore.activeBrand?.slug) {
        resolvedBrandSlug = brandStore.activeBrand.slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      } else if (existingProj?.brand_slug) {
        resolvedBrandSlug = existingProj.brand_slug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      } else {
        resolvedBrandSlug = 'atmos';
      }
    }

    if (currentPage.value) {
      currentPage.value.brand_slug = resolvedBrandSlug;
    }

    const cleanProjectTitle = projectTitle.value.trim() || 'Untitled Activation Drop';
    const cleanProjectSlug = cleanProjectTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // Master campaign slug must ALWAYS represent the landing page (Page 0) or existing project slug,
    // never an ephemeral sub-page slug like 'page-2' or 'page-3'.
    const masterSlug = existingProj?.slug || pages.value[0]?.slug || cleanProjectSlug || 'untitled-drop';
    if (pages.value[0] && (!pages.value[0].slug || pages.value[0].slug.startsWith('page-'))) {
      pages.value[0].slug = masterSlug;
    }
    // What is saved is the design: during preview that is the snapshot taken
    // on entry, and text answers are never part of it.
    const designPages: ActivationPage[] = stripTextAnswers(JSON.parse(previewSnapshot ?? JSON.stringify(pages.value)));
    const masterWidgets = designPages[0]?.widget_tree || [];
    const masterStatus = existingProj?.status || pages.value[0]?.status || currentPage.value?.status || 'draft';
    
    const projectData: ProjectItem = {
      id: currentProjectId.value || `proj-${Date.now()}`,
      title: cleanProjectTitle,
      brand_slug: resolvedBrandSlug,
      slug: masterSlug,
      status: masterStatus,
      current_version: currentPage.value?.current_version || 1,
      widget_tree: JSON.parse(JSON.stringify(masterWidgets)),
      pages: designPages,
      page_settings: designPages[0]?.page_settings || currentPage.value?.page_settings,
      owner_id: existingProj?.owner_id || authStore.currentUser?.id || (authStore.isSuperAdmin ? 'superadmin_master' : ''),
      owner_email: existingProj?.owner_email || authStore.currentUser?.email || (authStore.isSuperAdmin ? 'admin@707designstudio.internal' : ''),
      created_by: existingProj?.created_by || authStore.currentUser?.name || authStore.currentUser?.email || (authStore.isSuperAdmin ? 'Superadmin' : ''),
      created_at: existingProj ? existingProj.created_at : now,
      updated_at: now,
      // Owned by the server; carried along so the header keeps its state between saves.
      live_version: existingProj?.live_version,
      published_at: existingProj?.published_at,
      published_by: existingProj?.published_by,
      pending_update_at: existingProj?.pending_update_at,
      has_unpublished_changes: existingProj?.has_unpublished_changes
    };

    if (existingIndex >= 0) {
      projects.value[existingIndex] = projectData;
    } else {
      projects.value.unshift(projectData);
      currentProjectId.value = projectData.id;
    }

    // Sort projects so newest is at the top
    projects.value.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    lastSavedAt.value = new Date();
    persistProjectsLocally();
    broadcastProjectUpdate();

    // Async sync to server with keepalive
    try {
      const res = await apiFetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
        keepalive: true
      });
      if (!res.ok) {
        console.warn('[EditorStore] Server returned error saving project:', res.status);
        saveFailed.value = true;
      } else {
        saveFailed.value = false;
        lastSavedAt.value = new Date();
        // The server says whether this save now differs from the live version.
        const saved = await res.json().catch(() => null);
        if (saved?.data?.id === projectData.id) {
          const target = projects.value.find(p => p.id === projectData.id);
          if (target) {
            target.status = saved.data.status;
            target.live_version = saved.data.live_version;
            target.published_at = saved.data.published_at;
            target.pending_update_at = saved.data.pending_update_at;
            target.has_unpublished_changes = saved.data.has_unpublished_changes;
          }
        }
      }
      return projectData;
    } catch (err) {
      // The link to this server drops roughly one request in twenty, so a
      // single failure usually means a lost packet rather than a real problem.
      // Retry before giving up — and if it still fails, say so instead of
      // leaving the header claiming the work was saved.
      const retried = await retrySave(projectData);
      if (!retried) {
        console.warn('[EditorStore] Failed to sync page to API:', err);
        saveFailed.value = true;
      } else {
        saveFailed.value = false;
        lastSavedAt.value = new Date();
      }
      return projectData;
    } finally {
      isSaving.value = false;
    }
  }

  function createNewProject(title: string, slug?: string, widgets?: WidgetItem[], brandSlug?: string): ProjectItem {
    const id = `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const cleanTitle = title.trim() || 'Untitled Activation Drop';
    const cleanSlug = slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const brandStore = useBrandStore();
    const authStore = useAuthStore();
    const userBrand = authStore.currentUser?.assignedBrands?.[0];
    const targetBrandSlug = (brandSlug || (!authStore.isSuperAdmin && userBrand && userBrand !== 'all' 
      ? userBrand 
      : (brandStore.activeBrand?.slug || userBrand || 'atmos'))).toLowerCase().replace(/[^a-z0-9_-]/g, '');

    const initialWidgets = widgets ? JSON.parse(JSON.stringify(widgets)) : [];

    const initialPages: ActivationPage[] = [
      {
        id: `page_${Date.now()}`,
        brand_id: '1',
        brand_slug: targetBrandSlug,
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

    const newProject: ProjectItem = {
      id,
      title: cleanTitle,
      brand_slug: targetBrandSlug,
      slug: cleanSlug,
      status: 'draft',
      current_version: 1,
      widget_tree: initialWidgets,
      pages: initialPages,
      owner_id: authStore.currentUser?.id || (authStore.isSuperAdmin ? 'superadmin_master' : ''),
      owner_email: authStore.currentUser?.email || (authStore.isSuperAdmin ? 'admin@707designstudio.internal' : ''),
      created_by: authStore.currentUser?.name || authStore.currentUser?.email || (authStore.isSuperAdmin ? 'Superadmin' : ''),
      created_at: now,
      updated_at: now
    };

    projects.value.unshift(newProject);
    currentProjectId.value = id;
    projectTitle.value = cleanTitle;
    pages.value = JSON.parse(JSON.stringify(initialPages));
    persistProjectsLocally();
    broadcastProjectUpdate();

    activePageIndex.value = 0;
    panX.value = getPageCenterOffsetX(0);
    panY.value = 0;
    selectedWidgetId.value = initialWidgets.length > 0 ? initialWidgets[0].id : null;
    closeAllSidebars();

    // Async sync to server with keepalive
    apiFetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
      keepalive: true
    }).catch(err => console.warn('Failed to sync new project to API:', err));

    return newProject;
  }

  function openProjectById(projectId: string) {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;

    // Only allow opening if project is owned or accessible by user
    const proj = userProjects.value.find(p => p.id === projectId || p.title === projectId);
    if (!proj) {
      console.warn(`[EditorStore] Project not accessible or not owned by user: ${projectId}`);
      return;
    }

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
      // A preview test run is not an edit; exitPreview restores the design.
      if (isPreviewMode.value) return;
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(() => {
        saveCurrentProject();
      }, 500);
    },
    { deep: true }
  );

  async function flushPendingSave(): Promise<void> {
    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = null;
    }
    await saveCurrentProject();
  }

  // Realtime cross-device & cross-tab synchronization listeners
  if (typeof window !== 'undefined') {
    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'PROJECTS_UPDATED') {
          loadProjects();
        }
      };
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          loadProjects();
        }
      });
    }

    window.addEventListener('focus', () => {
      loadProjects();
    });

    // Periodic cloud poll every 10 seconds to keep all devices in sync
    setInterval(() => {
      loadProjects();
    }, 10000);
  }

  // Initialize history
  pushHistory();

  return {
    projects,
    userProjects,
    currentProjectId,
    projectTitle,
    pages,
    activePageIndex,
    currentPage,
    loadProjects,
    saveCurrentProject,
    flushPendingSave,
    deleteProject,
    duplicateProject,
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
    saveFailed,
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
    isFormSidebarOpen,
    isModalSidebarOpen,
    isEPassSidebarOpen,
    isLayersOpen,
    isPagesOpen,
    selectedMediaRatio,
    isReviewModalOpen,
    isTestFormModalOpen,
    isRequestWidgetModalOpen,
    isProjectSettingsOpen,
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
    openFormSidebar,
    closeFormSidebar,
    toggleFormSidebar,
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
    updateProjectStatus,
    transitionProject,
    ensureTicketPage,
    ticketPageIndex,
    isTicketSidebarOpen,
    openTicketSidebar,
    fetchProjectHistory,
    restoreProjectBuild,
    applyServerProject,
    setDraggedWidget,
    cleanupEmptyTextWidgets
  };
});
