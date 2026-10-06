<template>
  <div class="public-drop-view min-h-[100dvh] w-full bg-white md:bg-[#0a0a0c] text-black flex flex-col items-center justify-start relative select-text overflow-x-hidden">
    <!-- Background subtle ambient lighting for desktop viewers -->
    <div class="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800 via-[#0a0a0c] to-[#0a0a0c] hidden md:block" />

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 w-full md:max-w-[440px] min-h-[100dvh] bg-white flex flex-col items-center justify-center p-6 text-center shadow-2xl relative z-10">
      <div class="size-16 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shadow-xl animate-pulse mb-5">
        <span class="font-black text-xl tracking-tight">707</span>
      </div>
      <p class="font-mono text-xs text-neutral-400 tracking-wider uppercase animate-pulse">
        Loading activation drop...
      </p>
    </div>

    <!-- Error / Not Found State -->
    <div v-else-if="errorMessage || !currentPageData" class="flex-1 w-full md:max-w-[440px] min-h-[100dvh] bg-white flex flex-col items-center justify-center p-8 text-center shadow-2xl relative z-10">
      <div class="size-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-5 text-neutral-400">
        <AlertCircle class="w-8 h-8" />
      </div>
      <h1 class="text-xl font-bold tracking-tight text-neutral-900 mb-2">
        Activation Drop Unavailable
      </h1>
      <p class="text-sm text-neutral-500 max-w-xs mb-8 leading-relaxed">
        {{ errorMessage || 'This activation campaign drop could not be found or has not been published to the public yet.' }}
      </p>
      <router-link 
        to="/" 
        class="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-black text-white text-xs font-mono uppercase tracking-wider hover:bg-neutral-800 transition-colors shadow-sm"
      >
        Return to Home
      </router-link>
    </div>

    <!-- Live Published Activation Page Canvas -->
    <div 
      v-else 
      class="w-full flex-1 flex flex-col items-center justify-start relative z-10"
    >
      <!-- Dedicated Mobile Viewport Container: 100% full-bleed on mobile, 440px centered frame on desktop -->
      <main 
        class="w-full md:max-w-[440px] min-h-[100dvh] h-[100dvh] bg-white flex flex-col md:shadow-[0_24px_80px_rgba(0,0,0,0.4)] relative flex-1"
        style="-webkit-overflow-scrolling: touch;"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <div
          v-if="isUnpublishedPreview"
          class="sticky top-0 z-40 w-full px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 font-707 text-[11.5px] leading-[16px] text-center"
          role="status"
        >
          Preview — this campaign is not published yet. Only you and the superadmin can open this link.
        </div>
        <MobileArtboard 
          :key="currentPageData.id || activePageIndex"
          :page="currentPageData"
          :page-index="activePageIndex"
          :is-selected="false"
          :is-preview-modal="true"
          :is-live-page="true"
          class="w-full h-full min-h-[100dvh] flex flex-col flex-1"
          @next-page="handleNextPage"
          @prev-page="handlePrevPage"
        />
      </main>

      <!-- Floating Toast Notification for Live Drop -->
      <Transition name="apple-toast-pop">
        <div 
          v-if="editorStore.activeToastMessage" 
          class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-neutral-900/95 backdrop-blur-md text-white text-xs font-707 flex items-center shadow-2xl border border-white/10 select-none pointer-events-none tracking-wide"
        >
          <span>{{ editorStore.activeToastMessage }}</span>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, provide, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { AlertCircle } from 'lucide-vue-next';
import MobileArtboard from '../components/editor/MobileArtboard.vue';
import { LIVE_PASS_KEY, SESSIONS_ANSWER_KEY, type LivePassState } from '../components/editor/livePass.ts';
import { TICKET_SOURCE_KEY, type TicketSource } from '../components/editor/ticket/ticketFields.ts';
import { stripTextAnswers } from '../components/editor/guestAnswers.ts';
import { getToken } from '../services/apiClient.ts';
import type { ActivationPage } from '../types/editor.ts';
import { useEditorStore } from '../stores/editorStore.ts';

