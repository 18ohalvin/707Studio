<template>
  <!-- Guest E-Pass Setup Sidebar Menu (Figma Node 222:4188) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="222:4188"
    data-name="Guest E-Pass Setup Sidebar"
  >
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <Ticket class="size-4 text-black" />
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Guest E-Pass Setup
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
      <p class="font-707 text-[12px] text-neutral-500 mt-1">
        Configure venue, dynamic ticket metadata, and entry terms.
      </p>
    </div>

    <!-- Section 0: Brand Logo (Inherited from Hero Banner - Rule 3) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Brand Logo
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            {{ projectBrandLogoUrl ? 'Active from Hero Banner' : 'Not configured' }}
          </span>
        </div>
        <div v-if="projectBrandLogoUrl" class="border-[0.5px] border-neutral-200 p-3 rounded-[8px] bg-neutral-50 flex items-center justify-between">
          <img :src="projectBrandLogoUrl" alt="Brand Logo" class="max-h-[32px] h-[24px] w-auto object-contain" />
          <span class="font-707 text-[11px] text-emerald-600 font-medium">● Visible on Summary</span>
        </div>
        <p v-else class="font-707 text-[11px] text-neutral-400 leading-normal">
          Upload a brand logo in your Hero Banner setup to automatically display it at the top of this summary ticket.
        </p>
      </div>
    </div>

    <!-- Section 1: Venue Configuration -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Event Venue Location
        </p>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="venue"
            placeholder="e.g. LA MODA PLAZA INDONESIA"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>
    </div>

    <!-- Section 2: Guest Identity & Data Binding -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Guest Name Binding
      </p>

      <!-- Auto Binding Mode -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <span class="font-707 text-[12px] text-neutral-600">Name Source</span>
          <span class="font-707 text-[11px] text-neutral-400">
            {{ availableNameFields.length > 0 ? 'Linked to Form' : 'Auto-detected' }}
          </span>
        </div>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="guestNameFallback"
            placeholder="e.g. MR. ALVIN DECOROUS"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
          />
        </div>
        <p class="font-707 text-[11px] text-neutral-400 leading-normal">
          In live mode, this automatically populates from the visitor's submitted Name input.
        </p>
      </div>
    </div>

    <!-- Section 3: Valid For / Sessions Cards -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Valid For (Event Sessions)
        </p>
        <button 
          type="button"
          @click="addSessionSlot"
          class="apple-glass-btn text-[11px] font-707 px-2.5 py-1 rounded-[6px] flex items-center gap-1 cursor-pointer"
        >
          <Plus class="size-3" />
          <span>Add Session</span>
        </button>
      </div>

      <!-- Slots List -->
      <div class="flex flex-col gap-2 w-full">
        <div 
          v-for="(slot, sIdx) in validForSlots" 
          :key="slot.id || sIdx"
          class="border-[0.5px] border-neutral-200 rounded-[8px] p-3 bg-white flex flex-col gap-2 shadow-xs"
        >
          <div class="flex items-center justify-between gap-2">
            <input 
              v-model="slot.label"
              placeholder="Session / Day (e.g. Day 2)"
              class="font-707 font-medium text-[13px] text-black focus:outline-none flex-1 border-b border-transparent focus:border-black py-0.5"
            />
            <input 
              v-model="slot.sublabel"
              placeholder="Date (e.g. 3 September 2026)"
              class="font-707 text-[12px] text-neutral-500 focus:outline-none text-right flex-1 border-b border-transparent focus:border-black py-0.5"
            />
            <button 
              type="button"
              v-if="validForSlots.length > 1"
              @click="removeSessionSlot(sIdx)"
              class="size-6 rounded flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer"
              title="Remove Slot"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>
          <input 
            v-model="slot.description"
            placeholder="Event Descriptions Detail"
            class="font-707 text-[11px] text-neutral-600 focus:outline-none w-full border-b border-transparent focus:border-black py-0.5"
          />
        </div>
      </div>
    </div>

    <!-- Section 4: Terms & Conditions -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Terms & Conditions
        </p>
        <button 
          type="button"
          @click="addTermRule"
          class="apple-glass-btn text-[11px] font-707 px-2.5 py-1 rounded-[6px] flex items-center gap-1 cursor-pointer"
        >
          <Plus class="size-3" />
          <span>Add Rule</span>
        </button>
      </div>

      <div class="flex flex-col gap-2 w-full">
        <div 
          v-for="(term, tIdx) in termsList" 
          :key="tIdx"
          class="flex items-center gap-2 w-full"
        >
          <div class="size-1.5 rounded-full bg-black shrink-0" />
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[10px] rounded-[6px] w-full bg-white transition-colors">
            <input 
              v-model="termsList[tIdx]"
              placeholder="Enter rule text"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
            />
          </div>
          <button 
            type="button"
            v-if="termsList.length > 1"
            @click="removeTermRule(tIdx)"
            class="size-6 rounded flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer shrink-0"
            title="Remove Rule"
          >
            <Trash2 class="size-3.5" />
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
import { Ticket, Plus, Trash2 } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const currentWidget = computed(() => {
  const selected = editorStore.currentPage.widget_tree.find(w => w.id === editorStore.selectedWidgetId);
  if (selected && selected.type === 'GuestEPass') return selected;
  return editorStore.currentPage.widget_tree.find(w => w.type === 'GuestEPass') || null;
});

const venue = computed({
  get: () => currentWidget.value?.props?.venue || 'LA MODA PLAZA INDONESIA',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { venue: val });
    }
  }
});

const guestNameFallback = computed({
  get: () => currentWidget.value?.props?.guestNameFallback || 'MR. ALVIN DECOROUS',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { guestNameFallback: val });
    }
  }
});

const validForSlots = computed({
  get: () => currentWidget.value?.props?.validForFallback || [
    { id: 'opt_1', label: 'Day 2', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail' },
    { id: 'opt_2', label: 'Day 3', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail' }
  ],
  set: (val: any[]) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { validForFallback: val });
    }
  }
});

function addSessionSlot() {
  const current = [...validForSlots.value];
  const nextNum = current.length + 1;
  current.push({
    id: `opt_${Date.now()}`,
    label: `Day ${nextNum}`,
    sublabel: '3 September 2026',
    description: 'Your Event Descriptions Detail'
  });
  validForSlots.value = current;
}

function removeSessionSlot(index: number) {
  const current = [...validForSlots.value];
  current.splice(index, 1);
  validForSlots.value = current;
}

const termsList = computed({
  get: () => currentWidget.value?.props?.terms || [
    'Valid for one (1) person only — non-transferable.',
    'Present this ticket at the entrance for scanning.',
    'No re-entry once you have exited the venue.',
    'Management is not liable for loss of personal belongings.'
  ],
  set: (val: string[]) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { terms: val });
    }
  }
});

function addTermRule() {
  const current = [...termsList.value];
  current.push('New entry condition or legal rule.');
  termsList.value = current;
}

function removeTermRule(index: number) {
  const current = [...termsList.value];
  current.splice(index, 1);
  termsList.value = current;
}

const availableNameFields = computed(() => {
  return editorStore.pages.flatMap(p => 
    p.widget_tree.filter(w => w.type === 'FieldInput')
  );
});

const projectBrandLogoUrl = computed(() => {
  for (const page of editorStore.pages) {
    for (const w of page.widget_tree) {
      if (w.type === 'HeroDrop' && w.props?.brandLogoUrl) {
        return w.props.brandLogoUrl;
      }
    }
  }
  return '';
});
</script>
