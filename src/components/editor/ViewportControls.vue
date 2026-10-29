<template>
  <!-- Right Bottom Controls Dock (Figma Node 97:3400) - Dynamic position shifts when right sidebar opens to prevent collision -->
  <div 
    class="fixed bottom-[20px] z-[60] select-none backdrop-blur-[4px] bg-[#f5f5f5]/20 border border-black/10 border-solid flex gap-[8px] items-center p-[6px] rounded-[14px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="[
      isRightSidebarOpen 
        ? 'right-[24px] max-xl:opacity-0 max-xl:pointer-events-none xl:right-[416px]' 
        : 'right-[24px] opacity-100'
    ]"
  >
    <!-- 1. Zoom Indicator Pill & Popover Menu -->
    <div class="relative flex h-[40px] items-center justify-center rounded-[8px] shrink-0" ref="zoomMenuRef">
      <button 
        type="button"
        @click="isZoomMenuOpen = !isZoomMenuOpen"
        class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex gap-[6px] h-[40px] items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 min-w-[76px] px-2.5 apple-press cursor-pointer transition-all duration-200"
        title="Zoom Options & Presets"
      >
        <div class="relative shrink-0 size-[16px]">
          <img alt="Zoom" class="absolute block inset-0 max-w-none size-full brightness-0" :src="FIGMA_ASSETS.zoomIcon" />
        </div>
        <p class="font-707 text-[12px] font-normal text-black whitespace-nowrap">
          <span v-if="editorStore.isFitMode" class="font-medium text-[10.5px] opacity-75">Fit · </span>{{ Math.round(editorStore.zoomLevel) }}%
        </p>
      </button>

      <!-- Glass Zoom Popover Menu -->
      <Transition name="apple-dock-fade">
        <div 
          v-if="isZoomMenuOpen"
          class="absolute bottom-[50px] right-0 z-50 w-[184px] p-2.5 rounded-[12px] backdrop-blur-2xl bg-white/95 border border-black/10 shadow-[0_16px_36px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.04)] flex flex-col gap-2 animate-apple-pop"
          @click.stop
        >
          <!-- Quick Presets -->
          <div class="flex flex-col gap-0.5">
            <button
              type="button"
              @click="setFitMode"
              class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] hover:bg-black/5 text-[12px] font-707 cursor-pointer transition-colors"
              :class="editorStore.isFitMode ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
            >
              <span>Fit to Screen</span>
              <span class="text-[10.5px] font-mono text-neutral-400">{{ Math.round(editorStore.fitZoomLevel) }}%</span>
            </button>
            <button
              v-for="preset in [50, 75, 100, 125, 150]"
              :key="preset"
              type="button"
              @click="setZoomLevel(preset)"
              class="w-full flex items-center justify-between px-2.5 py-1 rounded-[6px] hover:bg-black/5 text-[12px] font-707 cursor-pointer transition-colors"
              :class="(!editorStore.isFitMode && Math.round(editorStore.zoomLevel) === preset) ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
            >
              <span>{{ preset }}%</span>
              <Check v-if="!editorStore.isFitMode && Math.round(editorStore.zoomLevel) === preset" class="size-3 text-black" />
            </button>
          </div>

          <!-- Stepper & Range Slider -->
          <div class="pt-2 border-t border-black/5 flex flex-col gap-2">
            <div class="flex items-center justify-between gap-1.5">
              <button 
                type="button" 
                @click="stepZoom(-10)" 
                class="size-6 rounded flex items-center justify-center hover:bg-black/5 text-black font-mono text-[14px] cursor-pointer"
                title="Zoom out"
              >−</button>
              <input
                type="range"
                min="30"
                max="200"
                step="5"
                :value="editorStore.zoomLevel"
                @input="onSliderInput"
                class="flex-1 cursor-pointer"
                aria-label="Canvas zoom level"
              />
              <button 
                type="button" 
                @click="stepZoom(10)" 
                class="size-6 rounded flex items-center justify-center hover:bg-black/5 text-black font-mono text-[14px] cursor-pointer"
                title="Zoom in"
              >+</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 2. Undo Button (Facing Left, Crisp Solid Black when active, Inactive Dimmed when no changes) -->
    <div class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]">
      <button 
        @click="editorStore.undo"
        :disabled="!editorStore.canUndo"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] transition-all duration-200"
        :class="[
          editorStore.canUndo 
            ? 'backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer' 
            : 'backdrop-blur-[4px] bg-[#ececec]/20 border-[0.5px] border-black/5 cursor-not-allowed shadow-none opacity-40 text-black'
        ]"
        :title="editorStore.canUndo ? 'Undo' : 'Nothing to undo'"
      >
        <div 
          class="relative shrink-0 size-[18px] transition-opacity"
          :class="editorStore.canUndo ? 'opacity-100' : 'opacity-25'"
        >
          <img alt="Undo" class="absolute block inset-0 max-w-none size-full brightness-0" :src="FIGMA_ASSETS.undoIcon" />
        </div>
      </button>
    </div>

    <!-- 3. Redo Button (Facing Right, Crisp Solid Black when active, Inactive Dimmed when no redo available) -->
    <div class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]">
      <button 
        @click="editorStore.redo"
        :disabled="!editorStore.canRedo"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] transition-all duration-200"
        :class="[
          editorStore.canRedo 
            ? 'backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer' 
            : 'backdrop-blur-[4px] bg-[#ececec]/20 border-[0.5px] border-black/5 cursor-not-allowed shadow-none opacity-40 text-black'
        ]"
        :title="editorStore.canRedo ? 'Redo' : 'Nothing to redo'"
      >
        <div 
          class="relative shrink-0 size-[18px] transition-opacity"
          :class="editorStore.canRedo ? 'opacity-100' : 'opacity-25'"
        >
          <img alt="Redo" class="absolute block inset-0 max-w-none size-full scale-x-[-1] brightness-0" :src="FIGMA_ASSETS.undoIcon" />
        </div>
      </button>
    </div>

    <!-- 4. Settings Gear Button (Crisp Solid Black) -->
    <div class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]">
      <button 
        @click="$emit('open-settings')"
        class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        title="Project Settings"
      >
        <div class="relative shrink-0 size-[18px]">
          <img alt="Settings" class="absolute block inset-0 max-w-none size-full brightness-0" :src="FIGMA_ASSETS.settingsIcon" />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { Check } from 'lucide-vue-next';

