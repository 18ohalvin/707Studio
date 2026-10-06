<template>
  <!-- Ticket data block setup (Ticket page) -->
  <aside
    v-if="isOpen && currentWidget"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-name="Ticket Data Setup Sidebar"
  >
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <Ticket class="size-4 text-black" />
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">Ticket Data Block</p>
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
        Shows guest data on the PDF ticket. Each guest's own details are filled in when they download it — the canvas shows sample data in the same format.
      </p>
    </div>

    <!-- Data in this block: pick any combination -->
    <div class="flex flex-col gap-[12px] items-start p-[24px] w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Data in this block</p>
        <p class="font-707 text-[11px] text-neutral-500">
          Pick as many as you like — they line up two per row. QR Code, Access Valid For and Brand Logo stand alone in their block.
        </p>
      </div>
      <div class="grid grid-cols-3 gap-1.5 w-full">
        <button
          v-for="f in TICKET_FIELDS"
          :key="f.key"
          type="button"
          @click="toggleField(f.key)"
          :class="fields.includes(f.key) ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[34px] rounded-[8px] text-[11px] font-707 flex items-center justify-center gap-1 text-center px-1 cursor-pointer transition-all"
          :aria-pressed="fields.includes(f.key)"
        >
          <Check v-if="fields.includes(f.key)" class="w-3 h-3 shrink-0" />
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Captions -->
    <div v-if="captionFields.length" class="flex flex-col gap-[12px] items-start p-[24px] w-full border-b border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Caption</p>
      <div v-for="key in captionFields" :key="key" class="flex flex-col gap-[6px] w-full">
        <p class="font-707 text-[11px] text-neutral-500">{{ ticketFieldMeta(key).label }}</p>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input
            :value="captionOf(key)"
            @input="setCaption(key, ($event.target as HTMLInputElement).value)"
            :placeholder="ticketFieldMeta(key).caption"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>
    </div>

    <!-- Logo height (only for a block that shows the brand logo) -->
    <div v-if="fields.includes('brandLogo')" class="flex flex-col gap-[10px] items-start p-[24px] w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Logo Height</p>
        <div class="flex items-center gap-1.5">
          <span class="font-707 text-[12px] text-black tabular-nums">{{ logoHeight }}px</span>
          <button
            v-if="logoHeight !== TICKET_LOGO_HEIGHT.default"
            type="button"
            @click="update({ logoHeight: TICKET_LOGO_HEIGHT.default })"
            class="h-[26px] px-2 rounded-[6px] text-[11px] font-707 text-neutral-600 hover:text-black hover:bg-black/5 cursor-pointer"
          >Reset</button>
        </div>
      </div>
      <input
        type="range"
        :min="TICKET_LOGO_HEIGHT.min"
        :max="TICKET_LOGO_HEIGHT.max"
        step="1"
        :value="logoHeight"
        @input="update({ logoHeight: clampLogoHeight(($event.target as HTMLInputElement).value, TICKET_LOGO_HEIGHT) })"
        class="w-full accent-black cursor-pointer"
        aria-label="Ticket logo height"
      />
    </div>

    <!-- Alignment -->
    <div class="flex flex-col gap-[12px] items-start p-[24px] w-full border-b border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Alignment</p>
      <div class="grid grid-cols-3 gap-1.5 w-full">
        <button
          v-for="a in (['left', 'center', 'right'] as const)"
          :key="a"
          type="button"
          @click="update({ align: a })"
          :class="(currentWidget.props?.align || 'left') === a ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[34px] rounded-[8px] text-[11px] font-707 capitalize flex items-center justify-center cursor-pointer transition-all"
        >
          {{ a }}
        </button>
      </div>
    </div>

    <!-- Remove this block -->
    <div class="flex items-center justify-between gap-3 px-[24px] pt-[20px] w-full">
      <p class="font-707 text-[11.5px] text-neutral-500">Don't need this block on the ticket?</p>
      <button
        type="button"
        @click="removeBlock"
        class="h-[32px] px-3 rounded-[8px] border border-red-200 text-red-700 hover:bg-red-50 text-[12px] font-707 font-medium flex items-center gap-1.5 cursor-pointer"
      >
        <Trash2 class="w-3.5 h-3.5" /> Remove block
      </button>
    </div>

    <!-- Add more -->
    <div class="flex flex-col gap-[12px] items-start p-[24px] w-full">
      <div class="flex flex-col">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Add another block</p>
        <p class="font-707 text-[11px] text-neutral-500">Banners are image blocks (upload or gallery); text comes from the Widget menu as on any page.</p>
      </div>
      <div class="flex flex-wrap gap-1.5 w-full">
        <button
          type="button"
          @click="addBanner"
          class="apple-glass-btn-dark h-[30px] px-2.5 rounded-[8px] text-[11px] font-707 font-medium flex items-center gap-1 cursor-pointer"
        >
          <ImageIcon class="w-3 h-3" /> Banner
        </button>
        <button
          v-for="f in TICKET_FIELDS"
          :key="f.key"
          type="button"
          @click="addBlock(f.key)"
          class="apple-glass-btn h-[30px] px-2.5 rounded-[8px] text-[11px] font-707 flex items-center gap-1 cursor-pointer"
        >
          <Plus class="w-3 h-3" /> {{ f.label }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { clampLogoHeight, TICKET_LOGO_HEIGHT } from './logoSize.ts';
import { computed } from 'vue';
import { Ticket, Plus, Check, Trash2, Image as ImageIcon } from 'lucide-vue-next';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { TICKET_FIELDS, ticketFieldMeta, type TicketFieldKey } from './ticket/ticketFields.ts';

defineProps<{ isOpen: boolean }>();
defineEmits<{ (e: 'close'): void }>();

const editorStore = useEditorStore();

const currentWidget = computed(() => {
  const w = editorStore.selectedWidget;
  return w && w.type === 'TicketField' ? w : null;
});

const fields = computed<TicketFieldKey[]>(() => {
  const raw = currentWidget.value?.props?.fields;
  return (Array.isArray(raw) && raw.length ? raw : ['guestName']) as TicketFieldKey[];
});
const logoHeight = computed(() => clampLogoHeight(currentWidget.value?.props?.logoHeight, TICKET_LOGO_HEIGHT));
const captionFields = computed(() => fields.value.filter(k => ticketFieldMeta(k).caption));

function update(props: Record<string, any>) {
  if (currentWidget.value) editorStore.updateWidgetProps(currentWidget.value.id, props);
}

/**
 * Text fields combine freely; QR, sessions and logo need the block to
 * themselves. Turning off the last field removes nothing — use Remove block.
 */
function toggleField(key: TicketFieldKey) {
  const solo = Boolean(ticketFieldMeta(key).solo);
  const current = fields.value;
  if (current.includes(key)) {
    if (current.length === 1) {
      editorStore.showToast('A block shows at least one item — use Remove block to take it off the ticket.');
      return;
    }
    update({ fields: current.filter(k => k !== key) });
    return;
  }
  if (solo) {
    update({ fields: [key] });
    return;
  }
  const textOnly = current.filter(k => !ticketFieldMeta(k).solo);
  update({ fields: [...textOnly, key] });
}

function removeBlock() {
  if (!currentWidget.value) return;
  editorStore.removeWidget(currentWidget.value.id);
  editorStore.isTicketSidebarOpen = false;
}

function captionOf(key: string): string {
  return currentWidget.value?.props?.captions?.[key] ?? '';
}

function setCaption(key: string, value: string) {
  update({ captions: { ...(currentWidget.value?.props?.captions || {}), [key]: value.toUpperCase() } });
}

function addBanner() {
  const index = currentWidget.value
    ? editorStore.currentPage.widget_tree.findIndex(w => w.id === currentWidget.value!.id) + 1
    : undefined;
  editorStore.addMediaBannerWidget('16:9', index);
}

function addBlock(key: TicketFieldKey) {
  const index = currentWidget.value
    ? editorStore.currentPage.widget_tree.findIndex(w => w.id === currentWidget.value!.id) + 1
    : undefined;
  editorStore.addWidget('TicketField', index, { fields: [key], align: currentWidget.value?.props?.align || 'left' });
}
</script>
