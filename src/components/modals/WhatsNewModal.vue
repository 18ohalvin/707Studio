<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-707 animate-apple-fade"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <!-- Modal Card Container (Apple-spec rounded 24px, 0.5px hairline border) -->
        <div 
          class="relative w-full max-w-[500px] md:max-w-[520px] bg-white/95 backdrop-blur-2xl rounded-[24px] border-[0.5px] border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.22),0_1px_3px_rgba(0,0,0,0.06)] p-6 md:p-7 flex flex-col gap-4 animate-apple-pop text-black overflow-hidden"
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
                <!-- 1. TOP: High-End Commercial Visual Stage -->
                <div class="w-full h-[215px] md:h-[225px] rounded-[16px] bg-[#0c0c0e] border-[0.5px] border-black/10 relative overflow-hidden shadow-sm select-none">
                  
                  <!-- SLIDE 1: 707 Design Studio Ecosystem Showcase -->
                  <div 
                    v-if="currentStep === 0" 
                    class="relative z-10 size-full p-4 flex flex-col justify-between bg-gradient-to-br from-[#0c0c0e] via-[#141418] to-[#08080a] text-white overflow-hidden"
                  >
                    <!-- Ambient subtle glow -->
                    <div class="absolute -top-10 -right-10 size-36 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
                    <div class="absolute -bottom-10 -left-10 size-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                    <!-- Top bar -->
                    <div class="flex items-center justify-between w-full relative z-10">
                      <div class="flex items-center gap-2">
                        <img :src="FIGMA_ASSETS.logo707" alt="707" class="h-4 w-auto invert object-contain" />
                        <span class="text-[9.5px] font-mono uppercase tracking-widest text-neutral-400">DESIGN STUDIO</span>
                      </div>
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-medium text-emerald-400">
                        <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Release 1.5
                      </span>
                    </div>

                    <!-- Center 3-Pillar Keynote Tiles -->
                    <div class="grid grid-cols-3 gap-2.5 w-full my-auto py-1 relative z-10">
                      <div class="flex flex-col items-center gap-1.5 p-2.5 rounded-[10px] bg-white/[0.06] backdrop-blur-md border border-white/10 text-center shadow-xs">
                        <div class="size-8 rounded-[8px] bg-white/10 flex items-center justify-center text-white">
                          <Layers class="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <span class="text-[11px] font-medium text-white leading-tight">Drop Studio</span>
                        <span class="text-[9.5px] text-neutral-400 font-mono">Visual Builder</span>
                      </div>

                      <div class="flex flex-col items-center gap-1.5 p-2.5 rounded-[10px] bg-white/[0.06] backdrop-blur-md border border-white/10 text-center shadow-xs">
                        <div class="size-8 rounded-[8px] bg-white/10 flex items-center justify-center text-white">
                          <Ticket class="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <span class="text-[11px] font-medium text-white leading-tight">Smart Raffles</span>
                        <span class="text-[9.5px] text-neutral-400 font-mono">Anti-Bot Ballots</span>
                      </div>

                      <div class="flex flex-col items-center gap-1.5 p-2.5 rounded-[10px] bg-white/[0.06] backdrop-blur-md border border-white/10 text-center shadow-xs">
                        <div class="size-8 rounded-[8px] bg-white/10 flex items-center justify-center text-white">
                          <QrCode class="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <span class="text-[11px] font-medium text-white leading-tight">Store Passes</span>
                        <span class="text-[9.5px] text-neutral-400 font-mono">Door Scanner</span>
                      </div>
                    </div>

                    <!-- Bottom Status Row -->
                    <div class="flex items-center justify-between text-[9.5px] font-mono text-neutral-400 pt-1.5 border-t border-white/10 relative z-10">
                      <span>ENGINE V1.5.0 ACTIVE</span>
                      <span class="text-neutral-300">STREETWEAR & RETAIL ACTIVATIONS</span>
                    </div>
                  </div>

                  <!-- SLIDE 2: Drop Studio Real Commercial Campaign Preview -->
                  <div 
                    v-else-if="currentStep === 1" 
                    class="relative z-10 size-full overflow-hidden group select-none"
                  >
                    <!-- Commercial Photography Background -->
                    <img 
                      src="/assets/whats-new/drop-campaign.jpeg" 
                      alt="Commercial Drop Preview" 
                      class="absolute inset-0 size-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700 pointer-events-none" 
                    />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/55" />

                    <!-- Live Overlay Interface -->
                    <div class="relative z-10 size-full p-4 flex flex-col justify-between text-white">
                      <!-- Top Drop Header -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded-[5px] bg-white text-black text-[10px] font-bold tracking-wider uppercase shadow-xs">
                            DROP
                          </span>
                          <span class="text-[11.5px] font-medium text-white drop-shadow-sm">Barbie™ x Stanley Quencher</span>
                        </div>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-medium text-white">
                          <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Live v11
                        </span>
                      </div>

                      <!-- Bottom Canvas Dock Controls -->
                      <div class="flex items-center justify-between p-2.5 rounded-[10px] bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
                        <div class="flex items-center gap-2">
                          <div class="size-2 rounded-full bg-emerald-400" />
                          <span class="text-[11px] font-normal text-neutral-200">Mobile Canvas Active</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="px-2 py-0.5 rounded-[4px] bg-white text-black text-[10px] font-medium">RSVP Form</span>
                          <span class="px-2 py-0.5 rounded-[4px] bg-white/20 text-white text-[10px] font-medium">Instant Deploy</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 3: Smart Raffles Interactive Sneaker Ballot Terminal -->
                  <div 
                    v-else-if="currentStep === 2" 
                    class="relative z-10 size-full p-4 bg-gradient-to-br from-[#121215] via-[#1a1a20] to-[#0f0f12] text-white flex flex-col justify-between overflow-hidden"
                  >
                    <!-- Ambient Glow -->
                    <div class="absolute -top-8 -left-8 size-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                    <!-- Top Bar -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="size-[28px] rounded-[6px] bg-white/10 border border-white/15 flex items-center justify-center">
                          <Ticket class="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12px] font-medium text-white leading-tight">atmos x ASICS Ballot</span>
                          <span class="text-[10px] text-neutral-400">Anti-Bot Shield Active</span>
                        </div>
                      </div>
                      <span class="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-[10px] font-medium flex items-center gap-1">
                        <ShieldCheck class="w-3 h-3" />
                        350 Quota
                      </span>
                    </div>

                    <!-- Center Interactive Size Selector Grid -->
                    <div class="my-auto flex flex-col gap-1.5 py-1">
                      <div class="flex items-center justify-between text-[10.5px] text-neutral-400">
                        <span>Select Balloting Size</span>
                        <span class="text-neutral-500 font-mono">1 per verified entrant</span>
                      </div>
                      <div class="grid grid-cols-4 gap-2">
                        <button
                          v-for="size in ['US 8.5', 'US 9.0', 'US 9.5', 'US 10']"
                          :key="size"
                          type="button"
                          @click="selectedSize = size"
                          class="py-2 rounded-[8px] text-[11px] font-medium transition-all text-center cursor-pointer border apple-press"
                          :class="selectedSize === size ? 'bg-white text-black border-white shadow-md font-semibold' : 'bg-white/[0.07] hover:bg-white/[0.12] text-neutral-300 border-white/10'"
                        >
                          {{ size }}
                        </button>
                      </div>
                    </div>

                    <!-- Bottom Status Row -->
                    <div class="flex items-center justify-between text-[9.5px] font-mono text-neutral-400 pt-1.5 border-t border-white/10">
                      <span class="flex items-center gap-1 text-emerald-400 font-medium">
                        <Check class="w-3 h-3 stroke-[2.5]" /> LIVE QUEUE DRAW
                      </span>
                      <span>WHATSAPP TICKET SYNC</span>
                    </div>
                  </div>

                  <!-- SLIDE 4: Store Passes Encrypted VIP QR Ticket & Door Scanner -->
                  <div 
                    v-else 
                    class="relative z-10 size-full p-4 bg-gradient-to-br from-[#0e0e11] via-[#16161c] to-[#0a0a0d] text-white flex flex-col justify-between overflow-hidden"
                  >
                    <!-- Animated Holographic Laser Scanline -->
                    <div class="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan pointer-events-none" />

                    <!-- Pass Header -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="size-[28px] rounded-[6px] bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <QrCode class="w-3.5 h-3.5" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12px] font-medium text-white leading-tight">Digital Store Pass</span>
                          <span class="text-[10px] text-neutral-400 font-mono">ENCRYPTED DYNAMIC QR</span>
                        </div>
                      </div>
                      <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                        <Check class="w-3 h-3 stroke-[2.5]" />
                        Verified Guest
                      </span>
                    </div>

                    <!-- Pass Preview Card -->
                    <div class="my-auto flex items-center justify-between p-3 rounded-[10px] bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-inner">
                      <div class="flex items-center gap-3">
                        <div class="size-[48px] bg-white rounded-[8px] p-1 flex items-center justify-center shrink-0 shadow-sm">
                          <QrCode class="size-full text-black stroke-[1.8]" />
                        </div>
                        <div class="flex flex-col">
                          <span class="text-[12px] font-medium text-white">707 Official Entrance Pass</span>
                          <span class="text-[10.5px] text-neutral-400 font-mono">PASS #707-8821</span>
                          <span class="text-[10px] text-emerald-400 font-medium mt-0.5">Admit 1 Guest · Main Gate</span>
                        </div>
                      </div>
                      <div class="text-right">
                        <span class="text-[9px] uppercase tracking-wider text-neutral-400 font-mono block">Station</span>
                        <span class="text-[11px] font-medium text-white">Tablet A-01</span>
                      </div>
                    </div>

                    <!-- Pass Footer -->
                    <div class="flex items-center justify-between text-[9.5px] font-mono text-neutral-400 pt-1.5 border-t border-white/10">
                      <span>DOOR SCANNER SYNC</span>
                      <span class="text-emerald-400">INSTANT ZERO-DELAY ADMISSION</span>
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
import { X, Layers, Ticket, QrCode, Check, ArrowRight, ShieldCheck } from 'lucide-vue-next';
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

@keyframes scan {
  0% {
    top: 0%;
    opacity: 0;
  }
  20% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.9;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.animate-scan {
  animation: scan 2.6s ease-in-out infinite;
}
</style>
