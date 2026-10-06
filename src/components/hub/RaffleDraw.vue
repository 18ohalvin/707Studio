<template>
  <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 w-full font-707">
    <!-- Draw settings -->
    <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-4 h-fit">
      <div class="flex flex-col gap-1">
        <p class="text-[13px] font-medium">Draw settings</p>
        <p class="text-[11.5px] text-neutral-500">Winners are picked with the browser's cryptographic random generator. Nothing is saved until you confirm. Guests who registered twice count once.</p>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Who can win</span>
        <label v-for="opt in poolOptions" :key="opt.value" class="flex items-start gap-2.5 cursor-pointer">
          <input v-model="poolRule" type="radio" :value="opt.value" class="mt-[3px] accent-black" />
          <span class="flex flex-col">
            <span class="text-[12.5px]">{{ opt.label }}</span>
            <span class="text-[11px] text-neutral-500">{{ opt.hint }}</span>
          </span>
        </label>
        <label class="flex items-center gap-2.5 cursor-pointer mt-1">
          <input v-model="excludePastWinners" type="checkbox" class="accent-black" />
          <span class="text-[12.5px]">Exclude guests who already won</span>
        </label>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500">Number of winners</span>
        <div class="flex items-center gap-2">
          <button type="button" @click="winnerCount = Math.max(1, winnerCount - 1)" class="size-9 rounded-[8px] border border-black/15 hover:bg-black/5 cursor-pointer flex items-center justify-center"><Minus class="w-3.5 h-3.5" /></button>
          <input
            v-model.number="winnerCount"
            type="number"
            min="1"
            :max="Math.max(1, eligible.length)"
            class="w-[72px] h-9 rounded-[8px] border border-black/15 text-center text-[14px] tabular-nums outline-none focus:border-black"
          />
          <button type="button" @click="winnerCount = Math.min(Math.max(1, eligible.length), winnerCount + 1)" class="size-9 rounded-[8px] border border-black/15 hover:bg-black/5 cursor-pointer flex items-center justify-center"><Plus class="w-3.5 h-3.5" /></button>
          <span class="text-[11.5px] text-neutral-500 tabular-nums ml-1">of {{ eligible.length }} eligible</span>
        </div>
      </div>

      <button
        id="raffle-draw-btn"
        type="button"
        :disabled="!eligible.length || isDrawing || isSaving"
        @click="draw"
        class="h-[42px] rounded-[10px] bg-black text-white text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <Shuffle class="w-4 h-4" :class="isDrawing ? 'animate-spin' : ''" />
        {{ isDrawing ? 'Drawing…' : (drawn.length ? 'Draw again' : 'Draw winners') }}
      </button>
      <p v-if="!eligible.length" class="text-[11.5px] text-neutral-500 -mt-2">No guest matches these rules yet.</p>
    </div>

    <!-- Results -->
    <div class="flex flex-col gap-4 min-w-0">
      <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-3 min-h-[220px]">
        <div class="flex items-center justify-between gap-3">
          <p class="text-[13px] font-medium">{{ drawn.length ? 'Drawn — not saved yet' : 'Result' }}</p>
          <div v-if="drawn.length && !isDrawing" class="flex items-center gap-2">
            <button type="button" @click="drawn = []" class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer">Discard</button>
            <button
              id="raffle-confirm-btn"
              type="button"
              :disabled="isSaving"
              @click="confirmWinners"
              class="h-[30px] px-3 rounded-[8px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Check class="w-3.5 h-3.5" /> {{ isSaving ? 'Saving…' : `Mark ${drawn.length} as winner${drawn.length === 1 ? '' : 's'}` }}
            </button>
          </div>
        </div>

        <div v-if="isDrawing" class="flex-1 flex flex-col items-center justify-center py-8 gap-2">
          <p class="text-[22px] tabular-nums tracking-tight">{{ shuffleName }}</p>
          <p class="text-[11px] text-neutral-500">Shuffling {{ eligible.length }} guests…</p>
        </div>

        <div v-else-if="drawn.length" class="flex flex-col">
          <div v-for="(s, i) in drawn" :key="s.id" class="flex items-center gap-3 py-2 border-b border-black/5 last:border-b-0">
            <span class="w-6 text-[12px] text-neutral-400 tabular-nums">{{ i + 1 }}</span>
            <div class="size-8 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-medium shrink-0">{{ initials(guestName(s)) }}</div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-[13px] font-medium truncate">{{ guestName(s) }}</span>
              <span class="text-[11px] text-neutral-500 truncate">{{ maskEmail(guestEmail(s)) || guestPhone(s) || '—' }}</span>
            </div>
            <span class="text-[11px] font-mono text-neutral-500">{{ accessId(s) }}</span>
          </div>
        </div>

        <div v-else class="flex-1 flex flex-col items-center justify-center text-center py-8 gap-2">
          <Gift class="w-6 h-6 text-neutral-400" />
          <p class="text-[12.5px] text-neutral-500 max-w-[320px]">Set the rules on the left and draw. You can redraw as often as you like before confirming.</p>
        </div>
      </div>

      <!-- Saved winners -->
      <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <p class="text-[13px] font-medium">Winners <span class="text-neutral-400 tabular-nums">{{ winners.length }}</span></p>
          <button
            v-if="winners.length"
            type="button"
            @click="exportWinners"
            class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer flex items-center gap-1.5"
          >
            <Download class="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <p v-if="!winners.length" class="text-[12px] text-neutral-500 py-2">No winners confirmed yet.</p>
        <div v-for="s in winners" :key="s.id" class="flex items-center gap-3 py-1.5 border-b border-black/5 last:border-b-0">
          <div class="size-7 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[10.5px] font-medium shrink-0">{{ initials(guestName(s)) }}</div>
          <span class="text-[12.5px] flex-1 truncate">{{ guestName(s) }}</span>
          <span class="text-[11px] font-mono text-neutral-500">{{ accessId(s) }}</span>
          <span v-if="s.checked_in_at" class="text-[10.5px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">At venue</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Shuffle, Check, Gift, Download, Plus, Minus } from 'lucide-vue-next';
