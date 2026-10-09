<template>
  <!--
    One screen, no scrolling: built for a 10" tablet held landscape at the door.
    Camera on the left; on the right the counts, a lookup by the last 4 characters
    of the Access ID (or the WhatsApp number), the matches to tap, and an on-screen
    keypad so the tablet's own keyboard never covers the list.
  -->
  <div
    ref="rootRef"
    class="relative h-full w-full min-h-0 grid gap-3 overflow-hidden font-707 touch-manipulation select-none landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] portrait:grid-rows-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
  >
    <!-- ============ Camera panel ============ -->
    <section class="min-h-0 rounded-[20px] bg-[#0c0d0e] text-white border border-[#2c2f35] overflow-hidden flex flex-col">
      <div class="flex items-center justify-between gap-2 px-3 h-[48px] shrink-0 border-b border-white/10">
        <div class="flex items-center p-0.5 rounded-[10px] bg-white/[0.06] border border-white/10 text-[13px]">
          <button
            id="scanner-mode-in"
            type="button"
            @click="mode = 'in'"
            class="px-3 h-[34px] rounded-[8px] cursor-pointer transition-all flex items-center gap-1.5"
            :class="mode === 'in' ? 'bg-white text-black font-medium' : 'text-white/60'"
          >
            <LogIn class="w-4 h-4" /> Check-in
          </button>
          <button
            id="scanner-mode-out"
            type="button"
            @click="mode = 'out'"
            class="px-3 h-[34px] rounded-[8px] cursor-pointer transition-all flex items-center gap-1.5"
            :class="mode === 'out' ? 'bg-white text-black font-medium' : 'text-white/60'"
          >
            <LogOut class="w-4 h-4" /> Check-out
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button type="button" @click="soundOn = !soundOn" class="size-[40px] rounded-[10px] active:bg-white/15 flex items-center justify-center cursor-pointer text-white/70" :title="soundOn ? 'Mute scan sounds' : 'Enable scan sounds'">
            <Volume2 v-if="soundOn" class="w-5 h-5" />
            <VolumeX v-else class="w-5 h-5" />
          </button>
          <button type="button" @click="toggleFullscreen" class="size-[40px] rounded-[10px] active:bg-white/15 flex items-center justify-center cursor-pointer text-white/70" :title="isFullscreen ? 'Exit door mode' : 'Door mode (fullscreen)'">
            <Minimize2 v-if="isFullscreen" class="w-5 h-5" />
            <Maximize2 v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Viewfinder -->
      <div class="relative flex-1 min-h-0 bg-[#050506] overflow-hidden">
        <video v-show="cameraOn" ref="videoRef" class="absolute inset-0 size-full object-cover" playsinline muted />
        <div v-if="!cameraOn" class="absolute inset-0 hud-grid opacity-[0.08]" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

        <div class="absolute inset-[16%] pointer-events-none">
          <span class="hud-corner top-0 left-0 border-t-2 border-l-2 rounded-tl-[14px]" :class="frameColor" />
          <span class="hud-corner top-0 right-0 border-t-2 border-r-2 rounded-tr-[14px]" :class="frameColor" />
          <span class="hud-corner bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[14px]" :class="frameColor" />
          <span class="hud-corner bottom-0 right-0 border-b-2 border-r-2 rounded-br-[14px]" :class="frameColor" />
          <div v-if="!result && !isChecking" class="hud-scanline" />
        </div>

        <div v-if="!cameraOn" class="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
          <ScanLine class="w-9 h-9 text-white/40 mb-3" />
          <p class="text-[15px] text-white/80 font-medium">Ready to scan</p>
          <p class="text-[12.5px] text-white/50 mt-1 max-w-[300px]">Handheld scanner, camera, or type the last 4 of the Access ID on the right.</p>
        </div>

        <div v-if="isChecking" class="absolute inset-0 flex items-center justify-center bg-black/40">
          <div class="size-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>

        <div class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-[11px] uppercase tracking-[0.12em] text-white/70 pointer-events-none">
          <span class="size-1.5 rounded-full" :class="cameraOn ? 'bg-red-500 animate-pulse' : 'bg-white/30'" />
          {{ cameraOn ? 'Camera live' : 'Camera off' }}
        </div>
      </div>

      <div class="flex items-center justify-between gap-3 px-3 h-[56px] shrink-0 border-t border-white/10">
        <button
          type="button"
          @click="cameraOn ? stopCamera() : startCamera()"
          class="h-[40px] px-4 rounded-[10px] border border-white/15 text-[14px] flex items-center gap-2 cursor-pointer active:bg-white/15 transition-colors"
        >
          <Camera class="w-5 h-5" />
          {{ cameraOn ? 'Stop camera' : 'Scan with camera' }}
        </button>
        <p class="text-[12px] text-white/45 text-right leading-tight">{{ cameraNote }}</p>
      </div>
    </section>

    <!-- ============ Lookup, counts, matches ============ -->
    <section class="min-h-0 flex flex-col gap-3">
      <!-- Counts -->
      <div class="shrink-0 rounded-[16px] border border-black/10 bg-white px-4 py-2.5">
        <div class="grid grid-cols-4 gap-3">
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.1em] text-neutral-500">Inside</p>
            <p class="text-[26px] leading-[1.1] font-medium tabular-nums">{{ insideCount }}</p>
          </div>
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.1em] text-neutral-500">Expected</p>
            <p class="text-[26px] leading-[1.1] font-medium tabular-nums text-neutral-400">{{ expectedCount }}</p>
          </div>
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.1em] text-neutral-500">Remaining</p>
            <p class="text-[26px] leading-[1.1] font-medium tabular-nums">{{ Math.max(0, expectedCount - insideCount) }}</p>
          </div>
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.1em] text-neutral-500">Last 15 min</p>
            <p class="text-[26px] leading-[1.1] font-medium tabular-nums">+{{ recentArrivals }}</p>
          </div>
        </div>
        <div class="mt-2 h-1 rounded-full bg-black/10 overflow-hidden">
          <div class="h-full bg-black transition-[width] duration-700 ease-out" :style="{ width: `${Math.round(arrivalRate * 100)}%` }" />
        </div>
      </div>

      <!-- Lookup -->
      <div class="flex-1 min-h-0 rounded-[16px] border border-black/10 bg-white p-3 flex flex-col gap-2.5">
        <form class="flex items-stretch gap-2 shrink-0" @submit.prevent="onEnter">
          <div class="relative flex-1">
            <KeyRound class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              id="scanner-access-input"
              ref="inputRef"
              v-model="codeInput"
              type="text"
              :inputmode="systemKeyboard ? 'text' : 'none'"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="Last 4 of Access ID or WhatsApp"
              class="w-full h-[52px] pl-11 pr-11 rounded-[12px] bg-black/[0.04] border border-black/15 text-[22px] font-mono tracking-[0.1em] uppercase text-black placeholder:text-neutral-400 placeholder:text-[14px] placeholder:tracking-normal placeholder:font-707 placeholder:normal-case outline-none focus:border-black focus:bg-white transition-colors"
            />
            <button v-if="codeInput" type="button" @pointerdown.prevent="clearInput" class="absolute right-2 top-1/2 -translate-y-1/2 size-[36px] rounded-[9px] active:bg-black/10 flex items-center justify-center cursor-pointer text-neutral-500" title="Clear">
              <X class="w-5 h-5" />
            </button>
          </div>
          <button
            id="scanner-submit-btn"
            type="submit"
            :disabled="!codeInput.trim() || isChecking"
            class="h-[52px] px-5 rounded-[12px] bg-black text-white text-[15px] font-medium flex items-center gap-2 cursor-pointer active:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            {{ mode === 'in' ? 'Admit' : 'Check out' }}
            <CornerDownLeft class="w-5 h-5" />
          </button>
        </form>

        <!-- Matches (or the latest scans while nothing is typed) -->
        <div class="flex-1 min-h-0 overflow-hidden flex flex-col gap-1.5">
          <template v-if="query.length >= 3">
            <button
              v-for="(m, i) in candidates"
              :key="m.guest.id"
              type="button"
              @click="admit(m.guest)"
              class="shrink-0 w-full flex items-center gap-3 px-3 h-[clamp(46px,7.4vh,62px)] rounded-[12px] border text-left cursor-pointer transition-colors"
              :class="i === 0 && candidates.length === 1 ? 'border-black bg-black/[0.04]' : 'border-black/10 active:bg-black/10'"
            >
              <div class="size-9 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[12px] font-medium shrink-0">{{ initials(guestName(m.guest)) }}</div>
              <div class="min-w-0 flex-1">
                <p class="text-[16px] font-medium leading-tight truncate flex items-center gap-2">
                  {{ guestName(m.guest) }}
                  <span v-if="guestType(m.guest).toLowerCase() === 'vip'" class="shrink-0 px-1.5 py-0.5 rounded-[5px] bg-black text-white text-[10px] font-medium tracking-[0.08em]">VIP</span>
                </p>
                <p class="text-[12.5px] text-neutral-500 leading-tight truncate">
                  <span :class="m.via === 'code' ? 'text-black font-semibold' : ''">ID ···<span class="font-mono">{{ codeTail(m.guest) }}</span></span>
                  <template v-if="phoneTail(m.guest)"> · <span :class="m.via === 'phone' ? 'text-black font-semibold' : ''">WA ···{{ phoneTail(m.guest) }}</span></template>
                </p>
              </div>
              <span class="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium border" :class="matchChipClass(m.guest)">{{ matchChipLabel(m.guest) }}</span>
            </button>
            <p v-if="!candidates.length" class="text-[14px] text-neutral-500 px-1 pt-1">No guest ends with “{{ query }}”. Check the characters, or try the WhatsApp number.</p>
            <p v-else-if="candidates.length > 1" class="text-[12.5px] text-neutral-500 px-1">{{ candidates.length }} guests match. Tap the right one, or type more.</p>
          </template>
          <template v-else>
            <p class="text-[10.5px] uppercase tracking-[0.1em] text-neutral-500 px-1 shrink-0">Latest scans</p>
            <div
              v-for="entry in log.slice(0, 5)"
              :key="entry.key"
              class="shrink-0 flex items-center gap-3 px-3 h-[clamp(38px,6vh,48px)] rounded-[10px] bg-black/[0.03]"
            >
              <span class="size-2.5 rounded-full shrink-0" :class="logDot(entry.result)" />
              <p class="flex-1 min-w-0 text-[14px] truncate"><span class="font-medium">{{ entry.name || entry.code }}</span> <span class="text-neutral-500">· {{ logLabel(entry.result) }}</span></p>
              <span class="text-[12px] text-neutral-400 tabular-nums shrink-0">{{ formatTime(entry.at) }}</span>
            </div>
            <p v-if="!log.length" class="text-[14px] text-neutral-400 px-1 pt-1">No scans yet. Results land here instantly.</p>
          </template>
        </div>

        <!-- Last guest -->
        <div v-if="lastGuest" class="shrink-0 flex items-center gap-3 px-3 h-[46px] rounded-[12px] bg-black/[0.04]">
          <p class="flex-1 min-w-0 text-[13px] truncate">
            <span class="text-neutral-500">Last:</span> <span class="font-medium">{{ guestName(lastGuest) }}</span>
            <span class="text-neutral-500"> · {{ lastGuest.checked_in_at ? `in since ${formatTime(lastGuest.checked_in_at)}` : 'not inside' }}</span>
          </p>
          <button
            v-if="lastGuest.checked_in_at"
            type="button"
            @click="undoLast"
            class="h-[34px] px-3 rounded-[9px] border border-black/15 text-[13px] font-medium active:bg-black/10 cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Undo2 class="w-4 h-4" /> Undo
          </button>
        </div>

        <!-- On-screen keypad: the tablet's own keyboard would cover the matches -->
        <div v-if="!systemKeyboard" class="shrink-0 flex flex-col gap-1.5">
          <div v-for="(row, ri) in KEY_ROWS" :key="ri" class="flex gap-1.5 justify-center">
            <button
              v-for="k in row"
              :key="k"
              type="button"
              @pointerdown.prevent="press(k)"
              class="flex-1 max-w-[64px] h-[clamp(34px,6vh,50px)] rounded-[9px] border border-black/12 bg-white text-[17px] font-mono font-medium active:bg-black active:text-white cursor-pointer"
            >{{ k }}</button>
            <button
              v-if="ri === KEY_ROWS.length - 1"
              type="button"
              @pointerdown.prevent="backspace"
              class="flex-[1.6] max-w-[104px] h-[clamp(34px,6vh,50px)] rounded-[9px] border border-black/12 bg-neutral-100 flex items-center justify-center active:bg-black active:text-white cursor-pointer"
              title="Delete"
            ><Delete class="w-5 h-5" /></button>
          </div>
        </div>
        <button type="button" @click="toggleKeyboard" class="shrink-0 self-end text-[12px] text-neutral-500 underline underline-offset-2 cursor-pointer -mt-1">
          {{ systemKeyboard ? 'Use on-screen keypad' : 'Use tablet keyboard' }}
        </button>
      </div>
    </section>

    <!-- ============ Result: big, unmistakable, tap to dismiss ============ -->
    <Transition name="hud-result">
      <div
        v-if="result"
        class="absolute inset-0 z-20 rounded-[20px] flex flex-col items-center justify-center text-center px-8 cursor-pointer"
        :class="resultTheme.bg"
        @click="dismissResult"
      >
        <div class="size-24 rounded-full flex items-center justify-center mb-4 hud-pop" :class="resultTheme.iconWrap">
          <component :is="resultTheme.icon" class="w-12 h-12" />
        </div>
        <p class="text-[14px] uppercase tracking-[0.24em] opacity-80">{{ resultTheme.kicker }}</p>
        <p class="text-[clamp(30px,6vh,56px)] font-medium leading-tight mt-2 max-w-full truncate">{{ result.name || resultTheme.title }}</p>
        <p v-if="result.vip" class="mt-2 px-3 py-1 rounded-[8px] bg-black text-white text-[14px] font-medium tracking-[0.12em]">VIP</p>
        <p class="text-[17px] opacity-90 mt-3">{{ result.detail }}</p>
        <p v-if="result.tail" class="text-[14px] opacity-70 mt-1 font-mono tracking-[0.1em]">ID ···{{ result.tail }}</p>
        <div class="absolute bottom-0 left-0 h-[4px] bg-white/70 hud-countdown" :style="{ animationDuration: `${result.hold}ms` }" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  LogIn, LogOut, Volume2, VolumeX, Maximize2, Minimize2, ScanLine, KeyRound, CornerDownLeft, Camera,
  CircleCheck, TriangleAlert, OctagonX, DoorOpen, Undo2, X, Delete, Hourglass
} from 'lucide-vue-next';
import {
  type Submission, type CheckInResult, checkInCode, patchSubmission, guestName, guestType, accessId, initials,
  formatTime, normalizeStatus, findGuestsByShortCode, codeTail, phoneTail
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  pageIds: string[] | null;
  operator: string;
  /** On its own page (/hub/scanner): fullscreen covers the whole page. */
  standalone?: boolean;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'toast', msg: string): void;
}>();

