<template>
  <div class="h-full w-full bg-white text-black font-707 flex flex-col overflow-y-auto overflow-x-hidden hub-root" data-name="Campaign Hub">
    <!-- ============================================================== -->
    <!-- STATE 1: CAMPAIGN SELECTION LAUNCHPAD (Pre-Hub Gateway)        -->
    <!-- Strictly follows Sign-Up Step 1 layout on pure white canvas    -->
    <!-- ============================================================== -->
    <div v-if="!selectedProject" class="min-h-screen w-full flex flex-col justify-between bg-white text-black font-707 select-none">
      <!-- 48px Header -->
      <header class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between border-b border-black/10 shrink-0 sticky top-0 z-30 bg-white">
        <div class="flex items-center gap-[10px] h-[20px]">
          <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
            <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
          </router-link>
          <button 
            type="button"
            @click="showWhatsNewModal = true"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-707 font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
            title="What's New in Design Studio 1.5"
          >
            1.5
          </button>
        </div>

        <router-link to="/" class="text-[12.5px] text-neutral-500 hover:text-black font-medium transition-colors">
          Exit to Studio
        </router-link>
      </header>

      <!-- Center Stage: Minimalist Launchpad -->
      <main class="w-full flex-1 flex flex-col items-center justify-between px-[24px] py-[32px] sm:py-[48px] max-w-[620px] mx-auto my-auto">
        <!-- Top spacer for balanced optical centering -->
        <div class="hidden sm:block shrink-0 h-4" />

        <div class="flex flex-col items-center gap-7 w-full text-center my-auto animate-apple-pop">
          <div class="flex flex-col items-center text-center gap-2">
            <span class="text-[12.5px] uppercase tracking-[0.14em] text-neutral-400 font-medium">Campaign Hub</span>
            <h1 class="font-707 text-[32px] sm:text-[40px] font-normal tracking-tight text-black leading-[38px] sm:leading-[46px]">
              Which campaign are you <span class="font-medium">managing today?</span>
            </h1>
            <p class="font-707 text-[13.5px] text-neutral-500 text-center max-w-[440px] mt-1 leading-relaxed">
              Select an active campaign to access real-time door check-in, guest database, and event suite.
            </p>
          </div>

          <!-- Quick Search Bar -->
          <div class="w-full max-w-[440px] relative mt-1">
            <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              v-model="launchpadSearch"
              type="text"
              placeholder="Search campaign by name or brand…"
              class="w-full h-[44px] pl-10 pr-4 rounded-[12px] bg-neutral-100/80 border border-black/10 focus:border-black focus:bg-white text-[13.5px] outline-none transition-all placeholder:text-neutral-400"
              @keydown.enter.prevent="handleLaunchpadEnter"
            />
          </div>

          <!-- Campaign Pills -->
          <div class="flex flex-wrap items-center justify-center gap-2.5 w-full max-w-[540px]">
            <button
              v-for="p in filteredLaunchpadProjects"
              :key="p.id"
              type="button"
              @click="selectedLaunchpadId = p.id"
              @dblclick="selectProjectAndEnter(p.id)"
              class="px-4 py-2.5 rounded-full text-[13px] font-707 transition-all apple-press cursor-pointer flex items-center gap-2"
              :class="selectedLaunchpadId === p.id
                ? 'bg-black text-white font-medium shadow-sm ring-2 ring-black/10'
                : 'bg-neutral-100 hover:bg-neutral-200/80 text-black border border-black/5'"
            >
              <span class="font-medium truncate max-w-[220px]">{{ p.title }}</span>
              <span v-if="p.status === 'approved' || p.status === 'published'" class="size-1.5 rounded-full bg-moss-600 shrink-0" />
            </button>
            <p v-if="!filteredLaunchpadProjects.length" class="text-[13px] text-neutral-400 py-4">
              No campaigns found matching "{{ launchpadSearch }}".
            </p>
          </div>
        </div>

        <!-- Bottom Action Pill Button -->
        <div class="w-full flex flex-col items-center gap-2 pt-8 pb-2 shrink-0">
          <button
            type="button"
            @click="confirmLaunchpadSelection"
            :disabled="!selectedLaunchpadId"
            class="px-12 h-[46px] rounded-full bg-black text-white font-707 font-medium text-[13.5px] hover:bg-neutral-800 active:bg-neutral-900 transition-all flex items-center justify-center apple-press cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Enter Campaign Hub</span>
          </button>
          <span class="text-[11px] text-neutral-400 font-mono">Press Enter ↵</span>
        </div>
      </main>
    </div>

    <!-- ============================================================== -->
    <!-- STATE 2: ACTIVE CAMPAIGN HUB WORKSPACE                         -->
    <!-- No H1 title, Campaign Switcher on 48px Header, Live HUD on top -->
    <!-- ============================================================== -->
    <template v-else>
      <!-- Top 48px Header with Campaign Switcher -->
      <header class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between border-b border-black/10 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-30 select-none">
        <div class="flex items-center gap-[12px] h-[24px]">
          <!-- 707 Logo + 1.5 Badge -->
          <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
            <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
          </router-link>
          <button 
            type="button"
            @click="showWhatsNewModal = true"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-707 font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
            title="What's New in Design Studio 1.5"
          >
            1.5
          </button>

          <div class="w-px h-4 bg-black/15 mx-0.5" />

          <!-- Campaign Switcher Pill in Header (Campaign Title only, clean earth green dot) -->
          <div class="relative" ref="headerPickerRef">
            <button
              id="hub-header-switcher"
              type="button"
              @click="isPickerOpen = !isPickerOpen"
              class="flex items-center gap-2 h-[32px] px-2.5 rounded-[8px] border border-black/12 bg-neutral-50 hover:bg-neutral-100 text-black text-[12.5px] font-medium transition-all apple-press cursor-pointer"
              title="Switch campaign or return to selector"
            >
              <div class="size-1.5 rounded-full bg-moss-600 shrink-0" />
              <span class="font-medium truncate max-w-[220px] sm:max-w-[300px] text-[13px] text-black">{{ selectedProject.title }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-neutral-400 ml-0.5 shrink-0 transition-transform" :class="isPickerOpen ? 'rotate-180' : ''" />
            </button>

            <!-- Dropdown Popover -->
            <Transition name="hub-pop">
              <div
                v-if="isPickerOpen"
                class="absolute left-0 top-[calc(100%+6px)] z-50 w-[320px] apple-frost border border-black/10 rounded-[14px] shadow-[0px_24px_60px_rgba(0,0,0,0.18)] p-2 font-707"
              >
                <div class="flex items-center justify-between px-2 pt-1 pb-2">
                  <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Switch Campaign</span>
                  <button
                    type="button"
                    @click="resetToLaunchpad"
                    class="text-[11.5px] text-neutral-600 hover:text-black underline cursor-pointer"
                  >
                    All campaigns
                  </button>
                </div>

                <!-- Dropdown Search -->
                <div class="relative mb-1">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    v-model="pickerQuery"
                    type="text"
                    placeholder="Find campaign…"
                    class="w-full h-[32px] pl-8 pr-2 rounded-[7px] bg-black/[0.04] text-[12px] outline-none border border-transparent focus:border-black/20 focus:bg-white"
                  />
                </div>

                <div class="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 py-1">
                  <button
                    v-for="p in pickerProjects"
                    :key="p.id"
                    type="button"
                    @click="selectProject(p.id)"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-black/5 cursor-pointer text-left transition-colors"
                    :class="selectedProjectId === p.id ? 'bg-black/5 font-medium' : ''"
                  >
                    <div class="flex flex-col min-w-0 flex-1">
                      <span class="text-[12.5px] truncate">{{ p.title }}</span>
                    </div>
                    <span v-if="p.status === 'approved' || p.status === 'published'" class="size-1.5 rounded-full bg-moss-600 shrink-0" />
                    <Check v-if="selectedProjectId === p.id" class="w-3.5 h-3.5 text-black shrink-0" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Header Actions: Open Campaign Editor, Door Scanner, Gate Access -->
        <div class="flex items-center gap-2 md:gap-2.5">
          <!-- Live sync indicator (Earth Green) -->
          <button
            id="hub-refresh-btn"
            type="button"
            @click="refresh(true)"
            class="flex items-center gap-1.5 px-2.5 h-[32px] rounded-[8px] text-[11.5px] font-707 text-neutral-500 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
            :title="lastSyncedAt ? `Last synced ${lastSyncedLabel}` : 'Sync now'"
          >
            <span class="relative flex size-2 items-center justify-center">
              <span class="size-1.5 rounded-full" :class="loadError ? 'bg-oxblood-600' : 'bg-moss-600'" />
            </span>
            <span class="hidden lg:inline tabular-nums">{{ loadError ? 'Offline' : (isLoading ? 'Syncing…' : `Synced ${lastSyncedLabel}`) }}</span>
            <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin' : ''" />
          </button>

          <!-- Gate Access -->
          <button
            id="hub-gate-access"
            type="button"
            @click="gateOpen = true"
            class="flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] border border-black/15 bg-white text-black text-[12px] font-707 font-medium hover:bg-black/5 transition-colors cursor-pointer"
            title="Create door-security accounts for this campaign"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-neutral-600" />
            <span class="hidden md:inline">Gate access</span>
          </button>

          <!-- Door Scanner Button -->
          <a
            id="hub-open-scanner"
            :href="scannerHref"
            target="_blank"
            rel="noopener"
            class="shrink-0 flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-black/5 text-black text-[12px] font-707 font-medium transition-colors"
            title="Open entrance Door Scanner in a new tab"
          >
            <ScanLine class="w-3.5 h-3.5 text-neutral-700" />
            <span class="hidden sm:inline">Door Scanner</span>
            <ArrowUpRight class="w-3 h-3 text-neutral-400" />
          </a>

          <!-- Primary: Open Campaign Editor -->
          <router-link
            :to="editorHref"
            class="flex items-center gap-1.5 h-[32px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-707 font-medium hover:bg-neutral-800 transition-colors apple-press"
            title="Open Campaign Form Editor"
          >
            <SquarePen class="w-3.5 h-3.5" />
            <span>Open Campaign Editor</span>
            <ArrowUpRight class="w-3 h-3 text-white/60" />
          </router-link>
        </div>
      </header>

      <!-- Main Workspace -->
      <main class="flex-1 w-full py-[20px] md:py-[24px] flex flex-col gap-[20px] md:gap-[24px]">
        <!-- 1. Live Campaign HUD / Metric Ribbon (Harmonious Calm Cards, Earth Green) -->
        <div class="px-[24px] w-full">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <!-- Card 1: Total Registered -->
            <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
              <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Total Registered</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[26px] sm:text-[30px] font-medium font-mono tabular-nums leading-none text-black">{{ rows.length }}</span>
                <span class="text-[12px] text-neutral-400 font-normal">Pax</span>
              </div>
            </div>

            <!-- Card 2: Live Checked In -->
            <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Checked In</span>
                <span class="text-[11px] font-mono font-medium text-moss-700 bg-moss-50 px-1.5 py-0.2 rounded-full border border-moss-200 tabular-nums">
                  {{ checkedInPct }}%
                </span>
              </div>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[26px] sm:text-[30px] font-medium font-mono tabular-nums leading-none text-black">{{ checkedInCount }}</span>
                <span class="text-[12px] text-neutral-400 font-normal">/ {{ rows.length }}</span>
              </div>
              <!-- Mini progress bar (Earth Green) -->
              <div class="w-full h-[4px] rounded-full bg-black/10 overflow-hidden mt-1.5">
                <div class="h-full bg-moss-700 rounded-full transition-all duration-500" :style="{ width: `${checkedInPct}%` }" />
              </div>
            </div>

            <!-- Card 3: Pending Arrival -->
            <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
              <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Pending Arrival</span>
              <div class="flex items-baseline gap-2 mt-1">
                <span class="text-[26px] sm:text-[30px] font-medium font-mono tabular-nums leading-none text-neutral-800">{{ pendingArrivalCount }}</span>
                <span class="text-[12px] text-neutral-400 font-normal">Remaining</span>
              </div>
            </div>

            <!-- Card 4: Door Check-in Quick Launch (Calm & Balanced) -->
            <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
              <div class="flex items-center justify-between">
                <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Door Entrance</span>
                <span class="size-1.5 rounded-full bg-moss-600 shrink-0" />
              </div>
              <div class="mt-2">
                <a
                  :href="scannerHref"
                  target="_blank"
                  rel="noopener"
                  class="w-full h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors apple-press cursor-pointer"
                >
                  <ScanLine class="w-3.5 h-3.5" />
                  <span>Launch Scanner</span>
                  <ArrowUpRight class="w-3 h-3 text-neutral-400" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Workspace Navigation (Settings-page style tabs) -->
        <nav class="flex gap-[28px] md:gap-[44px] items-center px-[24px] w-full whitespace-nowrap overflow-x-auto no-scrollbar select-none border-b border-black/5 pb-2" aria-label="Campaign hub sections">
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
        </nav>

        <!-- 3. Workspace Content -->
        <section class="px-[24px] w-full">
          <div v-if="isInitialLoad" class="flex flex-col gap-3">
            <div v-for="i in 5" :key="i" class="h-[52px] rounded-[10px] bg-neutral-100 hub-shimmer" />
          </div>

          <template v-else>
            <div v-if="loadError" class="mb-5 flex items-center gap-3 px-4 py-3 rounded-[10px] border border-oxblood-200 bg-oxblood-50 text-[12px] text-oxblood-700">
              <AlertTriangle class="w-4 h-4 shrink-0" />
              <span class="flex-1">{{ loadError }}</span>
              <button type="button" @click="refresh(true)" class="px-2.5 py-1 rounded-[6px] bg-white border border-oxblood-200 font-medium cursor-pointer hover:bg-oxblood-100">Retry</button>
            </div>

            <!-- Guest Database Workspace -->
            <GuestDatabaseTable
              v-if="activeTab === 'guests'"
              :rows="rows"
              :campaign-title="campaignTitle"
              :show-campaign-column="false"
              :export-name="exportBaseName"
              :has-live-queue="hasLiveQueue"
              :page-id="selectedProject.id"
              @updated="mergeRows"
              @removed="removeRows"
              @toast="toast"
            />

            <!-- Queue & Capacity Workspace -->
            <QueueSettingsPanel
              v-else-if="activeTab === 'queue'"
              :page-id="selectedProjectId"
              :rows="rows"
              @toast="toast"
            />

            <!-- Raffle Draw Workspace -->
            <RaffleDraw
              v-else-if="activeTab === 'raffle'"
              :rows="rows"
              :export-name="exportBaseName"
              :campaign-title="selectedProject.title"
              @updated="mergeRows"
              @toast="toast"
            />
          </template>
        </section>
      </main>

      <!-- Security / Gate Access Drawer -->
      <GateAccessPanel
        v-if="gateOpen && selectedProject"
        :project-id="selectedProject.id"
        :project-title="selectedProject.title"
        @close="gateOpen = false"
        @toast="toast"
      />
    </template>

    <!-- Studio Toast -->
    <Transition name="hub-pop">
      <div
        v-if="toastMessage"
        class="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[90] apple-frost border border-white/60 rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-3 select-none max-w-[92vw]"
        role="status"
      >
        <div class="size-2 rounded-full bg-moss-500 shrink-0" />
        <p class="font-707 text-[12px] text-black font-medium">{{ toastMessage }}</p>
      </div>
    </Transition>

    <!-- Design Studio 1.5 What's New Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      @close="showWhatsNewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  RefreshCw, ChevronDown, Check, Search, AlertTriangle, ScanLine, ArrowUpRight,
  ShieldCheck, SquarePen
} from 'lucide-vue-next';
import GateAccessPanel from '../components/hub/GateAccessPanel.vue';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import type { ProjectItem } from '../types/editor.ts';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import GuestDatabaseTable from '../components/hub/GuestDatabaseTable.vue';
import RaffleDraw from '../components/hub/RaffleDraw.vue';
import QueueSettingsPanel from '../components/hub/QueueSettingsPanel.vue';

