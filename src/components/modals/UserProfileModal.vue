<template>
  <Transition name="apple-popover-fade">
    <div v-if="isOpen" class="contents">
      <!-- Click-outside dismiss transparent overlay -->
      <div 
        class="fixed inset-0 z-40 bg-transparent"
        @click="emit('close')"
      />

      <!-- Pop Up Modal Box (Figma Node 212:8894) - Anchored cleanly below the profile button -->
      <div 
        class="absolute top-[calc(100%+8px)] right-0 z-50 bg-white/95 backdrop-blur-2xl border-[0.5px] border-black/10 flex flex-col items-start pb-[10px] rounded-[18px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.04)] w-[320px] select-none apple-popover-box overflow-hidden"
        data-node-id="212:8894"
        data-name="User Profile Pop Up Modal"
      >
        <!-- Modal Header strictly matching NotificationsMenu padding tokens -->
        <div class="flex items-center justify-between px-[20px] py-[16px] w-full border-b-[0.5px] border-black/10" data-node-id="212:8896">
          <div class="flex items-center gap-[12px] min-w-0 flex-1 mr-2">
            <!-- User Avatar with live indicator -->
            <div class="relative size-[38px] rounded-full overflow-hidden shrink-0 border-[0.5px] border-black/10 bg-neutral-100 flex items-center justify-center shadow-xs">
              <div v-if="authStore.isSuperAdmin" class="size-full bg-black text-white flex items-center justify-center">
                <ShieldCheck class="w-4 h-4 text-white" />
              </div>
              <div v-else class="size-full bg-black text-white flex items-center justify-center font-707 text-[12px] font-semibold tracking-tight">
                {{ userInitials }}
              </div>
              <!-- Green live status dot -->
              <span class="absolute bottom-0 right-0 size-[8px] rounded-full bg-emerald-500 border border-white" />
            </div>

            <!-- Identity Info -->
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <h2 class="font-707 text-[14px] font-medium leading-[18px] text-black truncate">
                  {{ displayName }}
                </h2>
              </div>
              <div class="flex items-center gap-1 mt-0.5 min-w-0">
                <span v-if="authStore.isSuperAdmin" class="inline-flex items-center px-1.5 py-[1px] rounded-[4px] bg-black text-white text-[9.5px] font-707 font-medium uppercase tracking-wider">
                  Superadmin
                </span>
                <span v-else class="inline-flex items-center gap-1 px-1.5 py-[1px] rounded-[4px] bg-neutral-100 border-[0.5px] border-black/10 text-neutral-700 text-[10px] font-707 font-medium shrink-0">
                  <CheckCircle2 class="w-2.5 h-2.5 text-emerald-600" />
                  Verified
                </span>
                <span class="text-[11px] text-neutral-500 font-707 truncate">
                  {{ userSubtitle }}
                </span>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <button 
            type="button"
            @click="emit('close')"
            class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
            title="Close"
          >
            <X class="w-3.5 h-3.5 text-black stroke-[1.75]" />
          </button>
        </div>

        <!-- Active Brand / Workspace Pill Card -->
        <div class="w-full px-[10px] pt-[10px] pb-[4px]">
          <div class="px-[12px] py-[9px] rounded-[10px] bg-neutral-50/80 border-[0.5px] border-black/8 flex items-center justify-between">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="size-[22px] rounded-[6px] bg-black text-white flex items-center justify-center text-[10.5px] font-707 font-semibold shrink-0">
                {{ activeBrandInitial }}
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[9.5px] uppercase font-707 font-semibold tracking-wider text-neutral-400 leading-none">
                  {{ authStore.isSuperAdmin ? 'Master Access' : 'Active Workspace' }}
                </span>
                <span class="text-[12px] font-707 font-medium text-black truncate mt-0.5 leading-tight">
                  {{ activeBrandName }}
                </span>
              </div>
            </div>

            <span v-if="!authStore.isSuperAdmin && brandStore.activeBrand?.slug" class="text-[10px] font-mono text-neutral-500 bg-white px-1.5 py-0.5 rounded-[4px] border-[0.5px] border-black/10 shrink-0">
              /{{ brandStore.activeBrand.slug }}
            </span>
          </div>
        </div>

        <!-- Menu Action Items Container -->
        <div class="flex flex-col w-full px-[8px] py-[6px] gap-[2px]">
          <!-- 1. My Activations & Projects -->
          <button 
            type="button"
            @click="handleOpenProjects"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between text-black apple-press group"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <FolderKanban class="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
              <span class="font-707 text-[13px] font-normal">
                My Activations
              </span>
            </div>
            <span class="text-[11px] font-707 text-neutral-400 group-hover:text-neutral-600 transition-colors">
              All Drops
            </span>
          </button>

          <!-- 2. Campaign Hub (Guests, Door Scanner, Raffles) -->
          <button 
            type="button"
            @click="handleAnalytics"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between text-black apple-press group"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <BarChart2 class="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
              <span class="font-707 text-[13px] font-normal">
                Campaign Hub
              </span>
            </div>
            <span class="text-[11px] font-707 text-neutral-400 group-hover:text-neutral-600 transition-colors">
              Scanner & Guests
            </span>
          </button>

          <!-- 3. What's New 1.5 Interactive Tour -->
          <button 
            type="button"
            @click="handleWhatsNew"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between text-black apple-press group"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <Sparkles class="w-4 h-4 text-neutral-500 group-hover:text-amber-500 transition-colors" />
              <span class="font-707 text-[13px] font-normal">
                What's New in 1.5
              </span>
            </div>
            <span class="text-[10px] font-707 font-medium px-1.5 py-[1px] rounded-[4px] bg-neutral-100 border-[0.5px] border-black/10 text-neutral-600">
              Tour
            </span>
          </button>

          <!-- 4. Superadmin Settings (Strictly hidden for brand editors) -->
          <button 
            v-if="authStore.isSuperAdmin"
            type="button"
            @click="handleAccountSettings"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between text-black apple-press group"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <Settings class="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
              <span class="font-707 text-[13px] font-normal">
                Superadmin Portal
              </span>
            </div>
            <span class="text-[11px] font-707 text-neutral-400 group-hover:text-neutral-600 transition-colors">
              Master
            </span>
          </button>

          <!-- Divider -->
          <div class="h-[0.5px] bg-black/10 my-1 mx-2" />

          <!-- 5. Sign Out -->
          <button 
            type="button"
            @click="handleSignOut"
            class="w-full text-left px-[12px] py-[8.5px] rounded-[8px] hover:bg-red-50/80 active:bg-red-100/80 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center justify-between text-red-600 group apple-press"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <LogOut class="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
              <span class="font-707 text-[13px] font-medium text-red-600">
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
import { 
  X, 
  ShieldCheck, 
  Settings, 
  BarChart2, 
  LogOut, 
  FolderKanban, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-vue-next';
import { useBrandStore } from '../../stores/brandStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-analytics'): void;
  (e: 'open-settings'): void;
  (e: 'open-projects'): void;
  (e: 'open-whats-new'): void;
  (e: 'sign-out'): void;
}>();

const brandStore = useBrandStore();
const authStore = useAuthStore();

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

const activeBrandName = computed(() => {
  if (authStore.isSuperAdmin) return 'All Brand Workspaces';
  return brandStore.activeBrand?.name || 'Independent Studio';
});

const activeBrandInitial = computed(() => {
  if (authStore.isSuperAdmin) return '★';
  const name = brandStore.activeBrand?.name || brandStore.activeBrand?.slug || '7';
  return name.charAt(0).toUpperCase();
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
