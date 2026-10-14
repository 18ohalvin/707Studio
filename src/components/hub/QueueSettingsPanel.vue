<template>
  <div class="w-full flex flex-col gap-6 font-707">
    <!-- Header banner -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-[16px] border border-black/10 bg-white">
      <div>
        <div class="flex items-center gap-2">
          <p class="text-[11px] uppercase tracking-[0.14em] text-neutral-500 font-medium">Traffic & Capacity Architecture</p>
          <span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-moss-50 text-moss-700 border border-moss-200">
            Queue System Active
          </span>
        </div>
        <h2 class="text-[24px] font-medium tracking-tight mt-1">Live Capacity & Queue Settings</h2>
        <p class="text-[13.5px] text-neutral-500 max-w-[640px] mt-1 leading-relaxed">
          Manage real-time venue capacity limits, advance queue progression, and configure automated WhatsApp messaging.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="loadSettings"
          :disabled="isLoading"
          class="h-[40px] px-4 rounded-[10px] border border-black/15 bg-white text-[13px] font-medium hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw class="w-4 h-4" :class="isLoading ? 'animate-spin' : ''" />
          <span>Reset</span>
        </button>
        <button
          type="button"
          @click="saveSettings"
          :disabled="isSaving"
          class="apple-cta-btn h-[40px] px-5 rounded-[10px] bg-black text-white text-[13px] font-medium cursor-pointer disabled:opacity-40 flex items-center gap-2 transition-all"
        >
          <Check class="w-4 h-4" />
          <span>{{ isSaving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>

    <!-- 1. Top Section: 2 Ergonomic Cards (Live Calling Station vs Queue Rules) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Card A: Live Calling Station (Operations) -->
      <div class="p-6 rounded-[16px] border border-black/10 bg-white flex flex-col justify-between gap-6">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Live Queue Caller</span>
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/5 text-neutral-700 border border-black/10">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Calling Station
            </span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-3">
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-[42px] leading-none font-medium font-mono tabular-nums text-black">#{{ form.currentCalledNumber }}</span>
                <span class="text-[13px] text-neutral-500 font-medium">Serving Now</span>
              </div>
              <p class="text-[12.5px] text-neutral-400 mt-1.5 leading-snug">
                Advancing the caller triggers approaching alerts and automatically expires bypassed tickets.
              </p>
            </div>

            <!-- Headcount & Capacity Progress -->
            <div class="sm:text-right flex flex-col gap-1 sm:items-end">
              <span class="text-[11px] uppercase tracking-[0.1em] text-neutral-500 font-medium">Inside Headcount</span>
              <span class="text-[18px] font-semibold font-mono tabular-nums text-black">
                {{ insideCount }} <span class="text-neutral-400 font-normal text-[14px]">/ {{ form.maxCapacity }}</span>
                <span class="ml-1.5 text-[12px] font-medium" :style="{ color: barColor }">({{ capacityPercent }}%)</span>
              </span>
            </div>
          </div>

          <!-- Capacity Bar -->
          <div class="w-full mt-4 flex flex-col gap-1.5">
            <div class="w-full h-[6px] bg-black/[0.06] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${capacityPercent}%`, backgroundColor: barColor }"
              />
            </div>
            <div class="flex items-center justify-between text-[11.5px] text-neutral-500">
              <span>{{ waitingCount }} guests waiting in line</span>
              <span v-if="capacityPercent >= 100" class="text-oxblood-600 font-medium">Venue full (Locked)</span>
              <span v-else>{{ Math.max(0, form.maxCapacity - insideCount) }} capacity spots left</span>
            </div>
          </div>
        </div>

        <!-- Calling Action Buttons -->
        <div class="flex items-center gap-2.5 pt-4 border-t border-black/5">
          <button
            type="button"
            @click="stepCaller(-1)"
            :disabled="form.currentCalledNumber <= 1"
            class="h-[44px] px-4 rounded-[10px] border border-black/15 bg-white text-[13.5px] font-medium hover:bg-black/5 disabled:opacity-30 transition-colors cursor-pointer"
            title="Step back to previous number"
          >
            -1 Step Back
          </button>

          <button
            type="button"
            @click="stepCaller(1)"
            class="apple-cta-btn flex-1 h-[44px] px-5 rounded-[10px] bg-black text-white text-[13.5px] font-medium cursor-pointer hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
          >
            <Volume2 class="w-4 h-4" />
            <span>Call Next (#{{ form.currentCalledNumber + 1 }})</span>
          </button>
        </div>
      </div>

      <!-- Card B: Capacity & Queue Rules (Configuration) -->
      <div class="p-6 rounded-[16px] border border-black/10 bg-white flex flex-col justify-between gap-5">
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Queue & Capacity Rules</span>
            <span class="text-[11px] text-neutral-400">Venue Limits</span>
          </div>

          <div class="flex flex-col gap-4">
            <!-- Rule 1: Max Capacity -->
            <div class="flex items-start justify-between gap-4 p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5">
              <div class="flex items-start gap-3 min-w-0">
                <div class="size-8 rounded-[8px] bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Users class="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <label for="queue-max-capacity" class="text-[13px] font-medium text-black block">Maximum Venue Capacity</label>
                  <p class="text-[12px] text-neutral-500 leading-snug mt-0.5">
                    Safe ceiling of visitors inside. Scanner strictly locks admission when full.
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <input
                  id="queue-max-capacity"
                  v-model.number="form.maxCapacity"
                  type="number"
                  min="1"
                  max="2000"
                  class="w-[72px] h-[38px] px-2.5 rounded-[8px] border border-black/15 bg-white text-[16px] font-medium font-mono tabular-nums text-center text-black outline-none focus:border-black"
                />
                <span class="text-[12px] text-neutral-500">pax</span>
              </div>
            </div>

            <!-- Rule 2: Alert Threshold Distance -->
            <div class="flex items-start justify-between gap-4 p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5">
              <div class="flex items-start gap-3 min-w-0">
                <div class="size-8 rounded-[8px] bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                  <BellRing class="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <label for="queue-notify-threshold" class="text-[13px] font-medium text-black block">Approaching Alert Window</label>
                  <p class="text-[12px] text-neutral-500 leading-snug mt-0.5">
                    Triggers approaching alerts this many numbers before a guest's turn.
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <input
                  id="queue-notify-threshold"
                  v-model.number="form.notifyThreshold"
                  type="number"
                  min="1"
                  max="100"
                  class="w-[72px] h-[38px] px-2.5 rounded-[8px] border border-black/15 bg-white text-[16px] font-medium font-mono tabular-nums text-center text-black outline-none focus:border-black"
                />
                <span class="text-[12px] text-neutral-500">ahead</span>
              </div>
            </div>

            <!-- Rule 3: Skipped Tolerance -->
            <div class="flex items-start justify-between gap-4 p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5">
              <div class="flex items-start gap-3 min-w-0">
                <div class="size-8 rounded-[8px] bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock class="w-4 h-4 text-neutral-600" />
                </div>
                <div>
                  <label for="queue-skipped-tolerance" class="text-[13px] font-medium text-black block">Missed Turn Grace Limit</label>
                  <p class="text-[12px] text-neutral-500 leading-snug mt-0.5">
                    Tickets skipped past this margin are expired to prevent stalled lines.
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <input
                  id="queue-skipped-tolerance"
                  v-model.number="form.skippedTolerance"
                  type="number"
                  min="1"
                  max="50"
                  class="w-[72px] h-[38px] px-2.5 rounded-[8px] border border-black/15 bg-white text-[16px] font-medium font-mono tabular-nums text-center text-black outline-none focus:border-black"
                />
                <span class="text-[12px] text-neutral-500">turns</span>
              </div>
            </div>
          </div>
        </div>

        <div class="pt-2 text-[11.5px] text-neutral-400 flex items-center justify-between">
          <span>Changes take effect on all scanner stations immediately upon saving.</span>
        </div>
      </div>
    </div>

    <!-- 2. Option 1: WhatsApp Notification Section with Dedicated Apple-Style Toggle Switch -->
    <div class="p-6 rounded-[16px] border border-black/10 bg-white flex flex-col gap-6">
      <!-- Master Toggle Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4" :class="form.waEnabled ? 'border-b border-black/10' : ''">
        <div class="flex items-start gap-3.5">
          <div
            class="size-10 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 transition-colors"
            :class="form.waEnabled ? 'bg-emerald-600 text-white shadow-sm' : 'bg-black/5 text-neutral-400'"
          >
            <MessageSquare class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-[17px] font-medium tracking-tight text-black">Automated WhatsApp Notifications</h3>
              <span
                class="text-[10.5px] uppercase tracking-[0.1em] font-mono px-2 py-0.5 rounded-full border transition-colors"
                :class="form.waEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'"
              >
                {{ form.waEnabled ? 'Active' : 'Disabled' }}
              </span>
            </div>
            <p class="text-[13px] text-neutral-500 mt-0.5 leading-relaxed max-w-[620px]">
              Dispatch automated WhatsApp messages to customer phones for queue confirmation, approaching turn alerts, and ticket passes.
            </p>
          </div>
        </div>

        <!-- Apple-style Toggle Switch -->
        <div class="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <span class="text-[12.5px] font-medium" :class="form.waEnabled ? 'text-black' : 'text-neutral-400'">
            {{ form.waEnabled ? 'Enabled' : 'Off' }}
          </span>
          <button
            type="button"
            role="switch"
            :aria-checked="form.waEnabled"
            @click="form.waEnabled = !form.waEnabled"
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
            :class="form.waEnabled ? 'bg-black' : 'bg-neutral-200'"
            title="Toggle WhatsApp Notifications on or off"
          >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block size-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out"
              :class="form.waEnabled ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>

      <!-- State A: Disabled (Clean, zero cognitive overload) -->
      <div v-if="!form.waEnabled" class="p-4 rounded-[12px] bg-neutral-50 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12.5px] text-neutral-500">
        <div class="flex items-center gap-2.5">
          <BellOff class="w-4 h-4 text-neutral-400 shrink-0" />
          <span>WhatsApp notifications are turned off for this campaign. The queue operates strictly on-screen and at the door without sending outbound messages.</span>
        </div>
        <button
          type="button"
          @click="form.waEnabled = true"
          class="text-[12px] font-medium text-black underline underline-offset-2 hover:opacity-70 cursor-pointer shrink-0"
        >
          Enable Notifications
        </button>
      </div>

      <!-- State B: Enabled (Full Journey Stepper & 100% English Template Editor + Live Preview) -->
      <template v-else>
        <!-- Lifecycle Stepper Tabs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            v-for="(stage, idx) in STAGES"
            :key="stage.id"
            type="button"
            @click="activeStageId = stage.id"
            class="p-3.5 rounded-[12px] border text-left transition-all cursor-pointer flex flex-col gap-1 relative"
            :class="activeStageId === stage.id ? 'bg-black text-white border-black shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-800'"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-[0.1em]" :class="activeStageId === stage.id ? 'text-white/70' : 'text-neutral-400'">
                Stage {{ idx + 1 }}
              </span>
              <component :is="stage.icon" class="w-3.5 h-3.5" :class="activeStageId === stage.id ? 'text-white' : 'text-neutral-500'" />
            </div>
            <span class="text-[13px] font-medium leading-snug">{{ stage.title }}</span>
            <span class="text-[11px] truncate" :class="activeStageId === stage.id ? 'text-white/60' : 'text-neutral-500'">
              {{ stage.triggerSummary }}
            </span>
          </button>
        </div>

        <!-- Stage Editor + Live Smartphone Preview -->
        <div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start pt-2">
          <!-- Left: Template Textarea Editor -->
          <div class="flex flex-col gap-4">
            <div class="p-4 rounded-[12px] bg-black/[0.02] border border-black/5 flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <span class="text-[13px] font-medium text-black">{{ currentStage.title }}</span>
                <span class="text-[11px] font-mono text-neutral-500 bg-black/5 px-2 py-0.5 rounded-[6px]">{{ currentStage.triggerBadge }}</span>
              </div>
              <p class="text-[12.5px] text-neutral-500 leading-snug mt-0.5">
                {{ currentStage.description }}
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label for="template-editor" class="text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                  English Template Copy
                </label>
                <span class="text-[11px] text-neutral-400 font-mono">
                  {{ form.waTemplates[activeStageId]?.length || 0 }} characters
                </span>
              </div>

              <textarea
                id="template-editor"
                v-model="form.waTemplates[activeStageId]"
                rows="5"
                class="w-full p-3.5 rounded-[12px] bg-black/[0.02] border border-black/15 text-[13.5px] leading-relaxed font-707 outline-none focus:border-black focus:bg-white transition-all resize-y text-black placeholder:text-neutral-400"
                placeholder="Enter English WhatsApp message template..."
              />
            </div>

            <!-- Dynamic Tag Pills -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-medium">Insert Dynamic Variables:</span>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="tag in currentStage.tags"
                  :key="tag.key"
                  type="button"
                  @click="insertTag(tag.key)"
                  class="px-2.5 py-1 rounded-[8px] bg-black/5 hover:bg-black/10 border border-black/5 text-[11.5px] font-medium text-neutral-800 cursor-pointer flex items-center gap-1 transition-colors"
                  :title="tag.description"
                >
                  <span>+ {{ tag.label }}</span>
                  <span class="text-[10px] text-neutral-400 font-mono">&#123;&#123;{{ tag.key }}&#125;&#125;</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Elegant Smartphone WhatsApp Chat Bubble Preview -->
          <div class="rounded-[16px] border border-black/10 bg-[#f4f2ec] overflow-hidden shadow-sm flex flex-col">
            <!-- Chat Header -->
            <div class="bg-[#0b5c49] text-white px-4 py-3 flex items-center gap-3">
              <div class="size-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-[12px] text-white shrink-0">
                707
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <span class="text-[13px] font-medium truncate">707 Activation Hub</span>
                  <ShieldCheck class="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                </div>
                <span class="text-[10.5px] text-white/70 block truncate">Official Verified Account</span>
              </div>
            </div>

            <!-- Chat Body Wallpaper -->
            <div class="p-4 min-h-[200px] flex flex-col justify-end gap-2 bg-[#efeae2]/60">
              <div class="text-center my-1">
                <span class="px-2 py-0.5 rounded-[6px] bg-white/80 text-[10px] font-medium text-neutral-500 shadow-2xs">
                  Today
                </span>
              </div>

              <!-- WhatsApp Message Bubble (English) -->
              <div class="max-w-[92%] self-start bg-white rounded-[12px] rounded-tl-[4px] p-3 shadow-2xs border border-black/5 flex flex-col gap-1.5 text-left">
                <p class="text-[12.5px] leading-relaxed text-neutral-800 whitespace-pre-wrap select-text">
                  {{ renderedPreviewText }}
                </p>
                <div class="flex items-center justify-end gap-1 text-[10px] text-neutral-400 mt-0.5">
                  <span>{{ previewTime }}</span>
                  <span class="text-sky-500 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            <!-- Chat Footer Info -->
            <div class="px-3.5 py-2 bg-white/70 border-t border-black/5 text-[11px] text-neutral-500 flex items-center justify-between">
              <span class="flex items-center gap-1">
                <Smartphone class="w-3.5 h-3.5 text-neutral-400" />
                English Guest Preview
              </span>
              <span class="text-[10.5px] text-neutral-400">Sample: Sarah (Party: 2)</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  RefreshCw,
  Check,
  Users,
  BellRing,
  BellOff,
  Clock,
  Volume2,
  MessageSquare,
  Smartphone,
  ShieldCheck,
  QrCode,
  UserCheck,
  Ban
} from 'lucide-vue-next';
import {
  fetchQueueSettings,
  saveQueueSettingsApi,
  callNextQueue,
  totalInsideGuests,
  normalizeStatus,
  type Submission,
  type QueueSettingsData
} from './hubUtils.ts';

type StageId = 'welcome' | 'approaching' | 'ready' | 'expired';

interface StageDefinition {
  id: StageId;
  title: string;
  triggerSummary: string;
  triggerBadge: string;
  description: string;
  icon: any;
  tags: { key: string; label: string; description: string }[];
}

const props = defineProps<{
  pageId: string;
  rows?: Submission[];
}>();

const emit = defineEmits<{
  (e: 'toast', msg: string): void;
}>();

const isLoading = ref(false);
const isSaving = ref(false);
const activeStageId = ref<StageId>('approaching');

const form = reactive<QueueSettingsData>({
  enabled: true,
  waEnabled: false,
  maxCapacity: 50,
  notifyThreshold: 10,
  skippedTolerance: 5,
  currentCalledNumber: 1,
  waTemplates: {
    welcome: 'Hello {{name}}! You are registered in the queue with Queue Number #{{queue_number}} (Party: {{party_size}} guests). Track your live status here: {{link}}',
    approaching: 'Hello {{name}}! Your turn is approaching. The queue is currently serving near your number (#{{queue_number}}). Please proceed to the entrance area now.',
    ready: 'Hello {{name}}! It is your turn to enter. Please present your Access ID {{access_id}} to the door staff at the entrance.',
    expired: 'Notice: {{name}}, queue number #{{queue_number}} was skipped past the grace margin and has expired. Please check in with event staff or register again to rejoin.'
  }
});

const STAGES: StageDefinition[] = [
  {
    id: 'welcome',
    title: '1. Welcome & Pass',
    triggerSummary: 'Trigger: OTS Form Submit',
    triggerBadge: 'Trigger: Instant on Registration',
    description: 'Sent immediately when a visitor submits the registration form to confirm their queue number and ticket pass.',
    icon: QrCode,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'party_size', label: 'Party Size', description: 'Number of people in group' },
      { key: 'access_id', label: 'Access ID', description: 'Ticket pass code' },
      { key: 'link', label: 'Pass Link', description: 'Direct URL to view ticket status' }
    ]
  },
  {
    id: 'approaching',
    title: '2. Approaching Alert',
    triggerSummary: 'Trigger: Queue within Threshold',
    triggerBadge: 'Trigger: Distance Threshold Reached',
    description: 'Sent when the live caller reaches within the alert distance of this guest, telling them to return to the entrance.',
    icon: BellRing,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'current_called', label: 'Currently Serving', description: 'The active called number right now' },
      { key: 'party_size', label: 'Party Size', description: 'Number of people in group' }
    ]
  },
  {
    id: 'ready',
    title: '3. Ready for Entry',
    triggerSummary: 'Trigger: Turn Called Now',
    triggerBadge: 'Trigger: Guest Number Called',
    description: 'Sent when the guest number is called to step inside the booth and present their pass to the door staff.',
    icon: UserCheck,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'access_id', label: 'Access ID', description: 'Ticket pass code' }
    ]
  },
  {
    id: 'expired',
    title: '4. Missed / Expired',
    triggerSummary: 'Trigger: Grace Margin Exceeded',
    triggerBadge: 'Trigger: Skipped Beyond Tolerance',
    description: 'Sent when a guest misses their turn beyond the grace tolerance limit, informing them to re-queue if desired.',
    icon: Ban,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'skipped_tolerance', label: 'Grace Limit', description: 'Configured skipped tolerance limit' }
    ]
  }
];

