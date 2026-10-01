<template>
  <!-- Button Setup Sidebar Menu (Matching TextSetupSidebar.vue vertical centering) -->
  <aside 
    v-if="isOpen"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[20px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="244:11560"
    data-name="Button Setup Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Button Setup
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Section 1: Button Text Input -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Button Text
      </p>
      <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
        <input 
          v-model="buttonLabel"
          placeholder="Button Text (e.g. Enter Raffle)"
          class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
        />
      </div>
    </div>

    <!-- Section 2: Style Presets -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Button Style Preset
      </p>
      <div class="flex gap-[8px] items-center w-full">
        <button 
          type="button"
          @click="setVariant('black')"
          :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
        >
          Primary Black
        </button>
        <button 
          type="button"
          @click="setVariant('white')"
          :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
        >
          Primary White
        </button>
      </div>
    </div>

    <!-- Section 3: Position Layout Mode (Following Text position layout on hero banner modal) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Position
        </p>
        <div class="flex gap-[6px] items-center">
          <button 
            v-for="pos in positionModes" 
            :key="pos.value"
            @click="setPositionMode(pos.value)"
            :class="currentPositionMode === pos.value ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3.5 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            {{ pos.label }}
          </button>
        </div>
      </div>

      <!-- Sticky Page Targeting (Appears when Sticky Bottom is active) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="currentPositionMode === 'sticky-bottom'" class="flex flex-col gap-[10px] w-full pt-1">
          <div class="flex items-center justify-between w-full">
            <p class="font-707 font-medium text-[12px] text-neutral-600">
              Apply to Pages
            </p>
            <div class="flex gap-[6px] items-center">
              <button 
                type="button"
                @click="setStickyScope('current')"
                :class="currentStickyScope === 'current' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
              >
                Current Page
              </button>
              <button 
                type="button"
                @click="setStickyScope('all')"
                :class="currentStickyScope === 'all' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
              >
                All Pages
              </button>
              <button 
                type="button"
                @click="setStickyScope('custom')"
                :class="currentStickyScope === 'custom' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
              >
                Select
              </button>
            </div>
          </div>

          <!-- Page checklist when 'Select' is active -->
          <div v-if="currentStickyScope === 'custom'" class="flex flex-col gap-1.5 pt-1">
            <div 
              v-for="(page, idx) in editorStore.pages" 
              :key="page.id"
              @click="togglePageSticky(page.id)"
              class="flex items-center justify-between p-2 rounded-[6px] bg-white/80 border border-neutral-200 hover:border-black/40 cursor-pointer transition-colors"
            >
              <div class="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  :checked="isPageStickySelected(page.id)" 
                  @click.stop="togglePageSticky(page.id)"
                  class="rounded accent-black cursor-pointer"
                />
                <span class="font-707 text-[12px] text-black">
                  Page {{ idx + 1 }}: {{ page.page_name || page.title || 'Untitled' }}
                </span>
              </div>
              <span v-if="editorStore.currentPage.id === page.id" class="text-[9px] font-mono uppercase bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded">
                Active
              </span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Section 4: Action Button Link to (Matching Set Media Fits style) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between w-full relative">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
          Link to
        </p>
        <div class="relative">
          <button
            type="button"
            @click="isLinkToDropdownOpen = !isLinkToDropdownOpen"
            class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[240px] cursor-pointer text-left"
          >
            <span class="font-707 text-[13px] text-black">{{ selectedActionLabel }}</span>
            <ChevronDown 
              class="size-[15px] text-black transition-transform duration-200" 
              :class="isLinkToDropdownOpen ? 'rotate-180' : ''"
            />
          </button>

          <!-- Dropdown Menu -->
          <div 
            v-if="isLinkToDropdownOpen" 
            class="absolute right-0 top-[44px] w-[240px] bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-lg py-1 z-30 flex flex-col"
          >
            <button
              v-for="opt in linkToOptions"
              :key="opt.value"
              type="button"
              @click="selectLinkTo(opt.value)"
              class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
              :class="actionType === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
            >
              <span class="font-707 text-[13px]">{{ opt.label }}</span>
              <Check v-if="actionType === opt.value" class="size-[15px] text-black" />
            </button>
          </div>
        </div>
      </div>

      <!-- Conditional URL Input if Link selected -->
      <div v-if="actionType === 'link'" class="w-full pt-1 animate-in fade-in duration-150">
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="actionUrl" 
            placeholder="https://..." 
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
          />
        </div>
      </div>

      <!-- Conditional Modal Setup Button if Popup Modal is selected (Consistent with Hero Banner) -->
      <div v-if="actionType === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
        <button 
          type="button"
          @click="openModalSetup"
          class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
        >
          <span class="flex items-center gap-2">
            <SlidersHorizontal class="size-3.5" />
            <span>Configure Pop Up Modal</span>
          </span>
          <ArrowRight class="size-3.5 opacity-80" />
        </button>
      </div>
    </div>

    <!-- Section 5: Enable Icon Section with Apple Style Toggle Switch -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Add Icon
        </p>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="showIcon"
          @click="toggleIcon"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="showIcon ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle Icon"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="showIcon ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Icon Presets (Appear only when toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="showIcon" class="flex flex-nowrap overflow-x-auto gap-[8px] items-center w-full pt-1 no-scrollbar">
          <button 
            type="button"
            @click="setIconName('arrow-right')"
            :class="iconName === 'arrow-right' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="shrink-0 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center gap-1.5 px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            <ArrowRight class="size-3.5" /> Arrow
          </button>
          <button 
            type="button"
            @click="setIconName('grid')"
            :class="iconName === 'grid' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="shrink-0 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center gap-1.5 px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            <LayoutGrid class="size-3.5" /> Grid
          </button>
          <button 
            type="button"
            @click="setIconName('ticket')"
            :class="iconName === 'ticket' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="shrink-0 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center gap-1.5 px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            <Ticket class="size-3.5" /> Pass
          </button>
          <button 
            type="button"
            @click="setIconName('whatsapp')"
            :class="iconName === 'whatsapp' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="shrink-0 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center gap-1.5 px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            <Phone class="size-3.5" /> WhatsApp
          </button>
          <button 
            type="button"
            @click="setIconName('instagram')"
            :class="iconName === 'instagram' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="shrink-0 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center gap-1.5 px-[14px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
          >
            <Instagram class="size-3.5" /> Instagram
          </button>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { 
  ChevronDown, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  LayoutGrid, 
  Ticket, 
  Phone,
  Instagram,
  Bell,
  TextCursorInput,
  ListOrdered,
  ListFilter
} from 'lucide-vue-next';
import type { ModalVariant } from '../../types/editor.ts';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const modalVariants = [
  { id: 'message-alert' as ModalVariant, label: 'Message / Alert', icon: Bell },
  { id: 'message-field' as ModalVariant, label: 'Message + Field', icon: TextCursorInput },
  { id: 'choice-detailed' as ModalVariant, label: 'Detailed Choice', icon: ListOrdered },
  { id: 'choice-simple' as ModalVariant, label: 'Simple Choice', icon: ListFilter },
  { id: 'image-matrix' as ModalVariant, label: 'Image Matrix', icon: LayoutGrid }
];

const currentModalVariant = computed<ModalVariant>(() => {
  return targetWidget.value?.props?.modalProps?.variant || 'message-alert';
});

function setModalVariant(v: ModalVariant) {
  if (!targetWidget.value) return;
  const existing = targetWidget.value.props.modalProps || {};
  let updated: Record<string, any> = { ...existing, variant: v };

  if (v === 'message-alert') {
    updated.title = updated.title || 'Your Pass Has Been Sent';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
  } else if (v === 'message-field') {
    updated.title = updated.title || 'Update Your Email';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.fieldPlaceholder = updated.fieldPlaceholder || 'Enter your email*';
    updated.fieldType = updated.fieldType || 'email';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
  } else if (v === 'choice-detailed') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.options = updated.options || [
      { id: 'opt_1', label: 'Day 1', sublabel: '2 September 2026', description: 'Your Event Descriptions Detail', selected: true },
      { id: 'opt_2', label: 'Day 2', sublabel: '3 September 2026', description: 'Your Event Descriptions Detail', selected: false }
    ];
  } else if (v === 'choice-simple') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.options = updated.options || [
      { id: 'opt_1', label: '+62', sublabel: 'Indonesia', selected: true },
      { id: 'opt_2', label: '+65', sublabel: 'Singapore', selected: false }
    ];
  } else if (v === 'image-matrix') {
    updated.title = updated.title || 'Select Arrival Date';
    updated.subtitle = updated.subtitle || 'Please provide a valid email address. We will resend your E-Pass immediately.';
    updated.buttonText = updated.buttonText || 'Done';
    updated.buttonVariant = updated.buttonVariant || 'black';
    updated.imageSlots = updated.imageSlots || [
      { id: 'slot_1', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80', label: 'Model 01', selected: true },
      { id: 'slot_2', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', label: 'Model 02', selected: false },
      { id: 'slot_3', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', label: 'Model 03', selected: false },
      { id: 'slot_4', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80', label: 'Model 04', selected: false }
    ];
  }

  editorStore.updateWidgetProps(targetWidget.value.id, { modalProps: updated });
}

function openModalSetup() {
  if (targetWidget.value) {
    if (!targetWidget.value.props.modalProps) {
      setModalVariant('message-alert');
    }
    editorStore.selectWidget(targetWidget.value.id);
    editorStore.openModalSidebar();
  }
}

const targetWidget = computed(() => {
  if (editorStore.selectedWidget && (editorStore.selectedWidget.type === 'ActionButton' || editorStore.selectedWidget.type === 'HeroDrop')) {
    return editorStore.selectedWidget;
  }
  return editorStore.currentPage.widget_tree.find(w => w.type === 'ActionButton') || null;
});

const buttonLabel = computed({
  get: () => targetWidget.value?.props?.label || targetWidget.value?.props?.buttonText || targetWidget.value?.props?.ctaLabel || 'BUTTON CTA',
  set: (val: string) => {
    if (targetWidget.value) {
      if (targetWidget.value.type === 'HeroDrop') {
        editorStore.updateWidgetProps(targetWidget.value.id, { buttonText: val, ctaLabel: val, isCtaEnabled: true, showButton: true });
      } else {
        editorStore.updateWidgetProps(targetWidget.value.id, { label: val });
      }
    }
  }
});

const currentVariant = computed(() => {
  return targetWidget.value?.props?.variant || targetWidget.value?.props?.buttonVariant || 'black';
});

const positionModes = computed(() => {
  if (targetWidget.value?.type === 'HeroDrop') {
    return [
      { label: 'In Banner', value: 'in-flow' },
      { label: 'Sticky Bottom', value: 'sticky-bottom' }
    ] as const;
  }
  return [
    { label: 'Standard', value: 'in-flow' },
    { label: 'Sticky Bottom', value: 'sticky-bottom' }
  ] as const;
});

const currentPositionMode = computed(() => {
  return targetWidget.value?.props?.positionMode || 'in-flow';
});

const currentStickyScope = computed(() => {
  return targetWidget.value?.props?.stickyScope || 'current';
});

const isLinkToDropdownOpen = ref(false);

const linkToOptions = [
  { label: 'Next Page', value: 'next_page' },
  { label: 'Submit Form', value: 'submit' },
  { label: 'External URL', value: 'link' },
  { label: 'Popup Modal', value: 'modal' },
  { label: 'Scroll to Section', value: 'scroll' }
] as const;

const actionType = computed({
  get: () => targetWidget.value?.props?.actionType || 'submit',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { actionType: val });
    }
  }
});

const selectedActionLabel = computed(() => {
  const opt = linkToOptions.find(o => o.value === actionType.value);
  return opt ? opt.label : 'Next Page';
});

function selectLinkTo(val: string) {
  actionType.value = val;
  isLinkToDropdownOpen.value = false;
  if (val === 'modal' && targetWidget.value) {
    if (!targetWidget.value.props.modalProps) {
      setModalVariant('message-alert');
    }
    editorStore.selectWidget(targetWidget.value.id);
    editorStore.openModalSidebar();
  }
}

const actionUrl = computed({
  get: () => targetWidget.value?.props?.url || '',
  set: (val: string) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { url: val });
    }
  }
});

