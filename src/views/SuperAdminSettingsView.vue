<template>
  <div class="h-full w-full bg-white text-black font-707 flex flex-col select-none overflow-y-auto overflow-x-hidden">
    <!-- Top Header (707 Design Token Style - 48px Precision Sticky Header) -->
    <header class="w-full h-[48px] px-[24px] flex items-center justify-between border-b-[0.5px] border-black/10 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-30">
      <!-- Left: 707 Logo & Sub-Brand Studio Identifier -->
      <div class="flex items-center gap-[12px] h-[20px]">
        <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none"
          />
        </router-link>
        <span class="text-neutral-300 font-light text-[12px]">/</span>
        <span class="font-707 text-[11px] font-medium tracking-widest text-[#737373] uppercase">
          SUPERADMIN DIRECTORY
        </span>
      </div>

      <!-- Right: Back to Studio & Exit Superadmin -->
      <div class="flex items-center gap-3">
        <router-link 
          to="/" 
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-none border-[0.5px] border-black/20 text-[11px] font-707 font-medium uppercase tracking-wider text-black hover:border-black transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>STUDIO</span>
        </router-link>

        <button 
          @click="handleExitAdmin"
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-none bg-black text-white hover:bg-neutral-900 text-[11px] font-707 font-medium uppercase tracking-wider cursor-pointer transition-colors border-none"
          title="Exit Superadmin Mode"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>EXIT ADMIN</span>
        </button>

        <div class="w-px h-4 bg-black/10" />

        <!-- Profile Avatar Container with Anchored UserProfileModal -->
        <div class="relative flex items-center">
          <button 
            type="button"
            @click="showUserProfileModal = !showUserProfileModal"
            class="relative size-[28px] rounded-full border-[0.5px] border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press group"
            title="User Profile"
          >
            <div 
              class="relative size-full rounded-full bg-black text-white flex items-center justify-center font-707 text-[10px] font-medium tracking-tight select-none"
            >
              {{ userInitials }}
              <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-emerald-500 border border-white" />
            </div>
          </button>

          <UserProfileModal
            :is-open="showUserProfileModal"
            @close="showUserProfileModal = false"
            @open-analytics="handleAnalytics"
            @open-settings="showUserProfileModal = false"
            @open-projects="handleOpenProjects"
            @open-whats-new="handleOpenWhatsNew"
            @sign-out="handleSignOut"
          />
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="flex-1 w-full max-w-[1280px] mx-auto py-[40px] flex flex-col gap-[32px]">
      <!-- 1. Intro Container -->
      <div class="flex flex-col gap-[8px] items-start px-[48px] w-full">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-[#7e2c32] animate-pulse" />
          <span class="font-707 text-[11px] font-medium uppercase tracking-widest text-[#7e2c32]">
            GOVERNANCE & SYSTEM ADMINISTRATION
          </span>
        </div>
        <h1 class="font-707 text-[28px] leading-[34px] tracking-tight text-black font-normal uppercase">
          System Governance & Directory
        </h1>
        <p class="font-707 text-[13.5px] leading-[22px] text-[#737373] max-w-[680px]">
          Review incoming brand drops, manage brand PICs, team account permissions, and system-wide configurations.
        </p>
      </div>

      <!-- 2. Minimalist Swiss Navigation Tab Bar -->
      <div class="flex gap-[32px] items-center px-[48px] text-[13px] text-black w-full whitespace-nowrap border-b-[0.5px] border-black/10">
        <button 
          @click="activeTab = 'brands'"
          class="bg-transparent border-none pb-3 cursor-pointer font-707 text-[12.5px] tracking-wider uppercase transition-colors relative"
          :class="[
            activeTab === 'brands' 
              ? 'font-medium text-black border-b-2 border-black -mb-[1px]' 
              : 'font-normal text-neutral-400 hover:text-black'
          ]"
        >
          BRANDS & PICs [{{ brandStore.brands.length }}]
        </button>

        <button 
          @click="activeTab = 'users'"
          class="bg-transparent border-none pb-3 cursor-pointer font-707 text-[12.5px] tracking-wider uppercase transition-colors relative"
          :class="[
            activeTab === 'users' 
              ? 'font-medium text-black border-b-2 border-black -mb-[1px]' 
              : 'font-normal text-neutral-400 hover:text-black'
          ]"
        >
          TEAM ACCOUNTS [{{ teamUsers.length }}]
        </button>

        <button 
          @click="activeTab = 'submissions'"
          class="bg-transparent border-none pb-3 cursor-pointer font-707 text-[12.5px] tracking-wider uppercase transition-colors relative flex items-center gap-2"
          :class="[
            activeTab === 'submissions' 
              ? 'font-medium text-black border-b-2 border-black -mb-[1px]' 
              : 'font-normal text-neutral-400 hover:text-black'
          ]"
        >
          <span>PROJECT SUBMISSIONS</span>
          <span 
            v-if="pendingSubmissionsCount > 0" 
            class="px-1.5 py-0.5 text-[9.5px] font-medium bg-[#7e2c32] text-white tracking-widest uppercase rounded-none"
          >
            {{ pendingSubmissionsCount }} PENDING
          </span>
        </button>

        <button 
          @click="activeTab = 'templates'"
          class="bg-transparent border-none pb-3 cursor-pointer font-707 text-[12.5px] tracking-wider uppercase transition-colors relative"
          :class="[
            activeTab === 'templates' 
              ? 'font-medium text-black border-b-2 border-black -mb-[1px]' 
              : 'font-normal text-neutral-400 hover:text-black'
          ]"
        >
          TEMPLATES DIRECTORY
        </button>
      </div>

      <!-- TAB 1: BRANDS AND PIC'S -->
      <div v-if="activeTab === 'brands'" class="flex flex-col gap-[20px] items-start px-[48px] w-full">
        <!-- Brands Header -->
        <div class="flex items-center justify-between w-full">
          <p class="font-707 text-[13px] font-medium uppercase tracking-wider text-black">
            Brand Tenants Directory [{{ brandStore.brands.length }}]
          </p>

          <button 
            @click="showAddBrandModal = true"
            class="border-[0.5px] border-black flex items-center justify-center px-4 py-1.5 rounded-none bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[11px] font-medium uppercase tracking-wider text-black gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Brand</span>
          </button>
        </div>

        <!-- Brands Stacked Ledger -->
        <div class="flex flex-col items-start w-full border-[0.5px] border-black/15 rounded-none overflow-hidden bg-white">
          <!-- Column Headers -->
          <div class="hidden md:flex items-center justify-between px-6 py-2.5 bg-black/[0.02] border-b-[0.5px] border-black/15 text-[10.5px] font-707 font-medium uppercase tracking-widest text-[#737373] w-full">
            <span class="w-[280px]">BRAND / ENDPOINT</span>
            <span class="w-[160px]">ACTIVE CAMPAIGNS</span>
            <span class="w-[160px]">LAST ACTIVITY</span>
            <span class="w-[180px]">PIC ASSIGNMENT</span>
            <span class="w-[140px] text-right">GOVERNANCE</span>
          </div>

          <div 
            v-for="brand in brandStore.brands" 
            :key="brand.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 w-full bg-white hover:bg-neutral-50/70 border-b-[0.5px] border-black/10 last:border-b-0 transition-colors gap-3 md:gap-0"
          >
            <!-- Col 1: Brand Avatar, Name, Status Pill & Slug -->
            <div class="flex gap-4 items-center w-[280px] shrink-0">
              <!-- Avatar Square -->
              <div 
                class="size-[36px] rounded-none text-white flex items-center justify-center font-707 font-medium text-[13px] shrink-0 border-[0.5px] border-black/20 overflow-hidden bg-black"
                :style="{ backgroundColor: brand.primary_color || '#000000' }"
              >
                <img 
                  v-if="brand.logo_url" 
                  :src="sizedUrl(brand.logo_url, 320)" 
                  :alt="brand.name" 
                  class="size-full object-cover" 
                  @error="(e: any) => (e.target.style.display = 'none')"
                />
                <span v-else>{{ brand.name.charAt(0) }}</span>
              </div>

              <!-- Brand Name & Link -->
              <div class="flex flex-col gap-1 items-start min-w-0">
                <div class="flex gap-2 items-center w-full">
                  <p class="font-707 font-medium text-[12.5px] text-black whitespace-nowrap uppercase tracking-wider truncate">
                    {{ brand.name }}
                  </p>
                  <span class="border-[0.5px] border-black/30 px-1.5 py-0.5 rounded-none text-[9px] font-707 font-medium uppercase tracking-widest text-black shrink-0">
                    ACTIVE
                  </span>
                </div>
                <p class="font-mono text-[11px] text-[#737373] truncate">
                  events.707.co.id/{{ brand.slug }}
                </p>
              </div>
            </div>

            <!-- Col 2: On-going Projects -->
            <div class="w-[160px] shrink-0">
              <span class="font-707 text-[12px] uppercase text-black tabular-nums tracking-wide">
                {{ getBrandDropsCount(brand.slug) }} Activations Active
              </span>
            </div>

            <!-- Col 3: Last Activity -->
            <div class="w-[160px] shrink-0">
              <span class="font-707 text-[11.5px] uppercase text-[#737373]">
                {{ getBrandLastActivity(brand.slug) }}
              </span>
            </div>

            <!-- Col 4: PIC Accounts Count & Avatars -->
            <div class="flex items-center gap-2 w-[180px] shrink-0">
              <span class="font-707 text-[11.5px] uppercase text-black">
                {{ getBrandPics(brand.slug).length }} PIC{{ getBrandPics(brand.slug).length === 1 ? '' : 's' }}
              </span>
              <div class="flex -space-x-1 overflow-hidden">
                <div 
                  v-for="pic in getBrandPics(brand.slug).slice(0, 3)" 
                  :key="pic.id" 
                  class="inline-flex size-[20px] rounded-none border-[0.5px] border-black/20 bg-neutral-100 text-[9.5px] font-707 font-medium text-center items-center justify-center text-black"
                  :title="pic.name"
                >
                  {{ pic.name.charAt(0) }}
                </div>
              </div>
            </div>

            <!-- Col 5: Action Buttons -->
            <div class="flex items-center justify-end gap-3 w-[140px] shrink-0 text-right">
              <button 
                @click="openBrandDetailsModal(brand)"
                class="font-707 font-medium text-[11px] uppercase tracking-wider text-black hover:opacity-60 cursor-pointer bg-transparent border-none p-0 transition-opacity whitespace-nowrap"
              >
                EDIT DETAILS
              </button>
              <button 
                @click="handleRemoveBrand(brand)"
                class="text-neutral-400 hover:text-red-700 transition-colors p-1 cursor-pointer bg-transparent border-none flex items-center justify-center rounded-none"
                :title="`Remove ${brand.name} account`"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: TEAM ACCOUNTS & PASSWORD MANAGEMENT -->
      <div v-if="activeTab === 'users'" class="flex flex-col gap-[20px] items-start px-[48px] w-full">
        <!-- Team Header -->
        <div class="flex items-center justify-between w-full">
          <p class="font-707 text-[13px] font-medium uppercase tracking-wider text-black">
            System Team Directory [{{ teamUsers.length }}]
          </p>

          <button 
            @click="showAddUserModal = true"
            class="border-[0.5px] border-black flex items-center justify-center px-4 py-1.5 rounded-none bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[11px] font-medium uppercase tracking-wider text-black gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        <!-- Users Table -->
        <div class="flex flex-col items-start w-full border-[0.5px] border-black/15 rounded-none overflow-hidden bg-white">
          <!-- Column Headers -->
          <div class="hidden md:flex items-center justify-between px-6 py-2.5 bg-black/[0.02] border-b-[0.5px] border-black/15 text-[10.5px] font-707 font-medium uppercase tracking-widest text-[#737373] w-full">
            <span class="w-[280px]">MEMBER / IDENTITY</span>
            <span class="w-[150px]">SYSTEM ROLE</span>
            <span class="w-[180px]">SECURITY (HASHED)</span>
            <span class="w-[200px]">ASSIGNED TENANTS</span>
            <span class="w-[130px] text-right">GOVERNANCE</span>
          </div>

          <div 
            v-for="user in teamUsers" 
            :key="user.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 w-full bg-white hover:bg-neutral-50/70 border-b-[0.5px] border-black/10 last:border-b-0 transition-colors gap-3 md:gap-0"
          >
            <!-- Member Info -->
            <div class="flex gap-3.5 items-center w-[280px] shrink-0">
              <div class="size-[34px] rounded-none bg-black text-white flex items-center justify-center font-707 font-medium text-[12px] shrink-0 border-[0.5px] border-black/20">
                {{ user.name.charAt(0) }}
              </div>
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="font-707 font-medium text-[12px] uppercase tracking-wider text-black truncate">{{ user.name }}</span>
                <span class="font-mono text-[11px] text-[#737373] truncate">{{ user.email }}</span>
              </div>
            </div>

            <!-- Role Badge -->
            <div class="w-[150px] shrink-0">
              <span 
                v-if="user.role === 'superadmin'" 
                class="border-[0.5px] border-[#7e2c32]/40 text-[#7e2c32] rounded-none px-2 py-0.5 text-[9.5px] font-707 font-medium uppercase tracking-widest inline-block"
              >
                SUPERADMIN
              </span>
              <span 
                v-else-if="user.role === 'editor'" 
                class="border-[0.5px] border-black/30 text-black rounded-none px-2 py-0.5 text-[9.5px] font-707 font-medium uppercase tracking-widest inline-block"
              >
                BRAND DESIGNER
              </span>
              <span 
                v-else 
                class="border-[0.5px] border-neutral-300 text-neutral-500 rounded-none px-2 py-0.5 text-[9.5px] font-707 uppercase tracking-widest inline-block"
              >
                REVIEWER
              </span>
            </div>

            <!-- Sign-in Password Management -->
            <div class="flex items-center gap-2 w-[180px] shrink-0">
              <span
                class="px-2 py-0.5 rounded-none bg-black/[0.04] text-[11px] font-mono text-neutral-500 border-[0.5px] border-black/10"
                title="Passwords are stored hashed. Use Reset to issue a new one."
              >
                ••••••••••••
              </span>
              <button 
                @click="openPasswordModal(user)"
                class="font-707 font-medium text-[11px] uppercase tracking-wider text-black hover:opacity-60 cursor-pointer bg-transparent border-none p-0"
              >
                RESET
              </button>
            </div>

            <!-- Assigned Brands -->
            <div class="flex items-center gap-1.5 flex-wrap w-[200px] shrink-0">
              <span 
                v-for="b in user.assignedBrands" 
                :key="b"
                class="px-1.5 py-0.5 rounded-none border-[0.5px] border-black/15 bg-neutral-50 text-[9.5px] text-black font-mono uppercase"
              >
                {{ b }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 w-[130px] shrink-0 text-right">
              <button 
                @click="openEditUserModal(user)"
                class="font-707 font-medium text-[11px] uppercase tracking-wider text-black hover:opacity-60 cursor-pointer bg-transparent border-none p-0"
              >
                EDIT
              </button>
              <button 
                v-if="user.role !== 'superadmin'"
                @click="authStore.removeUser(user.id)"
                class="font-707 font-medium text-[11px] uppercase tracking-wider text-red-600 hover:text-red-800 cursor-pointer bg-transparent border-none p-0"
              >
                REMOVE
              </button>
              <span v-else class="font-707 text-[10px] text-neutral-400 uppercase tracking-wider">PRIMARY</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: PROJECT LISTS / SUBMISSIONS QUEUE -->
      <div v-if="activeTab === 'submissions'" class="flex flex-col gap-[20px] items-start px-[48px] w-full">
        <!-- Projects Header with Filter & Refresh Action -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div class="flex flex-wrap items-center gap-4">
            <p class="font-707 text-[13px] font-medium uppercase tracking-wider text-black">
              Project Submissions [{{ filteredProjects.length }}]
            </p>

            <!-- Project Status Filter Tabs -->
            <div class="flex items-center border-[0.5px] border-black/20 rounded-none divide-x divide-black/20 overflow-hidden">
              <button 
                @click="projectFilter = 'all'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="projectFilter === 'all' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                All ({{ editorStore.projects.length }})
              </button>
              <button 
                @click="projectFilter = 'pending_review'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="projectFilter === 'pending_review' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                Pending ({{ pendingSubmissionsCount }})
              </button>
              <button 
                @click="projectFilter = 'approved'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="projectFilter === 'approved' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                Approved ({{ approvedProjectsCount }})
              </button>
              <button 
                @click="projectFilter = 'draft'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="projectFilter === 'draft' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                Drafts ({{ draftProjectsCount }})
              </button>
            </div>
          </div>

          <!-- Refresh Queue Action -->
          <button 
            @click="editorStore.loadProjects()" 
            class="border-[0.5px] border-black/20 hover:border-black flex items-center justify-center px-3.5 py-1 rounded-none bg-white text-black transition-all cursor-pointer font-707 text-[11px] font-medium uppercase tracking-wider gap-1.5 shrink-0"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        <!-- Project Entries Table -->
        <div class="flex flex-col items-start w-full border-[0.5px] border-black/15 rounded-none overflow-hidden bg-white">
          <!-- Column Headers -->
          <div class="hidden md:flex items-center justify-between px-6 py-2.5 bg-black/[0.02] border-b-[0.5px] border-black/15 text-[10.5px] font-707 font-medium uppercase tracking-widest text-[#737373] w-full">
            <span class="w-[260px]">CAMPAIGN / SLUG</span>
            <span class="w-[150px]">ARCHITECTURE</span>
            <span class="w-[150px] text-center">APPROVAL STATUS</span>
            <span class="w-[120px] text-center">UPDATED</span>
            <span class="w-[260px] text-right">GOVERNANCE ACTIONS</span>
          </div>

          <div 
            v-for="project in filteredProjects" 
            :key="project.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 w-full bg-white hover:bg-neutral-50/70 border-b-[0.5px] border-black/10 last:border-b-0 transition-colors gap-3 md:gap-0"
          >
            <!-- Col 1: Project Title & Brand -->
            <div class="flex flex-col w-[260px] gap-1 shrink-0">
              <span class="font-707 font-medium text-[12px] uppercase tracking-wider text-black truncate">{{ project.title }}</span>
              <span class="font-mono text-[11px] text-[#737373] truncate">/{{ project.brand_slug || 'atmos' }}/{{ project.slug }}</span>
            </div>

            <!-- Col 2: Layout Info -->
            <div class="w-[150px] shrink-0 text-left">
              <span class="font-707 text-[11px] uppercase tracking-wider text-neutral-700 whitespace-nowrap">
                {{ project.pages?.length || 1 }} Pages · {{ project.widget_tree?.length || 0 }} Widgets
              </span>
            </div>

            <!-- Col 3: Centered Status Badge -->
            <div class="w-[150px] shrink-0 flex items-center justify-center text-center">
              <span 
                v-if="reviewState(project) === 'pending_review'"
                class="border-[0.5px] border-[#7e2c32]/40 text-[#7e2c32] rounded-none px-2 py-0.5 text-[9.5px] font-707 font-medium uppercase tracking-widest whitespace-nowrap"
              >
                PENDING REVIEW
              </span>
              <span 
                v-else-if="reviewState(project) === 'approved' || reviewState(project) === 'published'"
                class="border-[0.5px] border-emerald-600/40 text-emerald-800 rounded-none px-2 py-0.5 text-[9.5px] font-707 font-medium uppercase tracking-widest whitespace-nowrap"
              >
                LIVE ON STAGE
              </span>
              <span 
                v-else
                class="border-[0.5px] border-neutral-300 text-neutral-600 rounded-none px-2 py-0.5 text-[9.5px] font-707 font-medium uppercase tracking-widest whitespace-nowrap"
              >
                DRAFT
              </span>
            </div>

            <!-- Col 4: Last Updated -->
            <div class="w-[120px] shrink-0 text-center">
              <span class="font-707 text-[11px] uppercase tracking-wider text-[#737373] whitespace-nowrap">
                {{ editorStore.formatRelativeTime(project.updated_at) }}
              </span>
            </div>

            <!-- Col 5: Review Actions -->
            <div class="flex items-center gap-2 justify-end shrink-0 min-w-[260px]">
              <button 
                @click="handlePreviewProject(project.id)"
                class="border-[0.5px] border-black/30 hover:border-black px-2.5 py-1 rounded-none text-[10.5px] font-707 font-medium uppercase tracking-wider text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                title="Inspect in live designer canvas"
              >
                INSPECT
              </button>

              <button 
                @click="handleApproveProject(project.id)"
                class="bg-black text-white px-3 py-1 rounded-none text-[10.5px] font-707 font-medium uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1 border-none"
                :class="!canPublish(project) ? 'opacity-40 cursor-default hover:bg-black' : ''"
                :disabled="!canPublish(project)"
                :title="!canPublish(project) ? 'Live — nothing new to publish' : (isLiveProject(project) ? 'Publish the submitted update' : 'Approve and publish')"
              >
                <CheckCircle class="w-3 h-3" />
                <span>{{ !canPublish(project) ? 'LIVE' : (isLiveProject(project) ? 'PUBLISH UPDATE' : 'APPROVE') }}</span>
              </button>

              <button 
                v-if="isAwaitingReview(project)"
                @click="handleDeclineProject(project.id)"
                class="border-[0.5px] border-black/20 text-neutral-700 hover:border-black hover:text-black px-2.5 py-1 rounded-none text-[10.5px] font-707 font-medium uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                title="Send the submission back to the brand with a note"
              >
                <XCircle class="w-3 h-3" />
                <span>DECLINE</span>
              </button>

              <button 
                @click="handleDeleteProject(project)"
                class="border-[0.5px] border-red-300 text-red-600 hover:bg-red-600 hover:text-white px-2.5 py-1 rounded-none text-[10.5px] font-707 font-medium uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                title="Delete project permanently from cloud server"
              >
                <Trash2 class="w-3 h-3" />
                <span>DELETE</span>
              </button>
            </div>
          </div>

          <div v-if="!filteredProjects.length" class="p-8 text-center text-neutral-400 font-707 uppercase tracking-wider text-[12px] w-full">
            No project submissions found for this filter.
          </div>
        </div>
      </div>

      <!-- Media library maintenance (shown under Brands) -->
      <div v-if="activeTab === 'brands'" class="px-[48px] w-full">
        <div class="w-full rounded-none border-[0.5px] border-red-300 bg-neutral-50/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-707">
          <div class="flex flex-col gap-1 max-w-[640px]">
            <p class="font-707 text-[12px] font-medium uppercase tracking-wider text-black">MEDIA ASSET REPOSITORY</p>
            <p class="font-707 text-[12px] leading-relaxed text-neutral-600">
              Delete every asset in every brand's library, files included. Campaigns still displaying one of these images will lose them.
              Brands manage their own active library directly from the editor media gallery.
            </p>
          </div>
          <button
            type="button"
            :disabled="isPurgingMedia"
            @click="handlePurgeMedia"
            class="shrink-0 h-[34px] px-4 rounded-none bg-[#7e2c32] hover:bg-[#5f1f24] text-white text-[11px] font-707 font-medium uppercase tracking-wider cursor-pointer disabled:opacity-50 transition-colors border-none"
          >
            {{ isPurgingMedia ? 'PURGING...' : 'DELETE ALL MEDIA' }}
          </button>
        </div>
      </div>

      <!-- TAB 4: TEMPLATES BUILD (Superadmin Template Governance) -->
      <div v-if="activeTab === 'templates'" class="flex flex-col gap-[20px] items-start px-[48px] w-full">
        <!-- Templates Header with Filter & Build Action -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div class="flex flex-wrap items-center gap-4">
            <p class="font-707 text-[13px] font-medium uppercase tracking-wider text-black">
              Template Blueprint Presets [{{ filteredTemplates.length }}]
            </p>

            <!-- Status Filter Tabs -->
            <div class="flex items-center border-[0.5px] border-black/20 rounded-none divide-x divide-black/20 overflow-hidden">
              <button 
                @click="templateFilter = 'all'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="templateFilter === 'all' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                All ({{ brandStore.templates.length }})
              </button>
              <button 
                @click="templateFilter = 'published'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="templateFilter === 'published' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                Published ({{ publishedTemplatesCount }})
              </button>
              <button 
                @click="templateFilter = 'draft'"
                class="px-3 py-1 text-[11px] font-707 uppercase tracking-wider transition-colors cursor-pointer"
                :class="templateFilter === 'draft' ? 'bg-black text-white font-medium' : 'bg-white text-neutral-600 hover:text-black'"
              >
                Drafts ({{ draftTemplatesCount }})
              </button>
            </div>
          </div>

          <button 
            @click="openBuildTemplateModal" 
            class="border-[0.5px] border-black flex items-center justify-center px-4 py-1.5 rounded-none bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[11px] font-medium uppercase tracking-wider text-black gap-1.5 shrink-0"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Build New Template</span>
          </button>
        </div>

        <!-- Template Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div 
            v-for="tpl in filteredTemplates" 
            :key="tpl.id"
            class="border-[0.5px] border-black/15 rounded-none p-5 flex flex-col justify-between gap-4 bg-white hover:border-black transition-colors"
          >
            <!-- Top: Header Info & Badges -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-2">
                  <h3 class="font-707 font-medium text-[13px] uppercase tracking-wider text-black">{{ tpl.name }}</h3>
                  <!-- Category Pill -->
                  <span class="px-1.5 py-0.5 rounded-none border-[0.5px] border-black/20 text-[9.5px] font-707 uppercase tracking-widest text-[#737373] bg-neutral-50">
                    {{ tpl.category || 'custom' }}
                  </span>
                </div>
                <p class="font-707 text-[12px] text-[#737373] leading-relaxed line-clamp-2">{{ tpl.description }}</p>
              </div>

              <!-- Draft / Published Status Badge -->
              <button 
                @click="brandStore.toggleTemplateStatus(tpl.id)"
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[9.5px] font-707 font-medium uppercase tracking-widest border shrink-0 transition-colors cursor-pointer"
                :class="tpl.status === 'published' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'"
                :title="tpl.status === 'published' ? 'Click to unpublish to draft' : 'Click to publish for designers'"
              >
                <span>{{ tpl.status === 'published' ? 'PUBLISHED' : 'DRAFT' }}</span>
              </button>
            </div>

            <!-- Middle Summary -->
            <div class="flex items-center justify-between text-[11px] font-707 uppercase tracking-wider text-[#737373]">
              <span class="flex items-center gap-1">
                <Layers class="w-3.5 h-3.5 text-neutral-400" />
                <span>{{ tpl.widget_tree.length }} Widgets configured</span>
              </span>
              <span>By {{ tpl.created_by || 'Superadmin' }}</span>
            </div>

            <!-- Bottom: Action Bar -->
            <div class="border-t-[0.5px] border-black/10 pt-3.5 flex items-center justify-between gap-3 w-full">
              <div class="flex items-center gap-3.5 flex-wrap">
                <button 
                  @click="openEditTemplateModal(tpl)"
                  class="font-707 font-medium text-[11px] uppercase tracking-wider text-black hover:opacity-60 cursor-pointer bg-transparent border-none p-0 transition-opacity whitespace-nowrap"
                >
                  EDIT DETAILS
                </button>

                <span class="text-neutral-300 text-[11px] select-none leading-none">|</span>

                <button 
                  @click="brandStore.toggleTemplateStatus(tpl.id)"
                  class="font-707 font-medium text-[11px] uppercase tracking-wider text-[#737373] hover:text-black cursor-pointer bg-transparent border-none p-0 transition-colors whitespace-nowrap"
                >
                  {{ tpl.status === 'published' ? 'SET DRAFT' : 'PUBLISH' }}
                </button>

                <span class="text-neutral-300 text-[11px] select-none leading-none">|</span>

                <button 
                  @click="handleRemoveTemplate(tpl)"
                  class="font-707 font-medium text-[11px] uppercase tracking-wider text-red-600 hover:text-red-700 cursor-pointer bg-transparent border-none p-0 transition-colors whitespace-nowrap"
                >
                  REMOVE
                </button>
              </div>

              <button 
                @click="handleEditInStudio(tpl)"
                class="border-[0.5px] border-black px-3 h-[28px] rounded-none text-[10.5px] font-707 font-medium uppercase tracking-wider text-black hover:bg-black hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>OPEN BUILDER</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!filteredTemplates.length" class="p-8 text-center text-neutral-400 font-707 uppercase tracking-wider text-[12px] w-full border-[0.5px] border-dashed border-neutral-300 rounded-none">
          No templates found in this view. Click "Build New Template" to create one.
        </div>
      </div>
    </main>

    <!-- Modal 0: Add Brand Modal (Superadmin) -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAddBrandModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddBrandModal = false"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">Add Brand Account</h3>
            <button @click="showAddBrandModal = false" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <p class="font-707 text-[12px] text-[#737373]">
            Create an official brand account in the 707 cloud ecosystem.
          </p>

          <form @submit.prevent="handleAddBrandSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Brand Name</label>
              <input 
                v-model="newBrandName" 
                type="text" 
                required 
                placeholder="e.g. atmos Indonesia" 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Brand URL Slug</label>
                <input 
                  v-model="newBrandSlug" 
                  type="text" 
                  placeholder="e.g. atmos" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-mono text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Primary Color</label>
                <div class="flex items-center gap-2">
                  <input 
                    v-model="newBrandColor" 
                    type="color" 
                    class="size-[36px] rounded-none border-[0.5px] border-black/20 cursor-pointer bg-transparent p-0.5"
                  />
                  <input 
                    v-model="newBrandColor" 
                    type="text" 
                    class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-mono text-black outline-none focus:bg-white focus:border-black transition-colors"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">
                  Brand Logo / Photo
                </label>
                <span v-if="isUploadingNewLogo" class="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                  <RefreshCw class="w-3 h-3 animate-spin" /> Uploading image...
                </span>
              </div>

              <!-- Hidden device file input -->
              <input 
                ref="newBrandFileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                class="hidden"
                @change="handleNewBrandFileChange"
              />

              <div class="flex items-center gap-3">
                <!-- Thumbnail preview -->
                <div 
                  class="size-[42px] rounded-none overflow-hidden border-[0.5px] border-black/20 shrink-0 bg-black flex items-center justify-center relative group"
                  :style="{ backgroundColor: newBrandColor || '#000000' }"
                >
                  <img 
                    v-if="newBrandLogoUrl" 
                    :src="sizedUrl(newBrandLogoUrl, 320)" 
                    alt="Logo preview" 
                    class="size-full object-cover" 
                    @error="(e: any) => (e.target.style.display = 'none')" 
                  />
                  <span v-else class="text-white font-medium text-sm">
                    {{ (newBrandName || 'B').charAt(0).toUpperCase() }}
                  </span>
                  <button 
                    v-if="newBrandLogoUrl" 
                    type="button" 
                    @click="newBrandLogoUrl = ''" 
                    class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Device upload button & URL fallback toggle -->
                <div class="flex-1 flex flex-col gap-1.5">
                  <div class="flex items-center gap-2">
                    <button 
                      type="button"
                      @click="newBrandFileInputRef?.click()"
                      :disabled="isUploadingNewLogo"
                      class="px-3 h-[32px] rounded-none bg-black text-white hover:bg-neutral-900 text-[11px] font-707 font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors border-none"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      <span>{{ newBrandLogoUrl ? 'Change from Device' : 'Upload from Device' }}</span>
                    </button>
                    <button 
                      v-if="!showNewBrandUrlInput && !newBrandLogoUrl"
                      type="button"
                      @click="showNewBrandUrlInput = true"
                      class="px-2.5 h-[32px] rounded-none border-[0.5px] border-black/20 text-[11px] font-707 uppercase tracking-wider text-neutral-600 hover:text-black hover:border-black transition-colors cursor-pointer bg-white"
                    >
                      Paste link instead
                    </button>
                  </div>

                  <input 
                    v-if="showNewBrandUrlInput || newBrandLogoUrl"
                    v-model="newBrandLogoUrl" 
                    type="text" 
                    placeholder="Or enter image URL (https://...)" 
                    class="w-full h-[30px] px-2.5 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[11px] font-mono text-black outline-none focus:bg-white focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Description</label>
              <textarea 
                v-model="newBrandDesc" 
                rows="2"
                placeholder="Brand specialty, footwear collaboration hub..." 
                class="w-full p-2.5 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black resize-none transition-colors"
              />
            </div>

            <div class="flex items-center justify-end gap-2.5 mt-2">
              <button 
                type="button" 
                @click="showAddBrandModal = false" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Create Brand
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 1: Edit Brand Details & PICs Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showBrandDetailsModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showBrandDetailsModal = false"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[480px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div 
                class="size-8 rounded-none text-white flex items-center justify-center font-707 font-medium text-[13px] overflow-hidden border-[0.5px] border-black/20"
                :style="{ backgroundColor: targetBrand?.primary_color || '#000' }"
              >
                <img 
                  v-if="editBrandLogoUrl || targetBrand?.logo_url" 
                  :src="editBrandLogoUrl || targetBrand?.logo_url" 
                  alt="Logo" 
                  class="size-full object-cover" 
                  @error="(e: any) => (e.target.style.display = 'none')"
                />
                <span v-else>{{ targetBrand?.name.charAt(0) }}</span>
              </div>
              <div>
                <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">{{ targetBrand?.name }}</h3>
                <p class="font-707 text-[11px] text-neutral-500 font-mono">events.707.co.id/{{ targetBrand?.slug }}</p>
              </div>
            </div>
            <button @click="showBrandDetailsModal = false" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleSaveBrandDetails" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Brand Name</label>
              <input 
                v-model="editBrandName" 
                type="text" 
                required 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">
                  Brand Logo / Photo
                </label>
                <span v-if="isUploadingEditLogo" class="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                  <RefreshCw class="w-3 h-3 animate-spin" /> Uploading image...
                </span>
              </div>

              <!-- Hidden device file input -->
              <input 
                ref="editBrandFileInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                class="hidden"
                @change="handleEditBrandFileChange"
              />

              <div class="flex items-center gap-3">
                <!-- Thumbnail preview -->
                <div 
                  class="size-[42px] rounded-none overflow-hidden border-[0.5px] border-black/20 shrink-0 bg-black flex items-center justify-center relative group"
                  :style="{ backgroundColor: targetBrand?.primary_color || '#000000' }"
                >
                  <img 
                    v-if="editBrandLogoUrl || targetBrand?.logo_url" 
                    :src="sizedUrl(editBrandLogoUrl || targetBrand?.logo_url || '', 320)" 
                    alt="Logo preview" 
                    class="size-full object-cover" 
                    @error="(e: any) => (e.target.style.display = 'none')" 
                  />
                  <span v-else class="text-white font-medium text-sm">
                    {{ (editBrandName || targetBrand?.name || 'B').charAt(0).toUpperCase() }}
                  </span>
                  <button 
                    v-if="editBrandLogoUrl || targetBrand?.logo_url" 
                    type="button" 
                    @click="editBrandLogoUrl = ''; if (targetBrand) targetBrand.logo_url = ''" 
                    class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <!-- Device upload button & URL fallback toggle -->
                <div class="flex-1 flex flex-col gap-1.5">
                  <div class="flex items-center gap-2">
                    <button 
                      type="button"
                      @click="editBrandFileInputRef?.click()"
                      :disabled="isUploadingEditLogo"
                      class="px-3 h-[32px] rounded-none bg-black text-white hover:bg-neutral-900 text-[11px] font-707 font-medium uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors border-none"
                    >
                      <Upload class="w-3.5 h-3.5" />
                      <span>{{ (editBrandLogoUrl || targetBrand?.logo_url) ? 'Change from Device' : 'Upload from Device' }}</span>
                    </button>
                    <button 
                      v-if="!showEditBrandUrlInput && !editBrandLogoUrl && !targetBrand?.logo_url"
                      type="button"
                      @click="showEditBrandUrlInput = true"
                      class="px-2.5 h-[32px] rounded-none border-[0.5px] border-black/20 text-[11px] font-707 uppercase tracking-wider text-neutral-600 hover:text-black hover:border-black transition-colors cursor-pointer bg-white"
                    >
                      Paste link instead
                    </button>
                  </div>

                  <input 
                    v-if="showEditBrandUrlInput || editBrandLogoUrl || targetBrand?.logo_url"
                    v-model="editBrandLogoUrl" 
                    type="text" 
                    placeholder="Or enter image URL (https://...)" 
                    class="w-full h-[30px] px-2.5 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[11px] font-mono text-black outline-none focus:bg-white focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Description</label>
              <textarea 
                v-model="editBrandDesc" 
                rows="2"
                class="w-full p-2.5 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black resize-none transition-colors"
              />
            </div>

            <!-- Assigned PICs for this brand -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">
                  Assigned PICs ({{ currentBrandPics.length }})
                </label>
                <button 
                  type="button"
                  @click="openAssignPicModal(targetBrand?.slug || '', targetBrand?.name || '')"
                  class="text-[11px] font-707 font-medium text-black underline cursor-pointer"
                >
                  + Add PIC
                </button>
              </div>

              <div class="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                <div 
                  v-for="pic in currentBrandPics" 
                  :key="pic.id"
                  class="flex items-center justify-between bg-neutral-50 px-3 py-1.5 rounded-none border-[0.5px] border-black/10 text-[12px]"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-black">{{ pic.name }}</span>
                    <span class="text-neutral-400 font-mono text-[11px]">({{ pic.email }})</span>
                  </div>
                  <button 
                    v-if="pic.role !== 'superadmin'"
                    type="button" 
                    @click="authStore.unassignBrandPic(targetBrand?.slug || '', pic.id)"
                    class="text-neutral-400 hover:text-red-600 font-medium"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 mt-2">
              <button 
                type="button" 
                @click="showBrandDetailsModal = false" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Save Details
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 2: Add Team Member Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAddUserModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddUserModal = false"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">Create Team Member Account</h3>
            <button @click="showAddUserModal = false" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleAddUserSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Full Name</label>
              <input 
                v-model="newUserName" 
                type="text" 
                required 
                placeholder="e.g. Maya Chen" 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Email Address</label>
                <input 
                  v-model="newUserEmail" 
                  type="email" 
                  required 
                  placeholder="maya@atmos.co.id" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Phone Number</label>
                <input 
                  v-model="newUserPhone" 
                  type="tel" 
                  placeholder="+62 812..." 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Sign-in Password</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="newUserPassword" 
                  type="text" 
                  required 
                  placeholder="Set initial password" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-mono text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
                <button 
                  type="button" 
                  @click="generateRandomPassword"
                  class="px-3 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer bg-white transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Access Role</label>
                <select 
                  v-model="newUserRole" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option value="editor">Brand Designer / Editor</option>
                  <option value="viewer">Viewer / Reviewer</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Primary Assigned Brand</label>
                <select 
                  v-model="newUserBrand" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
                  <option value="all">All Brands (Master)</option>
                </select>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showAddUserModal = false" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 2B: Edit Team Member Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showEditUserModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showEditUserModal = false"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">Edit Registered Team Member</h3>
            <button @click="showEditUserModal = false" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleSaveEditUserSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Full Name</label>
              <input 
                v-model="editUserName" 
                type="text" 
                required 
                placeholder="e.g. Maya Chen" 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Email Address</label>
                <input 
                  v-model="editUserEmail" 
                  type="email" 
                  required 
                  placeholder="maya@atmos.co.id" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Phone Number</label>
                <input 
                  v-model="editUserPhone" 
                  type="tel" 
                  placeholder="+62 812..." 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Sign-in Password / PIN</label>
              <input 
                v-model="editUserPassword" 
                type="text" 
                placeholder="Leave blank to keep the current password" 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-mono text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Access Role</label>
                <select 
                  v-model="editUserRole" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option value="editor">Brand Designer / Editor</option>
                  <option value="viewer">Viewer / Reviewer</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Primary Assigned Brand</label>
                <select 
                  v-model="editUserBrand" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
                  <option value="all">All Brands (Master)</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Account Status</label>
              <select 
                v-model="editUserStatus" 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showEditUserModal = false" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 3: Reset Password Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showPasswordModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="closePasswordModal"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[400px] shadow-xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">Reset Sign-in Password</h3>
            <button @click="closePasswordModal" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <p class="font-707 text-[12px] text-[#737373]">
            Resetting password for <strong>{{ targetUserForPassword?.name }}</strong> ({{ targetUserForPassword?.email }}).
          </p>

          <form v-if="!passwordResetDone" @submit.prevent="handlePasswordUpdateSubmit" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">New Password</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="updatedPasswordValue" 
                  type="text" 
                  required 
                  minlength="8"
                  placeholder="Enter new password" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-mono text-black outline-none focus:bg-white focus:border-black transition-colors"
                />
                <button 
                  type="button" 
                  @click="updatedPasswordValue = secureRandomPassword()"
                  class="px-3 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer bg-white transition-colors"
                >
                  Generate
                </button>
              </div>
              <p class="font-707 text-[11px] text-[#737373]">Passwords are stored hashed. After you confirm, this is the only time it is shown.</p>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="closePasswordModal" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Update Password
              </button>
            </div>
          </form>

          <div v-else class="flex flex-col gap-3">
            <p class="font-707 text-[12px] text-neutral-700">
              Password updated. Share it with {{ targetUserForPassword?.name }} now — it can't be viewed again, only reset.
            </p>
            <div class="flex items-center gap-2">
              <code class="flex-1 h-[36px] px-3 flex items-center rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-mono text-black select-text">{{ updatedPasswordValue }}</code>
              <button 
                type="button" 
                @click="copyResetPassword"
                class="px-3 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider whitespace-nowrap cursor-pointer bg-white transition-colors"
              >
                Copy
              </button>
            </div>
            <div class="flex justify-end mt-2">
              <button 
                type="button" 
                @click="closePasswordModal" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modal 5: Build New Template Modal (Superadmin) -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showBuildTemplateModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showBuildTemplateModal = false"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[500px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">Build Master Activation Template</h3>
            <button @click="showBuildTemplateModal = false" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <p class="font-707 text-[12px] text-[#737373]">
            Configure a reusable layout preset for Brand Designers. You can launch it directly in the editor canvas to customize widgets.
          </p>

          <form @submit.prevent="handleBuildTemplateSubmit(false)" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Template Name</label>
              <input 
                v-model="newTemplateName" 
                type="text" 
                required 
                placeholder="e.g. VIP Secret Drop & Guest E-Pass" 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Category</label>
                <select 
                  v-model="newTemplateCategory" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option value="raffle">Raffle Drop</option>
                  <option value="rsvp">VIP RSVP Pass</option>
                  <option value="hype_drop">Hype Drop Activation</option>
                  <option value="lookbook">Lookbook Showcase</option>
                  <option value="pass">Guest E-Pass</option>
                  <option value="custom">Custom Framework</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Initial Status</label>
                <select 
                  v-model="newTemplateStatus" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option value="draft">Draft (Private Superadmin)</option>
                  <option value="published">Published (Available for Brands)</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Description</label>
              <textarea 
                v-model="newTemplateDesc" 
                rows="2"
                placeholder="Provide guidelines or activation instructions..." 
                class="w-full p-2.5 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black resize-none transition-colors"
              />
            </div>

            <!-- Starter Widget Architecture Base -->
            <div class="flex flex-col gap-1.5">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Starting Architecture</label>
              <div class="grid grid-cols-2 gap-2 text-[12px] font-707">
                <label 
                  class="p-2.5 rounded-none border-[0.5px] cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'blank' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="blank" class="hidden" />
                  <span>Blank Canvas</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Clean slate mobile screen</span>
                </label>

                <label 
                  class="p-2.5 rounded-none border-[0.5px] cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'raffle' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="raffle" class="hidden" />
                  <span>Raffle Drop</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Hero + Timer + Sizing + Terms</span>
                </label>

                <label 
                  class="p-2.5 rounded-none border-[0.5px] cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'rsvp' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="rsvp" class="hidden" />
                  <span>RSVP Pass</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Hero + Pass Form + Venue Map</span>
                </label>

                <label 
                  class="p-2.5 rounded-none border-[0.5px] cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'pass' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="pass" class="hidden" />
                  <span>Guest E-Pass</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Registration + Dynamic Pass</span>
                </label>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2.5 mt-2">
              <button 
                type="button" 
                @click="showBuildTemplateModal = false" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer bg-white"
              >
                Save Preset
              </button>
              <button 
                type="button" 
                @click="handleBuildTemplateSubmit(true)"
                class="bg-black text-white hover:bg-neutral-900 px-4 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5"
              >
                <span>Save & Open Builder</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 6: Edit Template Details Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showEditTemplateModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showEditTemplateModal = false"
      >
        <div class="bg-white rounded-none border-[0.5px] border-black p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[13.5px] uppercase tracking-wider text-black">Edit Template Details</h3>
            <button @click="showEditTemplateModal = false" class="text-neutral-400 hover:text-black text-xl font-medium cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleEditTemplateSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Template Name</label>
              <input 
                v-model="editTemplateName" 
                type="text" 
                required 
                class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Category</label>
                <select 
                  v-model="editTemplateCategory" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option value="raffle">Raffle Drop</option>
                  <option value="rsvp">VIP RSVP Pass</option>
                  <option value="hype_drop">Hype Drop Activation</option>
                  <option value="lookbook">Lookbook Showcase</option>
                  <option value="pass">Guest E-Pass</option>
                  <option value="custom">Custom Framework</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Status</label>
                <select 
                  v-model="editTemplateStatus" 
                  class="w-full h-[36px] px-3 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black transition-colors"
                >
                  <option value="draft">Draft (Work in Progress)</option>
                  <option value="published">Published (Live for Brands)</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[10.5px] font-medium text-[#737373] uppercase tracking-widest">Description</label>
              <textarea 
                v-model="editTemplateDesc" 
                rows="3"
                class="w-full p-2.5 rounded-none bg-neutral-50/50 border-[0.5px] border-black/20 text-[12px] font-707 text-black outline-none focus:bg-white focus:border-black resize-none transition-colors"
              />
            </div>

            <div class="flex items-center justify-end gap-2.5 mt-2">
              <button 
                type="button" 
                @click="showEditTemplateModal = false" 
                class="px-4 h-[36px] rounded-none border-[0.5px] border-black/20 hover:border-black text-black font-707 text-[11px] font-medium uppercase tracking-wider transition-colors bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white hover:bg-neutral-900 px-5 h-[36px] rounded-none font-707 text-[11px] font-medium uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- What's New in Design Studio 1.5 Introduction Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      @close="showWhatsNewModal = false"
    />

    <!-- All Projects / My Activations Modal -->
    <AllProjectsModal
      :is-open="showAllProjectsModal"
      @close="showAllProjectsModal = false"
      @select-project="handleSelectProject"
    />
  </div>
</template>

<script setup lang="ts">
import { fetchServerMedia, fetchMediaUsage, purgeServerMedia, uploadMediaDirectly } from '../services/mediaService.ts';
import { sizedUrl } from '../services/responsiveImage.ts';
import { glassConfirm, glassPrompt } from '../services/glassDialog.ts';
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import AllProjectsModal from '../components/modals/AllProjectsModal.vue';
import { 
  ArrowLeft, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Upload
} from 'lucide-vue-next';
import { useAuthStore, type UserAccount, type UserRole } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { isReservedSlug } from '../constants/reservedSlugs.ts';
import type { Brand, GlobalTemplate, WidgetItem, ProjectItem } from '../types/editor.ts';

const router = useRouter();
const route = useRoute();
const showWhatsNewModal = ref(false);
const showUserProfileModal = ref(false);
const showAllProjectsModal = ref(false);
const authStore = useAuthStore();
const editorStore = useEditorStore();
const brandStore = useBrandStore();

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

function handleAnalytics() {
  showUserProfileModal.value = false;
  router.push('/hub');
}

function handleSignOut() {
  showUserProfileModal.value = false;
  authStore.signOut();
  brandStore.setActiveBrand(null);
  router.push('/');
}

function handleSelectProject(project: ProjectItem) {
  showAllProjectsModal.value = false;
  router.push({ path: '/hub', query: { project: project.id } });
}

const activeTab = ref<'brands' | 'users' | 'submissions' | 'templates'>('brands');

onMounted(() => {
  if (route.query.tab && ['brands', 'users', 'submissions', 'templates'].includes(route.query.tab as string)) {
    activeTab.value = route.query.tab as any;
  }
  if (route.query.action === 'new-template') {
    activeTab.value = 'templates';
    showBuildTemplateModal.value = true;
  }
});

watch(() => route.query, (query) => {
  if (query.tab && ['brands', 'users', 'submissions', 'templates'].includes(query.tab as string)) {
    activeTab.value = query.tab as any;
  }
  if (query.action === 'new-template') {
    activeTab.value = 'templates';
    showBuildTemplateModal.value = true;
  }
}, { deep: true });
const templateFilter = ref<'all' | 'published' | 'draft'>('all');
const projectFilter = ref<'all' | 'pending_review' | 'approved' | 'draft'>('all');

// Modal States
const showAddBrandModal = ref(false);
const showBrandDetailsModal = ref(false);
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const showPasswordModal = ref(false);
const showAssignPicModal = ref(false);
const showBuildTemplateModal = ref(false);
const showEditTemplateModal = ref(false);

// Form States
const targetBrand = ref<Brand | null>(null);
const editBrandName = ref('');
const editBrandLogoUrl = ref('');
const editBrandDesc = ref('');

const newBrandName = ref('');
const newBrandSlug = ref('');
const newBrandColor = ref('#000000');
const newBrandLogoUrl = ref('');
const newBrandDesc = ref('');

// Logo upload refs
const newBrandFileInputRef = ref<HTMLInputElement | null>(null);
const editBrandFileInputRef = ref<HTMLInputElement | null>(null);
const isUploadingNewLogo = ref(false);
const isUploadingEditLogo = ref(false);
const showNewBrandUrlInput = ref(false);
const showEditBrandUrlInput = ref(false);

const newUserName = ref('');
const newUserEmail = ref('');
const newUserPhone = ref('');
const newUserPassword = ref('atmos_pass_2026');
const newUserRole = ref<UserRole>('editor');
const newUserBrand = ref('atmos');

/** Door-security accounts belong to a campaign and are managed in its Campaign Hub, so they are not listed here. */
const teamUsers = computed(() => authStore.users.filter(u => u.role !== 'gate'));

const targetUserForEdit = ref<UserAccount | null>(null);
const editUserName = ref('');
const editUserEmail = ref('');
const editUserPhone = ref('');
const editUserPassword = ref('');
const editUserRole = ref<UserRole>('editor');
const editUserBrand = ref('all');
const editUserStatus = ref<'active' | 'pending' | 'suspended'>('active');

const targetUserForPassword = ref<UserAccount | null>(null);
const updatedPasswordValue = ref('');
const passwordResetDone = ref(false);

const targetBrandSlug = ref('');
const targetBrandName = ref('');
const selectedPicUserId = ref('');

// Template Form States
const newTemplateName = ref('');
const newTemplateCategory = ref<'raffle' | 'rsvp' | 'hype_drop' | 'lookbook' | 'pass' | 'custom'>('raffle');
const newTemplateStatus = ref<'published' | 'draft'>('draft');
const newTemplateDesc = ref('');
const starterPresetBase = ref<'blank' | 'raffle' | 'rsvp' | 'pass'>('raffle');

const targetTemplateForEdit = ref<GlobalTemplate | null>(null);
const editTemplateName = ref('');
const editTemplateCategory = ref<'raffle' | 'rsvp' | 'hype_drop' | 'lookbook' | 'pass' | 'custom'>('raffle');
const editTemplateStatus = ref<'published' | 'draft'>('published');
const editTemplateDesc = ref('');


/** Waiting for the superadmin: a first submission, or an update to a live campaign. */
function isAwaitingReview(p: ProjectItem): boolean {
  return p.status === 'pending_review' || Boolean(p.pending_update_at);
}

function isLiveProject(p: ProjectItem): boolean {
  return Number(p.live_version || 0) > 0 || p.status === 'approved' || p.status === 'published';
}

function canPublish(p: ProjectItem): boolean {
  return !isLiveProject(p) || Boolean(p.has_unpublished_changes);
}

function reviewState(p: ProjectItem): string {
  return isAwaitingReview(p) ? 'pending_review' : p.status;
}

function formatProjectStatus(p: ProjectItem): string {
  const version = p.live_version ? ` v${p.live_version}` : '';
  if (isLiveProject(p) && p.pending_update_at) return `Live${version} · Update Pending`;
  if (isLiveProject(p) && p.has_unpublished_changes) return `Live${version} · Unsubmitted Edits`;
  if (isLiveProject(p)) return `Live${version}`;
  return formatStatusLabel(p.status);
}

const pendingSubmissionsCount = computed(() => {
  return editorStore.projects.filter(isAwaitingReview).length;
});

const approvedProjectsCount = computed(() => {
  return editorStore.projects.filter(p => p.status === 'approved').length;
});

const draftProjectsCount = computed(() => {
  return editorStore.projects.filter(p => p.status === 'draft' || !p.status).length;
});

const filteredProjects = computed(() => {
  if (projectFilter.value === 'pending_review') {
    return editorStore.projects.filter(isAwaitingReview);
  }
  if (projectFilter.value === 'approved') {
    return editorStore.projects.filter(p => p.status === 'approved');
  }
  if (projectFilter.value === 'draft') {
    return editorStore.projects.filter(p => p.status === 'draft' || !p.status);
  }
  return editorStore.projects;
});

const currentBrandPics = computed(() => {
  if (!targetBrand.value) return [];
  return authStore.getBrandPics(targetBrand.value.slug);
});

const publishedTemplatesCount = computed(() => {
  return brandStore.templates.filter(t => t.status === 'published').length;
});

const draftTemplatesCount = computed(() => {
  return brandStore.templates.filter(t => t.status === 'draft').length;
});

const filteredTemplates = computed(() => {
  if (templateFilter.value === 'published') {
    return brandStore.templates.filter(t => t.status === 'published');
  }
  if (templateFilter.value === 'draft') {
    return brandStore.templates.filter(t => t.status === 'draft');
  }
  return brandStore.templates;
});

function getBrandPics(brandSlug: string): UserAccount[] {
  return authStore.getBrandPics(brandSlug);
}

function getBrandDropsCount(brandSlug: string): number {
  return editorStore.projects.filter(p => p.brand_slug === brandSlug).length;
}

function getBrandLastActivity(brandSlug: string): string {
  const brandProjects = editorStore.projects.filter(p => p.brand_slug === brandSlug);
  if (brandProjects.length > 0 && brandProjects[0].updated_at) {
    return editorStore.formatRelativeTime(brandProjects[0].updated_at);
  }
  return '2 days ago';
}

/** 12 characters from a crypto source; no look-alikes (0/O, 1/l/I) so it survives being read out loud. */
function secureRandomPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, b => alphabet[b % alphabet.length]).join('');
}