const currentStage = computed(() => STAGES.find(s => s.id === activeStageId.value) || STAGES[0]);

/* Live Headcount Computations */
const insideCount = computed(() => {
  if (props.rows && props.rows.length) {
    return totalInsideGuests(props.rows);
  }
  return 0;
});

const waitingCount = computed(() => {
  if (!props.rows) return 0;
  return props.rows.filter(r => {
    const st = normalizeStatus(r.status);
    return !r.checked_in_at && !['declined', 'waitlisted'].includes(st) && (r.queue_number || 0) > form.currentCalledNumber;
  }).length;
});

const capacityPercent = computed(() => {
  const max = Math.max(1, form.maxCapacity || 50);
  return Math.min(100, Math.round((insideCount.value / max) * 100));
});

const barColor = computed(() => {
  if (capacityPercent.value >= 100) return '#7e2c32'; // Oxblood
  if (capacityPercent.value >= 80) return '#8f7c50';  // Bronze
  return '#7b8b67';                                    // Pale Moss
});

/* Live Preview */
const previewTime = computed(() => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
});

const renderedPreviewText = computed(() => {
  const raw = form.waTemplates[activeStageId.value] || '';
  const sampleData: Record<string, string | number> = {
    name: 'Sarah Jenkins',
    queue_number: activeStageId.value === 'approaching' ? form.currentCalledNumber + 4 : form.currentCalledNumber,
    current_called: form.currentCalledNumber,
    party_size: 2,
    access_id: 'STAN-8842',
    skipped_tolerance: form.skippedTolerance || 5,
    link: 'https://707.studio/pass/STAN-8842'
  };

  let rendered = raw;
  for (const [key, val] of Object.entries(sampleData)) {
    const rx = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    rendered = rendered.replace(rx, String(val));
  }
  return rendered;
});

