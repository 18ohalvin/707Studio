<template>
  <div class="w-full flex flex-col gap-6 font-sans font-light tracking-normal">
    <!-- Header banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] border border-black/10 bg-white">
      <div>
        <div class="flex items-center gap-2">
          <p class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Venue Capacity & Access</p>
          <span class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-moss-50 text-moss-700 border border-moss-200">
            Queue System Active
          </span>
        </div>
        <h2 class="text-[22px] sm:text-[24px] font-medium tracking-tight mt-1">Queue & Capacity Management</h2>
        <p class="text-[13px] sm:text-[13.5px] text-neutral-500 max-w-[640px] mt-1 leading-relaxed">
          Monitor live venue capacity, view gate line status, and configure automated guest notifications.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          @click="loadSettings"
          :disabled="isLoading"
          class="h-[38px] px-3.5 rounded-[10px] border border-black/15 bg-white text-[12.5px] font-medium hover:bg-black/5 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin' : ''" />
          <span>Refresh</span>
        </button>
        <button
          type="button"
          @click="saveSettings"
          :disabled="isSaving"
          class="apple-cta-btn h-[38px] px-5 rounded-[10px] bg-black text-white text-[12.5px] font-medium cursor-pointer disabled:opacity-40 flex items-center gap-2 transition-all shadow-xs"
        >
          <Check class="w-4 h-4" />
          <span>{{ isSaving ? 'Saving…' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>

    <!-- Segmented Navigation Pills: [ Live Queue & Venue ] vs [ Notification & Rules Setup ] -->
    <div class="flex items-center gap-1.5 p-1 bg-neutral-100/80 rounded-[12px] border border-black/8 w-fit select-none">
      <button
        type="button"
        @click="activePanelTab = 'operations'"
        class="h-[34px] px-4 rounded-[8px] text-[12.5px] font-sans flex items-center gap-2 transition-all cursor-pointer"
        :class="activePanelTab === 'operations' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
      >
        <Users class="w-3.5 h-3.5" />
        <span>Live Queue & Venue</span>
        <span class="size-1.5 rounded-full bg-moss-600 animate-pulse" />
      </button>

      <button
        type="button"
        @click="activePanelTab = 'settings'"
        class="h-[34px] px-4 rounded-[8px] text-[12.5px] font-sans flex items-center gap-2 transition-all cursor-pointer"
        :class="activePanelTab === 'settings' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
      >
        <SlidersHorizontal class="w-3.5 h-3.5" />
        <span>Notification & Rules Setup</span>
      </button>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 1: LIVE QUEUE & VENUE (Real-Time Operations Monitor)       -->
    <!-- ============================================================== -->
    <div v-if="activePanelTab === 'operations'" class="flex flex-col gap-5">
      <!-- 2 Clean Grid Cards: Venue Occupancy vs Gate Queue Readout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        <!-- Card 1: Venue Headcount & Capacity Meter -->
        <div class="p-6 md:p-7 rounded-[18px] border border-black/10 bg-white flex flex-col justify-between gap-5 shadow-xs">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Venue Capacity & Headcount</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/5 text-neutral-700 border border-black/10">
                <span class="size-1.5 rounded-full" :style="{ backgroundColor: barColor }" />
                {{ capacityPercent >= 100 ? 'Venue Full' : 'Accepting Entry' }}
              </span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-4">
              <div>
                <div class="flex items-baseline gap-2">
                  <span class="text-[36px] sm:text-[40px] leading-none font-medium font-sans tabular-nums text-black">{{ insideCount }}</span>
                  <span class="text-[14px] text-neutral-400 font-light">/ {{ form.maxCapacity }} Pax Inside</span>
                </div>
                <p class="text-[12px] text-neutral-400 mt-2 leading-relaxed font-light">
                  Real-time occupancy updated automatically as guests scan in/out.
                </p>
              </div>

              <div class="sm:text-right flex flex-col gap-0.5 sm:items-end">
                <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Available Spots</span>
                <span class="text-[24px] font-medium font-sans tabular-nums" :style="{ color: barColor }">
                  {{ Math.max(0, form.maxCapacity - insideCount) }}
                </span>
              </div>
            </div>

            <!-- Capacity Progress Bar -->
            <div class="w-full mt-4 flex flex-col gap-2">
              <div class="w-full h-[8px] bg-black/[0.06] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${capacityPercent}%`, backgroundColor: barColor }"
                />
              </div>
              <div class="flex items-center justify-between text-[11.5px] text-neutral-500 font-light">
                <span>{{ capacityPercent }}% Venue Occupancy</span>
                <span v-if="capacityPercent >= 100" class="text-oxblood-600 font-medium">Limit reached — door locked</span>
                <span v-else>{{ Math.max(0, form.maxCapacity - insideCount) }} spots remaining</span>
              </div>
            </div>
          </div>

          <div class="pt-3 border-t border-black/5 flex items-center justify-between text-[11.5px] text-neutral-400">
            <span>Safety Limit: {{ form.maxCapacity }} pax</span>
            <button 
              type="button" 
              @click="activePanelTab = 'settings'" 
              class="text-neutral-600 hover:text-black underline underline-offset-2 cursor-pointer font-light"
            >
              Adjust Venue Limits →
            </button>
          </div>
        </div>

        <!-- Card 2: Gate Queue Operations (Strictly Read-Only Monitor — No accidental caller buttons) -->
        <div class="p-6 md:p-7 rounded-[18px] border border-black/10 bg-white flex flex-col justify-between gap-5 shadow-xs">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Gate Queue Status</span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 border border-black/10">
                <span class="size-1.5 rounded-full bg-moss-600 animate-pulse" />
                Live Line Monitor
              </span>
            </div>

            <div class="grid grid-cols-2 gap-4 mt-4">
              <!-- Currently Serving Readout -->
              <div class="p-4 rounded-[14px] bg-neutral-50 border border-black/5 flex flex-col gap-1">
                <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Currently Serving</span>
                <span class="text-[32px] sm:text-[36px] font-medium font-sans tabular-nums text-black leading-tight">
                  #{{ form.currentCalledNumber }}
                </span>
                <span class="text-[11px] text-neutral-500 font-light">Called at Gate Scanner</span>
              </div>

              <!-- Waiting in Queue Readout -->
              <div class="p-4 rounded-[14px] bg-neutral-50 border border-black/5 flex flex-col gap-1">
                <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Waiting in Line</span>
                <span class="text-[32px] sm:text-[36px] font-medium font-sans tabular-nums text-black leading-tight">
                  {{ waitingCount }}
                </span>
                <span class="text-[11px] text-neutral-500 font-light">Guests on standby</span>
              </div>
            </div>

            <!-- Clear hand-off note to avoid line conflicts -->
            <div class="p-3.5 rounded-[12px] bg-black/[0.02] border border-black/5 flex items-start gap-3 text-[12px] text-neutral-600 font-light mt-4">
              <ShieldCheck class="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <span>
                To prevent accidental desynchronization, number calling and admissions are operated live by the <strong>Gate Scanner PIC</strong> at the door.
              </span>
            </div>
          </div>

          <!-- Launch Scanner Shortcut -->
          <div class="pt-3 border-t border-black/5 flex items-center justify-between">
            <span class="text-[11.5px] text-neutral-400 font-light">Door Scanner Station</span>
            <a
              :href="scannerHref"
              target="_blank"
              rel="noopener"
              class="h-[36px] px-4 rounded-[10px] bg-black text-white hover:bg-neutral-800 text-[12.5px] font-medium flex items-center gap-1.5 transition-colors apple-press cursor-pointer shadow-xs"
            >
              <ScanLine class="w-3.5 h-3.5" />
              <span>Launch Door Scanner</span>
              <ArrowUpRight class="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>
      </div>

      <!-- Card 3: Notification Readiness & Health Status -->
      <div class="p-6 rounded-[18px] border border-black/10 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-4">
          <div class="size-11 rounded-[12px] bg-neutral-100 flex items-center justify-center shrink-0">
            <BellRing class="w-5 h-5 text-neutral-700" />
          </div>
          <div>
            <h4 class="text-[14px] font-medium text-black">Automated Guest Alerts</h4>
            <div class="flex items-center gap-3 text-[12px] text-neutral-500 font-light mt-0.5">
              <span class="flex items-center gap-1">
                <span class="size-1.5 rounded-full" :class="form.waEnabled && form.waConnection?.connected ? 'bg-moss-600' : 'bg-neutral-300'" />
                WhatsApp: {{ form.waEnabled && form.waConnection?.connected ? 'Active (' + (form.waConnection.formattedNumber || form.waConnection.phoneNumber) + ')' : 'Standby / Off' }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1">
                <span class="size-1.5 rounded-full" :class="form.emailNotificationEnabled !== false ? 'bg-moss-600' : 'bg-neutral-300'" />
                Email: {{ form.emailNotificationEnabled !== false ? 'Active (SMTP)' : 'Off' }}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="activePanelTab = 'settings'"
          class="h-[36px] px-4 rounded-[9px] border border-black/15 hover:bg-black/5 text-[12.5px] font-medium text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <SlidersHorizontal class="w-3.5 h-3.5" />
          <span>Notification & Rules Setup →</span>
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 2: NOTIFICATION & RULES SETUP (One-Time Configuration)     -->
    <!-- ============================================================== -->
    <div v-else class="flex flex-col gap-6">
      
      <!-- Card A: Venue Limits & Queue Rules (Clean, human-friendly) -->
      <div class="p-6 md:p-7 rounded-[18px] border border-black/10 bg-white flex flex-col gap-5 shadow-xs">
        <div class="flex items-center justify-between pb-4 border-b border-black/10">
          <div>
            <h3 class="text-[17px] font-medium text-black">Venue Limits & Line Rules</h3>
            <p class="text-[12.5px] text-neutral-500 font-light mt-0.5">Define venue safety capacity and how early guests are alerted.</p>
          </div>
          <span class="text-[11px] text-neutral-400 font-light">Applies to all scanner stations</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Rule 1: Maximum Venue Limit -->
          <div class="p-4 rounded-[14px] bg-neutral-50/70 border border-black/5 flex flex-col justify-between gap-3">
            <div>
              <label for="queue-max-capacity" class="text-[13px] font-medium text-black block">Maximum Venue Limit</label>
              <p class="text-[11.5px] text-neutral-500 font-light mt-0.5 leading-snug">
                Safety limit of visitors inside. The door scanner locks entry when full.
              </p>
            </div>
            <div class="flex items-center rounded-[10px] border border-black/15 bg-white overflow-hidden shadow-2xs h-[38px] divide-x divide-black/10 focus-within:border-black transition-colors w-full">
              <input
                id="queue-max-capacity"
                v-model.number="form.maxCapacity"
                type="number"
                min="1"
                max="2000"
                class="flex-1 h-full min-w-0 px-3 text-[14px] font-medium font-sans tabular-nums text-black bg-transparent border-none outline-none focus:outline-none"
              />
              <span class="px-3 h-full flex items-center justify-center text-[11px] font-medium text-neutral-400 bg-black/[0.02] select-none uppercase">
                Pax
              </span>
            </div>
          </div>

          <!-- Rule 2: Standby Alert Distance -->
          <div class="p-4 rounded-[14px] bg-neutral-50/70 border border-black/5 flex flex-col justify-between gap-3">
            <div>
              <label for="queue-notify-threshold" class="text-[13px] font-medium text-black block">Standby Alert Distance</label>
              <p class="text-[11.5px] text-neutral-500 font-light mt-0.5 leading-snug">
                Sends an alert this many numbers ahead so guests can walk to the gate.
              </p>
            </div>
            <div class="flex items-center rounded-[10px] border border-black/15 bg-white overflow-hidden shadow-2xs h-[38px] divide-x divide-black/10 focus-within:border-black transition-colors w-full">
              <input
                id="queue-notify-threshold"
                v-model.number="form.notifyThreshold"
                type="number"
                min="1"
                max="100"
                class="flex-1 h-full min-w-0 px-3 text-[14px] font-medium font-sans tabular-nums text-black bg-transparent border-none outline-none focus:outline-none"
              />
              <span class="px-3 h-full flex items-center justify-center text-[11px] font-medium text-neutral-400 bg-black/[0.02] select-none uppercase">
                Ahead
              </span>
            </div>
          </div>

          <!-- Rule 3: Missed Turn Margin -->
          <div class="p-4 rounded-[14px] bg-neutral-50/70 border border-black/5 flex flex-col justify-between gap-3">
            <div>
              <label for="queue-skipped-tolerance" class="text-[13px] font-medium text-black block">Missed Turn Margin</label>
              <p class="text-[11.5px] text-neutral-500 font-light mt-0.5 leading-snug">
                Grace turns allowed before skipped tickets expire to keep the line moving.
              </p>
            </div>
            <div class="flex items-center rounded-[10px] border border-black/15 bg-white overflow-hidden shadow-2xs h-[38px] divide-x divide-black/10 focus-within:border-black transition-colors w-full">
              <input
                id="queue-skipped-tolerance"
                v-model.number="form.skippedTolerance"
                type="number"
                min="1"
                max="50"
                class="flex-1 h-full min-w-0 px-3 text-[14px] font-medium font-sans tabular-nums text-black bg-transparent border-none outline-none focus:outline-none"
              />
              <span class="px-3 h-full flex items-center justify-center text-[11px] font-medium text-neutral-400 bg-black/[0.02] select-none uppercase">
                Turns
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card B: Notification Channels (WhatsApp vs Email Switcher) -->
      <div class="p-6 md:p-7 rounded-[18px] border border-black/10 bg-white flex flex-col gap-6 shadow-xs">
        
        <!-- Channels Sub-Tab Switcher -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/10">
          <div>
            <h3 class="text-[17px] font-medium text-black">Guest Notification Channels</h3>
            <p class="text-[12.5px] text-neutral-500 font-light mt-0.5">Manage automated WhatsApp and Email message templates.</p>
          </div>

          <!-- Channel Pills -->
          <div class="flex items-center gap-1 p-1 bg-neutral-100 rounded-[10px] border border-black/5 w-fit">
            <button
              type="button"
              @click="activeNotificationTab = 'whatsapp'"
              class="h-[32px] px-3.5 rounded-[7px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeNotificationTab === 'whatsapp' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
            >
              <Smartphone class="w-3.5 h-3.5" />
              <span>WhatsApp Alerts</span>
            </button>

            <button
              type="button"
              @click="activeNotificationTab = 'email'"
              class="h-[32px] px-3.5 rounded-[7px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeNotificationTab === 'email' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
            >
              <Mail class="w-3.5 h-3.5" />
              <span>Email Confirmations</span>
            </button>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- CHANNEL 1: WHATSAPP NOTIFICATIONS                              -->
        <!-- ============================================================== -->
        <div v-if="activeNotificationTab === 'whatsapp'" class="flex flex-col gap-6">
          
          <!-- WhatsApp Master Switch & Connection Bar -->
          <div class="p-4 sm:p-5 rounded-[14px] bg-neutral-50 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.waEnabled" class="sr-only peer" />
                <div class="w-10 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <div>
                <span class="text-[13.5px] font-medium text-black">Enable Automated WhatsApp Alerts</span>
                <p class="text-[11.5px] text-neutral-500 font-light mt-0.5">
                  Sends automated WhatsApp notifications to guests for tickets and line updates.
                </p>
              </div>
            </div>

            <!-- Device Connection Pill / Action -->
            <div class="flex items-center gap-2">
              <div v-if="form.waConnection?.connected" class="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-moss-50 border border-moss-200 text-[12px] text-moss-800 font-medium">
                <span class="size-2 rounded-full bg-moss-600" />
                <span>Linked: +{{ form.waConnection.phoneNumber }}</span>
                <button type="button" @click="disconnectWhatsAppDevice" class="ml-1 text-neutral-400 hover:text-oxblood-600 transition-colors" title="Disconnect device">
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                v-else
                type="button"
                @click="openWhatsAppQrModal"
                class="h-[34px] px-3.5 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <QrCode class="w-3.5 h-3.5" />
                <span>Link Device via QR</span>
              </button>
            </div>
          </div>

          <!-- Secondary Toolbar: Advanced Gateway, Test Message, Delivery Logs -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span class="text-[11.5px] text-neutral-400 font-light">Technical Tools:</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openLinkModal"
                class="h-[32px] px-3 rounded-[8px] border border-black/15 hover:bg-black/5 text-[11.5px] font-medium text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Configure custom Fonnte, Wablas, or Meta Cloud gateway"
              >
                <Link2 class="w-3.5 h-3.5" />
                <span>Advanced Gateway Settings</span>
              </button>

              <button
                type="button"
                @click="openTestModal"
                class="h-[32px] px-3 rounded-[8px] border border-black/15 hover:bg-black/5 text-[11.5px] font-medium text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send class="w-3.5 h-3.5" />
                <span>Send Test</span>
              </button>

              <button
                type="button"
                @click="openLogsModal"
                class="h-[32px] px-3 rounded-[8px] border border-black/15 hover:bg-black/5 text-[11.5px] font-medium text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <History class="w-3.5 h-3.5" />
                <span>Delivery Logs</span>
              </button>
            </div>
          </div>

          <!-- WhatsApp Message Stages & Live Chat Bubble Preview -->
          <div class="flex flex-col gap-4 pt-2">
            <!-- Stage Selector Pills -->
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="s in DEFAULT_STAGES"
                :key="s.id"
                type="button"
                @click="selectActiveWaStage(s.id)"
                class="px-3 py-1.5 rounded-[8px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
                :class="(form.activeWaStage || activeStageId) === s.id ? 'bg-black text-white font-medium shadow-xs' : 'bg-neutral-100 text-neutral-600 hover:text-black font-light'"
              >
                <component :is="s.icon" class="w-3.5 h-3.5" />
                <span>{{ s.title }}</span>
                <span class="text-[9.5px] opacity-75 font-sans">({{ s.triggerSummary }})</span>
              </button>
            </div>

            <!-- 2-Column Split: Message Text Editor on Left vs Chat Preview on Right -->
            <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
              
              <!-- Left: Text Editor -->
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-[12px] font-medium text-black">Message Content ({{ currentStage.title }})</span>
                  <span class="text-[11px] text-neutral-400 font-sans">{{ (form.waTemplates[activeStageId] || '').length }} chars</span>
                </div>

                <textarea
                  v-model="form.waTemplates[activeStageId]"
                  rows="5"
                  class="w-full p-3.5 rounded-[12px] bg-neutral-50 border border-black/15 text-[13px] leading-relaxed font-sans font-light text-black outline-none focus:border-black focus:bg-white transition-all resize-y placeholder:text-neutral-400"
                  placeholder="Enter WhatsApp notification copy..."
                />

                <!-- Dynamic Variables Chips -->
                <div class="flex flex-col gap-1.5">
                  <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Insert Dynamic Variables:</span>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="t in currentStage.tags"
                      :key="t.key"
                      type="button"
                      @click="insertTag(t.key)"
                      class="px-2.5 py-1 rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium text-neutral-800 cursor-pointer flex items-center gap-1 transition-colors"
                      :title="t.description"
                    >
                      <span>+ {{ t.label }}</span>
                      <span class="text-[9.5px] text-neutral-400 font-sans">&#123;&#123;{{ t.key }}&#125;&#125;</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right: Live WhatsApp Chat Bubble Preview -->
              <div class="rounded-[16px] border border-black/10 overflow-hidden bg-[#efeae2] flex flex-col shadow-xs select-none">
                <!-- Chat Header -->
                <div class="px-4 py-2.5 bg-[#075e54] text-white flex items-center justify-between text-[12px]">
                  <div class="flex items-center gap-2">
                    <div class="size-6 rounded-full bg-white/20 flex items-center justify-center font-medium text-[10px]">
                      707
                    </div>
                    <span class="font-medium">707 Activation Hub</span>
                  </div>
                  <span class="text-[10px] text-white/70">{{ previewTime }}</span>
                </div>

                <!-- Chat Canvas & Message Bubble -->
                <div class="p-4 min-h-[160px] flex flex-col justify-end gap-2">
                  <div class="max-w-[85%] self-start bg-white rounded-[12px] rounded-tl-[3px] p-3 shadow-sm border border-black/5 flex flex-col gap-1">
                    <p class="text-[12px] leading-relaxed text-black whitespace-pre-wrap font-sans font-light">
                      {{ renderedPreviewText }}
                    </p>
                    <div class="flex items-center justify-end gap-1 text-[9.5px] text-neutral-400 pt-0.5">
                      <span>{{ previewTime }}</span>
                      <span class="text-moss-700">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================================== -->
        <!-- CHANNEL 2: EMAIL NOTIFICATIONS                                 -->
        <!-- ============================================================== -->
        <div v-else class="flex flex-col gap-6">
          
          <!-- Email Master Switch & Delivery Status -->
          <div class="p-4 sm:p-5 rounded-[14px] bg-neutral-50 border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="form.emailNotificationEnabled" class="sr-only peer" />
                <div class="w-10 h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
              <div>
                <span class="text-[13.5px] font-medium text-black">Enable Primary Email Confirmations</span>
                <p class="text-[11.5px] text-neutral-500 font-light mt-0.5">
                  Delivers official e-tickets and PDF passes directly to the guest's inbox.
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-moss-50 border border-moss-200 text-[12px] text-moss-800 font-medium">
              <span class="size-2 rounded-full bg-moss-600" />
              <span>SMTP Delivery Active</span>
            </div>
          </div>

          <!-- Email Stages Selector -->
          <div class="flex items-center gap-2 p-1 rounded-[10px] bg-neutral-100 border border-black/5 w-fit">
            <button
              type="button"
              @click="activeEmailTab = 'pass'"
              class="px-3.5 py-1.5 rounded-[7px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeEmailTab === 'pass' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
            >
              <QrCode class="w-3.5 h-3.5" />
              <span>1. Ticket & Live Pass Email</span>
            </button>

            <button
              type="button"
              @click="activeEmailTab = 'ready'"
              class="px-3.5 py-1.5 rounded-[7px] text-[12px] font-sans flex items-center gap-1.5 transition-all cursor-pointer"
              :class="activeEmailTab === 'ready' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black font-light'"
            >
              <UserCheck class="w-3.5 h-3.5" />
              <span>2. Entry Call Email</span>
            </button>
          </div>

          <!-- Email Editor + Live Clean Preview -->
          <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
            
            <!-- Left: Inputs -->
            <div class="flex flex-col gap-4">
              <!-- Subject -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-medium uppercase tracking-normal text-neutral-500">Email Subject Line</label>
                <input
                  v-model="currentEmailTemplate.subject"
                  type="text"
                  class="w-full h-[40px] px-3.5 rounded-[10px] bg-neutral-50 border border-black/15 text-[13px] font-sans font-light text-black outline-none focus:border-black focus:bg-white transition-all placeholder:text-neutral-400"
                  placeholder="e.g. Your 707 ticket for {{campaign}}"
                />
              </div>

              <!-- Main Heading -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-medium uppercase tracking-normal text-neutral-500">Main Heading</label>
                <input
                  v-model="currentEmailTemplate.heading"
                  type="text"
                  class="w-full h-[40px] px-3.5 rounded-[10px] bg-neutral-50 border border-black/15 text-[13px] font-sans font-light text-black outline-none focus:border-black focus:bg-white transition-all placeholder:text-neutral-400"
                  placeholder="e.g. Your ticket"
                />
              </div>

              <!-- Body Copy -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[12px] font-medium uppercase tracking-normal text-neutral-500">Body Copy / Instructions</label>
                <textarea
                  v-model="currentEmailTemplate.body"
                  rows="4"
                  class="w-full p-3.5 rounded-[12px] bg-neutral-50 border border-black/15 text-[13px] leading-relaxed font-sans font-light text-black outline-none focus:border-black focus:bg-white transition-all resize-y placeholder:text-neutral-400"
                  placeholder="Enter email body copy..."
                />
              </div>

              <!-- Variable Pills -->
              <div class="flex flex-col gap-1.5">
                <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Insert Dynamic Variables:</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="v in emailVariablePills"
                    :key="v.key"
                    type="button"
                    @click="insertEmailTag(v.key)"
                    class="px-2.5 py-1 rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-[11px] font-medium text-neutral-800 cursor-pointer flex items-center gap-1 transition-colors"
                    :title="v.description"
                  >
                    <span>+ {{ v.label }}</span>
                    <span class="text-[9.5px] text-neutral-400 font-sans">&#123;&#123;{{ v.key }}&#125;&#125;</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Clean Email Preview -->
            <div class="rounded-[16px] border border-black/10 overflow-hidden bg-neutral-100 p-4 flex flex-col gap-2 shadow-xs select-none">
              <div class="p-5 rounded-[12px] bg-white border border-black/5 flex flex-col gap-4 shadow-2xs">
                <div class="flex items-center justify-between pb-3 border-b border-black/5">
                  <div class="flex items-center gap-2">
                    <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707" class="h-3.5 w-auto object-contain" />
                    <span class="text-[10px] text-neutral-400 uppercase tracking-normal">Campaign Pass</span>
                  </div>
                  <span class="text-[10px] text-neutral-400 font-sans">Official Ticket</span>
                </div>

                <div class="flex flex-col gap-1">
                  <span class="text-[11px] font-medium text-neutral-400 uppercase">Subject: {{ renderedEmailSubject }}</span>
                  <h4 class="text-[16px] font-medium text-black mt-1">{{ renderedEmailHeading }}</h4>
                  <p class="text-[12.5px] text-neutral-600 font-light leading-relaxed mt-1 whitespace-pre-wrap">
                    {{ renderedEmailBody }}
                  </p>
                </div>

                <!-- Attached Ticket Mockup -->
                <div class="p-3 rounded-[10px] bg-neutral-50 border border-black/5 flex items-center justify-between text-[11.5px] text-neutral-600">
                  <div class="flex items-center gap-2">
                    <Paperclip class="w-3.5 h-3.5 text-neutral-400" />
                    <span class="font-medium">ticket-sarah-jenkins.pdf</span>
                  </div>
                  <span class="text-[10.5px] text-neutral-400">PDF Attached</span>
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
      <div class="w-full max-w-[580px] bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-sans font-light tracking-normal animate-apple-pop">
        <div class="p-6 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-[12px] bg-black text-white flex items-center justify-center shadow-xs">
              <QrCode class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-medium text-black tracking-tight">Link WhatsApp Device</h3>
              <p class="text-[12px] text-neutral-500">Scan QR from WhatsApp Settings &gt; Linked Devices.</p>
            </div>
          </div>
          <button
            type="button"
            @click="closeWhatsAppQrModal"
            class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Error Alert if any -->
        <div v-if="waDeviceStatus.error" class="mx-6 mt-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-800 text-[12px]">
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{{ waDeviceStatus.error }}</span>
          </div>
          <button type="button" @click="openWhatsAppQrModal" class="px-2.5 py-1 rounded-[6px] bg-red-100 hover:bg-red-200 font-medium text-[11px] shrink-0 cursor-pointer">
            Retry
          </button>
        </div>

        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <!-- Steps -->
          <div class="flex flex-col gap-3.5 text-[12.5px]">
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full bg-black text-white text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Open WhatsApp on your phone</span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full bg-black text-white text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Go to <strong>Settings</strong> &gt; <strong>Linked Devices</strong></span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full bg-black text-white text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Tap <strong>Link a Device</strong></span>
            </div>
            <div class="flex items-start gap-2.5">
              <span class="size-5 rounded-full bg-black text-white text-[10px] font-medium flex items-center justify-center shrink-0 mt-0.5">4</span>
              <span>Point your phone at this QR code</span>
            </div>
          </div>

          <!-- QR Code Frame -->
          <div class="flex flex-col items-center justify-center p-4 bg-neutral-50 rounded-[18px] border border-black/8 min-h-[220px]">
            <div v-if="waDeviceStatus.qr" class="size-48 bg-white p-2 rounded-[12px] border border-black/10 shadow-xs flex items-center justify-center">
              <img :src="waDeviceStatus.qr" alt="WhatsApp Link QR" class="size-full object-contain" />
            </div>
            <div v-else class="flex flex-col items-center justify-center gap-2 text-neutral-400 py-8">
              <RefreshCw class="w-6 h-6 animate-spin text-neutral-500" />
              <span class="text-[12px]">Generating QR code…</span>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-between text-[11.5px] text-neutral-400">
          <span>Encrypted point-to-point connection</span>
          <button type="button" @click="closeWhatsAppQrModal" class="text-neutral-600 hover:text-black font-medium cursor-pointer">
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
      <div class="w-full max-w-[540px] bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-sans font-light tracking-normal animate-apple-pop">
        <div class="p-6 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 class="text-[17px] font-medium text-black">Advanced Gateway Settings</h3>
            <p class="text-[12px] text-neutral-500">Configure third-party WhatsApp API gateways.</p>
          </div>
          <button type="button" @click="showLinkModal = false" class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
          <!-- Preset selector -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium text-neutral-600">Gateway Provider</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="p in (['fonnte', 'wablas', 'meta', 'custom'] as const)"
                :key="p"
                type="button"
                @click="onGatewayPresetChange(p)"
                class="h-[34px] rounded-[8px] text-[12px] font-medium capitalize border transition-all cursor-pointer"
                :class="gatewayPreset === p ? 'bg-black text-white border-black shadow-xs' : 'bg-neutral-50 text-neutral-600 border-black/10 hover:bg-neutral-100'"
              >
                {{ p }}
              </button>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium text-neutral-600">Sender Phone Number</label>
            <input
              v-model="linkPhone"
              type="text"
              placeholder="+62 812-3456-7890"
              class="w-full h-[40px] px-3.5 rounded-[10px] bg-neutral-50 border border-black/15 text-[13px] outline-none focus:border-black focus:bg-white transition-all font-sans"
            />
          </div>

          <!-- Gateway URL -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium text-neutral-600">Gateway API URL</label>
            <input
              v-model="linkGatewayUrl"
              type="text"
              class="w-full h-[40px] px-3.5 rounded-[10px] bg-neutral-50 border border-black/15 text-[13px] outline-none focus:border-black focus:bg-white transition-all font-sans"
            />
          </div>

          <!-- API Token -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium text-neutral-600">API Key / Token</label>
            <input
              v-model="linkApiToken"
              type="password"
              placeholder="Enter gateway API token"
              class="w-full h-[40px] px-3.5 rounded-[10px] bg-neutral-50 border border-black/15 text-[13px] outline-none focus:border-black focus:bg-white transition-all font-sans"
            />
          </div>
        </div>

        <div class="p-5 border-t border-black/10 bg-neutral-50 flex items-center justify-end gap-2.5">
          <button type="button" @click="showLinkModal = false" class="h-[36px] px-4 rounded-[10px] border border-black/15 hover:bg-neutral-100 text-[12.5px] font-medium text-neutral-700 cursor-pointer">
            Cancel
          </button>
          <button type="button" @click="handleConfirmLink" :disabled="isLinking" class="h-[36px] px-5 rounded-[10px] bg-black text-white hover:bg-neutral-800 text-[12.5px] font-medium cursor-pointer shadow-xs disabled:opacity-50">
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
      <div class="w-full max-w-[460px] bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-sans font-light tracking-normal animate-apple-pop">
        <div class="p-6 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 class="text-[17px] font-medium text-black">Send Test Notification</h3>
            <p class="text-[12px] text-neutral-500">Dispatch a test message to your phone.</p>
          </div>
          <button type="button" @click="showTestModal = false" class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-6 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium text-neutral-600">Recipient Phone Number</label>
            <input
              v-model="testPhone"
              type="text"
              placeholder="+62 812-3456-7890"
              class="w-full h-[40px] px-3.5 rounded-[10px] bg-neutral-50 border border-black/15 text-[13px] outline-none focus:border-black focus:bg-white transition-all font-sans"
            />
          </div>

          <div class="p-3.5 rounded-[12px] bg-neutral-50 border border-black/5 text-[12px] text-neutral-600 leading-relaxed">
            Message Preview:
            <p class="italic mt-1 text-black font-sans font-light whitespace-pre-wrap">"{{ testPreviewMessage }}"</p>
          </div>
        </div>

        <div class="p-5 border-t border-black/10 bg-neutral-50 flex items-center justify-between">
          <button type="button" @click="handleDirectWhatsAppOpen" class="text-[12px] text-neutral-600 hover:text-black underline cursor-pointer">
            Open in WhatsApp App
          </button>
          <div class="flex items-center gap-2">
            <button type="button" @click="showTestModal = false" class="h-[36px] px-4 rounded-[10px] border border-black/15 hover:bg-neutral-100 text-[12.5px] font-medium text-neutral-700 cursor-pointer">
              Cancel
            </button>
            <button type="button" @click="handleSendTestMessage" :disabled="isSendingTest" class="h-[36px] px-5 rounded-[10px] bg-black text-white hover:bg-neutral-800 text-[12.5px] font-medium cursor-pointer shadow-xs disabled:opacity-50">
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
      <div class="w-full max-w-[720px] bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-sans font-light tracking-normal max-h-[85vh] animate-apple-pop">
        <div class="p-6 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-[12px] bg-black text-white flex items-center justify-center shadow-xs">
              <History class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-medium text-black">WhatsApp Notification Logs</h3>
              <p class="text-[12px] text-neutral-500">Real-time record of dispatched alerts.</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" @click="refreshLogs" class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-500 cursor-pointer" title="Refresh">
              <RefreshCw class="w-4 h-4" :class="isLoadingLogs ? 'animate-spin' : ''" />
            </button>
            <button type="button" @click="showLogsModal = false" class="size-8 rounded-[8px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer">
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
            <p class="text-[13px] font-medium text-neutral-600 mt-2">No notification logs recorded yet</p>
            <p class="text-[12px] text-neutral-400 font-light">Dispatched WhatsApp alerts will be archived here.</p>
          </div>
          <div v-else class="flex flex-col gap-2">
            <div
              v-for="log in waLogs"
              :key="log.id"
              class="p-3.5 rounded-[12px] border border-black/5 bg-neutral-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[12px]"
            >
              <div class="flex items-center gap-3">
                <span
                  class="size-2 rounded-full shrink-0"
                  :class="log.status === 'delivered' || log.status === 'sent' ? 'bg-moss-600' : 'bg-oxblood-600'"
                />
                <span class="font-medium text-black">{{ log.phone }}</span>
                <span class="px-2 py-0.5 rounded-[4px] bg-black/5 text-[10px] uppercase font-sans text-neutral-600">
                  {{ log.event || 'alert' }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-neutral-400 text-[11px] font-sans">
                <span>{{ formatLogTime(log.timestamp) }}</span>
                <span :class="log.status === 'delivered' || log.status === 'sent' ? 'text-moss-700 font-medium' : 'text-oxblood-600 font-medium'">
                  {{ log.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-end">
          <button type="button" @click="showLogsModal = false" class="h-[34px] px-4 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium cursor-pointer">
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
import {
  RefreshCw,
  Check,
  Users,
  BellRing,
  Clock,
  MessageSquare,
  Smartphone,
  ShieldCheck,
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
  Paperclip,
  SlidersHorizontal,
  ArrowUpRight
} from 'lucide-vue-next';
import { FIGMA_ASSETS } from '../../constants/figmaAssets.ts';
import { glassConfirm, glassPrompt } from '../../services/glassDialog.ts';
import {
  fetchQueueSettings,
  saveQueueSettingsApi,
  callNextQueue,
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
}>();

const emit = defineEmits<{
  (e: 'toast', msg: string): void;
}>();

const editorStore = useEditorStore();
const isLoading = ref(false);
const isSaving = ref(false);
const activePanelTab = ref<'operations' | 'settings'>('operations');
const activeNotificationTab = ref<'whatsapp' | 'email'>('whatsapp');
const activeStageId = ref<string>('ready');

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
    .replace(/\{\{\s*campaign\s*\}\}/g, editorStore.projectTitle || '707 Activation')
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
      emit('toast', 'Queue settings and notification preferences saved successfully.');
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
      emit('toast', `WhatsApp (${display}) connected & ready!`);
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
    emit('toast', 'Please enter a valid recipient phone number (min 9 digits, e.g. 0812... or +62...).');
    return;
  }
  const text = encodeURIComponent(testPreviewMessage.value);
  const waUrl = `https://wa.me/${clean}?text=${text}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  emit('toast', `Opening WhatsApp for +${clean}…`);
}

async function handleSendTestMessage() {
  if (!props.pageId) return;
  const raw = testPhone.value.trim() || form.waConnection?.phoneNumber || '';
  const clean = normalizeWhatsAppNumber(raw);
  if (!clean || clean.length < 9) {
    emit('toast', 'Please enter a valid recipient phone number (min 9 digits, e.g. 0812... or +62...).');
    return;
  }
  isSendingTest.value = true;
  try {
    const res = await sendWaTestMessageApi(props.pageId, clean, testPreviewMessage.value);
    if (res?.success) {
      if (res.mode === 'direct' && res.waUrl) {
        window.open(res.waUrl, '_blank', 'noopener,noreferrer');
        emit('toast', `Direct WhatsApp opened for ${formatWhatsAppDisplay(clean)}! Tap send in WhatsApp.`);
      } else {
        emit('toast', res.message || `Test notification dispatched to ${formatWhatsAppDisplay(clean)}!`);
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
