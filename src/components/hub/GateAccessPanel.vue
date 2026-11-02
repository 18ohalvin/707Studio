<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] tracking-normal"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[660px] max-h-[88vh] rounded-[16px] bg-white border border-black/10 shadow-[0px_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 px-6 pt-5 pb-3.5 border-b border-black/5">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <Shield class="w-3.5 h-3.5 text-moss-700" />
              <span>Gate Access & Device Management</span>
            </div>
            <p class="text-[19px] font-medium leading-tight truncate text-black mt-1">{{ projectTitle }}</p>
            <p class="text-[12px] text-neutral-500 mt-0.5">Assign door staff to specific tablets, enforce station roles, and control shift validity.</p>
          </div>
          <button
            type="button"
            @click="$emit('close')"
            class="size-[30px] rounded-[8px] hover:bg-neutral-100 flex items-center justify-center cursor-pointer shrink-0 text-neutral-400 hover:text-black transition-colors"
            title="Close"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Two Tabs Navigation: 707 Design Token Pattern -->
        <div class="flex items-center gap-6 px-6 border-b border-black/10 select-none bg-white">
          <button
            type="button"
            @click="activeTab = 'assigned'"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1.5"
            :class="activeTab === 'assigned' ? 'text-black font-medium border-b-2 border-black -mb-[1px]' : 'text-neutral-500 hover:text-black font-normal'"
          >
            <span>Assigned Staff & Devices</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10.5px] font-normal tabular-nums"
              :class="activeTab === 'assigned' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'"
            >
              {{ accounts.length }}
            </span>
          </button>

          <button
            type="button"
            @click="activeTab = 'create'"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1"
            :class="activeTab === 'create' ? 'text-black font-medium border-b-2 border-black -mb-[1px]' : 'text-neutral-500 hover:text-black font-normal'"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>New Staff Assignment</span>
          </button>
        </div>

        <!-- Tab Content Body -->
        <div class="px-6 py-4 overflow-y-auto flex flex-col gap-4">
          <!-- Credentials Alert Card: Shown upon account creation or password reset -->
          <div v-if="credentials" class="rounded-[12px] border border-black bg-black text-white p-3.5 flex flex-col gap-2.5 shadow-md">
            <div class="flex items-center justify-between">
              <p class="text-[11.5px] text-moss-400 font-medium flex items-center gap-1.5">
                <Check class="w-3.5 h-3.5" />
                <span>{{ credentials.reset ? 'Password Reset Successful' : 'Staff Passcode Generated' }}</span>
              </p>
              <span class="text-[10.5px] text-white/50">Shown once only</span>
            </div>

            <div class="grid grid-cols-2 gap-2 bg-white/[0.08] rounded-[8px] p-2.5 text-[12px]">
              <div>
                <span class="text-white/50 text-[10px] block">Staff / Operator</span>
                <span class="font-medium text-white select-all">{{ credentials.username }}</span>
              </div>
              <div>
                <span class="text-white/50 text-[10px] block">Assigned Device / Tag</span>
                <span class="text-white select-all">{{ credentials.deviceLabel || 'Unassigned tag' }}</span>
              </div>
              <div>
                <span class="text-white/50 text-[10px] block">Station Role</span>
                <span class="font-medium text-moss-300">
                  {{ credentials.stationMode === 'in' ? 'Entrance Gate (In Only)' : credentials.stationMode === 'out' ? 'Exit Gate (Out Only)' : 'Dual Station (In & Out)' }}
                </span>
              </div>
              <div>
                <span class="text-white/50 text-[10px] block">One-time Password</span>
                <span class="font-mono font-medium text-white select-all">{{ credentials.password }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 text-[11.5px] text-white/70 pt-0.5">
              <span class="truncate">Sign in at <strong class="text-white font-mono select-all">{{ loginUrl }}</strong></span>
              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  @click="copyCredentials"
                  class="h-[28px] px-3 rounded-[6px] bg-white text-black font-medium hover:bg-neutral-200 flex items-center gap-1.5 cursor-pointer transition-colors text-[11.5px]"
                >
                  <Copy class="w-3 h-3" />
                  <span>Copy Details</span>
                </button>
                <button
                  type="button"
                  @click="credentials = null"
                  class="h-[28px] px-2.5 rounded-[6px] border border-white/20 text-white/80 hover:bg-white/10 cursor-pointer transition-colors text-[11.5px]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 1: ASSIGNED STAFF & DEVICES -->
          <div v-if="activeTab === 'assigned'" class="flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <p class="text-[12px] font-medium text-neutral-600">Active Staff Accounts</p>
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

            <p v-if="loading" class="text-[12.5px] text-neutral-400 py-6 text-center">Loading assigned accounts…</p>

            <div
              v-else-if="!accounts.length"
              class="py-8 px-4 text-center rounded-[10px] border border-dashed border-black/15 bg-neutral-50/50 flex flex-col items-center gap-2"
            >
              <p class="text-[13px] text-neutral-700 font-medium">No staff or devices assigned yet</p>
              <p class="text-[11.5px] text-neutral-500 max-w-[320px]">Assign door staff to tablets to enable ticket scanning for this campaign.</p>
              <button
                type="button"
                @click="activeTab = 'create'"
                class="mt-1 h-[30px] px-3.5 rounded-[6px] bg-black text-white text-[11.5px] font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Assign First Staff Member</span>
              </button>
            </div>

            <!-- Sleek Compact Account Cards -->
            <div
              v-for="a in accounts"
              :key="a.id"
              class="rounded-[10px] border border-black/10 bg-white p-3 flex flex-col gap-2 hover:border-black/20 transition-all shadow-2xs"
            >
              <!-- Top Row: Staff Name, Status Dot, Device Tag, Role Selector -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                  <span class="text-[13.5px] font-medium text-black truncate">{{ a.username }}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium border" :class="statusClass(a)">
                    <span class="size-1.5 rounded-full" :class="statusDotClass(a)" />
                    {{ statusLabel(a) }}
                  </span>
                  <span v-if="a.deviceLabel" class="inline-flex items-center gap-1 text-[11px] text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-[4px]">
                    <Tablet class="w-3 h-3 text-neutral-500" />
                    {{ a.deviceLabel }}
                  </span>
                  <span v-else class="text-[11px] text-neutral-400 italic">No device tag</span>
                </div>

                <!-- Station Role Selector -->
                <div class="shrink-0 flex items-center gap-1">
                  <span class="text-[11px] text-neutral-400 font-normal">Role:</span>
                  <select
                    :value="a.stationMode"
                    :disabled="busy"
                    @change="updateStationMode(a, ($event.target as HTMLSelectElement).value)"
                    class="h-[25px] px-2 rounded-[5px] text-[11px] font-medium border border-black/15 bg-neutral-50 hover:bg-white outline-none cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <option value="in">Entrance Only (In)</option>
                    <option value="out">Exit Only (Out)</option>
                    <option value="both">Dual (In & Out)</option>
                  </select>
                </div>
              </div>

              <!-- Bottom Row: Expiry Info, Quick Extensions, Actions -->
              <div class="flex items-center justify-between gap-2 pt-2 border-t border-black/5 text-[11.5px]">
                <div class="flex items-center gap-2 min-w-0 flex-wrap">
                  <span class="inline-flex items-center gap-1 text-[11px]" :class="expiryUrgencyClass(a)">
                    <Clock class="w-3 h-3" />
                    <span>{{ formatRemaining(a.expiresAt).text }}</span>
                    <span class="text-neutral-400">({{ formatWhen(a.expiresAt) }})</span>
                  </span>

                  <span class="text-neutral-300">·</span>

                  <!-- Quick Extension Pills -->
                  <div class="flex items-center gap-1">
                    <span class="text-neutral-400 text-[10.5px]">Extend:</span>
                    <button
                      type="button"
                      @click="extendHours(a, 4)"
                      :disabled="busy"
                      class="h-[22px] px-1.5 rounded-[4px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10.5px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                      title="Extend shift by 4 hours"
                    >
                      +4h
                    </button>
                    <button
                      type="button"
                      @click="extendHours(a, 24)"
                      :disabled="busy"
                      class="h-[22px] px-1.5 rounded-[4px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10.5px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                      title="Extend shift by 24 hours"
                    >
                      +1d
                    </button>
                  </div>
                </div>

                <!-- Account Actions -->
                <div class="flex items-center gap-1 shrink-0">
                  <template v-if="removing === a.id">
                    <button
                      type="button"
                      @click="removing = null"
                      class="h-[24px] px-2 rounded-[5px] border border-black/15 text-[11px] font-medium cursor-pointer hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      @click="remove(a)"
                      class="h-[24px] px-2 rounded-[5px] bg-oxblood-700 text-white text-[11px] font-medium cursor-pointer hover:bg-oxblood-800"
                    >
                      Confirm
                    </button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      @click="toggleSuspend(a)"
                      :disabled="busy"
                      class="h-[24px] px-2 rounded-[5px] border text-[11px] font-medium cursor-pointer transition-colors disabled:opacity-40"
                      :class="a.status === 'suspended' ? 'text-moss-700 border-moss-300 bg-moss-50 hover:bg-moss-100' : 'text-neutral-600 border-black/15 hover:bg-black/5'"
                    >
                      {{ a.status === 'suspended' ? 'Activate' : 'Suspend' }}
                    </button>
                    <button
                      type="button"
                      @click="resetPassword(a)"
                      :disabled="busy"
                      class="h-[24px] px-2 rounded-[5px] border border-black/15 text-[11px] font-medium text-neutral-600 hover:bg-black/5 cursor-pointer disabled:opacity-40"
                    >
                      New Passcode
                    </button>
                    <button
                      type="button"
                      @click="removing = a.id"
                      class="size-[24px] rounded-[5px] hover:bg-oxblood-50 text-neutral-400 hover:text-oxblood-700 flex items-center justify-center cursor-pointer transition-colors"
                      title="Delete account"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: ASSIGN NEW STAFF & STATION FORM -->
          <form v-else-if="activeTab === 'create'" class="flex flex-col gap-4 py-1" @submit.prevent="create">
            <div>
              <p class="text-[13.5px] font-medium text-black">New Staff Member & Station</p>
              <p class="text-[11.5px] text-neutral-500 mt-0.5">Generate single-event credentials bound to this campaign and station.</p>
            </div>

            <!-- Row 1: Name and Device Tag -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label class="flex flex-col gap-1">
                <span class="text-[11.5px] font-medium text-neutral-700">Staff Member Name / ID</span>
                <input
                  v-model="username"
                  type="text"
                  autocomplete="off"
                  autocapitalize="none"
                  spellcheck="false"
                  placeholder="e.g. Budi Santoso, Guard #1"
                  class="h-[36px] px-3 rounded-[7px] bg-white border border-black/15 text-[12.5px] outline-none focus:border-black transition-colors"
                />
              </label>

              <label class="flex flex-col gap-1">
                <span class="text-[11.5px] font-medium text-neutral-700">Device / Location Tag</span>
                <input
                  v-model="deviceLabel"
                  type="text"
                  autocomplete="off"
                  spellcheck="false"
                  placeholder="e.g. North Gate · Tab 1, VIP Desk"
                  class="h-[36px] px-3 rounded-[7px] bg-white border border-black/15 text-[12.5px] outline-none focus:border-black transition-colors"
                />
              </label>
            </div>

            <!-- Row 2: Station Role Segmented Control -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[11.5px] font-medium text-neutral-700">Station Role</span>
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="stationMode = 'in'"
                  class="h-[34px] px-2 rounded-[7px] border text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  :class="stationMode === 'in' ? 'bg-moss-700 text-white border-moss-700 shadow-2xs' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  <LogIn class="w-3.5 h-3.5" />
                  <span>Entrance (In)</span>
                </button>

                <button
                  type="button"
                  @click="stationMode = 'out'"
                  class="h-[34px] px-2 rounded-[7px] border text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  :class="stationMode === 'out' ? 'bg-neutral-800 text-white border-neutral-800 shadow-2xs' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>Exit (Out)</span>
                </button>

                <button
                  type="button"
                  @click="stationMode = 'both'"
                  class="h-[34px] px-2 rounded-[7px] border text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  :class="stationMode === 'both' ? 'bg-neutral-800 text-white border-neutral-800 shadow-2xs' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  <ArrowLeftRight class="w-3.5 h-3.5" />
                  <span>Dual (In & Out)</span>
                </button>
              </div>
            </div>

            <!-- Row 3: Shift Validity Duration Presets -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[11.5px] font-medium text-neutral-700">Shift Validity Duration</span>
                <span class="text-[11px] text-moss-700 font-medium">{{ expiryPreviewText }}</span>
              </div>

              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  v-for="p in presets"
                  :key="p.id"
                  type="button"
                  @click="applyPreset(p.id)"
                  class="h-[28px] px-2.5 rounded-[6px] border text-[11px] font-medium cursor-pointer transition-all"
                  :class="selectedPreset === p.id ? 'bg-black text-white border-black' : 'bg-white text-neutral-700 border-black/15 hover:border-black/30'"
                >
                  {{ p.label }}
                </button>
              </div>

              <!-- Custom datetime input -->
              <div v-if="selectedPreset === 'custom'" class="mt-1">
                <input
                  v-model="customExpires"
                  type="datetime-local"
                  class="h-[34px] px-3 rounded-[7px] bg-white border border-black/15 text-[12px] outline-none focus:border-black"
                />
              </div>
            </div>

            <p v-if="error" class="text-[12px] text-oxblood-700 font-medium">{{ error }}</p>

            <div class="flex items-center justify-between gap-3 pt-3 border-t border-black/10">
              <p class="text-[11px] text-neutral-500">Auto-generates a secure 12-char passcode shown once.</p>
              <button
                type="submit"
                :disabled="busy || !username.trim()"
                class="h-[34px] px-4 rounded-[8px] bg-black text-white text-[12.5px] font-medium cursor-pointer hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-default shrink-0 flex items-center gap-1.5 transition-colors"
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

const activeTab = ref<'assigned' | 'create'>('assigned');
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
    ? 'bg-bronze-50 text-bronze-800 border-bronze-200'
    : a.status === 'suspended'
    ? 'bg-oxblood-50 text-oxblood-700 border-oxblood-200'
    : 'bg-moss-50 text-moss-800 border-moss-200';

const statusDotClass = (a: GateAccount) =>
  isExpired(a) ? 'bg-bronze-600' : a.status === 'suspended' ? 'bg-oxblood-600' : 'bg-moss-600';

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
