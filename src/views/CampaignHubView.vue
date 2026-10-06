<template>
  <div class="h-full w-full bg-white text-black font-707 flex flex-col overflow-y-auto overflow-x-hidden hub-root" data-name="Campaign Hub">
    <!-- Top Header (matches Studio / Settings 48px header) -->
    <header class="w-full h-[48px] px-[16px] md:px-[20px] flex items-center justify-between border-b border-black/10 bg-white/90 backdrop-blur-md shrink-0 sticky top-0 z-30 select-none">
      <div class="flex items-end gap-[16px] h-[16px]">
        <router-link to="/" class="h-[16px] w-[51px] relative shrink-0 flex items-end cursor-pointer hover:opacity-80 transition-opacity" title="Back to 707 Home">
          <img :src="FIGMA_ASSETS.logo707" alt="707 Logo" class="inset-0 object-contain pointer-events-none size-full" />
        </router-link>
        <p class="hidden sm:flex font-707 text-[14px] text-black font-normal uppercase whitespace-nowrap leading-none items-baseline translate-y-[2px]">
          <span class="tracking-[0.24em] mr-2">CAMPAIGN HUB</span>
          <span class="tracking-normal font-normal">1.0</span>
        </p>
      </div>

      <div class="flex items-center gap-2 md:gap-3">
        <!-- Live sync indicator -->
        <button
          id="hub-refresh-btn"
          type="button"
          @click="refresh(true)"
          class="flex items-center gap-2 px-2.5 h-[30px] rounded-[6px] text-[11px] font-707 text-neutral-500 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          :title="lastSyncedAt ? `Last synced ${lastSyncedLabel}` : 'Sync now'"
        >
          <span class="relative flex size-2">
            <span v-if="!loadError" class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span class="relative inline-flex rounded-full size-2" :class="loadError ? 'bg-red-500' : 'bg-emerald-500'" />
          </span>
          <span class="hidden md:inline tabular-nums">{{ loadError ? 'Offline' : (isLoading ? 'Syncing…' : `Live · ${lastSyncedLabel}`) }}</span>
          <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin' : ''" />
        </button>

        <router-link
          to="/"
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] border border-black/15 text-[12px] font-707 font-medium hover:bg-black/5 transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Back to Studio</span>
        </router-link>
      </div>
    </header>

    <main class="flex-1 w-full max-w-[1280px] mx-auto py-[28px] md:py-[48px] flex flex-col gap-[28px] md:gap-[36px]">
      <!-- Intro + Campaign Selector -->
      <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5 px-[20px] md:px-[48px] w-full">
        <div class="flex flex-col gap-[8px] items-start">
          <h1 class="font-707 text-[24px] md:text-[28px] leading-[34px] tracking-[-0.56px] text-black font-normal">
            Campaign Hub
          </h1>
          <p class="font-707 text-[14px] leading-[24px] text-black max-w-[640px]">
            Manage guest data, run event-day check-in, and draw raffle winners — separate from the design canvas.
          </p>
        </div>

        <!-- Campaign Picker -->
        <div class="relative w-full lg:w-[340px] shrink-0" ref="pickerRef">
          <p class="text-[11px] text-neutral-500 mb-1.5 uppercase tracking-[0.12em]">Campaign</p>
          <button
            id="hub-campaign-picker"
            type="button"
            @click="isPickerOpen = !isPickerOpen"
            class="w-full h-[44px] px-3 rounded-[10px] border border-black/15 bg-white hover:border-black/40 flex items-center gap-3 cursor-pointer transition-colors text-left"
            :class="isPickerOpen ? 'border-black ring-4 ring-black/5' : ''"
          >
            <div class="size-7 rounded-[7px] bg-neutral-100 border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
              <img v-if="selectedProject && projectCover(selectedProject)" :src="projectCover(selectedProject)" class="size-full object-cover" alt="" />
              <Layers v-else class="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[13px] font-medium truncate">{{ selectedProject?.title || 'All campaigns' }}</span>
              <span class="text-[10.5px] text-neutral-500 font-mono truncate">
                {{ selectedProject ? `/${selectedProject.brand_slug}/${selectedProject.slug}` : `${projects.length} campaign${projects.length === 1 ? '' : 's'} combined` }}
              </span>
            </div>
            <ChevronDown class="w-4 h-4 text-neutral-500 transition-transform" :class="isPickerOpen ? 'rotate-180' : ''" />
          </button>

          <Transition name="hub-pop">
            <div
              v-if="isPickerOpen"
              class="absolute right-0 left-0 top-[calc(100%+6px)] z-40 backdrop-blur-2xl bg-white/90 border border-black/10 rounded-[12px] shadow-[0px_24px_60px_rgba(0,0,0,0.16)] p-1.5 max-h-[340px] overflow-y-auto"
            >
              <div class="px-2 pt-1 pb-2">
                <div class="relative">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    v-model="pickerQuery"
                    type="text"
                    placeholder="Find campaign…"
                    class="w-full h-[32px] pl-8 pr-2 rounded-[7px] bg-black/[0.04] border border-transparent text-[12px] outline-none focus:border-black/20 focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="button"
                @click="selectProject('all')"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-black/5 cursor-pointer text-left"
              >
                <div class="size-7 rounded-[7px] bg-black text-white flex items-center justify-center shrink-0"><LayoutGrid class="w-3.5 h-3.5" /></div>
                <span class="text-[12.5px] font-medium flex-1">All campaigns</span>
                <Check v-if="selectedProjectId === 'all'" class="w-4 h-4" />
              </button>
              <div class="h-px bg-black/5 my-1" />
              <button
                v-for="p in pickerProjects"
                :key="p.id"
                type="button"
                @click="selectProject(p.id)"
                class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-black/5 cursor-pointer text-left"
              >
                <div class="size-7 rounded-[7px] bg-neutral-100 border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
                  <img v-if="projectCover(p)" :src="projectCover(p)" class="size-full object-cover" alt="" />
                  <Layers v-else class="w-3.5 h-3.5 text-neutral-400" />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-[12.5px] font-medium truncate">{{ p.title }}</span>
                  <span class="text-[10.5px] text-neutral-500 font-mono truncate">/{{ p.brand_slug }}/{{ p.slug }}</span>
                </div>
                <span v-if="p.status === 'approved' || p.status === 'published'" class="text-[9.5px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Live</span>
                <Check v-if="selectedProjectId === p.id" class="w-4 h-4" />
              </button>
              <p v-if="!pickerProjects.length" class="text-[12px] text-neutral-400 text-center py-4">No campaigns match.</p>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Text Navigation (Settings-page style) -->
      <nav class="flex gap-[28px] md:gap-[44px] items-center px-[20px] md:px-[48px] w-full whitespace-nowrap overflow-x-auto no-scrollbar select-none" aria-label="Campaign hub sections">
        <button
          v-for="t in tabs"
          :id="`hub-tab-${t.id}`"
          :key="t.id"
          type="button"
          @click="setTab(t.id)"
          class="bg-transparent border-none p-0 cursor-pointer font-707 text-[15px] md:text-[16px] leading-[24px] transition-colors flex items-center gap-2"
          :class="activeTab === t.id ? 'font-medium underline decoration-solid underline-offset-[8px] text-black' : 'font-normal text-neutral-500 hover:text-black'"
        >
          {{ t.label }}
          <span v-if="t.badge !== undefined" class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 no-underline tabular-nums">{{ t.badge }}</span>
        </button>
        <a
          id="hub-open-scanner"
          :href="scannerHref"
          target="_blank"
          rel="noopener"
          class="ml-auto shrink-0 flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] bg-black text-white text-[12.5px] font-707 font-medium hover:bg-neutral-800 transition-colors"
          title="Open the full-screen Door Scanner for the entrance (new tab)"
        >
          <ScanLine class="w-3.5 h-3.5" /> Door Scanner <ArrowUpRight class="w-3.5 h-3.5" />
        </a>
      </nav>

      <!-- Content -->
      <section class="px-[20px] md:px-[48px] w-full">
        <div v-if="isInitialLoad" class="flex flex-col gap-3">
          <div v-for="i in 5" :key="i" class="h-[52px] rounded-[10px] bg-neutral-100 hub-shimmer" />
        </div>

        <template v-else>
          <div v-if="loadError" class="mb-5 flex items-center gap-3 px-4 py-3 rounded-[10px] border border-red-200 bg-red-50 text-[12px] text-red-700">
            <AlertTriangle class="w-4 h-4 shrink-0" />
            <span class="flex-1">{{ loadError }}</span>
            <button type="button" @click="refresh(true)" class="px-2.5 py-1 rounded-[6px] bg-white border border-red-200 font-medium cursor-pointer hover:bg-red-100">Retry</button>
          </div>

          <HubOverview
            v-if="activeTab === 'overview'"
            :rows="rows"
            :campaign-title="campaignTitle"
            @go="setTab"
          />
          <GuestDatabaseTable
            v-else-if="activeTab === 'guests'"
            :rows="rows"
            :campaign-title="campaignTitle"
            :show-campaign-column="selectedProjectId === 'all'"
            :export-name="exportBaseName"
            @updated="mergeRows"
            @removed="removeRows"
            @toast="toast"
          />
          <RaffleDraw
            v-else-if="activeTab === 'raffle'"
            :rows="rows"
            :export-name="exportBaseName"
            @updated="mergeRows"
            @toast="toast"
          />
        </template>
      </section>
    </main>

    <!-- Toast (Studio glass toast) -->
    <Transition name="hub-pop">
      <div
        v-if="toastMessage"
        class="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[60] backdrop-blur-2xl bg-white/80 border border-white/60 rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-3 select-none max-w-[92vw]"
        role="status"
      >
        <div class="size-2 rounded-full bg-emerald-500 shrink-0" />
        <p class="font-707 text-[12px] text-black font-medium">{{ toastMessage }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, RefreshCw, ChevronDown, Layers, LayoutGrid, Check, Search, AlertTriangle, ScanLine, ArrowUpRight } from 'lucide-vue-next';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import type { ProjectItem } from '../types/editor.ts';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import HubOverview from '../components/hub/HubOverview.vue';
