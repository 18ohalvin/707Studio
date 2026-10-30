<template>
  <div class="relative" ref="rootRef">
    <NotificationBell :has-unread="unreadCount > 0" @click="toggle" />

    <Teleport to="body">
    <Transition name="notif-pop">
      <div
        v-if="isOpen"
        ref="panelRef"
        :style="popoverStyle"
        class="w-[380px] max-h-[75vh] flex flex-col bg-white/95 backdrop-blur-2xl border-[0.5px] border-black/10 rounded-[16px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.05)] apple-popover-box z-[90] font-707 overflow-hidden text-black select-none"
        role="dialog"
        aria-label="Notifications"
      >
        <!-- Modal Header -->
        <div class="px-4.5 pt-4 pb-3 border-b border-[0.5px] border-black/10 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <p class="text-[13.5px] font-medium text-black">Notifications</p>
            <span 
              v-if="unreadCount > 0" 
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-black text-white font-medium tabular-nums"
            >
              {{ unreadCount }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Mark all as read button -->
            <button 
              v-if="hasUnreadItems"
              type="button"
              @click="handleMarkAllSeen"
              class="text-[11px] text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-0 p-0 font-normal hover:underline underline-offset-2"
              title="Mark all notifications as read"
            >
              Mark all read
            </button>

            <!-- Superadmin Pending Review Badge -->
            <span 
              v-if="pendingCount" 
              class="text-[10.5px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border-[0.5px] border-amber-200 tabular-nums font-medium"
            >
              {{ pendingCount }} waiting
            </span>
          </div>
        </div>

        <!-- Segmented Filter Control (Apple-spec segmented control) -->
        <div class="p-1 mx-3 mt-2.5 bg-black/[0.03] border-[0.5px] border-black/5 rounded-[9px] flex items-center gap-1">
          <button 
            type="button" 
            @click="activeFilter = 'all'"
            :class="activeFilter === 'all' ? 'bg-white text-black shadow-2xs font-medium border-[0.5px] border-black/10' : 'text-neutral-500 hover:text-black border-transparent'"
            class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px]"
          >
            All
          </button>
          <button 
            type="button" 
            @click="activeFilter = 'pending'"
            :class="activeFilter === 'pending' ? 'bg-white text-black shadow-2xs font-medium border-[0.5px] border-black/10' : 'text-neutral-500 hover:text-black border-transparent'"
            class="flex-1 py-1 rounded-[6px] text-[11.5px] transition-all text-center cursor-pointer border-[0.5px] flex items-center justify-center gap-1"
          >
            <span>Reviews</span>
            <span v-if="pendingCount > 0" class="size-1.5 rounded-full bg-amber-500" />
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

        <!-- Scrollable Notifications List -->
        <div class="flex-1 overflow-y-auto p-2 flex flex-col gap-1 max-h-[52vh]">
          <!-- Error banner -->
          <p v-if="error" class="text-[12px] text-red-600 p-3 bg-red-50 rounded-[8px] border-[0.5px] border-red-200">
            {{ error }}
          </p>

          <!-- Empty State -->
          <div v-else-if="!filteredItems.length" class="py-12 px-6 flex flex-col items-center justify-center text-center gap-2.5">
            <div class="size-11 rounded-full bg-neutral-100 border-[0.5px] border-black/10 flex items-center justify-center text-neutral-400 shadow-2xs">
              <BellOff v-if="activeFilter === 'all'" class="w-4 h-4 stroke-[1.5]" />
              <CheckCircle2 v-else class="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <p class="text-[13px] font-medium text-black">
                {{ activeFilter === 'all' ? 'All caught up' : (activeFilter === 'pending' ? 'No pending reviews' : 'No published drops yet') }}
              </p>
              <p class="text-[11.5px] text-neutral-400 max-w-[240px] leading-relaxed mt-0.5">
                {{ authStore.isSuperAdmin ? 'Brand project submissions and status changes will appear here.' : 'Campaign submissions and live updates will appear here.' }}
              </p>
            </div>
          </div>

          <!-- Notification Item Cards -->
          <button
            v-for="item in filteredItems"
            :key="item.id"
            type="button"
            @click="openItem(item)"
            class="w-full text-left flex items-start gap-3 p-2.5 rounded-[10px] hover:bg-black/[0.03] active:bg-black/[0.06] transition-all cursor-pointer border-[0.5px]"
            :class="isUnread(item) ? 'bg-black/[0.015] border-black/10' : 'border-transparent'"
          >
            <!-- Status Icon Pill -->
            <div 
              class="size-[30px] rounded-[8px] flex items-center justify-center shrink-0 border-[0.5px]"
              :class="statusBadgeClasses(item)"
            >
              <Clock v-if="item.kind === 'submitted'" class="w-3.5 h-3.5" />
              <CheckCircle2 v-else-if="item.kind === 'published'" class="w-3.5 h-3.5" />
              <AlertCircle v-else class="w-3.5 h-3.5" />
            </div>

            <!-- Content Details -->
            <div class="flex flex-col min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[12.5px] font-medium text-black truncate leading-snug">
                  {{ item.project_title }}
                </span>
                <span class="text-[10px] text-neutral-400 tabular-nums shrink-0">
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

              <!-- Author / Brand metadata -->
              <span class="text-[10.5px] text-neutral-400 mt-1 font-light">
                {{ item.created_by }} · {{ item.brand_slug?.toUpperCase() }}
              </span>
            </div>

            <!-- Context Actions -->
            <div class="shrink-0 flex items-center gap-1 self-center ml-1">
              <span
                v-if="item.still_pending"
                class="h-[26px] px-2.5 rounded-[6px] bg-black hover:bg-neutral-800 text-white text-[11px] font-medium flex items-center justify-center transition-colors apple-press"
              >
                Review
              </span>
              <button
                v-else-if="item.live_path"
                type="button"
                @click.stop="copy(item.id, absoluteLink(item.live_path))"
                class="h-[26px] px-2 rounded-[6px] bg-white hover:bg-neutral-100 border-[0.5px] border-black/10 flex items-center gap-1 text-[11px] text-neutral-700 transition-colors shadow-2xs apple-press cursor-pointer"
                :title="`Copy live link: ${absoluteLink(item.live_path)}`"
              >
                <Check v-if="copiedKey === item.id" class="w-3 h-3 text-emerald-600" />
                <LinkIcon v-else class="w-3 h-3 text-neutral-500" />
                <span>{{ copiedKey === item.id ? 'Copied' : 'Link' }}</span>
              </button>
            </div>
          </button>
        </div>
      </div>
    </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { Check, Link as LinkIcon, Clock, CheckCircle2, AlertCircle, BellOff } from 'lucide-vue-next';
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

