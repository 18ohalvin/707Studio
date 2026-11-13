<template>
  <div class="content-stretch flex flex-col gap-[14px] items-start w-full">
    <div class="content-stretch flex items-center justify-between w-full relative">
      <div class="flex items-center gap-1.5">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
          {{ label }}
        </p>
        <InfoHint v-if="hint" :text="hint" />
      </div>
      <div class="relative" ref="actionBtnRef">
        <button
          type="button"
          @click="isActionDropdownOpen = !isActionDropdownOpen"
          :class="controlWidthClass"
          class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] cursor-pointer text-left"
        >
          <span class="font-707 text-[13px] text-black truncate">{{ selectedActionLabel }}</span>
          <ChevronDown
            class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1.5"
            :class="isActionDropdownOpen ? 'rotate-180' : ''"
          />
        </button>

        <Teleport to="body">
          <div
            v-if="isActionDropdownOpen"
            ref="actionMenuRef"
            :style="actionPopoverStyle"
            class="bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] py-1 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 select-none"
          >
            <button
              v-for="opt in availableOptions"
              :key="opt.value"
              type="button"
              @click="selectAction(opt.value)"
              class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
              :class="currentAction === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
            >
              <span class="font-707 text-[13px]">{{ opt.label }}</span>
              <Check v-if="currentAction === opt.value" class="size-[15px] text-black" />
            </button>
          </div>
        </Teleport>
      </div>
    </div>

    <!-- Conditional Target Page Picker for Submit & Go to Page -->
    <div v-if="currentAction === 'submit'" class="flex items-center justify-between w-full pt-1 relative animate-in fade-in duration-150">
      <div class="flex items-center gap-1.5">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
          Target Page
        </p>
        <InfoHint :text="target === 'secondary' ? 'Pick where Button 2 goes after submitting, or leave as next page.' : 'Pick where to go after submitting. Defaults to the next page, or pick another page to skip steps.'" />
      </div>
      <div class="relative" ref="targetPageBtnRef">
        <button
          type="button"
          @click="isTargetPageDropdownOpen = !isTargetPageDropdownOpen"
          :class="controlWidthClass"
          class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] cursor-pointer text-left"
        >
          <span class="font-707 text-[13px] text-black truncate">{{ selectedTargetPageLabel }}</span>
          <ChevronDown
            class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1.5"
            :class="isTargetPageDropdownOpen ? 'rotate-180' : ''"
          />
        </button>
        <Teleport to="body">
          <div
            v-if="isTargetPageDropdownOpen"
            ref="targetPageMenuRef"
            :style="targetPagePopoverStyle"
            class="bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] py-1 z-50 flex flex-col overflow-y-auto animate-in fade-in duration-150 select-none"
          >
            <button
              type="button"
              @click="selectTargetPage('')"
              class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
              :class="!currentTargetPageId ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
            >
              <span class="font-707 text-[13px]">Next Page (Default)</span>
              <Check v-if="!currentTargetPageId" class="size-[15px] text-black" />
            </button>
            <button
              v-for="p in funnelTargetPages"
              :key="p.id"
              type="button"
              :disabled="p.isCurrent"
              @click="selectTargetPage(p.id)"
              class="flex items-center justify-between px-[14px] py-[8px] text-left transition-colors"
              :class="[
                p.isCurrent ? 'opacity-40 cursor-not-allowed text-neutral-400' : 'hover:bg-black/5 cursor-pointer',
                currentTargetPageId === p.id ? 'font-medium text-black bg-black/5' : 'text-neutral-700'
              ]"
            >
              <span class="font-707 text-[12.5px] truncate pr-2">{{ p.label }}<span v-if="p.isCurrent"> (Current)</span></span>
              <Check v-if="currentTargetPageId === p.id" class="size-[15px] text-black shrink-0" />
            </button>
          </div>
        </Teleport>
      </div>
    </div>

    <!-- Conditional URL Input & Open in New Tab Toggle -->
    <div v-if="currentAction === 'link'" class="w-full pt-1 flex flex-col gap-3 animate-in fade-in duration-150">
      <div class="flex flex-col gap-1.5 w-full">
        <span class="font-707 text-[12px] font-medium text-neutral-600">URL</span>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input
            v-model="currentUrl"
            placeholder="https://example.com"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
          />
        </div>
      </div>

      <div class="flex items-center justify-between w-full pt-0.5">
        <span class="font-707 text-[12px] font-medium text-black">Open in New Tab</span>
        <button
          type="button"
          role="switch"
          :aria-checked="currentOpenInNewTab"
          @click="currentOpenInNewTab = !currentOpenInNewTab"
          class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="currentOpenInNewTab ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Open in new tab"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="currentOpenInNewTab ? 'translate-x-[16px]' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Conditional Modal Setup Button -->
    <div v-if="currentAction === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
      <button
        type="button"
        @click="openModalSetup"
        class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
      >
        <span class="flex items-center gap-2">
          <SlidersHorizontal class="size-3.5" />
          <span>Edit Pop Up</span>
        </span>
        <ArrowRight class="size-3.5 opacity-80" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDown, Check, ArrowRight, SlidersHorizontal } from 'lucide-vue-next';
import { CTA_ACTION_OPTIONS, normalizeCtaAction, getFunnelTargetPages } from './ctaActions.ts';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useModalPopover } from '../common/modalPopover.ts';
import InfoHint from '../common/InfoHint.vue';
import type { WidgetItem } from '../../types/editor.ts';

