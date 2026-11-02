<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 font-['Helvetica_Neue',Helvetica,Arial,sans-serif] tracking-normal select-none"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[640px] max-h-[88vh] rounded-[16px] bg-white border border-black/10 shadow-[0px_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-black/5">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
              <Shield class="w-3.5 h-3.5 text-moss-700" />
              <span>Door Scanner Stations</span>
            </div>
            <p class="text-[18px] font-medium leading-tight truncate text-black mt-0.5">{{ projectTitle }}</p>
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

        <!-- 2 Concept C Tabs: Assigned Devices vs Add Device -->
        <div class="flex items-center gap-6 px-6 border-b border-black/10 bg-white">
          <button
            type="button"
            @click="activeTab = 'stations'"
            style="outline: none; box-shadow: none; -webkit-tap-highlight-color: transparent;"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-0 bg-transparent select-none"
            :class="activeTab === 'stations' ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black font-normal'"
          >
            <span>Assigned Devices</span>
            <span
              class="px-1.5 py-0.2 rounded-full text-[10.5px] tabular-nums"
              :class="activeTab === 'stations' ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'"
            >
              {{ accounts.length }}
            </span>
            <span
              v-if="activeTab === 'stations'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full pointer-events-none"
            />
          </button>

          <button
            type="button"
            @click="activeTab = 'create'"
            style="outline: none; box-shadow: none; -webkit-tap-highlight-color: transparent;"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-0 bg-transparent select-none"
            :class="activeTab === 'create' ? 'text-black font-semibold' : 'text-neutral-500 hover:text-black font-normal'"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Device & Assign PIC</span>
            <span
              v-if="activeTab === 'create'"
              class="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full pointer-events-none"
            />
          </button>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 overflow-y-auto flex flex-col gap-4">
          <!-- Credentials Banner: Shown once upon account create or password reset -->
          <div v-if="credentials" class="rounded-[12px] bg-black text-white p-4 flex flex-col gap-3 shadow-md animate-apple-pop">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-moss-400 text-[11.5px] font-medium">
                <Check class="w-3.5 h-3.5" />
                <span>{{ credentials.reset ? 'New Passcode Ready' : 'Device Registered & Passcode Ready' }}</span>
              </div>
              <span class="text-[10px] text-white/50">Shown once only</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-[8px] bg-white/[0.08]">
              <div class="min-w-0 flex-1 pr-3">
                <div class="flex items-center gap-1.5">
                  <Tablet class="w-3.5 h-3.5 text-neutral-400" />
                  <span class="text-[13.5px] font-semibold text-white truncate">{{ credentials.deviceLabel || credentials.username }}</span>
                </div>
                <p class="text-[12px] text-neutral-300 mt-0.5">
                  PIC: <strong class="text-white font-medium">{{ credentials.username }}</strong>
                  <span class="mx-1 text-white/40">·</span>
                  <span class="text-moss-300">
                    {{ credentials.stationMode === 'in' ? 'Entrance Only' : credentials.stationMode === 'out' ? 'Exit Only' : 'Dual (In & Out)' }}
                  </span>
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-[10px] uppercase text-white/50 block">Passcode</span>
                <span class="text-[18px] font-mono font-bold tracking-wider text-white select-all">{{ credentials.password }}</span>
              </div>
            </div>

            <div class="flex items-center justify-between gap-3 text-[11.5px] text-white/70">
              <span class="truncate">Sign in on tablet at <strong class="text-white">{{ loginUrl }}</strong></span>
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

          <!-- TAB 1: SCANNER STATIONS (Concept C Physical Tablet Cards) -->
          <div v-if="activeTab === 'stations'" class="flex flex-col gap-3">
            <!-- Header bar with Quick Add shortcut -->
            <div class="flex items-center justify-between text-[11.5px] text-neutral-400 px-0.5">
              <span>Physical Scanner Devices ({{ accounts.length }})</span>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  @click="load"
                  :disabled="loading || busy"
                  class="hover:text-black flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <RefreshCw class="w-3 h-3" :class="loading ? 'animate-spin' : ''" />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  @click="activeTab = 'create'"
                  class="text-black font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus class="w-3 h-3" />
                  <span>Add Device</span>
                </button>
              </div>
            </div>

            <p v-if="loading" class="text-[12.5px] text-neutral-400 py-10 text-center">Loading scanner devices…</p>

            <!-- Empty state -->
            <div
              v-else-if="!accounts.length"
              class="py-12 px-4 text-center rounded-[12px] border border-dashed border-black/15 bg-neutral-50/50 flex flex-col items-center gap-2.5"
            >
              <div class="size-11 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Tablet class="w-5 h-5" />
              </div>
              <p class="text-[13.5px] text-neutral-800 font-medium">No scanner devices added yet</p>
              <p class="text-[12px] text-neutral-400 max-w-[280px]">Add physical tablets and assign the staff members (PIC) in charge of scanning at each gate.</p>
              <button
                type="button"
                @click="activeTab = 'create'"
                class="mt-1 h-[32px] px-4 rounded-[7px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Add First Device</span>
              </button>
            </div>

            <!-- Concept C Visual Device Cards Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="a in accounts"
                :key="a.id"
                class="rounded-[14px] border border-black/10 bg-white p-3.5 shadow-2xs hover:border-black/25 transition-all flex flex-col justify-between gap-3"
              >
                <!-- Card Top: Tablet Icon + Device Name + Status + More Menu -->
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <div class="size-[36px] rounded-[10px] bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                      <Tablet class="w-4 h-4" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <h4 class="text-[13.5px] font-semibold text-black truncate">{{ a.deviceLabel || a.username }}</h4>
                        <span class="inline-flex items-center gap-1 text-[10.5px]" :class="statusClass(a)">
                          <span class="size-1.5 rounded-full" :class="statusDotClass(a)" />
                          <span>{{ statusLabel(a) }}</span>
                        </span>
                      </div>

                      <!-- Assigned PIC Display or Inline Edit -->
                      <div v-if="editingPicId === a.id" class="flex items-center gap-1 mt-1">
                        <input
                          v-model="editPicName"
                          type="text"
                          placeholder="PIC Name"
                          class="h-[24px] px-1.5 rounded-[4px] border border-black/20 text-[11px] outline-none w-full"
                          @keydown.enter="savePic(a)"
                        />
                        <button type="button" @click="savePic(a)" class="h-[24px] px-2 rounded-[4px] bg-black text-white text-[10.5px] font-medium cursor-pointer">OK</button>
                        <button type="button" @click="editingPicId = null" class="h-[24px] px-1.5 rounded-[4px] border text-[10.5px] cursor-pointer">✕</button>
                      </div>
                      <p v-else class="text-[11.5px] text-neutral-500 mt-0.5 flex items-center gap-1 truncate">
                        <User class="w-3 h-3 text-neutral-400 shrink-0" />
                        <span class="truncate">PIC: <strong class="text-neutral-800 font-medium">{{ a.username }}</strong></span>
                      </p>
                    </div>
                  </div>

                  <!-- 3-Dot Overflow Menu -->
                  <div class="relative shrink-0 overflow-menu-container">
                    <button
                      type="button"
                      @click.stop="openMenuId = openMenuId === a.id ? null : a.id"
                      class="size-[26px] rounded-[6px] hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
                      title="Options"
                    >
                      <MoreHorizontal class="w-3.5 h-3.5" />
                    </button>

                    <!-- Dropdown Popover -->
                    <div
                      v-if="openMenuId === a.id"
                      class="absolute right-0 top-[calc(100%+4px)] z-30 w-[170px] bg-white border border-black/10 rounded-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] p-1 flex flex-col gap-0.5 text-[11.5px] animate-apple-pop"
                    >
                      <button
                        type="button"
                        @click="startEditPic(a); openMenuId = null"
                        class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                      >
                        <Edit3 class="w-3.5 h-3.5 text-neutral-400" />
                        <span>Edit PIC Handler</span>
                      </button>

                      <button
                        type="button"
                        @click="extendHours(a, 8); openMenuId = null"
                        class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                      >
                        <Clock class="w-3.5 h-3.5 text-neutral-400" />
                        <span>Extend +8 Hours</span>
                      </button>

                      <button
                        type="button"
                        @click="resetPassword(a); openMenuId = null"
                        class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                      >
                        <KeyRound class="w-3.5 h-3.5 text-neutral-400" />
                        <span>Reset Passcode</span>
                      </button>

                      <button
                        type="button"
                        @click="toggleSuspend(a); openMenuId = null"
                        class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                      >
                        <Shield class="w-3.5 h-3.5 text-neutral-400" />
                        <span>{{ a.status === 'suspended' ? 'Activate Device' : 'Suspend Tablet' }}</span>
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

                <!-- Card Center: Tactile Gate Role Switcher -->
                <div class="flex flex-col gap-1">
                  <div class="flex items-center justify-between text-[10.5px] text-neutral-400">
                    <span>Gate Mode</span>
                    <span class="font-medium" :class="a.stationMode === 'in' ? 'text-moss-700' : 'text-neutral-700'">
                      {{ a.stationMode === 'in' ? 'Check-in only' : a.stationMode === 'out' ? 'Check-out only' : 'Flexible In & Out' }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-1 p-0.5 rounded-[7px] bg-neutral-100 text-[11px] font-medium">
                    <button
                      type="button"
                      @click="updateStationMode(a, 'in')"
                      class="h-[28px] rounded-[5px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      :class="a.stationMode === 'in' ? 'bg-white text-black shadow-2xs font-semibold' : 'text-neutral-500 hover:text-black'"
                    >
                      <LogIn class="w-3 h-3" :class="a.stationMode === 'in' ? 'text-moss-700' : 'text-neutral-400'" />
                      <span>Entrance</span>
                    </button>
                    <button
                      type="button"
                      @click="updateStationMode(a, 'out')"
                      class="h-[28px] rounded-[5px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      :class="a.stationMode === 'out' ? 'bg-white text-black shadow-2xs font-semibold' : 'text-neutral-500 hover:text-black'"
                    >
                      <LogOut class="w-3 h-3" :class="a.stationMode === 'out' ? 'text-neutral-800' : 'text-neutral-400'" />
                      <span>Exit</span>
                    </button>
                    <button
                      type="button"
                      @click="updateStationMode(a, 'both')"
                      class="h-[28px] rounded-[5px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      :class="a.stationMode === 'both' ? 'bg-white text-black shadow-2xs font-semibold' : 'text-neutral-500 hover:text-black'"
                    >
                      <ArrowLeftRight class="w-3 h-3" :class="a.stationMode === 'both' ? 'text-neutral-800' : 'text-neutral-400'" />
                      <span>Dual</span>
                    </button>
                  </div>
                </div>

                <!-- Card Bottom: Shift Validity & Get Passcode -->
                <div class="flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <div class="flex items-center gap-1 text-neutral-400 truncate">
                    <Clock class="w-3 h-3 shrink-0" />
                    <span class="truncate">{{ isExpired(a) ? `Expired ${formatAgo(a.expiresAt)}` : `Until ${formatWhen(a.expiresAt)}` }}</span>
                  </div>

                  <button
                    type="button"
                    @click="resetPassword(a)"
                    class="h-[25px] px-2 rounded-[5px] border border-black/15 bg-white hover:bg-neutral-50 text-neutral-700 text-[10.5px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
                    title="Generate new passcode for this device"
                  >
                    <KeyRound class="w-3 h-3 text-neutral-500" />
                    <span>Passcode</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: ADD DEVICE & ASSIGN PIC (Focused Concept C Form) -->
          <form v-else-if="activeTab === 'create'" class="flex flex-col gap-4 py-1" @submit.prevent="create">
            <div>
              <p class="text-[13.5px] font-medium text-black">Add Scanner Device</p>
              <p class="text-[11.5px] text-neutral-500 mt-0.5">Register a physical tablet station and assign the staff member handling it.</p>
            </div>

            <!-- Field 1: Device Name with Quick Suggestions -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <span class="text-[12px] font-medium text-neutral-800">Device / Tablet Station Name</span>
                <div class="flex items-center gap-1">
                  <button
                    v-for="sug in deviceSuggestions"
                    :key="sug"
                    type="button"
                    @click="deviceLabel = sug"
                    class="text-[10.5px] px-1.5 py-0.5 rounded-[4px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 cursor-pointer"
                  >
                    {{ sug }}
                  </button>
                </div>
              </div>
              <input
                v-model="deviceLabel"
                type="text"
                autocomplete="off"
                placeholder="e.g. Tablet #1, North Gate Tab, VIP Station"
                class="h-[38px] px-3.5 rounded-[8px] bg-neutral-50 hover:bg-white focus:bg-white border border-black/15 focus:border-black text-[13px] outline-none transition-all"
              />
            </div>

            <!-- Field 2: Assigned PIC (Handler) -->
            <label class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium text-neutral-800">Assigned Staff Member (PIC)</span>
              <input
                v-model="username"
                type="text"
                autocomplete="off"
                placeholder="e.g. Budi Santoso, Guard Andi, Siti"
                class="h-[38px] px-3.5 rounded-[8px] bg-neutral-50 hover:bg-white focus:bg-white border border-black/15 focus:border-black text-[13px] outline-none transition-all"
              />
            </label>

            <!-- Field 3: Station Role -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[12px] font-medium text-neutral-800">Station Role</span>
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

            <!-- Field 4: Shift Validity Duration (Smart Default) -->
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

            <!-- Optional Custom Presets -->
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
                Register Device & Passcode
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
  KeyRound,
  Tablet,
  User,
  Edit3
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

const activeTab = ref<'stations' | 'create'>('stations');
const accounts = ref<GateAccount[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const openMenuId = ref<string | null>(null);
const credentials = ref<CredentialsState | null>(null);

// Form state
const deviceLabel = ref('Tablet #1');
const username = ref('');
const stationMode = ref<'in' | 'out' | 'both'>('in');
const showCustomDuration = ref(false);

const deviceSuggestions = ['Tablet #1', 'Tablet #2', 'Tablet #3', 'VIP Gate', 'North Gate'];

// Inline edit state
const editingPicId = ref<string | null>(null);
const editPicName = ref('');

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
    // Auto increment suggestion for next device
    const nextNum = accounts.value.length + 1;
    deviceLabel.value = `Tablet #${nextNum}`;
  } catch (err: any) {
    error.value = err?.message || 'Could not load scanner devices.';
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
    const picName = username.value.trim();
    const devName = deviceLabel.value.trim() || `Tablet #${accounts.value.length + 1}`;
    
    const json = await call('/api/gate-accounts', {
      method: 'POST',
      body: JSON.stringify({
        project: props.projectId,
        username: picName,
        deviceLabel: devName,
        stationMode: stationMode.value,
        expiresAt: at.toISOString()
      })
    });
    credentials.value = {
      username: json.data.username,
      password: json.password,
      stationMode: json.data.stationMode || stationMode.value,
      deviceLabel: json.data.deviceLabel || devName,
      reset: false
    };
    username.value = '';
    showCustomDuration.value = false;
    applyPreset('eod');
    await load();
    activeTab.value = 'stations';
  } catch (err: any) {
    error.value = err?.message || 'Could not register the device.';
  } finally {
    busy.value = false;
  }
}