const items = ref<NotificationItem[]>([]);
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

function loadSeenAt() {
  try { seenAt.value = Number(localStorage.getItem(seenKey.value) || 0); } catch { seenAt.value = 0; }
}

function markAllSeen() {
  seenAt.value = Date.now();
  try { localStorage.setItem(seenKey.value, String(seenAt.value)); } catch { /* storage unavailable */ }
}

function handleMarkAllSeen() {
  markAllSeen();
}

const isUnread = (item: NotificationItem) => new Date(item.created_at).getTime() > seenAt.value;
const unreadCount = computed(() => items.value.filter(i => isUnread(i) || i.still_pending).length);
const hasUnreadItems = computed(() => items.value.some(i => isUnread(i)));

const filteredItems = computed(() => {
  if (activeFilter.value === 'pending') {
    return items.value.filter(i => i.still_pending || i.kind === 'submitted');
  }
  if (activeFilter.value === 'published') {
    return items.value.filter(i => i.kind === 'published');
  }
  return items.value;
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
    items.value = [];
    return;
  }
  try {
    const json = await apiJson<{ success: boolean; data: NotificationItem[]; pending_count: number }>('/api/notifications');
    items.value = Array.isArray(json?.data) ? json.data : [];
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
  load();
});

onMounted(() => {
  loadSeenAt();
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
