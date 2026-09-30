<template>
  <!-- Choice Setup Sidebar Drawer (Matching 707 Global UI Style & Apple Glass Standards) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="276:4224"
    data-name="Choice Setup Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Choice Setup
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Section 1: Title & Subtitle Input (Figma Node 276:4224) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Widget Title
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="title"
            placeholder="e.g. SELECT ARRIVALS"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>

      <!-- Title Typography Preset Dropdown -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Title Font Style
        </p>
        <div class="relative w-full" ref="titleDropdownRef">
          <button 
            type="button"
            @click="isTitleDropdownOpen = !isTitleDropdownOpen"
            class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-full cursor-pointer bg-white"
          >
            <span class="font-707 font-normal text-[12px] leading-[18px] text-black whitespace-nowrap truncate">
              {{ currentTitleTypographyLabel }}
            </span>
            <ChevronDown 
              class="w-4 h-4 text-black transition-transform duration-150 shrink-0 ml-2" 
              :class="isTitleDropdownOpen ? 'rotate-180' : ''" 
            />
          </button>

          <!-- Dropdown Options Menu -->
          <div 
            v-if="isTitleDropdownOpen"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] z-50 overflow-y-auto max-h-[220px] py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button 
              v-for="opt in typographyOptions"
              :key="opt.id"
              @click="selectTitleTypography(opt.id)"
              :class="currentTitleTypographyId === opt.id ? 'bg-black/5 font-medium text-black' : 'text-neutral-700 hover:bg-black/5'"
              class="w-full text-left px-4 py-2 text-[12px] font-707 flex items-center justify-between transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0"
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

      <!-- Subtitle (Uses Body Text style 12px) -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Subtitle Text
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            Body Text (12px)
          </span>
        </div>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="subtitle"
            placeholder="e.g. Choose your preferred attendance day below."
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Option Tile Font Style Preset -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Option Tile Font Style
        </p>
        <div class="relative w-full" ref="optionDropdownRef">
          <button 
            type="button"
            @click="isOptionDropdownOpen = !isOptionDropdownOpen"
            class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-full cursor-pointer bg-white"
          >
            <span class="font-707 font-normal text-[12px] leading-[18px] text-black whitespace-nowrap truncate">
              {{ currentOptionTypographyLabel }}
            </span>
            <ChevronDown 
              class="w-4 h-4 text-black transition-transform duration-150 shrink-0 ml-2" 
              :class="isOptionDropdownOpen ? 'rotate-180' : ''" 
            />
          </button>

          <!-- Dropdown Options Menu -->
          <div 
            v-if="isOptionDropdownOpen"
            class="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_4px_20px_rgba(0,0,0,0.12)] z-50 overflow-y-auto max-h-[220px] py-1 animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button 
              v-for="opt in typographyOptions"
              :key="opt.id"
              @click="selectOptionTypography(opt.id)"
              :class="currentOptionTypographyId === opt.id ? 'bg-black/5 font-medium text-black' : 'text-neutral-700 hover:bg-black/5'"
              class="w-full text-left px-4 py-2 text-[12px] font-707 flex items-center justify-between transition-colors cursor-pointer border-b border-neutral-100 last:border-b-0"
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

    <!-- Section 3: Style Presets (4 Figma Variants) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Choice Style Variant
      </p>
      <div class="flex flex-wrap gap-[8px] items-center w-full">
        <button 
          v-for="v in variants" 
          :key="v.id"
          type="button"
          @click="setVariant(v.id)"
          :class="variant === v.id ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="shrink-0 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer transition-all"
        >
          {{ v.label }}
        </button>
      </div>
    </div>

    <!-- Section 4: Selection Mode & Required Rules -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Selection Rule
        </p>
        <div class="flex gap-[6px] items-center">
          <button 
            type="button"
            @click="setAllowMultiple(true)"
            :class="allowMultiple ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Multiple
          </button>
          <button 
            type="button"
            @click="setAllowMultiple(false)"
            :class="!allowMultiple ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Single
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Required Field
        </p>
        <div class="flex gap-[6px] items-center">
          <button 
            type="button"
            @click="setRequired(false)"
            :class="!required ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Optional
          </button>
          <button 
            type="button"
            @click="setRequired(true)"
            :class="required ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Required
          </button>
        </div>
      </div>
    </div>

    <!-- Section 5: Options Manager -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Options ({{ options.length }})
        </p>
        <button 
          type="button"
          @click="addOption"
          class="apple-glass-btn px-2.5 h-[28px] rounded-[6px] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
        >
          <Plus class="w-3 h-3" />
          <span>Add Option</span>
        </button>
      </div>

      <!-- Options items list -->
      <div class="flex flex-col gap-[10px] w-full">
        <div 
          v-for="(opt, idx) in options" 
          :key="opt.id"
          class="flex flex-col gap-2 p-3 bg-white rounded-[8px] border border-[#d9d9d9] shadow-sm transition-all group"
        >
          <!-- Top Row: Order Index, Label Input, Default Selected Checkbox, and Delete -->
          <div class="flex items-center gap-2 w-full">
            <span class="size-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[10px] text-neutral-500 font-bold shrink-0">
              {{ idx + 1 }}
            </span>

            <div class="border border-[#ccc] focus-within:border-black rounded-[6px] px-2 h-[32px] flex items-center flex-1 bg-white">
              <input 
                v-model="opt.label"
                placeholder="Option Title (e.g. Day 1, S, Morning)"
                class="w-full font-707 text-[12px] font-medium text-black focus:outline-none"
              />
            </div>

            <!-- Default Selected Toggle Button -->
            <button 
              type="button"
              @click="toggleOptionSelected(opt.id)"
              :class="isOptionSelected(opt.id) ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400 hover:text-black'"
              class="size-[32px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors border border-black/10 shrink-0"
              title="Toggle Pre-selected state"
            >
              <Check class="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <!-- Delete Option -->
            <button 
              type="button"
              @click="removeOption(idx)"
              :disabled="options.length <= 1"
              :class="options.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-600 hover:bg-red-50 text-neutral-400 cursor-pointer'"
              class="size-[32px] rounded-[6px] flex items-center justify-center transition-colors shrink-0"
              title="Remove Option"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Variant Specific Fields -->
          <!-- Sublabel / Date field (for detailed-card) -->
          <div v-if="variant === 'detailed-card'" class="flex items-center gap-2 pl-7">
            <div class="border border-[#ccc] focus-within:border-black rounded-[6px] px-2 h-[30px] flex items-center w-full bg-white">
              <input 
                v-model="opt.sublabel"
                placeholder="Date / Sublabel (e.g. 2 September 2026)"
                class="w-full font-707 text-[11px] text-neutral-700 focus:outline-none"
              />
            </div>
          </div>

          <!-- Description field (for detailed-card) -->
          <div v-if="variant === 'detailed-card'" class="pl-7">
            <textarea 
              v-model="opt.description"
              rows="2"
              placeholder="Event Description Detail..."
              class="w-full font-707 text-[11px] text-neutral-700 focus:outline-none border border-[#ccc] focus:border-black rounded-[6px] p-1.5 resize-none leading-relaxed bg-white"
            />
          </div>

          <!-- Image URL field (for image-grid) -->
          <div v-if="variant === 'image-grid'" class="flex items-center gap-2 pl-7">
            <div class="size-8 rounded border border-neutral-300 overflow-hidden bg-[#ededed] shrink-0 flex items-center justify-center">
              <img 
                v-if="opt.imageUrl" 
                :src="opt.imageUrl" 
                class="w-full h-full object-cover" 
                alt="Shoe Preview" 
              />
              <ImageIcon v-else class="w-4 h-4 text-neutral-400" />
            </div>
            <div class="border border-[#ccc] focus-within:border-black rounded-[6px] px-2 h-[30px] flex items-center flex-1 bg-white">
              <input 
                v-model="opt.imageUrl"
                placeholder="Image URL (https://...)"
                class="w-full font-707 text-[11px] text-neutral-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Add Option Button -->
      <button 
        type="button"
        @click="addOption"
        class="w-full h-[36px] rounded-[8px] border border-dashed border-[#aaa] hover:border-black text-neutral-600 hover:text-black font-707 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/50"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Option</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { ChoiceVariant, ChoiceOption } from '../../types/editor.ts';
