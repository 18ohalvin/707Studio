<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen && project"
      class="fixed inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center p-4 md:p-8 select-none"
      @click.self="emit('close')"
    >
      <!-- Modal Box -->
      <div 
        class="backdrop-blur-2xl bg-white/80 border border-white/60 flex flex-col items-start rounded-[20px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[1060px] max-h-[90vh] overflow-hidden apple-modal-box font-707"
        data-name="Project Guests & Scanner Hub"
      >
        <!-- Modal Top Header -->
        <div class="flex items-center justify-between px-6 py-4.5 w-full border-b border-black/5 shrink-0 bg-white/40">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Users class="w-4.5 h-4.5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-707 text-[18px] font-medium leading-[22px] text-black">
                  {{ project.title }}
                </h2>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-black/5 text-black border border-black/5">
                  {{ project.brand_slug }}
                </span>
                <span 
                  class="px-2 py-0.5 rounded-full text-[10px] font-medium border"
                  :class="project.status === 'published' || project.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'"
                >
                  {{ project.status === 'published' ? 'Live Activation' : (project.status === 'approved' ? 'Approved' : 'Draft') }}
                </span>
              </div>
              <p class="font-707 text-[12px] text-neutral-500 mt-0.5">
                Campaign Attendee CRM, QR Ticketing & Door Check-in Scanner
              </p>
            </div>
          </div>

          <!-- Top Navigation Tabs & Close -->
          <div class="flex items-center gap-3">
            <!-- Tabs switch -->
            <div class="flex items-center p-0.5 rounded-[8px] bg-black/[0.05] border border-black/5 text-[12px] font-medium">
              <button 
                @click="activeTab = 'directory'"
                class="px-3 py-1.5 rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer"
                :class="activeTab === 'directory' ? 'bg-white text-black shadow-xs font-medium' : 'text-neutral-500 hover:text-black'"
              >
                <Users class="w-3.5 h-3.5" />
                <span>Guest Directory ({{ submissions.length }})</span>
              </button>
              <button 
                @click="activeTab = 'scanner'"
                class="px-3 py-1.5 rounded-[6px] transition-all flex items-center gap-1.5 cursor-pointer"
                :class="activeTab === 'scanner' ? 'bg-white text-black shadow-xs font-medium' : 'text-neutral-500 hover:text-black'"
              >
                <QrCode class="w-3.5 h-3.5" />
                <span>Door Scanner</span>
              </button>
            </div>

            <button 
              type="button"
              @click="emit('close')"
              class="size-[32px] bg-black/5 hover:bg-black/10 active:bg-black/15 rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
              title="Close"
            >
              <X class="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 1: GUEST DIRECTORY & CRM               -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'directory'" class="flex flex-col w-full flex-1 overflow-hidden">
          <!-- KPI Stats Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 px-6 py-3.5 border-b border-black/5 bg-white/20 shrink-0">
            <div class="bg-white/60 p-3 rounded-[10px] border border-black/5 flex flex-col gap-0.5">
              <span class="text-[11px] text-neutral-400 font-medium">Total Registered</span>
              <span class="text-[18px] font-medium text-black">{{ submissions.length }}</span>
            </div>
            <div class="bg-white/60 p-3 rounded-[10px] border border-black/5 flex flex-col gap-0.5">
              <span class="text-[11px] text-neutral-400 font-medium">Checked In</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-[18px] font-medium text-emerald-600">{{ checkedInCount }}</span>
                <span class="text-[11px] text-neutral-400">({{ checkInPercentage }}%)</span>
              </div>
            </div>
            <div class="bg-white/60 p-3 rounded-[10px] border border-black/5 flex flex-col gap-0.5">
              <span class="text-[11px] text-neutral-400 font-medium">Raffle Winners / Tickets</span>
              <span class="text-[18px] font-medium text-blue-600">{{ winnersCount }}</span>
            </div>
            <div class="bg-white/60 p-3 rounded-[10px] border border-black/5 flex flex-col gap-0.5">
              <span class="text-[11px] text-neutral-400 font-medium">Pending Entry</span>
              <span class="text-[18px] font-medium text-neutral-700">{{ pendingCount }}</span>
            </div>
          </div>

          <!-- Controls Toolbar: Search, Filters & Actions -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 border-b border-black/5 bg-white/30 shrink-0">
            <!-- Search & Status filter tabs -->
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative w-[220px]">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input 
                  v-model="searchQuery"
                  type="text" 
                  placeholder="Search guest or ticket..."
                  class="w-full pl-8 pr-3 py-1.5 text-[12px] bg-white border border-black/10 rounded-[8px] focus:outline-none focus:border-black font-707 placeholder:text-neutral-400"
                />
              </div>

              <div class="flex items-center gap-1 p-0.5 rounded-[6px] bg-black/[0.04] border border-black/5 text-[11px]">
                <button 
                  @click="statusFilter = 'all'"
                  class="px-2 py-1 rounded-[4px] transition-colors cursor-pointer"
                  :class="statusFilter === 'all' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black'"
                >
                  All ({{ submissions.length }})
                </button>
                <button 
                  @click="statusFilter = 'winner'"
                  class="px-2 py-1 rounded-[4px] transition-colors cursor-pointer"
                  :class="statusFilter === 'winner' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black'"
                >
                  Winners / Confirmed
                </button>
                <button 
                  @click="statusFilter = 'checked_in'"
                  class="px-2 py-1 rounded-[4px] transition-colors cursor-pointer"
                  :class="statusFilter === 'checked_in' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black'"
                >
                  Checked In ({{ checkedInCount }})
                </button>
              </div>
            </div>

            <!-- Action buttons: Draw Raffle, Export CSV, Refresh -->
            <div class="flex items-center gap-2">
              <!-- Draw Raffle Button (if raffle mode) -->
              <button 
                @click="showDrawRaffleModal = true"
                class="px-3 h-[32px] rounded-[8px] bg-black/5 hover:bg-black/10 text-black font-707 text-[12px] font-medium flex items-center gap-1.5 transition-colors apple-press cursor-pointer border border-black/5"
                title="Randomly draw raffle winners"
              >
                <Trophy class="w-3.5 h-3.5" />
                <span>Draw Raffle</span>
              </button>

              <!-- Export CSV Button -->
              <button 
                @click="exportGuestsCsv"
                class="px-3 h-[32px] rounded-[8px] bg-black/5 hover:bg-black/10 text-black font-707 text-[12px] font-medium flex items-center gap-1.5 transition-colors apple-press cursor-pointer border border-black/5"
                title="Download attendee list as CSV"
              >
                <Download class="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <!-- Refresh Button -->
              <button 
                @click="fetchSubmissions"
                :disabled="isLoading"
                class="size-[32px] rounded-[8px] bg-black/5 hover:bg-black/10 text-black flex items-center justify-center transition-colors apple-press cursor-pointer border border-black/5"
                title="Refresh list"
              >
                <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isLoading }" />
              </button>
            </div>
          </div>

          <!-- Guests List Table -->
          <div class="flex-1 overflow-y-auto px-6 py-4">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-16 text-neutral-400">
              <RefreshCw class="w-6 h-6 animate-spin mb-2" />
              <p class="text-[13px]">Loading attendees...</p>
            </div>

            <div v-else-if="filteredSubmissions.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
              <div class="size-12 rounded-full bg-black/5 flex items-center justify-center text-neutral-400 mb-3">
                <Users class="w-6 h-6 stroke-[1.5]" />
              </div>
              <h3 class="font-medium text-[15px] text-black mb-1">No attendees found</h3>
              <p class="text-[12px] text-neutral-500 max-w-[320px]">
                {{ searchQuery ? `No matches for "${searchQuery}".` : 'No customer entries submitted yet for this activation.' }}
              </p>
            </div>

            <div v-else class="border border-black/10 rounded-[12px] overflow-hidden bg-white shadow-xs">
              <table class="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr class="bg-black/[0.02] border-b border-black/5 text-neutral-500 font-medium">
                    <th class="py-2.5 px-4">Attendee</th>
                    <th class="py-2.5 px-3">Contact</th>
                    <th class="py-2.5 px-3">Ticket / Entry Code</th>
                    <th class="py-2.5 px-3">Details / Size</th>
                    <th class="py-2.5 px-3 text-center">Status</th>
                    <th class="py-2.5 px-3 text-right">Registered</th>
                    <th class="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-black/5">
                  <tr 
                    v-for="sub in filteredSubmissions" 
                    :key="sub.id"
                    class="hover:bg-black/[0.015] transition-colors"
                  >
                    <!-- Attendee Name -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="size-7 rounded-full bg-black/[0.06] text-black font-medium flex items-center justify-center text-[11px] shrink-0">
                          {{ (sub.form_data?.fullName || 'G').charAt(0).toUpperCase() }}
                        </div>
                        <div class="flex flex-col">
                          <span class="font-medium text-black truncate max-w-[160px]">
                            {{ sub.form_data?.fullName || 'Anonymous Guest' }}
                          </span>
                          <span v-if="sub.form_data?.instagram" class="text-[10px] text-neutral-400">
                            @{{ sub.form_data.instagram.replace('@', '') }}
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- Contact -->
                    <td class="py-3 px-3">
                      <div class="flex flex-col">
                        <span class="text-neutral-700 truncate max-w-[180px]">{{ sub.form_data?.email || '-' }}</span>
                        <span class="text-[11px] text-neutral-400">{{ sub.form_data?.phone || '-' }}</span>
                      </div>
                    </td>

                    <!-- Ticket Code -->
                    <td class="py-3 px-3 font-mono font-medium text-[11px] text-black">
                      <div class="flex items-center gap-1.5">
                        <Ticket class="w-3.5 h-3.5 text-neutral-400" />
                        <span>{{ sub.ticket_code || sub.id.substring(0, 12) }}</span>
                      </div>
                    </td>

                    <!-- Details / Shoe Size -->
                    <td class="py-3 px-3 text-neutral-600">
                      <span v-if="sub.form_data?.size" class="px-2 py-0.5 rounded bg-black/5 text-[11px] font-medium text-black">
                        {{ sub.form_data.size }}
                      </span>
                      <span v-else class="text-neutral-400">-</span>
                    </td>

                    <!-- Status Badge -->
                    <td class="py-3 px-3 text-center">
                      <span 
                        class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border"
                        :class="getStatusBadgeClass(sub.status)"
                      >
                        <span class="size-1.5 rounded-full" :class="getStatusDotClass(sub.status)" />
                        {{ formatStatusLabel(sub.status) }}
                      </span>
                    </td>

                    <!-- Registered Time -->
                    <td class="py-3 px-3 text-right text-neutral-400 text-[11px]">
                      {{ formatDate(sub.created_at) }}
                    </td>

                    <!-- Actions -->
                    <td class="py-3 px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- Digital Ticket View Button -->
                        <button 
                          @click="openDigitalTicket(sub)"
                          class="p-1.5 rounded-[6px] hover:bg-black/5 text-neutral-600 hover:text-black transition-colors"
                          title="View Digital QR Ticket Pass"
                        >
                          <QrCode class="w-4 h-4" />
                        </button>

                        <!-- Toggle Check-in / Status Action -->
                        <button 
                          v-if="sub.status !== 'checked_in'"
                          @click="handleManualCheckIn(sub)"
                          class="px-2.5 py-1 rounded-[6px] bg-black text-white text-[11px] font-medium hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Check In
                        </button>
                        <span v-else class="text-[11px] text-emerald-600 font-medium px-2 py-1">
                          ✓ In
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- TAB 2: LIVE ON-GROUND QR SCANNER           -->
        <!-- ========================================== -->
        <div v-if="activeTab === 'scanner'" class="flex flex-col w-full flex-1 overflow-y-auto px-6 py-6">
          <div class="max-w-[560px] mx-auto w-full flex flex-col items-center">
            <!-- Header for Scanner -->
            <div class="text-center mb-5">
              <h3 class="text-[17px] font-medium text-black">On-Ground Door Scanner</h3>
              <p class="text-[12px] text-neutral-500 mt-1">
                Point camera at attendee QR ticket pass, or type entry code below for instant check-in.
              </p>
            </div>

            <!-- Viewfinder Area -->
            <div class="relative w-full aspect-square max-w-[340px] rounded-[24px] overflow-hidden bg-black shadow-2xl border-4 border-black/10 flex items-center justify-center">
              <video 
                ref="videoRef"
                autoplay 
                playsinline 
                muted
                class="size-full object-cover"
                :class="{ 'opacity-0': !isCameraActive }"
              />

              <!-- Overlay scanning box -->
              <div class="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <!-- Laser line -->
                <div class="w-[80%] h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-scanner-laser mb-4" />
                
                <!-- Target corners -->
                <div class="size-[200px] border-2 border-white/60 rounded-[16px] relative">
                  <div class="absolute -top-1 -left-1 size-4 border-t-2 border-l-2 border-emerald-400" />
                  <div class="absolute -top-1 -right-1 size-4 border-t-2 border-r-2 border-emerald-400" />
                  <div class="absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 border-emerald-400" />
                  <div class="absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 border-emerald-400" />
                </div>
              </div>

              <!-- Camera offline fallback -->
              <div v-if="!isCameraActive" class="absolute inset-0 bg-neutral-900 flex flex-col items-center justify-center text-center p-6 text-white/80">
                <Camera class="w-10 h-10 mb-2 text-neutral-400" />
                <p class="text-[13px] font-medium">Camera is currently inactive</p>
                <button 
                  @click="startCamera"
                  class="mt-3 px-4 py-1.5 rounded-[8px] bg-white text-black font-medium text-[12px] apple-press hover:bg-neutral-100 transition-colors"
                >
                  Start Camera Scanner
                </button>
              </div>

              <!-- Stop camera button if active -->
              <button 
                v-if="isCameraActive"
                @click="stopCamera"
                class="absolute bottom-3 right-3 px-2.5 py-1 rounded-[6px] bg-black/60 text-white text-[11px] backdrop-blur-md hover:bg-black/80 transition-colors"
              >
                Stop Camera
              </button>
            </div>

            <!-- Manual Input Fallback -->
            <div class="w-full max-w-[420px] mt-6 flex flex-col gap-2">
              <label class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Manual Code Entry
              </label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="manualCode"
                  @keyup.enter="handleScanCode(manualCode)"
                  type="text" 
                  placeholder="e.g. ATMOS-9X42, TKT-..., or ID"
                  class="flex-1 px-3.5 py-2 text-[13px] bg-white border border-black/15 rounded-[10px] font-mono focus:outline-none focus:border-black uppercase placeholder:normal-case placeholder:font-sans placeholder:text-neutral-400"
                />
                <button 
                  @click="handleScanCode(manualCode)"
                  :disabled="!manualCode.trim() || isCheckingIn"
                  class="px-4 py-2 bg-black text-white text-[12px] font-medium rounded-[10px] apple-press hover:bg-neutral-800 disabled:opacity-40 transition-colors shrink-0"
                >
                  Verify
                </button>
              </div>
            </div>

            <!-- Scan Result Feedback Card -->
            <div 
              v-if="scanFeedback"
              class="w-full max-w-[420px] mt-4 p-4 rounded-[14px] border animate-apple-pop flex items-start gap-3"
              :class="scanFeedback.type === 'success' 
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' 
                : (scanFeedback.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-900' : 'bg-red-50/90 border-red-200 text-red-900')"
            >
              <div 
                class="size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white"
                :class="scanFeedback.type === 'success' ? 'bg-emerald-600' : (scanFeedback.type === 'warning' ? 'bg-amber-600' : 'bg-red-600')"
              >
                <Check v-if="scanFeedback.type === 'success'" class="w-4 h-4 stroke-[3]" />
                <AlertCircle v-else class="w-4 h-4 stroke-[3]" />
              </div>
              <div class="flex-1 flex flex-col gap-0.5">
                <h4 class="font-medium text-[13px]">{{ scanFeedback.title }}</h4>
                <p class="text-[12px] opacity-90">{{ scanFeedback.message }}</p>
                <div v-if="scanFeedback.attendee" class="mt-2 pt-2 border-t border-black/5 text-[11px] flex flex-col gap-0.5">
                  <span><strong>Guest:</strong> {{ scanFeedback.attendee.form_data?.fullName }}</span>
                  <span><strong>Ticket:</strong> {{ scanFeedback.attendee.ticket_code }}</span>
                  <span v-if="scanFeedback.attendee.form_data?.size"><strong>Size:</strong> {{ scanFeedback.attendee.form_data.size }}</span>
                </div>
              </div>
            </div>

            <!-- Attendance Progress -->
            <div class="w-full max-w-[420px] mt-6 p-4 rounded-[14px] bg-black/[0.03] border border-black/5 flex flex-col gap-2">
              <div class="flex items-center justify-between text-[12px] font-medium">
                <span class="text-neutral-600">Event Capacity Checked In</span>
                <span class="text-black">{{ checkedInCount }} / {{ submissions.length }}</span>
              </div>
              <div class="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                <div 
                  class="h-full bg-black rounded-full transition-all duration-500"
                  :style="{ width: `${checkInPercentage}%` }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- ========================================== -->
  <!-- DIGITAL QR TICKET PASS MODAL               -->
  <!-- ========================================== -->
  <Transition name="apple-modal-fade">
    <div 
      v-if="selectedGuestForTicket" 
      class="fixed inset-0 z-60 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="selectedGuestForTicket = null"
    >
      <div class="bg-white rounded-[24px] p-6 max-w-[360px] w-full shadow-2xl flex flex-col items-center text-center font-707 border border-white/80 animate-apple-pop">
        <!-- Brand / Event Badge -->
        <div class="px-3 py-1 rounded-full bg-black text-white text-[11px] font-medium uppercase tracking-wider mb-2">
          {{ project?.brand_slug || '707 Event' }}
        </div>
        <h3 class="text-[17px] font-medium text-black leading-tight mb-1">
          {{ project?.title }}
        </h3>
        <p class="text-[11px] text-neutral-400 mb-4">Official Event Access Pass</p>

        <!-- QR Code Container -->
        <div class="size-[200px] p-2 bg-white rounded-[16px] border-2 border-black/10 flex items-center justify-center shadow-inner mb-4">
          <div v-if="qrSvg" v-html="qrSvg" class="size-full flex items-center justify-center" />
          <div v-else class="text-neutral-400 text-xs animate-pulse">Generating QR...</div>
        </div>

        <!-- Ticket Code -->
        <div class="font-mono text-[14px] font-medium text-black tracking-widest bg-black/[0.04] px-4 py-1.5 rounded-[8px] mb-3">
          {{ selectedGuestForTicket.ticket_code || selectedGuestForTicket.id.substring(0, 12) }}
        </div>

        <!-- Guest Info -->
        <div class="w-full border-t border-b border-black/10 py-3 my-1 flex flex-col gap-1 text-[12px] text-left">
          <div class="flex justify-between">
            <span class="text-neutral-400">Attendee:</span>
            <span class="font-medium text-black">{{ selectedGuestForTicket.form_data?.fullName || 'Guest' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-400">Email:</span>
            <span class="text-neutral-700 truncate max-w-[180px]">{{ selectedGuestForTicket.form_data?.email || '-' }}</span>
          </div>
          <div v-if="selectedGuestForTicket.form_data?.size" class="flex justify-between">
            <span class="text-neutral-400">Size:</span>
            <span class="font-medium text-black">{{ selectedGuestForTicket.form_data.size }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-400">Status:</span>
            <span 
              class="font-medium capitalize"
              :class="selectedGuestForTicket.status === 'checked_in' ? 'text-emerald-600' : 'text-black'"
            >
              {{ selectedGuestForTicket.status }}
            </span>
          </div>
        </div>

        <button 
          @click="selectedGuestForTicket = null"
          class="w-full mt-4 py-2.5 rounded-[10px] bg-black text-white text-[12px] font-medium apple-press hover:bg-neutral-800 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  </Transition>

  <!-- ========================================== -->
  <!-- DRAW RAFFLE WINNERS MODAL                  -->
  <!-- ========================================== -->
  <Transition name="apple-modal-fade">
    <div 
      v-if="showDrawRaffleModal" 
      class="fixed inset-0 z-60 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 select-none"
      @click.self="showDrawRaffleModal = false"
    >
      <div class="bg-white rounded-[20px] p-6 max-w-[380px] w-full shadow-2xl flex flex-col font-707 border border-white/80 animate-apple-pop">
        <div class="flex items-center gap-2 mb-3">
          <div class="size-8 rounded-lg bg-black text-white flex items-center justify-center">
            <Trophy class="w-4 h-4" />
          </div>
          <h3 class="font-medium text-[16px] text-black">Draw Raffle Winners</h3>
        </div>
        <p class="text-[12px] text-neutral-500 mb-4 leading-relaxed">
          Randomly select approved winners from registered attendees. Winners will automatically receive a valid QR entry pass for check-in.
        </p>

        <label class="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1">
          Number of Winners to Pick:
        </label>
        <input 
          v-model.number="drawCount" 
          type="number" 
          min="1" 
          :max="pendingCount || 100"
          class="w-full px-3.5 py-2 text-[14px] font-medium bg-white border border-black/15 rounded-[10px] mb-4 focus:outline-none focus:border-black font-707"
        />

        <div class="flex items-center justify-end gap-2">
          <button 
            @click="showDrawRaffleModal = false"
            class="px-4 py-2 rounded-[8px] bg-black/5 text-neutral-600 text-[12px] font-medium hover:bg-black/10"
          >
            Cancel
          </button>
          <button 
            @click="handleExecuteRaffleDraw"
            :disabled="isDrawing || pendingCount === 0"
            class="px-4 py-2 rounded-[8px] bg-black text-white text-[12px] font-medium apple-press hover:bg-neutral-800 disabled:opacity-40"
          >
            {{ isDrawing ? 'Drawing...' : `Select ${drawCount} Winner${drawCount === 1 ? '' : 's'}` }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { 
  X, 
  Users, 
  QrCode, 
  Search, 
  Download, 
  RefreshCw, 
  Ticket, 
  Trophy, 
  Camera, 
  Check, 
  AlertCircle 
} from 'lucide-vue-next';
import QRCode from 'qrcode';
import { apiJson, apiFetch } from '../../services/apiClient.ts';
import type { ProjectItem } from '../../types/editor.ts';

interface SubmissionItem {
  id: string;
  page_id: string;
  brand_slug: string;
  submission_type: string;
  form_data: {
    fullName?: string;
    email?: string;
    phone?: string;
    instagram?: string;
    size?: string;
    [key: string]: any;
  };
  ticket_code?: string;
  status: 'registered' | 'confirmed' | 'winner' | 'checked_in' | 'cancelled';
  checked_in_at?: string;
  checked_in_by?: string;
  created_at: string;
}

const props = defineProps<{
  isOpen: boolean;
  project: ProjectItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const activeTab = ref<'directory' | 'scanner'>('directory');
const submissions = ref<SubmissionItem[]>([]);
const isLoading = ref<boolean>(false);
const searchQuery = ref<string>('');
const statusFilter = ref<'all' | 'winner' | 'checked_in'>('all');

// Digital Ticket Modal state
const selectedGuestForTicket = ref<SubmissionItem | null>(null);
const qrSvg = ref<string>('');

// Raffle Draw state
const showDrawRaffleModal = ref<boolean>(false);
const drawCount = ref<number>(5);
const isDrawing = ref<boolean>(false);

// Scanner state
const videoRef = ref<HTMLVideoElement | null>(null);
const isCameraActive = ref<boolean>(false);
let cameraStream: MediaStream | null = null;
let scanInterval: any = null;
const manualCode = ref<string>('');
const isCheckingIn = ref<boolean>(false);
const scanFeedback = ref<{
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  attendee?: SubmissionItem;
} | null>(null);

// Audio Chime Feedback
function playSound(type: 'success' | 'warning' | 'error') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {}
}

async function fetchSubmissions() {
  if (!props.project) return;
  isLoading.value = true;
  try {
    const res = await apiJson<{ success: boolean; data: SubmissionItem[] }>(
      `/api/submissions?page_id=${encodeURIComponent(props.project.id)}`
    );
    if (res && res.success && Array.isArray(res.data)) {
      submissions.value = res.data;
    } else {
      submissions.value = [];
    }
  } catch (err) {
    console.warn('[ProjectGuestsModal] Error loading attendees:', err);
    submissions.value = [];
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.isOpen, (open) => {
  if (open && props.project) {
    fetchSubmissions();
    activeTab.value = 'directory';
    scanFeedback.value = null;
  } else {
    stopCamera();
  }
});

watch(activeTab, (tab) => {
  if (tab === 'scanner') {
    startCamera();
  } else {
    stopCamera();
  }
});

// Filtered list
const filteredSubmissions = computed(() => {
  let list = submissions.value;

  if (statusFilter.value === 'winner') {
    list = list.filter(s => s.status === 'winner' || s.status === 'confirmed');
  } else if (statusFilter.value === 'checked_in') {
    list = list.filter(s => s.status === 'checked_in');
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(s => {
      const name = (s.form_data?.fullName || '').toLowerCase();
      const email = (s.form_data?.email || '').toLowerCase();
      const phone = (s.form_data?.phone || '').toLowerCase();
      const ticket = (s.ticket_code || s.id).toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q) || ticket.includes(q);
    });
  }

  return list;
});

// KPI metrics
const checkedInCount = computed(() => submissions.value.filter(s => s.status === 'checked_in').length);
const winnersCount = computed(() => submissions.value.filter(s => s.status === 'winner' || s.status === 'confirmed').length);
const pendingCount = computed(() => submissions.value.filter(s => s.status === 'registered').length);

const checkInPercentage = computed(() => {
  if (submissions.value.length === 0) return 0;
  return Math.round((checkedInCount.value / submissions.value.length) * 100);
});

// Status Badge Helpers
function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'checked_in': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'winner': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'confirmed': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-neutral-100 text-neutral-600 border-neutral-200';
  }
}

function getStatusDotClass(status: string): string {
  switch (status) {
    case 'checked_in': return 'bg-emerald-500';
    case 'winner': return 'bg-blue-500';
    case 'confirmed': return 'bg-indigo-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-neutral-400';
  }
}

function formatStatusLabel(status: string): string {
  switch (status) {
    case 'checked_in': return 'Checked In';
    case 'winner': return 'Raffle Winner';
    case 'confirmed': return 'Confirmed';
    case 'cancelled': return 'Cancelled';
    default: return 'Registered';
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

// Digital Ticket Modal
async function openDigitalTicket(sub: SubmissionItem) {
  selectedGuestForTicket.value = sub;
  const qrContent = JSON.stringify({
    ticket_code: sub.ticket_code || sub.id,
    page_id: sub.page_id,
    name: sub.form_data?.fullName
  });

  try {
    qrSvg.value = await QRCode.toString(qrContent, {
      type: 'svg',
      width: 180,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.warn('QR generate error:', err);
    qrSvg.value = '';
  }
}

// Manual Check-in action
async function handleManualCheckIn(sub: SubmissionItem) {
  try {
    const res = await apiJson<{ success: boolean; data: SubmissionItem; message: string }>('/api/submissions/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_code: sub.ticket_code || sub.id,
        page_id: props.project?.id,
        checked_in_by: 'Dashboard Staff'
      })
    });
    if (res && res.success) {
      playSound('success');
      sub.status = 'checked_in';
      sub.checked_in_at = new Date().toISOString();
    }
  } catch (err) {
    console.warn('Checkin error:', err);
  }
}

// Camera Scanner Implementation
async function startCamera() {
  if (isCameraActive.value) return;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
    });
    if (videoRef.value) {
      videoRef.value.srcObject = cameraStream;
      isCameraActive.value = true;
    }
    // Barcode detection interval if supported
    setupBarcodeDetector();
  } catch (err) {
    console.warn('[Camera] Could not start camera:', err);
    isCameraActive.value = false;
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
  if (scanInterval) {
    clearInterval(scanInterval);
    scanInterval = null;
  }
  isCameraActive.value = false;
}

function setupBarcodeDetector() {
  if (!('BarcodeDetector' in window)) return;
  try {
    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
    scanInterval = setInterval(async () => {
      if (!videoRef.value || !isCameraActive.value || isCheckingIn.value) return;
      try {
        const barcodes = await detector.detect(videoRef.value);
        if (barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue) {
            handleScanCode(rawValue);
          }
        }
      } catch {}
    }, 400);
  } catch {}
}

let lastScannedCode = '';
let scanCooldownTimer: any = null;

async function handleScanCode(rawInput: string) {
  if (!rawInput.trim() || isCheckingIn.value) return;
  let code = rawInput.trim();

  // If JSON payload was scanned
  try {
    const parsed = JSON.parse(code);
    if (parsed.ticket_code) {
      code = parsed.ticket_code;
    }
  } catch {}

  // Prevent multiple rapid duplicate triggers
  if (code === lastScannedCode) return;
  lastScannedCode = code;
  clearTimeout(scanCooldownTimer);
  scanCooldownTimer = setTimeout(() => {
    lastScannedCode = '';
  }, 3000);

  isCheckingIn.value = true;
  try {
    const res = await apiJson<{ 
      success: boolean; 
      alreadyCheckedIn?: boolean; 
      notWinner?: boolean; 
      data?: SubmissionItem; 
      message: string 
    }>('/api/submissions/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_code: code,
        page_id: props.project?.id,
        checked_in_by: 'QR Scanner Device'
      })
    });

    if (res && res.success) {
      playSound('success');
      scanFeedback.value = {
        type: 'success',
        title: 'Check-In Successful',
        message: res.message,
        attendee: res.data
      };
      // Update local state
      const found = submissions.value.find(s => s.id === res.data?.id);
      if (found && res.data) {
        found.status = 'checked_in';
        found.checked_in_at = res.data.checked_in_at;
      }
    } else if (res && res.alreadyCheckedIn) {
      playSound('warning');
      scanFeedback.value = {
        type: 'warning',
        title: 'Already Checked In',
        message: res.message,
        attendee: res.data
      };
    } else if (res && res.notWinner) {
      playSound('error');
      scanFeedback.value = {
        type: 'error',
        title: 'Not Drawn Winner',
        message: res.message,
        attendee: res.data
      };
    } else {
      playSound('error');
      scanFeedback.value = {
        type: 'error',
        title: 'Invalid Ticket',
        message: res?.message || 'Unrecognized ticket code for this event campaign.'
      };
    }
  } catch (err: any) {
    playSound('error');
    scanFeedback.value = {
      type: 'error',
      title: 'Scan Error',
      message: 'Ticket not found or network error occurred.'
    };
  } finally {
    isCheckingIn.value = false;
    manualCode.value = '';
  }
}