function generateRandomPassword() {
  newUserPassword.value = secureRandomPassword();
}

async function handleNewBrandFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploadingNewLogo.value = true;
  try {
    const reader = new FileReader();
    reader.onload = async (uploadEvt) => {
      const dataUrl = uploadEvt.target?.result as string;
      if (dataUrl) {
        try {
          const brandSlug = newBrandSlug.value.trim() || newBrandName.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const saved = await uploadMediaDirectly({
            dataUrl,
            title: newBrandName.value.trim() || 'Brand Logo',
            category: 'Logo',
            filename: file.name
          });
          newBrandLogoUrl.value = saved.url;
          editorStore.showToast(`Logo uploaded for ${newBrandName.value || 'new brand'}.`);
        } catch (err: any) {
          editorStore.showToast(err?.message || 'Could not upload image.');
        } finally {
          isUploadingNewLogo.value = false;
        }
      }
    };
    reader.readAsDataURL(file);
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Failed to read file.');
    isUploadingNewLogo.value = false;
  } finally {
    input.value = '';
  }
}

async function handleEditBrandFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  isUploadingEditLogo.value = true;
  try {
    const reader = new FileReader();
    reader.onload = async (uploadEvt) => {
      const dataUrl = uploadEvt.target?.result as string;
      if (dataUrl) {
        try {
          const saved = await uploadMediaDirectly({
            dataUrl,
            title: editBrandName.value.trim() || targetBrand.value?.name || 'Brand Logo',
            category: 'Logo',
            filename: file.name
          });
          editBrandLogoUrl.value = saved.url;
          if (targetBrand.value) {
            targetBrand.value.logo_url = saved.url;
          }
          editorStore.showToast(`Logo uploaded for ${editBrandName.value || 'brand'}.`);
        } catch (err: any) {
          editorStore.showToast(err?.message || 'Could not upload image.');
        } finally {
          isUploadingEditLogo.value = false;
        }
      }
    };
    reader.readAsDataURL(file);
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Failed to read file.');
    isUploadingEditLogo.value = false;
  } finally {
    input.value = '';
  }
}

