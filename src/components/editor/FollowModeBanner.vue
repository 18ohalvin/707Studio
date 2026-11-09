<template>
  <Transition name="fade">
    <div 
      v-if="presenceStore.followingUser"
      class="absolute top-[56px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black text-white border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.3)] select-none backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <!-- Pulsing Live Indicator -->
      <span class="size-2 rounded-full bg-moss-400 animate-pulse shrink-0" />

      <!-- Following Information -->
      <div class="flex items-center gap-1.5 font-707 text-[12px] tracking-normal">
        <span class="font-medium text-white uppercase">
          FOLLOWING {{ presenceStore.followingUser.name }}
        </span>
        <span 
          v-if="presenceStore.followingUser.role === 'superadmin'" 
          class="text-[10px] px-1.5 py-0.5 rounded-sm bg-white/20 text-white font-medium uppercase tracking-wider"
        >
          SUPERADMIN
        </span>
        <span class="text-neutral-400 font-light">·</span>
        <span class="text-neutral-300 font-normal">
          {{ presenceStore.followingUser.activePageTitle || `Page ${presenceStore.followingUser.activePageIndex + 1}` }}
        </span>
      </div>

      <!-- Stop Action -->
      <button 
        type="button"
        @click.stop="presenceStore.stopFollowing()"
        class="ml-2 pl-2 border-l border-white/20 font-707 text-[11px] font-medium uppercase tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        title="Stop following (or press ESC)"
      >
        <span>STOP</span>
        <span class="text-[9px] text-neutral-500 font-mono">[ESC]</span>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { usePresenceStore } from '../../stores/presenceStore.ts';

const presenceStore = usePresenceStore();

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && presenceStore.followingUserId) {
    presenceStore.stopFollowing();
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>

