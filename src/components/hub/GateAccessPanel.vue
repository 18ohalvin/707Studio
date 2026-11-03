<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[640px] max-h-[88vh] rounded-[16px] bg-white border border-black/10 shadow-[0px_20px_60px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-black/5">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 text-neutral-400 text-[11px] font-medium">
              <ShieldCheck class="w-3.5 h-3.5 text-moss-700" />
              <span>Gate Management</span>
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

        <!-- Tabs: Assigned Devices vs Add Device (Hidden if no devices added yet) -->
        <div v-if="accounts.length > 0" class="flex items-center gap-6 px-6 border-b border-black/10 bg-white">
          <button
            type="button"
            @click="activeTab = 'stations'"
            style="outline: none; box-shadow: none; -webkit-tap-highlight-color: transparent;"
            class="py-2.5 text-[12.5px] transition-colors relative cursor-pointer flex items-center gap-1.5 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 border-0 bg-transparent select-none"
            :class="activeTab === 'stations' ? 'text-black font-medium' : 'text-neutral-500 hover:text-black font-light'"
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
            :class="activeTab === 'create' ? 'text-black font-medium' : 'text-neutral-500 hover:text-black font-light'"
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
                  <span class="text-[13.5px] font-medium text-white truncate">{{ credentials.deviceLabel || credentials.username }}</span>
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
                <span class="text-[18px] font-mono font-medium tracking-wider text-white select-all">{{ credentials.password }}</span>
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

          <!-- TAB 1: ASSIGNED DEVICES (Active Compact Ledger Cards) -->
          <div v-if="activeTab === 'stations'" class="flex flex-col gap-3">
            <!-- Header bar with Quick Add shortcut -->
            <div class="flex items-center justify-between text-[11.5px] text-neutral-400 px-0.5">
              <span>Active Scanner Devices ({{ accounts.length }})</span>
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
              <p class="text-[13.5px] text-neutral-800 font-medium">No scanner devices assigned yet</p>
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

            <!-- Compact Active Device Cards Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="a in accounts"
                :key="a.id"
                class="rounded-[12px] border border-black/10 bg-white p-3.5 hover:border-black/25 transition-all flex flex-col justify-between gap-3 shadow-2xs group relative"
              >
                <!-- Top Row: Device Name & Store Branch + Status & Menu -->
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <h4 class="text-[13.5px] font-medium text-black tracking-tight">{{ parseDeviceName(a) }}</h4>
                      <span
                        v-if="parseBranch(a)"
                        class="px-1.5 py-0.5 rounded-[4px] bg-neutral-100 text-[10.5px] font-medium text-neutral-600 truncate max-w-[130px]"
                      >
                        {{ parseBranch(a) }}
                      </span>
                    </div>

                    <!-- PIC Name (or Inline Edit PIC) -->
                    <div v-if="editingPicId === a.id" class="flex items-center gap-1 mt-1.5" @click.stop>
                      <input
                        v-model="editPicName"
                        type="text"
                        placeholder="PIC Name"
                        class="h-[26px] px-2 rounded-[5px] border border-black/25 text-[11.5px] outline-none w-full bg-white"
                        @keydown.enter="savePic(a)"
                      />
                      <button type="button" @click="savePic(a)" class="h-[26px] px-2 rounded-[5px] bg-black text-white text-[11px] font-medium cursor-pointer">Save</button>
                      <button type="button" @click="editingPicId = null" class="h-[26px] px-2 rounded-[5px] border text-[11px] cursor-pointer">✕</button>
                    </div>
                    <p v-else class="text-[12px] text-neutral-500 mt-1 flex items-center gap-1.5 truncate">
                      <span class="text-neutral-400">PIC:</span>
                      <strong class="text-neutral-900 font-medium truncate">{{ a.username }}</strong>
                    </p>
                  </div>

                  <!-- Status & 3-Dot Menu -->
                  <div class="flex items-center gap-1 shrink-0">
                    <span class="inline-flex items-center gap-1 text-[11px] font-medium" :class="statusClass(a)">
                      <span class="size-1.5 rounded-full" :class="statusDotClass(a)" />
                      <span>{{ statusLabel(a) }}</span>
                    </span>

                    <!-- 3-Dot Menu -->
                    <div class="relative overflow-menu-container">
                      <button
                        type="button"
                        @click.stop="openMenuId = openMenuId === a.id ? null : a.id"
                        class="size-[24px] rounded-[5px] hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
                        title="More options"
                      >
                        <MoreHorizontal class="w-3.5 h-3.5" />
                      </button>

                      <!-- Dropdown Popover -->
                      <div
                        v-if="openMenuId === a.id"
                        class="absolute right-0 top-[calc(100%+4px)] z-30 w-[175px] bg-white border border-black/10 rounded-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.12)] p-1 flex flex-col gap-0.5 text-[11.5px] animate-apple-pop"
                        @click.stop
                      >
                        <button
                          type="button"
                          @click="startEditPic(a); openMenuId = null"
                          class="w-full px-2.5 py-1.5 rounded-[6px] hover:bg-neutral-100 text-left flex items-center gap-2 text-neutral-700 hover:text-black cursor-pointer"
                        >
                          <Edit3 class="w-3.5 h-3.5 text-neutral-400" />
                          <span>Edit PIC Handler</span>
                        </button>

                        <div class="h-px bg-black/5 my-0.5" />
                        <p class="px-2.5 pt-1 text-[9.5px] uppercase tracking-normal text-neutral-400 font-medium">Switch Role</p>
                        <button
                          type="button"
                          @click="updateStationMode(a, 'in'); openMenuId = null"
                          class="w-full px-2.5 py-1 rounded-[5px] hover:bg-neutral-100 text-left flex items-center justify-between text-[11px] cursor-pointer"
                          :class="a.stationMode === 'in' ? 'font-medium text-black' : 'text-neutral-600'"
                        >
                          <span>Entrance (In)</span>
                          <Check v-if="a.stationMode === 'in'" class="w-3 h-3 text-black" />
                        </button>
                        <button
                          type="button"
                          @click="updateStationMode(a, 'out'); openMenuId = null"
                          class="w-full px-2.5 py-1 rounded-[5px] hover:bg-neutral-100 text-left flex items-center justify-between text-[11px] cursor-pointer"
                          :class="a.stationMode === 'out' ? 'font-medium text-black' : 'text-neutral-600'"
                        >
                          <span>Exit (Out)</span>
                          <Check v-if="a.stationMode === 'out'" class="w-3 h-3 text-black" />
                        </button>
                        <button
                          type="button"
                          @click="updateStationMode(a, 'both'); openMenuId = null"
                          class="w-full px-2.5 py-1 rounded-[5px] hover:bg-neutral-100 text-left flex items-center justify-between text-[11px] cursor-pointer"
                          :class="a.stationMode === 'both' ? 'font-medium text-black' : 'text-neutral-600'"
                        >
                          <span>Dual (In & Out)</span>
                          <Check v-if="a.stationMode === 'both'" class="w-3 h-3 text-black" />
                        </button>

                        <div class="h-px bg-black/5 my-0.5" />

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
                </div>

                <!-- Bottom Row: Role Badge + Shift Validity + Passcode Action -->
                <div class="flex items-center justify-between pt-2 border-t border-black/5 text-[11px]">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="px-2 py-0.5 rounded-[5px] text-[10.5px] font-medium" :class="roleBadgeClass(a.stationMode)">
                      {{ roleLabel(a.stationMode) }}
                    </span>
                    <span class="text-neutral-400 truncate text-[11px]" :title="a.expiresAt ? formatWhen(a.expiresAt) : ''">
                      {{ isExpired(a) ? `Expired` : `Until ${formatWhen(a.expiresAt)}` }}
                    </span>
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

          <!-- TAB 2: ADD DEVICE & ASSIGN PIC (Compact Sleek Form) -->
          <form v-else-if="activeTab === 'create'" class="flex flex-col gap-3.5 py-1" @submit.prevent="create">
            <div>
              <p class="text-[13.5px] font-medium text-black">Assign New Door PIC</p>
              <p class="text-[11.5px] text-neutral-500 mt-0.5">Register a scanner tablet and assign field staff access with station role.</p>
            </div>

            <!-- Row 1: Device Selection (Tab / iPad) + Staff PIC Name in a single line -->
            <div class="flex items-end gap-3">
              <!-- Device Selection Pill -->
              <div class="shrink-0 flex flex-col gap-1.5">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Device</label>
                <div class="inline-flex p-0.5 rounded-[8px] bg-neutral-100 border border-black/5 h-[38px] items-center">
                  <button
                    type="button"
                    @click="selectDeviceType('tab')"
                    class="h-[32px] px-3 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none"
                    :class="selectedDeviceType === 'tab' ? 'bg-white text-black shadow-2xs font-medium' : 'text-neutral-500 hover:text-black font-light'"
                  >
                    <Tablet class="w-3.5 h-3.5" />
                    <span>Tab {{ nextTabNumber }}</span>
                  </button>
                  <button
                    type="button"
                    @click="selectDeviceType('ipad')"
                    class="h-[32px] px-3 rounded-[6px] text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 select-none"
                    :class="selectedDeviceType === 'ipad' ? 'bg-white text-black shadow-2xs font-medium' : 'text-neutral-500 hover:text-black font-light'"
                  >
                    <Tablet class="w-3.5 h-3.5" />
                    <span>iPad {{ nextIpadNumber }}</span>
                  </button>
                </div>
              </div>

              <!-- Staff PIC Name Input Box -->
              <div class="flex-1 min-w-0 flex flex-col gap-1.5">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Staff PIC Name *</label>
                <input
                  v-model="username"
                  type="text"
                  required
                  autocomplete="off"
                  placeholder="Staff PIC Name (e.g. Budi Santoso)"
                  class="h-[38px] px-3.5 rounded-[8px] bg-neutral-50 hover:bg-white focus:bg-white border border-black/15 focus:border-black text-[13px] outline-none transition-all w-full"
                />
              </div>
            </div>

            <!-- Row 2: Store Branch Guide + Station Role Selection Bar with Dropdown Popup in a single line -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Store Branch / Gate Location -->
              <div class="flex flex-col gap-1.5">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Store Branch / Gate</label>
                <input
                  v-model="storeBranch"
                  type="text"
                  autocomplete="off"
                  placeholder="Store Branch (e.g. Grand Indonesia)"
                  class="h-[38px] px-3.5 rounded-[8px] bg-neutral-50 hover:bg-white focus:bg-white border border-black/15 focus:border-black text-[13px] outline-none transition-all w-full"
                />
              </div>

              <!-- Station Role Selection Bar with Dropdown Popup -->
              <div class="flex flex-col gap-1.5 relative role-dropdown-container">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Station Role</label>
                <button
                  type="button"
                  @click="roleDropdownOpen = !roleDropdownOpen; shiftDropdownOpen = false"
                  class="w-full h-[38px] px-3 rounded-[8px] bg-neutral-50 hover:bg-neutral-100/80 border border-black/15 flex items-center justify-between gap-2 text-[13px] font-medium text-black transition-colors cursor-pointer select-none"
                  :class="roleDropdownOpen ? 'border-black bg-white ring-1 ring-black/10' : ''"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <component
                      :is="stationMode === 'in' ? LogIn : stationMode === 'out' ? LogOut : ArrowLeftRight"
                      class="w-3.5 h-3.5 shrink-0"
                      :class="stationMode === 'in' ? 'text-moss-600' : stationMode === 'out' ? 'text-amber-600' : 'text-neutral-700'"
                    />
                    <span class="truncate">{{ roleLabel(stationMode) }}</span>
                  </div>
                  <ChevronDown class="w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200" :class="roleDropdownOpen ? 'rotate-180' : ''" />
                </button>

                <!-- Role Dropdown Menu Popup -->
                <Transition name="apple-pop">
                  <div
                    v-if="roleDropdownOpen"
                    class="absolute top-full left-0 right-0 mt-1 z-30 rounded-[10px] bg-white border border-black/10 shadow-[0px_8px_24px_rgba(0,0,0,0.12)] p-1 flex flex-col gap-0.5"
                  >
                    <button
                      type="button"
                      @click="selectRole('in')"
                      class="w-full px-2.5 py-2 rounded-[7px] text-left flex items-center justify-between text-[12.5px] cursor-pointer transition-colors"
                      :class="stationMode === 'in' ? 'bg-black/5 font-medium text-black' : 'hover:bg-neutral-50 text-neutral-700'"
                    >
                      <div class="flex items-center gap-2">
                        <LogIn class="w-3.5 h-3.5 text-moss-600 shrink-0" />
                        <div>
                          <p class="leading-none text-[12.5px]">Entrance Gate</p>
                          <p class="text-[10.5px] text-neutral-400 mt-0.5 leading-none">Admit incoming guests</p>
                        </div>
                      </div>
                      <Check v-if="stationMode === 'in'" class="w-3.5 h-3.5 text-black shrink-0" />
                    </button>

                    <button
                      type="button"
                      @click="selectRole('out')"
                      class="w-full px-2.5 py-2 rounded-[7px] text-left flex items-center justify-between text-[12.5px] cursor-pointer transition-colors"
                      :class="stationMode === 'out' ? 'bg-black/5 font-medium text-black' : 'hover:bg-neutral-50 text-neutral-700'"
                    >
                      <div class="flex items-center gap-2">
                        <LogOut class="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <div>
                          <p class="leading-none text-[12.5px]">Exit Gate</p>
                          <p class="text-[10.5px] text-neutral-400 mt-0.5 leading-none">Check-out departing guests</p>
                        </div>
                      </div>
                      <Check v-if="stationMode === 'out'" class="w-3.5 h-3.5 text-black shrink-0" />
                    </button>

                    <button
                      type="button"
                      @click="selectRole('both')"
                      class="w-full px-2.5 py-2 rounded-[7px] text-left flex items-center justify-between text-[12.5px] cursor-pointer transition-colors"
                      :class="stationMode === 'both' ? 'bg-black/5 font-medium text-black' : 'hover:bg-neutral-50 text-neutral-700'"
                    >
                      <div class="flex items-center gap-2">
                        <ArrowLeftRight class="w-3.5 h-3.5 text-neutral-700 shrink-0" />
                        <div>
                          <p class="leading-none text-[12.5px]">Dual Station</p>
                          <p class="text-[10.5px] text-neutral-400 mt-0.5 leading-none">Both Entrance & Exit</p>
                        </div>
                      </div>
                      <Check v-if="stationMode === 'both'" class="w-3.5 h-3.5 text-black shrink-0" />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Row 3: Shift Validity Selection Bar with Dropdown Popup -->
            <div class="flex flex-col gap-1.5 relative shift-dropdown-container">
              <div class="flex items-center justify-between">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Shift Validity</label>
                <span class="text-[11px] text-neutral-400">{{ shiftDurationSummary }}</span>
              </div>

              <button
                type="button"
                @click="shiftDropdownOpen = !shiftDropdownOpen; roleDropdownOpen = false"
                class="w-full h-[38px] px-3 rounded-[8px] bg-neutral-50 hover:bg-neutral-100/80 border border-black/15 flex items-center justify-between gap-2 text-[13px] font-medium text-black transition-colors cursor-pointer select-none"
                :class="shiftDropdownOpen ? 'border-black bg-white ring-1 ring-black/10' : ''"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <Clock class="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                  <span class="truncate">{{ shiftPresets.find(p => p.id === selectedPreset)?.label || 'Today (23:59)' }}</span>
                </div>
                <ChevronDown class="w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform duration-200" :class="shiftDropdownOpen ? 'rotate-180' : ''" />
              </button>

              <!-- Shift Dropdown Menu Popup -->
              <Transition name="apple-pop">
                <div
                  v-if="shiftDropdownOpen"
                  class="absolute top-full left-0 right-0 mt-1 z-30 rounded-[10px] bg-white border border-black/10 shadow-[0px_8px_24px_rgba(0,0,0,0.12)] p-1 flex flex-col gap-0.5"
                >
                  <button
                    v-for="p in shiftPresets"
                    :key="p.id"
                    type="button"
                    @click="selectShift(p.id)"
                    class="w-full px-2.5 py-2 rounded-[7px] text-left flex items-center justify-between text-[12.5px] cursor-pointer transition-colors"
                    :class="selectedPreset === p.id ? 'bg-black/5 font-medium text-black' : 'hover:bg-neutral-50 text-neutral-700'"
                  >
                    <div class="flex items-center gap-2">
                      <Clock class="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{{ p.label }}</span>
                    </div>
                    <Check v-if="selectedPreset === p.id" class="w-3.5 h-3.5 text-black shrink-0" />
                  </button>
                </div>
              </Transition>

              <!-- Custom datetime input (if custom chosen) -->
              <div v-if="selectedPreset === 'custom'" class="mt-1">
                <input
                  v-model="customExpires"
                  type="datetime-local"
                  class="h-[36px] w-full px-3 rounded-[8px] border border-black/15 text-[12.5px] outline-none focus:border-black bg-white"
                />
              </div>
            </div>

            <p v-if="error" class="text-[12px] text-oxblood-700 font-medium">{{ error }}</p>

            <!-- Submit Bar -->
            <div class="flex items-center justify-between gap-3 pt-2 border-t border-black/5">
              <p class="text-[11.5px] text-neutral-400">Passcode will be generated automatically.</p>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  X,
  Copy,
  Trash2,
  Shield,
  ShieldCheck,
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
  Edit3,
  ChevronDown
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

const activeTab = ref<'stations' | 'create'>('create');
const hasInitializedTab = ref(false);
const accounts = ref<GateAccount[]>([]);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const openMenuId = ref<string | null>(null);
const credentials = ref<CredentialsState | null>(null);

// Form state
const selectedDeviceType = ref<'tab' | 'ipad'>('tab');
const deviceNumber = ref<number>(1);
const storeBranch = ref('');
const username = ref('');
const stationMode = ref<'in' | 'out' | 'both'>('in');
const roleDropdownOpen = ref(false);
const shiftDropdownOpen = ref(false);

// Inline edit state
const editingPicId = ref<string | null>(null);
const editPicName = ref('');

type ShiftPreset = 'eod' | '8h' | '12h' | 'custom';
const shiftPresets: { id: ShiftPreset; label: string }[] = [
  { id: 'eod', label: 'Today (23:59)' },
  { id: '8h', label: '8 Hours' },
  { id: '12h', label: '12 Hours' },
  { id: 'custom', label: 'Custom' }
];

const selectedPreset = ref<ShiftPreset>('eod');
const customExpires = ref(getPresetExpiry('eod'));

const loginUrl = computed(() => `${window.location.origin}/login`);

const nextTabNumber = computed(() => getNextDeviceNumber('tab'));
const nextIpadNumber = computed(() => getNextDeviceNumber('ipad'));

function selectRole(mode: 'in' | 'out' | 'both') {
  stationMode.value = mode;
  roleDropdownOpen.value = false;
}

function selectShift(preset: ShiftPreset) {
  applyPreset(preset);
  shiftDropdownOpen.value = false;
}

// Automatic device numbering logic
function getNextDeviceNumber(type: 'tab' | 'ipad'): number {
  const prefix = type === 'tab' ? 'tab' : 'ipad';
  let maxNum = 0;
  for (const a of accounts.value) {
    const raw = (a.deviceLabel || a.username || '').toLowerCase();
    if (raw.includes(prefix)) {
      const match = raw.match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      } else {
        if (maxNum < 1) maxNum = 1;
      }
    }
  }
  return maxNum + 1;
}

