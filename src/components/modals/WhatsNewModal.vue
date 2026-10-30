<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] bg-black/25 backdrop-blur-[6px] flex items-center justify-center p-4 select-none font-707 animate-apple-fade"
        @click.self="emit('close')"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <!-- Modal Card Container (Apple-spec rounded 20px, 0.5px hairline border) -->
        <div 
          class="relative w-full max-w-[480px] bg-white/95 backdrop-blur-2xl rounded-[20px] border-[0.5px] border-black/10 shadow-[0_24px_70px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.05)] p-7 md:p-8 flex flex-col gap-6 animate-apple-pop text-black overflow-hidden"
        >
          <!-- Top Right Close Button -->
          <button 
            type="button"
            @click="emit('close')"
            class="absolute top-5 right-5 size-[26px] bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-600 hover:text-black rounded-full flex items-center justify-center apple-press transition-colors cursor-pointer border-0 outline-none"
            title="Close"
            aria-label="Close"
          >
            <X class="w-3.5 h-3.5 stroke-[2]" />
          </button>

          <!-- Header Section -->
          <div class="flex flex-col items-start gap-2.5 pr-8">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 border-[0.5px] border-black/10 text-[10.5px] font-medium uppercase tracking-[0.06em] text-neutral-700">
              <Sparkles class="w-3 h-3 text-black stroke-[1.8]" />
              <span>Release 1.5</span>
            </div>

            <div>
              <h2 id="whats-new-title" class="text-[22px] font-normal tracking-[-0.02em] text-black leading-tight">
                What's New in Design Studio
              </h2>
              <p class="text-[13px] text-neutral-500 font-light leading-relaxed mt-1">
                A refined workspace built for luxury brand activations, instant guest previews, and seamless campaign drops.
              </p>
            </div>
          </div>

          <!-- Feature Highlights List -->
          <div class="flex flex-col gap-4 py-1">
            <!-- 1. Unified Vector Identity -->
            <div class="flex items-start gap-3.5">
              <div class="size-9 rounded-[10px] bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center shrink-0 text-black">
                <Layers class="w-4 h-4 stroke-[1.7]" />
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <h3 class="text-[13px] font-medium text-black leading-snug">
                  Unified Vector Identity
                </h3>
                <p class="text-[12px] text-neutral-500 font-light leading-relaxed mt-0.5">
                  Pixel-perfect separation between 707 Design Studio studio headers and the classic 707 retail brand mark for guest forms.
                </p>
              </div>
            </div>

            <!-- 2. Typography Engine & 0.5px Tokens -->
            <div class="flex items-start gap-3.5">
              <div class="size-9 rounded-[10px] bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center shrink-0 text-black">
                <Type class="w-4 h-4 stroke-[1.7]" />
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <h3 class="text-[13px] font-medium text-black leading-snug">
                  Multi-Variant Typography & 0.5px Token
                </h3>
                <p class="text-[12px] text-neutral-500 font-light leading-relaxed mt-0.5">
                  Micro-tuned headline kerning, real-time font style presets, and strict 0.5px hairline borders across all dialogs and cards.
                </p>
              </div>
            </div>

            <!-- 3. Hardware-Accurate Guest Preview -->
            <div class="flex items-start gap-3.5">
              <div class="size-9 rounded-[10px] bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center shrink-0 text-black">
                <Smartphone class="w-4 h-4 stroke-[1.7]" />
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <h3 class="text-[13px] font-medium text-black leading-snug">
                  Live Guest Artboard Preview
                </h3>
                <p class="text-[12px] text-neutral-500 font-light leading-relaxed mt-0.5">
                  Realistic mobile viewport preview with responsive dock placement, blur backdrop effect, and zero-bleed setup menus.
                </p>
              </div>
            </div>

            <!-- 4. Campaign Hub & Door Scanner -->
            <div class="flex items-start gap-3.5">
              <div class="size-9 rounded-[10px] bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center shrink-0 text-black">
                <QrCode class="w-4 h-4 stroke-[1.7]" />
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <h3 class="text-[13px] font-medium text-black leading-snug">
                  Campaign Hub & Live Access Pass
                </h3>
                <p class="text-[12px] text-neutral-500 font-light leading-relaxed mt-0.5">
                  Integrated raffle spot management, automated guest verification emails, and rapid door scanner check-in syncing.
                </p>
              </div>
            </div>
          </div>

          <!-- Footer CTA -->
          <div class="pt-2 border-t border-[0.5px] border-black/5 flex items-center justify-between gap-3">
            <span class="text-[11px] text-neutral-400 font-normal">
              707 Design Studio · v1.5.0
            </span>
            <button 
              type="button"
              @click="emit('close')"
              class="h-[36px] px-6 rounded-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-medium text-[12.5px] transition-all flex items-center justify-center shadow-xs apple-press cursor-pointer border-0 outline-none"
            >
              Explore Studio
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { X, Sparkles, Layers, Type, Smartphone, QrCode } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
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
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.apple-modal-fade-enter-from,
.apple-modal-fade-leave-to {
  opacity: 0;
}
</style>
