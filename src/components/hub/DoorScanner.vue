<template>
  <!--
    One screen, no scrolling, for a 10" tablet held landscape at the door.
    SCAN: camera left; right, the counts, the lookup (last 4 of the Access ID or the
    WhatsApp number), matches and a big on-screen keypad. A complete code opens a
    full-screen confirmation with the guest's details; nobody is admitted until the
    door confirms it is the right person.
    LOG: everyone checked in, newest first, each with a way to cancel a wrong admit.
  -->
  <div
    ref="rootRef"
    class="relative h-full w-full min-h-0 font-707 touch-manipulation select-none"
  >
    <!-- ============ SCAN ============ -->
    <div
      v-show="view === 'scan'"
      class="h-full w-full min-h-0 grid gap-3 landscape:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] portrait:grid-rows-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
    >
      <!-- Camera panel -->
      <section class="min-h-0 rounded-[16px] bg-editor-bg text-white border border-editor-border overflow-hidden flex flex-col">
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

        <div class="relative flex-1 min-h-0 bg-black overflow-hidden">
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
            <span class="size-1.5 rounded-full" :class="cameraOn ? 'bg-oxblood-300 animate-pulse' : 'bg-white/30'" />
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

      <!-- Counts, lookup, matches, keypad -->
      <section class="min-h-0 flex flex-col gap-2">
        <!-- Counts: small, one line, nothing else -->
        <div class="shrink-0 flex items-baseline justify-between gap-4 px-1 h-[28px]">
          <p v-for="stat in stats" :key="stat.label" class="flex items-baseline gap-1.5 min-w-0">
            <span class="text-[10.5px] uppercase tracking-[0.1em] text-neutral-500 whitespace-nowrap">{{ stat.label }}</span>
            <span class="text-[17px] leading-none font-medium tabular-nums" :class="stat.muted ? 'text-neutral-400' : 'text-black'">{{ stat.value }}</span>
          </p>
        </div>

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
                class="w-full h-[52px] pl-11 pr-11 rounded-[12px] bg-black/[0.04] border border-black/15 text-[24px] font-medium font-mono tracking-[0.12em] uppercase text-black placeholder:text-neutral-400 placeholder:text-[14px] placeholder:tracking-normal placeholder:font-normal placeholder:normal-case outline-none focus:border-black focus:bg-white transition-colors"
              />
              <button v-if="codeInput" type="button" @pointerdown.prevent="clearInput" class="absolute right-2 top-1/2 -translate-y-1/2 size-[36px] rounded-[9px] active:bg-black/10 flex items-center justify-center cursor-pointer text-neutral-500" title="Clear">
                <X class="w-5 h-5" />
              </button>
            </div>
          </form>

          <!-- Matches -->
          <div class="flex-1 min-h-0 overflow-hidden flex flex-col gap-1.5">
            <template v-if="query.length >= 3">
              <button
                v-for="m in candidates"
                :key="m.guest.id"
                type="button"
                @click="openConfirm(m.guest)"
                class="shrink-0 w-full flex items-center gap-3 px-3 h-[clamp(46px,7.4vh,60px)] rounded-[12px] border border-black/10 text-left cursor-pointer active:bg-black/10 transition-colors"
              >
                <div class="size-9 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[12px] font-medium shrink-0">{{ initials(guestName(m.guest)) }}</div>
                <div class="min-w-0 flex-1">
                  <p class="text-[16px] font-medium leading-tight truncate flex items-center gap-2">
                    {{ guestName(m.guest) }}
                    <span v-if="isVip(m.guest)" class="shrink-0 px-1.5 py-0.5 rounded-[5px] bg-black text-white text-[10px] font-medium tracking-[0.08em]">VIP</span>
                  </p>
                  <p class="text-[12.5px] text-neutral-500 leading-tight truncate">
                    <span :class="m.via === 'code' ? 'text-black font-semibold' : ''">ID ···<span class="font-mono">{{ codeTail(m.guest) }}</span></span>
                    <template v-if="phoneTail(m.guest)"> · <span :class="m.via === 'phone' ? 'text-black font-semibold' : ''">WA ···{{ phoneTail(m.guest) }}</span></template>
                  </p>
                </div>
                <span class="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium border" :class="matchChipClass(m.guest)">{{ matchChipLabel(m.guest) }}</span>
              </button>
              <p v-if="!candidates.length" class="text-[14px] text-neutral-500 px-1 pt-1">No guest ends with “{{ query }}”. Check the characters, or try the WhatsApp number.</p>
              <p v-else-if="candidates.length > 1" class="text-[12.5px] text-neutral-500 px-1">{{ candidates.length }} guests share this ending. Tap the right one, or type more.</p>
            </template>
            <p v-else class="text-[14px] text-neutral-400 px-1 pt-1 leading-snug">Type the last 4 characters of the Access ID, or the last 4 digits of the WhatsApp number. The guest opens on their own.</p>
          </div>

          <!-- Keypad: big flat tiles, tight gaps -->
          <div v-if="!systemKeyboard" class="shrink-0 grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
            <template v-for="(row, ri) in KEY_ROWS" :key="ri">
              <button
                v-for="(k, ki) in row"
                :key="k"
                type="button"
                @pointerdown.prevent="press(k)"
                class="col-span-2 h-[clamp(48px,9vh,72px)] rounded-[8px] bg-black/[0.05] text-[clamp(20px,3.6vh,28px)] font-medium font-mono active:bg-black active:text-white cursor-pointer"
                :class="ki === 0 ? KEY_ROW_START[ri] : ''"
              >{{ k }}</button>
              <button
                v-if="ri === KEY_ROWS.length - 1"
                type="button"
                @pointerdown.prevent="backspace"
                class="col-span-3 h-[clamp(48px,9vh,72px)] rounded-[8px] bg-black/[0.09] flex items-center justify-center active:bg-black active:text-white cursor-pointer"
                title="Delete"
              ><Delete class="w-6 h-6" /></button>
            </template>
          </div>
          <button type="button" @click="toggleKeyboard" class="shrink-0 self-end text-[12px] text-neutral-500 underline underline-offset-2 cursor-pointer -mt-1">
            {{ systemKeyboard ? 'Use on-screen keypad' : 'Use tablet keyboard' }}
          </button>
        </div>
      </section>
    </div>

    <!-- ============ LOG ============ -->
    <section v-if="view === 'log'" class="h-full w-full min-h-0 rounded-[16px] border border-black/10 bg-white flex flex-col overflow-hidden">
      <div class="flex items-center gap-3 px-4 h-[64px] shrink-0 border-b border-black/10">
        <div class="min-w-0">
          <p class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500 leading-none">Check-in log</p>
          <p class="text-[20px] font-medium leading-tight tabular-nums">{{ loggedIn.length }} <span class="text-[13px] text-neutral-500 font-normal">guests inside</span></p>
        </div>
        <div class="relative flex-1 max-w-[420px] ml-auto">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            v-model="logQuery"
            type="text"
            autocomplete="off"
            placeholder="Search name, code or WhatsApp"
            class="w-full h-[42px] pl-9 pr-9 rounded-[10px] bg-black/[0.04] border border-black/15 text-[14px] outline-none focus:border-black focus:bg-white transition-colors"
          />
          <button v-if="logQuery" type="button" @click="logQuery = ''" class="absolute right-1.5 top-1/2 -translate-y-1/2 size-[30px] rounded-[8px] active:bg-black/10 flex items-center justify-center cursor-pointer text-neutral-500"><X class="w-4 h-4" /></button>
        </div>
      </div>

      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain divide-y divide-black/5">
        <div v-for="g in visibleLog" :key="g.id" class="flex items-center gap-4 px-4 h-[68px]">
          <div class="size-10 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center text-[13px] font-medium shrink-0">{{ initials(guestName(g)) }}</div>
          <div class="min-w-0 flex-1">
            <p class="text-[17px] font-medium leading-tight truncate flex items-center gap-2">
              {{ guestName(g) }}
              <span v-if="isVip(g)" class="shrink-0 px-1.5 py-0.5 rounded-[5px] bg-black text-white text-[10px] font-medium tracking-[0.08em]">VIP</span>
            </p>
            <p class="text-[13px] text-neutral-500 leading-tight truncate">
              ID ···<span class="font-mono">{{ codeTail(g) }}</span>
              <template v-if="phoneTail(g)"> · WA ···{{ phoneTail(g) }}</template>
              · in at {{ formatTime(g.checked_in_at) }}<template v-if="g.checked_in_by"> · by {{ g.checked_in_by }}</template>
            </p>
          </div>
          <template v-if="cancelArmed === g.id">
            <button type="button" @click="cancelArmed = null" class="h-[44px] px-4 rounded-[10px] border border-black/15 text-[14px] font-medium active:bg-black/10 cursor-pointer">Keep</button>
            <button type="button" @click="cancelEntry(g)" class="h-[44px] px-4 rounded-[10px] bg-oxblood-700 text-white text-[14px] font-medium active:bg-oxblood-800 cursor-pointer">Yes, cancel entry</button>
          </template>
          <button v-else type="button" @click="armCancel(g.id)" class="h-[44px] px-4 rounded-[10px] border border-black/15 text-[14px] font-medium active:bg-black/10 cursor-pointer flex items-center gap-2">
            <Undo2 class="w-4 h-4" /> Cancel entry
          </button>
        </div>
        <p v-if="!visibleLog.length" class="px-4 py-10 text-[14px] text-neutral-400 text-center">{{ logQuery ? 'Nobody in the log matches.' : 'Nobody has been checked in yet.' }}</p>
      </div>
    </section>

    <!-- ============ Confirm the guest (nobody is admitted before this) ============ -->
    <Transition name="hud-result">
      <div v-if="pending" class="absolute inset-0 z-20 rounded-[16px] bg-white border border-black/10 flex flex-col">
        <div class="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-8 gap-1.5">
          <p class="text-[12px] uppercase tracking-[0.22em] text-neutral-500">{{ mode === 'in' ? 'Is this the guest?' : 'Check this guest out?' }}</p>
          <p class="text-[clamp(32px,7vh,60px)] font-medium leading-tight max-w-full truncate">{{ guestName(pending) }}</p>
          <p v-if="isVip(pending)" class="px-3 py-1 rounded-[8px] bg-black text-white text-[13px] font-medium tracking-[0.12em]">VIP</p>

          <dl class="mt-3 grid grid-cols-2 gap-x-10 gap-y-3 text-left max-w-[640px] w-full">
            <div>
              <dt class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Access ID</dt>
              <dd class="text-[20px] font-medium font-mono tracking-[0.06em]">···{{ codeTail(pending) }}</dd>
            </div>
            <div v-if="phoneTail(pending)">
              <dt class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">WhatsApp</dt>
              <dd class="text-[20px] font-medium font-mono tracking-[0.06em]">···{{ phoneTail(pending) }}</dd>
            </div>
            <div v-if="guestEmail(pending)">
              <dt class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Email</dt>
              <dd class="text-[16px] truncate">{{ maskEmail(guestEmail(pending)) }}</dd>
            </div>
            <div v-if="guestType(pending)">
              <dt class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Pass</dt>
              <dd class="text-[16px]">{{ guestType(pending) }}</dd>
            </div>
            <div v-if="pendingSessions" class="col-span-2">
              <dt class="text-[10.5px] uppercase tracking-[0.12em] text-neutral-500">Access valid for</dt>
              <dd class="text-[16px]">{{ pendingSessions }}</dd>
            </div>
          </dl>

          <p v-if="pendingProblem" class="mt-4 px-4 py-2.5 rounded-[10px] text-[14px] font-medium max-w-[640px] w-full" :class="pendingProblem.class">{{ pendingProblem.text }}</p>
        </div>

        <div class="shrink-0 flex items-stretch gap-3 p-4 border-t border-black/10">
          <button type="button" @click="cancelConfirm" class="flex-1 h-[68px] rounded-[14px] border border-black/20 text-[18px] font-medium active:bg-black/10 cursor-pointer">Not this guest</button>
          <button
            type="button"
            :disabled="Boolean(pendingProblem) || isChecking"
            @click="confirmPending"
            class="flex-[1.6] h-[68px] rounded-[14px] bg-black text-white text-[20px] font-medium active:bg-neutral-700 cursor-pointer disabled:opacity-30 disabled:cursor-default flex items-center justify-center gap-2.5"
          >
            <component :is="mode === 'in' ? LogIn : LogOut" class="w-6 h-6" />
            {{ mode === 'in' ? 'Admit' : 'Check out' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- ============ Result: big, unmistakable, tap to dismiss ============ -->
    <Transition name="hud-result">
      <div
        v-if="result"
        class="absolute inset-0 z-30 rounded-[16px] flex flex-col items-center justify-center text-center px-8 cursor-pointer"
        :class="resultTheme.bg"
        @click="dismissResult"
      >
        <div class="size-24 rounded-full flex items-center justify-center mb-4 hud-pop" :class="resultTheme.iconWrap">
          <component :is="resultTheme.icon" class="w-12 h-12" />
        </div>
        <p class="text-[14px] uppercase tracking-[0.24em] opacity-80">{{ resultTheme.kicker }}</p>
        <p class="text-[clamp(30px,6vh,56px)] font-medium leading-tight mt-2 max-w-full truncate">{{ result.name || resultTheme.title }}</p>
        <p v-if="result.vip" class="mt-2 px-3 py-1 rounded-[8px] bg-white text-black text-[14px] font-medium tracking-[0.12em]">VIP</p>
        <p class="text-[17px] opacity-90 mt-3">{{ result.detail }}</p>
        <p v-if="result.tail" class="text-[14px] opacity-70 mt-1 font-mono tracking-[0.1em]">ID ···{{ result.tail }}</p>
        <div class="absolute bottom-0 left-0 h-[4px] bg-white/70 hud-countdown" :style="{ animationDuration: `${result.hold}ms` }" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import {
  LogIn, LogOut, Volume2, VolumeX, Maximize2, Minimize2, ScanLine, KeyRound, Camera,
  CircleCheck, TriangleAlert, OctagonX, DoorOpen, Undo2, X, Delete, Hourglass, Search
} from 'lucide-vue-next';
import {
  type Submission, type CheckInResult, checkInCode, patchSubmission, guestName, guestType, guestEmail, accessId, initials,
  formatTime, formatValue, normalizeStatus, findGuestsByShortCode, codeTail, phoneTail, maskEmail
} from './hubUtils.ts';

const props = defineProps<{
  rows: Submission[];
  pageIds: string[] | null;
  operator: string;
  /** 'scan' is the door; 'log' lists who is inside, with a way to cancel a wrong admit. */
  view: 'scan' | 'log';
  /** On its own page (/hub/scanner): fullscreen covers the whole page. */
  standalone?: boolean;
}>();

const emit = defineEmits<{
  (e: 'updated', rows: Submission[]): void;
  (e: 'toast', msg: string): void;
}>();

/** How long a result stays up: a clean admit clears fast so the queue keeps moving; problems stay long enough to read. */
const HOLD_OK_MS = 1400;
const HOLD_PROBLEM_MS = 3200;

/** Letters and digits only: Access IDs use A–Z (no I/O) and 2–9; WhatsApp numbers use 0–9. */
const KEY_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];
/** Row offsets on the 20-column key grid: the home row sits half a key in, the bottom row one and a half. */
const KEY_ROW_START = ['', '', 'col-start-2', 'col-start-4'];

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

/** The guest the door is looking at, before anyone is admitted. */
const pending = ref<Submission | null>(null);

/* ---------- Stats ---------- */
const expectedCount = computed(() => props.rows.filter(r => !['declined', 'waitlisted'].includes(normalizeStatus(r.status))).length);
const insideCount = computed(() => props.rows.filter(r => r.checked_in_at).length);
const recentArrivals = computed(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  return props.rows.filter(r => r.checked_in_at && new Date(r.checked_in_at).getTime() >= cutoff).length;
});
const stats = computed(() => [
  { label: 'Inside', value: insideCount.value, muted: false },
  { label: 'Expected', value: expectedCount.value, muted: true },
  { label: 'Remaining', value: Math.max(0, expectedCount.value - insideCount.value), muted: false },
  { label: 'Last 15 min', value: `+${recentArrivals.value}`, muted: false }
]);