/** How long a result stays up: a clean admit clears fast so the queue keeps moving; problems stay long enough to read. */
const HOLD_OK_MS = 1500;
const HOLD_PROBLEM_MS = 3200;

/** Letters and digits only: Access IDs use A–Z (no I/O) and 2–9; WhatsApp numbers use 0–9. */
const KEY_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

const mode = ref<'in' | 'out'>('in');
const codeInput = ref('');
const isChecking = ref(false);
const soundOn = ref(true);
const isFullscreen = ref(false);
const systemKeyboard = ref(false);

type ScanKind = CheckInResult | 'waitlisted' | 'declined' | 'error';
interface ScanResult { kind: ScanKind; name: string; detail: string; vip: boolean; tail: string; hold: number }
const result = ref<ScanResult | null>(null);
const lastGuestId = ref<string | null>(null);

interface LogEntry { key: string; code: string; name: string; result: ScanKind; at: string }
const log = ref<LogEntry[]>([]);

/* ---------- Stats ---------- */
const expectedRows = computed(() => props.rows.filter(r => !['declined', 'waitlisted'].includes(normalizeStatus(r.status))));
const expectedCount = computed(() => expectedRows.value.length);
const insideCount = computed(() => props.rows.filter(r => r.checked_in_at).length);
const arrivalRate = computed(() => (expectedCount.value ? Math.min(1, insideCount.value / expectedCount.value) : 0));
const recentArrivals = computed(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  return props.rows.filter(r => r.checked_in_at && new Date(r.checked_in_at).getTime() >= cutoff).length;
});

