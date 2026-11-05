<template>
  <div class="h-screen w-screen bg-white text-black font-sans font-light tracking-normal flex flex-col overflow-hidden select-none hub-root" data-name="Superadmin Studio">
    <!-- Top 48px Header strictly following 707 Design Tokens -->
    <header class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between border-b border-black/10 bg-white/95 backdrop-blur-md shrink-0 sticky top-0 z-40 select-none">
      <div class="flex items-center gap-[12px] h-[24px]">
        <!-- 707 Logo + Dev Badge -->
        <router-link to="/" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="Back to 707 Home">
          <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
        </router-link>
        <span 
          class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-black/[0.04] border border-black/10 text-[10px] font-mono font-medium text-neutral-600 leading-none whitespace-nowrap select-none"
        >
          Dev
        </span>

        <div class="w-px h-4 bg-black/15 mx-0.5" />

        <div class="flex items-center gap-2">
          <span class="size-1.5 rounded-full bg-oxblood-600 shrink-0" />
          <span class="text-[13px] font-medium text-black">Studio Control</span>
        </div>
      </div>

      <!-- Right Actions: Studio Link & User Profile -->
      <div class="flex items-center gap-2 md:gap-2.5">
        <router-link 
          to="/" 
          class="flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 hover:text-black transition-colors apple-press"
          title="Return to 707 Studio"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">Studio</span>
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

    <!-- Studio Split Body: Left Editorial Rail + Right Focus Stage -->
    <div class="flex-1 w-full flex overflow-hidden min-h-0">
      <!-- LEFT EDITORIAL RAIL (Fixed 270px) -->
      <aside class="w-[270px] shrink-0 border-r border-black/10 bg-[#fafafa]/80 flex flex-col justify-between overflow-y-auto no-scrollbar p-3.5 select-none font-sans">
        <div class="flex flex-col gap-5 w-full">
          <!-- Section 1: Pending Releases (Rendered prominently if any pending review) -->
          <div v-if="pendingProjects.length > 0" class="flex flex-col gap-1 w-full">
            <div class="flex items-center justify-between px-2 text-[10.5px] font-mono uppercase text-amber-900 font-medium">
              <span class="flex items-center gap-1.5">
                <span class="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                Review Gate
              </span>
              <span class="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 rounded-full font-mono">{{ pendingProjects.length }}</span>
            </div>

            <button
              v-for="p in pendingProjects"
              :key="p.id"
              type="button"
              @click="selectItem('review', p.id)"
              class="w-full text-left px-2.5 py-2 rounded-[8px] text-[12.5px] transition-all flex items-center justify-between group cursor-pointer border-none bg-transparent"
              :class="isSelected('review', p.id) ? 'bg-amber-100/80 text-black font-medium shadow-2xs' : 'text-neutral-700 hover:bg-black/[0.04]'"
            >
              <span class="truncate">{{ p.title }}</span>
              <span class="size-1.5 rounded-full bg-amber-500 shrink-0" />
            </button>
          </div>

          <!-- Section 2: Brand Houses -->
          <div class="flex flex-col gap-1 w-full">
            <div class="flex items-center justify-between px-2 text-[10.5px] font-mono uppercase text-neutral-400 font-medium">
              <span>Brand Houses ({{ brandStore.brands.length }})</span>
              <button 
                type="button" 
                @click="showAddBrandModal = true" 
                class="hover:text-black text-neutral-400 cursor-pointer p-0 bg-transparent border-none transition-colors"
                title="Add new brand"
              >
                <Plus class="size-3.5" />
              </button>
            </div>

            <button
              v-for="b in brandStore.brands"
              :key="b.id"
              type="button"
              @click="selectItem('brand', b.id)"
              class="w-full text-left px-2.5 py-2 rounded-[8px] text-[12.5px] transition-all flex items-center justify-between group cursor-pointer border-none bg-transparent"
              :class="isSelected('brand', b.id) ? 'bg-black text-white font-medium shadow-2xs' : 'text-neutral-700 hover:bg-black/[0.04]'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <span class="size-1.5 rounded-full shrink-0" :class="isSelected('brand', b.id) ? 'bg-emerald-400' : 'bg-moss-600'" />
                <span class="truncate">{{ b.name }}</span>
              </div>
              <span 
                class="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full shrink-0"
                :class="isSelected('brand', b.id) ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-500'"
              >
                {{ getBrandDropCount(b) }}
              </span>
            </button>
          </div>

          <!-- Section 3: Foundry Blueprints (Templates) -->
          <div class="flex flex-col gap-1 w-full">
            <div class="flex items-center justify-between px-2 text-[10.5px] font-mono uppercase text-neutral-400 font-medium">
              <span>Foundry ({{ brandStore.templates.length }})</span>
              <button 
                type="button" 
                @click="openBuildTemplateModal" 
                class="hover:text-black text-neutral-400 cursor-pointer p-0 bg-transparent border-none transition-colors"
                title="Build new master template"
              >
                <Plus class="size-3.5" />
              </button>
            </div>

            <button
              v-for="t in brandStore.templates"
              :key="t.id"
              type="button"
              @click="selectItem('template', t.id)"
              class="w-full text-left px-2.5 py-2 rounded-[8px] text-[12.5px] transition-all flex items-center justify-between group cursor-pointer border-none bg-transparent"
              :class="isSelected('template', t.id) ? 'bg-black text-white font-medium shadow-2xs' : 'text-neutral-700 hover:bg-black/[0.04]'"
            >
              <div class="flex items-center gap-2 min-w-0">
                <Layers class="size-3.5 shrink-0 opacity-60" />
                <span class="truncate">{{ t.name }}</span>
              </div>
              <span 
                class="text-[9.5px] font-mono uppercase px-1 rounded shrink-0"
                :class="isSelected('template', t.id) ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-500'"
              >
                {{ t.category || 'tpl' }}
              </span>
            </button>
          </div>

          <!-- Section 4: System Directory -->
          <div class="flex flex-col gap-1 w-full">
            <div class="px-2 text-[10.5px] font-mono uppercase text-neutral-400 font-medium">
              System
            </div>

            <button
              type="button"
              @click="selectItem('team')"
              class="w-full text-left px-2.5 py-2 rounded-[8px] text-[12.5px] transition-all flex items-center justify-between group cursor-pointer border-none bg-transparent"
              :class="isSelected('team') ? 'bg-black text-white font-medium shadow-2xs' : 'text-neutral-700 hover:bg-black/[0.04]'"
            >
              <div class="flex items-center gap-2">
                <Users class="size-3.5 shrink-0 opacity-60" />
                <span>Team Accounts</span>
              </div>
              <span 
                class="text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full"
                :class="isSelected('team') ? 'bg-white/20 text-white' : 'bg-black/5 text-neutral-500'"
              >
                {{ teamUsers.length }}
              </span>
            </button>

            <button
              type="button"
              @click="selectItem('media')"
              class="w-full text-left px-2.5 py-2 rounded-[8px] text-[12.5px] transition-all flex items-center justify-between group cursor-pointer border-none bg-transparent"
              :class="isSelected('media') ? 'bg-black text-white font-medium shadow-2xs' : 'text-neutral-700 hover:bg-black/[0.04]'"
            >
              <div class="flex items-center gap-2">
                <Trash2 class="size-3.5 shrink-0 opacity-60" />
                <span>Media Purge</span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <!-- RIGHT MAIN FOCUS STAGE -->
      <main class="flex-1 h-full overflow-y-auto px-6 sm:px-10 lg:px-14 py-7 max-w-[1200px] flex flex-col gap-6 font-sans">
        <!-- ======================================================== -->
        <!-- VIEW 1: BRAND DOSSIER                                   -->
        <!-- ======================================================== -->
        <div v-if="activeSelection.type === 'brand' && currentBrand" class="flex flex-col gap-7 w-full animate-apple-pop">
          <!-- Brand Dossier Hero Header -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
            <div class="flex items-center gap-3.5">
              <div class="size-11 rounded-full bg-black text-white flex items-center justify-center font-mono text-[14px] font-medium shrink-0 shadow-2xs">
                {{ currentBrand.name.slice(0, 2).toUpperCase() }}
              </div>
              <div class="flex flex-col gap-0.5">
                <div class="flex items-center gap-2">
                  <h1 class="text-[24px] sm:text-[26px] font-medium tracking-tight text-black leading-none">
                    {{ currentBrand.name }}
                  </h1>
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-moss-50 text-moss-700 border border-moss-200">
                    Active
                  </span>
                </div>
                <p class="text-[12px] text-neutral-400 font-mono">
                  events.707.co.id/{{ currentBrand.slug }} · {{ currentBrandProjects.length }} campaigns
                </p>
              </div>
            </div>

            <!-- Brand Header Actions -->
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                @click="openBrandInStudio(currentBrand)"
                class="h-[34px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-neutral-800 transition-colors apple-press cursor-pointer border-none"
              >
                <span>Enter Studio</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>

              <button 
                type="button" 
                @click="openBrandDetailsModal(currentBrand)"
                class="h-[34px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 hover:text-black transition-colors apple-press cursor-pointer"
              >
                Edit Details
              </button>

              <button 
                type="button" 
                @click="handleRemoveBrand(currentBrand)"
                class="size-[34px] rounded-[8px] border border-black/10 hover:border-red-200 bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Remove brand"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Section: Campaign Drops for this Brand -->
          <div class="flex flex-col gap-3 w-full">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Campaign Drops</span>
              <button 
                type="button" 
                @click="handleCreateCampaignForBrand(currentBrand)"
                class="text-[12px] font-medium text-black hover:opacity-75 cursor-pointer flex items-center gap-1 underline underline-offset-2 bg-transparent border-none p-0"
              >
                <Plus class="size-3" />
                <span>New Campaign</span>
              </button>
            </div>

            <!-- Campaigns Table -->
            <div class="border border-black/10 rounded-[12px] overflow-hidden bg-white shadow-2xs divide-y divide-black/[0.06]">
              <div v-if="currentBrandProjects.length === 0" class="py-10 text-center text-[12.5px] text-neutral-400 font-light">
                No campaigns created for {{ currentBrand.name }} yet.
              </div>

              <div 
                v-for="p in currentBrandProjects" 
                :key="p.id"
                class="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors"
              >
                <div class="flex flex-col gap-0.5 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[13.5px] font-medium text-black truncate">{{ p.title }}</span>
                    <span 
                      class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border"
                      :class="isLiveProject(p) ? 'bg-moss-50 text-moss-700 border-moss-200' : (isAwaitingReview(p) ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-neutral-100 text-neutral-600 border-neutral-200')"
                    >
                      {{ formatProjectStatus(p) }}
                    </span>
                  </div>
                  <span class="text-[11.5px] text-neutral-400 font-mono">
                    Updated {{ formatDate(p.updated_at) }}
                  </span>
                </div>

                <!-- Drop Actions -->
                <div class="flex items-center gap-2 shrink-0">
                  <button 
                    v-if="isAwaitingReview(p)"
                    type="button"
                    @click="handleApproveProject(p.id)"
                    class="h-[30px] px-3 rounded-[6px] bg-black text-white text-[11.5px] font-medium hover:bg-neutral-800 transition-colors apple-press cursor-pointer border-none"
                  >
                    Approve
                  </button>

                  <button 
                    type="button" 
                    @click="handleInspectProject(p)"
                    class="h-[30px] px-2.5 rounded-[6px] border border-black/15 bg-white hover:bg-neutral-50 text-[11.5px] font-medium text-neutral-700 hover:text-black transition-colors cursor-pointer"
                  >
                    Inspect
                  </button>

                  <button 
                    type="button" 
                    @click="handleDeleteProject(p.id)"
                    class="size-[30px] rounded-[6px] hover:bg-red-50 text-neutral-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none"
                    title="Delete project"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Assigned Brand PICs -->
          <div class="flex flex-col gap-3 w-full">
            <div class="flex items-center justify-between">
              <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Assigned Team PICs</span>
              <button 
                type="button" 
                @click="openBrandDetailsModal(currentBrand)"
                class="text-[12px] font-medium text-black hover:opacity-75 cursor-pointer flex items-center gap-1 underline underline-offset-2 bg-transparent border-none p-0"
              >
                <span>Manage PICs</span>
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div 
                v-for="u in currentBrandUsers" 
                :key="u.id"
                class="p-3.5 rounded-[10px] border border-black/10 bg-neutral-50/50 flex items-center gap-3"
              >
                <div class="size-8 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-medium shrink-0">
                  {{ u.name.slice(0, 2).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-[12.5px] font-medium text-black truncate">{{ u.name }}</span>
                  <span class="text-[11px] text-neutral-400 truncate">{{ u.email }}</span>
                </div>
              </div>

              <div v-if="currentBrandUsers.length === 0" class="col-span-full py-4 text-center text-[12px] text-neutral-400">
                No individual PICs assigned yet.
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- VIEW 2: REVIEW GATE (PENDING SUBMISSION)                  -->
        <!-- ======================================================== -->
        <div v-else-if="activeSelection.type === 'review' && currentReviewProject" class="flex flex-col gap-6 w-full animate-apple-pop">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-amber-50 text-amber-900 border border-amber-300">
                  <span class="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Review Gate
                </span>
                <span class="text-[11.5px] font-mono text-neutral-400">/{{ currentReviewProject.brand_slug }}/{{ currentReviewProject.slug }}</span>
              </div>
              <h1 class="text-[24px] sm:text-[26px] font-medium tracking-tight text-black leading-tight">
                {{ currentReviewProject.title }}
              </h1>
              <p class="text-[12.5px] text-neutral-500 font-light">
                Submitted for release approval by brand PIC.
              </p>
            </div>

            <!-- Gate Actions -->
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                @click="handleApproveProject(currentReviewProject.id)"
                class="h-[36px] px-4 rounded-[8px] bg-black text-white text-[12.5px] font-medium hover:bg-neutral-800 transition-colors apple-press cursor-pointer border-none shadow-2xs"
              >
                Approve & Publish Live
              </button>

              <button 
                type="button" 
                @click="handleInspectProject(currentReviewProject)"
                class="h-[36px] px-3.5 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12.5px] font-medium text-neutral-700 hover:text-black transition-colors cursor-pointer"
              >
                Inspect in Studio
              </button>

              <button 
                type="button" 
                @click="handleDeclineProject(currentReviewProject.id)"
                class="h-[36px] px-3 rounded-[8px] border border-red-200 text-red-600 hover:bg-red-50 text-[12.5px] font-medium transition-colors cursor-pointer bg-white"
              >
                Decline
              </button>
            </div>
          </div>

          <!-- Specs Info Card -->
          <div class="p-5 rounded-[12px] border border-black/10 bg-neutral-50/50 flex flex-col gap-3">
            <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Campaign Specifications</span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[12.5px]">
              <div>
                <span class="text-neutral-400 block text-[11px]">Brand Tenant</span>
                <span class="font-medium text-black">{{ currentReviewProject.brand_slug || 'atmos' }}</span>
              </div>
              <div>
                <span class="text-neutral-400 block text-[11px]">Submission Date</span>
                <span class="font-medium text-black">{{ formatDate(currentReviewProject.updated_at) }}</span>
              </div>
              <div>
                <span class="text-neutral-400 block text-[11px]">Configured Pages</span>
                <span class="font-medium text-black">{{ currentReviewProject.pages?.length || 1 }} Pages</span>
              </div>
              <div>
                <span class="text-neutral-400 block text-[11px]">Target Address</span>
                <span class="font-mono text-black text-[11.5px]">/{{ currentReviewProject.brand_slug }}/{{ currentReviewProject.slug }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- VIEW 3: FOUNDRY BLUEPRINT (TEMPLATE)                     -->
        <!-- ======================================================== -->
        <div v-else-if="activeSelection.type === 'template' && currentTemplate" class="flex flex-col gap-6 w-full animate-apple-pop">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded-[5px] bg-black/5 text-[10px] font-mono uppercase text-neutral-600 font-medium">
                  {{ currentTemplate.category || 'Activation' }}
                </span>
                <button 
                  type="button"
                  @click="brandStore.toggleTemplateStatus(currentTemplate.id)"
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] font-medium border cursor-pointer"
                  :class="currentTemplate.status === 'published' ? 'bg-moss-50 text-moss-700 border-moss-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'"
                >
                  <span class="size-1.5 rounded-full" :class="currentTemplate.status === 'published' ? 'bg-moss-600' : 'bg-neutral-400'" />
                  <span>{{ currentTemplate.status === 'published' ? 'Published' : 'Draft' }}</span>
                </button>
              </div>

              <h1 class="text-[24px] sm:text-[26px] font-medium tracking-tight text-black leading-tight">
                {{ currentTemplate.name }}
              </h1>
              <p class="text-[12.5px] text-neutral-500 font-light max-w-[600px]">
                {{ currentTemplate.description }}
              </p>
            </div>

            <!-- Template Actions -->
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                @click="handleEditInStudio(currentTemplate)"
                class="h-[34px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-neutral-800 transition-colors apple-press cursor-pointer border-none"
              >
                <span>Open in Canvas</span>
                <ExternalLink class="w-3.5 h-3.5" />
              </button>

              <button 
                type="button" 
                @click="openEditTemplateModal(currentTemplate)"
                class="h-[34px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 hover:text-black transition-colors cursor-pointer"
              >
                Edit
              </button>

              <button 
                type="button" 
                @click="handleRemoveTemplate(currentTemplate)"
                class="size-[34px] rounded-[8px] border border-black/10 hover:border-red-200 bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                title="Remove template"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Blueprint Blueprint Architecture Summary -->
          <div class="p-5 rounded-[12px] border border-black/10 bg-neutral-50/50 flex flex-col gap-3">
            <span class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Blueprint Architecture</span>
            <div class="flex items-center gap-6 text-[12.5px]">
              <div>
                <span class="text-neutral-400 block text-[11px]">Widgets Included</span>
                <span class="font-medium text-black font-mono">{{ currentTemplate.widget_tree?.length || 0 }} Widgets</span>
              </div>
              <div>
                <span class="text-neutral-400 block text-[11px]">System Scope</span>
                <span class="font-medium text-black">Global (All Brand Partners)</span>
              </div>
              <div>
                <span class="text-neutral-400 block text-[11px]">Created By</span>
                <span class="font-medium text-black">{{ currentTemplate.created_by || 'Superadmin' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- VIEW 4: TEAM ROSTER                                      -->
        <!-- ======================================================== -->
        <div v-else-if="activeSelection.type === 'team'" class="flex flex-col gap-6 w-full animate-apple-pop">
          <div class="flex items-center justify-between pb-5 border-b border-black/10">
            <div class="flex flex-col gap-0.5">
              <h1 class="text-[24px] sm:text-[26px] font-medium tracking-tight text-black leading-none">
                Team Directory
              </h1>
              <p class="text-[12px] text-neutral-400 font-light">
                {{ teamUsers.length }} active accounts across partner brands
              </p>
            </div>

            <button 
              type="button" 
              @click="showAddUserModal = true"
              class="h-[34px] px-3.5 rounded-[8px] bg-black text-white text-[12px] font-medium flex items-center gap-1.5 hover:bg-neutral-800 transition-colors apple-press cursor-pointer border-none"
            >
              <Plus class="size-3.5" />
              <span>Invite Account</span>
            </button>
          </div>

          <!-- Roster Table -->
          <div class="border border-black/10 rounded-[12px] overflow-hidden bg-white shadow-2xs divide-y divide-black/[0.06]">
            <div 
              v-for="u in teamUsers" 
              :key="u.id"
              class="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors"
            >
              <div class="flex items-center gap-3 min-w-0">
                <div class="size-8 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-medium shrink-0">
                  {{ u.name.slice(0, 2).toUpperCase() }}
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] font-medium text-black truncate">{{ u.name }}</span>
                    <span 
                      class="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9.5px] font-medium border"
                      :class="u.role === 'superadmin' ? 'bg-oxblood-50 text-oxblood-700 border-oxblood-200' : 'bg-black/5 text-neutral-600 border-black/10'"
                    >
                      {{ u.role === 'superadmin' ? 'Superadmin' : 'PIC' }}
                    </span>
                  </div>
                  <span class="text-[11.5px] text-neutral-400 font-mono truncate">{{ u.email }}</span>
                </div>
              </div>

              <!-- User Actions -->
              <div class="flex items-center gap-2 shrink-0">
                <button 
                  type="button" 
                  @click="openPasswordModal(u)"
                  class="text-[11.5px] text-neutral-600 hover:text-black underline underline-offset-2 cursor-pointer bg-transparent border-none p-0"
                >
                  Reset Passkey
                </button>
                <span class="text-neutral-300">|</span>
                <button 
                  type="button" 
                  @click="openEditUserModal(u)"
                  class="text-[11.5px] text-neutral-600 hover:text-black underline underline-offset-2 cursor-pointer bg-transparent border-none p-0"
                >
                  Edit
                </button>
                <button 
                  v-if="u.role !== 'superadmin'"
                  type="button" 
                  @click="handleRemoveUser(u)"
                  class="size-6 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none ml-1"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ======================================================== -->
        <!-- VIEW 5: MEDIA PURGE MAINTENANCE                          -->
        <!-- ======================================================== -->
        <div v-else-if="activeSelection.type === 'media'" class="flex flex-col gap-6 w-full animate-apple-pop">
          <div class="pb-5 border-b border-black/10">
            <h1 class="text-[24px] sm:text-[26px] font-medium tracking-tight text-black leading-none">
              Media Asset Storage
            </h1>
            <p class="text-[12px] text-neutral-400 font-light mt-1">
              Global maintenance for uploaded images across all brand galleries
            </p>
          </div>

          <div class="p-5 rounded-[12px] border border-black/10 bg-neutral-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex flex-col gap-0.5">
              <span class="text-[13.5px] font-medium text-black">Purge Global Media Library</span>
              <span class="text-[12px] text-neutral-500 font-light">Permanently deletes all files across every brand. Live campaigns will revert to placeholders.</span>
            </div>

            <button 
              type="button" 
              @click="handleClearMediaConfirm"
              class="h-[34px] px-4 rounded-[8px] border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[12px] font-medium transition-colors cursor-pointer shrink-0"
            >
              Purge All Media
            </button>
          </div>
        </div>
      </main>
    </div>

    <!-- ======================================================== -->
    <!-- ALL MODALS (Standardized 707 Tokens)                     -->
    <!-- ======================================================== -->

    <!-- Modal 1: Add Brand -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showAddBrandModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddBrandModal = false"
        >
          <div class="w-full max-w-[460px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Add Brand House</h3>
              <button type="button" @click="showAddBrandModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddBrandSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand Name</label>
                  <input v-model="newBrandName" type="text" required placeholder="e.g. Salomon Indonesia" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Subdomain Slug</label>
                  <input v-model="newBrandSlug" type="text" placeholder="salomon" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>
              </div>

              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button type="button" @click="showAddBrandModal = false" class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white text-neutral-700 text-[12px] font-medium cursor-pointer">Cancel</button>
                <button type="submit" class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none">Create Brand</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 2: Brand Details -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showBrandDetailsModal && targetBrandForDetails" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBrandDetailsModal = false"
        >
          <div class="w-full max-w-[500px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Brand Settings</h3>
              <button type="button" @click="showBrandDetailsModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleSaveBrandDetails" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand Name</label>
                  <input v-model="editBrandName" type="text" required class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Subdomain Slug</label>
                  <input v-model="editBrandSlug" type="text" required class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>
              </div>

              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button type="button" @click="showBrandDetailsModal = false" class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white text-neutral-700 text-[12px] font-medium cursor-pointer">Cancel</button>
                <button type="submit" class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none">Save</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 3: Add User -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showAddUserModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddUserModal = false"
        >
          <div class="w-full max-w-[460px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Invite Account</h3>
              <button type="button" @click="showAddUserModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddUserSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Full Name</label>
                  <input v-model="newUserName" type="text" required placeholder="Designer Name" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Email</label>
                  <input v-model="newUserEmail" type="email" required placeholder="name@brand.com" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Role</label>
                    <select v-model="newUserRole" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none">
                      <option value="editor">Brand PIC</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand House</label>
                    <select v-model="newUserBrand" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none">
                      <option value="all">All Brands</option>
                      <option v-for="b in brandStore.brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button type="button" @click="showAddUserModal = false" class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white text-neutral-700 text-[12px] font-medium cursor-pointer">Cancel</button>
                <button type="submit" class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 4: Edit User -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showEditUserModal && targetUserForEdit" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditUserModal = false"
        >
          <div class="w-full max-w-[460px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Edit Team Account</h3>
              <button type="button" @click="showEditUserModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditUserSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Name</label>
                  <input v-model="editUserName" type="text" required class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none" />
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Email</label>
                  <input v-model="editUserEmail" type="email" required class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none" />
                </div>
              </div>

              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button type="button" @click="showEditUserModal = false" class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white text-neutral-700 text-[12px] font-medium cursor-pointer">Cancel</button>
                <button type="submit" class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 5: Password Reset -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showPasswordModal && targetUserForPassword" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showPasswordModal = false"
        >
          <div class="w-full max-w-[420px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Reset Passkey</h3>
              <button type="button" @click="showPasswordModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 flex flex-col gap-4">
              <p class="text-[12.5px] text-neutral-600 font-light">
                Generate a secure temporary passkey for <b class="text-black font-medium">{{ targetUserForPassword.name }}</b>.
              </p>

              <div class="flex items-center justify-between p-3 rounded-[8px] bg-black/[0.04] border border-black/10">
                <span class="font-mono text-[14px] font-medium text-black">{{ updatedPasswordValue }}</span>
                <button type="button" @click="copyResetPassword" class="text-[11.5px] font-medium text-black underline underline-offset-2 cursor-pointer bg-transparent border-none p-0">Copy</button>
              </div>

              <button 
                type="button" 
                @click="handlePasswordUpdateSubmit"
                class="w-full h-[34px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none shadow-2xs"
              >
                Apply New Passkey
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 6: Build Master Template -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showBuildTemplateModal" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBuildTemplateModal = false"
        >
          <div class="w-full max-w-[500px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Build Master Activation Blueprint</h3>
              <button type="button" @click="showBuildTemplateModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleBuildTemplateSubmit(false)" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Template Title</label>
                  <input v-model="newTemplateName" type="text" required placeholder="e.g. VIP RSVP & Guest E-Pass" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Category</label>
                    <select v-model="newTemplateCategory" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none">
                      <option value="raffle">Raffle Drop</option>
                      <option value="rsvp">VIP RSVP Pass</option>
                      <option value="hype_drop">Hype Drop</option>
                      <option value="pass">Guest E-Pass</option>
                      <option value="lookbook">Lookbook</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Status</label>
                    <select v-model="newTemplateStatus" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Description</label>
                  <textarea v-model="newTemplateDesc" rows="2" placeholder="Guidelines for brand designers..." class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white resize-none" />
                </div>
              </div>

              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-between">
                <button type="button" @click="handleBuildTemplateSubmit(true)" class="text-[12px] font-medium text-black hover:opacity-75 underline cursor-pointer bg-transparent border-none p-0">Open & Build in Canvas →</button>
                <div class="flex items-center gap-2">
                  <button type="button" @click="showBuildTemplateModal = false" class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white text-neutral-700 text-[12px] font-medium cursor-pointer">Cancel</button>
                  <button type="submit" class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none">Save Blueprint</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 7: Edit Template -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showEditTemplateModal && targetTemplateForEdit" 
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditTemplateModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between shrink-0">
              <h3 class="text-[15px] font-medium text-black">Edit Template Blueprint</h3>
              <button type="button" @click="showEditTemplateModal = false" class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-400 hover:text-black cursor-pointer transition-colors bg-transparent border-none">
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditTemplateSubmit" class="flex flex-col">
              <div class="p-5 flex flex-col gap-3.5">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Title</label>
                  <input v-model="editTemplateName" type="text" required class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Category</label>
                    <select v-model="editTemplateCategory" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none">
                      <option value="raffle">Raffle Drop</option>
                      <option value="rsvp">VIP RSVP Pass</option>
                      <option value="hype_drop">Hype Drop</option>
                      <option value="pass">Guest E-Pass</option>
                      <option value="lookbook">Lookbook</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <div class="flex flex-col gap-1">
                    <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Status</label>
                    <select v-model="editTemplateStatus" class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="px-5 py-3.5 bg-neutral-50/50 border-t border-black/10 flex items-center justify-end gap-2">
                <button type="button" @click="showEditTemplateModal = false" class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white text-neutral-700 text-[12px] font-medium cursor-pointer">Cancel</button>
                <button type="submit" class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium apple-press cursor-pointer border-none">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 8: What's New Tour Modal -->
    <WhatsNewModal
      :is-open="showWhatsNewModal"
      @close="showWhatsNewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  ArrowLeft, LogOut, Plus, Trash2, X, Layers, Users, ExternalLink, ChevronRight
} from 'lucide-vue-next';

import { useAuthStore, type UserAccount, type UserRole } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { glassConfirm, glassPrompt } from '../services/glassDialog.ts';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';
import type { Brand, GlobalTemplate, ProjectItem, WidgetItem } from '../types/editor.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();

const showUserProfileModal = ref(false);
const showWhatsNewModal = ref(false);

const userInitials = computed(() => {
  const name = authStore.currentUser?.name || 'Superadmin Lead';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

function handleExitAdmin() {
  router.push('/');
}

function handleOpenProjects() {
  showUserProfileModal.value = false;
  router.push('/hub');
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

// ----------------------------------------------------
// Studio Split Selection Architecture (Concept 2)
// ----------------------------------------------------
type SelectionType = 'brand' | 'template' | 'review' | 'team' | 'media';
interface NavSelection {
  type: SelectionType;
  id?: string;
}

const activeSelection = ref<NavSelection>({
  type: 'brand',
  id: ''
});

function isSelected(type: SelectionType, id?: string): boolean {
  if (activeSelection.value.type !== type) return false;
  if (id !== undefined) return activeSelection.value.id === id;
  return true;
}

function selectItem(type: SelectionType, id?: string) {
  activeSelection.value = { type, id };
}

// Pending Review projects
const pendingProjects = computed(() => {
  return editorStore.projects.filter(isAwaitingReview);
});

function isAwaitingReview(p: ProjectItem): boolean {
  return p.status === 'pending_review' || Boolean(p.pending_update_at);
}

function isLiveProject(p: ProjectItem): boolean {
  return Number(p.live_version || 0) > 0 || p.status === 'approved' || p.status === 'published';
}

function formatProjectStatus(p: ProjectItem): string {
  if (isLiveProject(p)) return 'Live';
  if (isAwaitingReview(p)) return 'Review Required';
  return 'Draft';
}

function getBrandDropCount(brand: Brand): number {
  return editorStore.projects.filter(p => p.brand_id === brand.id || p.brand_slug === brand.slug).length;
}

// Active Entities on Main Stage
const currentBrand = computed(() => {
  if (activeSelection.value.type === 'brand') {
    return brandStore.brands.find(b => b.id === activeSelection.value.id) || brandStore.brands[0];
  }
  return null;
});

const currentBrandProjects = computed(() => {
  if (!currentBrand.value) return [];
  return editorStore.projects.filter(p => p.brand_id === currentBrand.value!.id || p.brand_slug === currentBrand.value!.slug);
});

const currentBrandUsers = computed(() => {
  if (!currentBrand.value) return [];
  const bId = currentBrand.value.id;
  const bSlug = currentBrand.value.slug;
  return teamUsers.value.filter(u => u.assignedBrands?.includes(bId) || u.assignedBrands?.includes(bSlug));
});

const currentReviewProject = computed(() => {
  if (activeSelection.value.type === 'review') {
    return pendingProjects.value.find(p => p.id === activeSelection.value.id) || pendingProjects.value[0];
  }
  return null;
});

const currentTemplate = computed(() => {
  if (activeSelection.value.type === 'template') {
    return brandStore.templates.find(t => t.id === activeSelection.value.id) || brandStore.templates[0];
  }
  return null;
});

const teamUsers = computed(() => {
  return authStore.users.filter(u => !u.status || u.status === 'active');
});

// Navigation initialization
onMounted(async () => {
  await brandStore.loadBrands();
  await brandStore.loadTemplates();
  await authStore.loadUsers();

  // If there are pending reviews, automatically highlight the review gate first!
  if (pendingProjects.value.length > 0) {
    selectItem('review', pendingProjects.value[0].id);
  } else if (brandStore.brands.length > 0) {
    selectItem('brand', brandStore.brands[0].id);
  }
});

watch(() => brandStore.brands, (brands) => {
  if (activeSelection.value.type === 'brand' && !activeSelection.value.id && brands.length > 0) {
    activeSelection.value.id = brands[0].id;
  }
}, { immediate: true });

function openBrandInStudio(brand: Brand) {
  brandStore.setActiveBrand(brand);
  router.push('/editor');
}

function handleCreateCampaignForBrand(brand: Brand) {
  brandStore.setActiveBrand(brand);
  editorStore.createNewProject(`${brand.name} Campaign Drop`, undefined, []);
  router.push('/editor');
}

function handleInspectProject(project: ProjectItem) {
  const brand = brandStore.brands.find(b => b.id === project.brand_id || b.slug === project.brand_slug);
  if (brand) brandStore.setActiveBrand(brand);
  editorStore.openProjectById(project.id);
  router.push('/editor');
}

async function handleApproveProject(projectId: string) {
  const p = editorStore.projects.find(proj => proj.id === projectId);
  if (!p || !(await glassConfirm({ 
    title: isLiveProject(p) ? 'Publish update?' : 'Approve & publish?', 
    message: isLiveProject(p) ? `Visitors of "${p.title}" will see the update immediately.` : `"${p.title}" becomes public immediately.`, 
    confirmLabel: 'Publish' 
  }))) return;
  try {
    const res = await editorStore.transitionProject(projectId, 'publish');
    if (res.ok) {
      editorStore.showToast(`Published "${p.title}".`);
      if (activeSelection.value.type === 'review') {
        if (pendingProjects.value.length > 0) {
          selectItem('review', pendingProjects.value[0].id);
        } else if (brandStore.brands.length > 0) {
          selectItem('brand', brandStore.brands[0].id);
        }
      }
    } else {
      editorStore.showToast(res.error || 'Could not approve project.');
    }
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not approve project.');
  }
}

async function handleDeclineProject(projectId: string) {
  const p = editorStore.projects.find(proj => proj.id === projectId);
  const note = await glassPrompt({
    title: 'Request changes',
    message: `Tell the brand what to change in "${p?.title || 'this project'}".`,
    placeholder: 'e.g. Use high-res logo and adjust launch date',
    confirmLabel: 'Send back'
  });
  if (note === null) return;
  try {
    const res = await editorStore.transitionProject(projectId, 'decline', note);
    if (res.ok) {
      editorStore.showToast(`Sent "${p?.title || 'Drop'}" back to the brand.`);
      if (activeSelection.value.type === 'review') {
        if (pendingProjects.value.length > 0) {
          selectItem('review', pendingProjects.value[0].id);
        } else if (brandStore.brands.length > 0) {
          selectItem('brand', brandStore.brands[0].id);
        }
      }
    } else {
      editorStore.showToast(res.error || 'Could not decline project.');
    }
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not decline project.');
  }
}

async function handleDeleteProject(projectId: string) {
  if (await glassConfirm({ title: 'Delete drop?', message: 'This will permanently remove the campaign drop.', confirmLabel: 'Delete', danger: true })) {
    try {
      await editorStore.deleteProject(projectId);
      editorStore.showToast('Campaign deleted.');
    } catch (err: any) {
      editorStore.showToast(err?.message || 'Could not delete project.');
    }
  }
}

// ----------------------------------------------------
// Modal Handlers & Operations
// ----------------------------------------------------
const showAddBrandModal = ref(false);
const newBrandName = ref('');
const newBrandSlug = ref('');

async function handleAddBrandSubmit() {
  if (!newBrandName.value.trim()) return;
  const slug = newBrandSlug.value.trim() || newBrandName.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  try {
    const created = await brandStore.addBrand({ name: newBrandName.value.trim(), slug });
    editorStore.showToast(`Brand "${created.name}" created.`);
    showAddBrandModal.value = false;
    newBrandName.value = '';
    newBrandSlug.value = '';
    selectItem('brand', created.id);
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not create brand.');
  }
}

const showBrandDetailsModal = ref(false);
const targetBrandForDetails = ref<Brand | null>(null);
const editBrandName = ref('');
const editBrandSlug = ref('');

function openBrandDetailsModal(brand: Brand) {
  targetBrandForDetails.value = brand;
  editBrandName.value = brand.name;
  editBrandSlug.value = brand.slug;
  showBrandDetailsModal.value = true;
}

async function handleSaveBrandDetails() {
  if (!targetBrandForDetails.value || !editBrandName.value.trim()) return;
  try {
    await brandStore.updateBrand(targetBrandForDetails.value.id, {
      name: editBrandName.value.trim(),
      slug: editBrandSlug.value.trim()
    });
    editorStore.showToast(`Updated "${editBrandName.value}".`);
    showBrandDetailsModal.value = false;
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not update brand.');
  }
}

async function handleRemoveBrand(brand: Brand) {
  if (await glassConfirm({ title: 'Remove brand house?', message: `All projects under "${brand.name}" will be detached.`, confirmLabel: 'Remove', danger: true })) {
    try {
      await brandStore.removeBrand(brand.id);
      editorStore.showToast(`Brand removed.`);
      if (brandStore.brands.length > 0) {
        selectItem('brand', brandStore.brands[0].id);
      }
    } catch (err: any) {
      editorStore.showToast(err?.message || 'Could not remove brand.');
    }
  }
}

// User Accounts
const showAddUserModal = ref(false);
const newUserName = ref('');
const newUserEmail = ref('');
const newUserRole = ref<'editor' | 'superadmin'>('editor');
const newUserBrand = ref('all');

async function handleAddUserSubmit() {
  if (!newUserName.value.trim() || !newUserEmail.value.trim()) return;
  try {
    await authStore.addUser({
      name: newUserName.value.trim(),
      email: newUserEmail.value.trim(),
      role: newUserRole.value,
      assignedBrands: [newUserBrand.value],
      status: 'active'
    });
    editorStore.showToast(`Invited ${newUserName.value}.`);
    showAddUserModal.value = false;
    newUserName.value = '';
    newUserEmail.value = '';
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not create account.');
  }
}

const showEditUserModal = ref(false);
const targetUserForEdit = ref<UserAccount | null>(null);
const editUserName = ref('');
const editUserEmail = ref('');

function openEditUserModal(user: UserAccount) {
  targetUserForEdit.value = user;
  editUserName.value = user.name;
  editUserEmail.value = user.email;
  showEditUserModal.value = true;
}

async function handleEditUserSubmit() {
  if (!targetUserForEdit.value || !editUserName.value.trim()) return;
  try {
    await authStore.updateUser(targetUserForEdit.value.id, {
      name: editUserName.value.trim(),
      email: editUserEmail.value.trim()
    });
    editorStore.showToast('Account updated.');
    showEditUserModal.value = false;
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not update account.');
  }
}

async function handleRemoveUser(user: UserAccount) {
  if (await glassConfirm({ title: 'Remove account?', message: `Remove ${user.name} from studio access.`, confirmLabel: 'Remove', danger: true })) {
    try {
      await authStore.removeUser(user.id);
      editorStore.showToast('Account removed.');
    } catch (err: any) {
      editorStore.showToast(err?.message || 'Could not remove account.');
    }
  }
}

// Password Reset
const showPasswordModal = ref(false);
const targetUserForPassword = ref<UserAccount | null>(null);
const updatedPasswordValue = ref('');

function openPasswordModal(user: UserAccount) {
  targetUserForPassword.value = user;
  updatedPasswordValue.value = Math.random().toString(36).slice(-8);
  showPasswordModal.value = true;
}

async function handlePasswordUpdateSubmit() {
  if (!targetUserForPassword.value || !updatedPasswordValue.value) return;
  try {
    await authStore.updateUserPassword(targetUserForPassword.value.id, updatedPasswordValue.value);
    editorStore.showToast('Passkey updated.');
    showPasswordModal.value = false;
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not reset password.');
  }
}

function copyResetPassword() {
  navigator.clipboard.writeText(updatedPasswordValue.value);
  editorStore.showToast('Copied passkey to clipboard.');
}

// Templates
const showBuildTemplateModal = ref(false);
const newTemplateName = ref('');
const newTemplateCategory = ref<'raffle' | 'rsvp' | 'hype_drop' | 'lookbook' | 'pass' | 'custom'>('raffle');
const newTemplateStatus = ref<'published' | 'draft'>('published');
const newTemplateDesc = ref('');

function openBuildTemplateModal() {
  newTemplateName.value = '';
  newTemplateCategory.value = 'raffle';
  newTemplateStatus.value = 'published';
  newTemplateDesc.value = '';
  showBuildTemplateModal.value = true;
}

function handleBuildTemplateSubmit(openInStudio = false) {
  if (!newTemplateName.value.trim()) return;
  const newTpl: GlobalTemplate = {
    id: `tpl-${Date.now()}`,
    name: newTemplateName.value.trim(),
    slug: newTemplateName.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: newTemplateCategory.value,
    status: newTemplateStatus.value,
    description: newTemplateDesc.value || 'Master blueprint for brand drops.',
    widget_tree: [],
    is_global_preset: true,
    created_by: 'Superadmin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  brandStore.addTemplate(newTpl);
  showBuildTemplateModal.value = false;
  editorStore.showToast(`Blueprint "${newTpl.name}" created.`);
  selectItem('template', newTpl.id);

  if (openInStudio) {
    handleEditInStudio(newTpl);
  }
}

const showEditTemplateModal = ref(false);
const targetTemplateForEdit = ref<GlobalTemplate | null>(null);
const editTemplateName = ref('');
const editTemplateCategory = ref<'raffle' | 'rsvp' | 'hype_drop' | 'lookbook' | 'pass' | 'custom'>('raffle');
const editTemplateStatus = ref<'published' | 'draft'>('published');

function openEditTemplateModal(tpl: GlobalTemplate) {
  targetTemplateForEdit.value = tpl;
  editTemplateName.value = tpl.name;
  editTemplateCategory.value = tpl.category;
  editTemplateStatus.value = tpl.status || 'published';
  showEditTemplateModal.value = true;
}

function handleEditTemplateSubmit() {
  if (!targetTemplateForEdit.value || !editTemplateName.value.trim()) return;
  brandStore.updateTemplate(targetTemplateForEdit.value.id, {
    name: editTemplateName.value.trim(),
    category: editTemplateCategory.value,
    status: editTemplateStatus.value
  });
  editorStore.showToast('Template updated.');
  showEditTemplateModal.value = false;
}

async function handleRemoveTemplate(tpl: GlobalTemplate) {
  if (await glassConfirm({ title: 'Remove blueprint?', message: `Remove "${tpl.name}" from foundry.`, confirmLabel: 'Remove', danger: true })) {
    brandStore.removeTemplate(tpl.id);
    editorStore.showToast('Blueprint removed.');
    if (brandStore.templates.length > 0) {
      selectItem('template', brandStore.templates[0].id);
    }
  }
}

function handleEditInStudio(tpl: GlobalTemplate) {
  editorStore.openTemplateInStudio(tpl);
  router.push(`/editor/template/${encodeURIComponent(tpl.id)}`);
}

async function handleClearMediaConfirm() {
  if (await glassConfirm({ title: 'Purge all media?', message: 'Every uploaded image file across all brand libraries will be permanently deleted.', confirmLabel: 'Purge', danger: true })) {
    try {
      const res = await fetch('/api/media', { method: 'DELETE' });
      if (res.ok) {
        editorStore.showToast('All global media files purged.');
      } else {
        editorStore.showToast('Could not purge media.');
      }
    } catch {
      editorStore.showToast('Failed to purge media.');
    }
  }
}

function formatDate(iso?: string): string {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>