function selectDeviceType(type: 'tab' | 'ipad') {
  selectedDeviceType.value = type;
  deviceNumber.value = getNextDeviceNumber(type);
}

const deviceTag = computed(() => {
  return selectedDeviceType.value === 'tab' ? `Tab ${deviceNumber.value}` : `iPad ${deviceNumber.value}`;
});

const fullDeviceLabel = computed(() => {
  const branch = storeBranch.value.trim();
  return branch ? `${deviceTag.value} · ${branch}` : deviceTag.value;
});

function parseDeviceName(a: GateAccount): string {
  const raw = a.deviceLabel || a.username || 'Device';
  if (raw.includes(' · ')) return raw.split(' · ')[0];
  if (raw.includes(' - ')) return raw.split(' - ')[0];
  return raw;
}

function parseBranch(a: GateAccount): string {
  const raw = a.deviceLabel || '';
  if (raw.includes(' · ')) return raw.split(' · ').slice(1).join(' · ');
  if (raw.includes(' - ')) return raw.split(' - ').slice(1).join(' - ');
  return '';
}

function roleLabel(mode: string): string {
  if (mode === 'in') return 'Entrance';
  if (mode === 'out') return 'Exit';
  return 'Dual (In & Out)';
}

function roleBadgeClass(mode: string): string {
  if (mode === 'in') return 'bg-moss-50 text-moss-800 border border-moss-200/60';
  if (mode === 'out') return 'bg-amber-50 text-amber-800 border border-amber-200/60';
  return 'bg-neutral-100 text-neutral-800 border border-black/5';
}

