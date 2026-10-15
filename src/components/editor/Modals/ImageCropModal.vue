<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div 
      v-if="editorStore.isCropStudioOpen && currentImageUrl" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-[#0a0a0c]/90 backdrop-blur-2xl select-none"
      @keydown.esc="close"
      tabindex="-1"
    >
      <!-- Main Studio Container -->
      <div class="relative w-full max-w-[940px] h-[92vh] max-h-[820px] bg-[#121216] border border-white/10 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-white font-707">
        
        <!-- Header Bar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0 bg-[#16161b]">
          <div class="flex items-center gap-3">
            <div class="size-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Crop class="size-4" />
            </div>
            <div>
              <h2 class="text-[14px] font-semibold text-white tracking-tight">Interactive Crop & Framing Tool</h2>
              <p class="text-[11px] text-neutral-400">Click & drag image freely to reposition • Scroll to zoom</p>
            </div>
          </div>

          <button 
            type="button"
            @click="close"
            class="size-8 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X class="size-4" />
          </button>
        </div>

        <!-- Center Workspace Stage -->
        <div 
          ref="stageRef"
          class="flex-1 w-full relative flex items-center justify-center overflow-hidden p-6 bg-[#0c0c0e]"
          @wheel.prevent="handleWheel"
        >
          <!-- Ratio Selector Bar on Stage Top -->
          <div class="absolute top-4 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-1 shadow-lg overflow-x-auto max-w-[90%] no-scrollbar">
            <button
              v-for="r in cropRatios"
              :key="r.value"
              type="button"
              @click="setCropRatio(r.value)"
              :class="activeRatio === r.value ? 'bg-white text-black font-medium shadow-sm' : 'text-neutral-400 hover:text-white'"
              class="px-2.5 py-1 rounded-full text-[11px] transition-all whitespace-nowrap cursor-pointer"
            >
              {{ r.label }}
            </button>
          </div>

          <!-- Crop Viewport Box with dynamic Aspect Ratio -->
          <div 
            ref="cropBoxRef"
            class="relative overflow-hidden shadow-2xl border-2 border-white/90 transition-[width,height] duration-200"
            :style="cropBoxDimensions"
          >
            <!-- Draggable Photo Layer -->
            <div 
              class="absolute inset-0 cursor-grab active:cursor-grabbing select-none touch-none"
              @pointerdown="startDrag"
              @pointermove="onDrag"
              @pointerup="endDrag"
              @pointercancel="endDrag"
            >
              <img 
                :src="currentImageUrl"
                alt="Crop Preview"
                class="w-full h-full object-cover pointer-events-none select-none transition-transform duration-75"
                :style="imageTransformStyle"
                draggable="false"
              />
            </div>

            <!-- Rule of Thirds Grid Overlay -->
            <div class="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 transition-opacity duration-200" :class="isDragging ? 'opacity-80' : 'opacity-40'">
              <div v-for="i in 9" :key="i" class="border border-white/30 border-dashed" />
            </div>

            <!-- Corner Crop Brackets (Classic Photo Editor aesthetic) -->
            <!-- Top-Left -->
            <div class="absolute -top-[2px] -left-[2px] w-5 h-5 border-t-[3px] border-l-[3px] border-white pointer-events-none" />
            <!-- Top-Right -->
            <div class="absolute -top-[2px] -right-[2px] w-5 h-5 border-t-[3px] border-r-[3px] border-white pointer-events-none" />
            <!-- Bottom-Left -->
            <div class="absolute -bottom-[2px] -left-[2px] w-5 h-5 border-b-[3px] border-l-[3px] border-white pointer-events-none" />
            <!-- Bottom-Right -->
            <div class="absolute -bottom-[2px] -right-[2px] w-5 h-5 border-b-[3px] border-r-[3px] border-white pointer-events-none" />

            <!-- Dragging Hint Indicator -->
            <div 
              v-if="!hasInteracted" 
              class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none bg-black/75 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5 animate-bounce"
            >
              <Move class="size-3" />
              <span>Drag to reposition inside frame</span>
            </div>
          </div>
        </div>

        <!-- Bottom Controls & Tooling -->
        <div class="px-6 py-4 border-t border-white/10 shrink-0 bg-[#16161b] flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Left: Zoom & Scale Controls -->
          <div class="flex items-center gap-3 w-full md:w-auto">
            <span class="text-[12px] text-neutral-400 font-medium">Zoom</span>
            <button 
              type="button"
              @click="adjustZoom(-10)"
              class="size-7 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Zoom out"
            >
              <Minus class="size-3.5" />
            </button>
            <input 
              type="range"
              min="100"
              max="300"
              step="1"
              v-model.number="zoom"
              class="w-32 md:w-44 h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-white"
            />
            <button 
              type="button"
              @click="adjustZoom(10)"
              class="size-7 rounded-md bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Zoom in"
            >
              <Plus class="size-3.5" />
            </button>
            <span class="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded text-white min-w-[42px] text-center">
              {{ zoom }}%
            </span>
          </div>

          <!-- Center: Quick Alignment Presets -->
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] text-neutral-500 mr-1 hidden sm:inline">Align:</span>
            <button
              type="button"
              @click="setPresetPosition('top')"
              class="px-2.5 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Top
            </button>
            <button
              type="button"
              @click="setPresetPosition('center')"
              class="px-2.5 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Center
            </button>
            <button
              type="button"
              @click="setPresetPosition('bottom')"
              class="px-2.5 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Bottom
            </button>
            <button
              type="button"
              @click="resetCrop"
              class="px-2.5 py-1 text-[11px] rounded-md bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer ml-1"
              title="Reset position and zoom"
            >
              Reset
            </button>
          </div>

          <!-- Right: Action Buttons -->
          <div class="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              @click="close"
              class="px-4 py-2 text-[12px] rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="applyCrop"
              class="px-5 py-2 text-[12px] font-medium rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <Check class="size-3.5 text-black" />
              <span>Apply Crop</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { Crop, X, Minus, Plus, Move, Check } from 'lucide-vue-next';
import type { WidgetItem } from '../../../types/editor.ts';

const editorStore = useEditorStore();

const stageRef = ref<HTMLDivElement | null>(null);
const cropBoxRef = ref<HTMLDivElement | null>(null);

const targetWidget = computed<WidgetItem | null>(() => {
  if (editorStore.selectedWidget && editorStore.selectedWidget.type === 'HeroDrop') {
    return editorStore.selectedWidget;
  }
  return editorStore.currentPage?.widget_tree.find(w => w.type === 'HeroDrop') || null;
});

const currentImageUrl = computed(() => {
  return targetWidget.value?.props?.imageUrl || '';
});

// Crop Ratios
const cropRatios = [
  { label: 'Full Screen', value: 'Full screen landing page', ratio: 393 / 804 },
  { label: '4:5 (Portrait)', value: '4:5', ratio: 4 / 5 },
  { label: '3:4', value: '3:4', ratio: 3 / 4 },
  { label: '1:1 (Square)', value: '1:1', ratio: 1 },
  { label: '16:9', value: '16:9', ratio: 16 / 9 },
  { label: '9:16', value: '9:16', ratio: 9 / 16 },
  { label: 'Dynamic Fit', value: 'Dynamic Fit', ratio: 393 / 804 },
];

const activeRatio = ref<string>('Full screen landing page');
const posX = ref<number>(50);
const posY = ref<number>(50);
const zoom = ref<number>(100);

const isDragging = ref<boolean>(false);
const hasInteracted = ref<boolean>(false);
let startPointerX = 0;
let startPointerY = 0;
let initialPosX = 50;
let initialPosY = 50;

// Calculate Crop Box Aspect Dimensions inside the stage
const cropBoxDimensions = computed(() => {
  const selected = cropRatios.find(r => r.value === activeRatio.value) || cropRatios[0];
  const aspect = selected.ratio;
  
  // Available stage space max 540h, 700w
  const maxH = 500;
  const maxW = 680;

  let h = maxH;
  let w = h * aspect;

  if (w > maxW) {
    w = maxW;
    h = w / aspect;
  }

  return {
    width: `${Math.round(w)}px`,
    height: `${Math.round(h)}px`
  };
});

// Image CSS styling inside the crop viewport
const imageTransformStyle = computed(() => {
  return {
    objectPosition: `${posX.value}% ${posY.value}%`,
    transform: zoom.value > 100 ? `scale(${zoom.value / 100})` : 'none',
    transformOrigin: `${posX.value}% ${posY.value}%`
  };
});

function syncFromWidget() {
  const props = targetWidget.value?.props;
  if (!props) return;

  activeRatio.value = props.ratio || 'Full screen landing page';
  
  posX.value = typeof props.imagePositionX === 'number' ? props.imagePositionX : 50;
  if (typeof props.imagePositionY === 'number') {
    posY.value = props.imagePositionY;
  } else if (props.imagePosition === 'top') {
    posY.value = 0;
  } else if (props.imagePosition === 'bottom') {
    posY.value = 100;
  } else {
    posY.value = 50;
  }
  
  zoom.value = typeof props.imageZoom === 'number' ? props.imageZoom : 100;
  hasInteracted.value = false;
}

watch(() => editorStore.isCropStudioOpen, (open) => {
  if (open) {
    syncFromWidget();
  }
});

// Free Drag Interaction Handlers
function startDrag(e: PointerEvent) {
  isDragging.value = true;
  hasInteracted.value = true;
  (e.currentTarget as HTMLElement)?.setPointerCapture?.(e.pointerId);
  startPointerX = e.clientX;
  startPointerY = e.clientY;
  initialPosX = posX.value;
  initialPosY = posY.value;
}

function onDrag(e: PointerEvent) {
  if (!isDragging.value) return;

  const dx = e.clientX - startPointerX;
  const dy = e.clientY - startPointerY;

  const box = cropBoxRef.value;
  const width = box ? box.clientWidth : 300;
  const height = box ? box.clientHeight : 500;

  // Dragging DOWN moves the image down (shows top -> decreases posY towards 0)
  // Dragging RIGHT moves the image right (shows left -> decreases posX towards 0)
  const percentDeltaX = (dx / width) * 100;
  const percentDeltaY = (dy / height) * 100;

  posX.value = Math.min(100, Math.max(0, Math.round(initialPosX - percentDeltaX)));
  posY.value = Math.min(100, Math.max(0, Math.round(initialPosY - percentDeltaY)));
}

function endDrag(e: PointerEvent) {
  isDragging.value = false;
  try {
    (e.currentTarget as HTMLElement)?.releasePointerCapture?.(e.pointerId);
  } catch (_) {}
}

function handleWheel(e: WheelEvent) {
  const delta = e.deltaY < 0 ? 5 : -5;
  adjustZoom(delta);
}

function adjustZoom(delta: number) {
  hasInteracted.value = true;
  zoom.value = Math.min(300, Math.max(100, zoom.value + delta));
}

function setCropRatio(val: string) {
  activeRatio.value = val;
}

function setPresetPosition(preset: 'top' | 'center' | 'bottom') {
  hasInteracted.value = true;
  if (preset === 'top') posY.value = 0;
  if (preset === 'center') posY.value = 50;
  if (preset === 'bottom') posY.value = 100;
}

function resetCrop() {
  posX.value = 50;
  posY.value = 50;
  zoom.value = 100;
}

function close() {
  editorStore.closeCropStudio();
}

function applyCrop() {
  if (targetWidget.value) {
    const preset = posY.value === 0 ? 'top' : (posY.value === 100 ? 'bottom' : (posY.value === 50 ? 'center' : 'custom'));
    editorStore.updateWidgetProps(targetWidget.value.id, {
      ratio: activeRatio.value,
      imagePositionX: posX.value,
      imagePositionY: posY.value,
      imagePosition: preset,
      imageZoom: zoom.value
    });
    editorStore.showToast('Crop & framing applied successfully!');
  }
  close();
}
</script>
