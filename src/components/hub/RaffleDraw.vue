<template>
  <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 w-full font-707">
    <!-- Draw settings -->
    <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-4 h-fit">
      <div class="flex items-center justify-between">
        <div class="flex flex-col gap-1">
          <p class="text-[13px] font-medium">Draw settings</p>
          <p class="text-[11.5px] text-neutral-500">Winners are picked with the browser's cryptographic random generator. Nothing is saved until you confirm. Guests who registered twice count once.</p>
        </div>
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
        <label v-if="!isWaitlistDraw" class="flex items-center gap-2.5 cursor-pointer mt-1">
          <input v-model="excludePastWinners" type="checkbox" class="accent-black" />
          <span class="text-[12.5px]">Exclude guests who already won</span>
        </label>
      </div>

      <div class="flex flex-col gap-1.5">
        <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500">{{ isWaitlistDraw ? 'Number of guests' : 'Number of winners' }}</span>
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

      <div class="flex flex-col gap-2 pt-1">
        <button
          id="raffle-draw-btn"
          type="button"
          :disabled="!eligible.length || isDrawing || isSaving"
          @click="draw"
          class="h-[42px] rounded-[10px] bg-black text-white text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Shuffle class="w-4 h-4" :class="isDrawing ? 'animate-spin' : ''" />
          {{ isDrawing ? 'Drawing…' : (drawn.length ? 'Draw again' : (isWaitlistDraw ? 'Draw from waitlist' : 'Draw winners')) }}
        </button>

        <button
          type="button"
          @click="openStageMode"
          class="h-[36px] rounded-[10px] border border-black/15 bg-white text-black hover:bg-black/5 text-[12.5px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
          title="Open projector-ready full-screen stage mode for live reveal"
        >
          <Maximize2 class="w-3.5 h-3.5 text-neutral-600" />
          <span>Cinematic Stage Mode</span>
        </button>
      </div>

      <p v-if="!eligible.length" class="text-[11.5px] text-neutral-500 -mt-2">No guest matches these rules yet.</p>
    </div>

    <!-- Results -->
    <div class="flex flex-col gap-4 min-w-0">
      <div class="rounded-[12px] border border-black/10 bg-white p-4 flex flex-col gap-3 min-h-[220px]">
        <div class="flex items-center justify-between gap-3">
          <p class="text-[13px] font-medium">{{ drawn.length ? (isWaitlistDraw ? 'Drawn — still on the waitlist until you confirm' : 'Drawn — not saved yet') : 'Result' }}</p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="openStageMode"
              class="h-[30px] px-2.5 rounded-[8px] border border-black/15 bg-white hover:bg-black/5 flex items-center gap-1.5 text-[12px] font-medium cursor-pointer transition-colors"
              title="Open Stage Mode for live event projection"
            >
              <Maximize2 class="w-3.5 h-3.5" /> <span class="hidden sm:inline">Stage Mode</span>
            </button>
            <template v-if="drawn.length && !isDrawing">
              <button v-if="isSaving && prepStep" type="button" @click="ticketSender.cancel()" class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer">Stop</button>
              <button v-else type="button" :disabled="isSaving" @click="drawn = []" class="h-[30px] px-3 rounded-[8px] border border-black/15 text-[12px] hover:bg-black/5 cursor-pointer disabled:opacity-40">Discard</button>
              <button
                id="raffle-confirm-btn"
                type="button"
                :disabled="isSaving"
                @click="confirmWinners"
                class="h-[30px] px-3 rounded-[8px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check class="w-3.5 h-3.5" /> {{ isSaving ? (prepStep ? `Preparing tickets ${prepStep.done}/${prepStep.total}…` : 'Saving…') : (isWaitlistDraw ? `Move ${drawn.length} off the waitlist` : `Mark ${drawn.length} as winner${drawn.length === 1 ? '' : 's'}`) }}
              </button>
            </template>
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
          <span v-if="s.checked_in_at" class="text-[10.5px] px-1.5 py-0.5 rounded-full bg-moss-50 text-moss-700 border border-moss-200">At venue</span>
        </div>
      </div>
    </div>

    <!-- Cinematic Full-screen Stage Mode for Projectors / Live Events -->
    <Teleport to="body">
      <Transition name="stage-fade">
        <div
          v-if="isStageModeOpen"
          class="fixed inset-0 z-[120] bg-[#0b0c0d] text-white flex flex-col justify-between p-6 sm:p-10 font-707 select-none overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          <!-- Confetti Canvas -->
          <canvas ref="confettiCanvas" class="absolute inset-0 pointer-events-none z-20"></canvas>

          <!-- Top Stage Bar -->
          <div class="relative z-30 flex items-center justify-between w-full border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 border border-white/15 text-white/95">
                <span class="size-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE RAFFLE STAGE
              </span>
              <span class="text-[13px] text-white/30 hidden sm:inline">|</span>
              <span class="text-[13.5px] text-white/80 font-medium truncate max-w-[340px]">{{ campaignTitle || exportName }}</span>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-[12px] text-white/50 tabular-nums hidden sm:inline">
                {{ eligible.length }} candidate{{ eligible.length === 1 ? '' : 's' }} in pool
              </span>
              <button
                type="button"
                @click="closeStageMode"
                class="h-[34px] px-3.5 rounded-[9px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Exit Stage Mode (Esc)"
              >
                <Minimize2 class="w-3.5 h-3.5" /> <span>Exit (Esc)</span>
              </button>
            </div>
          </div>

          <!-- Main Stage Centerpiece -->
          <div class="relative z-30 flex-1 flex flex-col items-center justify-center text-center my-6 max-w-4xl mx-auto w-full">
            <!-- State 1: Shuffling / In Progress -->
            <div v-if="isDrawing" class="flex flex-col items-center justify-center gap-6 animate-pulse">
              <div class="size-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <Sparkles class="w-8 h-8 text-amber-300 animate-spin" />
              </div>
              <div class="flex flex-col items-center gap-2">
                <p class="text-[12px] uppercase tracking-[0.22em] text-white/50 font-medium">Drawing Lucky Winner</p>
                <h1 class="text-[38px] sm:text-[64px] md:text-[80px] font-bold tracking-tight text-white font-mono leading-none drop-shadow-[0_8px_30px_rgba(255,255,255,0.3)]">
                  {{ shuffleName }}
                </h1>
                <p class="text-[13.5px] text-white/60 font-mono mt-2">Cycling {{ eligible.length }} entries...</p>
              </div>
            </div>

            <!-- State 2: Winner(s) Revealed -->
            <div v-else-if="drawn.length" class="flex flex-col items-center justify-center w-full gap-6">
              <div class="flex flex-col items-center gap-1.5">
                <span class="px-3.5 py-1 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  🎉 Winner{{ drawn.length > 1 ? 's' : '' }} Selected
                </span>
                <h2 class="text-[32px] sm:text-[44px] font-semibold text-white tracking-tight">
                  Congratulations!
                </h2>
              </div>

              <!-- Winners Card Grid -->
              <div 
                class="w-full grid gap-4 max-h-[55vh] overflow-y-auto p-2"
                :class="drawn.length === 1 ? 'grid-cols-1 max-w-[460px]' : drawn.length <= 4 ? 'grid-cols-1 sm:grid-cols-2 max-w-[760px]' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl'"
              >
                <div
                  v-for="(s, idx) in drawn"
                  :key="s.id"
                  class="relative p-5 rounded-[18px] bg-white/[0.08] backdrop-blur-xl border border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 text-left transition-all hover:bg-white/[0.12]"
                >
                  <div class="size-13 rounded-full bg-gradient-to-tr from-amber-400 to-amber-200 text-black font-bold text-[17px] flex items-center justify-center shrink-0 shadow-lg">
                    {{ initials(guestName(s)) }}
                  </div>
                  <div class="flex flex-col min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[11px] font-mono text-amber-300 uppercase tracking-wider font-semibold">#{{ idx + 1 }} Winner</span>
                      <span v-if="s.checked_in_at" class="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">At Venue</span>
                    </div>
                    <h3 class="text-[19px] font-semibold text-white truncate leading-snug">{{ guestName(s) }}</h3>
                    <p class="text-[12px] text-white/60 font-mono truncate">{{ maskEmail(guestEmail(s)) || guestPhone(s) || '—' }}</p>
                    <p class="text-[11px] text-white/40 font-mono mt-0.5">Pass ID: {{ accessId(s) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- State 3: Ready to Draw (Idle) -->
            <div v-else class="flex flex-col items-center justify-center gap-6">
              <div class="size-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                <Trophy class="w-10 h-10 text-amber-300/80" />
              </div>
              <div class="flex flex-col items-center gap-2">
                <span class="text-[12px] uppercase tracking-[0.2em] text-white/50 font-medium">Ready for Live Selection</span>
                <h1 class="text-[36px] sm:text-[54px] font-semibold text-white tracking-tight leading-tight">
                  {{ isWaitlistDraw ? 'Waitlist Draw' : 'Official Prize Draw' }}
                </h1>
                <p class="text-[15px] text-white/60 max-w-[480px]">
                  Drawing <strong class="text-white font-mono">{{ winnerCount }}</strong> lucky {{ isWaitlistDraw ? 'guest' : 'winner' }}{{ winnerCount > 1 ? 's' : '' }} from a pool of <strong class="text-white font-mono">{{ eligible.length }}</strong> verified entries.
                </p>
              </div>

              <button
                type="button"
                :disabled="!eligible.length || isDrawing"
                @click="draw"
                class="apple-press h-[56px] px-10 rounded-[14px] bg-white text-black font-semibold text-[17px] tracking-tight hover:bg-neutral-200 cursor-pointer shadow-[0_12px_36px_rgba(255,255,255,0.2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-3 mt-4"
              >
                <Shuffle class="w-5 h-5" />
                <span>Start Lucky Draw</span>
              </button>
            </div>
          </div>

          <!-- Bottom Stage Controls -->
          <div class="relative z-30 flex items-center justify-between w-full border-t border-white/10 pt-4">
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-white/50">Winners:</span>
              <div class="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-[8px] p-1">
                <button
                  type="button"
                  :disabled="isDrawing || isSaving"
                  @click="winnerCount = Math.max(1, winnerCount - 1)"
                  class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-white/80 cursor-pointer disabled:opacity-30"
                >
                  <Minus class="w-3.5 h-3.5" />
                </button>
                <span class="w-8 text-center text-[13px] font-mono font-medium tabular-nums text-white">{{ winnerCount }}</span>
                <button
                  type="button"
                  :disabled="isDrawing || isSaving || winnerCount >= eligible.length"
                  @click="winnerCount = Math.min(Math.max(1, eligible.length), winnerCount + 1)"
                  class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-white/80 cursor-pointer disabled:opacity-30"
                >
                  <Plus class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Stage Action Buttons -->
            <div v-if="drawn.length && !isDrawing" class="flex items-center gap-3">
              <button
                type="button"
                :disabled="isSaving"
                @click="draw"
                class="h-[40px] px-4 rounded-[10px] bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[13px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw class="w-4 h-4" /> <span>Draw Again</span>
              </button>
              <button
                type="button"
                :disabled="isSaving"
                @click="confirmWinners"
                class="apple-press h-[40px] px-5 rounded-[10px] bg-white text-black font-medium text-[13px] hover:bg-neutral-100 flex items-center gap-2 cursor-pointer shadow-[0_8px_20px_rgba(255,255,255,0.15)] transition-all"
              >
                <Check class="w-4 h-4" /> <span>{{ isSaving ? 'Saving…' : 'Confirm Winners' }}</span>
              </button>
            </div>
            <div v-else class="text-[12px] text-white/40">
              Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[11px]">Space</kbd> to draw · <kbd class="px-1.5 py-0.5 rounded bg-white/10 text-white/70 font-mono text-[11px]">Esc</kbd> to exit
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Shuffle, Check, Gift, Download, Plus, Minus, Maximize2, Minimize2, Sparkles, Trophy, RotateCcw } from 'lucide-vue-next';
import { glassConfirm } from '../../services/glassDialog.ts';
import { useTicketSender } from './useTicketSender.ts';
import {
  type Submission, normalizeStatus, guestName, guestEmail, guestPhone, initials, accessId, maskEmail,
  secureSample, secureRandomInt, bulkSetStatus, buildCsv, customFieldKeys, downloadText
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  exportName: string;
  campaignTitle?: string;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'toast', msg: string): void;
}>();

