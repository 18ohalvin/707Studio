<template>
  <!-- Widget Left Sidebar Menu (Figma Node 74:182) -->
  <aside 
    v-if="isOpen"
    @click.stop
    @wheel.stop
    class="absolute left-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[32px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-left-center no-scrollbar"
    data-node-id="74:182"
    data-name="Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col gap-[6px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
          Widget
        </p>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
      <p class="font-707 font-normal text-[12px] leading-[16px] text-neutral-500">
        Select blocks to assemble your campaign page.
      </p>
    </div>

    <!-- Section 1: Media/Banners -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Media/Banners
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] pb-2 no-scrollbar">
        <!-- Full screen landing cover (Scrollable) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: 'Full Screen (Scrollable)', customProps: { ratio: 'Full screen landing page', isSolidSpace: true, subtitle: 'FULL SCREEN (SCROLLABLE)' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('Full screen landing page')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[96px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (100vh hero for multi-section scrollable page)"
        >
          <div class="bg-[#dcdcdc] group-hover:bg-[#cecece] h-[130px] rounded-[8px] shrink-0 w-[72px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Full Screen (Scrollable)
          </p>
        </div>

        <!-- Dynamic Fit (Responsive 1-Screen) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: 'Dynamic Fit (1-Screen)', customProps: { ratio: 'Dynamic Fit', isSolidSpace: true, subtitle: 'DYNAMIC FIT (1-SCREEN)' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('Dynamic Fit')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[96px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add (Adaptive 1-screen fit without scrolling)"
        >
          <div class="bg-[#dcdcdc] group-hover:bg-[#cecece] h-[130px] rounded-[8px] shrink-0 w-[72px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden flex flex-col justify-between p-2">
            <div class="w-full h-2 bg-black/20 rounded-full" />
            <div class="w-full flex flex-col gap-1">
              <div class="w-3/4 h-1.5 bg-black/20 rounded-full" />
              <div class="w-full h-3 bg-black/30 rounded-xs" />
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Dynamic Fit (1-Screen)
          </p>
        </div>

        <!-- 3:4 -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '3:4', customProps: { ratio: '3:4', isSolidSpace: true, subtitle: '3:4 RATIO COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('3:4')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[96px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="bg-[#dcdcdc] group-hover:bg-[#cecece] h-[130px] rounded-[8px] shrink-0 w-[96px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            3:4
          </p>
        </div>

        <!-- 4:5 -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '4:5', customProps: { ratio: '4:5', isSolidSpace: true, subtitle: '4:5 RATIO COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('4:5')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[100px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-center justify-center shrink-0 w-full">
            <div class="aspect-[4/5] h-[130px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[8px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            4:5
          </p>
        </div>

        <!-- 4:3 -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '4:3', customProps: { ratio: '4:3', isSolidSpace: true, subtitle: '4:3 RATIO COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('4:3')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[100px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-start justify-center shrink-0 w-full">
            <div class="aspect-[40/30] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[8px] shrink-0 w-full transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            4:3
          </p>
        </div>

        <!-- 16:9 -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '16:9', customProps: { ratio: '16:9', isSolidSpace: true, subtitle: '16:9 RATIO BANNER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('16:9')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[100px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-start justify-center shrink-0 w-full">
            <div class="aspect-video bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[8px] shrink-0 w-full transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            16:9
          </p>
        </div>

        <!-- 9:16 -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '9:16', customProps: { ratio: '9:16', isSolidSpace: true, subtitle: '9:16 STORY BANNER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('9:16')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[100px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-center justify-center shrink-0 w-full">
            <div class="w-[72px] h-[130px] bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[8px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            9:16
          </p>
        </div>

        <!-- 1:1 -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: '1:1', customProps: { ratio: '1:1', isSolidSpace: true, subtitle: '1:1 SQUARE BANNER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('1:1')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[100px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-start justify-center shrink-0 w-full">
            <div class="bg-[#dcdcdc] group-hover:bg-[#cecece] rounded-[8px] shrink-0 size-[100px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            1:1
          </p>
        </div>
      </div>
    </div>

    <!-- Section 2: Add Form Inputs -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Add Form Inputs
        </p>
      </div>

      <!-- Filter Buttons (Category Pills) -->
      <div class="content-stretch flex gap-[6px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar pb-[8px]">
        <button 
          v-for="tab in formTabs" 
          :key="tab"
          @click="selectedFormTab = tab"
          :class="selectedFormTab === tab ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
          class="h-[34px] items-center justify-center px-[12px] py-[6px] rounded-[8px] shrink-0 font-707 text-[12px] whitespace-nowrap cursor-pointer"
        >
          {{ tab }}
        </button>
      </div>

      <!-- Form Field Options Grid -->
      <div class="content-stretch flex gap-[12px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] pt-[6px] pb-[8px] no-scrollbar">
        <div 
          v-for="field in currentTabFields" 
          :key="field.name"
          draggable="true"
          @dragstart="handleFieldDragStart($event, field.name)"
          @dragend="handleDragEnd"
          @click="addFormField(field.name)"
          class="flex flex-col gap-[6px] items-center shrink-0 w-[56px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="size-[38px] rounded-full bg-[#f5f5f5] group-hover:bg-black group-hover:border-black border border-[#d9d9d9] flex items-center justify-center transition-all duration-150 shadow-sm text-black group-hover:text-white shrink-0">
            <component :is="field.icon" class="size-4 stroke-[1.75] transition-colors" />
          </div>
          <p class="font-707 font-normal text-[10px] text-black group-hover:font-medium text-center leading-tight transition-colors">
            {{ field.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Section 3: Action Button (Figma Node 244:11560) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Action Button
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar pb-[4px]">
        <!-- Action Button 1: Standard Black Button (Figma Node 176:5763) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'ActionButton', label: 'Black Action Button', customProps: { label: 'BUTTON CTA', variant: 'black', actionType: 'submit', height: 48 } })"
          @dragend="handleDragEnd"
          @click="addActionButton('black')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col items-center justify-center h-[76px] rounded-[8px] shrink-0 w-[112px] bg-white group-hover:border-black transition-colors shadow-sm px-2.5 overflow-hidden">
            <div class="w-full bg-black text-white h-[32px] rounded-[0px] flex items-center justify-center font-707 font-medium text-[10px] tracking-normal uppercase px-2 shadow-sm">
              Button CTA
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Black Button
          </p>
        </div>

        <!-- Action Button 2: Standard White Button (Figma Node 176:5741) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'ActionButton', label: 'White Action Button', customProps: { label: 'BUTTON CTA', variant: 'white', actionType: 'submit', height: 48 } })"
          @dragend="handleDragEnd"
          @click="addActionButton('white')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col items-center justify-center h-[76px] rounded-[8px] shrink-0 w-[112px] bg-white group-hover:border-black transition-colors shadow-sm px-2.5 overflow-hidden">
            <div class="w-full bg-[#f2f2f2] text-black h-[32px] rounded-[0px] flex items-center justify-center font-707 font-medium text-[10px] tracking-normal uppercase px-2 shadow-none border-0 border-none outline-none">
              Button CTA
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            White Button
          </p>
        </div>
      </div>
    </div>

    <!-- Section 4: Interactive & Activations -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Interactive & Activations
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start overflow-x-auto -mx-[24px] px-[24px] w-[calc(100%+48px)] no-scrollbar">
        <!-- Interactive Card 1: Tennis Court / Sneaker Sizing Grid -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RsvpForm', label: 'Sneaker Sizing & Court Selector', customProps: { heading: 'TENNIS COURT RSVP & SIZING' } })"
          @dragend="handleDragEnd"
          @click="addInteractiveWidget('Sneaker Sizing & Court Selector')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col gap-[8px] h-[130px] items-center justify-center rounded-[8px] shrink-0 w-[84px] bg-white group-hover:border-black transition-colors relative overflow-hidden shadow-sm">
            <div class="bg-[#d9d9d9] h-[64px] rounded-[6px] w-[50px] relative flex flex-col items-center justify-center p-1.5">
              <div class="grid grid-cols-2 gap-1 w-full">
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
                <div class="bg-[#aaa] rounded-sm size-2.5"></div>
              </div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Tennis Court Picker
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { WidgetType, ModalVariant } from '../../types/editor.ts';
import { 
  User, 
  Mail, 
  Phone, 
  Cake, 
  Users, 
  UserCheck, 
  Instagram, 
  Type, 
  Hash, 
  AlignLeft, 
  MapPin, 
  ChevronDown, 
  Footprints, 
  CheckSquare, 
  CircleDot, 
  ListChecks, 
  Calendar, 
  Clock, 
  Ticket, 
  CalendarCheck,
  LayoutGrid,
  Image as ImageIcon
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();

const formTabs = ['Contacts', 'General', 'Choices', 'Dates', 'Scheduling'];
const selectedFormTab = ref('Contacts');

const currentTabFields = computed(() => {
  switch (selectedFormTab.value) {
    case 'General':
      return [
        { name: 'Text Input', icon: Type },
        { name: 'Number', icon: Hash },
        { name: 'Long Text', icon: AlignLeft },
        { name: 'Address', icon: MapPin },
        { name: 'Dropdown', icon: ChevronDown }
      ];
    case 'Choices':
      return [
        { name: 'Detailed Cards', icon: Ticket },
        { name: 'Simple Rows', icon: ListChecks },
        { name: 'Horizontal Blocks', icon: LayoutGrid },
        { name: 'Image Matrix', icon: ImageIcon }
      ];
    case 'Dates':
      return [
        { name: 'Birthday', icon: Cake },
        { name: 'Event Date', icon: Calendar },
        { name: 'Countdown', icon: Clock }
      ];
    case 'Scheduling':
      return [
        { name: 'Session Slot', icon: CalendarCheck },
        { name: 'RSVP Pass', icon: Ticket },
        { name: 'Time Window', icon: Clock }
      ];
    case 'Contacts':
    default:
      return [
        { name: 'First Name', icon: User },
        { name: 'Last Name', icon: User },
        { name: 'Email', icon: Mail },
        { name: 'WhatsApp Number', icon: Phone },
        { name: 'National ID / KTP', icon: UserCheck },
        { name: 'Instagram Handle', icon: Instagram }
      ];
  }
});

function handleDragStart(event: DragEvent, item: { type: WidgetType; label?: string; customProps?: Record<string, any> }) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('application/json', JSON.stringify(item));
    event.dataTransfer.setData('text/plain', item.type);
  }
  editorStore.draggedWidget = item;
}

function handleDragEnd() {
  editorStore.draggedWidget = null;
  editorStore.isDraggingOverCanvas = false;
}

function addMediaWidget(ratio: string) {
  editorStore.addMediaBannerWidget(ratio);
}

function addTextWidget() {
  editorStore.addWidget('TextBanner', undefined, { text: '', placeholder: 'WRITE YOUR TEXT HERE' });
}

function getChoiceDefaultProps(choiceName: string) {
  switch (choiceName) {
    case 'Detailed Cards':
    case 'Detailed Card':
    case 'Checkbox':
      return {
        title: 'SELECT ARRIVALS',
        subtitle: 'Choose your preferred attendance day below.',
        variant: 'detailed-card',
        allowMultiple: true,
        required: false,
        showSlotsCapacity: true,
        globalSlotsCapacity: 25,
        selectedValues: [],
        options: [
          {
            id: 'opt_1',
            label: 'Pass Option 1',
            sublabel: '24 Oct 2026',
            description: 'Access to activation area and special event lounge'
          },
          {
            id: 'opt_2',
            label: 'Pass Option 2',
            sublabel: '25 Oct 2026',
            description: 'Access to activation area and special event lounge'
          }
        ]
      };
    case 'Simple Rows':
    case 'Simple Row':
    case 'Radio Group':
      return {
        title: 'SELECT APPAREL SIZE',
        subtitle: 'Choose your preferred size below.',
        variant: 'simple-row',
        allowMultiple: true,
        required: false,
        showSlotsCapacity: true,
        globalSlotsCapacity: 25,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'S' },
          { id: 'opt_2', label: 'M' },
          { id: 'opt_3', label: 'L' }
        ]
      };
    case 'Horizontal Blocks':
    case 'Horizontal Block':
    case 'Sneaker Size':
      return {
        title: 'SELECT YOUR SESSIONS',
        subtitle: 'Choose your preferred sessions below.',
        variant: 'horizontal-block',
        allowMultiple: true,
        required: false,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'Morning' },
          { id: 'opt_2', label: 'Afternoon' }
        ]
      };
    case 'Image Matrix':
    case 'Image Grid':
    case 'Multi Choice':
    default:
      return {
        title: 'SELECT YOUR MODEL',
        subtitle: 'Choose your preferred model below.',
        variant: 'image-grid',
        gridColumns: 4,
        allowMultiple: true,
        required: false,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'Model 01', imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=300&q=80' },
          { id: 'opt_2', label: 'Model 02', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80' },
          { id: 'opt_3', label: 'Model 03', imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&q=80' }
        ]
      };
  }
}

function handleFieldDragStart(event: DragEvent, fieldName: string) {
  if (selectedFormTab.value === 'Choices') {
    handleDragStart(event, {
      type: 'MultipleChoice',
      label: fieldName,
      customProps: getChoiceDefaultProps(fieldName)
    });
  } else {
    handleDragStart(event, {
      type: 'FieldInput',
      label: fieldName,
      customProps: getFieldDefaultProps(fieldName)
    });
  }
}

function getFieldDefaultProps(fieldName: string) {
  const isEmail = fieldName.toLowerCase().includes('email');
  const isWa = fieldName.toLowerCase().includes('whatsapp') || fieldName.toLowerCase().includes('phone');
  const label = fieldName;
  const placeholder = `${fieldName}*`;
  return {
    label,
    placeholder,
    value: '',
    required: true,
    countryCode: isWa ? '+62' : undefined,
    inputType: isEmail ? 'email' : (isWa ? 'tel' : 'text'),
    stateVariant: 'Default',
    errorMessage: isEmail 
      ? 'Please enter a valid email address with @domain (e.g. name@domain.com).' 
      : (isWa ? 'Please enter a valid WhatsApp number.' : `Please enter your ${fieldName.toLowerCase()}.`),
    showError: false
  };
}

function addFormField(fieldName: string) {
  if (selectedFormTab.value === 'Choices') {
    editorStore.addWidget('MultipleChoice', undefined, getChoiceDefaultProps(fieldName));
  } else {
    editorStore.addWidget('FieldInput', undefined, getFieldDefaultProps(fieldName));
  }
}

function addActionButton(variant: 'black' | 'white' = 'black') {
  editorStore.addWidget('ActionButton', undefined, {
    label: 'BUTTON CTA',
    variant: variant,
    actionType: 'submit',
    url: '',
    height: 48
  });
}

function addInteractiveWidget(name: string) {
  editorStore.addWidget('RsvpForm', undefined, { heading: name.toUpperCase() });
}

function addOverlayWidget(type: string) {
  editorStore.addWidget('RulesAccordion', undefined, { title: `${type.toUpperCase()} RULES` });
}
</script>