const lastGuest = computed(() => props.rows.find(r => r.id === lastGuestId.value) || null);

/* ---------- Lookup by short code ---------- */
const query = computed(() => codeInput.value.trim());
const candidates = computed(() => findGuestsByShortCode(props.rows, query.value, 12));

function matchChipLabel(g: Submission): string {
  const status = normalizeStatus(g.status);
  if (status === 'waitlisted') return 'Waitlisted';
  if (status === 'declined') return 'Declined';
  if (g.checked_in_at) return `In ${formatTime(g.checked_in_at)}`;
  return 'Not in';
}
function matchChipClass(g: Submission): string {
  const status = normalizeStatus(g.status);
  if (status === 'waitlisted' || status === 'declined') return 'bg-red-50 text-red-700 border-red-200';
  if (g.checked_in_at) return 'bg-amber-50 text-amber-800 border-amber-300';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
}

function press(key: string) {
  codeInput.value += key;
  inputRef.value?.focus();
}
function backspace() {
  codeInput.value = codeInput.value.slice(0, -1);
  inputRef.value?.focus();
}
function clearInput() {
  codeInput.value = '';
  inputRef.value?.focus();
}
function toggleKeyboard() {
  systemKeyboard.value = !systemKeyboard.value;
  nextTick(() => {
    inputRef.value?.blur();
    inputRef.value?.focus();
  });
}

