<template>
  <!-- Pop Up Modal Setup Sidebar Drawer (Figma Node 276:4722) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="276:4722"
    data-name="Pop Up Modal Setup Sidebar"
  >
    <!-- Widget Container & Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <button 
            type="button"
            @click="handleBackToCaller"
            class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
            title="Back to Setup"
          >
            <ArrowLeft class="w-4 h-4 text-black" />
          </button>
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Pop Up Modal Setup
          </p>
        </div>
        <button 
          @click="$emit('close')"
          class="apple-glass-icon-btn size-7 flex items-center justify-center rounded-full cursor-pointer hover:bg-neutral-200/60 transition-colors"
        >
          <img :src="FIGMA_ASSETS.closeIcon" class="w-3.5 h-3.5" alt="Close" />
        </button>
      </div>
    </div>

    <!-- Section 1: Pop-up Modal Variant Presets (Figma Node 276:4722) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Modal Variant
        </p>
        <span class="font-707 text-[11px] text-neutral-400">
          5 Presets
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 w-full">
        <button 
          type="button"
          v-for="v in modalVariants"
          :key="v.id"
          @click="selectVariant(v.id)"
          :class="currentVariant === v.id ? 'apple-glass-btn-dark font-medium shadow-sm border-black' : 'apple-glass-btn'"
          class="flex items-center justify-start gap-2.5 px-3 py-2.5 rounded-[8px] text-left transition-all cursor-pointer"
        >
          <component :is="v.icon" class="size-4 shrink-0" />
          <div class="flex flex-col min-w-0">
            <span class="font-707 text-[12px] leading-tight truncate">{{ v.label }}</span>
            <span class="text-[10px] opacity-70 leading-tight truncate">{{ v.desc }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Section 2: Header Copywriting (Title, Font Style & Subtitle) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Header Copywriting
      </p>

      <!-- Title Textarea (Multiline dynamic editing - No uppercase lock) -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 text-[12px] text-neutral-600">
          Modal Title
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex min-h-[38px] h-auto items-center px-[14px] py-[8px] rounded-[8px] w-full bg-white transition-all">
          <textarea 
            v-model="modalTitle"
            rows="1"
            @input="handleTitleInput"
            placeholder="e.g. Select Arrival Date"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 tracking-tight resize-none bg-transparent leading-[20px] overflow-hidden p-0 m-0"
          />
        </div>
      </div>

      <!-- Title Font Style Selector: H3 (18px) [Default] vs H2 (22px) -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 text-[12px] text-neutral-600">
            Title Font Style
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            {{ titleTypographyStyle === 'heading-2' ? 'Heading 2 (22px)' : 'Heading 3 (18px) [Default]' }}
          </span>
        </div>
        <div class="flex gap-2 w-full">
          <button 
            type="button"
            @click="titleTypographyStyle = 'heading-3'"
            :class="titleTypographyStyle === 'heading-3' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 h-[34px] rounded-[8px] text-[12px] font-707 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>H3</span>
            <span class="text-[10px] opacity-70 font-normal">(18px - Default)</span>
          </button>
          <button 
            type="button"
            @click="titleTypographyStyle = 'heading-2'"
            :class="titleTypographyStyle === 'heading-2' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="flex-1 h-[34px] rounded-[8px] text-[12px] font-707 flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>H2</span>
            <span class="text-[10px] opacity-70 font-normal">(22px)</span>
          </button>
        </div>
      </div>

      <!-- Subtitle Textarea (Multiline dynamic editing) -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 text-[12px] text-neutral-600">
          Modal Description
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex min-h-[38px] h-auto items-center px-[14px] py-[8px] rounded-[8px] w-full bg-white transition-all">
          <textarea 
            v-model="modalSubtitle"
            rows="2"
            @input="handleSubtitleInput"
            placeholder="e.g. Please provide a valid email address. We will resend your E-Pass immediately."
            class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 resize-none bg-transparent leading-[18px] overflow-hidden p-0 m-0"
          />
        </div>
      </div>
    </div>

    <!-- Section 3: Variant-Specific Configuration -->
    <!-- 3A. Message + Field Configuration -->
    <div 
      v-if="currentVariant === 'message-field'" 
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]"
    >
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Field Configuration
      </p>

      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 text-[12px] text-neutral-600">
          Input Placeholder
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="fieldPlaceholder"
            placeholder="e.g. Enter your email*"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 text-[12px] text-neutral-600">
          Field Input Type
        </p>
        <div class="flex gap-2">
          <button 
            type="button"
            v-for="fType in ['email', 'tel', 'text'] as const"
            :key="fType"
            @click="fieldType = fType"
            :class="fieldType === fType ? 'apple-glass-btn-dark font-medium' : 'apple-glass-btn'"
            class="flex-1 h-[34px] rounded-[8px] text-[12px] font-707 uppercase cursor-pointer"
          >
            {{ fType === 'tel' ? 'WhatsApp' : fType }}
          </button>
        </div>
      </div>
    </div>

    <!-- 3B. Choice Options Configuration (Strictly following MultipleChoice widget config & functions) -->
    <div 
      v-if="currentVariant === 'choice-detailed' || currentVariant === 'choice-simple'" 
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]"
    >
      <!-- Selection Mode: Multiple vs Single -->
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Selection Rule
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            Allow user to pick one or more
          </span>
        </div>
        <div class="flex gap-[6px] items-center">
          <button 
            type="button"
            @click="allowMultiple = true"
            :class="allowMultiple ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Multiple
          </button>
          <button 
            type="button"
            @click="allowMultiple = false"
            :class="!allowMultiple ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
            class="px-3 h-[32px] rounded-[6px] flex items-center justify-center font-707 text-[12px] cursor-pointer"
          >
            Single
          </button>
        </div>
      </div>

      <!-- Slots Capacity Toggle & Global Value -->
      <div class="flex items-center justify-between w-full pt-1 border-t border-neutral-100">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Slots Capacity
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            Badge on choice tiles
          </span>
        </div>
        <button 
          type="button"
          @click="showSlotsCapacity = !showSlotsCapacity"
          :class="showSlotsCapacity ? 'bg-black' : 'bg-neutral-200'"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
        >
          <span 
            :class="showSlotsCapacity ? 'translate-x-[18px]' : 'translate-x-0'"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
          />
        </button>
      </div>

      <!-- Global Slots per Option Input -->
      <div v-if="showSlotsCapacity" class="flex flex-col gap-[6px] w-full animate-in fade-in slide-in-from-top-1 duration-150">
        <div class="flex items-center justify-between">
          <span class="font-707 text-[12px] font-medium text-neutral-700">Slots per Option</span>
          <span class="font-707 text-[11px] text-neutral-400">Applies to all options</span>
        </div>
        <div class="border border-[#aaa] focus-within:border-black rounded-[8px] px-3.5 h-[38px] flex items-center w-full bg-white transition-colors">
          <input 
            v-model="globalSlotsCapacity"
            placeholder="e.g. 25"
            class="w-full font-707 text-[13px] font-medium text-black focus:outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <!-- Options Manager Section Header -->
      <div class="flex items-center justify-between w-full pt-1 border-t border-neutral-100">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Options ({{ options.length }})
        </p>
        <button 
          type="button"
          @click="addOption"
          class="apple-glass-btn px-2.5 h-[28px] rounded-[6px] text-[11px] font-medium flex items-center gap-1 cursor-pointer"
        >
          <Plus class="size-3.5" />
          <span>Add Option</span>
        </button>
      </div>

      <!-- Options List Items -->
      <div class="flex flex-col gap-3 w-full">
        <div 
          v-for="(opt, idx) in options" 
          :key="opt.id"
          class="p-3 bg-white border border-[#d9d9d9] rounded-[8px] flex flex-col gap-2.5 shadow-sm relative group"
        >
          <!-- Top Row: Index, Option Title, Pre-selected Checkbox, Delete -->
          <div class="flex items-center gap-2 w-full">
            <span class="size-5 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-[10px] text-neutral-500 font-bold shrink-0">
              {{ idx + 1 }}
            </span>

            <div class="border border-[#ccc] focus-within:border-black rounded-[6px] px-2.5 h-[32px] flex items-center flex-1 bg-white transition-colors">
              <input 
                v-model="opt.label" 
                @input="handleOptionsUpdate"
                :placeholder="currentVariant === 'choice-detailed' ? `Pass Option ${idx + 1}` : `Option ${idx + 1}`"
                class="w-full font-707 text-[12px] font-medium text-black focus:outline-none placeholder:text-neutral-400"
              />
            </div>

            <!-- Pre-selected Toggle -->
            <button 
              type="button"
              @click="toggleOptionSelected(idx)"
              :class="opt.selected ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400 hover:text-black'"
              class="size-[32px] rounded-[6px] flex items-center justify-center cursor-pointer transition-colors border border-black/10 shrink-0"
              title="Toggle Pre-selected state"
            >
              <Check class="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <!-- Delete Option -->
            <button 
              type="button" 
              @click="removeOption(idx)"
              :disabled="options.length <= 1"
              :class="options.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-600 hover:bg-red-50 text-neutral-400 cursor-pointer'"
              class="size-[32px] rounded-[6px] flex items-center justify-center transition-colors shrink-0"
              title="Remove option"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Variant Specific Fields -->
          <!-- Detailed Choice: Date Picker Components (DD MMM YYYY) -->
          <div v-if="currentVariant === 'choice-detailed'" class="flex flex-col gap-1.5 pl-7">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-707 font-medium text-neutral-600 flex items-center gap-1">
                <Calendar class="w-3 h-3 text-neutral-400" />
                <span>Date (DD MMM YYYY)</span>
              </span>
              <span class="text-[10px] font-mono text-neutral-400 font-medium">
                {{ parseDateComponents(opt.sublabel).day }} {{ parseDateComponents(opt.sublabel).month }} {{ parseDateComponents(opt.sublabel).year }}
              </span>
            </div>
            
            <div class="grid grid-cols-3 gap-1.5 w-full">
              <!-- Day Select -->
              <div class="relative">
                <select 
                  :value="parseDateComponents(opt.sublabel).day"
                  @change="updateOptionDate(idx, 'day', ($event.target as HTMLSelectElement).value)"
                  class="w-full h-[30px] px-2 appearance-none bg-white border border-[#ccc] focus:border-black rounded-[6px] font-707 text-[11px] font-medium text-black focus:outline-none cursor-pointer pr-5"
                >
                  <option v-for="d in DAYS" :key="d" :value="d">{{ d }}</option>
                </select>
                <ChevronDown class="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Month Select -->
              <div class="relative">
                <select 
                  :value="parseDateComponents(opt.sublabel).month"
                  @change="updateOptionDate(idx, 'month', ($event.target as HTMLSelectElement).value)"
                  class="w-full h-[30px] px-2 appearance-none bg-white border border-[#ccc] focus:border-black rounded-[6px] font-707 text-[11px] font-medium text-black focus:outline-none cursor-pointer pr-5"
                >
                  <option v-for="m in MONTHS" :key="m" :value="m">{{ m }}</option>
                </select>
                <ChevronDown class="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <!-- Year Select -->
              <div class="relative">
                <select 
                  :value="parseDateComponents(opt.sublabel).year"
                  @change="updateOptionDate(idx, 'year', ($event.target as HTMLSelectElement).value)"
                  class="w-full h-[30px] px-2 appearance-none bg-white border border-[#ccc] focus:border-black rounded-[6px] font-707 text-[11px] font-medium text-black focus:outline-none cursor-pointer pr-5"
                >
                  <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
                </select>
                <ChevronDown class="w-3 h-3 text-neutral-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <!-- Detailed Choice: Event Description Textarea -->
          <div v-if="currentVariant === 'choice-detailed'" class="pl-7">
            <textarea 
              v-model="opt.description"
              rows="2"
              @input="handleOptionsUpdate"
              placeholder="Event Description Detail..."
              class="w-full font-707 text-[11px] text-neutral-700 focus:outline-none border border-[#ccc] focus:border-black rounded-[6px] p-1.5 resize-none leading-relaxed bg-white"
            />
          </div>

          <!-- Simple Choice: Right Sublabel -->
          <div v-if="currentVariant === 'choice-simple'" class="pl-7">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] font-707 text-neutral-500">Right Sublabel (Optional)</span>
            </div>
            <div class="border border-[#ccc] focus-within:border-black rounded-[6px] px-2.5 h-[30px] flex items-center bg-white">
              <input 
                v-model="opt.sublabel" 
                @input="handleOptionsUpdate"
                placeholder="e.g. Indonesia / 2 Sept"
                class="w-full font-707 text-[11px] font-medium text-black focus:outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Add Option Button -->
      <button 
        type="button"
        @click="addOption"
        class="w-full h-[36px] rounded-[8px] border border-dashed border-[#aaa] hover:border-black text-neutral-600 hover:text-black font-707 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer bg-white/50 mt-1"
      >
        <Plus class="w-3.5 h-3.5" />
        <span>Add Option</span>
      </button>
    </div>

    <!-- 3C. Image Matrix Configuration (3:4 Ratio) -->
    <div 
      v-if="currentVariant === 'image-matrix'" 
      class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]"
    >
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Image Matrix (3:4)
        </p>
        <span class="text-[11px] text-neutral-400 font-mono">4 Slots</span>
      </div>

      <div class="grid grid-cols-2 gap-3 w-full">
        <div 
          v-for="(slot, sIdx) in imageSlots" 
          :key="slot.id"
          class="flex flex-col gap-1.5 p-2 bg-white border border-neutral-200 rounded-[8px]"
        >
          <div class="aspect-[3/4] bg-[#ededed] rounded-[6px] overflow-hidden relative group flex items-center justify-center border border-black/5">
            <img 
              v-if="slot.url" 
              :src="slot.url" 
              class="w-full h-full object-cover" 
              alt="Slot" 
            />
            <div v-else class="size-6 text-neutral-400">
              <svg viewBox="0 0 94 94" fill="none" class="size-full stroke-current">
                <path d="M70.0242 83.1312H20.0926C18.868 83.1338 17.655 82.8946 16.5232 82.4273C15.3913 81.96 14.3628 81.2738 13.4968 80.4081C12.6307 79.5424 11.9441 78.5143 11.4763 77.3826C11.0086 76.2509 10.7688 75.038 10.7709 73.8135V23.9602" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M77.1348 10.8668H32.947C29.5812 10.8668 26.8527 13.5953 26.8527 16.9611V61.149C26.8527 64.5148 29.5812 67.2433 32.947 67.2433H77.1348C80.5006 67.2433 83.2292 64.5148 83.2292 61.149V16.9611C83.2292 13.5953 80.5006 10.8668 77.1348 10.8668Z" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M34.6312 55.2544H74.8554L61.0061 37.7802L51.939 49.4029L45.594 42.0669L34.6312 55.2544Z" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            
            <button 
              type="button"
              @click="openGalleryForSlot(slot.id)"
              class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[11px] font-medium transition-opacity cursor-pointer"
            >
              Change
            </button>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono text-neutral-500">Slot {{ sIdx + 1 }}</span>
            <label class="flex items-center gap-1 text-[10px] text-neutral-600 cursor-pointer">
              <input 
                type="checkbox" 
                :checked="slot.selected" 
                @change="toggleSlotSelected(sIdx)"
                class="accent-black rounded scale-90"
              />
              Select
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Section 4: Action Button CTA Setup -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
        Action CTA Button
      </p>

      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 text-[12px] text-neutral-600">
          Button Label
        </p>
        <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="buttonText"
            placeholder="e.g. Done"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 tracking-tight"
          />
        </div>
      </div>
    </div>

    <!-- Section 5: Modal Dismiss Behavior -->
    <div class="content-stretch flex items-center justify-between p-[24px] shrink-0 w-full border-t border-[#f0f0f0]">
      <div class="flex flex-col">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Dismiss on Backdrop Click
        </p>
        <p class="font-707 text-[11px] text-neutral-500">
          Close bottom sheet when tapping outside
        </p>
      </div>
      <button 
        type="button"
        @click="dismissible = !dismissible"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
        :class="dismissible ? 'bg-black' : 'bg-neutral-200'"
      >
        <span 
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="dismissible ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import type { ModalVariant, ModalOption, ModalImageSlot } from '../../types/editor.ts';
import { 
  Bell, 
  TextCursorInput, 
  ListOrdered, 
  ListFilter, 
  LayoutGrid, 
  Plus, 
  Trash2,
  ArrowLeft,
  Check,
  Calendar,
  ChevronDown
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const YEARS = ['2026', '2027', '2028', '2029', '2030'];

function parseDateComponents(dateStr?: string) {
  const parts = (dateStr || '24 Oct 2026').trim().split(/\s+/);
  const day = parts[0] ? parts[0].padStart(2, '0') : '24';
  const month = parts[1] || 'Oct';
  const year = parts[2] || '2026';
  return {
    day: DAYS.includes(day) ? day : '24',
    month: MONTHS.includes(month) ? month : 'Oct',
    year: YEARS.includes(year) ? year : '2026'
  };
}

function updateOptionDate(index: number, part: 'day' | 'month' | 'year', val: string) {
  const currentOptions = [...(options.value || [])];
  if (!currentOptions[index]) return;
  const parsed = parseDateComponents(currentOptions[index].sublabel);
  parsed[part] = val;
  currentOptions[index] = {
    ...currentOptions[index],
    sublabel: `${parsed.day} ${parsed.month} ${parsed.year}`
  };
  updateModalData({ options: currentOptions });
}

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const currentWidget = computed(() => {
  const selected = editorStore.currentPage.widget_tree.find(w => w.id === editorStore.selectedWidgetId);
  if (selected && (selected.type === 'ActionButton' || selected.type === 'HeroDrop' || selected.type === 'ModalOverlay')) {
    return selected;
  }
  return editorStore.currentPage.widget_tree.find(w => w.type === 'ActionButton' && w.props?.actionType === 'modal') || selected || null;
});

const targetModalData = computed(() => {
  if (!currentWidget.value) return {};
  if (currentWidget.value.props.modalProps) {
    return currentWidget.value.props.modalProps;
  }
  return currentWidget.value.props;
});

function updateModalData(propsToUpdate: Record<string, any>) {
  if (!currentWidget.value) return;
  if (currentWidget.value.type === 'ActionButton' || currentWidget.value.type === 'HeroDrop') {
    const existing = currentWidget.value.props.modalProps || {};
    editorStore.updateWidgetProps(currentWidget.value.id, {
      modalProps: { ...existing, ...propsToUpdate }
    });
  } else {
    editorStore.updateWidgetProps(currentWidget.value.id, propsToUpdate);
  }
}

const modalVariants = [
  { id: 'message-alert' as ModalVariant, label: 'Message / Alert', desc: 'Status notice', icon: Bell },
  { id: 'message-field' as ModalVariant, label: 'Message + Field', desc: 'Input prompt', icon: TextCursorInput },
  { id: 'choice-detailed' as ModalVariant, label: 'Detailed Choice', desc: 'Date & description', icon: ListOrdered },
  { id: 'choice-simple' as ModalVariant, label: 'Simple Choice', desc: 'Code & country', icon: ListFilter },
  { id: 'image-matrix' as ModalVariant, label: 'Image Matrix', desc: '3:4 shoe/product grid', icon: LayoutGrid }
];

const currentVariant = computed<ModalVariant>({
  get: () => targetModalData.value.variant || 'message-alert',
  set: (val) => {
    updateModalData({ variant: val });
  }
});

const modalTitle = computed({
  get: () => targetModalData.value.title || '',
  set: (val: string) => {
    updateModalData({ title: val });
  }
});

const titleTypographyStyle = computed<'heading-3' | 'heading-2'>({
  get: () => targetModalData.value.titleTypographyStyle || 'heading-3',
  set: (val: 'heading-3' | 'heading-2') => {
    updateModalData({ titleTypographyStyle: val });
  }
});

const modalSubtitle = computed({
  get: () => targetModalData.value.subtitle || '',
  set: (val: string) => {
    updateModalData({ subtitle: val });
  }
});

const allowMultiple = computed({
  get: () => targetModalData.value.allowMultiple ?? true,
  set: (val: boolean) => {
    updateModalData({ allowMultiple: val });
  }
});

const showSlotsCapacity = computed({
  get: () => targetModalData.value.showSlotsCapacity ?? false,
  set: (val: boolean) => {
    updateModalData({ showSlotsCapacity: val });
  }
});

const globalSlotsCapacity = computed({
  get: () => targetModalData.value.globalSlotsCapacity ?? 25,
  set: (val: string | number) => {
    updateModalData({ globalSlotsCapacity: val });
  }
});

const fieldPlaceholder = computed({
  get: () => targetModalData.value.fieldPlaceholder || 'Enter your email*',
  set: (val: string) => {
    updateModalData({ fieldPlaceholder: val });
  }
});

const fieldType = computed({
  get: () => targetModalData.value.fieldType || 'email',
  set: (val: string) => {
    updateModalData({ fieldType: val });
  }
});

const buttonText = computed({
  get: () => targetModalData.value.buttonText || 'DONE',
  set: (val: string) => {
    updateModalData({ buttonText: val });
  }
});

const buttonVariant = computed({
  get: () => targetModalData.value.buttonVariant || 'black',
  set: (val: string) => {
    updateModalData({ buttonVariant: val });
  }
});

const dismissible = computed({
  get: () => targetModalData.value.dismissible ?? true,
  set: (val: boolean) => {
    updateModalData({ dismissible: val });
  }
});

const options = computed<ModalOption[]>({
  get: () => targetModalData.value.options || [],
  set: (val: ModalOption[]) => {
    updateModalData({ options: val });
  }
});

const imageSlots = computed<ModalImageSlot[]>({
  get: () => targetModalData.value.imageSlots || [],
  set: (val: ModalImageSlot[]) => {
    updateModalData({ imageSlots: val });
  }
});

function selectVariant(v: ModalVariant) {
  if (!currentWidget.value) return;
  
  let defaultProps: Record<string, any> = { 
    variant: v,
    titleTypographyStyle: targetModalData.value.titleTypographyStyle || 'heading-3'
  };
  
  if (v === 'message-alert') {
    defaultProps.title = 'Your Pass Has Been Sent';
    defaultProps.subtitle = 'Please provide a valid email address. We will resend your E-Pass immediately.';
    defaultProps.buttonText = 'Done';
    defaultProps.buttonVariant = 'black';
  } else if (v === 'message-field') {
    defaultProps.title = 'Update Your Email';
    defaultProps.subtitle = 'Please provide a valid email address. We will resend your E-Pass immediately.';
    defaultProps.fieldPlaceholder = 'Enter your email*';
    defaultProps.fieldType = 'email';
    defaultProps.buttonText = 'Done';
    defaultProps.buttonVariant = 'black';
  } else if (v === 'choice-detailed') {
    defaultProps.title = 'Select Arrival Date';
    defaultProps.subtitle = 'Please provide a valid email address. We will resend your E-Pass immediately.';
    defaultProps.buttonText = 'Done';
    defaultProps.buttonVariant = 'black';
    defaultProps.allowMultiple = true;
    defaultProps.showSlotsCapacity = true;
    defaultProps.globalSlotsCapacity = 25;
    defaultProps.options = [
      { id: 'opt_1', label: 'Pass Option 1', sublabel: '24 Oct 2026', description: 'Access to activation area and special event lounge', selected: true },
      { id: 'opt_2', label: 'Pass Option 2', sublabel: '25 Oct 2026', description: 'Access to activation area and special event lounge', selected: false }
    ];
  } else if (v === 'choice-simple') {
    defaultProps.title = 'Select Arrival Date';
    defaultProps.subtitle = 'Please provide a valid email address. We will resend your E-Pass immediately.';
    defaultProps.buttonText = 'Done';
    defaultProps.buttonVariant = 'black';
    defaultProps.allowMultiple = false;
    defaultProps.showSlotsCapacity = false;
    defaultProps.options = [
      { id: 'opt_1', label: 'Day 1', sublabel: '2 Sept', selected: true },
      { id: 'opt_2', label: 'Day 2', sublabel: '3 Sept', selected: false }
    ];
  } else if (v === 'image-matrix') {
    defaultProps.title = 'Select Arrival Date';
    defaultProps.subtitle = 'Please provide a valid email address. We will resend your E-Pass immediately.';
    defaultProps.buttonText = 'Done';
    defaultProps.buttonVariant = 'black';
    defaultProps.imageSlots = [
      { id: 'slot_1', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80', label: 'Model 01', selected: true },
      { id: 'slot_2', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80', label: 'Model 02', selected: false },
      { id: 'slot_3', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80', label: 'Model 03', selected: false },
      { id: 'slot_4', url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400&q=80', label: 'Model 04', selected: false }
    ];
  }

  updateModalData(defaultProps);
}

function addOption() {
  if (!currentWidget.value) return;
  const current = [...(targetModalData.value.options || [])];
  const newIdx = current.length + 1;
  const isDetailed = currentVariant.value === 'choice-detailed';
  current.push({
    id: `opt_${Date.now()}`,
    label: isDetailed ? `Pass Option ${newIdx}` : `Option ${newIdx}`,
    sublabel: isDetailed ? `${String(newIdx + 23).padStart(2, '0')} Oct 2026` : undefined,
    description: isDetailed ? 'Access to activation area and special event lounge' : undefined,
    selected: false
  });
  updateModalData({ options: current });
}

function removeOption(index: number) {
  if (!currentWidget.value) return;
  const current = [...(targetModalData.value.options || [])];
  current.splice(index, 1);
  updateModalData({ options: current });
}

function toggleOptionSelected(index: number) {
  if (!currentWidget.value) return;
  const current = [...(targetModalData.value.options || [])];
  if (current[index]) {
    const isMulti = allowMultiple.value;
    if (isMulti) {
      current[index] = { ...current[index], selected: !current[index].selected };
    } else {
      const willBeSelected = !current[index].selected;
      current.forEach((o, i) => {
        o.selected = i === index ? willBeSelected : false;
      });
    }
    updateModalData({ options: current });
  }
}

function toggleSlotSelected(index: number) {
  if (!currentWidget.value) return;
  const current = [...(targetModalData.value.imageSlots || [])];
  if (current[index]) {
    current[index] = { ...current[index], selected: !current[index].selected };
    updateModalData({ imageSlots: current });
  }
}

function openGalleryForSlot(slotId: string) {
  editorStore.openMediaGalleryForChoiceOption(slotId);
}

function handleOptionsUpdate() {
  if (!currentWidget.value) return;
  updateModalData({ options: [...options.value] });
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
}

function handleTitleInput(e: Event) {
  autoResize(e.target as HTMLTextAreaElement);
}

function handleSubtitleInput(e: Event) {
  autoResize(e.target as HTMLTextAreaElement);
}

function handleBackToCaller() {
  if (currentWidget.value?.type === 'HeroDrop') {
    editorStore.openMediaSidebar(currentWidget.value.props?.ratio);
  } else {
    editorStore.openButtonSidebar();
  }
}
</script>