const route = useRoute();
const editorStore = useEditorStore();

const isLoading = ref(true);
const errorMessage = ref('');
const projectPages = ref<ActivationPage[]>([]);
const activePageIndex = ref<number>(0);
const singlePageData = ref<ActivationPage | null>(null);
const collectedFormData = ref<Record<string, any>>({});
const submissionPageId = ref<string>('');
const campaignBrandSlug = ref<string>('');
const campaignStatus = ref<string>('');
/** Owner / superadmin looking at a campaign the public cannot see yet. */
const isUnpublishedPreview = computed(() => Boolean(campaignStatus.value) && !['approved', 'published'].includes(campaignStatus.value));

function staffAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const currentPageData = computed<ActivationPage | null>(() => {
  if (projectPages.value.length > 0) {
    return projectPages.value[activePageIndex.value] || projectPages.value[0];
  }
  return singlePageData.value;
});

function normalize(s: string) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function loadPage() {
  isLoading.value = true;
  errorMessage.value = '';
  activePageIndex.value = 0;
  collectedFormData.value = {};
  livePass.status = 'idle';
  livePass.code = '';
  livePass.guestName = '';
  livePass.email = '';
  livePass.guestType = '';
  livePass.sessions = [];
  livePass.error = '';
  campaignStatus.value = '';

  const brandSlug = String(route.params.brandSlug || '');
  const pageSlug = String(route.params.pageSlug || '');
  campaignBrandSlug.value = brandSlug;

  if (!brandSlug || !pageSlug) {
    errorMessage.value = 'Invalid activation link format.';
    isLoading.value = false;
    return;
  }

  // 1. The server: live version for visitors, working copy only for the owner / superadmin of an unpublished campaign
  try {
    // The token lets an owner or superadmin open a campaign before it is
    // published; visitors without one only ever see live campaigns.
    const res = await fetch(`/api/pages/${encodeURIComponent(brandSlug)}/${encodeURIComponent(pageSlug)}`, { headers: staffAuthHeaders() });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const item = json.data;
        submissionPageId.value = item.id || '';
        campaignStatus.value = item.status || 'published';
        campaignBrandSlug.value = item.brand_slug || brandSlug;

        if (Array.isArray(item.pages) && item.pages.length > 0) {
          setCampaignPages(item.pages, item.title);
          const matchIdx = projectPages.value.findIndex((p: any) => normalize(p.slug) === normalize(pageSlug));
          activePageIndex.value = matchIdx >= 0 ? matchIdx : 0;
          applySeo(projectPages.value[activePageIndex.value] || projectPages.value[0]);
          isLoading.value = false;
          return;
        }

        // Single page fallback
        const singlePage: ActivationPage = {
          id: item.id || `page_${Date.now()}`,
          brand_id: item.brand_id || '1',
          brand_slug: item.brand_slug || brandSlug,
          title: item.title || 'Activation Drop',
          page_name: item.title || 'Activation Drop',
          slug: item.slug || pageSlug,
          description: item.description || '',
          status: item.status || 'published',
          current_version: item.current_version || 1,
          widget_tree: Array.isArray(item.widget_tree) ? item.widget_tree : [],
          page_settings: item.page_settings || {
            seoTitle: item.title,
            seoDescription: item.description || 'Official 707 Activation Drop',
            theme: 'the-707-standard'
          },
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString()
        };
        projectPages.value = [singlePage];
        singlePageData.value = singlePage;
        activePageIndex.value = 0;
        applySeo(singlePage);
        isLoading.value = false;
        return;
      }
    }
  } catch (err) {
    console.warn('[PublicDropView] Error loading page from server:', err);
  }

  // 2b. Server unreachable: the signed-in account's own cached copy, so an
  // owner can still preview offline. Never first — the server decides which
  // version visitors get (the live one, not the working copy being edited),
  // and never another account's copy.
  const localMatch = editorStore.userProjects.find(p => {
    return normalize(p.brand_slug) === normalize(brandSlug) && normalize(p.slug) === normalize(pageSlug);
  });

  if (localMatch) {
    submissionPageId.value = localMatch.id;
    campaignStatus.value = localMatch.status || 'draft';
    if (localMatch.pages && localMatch.pages.length > 0) {
      setCampaignPages(JSON.parse(JSON.stringify(localMatch.pages)), localMatch.title);
      activePageIndex.value = 0;
      applySeo(localMatch.pages[0]);
      isLoading.value = false;
      return;
    }
  }

  // 3. Fallback: Check if current opened project in editorStore matches
  if (editorStore.currentPage && editorStore.currentProjectId &&
      normalize(editorStore.currentPage.brand_slug) === normalize(brandSlug) && 
      normalize(editorStore.currentPage.slug) === normalize(pageSlug)) {
    submissionPageId.value = editorStore.currentProjectId;
    campaignStatus.value = editorStore.currentPage.status || 'draft';
    setCampaignPages(JSON.parse(JSON.stringify(editorStore.pages)), editorStore.projectTitle);
    activePageIndex.value = editorStore.activePageIndex || 0;
    applySeo(editorStore.currentPage);
    isLoading.value = false;
    return;
  }

  errorMessage.value = 'Activation page not found or not published.';
  isLoading.value = false;
}

