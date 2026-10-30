<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-707 animate-apple-fade"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intro-title"
      >
        <!-- Modal Card Container (Apple-spec rounded 24px, 0.5px hairline border) -->
        <div 
          class="relative w-full max-w-[560px] bg-white/95 backdrop-blur-2xl rounded-[24px] border-[0.5px] border-black/10 shadow-[0_30px_90px_rgba(0,0,0,0.22),0_1px_3px_rgba(0,0,0,0.06)] p-7 md:p-8 flex flex-col gap-6 animate-apple-pop text-black overflow-hidden"
        >
          <!-- Top Right Close Button -->
          <button 
            type="button"
            @click="emit('close')"
            class="absolute top-5 right-5 size-[28px] bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-600 hover:text-black rounded-full flex items-center justify-center apple-press transition-colors cursor-pointer border-0 outline-none z-20"
            title="Close"
            aria-label="Close"
          >
            <X class="w-4 h-4 stroke-[2]" />
          </button>

          <!-- Top Brand Header Section -->
          <div class="flex flex-col items-start gap-2.5 pr-8">
            <div class="flex items-center gap-2">
              <img 
                :src="FIGMA_ASSETS.logoDesignStudio" 
                alt="707 Design Studio" 
                class="h-[17px] w-auto object-contain pointer-events-none" 
              />
              <span class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white border border-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10px] font-707 font-medium text-black leading-none">
                1.5
              </span>
            </div>

            <div>
              <h2 id="intro-title" class="text-[23px] md:text-[25px] font-normal tracking-[-0.03em] text-black leading-tight">
                Introducing 707 Design Studio
              </h2>
              <p class="text-[13px] text-neutral-500 font-light leading-relaxed mt-1">
                The activation engine for exclusive drops, community raffles, and seamless retail store passes.
              </p>
            </div>
          </div>

          <!-- Interactive 3-Pillar Tabbed Segmented Switcher -->
          <div class="p-1 bg-black/[0.04] border-[0.5px] border-black/5 rounded-[12px] flex items-center gap-1">
            <button
              v-for="(pillar, idx) in pillars"
              :key="pillar.id"
              type="button"
              @click="currentStep = idx"
              class="flex-1 py-1.5 px-2 rounded-[8px] text-[12px] font-medium transition-all text-center cursor-pointer border-[0.5px] flex items-center justify-center gap-1.5"
              :class="currentStep === idx ? 'bg-white text-black shadow-xs border-black/10' : 'text-neutral-500 hover:text-black border-transparent'"
            >
              <component :is="pillar.icon" class="w-3.5 h-3.5 stroke-[1.8]" />
              <span class="truncate">{{ pillar.tabLabel }}</span>
            </button>
          </div>

          <!-- Interactive Showcase Body with Slide Transition -->
          <div class="relative min-h-[220px] overflow-hidden">
            <Transition name="slide-swipe" mode="out-in">
              <div 
                :key="currentStep" 
                class="flex flex-col gap-4 bg-[#f8f8f9] border-[0.5px] border-black/10 rounded-[16px] p-5 shadow-inner-xs"
              >
                <!-- Pillar Description Row -->
                <div class="flex items-start justify-between gap-4">
                  <div class="flex flex-col gap-1 min-w-0 flex-1">
                    <span class="text-[10.5px] uppercase font-mono tracking-wider text-neutral-400">
                      Pillar 0{{ currentStep + 1 }} · {{ activePillar.category }}
                    </span>
                    <h3 class="text-[15px] font-medium text-black leading-snug">
                      {{ activePillar.title }}
                    </h3>
                    <p class="text-[12.5px] text-neutral-600 font-light leading-relaxed">
                      {{ activePillar.description }}
                    </p>
                  </div>

                  <!-- Feature Icon Pill -->
                  <div class="size-10 rounded-[12px] bg-white border-[0.5px] border-black/10 flex items-center justify-center text-black shrink-0 shadow-2xs">
                    <component :is="activePillar.icon" class="w-5 h-5 stroke-[1.8]" />
                  </div>
                </div>

                <!-- Interactive Mini Visual Component for each Pillar -->
                <!-- Slide 1: Drop Studio Interactive Mockup -->
                <div 
                  v-if="currentStep === 0" 
                  class="bg-white rounded-[12px] border-[0.5px] border-black/10 p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div class="flex items-center gap-3">
                    <div class="size-11 rounded-[8px] bg-neutral-900 text-white flex items-center justify-center font-bold text-xs uppercase tracking-tight shrink-0">
                      DROP
                    </div>
                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span class="text-[12.5px] font-medium text-black">adidas x SATISFY</span>
                      </div>
                      <span class="text-[11px] text-neutral-400 font-light">Adizero Adios · Instant Win Raffle</span>
                    </div>
                  </div>
                  <span class="h-[28px] px-3 rounded-full bg-black text-white text-[11px] font-medium flex items-center justify-center cursor-default shadow-xs">
                    Live v11
                  </span>
                </div>

                <!-- Slide 2: Smart Raffles Interactive Mockup (Clickable options) -->
                <div 
                  v-else-if="currentStep === 1" 
                  class="bg-white rounded-[12px] border-[0.5px] border-black/10 p-3.5 flex flex-col gap-2.5 shadow-2xs"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Pick Preferred Size</span>
                    <span class="text-[10.5px] text-neutral-400">350 Spots Shared</span>
                  </div>
                  <div class="grid grid-cols-4 gap-2">
                    <button
                      v-for="size in ['US 8.5', 'US 9.0', 'US 9.5', 'US 10']"
                      :key="size"
                      type="button"
                      @click="selectedSize = size"
                      class="py-1.5 rounded-[8px] text-[11.5px] font-medium transition-all text-center cursor-pointer border-[0.5px]"
                      :class="selectedSize === size ? 'bg-black text-white border-black shadow-xs' : 'bg-neutral-50 hover:bg-neutral-100 text-black border-black/10'"
                    >
                      {{ size }}
                    </button>
                  </div>
                </div>

                <!-- Slide 3: Digital Pass & Door Scanner Mockup -->
                <div 
                  v-else 
                  class="bg-white rounded-[12px] border-[0.5px] border-black/10 p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div class="flex items-center gap-3">
                    <div class="size-11 rounded-[8px] bg-neutral-50 border-[0.5px] border-black/10 flex items-center justify-center text-black shrink-0">
                      <QrCode class="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-[12.5px] font-medium text-black">707 Official Pass</span>
                      <span class="text-[11px] text-neutral-400 font-light">Door Scanner Auto-Sync · Access Granted</span>
                    </div>
                  </div>
                  <span class="h-[28px] px-3 rounded-full bg-emerald-50 text-emerald-700 border-[0.5px] border-emerald-300 text-[11px] font-medium flex items-center gap-1 shadow-2xs">
                    <Check class="w-3 h-3 stroke-[2.5]" />
                    <span>Verified</span>
                  </span>
                </div>

                <!-- Capability Badges Footer -->
                <div class="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span
                    v-for="tag in activePillar.tags"
                    :key="tag"
                    class="px-2 py-0.5 rounded-[6px] bg-white border-[0.5px] border-black/10 text-[10.5px] text-neutral-600 font-light"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Bottom Navigation & Controls -->
          <div class="pt-2 border-t border-[0.5px] border-black/10 flex items-center justify-between gap-4">
            <!-- Stepper Dots -->
            <div class="flex items-center gap-1.5">
              <button
                v-for="(_, idx) in pillars"
                :key="idx"
                type="button"
                @click="currentStep = idx"
                class="size-2 rounded-full transition-all cursor-pointer border-0 p-0 outline-none"
                :class="currentStep === idx ? 'bg-black w-5' : 'bg-neutral-300 hover:bg-neutral-400'"
                :title="`Slide ${idx + 1}`"
              />
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <button 
                v-if="currentStep > 0"
                type="button"
                @click="currentStep--"
                class="h-[36px] px-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-black font-medium text-[12.5px] transition-colors apple-press cursor-pointer border-0 outline-none"
              >
                Previous
              </button>

              <button 
                v-if="currentStep < pillars.length - 1"
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