import GuestDatabaseTable from '../components/hub/GuestDatabaseTable.vue';
import RaffleDraw from '../components/hub/RaffleDraw.vue';

type TabId = 'overview' | 'guests' | 'raffle';
const TAB_IDS: TabId[] = ['overview', 'guests', 'raffle'];

const route = useRoute();
const router = useRouter();

const {
  rows, isLoading, isInitialLoad, loadError, lastSyncedAt,
  selectedProjectId, projects, selectedProject,
  campaignTitle, refresh: reload, mergeRows, removeRows
} = useCampaignGuests();

const nowTick = ref(Date.now());

const activeTab = ref<TabId>(TAB_IDS.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'overview');

const isPickerOpen = ref(false);
const pickerQuery = ref('');
const pickerRef = ref<HTMLElement | null>(null);

const pickerProjects = computed(() => {
  const q = pickerQuery.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter(p => p.title.toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q));
});

const exportBaseName = computed(() => {
  const base = selectedProject.value ? `${selectedProject.value.brand_slug}-${selectedProject.value.slug}` : 'all-campaigns';
  return base.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
});

const tabs = computed(() => [
  { id: 'overview' as TabId, label: 'Overview', badge: undefined as number | undefined },
  { id: 'guests' as TabId, label: 'Guest Database', badge: rows.value.length },
  { id: 'raffle' as TabId, label: 'Raffle Draw', badge: undefined }
]);