function insertTag(tagKey: string) {
  const cur = form.waTemplates[activeStageId.value] || '';
  form.waTemplates[activeStageId.value] = `${cur} {{${tagKey}}}`;
}

async function loadSettings() {
  if (!props.pageId) return;
  isLoading.value = true;
  try {
    const data = await fetchQueueSettings(props.pageId);
    if (data) {
      Object.assign(form, data);
      form.waEnabled = Boolean(data.waEnabled);
      if (data.waTemplates) Object.assign(form.waTemplates, data.waTemplates);
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to load queue settings');
  } finally {
    isLoading.value = false;
  }
}

async function saveSettings() {
  if (!props.pageId) return;
  isSaving.value = true;
  try {
    const res = await saveQueueSettingsApi(props.pageId, form);
    if (res) {
      Object.assign(form, res);
      emit('toast', 'Queue settings and WhatsApp preferences saved successfully.');
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to save settings');
  } finally {
    isSaving.value = false;
  }
}

async function stepCaller(delta: number) {
  const target = Math.max(1, form.currentCalledNumber + delta);
  form.currentCalledNumber = target;
  if (!props.pageId) return;
  try {
    const res = await callNextQueue(props.pageId, target);
    if (res) {
      if (form.waEnabled) {
        emit('toast', `Calling queue #${target}. ${res.approachingCount} WhatsApp notifications dispatched.`);
      } else {
        emit('toast', `Calling queue #${target}. WhatsApp notifications are disabled.`);
      }
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to advance queue number');
  }
}

onMounted(() => {
  loadSettings();
});
</script>
