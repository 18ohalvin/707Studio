<template>
  <!-- Choice Setup Sidebar Menu (Matching ButtonSetupSidebar.vue & TextSetupSidebar.vue) -->
  <aside 
    v-if="isOpen"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[20px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="276:4224"
    data-name="Choice Setup Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <ListChecks class="size-4 text-black stroke-[2]" />
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Choice Setup
          </p>
        </div>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-black/5 transition-colors"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Section 1: Question Title & Subtitle -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="w-full space-y-1">
        <label class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Question Title
        </label>
        <div class="border border-[#d4d4d4] focus-within:border-black flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="choiceTitle"
            placeholder="e.g. SELECT ARRIVALS"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
          />
        </div>
      </div>

      <div class="w-full space-y-1">
        <label class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Subtitle / Helper Instructions
        </label>
        <div class="border border-[#d4d4d4] focus-within:border-black flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="choiceSubtitle"
            placeholder="e.g. Choose your preferred attendance day below."
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Layout Style Preset (4 Figma Types) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Widget Layout Style
        </p>
        <span class="text-[11px] font-mono text-neutral-400">4 Types</span>
      </div>
      <div class="grid grid-cols-2 gap-[8px] w-full">
        <button 
          type="button"
          v-for="layout in layoutVariants"
          :key="layout.id"
          @click="setLayoutVariant(layout.id)"
          :class="currentVariant === layout.id ? 'apple-glass-btn-dark font-medium shadow-sm ring-1 ring-black' : 'apple-glass-btn'"
          class="flex flex-col items-start p-[10px] rounded-[8px] text-left cursor-pointer transition-all gap-1"
        >
          <div class="flex items-center gap-1.5">
            <component :is="layout.icon" class="size-3.5 stroke-[2]" />
            <span class="font-707 text-[12px] font-medium">{{ layout.label }}</span>
          </div>
          <p class="text-[10px] opacity-70 line-clamp-1 leading-tight font-707">
            {{ layout.description }}
          </p>
        </button>
      </div>
    </div>

    <!-- Section 3: Selection Behavior & Rules -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Selection Rules
      </p>

      <!-- Multi-select toggle -->
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <span class="font-707 text-[12px] font-medium text-black">Allow Multiple Choice</span>
          <span class="font-707 text-[11px] text-neutral-500">Users can pick more than one option</span>
        </div>
        <button 
          type="button"
          @click="toggleAllowMultiple"
          :class="allowMultiple ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'"
          class="w-[44px] h-[24px] rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer"
        >
          <div 
            :class="allowMultiple ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-white'"
            class="size-[20px] rounded-full shadow-sm transition-transform duration-200"
          />
        </button>
      </div>

      <!-- Required toggle -->
      <div class="flex items-center justify-between w-full pt-1 border-t border-[#f5f5f5]">
        <div class="flex flex-col">
          <span class="font-707 text-[12px] font-medium text-black">Required Field</span>
          <span class="font-707 text-[11px] text-neutral-500">Must select at least one before submit</span>
        </div>
        <button 
          type="button"
          @click="toggleRequired"
          :class="isRequired ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'"
          class="w-[44px] h-[24px] rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer"
        >
          <div 
            :class="isRequired ? 'translate-x-[20px] bg-white' : 'translate-x-0 bg-white'"
            class="size-[20px] rounded-full shadow-sm transition-transform duration-200"
          />
        </button>
      </div>
    </div>

    <!-- Section 4: Options List -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] px-[24px] shrink-0 w-full">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Options ({{ currentOptions.length }})
        </p>
        <button 
          type="button"
          @click="addNewOption"
          class="apple-glass-btn flex items-center gap-1 px-2.5 h-[28px] rounded-[6px] text-[11px] font-707 cursor-pointer hover:bg-black hover:text-white transition-colors"
        >
          <Plus class="size-3 stroke-[2.5]" />
          <span>Add Option</span>
        </button>
      </div>

      <!-- Option Items Stack -->
      <div class="flex flex-col gap-[10px] w-full">
        <div 
          v-for="(option, idx) in currentOptions" 
          :key="option.id"
          class="flex flex-col gap-2 p-3 bg-white border border-[#e5e5e5] rounded-[8px] transition-all hover:border-[#bbb] shadow-sm"
        >
          <!-- Option Header: Drag handle / index / Remove -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="font-mono text-[10px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded">
                #{{ idx + 1 }}
              </span>
              <span class="font-707 text-[11px] font-medium text-black">
                {{ option.label || 'Untitled Option' }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <!-- Move Up -->
              <button 
                type="button"
                v-if="idx > 0"
                @click="moveOption(idx, idx - 1)"
                class="size-6 flex items-center justify-center text-neutral-400 hover:text-black rounded hover:bg-neutral-100 cursor-pointer"
                title="Move up"
              >
                <ArrowUp class="size-3" />
              </button>
              <!-- Move Down -->
              <button 
                type="button"
                v-if="idx < currentOptions.length - 1"
                @click="moveOption(idx, idx + 1)"
                class="size-6 flex items-center justify-center text-neutral-400 hover:text-black rounded hover:bg-neutral-100 cursor-pointer"
                title="Move down"
              >
                <ArrowDown class="size-3" />
              </button>
              <!-- Remove -->
              <button 
                type="button"
                @click="removeOption(idx)"
                class="size-6 flex items-center justify-center text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                title="Delete option"
              >
                <Trash2 class="size-3" />
              </button>
            </div>
          </div>

          <!-- Option Inputs Grid -->
          <div class="grid grid-cols-2 gap-2 pt-1">
            <!-- Label -->
            <div class="flex flex-col gap-1">
              <span class="font-707 text-[10px] text-neutral-500">Label</span>
              <input 
                :value="option.label"
                @input="updateOptionField(idx, 'label', ($event.target as HTMLInputElement).value)"
                placeholder="Label"
                class="h-[30px] px-2 border border-[#d4d4d4] focus:border-black rounded-[6px] text-[12px] font-707 outline-none bg-[#fafafa] focus:bg-white"
              />
            </div>

            <!-- Secondary Text / Date / Stock -->
            <div class="flex flex-col gap-1">
              <span class="font-707 text-[10px] text-neutral-500">
                {{ currentVariant === 'arrivals-card' ? 'Date / Time' : 'Secondary Label' }}
              </span>
              <input 
                :value="option.secondaryLabel"
                @input="updateOptionField(idx, 'secondaryLabel', ($event.target as HTMLInputElement).value)"
                placeholder="Optional subtext"
                class="h-[30px] px-2 border border-[#d4d4d4] focus:border-black rounded-[6px] text-[12px] font-707 outline-none bg-[#fafafa] focus:bg-white"
              />
            </div>
          </div>

          <!-- Description (For Arrivals Card) -->
          <div v-if="currentVariant === 'arrivals-card'" class="flex flex-col gap-1 pt-1">
            <span class="font-707 text-[10px] text-neutral-500">Description Detail</span>
            <input 
              :value="option.description"
              @input="updateOptionField(idx, 'description', ($event.target as HTMLInputElement).value)"
              placeholder="e.g. Your Event Descriptions Detail"
              class="h-[30px] px-2 border border-[#d4d4d4] focus:border-black rounded-[6px] text-[12px] font-707 outline-none bg-[#fafafa] focus:bg-white"
            />
          </div>

          <!-- Image URL (For Image Grid) -->
          <div v-if="currentVariant === 'image-grid'" class="flex flex-col gap-1 pt-1">
            <span class="font-707 text-[10px] text-neutral-500">Image URL</span>
            <div class="flex items-center gap-2">
              <img 
                v-if="option.imageUrl"
                :src="option.imageUrl"
                class="size-7 rounded object-cover border border-black/10 shrink-0"
              />
              <input 
                :value="option.imageUrl"
                @input="updateOptionField(idx, 'imageUrl', ($event.target as HTMLInputElement).value)"
                placeholder="https://images.unsplash.com/..."
                class="h-[30px] px-2 flex-1 border border-[#d4d4d4] focus:border-black rounded-[6px] text-[11px] font-mono outline-none bg-[#fafafa] focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { ChoiceWidgetVariant, ChoiceOptionItem } from '../../types/editor.ts';
import { 
  ListChecks, 
  CreditCard, 
  AlignJustify, 
  LayoutGrid, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const activeWidget = computed(() => {
  if (editorStore.selectedWidget?.type === 'MultipleChoice') {
    return editorStore.selectedWidget;
  }
  return null;
});

const layoutVariants = [
  {
    id: 'arrivals-card' as ChoiceWidgetVariant,
    label: 'Detailed Cards',
    description: 'Header, date & description details',
    icon: CreditCard
  },
  {
    id: 'simple-row' as ChoiceWidgetVariant,
    label: 'Simple Rows',
    description: 'Minimal row list with checkmark',
    icon: AlignJustify
  },
  {
    id: 'horizontal-block' as ChoiceWidgetVariant,
    label: 'Session Blocks',
    description: 'Compact 2-column action tiles',
    icon: LayoutGrid
  },
  {
    id: 'image-grid' as ChoiceWidgetVariant,
    label: 'Image Grid',
    description: '4-column product/model matrix',
    icon: ImageIcon
  }
];

const choiceTitle = computed({
  get: () => activeWidget.value?.props?.title ?? 'SELECT ARRIVALS',
  set: (val: string) => {
    if (activeWidget.value) {
      editorStore.updateWidgetProps(activeWidget.value.id, { title: val });
    }
  }
});

const choiceSubtitle = computed({
  get: () => activeWidget.value?.props?.subtitle ?? 'Choose your preferred attendance day below.',
  set: (val: string) => {
    if (activeWidget.value) {
      editorStore.updateWidgetProps(activeWidget.value.id, { subtitle: val });
    }
  }
});

const currentVariant = computed<ChoiceWidgetVariant>(() => {
  return (activeWidget.value?.props?.variant as ChoiceWidgetVariant) || 'arrivals-card';
});

const allowMultiple = computed<boolean>(() => {
  return activeWidget.value?.props?.allowMultiple ?? true;
});

const isRequired = computed<boolean>(() => {
  return activeWidget.value?.props?.required ?? true;
});

const currentOptions = computed<ChoiceOptionItem[]>(() => {
  return activeWidget.value?.props?.options || [];
});

function setLayoutVariant(variant: ChoiceWidgetVariant) {
  if (!activeWidget.value) return;

  // Set default title & options if empty
  let updates: Record<string, any> = { variant };

  if (variant === 'arrivals-card' && (!choiceTitle.value || choiceTitle.value.startsWith('SELECT'))) {
    updates.title = 'SELECT ARRIVALS';
    updates.subtitle = 'Choose your preferred attendance day below.';
  } else if (variant === 'simple-row' && (!choiceTitle.value || choiceTitle.value.startsWith('SELECT'))) {
    updates.title = 'SELECT APPAREL SIZE';
    updates.subtitle = 'Choose your preferred size below.';
  } else if (variant === 'horizontal-block' && (!choiceTitle.value || choiceTitle.value.startsWith('SELECT'))) {
    updates.title = 'SELECT YOUR SESSIONS';
    updates.subtitle = 'Choose your preferred sessions below.';
  } else if (variant === 'image-grid' && (!choiceTitle.value || choiceTitle.value.startsWith('SELECT'))) {
    updates.title = 'SELECT YOUR MODEL';
    updates.subtitle = 'Choose your preferred model below.';
  }

  editorStore.updateWidgetProps(activeWidget.value.id, updates);
}

function toggleAllowMultiple() {
  if (!activeWidget.value) return;
  const nextVal = !allowMultiple.value;
  let updates: Record<string, any> = { allowMultiple: nextVal };
  // If switching to single select and multiple are selected, keep only first
  if (!nextVal && activeWidget.value.props.selectedIds?.length > 1) {
    updates.selectedIds = [activeWidget.value.props.selectedIds[0]];
  }
  editorStore.updateWidgetProps(activeWidget.value.id, updates);
}

function toggleRequired() {
  if (!activeWidget.value) return;
  editorStore.updateWidgetProps(activeWidget.value.id, { required: !isRequired.value });
}

function addNewOption() {
  if (!activeWidget.value) return;
  const count = currentOptions.value.length + 1;
  const newOption: ChoiceOptionItem = {
    id: `opt_${Date.now()}`,
    label: currentVariant.value === 'arrivals-card' ? `Day ${count}` : `Option ${count}`,
    secondaryLabel: currentVariant.value === 'arrivals-card' ? `${count} September 2026` : undefined,
    description: currentVariant.value === 'arrivals-card' ? 'Your Event Descriptions Detail' : undefined,
    imageUrl: currentVariant.value === 'image-grid' ? 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80' : undefined
  };
  const updated = [...currentOptions.value, newOption];
  editorStore.updateWidgetProps(activeWidget.value.id, { options: updated });
}

function removeOption(index: number) {
  if (!activeWidget.value) return;
  const optionId = currentOptions.value[index]?.id;
  const updated = currentOptions.value.filter((_, i) => i !== index);
  const selectedIds = (activeWidget.value.props.selectedIds || []).filter((id: string) => id !== optionId);
  editorStore.updateWidgetProps(activeWidget.value.id, { options: updated, selectedIds });
}

function moveOption(fromIndex: number, toIndex: number) {
  if (!activeWidget.value) return;
  const list = [...currentOptions.value];
  const item = list.splice(fromIndex, 1)[0];
  list.splice(toIndex, 0, item);
  editorStore.updateWidgetProps(activeWidget.value.id, { options: list });
}

function updateOptionField(index: number, field: keyof ChoiceOptionItem, value: string) {
  if (!activeWidget.value) return;
  const list = currentOptions.value.map((opt, i) => {
    if (i === index) {
      return { ...opt, [field]: value };
    }
    return opt;
  });
  editorStore.updateWidgetProps(activeWidget.value.id, { options: list });
}
</script>