type TabId = 'guests' | 'queue' | 'raffle';
const TAB_IDS: TabId[] = ['guests', 'queue', 'raffle'];

const route = useRoute();
const router = useRouter();
const editorStore = useEditorStore();
const showWhatsNewModal = ref(false);

const {
  rows, isLoading, isInitialLoad, loadError, lastSyncedAt,
  selectedProjectId, projects, selectedProject,
  campaignTitle, refresh: reload, mergeRows, removeRows
} = useCampaignGuests();

const nowTick = ref(Date.now());

// Default active tab is 'guests'
const activeTab = ref<TabId>(TAB_IDS.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'guests');

/* ---------- Header Switcher ---------- */
const isPickerOpen = ref(false);
const pickerQuery = ref('');
const headerPickerRef = ref<HTMLElement | null>(null);

const pickerProjects = computed(() => {
  const q = pickerQuery.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter(p => p.title.toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.brand_slug || '').toLowerCase().includes(q));
});

/* ---------- Launchpad (Pre-Hub State) ---------- */
const launchpadSearch = ref('');
const selectedLaunchpadId = ref<string>('');

const filteredLaunchpadProjects = computed(() => {
  const q = launchpadSearch.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter(p => 
    p.title.toLowerCase().includes(q) || 
    (p.slug || '').toLowerCase().includes(q) || 
    (p.brand_slug || '').toLowerCase().includes(q)
  );
});