const isVip = (g: Submission) => guestType(g).toLowerCase() === 'vip';

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
  if (status === 'waitlisted' || status === 'declined') return 'bg-oxblood-50 text-oxblood-700 border-oxblood-200';
  if (g.checked_in_at) return 'bg-bronze-50 text-bronze-800 border-bronze-300';
  return 'bg-moss-50 text-moss-800 border-moss-200';
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

/**
 * A complete code opens the guest by itself: as soon as what is typed (4 characters or more of
 * the Access ID, or 4 or more digits of the WhatsApp number) belongs to exactly one guest.
 * If several share the ending the list stays so the door picks one.
 */
watch(candidates, (list) => {
  if (props.view !== 'scan' || pending.value || result.value || isChecking.value) return;
  const typed = query.value.replace(/[^A-Za-z0-9]/g, '');
  if (typed.length >= 4 && list.length === 1 && list[0].via !== 'name') openConfirm(list[0].guest);
});

function openConfirm(guest: Submission) {
  pending.value = guest;
}

function cancelConfirm() {
  pending.value = null;
  codeInput.value = '';
  nextTick(() => inputRef.value?.focus());
}

/** Nothing the door can do for this guest right now: why. */
const pendingProblem = computed<{ text: string; class: string } | null>(() => {
  const g = pending.value;
  if (!g) return null;
  const status = normalizeStatus(g.status);
  if (status === 'waitlisted') return { text: 'On the waitlist: no place yet. Send them to the event team.', class: 'bg-oxblood-50 text-oxblood-700' };
  if (status === 'declined') return { text: 'This registration was declined.', class: 'bg-oxblood-50 text-oxblood-700' };
  if (mode.value === 'in' && g.checked_in_at) {
    return { text: `Already inside since ${formatTime(g.checked_in_at)}${g.checked_in_by ? ` (by ${g.checked_in_by})` : ''}.`, class: 'bg-bronze-50 text-bronze-800' };
  }
  if (mode.value === 'out' && !g.checked_in_at) return { text: 'This guest is not inside.', class: 'bg-bronze-50 text-bronze-800' };
  return null;
});

