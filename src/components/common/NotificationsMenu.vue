<template>
  <div class="relative" ref="rootRef">
    <NotificationBell :has-unread="unreadCount > 0" @click="toggle" />

    <Teleport to="body">
    <Transition name="notif-pop">
      <div
        v-if="isOpen"
        ref="panelRef"
        :style="popoverStyle"
        class="w-[390px] max-h-[78vh] flex flex-col backdrop-blur-2xl rounded-[16px] apple-popover-box z-[90] font-707 overflow-hidden select-none transition-all duration-200"
        :class="isDark 
          ? 'bg-[#141414]/95 border border-white/15 text-white shadow-[0px_24px_70px_0px_rgba(0,0,0,0.85)]' 
          : 'bg-white/95 border-[0.5px] border-black/10 text-black shadow-[0px_20px_60px_0px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.05)]'"
        role="dialog"
        aria-label="Notifications"
      >
        <!-- Modal Header (Matching global modal token px-[20px] py-[16px]) -->
        <div 
          class="px-[20px] py-[16px] flex items-center justify-between shrink-0"
          :class="isDark ? 'border-b border-white/10' : 'border-b border-black/10'"
        >
          <div class="flex items-center gap-2">
            <h2 
              class="font-707 text-[14px] font-medium leading-[18px]"
              :class="isDark ? 'text-white' : 'text-black'"
            >
              Notifications
            </h2>
            <span 
              v-if="unreadCount > 0" 
              class="text-[10.5px] px-1.5 py-0.5 rounded-full font-medium tabular-nums"
              :class="isDark ? 'bg-white text-black font-semibold' : 'bg-black text-white'"
            >
              {{ unreadCount }}
            </span>
          </div>

          <!-- Header Actions: Mark All Read, Clear All & Close Button -->
          <div class="flex items-center gap-2.5">
            <!-- Mark All Read -->
            <button 
              v-if="hasUnreadItems"
              type="button"
              @click="markAllSeen"
              class="text-[11.5px] transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal hover:underline underline-offset-2"
              :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'"
              title="Mark all notifications as read"
            >
              Mark read
            </button>

            <!-- Clear All Notifications -->
            <button 
              v-if="activeItems.length > 0"
              type="button"
              @click="clearAllNotifications"
              class="text-[11.5px] transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal hover:underline underline-offset-2"
              :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'"
              title="Clear all notifications"
            >
              Clear all
            </button>

            <!-- Waiting count indicator for Superadmin -->
            <span 
              v-if="pendingCount > 0" 
              class="text-[10px] px-2 py-0.5 rounded-full tabular-nums font-medium border"
              :class="isDark ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-800 border-amber-200'"
            >
              {{ pendingCount }} pending
            </span>

            <!-- Close Modal Button (X) matching UserProfileModal -->
            <button 
              type="button"
              @click="isOpen = false"
              class="size-[24px] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none ml-1"
              :class="isDark ? 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white' : 'bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] text-black'"
              title="Close notifications"
            >
              <X class="w-3.5 h-3.5" :class="isDark ? 'text-white' : 'text-black'" />
            </button>
          </div>
        </div>

        <!-- Segmented Filter Control (Apple-spec segmented control) -->
        <div class="px-[20px] pt-3 pb-2 shrink-0">
          <div 
            class="p-1 rounded-[9px] flex items-center gap-1 border"
            :class="isDark ? 'bg-white/[0.05] border-white/10' : 'bg-black/[0.04] border-black/5'"
          >
            <button 
              type="button" 
              @click="activeFilter = 'all'"
              :class="activeFilter === 'all' 
                ? (isDark ? 'bg-white/15 text-white font-medium border-white/25 shadow-none' : 'bg-white text-black shadow-2xs font-medium border-black/10') 
                : (isDark ? 'text-neutral-400 hover:text-white border-transparent' : 'text-neutral-500 hover:text-black border-transparent')"
              class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px]"
            >
              All ({{ activeItems.length }})
            </button>
            <button 
              type="button" 
              @click="activeFilter = 'pending'"
              :class="activeFilter === 'pending' 
                ? (isDark ? 'bg-white/15 text-white font-medium border-white/25 shadow-none' : 'bg-white text-black shadow-2xs font-medium border-black/10') 
                : (isDark ? 'text-neutral-400 hover:text-white border-transparent' : 'text-neutral-500 hover:text-black border-transparent')"
              class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px] flex items-center justify-center gap-1.5"
            >
              <span>Reviews</span>
              <span v-if="pendingCount > 0" class="size-1.5 rounded-full bg-amber-500 shrink-0" />
            </button>
            <button 
              type="button" 
              @click="activeFilter = 'published'"
              :class="activeFilter === 'published' 
                ? (isDark ? 'bg-white/15 text-white font-medium border-white/25 shadow-none' : 'bg-white text-black shadow-2xs font-medium border-black/10') 
                : (isDark ? 'text-neutral-400 hover:text-white border-transparent' : 'text-neutral-500 hover:text-black border-transparent')"
              class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px]"
            >
              Published
            </button>
          </div>
        </div>

        <!-- Scrollable Notifications List -->
        <div class="flex-1 overflow-y-auto px-[20px] py-1 flex flex-col gap-2 max-h-[50vh]">
          <!-- Error banner -->
          <p 
            v-if="error" 
            class="text-[12px] p-3 rounded-[8px] border"
            :class="isDark ? 'text-red-400 bg-red-950/40 border-red-800/40' : 'text-red-600 bg-red-50 border-red-200'"
          >
            {{ error }}
          </p>

          <!-- Empty State -->
          <div v-else-if="!filteredItems.length" class="py-12 px-4 flex flex-col items-center justify-center text-center gap-3">
            <div 
              class="size-12 rounded-full flex items-center justify-center shadow-2xs border"
              :class="isDark ? 'bg-white/[0.06] border-white/15 text-neutral-400' : 'bg-neutral-100 border-black/10 text-neutral-400'"
            >
              <BellOff v-if="activeFilter === 'all'" class="w-5 h-5 stroke-[1.4]" />
              <CheckCircle2 v-else class="w-5 h-5 stroke-[1.4]" />
            </div>
            <div class="flex flex-col items-center gap-1">
              <p 
                class="text-[13.5px] font-medium"
                :class="isDark ? 'text-white' : 'text-black'"
              >
                {{ activeFilter === 'all' ? 'All caught up' : (activeFilter === 'pending' ? 'No pending reviews' : 'No published drops') }}
              </p>
              <p 
                class="text-[11.5px] max-w-[260px] leading-relaxed font-light"
                :class="isDark ? 'text-neutral-400' : 'text-neutral-400'"
              >
                {{ authStore.isSuperAdmin 
                  ? 'Campaign submissions, brand reviews, and publishing activity will be delivered here.' 
                  : 'Campaign approvals, live drop updates, and door scanner alerts will be delivered here.' 
                }}
              </p>
            </div>
          </div>

          <!-- Notification Item Cards with Individual Dismiss -->
          <div
            v-for="item in filteredItems"
            :key="item.id"
            @click="openItem(item)"
            class="group relative w-full text-left flex items-start gap-3 p-3 rounded-[12px] transition-all cursor-pointer border"
            :class="[
              isDark ? 'hover:bg-white/[0.05] active:bg-white/[0.09]' : 'hover:bg-black/[0.03] active:bg-black/[0.06]',
              isUnread(item)
                ? (isDark ? 'bg-white/[0.04] border-white/15' : 'bg-black/[0.015] border-black/10 shadow-2xs')
                : (isDark ? 'border-white/10 bg-transparent' : 'border-black/5 bg-transparent')
            ]"
          >
            <!-- Status Icon Pill -->
            <div 
              class="size-[32px] rounded-[9px] flex items-center justify-center shrink-0 border mt-0.5"
              :class="statusBadgeClasses(item)"
            >
              <Clock v-if="item.kind === 'submitted'" class="w-4 h-4 stroke-[1.7]" />
              <CheckCircle2 v-else-if="item.kind === 'published'" class="w-4 h-4 stroke-[1.7]" />
              <AlertCircle v-else class="w-4 h-4 stroke-[1.7]" />
            </div>

            <!-- Content Details -->
            <div class="flex flex-col min-w-0 flex-1 pr-6">
              <div class="flex items-baseline justify-between gap-2">
                <span 
                  class="text-[13px] font-medium truncate leading-snug"
                  :class="isDark ? 'text-white' : 'text-black'"
                >
                  {{ item.project_title }}
                </span>
                <span class="text-[10.5px] text-neutral-400 tabular-nums shrink-0 font-light">
                  {{ formatWhen(item.created_at) }}
                </span>
              </div>

              <!-- Status line -->
              <p 
                class="text-[11.5px] mt-0.5 leading-snug"
                :class="isDark ? 'text-neutral-300' : 'text-neutral-600'"
              >
                {{ describe(item) }}
              </p>

              <!-- Optional note / review feedback -->
              <div 
                v-if="item.note" 
                class="mt-1.5 p-2 rounded-[6px] text-[11px] italic line-clamp-2 leading-relaxed border"
                :class="isDark ? 'bg-white/[0.04] border-white/10 text-neutral-300' : 'bg-black/[0.03] border-black/5 text-neutral-700'"
              >
                “{{ item.note }}”
              </div>

              <!-- Author / Brand metadata & CTA -->
              <div 
                class="flex items-center justify-between mt-2 pt-1 border-t"
                :class="isDark ? 'border-white/10' : 'border-black/5'"
              >
                <span class="text-[10.5px] text-neutral-400 font-light">
                  {{ item.created_by }} · {{ item.brand_slug?.toUpperCase() }}
                </span>

                <div class="flex items-center gap-1.5">
                  <span
                    v-if="item.still_pending"
                    class="h-[24px] px-2.5 rounded-[6px] text-[11px] font-medium flex items-center justify-center transition-colors apple-press"
                    :class="isDark ? 'bg-white hover:bg-neutral-200 text-black font-semibold' : 'bg-black hover:bg-neutral-800 text-white'"
                  >
                    Review
                  </span>
                  <button
                    v-else-if="item.live_path"
                    type="button"
                    @click.stop="copy(item.id, absoluteLink(item.live_path))"
                    class="h-[24px] px-2 rounded-[6px] border flex items-center gap-1 text-[10.5px] transition-colors shadow-2xs apple-press cursor-pointer"
                    :class="isDark ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' : 'bg-white hover:bg-neutral-100 border-black/10 text-neutral-700'"
                    :title="`Copy live link: ${absoluteLink(item.live_path)}`"
                  >
                    <Check v-if="copiedKey === item.id" class="w-3 h-3 text-emerald-400" />
                    <LinkIcon v-else class="w-3 h-3" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'" />
                    <span>{{ copiedKey === item.id ? 'Copied' : 'Link' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Discrete Individual Dismiss Button (X) on hover -->
            <button
              type="button"
              @click.stop="dismissNotification(item.id)"
              class="absolute top-2.5 right-2.5 size-[20px] rounded-full bg-transparent text-neutral-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer border-0 outline-none"
              :class="isDark ? 'hover:bg-white/20 hover:text-white' : 'hover:bg-neutral-200/80 hover:text-black'"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Footer Helper / Clear info -->
        <div 
          class="px-[20px] py-2.5 border-t flex items-center justify-between text-[11px] text-neutral-400 shrink-0"
          :class="isDark ? 'border-white/10' : 'border-black/5'"
        >
          <span>707 Live Notifications</span>
          <span>{{ activeItems.length }} total</span>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Check, Link as LinkIcon, Clock, CheckCircle2, AlertCircle, BellOff, X } from 'lucide-vue-next';
import NotificationBell from './NotificationBell.vue';
import { useAnchoredPopover } from './anchoredPopover.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { useCopiedFlag, absoluteLink } from '../../services/campaignLink.ts';
import { apiJson } from '../../services/apiClient.ts';

interface NotificationItem {
  id: string;
  kind: 'submitted' | 'published' | 'declined';
  project_id: string;
  project_title: string;
  brand_slug: string;
  live_version?: number | null;
  is_update?: boolean;
  note?: string;
  created_by?: string;
  created_at: string;
  still_pending?: boolean;
  /** Public path while the campaign is live, e.g. /atmos/drop. */
  live_path?: string | null;
}

const props = withDefaults(defineProps<{
  dark?: boolean;
}>(), {
  dark: undefined,
});

const { copiedKey, copy } = useCopiedFlag();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isDark = computed(() => {
  if (typeof props.dark === 'boolean') return props.dark;
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && route.path !== '/');
});

