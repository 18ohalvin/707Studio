<template>
  <!-- A fixed one-screen layout: nothing on this page scrolls, so the door never loses its place. -->
  <div class="h-[100dvh] w-full bg-[#f4f4f5] text-black font-707 flex flex-col overflow-hidden overscroll-none select-none" data-name="Door Scanner">
    <header class="w-full h-[48px] px-3 flex items-center justify-between gap-3 border-b border-black/10 bg-white shrink-0 z-30">
      <div class="flex items-center gap-2 min-w-0">
        <router-link :to="hubLink" class="size-[40px] rounded-[10px] active:bg-black/10 flex items-center justify-center shrink-0" title="Back to Campaign Hub">
          <ArrowLeft class="w-5 h-5" />
        </router-link>
        <div class="flex items-baseline gap-2.5 min-w-0">
          <span class="text-[11px] uppercase tracking-[0.16em] text-neutral-500 shrink-0">Door Scanner</span>
          <span class="text-[15px] font-medium truncate max-w-[40vw]" :title="selectedProject?.title || ''">{{ selectedProject?.title || 'No campaign selected' }}</span>
          <button v-if="selectedProject" type="button" @click="pickerOpen = true" class="shrink-0 px-2.5 h-[30px] rounded-[8px] border border-black/15 text-[12px] font-medium active:bg-black/10 cursor-pointer">Change</button>
        </div>
      </div>

      <!-- Scan / Log -->
      <div class="flex items-center p-0.5 rounded-[10px] bg-black/[0.05] border border-black/10 text-[14px] shrink-0">
        <button type="button" @click="view = 'scan'" class="px-4 h-[36px] rounded-[8px] cursor-pointer transition-all" :class="view === 'scan' ? 'bg-black text-white font-medium' : 'text-neutral-600'">Scan</button>
        <button type="button" @click="view = 'log'" class="px-4 h-[36px] rounded-[8px] cursor-pointer transition-all flex items-center gap-2" :class="view === 'log' ? 'bg-black text-white font-medium' : 'text-neutral-600'">
          Log <span class="tabular-nums text-[12px] px-1.5 rounded-full" :class="view === 'log' ? 'bg-white/20' : 'bg-black/10'">{{ checkedInCount }}</span>
        </button>
      </div>

      <div class="flex items-center gap-3 shrink-0 min-w-0">
        <button v-if="loadError" type="button" @click="refresh()" class="flex items-center gap-1.5 px-2.5 h-[32px] rounded-[8px] bg-oxblood-50 border border-oxblood-200 text-[12px] text-oxblood-700 font-medium cursor-pointer" title="The guest list could not be refreshed. Scans still go straight to the server.">
          <AlertTriangle class="w-4 h-4" /> Offline · Retry
        </button>
        <span v-else class="size-2 rounded-full bg-moss-500 shrink-0" title="Connected" />
        <span class="hidden md:inline text-[12px] text-neutral-500 truncate max-w-[160px]" title="Shown on each check-in">{{ operatorName }}</span>
      </div>
    </header>

    <main class="flex-1 min-h-0 w-full p-3 relative">
      <DoorScanner
        v-if="selectedProject"
        :key="selectedProject.id"
        :rows="rows"
        :page-ids="pageIds"
        :operator="operatorName"
        :view="view"
        standalone
        @updated="mergeRows"
        @toast="toast"
      />

      <!-- One campaign at a time: nothing is scanned until the door has chosen which one. -->
      <div v-if="!selectedProject || pickerOpen" class="absolute inset-3 z-40 rounded-[16px] border border-black/10 bg-white flex flex-col items-center justify-center px-6 py-6 overflow-y-auto">
        <div class="w-full max-w-[560px] flex flex-col gap-4">
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Door Scanner</p>
            <p class="text-[26px] font-medium leading-tight">Which campaign are you scanning for?</p>
            <p class="text-[13px] text-neutral-500 mt-1">One campaign at a time, so a guest from another event can never be admitted here.</p>
          </div>
          <div class="flex flex-col gap-2">
            <button
              v-for="p in projects"
              :key="p.id"
              type="button"
              @click="chooseCampaign(p.id)"
              class="w-full flex items-center gap-3 px-4 h-[64px] rounded-[12px] border text-left cursor-pointer active:bg-black/10 transition-colors"
              :class="selectedProject?.id === p.id ? 'border-black bg-black/[0.04]' : 'border-black/15'"
            >
              <div class="min-w-0 flex-1">
                <p class="text-[17px] font-medium leading-tight truncate">{{ p.title }}</p>
                <p class="text-[12.5px] text-neutral-500 truncate">/{{ p.brand_slug }}/{{ p.slug }}</p>
              </div>
              <span v-if="selectedProject?.id === p.id" class="text-[12px] text-neutral-500">Current</span>
            </button>
            <p v-if="!projects.length" class="text-[14px] text-neutral-500 py-4">No campaign is available to this account yet.</p>
          </div>
          <button v-if="selectedProject" type="button" @click="pickerOpen = false" class="self-start h-[44px] px-4 rounded-[10px] border border-black/15 text-[14px] font-medium active:bg-black/10 cursor-pointer">Back to scanner</button>
        </div>
      </div>
    </main>

    <!-- Toast -->
    <Transition name="scanner-pop">
      <div
        v-if="toastMessage"
        class="fixed top-[60px] left-1/2 -translate-x-1/2 z-[60] bg-black text-white rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.25)] flex items-center gap-3 select-none max-w-[92vw]"
        role="status"
      >
        <div class="size-2 rounded-full bg-moss-300 shrink-0" />
        <p class="font-707 text-[13px] font-medium">{{ toastMessage }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import DoorScanner from '../components/hub/DoorScanner.vue';

/**
 * The Door Scanner on its own page, for the tablet (10", landscape) or phone at the entrance:
 * one screen with nothing to scroll, nothing else on it, the campaign remembered in the URL
 * (/hub/scanner?project=…), and a fast poll so counts from other doors show up.
 */
const router = useRouter();
const authStore = useAuthStore();

const { rows, loadError, selectedProjectId, selectedProject, projects, pageIds, refresh, mergeRows } = useCampaignGuests({ pollMs: 10000, requireProject: true });
const pickerOpen = ref(false);

function chooseCampaign(id: string) {
  selectedProjectId.value = id;
  pickerOpen.value = false;
}

const view = ref<'scan' | 'log'>('scan');
const operatorName = computed(() => authStore.currentUser?.name || 'Door staff');
const checkedInCount = computed(() => rows.value.filter(r => r.checked_in_at).length);
const hubLink = computed(() => ({ path: '/hub', query: selectedProject.value ? { project: selectedProject.value.id } : {} }));

watch(selectedProject, (project) => {
  router.replace({ query: project ? { project: project.id } : {} });
});

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function toast(msg: string) {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMessage.value = ''), 2800);
}

onMounted(() => {
  document.title = 'Door Scanner | 707 Design Studio';
});

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.scanner-pop-enter-active, .scanner-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.scanner-pop-enter-from, .scanner-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