const pendingSessions = computed(() => {
  const value = pending.value?.form_data?.['Access Valid For'];
  return value ? formatValue(value) : '';
});

/** The door confirmed it is the right person: only now is the full Access ID sent. */
function confirmPending() {
  const g = pending.value;
  if (!g || pendingProblem.value || isChecking.value) return;
  pending.value = null;
  void submitCode(accessId(g));
}

/**
 * Enter: confirms the open guest; otherwise opens the one matching guest. Several matches
 * need a tap, unless a whole Access ID was typed. No match: ask the server anyway, in case
 * this tablet's list has not caught up (a handheld scanner types a whole ID and Enter).
 */
function onEnter() {
  if (pending.value) return confirmPending();
  const raw = query.value;
  if (!raw) return;
  const list = candidates.value;
  if (list.length === 1) return openConfirm(list[0].guest);
  if (list.length > 1) {
    const typed = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const whole = list.find(m => accessId(m.guest).toUpperCase().replace(/[^A-Z0-9]/g, '') === typed);
    if (whole) return openConfirm(whole.guest);
    emit('toast', `${list.length} guests match. Tap the right one.`);
    return;
  }
  void submitCode(raw);
}

/* ---------- Result theming: pale moss, deep oxblood, muted bronze ---------- */
const resultTheme = computed(() => {
  switch (result.value?.kind) {
    case 'admitted':
      return { bg: 'bg-moss-600 text-white', iconWrap: 'bg-white text-moss-600', icon: CircleCheck, kicker: 'Access granted', title: 'Welcome' };
    case 'checked_out':
      return { bg: 'bg-neutral-800 text-white', iconWrap: 'bg-white text-black', icon: DoorOpen, kicker: 'Checked out', title: 'Goodbye' };
    case 'already':
      return { bg: 'bg-bronze-700 text-white', iconWrap: 'bg-white text-bronze-700', icon: TriangleAlert, kicker: 'Already inside', title: 'Pass already used' };
    case 'waitlisted':
      return { bg: 'bg-oxblood-700 text-white', iconWrap: 'bg-white text-oxblood-700', icon: Hourglass, kicker: 'Not admitted', title: 'On the waitlist' };
    case 'declined':
      return { bg: 'bg-oxblood-700 text-white', iconWrap: 'bg-white text-oxblood-700', icon: OctagonX, kicker: 'Not admitted', title: 'Declined' };
    default:
      return { bg: 'bg-oxblood-700 text-white', iconWrap: 'bg-white text-oxblood-700', icon: OctagonX, kicker: 'Access denied', title: 'Invalid pass' };
  }
});

