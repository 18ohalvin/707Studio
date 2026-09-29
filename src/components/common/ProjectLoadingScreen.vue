<template>
  <Transition name="loading-curtain-fade">
    <div 
      v-if="editorStore.isProjectLoading"
      :key="animationKey"
      class="fixed inset-0 z-[99999] overflow-hidden select-none pointer-events-auto font-sans bg-white"
      data-node-id="224:9099"
      data-name="Project Loading Curtain"
    >
      <!-- Base Layer: White Background with Black 707 Logo & Black Terminal Text -->
      <div class="absolute inset-0 bg-white flex flex-col items-center justify-between">
        <!-- Top Spacer -->
        <div class="h-[64px] w-full shrink-0" />

        <!-- Center: 707 Official Logo (Black) -->
        <div class="h-[32px] w-[102px] relative shrink-0 flex items-center justify-center">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="h-[32px] w-[102px] object-contain pointer-events-none"
          />
        </div>

        <!-- Bottom: High-Tech Code Text Process (64px bottom padding) -->
        <div class="w-full pb-[64px] px-[32px] flex flex-col items-center justify-center text-center font-707 font-normal">
          <div class="flex items-center gap-2 text-black/90 text-[13px] tracking-[0.03em] uppercase">
            <span class="text-neutral-400 font-normal">&gt;</span>
            <span class="min-w-[280px] text-left">{{ currentLogText }}</span>
            <span class="w-[6px] h-[14px] bg-black inline-block animate-terminal-blink align-middle" />
          </div>
          <div class="mt-1.5 flex items-center gap-3 text-[11px] text-neutral-400 tracking-[0.05em] font-707 font-normal">
            <span>MEM: {{ memoryStat }}MB</span>
            <span>·</span>
            <span>CHUNKS: {{ chunkCount }}/4</span>
            <span>·</span>
            <span class="text-black font-normal">{{ progressPercent }}%</span>
          </div>
        </div>
      </div>

      <!-- Wipe Layer: Black Screen with White 707 Logo & White Terminal Text (Progressive Left-to-Right Wipe) -->
      <div 
        class="absolute inset-0 bg-black flex flex-col items-center justify-between project-wipe-curtain"
        data-name="Black Wipe Overlay"
      >
        <!-- Top Spacer -->
        <div class="h-[64px] w-full shrink-0" />

        <!-- Center: 707 Official Logo (White) -->
        <div class="h-[32px] w-[102px] relative shrink-0 flex items-center justify-center">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo White" 
            class="h-[32px] w-[102px] object-contain pointer-events-none brightness-0 invert"
          />
        </div>

        <!-- Bottom: High-Tech Code Text Process (White Inverted, 64px bottom padding) -->
        <div class="w-full pb-[64px] px-[32px] flex flex-col items-center justify-center text-center font-707 font-normal">
          <div class="flex items-center gap-2 text-white/95 text-[13px] tracking-[0.03em] uppercase">
            <span class="text-neutral-500 font-normal">&gt;</span>
            <span class="min-w-[280px] text-left">{{ currentLogText }}</span>
            <span class="w-[6px] h-[14px] bg-white inline-block animate-terminal-blink align-middle" />
          </div>
          <div class="mt-1.5 flex items-center gap-3 text-[11px] text-neutral-400 tracking-[0.05em] font-707 font-normal">
            <span>MEM: {{ memoryStat }}MB</span>
            <span>·</span>
            <span>CHUNKS: {{ chunkCount }}/4</span>
            <span>·</span>
            <span class="text-white font-normal">{{ progressPercent }}%</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';

const editorStore = useEditorStore();

const animationKey = ref(0);
const currentLogText = ref('INITIALIZING 707 RUNTIME CORE v1.0...');
const memoryStat = ref('16.4');
const chunkCount = ref(1);
const progressPercent = ref(0);

const logSteps = [
  { time: 0, text: 'INITIALIZING 707 RUNTIME CORE v1.0...', mem: '16.4', chunk: 1, pct: 12 },
  { time: 550, text: 'READING CLOUD SCHEMA & ASSET REPOSITORIES...', mem: '28.1', chunk: 2, pct: 38 },
  { time: 1200, text: 'COMPILING WIDGET TREE & VIEWPORT LAYOUT...', mem: '42.7', chunk: 3, pct: 67 },
  { time: 1900, text: 'HYDRATING REACTIVE CANVAS & ACTION GATES...', mem: '58.9', chunk: 4, pct: 89 },
  { time: 2500, text: 'STATUS [200 OK]: ALL SYSTEMS OPERATIONAL', mem: '64.0', chunk: 4, pct: 100 }
];

let timerIds: any[] = [];
let progressInterval: any = null;

watch(() => editorStore.isProjectLoading, (loading) => {
  clearTimers();
  if (loading) {
    animationKey.value++;
    currentLogText.value = logSteps[0].text;
    memoryStat.value = logSteps[0].mem;
    chunkCount.value = logSteps[0].chunk;
    progressPercent.value = logSteps[0].pct;

    const startTime = Date.now();
    const duration = 2800;

    // Smooth percentage counter
    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculated = Math.min(100, Math.floor((elapsed / duration) * 100));
      progressPercent.value = calculated;
    }, 40);

    // Step logger
    logSteps.forEach((step) => {
      if (step.time > 0) {
        const id = setTimeout(() => {
          currentLogText.value = step.text;
          memoryStat.value = step.mem;
          chunkCount.value = step.chunk;
        }, step.time);
        timerIds.push(id);
      }
    });
  }
});

function clearTimers() {
  timerIds.forEach(id => clearTimeout(id));
  timerIds = [];
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

onUnmounted(() => {
  clearTimers();
});
</script>

<style scoped>
/* Progressive Left to Right Wipe Animation (2.5s sweep over ~3s total loading window) */
.project-wipe-curtain {
  animation: projectWipeFromLeft 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  will-change: clip-path;
}

@keyframes projectWipeFromLeft {
  0% {
    clip-path: inset(0 100% 0 0);
  }
  100% {
    clip-path: inset(0 0% 0 0);
  }
}

/* Blinking Terminal Cursor */
@keyframes terminalBlink {
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
}

.animate-terminal-blink {
  animation: terminalBlink 0.75s infinite;
}

/* Instant Enter (No flash of canvas underneath) & Smooth Leave Fade */
.loading-curtain-fade-enter-active {
  transition: none;
}

.loading-curtain-fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.loading-curtain-fade-leave-to {
  opacity: 0;
}
</style>