/** Admit (or check out) the guest the door tapped: the server gets the full Access ID, never the short one. */
function admit(guest: Submission) {
  void submitCode(accessId(guest));
}

/**
 * Enter on the keypad or a handheld scanner (which types the whole Access ID and Enter).
 * One match: go. Several: the door must pick, unless what was typed is a whole Access ID.
 * None: ask the server anyway, in case the list on this tablet has not caught up yet.
 */
function onEnter() {
  const raw = query.value;
  if (!raw) return;
  const list = candidates.value;
  if (list.length === 1) return admit(list[0].guest);
  if (list.length > 1) {
    const typed = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const whole = list.find(m => accessId(m.guest).toUpperCase().replace(/[^A-Z0-9]/g, '') === typed);
    if (whole) return admit(whole.guest);
    emit('toast', `${list.length} guests match — tap the right one.`);
    return;
  }
  void submitCode(raw);
}

/* ---------- Result theming ---------- */
const resultTheme = computed(() => {
  switch (result.value?.kind) {
    case 'admitted':
      return { bg: 'bg-emerald-500 text-white', iconWrap: 'bg-white text-emerald-600', icon: CircleCheck, kicker: 'Access granted', title: 'Welcome' };
    case 'checked_out':
      return { bg: 'bg-neutral-800 text-white', iconWrap: 'bg-white text-black', icon: DoorOpen, kicker: 'Checked out', title: 'Goodbye' };
    case 'already':
      return { bg: 'bg-amber-500 text-black', iconWrap: 'bg-black text-amber-400', icon: TriangleAlert, kicker: 'Already inside', title: 'Pass already used' };
    case 'waitlisted':
      return { bg: 'bg-red-600 text-white', iconWrap: 'bg-white text-red-600', icon: Hourglass, kicker: 'Not admitted', title: 'On the waitlist' };
    case 'declined':
      return { bg: 'bg-red-600 text-white', iconWrap: 'bg-white text-red-600', icon: OctagonX, kicker: 'Not admitted', title: 'Declined' };
    default:
      return { bg: 'bg-red-600 text-white', iconWrap: 'bg-white text-red-600', icon: OctagonX, kicker: 'Access denied', title: 'Invalid pass' };
  }
});

