<template>
  <!-- Main Adobe-Style Interactive Canvas Stage -->
  <main 
    ref="canvasRef"
    @mousedown="handleCanvasMouseDown"
    @click.self="handleCanvasClick"
    @dblclick="handleCanvasDoubleClick"
    class="flex-1 bg-white relative overflow-hidden flex flex-col items-center justify-center select-none"
    :class="[
      isPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : 'cursor-default')
    ]"
    data-node-id="63:37"
  >
    <!-- Center Artboard Area: Adobe Transform Container (Supports Infinite Pan & Zoom) -->
    <div 
      class="flex-1 w-full flex items-center justify-center relative overflow-visible pointer-events-auto"
    >
      <div 
        @click.stop
        class="origin-center flex items-center justify-center my-auto shrink-0 select-none relative"
        :class="[
          (isPanning || isModeTransitioning) ? 'transition-none' : 'transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
        ]"
        :style="{
          transform: `translate3d(${editorStore.isPagesOpen ? 0 : editorStore.panX}px, ${editorStore.isPagesOpen ? 0 : editorStore.panY}px, 0px) scale(${editorStore.zoomLevel / 100})`
        }"
      >
        <Transition name="canvas-zoom-switch" mode="out-in">
          <!-- Mode 1: Scaled Down Mini Page Cards Overview (Figma Node 185:6590) - 5xX Centered Grid -->
          <div 
            v-if="editorStore.isPagesOpen"
            key="pages-overview"
            class="flex flex-wrap items-center justify-center gap-x-[24px] md:gap-x-[28px] gap-y-[64px] max-w-[805px] mx-auto shrink-0 pb-[72px]"
            data-node-id="185:6590"
            data-name="Pages Overview Mode"
          >
            <MiniPageCard 
              v-for="(page, pIdx) in editorStore.pages" 
              :key="page.id"
              :page="page"
              :page-index="pIdx"
              :is-selected="editorStore.activePageIndex === pIdx"
              @select="handleSelectMiniPage"
              @open-edit="handleOpenEditMiniPage"
            />

            <!-- Blank Canvas Card with Add Icon for Adding New Page -->
            <div class="relative flex flex-col items-center select-none">
              <div 
                @click="handleAddNewPageFromOverview"
                class="w-[138.6px] h-[277.2px] bg-[#f5f5f5]/50 hover:bg-[#f5f5f5] border-[0.5px] border-dashed border-black/25 hover:border-black relative flex flex-col items-center justify-center gap-2.5 cursor-pointer shrink-0 rounded-none transition-all duration-200 shadow-[0px_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] group"
                title="Add New Page"
              >
                <div class="size-9 rounded-full bg-white group-hover:bg-black text-black group-hover:text-white border border-black/10 group-hover:border-black flex items-center justify-center shadow-sm transition-all duration-200">
                  <Plus class="w-4 h-4 stroke-[2]" />
                </div>
                <span class="font-707 text-[11px] font-medium text-neutral-500 group-hover:text-black transition-colors">
                  Add Page
                </span>
              </div>
            </div>
          </div>

          <!-- Mode 2: Full-Size Editable Artboard Canvas View -->
          <div 
            v-else
            key="canvas-edit"
            class="flex items-center justify-center gap-[64px] shrink-0"
          >
            <MobileArtboard 
              v-for="(page, pIdx) in editorStore.pages" 
              :key="page.id"
              :page="page"
              :page-index="pIdx"
              :is-selected="editorStore.activePageIndex === pIdx"
              @select-page="editorStore.selectPage(pIdx)"
            />
          </div>
        </Transition>
      </div>
    </div>

    <!-- Widget Left Sidebar Menu (Figma Node 74:182) -->
    <WidgetLeftSidebar 
      @click.stop
      :is-open="editorStore.isWidgetSidebarOpen"
      @close="editorStore.isWidgetSidebarOpen = false"
    />

    <!-- Level 2 Quick Add Menu (Figma Node 71:50) -->
    <QuickAddLevel2Menu 
      @click.stop
      :is-open="editorStore.isAddMenuOpen"
      @select-widget="handleSelectWidget"
      @select-media="handleSelectMedia"
      @select-new-page="handleSelectNewPage"
      @select-request-widget="handleSelectRequestWidget"
    />

    <!-- Done Action Button when in Pages Overview Mode (Access to exit overview page) -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="editorStore.isPagesOpen && !editorStore.isPreviewMode"
        class="fixed left-1/2 -translate-x-1/2 bottom-[24px] z-[70] select-none pointer-events-auto"
      >
        <button
          @click="editorStore.closePages()"
          class="apple-glass-btn-dark flex items-center justify-center gap-2 px-[24px] h-[40px] rounded-[8px] shadow-[0px_10px_30px_rgba(0,0,0,0.25)] border border-white/20 cursor-pointer text-white hover:bg-neutral-900 transition-colors duration-150"
          title="Exit Overview Page (Return to Canvas)"
        >
          <Check class="w-4 h-4 text-white stroke-[2.5]" />
          <span class="font-707 font-medium text-white text-[13px] tracking-wide">
            Done
          </span>
        </button>
      </div>
    </Transition>

    <!-- Center Floating Level 1 Bottom Toolbar when in normal canvas edit mode -->
    <Transition name="apple-dock-fade">
      <FloatingQuickAdd 
        v-if="!editorStore.isPagesOpen && !editorStore.isPreviewMode"
        @click.stop
        @toggle-layers="toggleLayers"
        @toggle-pages="togglePages"
      />
    </Transition>

    <!-- Right Bottom Dock Tools (Figma Node 97:3400) - Hidden in Pages Overview Mode & Preview Mode -->
    <Transition name="apple-dock-fade">
      <ViewportControls 
        v-if="!editorStore.isPagesOpen && !editorStore.isPreviewMode"
        @click.stop
        @open-settings="editorStore.isReviewModalOpen = true"
      />
    </Transition>

    <!-- Media Gallery Side Drawer (Figma Node 171:5023) -->
    <MediaGallerySidebar 
      @click.stop
      :is-open="editorStore.isMediaGalleryOpen"
      @close="editorStore.isMediaGalleryOpen = false"
    />

    <!-- Media & Banners Setup Sidebar Drawer (Figma Node 113:3887) -->
    <MediaBannerSidebar 
      @click.stop
      :is-open="editorStore.isMediaSidebarOpen"
      @close="editorStore.isMediaSidebarOpen = false"
    />

    <!-- Text Setup Sidebar Drawer (Figma Node 181:5929) -->
    <TextSetupSidebar 
      @click.stop
      :is-open="editorStore.isTextSidebarOpen"
      @close="editorStore.isTextSidebarOpen = false"
    />

    <!-- Button Setup Sidebar Drawer (Figma Node 244:11560) -->
    <ButtonSetupSidebar 
      @click.stop
      :is-open="editorStore.isButtonSidebarOpen"
      @close="editorStore.isButtonSidebarOpen = false"
    />

    <!-- Choice Setup Sidebar Drawer (Figma Node 276:4224) -->
    <ChoiceSetupSidebar 
      @click.stop
      :is-open="editorStore.isChoiceSidebarOpen"
      @close="editorStore.isChoiceSidebarOpen = false"
    />

    <!-- Registration Form Setup Sidebar Drawer -->
    <FormSetupSidebar 
      @click.stop
      :is-open="editorStore.isFormSidebarOpen"
      @close="editorStore.isFormSidebarOpen = false"
    />

    <!-- Pop Up Modal Setup Sidebar Drawer (Figma Node 276:4722) -->
    <ModalSetupSidebar 
      @click.stop
      :is-open="editorStore.isModalSidebarOpen"
      @close="editorStore.isModalSidebarOpen = false"
    />

    <!-- Guest E-Pass Setup Sidebar Drawer (Figma Node 222:4188) -->
    <EPassSetupSidebar 
      @click.stop
      :is-open="editorStore.isEPassSidebarOpen"
      @close="editorStore.isEPassSidebarOpen = false"
    />

    <!-- Global Apple-Glass Floating Toast Notification -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="editorStore.activeToastMessage" 
        class="fixed top-[76px] left-1/2 -translate-x-1/2 z-[80] select-none pointer-events-none"
      >
        <div class="backdrop-blur-2xl bg-white/90 text-black border border-white/60 px-4 py-2.5 rounded-full text-[12px] font-707 font-medium shadow-[0px_12px_36px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-2.5 tracking-tight animate-apple-pop">
          <AlertCircle class="w-4 h-4 text-amber-500 shrink-0" />
          <span>{{ editorStore.activeToastMessage }}</span>
        </div>
      </div>
    </Transition>

    <!-- Layer Button Sidebar Menu (Figma Node 184:6137) -->
    <LayersSidebar 
      @click.stop
      :is-open="editorStore.isLayersOpen"
      @close="editorStore.isLayersOpen = false"
    />
  </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { Plus, Check, AlertCircle } from 'lucide-vue-next';
