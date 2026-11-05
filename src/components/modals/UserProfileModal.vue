<template>
  <Transition name="apple-popover-fade">
    <div v-if="isOpen" class="contents">
      <!-- Click-outside dismiss transparent overlay -->
      <div 
        class="fixed inset-0 z-40 bg-transparent"
        @click="emit('close')"
      />

      <!-- Pop Up Modal Box - Anchored cleanly below the profile button -->
      <div 
        class="absolute top-[calc(100%+8px)] right-0 z-50 flex flex-col items-start pb-[10px] rounded-[18px] w-[300px] select-none apple-popover-box overflow-hidden transition-all duration-200"
        :class="isDark 
          ? 'bg-[#141414] border border-white/15 text-white shadow-[0px_24px_70px_rgba(0,0,0,0.85)]' 
          : 'bg-white border border-black/10 text-black shadow-[0px_20px_50px_rgba(0,0,0,0.18)]'"
        data-node-id="212:8894"
        data-name="User Profile Pop Up Modal"
      >
        <!-- Modal Header strictly matching NotificationsMenu padding tokens -->
        <div 
          class="flex items-center justify-between px-[20px] py-[16px] w-full border-b-[0.5px]" 
          :class="isDark ? 'border-white/10' : 'border-black/10'"
          data-node-id="212:8896"
        >
          <div class="flex items-center gap-[12px] min-w-0 flex-1 mr-2">
            <!-- User Avatar with live indicator -->
            <div 
              class="relative size-[38px] rounded-full overflow-hidden shrink-0 border-[0.5px] flex items-center justify-center shadow-xs"
              :class="isDark ? 'border-white/20 bg-white' : 'border-black/10 bg-neutral-100'"
            >
              <div v-if="authStore.isSuperAdmin" class="size-full flex items-center justify-center" :class="isDark ? 'bg-white text-black' : 'bg-black text-white'">
                <ShieldCheck class="w-4 h-4" :class="isDark ? 'text-black' : 'text-white'" />
              </div>
              <div v-else class="size-full bg-black text-white flex items-center justify-center font-sans font-light tracking-normal text-[12px] font-medium tracking-tight">
                {{ userInitials }}
              </div>
              <!-- Green live status dot -->
              <span 
                class="absolute bottom-0 right-0 size-[8px] rounded-full bg-emerald-500 border"
                :class="isDark ? 'border-[#141414]' : 'border-white'"
              />
            </div>

            <!-- Identity Info -->
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <h2 
                  class="font-sans font-light tracking-normal text-[14px] font-medium leading-[18px] truncate"
                  :class="isDark ? 'text-white' : 'text-black'"
                >
                  {{ displayName }}
                </h2>
              </div>
              <div class="flex items-center gap-1 mt-0.5 min-w-0">
                <span 
                  v-if="authStore.isSuperAdmin" 
                  class="inline-flex items-center px-1.5 py-[1px] rounded-[4px] text-[9.5px] font-sans font-light tracking-normal font-semibold uppercase tracking-wider"
                  :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
                >
                  Superadmin
                </span>
                <span 
                  v-else 
                  class="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[4px] text-[10px] font-sans font-light tracking-normal font-medium shrink-0"
                  :class="isDark ? 'bg-white/10 border-[0.5px] border-white/15 text-neutral-300' : 'bg-neutral-100 border-[0.5px] border-black/10 text-neutral-700'"
                >
                  <CheckCircle2 class="w-2.5 h-2.5 text-emerald-500" />
                  Verified
                </span>
                <span 
                  class="text-[11px] font-sans font-light tracking-normal truncate"
                  :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
                >
                  {{ userSubtitle }}
                </span>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <button 
            type="button"
            @click="emit('close')"
            class="size-[24px] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
            :class="isDark ? 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white' : 'bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] text-black'"
            title="Close"
          >
            <X class="w-3.5 h-3.5 stroke-[1.75]" />
          </button>
        </div>

        <!-- Menu Action Items Container -->
        <div class="flex flex-col w-full px-[8px] py-[6px] gap-[2px]">
          <!-- 1. My Activations & Projects -->
          <button 
            type="button"
            @click="handleOpenProjects"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between apple-press group"
            :class="isDark ? 'text-white hover:bg-white/[0.08] active:bg-white/[0.14]' : 'text-black hover:bg-black/5 active:bg-black/10'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <FolderKanban 
                class="w-4 h-4 transition-colors" 
                :class="isDark ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-500 group-hover:text-black'" 
              />
              <span class="font-sans font-light tracking-normal text-[13px] font-normal">
                My Activations
              </span>
            </div>
            <span 
              class="text-[11px] font-sans font-light tracking-normal transition-colors"
              :class="isDark ? 'text-neutral-400 group-hover:text-neutral-200' : 'text-neutral-400 group-hover:text-neutral-600'"
            >
              All Drops
            </span>
          </button>

          <!-- 2. Campaign Hub (Guests, Door Scanner, Raffles) -->
          <button 
            type="button"
            @click="handleAnalytics"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between apple-press group"
            :class="isDark ? 'text-white hover:bg-white/[0.08] active:bg-white/[0.14]' : 'text-black hover:bg-black/5 active:bg-black/10'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <BarChart2 
                class="w-4 h-4 transition-colors" 
                :class="isDark ? 'text-neutral-400 group-hover:text-white' : 'text-neutral-500 group-hover:text-black'" 
              />
              <span class="font-sans font-light tracking-normal text-[13px] font-normal">
                Campaign Hub
              </span>
            </div>
            <span 
              class="text-[11px] font-sans font-light tracking-normal transition-colors"
              :class="isDark ? 'text-neutral-400 group-hover:text-neutral-200' : 'text-neutral-400 group-hover:text-neutral-600'"
            >
              Scanner & Guests
            </span>
          </button>

          <!-- 3. What's New 1.5 Interactive Tour -->
          <button 
            type="button"
            @click="handleWhatsNew"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between apple-press group"
            :class="isDark ? 'text-white hover:bg-white/[0.08] active:bg-white/[0.14]' : 'text-black hover:bg-black/5 active:bg-black/10'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <Sparkles 
                class="w-4 h-4 transition-colors" 
                :class="isDark ? 'text-neutral-400 group-hover:text-amber-400' : 'text-neutral-500 group-hover:text-amber-500'" 
              />
              <span class="font-sans font-light tracking-normal text-[13px] font-normal">
                What's New in 1.5
              </span>
            </div>
            <span 
              class="text-[10px] font-sans font-light tracking-normal font-medium px-1.5 py-[1px] rounded-[4px]"
              :class="isDark ? 'bg-white/10 border-[0.5px] border-white/15 text-neutral-300' : 'bg-neutral-100 border-[0.5px] border-black/10 text-neutral-600'"
            >
              Tour
            </span>
          </button>

          <!-- Divider -->
          <div 
            class="h-[0.5px] my-1 mx-2" 
            :class="isDark ? 'bg-white/10' : 'bg-black/10'"
          />

          <!-- 5. Sign Out -->
          <button 
            type="button"
            @click="handleSignOut"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between group apple-press"
            :class="isDark ? 'hover:bg-red-950/40 active:bg-red-900/50 text-red-400' : 'hover:bg-red-50/80 active:bg-red-100/80 text-red-600'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <LogOut 
                class="w-4 h-4 group-hover:translate-x-0.5 transition-transform" 
                :class="isDark ? 'text-red-400' : 'text-red-500'" 
              />
              <span 
                class="font-sans font-light tracking-normal text-[13px] font-medium"
                :class="isDark ? 'text-red-400' : 'text-red-600'"
              >
                Sign Out
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { 
  X, 
  ShieldCheck, 
  BarChart2, 
  LogOut, 
  FolderKanban, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-vue-next';
import { useBrandStore } from '../../stores/brandStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  dark?: boolean;
}>(), {
  dark: undefined,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-analytics'): void;
  (e: 'open-settings'): void;
  (e: 'open-projects'): void;
  (e: 'open-whats-new'): void;
  (e: 'sign-out'): void;
}>();

const route = useRoute();
const brandStore = useBrandStore();
const authStore = useAuthStore();

const isDark = computed(() => {
  if (typeof props.dark === 'boolean') return props.dark;
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && route.path !== '/');
});

const displayName = computed(() => {
  if (authStore.isSuperAdmin) return 'Superadmin Lead';
  return authStore.currentUser?.name || brandStore.activeBrand?.name || 'Brand Team';
});

const userSubtitle = computed(() => {
  if (authStore.isSuperAdmin) return 'admin@707';
  if (authStore.currentUser?.email) return authStore.currentUser.email;
  if (brandStore.activeBrand?.slug) return `@${brandStore.activeBrand.slug}`;
  return 'Brand Editor';
});

const userInitials = computed(() => {
  if (authStore.isSuperAdmin) return 'SA';
  const name = displayName.value;
  if (!name) return '707';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

function handleOpenProjects() {
  emit('close');
  emit('open-projects');
}

function handleAnalytics() {
  emit('close');
  emit('open-analytics');
}

function handleWhatsNew() {
  emit('close');
  emit('open-whats-new');
}

function handleAccountSettings() {
  emit('close');
  emit('open-settings');
}

function handleSignOut() {
  emit('close');
  emit('sign-out');
}
</script>
