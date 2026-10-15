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

    <!-- 1. Top Section: 2 Ergonomic Cards (Venue Capacity Status vs Queue Rules) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Card A: Live Venue Status & Gate Hand-off -->
      <div class="p-6 md:p-7 rounded-[18px] border border-black/10 bg-white flex flex-col justify-between gap-6 shadow-xs">
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Venue Capacity & Real-Time Headcount</span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/5 text-neutral-700 border border-black/10">
              <span class="size-1.5 rounded-full" :style="{ backgroundColor: barColor }" />
              {{ capacityPercent >= 100 ? 'Venue Full' : 'Accepting Entry' }}
            </span>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-4">
            <div>
              <div class="flex items-baseline gap-2">
                <span class="text-[38px] leading-none font-medium font-mono tabular-nums text-black">{{ insideCount }}</span>
                <span class="text-[14px] text-neutral-400 font-normal">/ {{ form.maxCapacity }} Pax Inside</span>
              </div>
              <p class="text-[12.5px] text-neutral-400 mt-2 leading-relaxed">
                Currently Serving: <strong class="text-black font-mono">#{{ form.currentCalledNumber }}</strong> · {{ waitingCount }} guest{{ waitingCount === 1 ? '' : 's' }} waiting in queue
              </p>
            </div>

            <div class="sm:text-right flex flex-col gap-1 sm:items-end">
              <span class="text-[11px] uppercase tracking-[0.1em] text-neutral-500 font-medium">Available Spots</span>
              <span class="text-[22px] font-bold font-mono tabular-nums" :style="{ color: barColor }">
                {{ Math.max(0, form.maxCapacity - insideCount) }}
              </span>
            </div>
          </div>

          <!-- Capacity Bar -->
          <div class="w-full mt-4 flex flex-col gap-2">
            <div class="w-full h-[7px] bg-black/[0.06] rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${capacityPercent}%`, backgroundColor: barColor }"
              />
            </div>
            <div class="flex items-center justify-between text-[11.5px] text-neutral-500">
              <span>{{ capacityPercent }}% Venue Occupancy</span>
              <span v-if="capacityPercent >= 100" class="text-oxblood-600 font-medium">Venue at capacity limit</span>
              <span v-else>{{ Math.max(0, form.maxCapacity - insideCount) }} spots open for admission</span>
            </div>
          </div>
        </div>

        <!-- Hand-off notice to Door Scanner -->
        <div class="p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5 flex items-center justify-between gap-3 text-[12.5px] text-neutral-600">
          <div class="flex items-center gap-2.5">
            <ScanLine class="w-4 h-4 text-neutral-500 shrink-0" />
            <span>Multi-person batch calling and live guest admissions are managed directly at the <strong>Gate Scanner</strong>.</span>
          </div>
          <span class="text-[11px] uppercase tracking-wider font-mono text-neutral-400 shrink-0">Live at Gate</span>
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
            <div class="flex items-center justify-between gap-4 p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5">
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
              <div class="flex items-center rounded-[10px] border border-black/15 bg-white overflow-hidden shadow-2xs shrink-0 w-[124px] h-[38px] divide-x divide-black/10 focus-within:border-black transition-colors">
                <input
                  id="queue-max-capacity"
                  v-model.number="form.maxCapacity"
                  type="number"
                  min="1"
                  max="2000"
                  class="flex-1 h-full min-w-0 px-2 text-[15px] font-semibold font-mono tabular-nums text-center text-black bg-transparent border-none outline-none focus:outline-none"
                />
                <span class="w-[46px] h-full flex items-center justify-center text-[11px] font-medium font-mono text-neutral-400 bg-black/[0.02] select-none uppercase tracking-wider">
                  pax
                </span>
              </div>
            </div>

            <!-- Rule 2: Alert Threshold Distance -->
            <div class="flex items-center justify-between gap-4 p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5">
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
              <div class="flex items-center rounded-[10px] border border-black/15 bg-white overflow-hidden shadow-2xs shrink-0 w-[124px] h-[38px] divide-x divide-black/10 focus-within:border-black transition-colors">
                <input
                  id="queue-notify-threshold"
                  v-model.number="form.notifyThreshold"
                  type="number"
                  min="1"
                  max="100"
                  class="flex-1 h-full min-w-0 px-2 text-[15px] font-semibold font-mono tabular-nums text-center text-black bg-transparent border-none outline-none focus:outline-none"
                />
                <span class="w-[46px] h-full flex items-center justify-center text-[11px] font-medium font-mono text-neutral-400 bg-black/[0.02] select-none uppercase tracking-wider">
                  ahead
                </span>
              </div>
            </div>

            <!-- Rule 3: Skipped Tolerance -->
            <div class="flex items-center justify-between gap-4 p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5">
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
              <div class="flex items-center rounded-[10px] border border-black/15 bg-white overflow-hidden shadow-2xs shrink-0 w-[124px] h-[38px] divide-x divide-black/10 focus-within:border-black transition-colors">
                <input
                  id="queue-skipped-tolerance"
                  v-model.number="form.skippedTolerance"
                  type="number"
                  min="1"
                  max="50"
                  class="flex-1 h-full min-w-0 px-2 text-[15px] font-semibold font-mono tabular-nums text-center text-black bg-transparent border-none outline-none focus:outline-none"
                />
                <span class="w-[46px] h-full flex items-center justify-center text-[11px] font-medium font-mono text-neutral-400 bg-black/[0.02] select-none uppercase tracking-wider">
                  turns
                </span>
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
    <div class="p-7 sm:p-8 md:p-10 rounded-[22px] border border-black/10 bg-white flex flex-col gap-8 shadow-xs">
      <!-- Master Toggle Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6" :class="form.waEnabled ? 'border-b border-black/10' : ''">
        <div class="flex items-start gap-4">
          <div
            class="size-11 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5 transition-colors"
            :class="form.waEnabled ? 'bg-emerald-600 text-white shadow-sm' : 'bg-black/5 text-neutral-400'"
          >
            <MessageSquare class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h3 class="text-[18px] font-medium tracking-tight text-black">Automated WhatsApp Notifications</h3>
              <span
                class="text-[10.5px] uppercase tracking-[0.1em] font-mono px-2.5 py-0.5 rounded-full border transition-colors"
                :class="form.waEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'"
              >
                {{ form.waEnabled ? 'Active' : 'Disabled' }}
              </span>
            </div>
            <p class="text-[13.5px] text-neutral-500 mt-1 leading-relaxed max-w-[640px]">
              Dispatch automated WhatsApp messages to customer phones for queue confirmation, approaching turn alerts, and ticket passes.
            </p>
          </div>
        </div>

        <!-- Apple-style Toggle Switch -->
        <div class="flex items-center gap-3 shrink-0 self-start sm:self-center">
          <span class="text-[13px] font-medium" :class="form.waEnabled ? 'text-black' : 'text-neutral-400'">
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
      <div v-if="!form.waEnabled" class="p-5 rounded-[14px] bg-neutral-50 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] text-neutral-500">
        <div class="flex items-center gap-3">
          <BellOff class="w-4 h-4 text-neutral-400 shrink-0" />
          <span>WhatsApp notifications are turned off for this campaign. The queue operates strictly on-screen and at the door without sending outbound messages.</span>
        </div>
        <button
          type="button"
          @click="form.waEnabled = true"
          class="text-[12.5px] font-medium text-black underline underline-offset-2 hover:opacity-70 cursor-pointer shrink-0"
        >
          Enable Notifications
        </button>
      </div>

      <!-- State B: Enabled (Full Journey Stepper & 100% English Template Editor + Live Preview) -->
      <template v-else>
        <!-- WhatsApp Device Linking Station -->
        <div
          class="p-7 sm:p-8 md:p-9 rounded-[22px] border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs"
          :class="form.waConnection?.connected ? 'border-emerald-200/80 bg-emerald-500/[0.04]' : 'border-black/10 bg-neutral-50/70'"
        >
          <div class="flex items-start gap-4">
            <div
              class="size-12 rounded-[14px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs transition-colors"
              :class="form.waConnection?.connected ? 'bg-emerald-600 text-white' : 'bg-white text-neutral-600 border border-black/10'"
            >
              <Smartphone class="w-6 h-6" />
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2.5">
                <h4 class="text-[15.5px] font-medium text-black">
                  {{ form.waConnection?.connected ? `Sender: ${form.waConnection?.phoneNumber || 'Linked Phone'}` : 'Business WhatsApp Sender Device' }}
                </h4>
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors"
                  :class="form.waConnection?.connected ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-200'"
                >
                  <span
                    class="size-1.5 rounded-full"
                    :class="form.waConnection?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'"
                  />
                  {{ form.waConnection?.connected ? 'Linked & Active' : 'Not Linked (Offline)' }}
                </span>
              </div>
              <p class="text-[13px] text-neutral-500 mt-1 leading-relaxed max-w-[560px]">
                <template v-if="form.waConnection?.connected">
                  {{ form.waConnection?.sessionName || '707 Studio Primary WhatsApp' }} ·
                  <span class="text-neutral-400">Linked {{ formatLinkedTime(form.waConnection?.linkedAt) }} via {{ formatProvider(form.waConnection?.provider) }}</span>
                </template>
                <template v-else>
                  Link your business phone number to send automated queue confirmation and alerts directly to visitors without third-party fees.
                </template>
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <template v-if="form.waConnection?.connected">
              <button
                type="button"
                @click="openTestModal"
                class="h-[38px] px-4 rounded-[10px] border border-black/15 bg-white text-[12.5px] font-medium hover:bg-black/5 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs text-black"
                title="Send a quick test WhatsApp notification"
              >
                <Send class="w-4 h-4 text-emerald-600" />
                <span>Send Test</span>
              </button>

              <button
                type="button"
                @click="openLogsModal"
                class="h-[38px] px-4 rounded-[10px] border border-black/15 bg-white text-[12.5px] font-medium hover:bg-black/5 flex items-center gap-2 cursor-pointer transition-colors shadow-2xs text-black"
                title="View recent outgoing WhatsApp audit log"
              >
                <History class="w-4 h-4 text-neutral-500" />
                <span>Logs</span>
              </button>

              <button
                type="button"
                @click="handleUnlinkDevice"
                class="h-[38px] px-3.5 rounded-[10px] border border-red-200 text-red-600 hover:bg-red-50 text-[12.5px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Disconnect linked WhatsApp device"
              >
                <Unlink class="w-4 h-4" />
                <span>Unlink</span>
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                @click="openLinkModal"
                class="h-[42px] px-5 rounded-[12px] bg-black text-white text-[13px] font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <QrCode class="w-4 h-4" />
                <span>Link WhatsApp Device</span>
              </button>
            </template>
          </div>
        </div>

        <!-- Pipeline Control Bar (Presets & Add Custom Stage) -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
          <div class="flex items-center gap-2.5">
            <span class="text-[11px] uppercase tracking-[0.12em] text-neutral-500 font-medium">Stage Preset:</span>
            <div class="relative inline-block">
              <select
                v-model="selectedPresetId"
                @change="applyPreset(selectedPresetId)"
                class="h-[32px] pl-3 pr-8 rounded-[8px] border border-black/15 bg-white text-[12.5px] font-medium text-black outline-none cursor-pointer appearance-none hover:bg-neutral-50 transition-colors"
              >
                <option v-for="p in PRESETS" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
              <ChevronDown class="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="button"
            @click="openAddStageModal"
            class="h-[32px] px-3 rounded-[8px] border border-black/15 bg-white text-[12.5px] font-medium text-black hover:bg-black/5 flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Stage</span>
          </button>
        </div>

        <!-- Lifecycle Stepper Tabs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            v-for="(stage, idx) in stagesList"
            :key="stage.id"
            type="button"
            @click="activeStageId = stage.id"
            class="group p-3.5 rounded-[12px] border text-left transition-all cursor-pointer flex flex-col gap-1 relative"
            :class="activeStageId === stage.id ? 'bg-black text-white border-black shadow-sm' : 'bg-neutral-50 hover:bg-neutral-100 border-black/10 text-neutral-800'"
          >
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-[0.1em]" :class="activeStageId === stage.id ? 'text-white/70' : 'text-neutral-400'">
                Stage {{ idx + 1 }}
              </span>
              <div class="flex items-center gap-1.5">
                <component :is="stage.icon || MessageSquare" class="w-3.5 h-3.5" :class="activeStageId === stage.id ? 'text-white' : 'text-neutral-500'" />
                <span
                  v-if="stagesList.length > 2 && stage.id !== 'welcome'"
                  @click.stop="handleRemoveStage(stage.id)"
                  class="opacity-0 group-hover:opacity-100 hover:text-red-500 p-0.5 rounded cursor-pointer transition-opacity"
                  title="Remove this stage"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </span>
              </div>
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

    <!-- Modal 1: Link WhatsApp Device Modal -->
    <div
      v-if="showLinkModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="showLinkModal = false"
    >
      <div class="w-full max-w-[580px] bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-707">
        <!-- Header -->
        <div class="p-6 sm:p-7 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3.5">
            <div class="size-10 rounded-[12px] bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <QrCode class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-medium text-black">Link WhatsApp Device</h3>
              <p class="text-[12.5px] text-neutral-500 mt-0.5">Connect your business number to dispatch automated notifications.</p>
            </div>
          </div>
          <button
            type="button"
            @click="showLinkModal = false"
            class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Mode Tabs -->
        <div class="flex items-center border-b border-black/10 px-6 sm:px-7 pt-4 gap-3 bg-white">
          <button
            type="button"
            @click="linkTab = 'qr'"
            class="pb-3 px-3.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2"
            :class="linkTab === 'qr' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'"
          >
            <QrCode class="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            type="button"
            @click="linkTab = 'code'"
            class="pb-3 px-3.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2"
            :class="linkTab === 'code' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span>8-Digit Code</span>
          </button>
          <button
            type="button"
            @click="linkTab = 'gateway'"
            class="pb-3 px-3.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2"
            :class="linkTab === 'gateway' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'"
          >
            <Link2 class="w-3.5 h-3.5" />
            <span>Custom Gateway</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          <!-- TAB 1: SCAN QR CODE -->
          <div v-if="linkTab === 'qr'" class="flex flex-col items-center gap-6">
            <!-- QR Card -->
            <div class="p-6 rounded-[20px] bg-white border border-black/15 shadow-sm flex flex-col items-center relative">
              <div v-if="isGeneratingSession" class="size-[200px] flex flex-col items-center justify-center gap-2 text-neutral-400">
                <RefreshCw class="w-6 h-6 animate-spin text-emerald-600" />
                <span class="text-[12px]">Generating session…</span>
              </div>
              <img
                v-else-if="qrDataUrl"
                :src="qrDataUrl"
                alt="WhatsApp QR Code"
                class="size-[200px] object-contain rounded-[8px]"
              />
              <div v-else class="size-[200px] flex items-center justify-center text-neutral-400 text-[12px]">
                Failed to generate QR
              </div>

              <div class="mt-3 flex items-center gap-1.5 text-[11.5px] text-neutral-400">
                <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live WhatsApp Multi-Device Session</span>
              </div>
            </div>

            <!-- Steps -->
            <div class="w-full p-4 sm:p-5 rounded-[16px] bg-black/[0.02] border border-black/5 flex flex-col gap-3 text-[13px] text-neutral-600">
              <div class="flex items-start gap-3">
                <span class="size-5 rounded-full bg-black text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>Open <strong>WhatsApp</strong> on your phone</span>
              </div>
              <div class="flex items-start gap-3">
                <span class="size-5 rounded-full bg-black text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>Tap <strong>Settings</strong> (iOS) or <strong>⋮ More options</strong> (Android) &gt; <strong>Linked Devices</strong></span>
              </div>
              <div class="flex items-start gap-3">
                <span class="size-5 rounded-full bg-black text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>Tap <strong>Link a Device</strong> and point your phone's camera at the QR code</span>
              </div>
            </div>

            <!-- Phone Number & Session Name Input -->
            <div class="w-full flex flex-col gap-3">
              <div class="flex flex-col gap-1">
                <label for="link-phone" class="text-[12px] font-medium text-black">Business WhatsApp Phone Number</label>
                <input
                  id="link-phone"
                  v-model="linkPhone"
                  type="text"
                  placeholder="e.g. +62 812 7070 8888"
                  class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label for="link-session" class="text-[12px] font-medium text-black">Device Label / Station</label>
                <input
                  id="link-session"
                  v-model="linkSessionName"
                  type="text"
                  placeholder="e.g. 707 Studio Primary WhatsApp"
                  class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black transition-all"
                />
              </div>
            </div>
          </div>

          <!-- TAB 2: PAIRING CODE -->
          <div v-else-if="linkTab === 'code'" class="flex flex-col gap-4">
            <div class="p-4 rounded-[12px] bg-emerald-50 border border-emerald-200 text-[12.5px] text-emerald-800 leading-snug">
              Pair your phone without using a camera by entering an 8-character verification code into WhatsApp.
            </div>

            <div class="flex flex-col gap-1">
              <label for="link-code-phone" class="text-[12px] font-medium text-black">WhatsApp Phone Number</label>
              <input
                id="link-code-phone"
                v-model="linkPhone"
                type="text"
                placeholder="e.g. +62 812 7070 8888"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
            </div>

            <!-- Pairing Code Block -->
            <div class="p-4 rounded-[14px] bg-black/[0.02] border border-black/10 flex flex-col items-center gap-2">
              <span class="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-medium">Your Pairing Code</span>
              <div class="flex items-center gap-3">
                <span class="text-[28px] font-mono font-bold tracking-widest text-black">{{ pairingCode || '707S-LINK' }}</span>
                <button
                  type="button"
                  @click="copyPairingCode"
                  class="size-8 rounded-[8px] bg-white border border-black/15 hover:bg-black/5 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                  title="Copy Pairing Code"
                >
                  <Copy class="w-3.5 h-3.5 text-neutral-600" />
                </button>
              </div>
              <p class="text-[11.5px] text-neutral-400 text-center">
                In WhatsApp &gt; Linked Devices &gt; Tap "Link with phone number instead" and enter this code.
              </p>
            </div>
          </div>

          <!-- TAB 3: CUSTOM GATEWAY -->
          <div v-else-if="linkTab === 'gateway'" class="flex flex-col gap-4">
            <div class="p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5 text-[12.5px] text-neutral-600 leading-snug">
              Connect via an external aggregator (Fonnte, Wablas) or your self-hosted WhatsApp Baileys / WPPConnect server.
            </div>

            <div class="flex flex-col gap-1">
              <label for="gateway-phone" class="text-[12px] font-medium text-black">Sender Phone Number</label>
              <input
                id="gateway-phone"
                v-model="linkPhone"
                type="text"
                placeholder="e.g. +62 812 7070 8888"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="gateway-url" class="text-[12px] font-medium text-black">Webhook / Dispatch URL</label>
              <input
                id="gateway-url"
                v-model="linkGatewayUrl"
                type="text"
                placeholder="e.g. https://api.fonnte.com/send"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label for="gateway-token" class="text-[12px] font-medium text-black">API Token (Optional)</label>
              <input
                id="gateway-token"
                v-model="linkApiToken"
                type="password"
                placeholder="Bearer token or API key"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-between">
          <button
            type="button"
            @click="refreshQrCode"
            :disabled="isGeneratingSession"
            class="h-[38px] px-3.5 rounded-[10px] border border-black/15 bg-white text-[12.5px] font-medium hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="isGeneratingSession ? 'animate-spin' : ''" />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            @click="handleConfirmLink"
            :disabled="isLinking"
            class="apple-cta-btn h-[40px] px-5 rounded-[10px] bg-black text-white text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Check class="w-4 h-4" />
            <span>{{ isLinking ? 'Linking…' : 'Confirm Device Linked' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 2: Send Test WhatsApp Notification -->
    <div
      v-if="showTestModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="showTestModal = false"
    >
      <div class="w-full max-w-[480px] bg-white rounded-[20px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-707">
        <div class="p-5 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-[10px] bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Send class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-[16px] font-medium text-black">Send Test WhatsApp</h3>
              <p class="text-[12px] text-neutral-500">Test live outbound delivery from your linked number.</p>
            </div>
          </div>
          <button
            type="button"
            @click="showTestModal = false"
            class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="test-phone-input" class="text-[12px] font-medium text-black">Recipient Phone Number</label>
            <input
              id="test-phone-input"
              v-model="testPhone"
              type="text"
              placeholder="e.g. +62 812 3456 7890"
              class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label for="test-stage-select" class="text-[12px] font-medium text-black">Test Stage Template</label>
            <select
              id="test-stage-select"
              v-model="testStage"
              class="h-[38px] px-3 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13px] outline-none focus:border-black focus:bg-white text-black cursor-pointer"
            >
              <option value="welcome">Welcome &amp; Pass Confirmation</option>
              <option value="approaching">Approaching Alert</option>
              <option value="ready">Ready for Entry</option>
              <option value="expired">Missed / Expired Alert</option>
              <option value="custom">Custom Message</option>
            </select>
          </div>

          <div class="flex flex-col gap-1">
            <label for="test-preview-box" class="text-[12px] font-medium text-black">Rendered Preview</label>
            <textarea
              id="test-preview-box"
              v-model="testPreviewMessage"
              rows="4"
              class="w-full p-3 rounded-[10px] bg-black/[0.02] border border-black/15 text-[12.5px] leading-relaxed font-mono outline-none text-neutral-700"
            />
          </div>
        </div>

        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            @click="showTestModal = false"
            class="h-[38px] px-4 rounded-[10px] border border-black/15 bg-white text-[12.5px] font-medium hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleSendTestMessage"
            :disabled="isSendingTest"
            class="apple-cta-btn h-[38px] px-5 rounded-[10px] bg-black text-white text-[12.5px] font-medium hover:bg-neutral-800 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Send class="w-3.5 h-3.5" />
            <span>{{ isSendingTest ? 'Sending…' : 'Send Test Notification' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal 3: Outgoing WhatsApp Logs -->
    <div
      v-if="showLogsModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="showLogsModal = false"
    >
      <div class="w-full max-w-[620px] bg-white rounded-[20px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-707">
        <div class="p-5 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-[10px] bg-black/5 text-neutral-700 flex items-center justify-center">
              <History class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-[16px] font-medium text-black">WhatsApp Notification Logs</h3>
              <p class="text-[12px] text-neutral-500">Live outbound delivery history for this campaign.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="refreshLogs"
              :disabled="isLoadingLogs"
              class="h-[32px] px-2.5 rounded-[8px] border border-black/15 bg-white text-[11.5px] font-medium hover:bg-black/5 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw class="w-3 h-3" :class="isLoadingLogs ? 'animate-spin' : ''" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              @click="showLogsModal = false"
              class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="p-5 overflow-y-auto max-h-[60vh] flex flex-col gap-2.5">
          <div v-if="isLoadingLogs" class="py-12 text-center text-[13px] text-neutral-400">
            Loading logs…
          </div>
          <div v-else-if="!waLogs.length" class="py-12 text-center text-neutral-400 flex flex-col items-center gap-2">
            <MessageSquare class="w-8 h-8 stroke-[1.2] text-neutral-300" />
            <p class="text-[13px]">No outbound WhatsApp notifications recorded yet.</p>
            <p class="text-[11.5px] text-neutral-400">Dispatches from queue advancement and test messages will appear here.</p>
          </div>
          <div
            v-else
            v-for="log in waLogs"
            :key="log.id"
            class="p-3 rounded-[12px] border border-black/5 bg-black/[0.015] flex flex-col gap-1.5"
          >
            <div class="flex items-center justify-between text-[12px]">
              <div class="flex items-center gap-2">
                <span class="font-mono font-medium text-black">+{{ log.phone }}</span>
                <span class="px-2 py-0.5 rounded-[6px] text-[10.5px] uppercase font-mono bg-black/5 text-neutral-600">
                  {{ log.event }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-[11px] text-neutral-400">
                <span>{{ formatLogTime(log.timestamp) }}</span>
                <span class="text-emerald-600 font-medium flex items-center gap-0.5">
                  <Check class="w-3 h-3" />
                  Delivered
                </span>
              </div>
            </div>
            <p class="text-[12px] text-neutral-600 line-clamp-2 leading-relaxed">
              {{ log.text }}
            </p>
          </div>
        </div>

        <div class="p-3.5 border-t border-black/10 bg-neutral-50 flex items-center justify-between text-[11.5px] text-neutral-500">
          <span>Showing latest {{ waLogs.length }} recorded dispatches</span>
          <button
            type="button"
            @click="showLogsModal = false"
            class="px-3 py-1 rounded-[6px] bg-black text-white text-[11.5px] font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
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
  Ban,
  Plus,
  Trash2,
  ChevronDown,
  Link2,
  Unlink,
  Send,
  History,
  Copy,
  ScanLine,
  X
} from 'lucide-vue-next';
import QRCode from 'qrcode';
import { glassConfirm, glassPrompt } from '../../services/glassDialog.ts';
import {
  fetchQueueSettings,
  saveQueueSettingsApi,
  callNextQueue,
  totalInsideGuests,
  normalizeStatus,
  fetchWaLinkSession,
  confirmWaLinkApi,
  unlinkWaApi,
  sendWaTestMessageApi,
  fetchWaLogs,
  type Submission,
  type QueueSettingsData,
  type WhatsAppConnection,
  type WhatsAppLogEntry
} from './hubUtils.ts';

type StageId = string;

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

// WhatsApp Device Linking & Testing State
const showLinkModal = ref(false);
const linkTab = ref<'qr' | 'code' | 'gateway'>('qr');
const linkPhone = ref('');
const linkSessionName = ref('707 Studio Primary WhatsApp');
const linkGatewayUrl = ref('');
const linkApiToken = ref('');
const qrDataUrl = ref('');
const pairingCode = ref('');
const isGeneratingSession = ref(false);
const isLinking = ref(false);

const showTestModal = ref(false);
const testPhone = ref('');
const testStage = ref<string>('welcome');
const testCustomMessage = ref('');
const isSendingTest = ref(false);

const showLogsModal = ref(false);
const waLogs = ref<WhatsAppLogEntry[]>([]);
const isLoadingLogs = ref(false);

const form = reactive<QueueSettingsData>({
  enabled: true,
  waEnabled: false,
  maxCapacity: 50,
  notifyThreshold: 10,
  skippedTolerance: 5,
  currentCalledNumber: 1,
  waConnection: {
    connected: false,
    phoneNumber: '',
    sessionName: '707 Studio Primary WhatsApp',
    provider: 'linked_device'
  },
  waTemplates: {
    welcome: 'Hello {{name}}! You are registered in the queue with Queue Number #{{queue_number}} (Party: {{party_size}} guests). Track your live status here: {{link}}',
    approaching: 'Hello {{name}}! Your turn is approaching. The queue is currently serving near your number (#{{queue_number}}). Please proceed to the entrance area now.',
    ready: 'Hello {{name}}! It is your turn to enter. Please present your Access ID {{access_id}} to the door staff at the entrance.',
    expired: 'Notice: {{name}}, queue number #{{queue_number}} was skipped past the grace margin and has expired. Please check in with event staff or register again to rejoin.'
  }
});

const DEFAULT_STAGES: StageDefinition[] = [
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

const PRESETS = [
  {
    id: 'hype_queue',
    name: 'Hype Drop Queue (4 Stages - Default)',
    description: 'Full drop journey: Welcome Pass -> Approaching -> Called to Gate -> Missed',
    stages: DEFAULT_STAGES
  },
  {
    id: 'express_rsvp',
    name: 'Fast-Track RSVP (2 Stages)',
    description: 'Minimalist guest check-in: Confirmation Pass -> Admitted at Entrance',
    stages: [DEFAULT_STAGES[0], DEFAULT_STAGES[2]]
  },
  {
    id: 'multi_zone',
    name: 'VIP Multi-Zone (5 Stages)',
    description: 'Multi-station pipeline: Gate Admission -> Fitting Room -> Checkout Desk',
    stages: [
      DEFAULT_STAGES[0],
      DEFAULT_STAGES[1],
      DEFAULT_STAGES[2],
      {
        id: 'fitting_room',
        title: '4. Fitting Room / Booth',
        triggerSummary: 'Trigger: Station 2 Assigned',
        triggerBadge: 'Trigger: Station Check-In',
        description: 'Sent when customer is called into an individual fitting booth or private product viewing.',
        icon: UserCheck,
        tags: [
          { key: 'name', label: 'Name', description: 'Visitor full name' },
          { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
          { key: 'access_id', label: 'Access ID', description: 'Ticket pass code' }
        ]
      },
      DEFAULT_STAGES[3]
    ]
  }
];

const selectedPresetId = ref('hype_queue');
const stagesList = ref<StageDefinition[]>(JSON.parse(JSON.stringify(DEFAULT_STAGES)));

function applyPreset(presetId: string) {
  const p = PRESETS.find(item => item.id === presetId);
  if (!p) return;
  stagesList.value = JSON.parse(JSON.stringify(p.stages));
  if (!stagesList.value.some(s => s.id === activeStageId.value)) {
    activeStageId.value = stagesList.value[0]?.id || 'welcome';
  }
  emit('toast', `Applied template preset: "${p.name}".`);
}

async function openAddStageModal() {
  const name = await glassPrompt({
    title: 'Add Journey Stage',
    message: 'Enter the title for this milestone stage (e.g. VIP Lounge, Fitting Room Ready, Checkout).',
    placeholder: 'e.g. Fitting Room Ready',
    confirmLabel: 'Add Stage'
  });
  if (!name || !name.trim()) return;
  const cleanName = name.trim();
  const id = 'stage_' + cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  stagesList.value.push({
    id,
    title: cleanName,
    triggerSummary: 'Custom Milestone Trigger',
    triggerBadge: 'Custom Trigger',
    description: `Automated notification dispatched when reaching "${cleanName}".`,
    icon: MessageSquare,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'access_id', label: 'Access ID', description: 'Ticket pass code' },
      { key: 'link', label: 'Pass Link', description: 'Direct ticket pass link' }
    ]
  });
  if (!form.waTemplates[id]) {
    form.waTemplates[id] = `Hello {{name}}! Update for ${cleanName}: your queue number is #{{queue_number}}. Please present Access ID {{access_id}}.`;
  }
  activeStageId.value = id;
  emit('toast', `Added new stage "${cleanName}".`);
}

async function handleRemoveStage(id: string) {
  if (stagesList.value.length <= 1) return;
  const target = stagesList.value.find(s => s.id === id);
  const ok = await glassConfirm({
    title: 'Remove Stage?',
    message: `Are you sure you want to remove "${target?.title || id}" from the pipeline?`,
    confirmLabel: 'Remove',
    danger: true
  });
  if (!ok) return;
  stagesList.value = stagesList.value.filter(s => s.id !== id);
  if (activeStageId.value === id) {
    activeStageId.value = stagesList.value[0]?.id || 'welcome';
  }
  emit('toast', `Removed stage.`);
}

const currentStage = computed(() => stagesList.value.find(s => s.id === activeStageId.value) || stagesList.value[0]);

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
      if (data.waConnection) {
        form.waConnection = { ...data.waConnection };
      }
      if (data.waTemplates) Object.assign(form.waTemplates, data.waTemplates);
      if ((data as any).stages && Array.isArray((data as any).stages) && (data as any).stages.length > 0) {
        stagesList.value = (data as any).stages.map((s: any) => ({
          ...s,
          icon: s.id === 'welcome' ? QrCode : (s.id === 'approaching' ? BellRing : (s.id === 'ready' ? UserCheck : (s.id === 'expired' ? Ban : MessageSquare)))
        }));
      }
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
    const payload = {
      ...form,
      waConnection: form.waConnection,
      stages: stagesList.value.map(s => ({
        id: s.id,
        title: s.title,
        triggerSummary: s.triggerSummary,
        triggerBadge: s.triggerBadge,
        description: s.description,
        tags: s.tags
      }))
    };
    const res = await saveQueueSettingsApi(props.pageId, payload);
    if (res) {
      Object.assign(form, res);
      if (res.waConnection) form.waConnection = { ...res.waConnection };
      emit('toast', 'Queue settings and WhatsApp preferences saved successfully.');
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to save settings');
  } finally {
    isSaving.value = false;
  }
}

/* WhatsApp Link Station Methods */
const testPreviewMessage = computed({
  get() {
    if (testStage.value === 'custom') {
      return testCustomMessage.value || 'Hello! This is a custom test message from 707 Activation Hub.';
    }
    const raw = form.waTemplates[testStage.value] || form.waTemplates.welcome || '';
    const sampleData: Record<string, string | number> = {
      name: 'Sarah Jenkins',
      queue_number: form.currentCalledNumber,
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
  },
  set(val: string) {
    testCustomMessage.value = val;
  }
});

async function openLinkModal() {
  linkPhone.value = form.waConnection?.phoneNumber || '';
  linkSessionName.value = form.waConnection?.sessionName || '707 Studio Primary WhatsApp';
  linkGatewayUrl.value = form.waConnection?.gatewayUrl || '';
  linkApiToken.value = form.waConnection?.apiToken || '';
  showLinkModal.value = true;
  await refreshQrCode();
}

async function refreshQrCode() {
  if (!props.pageId) return;
  isGeneratingSession.value = true;
  try {
    const session = await fetchWaLinkSession(props.pageId, linkPhone.value);
    if (session) {
      pairingCode.value = session.pairingCode;
      qrDataUrl.value = await QRCode.toDataURL(session.qrString, {
        margin: 1,
        width: 220,
        color: { dark: '#000000', light: '#ffffff' }
      });
    }
  } catch (err: any) {
    console.error('Failed to generate WhatsApp linking session:', err);
  } finally {
    isGeneratingSession.value = false;
  }
}

async function copyPairingCode() {
  if (!pairingCode.value) return;
  try {
    await navigator.clipboard.writeText(pairingCode.value);
    emit('toast', 'Pairing code copied to clipboard!');
  } catch {
    emit('toast', `Pairing code: ${pairingCode.value}`);
  }
}

async function handleConfirmLink() {
  if (!props.pageId) return;
  isLinking.value = true;
  try {
    const phone = linkPhone.value.trim() || '+628127070001';
    const provider = linkTab.value === 'code' ? 'pairing_code' : (linkTab.value === 'gateway' ? 'custom_gateway' : 'linked_device');
    const res = await confirmWaLinkApi(props.pageId, {
      phoneNumber: phone,
      sessionName: linkSessionName.value.trim() || '707 Studio Primary WhatsApp',
      provider,
      gatewayUrl: linkGatewayUrl.value.trim() || undefined,
      apiToken: linkApiToken.value.trim() || undefined
    });

    if (res) {
      form.waConnection = { ...res };
      showLinkModal.value = false;
      emit('toast', `WhatsApp Business number (${res.phoneNumber}) linked successfully!`);
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to confirm WhatsApp device link');
  } finally {
    isLinking.value = false;
  }
}

async function handleUnlinkDevice() {
  if (!props.pageId) return;
  const ok = await glassConfirm({
    title: 'Disconnect WhatsApp Device?',
    message: 'Are you sure you want to unlink this WhatsApp Business number? Outgoing queue notifications will be paused until a device is linked.',
    confirmLabel: 'Unlink Device',
    danger: true
  });
  if (!ok) return;

  try {
    await unlinkWaApi(props.pageId);
    form.waConnection = {
      connected: false,
      phoneNumber: '',
      sessionName: '',
      provider: 'linked_device'
    };
    emit('toast', 'WhatsApp device disconnected.');
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to unlink WhatsApp device');
  }
}

function openTestModal() {
  testPhone.value = form.waConnection?.phoneNumber || '';
  testStage.value = 'welcome';
  showTestModal.value = true;
}

async function handleSendTestMessage() {
  if (!props.pageId) return;
  const phone = testPhone.value.trim();
  if (!phone) {
    emit('toast', 'Please enter a valid recipient phone number.');
    return;
  }
  isSendingTest.value = true;
  try {
    const ok = await sendWaTestMessageApi(props.pageId, phone, testPreviewMessage.value);
    if (ok) {
      showTestModal.value = false;
      emit('toast', `Test WhatsApp notification sent to ${phone}!`);
    } else {
      emit('toast', 'Could not send test notification. Check phone number format.');
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to send test WhatsApp message');
  } finally {
    isSendingTest.value = false;
  }
}

async function openLogsModal() {
  showLogsModal.value = true;
  await refreshLogs();
}

async function refreshLogs() {
  if (!props.pageId) return;
  isLoadingLogs.value = true;
  try {
    waLogs.value = await fetchWaLogs(props.pageId);
  } catch (err: any) {
    console.error('Failed to load WA logs:', err);
  } finally {
    isLoadingLogs.value = false;
  }
}

function formatLinkedTime(iso?: string): string {
  if (!iso) return 'recently';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'recently';
  }
}

function formatLogTime(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

function formatProvider(provider?: string): string {
  if (provider === 'custom_gateway') return 'Custom Gateway / Webhook';
  if (provider === 'pairing_code') return 'WhatsApp Pairing Code';
  return 'WhatsApp Multi-Device (Web)';
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
