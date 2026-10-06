<template>
  <!-- Layer Dynamic Pop-Up Modal (Figma Node 184:6137 & Global Modal UI Style) -->
  <aside 
    v-if="isOpen"
    @click.stop
    @wheel.stop
    class="absolute left-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-left-center no-scrollbar"
    data-node-id="184:6137"
    data-name="Layering Modal"
  >
    <!-- Widget Container & Header (Follows Global Widget Modal UI Style) -->
    <div class="content-stretch flex flex-col gap-[6px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]" data-node-id="184:6139" data-name="Widget Container">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full" data-node-id="184:6140" data-name="Widget Header">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap" data-node-id="184:6141">
          Page {{ editorStore.activePageIndex + 1 }}: Layers
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
          title="Close Layers"
          data-name="carbon:close-large"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500" data-node-id="184:6144">
          Select blocks to assemble your campaign page.
        </p>
        <span 
          v-if="editorStore.isCurrentPageDynamicFit"
          class="font-707 text-[10px] font-medium px-2 py-0.5 rounded bg-black/5 text-neutral-600 tracking-wide uppercase whitespace-nowrap"
        >
          Dynamic Fit (1-Screen): {{ editorStore.currentPage.widget_tree.length }}/3
        </span>
      </div>
    </div>

    <!-- Layers Stack List (Dynamic Height Following Number of Layers) -->
    <div class="content-stretch flex flex-col gap-[12px] items-start p-[24px] shrink-0 w-full" data-node-id="184:6199" data-name="Container">
      <!-- Empty State if no widgets -->
      <div 
        v-if="editorStore.currentPage.widget_tree.length === 0" 
        class="w-full flex flex-col items-center justify-center py-8 text-center text-neutral-400"
      >
        <Layers class="size-7 mb-2 stroke-1 text-neutral-400" />
        <p class="font-707 text-[13px] text-black font-medium">No blocks added yet</p>
        <p class="font-707 text-[12px] text-neutral-500 mt-0.5">Use the "+" tool from bottom dock to add blocks.</p>
      </div>

      <!-- Layer Items List with Dynamic Height and Drag & Drop Reordering -->
      <div 
        v-else 
        class="w-full flex flex-col gap-[10px]"
      >
        <div 
          v-for="(widget, index) in editorStore.currentPage.widget_tree" 
          :key="widget.id"
          draggable="true"
          @dragstart="handleDragStart($event, index)"
          @dragover.prevent="handleDragOver($event, index)"
          @dragleave="handleDragLeave"
          @drop.prevent="handleDrop($event, index)"
          @click="handleSelectLayer(widget)"
          class="group content-stretch flex items-center justify-between p-[12px] rounded-[8px] transition-all cursor-pointer relative border"
          :class="[
            editorStore.selectedWidgetId === widget.id 
              ? 'bg-neutral-100 border-black shadow-sm' 
              : (hoveredIndex === index ? 'bg-neutral-50 border-neutral-300' : 'bg-[#fafafa] hover:bg-neutral-50 border-[#ededed] hover:border-neutral-300'),
            dragOverIndex === index ? 'border-t-2 border-t-black' : ''
          ]"
          @mouseenter="hoveredIndex = index"
          @mouseleave="hoveredIndex = null"
          data-node-id="184:6172"
          data-name="Media Header"
        >
          <!-- Left Drag Grip & Content Stack (Figma Node 184:6179) -->
          <div class="flex items-center gap-[14px] min-w-0 flex-1">
            <!-- Grip Dots Icon (Figma Node 184:6182) -->
            <div 
              class="size-[24px] text-neutral-400 group-hover:text-black flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing transition-colors" 
              title="Drag to reorder layer"
            >
              <GripVertical class="size-[18px]" />
            </div>

            <!-- Content Title & Subheadline -->
            <div class="flex flex-col gap-[2px] items-start text-black min-w-0" data-node-id="184:6179" data-name="Content">
              <p class="font-707 font-medium text-[14px] leading-[18px] truncate w-full" data-node-id="184:6176">
                {{ isTicketPage ? 'Block' : 'Widget' }} {{ index + 1 }}: {{ getWidgetDisplayName(widget) }}
              </p>
              <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500 uppercase tracking-wider truncate w-full" data-node-id="184:6177">
                {{ getWidgetSummary(widget) }}
              </p>
            </div>
          </div>

          <!-- Quick Action Buttons on Hover -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
            <!-- Edit / Adjust -->
            <button 
              type="button"
              @click.stop="handleAdjustLayer(widget)"
              class="apple-glass-icon-btn size-[26px] flex items-center justify-center rounded-[6px] text-black cursor-pointer"
              title="Adjust / Setup"
            >
              <SlidersHorizontal class="w-3.5 h-3.5" />
            </button>

            <!-- Duplicate -->
            <button 
              type="button"
              @click.stop="editorStore.duplicateWidget(widget.id)"
              class="apple-glass-icon-btn size-[26px] flex items-center justify-center rounded-[6px] text-black cursor-pointer"
              title="Duplicate"
            >
              <Copy class="w-3.5 h-3.5" />
            </button>

            <!-- Delete -->
            <button 
              type="button"
              @click.stop="editorStore.removeWidget(widget.id)"
              class="apple-glass-icon-btn size-[26px] hover:text-red-600 flex items-center justify-center rounded-[6px] text-black cursor-pointer"
              title="Remove"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
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
import type { WidgetItem } from '../../types/editor.ts';
import { GripVertical, SlidersHorizontal, Copy, Trash2, Layers } from 'lucide-vue-next';
import { ticketFieldMeta } from './ticket/ticketFields.ts';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const draggedItemIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);
const hoveredIndex = ref<number | null>(null);
const isTicketPage = computed(() => editorStore.currentPage?.kind === 'ticket');

