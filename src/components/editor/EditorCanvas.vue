<template>
  <!-- Main Adobe-Style Interactive Canvas Stage (iPad Touch & Desktop Ready) -->
  <main 
    ref="canvasRef"
    @mousedown="handleCanvasMouseDown"
    @touchstart="handleCanvasTouchStart"
    @touchmove="handleCanvasTouchMove"
    @touchend="handleCanvasTouchEnd"
    @touchcancel="handleCanvasTouchEnd"
    @click.self="handleCanvasClick"
    @dblclick="handleCanvasDoubleClick"
    class="flex-1 bg-white relative overflow-hidden flex flex-col items-center justify-center select-none"
    style="touch-action: none;"
    :class="[
      isPanning || isTouchPanning ? 'cursor-grabbing' : (isSpacePressed ? 'cursor-grab' : 'cursor-default')
    ]"
    data-node-id="63:37"
  >
    <!-- Center Artboard Area: Adobe Transform Container (Supports Infinite Pan & Zoom) -->
    <div 
      @click.self="handleCanvasClick"
      class="flex-1 w-full flex items-center justify-center relative overflow-visible pointer-events-auto pt-[48px] pb-[96px]"
    >
      <div 
        @click.self="handleCanvasClick"
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
                class="w-[138.6px] h-[300.5px] bg-[#f5f5f5]/50 hover:bg-[#f5f5f5] border-[0.5px] border-dashed border-black/25 hover:border-black relative flex flex-col items-center justify-center gap-2.5 cursor-pointer shrink-0 rounded-none transition-all duration-200 shadow-[0px_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.08)] group"
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

            <!-- Add Page Card directly on Canvas (Exact match to 393x852 iPhone 16/17 Pro Canvas Size) -->
            <div 
              @click="handleAddNewPageFromCanvas"
              class="w-[393px] h-[852px] bg-[#f5f5f5]/50 hover:bg-[#f5f5f5] border-[0.5px] border-dashed border-black/30 hover:border-black relative flex flex-col items-center justify-center gap-3.5 cursor-pointer shrink-0 rounded-none transition-all duration-200 group select-none shadow-[0px_0px_30px_rgba(0,0,0,0.02)] hover:shadow-[0px_8px_30px_rgba(0,0,0,0.06)]"
              title="Add New Page"
            >
              <div class="size-12 rounded-full bg-white group-hover:bg-black text-black group-hover:text-white border border-black/10 group-hover:border-black flex items-center justify-center shadow-sm transition-all duration-200 group-hover:scale-105">
                <Plus class="w-5 h-5 stroke-[2]" />
              </div>
              <div class="flex flex-col items-center gap-1">
                <span class="font-707 text-[14px] font-medium text-black tracking-tight">
                  Add Page
                </span>
                <span class="font-707 text-[12px] text-neutral-500 font-normal">
                  Create Page {{ editorStore.pages.length + 1 }}
                </span>
              </div>
            </div>
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
        v-if="editorStore.isPagesOpen && !editorStore.isPreviewMode && !editorStore.isCropStudioOpen"
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
        v-if="!editorStore.isPagesOpen && !editorStore.isPreviewMode && !editorStore.isCropStudioOpen"
        @click.stop
        @toggle-layers="toggleLayers"
        @toggle-pages="togglePages"
      />
    </Transition>

    <!-- Right Bottom Dock Tools (Figma Node 97:3400) - Hidden in Pages Overview Mode & Preview Mode -->
    <Transition name="apple-dock-fade">
      <ViewportControls 
        v-if="!editorStore.isPagesOpen && !editorStore.isPreviewMode && !editorStore.isCropStudioOpen"
        @click.stop
        @open-settings="showProjectSettingsModal = true"
        @open-shortcuts="showShortcutsModal = true"
      />
    </Transition>

    <!-- In-Editor Project Info Settings Modal (Title & Slug) -->
    <ProjectInfoSettingsModal
      :is-open="showProjectSettingsModal || editorStore.isProjectSettingsOpen"
      @close="showProjectSettingsModal = false; editorStore.isProjectSettingsOpen = false"
    />

    <!-- Keyboard Shortcuts Guide Modal -->
    <KeyboardShortcutsModal
      :is-open="showShortcutsModal"
      @close="showShortcutsModal = false"
    />

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

    <!-- Ticket data block setup (Ticket page) -->
    <TicketSetupSidebar 
      @click.stop
      :is-open="editorStore.isTicketSidebarOpen"
      @close="editorStore.isTicketSidebarOpen = false"
    />

    <!-- Global Apple-Glass Floating Toast Notification -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="editorStore.activeToastMessage" 
        class="fixed top-[76px] left-1/2 -translate-x-1/2 z-[80] select-none pointer-events-none"
      >
        <div class="apple-frost text-black border border-white/60 px-4 py-2.5 rounded-full text-[12px] font-707 font-medium shadow-[0px_12px_36px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-2.5 tracking-tight animate-apple-pop">
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
import TicketSetupSidebar from './TicketSetupSidebar.vue';
import LayersSidebar from './LayersSidebar.vue';
import ProjectInfoSettingsModal from './Modals/ProjectInfoSettingsModal.vue';
import KeyboardShortcutsModal from './Modals/KeyboardShortcutsModal.vue';

