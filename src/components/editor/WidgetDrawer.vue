<template>
  <aside class="w-72 bg-[#121316] border-r border-[#23262d] flex flex-col select-none z-20">
    <!-- Drawer Navigation Tabs -->
    <div class="flex border-b border-[#23262d] bg-[#0e0f12]">
      <button 
        @click="editorStore.activeTab = 'widgets'"
        :class="editorStore.activeTab === 'widgets' ? 'text-white border-b-2 border-white bg-[#16181d]' : 'text-neutral-400 hover:text-neutral-200'"
        class="flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors text-center"
      >
        Widgets
      </button>
      <button 
        @click="editorStore.activeTab = 'templates'"
        :class="editorStore.activeTab === 'templates' ? 'text-white border-b-2 border-white bg-[#16181d]' : 'text-neutral-400 hover:text-neutral-200'"
        class="flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors text-center"
      >
        Presets
      </button>
      <button 
        @click="editorStore.activeTab = 'layers'"
        :class="editorStore.activeTab === 'layers' ? 'text-white border-b-2 border-white bg-[#16181d]' : 'text-neutral-400 hover:text-neutral-200'"
        class="flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition-colors text-center"
      >
        Layers ({{ editorStore.currentPage.widget_tree.length }})
      </button>
    </div>

    <!-- Tab 1: Standard Widgets List -->
    <div v-if="editorStore.activeTab === 'widgets'" class="flex-1 overflow-y-auto p-3 space-y-4">
      <div>
        <div class="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider px-1 mb-2">
          Standard Drop Widgets
        </div>
        <div class="grid grid-cols-1 gap-2">
          <button 
            v-for="widget in standardWidgets" 
            :key="widget.type"
            @click="editorStore.addWidget(widget.type)"
            class="group w-full p-3 rounded-xl bg-[#181a1f] hover:bg-[#20232a] border border-[#272b33] hover:border-[#3d434f] text-left transition-all flex items-start gap-3 shadow-sm hover:shadow"
          >
            <div class="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center border border-[#333742] transition-colors flex-shrink-0">
              <component :is="widget.icon" class="w-4 h-4 text-neutral-200 group-hover:text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-white flex items-center justify-between">
                <span>{{ widget.title }}</span>
                <Plus class="w-3.5 h-3.5 text-neutral-400 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div class="text-[11px] text-neutral-400 leading-tight mt-0.5">
                {{ widget.description }}
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Request Custom Widget Notice -->
      <div class="p-3.5 rounded-xl bg-gradient-to-b from-[#181a20] to-[#121418] border border-[#2c303a]">
        <div class="flex items-center gap-2 text-xs font-bold text-white mb-1">
          <Wrench class="w-3.5 h-3.5 text-amber-400" /> Need a Custom Widget?
        </div>
        <p class="text-[11px] text-neutral-400 leading-relaxed mb-2.5">
          For special brand activations or one-off brand mechanics, request a custom widget directly to the UI/UX team.
        </p>
        <button 
          @click="editorStore.isRequestWidgetModalOpen = true"
          class="w-full text-center text-xs font-semibold py-1.5 px-3 rounded-lg bg-[#222630] hover:bg-[#2a303d] text-neutral-200 border border-[#343b47] transition-colors"
        >
          Request Custom Widget
        </button>
      </div>
    </div>

    <!-- Tab 2: Global Presets / Templates -->
    <div v-else-if="editorStore.activeTab === 'templates'" class="flex-1 overflow-y-auto p-3 space-y-3">
      <div class="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider px-1 mb-1">
        Approved 707 Presets
      </div>
      <div 
        v-for="tpl in brandStore.templates" 
        :key="tpl.id"
        class="p-3 rounded-xl bg-[#181a1f] border border-[#272b33] hover:border-neutral-500 transition-all text-left"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-bold text-white">{{ tpl.name }}</span>
          <span class="text-[9px] font-mono uppercase bg-neutral-800 text-neutral-300 px-1.5 py-0.5 rounded">
            {{ tpl.category }}
          </span>
        </div>
        <p class="text-[11px] text-neutral-400 leading-snug mb-3">
          {{ tpl.description }}
        </p>
        <div class="flex items-center justify-between pt-2 border-t border-[#232730]">
          <span class="text-[10px] text-neutral-400">By {{ tpl.created_by }}</span>
          <button 
            @click="editorStore.loadTemplate(tpl)"
            class="text-[11px] font-semibold text-black bg-white hover:bg-neutral-200 px-2.5 py-1 rounded-md transition-colors"
          >
            Apply Preset
          </button>
        </div>
      </div>
    </div>

    <!-- Tab 3: Layers Tree & Block Order -->
    <div v-else-if="editorStore.activeTab === 'layers'" class="flex-1 overflow-y-auto p-3 space-y-1.5">
      <div class="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider px-1 mb-2">
        Canvas Stack Order
      </div>

      <div 
        v-for="(widget, idx) in editorStore.currentPage.widget_tree" 
        :key="widget.id"
        @click="editorStore.selectWidget(widget.id)"
        :class="editorStore.selectedWidgetId === widget.id ? 'bg-[#222630] border-white text-white' : 'bg-[#181a1f] border-[#272b33] text-neutral-300 hover:bg-[#1f2228]'"
        class="p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors"
      >
        <div class="flex items-center gap-2 text-xs font-medium truncate">
          <span class="text-[10px] font-mono text-neutral-400">{{ idx + 1 }}.</span>
          <span class="truncate">{{ widget.type }}</span>
        </div>

        <div class="flex items-center gap-1">
          <button 
            @click.stop="editorStore.moveWidget(idx, idx - 1)" 
            :disabled="idx === 0"
            class="p-1 hover:text-white disabled:opacity-20 text-neutral-400 rounded"
            title="Move Up"
          >
            <ChevronUp class="w-3 h-3" />
          </button>
          <button 
            @click.stop="editorStore.moveWidget(idx, idx + 1)" 
            :disabled="idx === editorStore.currentPage.widget_tree.length - 1"
            class="p-1 hover:text-white disabled:opacity-20 text-neutral-400 rounded"
            title="Move Down"
          >
            <ChevronDown class="w-3 h-3" />
          </button>
          <button 
            @click.stop="editorStore.removeWidget(widget.id)" 
            class="p-1 hover:text-red-400 text-neutral-400 rounded ml-1"
            title="Delete Block"
          >
            <Trash2 class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useEditorStore } from '../../stores/editorStore.ts';