import MobileArtboard from './MobileArtboard.vue';
import MiniPageCard from './MiniPageCard.vue';
import FloatingQuickAdd from './FloatingQuickAdd.vue';
import QuickAddLevel2Menu from './QuickAddLevel2Menu.vue';
import ViewportControls from './ViewportControls.vue';
import MediaBannerSidebar from './MediaBannerSidebar.vue';
import WidgetLeftSidebar from './WidgetLeftSidebar.vue';
import MediaGallerySidebar from './MediaGallerySidebar.vue';
import TextSetupSidebar from './TextSetupSidebar.vue';
import ButtonSetupSidebar from './ButtonSetupSidebar.vue';
import ChoiceSetupSidebar from './ChoiceSetupSidebar.vue';
import FormSetupSidebar from './FormSetupSidebar.vue';
import ModalSetupSidebar from './ModalSetupSidebar.vue';
import EPassSetupSidebar from './EPassSetupSidebar.vue';
import LayersSidebar from './LayersSidebar.vue';

const editorStore = useEditorStore();
const canvasRef = ref<HTMLElement | null>(null);

// Overview / Canvas Mode Zoom Transition State
const isModeTransitioning = ref(false);
let modeTransitionTimer: ReturnType<typeof setTimeout> | null = null;

watch(() => editorStore.isPagesOpen, () => {
  isModeTransitioning.value = true;
  if (modeTransitionTimer) clearTimeout(modeTransitionTimer);
  modeTransitionTimer = setTimeout(() => {
    isModeTransitioning.value = false;
  }, 260);
});

