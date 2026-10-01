<template>
  <!-- Guest E-Pass Setup Sidebar Menu (Figma Node 222:4188) -->
  <aside 
    v-if="isOpen && currentWidget"
    ref="sidebarRef"
    @click.stop
    @wheel.stop
    class="absolute right-[24px] top-1/2 -translate-y-1/2 w-[464px] h-auto max-h-[calc(100vh-140px)] backdrop-blur-2xl bg-[rgba(255,255,255,0.92)] border border-black/8 content-stretch flex flex-col items-start overflow-y-auto pb-[24px] rounded-[12px] shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] z-40 select-none transition-all animate-apple-slide-right-center no-scrollbar"
    data-node-id="222:4188"
    data-name="Guest E-Pass Setup Sidebar"
  >
    <!-- Header -->
    <div class="content-stretch flex flex-col items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="content-stretch flex items-center justify-between shrink-0 w-full">
        <div class="flex items-center gap-2">
          <Ticket class="size-4 text-black" />
          <p class="font-707 font-medium text-[16px] leading-[22px] text-black whitespace-nowrap">
            Guest E-Pass Setup
          </p>
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
        Configure QR code visibility, field layout metadata, action button, and entry terms.
      </p>
    </div>

    <!-- Section 0: Brand Logo (Inherited from Hero Banner) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Brand Logo
          </p>
          <span class="font-707 text-[11px] text-neutral-400">
            {{ projectBrandLogoUrl ? 'Active from Hero Banner' : 'Not configured' }}
          </span>
        </div>
        <div v-if="projectBrandLogoUrl" class="border-[0.5px] border-neutral-200 p-3 rounded-[8px] bg-neutral-50 flex items-center justify-between">
          <img :src="projectBrandLogoUrl" alt="Brand Logo" class="max-h-[32px] h-[24px] w-auto object-contain" />
          <span class="font-707 text-[11px] text-emerald-600 font-medium">● Visible on Summary</span>
        </div>
        <p v-else class="font-707 text-[11px] text-neutral-400 leading-normal">
          Upload a brand logo in your Hero Banner setup to automatically display it at the top of this summary ticket.
        </p>
      </div>
    </div>

    <!-- Section 1: Global QR Function On/Off Toggle -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            QR Code Function
          </p>
          <p class="font-707 text-[11px] text-neutral-500">
            {{ showQrCode ? 'Enabled: Displaying QR summary ticket' : 'Disabled: Displaying clean field info layout' }}
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="showQrCode"
          @click="toggleQrCode"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="showQrCode ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle QR Code"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="showQrCode ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Section 2: Non-QR Field Layout Info Setup (Visible when QR is OFF or configurable) -->
    <div v-if="!showQrCode" class="content-stretch flex flex-col gap-[16px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0] animate-in fade-in duration-200">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Pass Information Fields
        </p>
        <span class="font-707 text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-[4px] border border-neutral-200 uppercase">
          Non-QR Mode
        </span>
      </div>

      <!-- Headline -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
          Headline Text
        </p>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex min-h-[54px] p-[10px] rounded-[8px] w-full bg-white transition-colors">
          <textarea 
            v-model="heading"
            rows="2"
            placeholder="SUCCESS.&#10;YOUR PASS HAS BEEN SENT."
            class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight resize-none"
          />
        </div>
      </div>

      <!-- Event Venue -->
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
          Event Venue Location
        </p>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="venue"
            placeholder="e.g. PLAZA SENAYAN 4th FLOOR"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>

      <!-- 2-Column Inputs: Access ID & Guest Type -->
      <div class="grid grid-cols-2 gap-3 w-full">
        <!-- Access ID -->
        <div class="flex flex-col gap-[6px]">
          <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
            Access ID Code
          </p>
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[12px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="accessIdFallback"
              placeholder="020305-1008-1245"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
            />
          </div>
        </div>

        <!-- Guest Type -->
        <div class="flex flex-col gap-[6px]">
          <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
            Guest Type
          </p>
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[12px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="guestType"
              placeholder="VIP"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>
        </div>
      </div>

      <!-- Guest Name Fallback -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
            Guest Name Fallback
          </p>
          <span class="text-[10px] font-707 text-neutral-400">Dynamic if form filled</span>
        </div>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="guestNameFallback"
            placeholder="MR. ALVIN DECOROUS"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
          />
        </div>
      </div>

      <!-- Email Fallback -->
      <div class="flex flex-col gap-[6px] w-full">
        <div class="flex items-center justify-between">
          <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
            Email Fallback
          </p>
          <span class="text-[10px] font-707 text-neutral-400">Dynamic if form filled</span>
        </div>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="emailFallback"
            placeholder="alvin@sosco.id"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 lowercase font-mono"
          />
        </div>
      </div>

      <!-- Footer Notice Setup -->
      <div class="flex flex-col gap-[10px] w-full pt-1">
        <p class="font-707 font-medium text-[12px] leading-[16px] text-neutral-700">
          Email Help Notice (Footer)
        </p>
        <div class="flex flex-col gap-2 w-full">
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[12px] rounded-[6px] w-full bg-white transition-colors">
            <input 
              v-model="footerNoticeTitle"
              placeholder="DIDN'T RECEIVE THE EMAIL?"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[12px] rounded-[6px] w-full bg-white transition-colors">
            <input 
              v-model="footerNoticeText"
              placeholder="Check your spam folder or contact support"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2b: Standard QR Venue Location (Visible when QR is ON) -->
    <div v-else class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <div class="flex flex-col gap-[6px] w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Event Venue Location
        </p>
        <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
          <input 
            v-model="venue"
            placeholder="e.g. [EVENT VENUE LOCATION]"
            class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase tracking-tight"
          />
        </div>
      </div>
    </div>

    <!-- Section 3: Action Button Function (Sticky Bottom Only - As in Hero Banner) -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full border-b border-[#f0f0f0]">
      <!-- Title row with Apple Style Toggle Switch -->
      <div class="flex items-center justify-between w-full">
        <div class="flex flex-col">
          <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
            Add Action Button
          </p>
          <p class="font-707 text-[11px] text-neutral-500">
            Sticky bottom viewport button
          </p>
        </div>

        <!-- Modern Elegant Apple Style Toggle Switch -->
        <button
          type="button"
          role="switch"
          :aria-checked="isCtaEnabled"
          @click="toggleCta"
          class="relative inline-flex h-[22px] w-[40px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
          :class="isCtaEnabled ? 'bg-black' : 'bg-[#e5e5ea]'"
          title="Toggle Action Button"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
            :class="isCtaEnabled ? 'translate-x-[18px]' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Action Button Settings (Appears only when toggle is on) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform opacity-0 -translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 -translate-y-2"
      >
        <div v-if="isCtaEnabled" class="flex flex-col gap-[12px] w-full pt-1">
          <!-- Button Text Input -->
          <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
            <input 
              v-model="buttonText"
              placeholder="Button Text (e.g. DOWNLOAD E-PASS)"
              class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 uppercase"
            />
          </div>

          <!-- Button Style Preset (Primary Black vs Primary White) -->
          <div class="content-stretch flex flex-col gap-[10px] items-start w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Button Style Preset
            </p>
            <div class="flex gap-[8px] items-center w-full">
              <button 
                type="button"
                @click="setButtonVariant('black')"
                :class="buttonVariant === 'black' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
              >
                Primary Black
              </button>
              <button 
                type="button"
                @click="setButtonVariant('white')"
                :class="buttonVariant === 'white' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                class="flex-1 whitespace-nowrap content-stretch flex h-[36px] items-center justify-center px-[16px] py-[6px] rounded-[8px] text-[12px] font-707 cursor-pointer"
              >
                Primary White
              </button>
            </div>
          </div>

          <!-- Position Indicator: Sticky Bottom Only -->
          <div class="flex items-center justify-between w-full pt-1">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
              Position
            </p>
            <span class="font-707 text-[11px] text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1 rounded-[6px]">
              Sticky Bottom Only
            </span>
          </div>

          <!-- Link to Dropdown -->
          <div class="content-stretch flex items-center justify-between w-full pt-1 relative">
            <p class="font-707 font-medium text-[13px] leading-[18px] text-black whitespace-nowrap">
              Link to
            </p>
            <div class="relative">
              <button
                type="button"
                @click="isLinkToDropdownOpen = !isLinkToDropdownOpen"
                class="apple-glass-btn flex h-[38px] items-center justify-between px-[14px] py-[6px] rounded-[8px] w-[240px] cursor-pointer text-left"
              >
                <span class="font-707 text-[13px] text-black truncate">{{ selectedActionLabel }}</span>
                <ChevronDown 
                  class="size-[15px] text-black transition-transform duration-200 shrink-0 ml-1" 
                  :class="isLinkToDropdownOpen ? 'rotate-180' : ''"
                />
              </button>

              <!-- Dropdown Menu -->
              <div 
                v-if="isLinkToDropdownOpen" 
                class="absolute right-0 top-[44px] w-[240px] bg-white/95 backdrop-blur-xl border border-black/10 rounded-[8px] shadow-lg py-1 z-30 flex flex-col"
              >
                <button
                  v-for="opt in linkToOptions"
                  :key="opt.value"
                  type="button"
                  @click="selectLinkTo(opt.value)"
                  class="flex items-center justify-between px-[14px] py-[8px] text-left hover:bg-black/5 transition-colors cursor-pointer"
                  :class="ctaActionType === opt.value ? 'font-medium text-black bg-black/5' : 'text-neutral-700'"
                >
                  <span class="font-707 text-[13px]">{{ opt.label }}</span>
                  <Check v-if="ctaActionType === opt.value" class="size-[15px] text-black" />
                </button>
              </div>
            </div>
          </div>

          <!-- Conditional URL Input if External URL selected -->
          <div v-if="ctaActionType === 'link'" class="w-full pt-1 animate-in fade-in duration-150">
            <div class="border border-[#aaa] focus-within:border-black border-solid flex h-[38px] items-center px-[14px] rounded-[8px] w-full bg-white transition-colors">
              <input 
                v-model="ctaUrl" 
                placeholder="https://..." 
                class="w-full text-[13px] font-707 text-black focus:outline-none placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <!-- Conditional Modal Setup Button if Popup Modal selected -->
          <div v-if="ctaActionType === 'modal'" class="w-full pt-1 animate-in fade-in duration-150">
            <button 
              type="button"
              @click="openModalSetup"
              class="apple-glass-btn-dark w-full h-[38px] rounded-[8px] flex items-center justify-between px-3.5 font-707 font-medium text-[12px] cursor-pointer transition-all shadow-sm"
            >
              <span class="flex items-center gap-2">
                <SlidersHorizontal class="size-3.5" />
                <span>Configure Pop Up Modal</span>
              </span>
              <ArrowRight class="size-3.5 opacity-80" />
            </button>
          </div>

          <!-- Add Icon Toggle -->
          <div class="content-stretch flex flex-col gap-[10px] items-start w-full pt-2 border-t border-[#f0f0f0]">
            <div class="flex items-center justify-between w-full">
              <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
                Add Icon
              </p>
              <button
                type="button"
                role="switch"
                :aria-checked="showIcon"
                @click="toggleIcon"
                class="relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200 ease-in-out focus:outline-none"
                :class="showIcon ? 'bg-black' : 'bg-[#e5e5ea]'"
                title="Toggle Button Icon"
              >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] ring-0 transition duration-200 ease-in-out"
                  :class="showIcon ? 'translate-x-[16px]' : 'translate-x-0'"
                />
              </button>
            </div>

            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform opacity-0 -translate-y-2"
              enter-to-class="transform opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform opacity-100 translate-y-0"
              leave-to-class="transform opacity-0 -translate-y-2"
            >
              <div v-if="showIcon" class="flex flex-nowrap overflow-x-auto gap-[8px] items-center -mx-[24px] px-[24px] w-[calc(100%+48px)] pt-1 no-scrollbar">
                <button 
                  type="button"
                  @click="setIconName('ticket')"
                  :class="iconName === 'ticket' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <Ticket class="size-3.5" /> Pass
                </button>
                <button 
                  type="button"
                  @click="setIconName('arrow-right')"
                  :class="iconName === 'arrow-right' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <ArrowRight class="size-3.5" /> Arrow
                </button>
                <button 
                  type="button"
                  @click="setIconName('grid')"
                  :class="iconName === 'grid' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <LayoutGrid class="size-3.5" /> Grid
                </button>
                <button 
                  type="button"
                  @click="setIconName('whatsapp')"
                  :class="iconName === 'whatsapp' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <Phone class="size-3.5" /> WhatsApp
                </button>
                <button 
                  type="button"
                  @click="setIconName('instagram')"
                  :class="iconName === 'instagram' ? 'apple-glass-btn-dark font-medium shadow-sm' : 'apple-glass-btn'"
                  class="shrink-0 whitespace-nowrap content-stretch flex h-[32px] items-center justify-center gap-1.5 px-[12px] py-[6px] rounded-[8px] text-[11px] font-707 cursor-pointer"
                >
                  <Instagram class="size-3.5" /> Instagram
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Section 4: Terms & Conditions -->
    <div class="content-stretch flex flex-col gap-[14px] items-start p-[24px] shrink-0 w-full">
      <div class="flex items-center justify-between w-full">
        <p class="font-707 font-medium text-[13px] leading-[18px] text-black">
          Terms & Conditions
        </p>
        <button 
          type="button"
          @click="addTermRule"
          class="apple-glass-btn text-[11px] font-707 px-2.5 py-1 rounded-[6px] flex items-center gap-1 cursor-pointer"
        >
          <Plus class="size-3" />
          <span>Add Rule</span>
        </button>
      </div>

      <div class="flex flex-col gap-2 w-full">
        <div 
          v-for="(term, tIdx) in termsList" 
          :key="tIdx"
          class="flex items-center gap-2 w-full"
        >
          <div class="size-1.5 rounded-full bg-black shrink-0" />
          <div class="border-[0.5px] border-[#aaa] focus-within:border-black border-solid flex h-[34px] items-center px-[10px] rounded-[6px] w-full bg-white transition-colors">
            <input 
              v-model="termsList[tIdx]"
              placeholder="Enter rule text"
              class="w-full text-[12px] font-707 text-black focus:outline-none placeholder:text-neutral-400"
            />
          </div>
          <button 
            type="button"
            v-if="termsList.length > 1"
            @click="removeTermRule(tIdx)"
            class="size-6 rounded flex items-center justify-center text-neutral-400 hover:text-red-600 cursor-pointer shrink-0"
            title="Remove Rule"
          >
            <Trash2 class="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Check, 
  ArrowRight, 
  SlidersHorizontal,
  LayoutGrid, 
  Phone, 
  Instagram 
} from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const sidebarRef = ref<HTMLElement | null>(null);

const currentWidget = computed(() => {
  const selected = editorStore.currentPage.widget_tree.find(w => w.id === editorStore.selectedWidgetId);
  if (selected && selected.type === 'GuestEPass') return selected;
  return editorStore.currentPage.widget_tree.find(w => w.type === 'GuestEPass') || null;
});

// 1. QR Code Toggle
const showQrCode = computed({
  get: () => currentWidget.value?.props?.showQrCode ?? true,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showQrCode: val });
    }
  }
});