// Auto-select first active campaign on launchpad if available
watch(projects, (pList) => {
  if (!selectedLaunchpadId.value && pList.length > 0) {
    const active = pList.find(p => p.status === 'approved' || p.status === 'published') || pList[0];
    selectedLaunchpadId.value = active.id;
  }
}, { immediate: true });

function selectProjectAndEnter(id: string) {
  selectedProjectId.value = id;
  isPickerOpen.value = false;
  pickerQuery.value = '';
  router.replace({ query: { ...route.query, project: id } });
}

function selectProject(id: string) {
  selectProjectAndEnter(id);
}

function handleLaunchpadEnter() {
  if (selectedLaunchpadId.value) {
    selectProjectAndEnter(selectedLaunchpadId.value);
  } else if (filteredLaunchpadProjects.value.length === 1) {
    selectProjectAndEnter(filteredLaunchpadProjects.value[0].id);
  }
}

function confirmLaunchpadSelection() {
  if (selectedLaunchpadId.value) {
    selectProjectAndEnter(selectedLaunchpadId.value);
  }
}

function resetToLaunchpad() {
  selectedProjectId.value = '';
  selectedLaunchpadId.value = '';
  isPickerOpen.value = false;
  router.replace({ path: '/hub' });
}

/* ---------- Editor & Scanner URLs ---------- */
const editorHref = computed(() => {
  if (!selectedProject.value) return '/editor';
  return `/editor/${selectedProject.value.brand_slug}/${selectedProject.value.id}`;
});

