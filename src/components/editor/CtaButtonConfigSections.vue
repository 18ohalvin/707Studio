<template>
  <!-- CONTENT SECTION -->
  <template v-if="section === 'content' || section === 'all'">
    <!-- Layout Mode Selector: Single vs Dual Buttons -->
    <div class="content-stretch flex flex-col gap-[12px] items-start p-[24px] pb-[18px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-1.5">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Layout
          </p>
          <InfoHint text="Show one main CTA button or two independent buttons (e.g. Yes / No, Agree / Disagree)." />
        </div>
        <div class="flex gap-[6px] items-center">
          <button
            type="button"
            @click="layoutMode = 'single'"
            :class="layoutMode === 'single' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[30px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer transition-all"
          >
            Single
          </button>
          <button
            type="button"
            @click="layoutMode = 'dual'"
            :class="layoutMode === 'dual' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[30px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer transition-all"
          >
            Dual
          </button>
        </div>
      </div>

      <!-- Dual Grid Alignment (Side by Side vs Stacked Top-Bottom) -->
      <div v-if="layoutMode === 'dual'" class="flex items-center justify-between w-full pt-2 border-t border-black/5">
        <p class="font-707 font-medium text-[12px] text-neutral-800">
          Direction
        </p>
        <div class="flex gap-[6px] items-center">
          <button
            type="button"
            @click="dualOrientation = 'horizontal'"
            :class="dualOrientation === 'horizontal' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer transition-all"
          >
            Side by Side
          </button>
          <button
            type="button"
            @click="dualOrientation = 'vertical'"
            :class="dualOrientation === 'vertical' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-2.5 h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer transition-all"
          >
            Stacked
          </button>
        </div>
      </div>
    </div>

    <!-- Primary Button Label -->
    <div
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full"
      :class="(layoutMode === 'dual' || section === 'all') ? 'border-b border-[#f0f0f0]' : ''"
    >
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          {{ layoutMode === 'dual' ? 'Button 1 Label' : 'Label' }}
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input
            v-model="buttonLabel"
            :placeholder="layoutMode === 'dual' ? 'YES' : (isHero ? 'Button Text (e.g. Enter Raffle)' : 'BUTTON CTA')"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
          />
        </div>
      </div>
    </div>

    <!-- Secondary Button Label (Dual Mode Only) -->
    <div
      v-if="layoutMode === 'dual'"
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full animate-in fade-in duration-150"
      :class="section === 'all' ? 'border-b border-[#f0f0f0]' : ''"
    >
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Button 2 Label
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input
            v-model="secondaryButtonLabel"
            placeholder="NO"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
          />
        </div>
      </div>
    </div>
  </template>

  <!-- STYLE & POSITION SECTION -->
  <template v-if="section === 'style' || section === 'all'">
    <!-- Style Presets (Single Mode) -->
    <div
      v-if="shouldShowStylePresets && layoutMode === 'single'"
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]"
    >
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Style
      </p>
      <div class="flex gap-[8px] items-center w-full">
        <button
          type="button"
          @click="setVariant('black')"
          :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
        >
          Black
        </button>
        <button
          type="button"
          @click="setVariant('white')"
          :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
        >
          White
        </button>
      </div>
    </div>

    <!-- Style Presets (Dual Mode) -->
    <div
      v-if="shouldShowStylePresets && layoutMode === 'dual'"
      class="content-stretch flex flex-col gap-[16px] items-start p-[24px] pb-[20px] shrink-0 w-full border-b border-[#f0f0f0]"
    >
      <div class="flex flex-col gap-[8px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Button 1 Style
        </p>
        <div class="flex gap-[8px] items-center w-full">
          <button
            type="button"
            @click="setVariant('black')"
            :class="currentVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
          >
            Black
          </button>
          <button
            type="button"
            @click="setVariant('white')"
            :class="currentVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[12px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
          >
            White
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-[8px] w-full pt-1">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Button 2 Style
        </p>
        <div class="grid grid-cols-3 gap-[6px] items-center w-full">
          <button
            type="button"
            @click="setSecondaryVariant('white')"
            :class="currentSecondaryVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[8px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
          >
            White
          </button>
          <button
            type="button"
            @click="setSecondaryVariant('ghost')"
            :class="currentSecondaryVariant === 'ghost' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[8px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
          >
            Outline
          </button>
          <button
            type="button"
            @click="setSecondaryVariant('black')"
            :class="currentSecondaryVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="whitespace-nowrap content-stretch flex h-[34px] items-center justify-center px-[8px] py-[4px] rounded-[8px] text-[11.5px] font-707 cursor-pointer"
          >
            Black
          </button>
        </div>
      </div>
    </div>

    <!-- Position Layout Mode -->
    <div
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full"
      :class="section === 'all' ? 'border-b border-[#f0f0f0]' : ''"
    >
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-1.5">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Position
          </p>
          <InfoHint text="Standard / In Banner places buttons in page flow; Sticky Bottom pins them to the bottom edge." />
        </div>
        <div class="flex gap-[6px] items-center">
          <button
            v-for="pos in positionModes"
            :key="pos.value"
            type="button"
            @click="setPositionMode(pos.value)"
            :class="currentPositionMode === pos.value ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="w-[96px] h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            {{ pos.label }}
          </button>
        </div>
      </div>

      <!-- Sticky Notice / Page Targeting -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="currentPositionMode === 'sticky-bottom' && isHero" class="flex items-center justify-between w-full pt-1">
          <span class="font-707 text-[12px] text-neutral-500">
            Applied to this page only
          </span>
          <span class="font-707 text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-[4px] border border-neutral-200">
            Current Page Only
          </span>
        </div>

        <div v-else-if="currentPositionMode === 'sticky-bottom'" class="flex flex-col gap-[10px] w-full pt-1">
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-1.5">
              <p class="font-707 font-medium text-[12px] text-neutral-600">
                Apply to Pages
              </p>
              <InfoHint text="Choose which funnel pages display the pinned sticky button." />
            </div>
            <div class="flex gap-[6px] items-center">
              <button
                type="button"
                @click="setStickyScope('current')"
                :class="currentStickyScope === 'current' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="w-[84px] h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
              >
                Current Page
              </button>
              <button
                type="button"
                @click="setStickyScope('all')"
                :class="currentStickyScope === 'all' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="w-[84px] h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
              >
                All Pages
              </button>
              <button
                type="button"
                @click="setStickyScope('custom')"
                :class="currentStickyScope === 'custom' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="w-[84px] h-[28px] rounded-[6px] flex items-center justify-center font-707 text-[11px] cursor-pointer"
              >
                Select
              </button>
            </div>
          </div>

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
  </template>

  <!-- ACTION SECTION -->
  <template v-if="section === 'action' || section === 'all'">
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full" :class="layoutMode === 'dual' ? 'border-b border-[#f0f0f0]' : ''">
      <CtaActionControl
        :widget="widget"
        target="primary"
        :label="layoutMode === 'dual' ? 'Button 1 Action' : 'On Click'"
        hint="Choose what happens when a guest taps this button."
        :is-modal-disallowed="isModalDisallowed"
        :control-width-class="controlWidthClass"
      />
    </div>

    <div
      v-if="layoutMode === 'dual'"
      class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full animate-in fade-in duration-150"
    >
      <CtaActionControl
        :widget="widget"
        target="secondary"
        label="Button 2 Action"
        hint="Set an independent action for the second button (e.g. open a link, pop-up, or skip to a page)."
        :is-modal-disallowed="isModalDisallowed"
        :control-width-class="controlWidthClass"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import CtaActionControl from './CtaActionControl.vue';
