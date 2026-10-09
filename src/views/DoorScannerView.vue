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
          <select
            id="scanner-campaign"
            v-model="selectedProjectId"
            class="max-w-[46vw] bg-transparent text-[15px] font-medium outline-none cursor-pointer truncate"
            title="Campaign being checked in"
          >
            <option value="all">All campaigns</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <button v-if="loadError" type="button" @click="refresh()" class="flex items-center gap-1.5 px-2.5 h-[32px] rounded-[8px] bg-red-50 border border-red-200 text-[12px] text-red-700 font-medium cursor-pointer" title="The guest list could not be refreshed. Scans still go straight to the server.">
          <AlertTriangle class="w-4 h-4" /> Offline · Retry
        </button>
        <span v-else class="flex items-center gap-1.5 text-[13px] text-neutral-600 tabular-nums">
          <span class="size-2 rounded-full bg-emerald-500" />
          {{ checkedInCount }} / {{ rows.length }} in
        </span>
        <span class="hidden md:inline text-[12px] text-neutral-500 truncate max-w-[160px]" title="Shown on each check-in">{{ operatorName }}</span>
      </div>
    </header>

    <main class="flex-1 min-h-0 w-full p-3">
      <DoorScanner
        :rows="rows"
        :page-ids="pageIds"
        :operator="operatorName"
        standalone
        @updated="mergeRows"
        @toast="toast"
      />
    </main>

    <!-- Toast -->
    <Transition name="scanner-pop">
      <div
        v-if="toastMessage"
        class="fixed top-[60px] left-1/2 -translate-x-1/2 z-[60] bg-black text-white rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.25)] flex items-center gap-3 select-none max-w-[92vw]"
        role="status"
      >
        <div class="size-2 rounded-full bg-emerald-400 shrink-0" />
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

const { rows, loadError, selectedProjectId, projects, pageIds, refresh, mergeRows } = useCampaignGuests({ pollMs: 10000 });

const operatorName = computed(() => authStore.currentUser?.name || 'Door staff');
const checkedInCount = computed(() => rows.value.filter(r => r.checked_in_at).length);
const hubLink = computed(() => ({ path: '/hub', query: selectedProjectId.value !== 'all' ? { project: selectedProjectId.value } : {} }));

watch(selectedProjectId, (project) => {
  router.replace({ query: project !== 'all' ? { project } : {} });
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
