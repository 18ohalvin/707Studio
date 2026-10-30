<template>
  <div class="relative" ref="rootRef">
    <NotificationBell :has-unread="unreadCount > 0" @click="toggle" />

    <Teleport to="body">
    <Transition name="notif-pop">
      <div
        v-if="isOpen"
        ref="panelRef"
        :style="popoverStyle"
        class="w-[390px] max-h-[78vh] flex flex-col bg-white/95 backdrop-blur-2xl border-[0.5px] border-black/10 rounded-[16px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.05)] apple-popover-box z-[90] font-707 overflow-hidden text-black select-none"
        role="dialog"
        aria-label="Notifications"
      >
        <!-- Modal Header (Matching global modal token px-[20px] py-[16px]) -->
        <div class="px-[20px] py-[16px] border-b border-black/10 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <h2 class="font-707 text-[14px] font-medium leading-[18px] text-black">Notifications</h2>
            <span 
              v-if="unreadCount > 0" 
              class="text-[10.5px] px-1.5 py-0.5 rounded-full bg-black text-white font-medium tabular-nums"
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
              class="text-[11.5px] text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal hover:underline underline-offset-2"
              title="Mark all notifications as read"
            >
              Mark read
            </button>

            <!-- Clear All Notifications -->
            <button 
              v-if="activeItems.length > 0"
              type="button"
              @click="clearAllNotifications"
              class="text-[11.5px] text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal hover:underline underline-offset-2"
              title="Clear all notifications"
            >
              Clear all
            </button>

            <!-- Waiting count indicator for Superadmin -->
            <span 
              v-if="pendingCount > 0" 
              class="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border-[0.5px] border-amber-200 tabular-nums font-medium"
            >
              {{ pendingCount }} pending
            </span>

            <!-- Close Modal Button (X) matching UserProfileModal -->
            <button 
              type="button"
              @click="isOpen = false"
              class="size-[24px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none ml-1"
              title="Close notifications"
            >
              <X class="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>

        <!-- Segmented Filter Control (Apple-spec segmented control) -->
        <div class="px-[20px] pt-3 pb-2 shrink-0">
          <div class="p-1 bg-black/[0.04] border-[0.5px] border-black/5 rounded-[9px] flex items-center gap-1">
            <button 
              type="button" 
              @click="activeFilter = 'all'"
              :class="activeFilter === 'all' ? 'bg-white text-black shadow-2xs font-medium border-[0.5px] border-black/10' : 'text-neutral-500 hover:text-black border-transparent'"
              class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px]"
            >
              All ({{ activeItems.length }})
            </button>
            <button 
              type="button" 
              @click="activeFilter = 'pending'"
              :class="activeFilter === 'pending' ? 'bg-white text-black shadow-2xs font-medium border-[0.5px] border-black/10' : 'text-neutral-500 hover:text-black border-transparent'"
              class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px] flex items-center justify-center gap-1.5"
            >
              <span>Reviews</span>
              <span v-if="pendingCount > 0" class="size-1.5 rounded-full bg-amber-500 shrink-0" />
            </button>
            <button 
              type="button" 
              @click="activeFilter = 'published'"
              :class="activeFilter === 'published' ? 'bg-white text-black shadow-2xs font-medium border-[0.5px] border-black/10' : 'text-neutral-500 hover:text-black border-transparent'"
              class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px]"
            >
              Published
            </button>
          </div>
        </div>

        <!-- Scrollable Notifications List -->
        <div class="flex-1 overflow-y-auto px-[20px] py-1 flex flex-col gap-2 max-h-[50vh]">
          <!-- Error banner -->
          <p v-if="error" class="text-[12px] text-red-600 p-3 bg-red-50 rounded-[8px] border-[0.5px] border-red-200">
            {{ error }}
          </p>

          <!-- Empty State -->
          <div v-else-if="!filteredItems.length" class="py-12 px-4 flex flex-col items-center justify-center text-center gap-3">
            <div class="size-12 rounded-full bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center text-neutral-400 shadow-2xs">
              <BellOff v-if="activeFilter === 'all'" class="w-5 h-5 stroke-[1.4]" />
              <CheckCircle2 v-else class="w-5 h-5 stroke-[1.4]" />
            </div>
            <div class="flex flex-col items-center gap-1">
              <p class="text-[13.5px] font-medium text-black">
                {{ activeFilter === 'all' ? 'All caught up' : (activeFilter === 'pending' ? 'No pending reviews' : 'No published drops') }}
              </p>
              <p class="text-[11.5px] text-neutral-400 max-w-[260px] leading-relaxed font-light">
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
            class="group relative w-full text-left flex items-start gap-3 p-3 rounded-[12px] hover:bg-black/[0.03] active:bg-black/[0.06] transition-all cursor-pointer border-[0.5px]"
            :class="isUnread(item) ? 'bg-black/[0.015] border-black/10 shadow-2xs' : 'border-black/5 bg-transparent'"
          >
            <!-- Status Icon Pill -->
            <div 
              class="size-[32px] rounded-[9px] flex items-center justify-center shrink-0 border-[0.5px] mt-0.5"
              :class="statusBadgeClasses(item)"
            >
              <Clock v-if="item.kind === 'submitted'" class="w-4 h-4 stroke-[1.7]" />
              <CheckCircle2 v-else-if="item.kind === 'published'" class="w-4 h-4 stroke-[1.7]" />
              <AlertCircle v-else class="w-4 h-4 stroke-[1.7]" />
            </div>

            <!-- Content Details -->
            <div class="flex flex-col min-w-0 flex-1 pr-6">
              <div class="flex items-baseline justify-between gap-2">
                <span class="text-[13px] font-medium text-black truncate leading-snug">
                  {{ item.project_title }}
                </span>
                <span class="text-[10.5px] text-neutral-400 tabular-nums shrink-0 font-light">
                  {{ formatWhen(item.created_at) }}
                </span>
              </div>

              <!-- Status line -->
              <p class="text-[11.5px] text-neutral-600 mt-0.5 leading-snug">
                {{ describe(item) }}
              </p>

              <!-- Optional note / review feedback -->
              <div 
                v-if="item.note" 
                class="mt-1.5 p-2 rounded-[6px] bg-black/[0.03] border-[0.5px] border-black/5 text-[11px] text-neutral-700 italic line-clamp-2 leading-relaxed"
              >
                “{{ item.note }}”
              </div>

              <!-- Author / Brand metadata & CTA -->
              <div class="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
                <span class="text-[10.5px] text-neutral-400 font-light">
                  {{ item.created_by }} · {{ item.brand_slug?.toUpperCase() }}
                </span>

                <div class="flex items-center gap-1.5">
                  <span
                    v-if="item.still_pending"
                    class="h-[24px] px-2.5 rounded-[6px] bg-black hover:bg-neutral-800 text-white text-[11px] font-medium flex items-center justify-center transition-colors apple-press"
                  >
                    Review
                  </span>
                  <button
                    v-else-if="item.live_path"
                    type="button"
                    @click.stop="copy(item.id, absoluteLink(item.live_path))"
                    class="h-[24px] px-2 rounded-[6px] bg-white hover:bg-neutral-100 border-[0.5px] border-black/10 flex items-center gap-1 text-[10.5px] text-neutral-700 transition-colors shadow-2xs apple-press cursor-pointer"
                    :title="`Copy live link: ${absoluteLink(item.live_path)}`"
                  >
                    <Check v-if="copiedKey === item.id" class="w-3 h-3 text-emerald-600" />
                    <LinkIcon v-else class="w-3 h-3 text-neutral-500" />
                    <span>{{ copiedKey === item.id ? 'Copied' : 'Link' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Discrete Individual Dismiss Button (X) on hover -->
            <button
              type="button"
              @click.stop="dismissNotification(item.id)"
              class="absolute top-2.5 right-2.5 size-[20px] rounded-full bg-transparent hover:bg-neutral-200/80 text-neutral-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer border-0 outline-none"
              title="Dismiss notification"
              aria-label="Dismiss notification"
            >
              <X class="w-3 h-3" />
            </button>
          </div>
        </div>

        <!-- Footer Helper / Clear info -->
        <div class="px-[20px] py-2.5 border-t border-black/5 flex items-center justify-between text-[11px] text-neutral-400 shrink-0">
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
import { useRouter } from 'vue-router';
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

const { copiedKey, copy } = useCopiedFlag();

const router = useRouter();
const authStore = useAuthStore();

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