const frameColor = computed(() => {
  switch (result.value?.kind) {
    case 'admitted': return 'border-moss-300';
    case 'already': return 'border-bronze-300';
    case 'invalid':
    case 'waitlisted':
    case 'declined':
    case 'error': return 'border-oxblood-300';
    default: return 'border-white/80';
  }
});

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
    if (guest) emit('updated', [guest]);
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
      vip: Boolean(guest && isVip(guest)),
      tail: guest ? codeTail(guest) : '',
      hold: kind === 'admitted' || kind === 'checked_out' ? HOLD_OK_MS : HOLD_PROBLEM_MS
    });
  } catch (err: any) {
    showResult({ kind: 'error', name: '', detail: err?.message || 'Could not reach the server', vip: false, tail: '', hold: HOLD_PROBLEM_MS });
  } finally {
    isChecking.value = false;
    nextTick(() => inputRef.value?.focus());
  }
}

function showResult(r: ScanResult) {
  result.value = r;
  feedback(r.kind);
  if (resultTimer) clearTimeout(resultTimer);
  resultTimer = setTimeout(dismissResult, r.hold);
}

function dismissResult() {
  result.value = null;
  if (resultTimer) clearTimeout(resultTimer);
  nextTick(() => inputRef.value?.focus());
}

/* ---------- Log: who is inside, and cancelling a wrong admit ---------- */
const logQuery = ref('');
const cancelArmed = ref<string | null>(null);
let armTimer: ReturnType<typeof setTimeout> | null = null;