const rawItems = ref<NotificationItem[]>([]);
const pendingCount = ref(0);
const error = ref('');
const isOpen = ref(false);
const activeFilter = ref<'all' | 'pending' | 'published'>('all');

const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const { style: popoverStyle, track } = useAnchoredPopover(rootRef);
watch(isOpen, open => track(open));

/** Read state is per account, per device: the time the list was last opened. */
const seenKey = computed(() => `707_notifications_seen_at:${authStore.currentUser?.id || 'anon'}`);
const seenAt = ref(0);

/** Dismissed notification IDs stored in localStorage */
const dismissedKey = computed(() => `707_notifications_dismissed:${authStore.currentUser?.id || 'anon'}`);
const dismissedIds = ref<Set<string>>(new Set());

function loadSeenAt() {
  try { seenAt.value = Number(localStorage.getItem(seenKey.value) || 0); } catch { seenAt.value = 0; }
}

function loadDismissed() {
  try {
    const raw = localStorage.getItem(dismissedKey.value);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) dismissedIds.value = new Set(parsed);
    }
  } catch {
    dismissedIds.value = new Set();
  }
}

function persistDismissed() {
  try {
    localStorage.setItem(dismissedKey.value, JSON.stringify(Array.from(dismissedIds.value)));
  } catch { /* storage unavailable */ }
}

