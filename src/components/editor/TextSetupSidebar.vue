<template>
  <!-- Text Setup Sidebar Menu (Figma Node 181:5929) -->
  <aside 
    v-if="isOpen"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[32px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="181:5929"
    data-name="Text Tool Sidebar"
  >
    <!-- Header -->
    <div class="content-stretch flex flex-col gap-[6px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]" data-node-id="181:5930">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full" data-node-id="181:5931">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap" data-node-id="181:5932">
          Text Setup
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 rounded-full flex items-center justify-center cursor-pointer"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500" data-node-id="181:5935">
        Configure typography, sizing, and alignment.
      </p>
    </div>

    <!-- Section 0: Text Content Input (Direct access from sidebar) -->
    <div class="content-stretch flex flex-col gap-[8px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Text Content
        </p>
        <span class="font-707 text-[11px] text-neutral-400">
          Syncs with canvas
        </span>
      </div>
      <div class="border border-[#aaa] focus-within:border-black border-solid flex min-h-[44px] h-auto items-center px-[14px] py-[8px] rounded-[8px] w-full bg-white transition-all shadow-sm">
        <textarea 
          ref="sidebarTextareaRef"
          v-model="textContent"
          rows="2"
          :placeholder="targetWidget?.props?.placeholder || 'WRITE YOUR TEXT HERE'"
          class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 resize-none bg-transparent leading-[20px] overflow-y-auto max-h-[140px] p-0 m-0"
        />
      </div>
    </div>

    <!-- Section 1: Typography Style (Figma Node 181:6024) -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0] overflow-visible" data-node-id="181:6024">
      <div class="content-stretch flex gap-[32px] items-center justify-between shrink-0 w-full overflow-visible" data-node-id="181:6025">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap shrink-0 w-[140px]" data-node-id="181:6026">
          Typography Style
        </p>
        <div class="relative flex-1" ref="dropdownRef">
          <button 
            type="button"
            @click="isDropdownOpen = !isDropdownOpen"
            class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-full cursor-pointer bg-white"
            data-node-id="181:6028"
          >
            <span class="font-707 font-normal text-[13px] leading-[18px] text-black whitespace-nowrap truncate" data-node-id="181:6029">
              {{ currentTypographyLabel }}
            </span>
            <ChevronDown 
              class="w-4 h-4 text-black transition-transform duration-150 shrink-0 ml-2" 
              :class="isDropdownOpen ? 'rotate-180' : ''" 
            />
          </button>

          <!-- Dropdown Options Menu -->
          <div 
            v-if="isDropdownOpen"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] z-50 overflow-y-auto max-h-[260px] py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button 
              v-for="opt in typographyOptions"
              :key="opt.id"
              @click="selectTypography(opt.id)"
              :class="currentTypographyId === opt.id ? 'bg-black/5 font-medium text-black' : 'text-neutral-700 hover:bg-black/5'"
              class="w-full text-left px-4 py-2 text-[13px] font-707 flex items-center justify-between transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0"
            >
              <div class="flex flex-col">
                <span :class="opt.previewClass">{{ opt.label }}</span>
                <span class="text-[10px] text-neutral-400 font-normal">{{ opt.desc }}</span>
              </div>
              <span class="text-[11px] text-neutral-400 font-mono shrink-0 ml-2">{{ opt.size }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: Text Alignment (Figma Node 181:6033) -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full" data-node-id="181:6033">
      <div class="content-stretch flex gap-[32px] items-center justify-between shrink-0 w-full" data-node-id="181:6059">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap shrink-0 w-[140px]" data-node-id="181:6060">
          Text Alignment
        </p>
        <div class="flex items-center gap-[12px] shrink-0" data-node-id="181:6061">
          <!-- Align Left -->
          <button 
            @click="setAlignment('left')"
            :class="currentAlignment === 'left' ? 'apple-glass-btn-dark' : 'apple-glass-btn'"
            class="size-[32px] rounded-[8px] flex items-center justify-center cursor-pointer"
            title="Align Left"
            data-node-id="181:6062"
          >
            <AlignLeft class="w-4 h-4" />
          </button>

          <!-- Align Center -->
          <button 
            @click="setAlignment('center')"
            :class="currentAlignment === 'center' ? 'apple-glass-btn-dark' : 'apple-glass-btn'"
            class="size-[32px] rounded-[8px] flex items-center justify-center cursor-pointer"
            title="Align Center"
            data-node-id="181:6066"
          >
            <AlignCenter class="w-4 h-4" />
          </button>

          <!-- Align Right -->
          <button 
            @click="setAlignment('right')"
            :class="currentAlignment === 'right' ? 'apple-glass-btn-dark' : 'apple-glass-btn'"
            class="size-[32px] rounded-[8px] flex items-center justify-center cursor-pointer"
            title="Align Right"
            data-node-id="181:6071"
          >
            <AlignRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { ChevronDown, AlignLeft, AlignCenter, AlignRight } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const sidebarTextareaRef = ref<HTMLTextAreaElement | null>(null);

const textContent = computed({
  get: () => targetWidget.value?.props?.text || '',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { text: val });
    }
  }
});

const typographyOptions = [
  { id: 'headline-1', label: 'Headline 1', size: '32px', desc: 'Display title / primary punchy headline', previewClass: 'font-medium' },
  { id: 'heading-2', label: 'Heading 2', size: '22px', desc: 'Section header / secondary headline', previewClass: 'font-medium' },
  { id: 'heading-3', label: 'Heading 3', size: '18px', desc: 'Sub-section heading', previewClass: 'font-medium' },
  { id: 'subtext-lead', label: 'Subtext Lead', size: '16px', desc: 'Introductory lead text / bold subheader', previewClass: 'font-medium' },
  { id: 'body-text', label: 'Body Text', size: '12px', desc: 'Standard readable paragraph body text', previewClass: 'font-normal text-[12px]' },
  { id: 'body-text-medium', label: 'Body Text (Medium)', size: '12px', desc: 'Emphasized body copy / subheadings', previewClass: 'font-medium text-[12px]' },
  { id: 'caption', label: 'Caption', size: '11px', desc: 'Secondary annotations and instructions', previewClass: 'font-normal text-[11px]' },
  { id: 'legal-micro', label: 'Legal / Micro', size: '11px', desc: 'Footnotes, terms, and micro meta', previewClass: 'font-normal text-[11px] text-neutral-500' }
];

const targetWidget = computed(() => {
  if (editorStore.selectedWidget && editorStore.selectedWidget.type === 'TextBanner') {
    return editorStore.selectedWidget;
  }
  // Fallback to first TextBanner widget if none currently selected
  return editorStore.currentPage.widget_tree.find(w => w.type === 'TextBanner') || null;
});

const currentTypographyId = computed(() => {
  return targetWidget.value?.props?.typographyStyle || 'headline-1';
});

const currentTypographyLabel = computed(() => {
  const opt = typographyOptions.find(o => o.id === currentTypographyId.value);
  return opt ? opt.label : 'Headline 1';
});

const currentAlignment = computed(() => {
  return targetWidget.value?.props?.textAlign || 'left';
});

function selectTypography(id: string) {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { typographyStyle: id });
  }
  isDropdownOpen.value = false;
}

function setAlignment(align: 'left' | 'center' | 'right') {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { textAlign: align });
  }
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
