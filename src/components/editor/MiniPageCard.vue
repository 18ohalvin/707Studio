<template>
  <!-- Mini Page Card Container (Figma Node 185:6590) -->
  <div class="relative flex flex-col items-center select-none">
    <!-- Scaled-down Mini Card Phone Frame (Figma Node 185:6541 / 185:6562) -->
    <div 
      @click="handleSelect"
      @dblclick="handleDoubleClick"
      class="w-[138.6px] h-[277.2px] bg-[#f5f5f5] relative flex flex-col overflow-hidden cursor-pointer shrink-0 rounded-none apple-card-hover"
      :class="[
        isSelected 
          ? 'border-[0.5px] border-black shadow-[0px_16px_40px_rgba(0,0,0,0.15)]' 
          : 'border-[0.5px] border-black/15 shadow-[0px_4px_24px_rgba(0,0,0,0.06)] hover:border-black/30'
      ]"
      data-node-id="185:6562"
      data-name="Template Container"
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
      v-if="isSelected"
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

function handleSelect() {
  emit('select', props.pageIndex);
}

function handleDoubleClick() {
  emit('open-edit', props.pageIndex);
}
</script>