const loggedIn = computed(() =>
  props.rows
    .filter(r => r.checked_in_at && !r.duplicate_of)
    .sort((a, b) => new Date(b.checked_in_at!).getTime() - new Date(a.checked_in_at!).getTime())
);
const visibleLog = computed(() => {
  const q = logQuery.value.trim().toLowerCase();
  if (!q) return loggedIn.value;
  const digits = q.replace(/\D/g, '');
  return loggedIn.value.filter(g =>
    guestName(g).toLowerCase().includes(q) ||
    accessId(g).toLowerCase().replace(/[^a-z0-9]/g, '').endsWith(q.replace(/[^a-z0-9]/g, '')) ||
    (digits.length >= 3 && phoneTail(g).endsWith(digits.slice(-4)))
  );
});

/** Two taps on purpose: the first asks, the second cancels; it falls back to the first state after a few seconds. */
function armCancel(id: string) {
  cancelArmed.value = id;
  if (armTimer) clearTimeout(armTimer);
  armTimer = setTimeout(() => (cancelArmed.value = null), 5000);
}

async function cancelEntry(g: Submission) {
  cancelArmed.value = null;
  try {
    const updated = await patchSubmission(g.id, { checked_in: false });
    if (updated) emit('updated', [updated]);
    emit('toast', `Entry cancelled for ${guestName(g)}. They can be admitted again.`);
  } catch (err: any) {
    emit('toast', `Couldn't cancel: ${err?.message || 'network error'}`);
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

/* ---------- Keyboard: Enter confirms, Escape backs out ---------- */
function onKeydown(e: KeyboardEvent) {
  if (props.view !== 'scan') return;
  if (e.key === 'Escape') {
    if (pending.value) cancelConfirm();
    else if (result.value) dismissResult();
  } else if (e.key === 'Enter' && pending.value && document.activeElement !== inputRef.value) {
    confirmPending();
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('keydown', onKeydown);
  nextTick(() => inputRef.value?.focus());
});

onUnmounted(() => {
  stopCamera();
  if (resultTimer) clearTimeout(resultTimer);
  if (armTimer) clearTimeout(armTimer);
  document.removeEventListener('fullscreenchange', onFullscreenChange);
  document.removeEventListener('keydown', onKeydown);
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
