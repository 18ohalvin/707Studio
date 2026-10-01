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
        class="absolute top-[-6px] right-0 z-50 backdrop-blur-2xl bg-white/90 border border-white/60 flex flex-col items-start pb-[24px] rounded-[12px] shadow-[0px_16px_45px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] w-[320px] select-none apple-popover-box"
        data-node-id="212:8894"
        data-name="User Profile Pop Up Modal"
      >
        <!-- Modal Header (Figma Node 212:8896) -->
        <div class="flex items-center justify-between p-[24px] pb-[16px] w-full" data-node-id="212:8896" data-name="Widget Container">
          <div class="flex items-center gap-[12px]" data-node-id="212:8935">
            <!-- User Avatar (Figma Node 212:8933) -->
            <div class="size-[40px] rounded-full overflow-hidden shrink-0 border border-black/10 bg-neutral-200 flex items-center justify-center">
              <img :src="FIGMA_ASSETS.landingAvatar" alt="User Avatar" class="size-full object-cover" />
            </div>
            <!-- Brand ID (Reduced to 16px font size as requested) -->
            <h2 class="font-707 text-[16px] font-normal leading-[22px] text-black whitespace-nowrap" data-node-id="212:8898">
              {{ brandStore.activeBrand?.slug ? brandStore.activeBrand.slug + ' ID' : 'atmos ID' }}
            </h2>
          </div>

          <!-- Close Button (Figma Node 212:8899) -->
          <button 
            type="button"
            @click="emit('close')"
            class="size-[26px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
            title="Close"
            data-node-id="212:8899"
          >
            <X class="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        <!-- Menu Action Items Container - Outlines Removed -->
        <div class="flex flex-col w-full px-[12px] gap-[2px]">
          <!-- 1. Analytics Report (Figma Node 212:8901) -->
          <button 
            type="button"
            @click="handleAnalytics"
            class="w-full text-left px-[12px] py-[10px] rounded-[6px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent shadow-none"
            data-node-id="212:8901"
          >
            <span class="font-707 text-[14px] font-normal leading-[20px] text-black" data-node-id="212:8903">
              Analytics Report
            </span>
          </button>

          <!-- 2. Account Settings (Figma Node 212:8923) -->
          <button 
            type="button"
            @click="handleAccountSettings"
            class="w-full text-left px-[12px] py-[10px] rounded-[6px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent shadow-none"
            data-node-id="212:8923"
          >
            <span class="font-707 text-[14px] font-normal leading-[20px] text-black" data-node-id="212:8925">
              Account Settings
            </span>
          </button>

          <!-- 3. Sign Out (Figma Node 212:8919) -->
          <button 
            type="button"
            @click="handleSignOut"
            class="w-full text-left px-[12px] py-[10px] rounded-[6px] hover:bg-black/5 active:bg-black/10 transition-colors cursor-pointer border-0 outline-none bg-transparent shadow-none"
            data-node-id="212:8919"
          >
            <span class="font-707 text-[14px] font-normal leading-[20px] text-black" data-node-id="212:8921">
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { useBrandStore } from '../../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';

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
