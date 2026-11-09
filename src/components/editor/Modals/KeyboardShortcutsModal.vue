<template>
  <Transition name="apple-dock-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-[100] apple-frost-backdrop flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
      @click.self="emit('close')"
    >
      <div 
        class="apple-frost rounded-[18px] border border-white/60 p-6 w-full max-w-[560px] shadow-[0px_24px_60px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-5 animate-apple-pop text-black"
        @keydown.esc="emit('close')"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-3 border-b border-black/[0.06]">
          <div class="flex items-center gap-2.5">
            <div class="size-8 rounded-full bg-black text-white flex items-center justify-center shadow-2xs shrink-0">
              <Command class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-707 font-medium text-[15.5px] text-black tracking-tight">Keyboard Shortcuts</h3>
              <p class="font-707 text-[11px] text-neutral-500 font-light">Canvas & Viewport Controls</p>
            </div>
          </div>
          <button 
            type="button"
            @click="emit('close')" 
            class="size-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
            title="Close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- 2-Column Shortcuts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <!-- Column 1: Canvas & Hierarchy -->
          <div class="flex flex-col gap-4">
            <!-- Section: Canvas & Viewport -->
            <div class="flex flex-col gap-1.5">
              <h4 class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-1">
                Canvas & Viewport
              </h4>
              <div class="flex flex-col gap-0.5">
                <div 
                  v-for="s in canvasShortcuts" 
                  :key="s.label"
                  class="flex items-center justify-between py-1.5 px-2 rounded-[7px] hover:bg-black/[0.03] transition-colors"
                >
                  <span class="text-[12px] font-707 text-neutral-700">{{ s.label }}</span>
                  <div class="flex items-center gap-1">
                    <kbd 
                      v-for="(k, kIdx) in s.keys" 
                      :key="kIdx"
                      class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-[5px] bg-black/[0.04] border border-black/10 text-[11px] font-mono font-medium text-neutral-800 shadow-2xs leading-none"
                    >
                      {{ k }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: Hierarchy & Layers -->
            <div class="flex flex-col gap-1.5">
              <h4 class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-1">
                Hierarchy & Layers
              </h4>
              <div class="flex flex-col gap-0.5">
                <div 
                  v-for="s in hierarchyShortcuts" 
                  :key="s.label"
                  class="flex items-center justify-between py-1.5 px-2 rounded-[7px] hover:bg-black/[0.03] transition-colors"
                >
                  <span class="text-[12px] font-707 text-neutral-700">{{ s.label }}</span>
                  <div class="flex items-center gap-1">
                    <kbd 
                      v-for="(k, kIdx) in s.keys" 
                      :key="kIdx"
                      class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-[5px] bg-black/[0.04] border border-black/10 text-[11px] font-mono font-medium text-neutral-800 shadow-2xs leading-none"
                    >
                      {{ k }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Column 2: Block Editing & History -->
          <div class="flex flex-col gap-4">
            <!-- Section: Block Editing -->
            <div class="flex flex-col gap-1.5">
              <h4 class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-1">
                Block Editing
              </h4>
              <div class="flex flex-col gap-0.5">
                <div 
                  v-for="s in editingShortcuts" 
                  :key="s.label"
                  class="flex items-center justify-between py-1.5 px-2 rounded-[7px] hover:bg-black/[0.03] transition-colors"
                >
                  <span class="text-[12px] font-707 text-neutral-700">{{ s.label }}</span>
                  <div class="flex items-center gap-1">
                    <kbd 
                      v-for="(k, kIdx) in s.keys" 
                      :key="kIdx"
                      class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-[5px] bg-black/[0.04] border border-black/10 text-[11px] font-mono font-medium text-neutral-800 shadow-2xs leading-none"
                    >
                      {{ k }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section: History & System -->
            <div class="flex flex-col gap-1.5">
              <h4 class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold px-1">
                History & System
              </h4>
              <div class="flex flex-col gap-0.5">
                <div 
                  v-for="s in historyShortcuts" 
                  :key="s.label"
                  class="flex items-center justify-between py-1.5 px-2 rounded-[7px] hover:bg-black/[0.03] transition-colors"
                >
                  <span class="text-[12px] font-707 text-neutral-700">{{ s.label }}</span>
                  <div class="flex items-center gap-1">
                    <kbd 
                      v-for="(k, kIdx) in s.keys" 
                      :key="kIdx"
                      class="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-[5px] bg-black/[0.04] border border-black/10 text-[11px] font-mono font-medium text-neutral-800 shadow-2xs leading-none"
                    >
                      {{ k }}
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Note with Pale Moss Indicator -->
        <div class="pt-3 border-t border-black/[0.06] flex items-center justify-between text-[11px] font-707 text-neutral-500">
          <div class="flex items-center gap-1.5">
            <span class="size-1.5 rounded-full bg-moss-600 animate-pulse" />
            <span>Press <kbd class="px-1 py-0.5 rounded bg-black/5 font-mono text-[10px] font-medium text-black">?</kbd> anytime to toggle this cheatsheet</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Command, X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
const cmd = isMac ? '⌘' : 'Ctrl';
const alt = isMac ? '⌥' : 'Alt';
const shift = isMac ? '⇧' : 'Shift';

interface ShortcutItem {
  label: string;
  keys: string[];
}

const canvasShortcuts = computed<ShortcutItem[]>(() => [
  { label: 'Pan Canvas (Hand)', keys: ['Space', 'Drag'] },
  { label: 'Zoom & Pan', keys: ['Trackpad'] },
  { label: 'Deselect / Close', keys: ['Esc'] }
]);

const hierarchyShortcuts = computed<ShortcutItem[]>(() => [
  { label: 'Move Block Up', keys: [alt, '↑'] },
  { label: 'Move Block Down', keys: [alt, '↓'] }
]);

const editingShortcuts = computed<ShortcutItem[]>(() => [
  { label: 'Copy Block', keys: [cmd, 'C'] },
  { label: 'Cut Block', keys: [cmd, 'X'] },
  { label: 'Paste Block', keys: [cmd, 'V'] },
  { label: 'Duplicate Block', keys: [cmd, 'D'] },
  { label: 'Delete Block / Page', keys: ['⌫'] }
]);

const historyShortcuts = computed<ShortcutItem[]>(() => [
  { label: 'Undo Action', keys: [cmd, 'Z'] },
  { label: 'Redo Action', keys: [cmd, shift, 'Z'] },
  { label: 'Shortcuts Guide', keys: ['?'] }
]);
</script>

