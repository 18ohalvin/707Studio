<template>
  <!-- Center Bottom Toolbar Container (Figma Node 63:3395) with macOS Dock Magnification -->
  <div 
    class="fixed left-1/2 -translate-x-1/2 bottom-[16px] md:bottom-[20px] z-[60] select-none backdrop-blur-[16px] bg-[#f5f5f5]/60 border border-black/10 border-solid flex gap-[2px] md:gap-[4px] items-center p-[4px] rounded-full shadow-[0px_12px_40px_0px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] apple-dock-shelf"
    style="transform: translateX(-50%);"
  >

    <!-- 1. Plus / Add Block Button -->
    <div 
      class="flex items-center justify-center relative rounded-full shrink-0 size-[40px] apple-dock-item"
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
            Add widgets & blocks
          </div>
        </div>
      </Transition>

      <button 
        @click="editorStore.toggleWidgetSidebar()"
        :class="editorStore.isWidgetSidebarOpen 
          ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]' 
          : 'bg-transparent hover:bg-black/5 active:bg-black/10 text-black'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-full shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        title="Add widgets & blocks"
      >
        <div class="relative shrink-0 size-[18px] transition-transform duration-200">
          <img 
            alt="Add" 
            class="absolute block inset-0 max-w-none size-full transition-all duration-200" 
            :class="editorStore.isWidgetSidebarOpen ? 'brightness-0 invert rotate-45' : 'brightness-0 rotate-0'"
            :src="FIGMA_ASSETS.addIcon" 
          />
        </div>
      </button>
    </div>

    <!-- 2. Media Gallery Tool Button (Beside +) -->
    <div 
      class="flex items-center justify-center relative rounded-full shrink-0 size-[40px] apple-dock-item"
      @mouseenter="hoveredButtonKey = 'media'"
      @mouseleave="hoveredButtonKey = null"
    >
      <!-- Floating Explanation Tooltip directly above this icon -->
      <Transition name="apple-dock-fade">
        <div 
          v-if="!isLevel2Active && hoveredButtonKey === 'media'"
          class="absolute -top-[38px] left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none flex justify-center"
        >
          <div class="backdrop-blur-[16px] bg-white/85 text-black border border-black/10 px-[12px] py-[4px] rounded-full text-[11px] font-707 font-medium shadow-[0px_4px_20px_rgba(0,0,0,0.1),0_1px_3px_rgba(0,0,0,0.05)] whitespace-nowrap tracking-tight animate-apple-pop">
            Media Gallery
          </div>
        </div>
      </Transition>

      <button 
        type="button"
        @click="toggleMediaGallery"
        :class="editorStore.isMediaGalleryOpen 
          ? 'bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.25)]' 
          : 'bg-transparent hover:bg-black/5 active:bg-black/10 text-black'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-full shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        title="Media Gallery"
      >
        <div class="relative shrink-0 size-[18px] flex items-center justify-center">
          <ImageIcon class="w-4 h-4" :class="editorStore.isMediaGalleryOpen ? 'text-white' : 'text-black'" />
        </div>
      </button>
    </div>

    <!-- 3. Layers Tool Button -->
    <div 
      class="flex items-center justify-center relative rounded-full shrink-0 size-[40px] apple-dock-item"
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
          : 'bg-transparent hover:bg-black/5 active:bg-black/10 text-black'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-full shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
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

    <!-- 4. Pages / Mini Overview Button (Selected: Black Solid + White Icon, Unselected: Transparent + Black Icon) -->
    <div 
      class="flex items-center justify-center relative rounded-full shrink-0 size-[40px] apple-dock-item"
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
          : 'bg-transparent hover:bg-black/5 active:bg-black/10 text-black'"
        class="flex items-center justify-center overflow-clip p-[8px] relative rounded-full shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
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

    <!-- 5. Mobile-Only: 1-Tap Zoom Toggle (Fit / 100%) -->
    <div 
      class="sm:hidden flex items-center justify-center relative rounded-full shrink-0 size-[40px] apple-dock-item"
    >
      <button 
        type="button"
        @click="editorStore.toggleFitOr100()"
        class="bg-transparent hover:bg-black/5 active:bg-black/10 text-black flex items-center justify-center overflow-clip p-[8px] relative rounded-full shrink-0 size-[40px] apple-press cursor-pointer transition-all duration-200"
        :title="Math.abs(editorStore.zoomLevel - 100) < 5 ? 'Fit to Screen' : 'Zoom 100%'"
      >
        <Maximize2 v-if="Math.abs(editorStore.zoomLevel - 100) < 5" class="w-4 h-4 text-black" />
        <Minimize2 v-else class="w-4 h-4 text-black" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-vue-next';

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
    editorStore.isFormSidebarOpen ||
    editorStore.isDocumentSidebarOpen ||
    editorStore.isMediaGalleryOpen;
});

function toggleMediaGallery() {
  if (editorStore.isMediaGalleryOpen) {
    editorStore.closeMediaGallery();
  } else {
    editorStore.openMediaGallery('addNewMedia');
  }
}
</script>
