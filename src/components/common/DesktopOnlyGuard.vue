<template>
  <div v-if="isMobileViewport && !isDismissed && !isPublicRoute" class="fixed inset-0 z-[9999] bg-[#0c0d0e] flex flex-col items-center justify-center p-8 text-center text-white">
    <div class="w-16 h-16 rounded-2xl bg-[#1e2023] border border-[#2c2f35] flex items-center justify-center mb-6 shadow-2xl">
      <Monitor class="w-8 h-8 text-white" />
    </div>
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono font-medium mb-4">
      <AlertTriangle class="w-3.5 h-3.5" /> DESKTOP WORKSPACE ONLY
    </div>
    <h1 class="text-2xl font-bold tracking-tight text-white mb-2">707 Activation Builder</h1>
    <p class="text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
      The 707 Campaign & Raffle Editor requires a desktop or laptop display (minimum width 1024px) for precision layout building and UI/UX review.
    </p>
    <div class="p-4 rounded-xl bg-[#16181a] border border-[#2c2f35] text-xs text-neutral-400 max-w-xs text-left">
      <div class="font-semibold text-neutral-200 mb-1">Current Screen Width:</div>
      <div class="font-mono text-white">{{ windowWidth }}px (Requires ≥ 1024px)</div>
    </div>
    <button 
      type="button" 
      @click="isDismissed = true"
      class="mt-6 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-neutral-300 hover:text-white border border-white/20 transition-all cursor-pointer"
    >
      Preview On Mobile (Local Testing)
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Monitor, AlertTriangle } from 'lucide-vue-next';

const route = useRoute();
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);
const isMobileViewport = ref(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
const isDismissed = ref(false);

const isPublicRoute = computed(() => {
  return route.meta?.public === true || route.name === 'PublicDrop';
});

function handleResize() {
  windowWidth.value = window.innerWidth;
  isMobileViewport.value = window.innerWidth < 1024;
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