// Adobe Artwork Canvas Pan / Zoom State
const isSpacePressed = ref(false);
const isPanning = ref(false);
const isWheelActive = ref(false);
let wheelEndTimer: ReturnType<typeof setTimeout> | null = null;

let startClientX = 0;
let startClientY = 0;
let initialPanX = 0;
let initialPanY = 0;

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !isInputElement(e.target)) {
    if (!isSpacePressed.value) {
      isSpacePressed.value = true;
    }
    e.preventDefault();
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    isSpacePressed.value = false;
  }
}

function handleCanvasMouseDown(e: MouseEvent) {
  // Freeform move requires holding Space (Hand tool) or middle click
  const isMiddleClick = e.button === 1;

  if (isSpacePressed.value || isMiddleClick) {
    isPanning.value = true;
    startClientX = e.clientX;
    startClientY = e.clientY;
    initialPanX = editorStore.panX;
    initialPanY = editorStore.panY;

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    e.preventDefault();
  }
}

function handleWindowMouseMove(e: MouseEvent) {
  if (!isPanning.value) return;
  const deltaX = e.clientX - startClientX;
  const deltaY = e.clientY - startClientY;
  editorStore.panX = initialPanX + deltaX;
  editorStore.panY = initialPanY + deltaY;
}

function handleWindowMouseUp() {
  if (isPanning.value) {
    isPanning.value = false;
    window.removeEventListener('mousemove', handleWindowMouseMove);
    window.removeEventListener('mouseup', handleWindowMouseUp);
  }
}

