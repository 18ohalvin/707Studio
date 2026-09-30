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
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between px-[24px] shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Media/Banners
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start px-[24px] overflow-x-auto w-full pb-2 no-scrollbar">
        <!-- Full screen landing cover -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: 'Full screen landing cover', customProps: { ratio: 'Full screen landing page', isSolidSpace: true, subtitle: 'FULL SCREEN COVER' } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('Full screen landing page')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[96px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="bg-[#dcdcdc] group-hover:bg-[#cecece] h-[130px] rounded-[8px] shrink-0 w-[72px] transition-colors border border-black/10 group-hover:border-black shadow-sm overflow-hidden" />
          <p class="font-707 font-normal text-[11px] text-black text-center leading-tight">
            Full screen cover
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

        <!-- Buttons Option (Figma & 707 Button UI Style) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'HeroDrop', label: 'Buttons', customProps: { ratio: 'Buttons', isSolidSpace: true, isCtaEnabled: true, buttonText: 'Action', showBannerText: false } })"
          @dragend="handleDragEnd"
          @click="addMediaWidget('Buttons')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[104px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-center justify-center shrink-0 w-full">
            <div class="border border-[#c9c9c9] group-hover:border-black rounded-[8px] shrink-0 size-[96px] flex flex-col items-center justify-center p-2.5 bg-white group-hover:bg-neutral-50 transition-colors shadow-sm gap-2 overflow-hidden">
              <!-- Primary Solid Black Button Preview -->
              <div class="w-full bg-black text-white h-[26px] px-2 flex items-center justify-center shadow-sm">
                <span class="font-707 font-medium text-[9px] tracking-wider uppercase">Action</span>
              </div>
              <!-- Secondary Outline Button Preview -->
              <div class="w-full border border-black bg-white text-black h-[22px] px-2 flex items-center justify-center">
                <span class="font-707 font-medium text-[8px] tracking-wider uppercase">Outline</span>
              </div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Buttons
          </p>
        </div>

        <!-- Free Text Heading Block (Figma Node 180:5836) -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'TextBanner', label: 'Free Text', customProps: { text: '', placeholder: 'WRITE YOUR TEXT HERE' } })"
          @dragend="handleDragEnd"
          @click="addTextWidget"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 w-[100px] cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="content-stretch flex flex-col h-[130px] items-center justify-center shrink-0 w-full">
            <div class="border border-black border-dashed rounded-[8px] shrink-0 size-[90px] flex items-center justify-center p-2 bg-white group-hover:bg-neutral-50 transition-colors shadow-sm overflow-hidden">
              <span class="font-707 font-bold text-[18px] text-black">Aa</span>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Free Text
          </p>
        </div>
      </div>
    </div>

    <!-- Section 2: Add Form Inputs -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between px-[24px] shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Add Form Inputs
        </p>
      </div>

      <!-- Filter Buttons (Category Pills) -->
      <div class="content-stretch flex gap-[6px] items-start px-[24px] overflow-x-auto w-full no-scrollbar pb-[8px]">
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
      <div class="content-stretch flex gap-[12px] items-start px-[24px] overflow-x-auto w-full pt-[6px] pb-[8px] no-scrollbar">
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
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between px-[24px] shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Action Button
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start px-[24px] overflow-x-auto w-full no-scrollbar pb-[4px]">
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
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between px-[24px] shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Interactive & Activations
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start px-[24px] overflow-x-auto w-full no-scrollbar">
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

    <!-- Section 5: Pop Up Overlays -->
    <div class="content-stretch flex flex-col gap-[14px] items-start py-[16px] shrink-0 w-full">
      <div class="content-stretch flex items-center justify-between px-[24px] shrink-0 w-full">
        <p class="flex-[1_0_0] font-707 font-medium text-[13px] leading-[18px] text-black">
          Pop Up Overlays
        </p>
      </div>
      <div class="content-stretch flex gap-[14px] items-start px-[24px] overflow-x-auto w-full no-scrollbar">
        <!-- Center Overlay -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RulesAccordion', label: 'Center Modal', customProps: { title: 'EVENT DETAILS & PASS' } })"
          @dragend="handleDragEnd"
          @click="addOverlayWidget('Center Modal')"
          class="content-stretch flex flex-col gap-[6px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col gap-[8px] h-[130px] items-center justify-center rounded-[8px] shrink-0 w-[84px] bg-white group-hover:border-black transition-colors shadow-sm overflow-hidden">
            <div class="bg-[#d9d9d9] h-[42px] rounded-[6px] w-[54px] flex items-center justify-center gap-1">
              <div class="bg-[#aaa] h-1.5 w-3.5 rounded-sm"></div>
              <div class="bg-[#aaa] h-1.5 w-3.5 rounded-sm"></div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Center
          </p>
        </div>

        <!-- Bottom Sheet -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RulesAccordion', label: 'Bottom Drawer', customProps: { title: 'TERMS & CONDITIONS' } })"
          @dragend="handleDragEnd"
          @click="addOverlayWidget('Bottom Drawer')"
          class="content-stretch flex flex-col gap-[8px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-end rounded-[8px] shrink-0 w-[90px] h-[140px] bg-white group-hover:border-black transition-colors p-2 shadow-sm overflow-hidden">
            <div class="bg-[#d9d9d9] h-[55px] rounded-[6px] w-full flex flex-col justify-end p-1">
              <div class="bg-[#aaa] h-1.5 w-full rounded-sm"></div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Bottom
          </p>
        </div>

        <!-- Full Page Overlay -->
        <div 
          draggable="true"
          @dragstart="handleDragStart($event, { type: 'RulesAccordion', label: 'Full Page Pass', customProps: { title: 'FULL PAGE ACCESS TERMS' } })"
          @dragend="handleDragEnd"
          @click="addOverlayWidget('Full Page Pass')"
          class="content-stretch flex flex-col gap-[8px] items-center shrink-0 cursor-grab active:cursor-grabbing group"
          title="Drag to canvas or click to add"
        >
          <div class="border border-[#c9c9c9] flex flex-col justify-between rounded-[8px] shrink-0 w-[90px] h-[140px] bg-white group-hover:border-black transition-colors p-2 shadow-sm overflow-hidden">
            <div class="bg-[#d9d9d9] h-full rounded-[6px] w-full flex flex-col justify-between p-1.5">
              <div class="bg-[#aaa] h-7 w-full rounded-sm"></div>
              <div class="bg-[#aaa] h-7 w-full rounded-sm"></div>
              <div class="bg-[#aaa] h-2 w-full rounded-sm"></div>
            </div>
          </div>
          <p class="font-707 font-normal text-[11px] text-black text-center whitespace-nowrap">
            Full Page
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
import type { WidgetType } from '../../types/editor.ts';
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
  CalendarCheck 
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
        { name: 'Sneaker Size', icon: Footprints },
        { name: 'Checkbox', icon: CheckSquare },
        { name: 'Radio Group', icon: CircleDot },
        { name: 'Multi Choice', icon: ListChecks }
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
  emit('close');
}