// Touch swipe gesture detection for native iOS / Android back gesture
let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e: TouchEvent) {
  if (e.touches && e.touches[0]) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}

function handleTouchEnd(e: TouchEvent) {
  if (e.changedTouches && e.changedTouches[0]) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    // Edge swipe right (from left edge: touchStartX < 120px, swipe distance > 65px with low vertical jitter)
    if (deltaX > 65 && Math.abs(deltaY) < 50 && touchStartX < 120) {
      if (activePageIndex.value > 0) {
        handlePrevPage();
      }
    }
  }
}

function handleNextPage(pageFormData?: Record<string, any>) {
  if (pageFormData && typeof pageFormData === 'object') {
    Object.assign(collectedFormData.value, pageFormData);
  }

  // Check if there are more steps in the activation funnel
  if (activePageIndex.value < projectPages.value.length - 1) {
    // Push history state so Android hardware back button & iOS Safari swipe back gracefully decrement steps
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({ stepIndex: activePageIndex.value + 1 }, '', window.location.href);
    }
    activePageIndex.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Advancing onto the pass needs the entry recorded first (the pass shows its
    // server-issued Access ID); so does reaching the end of a funnel that asked
    // the guest anything.
    const targetPage = projectPages.value[activePageIndex.value];
    const isLastPage = activePageIndex.value === projectPages.value.length - 1;
    if (pageHasPass(targetPage) || (isLastPage && hasAnswers())) {
      sendSubmission();
    }
  } else if (hasAnswers() || projectPages.value.some(pageHasPass)) {
    // Already on the final page: execute final submission
    sendSubmission();
  }
}

/**
 * The guest walks through the funnel pages only. The Ticket page is the
 * design of the downloadable PDF; it is kept aside for the pass to render.
 */
const ticketSource = reactive<TicketSource>({
  page: null,
  context: { passWidget: null, logoUrl: '', campaignTitle: '' }
});
provide(TICKET_SOURCE_KEY, ticketSource);

function setCampaignPages(pages: ActivationPage[], title?: string) {
  // A guest's form always starts empty, whatever a project saved earlier holds.
  stripTextAnswers(pages);
  projectPages.value = pages.filter(p => p.kind !== 'ticket');
  ticketSource.page = pages.find(p => p.kind === 'ticket') || null;
  const widgets = pages.flatMap(p => p.widget_tree || []);
  const pass = widgets.find(w => w.type === 'GuestEPass') || null;
  const hero = widgets.find(w => w.type === 'HeroDrop' && w.props?.brandLogoUrl);
  ticketSource.context = {
    passWidget: pass,
    logoUrl: pass?.props?.brandLogoUrl || hero?.props?.brandLogoUrl || '',
    campaignTitle: title || ''
  };
}

