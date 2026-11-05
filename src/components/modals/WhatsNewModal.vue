<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-sans font-light tracking-normal animate-apple-fade"
        :class="isDark ? 'bg-black/75' : 'bg-black/45'"
        @click.self="handleClose"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <!-- Main Modal Window -->
        <div 
          class="w-full max-w-[480px] rounded-[28px] p-7 sm:p-8 flex flex-col overflow-hidden relative animate-apple-pop transition-all duration-200"
          :class="isDark 
            ? 'bg-[#141414] border border-white/15 text-white shadow-[0_24px_70px_rgba(0,0,0,0.85)]' 
            : 'bg-white border border-black/10 text-black shadow-[0_24px_70px_rgba(0,0,0,0.18)]'"
        >
            <!-- 1. Hero Feature Visual Stage: Monochromatic Minimalist Vector Canvas -->
            <div 
              class="w-full h-[210px] rounded-[20px] relative overflow-hidden shadow-2xs select-none border"
              :class="isDark ? 'border-white/10 bg-[#0d0d0d]' : 'border-black/8 bg-[#f6f6f8]'"
            >
              
              <!-- Slide Transition for the Animated Illustrations -->
              <Transition name="illustration-fade" mode="out-in">
                <!-- ============================================================== -->
                <!-- SLIDE 1: 707 Design Studio 1.5 Architecture (Monochromatic)    -->
                <!-- ============================================================== -->
                <div 
                  v-if="currentStep === 0" 
                  key="slide-0"
                  class="size-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b"
                  :class="isDark ? 'from-[#181818] via-[#121212] to-[#0a0a0a]' : 'from-[#fbfbfd] via-[#f5f5f7] to-[#ececef]'"
                >
                  <!-- Subtle monochromatic ambient highlights -->
                  <div class="absolute -top-12 -left-12 size-40 rounded-full blur-2xl pointer-events-none" :class="isDark ? 'bg-white/[0.04]' : 'bg-black/[0.03]'" />
                  <div class="absolute -bottom-10 -right-10 size-40 rounded-full blur-2xl pointer-events-none" :class="isDark ? 'bg-white/[0.02]' : 'bg-white'" />

                  <!-- Illustration Scene: Floating Modular System -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Floating Satellite Card: Visual Drops (Left) -->
                    <div 
                      class="absolute left-2 top-5 rounded-[12px] border p-2.5 flex items-center gap-2 animate-float-slow"
                      :class="isDark ? 'bg-[#1c1c1c] border-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]' : 'bg-white border-black/10 text-black shadow-[0_4px_16px_rgba(0,0,0,0.06)]'"
                    >
                      <div class="size-7 rounded-[7px] flex items-center justify-center" :class="isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-800'">
                        <Layers class="w-3.5 h-3.5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[11px] font-medium leading-tight" :class="isDark ? 'text-white' : 'text-black'">Drop Studio</span>
                        <span class="text-[9.5px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Visual Canvas</span>
                      </div>
                    </div>

                    <!-- Floating Satellite Card: Store Scanner (Right) -->
                    <div 
                      class="absolute right-2 bottom-5 rounded-[12px] border p-2.5 flex items-center gap-2 animate-float-delayed"
                      :class="isDark ? 'bg-[#1c1c1c] border-white/15 text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]' : 'bg-white border-black/10 text-black shadow-[0_4px_16px_rgba(0,0,0,0.06)]'"
                    >
                      <div class="size-7 rounded-[7px] flex items-center justify-center" :class="isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-800'">
                        <QrCode class="w-3.5 h-3.5" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[11px] font-medium leading-tight" :class="isDark ? 'text-white' : 'text-black'">Store Passes</span>
                        <span class="text-[9.5px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Live Scanner</span>
                      </div>
                    </div>

                    <!-- Main Center Monogram Card with Luminous Breathing Core -->
                    <div 
                      class="relative z-10 rounded-[16px] border p-4 flex flex-col items-center gap-2.5 w-[160px] animate-float-gentle"
                      :class="isDark ? 'bg-[#1c1c1c] border-white/15 text-white shadow-[0_12px_36px_rgba(0,0,0,0.5)]' : 'bg-white border-black/10 text-black shadow-[0_12px_36px_rgba(0,0,0,0.1)]'"
                    >
                      <div 
                        class="size-11 rounded-full flex items-center justify-center relative shadow-sm"
                        :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
                      >
                        <Sparkles class="w-5 h-5" :class="isDark ? 'text-black' : 'text-neutral-100'" />
                        <span class="absolute inset-0 rounded-full border animate-ping opacity-30" :class="isDark ? 'border-white/40' : 'border-neutral-400/40'" />
                      </div>
                      
                      <div class="flex flex-col items-center text-center">
                        <span class="text-[12px] font-medium leading-tight" :class="isDark ? 'text-white' : 'text-black'">Studio 1.5</span>
                        <span class="text-[10px] font-light mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Active Workspace</span>
                      </div>

                      <div 
                        class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] font-light"
                        :class="isDark ? 'bg-white/10 text-neutral-300' : 'bg-neutral-100 text-neutral-700'"
                      >
                        <span class="size-1.5 rounded-full animate-pulse" :class="isDark ? 'bg-emerald-400' : 'bg-neutral-800'" />
                        <span>Ready to deploy</span>
                      </div>
                    </div>

                    <!-- Solid Floating Prompt Pill Overlay (100% Opaque for high contrast & readability) -->
                    <div 
                      class="absolute -bottom-1 left-4 z-20 rounded-[13px] border px-3.5 py-2 flex items-center justify-between gap-3 min-w-[210px] animate-float-slow"
                      :class="isDark ? 'bg-[#222] border-white/20 text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)]' : 'bg-white border-black/10 text-black shadow-[0_8px_24px_rgba(0,0,0,0.12)]'"
                    >
                      <div class="flex flex-col">
                        <span class="text-[10.5px] font-medium leading-tight" :class="isDark ? 'text-white' : 'text-black'">Campaign Architecture</span>
                        <span class="text-[9.5px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Real-time sync active</span>
                      </div>
                      <div 
                        class="size-5 rounded-full flex items-center justify-center shrink-0"
                        :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
                      >
                        <Check class="w-3 h-3 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ============================================================== -->
                <!-- SLIDE 2: Campaign Builder (Mobile-first RSVP & Live Preview)  -->
                <!-- ============================================================== -->
                <div 
                  v-else-if="currentStep === 1" 
                  key="slide-1"
                  class="size-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b"
                  :class="isDark ? 'from-[#181818] via-[#121212] to-[#0a0a0a]' : 'from-[#fbfbfd] via-[#f5f5f7] to-[#ececef]'"
                >
                  <div class="absolute -top-10 -right-10 size-40 rounded-full blur-2xl pointer-events-none" :class="isDark ? 'bg-white/[0.04]' : 'bg-black/[0.03]'" />
                  <div class="absolute -bottom-10 -left-10 size-40 rounded-full blur-2xl pointer-events-none" :class="isDark ? 'bg-white/[0.02]' : 'bg-white'" />

                  <!-- Minimal Smartphone Silhouette with Floating Component Elements -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Stylized Smartphone Canvas Frame (Monochromatic) -->
                    <div 
                      class="w-[155px] h-[180px] rounded-[20px] border p-2.5 flex flex-col justify-between overflow-hidden relative"
                      :class="isDark ? 'bg-[#1c1c1c] border-white/15 shadow-[0_12px_32px_rgba(0,0,0,0.5)]' : 'bg-white border-black/12 shadow-[0_12px_32px_rgba(0,0,0,0.08)]'"
                    >
                      <!-- Notch -->
                      <div class="w-12 h-2 rounded-full mx-auto" :class="isDark ? 'bg-white/20' : 'bg-neutral-200'" />

                      <!-- Mini drop banner mockup -->
                      <div 
                        class="w-full h-11 rounded-[8px] border flex items-center justify-center overflow-hidden relative"
                        :class="isDark ? 'bg-white/10 border-white/15' : 'bg-neutral-100 border-neutral-200/80'"
                      >
                        <span class="text-[9.5px] font-medium tracking-normal" :class="isDark ? 'text-white' : 'text-neutral-800'">CAMPAIGN RSVP</span>
                      </div>

                      <!-- Placeholder text bars -->
                      <div class="flex flex-col gap-1.5 w-full px-0.5">
                        <div class="h-2 rounded-full w-3/4 animate-pulse" :class="isDark ? 'bg-white/25' : 'bg-neutral-200'" />
                        <div class="h-1.5 rounded-full w-full" :class="isDark ? 'bg-white/15' : 'bg-neutral-100'" />
                      </div>

                      <!-- Interactive CTA in phone -->
                      <div 
                        class="h-6 rounded-[7px] text-[9px] font-medium flex items-center justify-center gap-1 shadow-xs"
                        :class="isDark ? 'bg-white text-black font-semibold' : 'bg-black text-white'"
                      >
                        <span>Register Now</span>
                        <ArrowRight class="w-2.5 h-2.5" />
                      </div>
                    </div>

                    <!-- Solid Floating Interaction Card: Live RSVP Bubble (100% Opaque for high contrast) -->
                    <div 
                      class="absolute right-3 top-5 z-20 rounded-[13px] border p-3 flex flex-col gap-1.5 w-[165px] animate-float-slow"
                      :class="isDark ? 'bg-[#222] border-white/20 shadow-[0_10px_28px_rgba(0,0,0,0.5)] text-white' : 'bg-white border-black/10 shadow-[0_10px_28px_rgba(0,0,0,0.12)] text-black'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-[9.5px] font-medium" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">LIVE RSVP</span>
                        <span 
                          class="px-1.5 py-0.5 rounded text-[8.5px] font-medium"
                          :class="isDark ? 'bg-white/15 text-white' : 'bg-neutral-100 text-neutral-800'"
                        >
                          Valid
                        </span>
                      </div>
                      <p class="text-[11px] font-medium leading-tight" :class="isDark ? 'text-white' : 'text-black'">Instant RSVP Form</p>
                      <div 
                        class="flex items-center gap-1 pt-1 border-t text-[9.5px] font-light"
                        :class="isDark ? 'border-white/10 text-neutral-400' : 'border-black/5 text-neutral-500'"
                      >
                        <Check class="w-2.5 h-2.5" :class="isDark ? 'text-white' : 'text-neutral-800'" />
                        <span>One-click deploy</span>
                      </div>
                    </div>

                    <!-- Floating Palette Badge -->
                    <div 
                      class="absolute left-2 bottom-3 z-20 rounded-[10px] border shadow-md px-2.5 py-1.5 flex items-center gap-1.5 animate-float-delayed"
                      :class="isDark ? 'bg-[#1c1c1c] border-white/15 text-white' : 'bg-white border-black/10 text-black'"
                    >
                      <div class="size-2 rounded-full animate-ping" :class="isDark ? 'bg-white' : 'bg-black'" />
                      <span class="text-[9.5px] font-light" :class="isDark ? 'text-neutral-300' : 'text-neutral-700'">WYSIWYG Editor</span>
                    </div>
                  </div>
                </div>

                <!-- ============================================================== -->
                <!-- SLIDE 3: Store Passes & Door Scanner (Monochromatic)           -->
                <!-- ============================================================== -->
                <div 
                  v-else 
                  key="slide-2"
                  class="size-full relative flex items-center justify-center overflow-hidden bg-gradient-to-b"
                  :class="isDark ? 'from-[#181818] via-[#121212] to-[#0a0a0a]' : 'from-[#fbfbfd] via-[#f5f5f7] to-[#ececef]'"
                >
                  <div class="absolute -top-10 -right-10 size-40 rounded-full blur-2xl pointer-events-none" :class="isDark ? 'bg-white/[0.04]' : 'bg-black/[0.03]'" />
                  <div class="absolute -bottom-10 -left-10 size-40 rounded-full blur-2xl pointer-events-none" :class="isDark ? 'bg-white/[0.02]' : 'bg-white'" />

                  <!-- Digital Store Pass & Laser HUD Scene (Monochromatic) -->
                  <div class="relative w-[340px] h-[190px] flex items-center justify-center">
                    
                    <!-- Digital Pass Card (Solid White, Clean Monochromatic) -->
                    <div 
                      class="w-[210px] rounded-[16px] border p-3.5 flex flex-col gap-2.5 relative overflow-hidden animate-float-gentle"
                      :class="isDark ? 'bg-[#1c1c1c] border-white/15 text-white shadow-[0_12px_36px_rgba(0,0,0,0.5)]' : 'bg-white border-black/12 text-black shadow-[0_12px_36px_rgba(0,0,0,0.1)]'"
                    >
                      <!-- Sleek Monochromatic Scanning Laser Line Overlay -->
                      <div 
                        class="absolute inset-x-0 h-[2px] opacity-60 animate-laser-scan pointer-events-none z-10"
                        :class="isDark 
                          ? 'bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_8px_rgba(255,255,255,0.4)]' 
                          : 'bg-gradient-to-r from-transparent via-neutral-900 to-transparent shadow-[0_0_8px_rgba(0,0,0,0.3)]'"
                      />

                      <!-- Pass Header -->
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <div class="size-2 rounded-full animate-pulse" :class="isDark ? 'bg-emerald-400' : 'bg-neutral-900'" />
                          <span class="text-[11px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Store VIP Pass</span>
                        </div>
                        <span class="text-[9.5px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">#PASS-2038</span>
                      </div>

                      <!-- Geometric QR Code Graphic -->
                      <div 
                        class="size-20 mx-auto rounded-[10px] p-2 flex items-center justify-center relative"
                        :class="isDark ? 'bg-white' : 'bg-neutral-50 border border-black/5'"
                      >
                        <QrCode class="size-full text-black stroke-[1.6]" />
                      </div>

                      <!-- Pass Status -->
                      <div 
                        class="flex items-center justify-between text-[9.5px] font-light pt-1.5 border-t"
                        :class="isDark ? 'border-white/10 text-neutral-400' : 'border-black/5 text-neutral-500'"
                      >
                        <span>ENTRANCE GATE</span>
                        <span class="font-medium" :class="isDark ? 'text-white' : 'text-neutral-900'">ADMIT 1 GUEST</span>
                      </div>
                    </div>

                    <!-- Solid Floating Verified Scanner Badge (100% Opaque for high contrast & perfect readability) -->
                    <div 
                      class="absolute -bottom-2 left-4 z-20 rounded-[13px] border px-3.5 py-2 flex items-center gap-2.5 animate-float-slow"
                      :class="isDark ? 'bg-[#222] border-white/20 shadow-[0_10px_28px_rgba(0,0,0,0.5)] text-white' : 'bg-white border-black/10 shadow-[0_10px_28px_rgba(0,0,0,0.14)] text-black'"
                    >
                      <div 
                        class="size-5 rounded-full flex items-center justify-center shrink-0"
                        :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
                      >
                        <Check class="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-[10.5px] font-medium leading-tight" :class="isDark ? 'text-white' : 'text-black'">Instant Admission</span>
                        <span class="text-[9.5px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Zero-delay scanner</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 2. Centered Capsule Badges (Spacious top margin & clean SF Pro font) -->
            <div class="flex items-center justify-center gap-2 mt-6">
              <span 
                class="px-2.5 py-0.5 rounded-[4px] border text-[10px] font-sans font-medium uppercase tracking-normal"
                :class="isDark ? 'border-white/30 text-white bg-white/10' : 'border-black/25 text-black'"
              >
                NEW
              </span>
              <span 
                class="px-2.5 py-0.5 rounded-[4px] border text-[10px] font-sans font-medium uppercase tracking-normal"
                :class="isDark ? 'border-white/25 text-neutral-300 bg-white/5' : 'border-black/25 text-neutral-700'"
              >
                {{ activeStep.badge }}
              </span>
            </div>

            <!-- 3. Headline & Description (Strictly SF Pro Light / Medium Typography, spacious vertical separation) -->
            <div class="flex flex-col items-center text-center mt-3.5 px-3">
              <h3 
                id="whats-new-title" 
                class="text-[21px] sm:text-[22px] font-medium tracking-normal leading-snug"
                :class="isDark ? 'text-white' : 'text-black'"
              >
                {{ activeStep.title }}
              </h3>
              <p 
                class="text-[13.5px] sm:text-[14px] font-light leading-[22px] max-w-[390px] mx-auto mt-2.5"
                :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
              >
                {{ activeStep.description }}
              </p>
            </div>

            <!-- 4. Minimalist Stepper Dots (Interactive, spacious vertical spacing) -->
            <div class="flex items-center justify-center gap-2 mt-7 mb-1">
              <button
                v-for="(_, idx) in steps"
                :key="idx"
                type="button"
                @click="currentStep = idx"
                class="h-1.5 rounded-full transition-all duration-300 cursor-pointer border-0 p-0 outline-none"
                :class="currentStep === idx 
                  ? (isDark ? 'w-5 bg-white' : 'w-5 bg-black') 
                  : (isDark ? 'w-1.5 bg-neutral-700 hover:bg-neutral-500' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400')"
                :title="`Slide ${idx + 1}`"
              />
            </div>

            <!-- 5. Action Footer (Cancel on left, Next / Get Started on right, generous spacing) -->
            <div class="flex items-center justify-between gap-3 mt-6 pt-1">
              <button
                type="button"
                @click="handleClose"
                class="h-[40px] px-6 rounded-[12px] border text-[13px] font-medium transition-colors cursor-pointer"
                :class="isDark 
                  ? 'border-white/20 hover:bg-white/10 active:bg-white/15 text-neutral-300 hover:text-white' 
                  : 'border-black/15 hover:bg-neutral-50 active:bg-neutral-100 text-neutral-700'"
              >
                Cancel
              </button>

              <div class="flex items-center gap-2">
                <button
                  v-if="currentStep < steps.length - 1"
                  type="button"
                  @click="currentStep++"
                  class="h-[40px] px-7 rounded-[12px] text-[13px] font-medium transition-colors apple-press cursor-pointer shadow-xs"
                  :class="isDark ? 'bg-white text-black hover:bg-neutral-200 font-semibold' : 'bg-black hover:bg-neutral-800 text-white'"
                >
                  Next
                </button>
                <button
                  v-else
                  type="button"
                  @click="handleClose"
                  class="h-[40px] px-7 rounded-[12px] text-[13px] font-medium transition-colors apple-press cursor-pointer shadow-xs"
                  :class="isDark ? 'bg-white text-black hover:bg-neutral-200 font-semibold' : 'bg-black hover:bg-neutral-800 text-white'"
                >
                  Get Started
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
import { useRoute } from 'vue-router';
import { Layers, QrCode, Check, ArrowRight, Sparkles } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/authStore.ts';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  dark?: boolean;
}>(), {
  dark: undefined,
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const route = useRoute();
const authStore = useAuthStore();

const isDark = computed(() => {
  if (typeof props.dark === 'boolean') return props.dark;
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && route.path !== '/');
});

const currentStep = ref(0);

const steps = [
  {
    id: 'intro',
    badge: 'STUDIO 1.5',
    title: 'New look with enhanced capabilities',
    description: 'Design Studio 1.5 is here with a fresh architectural look. Manage campaigns, register guests in real-time, and monitor attendance with precision.'
  },
  {
    id: 'drops',
    badge: 'DROP BUILDER',
    title: 'Mobile-first visual launchpad',
    description: 'Design interactive campaign RSVP pages with live responsive preview, customizable form fields, and instant edge publishing.'
  },
  {
    id: 'passes',
    badge: 'STORE PASSES',
    title: 'Dynamic digital QR entrance passes',
    description: 'Issue encrypted dynamic passes to approved guests, verified in real-time at the entrance with our zero-delay door scanner and gate controls.'
  }
];

const activeStep = computed(() => steps[currentStep.value]);

function handleClose() {
  try {
    localStorage.setItem('707_seen_whats_new_1_5', 'true');
  } catch {
    // ignore
  }
  emit('close');
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleClose();
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
    opacity: 0.6;
  }
  85% {
    opacity: 0.6;
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
