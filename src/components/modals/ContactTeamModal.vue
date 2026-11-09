<template>
  <Teleport to="body">
    <Transition name="apple-modal-fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 z-[100] backdrop-blur-[8px] flex items-center justify-center p-4 select-none font-sans font-light tracking-normal animate-apple-fade"
        :class="isDark ? 'bg-black/75' : 'bg-black/40'"
        @click.self="handleClose"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <!-- Main Modal Window (Apple Glass Dialog) -->
        <div 
          class="w-full max-w-[480px] rounded-[26px] p-6 sm:p-7 flex flex-col overflow-hidden relative animate-apple-pop transition-all duration-200"
          :class="isDark 
            ? 'bg-[#141414] border border-white/15 text-white shadow-[0_24px_70px_rgba(0,0,0,0.85)]' 
            : 'bg-white/95 border border-black/10 text-black shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-2xl'"
        >
          <!-- Header: 707 Studio Monogram + Live Indicator + Close Button -->
          <div class="flex items-start justify-between w-full mb-4">
            <div class="flex items-center gap-3">
              <div 
                class="size-10 rounded-[12px] flex items-center justify-center font-bold text-[13px] tracking-tight shrink-0 shadow-xs"
                :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
              >
                707
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-2">
                  <h3 id="contact-modal-title" class="font-sans text-[17px] font-medium leading-tight">
                    Studio Concierge
                  </h3>
                  <!-- Live Pulse Status Indicator -->
                  <span 
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border"
                    :class="isDark 
                      ? 'bg-moss-950/60 text-moss-300 border-moss-700/50' 
                      : 'bg-moss-50 text-moss-700 border-moss-200/80'"
                  >
                    <span class="size-1.5 rounded-full bg-moss-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p 
                  class="text-[12px] font-light mt-0.5"
                  :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
                >
                  Direct runway support for 707 Design Systems
                </p>
              </div>
            </div>

            <!-- Close Button -->
            <button 
              type="button"
              @click="handleClose"
              class="size-[28px] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
              :class="isDark ? 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white' : 'bg-black/5 hover:bg-black/10 active:bg-black/15 text-black'"
              title="Close modal"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Segmented Tab Switcher: Direct Channels vs Quick Dispatch -->
          <div 
            class="p-1 rounded-[10px] flex items-center gap-1 border mb-4"
            :class="isDark ? 'bg-white/[0.05] border-white/10' : 'bg-black/[0.04] border-black/5'"
          >
            <button 
              type="button" 
              @click="activeTab = 'channels'"
              :class="activeTab === 'channels' 
                ? (isDark ? 'bg-white/15 text-white font-medium border-white/25 shadow-none' : 'bg-white text-black shadow-xs font-medium border-black/10') 
                : (isDark ? 'text-neutral-400 hover:text-white border-transparent' : 'text-neutral-500 hover:text-black border-transparent')"
              class="flex-1 py-1.5 rounded-[7px] text-[12px] transition-all text-center cursor-pointer border-[0.5px] flex items-center justify-center gap-1.5"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Direct Channels</span>
            </button>
            <button 
              type="button" 
              @click="activeTab = 'dispatch'"
              :class="activeTab === 'dispatch' 
                ? (isDark ? 'bg-white/15 text-white font-medium border-white/25 shadow-none' : 'bg-white text-black shadow-xs font-medium border-black/10') 
                : (isDark ? 'text-neutral-400 hover:text-white border-transparent' : 'text-neutral-500 hover:text-black border-transparent')"
              class="flex-1 py-1.5 rounded-[7px] text-[12px] transition-all text-center cursor-pointer border-[0.5px] flex items-center justify-center gap-1.5"
            >
              <Send class="w-3.5 h-3.5" />
              <span>Send Note</span>
            </button>
          </div>

          <!-- TAB 1: DIRECT CHANNELS (Interactive Channel Cards) -->
          <div v-if="activeTab === 'channels'" class="flex flex-col gap-3">
            <!-- Channel 1: Internal Slack -->
            <div 
              class="p-3.5 rounded-[14px] border transition-all duration-200 flex items-start justify-between gap-3 group"
              :class="isDark 
                ? 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-white/20' 
                : 'bg-black/[0.02] hover:bg-black/[0.04] border-black/8 hover:border-black/15'"
            >
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <div 
                  class="size-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                  :class="isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-800'"
                >
                  <MessageSquare class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[12.5px] font-medium truncate" :class="isDark ? 'text-white' : 'text-black'">
                      #707-design-studio-help
                    </span>
                    <span 
                      class="text-[9.5px] font-mono px-1.5 py-0.2 rounded border"
                      :class="isDark ? 'bg-white/10 border-white/15 text-neutral-300' : 'bg-black/5 border-black/5 text-neutral-600'"
                    >
                      Instant
                    </span>
                  </div>
                  <p class="text-[11.5px] font-light mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                    Real-time discussions, bug reports, and widget inquiries.
                  </p>
                </div>
              </div>

              <!-- Action: 1-Click Copy with feedback -->
              <button 
                type="button"
                @click="copy('slack', '#707-design-studio-help')"
                class="px-2.5 h-[28px] rounded-[6px] text-[11px] font-medium border flex items-center gap-1.5 transition-all apple-press cursor-pointer shrink-0"
                :class="copiedKey === 'slack'
                  ? 'bg-moss-600 text-white border-moss-600'
                  : (isDark 
                    ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white' 
                    : 'bg-white hover:bg-neutral-50 border-black/10 text-neutral-800 shadow-2xs')"
                title="Copy Slack channel name"
              >
                <Check v-if="copiedKey === 'slack'" class="w-3 h-3" />
                <Copy v-else class="w-3 h-3 text-neutral-400" />
                <span>{{ copiedKey === 'slack' ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>

            <!-- Channel 2: Lead Designer & Systems Desk -->
            <div 
              class="p-3.5 rounded-[14px] border transition-all duration-200 flex items-start justify-between gap-3 group"
              :class="isDark 
                ? 'bg-white/[0.04] hover:bg-white/[0.07] border-white/10 hover:border-white/20' 
                : 'bg-black/[0.02] hover:bg-black/[0.04] border-black/8 hover:border-black/15'"
            >
              <div class="flex items-start gap-3 min-w-0 flex-1">
                <div 
                  class="size-8 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5"
                  :class="isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-800'"
                >
                  <Mail class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-[12px] font-medium truncate" :class="isDark ? 'text-white' : 'text-black'">
                      uiux@707designstudio.internal
                    </span>
                    <span 
                      class="text-[9.5px] font-mono px-1.5 py-0.2 rounded border"
                      :class="isDark ? 'bg-white/10 border-white/15 text-neutral-300' : 'bg-black/5 border-black/5 text-neutral-600'"
                    >
                      Lead
                    </span>
                  </div>
                  <p class="text-[11.5px] font-light mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                    Tailored drop architecture, bespoke components, and approval audits.
                  </p>
                </div>
              </div>

              <!-- Action: 1-Click Mailto & Copy -->
              <div class="flex items-center gap-1 shrink-0">
                <a 
                  href="mailto:uiux@707designstudio.internal?subject=707%20Design%20Studio%20Inquiry"
                  class="px-2 h-[28px] rounded-[6px] text-[11px] font-medium border flex items-center gap-1 transition-all apple-press cursor-pointer"
                  :class="isDark 
                    ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white' 
                    : 'bg-white hover:bg-neutral-50 border-black/10 text-neutral-800 shadow-2xs'"
                  title="Open mail client"
                >
                  <ExternalLink class="w-3 h-3 text-neutral-400" />
                </a>
                <button 
                  type="button"
                  @click="copy('email', 'uiux@707designstudio.internal')"
                  class="px-2.5 h-[28px] rounded-[6px] text-[11px] font-medium border flex items-center gap-1.5 transition-all apple-press cursor-pointer"
                  :class="copiedKey === 'email'
                    ? 'bg-moss-600 text-white border-moss-600'
                    : (isDark 
                      ? 'bg-white/10 hover:bg-white/20 border-white/15 text-white' 
                      : 'bg-white hover:bg-neutral-50 border-black/10 text-neutral-800 shadow-2xs')"
                  title="Copy email address"
                >
                  <Check v-if="copiedKey === 'email'" class="w-3 h-3" />
                  <Copy v-else class="w-3 h-3 text-neutral-400" />
                  <span>{{ copiedKey === 'email' ? 'Copied' : 'Copy' }}</span>
                </button>
              </div>
            </div>

            <!-- Operational SLA Notice Box -->
            <div 
              class="px-3.5 py-2.5 rounded-[12px] border flex items-center gap-2.5 text-[11.5px]"
              :class="isDark 
                ? 'bg-white/[0.02] border-white/8 text-neutral-400' 
                : 'bg-neutral-50 border-black/5 text-neutral-600'"
            >
              <Clock class="w-3.5 h-3.5 shrink-0 text-neutral-400" />
              <div class="flex-1 leading-snug">
                <span>Core Hours: <strong>Mon–Sat 09:00–21:00 WIB</strong> · Runway releases monitored 24/7.</span>
              </div>
            </div>
          </div>

          <!-- TAB 2: SEND QUICK DISPATCH -->
          <form v-else @submit.prevent="handleDispatchSubmit" class="flex flex-col gap-3">
            <!-- Topic Chips -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Inquiry Category
              </label>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  v-for="cat in categories"
                  :key="cat.id"
                  type="button"
                  @click="selectedCategory = cat.id"
                  class="px-2.5 py-1.5 rounded-[8px] text-[11.5px] font-sans transition-all text-left border cursor-pointer"
                  :class="selectedCategory === cat.id
                    ? (isDark ? 'bg-white text-black font-semibold border-white' : 'bg-black text-white font-medium border-black shadow-xs')
                    : (isDark ? 'bg-white/[0.04] text-neutral-300 border-white/10 hover:bg-white/[0.08]' : 'bg-neutral-50 text-neutral-700 border-black/8 hover:bg-neutral-100')"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- Message Area -->
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-mono uppercase tracking-wider" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                Message / Brief
              </label>
              <textarea
                v-model="dispatchMessage"
                required
                rows="3"
                placeholder="Describe your widget requirement, drop timeline, or question..."
                class="w-full px-3 py-2 rounded-[10px] text-[12.5px] font-sans font-light outline-none transition-all resize-none border"
                :class="isDark 
                  ? 'bg-white/[0.06] border-white/15 focus:border-white/40 text-white placeholder:text-neutral-500' 
                  : 'bg-neutral-50 border-black/10 focus:border-black/40 text-black placeholder:text-neutral-400 focus:bg-white'"
              />
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              :disabled="isSubmitting || !dispatchMessage.trim()"
              class="w-full h-[36px] rounded-[8px] font-sans text-[12.5px] font-medium flex items-center justify-center gap-1.5 apple-press cursor-pointer transition-all disabled:opacity-40"
              :class="isSubmitted
                ? 'bg-moss-600 text-white'
                : (isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800 shadow-xs')"
            >
              <Check v-if="isSubmitted" class="w-3.5 h-3.5" />
              <Send v-else class="w-3.5 h-3.5" />
              <span>{{ isSubmitted ? 'Dispatch Sent to Core Team' : (isSubmitting ? 'Sending…' : 'Send to 707 Design Desk') }}</span>
            </button>
          </form>

          <!-- Modal Action Footer -->
          <div class="mt-4 pt-3 border-t flex items-center justify-between" :class="isDark ? 'border-white/10' : 'border-black/5'">
            <span class="text-[11px] font-mono" :class="isDark ? 'text-neutral-500' : 'text-neutral-400'">
              707 Studio v1.5
            </span>
            <button 
              type="button" 
              @click="handleClose"
              class="text-[12px] font-medium transition-colors cursor-pointer bg-transparent border-0 p-0"
              :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { 
  X, 
  MessageSquare, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Send, 
  Sparkles, 
  Clock 
} from 'lucide-vue-next';
import { useCopiedFlag } from '../../services/campaignLink.ts';
import { useAuthStore } from '../../stores/authStore.ts';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  dark?: boolean;
}>(), {
  dark: undefined,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'dispatched', payload: { category: string; message: string }): void;
}>();

const route = useRoute();
const authStore = useAuthStore();
const { copiedKey, copy } = useCopiedFlag();

const isDark = computed(() => {
  if (typeof props.dark === 'boolean') return props.dark;
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && route.path !== '/');
});

const activeTab = ref<'channels' | 'dispatch'>('channels');

const categories = [
  { id: 'widget', label: '🧩 Custom Widget' },
  { id: 'review', label: '👁️ Design Review' },
  { id: 'hardware', label: '🎟️ Door / Pass Scan' },
  { id: 'general', label: '💬 General Query' },
];

const selectedCategory = ref('widget');
const dispatchMessage = ref('');
const isSubmitting = ref(false);
const isSubmitted = ref(false);

function handleClose() {
  emit('close');
  // Reset state after transition
  setTimeout(() => {
    isSubmitted.value = false;
    dispatchMessage.value = '';
    activeTab.value = 'channels';
  }, 250);
}

function handleDispatchSubmit() {
  if (!dispatchMessage.value.trim()) return;
  isSubmitting.value = true;
  
  setTimeout(() => {
    isSubmitting.value = false;
    isSubmitted.value = true;
    emit('dispatched', {
      category: selectedCategory.value,
      message: dispatchMessage.value.trim()
    });
    setTimeout(() => {
      handleClose();
    }, 900);
  }, 400);
}
</script>