function startEditPic(a: GateAccount) {
  editingPicId.value = a.id;
  editPicName.value = a.username;
}

async function savePic(a: GateAccount) {
  if (!editPicName.value.trim()) return;
  busy.value = true;
  try {
    await patch(a, { username: editPicName.value.trim() }, `PIC updated to ${editPicName.value.trim()}.`);
    editingPicId.value = null;
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
    activeTab.value = 'stations';
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
    a.status === 'suspended' ? `${a.deviceLabel || a.username} activated.` : `${a.deviceLabel || a.username} suspended.`
  );

function extendHours(a: GateAccount, hours: number) {
  const base = Math.max(Date.now(), a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
  const target = new Date(base + hours * 3600 * 1000).toISOString();
  return patch(a, { expiresAt: target }, `${a.deviceLabel || a.username} shift extended by +${hours}h.`);
}

async function updateStationMode(a: GateAccount, newMode: 'in' | 'out' | 'both') {
  if (a.stationMode === newMode) return;
  const label = newMode === 'in' ? 'Entrance' : newMode === 'out' ? 'Exit' : 'Dual';
  await patch(a, { stationMode: newMode }, `${a.deviceLabel || a.username} set to ${label}.`);
}

async function remove(a: GateAccount) {
  busy.value = true;
  try {
    await call(`/api/gate-accounts/${encodeURIComponent(a.id)}`, { method: 'DELETE' });
    await load();
    emit('toast', `${a.deviceLabel || a.username} removed.`);
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
    `Device: ${credentials.value.deviceLabel || credentials.value.username}`,
    `Assigned PIC: ${credentials.value.username}`,
    `Station Role: ${roleLabel}`,
    `Passcode: ${credentials.value.password}`,
    `Sign In: ${loginUrl.value}`
  ];

  try {
    await navigator.clipboard.writeText(lines.join('\n'));
    emit('toast', 'Device login details copied to clipboard.');
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