const frameColor = computed(() => {
  switch (result.value?.kind) {
    case 'admitted': return 'border-emerald-400';
    case 'already': return 'border-amber-400';
    case 'invalid':
    case 'waitlisted':
    case 'declined':
    case 'error': return 'border-red-500';
    default: return 'border-white/80';
  }
});

function logDot(kind: ScanKind) {
  if (kind === 'admitted') return 'bg-emerald-500';
  if (kind === 'already') return 'bg-amber-500';
  if (kind === 'checked_out') return 'bg-neutral-400';
  return 'bg-red-500';
}
function logLabel(kind: ScanKind) {
  return { admitted: 'Admitted', already: 'Already in', checked_out: 'Checked out', invalid: 'Invalid pass', waitlisted: 'Waitlisted', declined: 'Declined', error: 'Network error' }[kind];
}

/* ---------- Core scan flow ---------- */
let resultTimer: ReturnType<typeof setTimeout> | null = null;
let lastScannedCode = '';
let lastScannedAt = 0;

async function submitCode(raw: string) {
  const code = raw.trim();
  if (!code || isChecking.value) return;
  // Cameras re-detect the same code many times per second — ignore repeats briefly.
  if (code === lastScannedCode && Date.now() - lastScannedAt < 3500) return;
  lastScannedCode = code;
  lastScannedAt = Date.now();

  isChecking.value = true;
  codeInput.value = '';
  try {
    const res = await checkInCode(code, props.pageIds, mode.value, props.operator);
    const guest = res.data || null;
    if (guest) {
      emit('updated', [guest]);
      lastGuestId.value = guest.id;
    }
    const kind = res.result as ScanKind;
    let detail = '';
    if (kind === 'admitted') detail = `Checked in at ${formatTime(guest?.checked_in_at)}`;
    else if (kind === 'already') detail = `First entry at ${formatTime(guest?.checked_in_at)}${guest?.checked_in_by ? ` · by ${guest.checked_in_by}` : ''}`;
    else if (kind === 'checked_out') detail = 'Guest has left the venue';
    else if (kind === 'waitlisted') detail = 'No place yet. Send them to the event team.';
    else if (kind === 'declined') detail = 'This registration was declined.';
    else detail = res.error || 'No pass matches this Access ID';
    showResult({
      kind,
      name: guest ? guestName(guest) : '',
      detail,
      vip: Boolean(guest && guestType(guest).toLowerCase() === 'vip'),
      tail: guest ? codeTail(guest) : '',
      hold: kind === 'admitted' || kind === 'checked_out' ? HOLD_OK_MS : HOLD_PROBLEM_MS
    }, code);
  } catch (err: any) {
    showResult({ kind: 'error', name: '', detail: err?.message || 'Could not reach the server', vip: false, tail: '', hold: HOLD_PROBLEM_MS }, code);
  } finally {
    isChecking.value = false;
    nextTick(() => inputRef.value?.focus());
  }
}