function handleWheel(e: WheelEvent) {
  const isZoom = e.ctrlKey || e.metaKey;
  const target = e.target as HTMLElement | null;

  // 1. Isolate scroll if cursor is inside floating sidebars, modals, or open text editors
  if (target && target.closest('aside, [role="dialog"], input, textarea:focus, select')) {
    return;
  }

  // 2. Isolate scroll if cursor is inside active editable page artboard on canvas and not zooming
  if (!isZoom && !editorStore.isPagesOpen && target && target.closest('[data-artboard-frame], .artboard-scroll-container')) {
    return;
  }

  if (isZoom) {
    // 1. Pinch to zoom on trackpad or Cmd/Ctrl + Wheel everywhere on artwork & canvas
    e.preventDefault();
    isWheelActive.value = true;
    if (wheelEndTimer) clearTimeout(wheelEndTimer);
    wheelEndTimer = setTimeout(() => {
      isWheelActive.value = false;
    }, 90);

    const clampedDelta = Math.min(Math.max(e.deltaY, -50), 50);
    const factor = Math.exp(-clampedDelta * 0.006);
    const oldZoom = editorStore.zoomLevel;
    const targetZoom = Math.min(Math.max(oldZoom * factor, 15), 350);

    // Focal point zoom: maintain point under cursor stationary
    if (canvasRef.value) {
      const rect = canvasRef.value.getBoundingClientRect();
      const cursorX = e.clientX - (rect.left + rect.width / 2);
      const cursorY = e.clientY - (rect.top + rect.height / 2);
      const scaleRatio = targetZoom / oldZoom;
      editorStore.panX = cursorX - (cursorX - editorStore.panX) * scaleRatio;
      editorStore.panY = cursorY - (cursorY - editorStore.panY) * scaleRatio;
    }

    editorStore.zoomLevel = Math.round(targetZoom * 100) / 100;
  }
  // Freeform canvas movement via trackpad swipe / mouse scroll is disabled (must hold Space)
}

function handleCanvasDoubleClick(e: MouseEvent) {
  if (isInputElement(e.target)) return;
  const target = e.target as HTMLElement | null;
  if (target && !target.closest('.apple-card-hover') && !target.closest('[data-name="Template Container"]')) {
    editorStore.focusPage(editorStore.activePageIndex);
  }
}

function handleSelectMiniPage(index: number) {
  editorStore.selectPage(index);
}

function handleOpenEditMiniPage(index: number) {
  editorStore.focusPage(index);
}

function handleSelectWidget() {
  editorStore.openWidgetSidebar();
}

function handleSelectMedia() {
  editorStore.openMediaGallery('addNewMedia');
}

function handleSelectNewPage() {
  editorStore.addPage();
  editorStore.closeAddMenu();
}

function handleAddNewPageFromOverview() {
  editorStore.addPage();
}

function handleSelectRequestWidget() {
  editorStore.isRequestWidgetModalOpen = true;
  editorStore.closeAddMenu();
}

function handleCanvasClick() {
  editorStore.selectWidget(null);
  editorStore.closeAllSidebars();
}

function toggleLayers() {
  editorStore.toggleLayers();
}

function togglePages() {
  editorStore.togglePages();
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  if (canvasRef.value) {
    canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });
  }
  // Guarantee active selected page is centered in viewport
  editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
  editorStore.panY = 0;
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  window.removeEventListener('mousemove', handleWindowMouseMove);
  window.removeEventListener('mouseup', handleWindowMouseUp);
  if (wheelEndTimer) clearTimeout(wheelEndTimer);
  if (modeTransitionTimer) clearTimeout(modeTransitionTimer);
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('wheel', handleWheel);
  }
});
</script>