async function handleAddBrandSubmit() {
  if (!newBrandName.value.trim()) return;
  const slug = newBrandSlug.value.trim() || newBrandName.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (isReservedSlug(slug)) {
    editorStore.showToast(`"${slug}" is used by the studio's own pages — choose another brand slug.`);
    return;
  }
  try {
    await brandStore.addBrand({
      name: newBrandName.value.trim(),
      slug,
      primary_color: newBrandColor.value || '#000000',
      logo_url: newBrandLogoUrl.value.trim(),
      description: newBrandDesc.value.trim()
    });
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not add this brand.');
    return;
  }
  editorStore.showToast(`Brand "${newBrandName.value}" added successfully.`);
  newBrandName.value = '';
  newBrandSlug.value = '';
  newBrandColor.value = '#000000';
  newBrandLogoUrl.value = '';
  newBrandDesc.value = '';
  showNewBrandUrlInput.value = false;
  showAddBrandModal.value = false;
}

function openBrandDetailsModal(brand: Brand) {
  targetBrand.value = brand;
  editBrandName.value = brand.name;
  editBrandLogoUrl.value = brand.logo_url || '';
  editBrandDesc.value = brand.description || '';
  showEditBrandUrlInput.value = false;
  showBrandDetailsModal.value = true;
}

