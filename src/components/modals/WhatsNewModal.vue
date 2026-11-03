<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-sans font-light tracking-normal animate-apple-fade"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <!-- Stacked Card Deck Container (incorporates the subtle depth peek behind active card) -->
        <div class="relative w-full max-w-[480px]">
          <!-- Card Deck Depth Peek (Stacked Card Shadow on the right, matching reference) -->
          <div 
            class="absolute -right-2.5 sm:-right-3 top-3 bottom-3 w-16 bg-neutral-100/90 rounded-[28px] border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.12)] pointer-events-none -z-10 hidden sm:block transform translate-x-1" 
          />

          <!-- Main Active Card (Reference: TwelveLabs clean 28px rounded white card) -->
          <div 
            class="w-full bg-white rounded-[28px] border border-black/10 shadow-[0_24px_70px_rgba(0,0,0,0.18)] p-6 sm:p-7 flex flex-col gap-4.5 text-black overflow-hidden relative animate-apple-pop"
          >
            <!-- 1. Hero Feature Visual Stage: Clean Animated Illustration on Warm Pastel Canvas -->
            <div class="w-full h-[220px] rounded-[20px] relative overflow-hidden border border-black/5 shadow-2xs select-none">
              
              <!-- Slide Transition for the Animated Illustrations -->
              <Transition name="illustration-fade" mode="out-in">
                <!-- ============================================================== -->
                <!-- SLIDE 1: 707 Design Studio 1.5 Architecture (Modular Engine)   -->
                <!-- ============================================================== -->
                <div 
                  v-if="currentStep === 0" 
                  key="slide-0"
                  class="size-full bg-gradient-to-br from-[#fff7f0] via-[#fdf5f2] to-[#f5f5f7] relative flex items-center justify-center overflow-hidden"
                >
                  <!-- Ambient soft luminous background glows -->
                  <div class="absolute -top-12 -left-12 size-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div class="absolute -bottom-10 -right-10 size-40 bg-rose-400/15 rounded-full blur-2xl pointer-events-none" />

                  <!-- Illustration Scene: Floating Modular System -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Floating Satellite Card: Visual Drops (Left) -->
                    <div class="absolute left-2 top-6 bg-white/95 rounded-[12px] border border-black/8 shadow-md p-2.5 flex items-center gap-2 animate-float-slow">
                      <div class="size-7 rounded-[7px] bg-black/5 flex items-center justify-center text-black">
                        <Layers class="w-3.5 h-3.5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[11px] font-medium text-black leading-tight">Drop Studio</span>
                        <span class="text-[9px] text-neutral-400 font-mono">Visual Canvas</span>
                      </div>
                    </div>

                    <!-- Floating Satellite Card: Store Scanner (Right) -->
                    <div class="absolute right-2 bottom-6 bg-white/95 rounded-[12px] border border-black/8 shadow-md p-2.5 flex items-center gap-2 animate-float-delayed">
                      <div class="size-7 rounded-[7px] bg-moss-50 flex items-center justify-center text-moss-700">
                        <QrCode class="w-3.5 h-3.5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[11px] font-medium text-black leading-tight">Store Passes</span>
                        <span class="text-[9px] text-moss-700 font-mono">Live Scanner</span>
                      </div>
                    </div>

                    <!-- Main Center Monogram Card with Luminous Breathing Core -->
                    <div class="relative z-10 bg-white rounded-[16px] border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.12)] p-4 flex flex-col items-center gap-2.5 w-[160px] animate-float-gentle">
                      <div class="size-11 rounded-full bg-black text-white flex items-center justify-center relative shadow-sm">
                        <Sparkles class="w-5 h-5 text-amber-300" />
                        <span class="absolute inset-0 rounded-full border border-amber-300/40 animate-ping opacity-30" />
                      </div>
                      
                      <div class="flex flex-col items-center text-center">
                        <span class="text-[12px] font-medium text-black leading-tight">Engine v1.5</span>
                        <span class="text-[10px] text-neutral-400 font-mono mt-0.5">3 Modular Activations</span>
                      </div>

                      <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/5 text-[9.5px] font-mono text-neutral-600">
                        <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Ready to deploy</span>
                      </div>
                    </div>

                    <!-- Reference-style Floating Prompt Pill Overlay -->
                    <div class="absolute -bottom-1 left-4 z-20 bg-white/98 rounded-[12px] border border-black/10 shadow-lg px-3 py-2 flex items-center justify-between gap-3 min-w-[210px] animate-float-slow">
                      <div class="flex flex-col">
                        <span class="text-[10.5px] font-medium text-black">Campaign Architecture</span>
                        <span class="text-[9px] text-neutral-400 font-mono">Real-time sync active</span>
                      </div>
                      <div class="size-5 rounded-full bg-black text-white flex items-center justify-center">
                        <Check class="w-3 h-3 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ============================================================== -->
                <!-- SLIDE 2: Drop Studio (Visual Mobile Builder & Dynamic Canvas)  -->
                <!-- ============================================================== -->
                <div 
                  v-else-if="currentStep === 1" 
                  key="slide-1"
                  class="size-full bg-gradient-to-br from-[#f2f4ff] via-[#f7f8ff] to-[#f4f3fb] relative flex items-center justify-center overflow-hidden"
                >
                  <div class="absolute -top-10 -right-10 size-40 bg-indigo-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div class="absolute -bottom-10 -left-10 size-40 bg-purple-400/15 rounded-full blur-2xl pointer-events-none" />

                  <!-- Minimal Smartphone Silhouette with Floating Component Elements -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Stylized Smartphone Canvas Frame -->
                    <div class="w-[155px] h-[185px] bg-white rounded-[20px] border border-black/12 shadow-lg p-2 flex flex-col justify-between overflow-hidden relative">
                      <!-- Notch -->
                      <div class="w-12 h-2.5 rounded-full bg-black/10 mx-auto" />

                      <!-- Mini drop banner mockup -->
                      <div class="w-full h-12 rounded-[8px] bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden relative">
                        <div class="size-16 rounded-full bg-indigo-200/50 absolute blur-lg" />
                        <span class="text-[9px] font-medium text-indigo-900 relative z-10">DROP CANVAS</span>
                      </div>

                      <!-- Placeholder text bars -->
                      <div class="flex flex-col gap-1 w-full px-0.5">
                        <div class="h-2 rounded-full bg-neutral-200 w-3/4 animate-pulse" />
                        <div class="h-1.5 rounded-full bg-neutral-100 w-full" />
                      </div>

                      <!-- Interactive CTA in phone -->
                      <div class="h-6 rounded-[7px] bg-black text-white text-[9px] font-medium flex items-center justify-center gap-1 shadow-xs">
                        <span>RSVP Now</span>
                        <ArrowRight class="w-2.5 h-2.5" />
                      </div>
                    </div>

                    <!-- Floating Interaction Card: Live RSVP Bubble (TwelveLabs Prompt Style) -->
                    <div class="absolute right-3 top-6 z-20 bg-white/98 rounded-[14px] border border-black/10 shadow-xl p-3 flex flex-col gap-1.5 w-[165px] animate-float-slow">
                      <div class="flex items-center justify-between">
                        <span class="text-[9.5px] uppercase font-mono text-neutral-400">Live RSVP</span>
                        <span class="px-1.5 py-0.2 rounded bg-moss-50 text-moss-700 text-[9px] font-medium">Valid</span>
                      </div>
                      <p class="text-[11px] font-medium text-black leading-tight">Instant RSVP Form</p>
                      <div class="flex items-center gap-1 pt-1 border-t border-black/5 text-[9px] text-neutral-500 font-mono">
                        <Check class="w-2.5 h-2.5 text-moss-600" />
                        <span>One-click deploy</span>
                      </div>
                    </div>

                    <!-- Floating Palette Badge -->
                    <div class="absolute left-2 bottom-3 z-20 bg-white/95 rounded-[10px] border border-black/10 shadow-md px-2.5 py-1.5 flex items-center gap-1.5 animate-float-delayed">
                      <div class="size-2 rounded-full bg-indigo-500 animate-ping" />
                      <span class="text-[9.5px] font-mono text-neutral-700">WYSIWYG Editor</span>
                    </div>
                  </div>
                </div>

                <!-- ============================================================== -->
                <!-- SLIDE 3: Smart Raffles (Ballot Shuffling & Anti-Bot Shield)    -->
                <!-- ============================================================== -->
                <div 
                  v-else-if="currentStep === 2" 
                  key="slide-2"
                  class="size-full bg-gradient-to-br from-[#fff9ea] via-[#fffbf3] to-[#f7f5ed] relative flex items-center justify-center overflow-hidden"
                >
                  <div class="absolute -top-10 -left-10 size-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div class="absolute -bottom-10 -right-10 size-40 bg-orange-400/15 rounded-full blur-2xl pointer-events-none" />

                  <!-- Shuffling Sneaker Ballot Tickets Scene -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Background Ticket Card 1 (Tilted Left) -->
                    <div class="absolute w-[180px] h-[100px] rounded-[14px] bg-white/70 border border-black/8 shadow-sm transform -rotate-6 -translate-x-8 -translate-y-2 pointer-events-none" />

                    <!-- Background Ticket Card 2 (Tilted Right) -->
                    <div class="absolute w-[180px] h-[100px] rounded-[14px] bg-white/70 border border-black/8 shadow-sm transform rotate-6 translate-x-8 -translate-y-1 pointer-events-none" />

                    <!-- Center Active Ballot Ticket Card -->
                    <div class="relative z-10 w-[220px] bg-white rounded-[16px] border border-black/12 shadow-[0_12px_36px_rgba(0,0,0,0.1)] p-3.5 flex flex-col gap-2.5 animate-float-gentle">
                      <!-- Ticket Header -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <Ticket class="w-3.5 h-3.5 text-amber-500" />
                          <span class="text-[11.5px] font-medium text-black">Official Sneaker Ballot</span>
                        </div>
                        <span class="text-[9.5px] font-mono text-neutral-400">#707-RAFFLE</span>
                      </div>

                      <!-- Size Pills Selector Preview -->
                      <div class="flex items-center justify-between gap-1">
                        <span class="flex-1 py-1 rounded-[6px] bg-black/5 text-[9.5px] font-mono text-neutral-600 text-center">US 8.5</span>
                        <span class="flex-1 py-1 rounded-[6px] bg-black text-white text-[9.5px] font-mono font-medium text-center shadow-2xs">US 9.0</span>
                        <span class="flex-1 py-1 rounded-[6px] bg-black/5 text-[9.5px] font-mono text-neutral-600 text-center">US 9.5</span>
                        <span class="flex-1 py-1 rounded-[6px] bg-black/5 text-[9.5px] font-mono text-neutral-600 text-center">US 10</span>
                      </div>

                      <!-- Bottom verification footer -->
                      <div class="flex items-center justify-between text-[9px] font-mono pt-1.5 border-t border-dashed border-black/10 text-neutral-500">
                        <span>1 TICKET / PERSON</span>
                        <span class="text-amber-600 font-medium">FAIR RANDOM DRAW</span>
                      </div>
                    </div>

                    <!-- Floating Anti-Bot Shield Pill (TwelveLabs Prompt Style) -->
                    <div class="absolute -bottom-2 right-4 z-20 bg-white/98 rounded-[12px] border border-black/10 shadow-lg px-3 py-1.5 flex items-center gap-2 animate-float-slow">
                      <ShieldCheck class="w-3.5 h-3.5 text-amber-500" />
                      <div class="flex flex-col">
                        <span class="text-[10px] font-medium text-black leading-tight">Anti-Bot Shield</span>
                        <span class="text-[8.5px] text-neutral-400 font-mono">CAPTCHA & Quotas</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ============================================================== -->
                <!-- SLIDE 4: Store Passes (Dynamic QR & Zero-Delay Scanner)       -->
                <!-- ============================================================== -->
                <div 
                  v-else 
                  key="slide-3"
                  class="size-full bg-gradient-to-br from-[#effcf5] via-[#f4fcf7] to-[#ecf7f1] relative flex items-center justify-center overflow-hidden"
                >
                  <div class="absolute -top-10 -right-10 size-40 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />
                  <div class="absolute -bottom-10 -left-10 size-40 bg-teal-400/15 rounded-full blur-2xl pointer-events-none" />

                  <!-- Digital Store Pass & Laser HUD Scene -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Digital Pass Card -->
                    <div class="w-[210px] bg-white rounded-[16px] border border-black/12 shadow-[0_12px_36px_rgba(0,0,0,0.1)] p-3.5 flex flex-col gap-2.5 relative overflow-hidden animate-float-gentle">
                      <!-- Scanning Laser Line Overlay -->
                      <div class="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-laser-scan pointer-events-none z-10" />

                      <!-- Pass Header -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <div class="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span class="text-[11px] font-medium text-black">Store VIP Pass</span>
                        </div>
                        <span class="text-[9px] font-mono text-neutral-400">#PASS-8821</span>
                      </div>

                      <!-- Geometric QR Code Graphic -->
                      <div class="size-20 mx-auto bg-neutral-50 rounded-[10px] p-2 border border-black/5 flex items-center justify-center relative">
                        <QrCode class="size-full text-black stroke-[1.6]" />
                      </div>

                      <!-- Pass Status -->
                      <div class="flex items-center justify-between text-[9px] font-mono pt-1.5 border-t border-black/5 text-neutral-500">
                        <span>ENTRANCE GATE</span>
                        <span class="text-moss-700 font-medium">ADMIT 1 GUEST</span>
                      </div>
                    </div>

                    <!-- Floating Verified Scanner Badge (TwelveLabs Prompt Style) -->
                    <div class="absolute -bottom-2 left-4 z-20 bg-white/98 rounded-[12px] border border-black/10 shadow-lg px-3 py-1.5 flex items-center gap-2 animate-float-slow">
                      <div class="size-5 rounded-full bg-moss-600 text-white flex items-center justify-center">
                        <Check class="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[10px] font-medium text-black leading-tight">Instant Admission</span>
                        <span class="text-[8.5px] text-moss-700 font-mono">Zero-delay scanner</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 2. Centered Capsule Badges (Matching TwelveLabs [NEW] [FEATURE] Capsule Badges) -->
            <div class="flex items-center justify-center gap-1.5 pt-1">
              <span class="px-2 py-0.5 rounded-[4px] border border-black/20 text-[10px] font-mono font-medium text-black uppercase tracking-normal">
                NEW
              </span>
              <span class="px-2 py-0.5 rounded-[4px] border border-black/20 text-[10px] font-mono font-medium text-neutral-600 uppercase tracking-normal">
                {{ activeStep.badge }}
              </span>
            </div>

            <!-- 3. Headline & Description (Strictly Apple SF Pro Light / Medium Typography) -->
            <div class="flex flex-col items-center text-center gap-1.5 px-2">
              <h3 id="whats-new-title" class="text-[20px] sm:text-[21px] font-medium text-black tracking-normal leading-snug">
                {{ activeStep.title }}
              </h3>
              <p class="text-[13px] sm:text-[13.5px] text-neutral-500 font-light leading-[21px] max-w-[380px] mx-auto">
                {{ activeStep.description }}
              </p>
            </div>

            <!-- 4. Minimalist Stepper Dots (Interactive) -->
            <div class="flex items-center justify-center gap-1.5 py-0.5">
              <button
                v-for="(_, idx) in steps"
                :key="idx"
                type="button"
                @click="currentStep = idx"
                class="h-1.5 rounded-full transition-all duration-300 cursor-pointer border-0 p-0 outline-none"
                :class="currentStep === idx ? 'w-5 bg-black' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'"
                :title="`Slide ${idx + 1}`"
              />
            </div>

            <!-- 5. Action Footer (Cancel on left, Next / Get Started on right) -->
            <div class="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                @click="emit('close')"
                class="h-[38px] px-5 rounded-[12px] border border-black/15 hover:bg-neutral-50 active:bg-neutral-100 text-[12.5px] font-medium text-neutral-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div class="flex items-center gap-2">
                <button
                  v-if="currentStep < steps.length - 1"
                  type="button"
                  @click="currentStep++"
                  class="h-[38px] px-6 rounded-[12px] bg-black hover:bg-neutral-800 text-white text-[12.5px] font-medium transition-colors apple-press cursor-pointer shadow-xs"
                >
                  Next
                </button>
                <button
                  v-else
                  type="button"
                  @click="emit('close')"
                  class="h-[38px] px-6 rounded-[12px] bg-black hover:bg-neutral-800 text-white text-[12.5px] font-medium transition-colors apple-press cursor-pointer shadow-xs"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Layers, Ticket, QrCode, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const currentStep = ref(0);

