<template>
  <div 
    v-if="editorStore.isPreviewMode || editorStore.isTestFormModalOpen" 
    class="fixed inset-0 top-[48px] z-30 bg-[#0d0d0f]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden animate-apple-fade select-none"
  >
    <!-- Floating Apple-Glass Control Bar (Top Center) -->
    <div class="fixed top-[64px] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_12px_40px_rgba(0,0,0,0.2),0_1px_3px_rgba(0,0,0,0.08)] animate-apple-pop">
      <!-- Device Selector -->
      <div class="flex items-center p-0.5 rounded-full bg-black/5 border border-black/5">
        <button
          v-for="dev in DEVICE_PRESETS"
          :key="dev.id"
          type="button"
          @click="selectedDeviceId = dev.id"
          class="h-[28px] px-3 rounded-full text-[11px] font-707 font-medium transition-all cursor-pointer flex items-center gap-1.5"
          :class="selectedDeviceId === dev.id ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'"
          :title="`${dev.label} (${dev.width}×${dev.height}px)`"
        >
          <component :is="dev.icon" class="w-3.5 h-3.5" />
          <span>{{ dev.shortLabel }}</span>
        </button>
      </div>

      <div class="w-px h-4 bg-black/10 mx-0.5" />

      <!-- Scale Selector -->
      <div class="flex items-center p-0.5 rounded-full bg-black/5 border border-black/5">
        <button
          type="button"
          @click="scaleMode = '100'"
          class="h-[28px] px-2.5 rounded-full text-[11px] font-707 font-medium transition-all cursor-pointer"
          :class="scaleMode === '100' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'"
          title="100% Real CSS Pixel Scale (1:1 with real mobile web render)"
        >
          100% Real
        </button>
        <button
          type="button"
          @click="scaleMode = 'fit'"
          class="h-[28px] px-2.5 rounded-full text-[11px] font-707 font-medium transition-all cursor-pointer"
          :class="scaleMode === 'fit' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'"
          title="Fit Screen (Auto-scale to fit desktop window)"
        >
          Fit Screen
        </button>
        <button
          type="button"
          @click="scaleMode = '75'"
          class="h-[28px] px-2.5 rounded-full text-[11px] font-707 font-medium transition-all cursor-pointer"
          :class="scaleMode === '75' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'"
          title="Handheld Physical Scale (~75%, calibrated to physical phone size in hand)"
        >
          75% Hand
        </button>
      </div>

      <div class="w-px h-4 bg-black/10 mx-0.5" />

      <!-- Toggle Hardware Bezel Frame -->
      <button
        type="button"
        @click="showFrame = !showFrame"
        class="h-[28px] px-2.5 rounded-full text-[11px] font-707 font-medium transition-all cursor-pointer flex items-center gap-1.5"
        :class="showFrame ? 'bg-black/10 text-black font-semibold' : 'text-neutral-500 hover:text-black'"
        :title="showFrame ? 'Hardware Bezel: ON' : 'Hardware Bezel: OFF (Pure Web Viewport)'"
      >
        <Smartphone class="w-3.5 h-3.5" />
        <span class="text-[10.5px]">{{ showFrame ? 'Frame On' : 'No Frame' }}</span>
      </button>

      <!-- Close Preview Button -->
      <button
        type="button"
        @click="editorStore.closePreviewMode()"
        class="size-7 rounded-full bg-black/5 hover:bg-black/15 text-black flex items-center justify-center cursor-pointer transition-colors ml-0.5"
        title="Exit Preview (Esc)"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Scaled Viewport Container -->
    <div 
      class="flex-1 w-full h-full flex items-center justify-center overflow-auto no-scrollbar pt-[52px]"
      @click.self="editorStore.closePreviewMode()"
    >
      <div 
        class="transition-transform duration-200 ease-out flex items-center justify-center shrink-0 origin-center"
        :style="{
          transform: `scale(${computedScale})`,
          transformOrigin: 'center center'
        }"
      >
        <!-- Device Mockup Container (Guaranteed exact pixel dimensions) -->
        <div 
          class="relative bg-white flex flex-col overflow-hidden transition-all duration-200"
          :class="[
            showFrame
              ? 'rounded-[50px] border-[7px] border-[#202023] shadow-[0_32px_100px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] ring-1 ring-black/40'
              : 'rounded-[16px] shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(0,0,0,0.08)]'
          ]"
          :style="{
            width: `${activeDevice.width}px`,
            height: `${activeDevice.height}px`
          }"
        >
          <!-- Outer Titanium Reflection Bezel (Only when frame is on) -->
          <div v-if="showFrame" class="absolute inset-0 rounded-[43px] pointer-events-none ring-1 ring-white/10 z-40" />

          <!-- iOS Status Bar & Dynamic Island Header (Only when frame is on) -->
          <div 
            v-if="showFrame" 
            class="sticky top-0 left-0 right-0 h-[46px] w-full bg-white/95 backdrop-blur-md z-40 flex items-center justify-between px-7 shrink-0 pointer-events-none select-none"
          >
            <!-- Left: Time (9:41) -->
            <span class="font-sans font-semibold text-[13px] text-black tracking-tight">9:41</span>

            <!-- Center: Dynamic Island -->
            <div class="absolute top-[10px] left-1/2 -translate-x-1/2 w-[114px] h-[28px] bg-black rounded-full flex items-center justify-between px-3 shadow-md">
              <div class="size-2.5 rounded-full bg-[#0a0a14] border border-[#1e1e2d] relative flex items-center justify-center">
                <div class="size-1 rounded-full bg-[#1e293b]/60" />
              </div>
              <div class="size-2 rounded-full bg-[#080811]" />
            </div>

            <!-- Right: Cellular, Wi-Fi & Battery Status Icons -->
            <div class="flex items-center gap-1.5 text-black">
              <div class="flex items-end gap-[1.5px] h-3">
                <div class="w-[2.5px] h-1 bg-black rounded-[0.5px]" />
                <div class="w-[2.5px] h-1.5 bg-black rounded-[0.5px]" />
                <div class="w-[2.5px] h-2 bg-black rounded-[0.5px]" />
                <div class="w-[2.5px] h-2.5 bg-black rounded-[0.5px]" />
              </div>
              <Wifi class="w-3.5 h-3.5 text-black" />
              <div class="w-[20px] h-[10px] rounded-[3px] border border-black p-[1px] flex items-center relative ml-0.5">
                <div class="h-full w-full bg-black rounded-[1.5px]" />
                <div class="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-[4px] bg-black rounded-r-[1px]" />
              </div>
            </div>
          </div>

          <!-- Browser Address Bar simulation for 'No Frame' pure web mode -->
          <div 
            v-else
            class="sticky top-0 left-0 right-0 h-[38px] w-full bg-neutral-100/90 backdrop-blur-md border-b border-black/5 z-40 flex items-center justify-between px-3 shrink-0 pointer-events-none select-none text-neutral-500 text-[11px] font-mono"
          >
            <div class="flex items-center gap-1.5">
              <span class="size-2 rounded-full bg-black/20" />
              <span class="truncate max-w-[240px] text-black/70">707.studio/d/preview</span>
            </div>
            <span class="text-[10px] uppercase tracking-wider text-neutral-400">Web Viewport</span>
          </div>

          <!-- Live Interactive Screen Viewport -->
          <div class="flex-1 w-full h-full min-h-0 flex flex-col overflow-hidden relative bg-white">
            <MobileArtboard 
              :key="editorStore.currentPage?.id || editorStore.activePageIndex"
              :page="editorStore.currentPage" 
              :page-index="editorStore.activePageIndex"
              :is-selected="false"
              :is-preview-modal="true"
              :is-live-page="false"
              class="w-full h-full min-h-0 flex-1"
            />
          </div>

          <!-- iOS Home Bar Indicator (Bottom) -->
          <div 
            v-if="showFrame" 
            class="sticky bottom-0 left-0 right-0 h-[22px] w-full bg-white/95 backdrop-blur-sm z-40 flex items-center justify-center pointer-events-none shrink-0"
          >
            <div class="w-[134px] h-[4.5px] bg-black/60 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { Wifi, X, Smartphone, Monitor } from 'lucide-vue-next';
