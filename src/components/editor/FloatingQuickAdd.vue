<template>
  <!-- Center Bottom Toolbar Container (Figma Node 63:3395) -->
  <div class="fixed left-1/2 -translate-x-1/2 bottom-[20px] z-[60] select-none backdrop-blur-[4px] bg-[#f5f5f5]/20 border border-black/10 border-solid flex gap-[8px] items-center p-[6px] rounded-[14px] shadow-[0px_12px_40px_0px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)]">

    <!-- 1. Plus / Add Block Button -->
    <div 
      class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]"
      @mouseenter="hoveredButtonKey = 'add'"
      @mouseleave="hoveredButtonKey = null"
    >
      <!-- Floating Explanation Tooltip directly above this icon -->
      <Transition name="apple-dock-fade">
        <div 
          v-if="!isLevel2Active && hoveredButtonKey === 'add'"
          class="absolute -top-[38px] left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex justify-center"
        >
          <div class="backdrop-blur-[16px] bg-white/85 text-black border border-black/10 px-[12px] py-[4px] rounded-full text-[11px] font-707 font-medium shadow-[0px_4px_20px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)] whitespace-nowrap tracking-tight animate-apple-pop">
            Add a widget, media and more
          </div>
        </div>
      </Transition>

      <button 
        @click="editorStore.toggleAddMenu()"
        :class="editorStore.isAddMenuOpen 
          ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]' 
          : 'backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        title="Quick Add Menu"
      >
        <div class="relative shrink-0 size-[18px] transition-transform duration-200">
          <img 
            alt="Add" 
            class="absolute block inset-0 max-w-none size-full transition-all duration-200" 
            :class="editorStore.isAddMenuOpen ? 'brightness-0 invert rotate-45' : 'brightness-0 rotate-0'"
            :src="FIGMA_ASSETS.addIcon" 
          />
        </div>
      </button>
    </div>

    <!-- 2. Text Tool Button -->
    <div 
      class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]"
      @mouseenter="hoveredButtonKey = 'text'"
      @mouseleave="hoveredButtonKey = null"
    >
      <!-- Floating Explanation Tooltip directly above this icon -->
      <Transition name="apple-dock-fade">
        <div 
          v-if="!isLevel2Active && hoveredButtonKey === 'text'"
          class="absolute -top-[38px] left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex justify-center"
        >
          <div class="backdrop-blur-[16px] bg-white/85 text-black border border-black/10 px-[12px] py-[4px] rounded-full text-[11px] font-707 font-medium shadow-[0px_4px_20px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)] whitespace-nowrap tracking-tight animate-apple-pop">
            Add text block
          </div>
        </div>
      </Transition>

      <button 
        @click="addTextBanner"
        class="backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.02)] apple-press cursor-pointer transition-all duration-200"
        title="Add Text / Heading"
      >
        <div class="relative shrink-0 size-[18px]">
          <img alt="Text" class="absolute block inset-0 max-w-none size-full brightness-0" :src="FIGMA_ASSETS.textIcon" />
        </div>
      </button>
    </div>

    <!-- 3. Layers Tool Button -->
    <div 
      class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]"
      @mouseenter="hoveredButtonKey = 'layers'"
      @mouseleave="hoveredButtonKey = null"
    >
      <!-- Floating Explanation Tooltip directly above this icon -->
      <Transition name="apple-dock-fade">
        <div 
          v-if="!isLevel2Active && hoveredButtonKey === 'layers'"
          class="absolute -top-[38px] left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex justify-center"
        >
          <div class="backdrop-blur-[16px] bg-white/85 text-black border border-black/10 px-[12px] py-[4px] rounded-full text-[11px] font-707 font-medium shadow-[0px_4px_20px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)] whitespace-nowrap tracking-tight animate-apple-pop">
            Manage layers & reorder
          </div>
        </div>
      </Transition>

      <button 
        @click="$emit('toggle-layers')"
        :class="editorStore.isLayersOpen 
          ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]' 
          : 'backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        title="View Layers Stack"
      >
        <div class="relative shrink-0 size-[18px] transition-transform duration-200">
          <img 
            alt="Layers" 
            class="absolute block inset-0 max-w-none size-full transition-all duration-200" 
            :class="editorStore.isLayersOpen ? 'brightness-0 invert' : 'brightness-0'"
            :src="FIGMA_ASSETS.layersIcon" 
          />
        </div>
      </button>
    </div>

    <!-- 4. Pages / Mini Overview Button (Selected: Black Solid + White Icon, Unselected: Ultra-Frosted Glass + Black Icon) -->
    <div 
      class="flex items-center justify-center relative rounded-[8px] shrink-0 size-[40px]"
      @mouseenter="hoveredButtonKey = 'pages'"
      @mouseleave="hoveredButtonKey = null"
    >
      <!-- Floating Explanation Tooltip directly above this icon -->
      <Transition name="apple-dock-fade">
        <div 
          v-if="!isLevel2Active && hoveredButtonKey === 'pages'"
          class="absolute -top-[38px] left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex justify-center"
        >
          <div class="backdrop-blur-[16px] bg-white/85 text-black border border-black/10 px-[12px] py-[4px] rounded-full text-[11px] font-707 font-medium shadow-[0px_4px_20px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)] whitespace-nowrap tracking-tight animate-apple-pop">
            Pages & artwork overview
          </div>
        </div>
      </Transition>

      <button 
        @click="$emit('toggle-pages')"
        :class="editorStore.isPagesOpen 
          ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]' 
          : 'backdrop-blur-[4px] bg-[#ececec]/20 hover:bg-[#ececec] active:bg-[#e0e0e0] text-black border-[0.5px] border-black/10 hover:border-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-[8px] shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        title="Toggle Pages Overview"
      >
        <div class="relative shrink-0 size-[18px] transition-transform duration-200">
          <img 
            alt="Pages" 
            class="absolute block inset-0 max-w-none size-full transition-all duration-200" 
            :class="editorStore.isPagesOpen ? 'brightness-0 invert' : 'brightness-0'"
            :src="FIGMA_ASSETS.deviceIcon" 
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';

defineEmits<{
  (e: 'toggle-layers'): void;
  (e: 'toggle-pages'): void;
}>();

const editorStore = useEditorStore();
const hoveredButtonKey = ref<string | null>(null);

const isLevel2Active = computed(() => {
  return editorStore.isAddMenuOpen || 
    editorStore.isLayersOpen || 
    editorStore.isPagesOpen || 
    editorStore.isWidgetSidebarOpen || 
    editorStore.isMediaSidebarOpen || 
    editorStore.isTextSidebarOpen || 
    editorStore.isMediaGalleryOpen;
});

function addTextBanner() {
  editorStore.closeAllSidebars();
  editorStore.addWidget('TextBanner', undefined, {
    text: '',
    placeholder: 'WRITE YOUR TEXT HERE'
  });
}
</script>