import InfoHint from '../common/InfoHint.vue';
import type { WidgetItem } from '../../types/editor.ts';

const props = withDefaults(defineProps<{
  widget: WidgetItem;
  section: 'content' | 'style' | 'action' | 'all';
  shouldShowStylePresets?: boolean;
  controlWidthClass?: string;
}>(), {
  shouldShowStylePresets: true,
  controlWidthClass: 'w-[210px]'
});

const editorStore = useEditorStore();
const isHero = computed(() => props.widget.type === 'HeroDrop');

const layoutMode = computed({
  get: () => (props.widget.props?.layoutMode === 'dual' ? 'dual' : 'single'),
  set: (val: 'single' | 'dual') => {
    editorStore.updateWidgetProps(props.widget.id, {
      layoutMode: val,
      secondaryLabel: props.widget.props?.secondaryLabel || 'NO',
      secondaryVariant: props.widget.props?.secondaryVariant || 'white',
      secondaryActionType: props.widget.props?.secondaryActionType || 'modal',
      secondaryOpenInNewTab: props.widget.props?.secondaryOpenInNewTab ?? true,
      dualOrientation: props.widget.props?.dualOrientation || 'horizontal',
      ...(isHero.value ? { isCtaEnabled: true, showButton: true } : {})
    });
  }
});