const showIcon = computed({
  get: () => targetWidget.value?.props?.showIcon ?? false,
  set: (val: boolean) => {
    if (targetWidget.value) {
      editorStore.updateWidgetProps(targetWidget.value.id, { showIcon: val });
    }
  }
});

function toggleIcon() {
  showIcon.value = !showIcon.value;
}

const iconName = computed(() => {
  return targetWidget.value?.props?.iconName || 'arrow-right';
});

function setVariant(variant: 'black' | 'white') {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { variant, buttonVariant: variant });
  }
}

function setPositionMode(mode: 'in-flow' | 'sticky-bottom') {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { 
      positionMode: mode,
      stickyPageIds: targetWidget.value.props.stickyPageIds || [editorStore.currentPage.id]
    });
  }
}

function setStickyScope(scope: 'current' | 'all' | 'custom') {
  if (targetWidget.value) {
    const defaultPageIds = scope === 'all' 
      ? editorStore.pages.map(p => p.id) 
      : [editorStore.currentPage.id];
    editorStore.updateWidgetProps(targetWidget.value.id, { 
      stickyScope: scope,
      stickyPageIds: targetWidget.value.props.stickyPageIds || defaultPageIds
    });
  }
}

function setIconName(name: string) {
  if (targetWidget.value) {
    editorStore.updateWidgetProps(targetWidget.value.id, { iconName: name, showIcon: true });
  }
}

function isPageStickySelected(pageId: string): boolean {
  if (!targetWidget.value) return false;
  const pageIds: string[] = targetWidget.value.props.stickyPageIds || [];
  return pageIds.includes(pageId);
}

function togglePageSticky(pageId: string) {
  if (!targetWidget.value) return;
  const currentList: string[] = [...(targetWidget.value.props.stickyPageIds || [])];
  const idx = currentList.indexOf(pageId);
  if (idx >= 0) {
    currentList.splice(idx, 1);
  } else {
    currentList.push(pageId);
  }
  editorStore.updateWidgetProps(targetWidget.value.id, { stickyPageIds: currentList });
}
</script>