import { 
  Plus, 
  Trash2, 
  Check, 
  ChevronDown,
  Image as ImageIcon 
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);
const titleDropdownRef = ref<HTMLElement | null>(null);
const optionDropdownRef = ref<HTMLElement | null>(null);
const isTitleDropdownOpen = ref(false);
const isOptionDropdownOpen = ref(false);

const typographyOptions = [
  { id: 'headline-1', label: 'Headline 1', size: '32px', desc: 'Display title / primary punchy headline', previewClass: 'font-medium text-[15px]' },
  { id: 'heading-2', label: 'Heading 2', size: '22px', desc: 'Section header / secondary headline', previewClass: 'font-medium text-[14px]' },
  { id: 'heading-3', label: 'Heading 3', size: '18px', desc: 'Sub-section heading', previewClass: 'font-medium text-[13px]' },
  { id: 'subtext-lead', label: 'Subtext Lead', size: '16px', desc: 'Introductory lead text / bold subheader', previewClass: 'font-medium text-[13px]' },
  { id: 'body-text', label: 'Body Text', size: '12px', desc: 'Standard readable paragraph body text', previewClass: 'font-normal text-[12px]' },
  { id: 'body-text-medium', label: 'Body Text (Medium)', size: '12px', desc: 'Emphasized body copy / tile labels', previewClass: 'font-medium text-[12px]' },
  { id: 'caption', label: 'Caption', size: '11px', desc: 'Secondary annotations and instructions', previewClass: 'font-normal text-[11px]' },
  { id: 'legal-micro', label: 'Legal / Micro', size: '11px', desc: 'Footnotes, terms, and micro meta', previewClass: 'font-normal text-[11px] text-neutral-500' }
];