function markAllSeen() {
  seenAt.value = Date.now();
  try { localStorage.setItem(seenKey.value, String(seenAt.value)); } catch { /* storage unavailable */ }
}

function dismissNotification(id: string) {
  dismissedIds.value.add(id);
  persistDismissed();
}

function clearAllNotifications() {
  activeItems.value.forEach(item => dismissedIds.value.add(item.id));
  persistDismissed();
  markAllSeen();
}

/** Active items are raw items minus user-dismissed notifications */
const activeItems = computed(() => {
  return rawItems.value.filter(item => !dismissedIds.value.has(item.id));
});

const isUnread = (item: NotificationItem) => new Date(item.created_at).getTime() > seenAt.value;
const unreadCount = computed(() => activeItems.value.filter(i => isUnread(i) || i.still_pending).length);
const hasUnreadItems = computed(() => activeItems.value.some(i => isUnread(i)));

const filteredItems = computed(() => {
  if (activeFilter.value === 'pending') {
    return activeItems.value.filter(i => i.still_pending || i.kind === 'submitted');
  }
  if (activeFilter.value === 'published') {
    return activeItems.value.filter(i => i.kind === 'published');
  }
  return activeItems.value;
});

function statusBadgeClasses(item: NotificationItem) {
  if (isDark.value) {
    if (item.kind === 'submitted') {
      return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
    }
    if (item.kind === 'published') {
      return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
    }
    return 'bg-rose-950/60 text-rose-300 border-rose-800/60';
  }
  if (item.kind === 'submitted') {
    return 'bg-amber-50 text-amber-700 border-amber-200/80';
  }
  if (item.kind === 'published') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  }
  return 'bg-rose-50 text-rose-700 border-rose-200/80';
}