function toggleQrCode() {
  showQrCode.value = !showQrCode.value;
}

// 2. Headline & Non-QR Field Metadata
const heading = computed({
  get: () => currentWidget.value?.props?.heading ?? 'SUCCESS.\nYOUR PASS HAS\nBEEN SENT.',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { heading: val });
    }
  }
});

const venue = computed({
  get: () => currentWidget.value?.props?.venue || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { venue: val });
    }
  }
});

const accessIdFallback = computed({
  get: () => currentWidget.value?.props?.accessIdFallback || currentWidget.value?.props?.accessId || '020305-1008-1245',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { accessIdFallback: val, accessId: val });
    }
  }
});

const guestType = computed({
  get: () => currentWidget.value?.props?.guestType || 'VIP',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { guestType: val });
    }
  }
});

const guestNameFallback = computed({
  get: () => currentWidget.value?.props?.guestNameFallback || 'MR. ALVIN DECOROUS',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { guestNameFallback: val });
    }
  }
});

const emailFallback = computed({
  get: () => currentWidget.value?.props?.emailFallback || currentWidget.value?.props?.email || 'alvin@sosco.id',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { emailFallback: val, email: val });
    }
  }
});

const footerNoticeTitle = computed({
  get: () => currentWidget.value?.props?.footerNoticeTitle ?? "DIDN'T RECEIVE THE EMAIL?",
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { footerNoticeTitle: val });
    }
  }
});

