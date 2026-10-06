<template>
  <div ref="rootRef" class="w-full grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-5 font-707" :class="isFullscreen ? 'bg-white p-4 md:p-6 h-full overflow-y-auto' : ''">
    <!-- ============ Scanner Console (dark HUD) ============ -->
    <div class="rounded-[22px] bg-[#0c0d0e] text-white border border-[#2c2f35] shadow-[0_30px_80px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col">
      <!-- Console bar -->
      <div class="flex items-center justify-between gap-3 px-4 md:px-5 h-[54px] border-b border-white/10 select-none">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="relative flex size-2">
            <span class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span class="relative inline-flex rounded-full size-2 bg-emerald-400" />
          </span>
          <span class="text-[11px] uppercase tracking-[0.2em] text-white/70 truncate">Door Console</span>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Mode toggle -->
          <div class="flex items-center p-0.5 rounded-[9px] bg-white/[0.06] border border-white/10 text-[11px]">
            <button
              id="scanner-mode-in"
              type="button"
              @click="mode = 'in'"
              class="px-2.5 h-[26px] rounded-[7px] cursor-pointer transition-all flex items-center gap-1"
              :class="mode === 'in' ? 'bg-white text-black font-medium' : 'text-white/60 hover:text-white'"
            >
              <LogIn class="w-3 h-3" /> Check-in
            </button>
            <button
              id="scanner-mode-out"
              type="button"
              @click="mode = 'out'"
              class="px-2.5 h-[26px] rounded-[7px] cursor-pointer transition-all flex items-center gap-1"
              :class="mode === 'out' ? 'bg-white text-black font-medium' : 'text-white/60 hover:text-white'"
            >
              <LogOut class="w-3 h-3" /> Check-out
            </button>
          </div>

          <button
            type="button"
            @click="soundOn = !soundOn"
            class="size-[30px] rounded-[8px] hover:bg-white/10 flex items-center justify-center cursor-pointer text-white/70 hover:text-white"
            :title="soundOn ? 'Mute scan sounds' : 'Enable scan sounds'"
          >
            <Volume2 v-if="soundOn" class="w-4 h-4" />
            <VolumeX v-else class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="toggleFullscreen"
            class="size-[30px] rounded-[8px] hover:bg-white/10 flex items-center justify-center cursor-pointer text-white/70 hover:text-white"
            :title="isFullscreen ? 'Exit door mode' : 'Door mode (fullscreen)'"
          >
            <Minimize2 v-if="isFullscreen" class="w-4 h-4" />
            <Maximize2 v-else class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Viewfinder -->
      <div class="relative mx-4 md:mx-5 mt-4 md:mt-5 rounded-[16px] overflow-hidden bg-[#050506] border border-white/10 aspect-[4/3] sm:aspect-[16/10]">
        <video v-show="cameraOn" ref="videoRef" class="absolute inset-0 size-full object-cover" playsinline muted />
        <div v-if="!cameraOn" class="absolute inset-0 hud-grid opacity-[0.08]" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />

        <!-- Target frame -->
        <div class="absolute inset-[14%] pointer-events-none">
          <span class="hud-corner top-0 left-0 border-t-2 border-l-2 rounded-tl-[14px]" :class="frameColor" />
          <span class="hud-corner top-0 right-0 border-t-2 border-r-2 rounded-tr-[14px]" :class="frameColor" />
          <span class="hud-corner bottom-0 left-0 border-b-2 border-l-2 rounded-bl-[14px]" :class="frameColor" />
          <span class="hud-corner bottom-0 right-0 border-b-2 border-r-2 rounded-br-[14px]" :class="frameColor" />
          <div v-if="!result && !isChecking" class="hud-scanline" />
        </div>

        <!-- Idle copy -->
        <div v-if="!cameraOn && !result" class="absolute inset-0 flex flex-col items-center justify-center text-center px-8 pointer-events-none">
          <ScanLine class="w-8 h-8 text-white/40 mb-3" />
          <p class="text-[13px] text-white/80 font-medium">Ready to scan</p>
          <p class="text-[11.5px] text-white/40 mt-1 max-w-[280px]">Use a handheld scanner, the camera, or type the guest's Access ID below.</p>
        </div>

        <!-- Checking -->
        <div v-if="isChecking" class="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div class="size-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>

        <!-- Result flash -->
        <Transition name="hud-result">
          <div
            v-if="result"
            class="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
            :class="resultTheme.bg"
            @click="dismissResult"
          >
            <div class="size-16 rounded-full flex items-center justify-center mb-3 hud-pop" :class="resultTheme.iconWrap">
              <component :is="resultTheme.icon" class="w-8 h-8" />
            </div>
            <p class="text-[11px] uppercase tracking-[0.22em] opacity-80">{{ resultTheme.kicker }}</p>
            <p class="text-[22px] md:text-[26px] font-medium leading-tight mt-1 max-w-full truncate">{{ result.name || resultTheme.title }}</p>
            <p class="text-[12px] opacity-80 mt-1.5">{{ result.detail }}</p>
            <div class="absolute bottom-0 left-0 h-[3px] bg-white/70 hud-countdown" :style="{ animationDuration: `${RESULT_HOLD_MS}ms` }" />
          </div>
        </Transition>

        <!-- Camera chip -->
        <div class="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-[0.14em] text-white/70 pointer-events-none">
          <span class="size-1.5 rounded-full" :class="cameraOn ? 'bg-red-500 animate-pulse' : 'bg-white/30'" />
          {{ cameraOn ? 'Camera live' : 'Manual / handheld' }}
        </div>
      </div>

      <!-- Manual entry -->
      <form class="px-4 md:px-5 pt-4 pb-4 md:pb-5 flex flex-col gap-3" @submit.prevent="submitCode(codeInput)">
        <div class="flex items-stretch gap-2">
          <div class="relative flex-1">
            <KeyRound class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              id="scanner-access-input"
              ref="inputRef"
              v-model="codeInput"
              type="text"
              inputmode="text"
              autocomplete="off"
              autocapitalize="characters"
              spellcheck="false"
              placeholder="ACCESS ID · e.g. 061026-1045-K7QZ"
              class="w-full h-[52px] pl-10 pr-3 rounded-[12px] bg-white/[0.06] border border-white/12 text-[16px] md:text-[17px] font-mono tracking-[0.08em] uppercase text-white placeholder:text-white/30 placeholder:tracking-[0.04em] outline-none focus:border-white/50 focus:bg-white/[0.09] transition-all"
            />
          </div>
          <button
            id="scanner-submit-btn"
            type="submit"
            :disabled="!codeInput.trim() || isChecking"
            class="h-[52px] px-5 rounded-[12px] bg-white text-black text-[13px] font-medium flex items-center gap-2 cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-default"
          >
            {{ mode === 'in' ? 'Admit' : 'Check out' }}
            <CornerDownLeft class="w-4 h-4" />
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            @click="cameraOn ? stopCamera() : startCamera()"
            class="h-[34px] px-3 rounded-[9px] border border-white/15 text-[12px] flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <Camera class="w-4 h-4" />
            {{ cameraOn ? 'Stop camera' : 'Scan with camera' }}
          </button>
          <p class="text-[11px] text-white/40">{{ cameraNote }}</p>
        </div>
      </form>
    </div>

    <!-- ============ Live stats & activity ============ -->
    <div class="flex flex-col gap-5 min-w-0">
      <!-- Capacity -->
      <div class="rounded-[18px] border border-black/10 bg-white p-5 flex items-center gap-5">
        <div class="relative size-[112px] shrink-0">
          <svg viewBox="0 0 120 120" class="size-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="10" />
            <circle
              cx="60" cy="60" r="52" fill="none" stroke="#000" stroke-width="10" stroke-linecap="round"
              :stroke-dasharray="RING_C"
              :stroke-dashoffset="RING_C * (1 - arrivalRate)"
              class="transition-[stroke-dashoffset] duration-700 ease-out"
            />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[24px] font-medium tabular-nums leading-none">{{ Math.round(arrivalRate * 100) }}%</span>
            <span class="text-[10px] uppercase tracking-[0.14em] text-neutral-500 mt-1">Arrived</span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3 flex-1 min-w-0">
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Inside</p>
            <p class="text-[26px] font-medium tabular-nums leading-tight">{{ insideCount }}</p>
          </div>
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Expected</p>
            <p class="text-[26px] font-medium tabular-nums leading-tight text-neutral-400">{{ expectedCount }}</p>
          </div>
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Remaining</p>
            <p class="text-[15px] font-medium tabular-nums">{{ Math.max(0, expectedCount - insideCount) }}</p>
          </div>
          <div>
            <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Last 15 min</p>
            <p class="text-[15px] font-medium tabular-nums">+{{ recentArrivals }}</p>
          </div>
        </div>
      </div>

      <!-- Last guest detail -->
      <div class="rounded-[18px] border border-black/10 bg-white p-5">
        <div class="flex items-center justify-between mb-3">
          <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Last scanned guest</p>
          <span v-if="lastGuest" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border" :class="statusBadgeClass(lastGuest.status)">
            <span class="size-1.5 rounded-full" :class="statusDotClass(lastGuest.status)" />
            {{ statusLabel(lastGuest.status) }}
          </span>
        </div>
        <div v-if="lastGuest" class="flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <div class="size-11 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[13px] font-medium">{{ initials(guestName(lastGuest)) }}</div>
            <div class="min-w-0">
              <p class="text-[15px] font-medium truncate flex items-center gap-2">
                {{ guestName(lastGuest) }}
                <span v-if="guestType(lastGuest).toLowerCase() === 'vip'" class="shrink-0 px-1.5 py-0.5 rounded-[5px] bg-black text-white text-[10px] font-medium tracking-[0.08em]">VIP</span>
              </p>
              <p class="text-[11.5px] text-neutral-500 font-mono truncate">{{ accessId(lastGuest) }}</p>
            </div>
          </div>
          <div v-if="lastGuestFields.length" class="grid grid-cols-2 gap-2">
            <div v-for="f in lastGuestFields" :key="f.key" class="rounded-[10px] bg-black/[0.03] border border-black/5 px-3 py-2 min-w-0">
              <p class="text-[10px] text-neutral-500 truncate">{{ f.key }}</p>
              <p class="text-[12.5px] font-medium truncate">{{ f.value }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <button
              type="button"
              @click="undoLast"
              v-if="lastGuest.checked_in_at"
              class="h-[32px] px-3 rounded-[8px] border border-black/15 text-[11.5px] font-medium hover:bg-black/5 cursor-pointer flex items-center gap-1.5"
            >
              <Undo2 class="w-3.5 h-3.5" /> Undo check-in
            </button>
            <span class="text-[11px] text-neutral-500 tabular-nums">{{ lastGuest.checked_in_at ? `In since ${formatTime(lastGuest.checked_in_at)}` : 'Not inside' }}</span>
          </div>
        </div>
        <p v-else class="text-[12px] text-neutral-400 py-4">Scan a pass to see guest details here.</p>
      </div>

      <!-- Activity log -->
      <div class="rounded-[18px] border border-black/10 bg-white overflow-hidden flex flex-col min-h-[180px]">
        <div class="flex items-center justify-between px-5 pt-4 pb-3">
          <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Door activity</p>
          <span class="text-[11px] text-neutral-400 tabular-nums">{{ log.length }} scans this session</span>
        </div>
        <div class="divide-y divide-black/5 max-h-[280px] overflow-y-auto">
          <TransitionGroup name="hud-log">
            <div v-for="entry in log" :key="entry.key" class="flex items-center gap-3 px-5 py-2.5">
              <span class="size-2 rounded-full shrink-0" :class="logDot(entry.result)" />
              <div class="flex-1 min-w-0">
                <p class="text-[12.5px] truncate"><span class="font-medium">{{ entry.name || entry.code }}</span></p>
                <p class="text-[10.5px] text-neutral-500 truncate">{{ logLabel(entry.result) }} · <span class="font-mono">{{ entry.code }}</span></p>
              </div>
              <span class="text-[10.5px] text-neutral-400 tabular-nums shrink-0">{{ formatTime(entry.at) }}</span>
            </div>
          </TransitionGroup>
          <p v-if="!log.length" class="px-5 py-6 text-[12px] text-neutral-400">No scans yet. Results land here instantly.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import {
  LogIn, LogOut, Volume2, VolumeX, Maximize2, Minimize2, ScanLine, KeyRound, CornerDownLeft, Camera,
  CircleCheck, TriangleAlert, OctagonX, DoorOpen, Undo2
} from 'lucide-vue-next';
import {
  type Submission, type CheckInResult, checkInCode, patchSubmission, guestName, guestType, accessId, initials, customFieldKeys,
  formatValue, formatTime, statusBadgeClass, statusDotClass, statusLabel, normalizeStatus
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  pageIds: string[] | null;
  operator: string;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'toast', msg: string): void;
}>();