function pageHasPass(page?: ActivationPage | null): boolean {
  return Boolean(page?.widget_tree?.some(w => w.type === 'GuestEPass'));
}

function hasAnswers(): boolean {
  return Object.values(collectedFormData.value).some(v => (Array.isArray(v) ? v.length > 0 : String(v ?? '').trim() !== ''));
}

/** The pass type (VIP / Public) the campaign's Ticket Summary issues. */
function campaignGuestType(): string {
  for (const page of projectPages.value) {
    const pass = page.widget_tree?.find(w => w.type === 'GuestEPass');
    if (pass) return String(pass.props?.guestType || 'Public');
  }
  return '';
}

function handlePrevPage() {
  if (activePageIndex.value > 0) {
    activePageIndex.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handlePopState() {
  if (activePageIndex.value > 0) {
    activePageIndex.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const livePass = reactive<LivePassState>({
  status: 'idle',
  code: '',
  guestName: '',
  email: '',
  guestType: '',
  sessions: [],
  error: '',
  retry: () => sendSubmission()
});
provide(LIVE_PASS_KEY, livePass);

async function sendSubmission() {
  // A funnel can reach "submit" twice (entering the pass page, then the final CTA) — record once.
  if (livePass.status === 'pending' || livePass.status === 'ready') return;
  livePass.status = 'pending';
  livePass.error = '';
  try {
    const payload = {
      page_id: submissionPageId.value,
      submission_type: 'raffle',
      form_data: {
        ...collectedFormData.value,
        // The server needs a name and email; a funnel that never asked for
        // them still issues a pass, under placeholders the hub hides.
        fullName: collectedFormData.value.fullName || collectedFormData.value.name || 'Guest Participant',
        email: collectedFormData.value.email || 'guest@activation.internal',
        ...(campaignGuestType() ? { 'Guest Type': campaignGuestType() } : {}),
        submittedAt: new Date().toISOString()
      }
    };
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...staffAuthHeaders() },
      body: JSON.stringify(payload)
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success && json.data?.ticket_code) {
      const recorded = json.data.form_data || {};
      livePass.code = json.data.ticket_code;
      livePass.guestName = recorded.fullName === 'Guest Participant' ? '' : String(recorded.fullName || '');
      livePass.email = recorded.email === 'guest@activation.internal' ? '' : String(recorded.email || '');
      livePass.guestType = String(recorded['Guest Type'] || campaignGuestType() || '');
      const sessions = recorded[SESSIONS_ANSWER_KEY];
      livePass.sessions = Array.isArray(sessions) ? sessions.filter((x: any) => x && typeof x === 'object' && x.label) : [];
      livePass.status = 'ready';
      return;
    }
    livePass.error = json?.error || 'We could not register your entry.';
    livePass.status = 'error';
  } catch (err) {
    console.warn('[PublicDropView] Error submitting entry:', err);
    livePass.error = 'No connection — check your signal and try again.';
    livePass.status = 'error';
  }
}

function applySeo(page: ActivationPage) {
  const title = page.page_settings?.seoTitle || page.title || '707 Activation Drop';
  document.title = `${title} | 707 Activation`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', page.page_settings?.seoDescription || page.description || 'Enter the official 707 activation drop.');
  }
}

onMounted(() => {
  loadPage();
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', handlePopState);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('popstate', handlePopState);
  }
});

watch(
  () => [route.params.brandSlug, route.params.pageSlug],
  () => {
    loadPage();
  }
);
</script>

<style scoped>
.public-drop-view {
  min-height: 100dvh;
  -webkit-text-size-adjust: 100%;
}
</style>
