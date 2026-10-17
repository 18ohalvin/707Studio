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

    <!-- 2. Primary Email Notifications Section (Always Active & Free From Spam Bans) -->
    <div class="p-7 sm:p-8 md:p-10 rounded-[22px] border border-black/10 bg-white flex flex-col gap-8 shadow-xs">
      <!-- Email Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-black/10">
        <div class="flex items-start gap-4">
          <div class="size-11 rounded-[12px] flex items-center justify-center shrink-0 mt-0.5 bg-black text-white shadow-sm">
            <Mail class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h3 class="text-[18px] font-medium tracking-tight text-black">Primary Email Notifications</h3>
              <span class="text-[10.5px] uppercase tracking-[0.1em] font-mono px-2.5 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                Primary • Active
              </span>
            </div>
            <p class="text-[13.5px] text-neutral-500 mt-1 leading-relaxed max-w-[640px]">
              Guaranteed delivery for tickets, live queue position tracking, and entrance calls without risk of WhatsApp account bans or carrier blocks.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-neutral-50 border border-black/10 text-[12px] font-mono text-neutral-600 shrink-0">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SMTP Delivery Active</span>
        </div>
      </div>

      <!-- Email Template Selector (Pass Confirmation vs Turn Ready) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center gap-2 p-1 rounded-[12px] bg-black/[0.03] border border-black/5 w-fit">
          <button
            type="button"
            @click="activeEmailTab = 'pass'"
            class="px-4 py-2 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-2"
            :class="activeEmailTab === 'pass' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'"
          >
            <QrCode class="w-4 h-4" />
            <span>1. Ticket & Live Pass Email</span>
            <span class="text-[10px] font-mono uppercase bg-black/5 px-1.5 py-0.5 rounded text-neutral-500">On Submit</span>
          </button>
          <button
            type="button"
            @click="activeEmailTab = 'ready'"
            class="px-4 py-2 rounded-[9px] text-[13px] font-medium transition-all cursor-pointer flex items-center gap-2"
            :class="activeEmailTab === 'ready' ? 'bg-white text-black shadow-xs' : 'text-neutral-500 hover:text-black'"
          >
            <UserCheck class="w-4 h-4" />
            <span>2. Turn Ready / Gate Admission</span>
            <span class="text-[10px] font-mono uppercase bg-black/5 px-1.5 py-0.5 rounded text-neutral-500">Door Call</span>
          </button>
        </div>

        <span class="text-[11.5px] text-neutral-400 font-mono">
          Variables: &#123;&#123;name&#125;&#125;, &#123;&#123;queue_number&#125;&#125;, &#123;&#123;campaign&#125;&#125;, &#123;&#123;link&#125;&#125;
        </span>
      </div>

      <!-- Email Editor + Live Luxury Email Preview -->
      <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <!-- Left: Form Fields (Subject, Heading, Body Copy) -->
        <div class="flex flex-col gap-4">
          <!-- Subject Line Field -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-500 flex items-center justify-between">
              <span>Email Subject Line</span>
              <span class="text-[11px] text-neutral-400 font-mono">{{ currentEmailTemplate.subject?.length || 0 }} chars</span>
            </label>
            <input
              v-model="currentEmailTemplate.subject"
              type="text"
              class="w-full h-[42px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] font-707 text-black outline-none focus:border-black focus:bg-white transition-all placeholder:text-neutral-400"
              placeholder="e.g. Your 707 ticket for {{campaign}}"
            />
          </div>

          <!-- Email Heading Field -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-500">
              Email Main Heading
            </label>
            <input
              v-model="currentEmailTemplate.heading"
              type="text"
              class="w-full h-[42px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] font-707 text-black outline-none focus:border-black focus:bg-white transition-all placeholder:text-neutral-400"
              placeholder="e.g. Your ticket"
            />
          </div>

          <!-- Email Body Copy Field -->
          <div class="flex flex-col gap-1.5">
            <label class="text-[12px] font-medium uppercase tracking-[0.08em] text-neutral-500 flex items-center justify-between">
              <span>Body Copy / Intro</span>
              <span class="text-[11px] text-neutral-400 font-mono">{{ currentEmailTemplate.body?.length || 0 }} chars</span>
            </label>
            <textarea
              v-model="currentEmailTemplate.body"
              rows="4"
              class="w-full p-3.5 rounded-[12px] bg-black/[0.02] border border-black/15 text-[13.5px] leading-relaxed font-707 text-black outline-none focus:border-black focus:bg-white transition-all resize-y placeholder:text-neutral-400"
              placeholder="Enter message body copy..."
            />
          </div>

          <!-- Dynamic Variable Pills -->
          <div class="flex flex-col gap-1.5">
            <span class="text-[11px] uppercase tracking-[0.08em] text-neutral-500 font-medium">Insert Dynamic Variables:</span>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="v in emailVariablePills"
                :key="v.key"
                type="button"
                @click="insertEmailTag(v.key)"
                class="px-2.5 py-1 rounded-[8px] bg-black/5 hover:bg-black/10 border border-black/5 text-[11.5px] font-medium text-neutral-800 cursor-pointer flex items-center gap-1 transition-colors"
                :title="v.description"
              >
                <span>+ {{ v.label }}</span>
                <span class="text-[10px] text-neutral-400 font-mono">&#123;&#123;{{ v.key }}&#125;&#125;</span>
              </button>
            </div>
          </div>

          <!-- Live Tracking Link Button Settings (Pass Confirmation Email) -->
          <div v-if="activeEmailTab === 'pass'" class="p-4 rounded-[14px] bg-black/[0.02] border border-black/10 flex flex-col gap-3">
            <div class="flex items-center justify-between gap-3">
              <div class="flex flex-col min-w-0">
                <span class="text-[12.5px] font-semibold text-black">Live Queue Tracking Link Button</span>
                <span class="text-[11.5px] text-neutral-500">Provides guests a 1-tap button to track their live queue position without WhatsApp.</span>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="currentEmailTemplate.includeLiveTrackingButton !== false"
                @click="currentEmailTemplate.includeLiveTrackingButton = !(currentEmailTemplate.includeLiveTrackingButton !== false)"
                class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-200"
                :class="currentEmailTemplate.includeLiveTrackingButton !== false ? 'bg-black' : 'bg-neutral-200'"
                title="Toggle live queue button in email"
              >
                <span
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition duration-200"
                  :class="currentEmailTemplate.includeLiveTrackingButton !== false ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>

            <div v-if="currentEmailTemplate.includeLiveTrackingButton !== false" class="flex flex-col gap-1.5 pt-1">
              <label class="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-500">
                Email Button Label
              </label>
              <input
                v-model="currentEmailTemplate.liveTrackingButtonLabel"
                type="text"
                placeholder="VIEW LIVE QUEUE"
                class="w-full h-[38px] px-3 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black uppercase transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Right: Elegant Live Email Card Preview -->
        <div class="rounded-[16px] border border-black/10 bg-white overflow-hidden shadow-xs flex flex-col">
          <!-- Fake Email Client Chrome Header -->
          <div class="px-4 py-3 bg-neutral-100/80 border-b border-black/10 flex flex-col gap-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <span class="size-2.5 rounded-full bg-red-400/80" />
                <span class="size-2.5 rounded-full bg-amber-400/80" />
                <span class="size-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span class="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">Email Inbox Preview</span>
            </div>
            <div class="flex flex-col gap-0.5 text-[12px]">
              <div class="flex items-center gap-2">
                <span class="font-medium text-neutral-400 w-14 text-right text-[11px]">Subject:</span>
                <span class="font-semibold text-black truncate">{{ renderedEmailSubject }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-medium text-neutral-400 w-14 text-right text-[11px]">From:</span>
                <span class="text-neutral-600 truncate">707 Studio &lt;notifications@707studio.id&gt;</span>
              </div>
            </div>
          </div>

          <!-- Email Content Body -->
          <div class="p-6 flex flex-col gap-5 bg-white">
            <!-- Brand Wordmark Header -->
            <div class="flex items-center justify-between pb-4 border-b border-black/10">
              <span class="text-[16px] font-bold tracking-tight text-black font-707">707 STUDIO</span>
              <span class="text-[10px] font-mono uppercase bg-black/5 px-2 py-0.5 rounded text-neutral-600">Official Pass</span>
            </div>

            <!-- Email Headline -->
            <div class="flex flex-col gap-1.5">
              <h2 class="text-[20px] font-semibold text-black tracking-tight leading-snug">
                {{ renderedEmailHeading }}
              </h2>
              <p class="text-[13px] text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {{ renderedEmailBody }}
              </p>
            </div>

            <!-- Details Summary Grid -->
            <div class="p-3.5 rounded-[10px] bg-neutral-50 border border-black/5 grid grid-cols-2 gap-3 text-[12px]">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-mono uppercase text-neutral-400">Queue Number</span>
                <span class="font-mono font-bold text-black text-[14px]">#42</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-mono uppercase text-neutral-400">Access ID</span>
                <span class="font-mono font-bold text-black text-[14px]">707-K92F</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-mono uppercase text-neutral-400">Visitor</span>
                <span class="font-medium text-black truncate">Sarah Jenkins</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10px] font-mono uppercase text-neutral-400">Event</span>
                <span class="font-medium text-black truncate">{{ editorStore.projectTitle || 'Atmos Drop' }}</span>
              </div>
            </div>

            <!-- Primary CTA Button (VIEW LIVE QUEUE) -->
            <div 
              v-if="activeEmailTab === 'ready' || currentEmailTemplate.includeLiveTrackingButton !== false" 
              class="flex flex-col items-center gap-1.5 pt-1"
            >
              <div class="w-full h-[44px] bg-black text-white rounded-[10px] flex items-center justify-center font-medium text-[13px] tracking-wide uppercase select-none shadow-sm cursor-default">
                {{ activeEmailTab === 'ready' ? 'VIEW LIVE PASS' : (currentEmailTemplate.liveTrackingButtonLabel || 'VIEW LIVE QUEUE') }}
              </div>
              <span class="text-[11px] text-neutral-500 text-center leading-tight">
                {{ activeEmailTab === 'ready' ? 'Your live pass is active and ready for door scanning.' : 'Your live position and QR code update automatically on this page.' }}
              </span>
            </div>

            <!-- PDF Attachment Indicator (for Pass email) -->
            <div v-if="activeEmailTab === 'pass'" class="pt-3 border-t border-black/5 flex items-center gap-2 text-[11px] text-neutral-500">
              <Paperclip class="w-3.5 h-3.5 text-neutral-400" />
              <span>Attachment: <strong>707-ticket-sarah.pdf</strong> (e-ticket with offline QR)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Option 2: WhatsApp Notification Section with Dedicated Apple-Style Toggle Switch -->
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

      <!-- State: Enabled (Full Journey Stepper & 100% English Template Editor + Live Preview) -->
      <template v-if="form.waEnabled">
        <!-- Zero-Cost WhatsApp Linked Device Gateway Section (Stanley Architecture) -->
        <div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          <!-- Left Column: Default Number & WhatsApp Gateway Card -->
          <div class="p-6 rounded-[20px] border border-black/10 bg-white flex flex-col gap-5 shadow-xs">
            <!-- 1. Default WhatsApp Number Header -->
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 font-bold">DEFAULT WHATSAPP NUMBER</span>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border transition-colors"
                :class="form.waConnection?.connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'"
              >
                <span class="size-1.5 rounded-full" :class="form.waConnection?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'"></span>
                {{ form.waConnection?.connected ? 'Linked' : 'Not Linked' }}
              </span>
            </div>

            <!-- Phone display & edit button -->
            <div class="p-3.5 rounded-[12px] border border-black/10 bg-neutral-50/70 flex items-center justify-between">
              <div class="flex items-center gap-3 min-w-0">
                <div class="size-9 rounded-[10px] bg-white border border-black/10 flex items-center justify-center text-neutral-600 shadow-2xs shrink-0">
                  <Phone class="w-4 h-4" />
                </div>
                <div class="min-w-0">
                  <div class="text-[11px] text-neutral-400 font-medium">Default Sender Phone</div>
                  <div class="text-[13.5px] font-semibold text-black font-mono truncate">
                    {{ form.waConnection?.formattedNumber || (form.waConnection?.phoneNumber ? `+${form.waConnection.phoneNumber}` : 'No phone configured') }}
                  </div>
                </div>
              </div>
              <button
                type="button"
                @click="editDefaultPhone"
                class="text-[11.5px] text-neutral-600 hover:text-black font-medium underline shrink-0 cursor-pointer pl-2"
              >
                Edit
              </button>
            </div>

            <!-- 2. WhatsApp Gateway Section -->
            <div class="pt-4 border-t border-black/10 flex flex-col gap-3.5">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 font-bold">WHATSAPP GATEWAY</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Zero Cost Direct
                </span>
              </div>

              <!-- Unlinked State -->
              <div v-if="!form.waConnection?.connected" class="flex flex-col gap-3.5">
                <p class="text-[12.5px] text-neutral-500 leading-relaxed">
                  Connect store phone via WhatsApp Linked Devices to send automated order notifications with no monthly platform fees.
                </p>
                <button
                  type="button"
                  class="h-[42px] px-5 rounded-[12px] bg-black hover:bg-neutral-800 text-white text-[13px] font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-sm w-full"
                  :disabled="isConnectingWa"
                  @click="openWhatsAppQrModal"
                >
                  <QrCode class="w-4 h-4" />
                  <span>{{ isConnectingWa ? 'Connecting Gateway...' : 'Link Device (QR Code)' }}</span>
                </button>
              </div>

              <!-- Connected State -->
              <div v-else class="flex flex-col gap-3">
                <div class="p-3.5 rounded-[12px] bg-emerald-500/[0.06] border border-emerald-200 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="text-[12.5px] font-semibold text-emerald-800">Gateway Active</span>
                  </div>
                  <span class="text-[13px] font-mono font-semibold text-emerald-900">
                    {{ form.waConnection?.formattedNumber || (form.waConnection?.phoneNumber ? `+${form.waConnection.phoneNumber}` : '') }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    class="h-[38px] px-3 rounded-[10px] border border-black/15 bg-white hover:bg-black/5 text-[12.5px] font-medium text-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    @click="openTestModal"
                  >
                    <Send class="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Message</span>
                  </button>
                  <button
                    type="button"
                    class="h-[38px] px-3 rounded-[10px] border border-red-200 text-red-600 hover:bg-red-50 text-[12.5px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    :disabled="isDisconnectingWa"
                    @click="disconnectWhatsAppDevice"
                  >
                    <Unlink class="w-3.5 h-3.5" />
                    <span>{{ isDisconnectingWa ? 'Unlinking...' : 'Disconnect' }}</span>
                  </button>
                </div>
              </div>

              <!-- Audit Logs & Advanced Link -->
              <div class="pt-1 flex items-center justify-between text-[11.5px] text-neutral-400">
                <button
                  type="button"
                  @click="openLogsModal"
                  class="hover:text-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <History class="w-3.5 h-3.5" />
                  <span>View Dispatch Logs</span>
                </button>
                <button
                  type="button"
                  @click="openLinkModal"
                  class="hover:text-black cursor-pointer transition-colors"
                >
                  Gateway API Options ⚙
                </button>
              </div>
            </div>
          </div>

          <!-- Right Column: Description & Feature Overview -->
          <div class="p-6 rounded-[20px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between h-full gap-4">
            <div>
              <div class="flex items-center gap-2 text-black font-medium text-[14.5px]">
                <ShieldCheck class="w-4 h-4 text-emerald-600" />
                <span>Zero-Cost Direct WhatsApp Automation</span>
              </div>
              <p class="text-[12.5px] text-neutral-500 mt-2 leading-relaxed">
                Uses WhatsApp Multi-Device linked device technology. Pair once with your official brand or store phone camera — our server sends messages directly through your active WhatsApp Web connection without monthly gateway subscription costs or message limits.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-black/10">
              <div class="flex flex-col gap-0.5">
                <span class="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider">Session</span>
                <span class="text-[13px] font-medium text-black">{{ form.waConnection?.connected ? 'Persistent' : 'Ready' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider">Protocol</span>
                <span class="text-[13px] font-medium text-black">WhatsApp Web MD</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="text-[10.5px] font-mono text-neutral-400 uppercase tracking-wider">Cost</span>
                <span class="text-[13px] font-medium text-emerald-600 font-mono">$0 / Free</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section Header: Anti-Ban & Single Targeted Milestone Architecture -->
        <div class="pt-4 border-t border-black/10 flex flex-col gap-3">
          <!-- Anti-Ban Protection Banner -->
          <div class="p-4 rounded-[14px] bg-amber-50/70 border border-amber-200/80 flex items-start gap-3.5">
            <div class="size-8 rounded-[8px] bg-amber-100 flex items-center justify-center shrink-0 mt-0.5 text-amber-800">
              <AlertTriangle class="w-4 h-4" />
            </div>
            <div class="flex flex-col gap-0.5 min-w-0 text-[12.5px] leading-relaxed">
              <span class="font-semibold text-amber-950">Meta Anti-Ban Policy — Single Milestone Limit</span>
              <span class="text-amber-900/85">
                Meta strictly penalizes repeated automated bulk messages. To safeguard your linked phone from carrier blocks and bans, automated WhatsApp messaging is restricted to <strong>1 single milestone per guest</strong>. Registration confirmations and live tracking are safely delivered via Primary Email.
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <h4 class="text-[13.5px] font-mono uppercase tracking-[0.08em] font-bold text-black">
                SELECTED WHATSAPP TRIGGER MILESTONE (1 PER GUEST MAX)
              </h4>
              <p class="text-[12px] text-neutral-500 mt-0.5">
                Select the single high-priority milestone that will dispatch an automated WhatsApp message to the guest:
              </p>
            </div>
            <span class="text-[10.5px] font-mono uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0 font-medium">
              Single Milestone Active
            </span>
          </div>
        </div>

        <!-- Single-Stage Choice Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            v-for="stage in DEFAULT_STAGES"
            :key="stage.id"
            type="button"
            @click="selectActiveWaStage(stage.id)"
            class="group p-4 rounded-[14px] border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative text-neutral-800"
            :class="form.activeWaStage === stage.id 
              ? 'bg-black text-white border-black shadow-md ring-1 ring-black' 
              : 'bg-white hover:bg-neutral-50 border-black/15 hover:border-black/30'"
          >
            <div class="flex items-center justify-between w-full">
              <div 
                class="size-7 rounded-[8px] flex items-center justify-center transition-colors"
                :class="form.activeWaStage === stage.id ? 'bg-white/15 text-white' : 'bg-black/5 text-neutral-700'"
              >
                <component :is="stage.icon || MessageSquare" class="w-4 h-4" />
              </div>
              <div class="flex items-center gap-1.5">
                <span 
                  v-if="stage.id === 'ready'"
                  class="text-[9.5px] font-mono uppercase px-1.5 py-0.5 rounded font-medium"
                  :class="form.activeWaStage === stage.id ? 'bg-emerald-400 text-black font-bold' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                >
                  Recommended
                </span>
                <div 
                  class="size-4 rounded-full border flex items-center justify-center transition-colors"
                  :class="form.activeWaStage === stage.id ? 'border-white bg-white text-black' : 'border-neutral-300 bg-transparent'"
                >
                  <Check v-if="form.activeWaStage === stage.id" class="w-2.5 h-2.5 stroke-[3]" />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-[13px] font-semibold leading-snug">{{ stage.title }}</span>
              <span class="text-[11.5px] leading-relaxed" :class="form.activeWaStage === stage.id ? 'text-white/70' : 'text-neutral-500'">
                {{ stage.triggerSummary }}
              </span>
            </div>
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

    <!-- Modal 0: WhatsApp Web Linked Device QR Scanner (Baileys) -->
    <div
      v-if="showWhatsAppQrModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      @click.self="closeWhatsAppQrModal"
    >
      <div class="w-full max-w-[640px] bg-white rounded-[24px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-707">
        <div class="p-6 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-[12px] bg-black text-white flex items-center justify-center shadow-xs">
              <QrCode class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-semibold text-black tracking-tight">Link WhatsApp Device</h3>
              <p class="text-[12.5px] text-neutral-500">Zero-cost automated notifications via WhatsApp Linked Devices.</p>
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
        <div v-if="waDeviceStatus.error" class="mx-6 mt-5 p-3.5 rounded-[12px] bg-red-50 border border-red-200 flex items-start justify-between gap-3 text-red-800 text-[12.5px]">
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{{ waDeviceStatus.error }}</span>
          </div>
          <button type="button" @click="openWhatsAppQrModal" class="px-2.5 py-1 rounded-[6px] bg-red-100 hover:bg-red-200 font-semibold text-[11px] shrink-0 cursor-pointer">
            Retry
          </button>
        </div>

        <!-- 2-Column Split: Steps on Left, QR on Right -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <!-- Steps -->
          <div class="flex flex-col gap-4">
            <div class="flex items-start gap-3">
              <span class="size-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                <div class="text-[13px] font-semibold text-black">Open WhatsApp</div>
                <div class="text-[12px] text-neutral-500 mt-0.5">Open WhatsApp or WhatsApp Business on your phone.</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="size-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                <div class="text-[13px] font-semibold text-black">Go to Linked Devices</div>
                <div class="text-[12px] text-neutral-500 mt-0.5">Tap <strong>Settings</strong> (iOS) or <strong>⋮ Menu</strong> (Android) &gt; <strong>Linked Devices</strong>.</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="size-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                <div class="text-[13px] font-semibold text-black">Link a Device</div>
                <div class="text-[12px] text-neutral-500 mt-0.5">Tap <strong>Link a Device</strong> and authenticate with biometric or passcode.</div>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="size-6 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                <div class="text-[13px] font-semibold text-black">Scan QR Code</div>
                <div class="text-[12px] text-neutral-500 mt-0.5">Point phone camera directly at the QR code on screen.</div>
              </div>
            </div>
          </div>

          <!-- QR Display Box -->
          <div class="flex flex-col items-center justify-center p-4 rounded-[16px] bg-neutral-50 border border-black/10 min-h-[260px] text-center">
            <template v-if="waDeviceStatus.qr">
              <img :src="waDeviceStatus.qr" alt="WhatsApp Pairing QR" class="size-[220px] rounded-[10px] bg-white p-2 border border-black/10 shadow-xs object-contain" />
              <div class="mt-3 flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Waiting for camera scan...</span>
              </div>
              <div v-if="waDeviceStatus.pairingCode" class="mt-4 w-full border-t border-black/10 pt-3">
                <div class="text-[11px] text-neutral-500">Can't scan? On the phone choose <strong>Link with phone number instead</strong> and enter:</div>
                <div class="mt-1.5 font-mono text-[22px] font-bold tracking-[0.18em] text-black select-all">{{ waDeviceStatus.pairingCode }}</div>
              </div>
            </template>
            <template v-else-if="waDeviceStatus.status === 'connecting' || isConnectingWa">
              <div class="flex flex-col items-center gap-3">
                <div class="size-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span class="text-[12.5px] text-neutral-600 font-medium">Generating secure QR code...</span>
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col items-center gap-2 text-neutral-400">
                <QrCode class="size-12 opacity-30" />
                <span class="text-[12px]">Click Retry to generate a new QR</span>
                <button type="button" @click="openWhatsAppQrModal" class="mt-2 px-3 py-1.5 rounded-[8px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 cursor-pointer">
                  Generate QR
                </button>
              </div>
            </template>
          </div>
        </div>

        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-between text-[11.5px] text-neutral-400">
          <span>Authentic Multi-Device connection • End-to-end encrypted</span>
          <button type="button" @click="closeWhatsAppQrModal" class="px-4 py-1.5 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-[12px] font-medium text-black cursor-pointer">
            Close
          </button>
        </div>
      </div>
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
              <MessageSquare class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-[17px] font-medium text-black">Configure WhatsApp Notifications</h3>
              <p class="text-[12.5px] text-neutral-500 mt-0.5">Connect your business number for reliable visitor alerts &amp; queue tracking.</p>
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
            @click="linkTab = 'direct'"
            class="pb-3 px-3.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2"
            :class="linkTab === 'direct' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'"
          >
            <Smartphone class="w-3.5 h-3.5" />
            <span>Direct WhatsApp (1-Tap Web/App)</span>
          </button>
          <button
            type="button"
            @click="linkTab = 'gateway'"
            class="pb-3 px-3.5 text-[13px] font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-2"
            :class="linkTab === 'gateway' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-neutral-700'"
          >
            <Link2 class="w-3.5 h-3.5" />
            <span>Cloud Gateway (Fonnte / Wablas)</span>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 sm:p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
          <!-- TAB 1: DIRECT WHATSAPP (100% Reliable Native wa.me) -->
          <div v-if="linkTab === 'direct'" class="flex flex-col gap-5">
            <div class="p-4 rounded-[14px] bg-emerald-500/[0.08] border border-emerald-500/20 flex items-start gap-3">
              <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div class="text-[12.5px] text-emerald-950 leading-relaxed">
                <strong>Native WhatsApp Connection:</strong> Enter your Business WhatsApp phone number.
                No paid gateway or fragile QR pairing required — messages and test notifications launch directly in WhatsApp Web or the WhatsApp mobile app.
              </div>
            </div>

            <!-- Phone Number Input -->
            <div class="flex flex-col gap-1.5">
              <label for="link-phone" class="text-[12px] font-medium text-black flex items-center justify-between">
                <span>Sender WhatsApp Phone Number</span>
                <span class="text-[11px] text-neutral-400 font-normal">Supports 08... or +62... format</span>
              </label>
              <input
                id="link-phone"
                v-model="linkPhone"
                type="text"
                placeholder="e.g. +62 812 7070 8888 or 081234567890"
                class="h-[44px] px-3.5 rounded-[12px] bg-black/[0.02] border text-[14px] outline-none font-mono transition-all"
                :class="isLinkPhoneValid ? 'border-emerald-500 focus:border-emerald-600 focus:bg-white' : (linkPhone ? 'border-amber-400 focus:border-amber-500' : 'border-black/15 focus:border-black focus:bg-white')"
              />

              <!-- Live Validation Feedback -->
              <div class="min-h-[20px] flex items-center justify-between text-[12px]">
                <span v-if="isLinkPhoneValid" class="text-emerald-700 font-medium flex items-center gap-1.5 animate-in fade-in">
                  <Check class="w-3.5 h-3.5 text-emerald-600" />
                  Format: <strong>{{ displayLinkPhone }}</strong> (E.164: +{{ normalizedLinkPhone }})
                </span>
                <span v-else-if="linkPhone" class="text-amber-700 flex items-center gap-1.5">
                  <AlertCircle class="w-3.5 h-3.5 text-amber-600" />
                  Please enter at least 9 digits (e.g. 081234567890 or +62 812 3456 7890)
                </span>
                <span v-else class="text-neutral-400 text-[11.5px]">
                  Local Indonesian and international formats are auto-normalized.
                </span>

                <a
                  v-if="isLinkPhoneValid"
                  :href="'https://wa.me/' + normalizedLinkPhone"
                  target="_blank"
                  rel="noopener"
                  class="text-[11.5px] text-emerald-700 hover:text-emerald-800 underline font-mono flex items-center gap-1"
                >
                  <ExternalLink class="w-3 h-3" />
                  <span>Test wa.me link ↗</span>
                </a>
              </div>
            </div>

            <!-- Session / Station Label -->
            <div class="flex flex-col gap-1.5">
              <label for="link-session" class="text-[12px] font-medium text-black">Sender Device / Station Label</label>
              <input
                id="link-session"
                v-model="linkSessionName"
                type="text"
                placeholder="e.g. 707 Gate System or Stanley 1913 Host"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black transition-all"
              />
              <span class="text-[11.5px] text-neutral-400">Displayed on tickets, WhatsApp audit logs, and scanner staff screens.</span>
            </div>

            <!-- Features Included -->
            <div class="p-4 rounded-[14px] bg-neutral-50 border border-black/5 flex flex-col gap-2 text-[12px] text-neutral-600">
              <div class="flex items-center gap-2 font-medium text-black text-[12.5px] mb-0.5">
                <ShieldCheck class="w-4 h-4 text-emerald-600" />
                <span>What this enables:</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span>Immediate 1-tap WhatsApp chat dispatch from the Guest Database table and Gate Scanner.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span>Direct "Send Test" launches WhatsApp Web or mobile app instantly with pre-filled test notification copy.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-emerald-600 font-bold">✓</span>
                <span>Zero monthly provider subscriptions, zero bot disconnects.</span>
              </div>
            </div>
          </div>

          <!-- TAB 2: CLOUD GATEWAY (Automated Server Dispatch via Fonnte / Wablas / Meta) -->
          <div v-else-if="linkTab === 'gateway'" class="flex flex-col gap-5">
            <div class="p-4 rounded-[14px] bg-black/[0.02] border border-black/5 text-[12.5px] text-neutral-600 leading-relaxed">
              Connect a cloud WhatsApp API provider to allow your server to send background notifications automatically when visitors register, approach the queue, or are called.
            </div>

            <!-- Provider Presets -->
            <div class="flex flex-col gap-1.5">
              <span class="text-[11.5px] uppercase tracking-[0.08em] text-neutral-500 font-medium">Gateway Provider:</span>
              <div class="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  @click="onGatewayPresetChange('fonnte')"
                  class="h-[42px] px-2 rounded-[10px] border text-[12px] font-medium cursor-pointer transition-all flex flex-col items-center justify-center"
                  :class="gatewayPreset === 'fonnte' ? 'bg-black text-white border-black shadow-xs' : 'bg-white border-black/15 text-neutral-700 hover:bg-black/5'"
                >
                  <span>Fonnte</span>
                  <span class="text-[9.5px] opacity-75 font-mono">(ID #1)</span>
                </button>
                <button
                  type="button"
                  @click="onGatewayPresetChange('wablas')"
                  class="h-[42px] px-2 rounded-[10px] border text-[12px] font-medium cursor-pointer transition-all flex flex-col items-center justify-center"
                  :class="gatewayPreset === 'wablas' ? 'bg-black text-white border-black shadow-xs' : 'bg-white border-black/15 text-neutral-700 hover:bg-black/5'"
                >
                  <span>Wablas</span>
                  <span class="text-[9.5px] opacity-75 font-mono">API</span>
                </button>
                <button
                  type="button"
                  @click="onGatewayPresetChange('meta')"
                  class="h-[42px] px-2 rounded-[10px] border text-[12px] font-medium cursor-pointer transition-all flex flex-col items-center justify-center"
                  :class="gatewayPreset === 'meta' ? 'bg-black text-white border-black shadow-xs' : 'bg-white border-black/15 text-neutral-700 hover:bg-black/5'"
                >
                  <span>Meta</span>
                  <span class="text-[9.5px] opacity-75 font-mono">Cloud API</span>
                </button>
                <button
                  type="button"
                  @click="onGatewayPresetChange('custom')"
                  class="h-[42px] px-2 rounded-[10px] border text-[12px] font-medium cursor-pointer transition-all flex flex-col items-center justify-center"
                  :class="gatewayPreset === 'custom' ? 'bg-black text-white border-black shadow-xs' : 'bg-white border-black/15 text-neutral-700 hover:bg-black/5'"
                >
                  <span>Webhook</span>
                  <span class="text-[9.5px] opacity-75 font-mono">Custom</span>
                </button>
              </div>
            </div>

            <!-- Sender Phone Number -->
            <div class="flex flex-col gap-1">
              <label for="gateway-phone" class="text-[12px] font-medium text-black">Sender Phone Number</label>
              <input
                id="gateway-phone"
                v-model="linkPhone"
                type="text"
                placeholder="e.g. +62 812 7070 8888 or 081234567890"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
              <span v-if="isLinkPhoneValid" class="text-[11.5px] text-emerald-600 font-medium">
                Normalized: +{{ normalizedLinkPhone }}
              </span>
            </div>

            <!-- Dispatch Webhook URL -->
            <div class="flex flex-col gap-1">
              <label for="gateway-url" class="text-[12px] font-medium text-black">Gateway API Endpoint URL</label>
              <input
                id="gateway-url"
                v-model="linkGatewayUrl"
                type="text"
                placeholder="e.g. https://api.fonnte.com/send"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
            </div>

            <!-- API Token -->
            <div class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <label for="gateway-token" class="text-[12px] font-medium text-black">
                  {{ gatewayPreset === 'fonnte' ? 'Fonnte Device Token' : (gatewayPreset === 'wablas' ? 'Wablas API Key' : (gatewayPreset === 'meta' ? 'System User Token' : 'API Token / Bearer Token')) }}
                </label>
                <a
                  v-if="gatewayPreset === 'fonnte'"
                  href="https://fonnte.com"
                  target="_blank"
                  rel="noopener"
                  class="text-[11px] text-emerald-700 hover:underline font-mono"
                >
                  Get token at fonnte.com ↗
                </a>
              </div>
              <input
                id="gateway-token"
                v-model="linkApiToken"
                type="password"
                placeholder="Paste API token from gateway dashboard"
                class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
              />
              <span class="text-[11px] text-neutral-400">Tokens are stored securely and dispatched strictly from server to provider.</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-between">
          <div class="text-[12px] text-neutral-500">
            {{ isLinkPhoneValid ? `Ready: ${displayLinkPhone}` : 'Enter sender number to proceed' }}
          </div>

          <button
            type="button"
            @click="handleConfirmLink"
            :disabled="(!isLinkPhoneValid && linkTab !== 'gateway') || isLinking"
            class="apple-cta-btn h-[40px] px-6 rounded-[10px] bg-black text-white text-[13px] font-medium hover:bg-neutral-800 disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Check class="w-4 h-4" />
            <span>{{ isLinking ? 'Activating…' : (linkTab === 'gateway' ? 'Save Gateway Configuration' : 'Save & Activate WhatsApp') }}</span>
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
      <div class="w-full max-w-[500px] bg-white rounded-[22px] shadow-2xl border border-black/10 overflow-hidden flex flex-col font-707">
        <div class="p-5 border-b border-black/10 flex items-center justify-between bg-neutral-50/50">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-[10px] bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
              <Send class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-[16px] font-medium text-black">Test WhatsApp Notification</h3>
              <p class="text-[12px] text-neutral-500">Dispatch live test to verify recipient delivery.</p>
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
          <!-- Recipient Phone Input -->
          <div class="flex flex-col gap-1">
            <label for="test-phone-input" class="text-[12px] font-medium text-black flex items-center justify-between">
              <span>Recipient Phone Number</span>
              <span v-if="testPhoneNormalized" class="text-[11px] text-emerald-700 font-mono">+{{ testPhoneNormalized }}</span>
            </label>
            <input
              id="test-phone-input"
              v-model="testPhone"
              type="text"
              placeholder="e.g. +62 812 3456 7890 or 081234567890"
              class="h-[40px] px-3.5 rounded-[10px] bg-black/[0.02] border border-black/15 text-[13.5px] outline-none focus:border-black focus:bg-white text-black font-mono transition-all"
            />
          </div>

          <!-- Stage Template Selector -->
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

          <!-- Live Preview Box -->
          <div class="flex flex-col gap-1">
            <label for="test-preview-box" class="text-[12px] font-medium text-black">Live Preview</label>
            <textarea
              id="test-preview-box"
              v-model="testPreviewMessage"
              rows="4"
              class="w-full p-3 rounded-[10px] bg-black/[0.02] border border-black/15 text-[12.5px] leading-relaxed font-mono outline-none text-neutral-800"
            />
          </div>

          <!-- Status / Active Mode Notice -->
          <div class="p-3 rounded-[10px] bg-black/[0.02] border border-black/5 flex items-start gap-2.5 text-[12px] text-neutral-600">
            <MessageSquare class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div class="leading-relaxed">
              <span v-if="form.waConnection?.gatewayUrl">
                <strong>Cloud Gateway Configured:</strong> Using {{ formatProvider(form.waConnection?.provider) }}. You can send via server or open WhatsApp directly.
              </span>
              <span v-else>
                <strong>Direct Mode Active:</strong> Clicking "Open in WhatsApp" will immediately launch WhatsApp Web or the WhatsApp mobile app with this exact message pre-filled.
              </span>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-black/10 bg-neutral-50 flex items-center justify-between gap-2.5">
          <button
            type="button"
            @click="showTestModal = false"
            class="h-[38px] px-3.5 rounded-[10px] border border-black/15 bg-white text-[12.5px] font-medium hover:bg-black/5 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div class="flex items-center gap-2">
            <!-- 1. Direct WhatsApp Button (Opens wa.me instantly) -->
            <button
              type="button"
              @click="handleDirectWhatsAppOpen"
              class="h-[38px] px-4 rounded-[10px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12.5px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Launch WhatsApp Web or mobile app with this test message"
            >
              <ExternalLink class="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </button>

            <!-- 2. Gateway / Server Dispatch Button -->
            <button
              type="button"
              @click="handleSendTestMessage"
              :disabled="isSendingTest"
              class="apple-cta-btn h-[38px] px-4 rounded-[10px] bg-black text-white text-[12.5px] font-medium hover:bg-neutral-800 disabled:opacity-40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              :title="form.waConnection?.gatewayUrl ? 'Dispatch test message via background Cloud Gateway' : 'Test message dispatch'"
            >
              <Send class="w-3.5 h-3.5" />
              <span>{{ isSendingTest ? 'Sending…' : (form.waConnection?.gatewayUrl ? 'Send via Gateway' : 'Send Test') }}</span>
            </button>
          </div>
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../../stores/editorStore.ts';
import {
  RefreshCw,
  Check,
  Users,
  BellRing,
  Clock,
  Volume2,
  MessageSquare,
  Smartphone,
  Phone,
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
  X,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Paperclip
} from 'lucide-vue-next';
import { glassConfirm, glassPrompt } from '../../services/glassDialog.ts';
import {
  fetchQueueSettings,
  saveQueueSettingsApi,
  callNextQueue,
  totalInsideGuests,
  normalizeStatus,
  normalizeWhatsAppNumber,
  formatWhatsAppDisplay,
  fetchWaLinkSession,
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

const editorStore = useEditorStore();
const isLoading = ref(false);
const isSaving = ref(false);
const activeStageId = ref<string>('ready');

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
        form.waEnabled = true;
        showWhatsAppQrModal.value = false;
        emit('toast', `WhatsApp device linked successfully (+${data.phone})! Automated notifications active.`);
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
      form.waEnabled = true;
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

async function editDefaultPhone() {
  const current = form.waConnection?.phoneNumber || '';
  const input = await glassPrompt({
    title: 'Edit Default WhatsApp Number',
    message: 'Enter official store/brand WhatsApp number (e.g. 081234567890 or +62 812-3456-7890):',
    defaultValue: current,
    placeholder: '+62 812-3456-7890'
  });
  if (input === null) return;
  const clean = normalizeWhatsAppNumber(input);
  if (!clean && input.trim()) {
    emit('toast', 'Invalid phone number format.');
    return;
  }
  form.waConnection = {
    connected: Boolean(form.waConnection?.connected),
    ...(form.waConnection || {}),
    phoneNumber: clean,
    formattedNumber: clean ? formatWhatsAppDisplay(clean) : ''
  };
  await saveSettings();
  emit('toast', `Default WhatsApp number updated${clean ? ` to +${clean}` : ''}.`);
}

// WhatsApp Device Linking & Testing State
const showLinkModal = ref(false);
const linkTab = ref<'direct' | 'gateway'>('direct');
const gatewayPreset = ref<'fonnte' | 'wablas' | 'meta' | 'custom'>('fonnte');
const linkPhone = ref('');
const linkSessionName = ref('707 Studio Primary WhatsApp');
const linkGatewayUrl = ref('https://api.fonnte.com/send');
const linkApiToken = ref('');
const isLinking = ref(false);

const normalizedLinkPhone = computed(() => normalizeWhatsAppNumber(linkPhone.value));
const displayLinkPhone = computed(() => formatWhatsAppDisplay(linkPhone.value));
const isLinkPhoneValid = computed(() => {
  const norm = normalizedLinkPhone.value;
  return norm.length >= 9 && norm.length <= 15;
});

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
const testPhoneNormalized = computed(() => normalizeWhatsAppNumber(testPhone.value));

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
      { key: 'party_size', label: 'Party Size', description: 'Number of people in group' },
      { key: 'link', label: 'Pass Link', description: 'Direct URL to view ticket status' }
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
      { key: 'access_id', label: 'Access ID', description: 'Ticket pass code' },
      { key: 'link', label: 'Pass Link', description: 'Direct URL to view ticket status' }
    ]
  },
  {
    id: 'expired',
    title: '4. Missed / Expired',
    triggerSummary: 'Trigger: Grace Margin Exceeded',
    triggerBadge: 'Trigger: Skipped Beyond Tolerance',
    description: 'Sent when a guest misses their turn beyond the grace tolerance limit, with a link to rejoin and regenerate their queue number.',
    icon: Ban,
    tags: [
      { key: 'name', label: 'Name', description: 'Visitor full name' },
      { key: 'queue_number', label: 'Queue No', description: 'Sequential queue number' },
      { key: 'skipped_tolerance', label: 'Grace Limit', description: 'Configured skipped tolerance limit' },
      { key: 'link', label: 'Pass Link', description: 'Direct link to live pass to requeue & regenerate number' },
      { key: 'requeue_link', label: 'Requeue Link', description: 'Alias for live e-pass regeneration link' }
    ]
  }
];

function selectActiveWaStage(id: string) {
  form.activeWaStage = id as any;
  activeStageId.value = id;
}

const currentStage = computed(() => {
  return DEFAULT_STAGES.find(s => s.id === (form.activeWaStage || activeStageId.value)) || DEFAULT_STAGES[2];
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
    };
  }
  if (!form.emailTemplates[activeEmailTab.value]) {
    form.emailTemplates[activeEmailTab.value] = activeEmailTab.value === 'pass'
      ? {
          subject: 'Your 707 ticket for {{campaign}}',
          heading: 'Your ticket',
          body: 'Your e-ticket is attached to this email as a PDF. Track your live queue status and show your pass at the door.',
          includeLiveTrackingButton: true,
          liveTrackingButtonLabel: 'VIEW LIVE QUEUE'
        }
      : {
          subject: "It's your turn to enter: {{campaign}}",
          heading: "It's Your Turn to Enter!",
          body: 'Your turn has arrived for {{campaign}}. Please proceed to the entrance area now and present your live pass to the door staff.'
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
    .replace(/\{\{\s*campaign\s*\}\}/g, editorStore.projectTitle || 'Atmos Drop')
    .replace(/\{\{\s*access_id\s*\}\}/g, '707-K92F')
    .replace(/\{\{\s*link\s*\}\}/g, 'https://707studio.id/atmos/drop?code=707-K92F');
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
    link: sampleLink.value,
    epass_link: sampleLink.value,
    pass_link: sampleLink.value,
    pass_url: sampleLink.value,
    requeue_link: sampleLink.value
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
      form.activeWaStage = data.activeWaStage || 'ready';
      activeStageId.value = form.activeWaStage;
      form.emailNotificationEnabled = data.emailNotificationEnabled !== false;
      if (data.waConnection) {
        form.waConnection = { ...data.waConnection };
      }
      if (data.waTemplates) Object.assign(form.waTemplates, data.waTemplates);
      if (data.emailTemplates) {
        form.emailTemplates = {
          pass: {
            subject: data.emailTemplates.pass?.subject || form.emailTemplates?.pass?.subject || '',
            heading: data.emailTemplates.pass?.heading || form.emailTemplates?.pass?.heading || '',
            body: data.emailTemplates.pass?.body || form.emailTemplates?.pass?.body || ''
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
  linkPhone.value = form.waConnection?.formattedNumber || form.waConnection?.phoneNumber || '';
  linkSessionName.value = form.waConnection?.sessionName || '707 Studio Primary WhatsApp';
  linkGatewayUrl.value = form.waConnection?.gatewayUrl || 'https://api.fonnte.com/send';
  linkApiToken.value = form.waConnection?.apiToken || '';
  linkTab.value = form.waConnection?.gatewayUrl ? 'gateway' : 'direct';
  showLinkModal.value = true;
}

async function handleConfirmLink() {
  if (!props.pageId) return;
  const clean = normalizeWhatsAppNumber(linkPhone.value);
  if (!clean && linkTab.value !== 'gateway') {
    emit('toast', 'Please enter a valid WhatsApp phone number (e.g. +62 812-3456-7890 or 081234567890).');
    return;
  }
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
      form.waEnabled = true;
      showLinkModal.value = false;
      const display = res.formattedNumber || formatWhatsAppDisplay(res.phoneNumber || '') || res.phoneNumber;
      emit('toast', `WhatsApp (${display}) connected & ready! Automated notifications active.`);
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
      formattedNumber: '',
      sessionName: '',
      provider: 'direct_sender'
    };
    emit('toast', 'WhatsApp device disconnected.');
  } catch (err: any) {
    emit('toast', err?.message || 'Failed to unlink WhatsApp device');
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
        emit('toast', res.message || `Test notification dispatched via Gateway to ${formatWhatsAppDisplay(clean)}!`);
      }
      showTestModal.value = false;
    } else {
      emit('toast', res?.error || 'Could not dispatch test notification. Check recipient format or gateway logs.');
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
  if (provider === 'fonnte') return 'Fonnte Cloud Gateway';
  if (provider === 'wablas') return 'Wablas WhatsApp API';
  if (provider === 'meta_cloud') return 'Meta WhatsApp Cloud API';
  if (provider === 'custom_gateway') return 'Custom Webhook Gateway';
  return 'Direct WhatsApp (1-Tap Web/App)';
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

onUnmounted(() => {
  stopWaPolling();
});
</script>
