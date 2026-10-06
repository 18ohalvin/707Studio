<template>
  <div class="relative" ref="rootRef">
    <NotificationBell :has-unread="unreadCount > 0" @click="toggle" />

    <Transition name="notif-pop">
      <div
        v-if="isOpen"
        class="absolute right-0 top-[34px] w-[360px] max-h-[70vh] flex flex-col backdrop-blur-2xl bg-white/70 border border-white/60 rounded-[12px] shadow-[0px_16px_45px_0px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.05)] apple-popover-box z-50 font-707 overflow-hidden"
        role="dialog"
        aria-label="Notifications"
      >
        <div class="px-4 pt-4 pb-3 border-b border-black/5 flex items-center justify-between">
          <p class="text-[13px] font-medium">Notifications</p>
          <span v-if="pendingCount" class="text-[10.5px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 tabular-nums">
            {{ pendingCount }} waiting for review
          </span>
        </div>

        <div class="flex-1 overflow-y-auto p-1.5">
          <p v-if="error" class="text-[12px] text-red-600 p-3">{{ error }}</p>
          <p v-else-if="!items.length" class="text-[12px] text-neutral-500 p-3">
            {{ authStore.isSuperAdmin ? 'Submissions from brands will appear here.' : 'You will hear here when your projects are published or sent back.' }}
          </p>
          <button
            v-for="item in items"
            :key="item.id"
            type="button"
            @click="openItem(item)"
            class="w-full text-left flex items-start gap-3 px-2.5 py-2.5 rounded-[8px] hover:bg-black/[0.04] cursor-pointer"
          >
            <span class="size-2 rounded-full mt-1.5 shrink-0" :class="isUnread(item) ? 'bg-black' : 'bg-transparent'" />
            <span class="flex flex-col min-w-0 flex-1">
              <span class="text-[12.5px] leading-[17px]">
                <span class="font-medium">{{ item.project_title }}</span>
                <span class="text-neutral-600"> — {{ describe(item) }}</span>
              </span>
              <span v-if="item.note" class="text-[11px] text-neutral-700 mt-0.5 line-clamp-2">“{{ item.note }}”</span>
              <span class="text-[11px] text-neutral-500 mt-0.5">{{ item.created_by }} · {{ formatWhen(item.created_at) }}</span>
            </span>
            <span
              v-if="item.still_pending"
              class="shrink-0 text-[10.5px] px-1.5 py-0.5 rounded-[5px] bg-black text-white mt-0.5"
            >Review</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import NotificationBell from './NotificationBell.vue';
import { useAuthStore } from '../../stores/authStore.ts';
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
}

const router = useRouter();
const authStore = useAuthStore();

const items = ref<NotificationItem[]>([]);
const pendingCount = ref(0);
const error = ref('');
const isOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

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

const isUnread = (item: NotificationItem) => new Date(item.created_at).getTime() > seenAt.value;
// A submission still waiting counts as unread for the superadmin until it is handled.
const unreadCount = computed(() => items.value.filter(i => isUnread(i) || i.still_pending).length);

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
  if (item.kind === 'submitted') return item.is_update ? 'update submitted for review' : 'submitted for review';
  if (item.kind === 'published') return `published as live v${item.live_version}`;
  return 'changes requested';
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
  } else {
    markAllSeen();
  }
}

function openItem(item: NotificationItem) {
  isOpen.value = false;
  markAllSeen();
  router.push(`/editor/${encodeURIComponent((item.brand_slug || 'brand').toLowerCase())}/${encodeURIComponent(item.project_id)}`);
}

function handleOutside(e: MouseEvent) {
  if (isOpen.value && rootRef.value && !rootRef.value.contains(e.target as Node)) {
    isOpen.value = false;
    markAllSeen();
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