function showResult(r: ScanResult, code: string) {
  result.value = r;
  log.value.unshift({ key: `${Date.now()}-${Math.random()}`, code, name: r.name, result: r.kind, at: new Date().toISOString() });
  if (log.value.length > 60) log.value.length = 60;
  feedback(r.kind);
  if (resultTimer) clearTimeout(resultTimer);
  resultTimer = setTimeout(dismissResult, r.hold);
}

function dismissResult() {
  result.value = null;
  if (resultTimer) clearTimeout(resultTimer);
  nextTick(() => inputRef.value?.focus());
}

async function undoLast() {
  const g = lastGuest.value;
  if (!g) return;
  try {
    const updated = await patchSubmission(g.id, { checked_in: false });
    if (updated) emit('updated', [updated]);
    emit('toast', `Check-in undone for ${guestName(g)}.`);
  } catch (err: any) {
    emit('toast', `Couldn't undo: ${err?.message || 'network error'}`);
  }
}

/* ---------- Haptics & sound ---------- */
let audioCtx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, audioCtx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + dur);
  osc.connect(g).connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + start);
  osc.stop(audioCtx.currentTime + start + dur + 0.02);
}

function feedback(kind: ScanKind) {
  const vib = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch { /* unsupported */ } };
  if (kind === 'admitted' || kind === 'checked_out') vib(60);
  else vib([90, 60, 90]);
  if (!soundOn.value) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    if (kind === 'admitted' || kind === 'checked_out') {
      tone(880, 0, 0.09);
      tone(1320, 0.1, 0.14);
    } else if (kind === 'already') {
      tone(520, 0, 0.12, 'triangle');
      tone(520, 0.16, 0.12, 'triangle');
    } else {
      tone(180, 0, 0.32, 'square', 0.06);
    }
  } catch { /* audio unavailable */ }
}

/* ---------- Camera / QR ---------- */
const cameraOn = ref(false);
const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;
const cameraNote = computed(() => (cameraOn.value ? 'Point the camera at the pass QR' : 'USB / Bluetooth scanners work as they are'));

let stream: MediaStream | null = null;
let scanRaf = 0;
let lastDetectAt = 0;