// Draw Raffle Winners action
async function handleExecuteRaffleDraw() {
  if (!props.project) return;
  isDrawing.value = true;
  try {
    const res = await apiJson<{ success: boolean; winnerIds: string[]; count: number }>('/api/submissions/draw-raffle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: props.project.id,
        count: drawCount.value
      })
    });
    if (res && res.success) {
      playSound('success');
      showDrawRaffleModal.value = false;
      await fetchSubmissions();
    }
  } catch (err) {
    console.warn('Raffle draw error:', err);
  } finally {
    isDrawing.value = false;
  }
}

// Export CSV
function exportGuestsCsv() {
  if (submissions.value.length === 0) return;

  const headers = ['Attendee Name', 'Email', 'Phone', 'Instagram', 'Size', 'Status', 'Ticket Code', 'Submission Type', 'Registered At', 'Checked In At'];
  const rows = submissions.value.map(s => [
    `"${(s.form_data?.fullName || '').replace(/"/g, '""')}"`,
    `"${(s.form_data?.email || '').replace(/"/g, '""')}"`,
    `"${(s.form_data?.phone || '').replace(/"/g, '""')}"`,
    `"${(s.form_data?.instagram || '').replace(/"/g, '""')}"`,
    `"${(s.form_data?.size || '').replace(/"/g, '""')}"`,
    s.status,
    s.ticket_code || s.id,
    s.submission_type,
    s.created_at,
    s.checked_in_at || ''
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${props.project?.slug || 'campaign'}-guests.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(() => {
  if (props.isOpen && props.project) {
    fetchSubmissions();
  }
});

onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
@keyframes scannerLaser {
  0% { transform: translateY(-70px); opacity: 0.3; }
  50% { opacity: 1; }
  100% { transform: translateY(70px); opacity: 0.3; }
}

.animate-scanner-laser {
  animation: scannerLaser 2s infinite ease-in-out;
}
</style>