async function handleSaveBrandDetails() {
  if (targetBrand.value) {
    try {
      await brandStore.updateBrand(targetBrand.value.id, {
        name: editBrandName.value,
        logo_url: editBrandLogoUrl.value.trim(),
        description: editBrandDesc.value
      });
      editorStore.showToast(`Updated details for ${editBrandName.value}.`);
      showBrandDetailsModal.value = false;
    } catch (err: any) {
      editorStore.showToast(err?.message || 'Could not update this brand.');
    }
  }
}

function openEditUserModal(user: UserAccount) {
  targetUserForEdit.value = user;
  editUserName.value = user.name;
  editUserEmail.value = user.email;
  editUserPhone.value = user.phone || '';
  editUserPassword.value = '';
  editUserRole.value = user.role;
  editUserBrand.value = user.assignedBrands?.[0] || 'all';
  editUserStatus.value = user.status || 'active';
  showEditUserModal.value = true;
}

async function handleSaveEditUserSubmit() {
  if (!targetUserForEdit.value) return;
  if (!editUserName.value.trim() || !editUserEmail.value.trim()) return;

  const updates: Partial<UserAccount> = {
    name: editUserName.value.trim(),
    email: editUserEmail.value.trim(),
    phone: editUserPhone.value.trim(),
    role: editUserRole.value,
    assignedBrands: [editUserBrand.value],
    status: editUserStatus.value
  };

  if (editUserPassword.value.trim()) {
    updates.password = editUserPassword.value.trim();
  }

  await authStore.updateUser(targetUserForEdit.value.id, updates);
  editorStore.showToast(`Updated team member "${editUserName.value}".`);
  showEditUserModal.value = false;
}

