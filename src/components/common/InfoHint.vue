<template>
  <span
    ref="triggerRef"
    class="inline-flex items-center align-middle relative shrink-0"
    @mouseenter="openOnHover"
    @mouseleave="closeOnLeave"
  >
    <button
      type="button"
      @click.stop="toggle"
      @focus="isOpen = true"
      @blur="isOpen = false"
      :aria-label="label || 'More info'"
      class="inline-flex items-center justify-center size-[16px] rounded-full text-neutral-400 hover:text-black hover:bg-black/5 transition-colors cursor-pointer focus:outline-none"
    >
      <Info class="size-[12.5px] stroke-[2]" />
    </button>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="menuRef"
        :style="popoverStyle"
        @mouseenter="cancelClose"
        @mouseleave="closeOnLeave"
        @click.stop
        class="w-[232px] max-w-[calc(100vw-24px)] px-3 py-2 rounded-[9px] bg-neutral-900/95 backdrop-blur-md text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)] border border-white/10 font-707 text-[11px] leading-[1.45] font-normal pointer-events-auto select-none animate-in fade-in duration-100"
      >
        {{ text }}
      </div>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Info } from 'lucide-vue-next';
import { useModalPopover } from './modalPopover.ts';

defineProps<{
  text: string;
  label?: string;
}>();

const triggerRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const { style: popoverStyle, menuRef } = useModalPopover(triggerRef, isOpen, {
  width: 232,
  gap: 6
});

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function openOnHover() {
  cancelClose();
  isOpen.value = true;
}

function closeOnLeave() {
  cancelClose();
  closeTimer = setTimeout(() => {
    isOpen.value = false;
  }, 120);
}

function toggle() {
  cancelClose();
  isOpen.value = !isOpen.value;
}
</script>