import {
  type Submission, normalizeStatus, guestName, guestEmail, guestPhone, initials, accessId, maskEmail,
  secureSample, secureRandomInt, bulkSetStatus, buildCsv, customFieldKeys, downloadText
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  exportName: string;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'toast', msg: string): void;
}>();

type PoolRule = 'registered' | 'confirmed' | 'checked_in';
const poolOptions: { value: PoolRule; label: string; hint: string }[] = [
  { value: 'registered', label: 'Every registered guest', hint: 'Excludes declined guests' },
  { value: 'confirmed', label: 'Confirmed guests only', hint: 'Status set to Confirmed' },
  { value: 'checked_in', label: 'Guests at the venue', hint: 'Checked in at the door' }
];

const poolRule = ref<PoolRule>('registered');
const excludePastWinners = ref(true);
const winnerCount = ref(1);
const drawn = ref<Submission[]>([]);
const isDrawing = ref(false);
const isSaving = ref(false);
const shuffleName = ref('');

const eligible = computed(() =>
  props.rows.filter(s => {
    const status = normalizeStatus(s.status);
    // One chance per person: an entry flagged as a repeat registration does not enter twice.
    if (s.duplicate_of) return false;
    if (status === 'declined') return false;
    if (excludePastWinners.value && status === 'winner') return false;
    if (poolRule.value === 'confirmed') return status === 'confirmed' || (!excludePastWinners.value && status === 'winner');
    if (poolRule.value === 'checked_in') return Boolean(s.checked_in_at);
    return true;
  })
);

const winners = computed(() => props.rows.filter(s => normalizeStatus(s.status) === 'winner'));

// A draw made against rules that have since changed is no longer valid.
watch([poolRule, excludePastWinners], () => (drawn.value = []));

let shuffleTimer: ReturnType<typeof setInterval> | null = null;

function draw() {
  const pool = eligible.value;
  if (!pool.length) return;
  const count = Math.min(Math.max(1, Math.floor(winnerCount.value || 1)), pool.length);
  winnerCount.value = count;
  drawn.value = [];
  isDrawing.value = true;

  // The shuffle on screen is theatre for the room; the result is decided by
  // secureSample alone.
  shuffleTimer = setInterval(() => {
    shuffleName.value = guestName(pool[secureRandomInt(pool.length)]);
  }, 70);
  setTimeout(() => {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = null;
    drawn.value = secureSample(pool, count);
    isDrawing.value = false;
  }, 1600);
}

async function confirmWinners() {
  if (!drawn.value.length) return;
  isSaving.value = true;
  try {
    const updated = await bulkSetStatus(drawn.value.map(s => s.id), 'winner');
    emit('updated', updated);
    emit('toast', `${updated.length} winner${updated.length === 1 ? '' : 's'} saved.`);
    drawn.value = [];
  } catch (err: any) {
    emit('toast', `Couldn't save winners: ${err?.message || 'network error'}`);
  } finally {
    isSaving.value = false;
  }
}

function exportWinners() {
  const rows = winners.value;
  const csv = buildCsv(rows, customFieldKeys(rows), () => props.exportName);
  downloadText(`${props.exportName}-winners.csv`, csv);
}

onUnmounted(() => {
  if (shuffleTimer) clearInterval(shuffleTimer);
});
</script>
