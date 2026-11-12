<template>
  <!-- Document Upload Setup Sidebar Menu (Matching 707 Global Editor UI & Apple Glass Standards) -->
  <aside 
    v-if="isOpen && targetWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:min-h-0 max-sm:max-h-[82vh] max-sm:rounded-b-none max-sm:rounded-t-[20px] max-sm:border-x-0 max-sm:border-b-0 max-sm:shadow-[0_-16px_40px_rgba(0,0,0,0.18)] sm:absolute sm:right-[24px] sm:top-1/2 sm:-translate-y-1/2 sm:w-[464px] sm:min-h-[460px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.95)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] sm:rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all sm:animate-apple-slide-right-center max-sm:animate-apple-slide-up no-scrollbar"
    data-name="Document Setup Sidebar"
  >
    <!-- Mobile Sheet Drag Handle Pill -->
    <div class="sm:hidden w-10 h-1 bg-black/20 rounded-full mx-auto my-2.5 shrink-0 self-center" />

    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] pb-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Document Upload Setup
          </p>
        </div>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
          title="Close"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Segmented 3-Tab Control Bar (Sticky) -->
    <div class="px-[20px] pt-[12px] pb-[12px] w-full border-b border-[#f0f0f0] bg-white/70 backdrop-blur-md shrink-0 sticky top-0 z-20">
      <div class="flex items-center p-1 bg-[#ececec]/60 rounded-[10px] w-full gap-1 border-[0.5px] border-black/10">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          @click="activeTab = t.id"
          :class="activeTab === t.id 
            ? 'bg-white text-black shadow-xs font-medium' 
            : 'text-neutral-500 hover:text-black font-normal'"
          class="flex-1 h-[30px] rounded-[7px] text-[12px] font-707 flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
        >
          <component :is="t.icon" class="size-3.5" />
          <span>{{ t.label }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: CONTENT & LABELS -->
    <div v-show="activeTab === 'content'" class="w-full flex flex-col">
      <!-- Title Input -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]">
        <div class="flex flex-col gap-[6px] w-full">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Field Label / Title
          </p>
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="title"
              placeholder="e.g. UPLOAD NATIONAL ID / KTP"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
            />
          </div>
        </div>

        <!-- Subtitle / Instruction -->
        <div class="flex flex-col gap-[6px] w-full pt-1">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Instruction / Subtitle
          </p>
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex min-h-[38px] items-center px-[14px] py-2 rounded-[8px] w-full bg-white transition-colors">
            <textarea 
              v-model="subtitle"
              rows="2"
              placeholder="e.g. Upload your government-issued ID card (PDF, JPG, PNG up to 10MB)"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 resize-none font-normal"
            />
          </div>
        </div>

        <!-- Field Name / Identifier in Submissions -->
        <div class="flex flex-col gap-[6px] w-full pt-1">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Database Column Name
          </p>
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="fieldName"
              placeholder="e.g. ktp_document"
              class="w-full text-[13px] font-707 font-mono text-black focus:outline-none placeholder:text-neutral-400"
            />
          </div>
          <span class="text-[11px] font-707 text-neutral-400">Key used in guest database and CSV exports.</span>
        </div>
      </div>

      <!-- Quick Preset Suggestions -->
      <div class="content-stretch flex flex-col gap-[12px] items-start p-[24px] shrink-0 w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Quick Presets
        </p>
        <div class="flex flex-wrap gap-2 w-full">
          <button 
            v-for="preset in presets" 
            :key="preset.title"
            @click="applyPreset(preset)"
            type="button"
            class="apple-glass-btn text-[12px] px-3 py-1.5 rounded-[8px] font-707 font-medium hover:border-black cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Plus class="size-3 text-neutral-500" />
            <span>{{ preset.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: FILE TYPES & LIMITS -->
    <div v-show="activeTab === 'types'" class="w-full flex flex-col">
      <!-- Allowed Categories Section -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Allowed File Formats
        </p>
        <div class="grid grid-cols-1 gap-2.5 w-full">
          <button
            v-for="cat in formatCategories"
            :key="cat.id"
            type="button"
            @click="toggleCategory(cat.id)"
            class="flex items-center justify-between p-3 rounded-[8px] border transition-all cursor-pointer text-left"
            :class="allowedCategories.includes(cat.id) 
              ? 'bg-neutral-50 border-black shadow-xs' 
              : 'bg-white border-[#e5e5e5] hover:border-black/30'"
          >
            <div class="flex items-center gap-3">
              <div class="size-8 rounded-[6px] bg-neutral-100 flex items-center justify-center shrink-0">
                <component :is="cat.icon" class="size-4 text-black" />
              </div>
              <div class="flex flex-col">
                <span class="font-707 font-medium text-[13px] text-black">{{ cat.label }}</span>
                <span class="font-707 text-[11px] text-neutral-400 font-mono">{{ cat.extensions.join(', ') }}</span>
              </div>
            </div>
            <div 
              class="size-5 rounded-full border flex items-center justify-center transition-all"
              :class="allowedCategories.includes(cat.id) ? 'bg-black border-black text-white' : 'border-neutral-300 bg-white'"
            >
              <Check v-if="allowedCategories.includes(cat.id)" class="size-3 stroke-[2.5]" />
            </div>
          </button>
        </div>
      </div>

      <!-- Max File Size Limit -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Max File Size Limit
        </p>
        <div class="grid grid-cols-4 gap-2 w-full">
          <button
            v-for="size in [2, 5, 10, 25]"
            :key="size"
            type="button"
            @click="maxSizeMb = size"
            class="h-[36px] rounded-[8px] font-707 text-[12px] flex items-center justify-center transition-all cursor-pointer"
            :class="maxSizeMb === size 
              ? 'apple-glass-btn-dark font-medium shadow-xs' 
              : 'apple-glass-btn text-neutral-600'"
          >
            {{ size }} MB
          </button>
        </div>
      </div>

      <!-- Single vs Multiple Files -->
      <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Number of Attachments
        </p>
        <div class="grid grid-cols-2 gap-2 w-full">
          <button
            type="button"
            @click="setAllowMultiple(false)"
            class="h-[38px] rounded-[8px] font-707 text-[12px] flex items-center justify-center transition-all cursor-pointer"
            :class="!allowMultiple 
              ? 'apple-glass-btn-dark font-medium shadow-xs' 
              : 'apple-glass-btn text-neutral-600'"
          >
            Single Document (1)
          </button>
          <button
            type="button"
            @click="setAllowMultiple(true)"
            class="h-[38px] rounded-[8px] font-707 text-[12px] flex items-center justify-center transition-all cursor-pointer"
            :class="allowMultiple 
              ? 'apple-glass-btn-dark font-medium shadow-xs' 
              : 'apple-glass-btn text-neutral-600'"
          >
            Multiple Files (Up to 3)
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 3: RULES & VALIDATION -->
    <div v-show="activeTab === 'rules'" class="w-full flex flex-col">
      <!-- Required Toggle -->
      <div class="content-stretch flex items-center justify-between p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Required Field
          </p>
          <p class="font-707 text-[11px] leading-[16px] text-neutral-400">
            Guest must upload a valid file before submitting
          </p>
        </div>
        <button
          type="button"
          @click="isRequired = !isRequired"
          class="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
          :class="isRequired ? 'bg-black' : 'bg-neutral-200'"
        >
          <span 
            class="absolute top-1 left-1 size-4 rounded-full bg-white transition-transform"
            :class="isRequired ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Delete / Remove Widget Button -->
      <div class="p-[24px] w-full">
        <button
          type="button"
          @click="removeWidget"
          class="w-full h-[40px] rounded-[8px] border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-707 text-[12px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 class="size-3.5" />
          <span>Remove Document Upload Widget</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { 
  FileText, 
  FileUp, 
  SlidersHorizontal, 
  Image, 
  Table, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-vue-next';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const activeTab = ref<'content' | 'types' | 'rules'>('content');

const tabs = [
  { id: 'content' as const, label: 'Content', icon: FileText },
  { id: 'types' as const, label: 'Formats', icon: FileUp },
  { id: 'rules' as const, label: 'Rules', icon: SlidersHorizontal }
];

const targetWidget = computed(() => {
  if (editorStore.selectedWidget?.type === 'DocumentUpload') {
    return editorStore.selectedWidget;
  }
  return editorStore.currentPage.widget_tree.find(w => w.type === 'DocumentUpload') || null;
});

const formatCategories = [
  {
    id: 'documents',
    label: 'Documents (PDF, Word)',
    icon: FileText,
    extensions: ['.pdf', '.doc', '.docx', '.txt']
  },
  {
    id: 'images',
    label: 'Images (Photos, Scan)',
    icon: Image,
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.heic']
  },
  {
    id: 'spreadsheets',
    label: 'Spreadsheets (Excel, CSV)',
    icon: Table,
    extensions: ['.xlsx', '.xls', '.csv']
  }
];

const presets = [
  {
    label: 'National ID / KTP',
    title: 'UPLOAD NATIONAL ID / KTP',
    subtitle: 'Upload a clear photo or PDF of your official ID / KTP',
    fieldName: 'ktp_id_document',
    categories: ['documents', 'images'],
    maxSize: 10
  },
  {
    label: 'Payment Transfer Slip',
    title: 'UPLOAD PAYMENT PROOF',
    subtitle: 'Upload screenshot or PDF receipt of your bank transfer',
    fieldName: 'payment_proof',
    categories: ['documents', 'images'],
    maxSize: 5
  },
  {
    label: 'Student / Member Card',
    title: 'STUDENT / MEMBER ID',
    subtitle: 'Upload your active student card or employee badge',
    fieldName: 'student_member_card',
    categories: ['documents', 'images'],
    maxSize: 5
  },
  {
    label: 'Portfolio / Deck',
    title: 'UPLOAD PORTFOLIO / DECK',
    subtitle: 'Upload your presentation or portfolio in PDF format (Max 25MB)',
    fieldName: 'portfolio_deck',
    categories: ['documents'],
    maxSize: 25
  }
];

const title = computed({
  get: () => targetWidget.value?.props?.title || 'UPLOAD DOCUMENT',
  set: (v) => updateProps({ title: v })
});

const subtitle = computed({
  get: () => targetWidget.value?.props?.subtitle || '',
  set: (v) => updateProps({ subtitle: v })
});

const fieldName = computed({
  get: () => targetWidget.value?.props?.fieldName || 'document_upload',
  set: (v) => updateProps({ fieldName: v })
});

const allowedCategories = computed({
  get: () => (targetWidget.value?.props?.allowedCategories || ['documents', 'images']) as string[],
  set: (cats: string[]) => {
    const exts: string[] = [];
    cats.forEach(c => {
      const match = formatCategories.find(fc => fc.id === c);
      if (match) exts.push(...match.extensions);
    });
    updateProps({ 
      allowedCategories: cats,
      allowedExtensions: exts.length ? exts : ['.pdf', '.jpg', '.png']
    });
  }
});

const maxSizeMb = computed({
  get: () => targetWidget.value?.props?.maxSizeMb || 10,
  set: (size) => updateProps({ maxSizeMb: size })
});

const allowMultiple = computed({
  get: () => targetWidget.value?.props?.allowMultiple === true,
  set: (v) => updateProps({ allowMultiple: v, maxFiles: v ? 3 : 1 })
});

const isRequired = computed({
  get: () => targetWidget.value?.props?.required === true,
  set: (v) => updateProps({ required: v })
});

function toggleCategory(catId: string) {
  const current = [...allowedCategories.value];
  const idx = current.indexOf(catId);
  if (idx >= 0) {
    if (current.length > 1) {
      current.splice(idx, 1);
    }
  } else {
    current.push(catId);
  }
  allowedCategories.value = current;
}

function setAllowMultiple(multiple: boolean) {
  allowMultiple.value = multiple;
}

function applyPreset(p: typeof presets[0]) {
  const exts: string[] = [];
  p.categories.forEach(c => {
    const match = formatCategories.find(fc => fc.id === c);
    if (match) exts.push(...match.extensions);
  });
  updateProps({
    title: p.title,
    subtitle: p.subtitle,
    fieldName: p.fieldName,
    allowedCategories: p.categories,
    allowedExtensions: exts,
    maxSizeMb: p.maxSize
  });
  editorStore.showToast(`Applied "${p.label}" preset`);
}

function updateProps(patch: Record<string, any>) {
  if (!targetWidget.value) return;
  editorStore.updateWidgetProps(targetWidget.value.id, patch);
}

function removeWidget() {
  if (!targetWidget.value) return;
  editorStore.removeWidget(targetWidget.value.id);
  emit('close');
}
</script>

