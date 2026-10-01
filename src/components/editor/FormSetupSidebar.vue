<template>
  <!-- Registration Form Setup Sidebar Drawer (Matching 707 Global UI Style & Apple Glass Standards) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-name="Registration Form Setup Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Form Section Setup
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500 mt-1">
        Configure the registration form header and input fields stack.
      </p>
    </div>

    <!-- Section 1: Title & Subtitle Input -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Widget Title
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="title"
            placeholder="e.g. REGISTRATION FORM"
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

      <!-- Subtitle -->
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
            placeholder="e.g. Fill in your details below to register."
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Form Fields Manager -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Form Fields Stack ({{ fields.length }})
        </p>
        <span class="font-707 text-[11px] text-neutral-400">
          Reorder & toggle required
        </span>
      </div>

      <!-- Fields List -->
      <div class="flex flex-col gap-[8px] w-full">
        <div 
          v-for="(field, index) in fields"
          :key="field.id"
          class="flex items-center gap-2 p-2.5 rounded-[8px] bg-white border border-black/8 hover:border-black/20 transition-all shadow-sm"
        >
          <!-- Drag Handle Grip -->
          <div class="text-neutral-400 hover:text-black shrink-0 cursor-grab">
            <GripVertical class="size-4" />
          </div>

          <!-- Field Name / Label & Type Indicator -->
          <div class="flex-1 min-w-0 flex flex-col gap-0.5">
            <input 
              v-model="field.name"
              @input="updateFieldLabel(index, field.name)"
              class="font-707 font-medium text-[13px] text-black bg-transparent outline-none border-b border-transparent focus:border-black/30 transition-colors w-full"
              placeholder="Field Label"
            />
            <div class="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
              <span class="uppercase tracking-wider">{{ field.type || 'text' }}</span>
              <span v-if="field.type === 'tel'" class="text-neutral-500 font-sans">({{ field.countryCode || '+62' }})</span>
            </div>
          </div>

          <!-- Required Toggle (Apple Switch) -->
          <div class="flex items-center gap-1.5 shrink-0 px-1">
            <span class="font-707 text-[10px] text-neutral-500 uppercase tracking-tight">Req</span>
            <button 
              type="button"
              @click="toggleFieldRequired(index)"
              class="w-7 h-4 rounded-full transition-colors relative cursor-pointer"
              :class="field.required !== false ? 'bg-black' : 'bg-neutral-300'"
            >
              <div 
                class="size-3 rounded-full bg-white absolute top-0.5 transition-transform"
                :class="field.required !== false ? 'right-0.5' : 'left-0.5'"
              />
            </button>
          </div>

          <!-- Delete Field Button -->
          <button 
            type="button"
            @click="removeField(index)"
            :disabled="fields.length <= 1"
            class="size-7 rounded-[6px] text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Remove Field"
          >
            <Trash2 class="size-3.5" />
          </button>
        </div>
      </div>

      <!-- Add Preset Field Buttons -->
      <div class="flex flex-col gap-[8px] w-full pt-2">
        <p class="font-707 text-[11px] text-neutral-500 font-medium uppercase tracking-wider">
          + Add Preset Field
        </p>
        <div class="flex flex-wrap gap-1.5 w-full">
          <button 
            v-for="preset in availablePresets"
            :key="preset.name"
            @click="addFieldPreset(preset)"
            type="button"
            class="apple-glass-btn text-[11px] px-2.5 py-1 rounded-[6px] font-707 font-medium hover:border-black cursor-pointer transition-colors"
          >
            + {{ preset.name }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { FormFieldItem } from '../../types/editor.ts';
import { ChevronDown, GripVertical, Trash2 } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);
const titleDropdownRef = ref<HTMLElement | null>(null);
const isTitleDropdownOpen = ref(false);

const currentWidget = computed(() => {
  if (!editorStore.selectedWidgetId) return null;
  const w = editorStore.currentPage.widget_tree.find(w => w.id === editorStore.selectedWidgetId);
  return w && w.type === 'RegistrationForm' ? w : null;
});

const title = computed({
  get: () => currentWidget.value?.props?.title ?? 'REGISTRATION FORM',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { title: val });
    }
  }
});

const subtitle = computed({
  get: () => currentWidget.value?.props?.subtitle ?? 'Fill in your details below to register.',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { subtitle: val });
    }
  }
});

