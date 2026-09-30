<template>
  <!-- Choice Setup Sidebar Drawer (Matching Apple Glass Style & 707 Standards) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="276:4224"
    data-name="Choice Setup Sidebar"
  >
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <ListChecks class="w-4 h-4 text-black" />
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Choice Setup
          </p>
        </div>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Section 1: Title & Subtitle -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Title
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="title"
            placeholder="e.g. SELECT ARRIVALS"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>

      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Subtitle
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="subtitle"
            placeholder="e.g. Select one or more options"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Style Preset Variants (4 Variants from Figma 276:4224) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Choice Style Variant
      </p>
      <div class="grid grid-cols-2 gap-[8px] w-full">
        <button 
          v-for="v in variants"
          :key="v.id"
          type="button"
          @click="setVariant(v.id)"
          :class="variant === v.id ? 'apple-glass-btn-dark font-medium shadow-sm ring-1 ring-black' : 'apple-glass-btn'"
          class="flex flex-col items-start gap-1 p-[12px] rounded-[8px] text-[12px] font-707 cursor-pointer transition-all text-left"
        >
          <div class="flex items-center gap-2">
            <component :is="v.icon" class="size-3.5 shrink-0" />
            <span class="font-semibold">{{ v.label }}</span>
          </div>
          <span class="text-[10px] opacity-70 leading-tight">{{ v.desc }}</span>
        </button>
      </div>
    </div>

    <!-- Section 3: Behavior & Selection Settings -->
    <div class="content-stretch flex flex-col gap-[12px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Selection Rules
      </p>
      
      <!-- Multi-select toggle -->
      <div class="flex items-center justify-between w-full bg-white/60 p-3 rounded-[8px] border border-[#e5e5e5]">
        <div class="flex flex-col">
          <span class="font-707 font-medium text-[13px] text-black">Multiple Selections</span>
          <span class="font-707 text-[11px] text-neutral-500">Allow users to select more than one answer</span>
        </div>
        <button 
          type="button"
          @click="toggleAllowMultiple"
          :class="allowMultiple ? 'bg-black text-white' : 'bg-[#e5e5e5] text-neutral-600'"
          class="w-[44px] h-[24px] rounded-full flex items-center p-0.5 transition-colors cursor-pointer relative"
        >
          <div 
            :class="allowMultiple ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-white'"
            class="size-[20px] rounded-full shadow-sm transition-transform duration-200 ease-out"
          />
        </button>
      </div>

      <!-- Required Field toggle -->
      <div class="flex items-center justify-between w-full bg-white/60 p-3 rounded-[8px] border border-[#e5e5e5]">
        <div class="flex flex-col">
          <span class="font-707 font-medium text-[13px] text-black">Required Choice</span>
          <span class="font-707 text-[11px] text-neutral-500">Form cannot be submitted without selecting</span>
        </div>
        <button 
          type="button"
          @click="toggleRequired"
          :class="required ? 'bg-black text-white' : 'bg-[#e5e5e5] text-neutral-600'"
          class="w-[44px] h-[24px] rounded-full flex items-center p-0.5 transition-colors cursor-pointer relative"
        >
          <div 
            :class="required ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-white'"
            class="size-[20px] rounded-full shadow-sm transition-transform duration-200 ease-out"
          />
        </button>
      </div>
    </div>

    <!-- Section 4: Options Manager -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Options List ({{ options.length }})
        </p>
        <button 
          type="button"
          @click="addOption"
          class="apple-glass-btn px-2.5 py-1 rounded-[6px] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
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
          <!-- Top Row: Order badge, label input, Default Checked, and Delete -->
          <div class="flex items-center gap-2 w-full">
            <span class="size-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[10px] text-neutral-500 font-bold shrink-0">
              {{ idx + 1 }}
            </span>

            <input 
              v-model="opt.label"
              placeholder="Option Title / Label"
              class="flex-1 font-707 text-[13px] font-medium text-black focus:outline-none border-b border-transparent focus:border-black pb-0.5 transition-colors"
            />

            <!-- Default Selected Toggle -->
            <button 
              type="button"
              @click="toggleOptionSelected(opt.id)"
              :class="isOptionSelected(opt.id) ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400 hover:text-black'"
              class="size-6 rounded-[4px] flex items-center justify-center cursor-pointer transition-colors border border-black/10 shrink-0"
              title="Toggle Default Selected state"
            >
              <Check class="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <!-- Delete Option -->
            <button 
              type="button"
              @click="removeOption(idx)"
              :disabled="options.length <= 1"
              :class="options.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-600 hover:bg-red-50 text-neutral-400 cursor-pointer'"
              class="size-6 rounded-[4px] flex items-center justify-center transition-colors shrink-0"
              title="Remove Option"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Variant Specific Fields -->
          <!-- Sublabel / Date field (useful for detailed-card) -->
          <div v-if="variant === 'detailed-card'" class="flex items-center gap-2 pl-7">
            <input 
              v-model="opt.sublabel"
              placeholder="Sublabel / Date (e.g. 24 Oct 2026)"
              class="w-full font-707 text-[11px] text-neutral-600 focus:outline-none border-b border-neutral-200 focus:border-black pb-0.5"
            />
          </div>

          <!-- Description field (useful for detailed-card) -->
          <div v-if="variant === 'detailed-card'" class="pl-7">
            <textarea 
              v-model="opt.description"
              rows="2"
              placeholder="Description text..."
              class="w-full font-707 text-[11px] text-neutral-600 focus:outline-none border border-neutral-200 focus:border-black rounded-[4px] p-1.5 resize-none leading-tight"
            />
          </div>

          <!-- Image URL field (for image-grid) -->
          <div v-if="variant === 'image-grid'" class="flex items-center gap-2 pl-7">
            <div class="size-8 rounded border border-neutral-200 overflow-hidden bg-neutral-100 shrink-0 flex items-center justify-center">
              <img 
                v-if="opt.imageUrl" 
                :src="opt.imageUrl" 
                class="w-full h-full object-cover" 
                alt="Option Preview" 
              />
              <ImageIcon v-else class="w-4 h-4 text-neutral-400" />
            </div>
            <input 
              v-model="opt.imageUrl"
              placeholder="Image URL (https://...)"
              class="flex-1 font-707 text-[11px] text-neutral-600 focus:outline-none border-b border-neutral-200 focus:border-black pb-0.5"
            />
          </div>
        </div>
      </div>

      <!-- Quick Add Option Button at bottom -->
      <button 
        type="button"
        @click="addOption"
        class="w-full py-2 rounded-[8px] border border-dashed border-[#aaa] hover:border-black text-neutral-600 hover:text-black font-707 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/50"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Another Option</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { ChoiceVariant, ChoiceOption } from '../../types/editor.ts';
