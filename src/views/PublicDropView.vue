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
      >
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { AlertCircle } from 'lucide-vue-next';
import MobileArtboard from '../components/editor/MobileArtboard.vue';
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

  const brandSlug = String(route.params.brandSlug || '');
  const pageSlug = String(route.params.pageSlug || '');
  campaignBrandSlug.value = brandSlug;

  if (!brandSlug || !pageSlug) {
    errorMessage.value = 'Invalid activation link format.';
    isLoading.value = false;
    return;
  }

  // 1. Check local editorStore first in case it's in memory or local projects
  const localMatch = editorStore.projects.find(p => {
    return normalize(p.brand_slug) === normalize(brandSlug) && normalize(p.slug) === normalize(pageSlug);
  });

  if (localMatch) {
    submissionPageId.value = localMatch.id;
    if (localMatch.pages && localMatch.pages.length > 0) {
      projectPages.value = localMatch.pages;
      activePageIndex.value = 0;
      applySeo(localMatch.pages[0]);
      isLoading.value = false;
      return;
    }
  }

  // 2. Fetch from backend public endpoint
  try {
    const res = await fetch(`/api/pages/${encodeURIComponent(brandSlug)}/${encodeURIComponent(pageSlug)}`);
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data) {
        const item = json.data;
        submissionPageId.value = item.id || `proj_${Date.now()}`;
        campaignBrandSlug.value = item.brand_slug || brandSlug;

        if (Array.isArray(item.pages) && item.pages.length > 0) {
          projectPages.value = item.pages;
          const matchIdx = item.pages.findIndex((p: any) => normalize(p.slug) === normalize(pageSlug));
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

  // 3. Fallback: Check if current opened project in editorStore matches
  if (editorStore.currentPage && 
      normalize(editorStore.currentPage.brand_slug) === normalize(brandSlug) && 
      normalize(editorStore.currentPage.slug) === normalize(pageSlug)) {
    projectPages.value = editorStore.pages;
    activePageIndex.value = editorStore.activePageIndex || 0;
    applySeo(editorStore.currentPage);
    isLoading.value = false;
    return;
  }

  errorMessage.value = 'Activation page not found or not published.';
  isLoading.value = false;
}

function handleNextPage(pageFormData?: Record<string, any>) {
  if (pageFormData && typeof pageFormData === 'object') {
    Object.assign(collectedFormData.value, pageFormData);
  }

  // Check if there are more steps in the activation funnel
  if (activePageIndex.value < projectPages.value.length - 1) {
    activePageIndex.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Populate downstream GuestEPass fallback values with gathered guest credentials
    const targetPage = projectPages.value[activePageIndex.value];
    if (targetPage && Array.isArray(targetPage.widget_tree)) {
      targetPage.widget_tree.forEach(w => {
        if (w.type === 'GuestEPass' && w.props) {
          if (collectedFormData.value.fullName) w.props.guestNameFallback = collectedFormData.value.fullName;
          if (collectedFormData.value.email) w.props.emailFallback = collectedFormData.value.email;
        }
      });
    }

    // If advancing to the final confirmation page / pass, automatically post RSVP entry to backend
    if (activePageIndex.value === projectPages.value.length - 1 || targetPage?.widget_tree?.some(w => w.type === 'GuestEPass')) {
      sendSubmission();
    }
  } else {
    // Already on the final page: execute final submission
    sendSubmission();
  }
}

function handlePrevPage() {
  if (activePageIndex.value > 0) {
    activePageIndex.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function sendSubmission() {
  try {
    const payload = {
      page_id: submissionPageId.value || 'live-drop',
      brand_slug: campaignBrandSlug.value || 'brand',
      submission_type: 'raffle',
      form_data: {
        ...collectedFormData.value,
        submittedAt: new Date().toISOString()
      }
    };
    await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[PublicDropView] Error submitting entry:', err);
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