async function load() {
  if (!authStore.isAuthenticated) {
    rawItems.value = [];
    return;
  }
  try {
    const json = await apiJson<{ success: boolean; data: NotificationItem[]; pending_count: number }>('/api/notifications');
    rawItems.value = Array.isArray(json?.data) ? json.data : [];
    pendingCount.value = Number(json?.pending_count || 0);
    error.value = '';
  } catch (err: any) {
    error.value = err?.status === 401 ? '' : 'Could not load notifications.';
  }
}

function describe(item: NotificationItem): string {
  if (item.kind === 'submitted') return item.is_update ? 'Update submitted for review' : 'Submitted for review';
  if (item.kind === 'published') return `Published as live v${item.live_version}`;
  return 'Changes requested';
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function toggle() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    load();
  }
}

function openItem(item: NotificationItem) {
  isOpen.value = false;
  markAllSeen();
  router.push(`/editor/${encodeURIComponent((item.brand_slug || 'brand').toLowerCase())}/${encodeURIComponent(item.project_id)}`);
}

function handleOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (isOpen.value && rootRef.value && !rootRef.value.contains(target) && !panelRef.value?.contains(target)) {
    isOpen.value = false;
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

watch(() => authStore.currentUser?.id, () => {
  loadSeenAt();
  loadDismissed();
  load();
});

onMounted(() => {
  loadSeenAt();
  loadDismissed();
  load();
  document.addEventListener('mousedown', handleOutside);
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') load();
  }, 30000);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutside);
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.notif-pop-enter-active, .notif-pop-leave-active {
  transition: opacity 0.16s ease, transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.notif-pop-enter-from, .notif-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