const variants: { id: ChoiceVariant; label: string }[] = [
  { id: 'detailed-card', label: 'Detailed Cards' },
  { id: 'simple-row', label: 'Simple Rows' },
  { id: 'horizontal-block', label: 'Horizontal Blocks' },
  { id: 'image-grid', label: 'Image Matrix' }
];

const currentWidget = computed(() => {
  if (!editorStore.selectedWidgetId) return null;
  const w = editorStore.selectedWidget;
  if (!w || w.type !== 'MultipleChoice') return null;
  return w;
});

const title = computed({
  get: () => currentWidget.value?.props.title || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { title: val });
    }
  }
});

const currentTitleTypographyId = computed(() => {
  return currentWidget.value?.props.titleTypographyStyle || currentWidget.value?.props.typographyStyle || 'heading-3';
});

const currentTitleTypographyLabel = computed(() => {
  const opt = typographyOptions.find(o => o.id === currentTitleTypographyId.value);
  return opt ? opt.label : 'Heading 3 (18px)';
});

function selectTitleTypography(id: string) {
  if (currentWidget.value) {
    editorStore.updateWidgetProps(currentWidget.value.id, { 
      titleTypographyStyle: id,
      typographyStyle: id 
    });
  }
  isTitleDropdownOpen.value = false;
}

const currentOptionTypographyId = computed(() => {
  return currentWidget.value?.props.optionTypographyStyle || 'body-text-medium';
});

const currentOptionTypographyLabel = computed(() => {
  const opt = typographyOptions.find(o => o.id === currentOptionTypographyId.value);
  return opt ? opt.label : 'Body Text (Medium) (12px)';
});

function selectOptionTypography(id: string) {
  if (currentWidget.value) {
    editorStore.updateWidgetProps(currentWidget.value.id, { optionTypographyStyle: id });
  }
  isOptionDropdownOpen.value = false;
}

const subtitle = computed({
  get: () => currentWidget.value?.props.subtitle || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { subtitle: val });
    }
  }
});

const variant = computed<ChoiceVariant>({
  get: () => (currentWidget.value?.props.variant as ChoiceVariant) || 'detailed-card',
  set: (val: ChoiceVariant) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { variant: val });
    }
  }
});

const allowMultiple = computed({
  get: () => currentWidget.value?.props.allowMultiple ?? true,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { allowMultiple: val });
    }
  }
});

const required = computed({
  get: () => currentWidget.value?.props.required ?? false,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { required: val });
    }
  }
});

const options = computed<ChoiceOption[]>({
  get: () => currentWidget.value?.props.options || [],
  set: (val: ChoiceOption[]) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { options: val });
    }
  }
});