const footerNoticeText = computed({
  get: () => currentWidget.value?.props?.footerNoticeText ?? "Check your spam folder or contact support",
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { footerNoticeText: val });
    }
  }
});

// 3. Sticky Action Button Configuration
const isCtaEnabled = computed({
  get: () => currentWidget.value?.props?.isCtaEnabled ?? (!!currentWidget.value?.props?.buttonText || !!currentWidget.value?.props?.showButton || !!currentWidget.value?.props?.showStickyButton),
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        isCtaEnabled: val,
        showButton: val,
        showStickyButton: val,
        positionMode: 'sticky-bottom',
        ctaPositionMode: 'sticky-bottom',
        buttonText: val ? (currentWidget.value.props?.buttonText || 'DOWNLOAD E-PASS') : '',
        ctaLabel: val ? (currentWidget.value.props?.ctaLabel || 'DOWNLOAD E-PASS') : ''
      });
    }
  }
});

function toggleCta() {
  isCtaEnabled.value = !isCtaEnabled.value;
}

const buttonText = computed({
  get: () => currentWidget.value?.props?.buttonText || currentWidget.value?.props?.ctaLabel || 'DOWNLOAD E-PASS',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        buttonText: val,
        ctaLabel: val
      });
    }
  }
});

const buttonVariant = computed({
  get: () => currentWidget.value?.props?.variant || currentWidget.value?.props?.buttonVariant || 'black',
  set: (val: 'black' | 'white') => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        variant: val,
        buttonVariant: val
      });
    }
  }
});