async function handleRemoveBrand(brand: Brand) {
  if (await glassConfirm({ title: 'Remove brand?', message: `"${brand.name}" is removed from the brand directory.`, confirmLabel: 'Remove', danger: true })) {
    try {
      await brandStore.removeBrand(brand.id);
      editorStore.showToast(`Brand "${brand.name}" removed from ecosystem.`);
    } catch (err: any) {
      editorStore.showToast(err?.message || 'Could not remove this brand.');
    }
  }
}

function openPasswordModal(user: UserAccount) {
  targetUserForPassword.value = user;
  updatedPasswordValue.value = secureRandomPassword();
  passwordResetDone.value = false;
  showPasswordModal.value = true;
}

async function handlePasswordUpdateSubmit() {
  if (!targetUserForPassword.value || !updatedPasswordValue.value) return;
  const ok = await authStore.updateUserPassword(targetUserForPassword.value.id, updatedPasswordValue.value);
  if (!ok) {
    editorStore.showToast(`Could not reset the password for ${targetUserForPassword.value.name}. Try again.`);
    return;
  }
  // The new password is shown once, here; it is stored hashed and can't be looked up later.
  passwordResetDone.value = true;
}

async function copyResetPassword() {
  try {
    await navigator.clipboard.writeText(updatedPasswordValue.value);
    editorStore.showToast('Password copied.');
  } catch {
    editorStore.showToast('Could not copy — select the password and copy it manually.');
  }
}

