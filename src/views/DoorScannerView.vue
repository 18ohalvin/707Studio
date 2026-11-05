<template>
  <!-- A fixed one-screen layout: nothing on this page scrolls, so the door never loses its place. -->
  <div 
    class="h-[100dvh] w-full font-sans tracking-normal flex flex-col overflow-hidden overscroll-none select-none transition-colors duration-200"
    :class="isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f4f4f5] text-black'"
    data-name="Door Scanner"
  >
    <header 
      class="w-full h-[48px] px-3 flex items-center justify-between gap-3 shrink-0 z-30 border-b"
      :class="isDark ? 'bg-[#141414] border-white/10 text-white' : 'bg-white border-black/10 text-black'"
    >
      <div class="flex items-center gap-2 min-w-0">
        <router-link 
          v-if="!isGate" 
          :to="hubLink" 
          class="size-[40px] rounded-[10px] flex items-center justify-center shrink-0 transition-colors"
          :class="isDark ? 'hover:bg-white/10 active:bg-white/20 text-white' : 'active:bg-black/10 text-black'"
          title="Back to Campaign Hub"
        >
          <ArrowLeft class="w-5 h-5" />
        </router-link>
        <div class="flex items-center gap-2 min-w-0">
          <span 
            class="text-[15px] font-medium truncate max-w-[40vw]"
            :class="isDark ? 'text-white' : 'text-black'"
            :title="selectedProject?.title || ''"
          >
            {{ selectedProject?.title || 'Loading campaign…' }}
          </span>
        </div>
        <div 
          class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11.5px] font-mono shrink-0 border"
          :class="isDark ? 'bg-white/10 border-white/15 text-white/90' : 'bg-black/5 border-black/10 text-neutral-700'"
        >
          <Calendar class="w-3.5 h-3.5 text-neutral-400" />
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
        <!-- Operator identity shown only for Gate Staff scanning on dedicated tablets -->
        <div v-else-if="isGate" class="hidden md:flex items-center gap-1.5 text-[12px] truncate max-w-[200px]" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'" title="Active gate staff device">
          <span class="size-1.5 rounded-full bg-moss-600 shrink-0" />
          <span class="truncate">{{ operatorName }}</span>
        </div>
        <button 
          v-if="isGate" 
          type="button" 
          @click="leave" 
          class="px-3 h-[34px] rounded-[8px] text-[12px] font-medium cursor-pointer border"
          :class="isDark ? 'border-white/20 active:bg-white/10 text-white' : 'border-black/15 active:bg-black/10 text-black'"
        >
          Sign out
        </button>

        <!-- Admin Profile Avatar when in live preview (!isGate) -->
        <div v-if="!isGate && authStore.isAuthenticated" class="relative flex items-center">
          <button 
            type="button"
            @click="showUserProfileModal = !showUserProfileModal"
            class="relative size-[28px] rounded-full shrink-0 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press group"
            :class="isDark 
              ? 'border border-white/20 bg-white text-black hover:bg-neutral-200' 
              : 'border-[0.5px] border-black/10 hover:border-black/30 bg-neutral-100 hover:bg-neutral-200 text-black'"
            title="User Profile"
          >
            <div 
              class="relative size-full rounded-full flex items-center justify-center font-sans text-[10px] font-medium tracking-tight select-none"
              :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
            >
              {{ userInitials }}
              <span 
                class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-emerald-500 border"
                :class="isDark ? 'border-[#141414]' : 'border-white'"
              />
            </div>
          </button>

          <UserProfileModal
            :is-open="showUserProfileModal"
            @close="showUserProfileModal = false"
            @open-analytics="router.push(hubLink)"
            @open-settings="router.push('/dev')"
            @open-projects="router.push('/?projects=1')"
            @open-whats-new="router.push('/?whatsnew=1')"
            @sign-out="handleSignOut"
          />
        </div>
      </div>
    </header>

    <main class="flex-1 min-h-0 w-full p-3 relative">
      <DoorScanner
        v-if="selectedProject"
        :key="selectedProject.id"
        :rows="rows"
        :page-ids="pageIds"
        :operator="operatorName"
        :assigned-mode="authStore.currentUser?.stationMode"
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

    <!-- Toast -->
    <Transition name="scanner-pop">
      <div
        v-if="toastMessage"
        class="fixed top-[60px] left-1/2 -translate-x-1/2 z-[60] bg-black text-white rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.25)] flex items-center gap-3 select-none max-w-[92vw]"
        role="status"
      >
        <div class="size-2 rounded-full bg-moss-300 shrink-0" />
        <p class="font-sans text-[13px] font-medium tracking-normal">{{ toastMessage }}</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeft, AlertTriangle, Calendar } from 'lucide-vue-next';
import { useAuthStore } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import { getTodayDateStrings } from '../components/hub/hubUtils.ts';
import DoorScanner from '../components/hub/DoorScanner.vue';

/**
 * The Door Scanner on its own page, for the tablet (10", landscape) or phone at the entrance:
 * Strictly locked to the selected campaign passed via URL query (/hub/scanner?project=…),
 * with fast polling so counts from other doors sync in real-time.
 */
const router = useRouter();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const showUserProfileModal = ref(false);

const isDark = computed(() => authStore.isSuperAdmin);

const userInitials = computed(() => {
  if (authStore.isSuperAdmin) return 'SA';
  const name = authStore.currentUser?.name || brandStore.activeBrand?.name || '';
  if (!name) return '707';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

function handleSignOut() {
  showUserProfileModal.value = false;
  authStore.signOut();
  brandStore.setActiveBrand(null);
  router.push('/');
}

const todayFormatted = computed(() => getTodayDateStrings().formattedShort);

const { rows, loadError, selectedProjectId, selectedProject, pageIds, refresh, mergeRows } = useCampaignGuests({ pollMs: 2500, requireProject: true });

/** Door security is tied to one campaign by the server; here it is simply fixed and the way out is signing out. */
const isGate = computed(() => authStore.currentUser?.role === 'gate');
if (isGate.value && authStore.currentUser?.assignedProject) selectedProjectId.value = authStore.currentUser.assignedProject;
function leave() {
  authStore.signOut();
  router.replace('/login');
}

const operatorName = computed(() => {
  if (authStore.currentUser) {
    const parts = [authStore.currentUser.name];
    if (authStore.currentUser.deviceLabel) parts.push(authStore.currentUser.deviceLabel);
    return parts.join(' · ');
  }
  return isGate.value ? 'Gate security' : 'Brand Admin';
});
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