const pillars = [
  {
    id: 'studio',
    tabLabel: 'Drop Studio',
    category: 'Design Engine',
    title: 'Craft cinematic drops without code',
    description: 'Assemble mobile-first event launch pages with modular media banners, responsive typography presets, and hardware-accurate live previews.',
    icon: Layers,
    tags: ['Drag & Drop Blocks', 'Typography Presets', 'Real-Time Preview', 'Instant Publishing']
  },
  {
    id: 'raffles',
    tabLabel: 'Smart Raffles',
    category: 'Engagement & Fair Access',
    title: 'Fair access and queueing for the community',
    description: 'Host limited sneaker and apparel releases with anti-bot protection, dynamic time-windows, shoe size pickers, and automated WhatsApp confirmations.',
    icon: Ticket,
    tags: ['Anti-Bot Verification', 'Spot Reservation', 'Size Grid Selection', 'Instant Confirmation']
  },
  {
    id: 'pass',
    tabLabel: 'Store Passes',
    category: 'Retail Activation',
    title: 'From web drop to store entrance in one scan',
    description: 'Automatically issue encrypted QR passes that synchronize directly with the 707 physical store entrance scanner for effortless door check-ins.',
    icon: QrCode,
    tags: ['Encrypted QR Pass', 'Apple Wallet Style', 'Door Scanner Sync', 'Live Attendance Ops']
  }
];

const activePillar = computed(() => pillars[currentStep.value]);

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowRight' && currentStep.value < pillars.length - 1) {
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

.slide-swipe-enter-active,
.slide-swipe-leave-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-swipe-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.slide-swipe-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