function closePasswordModal() {
  showPasswordModal.value = false;
  passwordResetDone.value = false;
  updatedPasswordValue.value = '';
}


function openAssignPicModal(brandSlug: string, brandName: string) {
  targetBrandSlug.value = brandSlug;
  targetBrandName.value = brandName;
  selectedPicUserId.value = authStore.users[0]?.id || '';
  showAssignPicModal.value = true;
}

function handleAssignPicSubmit() {
  if (targetBrandSlug.value && selectedPicUserId.value) {
    authStore.assignBrandPic(targetBrandSlug.value, selectedPicUserId.value);
    editorStore.showToast(`PIC assigned to ${targetBrandName.value}.`);
    showAssignPicModal.value = false;
  }
}

function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case 'approved':
    case 'published':
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    case 'pending_review':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-300';
  }
}

function getStatusDotClass(status?: string): string {
  switch (status) {
    case 'approved':
    case 'published':
      return 'bg-emerald-500 animate-pulse';
    case 'pending_review':
      return 'bg-amber-500 animate-ping';
    default:
      return 'bg-neutral-400';
  }
}

function formatStatusLabel(status?: string): string {
  switch (status) {
    case 'approved': return 'Approved / Live';
    case 'pending_review': return 'Pending Review';
    default: return 'Draft';
  }
}