/**
 * Reads one QR from the current video frame. Chromium's built-in
 * BarcodeDetector is used where it exists; every browser on iOS (Safari and
 * Chrome alike — Apple requires WebKit) and Firefox lack it, so those decode
 * in JavaScript with jsQR, loaded only when needed.
 */
type FrameDecoder = (video: HTMLVideoElement) => Promise<string | null>;
let decodeFrame: FrameDecoder | null = null;

async function createDecoder(): Promise<FrameDecoder> {
  if (hasBarcodeDetector) {
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code', 'code_128', 'code_39', 'ean_13'] });
    return async (video) => (await detector.detect(video))?.[0]?.rawValue || null;
  }
  const { default: jsQR } = await import('jsqr');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  return async (video) => {
    if (!ctx || !video.videoWidth) return null;
    // Downscale: a pass QR is large in frame, and full camera resolution makes
    // each decode slow on a phone.
    const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' })?.data || null;
  };
}

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    cameraOn.value = true;
    await nextTick();
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      await videoRef.value.play().catch(() => {});
    }
    decodeFrame = await createDecoder();
    scanLoop();
  } catch {
    emit('toast', 'Camera permission denied or unavailable on this device.');
    stopCamera();
  }
}

function scanLoop() {
  scanRaf = requestAnimationFrame(async () => {
    if (!cameraOn.value) return;
    const now = performance.now();
    if (decodeFrame && videoRef.value && videoRef.value.readyState >= 2 && !isChecking.value && !result.value && now - lastDetectAt > 220) {
      lastDetectAt = now;
      try {
        const value = await decodeFrame(videoRef.value);
        if (value) submitCode(extractCode(value));
      } catch { /* frame not ready */ }
    }
    scanLoop();
  });
}

/** QR payloads may be a URL like https://…/pass?id=XXXX — pull the ID out. */
function extractCode(raw: string): string {
  try {
    const url = new URL(raw);
    return url.searchParams.get('id') || url.searchParams.get('code') || url.pathname.split('/').filter(Boolean).pop() || raw;
  } catch {
    return raw;
  }
}

function stopCamera() {
  cameraOn.value = false;
  cancelAnimationFrame(scanRaf);
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
}

/* ---------- Fullscreen door mode ---------- */
async function toggleFullscreen() {
  try {
    const target = props.standalone ? document.documentElement : rootRef.value;
    if (!document.fullscreenElement) await target?.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    // iPhone browsers have no fullscreen API; "Add to Home Screen" opens the page without browser bars.
    emit('toast', props.standalone ? 'Fullscreen is not available here — on iPad/iPhone, use Share → Add to Home Screen.' : 'Fullscreen is not available in this browser.');
  }
}
function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
  nextTick(() => inputRef.value?.focus());
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
  nextTick(() => inputRef.value?.focus());
});

onUnmounted(() => {
  stopCamera();
  if (resultTimer) clearTimeout(resultTimer);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  audioCtx?.close().catch(() => {});
});
</script>

<style scoped>
.hud-grid {
  background-image: linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px);
  background-size: 22px 22px;
}

.hud-corner {
  position: absolute;
  width: 38px;
  height: 38px;
  transition: border-color 0.2s ease;
}

.hud-scanline {
  position: absolute;
  left: 4%;
  right: 4%;
  height: 2px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent);
  box-shadow: 0 0 18px 4px rgba(255,255,255,0.35);
  animation: hud-sweep 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes hud-sweep {
  0% { top: 4%; opacity: 0; }
  10% { opacity: 1; }
  50% { top: 94%; }
  90% { opacity: 1; }
  100% { top: 4%; opacity: 0; }
}

.hud-pop { animation: hud-pop 0.36s cubic-bezier(0.2, 1.4, 0.4, 1); }
@keyframes hud-pop {
  0% { transform: scale(0.4); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.hud-countdown {
  width: 100%;
  animation-name: hud-countdown;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
}
@keyframes hud-countdown {
  from { width: 100%; }
  to { width: 0%; }
}

.hud-result-enter-active { transition: opacity 0.12s ease, transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.hud-result-leave-active { transition: opacity 0.16s ease; }
.hud-result-enter-from { opacity: 0; transform: scale(1.03); }
.hud-result-leave-to { opacity: 0; }
</style>