/** "Guest Name + Guest Type", "QR Code", "Access ID + 2 more" — what a ticket data block shows. */
function ticketFieldsLabel(widget: WidgetItem): string {
  const fields: string[] = Array.isArray(widget.props?.fields) ? widget.props.fields : [];
  const labels = fields.map(f => ticketFieldMeta(f).label);
  if (!labels.length) return 'Ticket Data';
  if (labels.length <= 2) return labels.join(' + ');
  return `${labels.slice(0, 2).join(' + ')} + ${labels.length - 2} more`;
}

function ratioLabel(ratio?: string): string {
  if (!ratio || ratio === 'Full screen landing page') return 'Full screen';
  return ratio;
}

/** File name of an image URL, for telling banners apart. */
function imageName(url?: string): string {
  if (!url || url.startsWith('data:')) return url ? 'UPLOADING IMAGE' : '';
  const file = url.split('?')[0].split('/').pop() || '';
  return file.replace(/^upload_\d+_/, '').replace(/^inline_/, '');
}

function getWidgetDisplayName(widget: WidgetItem): string {
  switch (widget.type) {
    case 'TicketField':
      return ticketFieldsLabel(widget);
    case 'TextBanner':
      return widget.props.text ? 'Text' : 'Text (empty)';
    case 'ActionButton':
      return 'Action Button';
    case 'MultipleChoice':
      return 'Choice Options';
    case 'RegistrationForm':
      return 'Registration Form';
    case 'ModalOverlay':
      return 'Pop Up Modal';
    case 'FieldInput':
      return widget.props.label ? `${widget.props.label} Field` : 'Form Input';
    case 'HeroDrop':
      if (widget.props.ratio === 'Buttons') return 'Button CTA';
      return isTicketPage.value ? `Banner ${ratioLabel(widget.props.ratio === 'Full screen landing page' || widget.props.ratio === 'Dynamic Fit' ? '16:9' : widget.props.ratio)}` : `Hero Banner ${ratioLabel(widget.props.ratio)}`;
    case 'RaffleForm':
      return 'Raffle Form';
    case 'RsvpForm':
      return 'RSVP Activation';
    case 'CountdownTimer':
      return 'Countdown Timer';
    case 'LookbookCarousel':
      return 'Lookbook Carousel';
    case 'ProductGrid':
      return 'Product Grid';
    case 'RulesAccordion':
      return 'Rules Accordion';
    case 'LocationCard':
      return 'Location Card';
    case 'GuestEPass':
      return 'Guest E-Pass';
    default:
      return widget.type;
  }
}

