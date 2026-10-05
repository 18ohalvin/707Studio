<template>
  <Transition name="apple-popover-fade">
    <div v-if="isOpen" class="contents">
      <!-- Click-outside dismiss transparent overlay -->
      <div 
        class="fixed inset-0 z-40 bg-transparent"
        @click="emit('close')"
      />

      <!-- Pop Up Modal Box (Figma Node 212:8894) - Anchored directly over the profile button -->
      <div 
        class="absolute top-[-6px] right-0 z-50 backdrop-blur-2xl bg-white/70 border border-white/60 flex flex-col items-start pb-[24px] rounded-[12px] shadow-[0px_16px_45px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-[320px] select-none apple-popover-box"
        data-node-id="212:8894"
        data-name="User Profile Pop Up Modal"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-[20px] pb-[16px] w-full border-b border-black/5" data-node-id="212:8896">
          <div class="flex items-center gap-[12px] min-w-0 flex-1 mr-2">
            <!-- User Avatar -->
            <div class="size-[38px] rounded-full overflow-hidden shrink-0 border border-black/10 bg-neutral-100 text-black flex items-center justify-center shadow-xs">
              <ShieldCheck v-if="authStore.isSuperAdmin" class="w-4 h-4 text-black" />
              <User v-else class="w-4 h-4 text-black" />
            </div>
            <!-- Identity Info -->
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <h2 class="font-707 text-[14px] font-medium leading-[18px] text-black truncate">
                  {{ authStore.isSuperAdmin ? 'Superadmin Lead' : (authStore.currentUser?.name || brandStore.activeBrand?.name || 'Brand Team') }}
                </h2>
              </div>
              <span class="text-[11px] text-neutral-500 font-707 truncate mt-0.5">
                {{ authStore.isSuperAdmin ? 'Master Administrator' : (authStore.currentUser?.email || (brandStore.activeBrand?.slug ? brandStore.activeBrand.slug + ' Team' : 'Brand Editor')) }}
              </span>
            </div>
          </div>

          <!-- Close Button -->
          <button 
            type="button"
            @click="emit('close')"
            class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
            title="Close"
          >
            <X class="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        <!-- Menu Action Items Container -->
        <div class="flex flex-col w-full px-[10px] py-[8px] gap-[2px]">
          <!-- 1. Superadmin Settings (Strictly hidden for brand editors) -->
          <button 
            v-if="authStore.isSuperAdmin"
            type="button"
            @click="handleAccountSettings"
            class="w-full text-left px-[12px] py-[9px] rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center gap-2.5 text-black"
          >
            <Settings class="w-4 h-4 text-neutral-500" />
            <span class="font-707 text-[13px] font-normal">
              Superadmin Settings
            </span>
          </button>

          <!-- 2. Analytics Report -->
          <button 
            type="button"
            @click="handleAnalytics"
            class="w-full text-left px-[12px] py-[9px] rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center gap-2.5 text-black"
          >
            <BarChart2 class="w-4 h-4 text-neutral-500" />
            <span class="font-707 text-[13px] font-normal">
              Analytics Report
            </span>
          </button>

          <div class="h-[1px] bg-black/5 my-1 mx-2" />

          <!-- 3. Sign Out -->
          <button 
            type="button"
            @click="handleSignOut"
            class="w-full text-left px-[12px] py-[9px] rounded-[8px] hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer border-0 outline-none bg-transparent flex items-center gap-2.5 text-red-600 group"
          >
            <LogOut class="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
            <span class="font-707 text-[13px] font-medium text-red-600">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X, User, ShieldCheck, Settings, BarChart2, LogOut } from 'lucide-vue-next';
import { useBrandStore } from '../../stores/brandStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { useEditorStore } from '../../stores/editorStore.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-analytics'): void;
  (e: 'open-settings'): void;
  (e: 'sign-out'): void;
}>();

const brandStore = useBrandStore();
const authStore = useAuthStore();
const editorStore = useEditorStore();

function handleAnalytics() {
  emit('close');
  emit('open-analytics');
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