import { useBrandStore } from '../../stores/brandStore.ts';
import type { WidgetType } from '../../types/editor.ts';
import { 
  Sparkles, 
  Clock, 
  Ticket, 
  CalendarCheck, 
  Images, 
  HelpCircle, 
  MapPin, 
  Plus, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Wrench 
} from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();

const standardWidgets: { type: WidgetType; title: string; description: string; icon: any }[] = [
  {
    type: 'HeroDrop',
    title: 'Hero Drop Banner',
    description: 'High-impact hype drop banner with badge and image.',
    icon: Sparkles
  },
  {
    type: 'CountdownTimer',
    title: 'Live Countdown Timer',
    description: 'Synchronized drop and raffle deadline countdown.',
    icon: Clock
  },
  {
    type: 'RaffleForm',
    title: 'Sneaker Raffle Form',
    description: 'Shoe sizing selector (US/UK/EU) and ID/IG verification.',
    icon: Ticket
  },
  {
    type: 'RsvpForm',
    title: 'Event RSVP Form',
    description: 'Quota sessions pass, +1 option, and digital ticket.',
    icon: CalendarCheck
  },
  {
    type: 'LookbookCarousel',
    title: 'Lookbook Gallery',
    description: 'Editorial slide gallery for seasonal lookbooks.',
    icon: Images
  },
  {
    type: 'RulesAccordion',
    title: 'Rules & Terms Accordion',
    description: 'Terms of entry, pickup conditions, and FAQ list.',
    icon: HelpCircle
  },
  {
    type: 'LocationCard',
    title: 'Store / Venue Location',
    description: 'Event address and Google Maps direction button.',
    icon: MapPin
  }
];
</script>