type PoolRule = 'registered' | 'confirmed' | 'checked_in' | 'waitlisted';
const poolOptions: { value: PoolRule; label: string; hint: string }[] = [
  { value: 'registered', label: 'Every registered guest', hint: 'Excludes declined and waitlisted guests' },
  { value: 'confirmed', label: 'Confirmed guests only', hint: 'Status set to Confirmed' },
  { value: 'checked_in', label: 'Guests at the venue', hint: 'Checked in at the door' },
  { value: 'waitlisted', label: 'Waitlisted guests', hint: 'Takes guests off the waitlist: they get a place and an email with their ticket' }
];

const poolRule = ref<PoolRule>('registered');
const excludePastWinners = ref(true);
const winnerCount = ref(1);
const drawn = ref<Submission[]>([]);
const isDrawing = ref(false);
const isSaving = ref(false);
const shuffleName = ref('');

const isStageModeOpen = ref(false);
const confettiCanvas = ref<HTMLCanvasElement | null>(null);
let confettiAnimId: number | null = null;

function openStageMode() {
  isStageModeOpen.value = true;
}

function closeStageMode() {
  isStageModeOpen.value = false;
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
}

function triggerConfetti() {
  if (!confettiCanvas.value) return;
  const canvas = confettiCanvas.value;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colors = ['#f59e0b', '#d97706', '#fbbf24', '#ffffff', '#10b981', '#3b82f6'];
  const particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    w: number;
    h: number;
    color: string;
    rotation: number;
    vrot: number;
  }> = [];

  for (let i = 0; i < 140; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 260,
      y: window.innerHeight / 2 - 120,
      vx: (Math.random() - 0.5) * 18,
      vy: Math.random() * -14 - 5,
      w: Math.random() * 8 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vrot: (Math.random() - 0.5) * 12
    });
  }

  const startTime = Date.now();
  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const elapsed = Date.now() - startTime;
    let alive = 0;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.98; // drag
      p.rotation += p.vrot;

      if (p.y < canvas.height + 50) alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive > 0 && elapsed < 4500) {
      confettiAnimId = requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  confettiAnimId = requestAnimationFrame(render);
}

