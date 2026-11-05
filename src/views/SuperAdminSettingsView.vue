<template>
  <div class="h-full w-full bg-white text-black font-sans font-light tracking-normal flex flex-col overflow-y-auto overflow-x-hidden hub-root" data-name="Superadmin Directory">
    <!-- Top 48px Header (Campaign Hub Standard) -->
    <header class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between border-b border-black/10 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-40 select-none">
      <div class="flex items-center gap-[12px] h-[24px]">
        <!-- 707 Logo + 1.5 Badge -->
        <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
          <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
        </router-link>
        <button 
          type="button"
          @click="showWhatsNewModal = true"
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white hover:bg-neutral-50 border-[0.5px] border-black/10 hover:border-black/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-[10.5px] font-sans font-medium text-black leading-none whitespace-nowrap cursor-pointer transition-all apple-press"
          title="What's New in Design Studio 1.5"
        >
          1.5
        </button>

        <div class="w-px h-4 bg-black/15 mx-0.5" />

        <div class="flex items-center gap-2">
          <span class="size-1.5 rounded-full bg-oxblood-600 shrink-0" />
          <span class="text-[13px] font-medium text-black">Superadmin Directory</span>
        </div>
      </div>

      <!-- Right Actions: Studio Link & Exit Admin -->
      <div class="flex items-center gap-2 md:gap-2.5">
        <router-link 
          to="/" 
          class="flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 hover:text-black transition-colors apple-press"
          title="Return to 707 Studio"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Back to Studio</span>
        </router-link>

        <button 
          type="button"
          @click="handleExitAdmin"
          class="flex items-center gap-1.5 h-[32px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 transition-colors apple-press cursor-pointer border-none"
          title="Exit Superadmin Mode"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>

        <div class="w-px h-4 bg-black/10 mx-0.5" />

        <!-- Profile Avatar Container with Anchored UserProfileModal -->
        <div class="relative flex items-center">
          <button 
            type="button"
            @click="showUserProfileModal = !showUserProfileModal"
            class="relative size-[28px] rounded-full border-[0.5px] border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors duration-200 cursor-pointer shadow-xs apple-press group"
            title="User Profile"
          >
            <div 
              class="relative size-full rounded-full bg-black text-white flex items-center justify-center font-sans text-[10px] font-medium tracking-tight select-none"
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

    <!-- 1. Workspace Navigation (Sticky beneath 48px header - Campaign Hub Standard) -->
    <div id="superadmin-workspace-nav" class="sticky top-[48px] z-30 bg-white/95 backdrop-blur-md border-b border-black/10 w-full select-none">
      <nav class="flex gap-[28px] md:gap-[44px] items-center px-[24px] w-full whitespace-nowrap overflow-x-auto no-scrollbar py-2.5 font-sans tracking-normal" aria-label="Superadmin directory sections">
        <button 
          type="button"
          @click="activeTab = 'brands'"
          class="bg-transparent border-none p-0 cursor-pointer font-sans text-[14.5px] md:text-[15.5px] leading-[22px] transition-colors flex items-center gap-2 outline-none"
          :class="activeTab === 'brands' ? 'font-medium underline decoration-solid underline-offset-[10px] text-black' : 'font-light text-neutral-500 hover:text-black'"
        >
          Brands and PIC's
          <span class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 no-underline tabular-nums">{{ brandStore.brands.length }}</span>
        </button>

        <button 
          type="button"
          @click="activeTab = 'users'"
          class="bg-transparent border-none p-0 cursor-pointer font-sans text-[14.5px] md:text-[15.5px] leading-[22px] transition-colors flex items-center gap-2 outline-none"
          :class="activeTab === 'users' ? 'font-medium underline decoration-solid underline-offset-[10px] text-black' : 'font-light text-neutral-500 hover:text-black'"
        >
          Team Accounts
          <span class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 no-underline tabular-nums">{{ teamUsers.length }}</span>
        </button>

        <button 
          type="button"
          @click="activeTab = 'submissions'"
          class="bg-transparent border-none p-0 cursor-pointer font-sans text-[14.5px] md:text-[15.5px] leading-[22px] transition-colors flex items-center gap-2 outline-none"
          :class="activeTab === 'submissions' ? 'font-medium underline decoration-solid underline-offset-[10px] text-black' : 'font-light text-neutral-500 hover:text-black'"
        >
          Project Lists
          <span v-if="pendingSubmissionsCount > 0" class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-amber-100 text-amber-900 border border-amber-300 no-underline tabular-nums">
            {{ pendingSubmissionsCount }} review
          </span>
          <span v-else class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 no-underline tabular-nums">{{ editorStore.projects.length }}</span>
        </button>

        <button 
          type="button"
          @click="activeTab = 'templates'"
          class="bg-transparent border-none p-0 cursor-pointer font-sans text-[14.5px] md:text-[15.5px] leading-[22px] transition-colors flex items-center gap-2 outline-none"
          :class="activeTab === 'templates' ? 'font-medium underline decoration-solid underline-offset-[10px] text-black' : 'font-light text-neutral-500 hover:text-black'"
        >
          Templates Build
          <span class="px-1.5 py-0 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 no-underline tabular-nums">{{ brandStore.templates.length }}</span>
        </button>
      </nav>
    </div>

    <!-- 2. Workspace Content (Flows naturally with sticky tab above) -->
    <main class="flex-1 w-full px-[24px] py-[20px] md:py-[24px] flex flex-col gap-5 font-sans">
      <!-- TAB 1: BRANDS AND PIC'S -->
      <div v-if="activeTab === 'brands'" class="flex flex-col gap-4 w-full">
        <!-- Brands Toolbar -->
        <div class="flex items-center justify-between w-full select-none">
          <div class="flex items-center gap-2 text-[12px] text-neutral-500">
            <span>Showing <b class="text-black font-medium">{{ brandStore.brands.length }}</b> registered brand tenants</span>
          </div>

          <button 
            type="button"
            @click="showAddBrandModal = true"
            class="h-[34px] px-3.5 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer apple-press transition-colors border-none"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Brand</span>
          </button>
        </div>

        <!-- Brands Stacked List (Campaign Hub Card Layout) -->
        <div class="border border-black/10 rounded-[12px] overflow-hidden bg-white shadow-2xs divide-y divide-black/[0.06]">
          <!-- Column Headers -->
          <div class="hidden md:flex items-center justify-between px-6 py-2.5 bg-neutral-50/90 border-b border-black/[0.08] text-[10.5px] uppercase tracking-normal text-neutral-400 font-medium w-full">
            <span class="w-[280px]">Brand / Endpoint</span>
            <span class="w-[160px]">Active Campaigns</span>
            <span class="w-[160px]">Last Activity</span>
            <span class="w-[180px]">PIC Accounts</span>
            <span class="w-[130px] text-right">Actions</span>
          </div>

          <div 
            v-for="brand in brandStore.brands" 
            :key="brand.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-6 py-3.5 hover:bg-neutral-50/70 transition-colors gap-3 md:gap-0"
          >
            <!-- Col 1: Brand Avatar, Name, Status Pill & Slug -->
            <div class="flex gap-3.5 items-center w-[280px] shrink-0">
              <div 
                class="size-[38px] rounded-full text-white flex items-center justify-center font-medium text-[14px] shrink-0 border border-black/10 overflow-hidden bg-black shadow-xs"
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

              <div class="flex flex-col gap-0.5 min-w-0">
                <div class="flex gap-2 items-center">
                  <span class="text-[13px] font-medium text-black truncate">{{ brand.name }}</span>
                  <span class="px-2 py-0.2 rounded-full text-[10px] font-medium bg-moss-50 text-moss-700 border border-moss-200 shrink-0">
                    active
                  </span>
                </div>
                <span class="text-[11.5px] text-neutral-400 font-mono truncate">events.707.co.id/{{ brand.slug }}</span>
              </div>
            </div>

            <!-- Col 2: On-going Projects -->
            <div class="w-[160px] shrink-0">
              <span class="text-[12.5px] text-neutral-700">
                {{ getBrandDropsCount(brand.slug) }} Projects Active
              </span>
            </div>

            <!-- Col 3: Last Activity -->
            <div class="w-[160px] shrink-0">
              <span class="text-[12px] text-neutral-500">
                {{ getBrandLastActivity(brand.slug) }}
              </span>
            </div>

            <!-- Col 4: PIC Accounts Count & Avatars -->
            <div class="flex items-center gap-2 w-[180px] shrink-0">
              <span class="text-[12px] text-neutral-700">
                {{ getBrandPics(brand.slug).length }} PIC{{ getBrandPics(brand.slug).length === 1 ? '' : 's' }}
              </span>
              <div class="flex -space-x-1.5 overflow-hidden">
                <div 
                  v-for="pic in getBrandPics(brand.slug).slice(0, 3)" 
                  :key="pic.id" 
                  class="inline-flex size-[20px] rounded-full border border-white bg-neutral-200 text-[9.5px] font-medium text-center items-center justify-center text-black"
                  :title="pic.name"
                >
                  {{ pic.name.charAt(0) }}
                </div>
              </div>
            </div>

            <!-- Col 5: Actions -->
            <div class="flex items-center justify-end gap-3 w-[130px] shrink-0 text-right">
              <button 
                type="button"
                @click="openBrandDetailsModal(brand)"
                class="text-[12px] font-medium text-black hover:opacity-75 cursor-pointer underline underline-offset-2 bg-transparent border-none p-0 transition-opacity whitespace-nowrap"
              >
                Edit Details
              </button>
              <button 
                type="button"
                @click="handleRemoveBrand(brand)"
                class="size-7 rounded-[6px] hover:bg-red-50 text-neutral-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none"
                title="Delete brand"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Media Library maintenance card (Shown under Brands tab) -->
        <div class="w-full rounded-[14px] border border-red-200 bg-red-50/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 shadow-2xs">
          <div class="flex flex-col gap-1 max-w-[640px]">
            <p class="text-[13.5px] font-medium text-black">Media Asset Library Maintenance</p>
            <p class="text-[12.5px] leading-[19px] text-neutral-700 font-light">
              Delete every asset across every brand's media library, files included. Live campaigns referencing these images will revert to placeholders.
              Brands manage their active assets from the editor media gallery.
            </p>
          </div>
          <button
            type="button"
            :disabled="isPurgingMedia"
            @click="handlePurgeMedia"
            class="h-[34px] px-4 rounded-[8px] bg-red-600 hover:bg-red-700 text-white text-[12px] font-medium cursor-pointer transition-colors apple-press disabled:opacity-50 shrink-0 border-none"
          >
            {{ isPurgingMedia ? 'Deleting…' : 'Delete all media' }}
          </button>
        </div>
      </div>

      <!-- TAB 2: TEAM ACCOUNTS & PASSWORD MANAGEMENT -->
      <div v-if="activeTab === 'users'" class="flex flex-col gap-4 w-full">
        <!-- Users Toolbar -->
        <div class="flex items-center justify-between w-full select-none">
          <div class="flex items-center gap-2 text-[12px] text-neutral-500">
            <span>Showing <b class="text-black font-medium">{{ teamUsers.length }}</b> registered team members</span>
          </div>

          <button 
            type="button"
            @click="showAddUserModal = true"
            class="h-[34px] px-3.5 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer apple-press transition-colors border-none"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        <!-- Users Table -->
        <div class="border border-black/10 rounded-[12px] overflow-hidden bg-white shadow-2xs divide-y divide-black/[0.06]">
          <!-- Column Headers -->
          <div class="hidden md:flex items-center justify-between px-6 py-2.5 bg-neutral-50/90 border-b border-black/[0.08] text-[10.5px] uppercase tracking-normal text-neutral-400 font-medium w-full">
            <span class="w-[280px]">Member / Email</span>
            <span class="w-[150px]">Role</span>
            <span class="w-[180px]">Security (Hashed)</span>
            <span class="w-[200px]">Assigned Brands</span>
            <span class="w-[130px] text-right">Actions</span>
          </div>

          <div 
            v-for="user in teamUsers" 
            :key="user.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-6 py-3.5 hover:bg-neutral-50/70 transition-colors gap-3 md:gap-0"
          >
            <!-- Member Info -->
            <div class="flex gap-3.5 items-center w-[280px] shrink-0">
              <div class="size-[34px] rounded-full bg-black text-white flex items-center justify-center font-medium text-[12.5px] shrink-0 shadow-xs">
                {{ user.name.charAt(0) }}
              </div>
              <div class="flex flex-col gap-0.5 min-w-0">
                <span class="text-[13px] font-medium text-black truncate">{{ user.name }}</span>
                <span class="text-[11.5px] text-neutral-400 font-mono truncate">{{ user.email }}</span>
              </div>
            </div>

            <!-- Role Badge -->
            <div class="w-[150px] shrink-0">
              <span 
                v-if="user.role === 'superadmin'" 
                class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-oxblood-50 text-oxblood-700 border border-oxblood-200 inline-block"
              >
                Superadmin
              </span>
              <span 
                v-else-if="user.role === 'editor'" 
                class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-700 border border-black/10 inline-block"
              >
                Brand Designer
              </span>
              <span 
                v-else 
                class="px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-neutral-100 text-neutral-500 inline-block"
              >
                Reviewer
              </span>
            </div>

            <!-- Sign-in Password Management -->
            <div class="flex items-center gap-2 w-[180px] shrink-0">
              <span
                class="px-2 py-0.5 rounded-[6px] bg-black/[0.04] text-[11px] font-mono text-neutral-500"
                title="Passwords are stored hashed. Use Reset to issue a new one."
              >
                ••••••••••••
              </span>
              <button 
                type="button"
                @click="openPasswordModal(user)"
                class="text-[11.5px] text-black underline font-medium hover:opacity-75 cursor-pointer bg-transparent border-none p-0"
              >
                Reset
              </button>
            </div>

            <!-- Assigned Brands -->
            <div class="flex items-center gap-1.5 flex-wrap w-[200px] shrink-0">
              <span 
                v-for="b in user.assignedBrands" 
                :key="b"
                class="px-2 py-0.5 rounded-[6px] bg-black/5 text-[11px] text-neutral-700 capitalize font-mono"
              >
                {{ b }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 w-[130px] shrink-0 text-right">
              <button 
                type="button"
                @click="openEditUserModal(user)"
                class="text-[12px] font-medium text-black hover:opacity-75 cursor-pointer underline underline-offset-2 bg-transparent border-none p-0"
              >
                Edit
              </button>
              <button 
                v-if="user.role !== 'superadmin'"
                type="button"
                @click="authStore.removeUser(user.id)"
                class="text-[12px] text-red-600 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Remove
              </button>
              <span v-else class="text-[11px] text-neutral-400 italic">Primary</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: PROJECT LISTS / SUBMISSIONS QUEUE -->
      <div v-if="activeTab === 'submissions'" class="flex flex-col gap-4 w-full">
        <!-- Projects Toolbar with Segmented Filter Tabs & Refresh Button -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full select-none">
          <div class="flex items-center gap-1 text-[12px] font-sans p-0.5 rounded-[8px] bg-black/[0.04] overflow-x-auto no-scrollbar">
            <button 
              type="button"
              @click="projectFilter = 'all'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="projectFilter === 'all' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              All ({{ editorStore.projects.length }})
            </button>
            <button 
              type="button"
              @click="projectFilter = 'pending_review'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="projectFilter === 'pending_review' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              Pending ({{ pendingSubmissionsCount }})
            </button>
            <button 
              type="button"
              @click="projectFilter = 'approved'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="projectFilter === 'approved' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              Approved ({{ approvedProjectsCount }})
            </button>
            <button 
              type="button"
              @click="projectFilter = 'draft'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="projectFilter === 'draft' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              Drafts ({{ draftProjectsCount }})
            </button>
          </div>

          <!-- Refresh Queue Action -->
          <button 
            type="button"
            @click="editorStore.loadProjects()" 
            class="h-[34px] px-3.5 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer text-neutral-700 hover:text-black transition-colors shrink-0"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        <!-- Project Entries Table -->
        <div class="border border-black/10 rounded-[12px] overflow-hidden bg-white shadow-2xs divide-y divide-black/[0.06]">
          <!-- Column Headers -->
          <div class="hidden md:flex items-center justify-between px-6 py-2.5 bg-neutral-50/90 border-b border-black/[0.08] text-[10.5px] uppercase tracking-normal text-neutral-400 font-medium w-full">
            <span class="w-[260px]">Campaign / Slug</span>
            <span class="w-[150px]">Architecture</span>
            <span class="w-[150px] text-center">Status</span>
            <span class="w-[120px] text-center">Updated</span>
            <span class="w-[260px] text-right">Actions</span>
          </div>

          <div 
            v-for="project in filteredProjects" 
            :key="project.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-6 py-3.5 hover:bg-neutral-50/70 transition-colors gap-3 md:gap-0"
          >
            <!-- Col 1: Project Title & Brand -->
            <div class="flex flex-col w-[260px] gap-0.5 shrink-0">
              <span class="text-[13px] font-medium text-black truncate">{{ project.title }}</span>
              <span class="text-[11.5px] text-neutral-400 font-mono truncate">/{{ project.brand_slug || 'atmos' }}/{{ project.slug }}</span>
            </div>

            <!-- Col 2: Layout Info -->
            <div class="w-[150px] shrink-0 text-left">
              <span class="text-[12px] text-neutral-600 whitespace-nowrap">
                {{ project.pages?.length || 1 }} Pages · {{ project.widget_tree?.length || 0 }} Widgets
              </span>
            </div>

            <!-- Col 3: Centered Status Badge -->
            <div class="w-[150px] shrink-0 flex items-center justify-center text-center">
              <span 
                v-if="reviewState(project) === 'pending_review'"
                class="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <span class="size-1.5 rounded-full bg-amber-500" />
                Pending Review
              </span>
              <span 
                v-else-if="reviewState(project) === 'approved' || reviewState(project) === 'published'"
                class="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-moss-50 text-moss-700 border border-moss-200 whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <span class="size-1.5 rounded-full bg-moss-600" />
                Live on Stage
              </span>
              <span 
                v-else
                class="px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-black/5 text-neutral-600 border border-black/10 whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <span class="size-1.5 rounded-full bg-neutral-400" />
                Draft
              </span>
            </div>

            <!-- Col 4: Last Updated -->
            <div class="w-[120px] shrink-0 text-center">
              <span class="text-[12px] text-neutral-500 whitespace-nowrap font-mono">
                {{ editorStore.formatRelativeTime(project.updated_at) }}
              </span>
            </div>

            <!-- Col 5: Actions -->
            <div class="flex items-center gap-2 justify-end shrink-0 min-w-[260px]">
              <button 
                type="button"
                @click="handlePreviewProject(project.id)"
                class="h-[30px] px-2.5 rounded-[6px] border border-black/15 bg-white hover:bg-neutral-50 text-[11.5px] font-medium cursor-pointer transition-colors text-black"
                title="Inspect in live designer canvas"
              >
                Inspect
              </button>

              <button 
                type="button"
                @click="handleApproveProject(project.id)"
                class="h-[30px] px-3 rounded-[6px] bg-black text-white hover:bg-neutral-800 text-[11.5px] font-medium cursor-pointer transition-colors flex items-center gap-1 border-none"
                :class="!canPublish(project) ? 'opacity-40 cursor-default hover:bg-black' : ''"
                :disabled="!canPublish(project)"
                :title="!canPublish(project) ? 'Live — nothing new to publish' : (isLiveProject(project) ? 'Publish the submitted update' : 'Approve and publish')"
              >
                <CheckCircle class="w-3 h-3" />
                <span>{{ !canPublish(project) ? 'Live' : (isLiveProject(project) ? 'Publish Update' : 'Approve') }}</span>
              </button>

              <button 
                v-if="isAwaitingReview(project)"
                type="button"
                @click="handleDeclineProject(project.id)"
                class="h-[30px] px-2.5 rounded-[6px] border border-black/15 text-neutral-700 hover:bg-neutral-100 text-[11.5px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Send the submission back to the brand with a note"
              >
                <XCircle class="w-3 h-3" />
                <span>Decline</span>
              </button>

              <button 
                type="button"
                @click="handleDeleteProject(project)"
                class="h-[30px] px-2.5 rounded-[6px] border border-red-200 text-red-600 hover:bg-red-50 text-[11.5px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                title="Delete project permanently from cloud server"
              >
                <Trash2 class="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div v-if="!filteredProjects.length" class="p-8 text-center text-neutral-400 text-[12.5px] w-full font-light">
            No project submissions found for this filter.
          </div>
        </div>
      </div>

      <!-- TAB 4: TEMPLATES BUILD -->
      <div v-if="activeTab === 'templates'" class="flex flex-col gap-4 w-full">
        <!-- Templates Toolbar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full select-none">
          <div class="flex items-center gap-1 text-[12px] font-sans p-0.5 rounded-[8px] bg-black/[0.04] overflow-x-auto no-scrollbar">
            <button 
              type="button"
              @click="templateFilter = 'all'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="templateFilter === 'all' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              All ({{ brandStore.templates.length }})
            </button>
            <button 
              type="button"
              @click="templateFilter = 'published'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="templateFilter === 'published' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              Published ({{ publishedTemplatesCount }})
            </button>
            <button 
              type="button"
              @click="templateFilter = 'draft'"
              class="px-3 py-1.5 rounded-[6px] transition-all cursor-pointer whitespace-nowrap font-medium text-[12px]"
              :class="templateFilter === 'draft' ? 'bg-black text-white shadow-2xs' : 'text-neutral-500 hover:text-black hover:bg-black/[0.04]'"
            >
              Drafts ({{ draftTemplatesCount }})
            </button>
          </div>

          <button 
            type="button"
            @click="openBuildTemplateModal" 
            class="h-[34px] px-3.5 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer apple-press transition-colors shrink-0 border-none"
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
            class="p-5 rounded-[14px] border border-black/10 bg-neutral-50/60 flex flex-col justify-between gap-4 shadow-2xs hover:border-black/25 transition-all group"
          >
            <!-- Top: Header Info & Badges -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-[14px] font-medium text-black">{{ tpl.name }}</h3>
                  <span class="px-2 py-0.5 rounded-[6px] bg-black/5 text-[10.5px] uppercase font-medium text-neutral-600">
                    {{ tpl.category || 'custom' }}
                  </span>
                </div>
                <p class="text-[12px] text-neutral-500 leading-relaxed line-clamp-2 font-light">{{ tpl.description }}</p>
              </div>

              <!-- Draft / Published Status Badge -->
              <button 
                type="button"
                @click="brandStore.toggleTemplateStatus(tpl.id)"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border shrink-0 transition-colors cursor-pointer"
                :class="tpl.status === 'published' 
                  ? 'bg-moss-50 text-moss-700 border-moss-200 hover:bg-moss-100' 
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'"
                :title="tpl.status === 'published' ? 'Click to unpublish to draft' : 'Click to publish for designers'"
              >
                <span class="size-1.5 rounded-full" :class="tpl.status === 'published' ? 'bg-moss-600' : 'bg-neutral-400'" />
                <span>{{ tpl.status === 'published' ? 'Published' : 'Draft' }}</span>
              </button>
            </div>

            <!-- Middle Summary -->
            <div class="flex items-center justify-between text-[11.5px] text-neutral-500 font-light">
              <span class="flex items-center gap-1">
                <Layers class="w-3.5 h-3.5 text-neutral-400" />
                <span>{{ tpl.widget_tree.length }} Widgets configured</span>
              </span>
              <span>By {{ tpl.created_by || 'Superadmin' }}</span>
            </div>

            <!-- Bottom: Action Bar -->
            <div class="border-t border-black/[0.08] pt-3 flex items-center justify-between gap-3 w-full">
              <div class="flex items-center gap-3 flex-wrap">
                <button 
                  type="button"
                  @click="openEditTemplateModal(tpl)"
                  class="text-[12px] font-medium text-black hover:opacity-75 cursor-pointer underline underline-offset-2 bg-transparent border-none p-0 transition-opacity whitespace-nowrap"
                >
                  Edit Details
                </button>

                <span class="text-neutral-300 text-[11px] select-none">|</span>

                <button 
                  type="button"
                  @click="brandStore.toggleTemplateStatus(tpl.id)"
                  class="text-[12px] text-neutral-600 hover:text-black cursor-pointer bg-transparent border-none p-0 transition-colors whitespace-nowrap"
                >
                  {{ tpl.status === 'published' ? 'Set to Draft' : 'Publish' }}
                </button>

                <span class="text-neutral-300 text-[11px] select-none">|</span>

                <button 
                  type="button"
                  @click="handleRemoveTemplate(tpl)"
                  class="text-[12px] text-red-600 hover:text-red-700 hover:underline cursor-pointer bg-transparent border-none p-0 transition-colors whitespace-nowrap"
                >
                  Remove
                </button>
              </div>

              <button 
                type="button"
                @click="handleEditInStudio(tpl)"
                class="h-[30px] px-3 rounded-[6px] border border-black/15 bg-white hover:bg-neutral-50 text-[11.5px] font-medium flex items-center gap-1.5 cursor-pointer text-black transition-colors"
              >
                <span>Edit in Builder</span>
                <ExternalLink class="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!filteredTemplates.length" class="p-8 text-center text-neutral-400 text-[12.5px] w-full border border-dashed border-neutral-300 rounded-[12px] font-light">
          No templates found in this view. Click "Build New Template" to create one.
        </div>
      </div>
    </main>

    <!-- ============================================================== -->
    <!-- MODALS (Refactored to Campaign Hub Design System)              -->
    <!-- ============================================================== -->

    <!-- Modal 0: Add Brand Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showAddBrandModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddBrandModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Add Brand Account</h3>
              <button 
                type="button"
                @click="showAddBrandModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddBrandSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand Name</label>
                  <input 
                    v-model="newBrandName" 
                    type="text" 
                    required 
                    placeholder="e.g. atmos Indonesia" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand URL Slug</label>
                    <input 
                      v-model="newBrandSlug" 
                      type="text" 
                      placeholder="e.g. atmos" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Primary Color</label>
                    <div class="flex items-center gap-2">
                      <input 
                        v-model="newBrandColor" 
                        type="color" 
                        class="size-[36px] rounded-[6px] border border-black/15 cursor-pointer bg-transparent p-0.5"
                      />
                      <input 
                        v-model="newBrandColor" 
                        type="text" 
                        class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">
                      Brand Logo / Photo
                    </label>
                    <span v-if="isUploadingNewLogo" class="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                      <RefreshCw class="w-3 h-3 animate-spin" /> Uploading...
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
                    <div 
                      class="size-[42px] rounded-[10px] overflow-hidden border border-black/12 shrink-0 bg-black flex items-center justify-center relative group shadow-2xs"
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
                        class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer border-none"
                        title="Remove image"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div class="flex-1 flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <button 
                          type="button" 
                          @click="newBrandFileInputRef?.click()"
                          :disabled="isUploadingNewLogo"
                          class="h-[32px] px-3 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors border-none"
                        >
                          <Upload class="w-3.5 h-3.5" />
                          <span>{{ newBrandLogoUrl ? 'Change Image' : 'Upload from Device' }}</span>
                        </button>
                        <button 
                          v-if="!showNewBrandUrlInput && !newBrandLogoUrl"
                          type="button" 
                          @click="showNewBrandUrlInput = true"
                          class="h-[32px] px-2.5 rounded-[8px] border border-black/15 text-[11.5px] text-neutral-600 hover:text-black hover:bg-black/5 transition-colors cursor-pointer bg-white"
                        >
                          Paste link
                        </button>
                      </div>

                      <input 
                        v-if="showNewBrandUrlInput || newBrandLogoUrl"
                        v-model="newBrandLogoUrl" 
                        type="text" 
                        placeholder="Or enter image URL (https://...)" 
                        class="w-full h-[30px] px-2.5 rounded-[6px] bg-black/[0.03] border border-black/12 text-[11.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Description</label>
                  <textarea 
                    v-model="newBrandDesc" 
                    rows="2"
                    placeholder="Brand specialty, collaboration focus..." 
                    class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white resize-none transition-all"
                  />
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  @click="showAddBrandModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                >
                  Create Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 1: Edit Brand Details & PICs Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showBrandDetailsModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBrandDetailsModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div 
                  class="size-8 rounded-full text-white flex items-center justify-center font-medium text-[13px] overflow-hidden border border-black/10 shadow-xs"
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
                  <h3 class="text-[14.5px] font-medium text-black">{{ targetBrand?.name }}</h3>
                  <p class="text-[11px] text-neutral-400 font-mono">events.707.co.id/{{ targetBrand?.slug }}</p>
                </div>
              </div>
              <button 
                type="button"
                @click="showBrandDetailsModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleSaveBrandDetails" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand Name</label>
                  <input 
                    v-model="editBrandName" 
                    type="text" 
                    required 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">
                      Brand Logo / Photo
                    </label>
                    <span v-if="isUploadingEditLogo" class="text-[11px] text-neutral-500 font-mono flex items-center gap-1">
                      <RefreshCw class="w-3 h-3 animate-spin" /> Uploading...
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
                    <div 
                      class="size-[42px] rounded-[10px] overflow-hidden border border-black/12 shrink-0 bg-black flex items-center justify-center relative group shadow-2xs"
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
                        class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer border-none"
                        title="Remove image"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div class="flex-1 flex flex-col gap-1.5">
                      <div class="flex items-center gap-2">
                        <button 
                          type="button" 
                          @click="editBrandFileInputRef?.click()"
                          :disabled="isUploadingEditLogo"
                          class="h-[32px] px-3 rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors border-none"
                        >
                          <Upload class="w-3.5 h-3.5" />
                          <span>{{ (editBrandLogoUrl || targetBrand?.logo_url) ? 'Change Image' : 'Upload from Device' }}</span>
                        </button>
                        <button 
                          v-if="!showEditBrandUrlInput && !editBrandLogoUrl && !targetBrand?.logo_url"
                          type="button" 
                          @click="showEditBrandUrlInput = true"
                          class="h-[32px] px-2.5 rounded-[8px] border border-black/15 text-[11.5px] text-neutral-600 hover:text-black hover:bg-black/5 transition-colors cursor-pointer bg-white"
                        >
                          Paste link
                        </button>
                      </div>

                      <input 
                        v-if="showEditBrandUrlInput || editBrandLogoUrl || targetBrand?.logo_url"
                        v-model="editBrandLogoUrl" 
                        type="text" 
                        placeholder="Or enter image URL (https://...)" 
                        class="w-full h-[30px] px-2.5 rounded-[6px] bg-black/[0.03] border border-black/12 text-[11.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Description</label>
                  <textarea 
                    v-model="editBrandDesc" 
                    rows="2"
                    class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white resize-none transition-all"
                  />
                </div>

                <!-- Assigned PICs for this brand -->
                <div class="flex flex-col gap-2">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">
                      Assigned PICs ({{ currentBrandPics.length }})
                    </label>
                    <button 
                      type="button" 
                      @click="openAssignPicModal(targetBrand?.slug || '', targetBrand?.name || '')"
                      class="text-[11.5px] font-medium text-black underline cursor-pointer bg-transparent border-none p-0"
                    >
                      + Add PIC
                    </button>
                  </div>

                  <div class="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto">
                    <div 
                      v-for="pic in currentBrandPics" 
                      :key="pic.id"
                      class="flex items-center justify-between bg-black/[0.03] px-3 py-1.5 rounded-[8px] border border-black/5 text-[12px]"
                    >
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-black">{{ pic.name }}</span>
                        <span class="text-neutral-400 font-mono text-[11px]">({{ pic.email }})</span>
                      </div>
                      <button 
                        v-if="pic.role !== 'superadmin'"
                        type="button" 
                        @click="authStore.unassignBrandPic(targetBrand?.slug || '', pic.id)"
                        class="text-neutral-400 hover:text-red-600 font-medium cursor-pointer bg-transparent border-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  @click="showBrandDetailsModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 2: Add Team Member Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showAddUserModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddUserModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Create Team Member Account</h3>
              <button 
                type="button"
                @click="showAddUserModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddUserSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Full Name</label>
                  <input 
                    v-model="newUserName" 
                    type="text" 
                    required 
                    placeholder="e.g. Maya Chen" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Email Address</label>
                    <input 
                      v-model="newUserEmail" 
                      type="email" 
                      required 
                      placeholder="maya@atmos.co.id" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Phone Number</label>
                    <input 
                      v-model="newUserPhone" 
                      type="tel" 
                      placeholder="+62 812..." 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Sign-in Password</label>
                  <div class="flex items-center gap-2">
                    <input 
                      v-model="newUserPassword" 
                      type="text" 
                      required 
                      placeholder="Set initial password" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                    <button 
                      type="button" 
                      @click="generateRandomPassword"
                      class="h-[36px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[11.5px] font-medium text-black whitespace-nowrap cursor-pointer transition-colors shrink-0"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Access Role</label>
                    <select 
                      v-model="newUserRole" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    >
                      <option value="editor">Brand Designer / Editor</option>
                      <option value="viewer">Viewer / Reviewer</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Primary Brand</label>
                    <select 
                      v-model="newUserBrand" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    >
                      <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
                      <option value="all">All Brands (Master)</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  @click="showAddUserModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 2B: Edit Team Member Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showEditUserModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditUserModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Edit Team Member</h3>
              <button 
                type="button"
                @click="showEditUserModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleSaveEditUserSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Full Name</label>
                  <input 
                    v-model="editUserName" 
                    type="text" 
                    required 
                    placeholder="e.g. Maya Chen" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Email Address</label>
                    <input 
                      v-model="editUserEmail" 
                      type="email" 
                      required 
                      placeholder="maya@atmos.co.id" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Phone Number</label>
                    <input 
                      v-model="editUserPhone" 
                      type="tel" 
                      placeholder="+62 812..." 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Sign-in Password / PIN</label>
                  <input 
                    v-model="editUserPassword" 
                    type="text" 
                    placeholder="Leave blank to keep the current password" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Access Role</label>
                    <select 
                      v-model="editUserRole" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    >
                      <option value="editor">Brand Designer / Editor</option>
                      <option value="viewer">Viewer / Reviewer</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>

                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Primary Brand</label>
                    <select 
                      v-model="editUserBrand" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    >
                      <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
                      <option value="all">All Brands (Master)</option>
                    </select>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Account Status</label>
                  <select 
                    v-model="editUserStatus" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  @click="showEditUserModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 3: Reset Password Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showPasswordModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="closePasswordModal"
        >
          <div class="w-full max-w-[420px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Reset Sign-in Password</h3>
              <button 
                type="button"
                @click="closePasswordModal" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 flex flex-col gap-3.5">
              <p class="text-[12.5px] text-neutral-600 font-light">
                Resetting sign-in credentials for <b class="font-medium text-black">{{ targetUserForPassword?.name }}</b> ({{ targetUserForPassword?.email }}).
              </p>

              <form v-if="!passwordResetDone" @submit.prevent="handlePasswordUpdateSubmit" class="flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">New Password</label>
                  <div class="flex items-center gap-2">
                    <input 
                      v-model="updatedPasswordValue" 
                      type="text" 
                      required 
                      minlength="8"
                      placeholder="Enter new password" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    />
                    <button 
                      type="button" 
                      @click="updatedPasswordValue = secureRandomPassword()"
                      class="h-[36px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[11.5px] font-medium text-black whitespace-nowrap cursor-pointer transition-colors shrink-0"
                    >
                      Generate
                    </button>
                  </div>
                  <p class="text-[11px] text-neutral-400 font-light">Passwords are stored hashed. After you confirm, this is the only time it is shown.</p>
                </div>

                <div class="flex items-center justify-end gap-2 mt-2 pt-3 border-t border-black/10">
                  <button 
                    type="button" 
                    @click="closePasswordModal" 
                    class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              <div v-else class="flex flex-col gap-3.5">
                <p class="text-[12.5px] text-neutral-700 font-light">
                  Password successfully updated. Share it with {{ targetUserForPassword?.name }} now — it cannot be retrieved again.
                </p>
                <div class="flex items-center gap-2">
                  <code class="flex-1 h-[36px] px-3 flex items-center rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black select-text">{{ updatedPasswordValue }}</code>
                  <button 
                    type="button" 
                    @click="copyResetPassword"
                    class="h-[36px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[11.5px] font-medium text-black whitespace-nowrap cursor-pointer transition-colors shrink-0"
                  >
                    Copy
                  </button>
                </div>
                <div class="flex justify-end pt-3 border-t border-black/10">
                  <button 
                    type="button" 
                    @click="closePasswordModal" 
                    class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 5: Build New Template Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showBuildTemplateModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBuildTemplateModal = false"
        >
          <div class="w-full max-w-[500px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop max-h-[90vh]">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Build Master Activation Template</h3>
              <button 
                type="button"
                @click="showBuildTemplateModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleBuildTemplateSubmit(false)" class="flex flex-col flex-1 overflow-y-auto">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Template Name</label>
                  <input 
                    v-model="newTemplateName" 
                    type="text" 
                    required 
                    placeholder="e.g. VIP Secret Drop & Guest E-Pass" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Category</label>
                    <select 
                      v-model="newTemplateCategory" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
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
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Initial Status</label>
                    <select 
                      v-model="newTemplateStatus" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    >
                      <option value="draft">Draft (Private Superadmin)</option>
                      <option value="published">Published (Available for Brands)</option>
                    </select>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Description</label>
                  <textarea 
                    v-model="newTemplateDesc" 
                    rows="2"
                    placeholder="Provide guidelines or activation instructions..." 
                    class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white resize-none transition-all"
                  />
                </div>

                <!-- Starting Architecture Base -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Starting Architecture</label>
                  <div class="grid grid-cols-2 gap-2 text-[12px]">
                    <label 
                      class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-0.5 transition-all"
                      :class="starterPresetBase === 'blank' ? 'border-black bg-black/[0.04] font-medium' : 'border-black/10 hover:border-black/25'"
                    >
                      <input type="radio" v-model="starterPresetBase" value="blank" class="hidden" />
                      <span>Blank Canvas</span>
                      <span class="text-[10.5px] text-neutral-400 font-normal">Clean slate mobile artboard</span>
                    </label>

                    <label 
                      class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-0.5 transition-all"
                      :class="starterPresetBase === 'raffle' ? 'border-black bg-black/[0.04] font-medium' : 'border-black/10 hover:border-black/25'"
                    >
                      <input type="radio" v-model="starterPresetBase" value="raffle" class="hidden" />
                      <span>Raffle Drop</span>
                      <span class="text-[10.5px] text-neutral-400 font-normal">Hero + Timer + Size + Terms</span>
                    </label>

                    <label 
                      class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-0.5 transition-all"
                      :class="starterPresetBase === 'rsvp' ? 'border-black bg-black/[0.04] font-medium' : 'border-black/10 hover:border-black/25'"
                    >
                      <input type="radio" v-model="starterPresetBase" value="rsvp" class="hidden" />
                      <span>RSVP Pass</span>
                      <span class="text-[10.5px] text-neutral-400 font-normal">Hero + Pass Form + Venue Map</span>
                    </label>

                    <label 
                      class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-0.5 transition-all"
                      :class="starterPresetBase === 'pass' ? 'border-black bg-black/[0.04] font-medium' : 'border-black/10 hover:border-black/25'"
                    >
                      <input type="radio" v-model="starterPresetBase" value="pass" class="hidden" />
                      <span>Guest E-Pass</span>
                      <span class="text-[10.5px] text-neutral-400 font-normal">Registration + Dynamic E-Pass</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2 shrink-0">
                <button 
                  type="button" 
                  @click="showBuildTemplateModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black text-black font-medium text-[12px] hover:bg-neutral-100 transition-colors cursor-pointer bg-white"
                >
                  Save Preset
                </button>
                <button 
                  type="button" 
                  @click="handleBuildTemplateSubmit(true)"
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none flex items-center gap-1.5"
                >
                  <span>Save & Open Builder</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 6: Edit Template Details Modal -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showEditTemplateModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditTemplateModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <!-- Header -->
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Edit Template Details</h3>
              <button 
                type="button"
                @click="showEditTemplateModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditTemplateSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Template Name</label>
                  <input 
                    v-model="editTemplateName" 
                    type="text" 
                    required 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Category</label>
                    <select 
                      v-model="editTemplateCategory" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
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
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Status</label>
                    <select 
                      v-model="editTemplateStatus" 
                      class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                    >
                      <option value="draft">Draft (Work in Progress)</option>
                      <option value="published">Published (Live for Brands)</option>
                    </select>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Description</label>
                  <textarea 
                    v-model="editTemplateDesc" 
                    rows="3"
                    class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white resize-none transition-all"
                  />
                </div>
              </div>

              <!-- Footer -->
              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button 
                  type="button" 
                  @click="showEditTemplateModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-100 text-neutral-700 text-[12px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

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
