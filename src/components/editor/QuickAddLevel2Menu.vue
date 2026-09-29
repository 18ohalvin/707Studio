<template>
  <div 
    v-if="isOpen"
    class="fixed left-[calc(50%+1px)] bottom-[84px] z-[60] select-none backdrop-blur-[4px] bg-[#f5f5f5]/20 border border-black/10 border-solid content-stretch flex gap-[8px] items-center p-[6px] rounded-[14px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] transition-all animate-apple-pop-center"
    data-node-id="71:50"
    data-name="Quick Add Container"
  >
    <!-- 1. Widget Button -->
    <button 
      @click="$emit('select-widget')"
      class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] content-stretch flex gap-[12px] h-[40px] items-center justify-center overflow-clip px-[16px] py-[8px] rounded-[8px] shrink-0 apple-press cursor-pointer transition-all duration-200"
    >
      <div class="relative shrink-0 size-[18px] flex items-center justify-center">
        <img alt="Widget" class="size-full object-contain" :src="FIGMA_ASSETS.level2Widget" />
      </div>
      <p class="font-707 text-btn text-black whitespace-nowrap font-normal">
        Widget
      </p>
    </button>

    <!-- 2. Media Button -->
    <button 
      @click="$emit('select-media')"
      class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] content-stretch flex gap-[12px] h-[40px] items-center justify-center overflow-clip px-[16px] py-[8px] rounded-[8px] shrink-0 apple-press cursor-pointer transition-all duration-200"
    >
      <div class="relative shrink-0 size-[18px] flex items-center justify-center">
        <img alt="Media" class="size-full object-contain" :src="FIGMA_ASSETS.level2Media" />
      </div>
      <p class="font-707 text-btn text-black whitespace-nowrap font-normal">
        Media
      </p>
    </button>

    <!-- 3. Use Template Button (Figma Node 185:6498) -->
    <button 
      @click="$emit('select-new-page')"
      class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] content-stretch flex gap-[12px] h-[40px] items-center justify-center overflow-clip px-[16px] py-[8px] rounded-[8px] shrink-0 apple-press cursor-pointer transition-all duration-200"
    >
      <div class="relative shrink-0 size-[18px] flex items-center justify-center">
        <img alt="Use Template" class="size-full object-contain" :src="FIGMA_ASSETS.level2NewPage" />
      </div>
      <p class="font-707 text-btn text-black whitespace-nowrap font-normal">
        Use Template
      </p>
    </button>

    <!-- 4. Request New Widget Button -->
    <button 
      @click="$emit('select-request-widget')"
      class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] content-stretch flex gap-[12px] h-[40px] items-center justify-center overflow-clip px-[16px] py-[8px] rounded-[8px] shrink-0 apple-press cursor-pointer transition-all duration-200"
    >
      <div class="relative shrink-0 size-[18px] flex items-center justify-center">
        <img alt="Request Widget" class="size-full object-contain" :src="FIGMA_ASSETS.level2RequestWidget" />
      </div>
      <p class="font-707 text-btn text-black whitespace-nowrap font-normal">
        Request New Widget
      </p>
    </button>
  </div>
</template>

<script setup lang="ts">
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'select-widget'): void;
  (e: 'select-media'): void;
  (e: 'select-new-page'): void;
  (e: 'select-request-widget'): void;
}>();
</script>