const lastSyncedLabel = computed(() => {
  if (!lastSyncedAt.value) return 'now';
  const secs = Math.max(0, Math.round((nowTick.value - lastSyncedAt.value) / 1000));
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  return `${Math.round(secs / 60)}m ago`;
});

async function refresh(manual = false) {
  const count = await reload();
  if (manual && count !== null) toast(`Synced ${count} guest record${count === 1 ? '' : 's'}.`);
}

/** The Door Scanner is its own full-screen page, made for a phone or tablet at the entrance. */
const scannerHref = computed(() => router.resolve({ path: '/hub/scanner', query: selectedProjectId.value !== 'all' ? { project: selectedProjectId.value } : {} }).href);

function openScanner() {
  window.open(scannerHref.value, '_blank', 'noopener');
}

function setTab(id: TabId | 'scanner') {
  if (id === 'scanner') {
    openScanner();
    return;
  }
  activeTab.value = id;
}

function selectProject(id: string) {
  selectedProjectId.value = id;
  isPickerOpen.value = false;
  pickerQuery.value = '';
}

function projectCover(p: ProjectItem): string | undefined {
  const trees = [p.widget_tree || [], ...(p.pages || []).map(pg => pg.widget_tree || [])];
  for (const tree of trees) {
    const hero = tree.find(w => w.type === 'HeroDrop' && w.props?.imageUrl);
    if (hero) return hero.props.imageUrl;
  }
  return undefined;
}

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function toast(msg: string) {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMessage.value = ''), 2800);
}

// Keep URL shareable: /hub?project=...&tab=...
watch([activeTab, selectedProjectId], ([tab, project]) => {
  const query: Record<string, string> = { tab };
  if (project !== 'all') query.project = project;
  router.replace({ query });
});

function handleOutsideClick(e: MouseEvent) {
  if (isPickerOpen.value && pickerRef.value && !pickerRef.value.contains(e.target as Node)) {
    isPickerOpen.value = false;
  }
}

let tickTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Older links pointed at the scanner as a hub tab.
  if (route.query.tab === 'scanner') {
    router.replace({ path: '/hub/scanner', query: route.query.project ? { project: String(route.query.project) } : {} });
    return;
  }
  document.title = 'Campaign Hub | 707 Design Studio';
  document.addEventListener('mousedown', handleOutsideClick);
  tickTimer = setInterval(() => (nowTick.value = Date.now()), 5000);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  if (tickTimer) clearInterval(tickTimer);
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

.hub-shimmer {
  background: linear-gradient(90deg, #f4f4f4 0%, #ececec 40%, #f4f4f4 80%);
  background-size: 200% 100%;
  animation: hub-shimmer 1.4s ease-in-out infinite;
}
@keyframes hub-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.hub-pop-enter-active, .hub-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.hub-pop-enter-from, .hub-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
