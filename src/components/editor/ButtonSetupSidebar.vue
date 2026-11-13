<template>
  <!-- Button Setup Sidebar Menu (Matching TextSetupSidebar.vue vertical centering) -->
  <aside 
    v-if="isOpen && targetWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:w-full max-sm:max-w-none max-sm:min-h-0 max-sm:max-h-[82vh] max-sm:rounded-b-none max-sm:rounded-t-[20px] max-sm:border-x-0 max-sm:border-b-0 max-sm:shadow-[0_-16px_40px_rgba(0,0,0,0.18)] sm:absolute sm:right-[24px] sm:top-1/2 sm:-translate-y-1/2 sm:w-[464px] sm:min-h-[460px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.95)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[20px] sm:rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all sm:animate-apple-slide-right-center max-sm:animate-apple-slide-up no-scrollbar"
    data-node-id="244:11560"
    data-name="Button Setup Sidebar"
  >
    <!-- Mobile Sheet Drag Handle Pill -->
    <div class="sm:hidden w-10 h-1 bg-black/20 rounded-full mx-auto my-2.5 shrink-0 self-center" />
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] pb-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Button
          </p>
          <span 
            v-if="targetWidget.props?.layoutMode === 'dual'"
            class="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-full bg-black/5 text-neutral-600 border border-black/10"
          >
            Dual
          </span>
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

    <!-- TAB 1: CONTENT -->
    <div v-show="activeTab === 'content'" class="w-full flex flex-col">
      <CtaButtonConfigSections :widget="targetWidget" section="content" />
    </div>

    <!-- TAB 2: STYLE & LAYOUT -->
    <div v-show="activeTab === 'style'" class="w-full flex flex-col">
      <CtaButtonConfigSections
        :widget="targetWidget"
        section="style"
        :should-show-style-presets="shouldShowStylePresets"
      />
    </div>

    <!-- TAB 3: ACTION & LINK -->
    <div v-show="activeTab === 'action'" class="w-full flex flex-col">
      <CtaButtonConfigSections :widget="targetWidget" section="action" control-width-class="w-[210px]" />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Type, Layout, Link2 } from 'lucide-vue-next';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import CtaButtonConfigSections from './CtaButtonConfigSections.vue';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

type TabType = 'content' | 'style' | 'action';
const activeTab = ref<TabType>('content');
const tabs = [
  { id: 'content' as const, label: 'Content', icon: Type },
  { id: 'style' as const, label: 'Style', icon: Layout },
  { id: 'action' as const, label: 'Action', icon: Link2 }
];

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const targetWidget = computed(() => {
  if (editorStore.selectedWidget && (editorStore.selectedWidget.type === 'ActionButton' || editorStore.selectedWidget.type === 'HeroDrop')) {
    return editorStore.selectedWidget;
  }
  const local = editorStore.currentPage.widget_tree.find(w => w.type === 'ActionButton') || null;
  if (local) return local;

  for (const p of editorStore.pages) {
    const btn = p.widget_tree.find(w => w.type === 'ActionButton' && w.props?.positionMode === 'sticky-bottom');
    if (btn) {
      const scope = btn.props?.stickyScope || 'current';
      if (scope === 'all' || (scope === 'custom' && (btn.props?.stickyPageIds || []).includes(editorStore.currentPage.id))) {
        return btn;
      }
    }
  }
  return null;
});

const originPageIndex = computed(() => {
  if (!targetWidget.value) return -1;
  return editorStore.pages.findIndex(p => p.widget_tree.some(w => w.id === targetWidget.value?.id));
});

const isMultiPageButton = computed(() => {
  const w = targetWidget.value;
  if (!w || w.type === 'HeroDrop') return false;
  if ((w.props?.positionMode || 'in-flow') !== 'sticky-bottom') return false;
  const scope = w.props?.stickyScope || 'current';
  if (scope === 'all') return true;
  if (scope === 'custom') {
    return (w.props?.stickyPageIds || []).length > 1;
  }
  return false;
});

const isOtherPage = computed(() => {
  if (originPageIndex.value === -1) return false;
  return editorStore.activePageIndex !== originPageIndex.value;
});

const shouldShowStylePresets = computed(() => {
  return !(isMultiPageButton.value && isOtherPage.value);
});
</script>