function setButtonVariant(variant: 'black' | 'white') {
  buttonVariant.value = variant;
}

const isLinkToDropdownOpen = ref(false);

const linkToOptions = [
  { label: 'Download E-Pass', value: 'download-pass' },
  { label: 'Next Page', value: 'next_page' },
  { label: 'Submit Form', value: 'submit' },
  { label: 'External URL', value: 'link' },
  { label: 'Popup Modal', value: 'modal' },
  { label: 'Scroll to Section', value: 'scroll' }
] as const;

const ctaActionType = computed({
  get: () => currentWidget.value?.props?.actionType || 'download-pass',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { actionType: val });
    }
  }
});

const selectedActionLabel = computed(() => {
  const opt = linkToOptions.find(o => o.value === ctaActionType.value);
  return opt ? opt.label : 'Download E-Pass';
});

function selectLinkTo(val: string) {
  ctaActionType.value = val;
  isLinkToDropdownOpen.value = false;
  if (val === 'modal' && currentWidget.value) {
    if (!currentWidget.value.props.modalProps) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        modalProps: {
          variant: 'message-alert',
          title: 'Your Pass Has Been Sent',
          subtitle: 'Please check your email inbox to view your pass.',
          buttonText: 'Done',
          buttonVariant: 'black'
        }
      });
    }
    editorStore.openModalSidebar();
  }
}