function addTextWidget() {
  editorStore.addWidget('TextBanner', undefined, { text: '', placeholder: 'WRITE YOUR TEXT HERE' });
  emit('close');
}

function getChoiceDefaultProps(choiceName: string) {
  switch (choiceName) {
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
    case 'Checkbox':
      return {
        title: 'SELECT ARRIVALS',
        subtitle: 'Choose your preferred attendance day below.',
        variant: 'detailed-card',
        allowMultiple: true,
        required: false,
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
    case 'Radio Group':
      return {
        title: 'SELECT APPAREL SIZE',
        subtitle: 'Choose your preferred size below.',
        variant: 'simple-row',
        allowMultiple: true,
        required: false,
        selectedValues: [],
        options: [
          { id: 'opt_1', label: 'S' },
          { id: 'opt_2', label: 'M' }
        ]
      };
    case 'Multi Choice':
    default:
      return {
        title: 'SELECT YOUR MODEL',
        subtitle: 'Choose your preferred model below.',
        variant: 'image-grid',
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
  emit('close');
}

function addActionButton(variant: 'black' | 'white' = 'black') {
  editorStore.addWidget('ActionButton', undefined, {
    label: 'BUTTON CTA',
    variant: variant,
    actionType: 'submit',
    url: '',
    height: 48
  });
  emit('close');
}

function addInteractiveWidget(name: string) {
  editorStore.addWidget('RsvpForm', undefined, { heading: name.toUpperCase() });
  emit('close');
}

function addOverlayWidget(type: string) {
  editorStore.addWidget('RulesAccordion', undefined, { title: `${type.toUpperCase()} RULES` });
  emit('close');
}
</script>