function handlePreviewProject(projectId: string) {
  editorStore.openProjectById(projectId);
  router.push('/editor');
}


async function handleApproveProject(projectId: string) {
  const p = editorStore.projects.find(proj => proj.id === projectId);
  if (!p || !(await glassConfirm({ title: isLiveProject(p) ? 'Publish update?' : 'Approve & publish?', message: isLiveProject(p) ? `Visitors of "${p.title}" will see the update immediately.` : `"${p.title}" becomes public immediately.`, confirmLabel: 'Publish' }))) return;
  const res = await editorStore.transitionProject(projectId, 'publish');
  editorStore.showToast(res.ok ? `Published "${p.title}".` : `Could not publish: ${res.error}`);
}

async function handleDeclineProject(projectId: string) {
  const p = editorStore.projects.find(proj => proj.id === projectId);
  const note = await glassPrompt({ title: 'Request changes', message: `Tell the brand what to change in "${p?.title || 'this project'}". They get this note with the request.`, placeholder: 'e.g. Use the high-res logo and fix the venue time', confirmLabel: 'Send back' });
  if (note === null) return;
  const res = await editorStore.transitionProject(projectId, 'decline', note);
  editorStore.showToast(res.ok ? `Sent "${p?.title || 'Drop'}" back to the brand.` : `Could not send back: ${res.error}`);
}