const RESULT_HOLD_MS = 2600;
const RING_C = 2 * Math.PI * 52;

const rootRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);

const mode = ref<'in' | 'out'>('in');
const codeInput = ref('');
const isChecking = ref(false);
const soundOn = ref(true);
const isFullscreen = ref(false);

interface ScanResult { kind: CheckInResult | 'error'; name: string; detail: string }
const result = ref<ScanResult | null>(null);
const lastGuestId = ref<string | null>(null);

interface LogEntry { key: string; code: string; name: string; result: CheckInResult | 'error'; at: string }
const log = ref<LogEntry[]>([]);

/* ---------- Stats ---------- */
const expectedRows = computed(() => props.rows.filter(r => normalizeStatus(r.status) !== 'declined'));
const expectedCount = computed(() => expectedRows.value.length);
const insideCount = computed(() => props.rows.filter(r => r.checked_in_at).length);
const arrivalRate = computed(() => (expectedCount.value ? Math.min(1, insideCount.value / expectedCount.value) : 0));
const recentArrivals = computed(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  return props.rows.filter(r => r.checked_in_at && new Date(r.checked_in_at).getTime() >= cutoff).length;
});

const lastGuest = computed(() => props.rows.find(r => r.id === lastGuestId.value) || null);
const lastGuestFields = computed(() => {
  if (!lastGuest.value) return [];
  return customFieldKeys([lastGuest.value])
    .slice(0, 4)
    .map(k => ({ key: k, value: formatValue(lastGuest.value!.form_data?.[k]) }))
    .filter(f => f.value);
});

