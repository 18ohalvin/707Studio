<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 font-707" @click.self="$emit('close')">
      <div class="w-full max-w-[700px] max-h-[90vh] rounded-[18px] bg-white border border-black/10 shadow-[0px_24px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 px-6 pt-5 pb-3.5 border-b border-black/5">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <Shield class="w-4 h-4 text-moss-700" />
              <p class="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-500">Staff & Gate Management</p>
            </div>
            <p class="text-[20px] font-medium leading-tight truncate text-black mt-0.5">{{ projectTitle }}</p>
            <p class="text-[12.5px] text-neutral-500 mt-1">Assign field staff to specific scanner tablets, restrict station roles (Entrance / Exit), and control shift validity.</p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="size-[34px] rounded-[9px] hover:bg-black/5 flex items-center justify-center cursor-pointer shrink-0 text-neutral-500 hover:text-black transition-colors"
            title="Close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="px-6 py-5 overflow-y-auto flex flex-col gap-5">
          <!-- Credentials Alert Card: Shown once upon account create or password reset -->
          <div v-if="credentials" class="rounded-[14px] border border-black bg-black text-white p-4 flex flex-col gap-3 shadow-lg">
            <div class="flex items-center justify-between">
              <p class="text-[12px] uppercase tracking-wider text-moss-400 font-semibold flex items-center gap-1.5">
                <Check class="w-3.5 h-3.5" />
                {{ credentials.reset ? 'Password Reset Successful' : 'Staff Passcode Generated' }}
              </p>
              <span class="text-[11px] text-white/50">Shown once only</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-white/[0.07] rounded-[10px] p-3 text-[13px]">
              <div>
                <span class="text-white/50 text-[10.5px] uppercase tracking-wider block">Staff / Operator</span>
                <span class="font-medium text-white select-all">{{ credentials.username }}</span>
              </div>
              <div>
                <span class="text-white/50 text-[10.5px] uppercase tracking-wider block">Assigned Device / Tag</span>
                <span class="text-white select-all">{{ credentials.deviceLabel || 'Unassigned tag' }}</span>
              </div>
              <div>
                <span class="text-white/50 text-[10.5px] uppercase tracking-wider block">Station Role</span>
                <span class="font-medium text-moss-300">
                  {{ credentials.stationMode === 'in' ? 'Entrance Gate (In Only)' : credentials.stationMode === 'out' ? 'Exit Gate (Out Only)' : 'Dual Station (In & Out)' }}
                </span>
              </div>
              <div>
                <span class="text-white/50 text-[10.5px] uppercase tracking-wider block">One-time Password</span>
                <span class="font-mono font-bold tracking-wider text-white select-all">{{ credentials.password }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 text-[12px] text-white/70 pt-0.5">
              <span class="truncate">Sign in at <strong class="text-white font-mono select-all">{{ loginUrl }}</strong></span>
              <div class="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  @click="copyCredentials"
                  class="h-[32px] px-3.5 rounded-[8px] bg-white text-black font-medium hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy class="w-3.5 h-3.5" />
                  <span>Copy Details</span>
                </button>
                <button
                  type="button"
                  @click="credentials = null"
                  class="h-[32px] px-3 rounded-[8px] border border-white/20 text-white/80 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          <!-- Active Staff Accounts List -->
          <div class="flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <p class="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-500">
                Assigned Staff & Devices
                <span class="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-semibold tabular-nums">{{ accounts.length }}</span>
              </p>
              <button
                type="button"
                @click="load"
                :disabled="loading || busy"
                class="text-[11.5px] text-neutral-500 hover:text-black flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw class="w-3 h-3" :class="loading ? 'animate-spin' : ''" />
                <span>Refresh</span>
              </button>
            </div>

            <p v-if="loading" class="text-[13px] text-neutral-400 py-3 text-center">Loading assigned accounts…</p>
            <p v-else-if="!accounts.length" class="text-[13px] text-neutral-500 py-4 text-center rounded-[12px] border border-dashed border-black/15 bg-neutral-50/50">
              No staff account assigned yet for this campaign. Assign one using the form below.
            </p>

            <div v-for="a in accounts" :key="a.id" class="rounded-[12px] border border-black/10 bg-white p-3.5 flex flex-col gap-2.5 shadow-sm hover:border-black/20 transition-all">
              <!-- Top Row: Staff Name, Device Tag, Role Selector, Status -->
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[14.5px] font-semibold text-black tracking-tight">{{ a.username }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium border" :class="statusClass(a)">
                      {{ statusLabel(a) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2.5 mt-1.5 text-[12px] text-neutral-600 flex-wrap">
                    <!-- Device / Tag -->
                    <span v-if="a.deviceLabel" class="inline-flex items-center gap-1 font-medium text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-[5px]">
                      <Tablet class="w-3.5 h-3.5 text-neutral-500" />
                      {{ a.deviceLabel }}
                    </span>
                    <span v-else class="text-neutral-400 italic">No device tag</span>

                    <span class="text-neutral-300">·</span>

                    <!-- Expiry countdown -->
                    <span class="inline-flex items-center gap-1 text-[11.5px]" :class="expiryUrgencyClass(a)">
                      <Clock class="w-3.5 h-3.5" />
                      <span>{{ formatRemaining(a.expiresAt).text }}</span>
                      <span class="text-neutral-400">({{ formatWhen(a.expiresAt) }})</span>
                    </span>
                  </div>
                </div>

                <!-- Station Role Selector -->
                <div class="shrink-0 flex items-center gap-1.5">
                  <label class="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mr-0.5">Role</label>
                  <select
                    :value="a.stationMode"
                    :disabled="busy"
                    @change="updateStationMode(a, ($event.target as HTMLSelectElement).value)"
                    class="h-[28px] px-2 rounded-[7px] text-[11.5px] font-medium border border-black/15 bg-white hover:border-black/30 outline-none cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <option value="in">Entrance Only</option>
                    <option value="out">Exit Only</option>
                    <option value="both">Dual (In & Out)</option>
                  </select>
                </div>
              </div>

              <!-- Bottom Action Bar -->
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-black/5 text-[12px]">
                <!-- Quick Shift Extensions -->
                <div class="flex items-center gap-1.5">
                  <span class="text-[11px] text-neutral-400">Extend shift:</span>
                  <button
                    type="button"
                    @click="extendHours(a, 4)"
                    :disabled="busy"
                    class="h-[26px] px-2 rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11.5px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                    title="Add 4 hours to this shift"
                  >
                    +4h
                  </button>
                  <button
                    type="button"
                    @click="extendHours(a, 24)"
                    :disabled="busy"
                    class="h-[26px] px-2 rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11.5px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                    title="Add 1 day to this shift"
                  >
                    +1d
                  </button>
                </div>

                <!-- Account Management Actions -->
                <div class="flex items-center gap-1.5">
                  <template v-if="removing === a.id">
                    <button
                      type="button"
                      @click="removing = null"
                      class="h-[26px] px-2.5 rounded-[6px] border border-black/15 text-[11.5px] font-medium cursor-pointer hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      @click="remove(a)"
                      class="h-[26px] px-2.5 rounded-[6px] bg-oxblood-700 text-white text-[11.5px] font-medium cursor-pointer hover:bg-oxblood-800"
                    >
                      Confirm Delete
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      @click="toggleSuspend(a)"
                      :disabled="busy"
                      class="h-[26px] px-2.5 rounded-[6px] border text-[11.5px] font-medium cursor-pointer transition-colors disabled:opacity-40"
                      :class="a.status === 'suspended' ? 'text-moss-700 border-moss-300 bg-moss-50 hover:bg-moss-100' : 'text-neutral-700 border-black/15 hover:bg-black/5'"
                    >
                      {{ a.status === 'suspended' ? 'Activate' : 'Suspend' }}
                    </button>
                    <button
                      type="button"
                      @click="resetPassword(a)"
                      :disabled="busy"
                      class="h-[26px] px-2.5 rounded-[6px] border border-black/15 text-[11.5px] font-medium text-neutral-700 hover:bg-black/5 cursor-pointer disabled:opacity-40"
                    >
                      New Passcode
                    </button>
                    <button
                      type="button"
                      @click="removing = a.id"
                      class="size-[26px] rounded-[6px] hover:bg-oxblood-50 text-neutral-400 hover:text-oxblood-700 flex items-center justify-center cursor-pointer transition-colors"
                      title="Delete account"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- Assign New Staff & Station Form -->
          <form class="rounded-[14px] border border-black/10 bg-neutral-50/70 p-4 flex flex-col gap-3.5" @submit.prevent="create">
            <div>
              <p class="text-[11px] uppercase tracking-[0.14em] font-semibold text-neutral-700">Assign New Staff & Station</p>
              <p class="text-[12px] text-neutral-500 mt-0.5">Generate single-event credentials bound to this campaign and station.</p>
            </div>

            <!-- Row 1: Name and Device -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">Staff Member Name / ID</span>
                <input
                  v-model="username"
                  type="text"
                  autocomplete="off"
                  autocapitalize="none"
                  spellcheck="false"
                  placeholder="e.g. Budi Santoso, Guard #1"
                  class="h-[38px] px-3 rounded-[8px] bg-white border border-black/15 text-[13px] outline-none focus:border-black transition-colors"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">Device / Gate Location Tag</span>
                <input
                  v-model="deviceLabel"
                  type="text"
                  autocomplete="off"
                  spellcheck="false"
                  placeholder="e.g. North Gate · Tablet A, VIP Desk"
                  class="h-[38px] px-3 rounded-[8px] bg-white border border-black/15 text-[13px] outline-none focus:border-black transition-colors"
                />
              </label>
            </div>

            <!-- Row 2: Station Role Segmented Radio -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">Station Role</span>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="stationMode = 'in'"
                  class="h-[36px] px-2 rounded-[8px] border text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  :class="stationMode === 'in' ? 'bg-moss-700 text-white border-moss-700 shadow-sm' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  <LogIn class="w-3.5 h-3.5" />
                  <span>Entrance (In)</span>
                </button>
                <button
                  type="button"
                  @click="stationMode = 'out'"
                  class="h-[36px] px-2 rounded-[8px] border text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  :class="stationMode === 'out' ? 'bg-neutral-800 text-white border-neutral-800 shadow-sm' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>Exit (Out)</span>
                </button>
                <button
                  type="button"
                  @click="stationMode = 'both'"
                  class="h-[36px] px-2 rounded-[8px] border text-[12px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  :class="stationMode === 'both' ? 'bg-neutral-800 text-white border-neutral-800 shadow-sm' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  <ArrowLeftRight class="w-3.5 h-3.5" />
                  <span>Dual (Both)</span>
                </button>
              </div>
            </div>

            <!-- Row 3: Shift Validity Duration Presets -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">Shift Validity Duration</span>
                <span class="text-[11.5px] text-moss-700 font-medium">{{ expiryPreviewText }}</span>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button
                  v-for="p in presets"
                  :key="p.id"
                  type="button"
                  @click="applyPreset(p.id)"
                  class="h-[30px] px-2.5 rounded-[7px] border text-[11.5px] font-medium cursor-pointer transition-all"
                  :class="selectedPreset === p.id ? 'bg-black text-white border-black shadow-sm' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  {{ p.label }}
                </button>
              </div>

              <!-- Custom datetime-local input shown when custom is picked -->
              <div v-if="selectedPreset === 'custom'" class="mt-1">
                <input
                  v-model="customExpires"
                  type="datetime-local"
                  class="h-[36px] px-3 rounded-[8px] bg-white border border-black/15 text-[12.5px] outline-none focus:border-black"
                />
              </div>
            </div>

            <p v-if="error" class="text-[12.5px] text-oxblood-700 font-medium">{{ error }}</p>

            <div class="flex items-center justify-between gap-3 pt-1">
              <p class="text-[11.5px] text-neutral-500">Auto-generates a secure 12-char passcode shown once.</p>
              <button
                type="submit"
                :disabled="busy || !username.trim()"
                class="h-[36px] px-4 rounded-[9px] bg-black text-white text-[13px] font-medium cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-default shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Assign Staff & Generate Passcode</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  X,
  Copy,
  Trash2,
  Shield,
  Tablet,
  Clock,
  LogIn,
  LogOut,
  ArrowLeftRight,
  Check,
  Plus,
  RefreshCw
} from 'lucide-vue-next';
import { apiFetch } from '../../services/apiClient.ts';

const props = defineProps<{ projectId: string; projectTitle: string }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'toast', msg: string): void }>();

