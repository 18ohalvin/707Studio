<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="editorStore.isProjectSettingsOpen" 
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="handleClose"
    >
      <!-- Modal Main Container (Apple Glassmorphism Design System) -->
      <div 
        class="backdrop-blur-2xl bg-white/95 border border-white/60 flex flex-col rounded-[14px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[660px] max-h-[90vh] apple-modal-box overflow-hidden"
        data-name="Project Settings Modal"
      >
        <!-- Modal Top Bar: Title, Active Brand Badge, Close Button -->
        <div class="flex items-center justify-between px-[24px] pt-[20px] pb-[16px] border-b border-black/5 shrink-0 bg-white/40">
          <div class="flex items-center gap-3">
            <div class="size-[32px] rounded-[8px] bg-black text-white flex items-center justify-center shadow-sm">
              <Sliders class="w-4 h-4 text-white" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-707 text-[17px] font-medium leading-[22px] text-black">
                  Project Settings
                </h2>
                <span class="font-707 text-[11px] font-normal uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/5 text-neutral-600 border border-black/5">
                  {{ brandStore.activeBrand?.name || 'atmos' }}
                </span>
              </div>
              <p class="font-707 text-[12px] text-neutral-500 font-normal leading-tight mt-0.5">
                Configure campaign identity, quotas, on-site system access ID, and review channels.
              </p>
            </div>
          </div>

          <button 
            type="button"
            @click="handleClose"
            class="size-[26px] bg-[#ededed] hover:bg-[#d9d9d9] active:bg-[#ccc] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0"
            title="Close"
          >
            <X class="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        <!-- Tab Navigation Bar (Segmented Apple Pills) -->
        <div class="px-[24px] pt-[14px] pb-[10px] bg-neutral-50/50 border-b border-black/5 shrink-0">
          <div class="flex items-center gap-1.5 p-1 bg-black/[0.04] rounded-[10px] border border-black/5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              @click="activeTab = 'identity'"
              class="flex-1 min-w-[120px] py-1.5 px-2.5 rounded-[7px] text-center font-707 text-[12px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              :class="activeTab === 'identity' 
                ? 'bg-white text-black font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-neutral-500 hover:text-black font-normal'"
            >
              <Globe class="w-3.5 h-3.5" />
              <span>Campaign Identity</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'registration'"
              class="flex-1 min-w-[120px] py-1.5 px-2.5 rounded-[7px] text-center font-707 text-[12px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              :class="activeTab === 'registration' 
                ? 'bg-white text-black font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-neutral-500 hover:text-black font-normal'"
            >
              <Users class="w-3.5 h-3.5" />
              <span>Quota & Rules</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'access_pass'"
              class="flex-1 min-w-[140px] py-1.5 px-2.5 rounded-[7px] text-center font-707 text-[12px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              :class="activeTab === 'access_pass' 
                ? 'bg-white text-black font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-neutral-500 hover:text-black font-normal'"
            >
              <KeyRound class="w-3.5 h-3.5" />
              <span>E-Pass & Access ID</span>
            </button>

            <button
              type="button"
              @click="activeTab = 'review_team'"
              class="flex-1 min-w-[120px] py-1.5 px-2.5 rounded-[7px] text-center font-707 text-[12px] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              :class="activeTab === 'review_team' 
                ? 'bg-white text-black font-medium shadow-[0_1px_3px_rgba(0,0,0,0.08)]' 
                : 'text-neutral-500 hover:text-black font-normal'"
            >
              <Share2 class="w-3.5 h-3.5" />
              <span>Integrations</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Tab Content Body -->
        <div class="flex-1 overflow-y-auto p-[24px] space-y-6 max-h-[55vh]">
          
          <!-- TAB 1: CAMPAIGN IDENTITY -->
          <div v-if="activeTab === 'identity'" class="space-y-5">
            <!-- Project Title Field -->
            <div class="space-y-1.5">
              <label class="font-707 text-[13px] font-medium text-black block">
                Project & Campaign Title
              </label>
              <input 
                v-model="formSettings.projectName"
                type="text"
                placeholder="e.g. atmos x ASICS Gel Kayano Pandan RSVP Form"
                class="w-full px-3.5 py-2.5 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black focus:border-black focus:outline-none transition-colors"
              />
            </div>

            <!-- Custom URL Slug Bar -->
            <div class="space-y-1.5">
              <label class="font-707 text-[13px] font-medium text-black block">
                Campaign URL Path
              </label>
              <div class="flex items-center rounded-[8px] bg-[#f7f7f7] border border-black/15 overflow-hidden">
                <span class="px-3 py-2 text-[12px] font-707 text-neutral-500 bg-black/5 border-r border-black/10 select-none whitespace-nowrap">
                  events.707.co.id/{{ brandStore.activeBrand?.slug || 'atmos' }}/
                </span>
                <input 
                  v-model="formSettings.customSlug"
                  type="text"
                  placeholder="campaign-slug"
                  class="flex-1 px-3 py-2 bg-transparent text-[13px] font-707 text-black focus:outline-none"
                />
              </div>
            </div>

            <!-- Campaign Schedule: Start and End Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="font-707 text-[12px] font-medium text-black block">
                  Campaign Start Date
                </label>
                <input 
                  v-model="formSettings.startDate"
                  type="date"
                  class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black focus:border-black focus:outline-none"
                />
              </div>
              <div class="space-y-1.5">
                <label class="font-707 text-[12px] font-medium text-black block">
                  Campaign End Date
                </label>
                <input 
                  v-model="formSettings.endDate"
                  type="date"
                  class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <!-- SEO Title & Meta Description -->
            <div class="space-y-3 pt-2 border-t border-black/5">
              <div class="flex items-center justify-between">
                <label class="font-707 text-[13px] font-medium text-black">
                  SEO & Social Share Preview
                </label>
                <span class="font-707 text-[11px] text-neutral-500">Google & WhatsApp OG Tags</span>
              </div>

              <div class="space-y-1.5">
                <label class="font-707 text-[11px] font-normal text-neutral-500 block">SEO Meta Title</label>
                <input 
                  v-model="formSettings.seoTitle"
                  type="text"
                  placeholder="atmos x ASICS Gel Kayano Pandan RSVP | 707 Activation"
                  class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black focus:border-black focus:outline-none"
                />
              </div>

              <div class="space-y-1.5">
                <label class="font-707 text-[11px] font-normal text-neutral-500 block">SEO Meta Description</label>
                <textarea 
                  v-model="formSettings.seoDescription"
                  rows="2"
                  placeholder="RSVP now for exclusive access and guest passes to the official 707 activation."
                  class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[12px] font-707 text-black focus:border-black focus:outline-none resize-none"
                />
              </div>

              <!-- Social Thumbnail Image URL -->
              <div class="space-y-1.5">
                <label class="font-707 text-[11px] font-normal text-neutral-500 block">Social Share OG Thumbnail URL</label>
                <input 
                  v-model="formSettings.socialThumbnailUrl"
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[12px] font-707 text-black focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          <!-- TAB 2: REGISTRATION & QUOTA RULES -->
          <div v-if="activeTab === 'registration'" class="space-y-5">
            <!-- Global Slots Capacity -->
            <div class="p-4 rounded-[10px] bg-black/[0.02] border border-black/5 space-y-3">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="font-707 text-[13px] font-medium text-black">
                    Default Session / Slot Quota
                  </h3>
                  <p class="font-707 text-[11px] text-neutral-500 mt-0.5">
                    Default attendee cap applied when new session options are created.
                  </p>
                </div>
                <div class="flex items-center border border-black/15 rounded-[8px] bg-white overflow-hidden shadow-sm">
                  <button 
                    type="button"
                    @click="decrementSlots"
                    class="px-3 py-1.5 hover:bg-black/5 text-black font-medium transition-colors cursor-pointer"
                  >-</button>
                  <input 
                    v-model.number="formSettings.globalSlotsCapacity"
                    type="number"
                    min="1"
                    class="w-14 text-center font-707 text-[13px] font-medium border-0 focus:outline-none bg-transparent"
                  />
                  <button 
                    type="button"
                    @click="incrementSlots"
                    class="px-3 py-1.5 hover:bg-black/5 text-black font-medium transition-colors cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>

            <!-- Auto Sold-Out Behavior -->
            <div class="space-y-2">
              <label class="font-707 text-[13px] font-medium text-black block">
                Auto Sold-Out Behavior
              </label>
              <p class="font-707 text-[11px] text-neutral-500">
                Action taken automatically when session or raffle slot counts reach zero.
              </p>
              
              <div class="grid grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  @click="formSettings.autoSoldOutBehavior = 'badge'"
                  class="p-3 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5"
                  :class="formSettings.autoSoldOutBehavior === 'badge' 
                    ? 'border-black bg-black/[0.04] ring-1 ring-black' 
                    : 'border-black/10 hover:border-black/30 bg-white'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-707 text-[12px] font-medium text-black">Badge</span>
                    <Check v-if="formSettings.autoSoldOutBehavior === 'badge'" class="w-3.5 h-3.5 text-black" />
                  </div>
                  <span class="font-707 text-[10px] text-neutral-500 leading-tight">Show "Sold Out" tag & disable option</span>
                </button>

                <button
                  type="button"
                  @click="formSettings.autoSoldOutBehavior = 'hide'"
                  class="p-3 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5"
                  :class="formSettings.autoSoldOutBehavior === 'hide' 
                    ? 'border-black bg-black/[0.04] ring-1 ring-black' 
                    : 'border-black/10 hover:border-black/30 bg-white'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-707 text-[12px] font-medium text-black">Hide Slot</span>
                    <Check v-if="formSettings.autoSoldOutBehavior === 'hide'" class="w-3.5 h-3.5 text-black" />
                  </div>
                  <span class="font-707 text-[10px] text-neutral-500 leading-tight">Completely hide option from choices</span>
                </button>

                <button
                  type="button"
                  @click="formSettings.autoSoldOutBehavior = 'waitlist'"
                  class="p-3 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5"
                  :class="formSettings.autoSoldOutBehavior === 'waitlist' 
                    ? 'border-black bg-black/[0.04] ring-1 ring-black' 
                    : 'border-black/10 hover:border-black/30 bg-white'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-707 text-[12px] font-medium text-black">Waitlist</span>
                    <Check v-if="formSettings.autoSoldOutBehavior === 'waitlist'" class="w-3.5 h-3.5 text-black" />
                  </div>
                  <span class="font-707 text-[10px] text-neutral-500 leading-tight">Switch choice to Standby Waitlist</span>
                </button>
              </div>
            </div>

            <!-- Single vs Multiple Entry Toggle -->
            <div class="flex items-center justify-between p-3.5 rounded-[8px] bg-white border border-black/15 shadow-sm">
              <div>
                <span class="font-707 text-[13px] font-medium text-black block">
                  Allow Multiple Submissions
                </span>
                <span class="font-707 text-[11px] text-neutral-500 block mt-0.5">
                  If disabled, phone number and email will be unique to prevent duplicate tickets.
                </span>
              </div>
              <button 
                type="button"
                @click="formSettings.allowMultipleEntries = !formSettings.allowMultipleEntries"
                class="w-11 h-6 rounded-full transition-colors relative cursor-pointer"
                :class="formSettings.allowMultipleEntries ? 'bg-black' : 'bg-neutral-300'"
              >
                <div 
                  class="size-5 rounded-full bg-white transition-transform absolute top-0.5"
                  :class="formSettings.allowMultipleEntries ? 'left-5.5' : 'left-0.5'"
                />
              </button>
            </div>

            <!-- Default Dial Country Code -->
            <div class="space-y-1.5">
              <label class="font-707 text-[13px] font-medium text-black block">
                Default Phone Dialing Code
              </label>
              <select 
                v-model="formSettings.defaultCountryCode"
                class="w-full px-3 py-2.5 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black focus:border-black focus:outline-none"
              >
                <option value="+62">+62 (Indonesia)</option>
                <option value="+65">+65 (Singapore)</option>
                <option value="+60">+60 (Malaysia)</option>
                <option value="+1">+1 (United States / Canada)</option>
                <option value="+81">+81 (Japan)</option>
                <option value="+44">+44 (United Kingdom)</option>
                <option value="+61">+61 (Australia)</option>
              </select>
            </div>
          </div>

          <!-- TAB 3: GUEST E-PASS & SYSTEM ACCESS ID -->
          <div v-if="activeTab === 'access_pass'" class="space-y-5">
            
            <!-- SYSTEM ACCESS ID CONFIGURATION CARD (HIGHLIGHTED REQUIREMENT) -->
            <div class="p-4 rounded-[12px] bg-gradient-to-br from-neutral-900 to-black text-white shadow-md space-y-3 border border-neutral-800">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="size-[24px] rounded-full bg-white/20 flex items-center justify-center">
                    <KeyRound class="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 class="font-707 text-[14px] font-medium text-white tracking-tight">
                    System Access ID (Project Door Scanner)
                  </h3>
                </div>
                <span class="font-707 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active Key
                </span>
              </div>

              <p class="font-707 text-[12px] text-neutral-300 leading-[18px]">
                This authorization key is required by on-site venue scanners (iPad, Zebra scanner, or 707 Crew Scanner PWA) to authenticate and validate guest E-Pass QR codes for this activation.
              </p>

              <!-- Access ID Key Bar with Actions -->
              <div class="flex items-center gap-2 bg-white/10 p-2 pl-3 rounded-[8px] border border-white/15">
                <input 
                  v-model="formSettings.systemAccessId"
                  type="text"
                  placeholder="707-DOOR-AUTH-2026-X89"
                  class="flex-1 bg-transparent font-mono text-[13px] text-white font-semibold tracking-wider focus:outline-none"
                />
                
                <!-- Copy Key Button -->
                <button 
                  type="button"
                  @click="copyAccessId"
                  class="px-2.5 py-1 rounded-[6px] bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-707 text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  :title="copiedAccessId ? 'Copied' : 'Copy Access ID'"
                >
                  <Check v-if="copiedAccessId" class="w-3.5 h-3.5 text-emerald-400" />
                  <Copy v-else class="w-3.5 h-3.5 text-white" />
                  <span>{{ copiedAccessId ? 'Copied' : 'Copy' }}</span>
                </button>

                <!-- Regenerate Key Button -->
                <button 
                  type="button"
                  @click="regenerateAccessId"
                  class="px-2.5 py-1 rounded-[6px] bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 font-707 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Generate new random key"
                >
                  <RefreshCw class="w-3 h-3 text-black" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>

            <!-- QR Code Payload Format -->
            <div class="space-y-2">
              <label class="font-707 text-[13px] font-medium text-black block">
                QR Code Payload Type
              </label>
              
              <div class="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  @click="formSettings.qrPayloadType = 'secure_hash'"
                  class="p-2.5 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between gap-1"
                  :class="formSettings.qrPayloadType === 'secure_hash' 
                    ? 'border-black bg-black/[0.04] ring-1 ring-black' 
                    : 'border-black/10 hover:border-black/30 bg-white'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-707 text-[11px] font-medium text-black">Secure Hash</span>
                    <Check v-if="formSettings.qrPayloadType === 'secure_hash'" class="w-3 h-3 text-black" />
                  </div>
                  <span class="font-707 text-[10px] text-neutral-500">Encrypted SHA-256</span>
                </button>

                <button
                  type="button"
                  @click="formSettings.qrPayloadType = 'unique_id'"
                  class="p-2.5 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between gap-1"
                  :class="formSettings.qrPayloadType === 'unique_id' 
                    ? 'border-black bg-black/[0.04] ring-1 ring-black' 
                    : 'border-black/10 hover:border-black/30 bg-white'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-707 text-[11px] font-medium text-black">Pass UUID</span>
                    <Check v-if="formSettings.qrPayloadType === 'unique_id'" class="w-3 h-3 text-black" />
                  </div>
                  <span class="font-707 text-[10px] text-neutral-500">Plain UUID format</span>
                </button>

                <button
                  type="button"
                  @click="formSettings.qrPayloadType = 'checkin_url'"
                  class="p-2.5 rounded-[8px] border text-left cursor-pointer transition-all flex flex-col justify-between gap-1"
                  :class="formSettings.qrPayloadType === 'checkin_url' 
                    ? 'border-black bg-black/[0.04] ring-1 ring-black' 
                    : 'border-black/10 hover:border-black/30 bg-white'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-707 text-[11px] font-medium text-black">Direct URL</span>
                    <Check v-if="formSettings.qrPayloadType === 'checkin_url'" class="w-3 h-3 text-black" />
                  </div>
                  <span class="font-707 text-[10px] text-neutral-500">Check-in Web Link</span>
                </button>
              </div>
            </div>

            <!-- E-Pass Notification / Resend Channels -->
            <div class="space-y-2">
              <label class="font-707 text-[13px] font-medium text-black block">
                Digital E-Pass Resend Channel
              </label>
              
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="formSettings.resendChannel = 'both'"
                  class="py-2 px-3 rounded-[8px] border text-center cursor-pointer transition-all font-707 text-[12px]"
                  :class="formSettings.resendChannel === 'both' ? 'border-black bg-black text-white font-medium' : 'border-black/15 bg-white text-black'"
                >
                  WhatsApp & Email
                </button>
                <button
                  type="button"
                  @click="formSettings.resendChannel = 'whatsapp'"
                  class="py-2 px-3 rounded-[8px] border text-center cursor-pointer transition-all font-707 text-[12px]"
                  :class="formSettings.resendChannel === 'whatsapp' ? 'border-black bg-black text-white font-medium' : 'border-black/15 bg-white text-black'"
                >
                  WhatsApp Only
                </button>
                <button
                  type="button"
                  @click="formSettings.resendChannel = 'email'"
                  class="py-2 px-3 rounded-[8px] border text-center cursor-pointer transition-all font-707 text-[12px]"
                  :class="formSettings.resendChannel === 'email' ? 'border-black bg-black text-white font-medium' : 'border-black/15 bg-white text-black'"
                >
                  Email Only
                </button>
              </div>
            </div>

            <!-- On-Site Check-In Notice -->
            <div class="space-y-1.5">
              <label class="font-707 text-[13px] font-medium text-black block">
                On-Site Check-In Notice Text
              </label>
              <textarea 
                v-model="formSettings.checkInNotice"
                rows="2"
                placeholder="Please present this digital E-Pass QR code at the entrance scanner desk. Non-transferable."
                class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[12px] font-707 text-black focus:border-black focus:outline-none resize-none"
              />
            </div>

            <!-- Terms & Conditions URL -->
            <div class="space-y-1.5">
              <label class="font-707 text-[13px] font-medium text-black block">
                Terms & Conditions Web URL
              </label>
              <input 
                v-model="formSettings.termsUrl"
                type="url"
                placeholder="https://707.co.id/terms-and-conditions"
                class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[12px] font-707 text-black focus:border-black focus:outline-none"
              />
            </div>
          </div>

          <!-- TAB 4: REVIEW, INTEGRATIONS & TEAM ACCESS -->
          <div v-if="activeTab === 'review_team'" class="space-y-5">
            <!-- Slack Review Webhook -->
            <div class="p-4 rounded-[10px] bg-white border border-black/15 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="size-[26px] rounded-[6px] bg-[#4A154B] flex items-center justify-center text-white">
                    <MessageSquare class="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 class="font-707 text-[13px] font-medium text-black">Slack Notifications</h3>
                    <p class="font-707 text-[11px] text-neutral-500">Broadcast review submissions and approvals to Slack.</p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="testSlackWebhook"
                  class="px-2.5 py-1 rounded-[6px] border border-black/20 hover:border-black text-[11px] font-707 font-medium text-black transition-colors cursor-pointer"
                >
                  Test Webhook
                </button>
              </div>

              <div class="space-y-2 pt-1">
                <div>
                  <label class="font-707 text-[11px] text-neutral-600 block mb-1">Webhook URL</label>
                  <input 
                    v-model="formSettings.slackWebhookUrl"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    class="w-full px-3 py-2 rounded-[6px] bg-[#f9f9f9] border border-black/15 text-[12px] font-mono text-black focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label class="font-707 text-[11px] text-neutral-600 block mb-1">Slack Channel</label>
                  <input 
                    v-model="formSettings.slackChannel"
                    type="text"
                    placeholder="#campaign-reviews-707"
                    class="w-full px-3 py-2 rounded-[6px] bg-[#f9f9f9] border border-black/15 text-[12px] font-707 text-black focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <!-- Reviewer Lead Email -->
            <div class="space-y-1.5">
              <label class="font-707 text-[13px] font-medium text-black block">
                Assigned UI/UX Reviewer Email
              </label>
              <input 
                v-model="formSettings.reviewerEmail"
                type="email"
                placeholder="uiux-leads@707.co.id"
                class="w-full px-3 py-2 rounded-[8px] bg-white border border-black/15 text-[13px] font-707 text-black focus:border-black focus:outline-none"
              />
            </div>

            <!-- Campaign Access Status -->
            <div class="space-y-2">
              <label class="font-707 text-[13px] font-medium text-black block">
                Campaign Publishing Status
              </label>
              
              <div class="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  @click="formSettings.accessStatus = 'draft'"
                  class="py-2.5 px-3 rounded-[8px] border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                  :class="formSettings.accessStatus === 'draft' ? 'border-black bg-black text-white' : 'border-black/15 bg-white text-black'"
                >
                  <span class="font-707 text-[12px] font-medium">Draft</span>
                  <span class="font-707 text-[10px] opacity-75">Internal Only</span>
                </button>

                <button
                  type="button"
                  @click="formSettings.accessStatus = 'pending_review'"
                  class="py-2.5 px-3 rounded-[8px] border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                  :class="formSettings.accessStatus === 'pending_review' ? 'border-amber-600 bg-amber-500 text-white' : 'border-black/15 bg-white text-black'"
                >
                  <span class="font-707 text-[12px] font-medium">In Review</span>
                  <span class="font-707 text-[10px] opacity-75">Under Review</span>
                </button>

                <button
                  type="button"
                  @click="formSettings.accessStatus = 'live'"
                  class="py-2.5 px-3 rounded-[8px] border text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1"
                  :class="formSettings.accessStatus === 'live' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-black/15 bg-white text-black'"
                >
                  <span class="font-707 text-[12px] font-medium">Live</span>
                  <span class="font-707 text-[10px] opacity-75">Public Live</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        <!-- Modal Footer Actions (Cancel, Save Settings) -->
        <div class="px-[24px] py-[16px] border-t border-black/5 flex items-center justify-between bg-neutral-50/70 shrink-0">
          <button 
            type="button"
            @click="handleClose"
            class="px-[16px] h-[38px] rounded-[8px] border border-black/15 hover:bg-black/5 font-707 text-[13px] font-medium text-black cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div class="flex items-center gap-2">
            <button 
              type="button"
              @click="handleSave"
              class="px-[22px] h-[38px] rounded-[8px] bg-black hover:bg-neutral-800 text-white font-707 text-[13px] font-medium cursor-pointer transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check class="w-3.5 h-3.5 text-white" />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { useBrandStore } from '../../../stores/brandStore.ts';
import type { ProjectSettings } from '../../../types/editor.ts';
import { 
  X, 
  Check, 
  Copy, 
  RefreshCw, 
  Sliders, 
  Globe, 
  Users, 
  KeyRound, 
  Share2, 
  MessageSquare 
} from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();

const activeTab = ref<'identity' | 'registration' | 'access_pass' | 'review_team'>('identity');
const copiedAccessId = ref(false);

// Local Form State
const formSettings = ref<ProjectSettings>({ ...editorStore.projectSettings });

// Watch modal open state to refresh form fields from store
watch(
  () => editorStore.isProjectSettingsOpen,
  (isOpen) => {
    if (isOpen) {
      formSettings.value = JSON.parse(JSON.stringify(editorStore.projectSettings));
      if (!formSettings.value.projectName) {
        formSettings.value.projectName = editorStore.projectTitle;
      }
    }
  }
);

function incrementSlots() {
  formSettings.value.globalSlotsCapacity = (formSettings.value.globalSlotsCapacity || 0) + 5;
}

function decrementSlots() {
  if (formSettings.value.globalSlotsCapacity > 1) {
    formSettings.value.globalSlotsCapacity -= 1;
  }
}

function regenerateAccessId() {
  const brandSlug = brandStore.activeBrand?.slug ? brandStore.activeBrand.slug.toUpperCase() : '707';
  formSettings.value.systemAccessId = editorStore.generateSystemAccessId(`707-DOOR-${brandSlug}-2026`);
  editorStore.showToast('Generated new System Access ID key.');
}

async function copyAccessId() {
  try {
    await navigator.clipboard.writeText(formSettings.value.systemAccessId || '');
    copiedAccessId.value = true;
    setTimeout(() => {
      copiedAccessId.value = false;
    }, 2000);
  } catch (e) {
    console.error(e);
  }
}

function testSlackWebhook() {
  editorStore.showToast('Test webhook alert sent to ' + (formSettings.value.slackChannel || '#campaign-reviews-707'));
}

function handleClose() {
  editorStore.isProjectSettingsOpen = false;
}

function handleSave() {
  editorStore.updateProjectSettings(formSettings.value);
  editorStore.isProjectSettingsOpen = false;
  editorStore.showToast('Project settings saved successfully.');
}
</script>

<style scoped>
.apple-modal-box {
  animation: appleModalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes appleModalPop {
  0% {
    opacity: 0;
    transform: scale(0.97) translateY(8px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.apple-modal-fade-enter-active,
.apple-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.apple-modal-fade-enter-from,
.apple-modal-fade-leave-to {
  opacity: 0;
}
</style>