import { 
  ListChecks, 
  Layers, 
  AlignJustify, 
  LayoutGrid, 
  Plus, 
  Trash2, 
  Check, 
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

const variants: { id: ChoiceVariant; label: string; desc: string; icon: any }[] = [
  { 
    id: 'detailed-card', 
    label: 'Detailed Cards', 
    desc: 'Checkbox + title, date & description', 
    icon: Layers 
  },
  { 
    id: 'simple-row', 
    label: 'Simple Rows', 
    desc: '56px clean rows with checkbox & label', 
    icon: AlignJustify 
  },
  { 
    id: 'horizontal-block', 
    label: 'Horizontal Blocks', 
    desc: 'Side-by-side blocks (S, M, L, XL)', 
    icon: LayoutGrid 
  },
  { 
    id: 'image-grid', 
    label: 'Image Matrix', 
    desc: '4-column product & model tiles', 
    icon: LayoutGrid 
  }
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
}

function toggleAllowMultiple() {
  allowMultiple.value = !allowMultiple.value;
  // If switched to single select and multiple are selected, keep only the first selected
  if (!allowMultiple.value && currentWidget.value) {
    const selected = (currentWidget.value.props.selectedValues || []) as string[];
    if (selected.length > 1) {
      editorStore.updateWidgetProps(currentWidget.value.id, { selectedValues: [selected[0]] });
    }
  }
}

function toggleRequired() {
  required.value = !required.value;
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
      label: `Pass Option ${nextNum}`,
      sublabel: `${23 + nextNum} Oct 2026`,
      description: 'Access to activation area and special event lounge'
    };
  } else if (variant.value === 'image-grid') {
    const defaultImages = [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300&q=80'
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
</script>
