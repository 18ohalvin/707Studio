<template>
  <div class="w-full flex flex-col gap-5 font-sans font-light tracking-normal" @click="activeInfoKey = null">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 rounded-[16px] border" :class="isDark ? 'border-white/10 bg-[#141414] text-white' : 'border-black/10 bg-white text-black'">
      <div class="flex flex-col">
        <div class="flex items-center gap-2">
          <p class="text-[11px] uppercase tracking-normal font-medium" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Venue Capacity & Access</p>
          <span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-moss-50 text-moss-700 border border-moss-200">
            Active
          </span>
          <!-- Header Info Icon -->
          <div class="relative inline-flex items-center" @click.stop>
            <button
              type="button"
              @click="toggleInfo('header')"
              class="size-4 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'"
              title="About this section"
            >
              <Info class="w-3.5 h-3.5" />
            </button>
            <div
              v-if="activeInfoKey === 'header'"
              class="absolute top-full left-0 mt-2 w-64 p-3 rounded-[12px] bg-black text-white text-[11.5px] font-light leading-relaxed shadow-xl z-30 animate-apple-pop"
            >
              Live venue capacity monitoring, real-time gate line tracking, and automated guest notification rules.
              <div class="absolute bottom-full left-4 border-4 border-transparent border-b-black" />
            </div>
          </div>
        </div>
        <h2 class="text-[20px] sm:text-[22px] font-medium tracking-tight mt-1" :class="isDark ? 'text-white' : 'text-black'">Queue & Capacity</h2>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="loadSettings"
          :disabled="isLoading"
          class="h-[36px] px-3.5 rounded-[9px] border text-[12px] font-medium disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
          :class="isDark ? 'border-white/15 bg-white/5 text-white hover:bg-white/10' : 'border-black/15 bg-white text-neutral-700 hover:bg-black/5'"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
        <button
          type="button"
          @click="saveSettings"
          :disabled="isSaving"
          class="apple-cta-btn h-[36px] px-4 rounded-[9px] text-[12px] font-medium cursor-pointer disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-xs"
          :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
        >
          <Check class="w-3.5 h-3.5" />
          <span>{{ isSaving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>

    <!-- Segmented Navigation Pills: [ Live Queue & Venue ] vs [ Notification & Rules Setup ] -->
    <div class="flex items-center gap-1.5 p-1 rounded-[12px] border w-fit select-none" :class="isDark ? 'bg-white/[0.06] border-white/10' : 'bg-neutral-100 border-black/8'">
      <button
        type="button"
        @click="activePanelTab = 'operations'"
        class="h-[34px] px-4 rounded-[8px] text-[12.5px] font-sans flex items-center gap-2 transition-all cursor-pointer"
        :class="activePanelTab === 'operations' ? (isDark ? 'bg-white text-black font-medium shadow-xs' : 'bg-white text-black font-medium shadow-xs') : (isDark ? 'text-neutral-400 hover:text-white font-light' : 'text-neutral-500 hover:text-black font-light')"
      >
        <Users class="w-3.5 h-3.5" />
        <span>Live Queue & Venue</span>
        <span class="size-1.5 rounded-full bg-moss-600 animate-pulse" />
      </button>

      <button
        type="button"
        @click="activePanelTab = 'settings'"
        class="h-[34px] px-4 rounded-[8px] text-[12.5px] font-sans flex items-center gap-2 transition-all cursor-pointer"
        :class="activePanelTab === 'settings' ? (isDark ? 'bg-white text-black font-medium shadow-xs' : 'bg-white text-black font-medium shadow-xs') : (isDark ? 'text-neutral-400 hover:text-white font-light' : 'text-neutral-500 hover:text-black font-light')"
      >
        <SlidersHorizontal class="w-3.5 h-3.5" />
        <span>Notification & Rules Setup</span>
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 1: LIVE QUEUE & VENUE (Real-Time Operations Monitor)       -->
    <!-- ============================================================== -->
    <div v-if="activePanelTab === 'operations'" class="flex flex-col gap-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Card 1: Venue Headcount & Capacity Meter -->
        <div class="p-5 sm:p-6 rounded-[16px] border flex flex-col justify-between gap-5 shadow-xs" :class="isDark ? 'border-white/10 bg-[#141414] text-white' : 'border-black/10 bg-white text-black'">
          <div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] uppercase tracking-normal font-medium" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Venue Headcount</span>
                <!-- Info Tooltip -->
                <div class="relative inline-flex items-center" @click.stop>
                  <button
                    type="button"
                    @click="toggleInfo('headcount')"
                    class="size-4 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'"
                  >
                    <Info class="w-3 h-3" />
                  </button>
                  <div
                    v-if="activeInfoKey === 'headcount'"
                    class="absolute bottom-full left-0 mb-2 w-60 p-2.5 rounded-[10px] bg-black text-white text-[11px] font-light leading-snug shadow-xl z-30 animate-apple-pop"
                  >
                    Real-time guest count inside the venue compared to the safety limit. Updates instantly on door scans.
                    <div class="absolute top-full left-4 border-4 border-transparent border-t-black" />
                  </div>
                </div>
              </div>

              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border" :class="isDark ? 'bg-white/10 text-white border-white/15' : 'bg-black/5 text-neutral-700 border-black/10'">
                <span class="size-1.5 rounded-full" :style="{ backgroundColor: barColor }" />
                {{ capacityPercent >= 100 ? 'Venue Full' : 'Accepting Entry' }}
              </span>
            </div>

            <div class="flex items-baseline justify-between gap-2 mt-4">
              <div class="flex items-baseline gap-2">
                <span class="text-[34px] sm:text-[38px] leading-none font-medium font-sans tabular-nums" :class="isDark ? 'text-white' : 'text-black'">{{ insideCount }}</span>
                <span class="text-[13px] text-neutral-400 font-light">/ {{ form.maxCapacity }} Pax Inside</span>
              </div>

              <div class="text-right">
                <span class="text-[20px] sm:text-[22px] font-medium font-sans tabular-nums" :style="{ color: barColor }">
                  {{ Math.max(0, form.maxCapacity - insideCount) }}
                </span>
                <span class="text-[11px] text-neutral-400 block font-light">available</span>
              </div>
            </div>

            <!-- Capacity Progress Bar -->
            <div class="w-full mt-3 flex flex-col gap-1.5">
              <div class="w-full h-[7px] rounded-full overflow-hidden" :class="isDark ? 'bg-white/10' : 'bg-black/[0.06]'">
                <div
                  class="h-full rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${capacityPercent}%`, backgroundColor: barColor }"
                />
              </div>
              <div class="flex items-center justify-between text-[11px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">
                <span>{{ capacityPercent }}% Occupied</span>
                <span>Limit: {{ form.maxCapacity }} pax</span>
              </div>
            </div>
          </div>

          <div class="pt-2.5 border-t flex items-center justify-end text-[11.5px]" :class="isDark ? 'border-white/10' : 'border-black/5'">
            <button 
              type="button" 
              @click="activePanelTab = 'settings'" 
              class="underline underline-offset-2 cursor-pointer font-light"
              :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'"
            >
              Adjust Limit →
            </button>
          </div>
        </div>

        <!-- Card 2: Gate Queue Operations (Strictly Read-Only Monitor — No calling buttons) -->
        <div class="p-5 sm:p-6 rounded-[16px] border flex flex-col justify-between gap-5 shadow-xs" :class="isDark ? 'border-white/10 bg-[#141414] text-white' : 'border-black/10 bg-white text-black'">
          <div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="text-[11px] uppercase tracking-normal font-medium" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Gate Line Status</span>
                <!-- Info Tooltip -->
                <div class="relative inline-flex items-center" @click.stop>
                  <button
                    type="button"
                    @click="toggleInfo('gate_status')"
                    class="size-4 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'"
                  >
                    <Info class="w-3 h-3" />
                  </button>
                  <div
                    v-if="activeInfoKey === 'gate_status'"
                    class="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-[10px] bg-black text-white text-[11px] font-light leading-snug shadow-xl z-30 animate-apple-pop"
                  >
                    Live queue state. Number calling and check-in are operated by the Gate Scanner PIC at the door to prevent line conflicts.
                    <div class="absolute top-full left-4 border-4 border-transparent border-t-black" />
                  </div>
                </div>
              </div>

              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border" :class="isDark ? 'bg-white/10 text-neutral-300 border-white/15' : 'bg-neutral-100 text-neutral-700 border-black/10'">
                <span class="size-1.5 rounded-full bg-moss-600 animate-pulse" />
                Live Monitor
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-4">
              <!-- Currently Serving Readout -->
              <div class="p-3.5 rounded-[12px] border flex flex-col" :class="isDark ? 'bg-white/[0.04] border-white/10 text-white' : 'bg-neutral-50 border-black/5 text-black'">
                <span class="text-[10.5px] uppercase tracking-normal text-neutral-400 font-medium">Currently Serving</span>
                <span class="text-[28px] sm:text-[32px] font-medium font-sans tabular-nums leading-tight mt-0.5" :class="isDark ? 'text-white' : 'text-black'">
                  #{{ form.currentCalledNumber }}
                </span>
              </div>

              <!-- Waiting in Queue Readout -->
              <div class="p-3.5 rounded-[12px] border flex flex-col" :class="isDark ? 'bg-white/[0.04] border-white/10 text-white' : 'bg-neutral-50 border-black/5 text-black'">
                <span class="text-[10.5px] uppercase tracking-normal text-neutral-400 font-medium">Waiting in Line</span>
                <span class="text-[28px] sm:text-[32px] font-medium font-sans tabular-nums leading-tight mt-0.5" :class="isDark ? 'text-white' : 'text-black'">
                  {{ waitingCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- Launch Scanner Shortcut -->
          <div class="pt-2.5 border-t flex items-center justify-between" :class="isDark ? 'border-white/10' : 'border-black/5'">
            <span class="text-[11.5px] text-neutral-400 font-light">Door Scanner Station</span>
            <a
              :href="scannerHref"
              target="_blank"
              rel="noopener"
              class="h-[34px] px-3.5 rounded-[9px] text-[12px] font-medium flex items-center gap-1.5 transition-colors apple-press cursor-pointer shadow-xs"
              :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
            >
              <ScanLine class="w-3.5 h-3.5" />
              <span>Launch Door Scanner</span>
              <ArrowUpRight class="w-3 h-3" :class="isDark ? 'text-black/60' : 'text-neutral-400'" />
            </a>
          </div>
        </div>
      </div>

      <!-- Card 3: Notification Readiness & Health Status -->
      <div class="p-5 rounded-[16px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs" :class="isDark ? 'border-white/10 bg-[#141414] text-white' : 'border-black/10 bg-white text-black'">
        <div class="flex items-center gap-3">
          <div class="size-9 rounded-[10px] flex items-center justify-center shrink-0" :class="isDark ? 'bg-white/10 text-white' : 'bg-neutral-100 text-neutral-700'">
            <BellRing class="w-4 h-4" />
          </div>
          <div class="flex items-center gap-2.5 text-[12.5px]">
            <span class="font-medium" :class="isDark ? 'text-white' : 'text-black'">Guest Alerts:</span>
            <span class="flex items-center gap-1 font-light" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">
              <span class="size-1.5 rounded-full" :class="form.emailNotificationEnabled !== false ? 'bg-moss-600' : 'bg-neutral-300'" />
              Email (Default) {{ form.emailNotificationEnabled !== false ? 'On' : 'Off' }}
            </span>
            <span class="text-neutral-300">•</span>
            <span class="flex items-center gap-1 font-light" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">
              <span class="size-1.5 rounded-full" :class="form.waEnabled && form.waConnection?.connected ? 'bg-moss-600' : 'bg-neutral-300'" />
              WhatsApp (Additional) {{ form.waEnabled && form.waConnection?.connected ? 'On' : 'Off' }}
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="activePanelTab = 'settings'"
          class="h-[32px] px-3 rounded-[8px] border text-[12px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          :class="isDark ? 'border-white/15 bg-white/5 text-white hover:bg-white/10' : 'border-black/15 hover:bg-black/5 text-neutral-700'"
        >
          <span>Configure Alerts →</span>
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 2: NOTIFICATION & RULES SETUP (One-Time Configuration)     -->
    <!-- ============================================================== -->
    <div v-else class="flex flex-col gap-5">
      
      <!-- Card A: Venue Limits & Queue Rules (Clean, compact, no paragraph clutter) -->
      <div
        class="p-5 sm:p-6 rounded-[16px] border flex flex-col gap-4 shadow-xs"
        :class="isDark ? 'border-white/10 bg-[#141414] text-white' : 'border-black/10 bg-white text-black'"
      >
        <div
          class="flex items-center justify-between pb-3 border-b"
          :class="isDark ? 'border-white/10' : 'border-black/10'"
        >
          <div class="flex items-center gap-1.5">
            <h3 class="text-[15px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Venue Limits & Rules</h3>
            <!-- Info Tooltip -->
            <div class="relative inline-flex items-center" @click.stop>
              <button
                type="button"
                @click="toggleInfo('rules')"
                class="size-4 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'"
              >
                <Info class="w-3 h-3" />
              </button>
              <div
                v-if="activeInfoKey === 'rules'"
                class="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-[10px] bg-black text-white text-[11px] font-light leading-snug shadow-xl z-30 animate-apple-pop"
              >
                Configuration rules for physical venue safety and automatic line progression thresholds.
                <div class="absolute top-full left-4 border-4 border-transparent border-t-black" />
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <!-- Rule 1: Maximum Venue Limit -->
          <div
            class="p-3.5 rounded-[12px] border flex flex-col gap-2"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50/70 border-black/5'"
          >
            <div class="flex items-center justify-between">
              <label for="queue-max-capacity" class="text-[12.5px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Venue Limit</label>
              <div class="relative inline-flex items-center" @click.stop>
                <button type="button" @click="toggleInfo('rule_limit')" :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'" class="cursor-pointer">
                  <Info class="w-3 h-3" />
                </button>
                <div v-if="activeInfoKey === 'rule_limit'" class="absolute bottom-full right-0 mb-2 w-56 p-2 rounded-[8px] bg-black text-white text-[10.5px] font-light leading-tight shadow-lg z-30 animate-apple-pop">
                  Maximum visitors permitted inside. Door scanner locks entry when full.
                  <div class="absolute top-full right-2 border-4 border-transparent border-t-black" />
                </div>
              </div>
            </div>
            <div
              class="flex items-center rounded-[8px] border overflow-hidden h-[34px] divide-x transition-colors w-full"
              :class="isDark ? 'border-white/15 bg-white/[0.06] divide-white/10 focus-within:border-white' : 'border-black/15 bg-white divide-black/10 focus-within:border-black'"
            >
              <input
                id="queue-max-capacity"
                v-model.number="form.maxCapacity"
                type="number"
                min="1"
                max="2000"
                class="flex-1 h-full min-w-0 px-2.5 text-[13.5px] font-medium font-sans tabular-nums bg-transparent border-none outline-none"
                :class="isDark ? 'text-white placeholder:text-neutral-500' : 'text-black'"
              />
              <span
                class="px-2.5 h-full flex items-center justify-center text-[10.5px] font-medium uppercase"
                :class="isDark ? 'text-neutral-400 bg-white/[0.04]' : 'text-neutral-400 bg-black/[0.02]'"
              >
                Pax
              </span>
            </div>
          </div>

          <!-- Rule 2: Standby Alert Distance -->
          <div
            class="p-3.5 rounded-[12px] border flex flex-col gap-2"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50/70 border-black/5'"
          >
            <div class="flex items-center justify-between">
              <label for="queue-notify-threshold" class="text-[12.5px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Standby Alert</label>
              <div class="relative inline-flex items-center" @click.stop>
                <button type="button" @click="toggleInfo('rule_alert')" :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'" class="cursor-pointer">
                  <Info class="w-3 h-3" />
                </button>
                <div v-if="activeInfoKey === 'rule_alert'" class="absolute bottom-full right-0 mb-2 w-56 p-2 rounded-[8px] bg-black text-white text-[10.5px] font-light leading-tight shadow-lg z-30 animate-apple-pop">
                  Sends an alert this many numbers in advance so guests can walk to the gate.
                  <div class="absolute top-full right-2 border-4 border-transparent border-t-black" />
                </div>
              </div>
            </div>
            <div
              class="flex items-center rounded-[8px] border overflow-hidden h-[34px] divide-x transition-colors w-full"
              :class="isDark ? 'border-white/15 bg-white/[0.06] divide-white/10 focus-within:border-white' : 'border-black/15 bg-white divide-black/10 focus-within:border-black'"
            >
              <input
                id="queue-notify-threshold"
                v-model.number="form.notifyThreshold"
                type="number"
                min="1"
                max="100"
                class="flex-1 h-full min-w-0 px-2.5 text-[13.5px] font-medium font-sans tabular-nums bg-transparent border-none outline-none"
                :class="isDark ? 'text-white placeholder:text-neutral-500' : 'text-black'"
              />
              <span
                class="px-2.5 h-full flex items-center justify-center text-[10.5px] font-medium uppercase"
                :class="isDark ? 'text-neutral-400 bg-white/[0.04]' : 'text-neutral-400 bg-black/[0.02]'"
              >
                Ahead
              </span>
            </div>
          </div>

          <!-- Rule 3: Missed Turn Margin -->
          <div
            class="p-3.5 rounded-[12px] border flex flex-col gap-2"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50/70 border-black/5'"
          >
            <div class="flex items-center justify-between">
              <label for="queue-skipped-tolerance" class="text-[12.5px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Missed Turn Margin</label>
              <div class="relative inline-flex items-center" @click.stop>
                <button type="button" @click="toggleInfo('rule_margin')" :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'" class="cursor-pointer">
                  <Info class="w-3 h-3" />
                </button>
                <div v-if="activeInfoKey === 'rule_margin'" class="absolute bottom-full right-0 mb-2 w-56 p-2 rounded-[8px] bg-black text-white text-[10.5px] font-light leading-tight shadow-lg z-30 animate-apple-pop">
                  Grace turns allowed before skipped tickets expire to keep the line moving.
                  <div class="absolute top-full right-2 border-4 border-transparent border-t-black" />
                </div>
              </div>
            </div>
            <div
              class="flex items-center rounded-[8px] border overflow-hidden h-[34px] divide-x transition-colors w-full"
              :class="isDark ? 'border-white/15 bg-white/[0.06] divide-white/10 focus-within:border-white' : 'border-black/15 bg-white divide-black/10 focus-within:border-black'"
            >
              <input
                id="queue-skipped-tolerance"
                v-model.number="form.skippedTolerance"
                type="number"
                min="1"
                max="50"
                class="flex-1 h-full min-w-0 px-2.5 text-[13.5px] font-medium font-sans tabular-nums bg-transparent border-none outline-none"
                :class="isDark ? 'text-white placeholder:text-neutral-500' : 'text-black'"
              />
              <span
                class="px-2.5 h-full flex items-center justify-center text-[10.5px] font-medium uppercase"
                :class="isDark ? 'text-neutral-400 bg-white/[0.04]' : 'text-neutral-400 bg-black/[0.02]'"
              >
                Turns
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card B: Notification Channels (WhatsApp vs Email Switcher) -->
      <div
        class="p-5 sm:p-6 rounded-[16px] border flex flex-col gap-5 shadow-xs"
        :class="isDark ? 'border-white/10 bg-[#141414] text-white' : 'border-black/10 bg-white text-black'"
      >
        
        <!-- Channels Sub-Tab Switcher -->
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b"
          :class="isDark ? 'border-white/10' : 'border-black/10'"
        >
          <div class="flex items-center gap-1.5">
            <h3 class="text-[15px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Guest Notification Channels</h3>
            <!-- Info Tooltip -->
            <div class="relative inline-flex items-center" @click.stop>
              <button
                type="button"
                @click="toggleInfo('channels')"
                class="size-4 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'"
              >
                <Info class="w-3 h-3" />
              </button>
              <div
                v-if="activeInfoKey === 'channels'"
                class="absolute bottom-full left-0 mb-2 w-64 p-2.5 rounded-[10px] bg-black text-white text-[11px] font-light leading-snug shadow-xl z-30 animate-apple-pop"
              >
                Configure automated message templates and delivery channels sent to attendees.
                <div class="absolute top-full left-4 border-4 border-transparent border-t-black" />
              </div>
            </div>
          </div>

          <!-- Channel Pills -->
          <div
            class="flex items-center gap-1 p-1 rounded-[9px] border w-fit"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-100 border-black/5'"
          >
            <button
              type="button"
              @click="activeNotificationTab = 'email'"
              class="h-[30px] px-3 rounded-[6px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeNotificationTab === 'email' ? (isDark ? 'bg-white/15 text-white font-medium shadow-xs' : 'bg-white text-black font-medium shadow-xs') : (isDark ? 'text-neutral-400 hover:text-white font-light' : 'text-neutral-500 hover:text-black font-light')"
            >
              <Mail class="w-3.5 h-3.5" />
              <span>Email Confirmations (Primary)</span>
            </button>

            <button
              type="button"
              @click="activeNotificationTab = 'whatsapp'"
              class="h-[30px] px-3 rounded-[6px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeNotificationTab === 'whatsapp' ? (isDark ? 'bg-white/15 text-white font-medium shadow-xs' : 'bg-white text-black font-medium shadow-xs') : (isDark ? 'text-neutral-400 hover:text-white font-light' : 'text-neutral-500 hover:text-black font-light')"
            >
              <Smartphone class="w-3.5 h-3.5" />
              <span>WhatsApp Alerts (Additional)</span>
            </button>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- CHANNEL 1: REALISTIC EMAIL CLIENT PREVIEW (Primary)            -->
        <!-- ============================================================== -->
        <div v-if="activeNotificationTab === 'email'" class="flex flex-col gap-5">
          
          <!-- Email Master Switch -->
          <div
            class="p-3.5 sm:p-4 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50 border-black/5'"
          >
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.emailNotificationEnabled" class="sr-only peer" />
                <div class="w-9 h-5 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
              </label>
              <div class="flex items-center gap-1.5">
                <span class="text-[13px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Automated Email Confirmations</span>
                <!-- Info Tooltip -->
                <div class="relative inline-flex items-center" @click.stop>
                  <button type="button" @click="toggleInfo('email_toggle')" :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'" class="cursor-pointer">
                    <Info class="w-3 h-3" />
                  </button>
                  <div v-if="activeInfoKey === 'email_toggle'" class="absolute bottom-full left-0 mb-2 w-56 p-2 rounded-[8px] bg-black text-white text-[10.5px] font-light leading-tight shadow-lg z-30 animate-apple-pop">
                    Delivers official tickets and door call notifications to guest email inboxes.
                    <div class="absolute top-full left-4 border-4 border-transparent border-t-black" />
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center gap-2 px-2.5 py-1 rounded-[7px] border text-[11.5px] font-medium"
              :class="isDark ? 'bg-moss-950/40 border-moss-500/30 text-moss-300' : 'bg-moss-50 border-moss-200 text-moss-800'"
            >
              <span class="size-1.5 rounded-full bg-moss-600" />
              <span>SMTP Active</span>
            </div>
          </div>

          <!-- Email Stages Selector -->
          <div
            class="flex items-center gap-1.5 p-1 rounded-[9px] border w-fit"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-100 border-black/5'"
          >
            <button
              type="button"
              @click="activeEmailTab = 'pass'"
              class="px-3 py-1 rounded-[6px] text-[11.5px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeEmailTab === 'pass' ? (isDark ? 'bg-white/15 text-white font-medium shadow-xs' : 'bg-white text-black font-medium shadow-xs') : (isDark ? 'text-neutral-400 hover:text-white font-light' : 'text-neutral-500 hover:text-black font-light')"
            >
              <QrCode class="w-3 h-3" />
              <span>1. Ticket & Pass Email</span>
            </button>

            <button
              type="button"
              @click="activeEmailTab = 'ready'"
              class="px-3 py-1 rounded-[6px] text-[11.5px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeEmailTab === 'ready' ? (isDark ? 'bg-white/15 text-white font-medium shadow-xs' : 'bg-white text-black font-medium shadow-xs') : (isDark ? 'text-neutral-400 hover:text-white font-light' : 'text-neutral-500 hover:text-black font-light')"
            >
              <UserCheck class="w-3 h-3" />
              <span>2. Entry Call Email</span>
            </button>
          </div>

          <!-- Email Editor + REALISTIC EMAIL CLIENT UI PREVIEW -->
          <div class="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-5 items-start">
            
            <!-- Left: Inputs -->
            <div class="flex flex-col gap-3">
              <!-- Subject -->
              <div class="flex flex-col gap-1">
                <label class="text-[11.5px] font-medium uppercase tracking-normal" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Email Subject Line</label>
                <input
                  v-model="currentEmailTemplate.subject"
                  type="text"
                  class="w-full h-[36px] px-3 rounded-[8px] border text-[12.5px] font-sans font-light outline-none transition-all"
                  :class="isDark ? 'bg-white/[0.06] border-white/15 text-white focus:border-white focus:bg-white/[0.1] placeholder:text-neutral-500' : 'bg-neutral-50 border-black/15 text-black focus:border-black focus:bg-white placeholder:text-neutral-400'"
                  placeholder="e.g. Your ticket for {{campaign}}"
                />
              </div>

              <!-- Main Heading -->
              <div class="flex flex-col gap-1">
                <label class="text-[11.5px] font-medium uppercase tracking-normal" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Email Heading</label>
                <input
                  v-model="currentEmailTemplate.heading"
                  type="text"
                  class="w-full h-[36px] px-3 rounded-[8px] border text-[12.5px] font-sans font-light outline-none transition-all"
                  :class="isDark ? 'bg-white/[0.06] border-white/15 text-white focus:border-white focus:bg-white/[0.1] placeholder:text-neutral-500' : 'bg-neutral-50 border-black/15 text-black focus:border-black focus:bg-white placeholder:text-neutral-400'"
                  placeholder="e.g. Your ticket"
                />
              </div>

              <!-- Body Copy -->
              <div class="flex flex-col gap-1">
                <label class="text-[11.5px] font-medium uppercase tracking-normal" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Body Copy / Instructions</label>
                <textarea
                  v-model="currentEmailTemplate.body"
                  rows="4"
                  class="w-full p-3 rounded-[10px] border text-[12.5px] leading-relaxed font-sans font-light outline-none transition-all resize-y"
                  :class="isDark ? 'bg-white/[0.06] border-white/15 text-white focus:border-white focus:bg-white/[0.1] placeholder:text-neutral-500' : 'bg-neutral-50 border-black/15 text-black focus:border-black focus:bg-white placeholder:text-neutral-400'"
                  placeholder="Enter email body copy..."
                />
              </div>

              <!-- Variable Pills -->
              <div class="flex flex-wrap gap-1 pt-0.5">
                <button
                  v-for="v in emailVariablePills"
                  :key="v.key"
                  type="button"
                  @click="insertEmailTag(v.key)"
                  class="px-2 py-0.5 rounded-[5px] text-[10.5px] font-medium cursor-pointer flex items-center gap-1 transition-colors"
                  :class="isDark ? 'bg-white/10 hover:bg-white/15 text-neutral-200' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'"
                  :title="v.description"
                >
                  <span>+ {{ v.label }}</span>
                </button>
              </div>
            </div>

            <!-- Right: AUTHENTIC REALISTIC EMAIL CLIENT UI (Apple Mail / Gmail Chrome) -->
            <div
              class="rounded-[16px] border overflow-hidden shadow-sm select-none flex flex-col font-sans"
              :class="isDark ? 'border-white/15 bg-[#1e1e1e]' : 'border-black/12 bg-[#f0f0f2]'"
            >
              <!-- Realistic Email Client Header Chrome (macOS Apple Mail Style) -->
              <div
                class="px-4 py-3 border-b flex items-center justify-between"
                :class="isDark ? 'bg-[#2a2a2c] border-white/10' : 'bg-[#e8e8ea] border-black/10'"
              >
                <div class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-full bg-[#ff5f57] border border-black/10" />
                  <span class="size-2.5 rounded-full bg-[#febc2e] border border-black/10" />
                  <span class="size-2.5 rounded-full bg-[#28c840] border border-black/10" />
                </div>
                <span class="text-[11px] font-medium truncate max-w-[220px]" :class="isDark ? 'text-neutral-300' : 'text-neutral-500'">
                  {{ renderedEmailSubject || 'Email Preview' }}
                </span>
                <span class="text-[10px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-400'">Inbox</span>
              </div>

              <!-- Email Client Metadata Envelope -->
              <div
                class="px-4 py-2.5 border-b flex flex-col gap-1 text-[11px]"
                :class="isDark ? 'bg-[#18181a] border-white/5 text-neutral-400' : 'bg-white border-black/5 text-neutral-500'"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="font-medium" :class="isDark ? 'text-white' : 'text-black'">From:</span>
                    <span :class="isDark ? 'text-neutral-300 font-normal' : 'text-neutral-700 font-normal'">{{ activeBrandName }} &lt;tickets@events.707.co.id&gt;</span>
                  </div>
                  <span class="text-[10px] text-neutral-400">14:32</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="font-medium" :class="isDark ? 'text-white' : 'text-black'">To:</span>
                  <span :class="isDark ? 'text-neutral-300 font-light' : 'text-neutral-700 font-light'">Sarah Jenkins &lt;s.jenkins@example.com&gt;</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="font-medium" :class="isDark ? 'text-white' : 'text-black'">Subject:</span>
                  <span :class="isDark ? 'text-white font-medium' : 'text-black font-medium'">{{ renderedEmailSubject }}</span>
                </div>
              </div>

              <!-- Realistic Email Body Sheet (Matches server mailer.ts shell) -->
              <div class="p-4 sm:p-5 flex justify-center" :class="isDark ? 'bg-[#121214]' : 'bg-[#f6f6f8]'">
                <div class="w-full max-w-[390px] rounded-[14px] border p-5 sm:p-6 shadow-xs flex flex-col gap-4" :class="isDark ? 'bg-[#1a1a1c] border-white/10 text-white' : 'bg-white border-black/8 text-black'">
                  
                  <!-- Email Top Brand Logo / Banner -->
                  <div class="flex items-center justify-between pb-3 border-b" :class="isDark ? 'border-white/10' : 'border-black/5'">
                    <!-- Brand logo if set, otherwise active brand name -->
                    <div class="flex items-center gap-2">
                      <img 
                        v-if="activeBrandLogo" 
                        :src="activeBrandLogo" 
                        :alt="activeBrandName" 
                        class="h-5 w-auto object-contain max-w-[120px]" 
                      />
                      <span v-else class="text-[14px] font-medium tracking-normal" :class="isDark ? 'text-white' : 'text-black'">
                        {{ activeBrandName }}
                      </span>
                    </div>

                    <!-- Official 707 brandmark -->
                    <img :src="FIGMA_ASSETS.logo707Brand" alt="707" class="h-3.5 w-auto object-contain" :class="isDark ? 'invert' : ''" />
                  </div>

                  <!-- Email Content -->
                  <div class="flex flex-col gap-1.5">
                    <h4 class="text-[17px] font-medium leading-snug" :class="isDark ? 'text-white' : 'text-black'">
                      {{ renderedEmailHeading }}
                    </h4>
                    <p class="text-[12.5px] font-light leading-[19px] whitespace-pre-wrap" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">
                      {{ renderedEmailBody }}
                    </p>
                  </div>

                  <!-- Live CTA Button -->
                  <div class="pt-1">
                    <div class="w-full h-[36px] rounded-[8px] text-[12px] font-medium flex items-center justify-center shadow-xs" :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white'">
                      VIEW LIVE QUEUE PASS
                    </div>
                  </div>

                  <!-- Attached Ticket Card -->
                  <div class="p-2.5 rounded-[9px] border flex items-center justify-between text-[11px]" :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50 border-black/8'">
                    <div class="flex items-center gap-2">
                      <span class="px-1.5 py-0.5 rounded-[4px] bg-red-100 text-red-700 font-medium text-[9px]">PDF</span>
                      <span class="font-medium truncate max-w-[170px]" :class="isDark ? 'text-neutral-200' : 'text-neutral-800'">ticket-sarah-707-K92F.pdf</span>
                    </div>
                    <span class="text-[10px] text-neutral-400 font-sans">248 KB</span>
                  </div>

                  <!-- Footer note -->
                  <p class="text-[10.5px] font-light leading-normal pt-2 border-t text-center" :class="isDark ? 'border-white/10 text-neutral-400' : 'border-black/5 text-neutral-400'">
                    Keep this email. Your ticket is the attached PDF. Show it at the entrance door.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

<!-- ============================================================== -->
                <!-- ============================================================== -->
        <!-- CHANNEL 2: WHATSAPP NOTIFICATIONS (Additional)                 -->
        <!-- ============================================================== -->
        <div v-else class="flex flex-col gap-5">
          
          <!-- Master Switch & Connection Bar (Clean, no copy bloat) -->
          <div
            class="p-3.5 sm:p-4 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50 border-black/5'"
          >
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.waEnabled" class="sr-only peer" />
                <div class="w-9 h-5 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white dark:peer-checked:after:bg-black"></div>
              </label>
              <div class="flex items-center gap-1.5">
                <span class="text-[13px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Automated WhatsApp Alerts</span>
                <!-- Info Tooltip -->
                <div class="relative inline-flex items-center" @click.stop>
                  <button type="button" @click="toggleInfo('wa_toggle')" :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-black'" class="cursor-pointer">
                    <Info class="w-3 h-3" />
                  </button>
                  <div v-if="activeInfoKey === 'wa_toggle'" class="absolute bottom-full left-0 mb-2 w-56 p-2 rounded-[8px] bg-black text-white text-[10.5px] font-light leading-tight shadow-lg z-30 animate-apple-pop">
                    Sends automated WhatsApp messages to attendees when registered or called.
                    <div class="absolute top-full left-4 border-4 border-transparent border-t-black" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Device Connection Pill / Action -->
            <div class="flex items-center gap-2">
              <div
                v-if="form.waConnection?.connected"
                class="flex items-center gap-2 px-3 py-1 rounded-[7px] border text-[11.5px] font-medium"
                :class="isDark ? 'bg-moss-950/40 border-moss-500/30 text-moss-300' : 'bg-moss-50 border-moss-200 text-moss-800'"
              >
                <span class="size-1.5 rounded-full bg-moss-600" />
                <span>+{{ form.waConnection.phoneNumber }}</span>
                <button type="button" @click="disconnectWhatsAppDevice" class="ml-1 text-neutral-400 hover:text-oxblood-600 transition-colors" title="Disconnect device">
                  <X class="w-3 h-3" />
                </button>
              </div>
              <button
                v-else
                type="button"
                @click="openWhatsAppQrModal"
                class="h-[32px] px-3 rounded-[7px] text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
              >
                <QrCode class="w-3 h-3" />
                <span>Link Device via QR</span>
              </button>
            </div>
          </div>

          <!-- Secondary Toolbar: Advanced Gateway, Test Message, Delivery Logs -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span class="text-[11px] font-light" :class="isDark ? 'text-neutral-400' : 'text-neutral-400'">Tools:</span>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                @click="openLinkModal"
                class="h-[30px] px-2.5 rounded-[7px] border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                :class="isDark ? 'border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10' : 'border-black/15 bg-white hover:bg-black/5 text-neutral-700'"
                title="Configure custom API gateway"
              >
                <Link2 class="w-3 h-3" />
                <span>Advanced Gateway</span>
              </button>

              <button
                type="button"
                @click="openTestModal"
                class="h-[30px] px-2.5 rounded-[7px] border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                :class="isDark ? 'border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10' : 'border-black/15 bg-white hover:bg-black/5 text-neutral-700'"
              >
                <Send class="w-3 h-3" />
                <span>Send Test</span>
              </button>

              <button
                type="button"
                @click="openLogsModal"
                class="h-[30px] px-2.5 rounded-[7px] border text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                :class="isDark ? 'border-white/15 bg-white/5 text-neutral-200 hover:bg-white/10' : 'border-black/15 bg-white hover:bg-black/5 text-neutral-700'"
              >
                <History class="w-3 h-3" />
                <span>Delivery Logs</span>
              </button>
            </div>
          </div>

          <!-- WhatsApp Message Stages & Live Chat Bubble Preview -->
          <div class="flex flex-col gap-3 pt-1">
            <!-- Stage Selector Pills -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="s in DEFAULT_STAGES"
                :key="s.id"
                type="button"
                @click="selectActiveWaStage(s.id)"
                class="px-3 py-1 rounded-[7px] text-[11.5px] font-sans flex items-center gap-1 transition-all cursor-pointer"
                :class="(form.activeWaStage || activeStageId) === s.id ? (isDark ? 'bg-white text-black font-medium shadow-xs' : 'bg-black text-white font-medium shadow-xs') : (isDark ? 'bg-white/5 text-neutral-300 hover:text-white font-light' : 'bg-neutral-100 text-neutral-600 hover:text-black font-light')"
              >
                <component :is="s.icon" class="w-3 h-3" />
                <span>{{ s.title }}</span>
              </button>
            </div>

            <!-- 2-Column Split: Message Text Editor on Left vs Chat Preview on Right -->
            <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-5 items-start">
              
              <!-- Left: Text Editor -->
              <div class="flex flex-col gap-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[11.5px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Message Content</span>
                  <span class="text-[10.5px] font-sans" :class="isDark ? 'text-neutral-400' : 'text-neutral-400'">{{ (form.waTemplates[activeStageId] || '').length }} chars</span>
                </div>

                <textarea
                  v-model="form.waTemplates[activeStageId]"
                  rows="4"
                  class="w-full p-3 rounded-[10px] border text-[12.5px] leading-relaxed font-sans font-light outline-none transition-all resize-y"
                  :class="isDark ? 'bg-white/[0.06] border-white/15 text-white focus:border-white focus:bg-white/[0.1] placeholder:text-neutral-500' : 'bg-neutral-50 border-black/15 text-black focus:border-black focus:bg-white placeholder:text-neutral-400'"
                  placeholder="Enter message copy..."
                />

                <!-- Dynamic Variables Chips -->
                <div class="flex flex-wrap gap-1 pt-0.5">
                  <button
                    v-for="t in currentStage.tags"
                    :key="t.key"
                    type="button"
                    @click="insertTag(t.key)"
                    class="px-2 py-0.5 rounded-[5px] text-[10.5px] font-medium cursor-pointer flex items-center gap-1 transition-colors"
                    :class="isDark ? 'bg-white/10 hover:bg-white/15 text-neutral-200' : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'"
                    :title="t.description"
                  >
                    <span>+ {{ t.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Right: Live WhatsApp Chat Bubble Preview -->
              <div
                class="rounded-[14px] border overflow-hidden flex flex-col shadow-xs select-none"
                :class="isDark ? 'border-white/15 bg-[#0b141a]' : 'border-black/10 bg-[#efeae2]'"
              >
                <!-- Chat Header -->
                <div
                  class="px-3.5 py-2 text-white flex items-center justify-between text-[11.5px]"
                  :class="isDark ? 'bg-[#1f2c34]' : 'bg-[#075e54]'"
                >
                  <div class="flex items-center gap-2">
                    <div class="size-5 rounded-full bg-white/20 flex items-center justify-center font-medium text-[9px]">
                      707
                    </div>
                    <span class="font-medium truncate max-w-[140px]">{{ activeBrandName }}</span>
                  </div>
                  <span class="text-[9.5px] text-white/70">{{ previewTime }}</span>
                </div>

                <!-- Chat Canvas & Message Bubble -->
                <div class="p-3.5 min-h-[140px] flex flex-col justify-end gap-2">
                  <div
                    class="max-w-[90%] self-start rounded-[10px] rounded-tl-[2px] p-2.5 shadow-xs border flex flex-col gap-1"
                    :class="isDark ? 'bg-[#202c33] border-white/5 text-white' : 'bg-white border-black/5 text-black'"
                  >
                    <p class="text-[11.5px] leading-relaxed whitespace-pre-wrap font-sans font-light" :class="isDark ? 'text-white' : 'text-black'">
                      {{ renderedPreviewText }}
                    </p>
                    <div class="flex items-center justify-end gap-1 text-[9px] pt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-400'">
                      <span>{{ previewTime }}</span>
                      <span class="text-moss-400">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 1: WhatsApp Web Linked Device QR Scanner (Baileys)        -->
    <!-- ============================================================== -->
    <div
      v-if="showWhatsAppQrModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-apple-fade"
      @click.self="closeWhatsAppQrModal"
    >
      <div
        class="w-full max-w-[580px] rounded-[24px] shadow-2xl border overflow-hidden flex flex-col font-sans font-light tracking-normal animate-apple-pop"
        :class="isDark ? 'bg-[#141414] border-white/15 text-white' : 'bg-white border-black/10 text-black'"
      >
        <div
          class="p-6 border-b flex items-center justify-between"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50/50'"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-[12px] flex items-center justify-center shadow-xs"
              :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
            >
              <QrCode class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-medium tracking-tight" :class="isDark ? 'text-white' : 'text-black'">Link WhatsApp Device</h3>
              <p class="text-[12px]" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Scan QR from WhatsApp Settings &gt; Linked Devices.</p>
            </div>
          </div>
          <button
            type="button"
            @click="closeWhatsAppQrModal"
            class="size-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors"
            :class="isDark ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-400 hover:text-black'"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Error Alert if any -->
        <div v-if="waDeviceStatus.error" class="mx-6 mt-5 p-3.5 rounded-[12px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 flex items-start justify-between gap-3 text-red-800 dark:text-red-300 text-[12px]">
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{{ waDeviceStatus.error }}</span>
          </div>
          <button type="button" @click="openWhatsAppQrModal" class="px-2.5 py-1 rounded-[6px] bg-red-100 dark:bg-red-900/50 hover:bg-red-200 dark:hover:bg-red-900/80 font-medium text-[11px] shrink-0 cursor-pointer">
            Retry
          </button>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <!-- Steps -->
          <div class="flex flex-col gap-3.5 text-[12.5px]" :class="isDark ? 'text-neutral-300' : 'text-neutral-700'">
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5" :class="isDark ? 'bg-white text-black' : 'bg-black text-white'">1</span>
              <span>Open WhatsApp on your phone</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5" :class="isDark ? 'bg-white text-black' : 'bg-black text-white'">2</span>
              <span>Go to <strong :class="isDark ? 'text-white' : 'text-black'">Settings</strong> &gt; <strong :class="isDark ? 'text-white' : 'text-black'">Linked Devices</strong></span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5" :class="isDark ? 'bg-white text-black' : 'bg-black text-white'">3</span>
              <span>Tap <strong :class="isDark ? 'text-white' : 'text-black'">Link a Device</strong></span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5" :class="isDark ? 'bg-white text-black' : 'bg-black text-white'">4</span>
              <span>Point your phone at this QR code</span>
            </div>
          </div>

          <!-- QR Code Frame -->
          <div
            class="flex flex-col items-center justify-center p-4 rounded-[18px] border min-h-[220px]"
            :class="isDark ? 'bg-white/[0.04] border-white/10' : 'bg-neutral-50 border-black/8'"
          >
            <div v-if="waDeviceStatus.qr" class="size-48 bg-white p-2 rounded-[12px] border border-black/10 shadow-xs flex items-center justify-center">
              <img :src="waDeviceStatus.qr" alt="WhatsApp Link QR" class="size-full object-contain" />
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 text-neutral-400 py-8">
              <RefreshCw class="w-6 h-6 animate-spin text-neutral-500" />
              <span class="text-[12px]">Generating QR code…</span>
            </div>
          </div>
        </div>

        <div
          class="p-4 border-t flex items-center justify-between text-[11.5px] text-neutral-400"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50'"
        >
          <span>Encrypted point-to-point connection</span>
          <button
            type="button"
            @click="closeWhatsAppQrModal"
            class="font-medium cursor-pointer"
            :class="isDark ? 'text-neutral-300 hover:text-white' : 'text-neutral-600 hover:text-black'"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 2: Advanced Custom Gateway Settings (Fonnte/Wablas/Meta) -->
    <!-- ============================================================== -->
    <div
      v-if="showLinkModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-apple-fade"
      @click.self="showLinkModal = false"
    >
      <div
        class="w-full max-w-[540px] rounded-[24px] shadow-2xl border overflow-hidden flex flex-col font-sans font-light tracking-normal animate-apple-pop"
        :class="isDark ? 'bg-[#141414] border-white/15 text-white' : 'bg-white border-black/10 text-black'"
      >
        <div
          class="p-6 border-b flex items-center justify-between"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50/50'"
        >
          <div>
            <h3 class="text-[17px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Advanced Gateway Settings</h3>
            <p class="text-[12px]" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Configure third-party WhatsApp API gateways.</p>
          </div>
          <button
            type="button"
            @click="showLinkModal = false"
            class="size-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors"
            :class="isDark ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-400 hover:text-black'"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">Gateway Provider</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="p in (['fonnte', 'wablas', 'meta', 'custom'] as const)"
                :key="p"
                type="button"
                @click="onGatewayPresetChange(p)"
                class="h-[34px] rounded-[8px] text-[12px] font-medium capitalize border transition-all cursor-pointer"
                :class="gatewayPreset === p ? (isDark ? 'bg-white text-black border-white shadow-xs' : 'bg-black text-white border-black shadow-xs') : (isDark ? 'bg-white/5 text-neutral-300 border-white/10 hover:bg-white/10' : 'bg-neutral-50 text-neutral-600 border-black/10 hover:bg-neutral-100')"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">Sender Phone Number</label>
            <input
              v-model="linkPhone"
              type="text"
              placeholder="+62 812-3456-7890"
              class="w-full h-[40px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all font-sans"
              :class="isDark ? 'bg-white/[0.06] border-white/15 text-white placeholder:text-neutral-500 focus:border-white focus:bg-white/[0.1]' : 'bg-neutral-50 border-black/15 text-black placeholder:text-neutral-400 focus:border-black focus:bg-white'"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">Gateway API URL</label>
            <input
              v-model="linkGatewayUrl"
              type="text"
              class="w-full h-[40px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all font-sans"
              :class="isDark ? 'bg-white/[0.06] border-white/15 text-white placeholder:text-neutral-500 focus:border-white focus:bg-white/[0.1]' : 'bg-neutral-50 border-black/15 text-black placeholder:text-neutral-400 focus:border-black focus:bg-white'"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">API Key / Token</label>
            <input
              v-model="linkApiToken"
              type="password"
              placeholder="Enter gateway API token"
              class="w-full h-[40px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all font-sans"
              :class="isDark ? 'bg-white/[0.06] border-white/15 text-white placeholder:text-neutral-500 focus:border-white focus:bg-white/[0.1]' : 'bg-neutral-50 border-black/15 text-black placeholder:text-neutral-400 focus:border-black focus:bg-white'"
            />
          </div>
        </div>

        <div
          class="p-5 border-t flex items-center justify-end gap-2.5"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50'"
        >
          <button
            type="button"
            @click="showLinkModal = false"
            class="h-[36px] px-4 rounded-[10px] border text-[12.5px] font-medium cursor-pointer"
            :class="isDark ? 'border-white/15 hover:bg-white/10 text-neutral-300' : 'border-black/15 hover:bg-neutral-100 text-neutral-700'"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="handleConfirmLink"
            :disabled="isLinking"
            class="h-[36px] px-5 rounded-[10px] text-[12.5px] font-medium cursor-pointer shadow-xs disabled:opacity-50"
            :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
          >
            {{ isLinking ? 'Connecting…' : 'Save Gateway' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 3: Send Test WhatsApp Message Modal                       -->
    <!-- ============================================================== -->
    <div
      v-if="showTestModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-apple-fade"
      @click.self="showTestModal = false"
    >
      <div
        class="w-full max-w-[460px] rounded-[24px] shadow-2xl border overflow-hidden flex flex-col font-sans font-light tracking-normal animate-apple-pop"
        :class="isDark ? 'bg-[#141414] border-white/15 text-white' : 'bg-white border-black/10 text-black'"
      >
        <div
          class="p-6 border-b flex items-center justify-between"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50/50'"
        >
          <div>
            <h3 class="text-[17px] font-medium" :class="isDark ? 'text-white' : 'text-black'">Send Test Notification</h3>
            <p class="text-[12px]" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Dispatch a test message to your phone.</p>
          </div>
          <button
            type="button"
            @click="showTestModal = false"
            class="size-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors"
            :class="isDark ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-400 hover:text-black'"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">Recipient Phone Number</label>
            <input
              v-model="testPhone"
              type="text"
              placeholder="+62 812-3456-7890"
              class="w-full h-[40px] px-3.5 rounded-[10px] border text-[13px] outline-none transition-all font-sans"
              :class="isDark ? 'bg-white/[0.06] border-white/15 text-white placeholder:text-neutral-500 focus:border-white focus:bg-white/[0.1]' : 'bg-neutral-50 border-black/15 text-black placeholder:text-neutral-400 focus:border-black focus:bg-white'"
            />
          </div>

          <div
            class="p-3.5 rounded-[12px] border text-[12px] leading-relaxed"
            :class="isDark ? 'bg-white/[0.04] border-white/10 text-neutral-300' : 'bg-neutral-50 border-black/5 text-neutral-600'"
          >
            Message Preview:
            <p class="italic mt-1 font-sans font-light whitespace-pre-wrap" :class="isDark ? 'text-white' : 'text-black'">"{{ testPreviewMessage }}"</p>
          </div>
        </div>

        <div
          class="p-5 border-t flex items-center justify-between"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50'"
        >
          <button
            type="button"
            @click="handleDirectWhatsAppOpen"
            class="text-[12px] underline cursor-pointer"
            :class="isDark ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-black'"
          >
            Open in WhatsApp App
          </button>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="showTestModal = false"
              class="h-[36px] px-4 rounded-[10px] border text-[12.5px] font-medium cursor-pointer"
              :class="isDark ? 'border-white/15 hover:bg-white/10 text-neutral-300' : 'border-black/15 hover:bg-neutral-100 text-neutral-700'"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="handleSendTestMessage"
              :disabled="isSendingTest"
              class="h-[36px] px-5 rounded-[10px] text-[12.5px] font-medium cursor-pointer shadow-xs disabled:opacity-50"
              :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
            >
              {{ isSendingTest ? 'Sending…' : 'Send Test' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- MODAL 4: WhatsApp Notification Delivery Logs Modal              -->
    <!-- ============================================================== -->
    <div
      v-if="showLogsModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-apple-fade"
      @click.self="showLogsModal = false"
    >
      <div
        class="w-full max-w-[720px] rounded-[24px] shadow-2xl border overflow-hidden flex flex-col font-sans font-light tracking-normal max-h-[85vh] animate-apple-pop"
        :class="isDark ? 'bg-[#141414] border-white/15 text-white' : 'bg-white border-black/10 text-black'"
      >
        <div
          class="p-6 border-b flex items-center justify-between"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50/50'"
        >
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-[12px] flex items-center justify-center shadow-xs"
              :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
            >
              <History class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-medium" :class="isDark ? 'text-white' : 'text-black'">WhatsApp Notification Logs</h3>
              <p class="text-[12px]" :class="isDark ? 'text-neutral-400' : 'text-neutral-500'">Real-time record of dispatched alerts.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="refreshLogs"
              class="size-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors"
              :class="isDark ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-500'"
              title="Refresh"
            >
              <RefreshCw class="w-4 h-4" :class="isLoadingLogs ? 'animate-spin' : ''" />
            </button>
            <button
              type="button"
              @click="showLogsModal = false"
              class="size-8 rounded-[8px] flex items-center justify-center cursor-pointer transition-colors"
              :class="isDark ? 'hover:bg-white/10 text-neutral-400 hover:text-white' : 'hover:bg-black/5 text-neutral-400 hover:text-black'"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="isLoadingLogs" class="flex flex-col items-center justify-center py-12 text-neutral-400 gap-2">
            <RefreshCw class="w-6 h-6 animate-spin text-neutral-500" />
            <span class="text-[12.5px]">Loading logs…</span>
          </div>
          <div v-else-if="!waLogs || waLogs.length === 0" class="flex flex-col items-center justify-center py-12 text-neutral-400 gap-1">
            <MessageSquare class="w-8 h-8 opacity-40" />
            <p class="text-[13px] font-medium mt-2" :class="isDark ? 'text-neutral-300' : 'text-neutral-600'">No notification logs recorded yet</p>
            <p class="text-[12px] text-neutral-400 font-light">Dispatched WhatsApp alerts will be archived here.</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="log in waLogs"
              :key="log.id"
              class="p-3.5 rounded-[12px] border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]"
              :class="isDark ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-neutral-50/60'"
            >
              <div class="flex items-center gap-3">
                <span
                  class="size-2 rounded-full shrink-0"
                  :class="log.status === 'delivered' || log.status === 'sent' ? 'bg-moss-600' : 'bg-oxblood-600'"
                />
                <span class="font-medium" :class="isDark ? 'text-white' : 'text-black'">{{ log.phone }}</span>
                <span
                  class="px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-sans"
                  :class="isDark ? 'bg-white/10 text-neutral-300' : 'bg-black/5 text-neutral-600'"
                >
                  {{ log.event || 'alert' }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-neutral-400 text-[11px] font-sans">
                <span>{{ formatLogTime(log.timestamp) }}</span>
                <span :class="log.status === 'delivered' || log.status === 'sent' ? (isDark ? 'text-moss-400 font-medium' : 'text-moss-700 font-medium') : (isDark ? 'text-red-400 font-medium' : 'text-oxblood-600 font-medium')">
                  {{ log.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          class="p-4 border-t flex items-center justify-end"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-neutral-50'"
        >
          <button
            type="button"
            @click="showLogsModal = false"
            class="h-[34px] px-4 rounded-[8px] text-[12px] font-medium cursor-pointer"
            :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useBrandStore } from '../../stores/brandStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import {
  RefreshCw,
  Check,
  Users,
  BellRing,
  MessageSquare,
  Smartphone,
  QrCode,
  UserCheck,
  Ban,
  Link2,
  Send,
  History,
  ScanLine,
  X,
  AlertTriangle,
  Mail,
  SlidersHorizontal,
  ArrowUpRight,
  Info
} from 'lucide-vue-next';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { glassConfirm } from '../../services/glassDialog.ts';
import {
  fetchQueueSettings,
  saveQueueSettingsApi,
  totalInsideGuests,
  normalizeStatus,
  normalizeWhatsAppNumber,
  formatWhatsAppDisplay,
  confirmWaLinkApi,
  unlinkWaApi,
  fetchWaStatusApi,
  connectWaDeviceApi,
  disconnectWaDeviceApi,
  type WaDeviceStatus,
  sendWaTestMessageApi,
  fetchWaLogs,
  type Submission,
  type QueueSettingsData,
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
  dark?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toast', msg: string): void;
}>();

const editorStore = useEditorStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();
const isDark = computed(() => props.dark ?? authStore.isSuperAdmin);
const isLoading = ref(false);
const isSaving = ref(false);
const activePanelTab = ref<'operations' | 'settings'>('operations');
const activeNotificationTab = ref<'email' | 'whatsapp'>('email');
const activeStageId = ref<string>('ready');

// Interactive info popovers state
const activeInfoKey = ref<string | null>(null);
function toggleInfo(key: string) {
  activeInfoKey.value = activeInfoKey.value === key ? null : key;
}

// Active Brand logo and name for realistic email preview
const activeBrandLogo = computed(() => {
  return brandStore.activeBrand?.logo_url || null;
});

const activeBrandName = computed(() => {
  return brandStore.activeBrand?.name || editorStore.projectTitle || '707 Design Studio';
});

// Door Scanner external link
const scannerHref = computed(() => {
  const project = editorStore.userProjects.find(p => p.id === props.pageId || (p.pages || []).some(pg => pg.id === props.pageId));
  const pid = project?.id || props.pageId;
  return `/hub/scanner?project=${encodeURIComponent(pid)}`;
});

// WhatsApp Multi-Device Gateway State (Baileys)
const showWhatsAppQrModal = ref(false);
const isConnectingWa = ref(false);
const isDisconnectingWa = ref(false);
const waDeviceStatus = ref<WaDeviceStatus>({
  status: 'disconnected',
  connected: false,
  phone: null,
  qr: null,
  pairingCode: null,
  error: null
});
let waPollTimer: any = null;

function startWaPolling(pageId: string) {
  stopWaPolling();
  waPollTimer = setInterval(async () => {
    try {
      const data = await fetchWaStatusApi(pageId);
      waDeviceStatus.value = data;
      if (data.connected) {
        stopWaPolling();
        form.waConnection = {
          ...(form.waConnection || {}),
          connected: true,
          phoneNumber: data.phone || form.waConnection?.phoneNumber || '',
          formattedNumber: data.phone ? formatWhatsAppDisplay(data.phone) : (form.waConnection?.formattedNumber || ''),
          provider: 'linked_device'
        };
        showWhatsAppQrModal.value = false;
        emit('toast', `WhatsApp device linked successfully (+${data.phone})!`);
      } else if (data.status === 'rejected_mismatch') {
        stopWaPolling();
      }
    } catch {
      // quiet poll
    }
  }, 2000);
}

function stopWaPolling() {
  if (waPollTimer) {
    clearInterval(waPollTimer);
    waPollTimer = null;
  }
}

async function openWhatsAppQrModal() {
  if (!props.pageId) return;
  showWhatsAppQrModal.value = true;
  isConnectingWa.value = true;
  waDeviceStatus.value.error = null;
  try {
    const data = await connectWaDeviceApi(props.pageId, form.waConnection?.phoneNumber || undefined);
    waDeviceStatus.value = data;
    if (data.connected) {
      form.waConnection = {
        ...(form.waConnection || {}),
        connected: true,
        phoneNumber: data.phone || '',
        formattedNumber: data.phone ? formatWhatsAppDisplay(data.phone) : '',
        provider: 'linked_device'
      };
      showWhatsAppQrModal.value = false;
      emit('toast', `WhatsApp device is already connected (+${data.phone})!`);
      return;
    }
  } catch (err: any) {
    waDeviceStatus.value.error = err?.message || 'Could not initiate WhatsApp socket connection';
  } finally {
    isConnectingWa.value = false;
  }
  startWaPolling(props.pageId);
}

function closeWhatsAppQrModal() {
  showWhatsAppQrModal.value = false;
  stopWaPolling();
}

async function disconnectWhatsAppDevice() {
  if (!props.pageId) return;
  const ok = await glassConfirm({
    title: 'Disconnect WhatsApp Device?',
    message: 'Are you sure you want to unlink this WhatsApp device? Automated queue notifications will be paused until a device is linked.',
    confirmLabel: 'Disconnect',
    danger: true
  });
  if (!ok) return;

  isDisconnectingWa.value = true;
  try {
    await disconnectWaDeviceApi(props.pageId);
    waDeviceStatus.value = {
      connected: false,
      status: 'disconnected',
      phone: null,
      qr: null
    };
    form.waConnection = {
      connected: false,
      phoneNumber: '',
      formattedNumber: '',
      sessionName: '',
      provider: 'linked_device'
    };
    emit('toast', 'WhatsApp device disconnected successfully.');
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to disconnect WhatsApp device');
  } finally {
    isDisconnectingWa.value = false;
  }
}

// WhatsApp Device Linking & Testing State
const showLinkModal = ref(false);
const linkTab = ref<'direct' | 'gateway'>('gateway');
const gatewayPreset = ref<'fonnte' | 'wablas' | 'meta' | 'custom'>('fonnte');
const linkPhone = ref('');
const linkSessionName = ref('707 Studio Primary WhatsApp');
const linkGatewayUrl = ref('https://api.fonnte.com/send');
const linkApiToken = ref('');
const isLinking = ref(false);

function onGatewayPresetChange(preset: 'fonnte' | 'wablas' | 'meta' | 'custom') {
  gatewayPreset.value = preset;
  if (preset === 'fonnte') {
    linkGatewayUrl.value = 'https://api.fonnte.com/send';
  } else if (preset === 'wablas') {
    linkGatewayUrl.value = 'https://pati.wablas.com/api/send-message';
  } else if (preset === 'meta') {
    linkGatewayUrl.value = 'https://graph.facebook.com/v20.0/YOUR_PHONE_NUMBER_ID/messages';
  } else {
    linkGatewayUrl.value = '';
  }
}

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
  emailNotificationEnabled: true,
  activeWaStage: 'ready',
  maxCapacity: 50,
  notifyThreshold: 10,
  skippedTolerance: 5,
  currentCalledNumber: 1,
  waConnection: {
    connected: false,
    phoneNumber: '',
    formattedNumber: '',
    sessionName: '707 Studio Primary WhatsApp',
    provider: 'direct_sender'
  },
  waTemplates: {
    welcome: 'Hello {{name}}! You are registered in the queue with Queue Number #{{queue_number}} (Party: {{party_size}} guests). Track your live status here: {{link}}',
    approaching: 'Hello {{name}}! Your turn is approaching. The queue is currently serving near your number (#{{queue_number}}). Please proceed to the entrance area now. Live status: {{link}}',
    ready: 'Hello {{name}}! It is your turn to enter. Please present your Access ID {{access_id}} to the door staff at the entrance. Your pass: {{link}}',
    expired: 'Notice: {{name}}, queue number #{{queue_number}} was skipped past the grace margin and has expired. You can rejoin and regenerate a new queue number on your live pass here: {{link}}'
  },
  emailTemplates: {
    pass: {
      subject: 'Your 707 ticket for {{campaign}}',
      heading: 'Your ticket',
      body: 'Your e-ticket is attached to this email as a PDF. Track your live queue status and show your pass at the door.',
      includeLiveTrackingButton: true,
      liveTrackingButtonLabel: 'VIEW LIVE QUEUE'
    },
    ready: {
      subject: "It's your turn to enter: {{campaign}}",
      heading: "It's Your Turn to Enter!",
      body: 'Your turn has arrived for {{campaign}}. Please proceed to the entrance area now and present your live pass to the door staff.'
    }
  }
});

const DEFAULT_STAGES: StageDefinition[] = [
  {
    id: 'ready',
    title: 'Entry Call',
    triggerSummary: 'When Called',
    triggerBadge: 'Trigger: Number Called Now',
    description: 'Sent when the guest number is called to step inside and present their pass to the door staff.',
    icon: UserCheck,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'access_id', label: 'Access ID', description: 'Ticket pass code' },
      { key: 'link', label: 'Pass Link', description: 'Direct URL to view ticket status' }
    ]
  },
  {
    id: 'approaching',
    title: 'Up Next Alert',
    triggerSummary: 'Standby Ahead',
    triggerBadge: 'Trigger: Within Alert Distance',
    description: 'Sent when the caller reaches within the Up Next distance, notifying the guest to stand by near the entrance.',
    icon: BellRing,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'current_called', label: 'Currently Serving', description: 'The active called number right now' },
      { key: 'party_size', label: 'Party Size', description: 'Number of people in group' },
      { key: 'link', label: 'Pass Link', description: 'Direct URL to view ticket status' }
    ]
  },
  {
    id: 'welcome',
    title: 'Welcome & Pass',
    triggerSummary: 'On Submit',
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
    id: 'expired',
    title: 'Missed / Expired',
    triggerSummary: 'Grace Exceeded',
    triggerBadge: 'Trigger: Skipped Beyond Tolerance',
    description: 'Sent when a guest misses their turn beyond the grace tolerance limit, with a link to rejoin and regenerate their queue number.',
    icon: Ban,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'skipped_tolerance', label: 'Grace Limit', description: 'Configured skipped tolerance limit' },
      { key: 'link', label: 'Pass Link', description: 'Direct link to live pass to requeue & regenerate number' }
    ]
  }
];

function selectActiveWaStage(id: string) {
  form.activeWaStage = id as any;
  activeStageId.value = id;
}

const currentStage = computed(() => {
  return DEFAULT_STAGES.find(s => s.id === (form.activeWaStage || activeStageId.value)) || DEFAULT_STAGES[0];
});

/* Email Template Configuration & Live Mockup Preview */
const activeEmailTab = ref<'pass' | 'ready'>('pass');

const emailVariablePills = [
  { key: 'name', label: 'Name', description: 'Visitor full name' },
  { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
  { key: 'campaign', label: 'Campaign', description: 'Event / campaign title' },
  { key: 'access_id', label: 'Access ID', description: 'Unique ticket pass code' },
  { key: 'link', label: 'Live Pass Link', description: 'Direct URL to view live pass status' }
];

const currentEmailTemplate = computed(() => {
  if (!form.emailTemplates) {
    form.emailTemplates = {
      pass: { subject: '', heading: '', body: '', includeLiveTrackingButton: true, liveTrackingButtonLabel: 'VIEW LIVE QUEUE' },
      ready: { subject: '', heading: '', body: '' }
    };
  }
  const tmpl = form.emailTemplates[activeEmailTab.value]!;
  if (activeEmailTab.value === 'pass') {
    if (tmpl.includeLiveTrackingButton === undefined) tmpl.includeLiveTrackingButton = true;
    if (!tmpl.liveTrackingButtonLabel) tmpl.liveTrackingButtonLabel = 'VIEW LIVE QUEUE';
  }
  return tmpl;
});

function insertEmailTag(key: string) {
  const cur = currentEmailTemplate.value.body || '';
  currentEmailTemplate.value.body = `${cur} {{${key}}}`.trim();
}

function renderMockEmail(raw: string) {
  if (!raw) return '';
  return raw
    .replace(/\{\{\s*name\s*\}\}/g, 'Sarah Jenkins')
    .replace(/\{\{\s*queue_number\s*\}\}/g, '#42')
    .replace(/\{\{\s*campaign\s*\}\}/g, activeBrandName.value)
    .replace(/\{\{\s*access_id\s*\}\}/g, '707-K92F')
    .replace(/\{\{\s*link\s*\}\}/g, 'https://events.707.co.id/brand/drop?code=707-K92F');
}

const renderedEmailSubject = computed(() => renderMockEmail(currentEmailTemplate.value.subject || ''));
const renderedEmailHeading = computed(() => renderMockEmail(currentEmailTemplate.value.heading || ''));
const renderedEmailBody = computed(() => renderMockEmail(currentEmailTemplate.value.body || ''));

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

/** What the guest's real link looks like: this campaign's own live page with their pass code. */
const sampleLink = computed(() => {
  const project = editorStore.userProjects.find(p => p.id === props.pageId || (p.pages || []).some(pg => pg.id === props.pageId));
  const path = project ? `/${project.brand_slug}/${project.slug}` : '/brand/campaign';
  return `${window.location.origin}${path}?code=STAN-8842`;
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
    link: sampleLink.value
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
      form.enabled = data.enabled !== false;
      form.waEnabled = Boolean(data.waEnabled);
      form.emailNotificationEnabled = data.emailNotificationEnabled !== false;
      form.maxCapacity = data.maxCapacity ?? 50;
      form.notifyThreshold = data.notifyThreshold ?? 10;
      form.skippedTolerance = data.skippedTolerance ?? 5;
      form.currentCalledNumber = data.currentCalledNumber ?? 1;

      if (data.waConnection) {
        form.waConnection = {
          connected: Boolean(data.waConnection.connected),
          phoneNumber: data.waConnection.phoneNumber || '',
          formattedNumber: data.waConnection.formattedNumber || (data.waConnection.phoneNumber ? formatWhatsAppDisplay(data.waConnection.phoneNumber) : ''),
          sessionName: data.waConnection.sessionName || '707 Studio Primary WhatsApp',
          gatewayUrl: data.waConnection.gatewayUrl,
          apiToken: data.waConnection.apiToken,
          provider: data.waConnection.provider || 'direct_sender'
        };
      }

      if (data.waTemplates) {
        form.waTemplates = { ...form.waTemplates, ...data.waTemplates };
      }

      if (data.emailTemplates) {
        form.emailTemplates = {
          pass: {
            subject: data.emailTemplates.pass?.subject || form.emailTemplates?.pass?.subject || '',
            heading: data.emailTemplates.pass?.heading || form.emailTemplates?.pass?.heading || '',
            body: data.emailTemplates.pass?.body || form.emailTemplates?.pass?.body || '',
            includeLiveTrackingButton: data.emailTemplates.pass?.includeLiveTrackingButton ?? true,
            liveTrackingButtonLabel: data.emailTemplates.pass?.liveTrackingButtonLabel || 'VIEW LIVE QUEUE'
          },
          ready: {
            subject: data.emailTemplates.ready?.subject || form.emailTemplates?.ready?.subject || '',
            heading: data.emailTemplates.ready?.heading || form.emailTemplates?.ready?.heading || '',
            body: data.emailTemplates.ready?.body || form.emailTemplates?.ready?.body || ''
          }
        };
      }
    }

    // Check live status of Baileys WhatsApp Gateway
    if (props.pageId) {
      try {
        const liveStatus = await fetchWaStatusApi(props.pageId);
        waDeviceStatus.value = liveStatus;
        if (liveStatus.connected) {
          if (!form.waConnection) form.waConnection = { connected: true };
          form.waConnection.connected = true;
          if (liveStatus.phone) {
            form.waConnection.phoneNumber = liveStatus.phone;
            form.waConnection.formattedNumber = formatWhatsAppDisplay(liveStatus.phone);
          }
        }
      } catch {}
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
      activeWaStage: form.activeWaStage || 'ready',
      emailNotificationEnabled: form.emailNotificationEnabled !== false,
      emailTemplates: form.emailTemplates
    };
    const res = await saveQueueSettingsApi(props.pageId, payload);
    if (res) {
      Object.assign(form, res);
      if (res.waConnection) form.waConnection = { ...res.waConnection };
      emit('toast', 'Settings saved.');
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
      link: 'https://events.707.co.id/pass/STAN-8842'
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
  linkPhone.value = form.waConnection?.formattedNumber || form.waConnection?.phoneNumber || '';
  linkSessionName.value = form.waConnection?.sessionName || '707 Studio Primary WhatsApp';
  linkGatewayUrl.value = form.waConnection?.gatewayUrl || 'https://api.fonnte.com/send';
  linkApiToken.value = form.waConnection?.apiToken || '';
  linkTab.value = 'gateway';
  showLinkModal.value = true;
}

async function handleConfirmLink() {
  if (!props.pageId) return;
  const clean = normalizeWhatsAppNumber(linkPhone.value);
  isLinking.value = true;
  try {
    let provider: 'direct_sender' | 'fonnte' | 'wablas' | 'meta_cloud' | 'custom_gateway' = 'direct_sender';
    if (linkTab.value === 'gateway') {
      provider = gatewayPreset.value === 'fonnte' ? 'fonnte' : (gatewayPreset.value === 'wablas' ? 'wablas' : (gatewayPreset.value === 'meta' ? 'meta_cloud' : 'custom_gateway'));
    }

    const res = await confirmWaLinkApi(props.pageId, {
      phoneNumber: clean || linkPhone.value.trim(),
      sessionName: linkSessionName.value.trim() || '707 Studio Primary WhatsApp',
      provider,
      gatewayUrl: linkTab.value === 'gateway' ? (linkGatewayUrl.value.trim() || undefined) : undefined,
      apiToken: linkTab.value === 'gateway' ? (linkApiToken.value.trim() || undefined) : undefined
    });

    if (res) {
      form.waConnection = { ...res };
      showLinkModal.value = false;
      const display = res.formattedNumber || formatWhatsAppDisplay(res.phoneNumber || '') || res.phoneNumber;
      emit('toast', `WhatsApp (${display}) connected!`);
    }
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to confirm WhatsApp gateway');
  } finally {
    isLinking.value = false;
  }
}

function openTestModal() {
  testPhone.value = form.waConnection?.formattedNumber || form.waConnection?.phoneNumber || '';
  testStage.value = 'welcome';
  showTestModal.value = true;
}

function handleDirectWhatsAppOpen() {
  const raw = testPhone.value.trim() || form.waConnection?.phoneNumber || '';
  const clean = normalizeWhatsAppNumber(raw);
  if (!clean || clean.length < 9) {
    emit('toast', 'Please enter a valid recipient phone number.');
    return;
  }
  const text = encodeURIComponent(testPreviewMessage.value);
  const waUrl = `https://wa.me/${clean}?text=${text}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  emit('toast', `Opening WhatsApp…`);
}

async function handleSendTestMessage() {
  if (!props.pageId) return;
  const raw = testPhone.value.trim() || form.waConnection?.phoneNumber || '';
  const clean = normalizeWhatsAppNumber(raw);
  if (!clean || clean.length < 9) {
    emit('toast', 'Please enter a valid recipient phone number.');
    return;
  }
  isSendingTest.value = true;
  try {
    const res = await sendWaTestMessageApi(props.pageId, clean, testPreviewMessage.value);
    if (res?.success) {
      if (res.mode === 'direct' && res.waUrl) {
        window.open(res.waUrl, '_blank', 'noopener,noreferrer');
        emit('toast', `Direct WhatsApp opened for ${formatWhatsAppDisplay(clean)}.`);
      } else {
        emit('toast', res.message || `Test notification dispatched to ${formatWhatsAppDisplay(clean)}.`);
      }
      showTestModal.value = false;
    } else {
      emit('toast', res?.error || 'Could not dispatch test notification.');
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

function formatLogTime(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '';
  }
}

onMounted(() => {
  loadSettings();
});

onUnmounted(() => {
  stopWaPolling();
});
</script>
