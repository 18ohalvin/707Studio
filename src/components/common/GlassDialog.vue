<template>
  <Transition name="apple-modal-fade">
    <div
      v-if="dialog"
      class="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none backdrop-blur-md"
      :class="isDark ? 'bg-black/75' : 'apple-frost-backdrop'"
      @click.self="cancel"
      @keydown.esc="cancel"
    >
      <div
        class="flex flex-col items-start p-[24px] pb-[28px] rounded-[16px] w-full max-w-[432px] apple-modal-box transition-all duration-200"
        :class="isDark 
          ? 'bg-[#141414] border border-white/15 text-white shadow-[0px_24px_70px_0px_rgba(0,0,0,0.85)]' 
          : 'apple-frost border border-white/60 text-black shadow-[0px_20px_50px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)]'"
        role="dialog"
        aria-modal="true"
        :aria-label="dialog.title"
      >
        <div class="flex items-start justify-between w-full gap-4 mb-[12px]">
          <h2 
            class="font-707 text-[20px] font-normal leading-[26px]"
            :class="isDark ? 'text-white' : 'text-black'"
          >
            {{ dialog.title }}
          </h2>
          <button
            type="button"
            @click="cancel"
            class="size-[24px] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
            :class="isDark ? 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white' : 'bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] text-black'"
            title="Close"
          >
            <X class="w-3.5 h-3.5" :class="isDark ? 'text-white' : 'text-black'" />
          </button>
        </div>

        <p 
          v-if="dialog.message" 
          class="font-707 text-[14px] leading-[22px] whitespace-pre-line w-full mb-[20px]"
          :class="isDark ? 'text-neutral-300' : 'text-black/80'"
        >
          {{ dialog.message }}
        </p>

        <textarea
          v-if="dialog.kind === 'prompt'"
          ref="inputRef"
          v-model="text"
          rows="3"
          maxlength="500"
          :placeholder="dialog.placeholder || ''"
          class="w-full rounded-[8px] px-3 py-2 text-[13px] font-707 outline-none resize-none mb-[20px] transition-all"
          :class="isDark 
            ? 'bg-white/[0.06] border border-white/20 focus:border-white/50 text-white placeholder:text-neutral-500' 
            : 'bg-white/80 border border-black/15 focus:border-black text-black'"
          @keydown.meta.enter="confirm"
          @keydown.ctrl.enter="confirm"
        />

        <div class="flex gap-[8px] items-center w-full">
          <button
            type="button"
            @click="cancel"
            class="flex-1 h-[42px] flex items-center justify-center rounded-[8px] apple-press cursor-pointer transition-colors border"
            :class="isDark 
              ? 'border-white/20 bg-transparent hover:bg-white/10 text-white' 
              : 'border-black bg-transparent hover:bg-black/5 active:bg-black/10 text-black'"
          >
            <span class="font-707 font-medium text-[14px] whitespace-nowrap">{{ dialog.cancelLabel || 'Cancel' }}</span>
          </button>
          <button
            ref="confirmRef"
            type="button"
            @click="confirm"
            class="flex-1 h-[42px] flex items-center justify-center rounded-[8px] apple-press cursor-pointer transition-colors shadow-sm border-0"
            :class="dialog.danger 
              ? 'bg-[#9b0707] hover:bg-[#7f0606] text-white' 
              : (isDark ? 'bg-white hover:bg-neutral-200 text-black font-semibold' : 'bg-black hover:bg-neutral-800 text-white')"
          >
            <span class="font-707 font-medium text-[14px] whitespace-nowrap">{{ dialog.confirmLabel || 'OK' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { X } from 'lucide-vue-next';
import { glassDialogState, settleGlassDialog } from '../../services/glassDialog.ts';
import { useAuthStore } from '../../stores/authStore.ts';

const route = useRoute();
const authStore = useAuthStore();

const isDark = computed(() => {
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && route.path !== '/');
});

const dialog = computed(() => glassDialogState.active);
const text = ref('');
const inputRef = ref<HTMLTextAreaElement | null>(null);
const confirmRef = ref<HTMLButtonElement | null>(null);

watch(dialog, async (d) => {
  if (!d) return;
  text.value = d.defaultValue || '';
  await nextTick();
  (d.kind === 'prompt' ? inputRef.value : confirmRef.value)?.focus();
});

function confirm() {
  if (!dialog.value) return;
  settleGlassDialog(dialog.value.kind === 'prompt' ? text.value.trim() : true);
}

function cancel() {
  if (!dialog.value) return;
  settleGlassDialog(dialog.value.kind === 'prompt' ? null : false);
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && dialog.value) cancel();
}
onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>