const ctaUrl = computed({
  get: () => currentWidget.value?.props?.url || '',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { url: val });
    }
  }
});

function openModalSetup() {
  if (currentWidget.value) {
    if (!currentWidget.value.props.modalProps) {
      editorStore.updateWidgetProps(currentWidget.value.id, {
        modalProps: {
          variant: 'message-alert',
          title: 'Your Pass Has Been Sent',
          subtitle: 'Please check your email inbox to view your pass.',
          buttonText: 'Done',
          buttonVariant: 'black'
        }
      });
    }
    editorStore.openModalSidebar();
  }
}

const showIcon = computed({
  get: () => currentWidget.value?.props?.showIcon ?? false,
  set: (val: boolean) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { showIcon: val });
    }
  }
});

function toggleIcon() {
  showIcon.value = !showIcon.value;
}

const iconName = computed({
  get: () => currentWidget.value?.props?.iconName || 'ticket',
  set: (val: string) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { iconName: val, showIcon: true });
    }
  }
});

function setIconName(name: string) {
  iconName.value = name;
}

// 4. Terms & Conditions
const termsList = computed({
  get: () => currentWidget.value?.props?.terms || [
    '[ENTRY CONDITION OR LEGAL RULE 1]',
    '[ENTRY CONDITION OR LEGAL RULE 2]',
    '[ENTRY CONDITION OR LEGAL RULE 3]'
  ],
  set: (val: string[]) => {
    if (currentWidget.value) {
      editorStore.updateWidgetProps(currentWidget.value.id, { terms: val });
    }
  }
});

function addTermRule() {
  const current = [...termsList.value];
  const nextNum = current.length + 1;
  current.push(`[ENTRY CONDITION OR LEGAL RULE ${nextNum}]`);
  termsList.value = current;
}

function removeTermRule(index: number) {
  const current = [...termsList.value];
  current.splice(index, 1);
  termsList.value = current;
}

const projectBrandLogoUrl = computed(() => {
  for (const page of editorStore.pages) {
    for (const w of page.widget_tree) {
      if (w.type === 'HeroDrop' && w.props?.brandLogoUrl) {
        return w.props.brandLogoUrl;
      }
    }
  }
  return '';
});
</script>