function getPresetExpiry(preset: ShiftPreset): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const toInput = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

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
  if (selectedPreset.value === 'eod') {
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
    deviceNumber.value = getNextDeviceNumber(selectedDeviceType.value);
    if (!hasInitializedTab.value) {
      activeTab.value = accounts.value.length > 0 ? 'stations' : 'create';
      hasInitializedTab.value = true;
    } else if (accounts.value.length === 0) {
      activeTab.value = 'create';
    }
  } catch (err: any) {
    error.value = err?.message || 'Could not load scanner devices.';
  } finally {
    loading.value = false;
  }
}

watch(activeTab, (tab) => {
  if (tab === 'create') {
    deviceNumber.value = getNextDeviceNumber(selectedDeviceType.value);
  }
});

async function create() {
  if (busy.value || !username.value.trim()) return;
  busy.value = true;
  error.value = '';
  try {
    const at = new Date(customExpires.value);
    if (Number.isNaN(at.getTime())) throw new Error('Set an expiry date and time.');
    const picName = username.value.trim();
    const devName = fullDeviceLabel.value;
    
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
    storeBranch.value = '';
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
  const target = e.target as HTMLElement;
  if (openMenuId.value && !target.closest('.overflow-menu-container')) {
    openMenuId.value = null;
  }
  if (roleDropdownOpen.value && !target.closest('.role-dropdown-container')) {
    roleDropdownOpen.value = false;
  }
  if (shiftDropdownOpen.value && !target.closest('.shift-dropdown-container')) {
    shiftDropdownOpen.value = false;
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
