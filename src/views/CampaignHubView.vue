<template>
  <div class="h-full w-full bg-white text-black font-sans font-light tracking-normal flex flex-col overflow-y-auto overflow-x-hidden hub-root" data-name="Campaign Hub">
    <!-- ============================================================== -->
    <!-- STATE 1: CAMPAIGN SELECTION LAUNCHPAD (Pre-Hub Gateway)        -->
    <!-- Strictly follows Sign-Up Step 1 layout on pure white canvas    -->
    <!-- ============================================================== -->
    <div v-if="!selectedProject" class="min-h-screen w-full flex flex-col justify-between bg-white text-black font-sans font-light tracking-normal select-none">
      <!-- 48px Header -->
      <header class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between border-b border-black/10 shrink-0 sticky top-0 z-30 bg-white">
        <div class="flex items-center gap-[10px] h-[20px]">
          <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
            <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
          </router-link>
          <span 
            v-if="authStore.isSuperAdmin"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-black/[0.04] border border-black/10 text-[10px] font-mono font-medium text-neutral-600 leading-none whitespace-nowrap select-none"
          >
            Dev
          </span>
          <button 
            v-else
            type="button"
            @click="showWhatsNewModal = true"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-sans font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
            title="What's New in Design Studio 1.5"
          >
            1.5
          </button>
        </div>

        <div class="flex items-center gap-3">
          <router-link to="/" class="text-[12.5px] text-neutral-500 hover:text-black font-medium transition-colors">
            Exit to Studio
          </router-link>

          <div class="w-px h-4 bg-black/10" />

          <!-- Profile Avatar Container with Anchored UserProfileModal -->
          <div class="relative flex items-center">
            <button 
              type="button"
              @click="authStore.isAuthenticated ? (showUserProfileModal = !showUserProfileModal) : router.push('/login')"
              class="relative size-[28px] rounded-full border-[0.5px] border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press group"
              :title="authStore.isAuthenticated ? 'User Profile' : 'Sign In'"
            >
              <div 
                v-if="authStore.isAuthenticated" 
                class="relative size-full rounded-full bg-black text-white flex items-center justify-center font-sans text-[10px] font-medium tracking-tight select-none"
              >
                {{ userInitials }}
                <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-emerald-500 border border-white" />
              </div>
              <User v-else class="w-3.5 h-3.5 text-black stroke-[1.5]" />
            </button>

            <UserProfileModal
              v-if="authStore.isAuthenticated"
              :is-open="showUserProfileModal"
              @close="showUserProfileModal = false"
              @open-analytics="handleAnalytics"
              @open-settings="handleOpenSettings"
              @open-projects="handleOpenProjects"
              @open-whats-new="handleOpenWhatsNew"
              @sign-out="handleSignOut"
            />
          </div>
        </div>
      </header>

      <!-- Center Stage: Minimalist Launchpad -->
      <main class="w-full flex-1 flex flex-col items-center justify-center px-[24px] py-[32px] sm:py-[48px] max-w-[620px] mx-auto my-auto">
        <div class="flex flex-col items-center gap-6 w-full text-center my-auto animate-apple-pop">
          <!-- Title Section -->
          <div class="flex flex-col items-center text-center gap-2">
            <span class="text-[12.5px] uppercase tracking-normal text-neutral-400 font-medium">Campaign Hub</span>
            <h1 class="font-sans text-[32px] sm:text-[40px] tracking-tight leading-[38px] sm:leading-[46px]">
              <span class="font-light text-black/60">Which campaign are you </span>
              <span class="font-medium text-black">managing today?</span>
            </h1>
          </div>

          <!-- Compact Selection Trigger Bar -->
          <div class="w-full max-w-[460px] relative mt-1">
            <button
              type="button"
              @click="openLaunchpadModal"
              class="w-full h-[50px] px-4 rounded-[14px] bg-neutral-50 hover:bg-neutral-100 border border-black/10 hover:border-black/25 flex items-center justify-between text-left transition-all apple-press cursor-pointer group shadow-2xs"
              title="Click to search and select campaign (⌘K)"
            >
              <div class="flex items-center gap-3 min-w-0">
                <Search class="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors shrink-0" />
                <span class="text-[13.5px] text-neutral-500 font-light truncate">
                  Select or search campaign…
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <kbd class="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-black/[0.04] border border-black/10 text-[11px] font-mono text-neutral-400">⌘K</kbd>
                <ChevronsUpDown class="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- ============================================================== -->
    <!-- STATE 2: ACTIVE CAMPAIGN HUB WORKSPACE                         -->
    <!-- No H1 title, Campaign Switcher on 48px Header, Live HUD on top -->
    <!-- ============================================================== -->
    <template v-else>
      <!-- Top 48px Header with Campaign Switcher -->
      <header class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between border-b border-black/10 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-40 select-none">
        <div class="flex items-center gap-[12px] h-[24px]">
          <!-- 707 Logo + 1.5 Badge -->
          <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
            <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
          </router-link>
          <span 
            v-if="authStore.isSuperAdmin"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-black/[0.04] border border-black/10 text-[10px] font-mono font-medium text-neutral-600 leading-none whitespace-nowrap select-none"
          >
            Dev
          </span>
          <button 
            v-else
            type="button"
            @click="showWhatsNewModal = true"
            class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-sans font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
            title="What's New in Design Studio 1.5"
          >
            1.5
          </button>

          <div class="w-px h-4 bg-black/15 mx-0.5" />

          <!-- Campaign Switcher Pill in Header (Campaign Title only, clean earth green dot) -->
          <div class="relative" ref="headerPickerRef">
            <button
              id="hub-header-switcher"
              type="button"
              @click="isPickerOpen = !isPickerOpen"
              class="flex items-center gap-2 h-[32px] px-2.5 rounded-[8px] border border-black/12 bg-neutral-50 hover:bg-neutral-100 text-black text-[12.5px] font-medium transition-all apple-press cursor-pointer"
              title="Switch campaign or return to selector"
            >
              <div class="size-1.5 rounded-full bg-moss-600 shrink-0" />
              <span class="font-medium truncate max-w-[220px] sm:max-w-[300px] text-[13px] text-black">{{ selectedProject.title }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-neutral-400 ml-0.5 shrink-0 transition-transform" :class="isPickerOpen ? 'rotate-180' : ''" />
            </button>

            <!-- Dropdown Popover -->
            <Transition name="hub-pop">
              <div
                v-if="isPickerOpen"
                class="absolute left-0 top-[calc(100%+6px)] z-50 w-[320px] bg-white border border-black/10 rounded-[14px] shadow-[0px_20px_50px_rgba(0,0,0,0.18)] p-2 font-sans font-light tracking-normal"
              >
                <div class="flex items-center justify-between px-2 pt-1 pb-2">
                  <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Switch Campaign</span>
                  <button
                    type="button"
                    @click="resetToLaunchpad"
                    class="text-[11.5px] text-neutral-600 hover:text-black underline cursor-pointer font-light"
                  >
                    All campaigns
                  </button>
                </div>

                <!-- Dropdown Search -->
                <div class="relative mb-1">
                  <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                  <input
                    v-model="pickerQuery"
                    type="text"
                    placeholder="Find campaign…"
                    class="w-full h-[32px] pl-8 pr-2 rounded-[7px] bg-black/[0.04] text-[12px] outline-none border border-transparent focus:border-black/20 focus:bg-white"
                  />
                </div>

                <div class="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 py-1">
                  <button
                    v-for="p in pickerProjects"
                    :key="p.id"
                    type="button"
                    @click="selectProject(p.id)"
                    class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-black/5 cursor-pointer text-left transition-colors"
                    :class="selectedProjectId === p.id ? 'bg-black/5 font-medium' : ''"
                  >
                    <div class="flex flex-col min-w-0 flex-1">
                      <span class="text-[12.5px] truncate">{{ p.title }}</span>
                    </div>
                    <span v-if="p.status === 'approved' || p.status === 'published'" class="size-1.5 rounded-full bg-moss-600 shrink-0" />
                    <Check v-if="selectedProjectId === p.id" class="w-3.5 h-3.5 text-black shrink-0" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Header Actions: Open Campaign Editor, Door Scanner -->
        <div class="flex items-center gap-2 md:gap-2.5">
          <!-- Live sync indicator (Earth Green) -->
          <button
            id="hub-refresh-btn"
            type="button"
            @click="refresh(true)"
            class="flex items-center gap-1.5 px-2.5 h-[32px] rounded-[8px] text-[11.5px] font-sans font-light text-neutral-500 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
            :title="lastSyncedAt ? `Last synced ${lastSyncedLabel}` : 'Sync now'"
          >
            <span class="relative flex size-2 items-center justify-center">
              <span class="size-1.5 rounded-full" :class="loadError ? 'bg-oxblood-600' : 'bg-moss-600'" />
            </span>
            <span class="hidden lg:inline tabular-nums">{{ loadError ? 'Offline' : (isLoading ? 'Syncing…' : `Synced ${lastSyncedLabel}`) }}</span>
            <RefreshCw class="w-3.5 h-3.5" :class="isLoading ? 'animate-spin' : ''" />
          </button>

          <!-- Primary: Open Campaign Editor -->
          <router-link
            :to="editorHref"
            class="flex items-center gap-1.5 h-[32px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-sans font-medium hover:bg-neutral-800 transition-colors apple-press"
            title="Open Campaign Form Editor"
          >
            <SquarePen class="w-3.5 h-3.5" />
            <span>Open Campaign Editor</span>
            <ArrowUpRight class="w-3 h-3 text-white/60" />
          </router-link>

          <div class="w-px h-4 bg-black/10 mx-0.5" />

          <!-- Profile Avatar Container with Anchored UserProfileModal -->
          <div class="relative flex items-center">
            <button 
              type="button"
              @click="authStore.isAuthenticated ? (showUserProfileModal = !showUserProfileModal) : router.push('/login')"
              class="relative size-[28px] rounded-full border-[0.5px] border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press group"
              :title="authStore.isAuthenticated ? 'User Profile' : 'Sign In'"
            >
              <div 
                v-if="authStore.isAuthenticated" 
                class="relative size-full rounded-full bg-black text-white flex items-center justify-center font-sans text-[10px] font-medium tracking-tight select-none"
              >
                {{ userInitials }}
                <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-emerald-500 border border-white" />
              </div>
              <User v-else class="w-3.5 h-3.5 text-black stroke-[1.5]" />
            </button>

            <UserProfileModal
              v-if="authStore.isAuthenticated"
              :is-open="showUserProfileModal"
              @close="showUserProfileModal = false"
              @open-analytics="handleAnalytics"
              @open-settings="handleOpenSettings"
              @open-projects="handleOpenProjects"
              @open-whats-new="handleOpenWhatsNew"
              @sign-out="handleSignOut"
            />
          </div>
        </div>
      </header>

      <!-- 1. Live Campaign HUD / Metric Ribbon (Harmonious Calm Cards, Earth Green) -->
      <div class="px-[24px] w-full pt-[20px] md:pt-[24px] pb-[16px] shrink-0 font-sans tracking-normal">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <!-- Card 1: Total Registered -->
          <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
            <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Total Registered</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-[26px] sm:text-[30px] font-medium font-mono tabular-nums leading-none text-black">{{ rows.length }}</span>
              <span class="text-[12px] text-neutral-400 font-light">Pax</span>
            </div>
          </div>

          <!-- Card 2: Live Checked In -->
          <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Checked In</span>
              <span class="text-[11px] font-mono font-medium text-moss-700 bg-moss-50 px-1.5 py-0.2 rounded-full border border-moss-200 tabular-nums">
                {{ checkedInPct }}%
              </span>
            </div>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-[26px] sm:text-[30px] font-medium font-mono tabular-nums leading-none text-black">{{ checkedInCount }}</span>
              <span class="text-[12px] text-neutral-400 font-light">/ {{ rows.length }}</span>
            </div>
            <!-- Mini progress bar (Earth Green) -->
            <div class="w-full h-[4px] rounded-full bg-black/10 overflow-hidden mt-1.5">
              <div class="h-full bg-moss-700 rounded-full transition-all duration-500" :style="{ width: `${checkedInPct}%` }" />
            </div>
          </div>

          <!-- Card 3: Pending Arrival -->
          <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-1 shadow-2xs">
            <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Pending Arrival</span>
            <div class="flex items-baseline gap-2 mt-1">
              <span class="text-[26px] sm:text-[30px] font-medium font-mono tabular-nums leading-none text-neutral-800">{{ pendingArrivalCount }}</span>
              <span class="text-[12px] text-neutral-400 font-light">Remaining</span>
            </div>
          </div>

          <!-- Card 4: Door Check-in Quick Launch (Calm & Balanced) -->
          <div class="p-4 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-2 shadow-2xs">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Door Entrance</span>
              <span class="size-1.5 rounded-full bg-moss-600 shrink-0" />
            </div>
            <div class="flex flex-col gap-1.5 mt-1">
              <a
                :href="scannerHref"
                target="_blank"
                rel="noopener"
                class="w-full h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors apple-press cursor-pointer"
              >
                <ScanLine class="w-3.5 h-3.5" />
                <span>Launch Scanner</span>
                <ArrowUpRight class="w-3 h-3 text-neutral-400" />
              </a>
              <button
                type="button"
                @click="gateOpen = true"
                class="w-full h-[24px] text-[11px] font-sans text-neutral-500 hover:text-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                title="Create or manage door-security accounts for this campaign"
              >
                <ShieldCheck class="w-3 h-3 text-neutral-400" />
                <span>Gate Management</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Workspace Navigation (Sticky beneath 48px header) -->
      <div id="hub-workspace-nav" class="sticky top-[48px] z-30 bg-white/95 backdrop-blur-md border-b border-black/10 w-full select-none">
        <nav class="flex gap-[28px] md:gap-[44px] items-center px-[24px] w-full whitespace-nowrap overflow-x-auto no-scrollbar py-2.5 font-sans tracking-normal" aria-label="Campaign hub sections">
          <button
            v-for="t in tabs"
            :id="`hub-tab-${t.id}`"
            :key="t.id"
            type="button"
            @click="setTab(t.id)"
            class="bg-transparent border-none p-0 cursor-pointer font-sans text-[14.5px] md:text-[15.5px] leading-[22px] transition-colors flex items-center gap-2 outline-none focus:outline-none focus-visible:outline-none ring-0 select-none"
            :class="activeTab === t.id ? 'font-medium underline decoration-solid underline-offset-[10px] text-black' : 'font-light text-neutral-500 hover:text-black'"
          >
            {{ t.label }}
            <span v-if="t.badge !== undefined" class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 no-underline tabular-nums">{{ t.badge }}</span>
          </button>
        </nav>
      </div>

      <!-- 3. Workspace Content (Flows naturally with sticky tab above) -->
      <main class="flex-1 w-full px-[24px] py-[20px] md:py-[24px]">
          <div v-if="isInitialLoad" class="flex flex-col gap-3">
            <div v-for="i in 5" :key="i" class="h-[52px] rounded-[10px] bg-neutral-100 hub-shimmer" />
          </div>

          <template v-else>
            <div v-if="loadError" class="mb-5 flex items-center gap-3 px-4 py-3 rounded-[10px] border border-oxblood-200 bg-oxblood-50 text-[12px] text-oxblood-700">
              <AlertTriangle class="w-4 h-4 shrink-0" />
              <span class="flex-1">{{ loadError }}</span>
              <button type="button" @click="refresh(true)" class="px-2.5 py-1 rounded-[6px] bg-white border border-oxblood-200 font-medium cursor-pointer hover:bg-oxblood-100">Retry</button>
            </div>

            <!-- Guest Database Workspace -->
            <GuestDatabaseTable
              v-if="activeTab === 'guests'"
              :rows="rows"
              :campaign-title="campaignTitle"
              :show-campaign-column="false"
              :export-name="exportBaseName"
              :has-live-queue="hasLiveQueue"
              :page-id="selectedProject.id"
              @updated="mergeRows"
              @removed="removeRows"
              @toast="toast"
            />

            <!-- Queue & Capacity Workspace -->
            <QueueSettingsPanel
              v-else-if="activeTab === 'queue'"
              :page-id="selectedProjectId"
              :rows="rows"
              @toast="toast"
            />

            <!-- Raffle Draw Workspace -->
            <RaffleDraw
              v-else-if="activeTab === 'raffle'"
              :rows="rows"
              :export-name="exportBaseName"
              :campaign-title="selectedProject.title"
              @updated="mergeRows"
              @toast="toast"
            />
          </template>
        </main>

      <!-- Security / Gate Access Drawer -->
      <GateAccessPanel
        v-if="gateOpen && selectedProject"
        :project-id="selectedProject.id"
        :project-title="selectedProject.title"
        @close="gateOpen = false"
        @toast="toast"
      />
    </template>

    <!-- Studio Toast -->
    <Transition name="hub-pop">
      <div
        v-if="toastMessage"
        class="fixed bottom-[24px] left-1/2 -translate-x-1/2 z-[90] apple-frost border border-white/60 rounded-2xl px-4 py-3 shadow-[0px_12px_40px_rgba(0,0,0,0.14),0_1px_3px_rgba(0,0,0,0.06)] flex items-center gap-3 select-none max-w-[92vw]"
        role="status"
      >
        <div class="size-2 rounded-full bg-moss-500 shrink-0" />
        <p class="font-sans text-[12px] text-black font-medium">{{ toastMessage }}</p>
      </div>
    </Transition>

    <!-- Launchpad Campaign Search & Selection Modal (⌘K Command Palette) -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="isLaunchpadModalOpen" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="isLaunchpadModalOpen = false"
        >
          <div class="w-full max-w-[500px] bg-white rounded-[18px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Modal Header / Live Search Bar -->
            <div class="relative flex items-center px-4 h-[52px] border-b border-black/10 shrink-0">
              <Search class="w-4 h-4 text-neutral-400 shrink-0 mr-3" />
              <input
                ref="launchpadModalInputRef"
                v-model="launchpadSearch"
                type="text"
                placeholder="Search campaign by title or slug…"
                class="flex-1 h-full text-[13.5px] bg-transparent outline-none placeholder:text-neutral-400 text-black font-light"
                @keydown.esc="isLaunchpadModalOpen = false"
                @keydown.enter.prevent="handleModalEnter"
              />
              <button
                type="button"
                @click="isLaunchpadModalOpen = false"
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors"
                title="Close (Esc)"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <!-- Campaign Results List -->
            <div class="max-h-[360px] overflow-y-auto divide-y divide-black/[0.04] p-1.5">
              <button
                v-for="p in filteredLaunchpadProjects"
                :key="p.id"
                type="button"
                @click="selectProjectAndEnter(p.id)"
                class="w-full px-3.5 py-3 rounded-[10px] hover:bg-neutral-100/90 active:bg-neutral-200/70 flex items-center justify-between text-left transition-colors cursor-pointer group"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="size-8 rounded-[8px] bg-black/[0.04] border border-black/5 flex items-center justify-center shrink-0">
                    <span class="font-medium text-[11px] text-neutral-700 uppercase">{{ (p.title || 'C').charAt(0) }}</span>
                  </div>
                  <div class="min-w-0 flex flex-col">
                    <span class="text-[13.5px] font-medium text-black truncate group-hover:text-black">{{ p.title }}</span>
                    <span class="text-[11px] text-neutral-400 font-mono truncate">/{{ p.slug }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <span v-if="p.status === 'approved' || p.status === 'published'" class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-moss-50 border border-moss-200 text-[10.5px] font-mono text-moss-800">
                    <span class="size-1.5 rounded-full bg-moss-600" />
                    <span>Active</span>
                  </span>
                  <span v-else class="text-[11px] text-neutral-400 capitalize font-light">{{ p.status || 'Draft' }}</span>
                </div>
              </button>

              <div v-if="!filteredLaunchpadProjects.length" class="py-8 text-center text-[13px] text-neutral-400 font-light">
                No campaigns match "{{ launchpadSearch }}"
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Design Studio 1.5 What's New Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      @close="showWhatsNewModal = false"
    />

    <!-- All Projects / My Activations Modal -->
    <AllProjectsModal
      :is-open="showAllProjectsModal"
      @close="showAllProjectsModal = false"
      @select-project="handleSelectProjectFromModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  RefreshCw, ChevronDown, ChevronsUpDown, Check, Search, AlertTriangle, ScanLine, ArrowUpRight,
  ShieldCheck, SquarePen, X, User
} from 'lucide-vue-next';
import GateAccessPanel from '../components/hub/GateAccessPanel.vue';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import AllProjectsModal from '../components/modals/AllProjectsModal.vue';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import type { ProjectItem } from '../types/editor.ts';
import { useCampaignGuests } from '../components/hub/useCampaignGuests.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useAuthStore } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import GuestDatabaseTable from '../components/hub/GuestDatabaseTable.vue';
import RaffleDraw from '../components/hub/RaffleDraw.vue';
import QueueSettingsPanel from '../components/hub/QueueSettingsPanel.vue';

type TabId = 'guests' | 'queue' | 'raffle';
const TAB_IDS: TabId[] = ['guests', 'queue', 'raffle'];

const route = useRoute();
const router = useRouter();
const editorStore = useEditorStore();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const showWhatsNewModal = ref(false);
const showUserProfileModal = ref(false);
const showAllProjectsModal = ref(false);

const userInitials = computed(() => {
  if (authStore.isSuperAdmin) return 'SA';
  const name = authStore.currentUser?.name || brandStore.activeBrand?.name || '';
  if (!name) return '707';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

function handleOpenProjects() {
  showUserProfileModal.value = false;
  showAllProjectsModal.value = true;
}

function handleOpenWhatsNew() {
  showUserProfileModal.value = false;
  showWhatsNewModal.value = true;
}

function handleOpenSettings() {
  showUserProfileModal.value = false;
  if (authStore.isSuperAdmin) {
    router.push('/dev');
  } else {
    router.push('/dev');
  }
}

function handleAnalytics() {
  showUserProfileModal.value = false;
}

function handleSignOut() {
  showUserProfileModal.value = false;
  authStore.signOut();
  brandStore.setActiveBrand(null);
  router.push('/');
}

function handleSelectProjectFromModal(project: ProjectItem) {
  showAllProjectsModal.value = false;
  selectProject(project.id);
}

const {
  rows, isLoading, isInitialLoad, loadError, lastSyncedAt,
  selectedProjectId, projects, selectedProject,
  campaignTitle, refresh: reload, mergeRows, removeRows
} = useCampaignGuests();

const nowTick = ref(Date.now());

// Default active tab is 'guests'
const activeTab = ref<TabId>(TAB_IDS.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'guests');

/* ---------- Header Switcher ---------- */
const isPickerOpen = ref(false);
const pickerQuery = ref('');
const headerPickerRef = ref<HTMLElement | null>(null);

const pickerProjects = computed(() => {
  const q = pickerQuery.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter(p => p.title.toLowerCase().includes(q) || (p.slug || '').toLowerCase().includes(q) || (p.brand_slug || '').toLowerCase().includes(q));
});

/* ---------- Launchpad (Pre-Hub State) ---------- */
const isLaunchpadModalOpen = ref(false);
const launchpadSearch = ref('');
const launchpadModalInputRef = ref<HTMLInputElement | null>(null);

const filteredLaunchpadProjects = computed(() => {
  const q = launchpadSearch.value.trim().toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter(p => 
    p.title.toLowerCase().includes(q) || 
    (p.slug || '').toLowerCase().includes(q) || 
    (p.brand_slug || '').toLowerCase().includes(q)
  );
});

function openLaunchpadModal() {
  isLaunchpadModalOpen.value = true;
  launchpadSearch.value = '';
  nextTick(() => {
    launchpadModalInputRef.value?.focus();
  });
}

function handleModalEnter() {
  if (filteredLaunchpadProjects.value.length) {
    selectProjectAndEnter(filteredLaunchpadProjects.value[0].id);
  }
}

function selectProjectAndEnter(id: string) {
  selectedProjectId.value = id;
  isPickerOpen.value = false;
  isLaunchpadModalOpen.value = false;
  pickerQuery.value = '';
  launchpadSearch.value = '';
  router.replace({ query: { ...route.query, project: id } });
}

function selectProject(id: string) {
  selectProjectAndEnter(id);
}

function resetToLaunchpad() {
  selectedProjectId.value = '';
  isPickerOpen.value = false;
  isLaunchpadModalOpen.value = false;
  router.replace({ path: '/hub' });
}

/* ---------- Editor & Scanner URLs ---------- */
const editorHref = computed(() => {
  if (!selectedProject.value) return '/editor';
  return `/editor/${selectedProject.value.brand_slug}/${selectedProject.value.id}`;
});

const scannerHref = computed(() => {
  return router.resolve({
    path: '/hub/scanner',
    query: selectedProjectId.value ? { project: selectedProjectId.value } : {}
  }).href;
});

const exportBaseName = computed(() => {
  const base = selectedProject.value ? `${selectedProject.value.brand_slug}-${selectedProject.value.slug}` : 'campaign';
  return base.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
});

/* ---------- Live HUD Metrics ---------- */
const checkedInCount = computed(() => rows.value.filter(r => r.checked_in_at).length);
const checkedInPct = computed(() => rows.value.length ? Math.round((checkedInCount.value / rows.value.length) * 100) : 0);
const pendingArrivalCount = computed(() => Math.max(0, rows.value.length - checkedInCount.value));

/* ---------- Live Queue Detection ---------- */
function projectHasLiveQueue(p?: ProjectItem | null): boolean {
  if (!p) return false;
  if (p.id === editorStore.currentProjectId && editorStore.pages?.length) {
    if (editorStore.pages.some(pg => pg.widget_tree?.some(w => w.type === 'LiveQueuePass'))) {
      return true;
    }
  }
  const trees = [p.widget_tree || [], ...(p.pages || []).map(pg => pg.widget_tree || [])];
  for (const tree of trees) {
    if (tree.some(w => w.type === 'LiveQueuePass')) {
      return true;
    }
  }
  return false;
}

const hasLiveQueue = computed(() => {
  if (selectedProject.value) {
    return projectHasLiveQueue(selectedProject.value);
  }
  return false;
});

const tabs = computed(() => {
  const list: Array<{ id: TabId; label: string; badge?: number }> = [
    { id: 'guests' as TabId, label: 'Guest Database', badge: rows.value.length }
  ];
  if (hasLiveQueue.value) {
    list.push({ id: 'queue' as TabId, label: 'Queue & Capacity', badge: undefined });
  }
  list.push({ id: 'raffle' as TabId, label: 'Raffle & Stage Draw', badge: undefined });
  return list;
});

watch(hasLiveQueue, (active) => {
  if (!active && activeTab.value === 'queue') {
    activeTab.value = 'guests';
  }
});

const lastSyncedLabel = computed(() => {
  if (!lastSyncedAt.value) return 'now';
  const secs = Math.max(0, Math.round((nowTick.value - lastSyncedAt.value) / 1000));
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  return `${Math.round(secs / 60)}m ago`;
});

async function refresh(manual = false) {
  const count = await reload();
  if (manual && count !== null) toast(`Synced ${count} guest record${count === 1 ? '' : 's'}.`);
}

const gateOpen = ref(false);

function setTab(id: TabId) {
  activeTab.value = id;
}

const toastMessage = ref('');
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function toast(msg: string) {
  toastMessage.value = msg;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastMessage.value = ''), 2800);
}

// Keep URL query shareable: /hub?project=...&tab=...
watch([activeTab, selectedProjectId], ([tab, project]) => {
  if (!project) return;
  const query: Record<string, string> = { project, tab };
  router.replace({ query });
});

function handleOutsideClick(e: MouseEvent) {
  if (isPickerOpen.value && headerPickerRef.value && !headerPickerRef.value.contains(e.target as Node)) {
    isPickerOpen.value = false;
  }
}

function handleGlobalKeydown(e: KeyboardEvent) {
  // ⌘K or Ctrl+K opens the campaign selector / search modal
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (!selectedProject.value) {
      if (isLaunchpadModalOpen.value) {
        isLaunchpadModalOpen.value = false;
      } else {
        openLaunchpadModal();
      }
    } else {
      isPickerOpen.value = !isPickerOpen.value;
    }
  } else if (e.key === 'Escape') {
    if (isLaunchpadModalOpen.value) isLaunchpadModalOpen.value = false;
    if (isPickerOpen.value) isPickerOpen.value = false;
  }
}

let tickTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  if (route.query.tab === 'scanner') {
    router.replace({ path: '/hub/scanner', query: route.query.project ? { project: String(route.query.project) } : {} });
    return;
  }
  document.title = 'Campaign Hub | 707 Design Studio';
  document.addEventListener('mousedown', handleOutsideClick);
  window.addEventListener('keydown', handleGlobalKeydown);
  tickTimer = setInterval(() => (nowTick.value = Date.now()), 5000);

  // First-time visit: automatically show Design Studio 1.5 What's New modal
  try {
    const hasSeenWhatsNew = localStorage.getItem('707_seen_whats_new_1_5');
    if (!hasSeenWhatsNew || route.query.whatsnew === '1') {
      showWhatsNewModal.value = true;
      if (route.query.whatsnew === '1') {
        router.replace({ query: { ...route.query, whatsnew: undefined } });
      }
    }
  } catch {
    showWhatsNewModal.value = true;
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  window.removeEventListener('keydown', handleGlobalKeydown);
  if (tickTimer) clearInterval(tickTimer);
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { scrollbar-width: none; }

.hub-fade-enter-active, .hub-fade-leave-active {
  transition: opacity 0.18s ease;
}
.hub-fade-enter-from, .hub-fade-leave-to {
  opacity: 0;
}

.hub-shimmer {
  background: linear-gradient(90deg, #f4f4f4 0%, #ececec 40%, #f4f4f4 80%);
  background-size: 200% 100%;
  animation: hub-shimmer 1.4s ease-in-out infinite;
}
@keyframes hub-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.hub-pop-enter-active, .hub-pop-leave-active {
  transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.hub-pop-enter-from, .hub-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.98);
}
</style>
