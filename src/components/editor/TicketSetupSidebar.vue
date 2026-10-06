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

    <!-- Field -->
    <div class="flex flex-col gap-[12px] items-start p-[24px] w-full border-b border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Data shown</p>
      <div class="grid grid-cols-3 gap-1.5 w-full">
        <button
          v-for="f in TICKET_FIELDS"
          :key="f.key"
          type="button"
          @click="setPrimary(f.key)"
          :class="primary === f.key ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[34px] rounded-[8px] text-[11px] font-707 flex items-center justify-center text-center px-1 cursor-pointer transition-all"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Second field side by side -->
    <div class="flex flex-col gap-[12px] items-start p-[24px] w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Beside it</p>
        <p class="font-707 text-[11px] text-neutral-500">
          {{ primaryIsSolo ? `${primaryMeta.label} takes the full width.` : 'Optional — a second field in the same row, like Name + Guest Type.' }}
        </p>
      </div>
      <div v-if="!primaryIsSolo" class="grid grid-cols-3 gap-1.5 w-full">
        <button
          type="button"
          @click="setSecondary('')"
          :class="!secondary ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[34px] rounded-[8px] text-[11px] font-707 flex items-center justify-center cursor-pointer transition-all"
        >
          Nothing
        </button>
        <button
          v-for="f in pairableFields"
          :key="f.key"
          type="button"
          @click="setSecondary(f.key)"
          :class="secondary === f.key ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[34px] rounded-[8px] text-[11px] font-707 flex items-center justify-center text-center px-1 cursor-pointer transition-all"
        >
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

    <!-- Add more -->
    <div class="flex flex-col gap-[12px] items-start p-[24px] w-full">
      <div class="flex flex-col">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">Add another block</p>
        <p class="font-707 text-[11px] text-neutral-500">Text and images can be added from the Widget menu as on any page.</p>
      </div>
      <div class="flex flex-wrap gap-1.5 w-full">
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
import { computed } from 'vue';
import { Ticket, Plus } from 'lucide-vue-next';
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
const primary = computed(() => fields.value[0]);
const secondary = computed(() => fields.value[1] || '');
const primaryMeta = computed(() => ticketFieldMeta(primary.value));
const primaryIsSolo = computed(() => Boolean(primaryMeta.value.solo));
const pairableFields = computed(() => TICKET_FIELDS.filter(f => !f.solo && f.key !== primary.value));
const captionFields = computed(() => fields.value.filter(k => ticketFieldMeta(k).caption));

function update(props: Record<string, any>) {
  if (currentWidget.value) editorStore.updateWidgetProps(currentWidget.value.id, props);
}

function setPrimary(key: TicketFieldKey) {
  const solo = ticketFieldMeta(key).solo;
  const keepSecond = !solo && secondary.value && secondary.value !== key ? [secondary.value] : [];
  update({ fields: [key, ...keepSecond] });
}

function setSecondary(key: TicketFieldKey | '') {
  update({ fields: key ? [primary.value, key] : [primary.value] });
}

function captionOf(key: string): string {
  return currentWidget.value?.props?.captions?.[key] ?? '';
}

function setCaption(key: string, value: string) {
  update({ captions: { ...(currentWidget.value?.props?.captions || {}), [key]: value.toUpperCase() } });
}

function addBlock(key: TicketFieldKey) {
  const index = currentWidget.value
    ? editorStore.currentPage.widget_tree.findIndex(w => w.id === currentWidget.value!.id) + 1
    : undefined;
  editorStore.addWidget('TicketField', index, { fields: [key], align: currentWidget.value?.props?.align || 'left' });
}
</script>
