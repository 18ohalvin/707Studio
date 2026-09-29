<template>
  <div 
    v-if="editorStore.isPreviewMode || editorStore.isTestFormModalOpen" 
    class="fixed inset-0 top-[48px] z-30 bg-[#ececee]/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-hidden animate-apple-fade select-none"
  >
    <!-- True-to-Scale iPhone 17 Pro Titanium Hardware Mockup (Exact 393:852 Screen Aspect Ratio) -->
    <div 
      class="relative flex flex-col items-center justify-between w-auto h-full max-h-[852px] aspect-[393/852] bg-[#f5f5f5] rounded-[52px] border-[6px] border-[#222225] shadow-[0_30px_90px_rgba(0,0,0,0.38),0_0_0_1px_rgba(255,255,255,0.2)] ring-1 ring-black/40 overflow-hidden animate-apple-pop"
      style="max-width: min(393px, 100vw - 32px);"
    >
      <!-- Titanium Outer Light Reflection Bevel -->
      <div class="absolute inset-0 rounded-[46px] pointer-events-none ring-1 ring-white/20 z-40" />

      <!-- iOS Status Bar & Dynamic Island Header -->
      <div class="sticky top-0 left-0 right-0 h-[46px] w-full bg-[#f5f5f5]/90 backdrop-blur-md z-40 flex items-center justify-between px-7 shrink-0 pointer-events-none">
        <!-- Left: Time (9:41) -->
        <span class="font-sans font-semibold text-[13px] text-black tracking-tight">9:41</span>

        <!-- Center: Dynamic Island -->
        <div class="absolute top-[10px] left-1/2 -translate-x-1/2 w-[114px] h-[28px] bg-black rounded-full flex items-center justify-between px-3 shadow-md">
          <!-- Camera lens dot reflection -->
          <div class="size-2.5 rounded-full bg-[#0a0a14] border border-[#1e1e2d] relative flex items-center justify-center">
            <div class="size-1 rounded-full bg-[#1e293b]/60" />
          </div>
          <!-- TrueDepth Sensor dot -->
          <div class="size-2 rounded-full bg-[#080811]" />
        </div>

        <!-- Right: Cellular, Wi-Fi & Battery Status Icons -->
        <div class="flex items-center gap-1.5 text-black">
          <!-- Cellular Signal Bars -->
          <div class="flex items-end gap-[1.5px] h-3">
            <div class="w-[2.5px] h-1 bg-black rounded-[0.5px]" />
            <div class="w-[2.5px] h-1.5 bg-black rounded-[0.5px]" />
            <div class="w-[2.5px] h-2 bg-black rounded-[0.5px]" />
            <div class="w-[2.5px] h-2.5 bg-black rounded-[0.5px]" />
          </div>
          <!-- Wi-Fi Icon -->
          <Wifi class="w-3.5 h-3.5 text-black" />
          <!-- Battery Icon -->
          <div class="w-[20px] h-[10px] rounded-[3px] border border-black p-[1px] flex items-center relative ml-0.5">
            <div class="h-full w-full bg-black rounded-[1.5px]" />
            <div class="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-black rounded-r-[1px]" />
          </div>
        </div>
      </div>

      <!-- Live Mobile Screen Viewport (Interactive & Realistic) -->
      <div class="flex-1 w-full flex flex-col overflow-hidden relative">
        <MobileArtboard 
          :page="editorStore.currentPage" 
          :page-index="editorStore.activePageIndex"
          :is-selected="false"
          :is-preview-modal="true"
        />
      </div>

      <!-- iOS Home Bar Indicator (Bottom) -->
      <div class="sticky bottom-0 left-0 right-0 h-[22px] w-full bg-[#f5f5f5]/80 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none shrink-0">
        <div class="w-[134px] h-[4.5px] bg-black/60 rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { Wifi } from 'lucide-vue-next';
import MobileArtboard from '../MobileArtboard.vue';

const editorStore = useEditorStore();

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && (editorStore.isPreviewMode || editorStore.isTestFormModalOpen)) {
    editorStore.closePreviewMode();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
