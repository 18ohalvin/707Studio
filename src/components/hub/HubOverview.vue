<template>
  <div class="flex flex-col gap-6 w-full font-707">
    <!-- Empty state -->
    <div
      v-if="!rows.length"
      class="flex flex-col items-center justify-center text-center gap-3 py-16 px-6 rounded-[14px] border border-dashed border-black/15"
    >
      <div class="size-11 rounded-full bg-black/5 flex items-center justify-center"><Users class="w-5 h-5 text-neutral-500" /></div>
      <p class="text-[15px] font-medium">No guests yet</p>
      <p class="text-[12.5px] text-neutral-500 max-w-[420px]">
        Entries appear here as soon as someone completes the form on a published campaign page. Publish a campaign and share its link to start collecting guests.
      </p>
    </div>

    <template v-else>
      <!-- Stat tiles -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div v-for="tile in tiles" :key="tile.label" class="rounded-[12px] border border-black/10 bg-white px-4 py-3.5 flex flex-col gap-1">
          <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500">{{ tile.label }}</span>
          <span class="text-[26px] leading-[32px] tabular-nums">{{ tile.value }}</span>
          <span class="text-[11.5px] text-neutral-500 tabular-nums">{{ tile.hint }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <!-- Status breakdown -->
        <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <p class="text-[13px] font-medium">Guest status</p>
            <button type="button" @click="emit('go', 'guests')" class="text-[11.5px] text-neutral-500 hover:text-black cursor-pointer flex items-center gap-1">
              Open database <ArrowRight class="w-3 h-3" />
            </button>
          </div>
          <div class="flex flex-col gap-2.5">
            <div v-for="s in statusBreakdown" :key="s.value" class="flex items-center gap-3">
              <span class="w-[86px] shrink-0 text-[12px] text-neutral-700">{{ s.label }}</span>
              <div class="flex-1 h-[8px] rounded-full bg-black/[0.05] overflow-hidden">
                <div class="h-full rounded-full bg-black transition-all duration-500" :style="{ width: `${s.pct}%` }" />
              </div>
              <span class="w-[64px] shrink-0 text-right text-[12px] tabular-nums text-neutral-600">{{ s.count }} · {{ s.pct }}%</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-2">
          <p class="text-[13px] font-medium mb-1">Event day</p>
          <button
            v-for="a in actions"
            :key="a.tab"
            type="button"
            @click="emit('go', a.tab)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] border border-black/10 hover:border-black/30 hover:bg-black/[0.02] cursor-pointer text-left transition-colors"
          >
            <div class="size-8 rounded-[8px] bg-black text-white flex items-center justify-center shrink-0">
              <component :is="a.icon" class="w-4 h-4" />
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[12.5px] font-medium">{{ a.label }}</span>
              <span class="text-[11px] text-neutral-500 truncate">{{ a.hint }}</span>
            </div>
            <ArrowRight class="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>

      <!-- Recent registrations -->
      <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-2">
        <p class="text-[13px] font-medium mb-1">Latest registrations</p>
        <div v-for="s in recent" :key="s.id" class="flex items-center gap-3 py-1.5 border-b border-black/5 last:border-b-0">
          <div class="size-8 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[11px] font-medium shrink-0">
            {{ initials(guestName(s)) }}
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-[12.5px] font-medium truncate">{{ guestName(s) }}</span>
            <span class="text-[11px] text-neutral-500 truncate">{{ campaignTitle(s.page_id) }}</span>
          </div>
          <span class="text-[10.5px] px-1.5 py-0.5 rounded-full border" :class="statusBadgeClass(s.status)">{{ statusLabel(s.status) }}</span>
          <span class="hidden sm:inline text-[11px] text-neutral-500 tabular-nums w-[110px] text-right">{{ formatDateTime(s.created_at) }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Users, ArrowRight, ScanLine, Gift, Table2 } from 'lucide-vue-next';
import {
  type Submission, STATUS_OPTIONS, normalizeStatus, statusLabel, statusBadgeClass,
  guestName, initials, formatDateTime
} from './hubUtils.ts';

type TabId = 'overview' | 'guests' | 'scanner' | 'raffle';

const props = defineProps<{
  rows: Submission[];
  campaignTitle: (pageId: string) => string;
}>();

const emit = defineEmits<{
  (e: 'go', tab: TabId): void;
}>();

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

const checkedIn = computed(() => props.rows.filter(r => r.checked_in_at).length);
const last24h = computed(() => {
  const since = Date.now() - 24 * 60 * 60 * 1000;
  return props.rows.filter(r => new Date(r.created_at).getTime() >= since).length;
});
const countByStatus = (status: string) => props.rows.filter(r => normalizeStatus(r.status) === status).length;

const tiles = computed(() => {
  const total = props.rows.length;
  return [
    { label: 'Guests', value: total, hint: `+${last24h.value} in the last 24h` },
    { label: 'Checked in', value: checkedIn.value, hint: `${pct(checkedIn.value, total)}% of guests` },
    { label: 'Confirmed', value: countByStatus('confirmed'), hint: `${countByStatus('waitlisted')} waitlisted` },
    { label: 'Winners', value: countByStatus('winner'), hint: 'from raffle draws' }
  ];
});

const statusBreakdown = computed(() =>
  STATUS_OPTIONS.map(o => {
    const count = countByStatus(o.value);
    return { value: o.value, label: o.label, count, pct: pct(count, props.rows.length) };
  })
);

const recent = computed(() =>
  [...props.rows].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)
);

const actions = [
  { tab: 'scanner' as TabId, label: 'Door Scanner', hint: 'Check guests in by QR or Access ID', icon: ScanLine },
  { tab: 'raffle' as TabId, label: 'Raffle Draw', hint: 'Pick winners fairly from eligible guests', icon: Gift },
  { tab: 'guests' as TabId, label: 'Guest Database', hint: 'Search, update status, export CSV', icon: Table2 }
];
</script>