async function handleDeleteProject(project: ProjectItem) {
  if (await glassConfirm({ title: 'Delete project?', message: `"${project.title}" is permanently deleted from the cloud database.`, confirmLabel: 'Delete', danger: true })) {
    await editorStore.deleteProject(project.id);
    editorStore.showToast(`Deleted "${project.title}".`);
  }
}

function handleRejectProject(projectId: string) {
  return handleDeclineProject(projectId);
}

function handleUseTemplate(template: GlobalTemplate) {
  editorStore.createNewProject(`Drop - ${template.name}`, undefined, template.widget_tree);
  router.push('/editor');
}

function openBuildTemplateModal() {
  newTemplateName.value = '';
  newTemplateCategory.value = 'raffle';
  newTemplateStatus.value = 'draft';
  newTemplateDesc.value = '';
  starterPresetBase.value = 'raffle';
  showBuildTemplateModal.value = true;
}

function getStarterWidgets(base: string): WidgetItem[] {
  if (base === 'blank') {
    return [];
  }
  if (base === 'rsvp') {
    const existing = brandStore.templates.find(t => t.slug === 'vip-brand-event-rsvp');
    return existing ? JSON.parse(JSON.stringify(existing.widget_tree)) : [];
  }
  if (base === 'pass') {
    return [
      {
        id: `hero_${Date.now()}`,
        type: 'HeroDrop',
        props: {
          title: 'EXCLUSIVE VIP PASS',
          subtitle: 'LIMITED INVITATION ONLY',
          badge: 'DIGITAL PASS',
          imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80'
        }
      },
      {
        id: `form_${Date.now()}`,
        type: 'RegistrationForm',
        props: {
          title: 'GUEST REGISTRATION',
          buttonText: 'GET MY ACCESS PASS'
        }
      },
      {
        id: `pass_${Date.now()}`,
        type: 'GuestEPass',
        props: {
          eventName: '707 VIP ACTIVATION',
          badgeLabel: 'PRIORITY VIP'
        }
      }
    ];
  }
  const defaultRaffle = brandStore.templates.find(t => t.slug === 'hype-sneaker-raffle-std');
  return defaultRaffle ? JSON.parse(JSON.stringify(defaultRaffle.widget_tree)) : [];
}

function handleBuildTemplateSubmit(openInStudio = false) {
  if (!newTemplateName.value) return;

  const generatedWidgets = getStarterWidgets(starterPresetBase.value);
  const newTpl: GlobalTemplate = {
    id: `tpl-${Date.now()}`,
    name: newTemplateName.value,
    slug: newTemplateName.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: newTemplateCategory.value,
    status: newTemplateStatus.value,
    description: newTemplateDesc.value || 'Master preset configured by Superadmin.',
    widget_tree: generatedWidgets,
    is_global_preset: true,
    created_by: 'Superadmin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  brandStore.addTemplate(newTpl);
  showBuildTemplateModal.value = false;
  editorStore.showToast(`Template "${newTpl.name}" created (${newTpl.status}).`);

  if (openInStudio) {
    handleEditInStudio(newTpl);
  }
}

function openEditTemplateModal(tpl: GlobalTemplate) {
  targetTemplateForEdit.value = tpl;
  editTemplateName.value = tpl.name;
  editTemplateCategory.value = tpl.category;
  editTemplateStatus.value = tpl.status || 'published';
  editTemplateDesc.value = tpl.description || '';
  showEditTemplateModal.value = true;
}

function handleEditTemplateSubmit() {
  if (targetTemplateForEdit.value) {
    brandStore.updateTemplate(targetTemplateForEdit.value.id, {
      name: editTemplateName.value,
      category: editTemplateCategory.value,
      status: editTemplateStatus.value,
      description: editTemplateDesc.value
    });
    editorStore.showToast(`Updated "${editTemplateName.value}".`);
    showEditTemplateModal.value = false;
  }
}

const isPurgingMedia = ref(false);

async function handlePurgeMedia() {
  const library = await fetchServerMedia();
  const inUse = await fetchMediaUsage();
  if (!library.length) {
    editorStore.showToast('The media library is already empty.');
    return;
  }
  const ok = await glassConfirm({
    title: `Delete all ${library.length} assets?`,
    message: inUse.size
      ? `${inUse.size} of them are used in campaigns — those campaigns will show an empty space where the image was. This cannot be undone.`
      : 'None of them is used in a campaign. This cannot be undone.',
    confirmLabel: 'Delete everything',
    danger: true
  });
  if (!ok) return;
  isPurgingMedia.value = true;
  try {
    const removed = await purgeServerMedia();
    editorStore.showToast(`Deleted ${removed} assets from the media library.`);
  } catch (err: any) {
    editorStore.showToast(`Could not delete: ${err?.message || 'network error'}`);
  } finally {
    isPurgingMedia.value = false;
  }
}

async function handleRemoveTemplate(tpl: GlobalTemplate) {
  if (await glassConfirm({ title: 'Remove template?', message: `"${tpl.name}" is removed from presets.`, confirmLabel: 'Remove', danger: true })) {
    brandStore.removeTemplate(tpl.id);
    editorStore.showToast(`Template "${tpl.name}" removed.`);
  }
}

function handleEditInStudio(tpl: GlobalTemplate) {
  editorStore.openTemplateInStudio(tpl);
  editorStore.showToast(`Loaded "${tpl.name}" in Template Studio.`);
  router.push(`/editor/template/${encodeURIComponent(tpl.id)}`);
}

function handleAddUserSubmit() {
  if (!newUserName.value || !newUserEmail.value) return;

  authStore.addUser({
    name: newUserName.value,
    email: newUserEmail.value,
    phone: newUserPhone.value,
    password: newUserPassword.value,
    role: newUserRole.value,
    assignedBrands: [newUserBrand.value],
    status: 'active'
  });

  newUserName.value = '';
  newUserEmail.value = '';
  newUserPhone.value = '';
  showAddUserModal.value = false;
  editorStore.showToast('New team member account created.');
}

function handleExitAdmin() {
  authStore.exitSuperAdmin();
  router.push('/');
}
</script>