const scannerHref = computed(() => {
  return router.resolve({
    path: '/hub/scanner',
    query: selectedProjectId.value ? { project: selectedProjectId.value } : {}
  }).href;
});

const exportBaseName = computed(() => {
  const base = selectedProject.value ? `${selectedProject.value.brand_slug}-${selectedProject.value.slug}` : 'campaign';
  return base.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
});

/* ---------- Live HUD Metrics ---------- */
const checkedInCount = computed(() => rows.value.filter(r => r.checked_in_at).length);
const checkedInPct = computed(() => rows.value.length ? Math.round((checkedInCount.value / rows.value.length) * 100) : 0);
const pendingArrivalCount = computed(() => Math.max(0, rows.value.length - checkedInCount.value));

/* ---------- Live Queue Detection ---------- */
function projectHasLiveQueue(p?: ProjectItem | null): boolean {
  if (!p) return false;
  if (p.id === editorStore.currentProjectId && editorStore.pages?.length) {
    if (editorStore.pages.some(pg => pg.widget_tree?.some(w => w.type === 'LiveQueuePass'))) {
      return true;
    }
  }
  const trees = [p.widget_tree || [], ...(p.pages || []).map(pg => pg.widget_tree || [])];
  for (const tree of trees) {
    if (tree.some(w => w.type === 'LiveQueuePass')) {
      return true;
    }
  }
  return false;
}