function setVariant(v: ChoiceVariant) {
  variant.value = v;
  if (!currentWidget.value) return;

  // Preset matching defaults if switching to standard Figma styles
  if (v === 'detailed-card' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT APPAREL SIZE' || currentWidget.value.props.title === 'SELECT YOUR SESSIONS' || currentWidget.value.props.title === 'SELECT YOUR MODEL')) {
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT ARRIVALS',
      subtitle: 'Choose your preferred attendance day below.',
      options: [
        { id: 'opt_1', label: 'Day 1', sublabel: '2 September 2026', description: 'Your Event Descriptions Detail' },
        { id: 'opt_2', label: 'Day 2', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail' }
      ]
    });
  } else if (v === 'simple-row' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT ARRIVALS')) {
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT APPAREL SIZE',
      subtitle: 'Choose your preferred size below.',
      options: [
        { id: 'opt_1', label: 'S' },
        { id: 'opt_2', label: 'M' },
        { id: 'opt_3', label: 'L' }
      ]
    });
  } else if (v === 'horizontal-block' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT ARRIVALS' || currentWidget.value.props.title === 'SELECT APPAREL SIZE')) {
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT YOUR SESSIONS',
      subtitle: 'Choose your preferred sessions below.',
      options: [
        { id: 'opt_1', label: 'Morning' },
        { id: 'opt_2', label: 'Afternoon' }
      ]
    });
  } else if (v === 'image-grid' && (!currentWidget.value.props.title || currentWidget.value.props.title === 'SELECT ARRIVALS' || currentWidget.value.props.title === 'SELECT APPAREL SIZE' || currentWidget.value.props.title === 'SELECT YOUR SESSIONS')) {
    const defaultImages = [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80'
    ];
    editorStore.updateWidgetProps(currentWidget.value.id, {
      title: 'SELECT YOUR MODEL',
      subtitle: 'Choose your preferred model below.',
      options: [
        { id: 'opt_1', label: 'Model 01', imageUrl: defaultImages[0] },
        { id: 'opt_2', label: 'Model 02', imageUrl: defaultImages[1] },
        { id: 'opt_3', label: 'Model 03', imageUrl: defaultImages[2] }
      ]
    });
  }
}

function setAllowMultiple(val: boolean) {
  allowMultiple.value = val;
  if (!val && currentWidget.value) {
    const selected = (currentWidget.value.props.selectedValues || []) as string[];
    if (selected.length > 1) {
      editorStore.updateWidgetProps(currentWidget.value.id, { selectedValues: [selected[0]] });
    }
  }
}

function setRequired(val: boolean) {
  required.value = val;
}

function isOptionSelected(id: string): boolean {
  if (!currentWidget.value) return false;
  const selected = (currentWidget.value.props.selectedValues || []) as string[];
  return selected.includes(id);
}

function toggleOptionSelected(id: string) {
  if (!currentWidget.value) return;
  let selected = [...((currentWidget.value.props.selectedValues || []) as string[])];
  
  if (selected.includes(id)) {
    selected = selected.filter(x => x !== id);
  } else {
    if (allowMultiple.value) {
      selected.push(id);
    } else {
      selected = [id];
    }
  }
  editorStore.updateWidgetProps(currentWidget.value.id, { selectedValues: selected });
}

function addOption() {
  if (!currentWidget.value) return;
  const currentOptions = [...(currentWidget.value.props.options || [])];
  const nextNum = currentOptions.length + 1;
  
  let newOption: ChoiceOption = {
    id: `opt_${Date.now()}`,
    label: `Option ${nextNum}`
  };

  if (variant.value === 'detailed-card') {
    newOption = {
      id: `opt_${Date.now()}`,
      label: `Day ${nextNum}`,
      sublabel: `${nextNum + 1} September 2026`,
      description: 'Your Event Descriptions Detail'
    };
  } else if (variant.value === 'simple-row') {
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    newOption = {
      id: `opt_${Date.now()}`,
      label: sizes[nextNum - 1] || `Option ${nextNum}`
    };
  } else if (variant.value === 'horizontal-block') {
    const sessions = ['Morning', 'Afternoon', 'Evening', 'Night'];
    newOption = {
      id: `opt_${Date.now()}`,
      label: sessions[nextNum - 1] || `Session ${nextNum}`
    };
  } else if (variant.value === 'image-grid') {
    const defaultImages = [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80'
    ];
    newOption = {
      id: `opt_${Date.now()}`,
      label: `Model 0${nextNum}`,
      imageUrl: defaultImages[(nextNum - 1) % defaultImages.length]
    };
  }

  currentOptions.push(newOption);
  editorStore.updateWidgetProps(currentWidget.value.id, { options: currentOptions });
}

function removeOption(index: number) {
  if (!currentWidget.value) return;
  const currentOptions = [...(currentWidget.value.props.options || [])];
  if (currentOptions.length <= 1) return;
  
  const removed = currentOptions.splice(index, 1)[0];
  let selected = ((currentWidget.value.props.selectedValues || []) as string[]).filter(id => id !== removed.id);
  
  editorStore.updateWidgetProps(currentWidget.value.id, { 
    options: currentOptions,
    selectedValues: selected
  });
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node;
  if (titleDropdownRef.value && !titleDropdownRef.value.contains(target)) {
    isTitleDropdownOpen.value = false;
  }
  if (optionDropdownRef.value && !optionDropdownRef.value.contains(target)) {
    isOptionDropdownOpen.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