const steps = [
  {
    id: 'intro',
    badge: 'STUDIO 1.5',
    title: 'New look with enhanced capabilities',
    description: 'Design Studio 1.5 is here with a fresh architectural look. Build mobile campaigns, run anti-bot raffles, and issue live store passes.'
  },
  {
    id: 'drops',
    badge: 'DROP BUILDER',
    title: 'Mobile-first visual launchpad',
    description: 'Design interactive campaign RSVP pages with live canvas preview, customizable forms, and instant edge deployment.'
  },
  {
    id: 'raffles',
    badge: 'SMART RAFFLES',
    title: 'Bot-proof community balloting',
    description: 'Host fair high-heat release balloting with authenticated shoe size quotas, anti-bot protection, and automated drawing.'
  },
  {
    id: 'passes',
    badge: 'STORE PASSES',
    title: 'Dynamic digital QR entrance passes',
    description: 'Issue encrypted dynamic QR passes to approved guests, verified in real-time with our zero-delay door scanner.'
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

.illustration-fade-enter-active,
.illustration-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.illustration-fade-enter-from {
  opacity: 0;
  transform: scale(0.97) translateY(4px);
}

.illustration-fade-leave-to {
  opacity: 0;
  transform: scale(1.02) translateY(-4px);
}

@keyframes floatGentle {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes floatSlow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

@keyframes floatDelayed {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(6px);
  }
}

@keyframes laserScan {
  0% {
    top: 15%;
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    top: 85%;
    opacity: 0;
  }
}

.animate-float-gentle {
  animation: floatGentle 4.5s ease-in-out infinite;
}

.animate-float-slow {
  animation: floatSlow 5s ease-in-out infinite;
}

.animate-float-delayed {
  animation: floatDelayed 5.5s ease-in-out infinite 0.75s;
}

.animate-laser-scan {
  animation: laserScan 2.4s ease-in-out infinite;
}
</style>