const props = withDefaults(defineProps<{
  widget: WidgetItem;
  target: 'primary' | 'secondary';
  label: string;
  hint?: string;
  isModalDisallowed?: boolean;
  controlWidthClass?: string;
}>(), {
  isModalDisallowed: false,
  controlWidthClass: 'w-[210px]'
});

const editorStore = useEditorStore();
const isSecondary = computed(() => props.target === 'secondary');
const isHero = computed(() => props.widget.type === 'HeroDrop');

const hasEPassInProject = computed(() =>
  editorStore.pages.flatMap(p => p.widget_tree).some(w => w.type === 'GuestEPass' || w.type === 'LiveQueuePass')
);

const availableOptions = computed(() =>
  CTA_ACTION_OPTIONS.filter(opt => {
    if (opt.value === 'download-pass') return hasEPassInProject.value;
    if (opt.value === 'modal') return !props.isModalDisallowed;
    return true;
  })
);

const isActionDropdownOpen = ref(false);
const actionBtnRef = ref<HTMLElement | null>(null);
const { style: actionPopoverStyle, menuRef: actionMenuRef } = useModalPopover(actionBtnRef, isActionDropdownOpen, { align: 'right', width: 220 });

const isTargetPageDropdownOpen = ref(false);
const targetPageBtnRef = ref<HTMLElement | null>(null);
const { style: targetPagePopoverStyle, menuRef: targetPageMenuRef } = useModalPopover(targetPageBtnRef, isTargetPageDropdownOpen, { align: 'right', width: 220 });

const currentAction = computed({
  get: () => {
    const raw = isSecondary.value
      ? props.widget.props?.secondaryActionType
      : (props.widget.props?.actionType ?? props.widget.props?.ctaActionType);
    const normalized = normalizeCtaAction(raw);
    const allowed = availableOptions.value.map(o => o.value as string);
    if (normalized && allowed.includes(normalized)) return normalized;
    return isSecondary.value ? 'modal' : 'submit';
  },
  set: (val: string) => {
    if (isSecondary.value) {
      editorStore.updateWidgetProps(props.widget.id, { secondaryActionType: val });
    } else {
      editorStore.updateWidgetProps(props.widget.id, {
        actionType: val,
        ...(isHero.value ? { ctaActionType: val } : {})
      });
    }
  }
});

const selectedActionLabel = computed(() => {
  const opt = CTA_ACTION_OPTIONS.find(o => o.value === currentAction.value);
  return opt ? opt.label : (availableOptions.value[0]?.label || 'External URL');
});

function openModalSetup() {
  const modalKey = isSecondary.value ? 'secondaryModalProps' : 'modalProps';
  if (!props.widget.props?.[modalKey]) {
    editorStore.updateWidgetProps(props.widget.id, {
      [modalKey]: {
        variant: 'message-alert',
        title: isSecondary.value ? 'Action Cancelled' : 'Your Pass Has Been Sent',
        subtitle: isSecondary.value ? 'You have declined or cancelled.' : 'Please provide a valid email address.',
        buttonText: 'Done',
        buttonVariant: 'black'
      }
    });
  }
  editorStore.activeModalKey = modalKey;
  editorStore.selectWidget(props.widget.id);
  editorStore.openModalSidebar();
}

function selectAction(val: string) {
  currentAction.value = val;
  isActionDropdownOpen.value = false;
  if (val === 'modal') {
    openModalSetup();
  }
}

const funnelTargetPages = computed(() =>
  getFunnelTargetPages(editorStore.pages, editorStore.currentPage?.id)
);

const currentTargetPageId = computed({
  get: () => isSecondary.value
    ? (props.widget.props?.secondaryTargetPageId || '')
    : (props.widget.props?.targetPageId || props.widget.props?.ctaTargetPageId || ''),
  set: (val: string) => {
    if (isSecondary.value) {
      editorStore.updateWidgetProps(props.widget.id, { secondaryTargetPageId: val });
    } else {
      editorStore.updateWidgetProps(props.widget.id, { targetPageId: val, ctaTargetPageId: val });
    }
  }
});

const selectedTargetPageLabel = computed(() => {
  if (!currentTargetPageId.value) return 'Next Page (Default)';
  const match = funnelTargetPages.value.find(p => p.id === currentTargetPageId.value);
  return match ? match.label : 'Next Page (Default)';
});

function selectTargetPage(id: string) {
  currentTargetPageId.value = id;
  isTargetPageDropdownOpen.value = false;
}

const currentUrl = computed({
  get: () => isSecondary.value
    ? (props.widget.props?.secondaryUrl || '')
    : (props.widget.props?.url ?? props.widget.props?.ctaUrl ?? ''),
  set: (val: string) => {
    if (isSecondary.value) {
      editorStore.updateWidgetProps(props.widget.id, { secondaryUrl: val });
    } else {
      editorStore.updateWidgetProps(props.widget.id, {
        url: val,
        ...(isHero.value ? { ctaUrl: val } : {})
      });
    }
  }
});

const currentOpenInNewTab = computed({
  get: () => isSecondary.value
    ? (props.widget.props?.secondaryOpenInNewTab ?? true)
    : (props.widget.props?.openInNewTab ?? false),
  set: (val: boolean) => {
    if (isSecondary.value) {
      editorStore.updateWidgetProps(props.widget.id, { secondaryOpenInNewTab: val });
    } else {
      editorStore.updateWidgetProps(props.widget.id, { openInNewTab: val });
    }
  }
});
</script>