function handleKeyDown(e: KeyboardEvent) {
  if (!isStageModeOpen.value) return;
  if (e.key === 'Escape') {
    closeStageMode();
  } else if (e.key === ' ' && !isDrawing.value && !drawn.value.length) {
    e.preventDefault();
    draw();
  }
}

const eligible = computed(() =>
  props.rows.filter(s => {
    const status = normalizeStatus(s.status);
    // One chance per person: an entry flagged as a repeat registration does not enter twice.
    if (s.duplicate_of) return false;
    if (poolRule.value === 'waitlisted') return status === 'waitlisted';
    if (status === 'declined' || status === 'waitlisted') return false;
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

  // The shuffle on screen is theatre for the room; the result is decided by secureSample alone.
  shuffleTimer = setInterval(() => {
    shuffleName.value = guestName(pool[secureRandomInt(pool.length)]);
  }, 70);
  setTimeout(() => {
    if (shuffleTimer) clearInterval(shuffleTimer);
    shuffleTimer = null;
    drawn.value = secureSample(pool, count);
    isDrawing.value = false;
    if (isStageModeOpen.value) {
      setTimeout(() => triggerConfetti(), 80);
    }
  }, 1600);
}

const isWaitlistDraw = computed(() => poolRule.value === 'waitlisted');
const ticketSender = useTicketSender();
const prepStep = ref<{ done: number; total: number } | null>(null);

async function confirmWinners() {
  if (!drawn.value.length) return;
  isSaving.value = true;
  try {
    if (isWaitlistDraw.value) {
      await promoteFromWaitlist();
      return;
    }
    const updated = await bulkSetStatus(drawn.value.map(s => s.id), 'winner');
    emit('updated', updated);
    emit('toast', `${updated.length} winner${updated.length === 1 ? '' : 's'} saved.`);
    drawn.value = [];
  } catch (err: any) {
    emit('toast', `Couldn't save winners: ${err?.message || 'network error'}`);
  } finally {
    isSaving.value = false;
    prepStep.value = null;
  }
}

/**
 * Takes the drawn guests off the waitlist. Their ticket PDFs are made first (in this browser,
 * one by one) so the email that goes out the moment they get a place has the PDF attached;
 * the status change is what sends those emails.
 */
async function promoteFromWaitlist() {
  const guests = [...drawn.value];
  const prep = await ticketSender.storeTickets(guests, (done, total) => (prepStep.value = { done, total }));
  if (prep.cancelled) {
    emit('toast', 'Stopped. Nobody was moved off the waitlist.');
    return;
  }
  if (prep.failed.length) {
    const go = await glassConfirm({
      title: `${prep.failed.length} ticket${prep.failed.length === 1 ? '' : 's'} could not be prepared`,
      message: `Move all ${guests.length} guests off the waitlist anyway? Those ${prep.failed.length} get the email with their access code instead of the PDF attached.`,
      confirmLabel: 'Move them anyway'
    });
    if (!go) {
      emit('toast', 'Nobody was moved off the waitlist.');
      return;
    }
  }
  const updated = await bulkSetStatus(guests.map(s => s.id), 'confirmed');
  emit('updated', updated);
  emit('toast', `${updated.length} guest${updated.length === 1 ? '' : 's'} moved off the waitlist. Their ticket emails are going out now.`);
  drawn.value = [];
}

function exportWinners() {
  const rows = winners.value;
  const csv = buildCsv(rows, customFieldKeys(rows), () => props.exportName);
  downloadText(`${props.exportName}-winners.csv`, csv);
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (shuffleTimer) clearInterval(shuffleTimer);
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
});
</script>

<style scoped>
.stage-fade-enter-active, .stage-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.stage-fade-enter-from, .stage-fade-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