defineEmits<{
  (e: 'open-settings'): void;
}>();

const editorStore = useEditorStore();
const isZoomMenuOpen = ref(false);
const zoomMenuRef = ref<HTMLElement | null>(null);

const isRightSidebarOpen = computed(() => {
  return editorStore.isMediaSidebarOpen ||
    editorStore.isTextSidebarOpen ||
    editorStore.isButtonSidebarOpen ||
    editorStore.isChoiceSidebarOpen ||
    editorStore.isFormSidebarOpen ||
    editorStore.isModalSidebarOpen ||
    editorStore.isEPassSidebarOpen ||
    editorStore.isTicketSidebarOpen;
});

function setFitMode() {
  editorStore.isFitMode = true;
  editorStore.zoomLevel = editorStore.fitZoomLevel;
  editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
  editorStore.panY = 0;
  isZoomMenuOpen.value = false;
}

function setZoomLevel(level: number) {
  editorStore.isFitMode = false;
  editorStore.zoomLevel = level;
  editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
  editorStore.panY = 0;
  isZoomMenuOpen.value = false;
}

function stepZoom(delta: number) {
  editorStore.isFitMode = false;
  const next = Math.min(250, Math.max(30, Math.round(editorStore.zoomLevel + delta)));
  editorStore.zoomLevel = next;
  editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
  editorStore.panY = 0;
}

function onSliderInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const val = Number(target.value);
  editorStore.isFitMode = false;
  editorStore.zoomLevel = val;
  editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
  editorStore.panY = 0;
}

function handleClickOutside(e: MouseEvent) {
  if (zoomMenuRef.value && !zoomMenuRef.value.contains(e.target as Node)) {
    isZoomMenuOpen.value = false;
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>