import MobileArtboard from '../MobileArtboard.vue';

const editorStore = useEditorStore();

const DEVICE_PRESETS = [
  { id: 'iphone-16-pro', label: 'iPhone 16 Pro', shortLabel: '16 Pro (393px)', width: 393, height: 852, icon: Smartphone },
  { id: 'iphone-16', label: 'iPhone 16 / 15', shortLabel: '16 (390px)', width: 390, height: 844, icon: Smartphone },
  { id: 'web-mobile', label: 'Web Frame', shortLabel: 'Web Card (440px)', width: 440, height: 852, icon: Monitor }
] as const;

const selectedDeviceId = ref<'iphone-16-pro' | 'iphone-16' | 'web-mobile'>('iphone-16-pro');
const scaleMode = ref<'100' | 'fit' | '75'>('100');
const showFrame = ref<boolean>(true);

const windowHeight = ref<number>(typeof window !== 'undefined' ? window.innerHeight : 900);
const windowWidth = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1440);

const activeDevice = computed(() => {
  return DEVICE_PRESETS.find(d => d.id === selectedDeviceId.value) || DEVICE_PRESETS[0];
});

const computedScale = computed(() => {
  if (scaleMode.value === '100') {
    return 1;
  }
  if (scaleMode.value === '75') {
    return 0.75;
  }
  // Fit Screen: calculate optimal scale to fit within viewport with margins
  const availableH = Math.max(300, windowHeight.value - 150);
  const availableW = Math.max(300, windowWidth.value - 80);
  const scaleH = availableH / activeDevice.value.height;
  const scaleW = availableW / activeDevice.value.width;
  return Math.min(1, Math.min(scaleH, scaleW));
});

function handleResize() {
  windowHeight.value = window.innerHeight;
  windowWidth.value = window.innerWidth;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && (editorStore.isPreviewMode || editorStore.isTestFormModalOpen)) {
    editorStore.closePreviewMode();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', handleResize);
});
</script>
