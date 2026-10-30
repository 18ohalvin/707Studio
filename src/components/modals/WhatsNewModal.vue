<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-707 animate-apple-fade"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <!-- Modal Card Container (Apple-spec rounded 24px, 0.5px hairline border) -->
        <div 
          class="relative w-full max-w-[500px] bg-white/95 backdrop-blur-2xl rounded-[24px] border-[0.5px] border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.22),0_1px_3px_rgba(0,0,0,0.06)] p-6 md:p-7 flex flex-col gap-4 animate-apple-pop text-black overflow-hidden"
        >
          <!-- Top Header: Logo + 1.5 badge and Close Button -->
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

          <!-- Main Interactive Stage & Description with Slide Transition -->
          <div class="relative overflow-hidden min-h-[300px] flex flex-col">
            <Transition name="editorial-slide" mode="out-in">
              <div :key="currentStep" class="flex flex-col gap-4 w-full flex-1">
                <!-- 1. TOP: Dynamic Illustration / Media Hero Stage -->
                <div class="w-full h-[200px] md:h-[210px] rounded-[16px] bg-[#f5f5f7] border-[0.5px] border-black/8 p-4 flex items-center justify-center relative overflow-hidden shadow-inner-xs select-none">
                  <!-- Ambient soft radial light -->
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.95)_0%,rgba(245,245,247,0.4)_100%)] pointer-events-none" />

                  <!-- Slide 1 Illustration: 707 Design Studio Ecosystem -->
                  <div v-if="currentStep === 0" class="relative z-10 w-full max-w-[380px] flex flex-col items-center gap-3">
                    <div class="w-full bg-white/95 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3.5 shadow-sm flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <div class="size-[32px] rounded-[8px] bg-black text-white flex items-center justify-center font-bold text-[11px]">
                          707
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12.5px] font-medium text-black leading-tight">Design Studio</span>
                          <span class="text-[11px] text-neutral-400 font-normal">Brand Activation Hub</span>
                        </div>
                      </div>
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border-[0.5px] border-emerald-300 text-emerald-700 text-[10.5px] font-medium">
                        <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        v1.5
                      </span>
                    </div>

                    <div class="grid grid-cols-3 gap-2 w-full">
                      <div class="px-2.5 py-2 rounded-[8px] bg-white border-[0.5px] border-black/8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-800 shadow-2xs">
                        <Layers class="w-3.5 h-3.5 text-neutral-500" />
                        <span>Drops</span>
                      </div>
                      <div class="px-2.5 py-2 rounded-[8px] bg-white border-[0.5px] border-black/8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-800 shadow-2xs">
                        <Ticket class="w-3.5 h-3.5 text-neutral-500" />
                        <span>Raffles</span>
                      </div>
                      <div class="px-2.5 py-2 rounded-[8px] bg-white border-[0.5px] border-black/8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-neutral-800 shadow-2xs">
                        <QrCode class="w-3.5 h-3.5 text-neutral-500" />
                        <span>Passes</span>
                      </div>
                    </div>
                  </div>

                  <!-- Slide 2 Illustration: Drop Studio Live Canvas -->
                  <div v-else-if="currentStep === 1" class="relative z-10 w-full max-w-[380px] flex flex-col gap-2.5">
                    <div class="w-full bg-white/95 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3.5 shadow-sm flex items-center justify-between">
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
                      <span class="h-[24px] px-2.5 rounded-full bg-black text-white text-[10px] font-medium flex items-center justify-center">
                        Live v11
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-[8px] border-[0.5px] border-black/8 text-[11px] text-neutral-600 justify-between shadow-2xs">
                      <span class="flex items-center gap-1"><span class="size-1 rounded-full bg-black" /> Hero Media</span>
                      <span>·</span>
                      <span class="flex items-center gap-1"><span class="size-1 rounded-full bg-black" /> RSVP Form</span>
                      <span>·</span>
                      <span class="flex items-center gap-1"><span class="size-1 rounded-full bg-black" /> Digital Ticket</span>
                    </div>
                  </div>

                  <!-- Slide 3 Illustration: Smart Raffles Interactive Grid -->
                  <div v-else-if="currentStep === 2" class="relative z-10 w-full max-w-[380px] flex flex-col gap-2.5">
                    <div class="w-full bg-white/95 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3 shadow-sm flex flex-col gap-2">
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

                    <div class="flex items-center justify-between px-3 py-1.5 bg-white rounded-[8px] border-[0.5px] border-black/8 text-[10.5px] text-neutral-600 shadow-2xs">
                      <span class="flex items-center gap-1 text-emerald-600 font-medium">
                        <Check class="w-3 h-3 stroke-[2.5]" /> Anti-Bot Protection
                      </span>
                      <span>WhatsApp Linking</span>
                    </div>
                  </div>

                  <!-- Slide 4 Illustration: Store Passes & Door Scanner -->
                  <div v-else class="relative z-10 w-full max-w-[380px] flex flex-col gap-2.5">
                    <div class="w-full bg-white/95 backdrop-blur-md rounded-[12px] border-[0.5px] border-black/10 p-3.5 shadow-sm flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="size-[34px] rounded-[8px] bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center text-black">
                          <QrCode class="w-5 h-5 stroke-[1.6]" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12.5px] font-medium text-black">707 Digital Store Pass</span>
                          <span class="text-[11px] text-neutral-400 font-normal">Encrypted QR · Door Scanner</span>
                        </div>
                      </div>
                      <span class="h-[24px] px-2.5 rounded-full bg-emerald-50 text-emerald-700 border-[0.5px] border-emerald-300 text-[10.5px] font-medium flex items-center gap-1">
                        <Check class="w-3 h-3 stroke-[2.5]" />
                        Verified
                      </span>
                    </div>

                    <div class="flex items-center justify-between px-3 py-1.5 bg-white rounded-[8px] border-[0.5px] border-black/8 text-[10.5px] text-neutral-600 shadow-2xs">
                      <span>Station: Door Tablet A</span>
                      <span class="text-emerald-600 font-medium">Instant Check-in</span>
                    </div>
                  </div>
                </div>

                <!-- 2. UNDER: Minimal Title & 1-Line Description -->
                <div class="flex flex-col gap-1 w-full px-1">
                  <h3 id="whats-new-title" class="text-[18px] md:text-[19px] font-medium text-black leading-snug tracking-normal">
                    {{ activeStep.title }}
                  </h3>
                  <p class="text-[13px] text-neutral-600 font-normal leading-[20px] tracking-normal">
                    {{ activeStep.description }}
                  </p>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Bottom Footer Navigation: Stepper Dots & Action Buttons -->
          <div class="pt-2 border-t-[0.5px] border-black/10 flex items-center justify-between gap-4">
            <!-- Stepper Progress Dots (Interactive) -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="(_, idx) in steps"
                :key="idx"
                type="button"
                @click="currentStep = idx"
                class="h-2 rounded-full transition-all cursor-pointer border-0 p-0 outline-none"
                :class="currentStep === idx ? 'bg-black w-6' : 'bg-neutral-200 hover:bg-neutral-300 w-2'"
                :title="`Go to slide ${idx + 1}`"
              />
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center gap-2">
              <button 
                v-if="currentStep > 0"
                type="button"
                @click="currentStep--"
                class="h-[34px] px-3.5 rounded-full bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-black font-medium text-[12px] transition-colors apple-press cursor-pointer border-0 outline-none"
              >
                Back
              </button>

              <button 
                v-if="currentStep < steps.length - 1"
                type="button"
                @click="currentStep++"
                class="h-[34px] px-4 rounded-full bg-black hover:bg-neutral-800 text-white font-medium text-[12px] transition-colors apple-press cursor-pointer border-0 outline-none flex items-center gap-1.5 shadow-xs"
              >
                <span>Next</span>
                <ArrowRight class="w-3.5 h-3.5" />
              </button>

              <button 
                v-else
                type="button"
                @click="emit('close')"
                class="h-[34px] px-5 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-[12px] transition-all flex items-center justify-center shadow-xs apple-press cursor-pointer border-0 outline-none"
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
    title: 'Introducing 707 Design Studio 1.5',
    description: 'The digital activation engine for exclusive drops, community raffles, and retail store passes.'
  },
  {
    id: 'drops',
    title: 'Drop Studio',
    description: 'Build mobile-first launch pages with live canvas preview and instant publishing.'
  },
  {
    id: 'raffles',
    title: 'Smart Raffles',
    description: 'Host bot-proof community releases with size grids and automated ticket distribution.'
  },
  {
    id: 'passes',
    title: 'Store Passes',
    description: 'Issue digital QR passes with instant door scanner check-in for physical events.'
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