const dualOrientation = computed({
  get: () => props.widget.props?.dualOrientation || 'horizontal',
  set: (val: 'horizontal' | 'vertical') => {
    editorStore.updateWidgetProps(props.widget.id, { dualOrientation: val });
  }
});

const buttonLabel = computed({
  get: () => {
    if (isHero.value) {
      return props.widget.props?.buttonText ?? props.widget.props?.ctaLabel ?? props.widget.props?.label ?? '';
    }
    return props.widget.props?.label ?? props.widget.props?.buttonText ?? props.widget.props?.ctaLabel ?? '';
  },
  set: (val: string) => {
    if (isHero.value) {
      editorStore.updateWidgetProps(props.widget.id, {
        buttonText: val,
        ctaLabel: val,
        isCtaEnabled: true,
        showButton: true
      });
    } else {
      editorStore.updateWidgetProps(props.widget.id, { label: val });
    }
  }
});

const secondaryButtonLabel = computed({
  get: () => props.widget.props?.secondaryLabel ?? '',
  set: (val: string) => {
    editorStore.updateWidgetProps(props.widget.id, { secondaryLabel: val });
  }
});

const currentVariant = computed(() => {
  return props.widget.props?.variant || props.widget.props?.buttonVariant || 'black';
});

function setVariant(variant: 'black' | 'white') {
  editorStore.updateWidgetProps(props.widget.id, { variant, buttonVariant: variant });
}

const currentSecondaryVariant = computed(() => {
  return props.widget.props?.secondaryVariant || 'white';
});

function setSecondaryVariant(v: 'white' | 'black' | 'ghost') {
  editorStore.updateWidgetProps(props.widget.id, { secondaryVariant: v });
}

const positionModes = computed(() => {
  if (isHero.value) {
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
  if (isHero.value) {
    return props.widget.props?.ctaPositionMode || props.widget.props?.positionMode || 'in-flow';
  }
  return props.widget.props?.positionMode || 'in-flow';
});

const currentStickyScope = computed(() => {
  return props.widget.props?.stickyScope || 'current';
});

const isModalDisallowed = computed(() => {
  return !isHero.value && currentPositionMode.value === 'sticky-bottom' && currentStickyScope.value === 'all';
});

function setPositionMode(mode: 'in-flow' | 'sticky-bottom') {
  const isStickyAll = !isHero.value && mode === 'sticky-bottom' && currentStickyScope.value === 'all';
  const updates: Record<string, any> = {
    positionMode: mode,
    stickyPageIds: props.widget.props?.stickyPageIds || [editorStore.currentPage.id],
    ...(isHero.value ? { ctaPositionMode: mode } : {})
  };
  if (isStickyAll && props.widget.props?.actionType === 'modal') {
    updates.actionType = 'submit';
  }
  editorStore.updateWidgetProps(props.widget.id, updates);
}

function setStickyScope(scope: 'current' | 'all' | 'custom') {
  const defaultPageIds = scope === 'all'
    ? editorStore.pages.map(p => p.id)
    : [editorStore.currentPage.id];
  const updates: Record<string, any> = {
    stickyScope: scope,
    stickyPageIds: props.widget.props?.stickyPageIds || defaultPageIds
  };
  if (scope === 'all' && currentPositionMode.value === 'sticky-bottom' && props.widget.props?.actionType === 'modal') {
    updates.actionType = 'submit';
  }
  editorStore.updateWidgetProps(props.widget.id, updates);
}

function isPageStickySelected(pageId: string): boolean {
  const pageIds: string[] = props.widget.props?.stickyPageIds || [];
  return pageIds.includes(pageId);
}

function togglePageSticky(pageId: string) {
  const currentList: string[] = [...(props.widget.props?.stickyPageIds || [])];
  const idx = currentList.indexOf(pageId);
  if (idx >= 0) {
    currentList.splice(idx, 1);
  } else {
    currentList.push(pageId);
  }
  editorStore.updateWidgetProps(props.widget.id, { stickyPageIds: currentList });
}
</script>

