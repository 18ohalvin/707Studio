<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] tracking-normal select-none"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[560px] max-h-[85vh] rounded-[16px] bg-white border border-black/10 shadow-[0px_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-black/5">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
              <Shield class="w-3.5 h-3.5 text-moss-700" />
              <span>Gate Security</span>
            </div>
            <p class="text-[17px] font-medium leading-tight truncate text-black mt-0.5">{{ projectTitle }}</p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="size-[28px] rounded-[7px] hover:bg-neutral-100 flex items-center justify-center cursor-pointer shrink-0 text-neutral-400 hover:text-black transition-colors"
            title="Close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- 2 Simplified Tabs: 707 Design Token -->
        <div class="flex items-center gap-6 px-5 border-b border-black/10 bg-white">
          <button
            type="button"
            @click="activeTab = 'assigned'"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'assigned' ? 'text-black font-semibold border-b-2 border-black -mb-[1px]' : 'text-neutral-500 hover:text-black font-normal'"
          >
            <span>Assigned Devices</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10.5px] tabular-nums"
              :class="activeTab === 'assigned' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'"
            >
              {{ accounts.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'create'"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1"
            :class="activeTab === 'create' ? 'text-black font-semibold border-b-2 border-black -mb-[1px]' : 'text-neutral-500 hover:text-black font-normal'"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>New Staff & Device</span>
          </button>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 overflow-y-auto flex flex-col gap-3.5">
          <!-- Credentials Card: Shown once upon account create or password reset -->
          <div v-if="credentials" class="rounded-[12px] bg-black text-white p-3.5 flex flex-col gap-3 shadow-md animate-apple-pop">
            <div class="flex items-center justify-between">
              <p class="text-[11.5px] text-moss-400 font-medium flex items-center gap-1.5">
                <Check class="w-3.5 h-3.5" />
                <span>{{ credentials.reset ? 'New Passcode Generated' : 'Staff Passcode Ready' }}</span>
              </p>
              <span class="text-[10px] text-white/50">Shown once only</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-[8px] bg-white/[0.08]">
              <div class="min-w-0 flex-1 pr-3">
                <span class="text-[13px] font-medium text-white truncate block">{{ credentials.username }}</span>
                <span class="text-[11.5px] text-moss-300 font-normal">
                  {{ credentials.stationMode === 'in' ? 'Entrance Gate (In Only)' : credentials.stationMode === 'out' ? 'Exit Gate (Out Only)' : 'Dual Station (In & Out)' }}
                </span>
              </div>
              <div class="text-right shrink-0">
                <span class="text-[10px] uppercase text-white/50 block">Passcode</span>
                <span class="text-[17px] font-mono font-bold tracking-wider text-white select-all">{{ credentials.password }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 text-[11.5px] text-white/70">
              <span class="truncate">Sign in at <strong class="text-white">{{ loginUrl }}</strong></span>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="copyCredentials"
                  class="h-[28px] px-3 rounded-[6px] bg-white text-black font-medium hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer text-[11.5px] transition-colors"
                >
                  <Copy class="w-3 h-3" />
                  <span>Copy Details</span>
                </button>
                <button
                  type="button"
                  @click="credentials = null"
                  class="h-[28px] px-2.5 rounded-[6px] border border-white/20 text-white/80 hover:bg-white/10 cursor-pointer text-[11.5px] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 1: ASSIGNED DEVICES (Ultra-Clean Ledger) -->
          <div v-if="activeTab === 'assigned'" class="flex flex-col gap-2">
            <!-- Header bar with Refresh -->
            <div class="flex items-center justify-between text-[11.5px] text-neutral-400 px-0.5">
              <span>Active Tablets & Stations</span>
              <button
                type="button"
                @click="load"
                :disabled="loading || busy"
                class="hover:text-black flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <RefreshCw class="w-3 h-3" :class="loading ? 'animate-spin' : ''" />
                <span>Refresh</span>
              </button>
            </div>

            <p v-if="loading" class="text-[12.5px] text-neutral-400 py-8 text-center">Loading assigned devices…</p>

            <!-- Empty state -->
            <div
              v-else-if="!accounts.length"
              class="py-10 px-4 text-center rounded-[10px] border border-dashed border-black/15 bg-neutral-50/50 flex flex-col items-center gap-2"
            >
              <p class="text-[13px] text-neutral-700 font-medium">No devices or staff assigned yet</p>
              <p class="text-[11.5px] text-neutral-400 max-w-[280px]">Assign door staff to tablets to start scanning tickets for this campaign.</p>
              <button
                type="button"
                @click="activeTab = 'create'"
                class="mt-1 h-[30px] px-3.5 rounded-[6px] bg-black text-white text-[11.5px] font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                + Assign First Device
              </button>
            </div>

            <!-- Clean Row for Each Device -->
            <div
              v-for="a in accounts"
              :key="a.id"
              class="flex items-center justify-between p-3 rounded-[10px] border border-black/8 hover:border-black/20 bg-white transition-all shadow-2xs"
            >
              <!-- Left: Name & Status & Validity -->
              <div class="min-w-0 flex-1 pr-3">
                <div class="flex items-center gap-2">
                  <span class="text-[13.5px] font-medium text-black truncate">{{ a.username }}</span>
                  <span class="inline-flex items-center gap-1 text-[11px]" :class="statusClass(a)">
                    <span class="size-1.5 rounded-full" :class="statusDotClass(a)" />
                    <span>{{ statusLabel(a) }}</span>
                  </span>
                </div>
                <p class="text-[11.5px] text-neutral-400 mt-0.5 truncate">
                  {{ isExpired(a) ? `Expired ${formatAgo(a.expiresAt)}` : `Valid until ${formatWhen(a.expiresAt)}` }}
                </p>
              </div>

              <!-- Center/Right: One-Click Station Role Switcher -->
              <div class="flex items-center p-0.5 rounded-[7px] bg-neutral-100 text-[11px] font-medium mr-2 shrink-0">
                <button
                  type="button"
                  @click="updateStationMode(a, 'in')"
                  class="px-2.5 py-1 rounded-[5px] transition-all cursor-pointer"
                  :class="a.stationMode === 'in' ? 'bg-white text-black shadow-2xs font-semibold' : 'text-neutral-500 hover:text-black'"
                  title="Locked to ticket check-in"
                >
                  Entrance
                </button>
                <button
                  type="button"
                  @click="updateStationMode(a, 'out')"
                  class="px-2.5 py-1 rounded-[5px] transition-all cursor-pointer"
                  :class="a.stationMode === 'out' ? 'bg-white text-black shadow-2xs font-semibold' : 'text-neutral-500 hover:text-black'"
                  title="Locked to ticket check-out"
                >
                  Exit
                </button>
                <button
                  type="button"
                  @click="updateStationMode(a, 'both')"
                  class="px-2.5 py-1 rounded-[5px] transition-all cursor-pointer"
                  :class="a.stationMode === 'both' ? 'bg-white text-black shadow-2xs font-semibold' : 'text-neutral-500 hover:text-black'"
                  title="Staff can toggle Entrance / Exit"
                >
                  Dual
                </button>
              </div>

              <!-- Right: 3-Dot Overflow Menu -->
              <div class="relative shrink-0 overflow-menu-container">
                <button
                  type="button"
                  @click.stop="openMenuId = openMenuId === a.id ? null : a.id"
                  class="size-[28px] rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
                  title="More actions"
                >
                  <MoreHorizontal class="w-4 h-4" />
                </button>

                <!-- Dropdown Popover -->
                <div
                  v-if="openMenuId === a.id"
                  class="absolute right-0 top-[calc(100%+4px)] z-30 w-[180px] bg-white border border-black/10 rounded-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] p-1 flex flex-col gap-0.5 text-[12px] animate-apple-pop"
                >
                  <button
                    type="button"
                    @click="extendHours(a, 8); openMenuId = null"
                    class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <Clock class="w-3.5 h-3.5 text-neutral-500" />
                    <span>Extend +8 Hours</span>
                  </button>

                  <button
                    type="button"
                    @click="extendHours(a, 24); openMenuId = null"
                    class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <Clock class="w-3.5 h-3.5 text-neutral-500" />
                    <span>Extend +1 Day</span>
                  </button>

                  <button
                    type="button"
                    @click="resetPassword(a); openMenuId = null"
                    class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <KeyRound class="w-3.5 h-3.5 text-neutral-500" />
                    <span>Reset Passcode</span>
                  </button>

                  <button
                    type="button"
                    @click="toggleSuspend(a); openMenuId = null"
                    class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                  >
                    <Shield class="w-3.5 h-3.5 text-neutral-500" />
                    <span>{{ a.status === 'suspended' ? 'Activate Device' : 'Suspend Device' }}</span>
                  </button>

                  <div class="h-px bg-black/5 my-0.5" />

                  <button
                    type="button"
                    @click="remove(a); openMenuId = null"
                    class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-oxblood-50 text-left flex items-center gap-2 text-oxblood-700 cursor-pointer"
                  >
                    <Trash2 class="w-3.5 h-3.5 text-oxblood-600" />
                    <span>Remove Device</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: NEW STAFF ASSIGNMENT (Ultra-Simple 2-Click Form) -->
          <form v-else-if="activeTab === 'create'" class="flex flex-col gap-4 py-1" @submit.prevent="create">
            <!-- 1. Station or Staff Name -->
            <label class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium text-black">Station or Staff Name</span>
              <input
                v-model="username"
                type="text"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
                placeholder="e.g. North Gate · Tablet 1, or Budi Santoso"
                class="h-[38px] px-3.5 rounded-[8px] bg-neutral-50 hover:bg-white focus:bg-white border border-black/15 focus:border-black text-[13px] outline-none transition-all"
              />
            </label>

            <!-- 2. Station Role Segmented Switcher -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium text-black">Station Role</span>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="stationMode = 'in'"
                  class="h-[36px] rounded-[8px] border text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  :class="stationMode === 'in' ? 'bg-black text-white border-black shadow-2xs font-semibold' : 'bg-neutral-50 text-neutral-600 border-black/10 hover:border-black/25'"
                >
                  <LogIn class="w-3.5 h-3.5" />
                  <span>Entrance (In)</span>
                </button>
                <button
                  type="button"
                  @click="stationMode = 'out'"
                  class="h-[36px] rounded-[8px] border text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  :class="stationMode === 'out' ? 'bg-black text-white border-black shadow-2xs font-semibold' : 'bg-neutral-50 text-neutral-600 border-black/10 hover:border-black/25'"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>Exit (Out)</span>
                </button>
                <button
                  type="button"
                  @click="stationMode = 'both'"
                  class="h-[36px] rounded-[8px] border text-[12px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  :class="stationMode === 'both' ? 'bg-black text-white border-black shadow-2xs font-semibold' : 'bg-neutral-50 text-neutral-600 border-black/10 hover:border-black/25'"
                >
                  <ArrowLeftRight class="w-3.5 h-3.5" />
                  <span>Dual (In & Out)</span>
                </button>
              </div>
            </div>

            <!-- 3. Shift Duration: Smart Default to Today, Optional Change -->
            <div class="flex items-center justify-between p-3 rounded-[8px] bg-neutral-50 border border-black/5 text-[12px]">
              <div class="flex items-center gap-2">
                <Clock class="w-3.5 h-3.5 text-neutral-500" />
                <span class="text-neutral-600">Shift Validity:</span>
                <span class="font-medium text-black">{{ shiftDurationSummary }}</span>
              </div>
              <button
                type="button"
                @click="showCustomDuration = !showCustomDuration"
                class="text-[11.5px] text-neutral-500 hover:text-black underline cursor-pointer"
              >
                {{ showCustomDuration ? 'Default (Today)' : 'Change' }}
              </button>
            </div>

            <!-- Optional Custom Duration Picker -->
            <div v-if="showCustomDuration" class="flex flex-col gap-2 p-3 rounded-[8px] border border-black/10 bg-white">
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="p in presets"
                  :key="p.id"
                  type="button"
                  @click="applyPreset(p.id)"
                  class="h-[26px] px-2 rounded-[5px] text-[11px] font-medium cursor-pointer border transition-colors"
                  :class="selectedPreset === p.id ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-black/15 hover:border-black/30'"
                >
                  {{ p.label }}
                </button>
              </div>
              <input
                v-if="selectedPreset === 'custom'"
                v-model="customExpires"
                type="datetime-local"
                class="h-[32px] px-2.5 rounded-[6px] border border-black/15 text-[11.5px] outline-none focus:border-black"
              />
            </div>

            <p v-if="error" class="text-[12px] text-oxblood-700 font-medium">{{ error }}</p>

            <!-- Submit -->
            <div class="flex items-center justify-between gap-3 pt-2 border-t border-black/5">
              <p class="text-[11.5px] text-neutral-400">Passcode is created automatically.</p>
              <button
                type="submit"
                :disabled="busy || !username.trim()"
                class="h-[36px] px-4 rounded-[8px] bg-black text-white text-[12.5px] font-medium cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-default transition-all shadow-2xs"
              >
                Generate Passcode
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import {
  X,
  Copy,
  Trash2,
  Shield,
  Clock,
  LogIn,
  LogOut,
  ArrowLeftRight,
  Check,
  Plus,
  RefreshCw,
  MoreHorizontal,
  KeyRound
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

const activeTab = ref<'assigned' | 'create'>('assigned');
const accounts = ref<GateAccount[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const openMenuId = ref<string | null>(null);
const credentials = ref<CredentialsState | null>(null);

// Form state
const username = ref('');
const stationMode = ref<'in' | 'out' | 'both'>('in');
const showCustomDuration = ref(false);

type ShiftPreset = 'eod' | '4h' | '8h' | '12h' | 'custom';
const presets: { id: ShiftPreset; label: string }[] = [
  { id: 'eod', label: 'Today (Until 23:59)' },
  { id: '4h', label: '4 Hours' },
  { id: '8h', label: '8 Hours' },
  { id: '12h', label: '12 Hours' },
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

const shiftDurationSummary = computed(() => {
  if (selectedPreset.value === 'eod' && !showCustomDuration.value) {
    return 'Today (until 23:59)';
  }
  const d = new Date(customExpires.value);
  if (Number.isNaN(d.getTime())) return 'Today (until 23:59)';
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hrs > 0 ? `~${hrs}h ${mins}m (ends ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : `~${mins}m`;
});

function formatWhen(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function formatAgo(value: string | null): string {
  if (!value) return '—';
  const target = new Date(value).getTime();
  const diff = Date.now() - target;
  if (diff <= 0) return 'just now';
  const hrs = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hrs > 0 ? `${hrs}h ago` : `${mins}m ago`;
}

const isExpired = (a: GateAccount) => Boolean(a.expiresAt) && new Date(a.expiresAt as string).getTime() <= Date.now();
const statusLabel = (a: GateAccount) => (isExpired(a) ? 'Expired' : a.status === 'suspended' ? 'Suspended' : 'Active');
const statusClass = (a: GateAccount) =>
  isExpired(a) ? 'text-bronze-700' : a.status === 'suspended' ? 'text-oxblood-700' : 'text-moss-700';
const statusDotClass = (a: GateAccount) =>
  isExpired(a) ? 'bg-bronze-600' : a.status === 'suspended' ? 'bg-oxblood-600' : 'bg-moss-600';

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
    error.value = err?.message || 'Could not load accounts.';
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
    const label = username.value.trim();
    const json = await call('/api/gate-accounts', {
      method: 'POST',
      body: JSON.stringify({
        project: props.projectId,
        username: label,
        deviceLabel: label,
        stationMode: stationMode.value,
        expiresAt: at.toISOString()
      })
    });
    credentials.value = {
      username: json.data.username,
      password: json.password,
      stationMode: json.data.stationMode || stationMode.value,
      deviceLabel: json.data.deviceLabel || label,
      reset: false
    };
    username.value = '';
    showCustomDuration.value = false;
    applyPreset('eod');
    await load();
    activeTab.value = 'assigned';
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
    activeTab.value = 'assigned';
  } catch (err: any) {
    emit('toast', err?.message || 'Could not reset the passcode.');
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
    emit('toast', err?.message || 'Could not update the device.');
  } finally {
    busy.value = false;
  }
}

const toggleSuspend = (a: GateAccount) =>
  patch(
    a,
    { status: a.status === 'suspended' ? 'active' : 'suspended' },
    a.status === 'suspended' ? `${a.username} active.` : `${a.username} suspended.`
  );

function extendHours(a: GateAccount, hours: number) {
  const base = Math.max(Date.now(), a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
  const target = new Date(base + hours * 3600 * 1000).toISOString();
  return patch(a, { expiresAt: target }, `${a.username} shift extended by +${hours}h.`);
}

async function updateStationMode(a: GateAccount, newMode: 'in' | 'out' | 'both') {
  if (a.stationMode === newMode) return;
  const label = newMode === 'in' ? 'Entrance' : newMode === 'out' ? 'Exit' : 'Dual';
  await patch(a, { stationMode: newMode }, `${a.username} set to ${label}.`);
}

async function remove(a: GateAccount) {
  busy.value = true;
  try {
    await call(`/api/gate-accounts/${encodeURIComponent(a.id)}`, { method: 'DELETE' });
    await load();
    emit('toast', `${a.username} removed.`);
  } catch (err: any) {
    emit('toast', err?.message || 'Could not remove device.');
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
    `Station: ${credentials.value.username}`,
    `Role: ${roleLabel}`,
    `Username: ${credentials.value.username}`,
    `Passcode: ${credentials.value.password}`,
    `Sign In: ${loginUrl.value}`
  ];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    emit('toast', 'Passcode copied to clipboard.');
  } catch {
    emit('toast', 'Could not copy — please copy manually.');
  }
}

function handleDocClick(e: MouseEvent) {
  if (openMenuId.value) {
    const target = e.target as HTMLElement;
    if (!target.closest('.overflow-menu-container')) {
      openMenuId.value = null;
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocClick);
  load();
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick);
});
</script>
