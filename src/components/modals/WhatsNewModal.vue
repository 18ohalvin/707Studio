<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-707 animate-apple-fade"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-step-title"
      >
        <!-- Modal Card Container (Apple-spec rounded 24px, 0.5px hairline border) -->
        <div 
          class="relative w-full max-w-[540px] bg-white/95 backdrop-blur-2xl rounded-[24px] border-[0.5px] border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.22),0_1px_3px_rgba(0,0,0,0.06)] p-6 md:p-7 flex flex-col gap-5 animate-apple-pop text-black overflow-hidden"
        >
          <!-- Top Header: 707 Studio 1.5 & Step Indicator + Close Button -->
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <img 
                :src="FIGMA_ASSETS.logoDesignStudio" 
                alt="707 Design Studio" 
                class="h-[17px] w-auto object-contain pointer-events-none" 
              />
              <span class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white border-[0.5px] border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10px] font-707 font-medium text-black leading-none">
                1.5
              </span>
              <span class="text-neutral-300 font-light text-[12px] mx-0.5">/</span>
              <span class="text-[11px] font-mono text-neutral-400 font-medium">
                Step 0{{ currentStep + 1 }} of 04
              </span>
            </div>

            <!-- Close Button -->
            <button 
              type="button"
              @click="emit('close')"
              class="size-[26px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] text-neutral-700 hover:text-black rounded-full flex items-center justify-center apple-press transition-colors cursor-pointer border-0 outline-none shrink-0"
              title="Close"
              aria-label="Close"
            >
              <X class="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          <!-- Main Interactive Content with Out-In Slide Transition -->
          <div class="relative overflow-hidden min-h-[380px] flex flex-col">
            <Transition name="editorial-slide" mode="out-in">
              <div :key="currentStep" class="flex flex-col gap-5 w-full flex-1">
                <!-- 1. TOP: Dynamic Illustration Stage -->
                <div class="w-full h-[180px] md:h-[190px] rounded-[16px] bg-[#f5f5f7] border-[0.5px] border-black/8 p-4 flex items-center justify-center relative overflow-hidden shadow-inner-xs select-none">
                  <!-- Ambient subtle radial glow -->
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0%,rgba(245,245,247,0.5)_100%)] pointer-events-none" />

                  <!-- Illustration 1: Introducing Ecosystem -->
                  <div v-if="currentStep === 0" class="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-3">
                    <div class="w-full bg-white/90 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3.5 shadow-sm flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <div class="size-[32px] rounded-[8px] bg-black text-white flex items-center justify-center font-bold text-[11px]">
                          707
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12.5px] font-medium text-black leading-tight">Design Studio Hub</span>
                          <span class="text-[11px] text-neutral-400 font-normal">Brand Activation Operating System</span>
                        </div>
                      </div>
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border-[0.5px] border-emerald-300 text-emerald-700 text-[10.5px] font-medium">
                        <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live 1.5
                      </span>
                    </div>

                    <!-- 3 Connected Capabilities Bar -->
                    <div class="grid grid-cols-3 gap-2 w-full">
                      <div class="px-2.5 py-2 rounded-[8px] bg-white/80 border-[0.5px] border-black/8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-700 shadow-2xs">
                        <Layers class="w-3 h-3 text-neutral-500" />
                        <span>Drops</span>
                      </div>
                      <div class="px-2.5 py-2 rounded-[8px] bg-white/80 border-[0.5px] border-black/8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-700 shadow-2xs">
                        <Ticket class="w-3 h-3 text-neutral-500" />
                        <span>Raffles</span>
                      </div>
                      <div class="px-2.5 py-2 rounded-[8px] bg-white/80 border-[0.5px] border-black/8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-700 shadow-2xs">
                        <QrCode class="w-3 h-3 text-neutral-500" />
                        <span>Passes</span>
                      </div>
                    </div>
                  </div>

                  <!-- Illustration 2: Drop Studio Live Canvas -->
                  <div v-else-if="currentStep === 1" class="relative z-10 w-full max-w-[420px] flex flex-col gap-2.5">
                    <div class="w-full bg-white/90 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3.5 shadow-sm flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="size-[34px] rounded-[8px] bg-black text-white flex items-center justify-center font-bold text-[10.5px] uppercase">
                          DROP
                        </div>
                        <div class="flex flex-col">
                          <div class="flex items-center gap-1.5">
                            <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span class="text-[12.5px] font-medium text-black">atmos x ASICS Pandan</span>
                          </div>
                          <span class="text-[11px] text-neutral-400 font-normal">Gel-Kayano 14 Exclusive Launch</span>
                        </div>
                      </div>
                      <span class="h-[26px] px-2.5 rounded-full bg-black text-white text-[10.5px] font-medium flex items-center justify-center">
                        Published v11
                      </span>
                    </div>

                    <!-- Mini Visual Block Sequence -->
                    <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-[8px] border-[0.5px] border-black/8 text-[10.5px] text-neutral-500 justify-between">
                      <span class="flex items-center gap-1"><span class="size-1 rounded-full bg-black" /> Media Hero</span>
                      <span>·</span>
                      <span class="flex items-center gap-1"><span class="size-1 rounded-full bg-black" /> RSVP Form</span>
                      <span>·</span>
                      <span class="flex items-center gap-1"><span class="size-1 rounded-full bg-black" /> Mobile Ticket</span>
                    </div>
                  </div>

                  <!-- Illustration 3: Smart Raffles Interactive Grid -->
                  <div v-else-if="currentStep === 2" class="relative z-10 w-full max-w-[420px] flex flex-col gap-2.5">
                    <div class="w-full bg-white/90 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3 shadow-sm flex flex-col gap-2">
                      <div class="flex items-center justify-between">
                        <span class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Pick Preferred Shoe Size</span>
                        <span class="text-[10px] text-neutral-400 font-mono">350 Allocations</span>
                      </div>
                      <div class="grid grid-cols-4 gap-1.5">
                        <button
                          v-for="size in ['US 8.5', 'US 9.0', 'US 9.5', 'US 10']"
                          :key="size"
                          type="button"
                          @click="selectedSize = size"
                          class="py-1.5 rounded-[7px] text-[11px] font-medium transition-all text-center cursor-pointer border-[0.5px] apple-press"
                          :class="selectedSize === size ? 'bg-black text-white border-black shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 text-black border-black/10'"
                        >
                          {{ size }}
                        </button>
                      </div>
                    </div>

                    <div class="flex items-center justify-between px-3 py-1.5 bg-white/60 rounded-[8px] border-[0.5px] border-black/8 text-[10.5px] text-neutral-500">
                      <span class="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check class="w-3 h-3 stroke-[2.5]" /> Anti-Bot Ballot Shield
                      </span>
                      <span>WhatsApp Linking</span>
                    </div>
                  </div>

                  <!-- Illustration 4: Store Passes & Door Scanner -->
                  <div v-else class="relative z-10 w-full max-w-[420px] flex flex-col gap-2.5">
                    <div class="w-full bg-white/90 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3.5 shadow-sm flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="size-[34px] rounded-[8px] bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center text-black">
                          <QrCode class="w-5 h-5 stroke-[1.6]" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12.5px] font-medium text-black">707 Digital Store Pass</span>
                          <span class="text-[11px] text-neutral-400 font-normal">Encrypted QR · Door Scanner Ready</span>
                        </div>
                      </div>
                      <span class="h-[26px] px-2.5 rounded-full bg-emerald-50 text-emerald-700 border-[0.5px] border-emerald-300 text-[10.5px] font-medium flex items-center gap-1">
                        <Check class="w-3 h-3 stroke-[2.5]" />
                        Verified
                      </span>
                    </div>

                    <div class="flex items-center justify-between px-3 py-1.5 bg-white/60 rounded-[8px] border-[0.5px] border-black/8 text-[10.5px] text-neutral-500">
                      <span>Station: Main Entrance Tablet A</span>
                      <span class="text-emerald-600 font-medium">Instant Check-in</span>
                    </div>
                  </div>
                </div>

                <!-- 2. UNDER: Editorial Step Details -->
                <div class="flex flex-col gap-2 w-full">
                  <!-- Category Pill & Step Subtitle -->
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-medium">
                      {{ activeStep.stepTag }}
                    </span>
                    <span class="text-neutral-300">·</span>
                    <span class="text-[11px] font-medium text-neutral-600">
                      {{ activeStep.subtitle }}
                    </span>
                  </div>

                  <!-- Headline with natural font tracking -->
                  <h3 id="intro-step-title" class="text-[20px] md:text-[22px] font-medium text-black leading-snug tracking-normal">
                    {{ activeStep.title }}
                  </h3>

                  <!-- Body Copy with comfortable relaxed leading & default tracking -->
                  <p class="text-[13.5px] text-neutral-600 font-normal leading-[22px] tracking-normal">
                    {{ activeStep.description }}
                  </p>

                  <!-- Capability Highlights / Tags -->
                  <div class="flex items-center gap-1.5 flex-wrap pt-1.5">
                    <span
                      v-for="tag in activeStep.tags"
                      :key="tag"
                      class="px-2.5 py-1 rounded-[6px] bg-[#f5f5f7] border-[0.5px] border-black/8 text-[11px] text-neutral-700 font-normal tracking-normal"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Bottom Footer Navigation: Stepper Dots & Action Buttons -->
          <div class="pt-3 border-t-[0.5px] border-black/10 flex items-center justify-between gap-4">
            <!-- Stepper Progress Dots (Interactive) -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="(_, idx) in steps"
                :key="idx"
                type="button"
                @click="currentStep = idx"
                class="h-2 rounded-full transition-all cursor-pointer border-0 p-0 outline-none"
                :class="currentStep === idx ? 'bg-black w-6' : 'bg-neutral-200 hover:bg-neutral-300 w-2'"
                :title="`Go to step ${idx + 1}`"
              />
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center gap-2">
              <button 
                v-if="currentStep > 0"
                type="button"
                @click="currentStep--"
                class="h-[36px] px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-black font-medium text-[12.5px] transition-colors apple-press cursor-pointer border-0 outline-none"
              >
                Back
              </button>

              <button 
                v-if="currentStep < steps.length - 1"
                type="button"
                @click="currentStep++"
                class="h-[36px] px-5 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-[12.5px] transition-colors apple-press cursor-pointer border-0 outline-none flex items-center gap-1.5 shadow-xs"
              >
                <span>Next</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>

              <button 
                v-else
                type="button"
                @click="emit('close')"
                class="h-[36px] px-6 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-[12.5px] transition-all flex items-center justify-center shadow-xs apple-press cursor-pointer border-0 outline-none"
              >
                Explore Studio
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { X, Layers, Ticket, QrCode, Check, ArrowRight } from 'lucide-vue-next';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentStep = ref(0);
const selectedSize = ref('US 9.0');

