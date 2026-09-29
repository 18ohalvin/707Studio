<template>
  <!-- Right Bottom Controls Dock (Figma Node 97:3400) -->
  <div class="fixed right-[24px] bottom-[20px] z-[60] select-none backdrop-blur-[4px] bg-[#f5f5f5]/20 border border-black/10 border-solid flex gap-[8px] items-center p-[6px] rounded-[14px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)]">
    <!-- 1. Zoom Indicator Pill (Shows dynamic scale e.g. 100% Fit to Screen) -->
    <div class="flex h-[40px] items-center justify-center relative rounded-[8px] shrink-0">
      <button 
        @click="cycleZoom"
        class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex gap-[8px] h-[40px] items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 min-w-[76px] px-3 apple-press cursor-pointer transition-all duration-200"
        title="Cycle Zoom / Fit to Screen"
      >
        <div class="relative shrink-0 size-[18px]">
          <img alt="Zoom" class="absolute block inset-0 max-w-none size-full brightness-0" :src="FIGMA_ASSETS.zoomIcon" />
        </div>
        <p class="font-707 text-btn font-normal text-black whitespace-nowrap">
          {{ Math.round(editorStore.zoomLevel) }}%
        </p>
      </button>
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
        title="Settings"
      >
        <div class="relative shrink-0 size-[18px]">
          <img alt="Settings" class="absolute block inset-0 max-w-none size-full brightness-0" :src="FIGMA_ASSETS.settingsIcon" />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';

defineEmits<{
  (e: 'open-settings'): void;
}>();

const editorStore = useEditorStore();

function cycleZoom() {
  if (editorStore.zoomLevel === 85) {
    editorStore.zoomLevel = 100;
  } else if (editorStore.zoomLevel === 100) {
    editorStore.zoomLevel = 125;
  } else {
    editorStore.zoomLevel = 85; // Reset to 85% default portview
  }
  editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
  editorStore.panY = 0;
}
</script>