interface GateAccount {
  id: string;
  username: string;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  project?: string;
  stationMode: 'in' | 'out' | 'both';
  deviceLabel: string;
}

interface CredentialsState {
  username: string;
  password: string;
  stationMode: 'in' | 'out' | 'both';
  deviceLabel: string;
  reset: boolean;
}

const accounts = ref<GateAccount[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const removing = ref<string | null>(null);
const credentials = ref<CredentialsState | null>(null);

// Form state
const username = ref('');
const deviceLabel = ref('');
const stationMode = ref<'in' | 'out' | 'both'>('in');

type ShiftPreset = '4h' | '8h' | '12h' | 'eod' | 'custom';
const presets: { id: ShiftPreset; label: string }[] = [
  { id: '4h', label: '4 Hours' },
  { id: '8h', label: '8 Hours' },
  { id: '12h', label: '12 Hours' },
  { id: 'eod', label: 'End of Day (Today 23:59)' },
  { id: 'custom', label: 'Custom' }
];

const selectedPreset = ref<ShiftPreset>('eod');
const customExpires = ref(getPresetExpiry('eod'));

const loginUrl = computed(() => `${window.location.origin}/login`);

function getPresetExpiry(preset: ShiftPreset): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toInput = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  if (preset === '4h') return toInput(new Date(now.getTime() + 4 * 3600 * 1000));
  if (preset === '8h') return toInput(new Date(now.getTime() + 8 * 3600 * 1000));
  if (preset === '12h') return toInput(new Date(now.getTime() + 12 * 3600 * 1000));
  if (preset === 'eod') {
    const end = new Date(now);
    if (end.getHours() >= 23) end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 0, 0);
    return toInput(end);
  }
  return toInput(new Date(now.getTime() + 8 * 3600 * 1000));
}