/* ---------- Result theming ---------- */
const resultTheme = computed(() => {
  switch (result.value?.kind) {
    case 'admitted':
      return { bg: 'bg-emerald-500/95 text-white', iconWrap: 'bg-white text-emerald-600', icon: CircleCheck, kicker: 'Access granted', title: 'Welcome' };
    case 'checked_out':
      return { bg: 'bg-neutral-800/95 text-white', iconWrap: 'bg-white text-black', icon: DoorOpen, kicker: 'Checked out', title: 'Goodbye' };
    case 'already':
      return { bg: 'bg-amber-500/95 text-black', iconWrap: 'bg-black text-amber-400', icon: TriangleAlert, kicker: 'Already inside', title: 'Pass already used' };
    default:
      return { bg: 'bg-red-600/95 text-white', iconWrap: 'bg-white text-red-600', icon: OctagonX, kicker: 'Access denied', title: 'Invalid pass' };
  }
});

const frameColor = computed(() => {
  switch (result.value?.kind) {
    case 'admitted': return 'border-emerald-400';
    case 'already': return 'border-amber-400';
    case 'invalid':
    case 'error': return 'border-red-500';
    default: return 'border-white/80';
  }
});

function logDot(kind: LogEntry['result']) {
  if (kind === 'admitted') return 'bg-emerald-500';
  if (kind === 'already') return 'bg-amber-500';
  if (kind === 'checked_out') return 'bg-neutral-400';
  return 'bg-red-500';
}
function logLabel(kind: LogEntry['result']) {
  return { admitted: 'Admitted', already: 'Duplicate scan', checked_out: 'Checked out', invalid: 'Invalid pass', error: 'Network error' }[kind];
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
    const name = guest ? guestName(guest) : '';
    let detail = '';
    if (res.result === 'admitted') detail = `Checked in at ${formatTime(guest?.checked_in_at)}`;
    else if (res.result === 'already') detail = `First entry at ${formatTime(guest?.checked_in_at)}${guest?.checked_in_by ? ` · by ${guest.checked_in_by}` : ''}`;
    else if (res.result === 'checked_out') detail = 'Guest has left the venue';
    else detail = res.error || 'No pass matches this Access ID';
    showResult({ kind: res.result, name, detail }, code);
  } catch (err: any) {
    showResult({ kind: 'error', name: '', detail: err?.message || 'Could not reach the server' }, code);
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
  resultTimer = setTimeout(dismissResult, RESULT_HOLD_MS);
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

function feedback(kind: ScanResult['kind']) {
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
const cameraNote = computed(() => {
  if (cameraOn.value) return 'Point the camera at the pass QR';
  return 'Handheld USB/Bluetooth scanners work out of the box';
});

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
    if (!document.fullscreenElement) await rootRef.value?.requestFullscreen();
    else await document.exitFullscreen();
  } catch {
    emit('toast', 'Fullscreen is not available in this browser.');
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
  width: 34px;
  height: 34px;
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

.hud-pop { animation: hud-pop 0.42s cubic-bezier(0.2, 1.4, 0.4, 1); }
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

.hud-result-enter-active { transition: opacity 0.16s ease, transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1.2); }
.hud-result-leave-active { transition: opacity 0.22s ease; }
.hud-result-enter-from { opacity: 0; transform: scale(1.04); }
.hud-result-leave-to { opacity: 0; }

.hud-log-enter-active { transition: all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1); }
.hud-log-enter-from { opacity: 0; transform: translateY(-8px); background: rgba(0,0,0,0.04); }
</style>
