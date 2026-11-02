<template>
  <!-- A fixed one-screen layout: nothing on this page scrolls, so the door never loses its place. -->
  <div class="h-[100dvh] w-full bg-[#f4f4f5] text-black font-707 flex flex-col overflow-hidden overscroll-none select-none" data-name="Door Scanner">
    <header class="w-full h-[48px] px-3 flex items-center justify-between gap-3 border-b border-black/10 bg-white shrink-0 z-30">
      <div class="flex items-center gap-2 min-w-0">
        <router-link v-if="!isGate" :to="hubLink" class="size-[40px] rounded-[10px] active:bg-black/10 flex items-center justify-center shrink-0" title="Back to Campaign Hub">
          <ArrowLeft class="w-5 h-5" />
        </router-link>
        <div class="flex items-baseline gap-2.5 min-w-0">
          <span class="text-[11px] uppercase tracking-[0.16em] text-neutral-500 shrink-0">Door Scanner</span>
          <span class="text-[15px] font-medium truncate max-w-[40vw]" :title="selectedProject?.title || ''">{{ selectedProject?.title || 'Loading campaign…' }}</span>
          <!-- Staff Accounts (Gate Access) setup trigger for Brand Admins only -->
          <button
            v-if="selectedProject && !isGate"
            type="button"
            @click="gateOpen = true"
            class="shrink-0 px-2.5 h-[30px] rounded-[8px] border border-black/15 text-[12px] font-medium active:bg-black/10 hover:bg-black/5 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Manage door-security staff credentials for this campaign"
          >
            <ShieldCheck class="w-3.5 h-3.5 text-neutral-600" />
            <span class="hidden sm:inline">Staff Accounts</span>
          </button>
        </div>
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-black/5 border border-black/10 text-[11.5px] font-mono text-neutral-700 shrink-0">
          <Calendar class="w-3.5 h-3.5 text-neutral-500" />
          <span>Today · {{ todayFormatted }}</span>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0 min-w-0">
        <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-moss-50 border border-moss-200 text-[11px] font-mono text-moss-800 shrink-0" title="Real-time sync active across all gate scanners">
          <span class="size-1.5 rounded-full bg-moss-600" />
          <span>Sync · 2.5s</span>
        </div>
        <button v-if="loadError" type="button" @click="refresh()" class="flex items-center gap-1.5 px-2.5 h-[32px] rounded-[8px] bg-oxblood-50 border border-oxblood-200 text-[12px] text-oxblood-700 font-medium cursor-pointer" title="The guest list could not be refreshed. Scans still go straight to the server.">
          <AlertTriangle class="w-4 h-4" /> Offline · Retry
        </button>
        <span v-else class="size-2 rounded-full bg-moss-500 shrink-0" title="Connected" />
        <span class="hidden md:inline text-[12px] text-neutral-500 truncate max-w-[160px]" title="Logged in user">{{ operatorName }}</span>
        <button v-if="isGate" type="button" @click="leave" class="px-3 h-[34px] rounded-[8px] border border-black/15 text-[12px] font-medium active:bg-black/10 cursor-pointer">Sign out</button>
      </div>
    </header>

    <main class="flex-1 min-h-0 w-full p-3 relative">
      <DoorScanner
        v-if="selectedProject"
        :key="selectedProject.id"
        :rows="rows"
        :page-ids="pageIds"
        :operator="operatorName"
        :event-config="selectedProject.event_config || selectedProject.pages?.[0]?.page_settings?.eventConfig"
        standalone
        @updated="mergeRows"
        @refresh="refresh"
        @toast="toast"
      />

      <div v-else class="h-full w-full flex items-center justify-center">
        <div class="size-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
      </div>
    </main>

    <!-- Staff Accounts / Gate Access Drawer (Admins Only) -->
    <GateAccessPanel
      v-if="gateOpen && selectedProject && !isGate"
      :project-id="selectedProject.id"
      :project-title="selectedProject.title"
      @close="gateOpen = false"
      @toast="toast"
    />

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
import { ArrowLeft, AlertTriangle, Calendar, ShieldCheck } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import { getTodayDateStrings } from '../components/hub/hubUtils.ts';
import DoorScanner from '../components/hub/DoorScanner.vue';
import GateAccessPanel from '../components/hub/GateAccessPanel.vue';

/**
 * The Door Scanner on its own page, for the tablet (10", landscape) or phone at the entrance:
 * Strictly locked to the selected campaign passed via URL query (/hub/scanner?project=…),
 * with fast polling so counts from other doors sync in real-time.
 */
const router = useRouter();
const authStore = useAuthStore();

const todayFormatted = computed(() => getTodayDateStrings().formattedShort);

const { rows, loadError, selectedProjectId, selectedProject, pageIds, refresh, mergeRows } = useCampaignGuests({ pollMs: 2500, requireProject: true });
const gateOpen = ref(false);

/** Door security is tied to one campaign by the server; here it is simply fixed and the way out is signing out. */
const isGate = computed(() => authStore.currentUser?.role === 'gate');
if (isGate.value && authStore.currentUser?.assignedProject) selectedProjectId.value = authStore.currentUser.assignedProject;
function leave() {
  authStore.signOut();
  router.replace('/login');
}

const operatorName = computed(() => authStore.currentUser?.name || (isGate.value ? 'Gate security' : 'Brand Admin'));
const hubLink = computed(() => ({ path: '/hub', query: selectedProject.value ? { project: selectedProject.value.id } : {} }));

watch(selectedProject, (project) => {
  if (project) {
    router.replace({ query: { project: project.id } });
  }
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
  // If not authenticated as gate account and no campaign was selected, return to Hub
  if (!selectedProjectId.value && !isGate.value) {
    router.replace('/hub');
  }
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
