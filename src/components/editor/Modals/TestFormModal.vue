<template>
  <div 
    v-if="editorStore.isTestFormModalOpen" 
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-3 md:p-6 transition-all animate-apple-fade select-none"
    @click.self="closeModal"
  >
    <!-- Top Control Bar (Apple Glass Floating Header) -->
    <div class="w-full max-w-[500px] flex items-center justify-between px-4 py-2 mb-3 apple-glass-modal rounded-2xl border border-white/20 shadow-lg animate-apple-pop">
      <!-- Left: Phone Device Info & Page Indicator -->
      <div class="flex items-center gap-2.5">
        <div class="size-7 rounded-lg bg-black text-white flex items-center justify-center shadow-sm">
          <Smartphone class="w-4 h-4 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-[13px] font-bold text-black font-707">iPhone 17 Pro</span>
            <span class="px-1.5 py-0.5 text-[9px] font-mono font-medium rounded-full bg-black/5 text-neutral-600">6.3″ Super Retina XDR</span>
          </div>
        </div>
      </div>

      <!-- Center: Page Selector Tabs (if multiple pages exist) -->
      <div v-if="editorStore.pages.length > 1" class="hidden sm:flex items-center gap-1 bg-black/5 p-1 rounded-xl">
        <button
          v-for="(page, idx) in editorStore.pages"
          :key="page.id"
          @click="activePageIndex = idx"
          class="px-2.5 py-1 text-[11px] font-707 font-medium rounded-lg transition-all cursor-pointer"
          :class="activePageIndex === idx ? 'bg-white text-black shadow-sm font-semibold' : 'text-neutral-500 hover:text-black'"
        >
          Page {{ idx + 1 }}
        </button>
      </div>

      <!-- Right: Close Button -->
      <div class="flex items-center gap-1.5">
        <button 
          @click="refreshPreview"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-black/10 transition-colors"
          title="Reset Interactive Preview"
        >
          <RotateCcw class="w-3.5 h-3.5 text-neutral-700" />
        </button>
        <button 
          @click="closeModal"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-black/10 transition-colors"
          title="Close Preview (Esc)"
        >
          <X class="w-4 h-4 text-neutral-700" />
        </button>
      </div>
    </div>

    <!-- Mobile Page Selector for small screens -->
    <div v-if="editorStore.pages.length > 1" class="flex sm:hidden items-center gap-1 bg-white/40 backdrop-blur-md p-1 rounded-xl mb-2">
      <button
        v-for="(page, idx) in editorStore.pages"
        :key="page.id"
        @click="activePageIndex = idx"
        class="px-2.5 py-1 text-[11px] font-707 font-medium rounded-lg transition-all cursor-pointer"
        :class="activePageIndex === idx ? 'bg-white text-black shadow-sm font-semibold' : 'text-neutral-600'"
      >
        Page {{ idx + 1 }}
      </button>
    </div>

    <!-- iPhone 17 Pro Titanium Hardware Mockup Chassis -->
    <div 
      class="relative flex flex-col items-center justify-between w-[375px] h-[760px] max-h-[82vh] bg-[#f5f5f5] rounded-[50px] border-[7px] border-[#222225] shadow-[0_25px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.15)] ring-1 ring-black/40 overflow-hidden animate-apple-pop"
      :key="refreshKey"
    >
      <!-- Titanium Edge Light Reflection Bevel Effect -->
      <div class="absolute inset-0 rounded-[44px] pointer-events-none ring-1 ring-white/20 z-40" />

      <!-- iOS Status Bar & Dynamic Island Header (Overlay) -->
      <div class="sticky top-0 left-0 right-0 h-[44px] w-full bg-[#f5f5f5]/90 backdrop-blur-md z-40 flex items-center justify-between px-6 shrink-0 pointer-events-none">
        <!-- Left: Time (9:41) -->
        <span class="font-sans font-semibold text-[13px] text-black tracking-tight">9:41</span>

        <!-- Center: Dynamic Island -->
        <div class="absolute top-[10px] left-1/2 -translate-x-1/2 w-[110px] h-[27px] bg-black rounded-full flex items-center justify-between px-3 shadow-md">
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

      <!-- Live Mobile Screen Viewport (Scrollable & Fully Interactive) -->
      <div class="flex-1 w-full flex flex-col overflow-hidden relative">
        <MobileArtboard 
          :page="currentPage" 
          :page-index="activePageIndex"
          :is-selected="false"
          :is-preview-modal="true"
        />
      </div>

      <!-- iOS Home Bar Indicator (Bottom) -->
      <div class="sticky bottom-0 left-0 right-0 h-[22px] w-full bg-[#f5f5f5]/80 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none shrink-0">
        <div class="w-[128px] h-[4px] bg-black/60 rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { X, Smartphone, RotateCcw, Wifi } from 'lucide-vue-next';
import MobileArtboard from '../MobileArtboard.vue';

const editorStore = useEditorStore();
const activePageIndex = ref(0);
const refreshKey = ref(0);

// Initialize active page index to editor's currently active page
watch(() => editorStore.isTestFormModalOpen, (isOpen) => {
  if (isOpen) {
    activePageIndex.value = editorStore.activePageIndex;
  }
});

const currentPage = computed(() => {
  return editorStore.pages[activePageIndex.value] || editorStore.currentPage;
});

function refreshPreview() {
  refreshKey.value += 1;
}

function closeModal() {
  editorStore.isTestFormModalOpen = false;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && editorStore.isTestFormModalOpen) {
    closeModal();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>