function applyPreset(preset: ShiftPreset) {
  selectedPreset.value = preset;
  if (preset !== 'custom') {
    customExpires.value = getPresetExpiry(preset);
  }
}

const expiryPreviewText = computed(() => {
  if (!customExpires.value) return '';
  const d = new Date(customExpires.value);
  if (Number.isNaN(d.getTime())) return '';
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return 'Invalid expiry (past)';
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  return `Valid for ~${timeStr} (ends ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
});

function formatWhen(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatRemaining(expiresAt: string | null): { text: string; isExpired: boolean; urgency: 'normal' | 'soon' | 'expired' } {
  if (!expiresAt) return { text: 'No expiration set', isExpired: false, urgency: 'normal' };
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return { text: '—', isExpired: false, urgency: 'normal' };
  const diff = target - Date.now();
  if (diff <= 0) {
    const ago = Math.abs(diff);
    const hrs = Math.floor(ago / (1000 * 60 * 60));
    const mins = Math.floor((ago % (1000 * 60 * 60)) / (1000 * 60));
    const agoStr = hrs > 0 ? `${hrs}h ${mins}m ago` : `${mins}m ago`;
    return { text: `Expired ${agoStr}`, isExpired: true, urgency: 'expired' };
  }
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hrs / 24);
  let timeStr = '';
  if (days > 0) {
    timeStr = `${days}d ${hrs % 24}h`;
  } else if (hrs > 0) {
    timeStr = `${hrs}h ${mins}m`;
  } else {
    timeStr = `${mins}m`;
  }
  const urgency = diff < 60 * 60 * 1000 ? 'soon' : 'normal';
  return { text: `Ends in ${timeStr}`, isExpired: false, urgency };
}

const isExpired = (a: GateAccount) => Boolean(a.expiresAt) && new Date(a.expiresAt as string).getTime() <= Date.now();
const statusLabel = (a: GateAccount) => (isExpired(a) ? 'Expired' : a.status === 'suspended' ? 'Suspended' : 'Active');
const statusClass = (a: GateAccount) =>
  isExpired(a)
    ? 'bg-bronze-50 text-bronze-800 border-bronze-300'
    : a.status === 'suspended'
    ? 'bg-oxblood-50 text-oxblood-700 border-oxblood-200'
    : 'bg-moss-50 text-moss-800 border-moss-200';

const expiryUrgencyClass = (a: GateAccount) => {
  const rem = formatRemaining(a.expiresAt);
  if (rem.urgency === 'expired') return 'text-oxblood-700 font-medium';
  if (rem.urgency === 'soon') return 'text-amber-700 font-medium';
  return 'text-neutral-600';
};

async function call(path: string, init: RequestInit = {}) {
  const res = await apiFetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) }
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) throw new Error(json?.error || `Request failed (${res.status})`);
  return json;
}

async function load() {
  loading.value = true;
  try {
    const json = await call(`/api/gate-accounts?project=${encodeURIComponent(props.projectId)}`);
    accounts.value = json.data;
    error.value = '';
  } catch (err: any) {
    error.value = err?.message || 'Could not load the gate accounts.';
  } finally {
    loading.value = false;
  }
}

async function create() {
  if (busy.value || !username.value.trim()) return;
  busy.value = true;
  error.value = '';
  try {
    const at = new Date(customExpires.value);
    if (Number.isNaN(at.getTime())) throw new Error('Set an expiry date and time.');
    const json = await call('/api/gate-accounts', {
      method: 'POST',
      body: JSON.stringify({
        project: props.projectId,
        username: username.value.trim(),
        deviceLabel: deviceLabel.value.trim(),
        stationMode: stationMode.value,
        expiresAt: at.toISOString()
      })
    });
    credentials.value = {
      username: json.data.username,
      password: json.password,
      stationMode: json.data.stationMode || stationMode.value,
      deviceLabel: json.data.deviceLabel || deviceLabel.value.trim(),
      reset: false
    };
    username.value = '';
    deviceLabel.value = '';
    await load();
  } catch (err: any) {
    error.value = err?.message || 'Could not create the account.';
  } finally {
    busy.value = false;
  }
}

async function resetPassword(a: GateAccount) {
  busy.value = true;
  try {
    const json = await call(`/api/gate-accounts/${encodeURIComponent(a.id)}/reset-password`, { method: 'POST' });
    credentials.value = {
      username: a.username,
      password: json.password,
      stationMode: a.stationMode,
      deviceLabel: a.deviceLabel,
      reset: true
    };
  } catch (err: any) {
    emit('toast', err?.message || 'Could not reset the password.');
  } finally {
    busy.value = false;
  }
}

async function patch(a: GateAccount, body: Record<string, unknown>, done: string) {
  busy.value = true;
  try {
    await call(`/api/gate-accounts/${encodeURIComponent(a.id)}`, { method: 'PATCH', body: JSON.stringify(body) });
    await load();
    emit('toast', done);
  } catch (err: any) {
    emit('toast', err?.message || 'Could not update the account.');
  } finally {
    busy.value = false;
  }
}

const toggleSuspend = (a: GateAccount) =>
  patch(
    a,
    { status: a.status === 'suspended' ? 'active' : 'suspended' },
    a.status === 'suspended'
      ? `${a.username} is active again.`
      : `${a.username} is suspended. Tablet access is revoked immediately.`
  );

function extendHours(a: GateAccount, hours: number) {
  const base = Math.max(Date.now(), a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
  const target = new Date(base + hours * 3600 * 1000).toISOString();
  return patch(a, { expiresAt: target }, `${a.username} shift extended by +${hours} hours.`);
}

async function updateStationMode(a: GateAccount, newMode: string) {
  if (newMode !== 'in' && newMode !== 'out' && newMode !== 'both') return;
  const label = newMode === 'in' ? 'Entrance Gate (In Only)' : newMode === 'out' ? 'Exit Gate (Out Only)' : 'Dual Station';
  await patch(a, { stationMode: newMode }, `${a.username} station role updated to ${label}.`);
}

async function remove(a: GateAccount) {
  removing.value = null;
  busy.value = true;
  try {
    await call(`/api/gate-accounts/${encodeURIComponent(a.id)}`, { method: 'DELETE' });
    await load();
    emit('toast', `${a.username} removed.`);
  } catch (err: any) {
    emit('toast', err?.message || 'Could not remove the account.');
  } finally {
    busy.value = false;
  }
}

async function copyCredentials() {
  if (!credentials.value) return;
  const roleLabel =
    credentials.value.stationMode === 'in'
      ? 'Entrance Gate (In Only)'
      : credentials.value.stationMode === 'out'
      ? 'Exit Gate (Out Only)'
      : 'Dual Station (In & Out)';
  const lines = [
    `707 Door Scanner — ${props.projectTitle}`,
    `Staff Member: ${credentials.value.username}`,
    credentials.value.deviceLabel ? `Station / Device: ${credentials.value.deviceLabel}` : null,
    `Assigned Role: ${roleLabel}`,
    `Username: ${credentials.value.username}`,
    `One-time Password: ${credentials.value.password}`,
    `Sign In: ${loginUrl.value}`
  ].filter(Boolean);

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    emit('toast', 'Login details copied to clipboard.');
  } catch {
    emit('toast', 'Could not copy — please copy details manually.');
  }
}

onMounted(load);
</script>