function getWidgetSummary(widget: WidgetItem): string {
  switch (widget.type) {
    case 'TicketField': {
      const fields: string[] = Array.isArray(widget.props?.fields) ? widget.props.fields : [];
      const kind = fields.length === 1 && ticketFieldMeta(fields[0]).solo ? 'TICKET BLOCK' : `TICKET DATA · ${fields.length} FIELD${fields.length === 1 ? '' : 'S'}`;
      const align = widget.props?.align && widget.props.align !== 'left' ? ` · ${String(widget.props.align).toUpperCase()}` : '';
      return kind + align;
    }
    case 'GuestEPass':
      return widget.props.heading ? widget.props.heading.replace(/\n/g, ' ') : 'GUEST E-PASS SUMMARY';
    case 'TextBanner':
      return widget.props.text ? String(widget.props.text).replace(/\n/g, ' ') : 'NO TEXT YET';
    case 'ActionButton':
      return widget.props.label || 'BUTTON CTA';
    case 'MultipleChoice':
      return widget.props.title || widget.props.subtitle || 'MULTIPLE CHOICE OPTIONS';
    case 'RegistrationForm':
      return widget.props.title || widget.props.subtitle || 'REGISTRATION FORM';
    case 'ModalOverlay':
      return widget.props.title || 'POP UP MODAL OVERLAY';
    case 'FieldInput':
      return widget.props.placeholder || widget.props.label || 'INPUT FIELD';
    case 'HeroDrop':
      if (widget.props.ratio === 'Buttons') {
        return widget.props.buttonText || widget.props.ctaLabel || 'ACTION CTA';
      }
      return widget.props.headline || widget.props.title
        || (widget.props.isSolidSpace || !widget.props.imageUrl ? 'NO IMAGE YET' : imageName(widget.props.imageUrl).toUpperCase());
    case 'RaffleForm':
      return widget.props.heading || widget.props.title || 'REGISTRATION FORM';
    case 'RsvpForm':
      return widget.props.heading || 'TENNIS COURT RSVP & SIZING';
    case 'CountdownTimer':
      return widget.props.targetDate ? `DROP DATE: ${widget.props.targetDate}` : 'COUNTDOWN TIMER ACTIVE';
    default:
      return widget.props.headline || widget.props.title || widget.props.label || 'CAMPAIGN BLOCK';
  }
}

function handleSelectLayer(widget: WidgetItem) {
  editorStore.selectWidget(widget.id);
  if (widget.type === 'HeroDrop') {
    editorStore.openMediaSidebar(widget.props.ratio || 'Full screen landing page');
  } else if (widget.type === 'TextBanner') {
    editorStore.openTextSidebar();
  } else if (widget.type === 'ActionButton') {
    editorStore.openButtonSidebar();
  } else if (widget.type === 'MultipleChoice') {
    editorStore.openChoiceSidebar();
  } else if (widget.type === 'RegistrationForm') {
    editorStore.openFormSidebar();
  } else if (widget.type === 'ModalOverlay') {
    editorStore.openModalSidebar();
  } else if (widget.type === 'GuestEPass') {
    editorStore.openEPassSidebar();
  } else if (widget.type === 'TicketField') {
    editorStore.openTicketSidebar();
  }
}

function handleAdjustLayer(widget: WidgetItem) {
  editorStore.selectWidget(widget.id);
  if (widget.type === 'HeroDrop') {
    editorStore.openMediaSidebar(widget.props.ratio || 'Full screen landing page');
  } else if (widget.type === 'TextBanner') {
    editorStore.openTextSidebar();
  } else if (widget.type === 'ActionButton') {
    editorStore.openButtonSidebar();
  } else if (widget.type === 'MultipleChoice') {
    editorStore.openChoiceSidebar();
  } else if (widget.type === 'RegistrationForm') {
    editorStore.openFormSidebar();
  } else if (widget.type === 'ModalOverlay') {
    editorStore.openModalSidebar();
  } else if (widget.type === 'GuestEPass') {
    editorStore.openEPassSidebar();
  } else if (widget.type === 'TicketField') {
    editorStore.openTicketSidebar();
  }
}

function handleDragStart(event: DragEvent, index: number) {
  draggedItemIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());
  }
}

function handleDragOver(_event: DragEvent, index: number) {
  dragOverIndex.value = index;
}

function handleDragLeave() {
  dragOverIndex.value = null;
}

function handleDrop(_event: DragEvent, targetIndex: number) {
  if (draggedItemIndex.value !== null && draggedItemIndex.value !== targetIndex) {
    editorStore.moveWidget(draggedItemIndex.value, targetIndex);
  }
  draggedItemIndex.value = null;
  dragOverIndex.value = null;
}
</script>