const steps = [
  {
    id: 'intro',
    stepTag: '01 · INTRODUCING',
    subtitle: '707 Design Studio',
    title: 'The Operating System for Cultural Brand Activations',
    description: 'A purpose-built suite engineered for fashion houses, streetwear brands, and creative teams to build high-heat campaign drops, run fair community raffles, and manage physical store admissions with zero code.',
    tags: ['All-in-One Engine', 'Zero Code Builder', 'Direct Door Sync', 'Multi-Brand Workspace']
  },
  {
    id: 'drops',
    stepTag: '02 · DROP STUDIO',
    subtitle: 'Visual Campaign Builder',
    title: 'Craft Cinematic Drop Pages with Live Canvas Preview',
    description: 'Assemble mobile-first event launch pages with responsive typography presets, modular media banners, interactive RSVP forms, and hardware-accurate mobile canvas previews. Publish updates globally in seconds.',
    tags: ['Visual Block Editor', 'Mobile Canvas Frame', 'Real-Time Sync', 'Instant Global Deploy']
  },
  {
    id: 'raffles',
    stepTag: '03 · SMART RAFFLES',
    subtitle: 'Fair Access & Anti-Bot',
    title: 'Fair Queuing, Shoe Sizing, and Verified Ballots',
    description: 'Execute limited release campaigns with built-in bot prevention, capacity-controlled time slots, interactive shoe size allocation, and automated WhatsApp ticket distribution for winning entrants.',
    tags: ['Anti-Bot Protection', 'Size Grid Allocation', 'Quota Controls', 'WhatsApp Ticket Linking']
  },
  {
    id: 'passes',
    stepTag: '04 · STORE PASSES',
    subtitle: 'Retail Entrance & Scanner',
    title: 'From Digital Drop to Store Entrance in One Scan',
    description: 'Generate Apple Wallet–style encrypted QR passes for confirmed guests. Physical door security teams can scan and admit visitors seamlessly with real-time multi-tablet station synchronization.',
    tags: ['Encrypted QR Pass', 'Door Scanner App', 'Multi-Station Check-in', 'Live Attendance Ops']
  }
];

const activeStep = computed(() => steps[currentStep.value]);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowRight' && currentStep.value < steps.length - 1) {
    currentStep.value++;
  } else if (e.key === 'ArrowLeft' && currentStep.value > 0) {
    currentStep.value--;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.apple-modal-fade-enter-active,
.apple-modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.apple-modal-fade-enter-from,
.apple-modal-fade-leave-to {
  opacity: 0;
}

.editorial-slide-enter-active,
.editorial-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.editorial-slide-enter-from {
  opacity: 0;
  transform: translateX(14px);
}

.editorial-slide-leave-to {
  opacity: 0;
  transform: translateX(-14px);
}
</style>