const currentTitleTypographyId = computed(() => {
  return currentWidget.value?.props?.titleTypographyStyle || currentWidget.value?.props?.typographyStyle || 'heading-3';
});

const typographyOptions = [
  { id: 'display-h1', label: 'Display H1', previewClass: 'font-707 text-[16px] font-medium tracking-tight uppercase', desc: 'Hero display headline', size: '32px' },
  { id: 'heading-1', label: 'Heading 1', previewClass: 'font-707 text-[15px] font-medium tracking-tight uppercase', desc: 'Primary title', size: '24px' },
  { id: 'heading-2', label: 'Heading 2', previewClass: 'font-707 text-[14px] font-medium uppercase', desc: 'Section header', size: '20px' },
  { id: 'heading-3', label: 'Heading 3', previewClass: 'font-707 text-[13px] font-medium uppercase', desc: 'Default component title', size: '16px' },
  { id: 'heading-4', label: 'Heading 4', previewClass: 'font-707 text-[12px] font-medium uppercase', desc: 'Compact headline', size: '14px' },
  { id: 'subtext-lead', label: 'Subtext Lead', previewClass: 'font-707 text-[13px] font-medium text-neutral-700', desc: 'Lead descriptive text', size: '16px' },
  { id: 'body-text-medium', label: 'Body Text Medium', previewClass: 'font-707 text-[12px] font-medium text-neutral-800', desc: 'Balanced body emphasis', size: '12px' },
  { id: 'body-text', label: 'Body Text', previewClass: 'font-707 text-[12px] font-normal text-neutral-700', desc: 'Standard readable paragraph', size: '12px' },
  { id: 'button-cta', label: 'Button CTA Text', previewClass: 'font-707 text-[12px] font-medium uppercase tracking-wider', desc: 'Uppercase interactive label', size: '12px' },
  { id: 'caption', label: 'Caption', previewClass: 'font-707 text-[10px] font-normal text-neutral-500 uppercase', desc: 'Small footnote metadata', size: '10px' }
];

const currentTitleTypographyLabel = computed(() => {
  const match = typographyOptions.find(o => o.id === currentTitleTypographyId.value);
  return match ? `${match.label} (${match.size})` : 'Heading 3 (16px)';
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

const fields = computed<FormFieldItem[]>(() => {
  return currentWidget.value?.props?.fields || [];
});

function updateFieldLabel(index: number, newName: string) {
  if (!currentWidget.value) return;
  const updated = [...fields.value];
  updated[index] = {
    ...updated[index],
    name: newName,
    placeholder: `Enter your ${newName.toLowerCase()}*`
  };
  editorStore.updateWidgetProps(currentWidget.value.id, { fields: updated });
}

function toggleFieldRequired(index: number) {
  if (!currentWidget.value) return;
  const updated = [...fields.value];
  const currentReq = updated[index].required !== false;
  updated[index] = { ...updated[index], required: !currentReq };
  editorStore.updateWidgetProps(currentWidget.value.id, { fields: updated });
}

function removeField(index: number) {
  if (!currentWidget.value || fields.value.length <= 1) return;
  const updated = fields.value.filter((_, i) => i !== index);
  editorStore.updateWidgetProps(currentWidget.value.id, { fields: updated });
}

const availablePresets = [
  { name: 'First Name', placeholder: 'Enter your first name*', type: 'text' },
  { name: 'Last Name', placeholder: 'Enter your last name*', type: 'text' },
  { name: 'Email Address', placeholder: 'Enter your email address*', type: 'email' },
  { name: 'WhatsApp Number', placeholder: 'Enter your whatsapp number*', type: 'tel', countryCode: '+62' },
  { name: 'Instagram Handle', placeholder: 'Enter your instagram handle*', type: 'text' },
  { name: 'Date of Birth', placeholder: 'DD / MM / YYYY', type: 'text' },
  { name: 'KTP / ID Number', placeholder: 'Enter 16-digit KTP number', type: 'text' },
  { name: 'Custom Field', placeholder: 'Enter details*', type: 'text' }
];

function addFieldPreset(preset: typeof availablePresets[0]) {
  if (!currentWidget.value) return;
  const newField: FormFieldItem = {
    id: `f_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name: preset.name,
    placeholder: preset.placeholder,
    type: preset.type,
    countryCode: (preset as any).countryCode || undefined,
    required: true,
    value: ''
  };
  const updated = [...fields.value, newField];
  editorStore.updateWidgetProps(currentWidget.value.id, { fields: updated });
}
</script>