const editorStore = useEditorStore();
const canvasRef = ref<HTMLElement | null>(null);
const showProjectSettingsModal = ref(false);
const showShortcutsModal = ref(false);

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
const isTouchPanning = ref(false);
const isWheelActive = ref(false);
let wheelEndTimer: ReturnType<typeof setTimeout> | null = null;

let startClientX = 0;
let startClientY = 0;
let initialPanX = 0;
let initialPanY = 0;

// iPad Touch Gesture State (1-finger Pan, 2-finger Pinch Zoom, Horizontal Swipe Slides)
let touchStartX = 0;
let touchStartY = 0;
let lastTouchX = 0;
let lastTouchY = 0;
let touchStartTime = 0;
let isPinching = false;
let initialPinchDistance = 0;
let initialPinchZoom = 100;
let initialPinchMidX = 0;
let initialPinchMidY = 0;
let lastTapTime = 0;
let isTouchOriginArtboard = false;

function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea' || target.isContentEditable;
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' || e.code === 'Escape') {
    if (showShortcutsModal.value) {
      showShortcutsModal.value = false;
      return;
    }
    editorStore.closeAllSidebars();
    editorStore.selectWidget(null);
    return;
  }

  // Never intercept shortcuts while typing in an input / textarea
  if (isInputElement(e.target)) return;

  const isCmdOrCtrl = e.metaKey || e.ctrlKey;
  const key = e.key.toLowerCase();

  // 0. Toggle Shortcuts Guide (? or Cmd+/)
  if ((isCmdOrCtrl && key === '/') || (!isCmdOrCtrl && e.key === '?')) {
    e.preventDefault();
    showShortcutsModal.value = !showShortcutsModal.value;
    return;
  }

  if (e.code === 'Space') {
    if (!isSpacePressed.value) {
      isSpacePressed.value = true;
    }
    e.preventDefault();
    return;
  }

  // 1. History (Undo: Cmd+Z, Redo: Cmd+Shift+Z or Cmd+Y)
  if (isCmdOrCtrl && key === 'z') {
    e.preventDefault();
    if (e.shiftKey) {
      editorStore.redo();
    } else {
      editorStore.undo();
    }
    return;
  }
  if (isCmdOrCtrl && key === 'y') {
    e.preventDefault();
    editorStore.redo();
    return;
  }

  // 2. Duplicate selected widget (Cmd+D)
  if (isCmdOrCtrl && key === 'd') {
    if (editorStore.selectedWidgetId) {
      e.preventDefault();
      editorStore.duplicateWidget(editorStore.selectedWidgetId);
    }
    return;
  }

  // 3. Cut (Cmd+X)
  if (isCmdOrCtrl && key === 'x') {
    if (editorStore.selectedWidgetId) {
      e.preventDefault();
      editorStore.cutWidget(editorStore.selectedWidgetId);
    }
    return;
  }

  // 4. Copy (Cmd+C)
  if (isCmdOrCtrl && key === 'c') {
    if (editorStore.selectedWidgetId) {
      e.preventDefault();
      editorStore.copyWidget(editorStore.selectedWidgetId);
    }
    return;
  }

  // 5. Paste (Cmd+V)
  if (isCmdOrCtrl && key === 'v') {
    if (editorStore.widgetClipboard) {
      e.preventDefault();
      editorStore.pasteWidget();
    }
    return;
  }

  // 6. Delete / Backspace (Delete widget if selected; else delete page if pages > 1 and not ticket)
  if (e.key === 'Backspace' || e.key === 'Delete') {
    if (editorStore.selectedWidgetId) {
      e.preventDefault();
      editorStore.removeWidget(editorStore.selectedWidgetId);
    } else if (editorStore.pages.length > 1 && editorStore.activePageIndex >= 0) {
      const pIdx = editorStore.activePageIndex;
      if (editorStore.pages[pIdx]?.kind !== 'ticket') {
        e.preventDefault();
        editorStore.removePage(pIdx);
        editorStore.showToast(`Page ${pIdx + 1} removed.`);
      }
    }
    return;
  }

  // 7. Reorder Stack (Alt+ArrowUp / Alt+ArrowDown)
  if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    if (editorStore.selectedWidgetId) {
      e.preventDefault();
      const currentWidgets = editorStore.currentPage.widget_tree;
      const curIdx = currentWidgets.findIndex(w => w.id === editorStore.selectedWidgetId);
      if (curIdx !== -1) {
        const targetIdx = e.key === 'ArrowUp' ? curIdx - 1 : curIdx + 1;
        editorStore.moveWidget(curIdx, targetIdx);
      }
    }
    return;
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

  // 1. Isolate scroll if cursor is inside floating sidebars, modals, bottom sheets, or open text editors
  if (target && target.closest('aside, [role="dialog"], input, textarea:focus, select, .apple-bottom-sheet-card')) {
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

    editorStore.isFitMode = false;
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

// ==============================================================
// iPad & Touch Operations: 1-Finger Pan, 2-Finger Pinch Zoom, Slide/Swipe
// ==============================================================
function handleCanvasTouchStart(e: TouchEvent) {
  // Ignore touches inside modals, floating sidebars, or active input fields
  const target = e.target as HTMLElement | null;
  if (target && (target.closest('aside, [role="dialog"], input, textarea:focus, select, button, .apple-dock-shelf') || isInputElement(target))) {
    return;
  }

  if (e.touches.length === 1) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    lastTouchX = t.clientX;
    lastTouchY = t.clientY;
    touchStartTime = Date.now();
    initialPanX = editorStore.panX;
    initialPanY = editorStore.panY;

    // Check if the touch originated inside an artboard frame or scrollable content
    isTouchOriginArtboard = Boolean(target && target.closest('[data-artboard-frame], .artboard-scroll-container'));

    // Check double-tap on canvas background (to zoom-fit & center active page)
    const now = Date.now();
    if (now - lastTapTime < 320 && !isTouchOriginArtboard) {
      editorStore.focusPage(editorStore.activePageIndex);
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;

    // Only initiate canvas panning if touch is outside the phone content or in pages overview
    if (!isTouchOriginArtboard || editorStore.isPagesOpen) {
      isTouchPanning.value = true;
    }
  } else if (e.touches.length >= 2) {
    // 2-Finger Pinch-to-Zoom & Pan (Universal across the entire viewport)
    isTouchPanning.value = false;
    isPinching = true;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    initialPinchDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    initialPinchZoom = editorStore.zoomLevel;
    initialPinchMidX = (t1.clientX + t2.clientX) / 2;
    initialPinchMidY = (t1.clientY + t2.clientY) / 2;
    initialPanX = editorStore.panX;
    initialPanY = editorStore.panY;
  }
}

function handleCanvasTouchMove(e: TouchEvent) {
  if (isPinching && e.touches.length >= 2) {
    e.preventDefault();
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const curDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    const curMidX = (t1.clientX + t2.clientX) / 2;
    const curMidY = (t1.clientY + t2.clientY) / 2;

    if (initialPinchDistance > 10) {
      const scale = curDist / initialPinchDistance;
      const targetZoom = Math.min(Math.max(initialPinchZoom * scale, 20), 320);

      if (canvasRef.value) {
        const rect = canvasRef.value.getBoundingClientRect();
        const cursorX = initialPinchMidX - (rect.left + rect.width / 2);
        const cursorY = initialPinchMidY - (rect.top + rect.height / 2);
        const scaleRatio = targetZoom / initialPinchZoom;
        editorStore.panX = cursorX - (cursorX - initialPanX) * scaleRatio + (curMidX - initialPinchMidX);
        editorStore.panY = cursorY - (cursorY - initialPanY) * scaleRatio + (curMidY - initialPinchMidY);
      }
      editorStore.isFitMode = false;
      editorStore.zoomLevel = Math.round(targetZoom * 10) / 10;
    }
  } else if (isTouchPanning.value && e.touches.length === 1) {
    const t = e.touches[0];
    lastTouchX = t.clientX;
    lastTouchY = t.clientY;
    const deltaX = t.clientX - touchStartX;
    const deltaY = t.clientY - touchStartY;

    // Freeform 1-finger canvas pan
    editorStore.panX = initialPanX + deltaX;
    editorStore.panY = initialPanY + deltaY;
    e.preventDefault();
  }
}

function handleCanvasTouchEnd(e: TouchEvent) {
  if (isPinching && e.touches.length < 2) {
    isPinching = false;
  }
  if (isTouchPanning.value && e.touches.length === 0) {
    isTouchPanning.value = false;
    const duration = Date.now() - touchStartTime;
    const deltaX = lastTouchX - touchStartX;
    const deltaY = lastTouchY - touchStartY;

    // Fluid Horizontal Swipe to Slide Between Pages (iPad gesture)
    if (duration < 360 && Math.abs(deltaX) > 65 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < -65) {
        // Swipe Left -> Navigate to Next Page
        if (editorStore.activePageIndex < editorStore.pages.length - 1) {
          editorStore.selectPage(editorStore.activePageIndex + 1);
          const pageTitle = editorStore.currentPage?.page_name || editorStore.inferPageName(editorStore.currentPage, editorStore.activePageIndex) || `Page ${editorStore.activePageIndex + 1}`;
          editorStore.showToast(`Page ${editorStore.activePageIndex + 1}: ${pageTitle}`);
          return;
        }
      } else if (deltaX > 65) {
        // Swipe Right -> Navigate to Previous Page
        if (editorStore.activePageIndex > 0) {
          editorStore.selectPage(editorStore.activePageIndex - 1);
          const pageTitle = editorStore.currentPage?.page_name || editorStore.inferPageName(editorStore.currentPage, editorStore.activePageIndex) || `Page ${editorStore.activePageIndex + 1}`;
          editorStore.showToast(`Page ${editorStore.activePageIndex + 1}: ${pageTitle}`);
          return;
        }
      }
    }

    // Re-center smoothly if user panned slightly
    if (!editorStore.isPagesOpen) {
      const expectedPanX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
      if (Math.abs(editorStore.panX - expectedPanX) < 50 && Math.abs(editorStore.panY) < 50) {
        editorStore.panX = expectedPanX;
        editorStore.panY = 0;
      }
    }
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

function handleAddNewPageFromCanvas() {
  editorStore.addPage();
  editorStore.selectPage(editorStore.pages.length - 1);
  editorStore.showToast(`Page ${editorStore.pages.length} created.`);
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

watch(
  () => [editorStore.activePageIndex, editorStore.pages.length, editorStore.zoomLevel],
  () => {
    if (!editorStore.isPagesOpen && !isPanning.value && !isWheelActive.value) {
      editorStore.panX = editorStore.getPageCenterOffsetX(editorStore.activePageIndex);
      editorStore.panY = 0;
    }
  }
);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  if (canvasRef.value) {
    canvasRef.value.addEventListener('wheel', handleWheel, { passive: false });

    // Intelligently fit iPhone 16/17 Pro canvas artboard to user's desktop display
    const rect = canvasRef.value.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      editorStore.updateFitZoom(rect.width, rect.height);
    }

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          editorStore.updateFitZoom(width, height);
        }
      });
      resizeObserver.observe(canvasRef.value);
    }
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
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('wheel', handleWheel);
  }
});
</script>
