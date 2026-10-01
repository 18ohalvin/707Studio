<template>
  <!-- Mini Page Card Container (Figma Node 185:6590) with Drag to Order Support -->
  <div 
    class="relative flex flex-col items-center select-none"
    :class="[
      isDraggingThis ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100',
      'transition-all duration-200'
    ]"
  >
    <!-- Drop Insertion Indicator Line (Left / Before Target) -->
    <div 
      v-if="isDragOver && isDropBefore"
      class="absolute -left-[14px] top-0 bottom-0 w-[3px] bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] z-40 pointer-events-none animate-pulse"
    />

    <!-- Drop Insertion Indicator Line (Right / After Target) -->
    <div 
      v-if="isDragOver && !isDropBefore"
      class="absolute -right-[14px] top-0 bottom-0 w-[3px] bg-black rounded-full shadow-[0_0_8px_rgba(0,0,0,0.3)] z-40 pointer-events-none animate-pulse"
    />

    <!-- Scaled-down Mini Card Phone Frame (Figma Node 185:6541 / 185:6562) -->
    <div 
      draggable="true"
      @dragstart="handleDragStart"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter"
      @drop.prevent="handleDrop"
      @dragend="handleDragEnd"
      @click="handleSelect"
      @dblclick="handleDoubleClick"
      class="w-[138.6px] h-[277.2px] bg-[#f5f5f5] relative flex flex-col overflow-hidden cursor-grab active:cursor-grabbing shrink-0 rounded-none apple-card-hover transition-all duration-200"
      :class="[
        isDragOver
          ? 'ring-2 ring-black border-black shadow-[0px_16px_40px_rgba(0,0,0,0.2)] scale-[1.03]'
          : isSelected 
            ? 'border-[0.5px] border-black shadow-[0px_16px_40px_rgba(0,0,0,0.15)]' 
            : 'border-[0.5px] border-black/15 shadow-[0px_4px_24px_rgba(0,0,0,0.06)] hover:border-black/30'
      ]"
      data-node-id="185:6562"
      data-name="Template Container"
      :title="`Drag to reorder Page ${pageIndex + 1}`"
    >
      <!-- Scaled Live Artboard Container (100% Identical to User's Real Page Content) -->
      <div 
        class="origin-top-left pointer-events-none absolute inset-0 overflow-hidden"
        style="transform: scale(0.407647); width: 340px; height: 680px;"
      >
        <MobileArtboard 
          :page="page"
          :page-index="pageIndex"
          :is-selected="false"
          :is-mini-preview="true"
        />
      </div>
    </div>

    <!-- Floating Action Function Bar Centered Directly Under Selected Mini Page (Figma Node 185:6570) -->
    <div 
      v-if="isSelected && !isDraggingThis"
      @click.stop
      @dblclick.stop
      class="absolute top-[292px] left-1/2 backdrop-blur-[4px] bg-[#f5f5f5]/20 border border-black/10 content-stretch flex gap-[32px] h-[40px] items-center px-[16px] py-[8px] rounded-[10px] shadow-[0px_12px_32px_0px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.03)] select-none whitespace-nowrap z-30 transition-all animate-apple-pop-center pointer-events-auto"
      data-node-id="185:6570"
      data-name="Buttons Container"
    >
      <!-- Page Number & Name (Figma Node 185:6588) -->
      <div class="content-stretch flex gap-[8px] items-center text-[12px] text-black whitespace-nowrap" data-node-id="185:6588">
        <p class="font-707 font-medium" data-node-id="185:6584">
          Page: {{ pageIndex + 1 }}
        </p>
        <p class="font-707 font-normal text-black/80" data-node-id="185:6585">
          {{ page.page_name || (pageIndex === 0 ? 'Landing Page' : 'Untitled Page') }}
        </p>
      </div>

      <!-- Duplicate & Delete Action Buttons (Figma Node 185:6587) -->
      <div class="content-stretch flex gap-[10px] items-center" data-node-id="185:6587">
        <!-- Duplicate Button (Figma Node 185:6573) -->
        <button 
          @click.stop="editorStore.duplicatePage(pageIndex)"
          class="apple-glass-icon-btn flex items-center justify-center rounded-[6px] size-[24px] cursor-pointer text-black"
          title="Duplicate Page"
          data-node-id="185:6573"
          data-name="Button"
        >
          <Copy class="w-[13px] h-[13px] stroke-[1.75]" />
        </button>

        <!-- Remove / Delete Button (Figma Node 185:6577) -->
        <button 
          @click.stop="editorStore.removePage(pageIndex)"
          :disabled="editorStore.pages.length <= 1"
          class="apple-glass-icon-btn hover:text-red-600 flex items-center justify-center rounded-[6px] size-[24px] cursor-pointer text-black disabled:opacity-30 disabled:cursor-not-allowed"
          title="Remove Page"
          data-node-id="185:6577"
          data-name="Button"
        >
          <Trash2 class="w-[13px] h-[13px] stroke-[1.75]" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { Copy, Trash2 } from 'lucide-vue-next';
import MobileArtboard from './MobileArtboard.vue';
import type { ActivationPage } from '../../types/editor.ts';

const props = defineProps<{
  page: ActivationPage;
  pageIndex: number;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: 'select', index: number): void;
  (e: 'open-edit', index: number): void;
}>();

const editorStore = useEditorStore();

const isDraggingThis = computed(() => {
  return editorStore.draggedPageIndex === props.pageIndex;
});

const isDragOver = computed(() => {
  return (
    editorStore.dragOverPageIndex === props.pageIndex &&
    editorStore.draggedPageIndex !== null &&
    editorStore.draggedPageIndex !== props.pageIndex
  );
});

const isDropBefore = computed(() => {
  if (editorStore.draggedPageIndex === null) return true;
  return editorStore.draggedPageIndex > props.pageIndex;
});

function handleDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', String(props.pageIndex));
    e.dataTransfer.effectAllowed = 'move';
  }
  editorStore.draggedPageIndex = props.pageIndex;
}

function handleDragOver(e: DragEvent) {
  if (editorStore.draggedPageIndex !== null) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (editorStore.dragOverPageIndex !== props.pageIndex) {
      editorStore.dragOverPageIndex = props.pageIndex;
    }
  }
}

function handleDragEnter(_e: DragEvent) {
  if (editorStore.draggedPageIndex !== null) {
    editorStore.dragOverPageIndex = props.pageIndex;
  }
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  const fromIndex = editorStore.draggedPageIndex ?? (e.dataTransfer ? parseInt(e.dataTransfer.getData('text/plain'), 10) : null);
  if (fromIndex !== null && !isNaN(fromIndex) && fromIndex !== props.pageIndex) {
    editorStore.movePage(fromIndex, props.pageIndex);
  }
  editorStore.draggedPageIndex = null;
  editorStore.dragOverPageIndex = null;
}

function handleDragEnd() {
  editorStore.draggedPageIndex = null;
  editorStore.dragOverPageIndex = null;
}

function handleSelect() {
  emit('select', props.pageIndex);
}

function handleDoubleClick() {
  emit('open-edit', props.pageIndex);
}
</script>