const hasLiveQueue = computed(() => {
  if (selectedProject.value) {
    return projectHasLiveQueue(selectedProject.value);
  }
  return false;
});

const tabs = computed(() => {
  const list: Array<{ id: TabId; label: string; badge?: number }> = [
    { id: 'guests' as TabId, label: 'Guest Database', badge: rows.value.length }
  ];
  if (hasLiveQueue.value) {
    list.push({ id: 'queue' as TabId, label: 'Queue & Capacity', badge: undefined });
  }
  list.push({ id: 'raffle' as TabId, label: 'Raffle & Stage Draw', badge: undefined });
  return list;
});

watch(hasLiveQueue, (active) => {
  if (!active && activeTab.value === 'queue') {
    activeTab.value = 'guests';
  }
});

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

const gateOpen = ref(false);

function setTab(id: TabId) {
  activeTab.value = id;
}

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function toast(msg: string) {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMessage.value = ''), 2800);
}

// Keep URL query shareable: /hub?project=...&tab=...
watch([activeTab, selectedProjectId], ([tab, project]) => {
  if (!project) return;
  const query: Record<string, string> = { project, tab };
  router.replace({ query });
});

function handleOutsideClick(e: MouseEvent) {
  if (isPickerOpen.value && headerPickerRef.value && !headerPickerRef.value.contains(e.target as Node)) {
    isPickerOpen.value = false;
  }
}

let tickTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
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
