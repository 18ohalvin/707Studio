<template>
  <div class="h-full w-full min-h-[100dvh] bg-[#f4f4f5] text-black font-707 flex flex-col overflow-y-auto overflow-x-hidden" data-name="Door Scanner">
    <!-- Slim header: campaign, operator, back to the hub -->
    <header class="w-full h-[52px] px-[16px] md:px-[20px] flex items-center justify-between gap-3 border-b border-black/10 bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-30 select-none">
      <div class="flex items-center gap-3 min-w-0">
        <router-link :to="hubLink" class="size-[32px] rounded-[8px] hover:bg-black/5 flex items-center justify-center shrink-0" title="Back to Campaign Hub">
          <ArrowLeft class="w-4 h-4" />
        </router-link>
        <div class="flex flex-col min-w-0">
          <span class="text-[10.5px] uppercase tracking-[0.16em] text-neutral-500 leading-none">Door Scanner</span>
          <select
            id="scanner-campaign"
            v-model="selectedProjectId"
            class="mt-1 max-w-[56vw] md:max-w-[420px] bg-transparent text-[14px] font-medium leading-[18px] outline-none cursor-pointer truncate"
            title="Campaign being checked in"
          >
            <option value="all">All campaigns</option>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <span class="hidden sm:flex items-center gap-1.5 text-[11.5px] text-neutral-600 tabular-nums">
          <span class="size-2 rounded-full" :class="loadError ? 'bg-red-500' : 'bg-emerald-500'" />
          {{ loadError ? 'Offline' : `${checkedInCount} / ${rows.length} in` }}
        </span>
        <span class="hidden md:inline text-[11.5px] text-neutral-500 truncate max-w-[180px]" title="Shown on each check-in">{{ operatorName }}</span>
      </div>
    </header>

    <main class="flex-1 w-full px-[16px] md:px-[20px] py-[16px] md:py-[20px]">
      <div v-if="loadError" class="mb-4 flex items-center gap-3 px-4 py-3 rounded-[10px] border border-red-200 bg-red-50 text-[12px] text-red-700">
        <AlertTriangle class="w-4 h-4 shrink-0" />
        <span class="flex-1">{{ loadError }} Scans still go straight to the server.</span>
        <button type="button" @click="refresh()" class="px-2.5 py-1 rounded-[6px] bg-white border border-red-200 font-medium cursor-pointer hover:bg-red-100">Retry</button>
      </div>

      <DoorScanner
        :rows="rows"
        :page-ids="pageIds"
        :operator="operatorName"
        standalone
        @updated="mergeRows"
        @toast="toast"
      />
    </main>

    <!-- Toast (Studio glass toast) -->
    <Transition name="scanner-pop">
      <div
        v-if="toastMessage"
        class="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[60] apple-frost border border-white/60 rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-3 select-none max-w-[92vw]"
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
import { useRouter } from 'vue-router';
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import DoorScanner from '../components/hub/DoorScanner.vue';

/**
 * The Door Scanner on its own page, for the phone or tablet at the entrance:
 * nothing else on screen, the campaign remembered in the URL
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
