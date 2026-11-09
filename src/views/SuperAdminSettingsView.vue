<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col justify-between bg-[#0a0a0a] text-white font-sans relative select-none hub-root dark-dev-portal" data-name="707 Dev Portal">
    
    <!-- 1. Main Header strictly matching user mode tokens with subroute indicator (Inverted Obsidian Dark) -->
    <header 
      class="w-full h-[48px] px-[24px] py-[8px] flex items-center justify-between shrink-0 z-40 transition-colors"
      :class="currentTab ? 'sticky top-0 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/[0.08]' : 'absolute top-0 left-0 right-0 bg-transparent border-b-transparent'"
      data-name="Header"
    >
      <!-- Left: 707 Logo (Inverted White) + Dev Badge only -->
      <div class="flex items-center gap-[10px] h-[20px]" data-name="Logo">
        <router-link to="/dev" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-85 transition-opacity" title="707 Design Studio">
          <img 
            :src="FIGMA_ASSETS.logoDesignStudio" 
            alt="707 Design Studio" 
            class="h-[18px] w-auto object-contain pointer-events-none brightness-0 invert" 
          />
        </router-link>
        <span class="inline-flex items-center px-1.5 py-[2px] rounded-[5px] bg-white/[0.08] border border-white/15 text-[10px] font-mono font-medium text-white/90 leading-none whitespace-nowrap select-none">
          Dev
        </span>

        <!-- Return to Dev Home Breadcrumb Button (when inside subroute) -->
        <template v-if="currentTab">
          <span class="text-neutral-600">/</span>
          <router-link 
            to="/dev" 
            class="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-white/10"
            title="Return to Dev Home (ESC)"
          >
            <ChevronLeft class="w-3.5 h-3.5 stroke-[2]" />
            <span>Home</span>
          </router-link>
        </template>
      </div>

      <!-- Right: Notifications & Profile Icon (Inverted) -->
      <div class="flex items-center gap-[24px]" data-name="Icons Container">
        <!-- Bell Notification Icon with Inverted White Bell -->
        <NotificationsMenu v-if="authStore.isAuthenticated" :dark="true" class="[&_button]:text-white [&_svg]:text-white [&_span]:ring-[#0a0a0a]" />

        <!-- Minimal Profile / User Icon -->
        <div class="relative flex items-center">
          <button 
            @click="showUserProfileModal = !showUserProfileModal"
            class="relative size-[24px] flex items-center justify-center apple-press cursor-pointer hover:opacity-80 transition-opacity border-0 border-none outline-none bg-transparent shadow-none p-0 shrink-0 text-white group"
            title="Dev Profile"
          >
            <div class="relative size-[22px] rounded-full bg-white text-black flex items-center justify-center font-707 text-[10px] font-semibold tracking-tight shadow-xs select-none transition-transform duration-200 group-hover:scale-105">
              {{ userInitials }}
              <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-moss-500 border border-[#0a0a0a]" />
            </div>
          </button>

          <!-- Anchored UserProfileModal -->
          <UserProfileModal
            v-if="authStore.isAuthenticated"
            :is-open="showUserProfileModal"
            :dark="true"
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

    <!-- 2. Centered Main Content Hub (Shown when on /dev home: Smoked Glass) -->
    <main 
      v-if="!currentTab"
      class="relative flex-1 w-full h-full overflow-hidden flex flex-col items-center select-none"
      data-name="Main Content Container"
    >
      <!-- Grouped Headline + Categories Shortcut Section: Centered at 50vh -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center w-full max-w-[800px] px-4 pointer-events-auto">
        <section class="flex flex-col items-center gap-[28px] md:gap-[32px] w-full shrink-0" data-name="Intro Container">
          
          <!-- Smart Dynamic Editorial Dev Headline (Crisp White) -->
          <h1 class="font-707 text-[28px] md:text-[30px] font-normal text-white text-center tracking-[-0.56px] leading-[36px] max-w-[780px] [text-wrap:balance] transition-all duration-300">
            {{ adaptiveDevGreeting }}
          </h1>

          <!-- 4 Aligned Icons Container (Exact user mode gap & button tokens, default container hidden) -->
          <div class="flex gap-[32px] md:gap-[40px] items-start justify-center px-[16px] py-[8px] w-full" data-name="Buttons Container">
            
            <!-- 1. Review Gate -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-name="Button Container">
              <div class="relative size-[88px]">
                <button 
                  @click="router.push('/dev/review')"
                  class="category-menu-btn apple-glass-btn flex items-center justify-center p-[8px] rounded-[12px] size-full apple-press cursor-pointer transition-all duration-200 group bg-transparent hover:bg-white/[0.08] active:bg-white/[0.14]"
                  title="Review Gate: Pending Drop Submissions"
                >
                  <div class="size-[32px] relative shrink-0 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                    <Layers class="size-full stroke-[1.4] transition-transform duration-200 group-hover:scale-105" />
                  </div>
                </button>

                <!-- Pending count badge -->
                <span 
                  v-if="pendingProjects.length > 0"
                  class="absolute -top-1.5 -right-1.5 bg-white text-black font-707 text-[8.5px] tracking-wider uppercase px-1.5 py-0.5 rounded-[4px] pointer-events-none shadow-xs font-semibold"
                >
                  {{ pendingProjects.length }} New
                </span>
              </div>
              <p class="font-707 text-[13px] md:text-[14px] text-white/80 group-hover:text-white text-center leading-[18px] font-normal transition-colors">
                Review Gate
              </p>
            </div>

            <!-- 2. Brand Houses -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-name="Button Container">
              <button 
                @click="router.push('/dev/brands')"
                class="category-menu-btn apple-glass-btn flex items-center justify-center p-[8px] rounded-[12px] size-[88px] apple-press cursor-pointer transition-all duration-200 group bg-transparent hover:bg-white/[0.08] active:bg-white/[0.14]"
                title="Brand Houses Directory"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                  <Building2 class="size-full stroke-[1.4] transition-transform duration-200 group-hover:scale-105" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-white/80 group-hover:text-white text-center leading-[18px] font-normal transition-colors">
                Brand Houses
              </p>
            </div>

            <!-- 3. Foundry Blueprints -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-name="Button Container">
              <button 
                @click="router.push('/dev/foundry')"
                class="category-menu-btn apple-glass-btn flex items-center justify-center p-[8px] rounded-[12px] size-[88px] apple-press cursor-pointer transition-all duration-200 group bg-transparent hover:bg-white/[0.08] active:bg-white/[0.14]"
                title="Master Blueprints & Presets"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                  <Boxes class="size-full stroke-[1.4] transition-transform duration-200 group-hover:scale-105" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-white/80 group-hover:text-white text-center leading-[18px] font-normal transition-colors">
                Foundry
              </p>
            </div>

            <!-- 4. Team Roster -->
            <div class="flex flex-col gap-[10px] items-center justify-center w-[96px]" data-name="Button Container">
              <button 
                @click="router.push('/dev/roster')"
                class="category-menu-btn apple-glass-btn flex items-center justify-center p-[8px] rounded-[12px] size-[88px] apple-press cursor-pointer transition-all duration-200 group bg-transparent hover:bg-white/[0.08] active:bg-white/[0.14]"
                title="Team Access & Roster"
              >
                <div class="size-[32px] relative shrink-0 flex items-center justify-center text-white/80 group-hover:text-white transition-colors">
                  <Users class="size-full stroke-[1.4] transition-transform duration-200 group-hover:scale-105" />
                </div>
              </button>
              <p class="font-707 text-[13px] md:text-[14px] text-white/80 group-hover:text-white text-center leading-[18px] font-normal transition-colors">
                Team Roster
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>

    <!-- 3. Full-Page Sub-Route Workspaces (Option 2: Following Global Padding w-full px-[24px]) -->
    <main 
      v-else
      class="flex-1 w-full overflow-y-auto select-none px-[24px] py-[20px] md:py-[24px]"
      data-name="Subroute Workspace Container"
    >
      <div class="w-full flex flex-col gap-6">
        
        <!-- Header Banner -->
        <div class="flex flex-col gap-1 pb-4 border-b border-white/[0.08]">
          <div class="flex items-center gap-2">
            <h2 class="text-[22px] font-medium text-white font-707 tracking-tight">
              {{ subrouteMeta.title }}
            </h2>
            <span 
              v-if="subrouteMeta.count !== undefined" 
              class="px-2 py-0.5 rounded-[5px] bg-white/[0.08] text-[11px] font-mono text-white/90 font-medium border border-white/10"
            >
              {{ subrouteMeta.count }}
            </span>
          </div>
          <p class="text-[13px] text-neutral-400 font-light">
            {{ subrouteMeta.description }}
          </p>
        </div>

        <!-- SUBROUTE 1: REVIEW GATE -->
        <div v-if="currentTab === 'review'" class="flex flex-col gap-6">
          <div v-if="pendingProjects.length === 0" class="py-20 text-center flex flex-col items-center justify-center gap-3 bg-transparent rounded-[16px] border border-white/[0.08]">
            <div class="size-12 rounded-full bg-moss-950/60 text-moss-300 flex items-center justify-center border border-moss-700/50">
              <CheckCircle2 class="size-6 stroke-[1.6]" />
            </div>
            <div class="flex flex-col gap-1 items-center">
              <h3 class="text-[17px] font-medium text-white">All runway releases are signed off</h3>
              <p class="text-[13px] font-mono text-neutral-400 max-w-[420px]">
                No drops currently awaiting sign-off. Newly submitted brand activations will appear here immediately.
              </p>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 gap-4">
            <div 
              v-for="p in pendingProjects" 
              :key="p.id"
              class="p-6 bg-transparent rounded-[16px] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div class="flex flex-col gap-2 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-black font-semibold">
                    {{ p.brand_slug || 'atmos' }}
                  </span>
                  <span class="text-[10.5px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                    {{ p.pending_update_at ? 'Live Update Sign-Off' : 'New Drop Release' }}
                  </span>
                  <span class="text-[11px] font-mono text-neutral-400">
                    Submitted {{ formatDate(p.pending_update_at || p.updated_at) }}
                  </span>
                </div>

                <h3 class="text-[20px] font-medium text-white truncate">{{ p.title }}</h3>
                
                <span class="text-[12px] font-mono text-neutral-400">
                  Public Destination: <code class="px-1.5 py-0.5 rounded bg-white/[0.08] text-white/90">/{{ p.brand_slug || 'atmos' }}/{{ p.slug }}</code>
                </span>
              </div>

              <div class="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  @click="handleInspectProject(p)"
                  class="h-[36px] px-4 rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[11.5px] font-mono uppercase tracking-wider text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  <span>Inspect Drop</span>
                </button>
                <button
                  type="button"
                  @click="handleDeclineProject(p.id)"
                  class="h-[36px] px-4 rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-red-950/40 text-[11.5px] font-mono uppercase tracking-wider text-neutral-300 hover:text-red-400 hover:border-red-800/40 transition-colors cursor-pointer"
                >
                  Request Changes
                </button>
                <button
                  type="button"
                  @click="handleApproveProject(p.id)"
                  class="h-[36px] px-5 rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[11.5px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5 shadow-xs font-semibold"
                >
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Approve Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SUBROUTE 2: BRAND HOUSES -->
        <div v-if="currentTab === 'brands'" class="flex flex-col gap-6">
          <!-- Search & Action Toolbar -->
          <div class="flex items-center justify-between gap-4">
            <div class="relative w-full max-w-[340px]">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input 
                v-model="brandSearchQuery"
                type="text" 
                placeholder="Filter brand houses..." 
                class="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-white/10 bg-[#141414] text-[13px] text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
              />
            </div>

            <button 
              type="button" 
              @click="showAddBrandModal = true" 
              class="h-[36px] px-3.5 rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5 apple-press shadow-xs font-semibold shrink-0"
            >
              <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Brand House</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <div 
              v-for="brand in filteredBrands" 
              :key="brand.id"
              class="bg-[#141414] rounded-[16px] border border-white/10 hover:border-white/20 p-5 flex flex-col justify-between gap-5 shadow-xs hover:shadow-md transition-all"
            >
              <div class="flex flex-col gap-3.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-[10px] bg-white text-black flex items-center justify-center font-707 text-[14px] font-semibold uppercase tracking-tight">
                      {{ brand.name.slice(0, 2) }}
                    </div>
                    <div class="flex flex-col">
                      <h3 class="text-[17px] font-medium text-white leading-tight">{{ brand.name }}</h3>
                      <span class="text-[11.5px] font-mono text-neutral-400">/{{ brand.slug }}</span>
                    </div>
                  </div>
                  
                  <span class="px-2 py-0.5 rounded-[5px] bg-white/[0.08] border border-white/10 text-[11px] font-mono text-neutral-300 font-medium">
                    {{ getBrandDropCount(brand) }} {{ getBrandDropCount(brand) === 1 ? 'Drop' : 'Drops' }}
                  </span>
                </div>

                <div class="flex items-center flex-wrap gap-1.5 text-[11px] font-mono">
                  <span class="text-neutral-500">Team:</span>
                  <span 
                    v-for="pic in getBrandPics(brand)" 
                    :key="pic.id" 
                    class="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/5"
                  >
                    {{ pic.name }}
                  </span>
                  <span v-if="getBrandPics(brand).length === 0" class="text-neutral-500 italic">None assigned</span>
                </div>

                <div v-if="getBrandProjects(brand).length > 0" class="flex flex-col divide-y divide-white/[0.05] border-t border-white/[0.08] pt-2">
                  <div 
                    v-for="p in getBrandProjects(brand).slice(0, 3)" 
                    :key="p.id"
                    class="py-1.5 flex items-center justify-between text-[12px]"
                  >
                    <span class="truncate max-w-[180px] text-neutral-300">{{ p.title }}</span>
                    <span 
                      class="text-[9.5px] font-mono px-1.5 py-0.2 rounded border uppercase font-medium"
                      :class="isLiveProject(p) ? 'bg-moss-950/60 text-moss-300 border-moss-700/50' : 'bg-white/[0.06] text-neutral-400 border-white/10'"
                    >
                      {{ formatProjectStatus(p) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pt-3.5 border-t border-white/[0.08]">
                <button
                  type="button"
                  @click="openBrandDetailsModal(brand)"
                  class="h-[32px] px-3 rounded-[8px] border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-[11.5px] font-mono uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Configure brand name and slug"
                >
                  <Settings class="w-3.5 h-3.5 text-neutral-400" />
                  <span>Settings</span>
                </button>

                <button
                  type="button"
                  @click="handleAddPicForBrand(brand)"
                  class="h-[32px] px-3.5 rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[11.5px] font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer border-none flex items-center gap-1.5 apple-press shadow-xs"
                  :title="`Assign a new team PIC to ${brand.name}`"
                >
                  <UserPlus class="w-3.5 h-3.5 stroke-[2]" />
                  <span>+ Add PIC</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SUBROUTE 3: FOUNDRY -->
        <div v-else-if="currentTab === 'foundry'" class="flex flex-col gap-6">
          <!-- Filter & Action Toolbar -->
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <button 
                v-for="cat in ['all', 'raffle', 'rsvp', 'hype_drop', 'lookbook', 'pass']" 
                :key="cat"
                @click="selectedFoundryCategory = cat"
                :class="selectedFoundryCategory === cat ? 'bg-white text-black font-semibold' : 'bg-[#141414] text-neutral-400 hover:text-white border border-white/10'"
                class="px-3 py-1.5 rounded-[8px] text-[11.5px] font-mono uppercase tracking-wider transition-all cursor-pointer border-none whitespace-nowrap"
              >
                {{ cat === 'all' ? 'All Frameworks' : cat.replace('_', ' ') }}
              </button>
            </div>

            <button 
              type="button" 
              @click="openBuildTemplateModal" 
              class="h-[36px] px-3.5 rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5 apple-press shadow-xs font-semibold shrink-0"
            >
              <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
              <span>New Blueprint</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <div 
              v-for="tpl in filteredFoundryTemplates" 
              :key="tpl.id"
              class="bg-[#141414] rounded-[16px] border border-white/10 p-5 flex flex-col justify-between gap-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:border-white/20 transition-all"
            >
              <div class="flex flex-col gap-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/10 font-medium">
                    {{ tpl.category || 'raffle' }}
                  </span>
                  <span 
                    class="text-[9.5px] font-mono px-1.5 py-0.5 rounded border uppercase font-medium"
                    :class="tpl.status === 'published' ? 'bg-moss-950/60 text-moss-300 border-moss-700/50' : 'bg-white/[0.06] text-neutral-400 border-white/10'"
                  >
                    {{ tpl.status || 'published' }}
                  </span>
                </div>

                <h3 class="text-[17px] font-medium text-white">{{ tpl.name }}</h3>
                <p class="text-[12.5px] text-neutral-400 font-light line-clamp-2">
                  {{ tpl.description || 'Master layout framework preset.' }}
                </p>
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="openEditTemplateModal(tpl)"
                    class="text-[11.5px] font-mono uppercase text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    Edit
                  </button>
                  <span class="text-neutral-600">·</span>
                  <button
                    type="button"
                    @click="handleRemoveTemplate(tpl)"
                    class="text-[11.5px] font-mono uppercase text-neutral-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    Remove
                  </button>
                </div>

                <button
                  type="button"
                  @click="handleEditInStudio(tpl)"
                  class="h-[30px] px-3 rounded-[6px] bg-white text-black hover:bg-neutral-200 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1 font-semibold"
                >
                  <span>Open in Studio</span>
                  <ExternalLink class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SUBROUTE 4: TEAM ROSTER -->
        <div v-else-if="currentTab === 'roster'" class="flex flex-col gap-6">
          
          <!-- 1. Executive Summary Metric Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              type="button"
              @click="selectedRoleFilter = 'all'"
              class="p-3.5 rounded-[12px] text-left transition-all cursor-pointer border"
              :class="selectedRoleFilter === 'all' ? 'bg-white/[0.08] border-white/30 shadow-xs' : 'bg-[#141414] border-white/10 hover:border-white/20'"
            >
              <div class="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Total Personnel</div>
              <div class="text-[22px] font-medium text-white font-707 mt-1">{{ teamUsers.length }}</div>
              <div class="text-[11px] font-mono text-neutral-500 mt-0.5">Active studio accounts</div>
            </button>

            <button 
              type="button"
              @click="selectedRoleFilter = 'superadmin'"
              class="p-3.5 rounded-[12px] text-left transition-all cursor-pointer border"
              :class="selectedRoleFilter === 'superadmin' ? 'bg-white/[0.08] border-white/30 shadow-xs' : 'bg-[#141414] border-white/10 hover:border-white/20'"
            >
              <div class="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Superadmins</div>
              <div class="text-[22px] font-medium text-white font-707 mt-1">{{ superadminCount }}</div>
              <div class="text-[11px] font-mono text-neutral-500 mt-0.5">Global Superadmin Leads</div>
            </button>

            <button 
              type="button"
              @click="selectedRoleFilter = 'editor'"
              class="p-3.5 rounded-[12px] text-left transition-all cursor-pointer border"
              :class="selectedRoleFilter === 'editor' ? 'bg-white/[0.08] border-white/30 shadow-xs' : 'bg-[#141414] border-white/10 hover:border-white/20'"
            >
              <div class="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Brand PICs</div>
              <div class="text-[22px] font-medium text-white font-707 mt-1">{{ brandPicCount }}</div>
              <div class="text-[11px] font-mono text-neutral-500 mt-0.5">Campaign Managers</div>
            </button>

            <button 
              type="button"
              @click="selectedRoleFilter = 'gate'"
              class="p-3.5 rounded-[12px] text-left transition-all cursor-pointer border"
              :class="selectedRoleFilter === 'gate' ? 'bg-white/[0.08] border-white/30 shadow-xs' : 'bg-[#141414] border-white/10 hover:border-white/20'"
            >
              <div class="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Door PICs</div>
              <div class="text-[22px] font-medium text-white font-707 mt-1">{{ gatePicCount }}</div>
              <div class="text-[11px] font-mono text-neutral-500 mt-0.5">Field Scanner Stations</div>
            </button>
          </div>

          <!-- 2. Search, Role Filter Tabs & Action Toolbar -->
          <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <!-- Search & Filters -->
            <div class="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              <!-- Search Input -->
              <div class="relative w-full sm:w-[260px]">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                <input 
                  v-model="userSearchQuery" 
                  type="text" 
                  placeholder="Filter personnel..." 
                  class="w-full h-[36px] pl-9 pr-3 rounded-[8px] border border-white/10 bg-[#141414] text-[13px] text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
              </div>

              <!-- Segmented Role Tabs -->
              <div class="flex items-center gap-1 p-0.5 bg-[#141414] border border-white/10 rounded-[8px]">
                <button
                  type="button"
                  @click="selectedRoleFilter = 'all'"
                  class="px-2.5 py-1 rounded-[6px] text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none"
                  :class="selectedRoleFilter === 'all' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white bg-transparent'"
                >
                  All ({{ teamUsers.length }})
                </button>
                <button
                  type="button"
                  @click="selectedRoleFilter = 'superadmin'"
                  class="px-2.5 py-1 rounded-[6px] text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none"
                  :class="selectedRoleFilter === 'superadmin' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white bg-transparent'"
                >
                  Admins ({{ superadminCount }})
                </button>
                <button
                  type="button"
                  @click="selectedRoleFilter = 'editor'"
                  class="px-2.5 py-1 rounded-[6px] text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none"
                  :class="selectedRoleFilter === 'editor' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white bg-transparent'"
                >
                  Brand PICs ({{ brandPicCount }})
                </button>
                <button
                  type="button"
                  @click="selectedRoleFilter = 'gate'"
                  class="px-2.5 py-1 rounded-[6px] text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none"
                  :class="selectedRoleFilter === 'gate' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white bg-transparent'"
                >
                  Door PICs ({{ gatePicCount }})
                </button>
              </div>

              <!-- Brand House Scope Dropdown -->
              <select 
                v-model="selectedBrandFilter"
                class="h-[36px] px-3 rounded-[8px] border border-white/10 bg-[#141414] text-[11.5px] text-neutral-300 font-mono outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="all">All Brands Access</option>
                <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
              </select>
            </div>

            <!-- View Toggle & Invite Member -->
            <div class="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
              <!-- View Mode Toggle -->
              <div class="flex items-center gap-1 p-0.5 bg-[#141414] border border-white/10 rounded-[8px]">
                <button
                  type="button"
                  @click="rosterViewMode = 'grouped'"
                  class="p-1.5 rounded-[6px] transition-colors cursor-pointer border-none"
                  :class="rosterViewMode === 'grouped' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white bg-transparent'"
                  title="Grouped by Role Cards"
                >
                  <LayoutGrid class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  @click="rosterViewMode = 'table'"
                  class="p-1.5 rounded-[6px] transition-colors cursor-pointer border-none"
                  :class="rosterViewMode === 'table' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white bg-transparent'"
                  title="Compact Table View"
                >
                  <ListFilter class="w-3.5 h-3.5" />
                </button>
              </div>

              <!-- Invite Member Button -->
              <button 
                type="button" 
                @click="showAddUserModal = true" 
                class="h-[36px] px-3.5 rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5 apple-press shadow-xs font-semibold shrink-0"
              >
                <Plus class="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Invite Member</span>
              </button>
            </div>
          </div>

          <!-- Empty State when filtered results are empty -->
          <div v-if="filteredTeamUsers.length === 0" class="py-16 text-center flex flex-col items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-[#141414]">
            <p class="text-[14px] text-white font-medium">No personnel found</p>
            <p class="text-[12px] font-mono text-neutral-400">Try adjusting your search query or role filter.</p>
          </div>

          <!-- 3A. Grouped Role Sections View (Cleaner, Better Organized) -->
          <div v-else-if="rosterViewMode === 'grouped'" class="flex flex-col gap-8">
            
            <!-- SECTION 1: SUPERADMINS -->
            <div v-if="superadminUsers.length > 0" class="flex flex-col gap-3">
              <div class="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div class="flex items-center gap-2">
                  <ShieldCheck class="w-4 h-4 text-white" />
                  <h3 class="text-[14px] font-medium text-white uppercase tracking-wider font-mono">Superadmins & Leads</h3>
                  <span class="px-2 py-0.2 rounded-full bg-white text-black text-[10px] font-mono font-bold">{{ superadminUsers.length }}</span>
                </div>
                <span class="text-[11px] font-mono text-neutral-400">Full Governance & Runway Sign-off</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                <div 
                  v-for="user in superadminUsers" 
                  :key="user.id"
                  class="p-4 rounded-[14px] bg-[#141414] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="relative size-10 rounded-full bg-white text-black flex items-center justify-center font-707 text-[12px] font-semibold tracking-tight shrink-0">
                        {{ user.name.slice(0, 2).toUpperCase() }}
                        <span class="absolute -bottom-0.5 -right-0.5 size-[7px] rounded-full bg-moss-500 border border-[#141414]" />
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="font-medium text-white truncate text-[14px]">{{ user.name }}</span>
                        <span class="text-[11.5px] font-mono text-neutral-400 truncate">{{ user.email }}</span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-white text-black font-semibold font-mono text-[9.5px] uppercase tracking-wider shrink-0">
                      Superadmin
                    </span>
                  </div>

                  <div class="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[11px] font-mono">
                    <span class="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/5">
                      Global (All Brands)
                    </span>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        @click="openPasswordModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                        title="Reset Passkey"
                      >
                        Passkey ↺
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        type="button"
                        @click="openEditUserModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 2: BRAND MANAGERS & PICS -->
            <div v-if="brandPicUsers.length > 0" class="flex flex-col gap-3">
              <div class="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div class="flex items-center gap-2">
                  <Building2 class="w-4 h-4 text-moss-300" />
                  <h3 class="text-[14px] font-medium text-white uppercase tracking-wider font-mono">Brand Managers & PICs</h3>
                  <span class="px-2 py-0.2 rounded-full bg-moss-950/60 text-moss-300 border border-moss-700/50 text-[10px] font-mono font-bold">{{ brandPicUsers.length }}</span>
                </div>
                <span class="text-[11px] font-mono text-neutral-400">Campaign Creation & Hub Operations</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                <div 
                  v-for="user in brandPicUsers" 
                  :key="user.id"
                  class="p-4 rounded-[14px] bg-[#141414] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="relative size-10 rounded-full bg-neutral-800 text-white flex items-center justify-center font-707 text-[12px] font-semibold tracking-tight shrink-0 border border-white/10">
                        {{ user.name.slice(0, 2).toUpperCase() }}
                        <span class="absolute -bottom-0.5 -right-0.5 size-[7px] rounded-full bg-moss-500 border border-[#141414]" />
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="font-medium text-white truncate text-[14px]">{{ user.name }}</span>
                        <span class="text-[11.5px] font-mono text-neutral-400 truncate">{{ user.email }}</span>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-moss-950/60 text-moss-300 border border-moss-700/50 font-mono text-[9.5px] uppercase tracking-wider shrink-0 font-medium">
                      Brand PIC
                    </span>
                  </div>

                  <div class="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[11px] font-mono">
                    <div class="flex items-center flex-wrap gap-1">
                      <span 
                        v-for="b in user.assignedBrands" 
                        :key="b" 
                        class="px-2 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/5 uppercase"
                      >
                        {{ formatBrandName(b) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        @click="openPasswordModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                        title="Reset Passkey"
                      >
                        Passkey ↺
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        type="button"
                        @click="openEditUserModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Edit
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        type="button"
                        @click="handleRemoveUser(user)"
                        class="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: FIELD & DOOR ENTRANCE PICS -->
            <div v-if="gateUsers.length > 0" class="flex flex-col gap-3">
              <div class="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div class="flex items-center gap-2">
                  <ScanLine class="w-4 h-4 text-neutral-300" />
                  <h3 class="text-[14px] font-medium text-white uppercase tracking-wider font-mono">Field Staff & Door Entrance PICs</h3>
                  <span class="px-2 py-0.2 rounded-full bg-white/[0.08] text-neutral-300 border border-white/10 text-[10px] font-mono font-bold">{{ gateUsers.length }}</span>
                </div>
                <span class="text-[11px] font-mono text-neutral-400">Scoped Scanner Devices & Station Shifts</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                <div 
                  v-for="user in gateUsers" 
                  :key="user.id"
                  class="p-4 rounded-[14px] bg-[#141414] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between gap-4 shadow-xs"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="relative size-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-707 text-[12px] font-semibold tracking-tight shrink-0 border border-white/10">
                        {{ user.name.slice(0, 2).toUpperCase() }}
                        <span class="absolute -bottom-0.5 -right-0.5 size-[7px] rounded-full bg-moss-500 border border-[#141414]" />
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="font-medium text-white truncate text-[14px]">{{ user.name }}</span>
                        <div class="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                          <span v-if="user.deviceLabel">{{ user.deviceLabel }}</span>
                          <span v-if="user.deviceLabel && user.stationMode">·</span>
                          <span v-if="user.stationMode" class="capitalize">{{ user.stationMode === 'both' ? 'In/Out' : user.stationMode }} Station</span>
                        </div>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-white/[0.08] text-neutral-300 border border-white/10 font-mono text-[9.5px] uppercase tracking-wider shrink-0 font-medium">
                      Door PIC
                    </span>
                  </div>

                  <div class="flex items-center justify-between pt-2.5 border-t border-white/[0.06] text-[11px] font-mono">
                    <span class="text-neutral-400 text-[10.5px]">
                      {{ user.expiresAt ? 'Valid: ' + formatDate(user.expiresAt) : 'Active Shift' }}
                    </span>

                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        @click="openPasswordModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                        title="Reset Passkey"
                      >
                        Passkey ↺
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        type="button"
                        @click="openEditUserModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Edit
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        type="button"
                        @click="handleRemoveUser(user)"
                        class="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- 3B. Compact Table View (Clean and Structured) -->
          <div v-else class="bg-[#141414] rounded-[16px] border border-white/10 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-mono uppercase text-neutral-400 tracking-wider">
                  <th class="py-3 px-5 font-normal">Member</th>
                  <th class="py-3 px-4 font-normal">Role</th>
                  <th class="py-3 px-4 font-normal">Brand Scope</th>
                  <th class="py-3 px-5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/[0.05] text-[13px]">
                <tr 
                  v-for="user in filteredTeamUsers" 
                  :key="user.id"
                  class="hover:bg-white/[0.02] transition-colors"
                >
                  <td class="py-3.5 px-5">
                    <div class="flex items-center gap-3">
                      <div class="relative size-8 rounded-full bg-white text-black flex items-center justify-center font-707 text-[11px] font-semibold tracking-tight shrink-0">
                        {{ user.name.slice(0, 2).toUpperCase() }}
                        <span class="absolute -bottom-0.5 -right-0.5 size-[6px] rounded-full bg-moss-500 border border-[#0a0a0a]" />
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="font-medium text-white truncate">{{ user.name }}</span>
                        <span class="text-[11.5px] font-mono text-neutral-400 truncate">{{ user.email }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 font-mono">
                    <span 
                      class="px-2 py-0.5 rounded text-[10.5px] uppercase font-medium"
                      :class="user.role === 'superadmin' ? 'bg-white text-black font-semibold' : user.role === 'gate' ? 'bg-white/[0.08] text-neutral-300 border border-white/10' : 'bg-moss-950/60 text-moss-300 border border-moss-700/50'"
                    >
                      {{ user.role === 'editor' ? 'Brand PIC' : user.role === 'gate' ? 'Door PIC' : user.role }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-[11px]">
                    <div class="flex items-center flex-wrap gap-1">
                      <span 
                        v-for="b in user.assignedBrands" 
                        :key="b" 
                        class="px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 border border-white/5 uppercase"
                      >
                        {{ formatBrandName(b) }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3.5 px-5 text-right font-mono text-[11px]">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        @click="openPasswordModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Passkey ↺
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        type="button"
                        @click="openEditUserModal(user)"
                        class="text-neutral-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Edit
                      </button>
                      <span class="text-neutral-600">·</span>
                      <button
                        v-if="user.role !== 'superadmin'"
                        type="button"
                        @click="handleRemoveUser(user)"
                        class="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0 uppercase"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Bottom Maintenance Bar -->
          <div class="pt-2 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <span>707 DEV GOVERNANCE</span>
            <button 
              @click="handleClearMediaConfirm" 
              class="hover:text-red-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-[11px] font-mono text-neutral-500"
            >
              Purge Media Storage
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- ======================================================== -->
    <!-- ALL MODALS (Standardized 707 Tokens)                     -->
    <!-- ======================================================== -->

    <!-- Modal 1: Add Brand -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showAddBrandModal" 
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddBrandModal = false"
        >
          <div class="w-full max-w-[440px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-white">New Brand House</h3>
              <button 
                type="button" 
                @click="showAddBrandModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddBrandSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Brand Name</label>
                <input 
                  v-model="newBrandName" 
                  type="text" 
                  required 
                  placeholder="e.g. atmos Indonesia" 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all placeholder:text-neutral-500"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">URL Slug</label>
                <div class="flex items-center gap-1.5">
                  <span class="text-[12px] font-mono text-neutral-500">events.707.co.id/</span>
                  <input 
                    v-model="newBrandSlug" 
                    type="text" 
                    placeholder="atmos" 
                    class="flex-1 h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-mono text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showAddBrandModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer border-none apple-press"
                >
                  Create House
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 2: Edit Brand Details -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showBrandDetailsModal && targetBrandForDetails" 
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBrandDetailsModal = false"
        >
          <div class="w-full max-w-[440px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-white">Edit Brand Details</h3>
              <button 
                type="button" 
                @click="showBrandDetailsModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleSaveBrandDetails" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Brand Name</label>
                <input 
                  v-model="editBrandName" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">URL Slug</label>
                <input 
                  v-model="editBrandSlug" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-mono text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <div class="pt-2 flex items-center justify-between">
                <button 
                  type="button" 
                  @click="handleRemoveBrand(targetBrandForDetails)" 
                  class="text-[12px] text-red-400 hover:text-red-300 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Remove House
                </button>
                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    @click="showBrandDetailsModal = false" 
                    class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer border-none apple-press"
                  >
                    Save Changes
                  </button>
                </div>
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
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddUserModal = false"
        >
          <div class="w-full max-w-[440px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div class="flex flex-col">
                <h3 class="text-[15px] font-medium text-white">Invite Team Member</h3>
                <span v-if="newUserBrand !== 'all'" class="text-[11px] font-mono text-moss-300">
                  Assigning to {{ formatBrandName(newUserBrand) }}
                </span>
              </div>
              <button 
                type="button" 
                @click="showAddUserModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddUserSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Full Name</label>
                <input 
                  v-model="newUserName" 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Jenkins" 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all placeholder:text-neutral-500"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Work Email</label>
                <input 
                  v-model="newUserEmail" 
                  type="email" 
                  required 
                  placeholder="sarah@atmos.co.id" 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all placeholder:text-neutral-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Role</label>
                  <select 
                    v-model="newUserRole" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  >
                    <option value="editor">Editor (Brand PIC)</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="gate">Door PIC (Gate Staff)</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Brand House</label>
                  <select 
                    v-model="newUserBrand" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  >
                    <option value="all">All Brands</option>
                    <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showAddUserModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer border-none apple-press"
                >
                  Invite Member
                </button>
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
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditUserModal = false"
        >
          <div class="w-full max-w-[440px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-white">Edit Member</h3>
              <button 
                type="button" 
                @click="showEditUserModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditUserSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Full Name</label>
                <input 
                  v-model="editUserName" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Work Email</label>
                <input 
                  v-model="editUserEmail" 
                  type="email" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Role</label>
                  <select 
                    v-model="editUserRole" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  >
                    <option value="editor">Editor (Brand PIC)</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="gate">Door PIC (Gate Staff)</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Brand House</label>
                  <select 
                    v-model="editUserBrand" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  >
                    <option value="all">All Brands</option>
                    <option v-for="b in brandStore.brands" :key="b.id" :value="b.slug">{{ b.name }}</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showEditUserModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer border-none apple-press"
                >
                  Save Changes
                </button>
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
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showPasswordModal = false"
        >
          <div class="w-full max-w-[400px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-white">Reset Passkey</h3>
              <button 
                type="button" 
                @click="showPasswordModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 flex flex-col gap-4">
              <p class="text-[12px] text-neutral-400">
                New temporary access passkey for <b class="text-white font-medium">{{ targetUserForPassword.name }}</b>:
              </p>

              <div class="flex items-center gap-2">
                <input 
                  v-model="updatedPasswordValue" 
                  type="text" 
                  class="flex-1 h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[13px] font-mono text-white outline-none focus:border-white/40 focus:bg-white/[0.08]"
                />
                <button 
                  type="button" 
                  @click="copyResetPassword" 
                  class="h-[36px] px-3 rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-200 transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showPasswordModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  @click="handlePasswordUpdateSubmit" 
                  class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer border-none apple-press"
                >
                  Save Passkey
                </button>
              </div>
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
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBuildTemplateModal = false"
        >
          <div class="w-full max-w-[480px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-white">New Master Blueprint</h3>
              <button 
                type="button" 
                @click="showBuildTemplateModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleBuildTemplateSubmit(false)" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Blueprint Name</label>
                <input 
                  v-model="newTemplateName" 
                  type="text" 
                  required 
                  placeholder="e.g. VIP Secret Drop & Guest E-Pass" 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all placeholder:text-neutral-500"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Category</label>
                  <select 
                    v-model="newTemplateCategory" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
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
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Initial Status</label>
                  <select 
                    v-model="newTemplateStatus" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  >
                    <option value="published">Published (Available)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Description</label>
                <textarea 
                  v-model="newTemplateDesc" 
                  rows="2"
                  placeholder="Master framework layout description..." 
                  class="w-full p-2.5 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all resize-none placeholder:text-neutral-500"
                />
              </div>

              <div class="pt-2 flex items-center justify-between">
                <button 
                  type="button" 
                  @click="showBuildTemplateModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div class="flex items-center gap-2">
                  <button 
                    type="submit" 
                    class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-200 transition-colors cursor-pointer"
                  >
                    Save Preset
                  </button>
                  <button 
                    type="button"
                    @click="handleBuildTemplateSubmit(true)"
                    class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors apple-press cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <span>Save & Build in Studio</span>
                    <ExternalLink class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 7: Edit Template Details -->
    <Teleport to="body">
      <Transition name="hub-fade">
        <div 
          v-if="showEditTemplateModal && targetTemplateForEdit" 
          class="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditTemplateModal = false"
        >
          <div class="w-full max-w-[440px] bg-[#141414] rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.6)] border border-white/15 overflow-hidden flex flex-col animate-apple-pop text-white">
            <div class="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-white">Edit Blueprint</h3>
              <button 
                type="button" 
                @click="showEditTemplateModal = false" 
                class="size-7 rounded-[6px] hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditTemplateSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Blueprint Name</label>
                <input 
                  v-model="editTemplateName" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-white/[0.05] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Category</label>
                  <select 
                    v-model="editTemplateCategory" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
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
                  <label class="text-[11px] uppercase tracking-normal text-neutral-400 font-medium">Status</label>
                  <select 
                    v-model="editTemplateStatus" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-[#1a1a1a] border border-white/15 text-[12.5px] font-sans font-light text-white outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showEditTemplateModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-white/15 bg-white/[0.05] hover:bg-white/[0.1] text-[12px] font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-white text-black hover:bg-neutral-200 text-[12px] font-semibold transition-colors cursor-pointer border-none apple-press"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal 9: What's New Modal -->
    <WhatsNewModal 
      :is-open="showWhatsNewModal" 
      :dark="true"
      @close="showWhatsNewModal = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  Plus, X, ExternalLink, ChevronRight, ChevronLeft, Layers, Building2, Boxes, Users, CheckCircle2, Search,
  Settings, ShieldCheck, ScanLine, LayoutGrid, ListFilter, UserPlus
} from 'lucide-vue-next';

import { useAuthStore, type UserAccount, type UserRole } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { glassConfirm, glassPrompt } from '../services/glassDialog.ts';
import NotificationsMenu from '../components/common/NotificationsMenu.vue';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';
import type { Brand, GlobalTemplate, ProjectItem } from '../types/editor.ts';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();

const showUserProfileModal = ref(false);
const showWhatsNewModal = ref(false);

// ----------------------------------------------------
// Sub-Route State & Metadata (Option 2: Dedicated Full Viewports)
// ----------------------------------------------------
type DevSubroute = 'review' | 'brands' | 'foundry' | 'roster';

const currentTab = computed<DevSubroute | null>(() => {
  const tab = (route.params.tab as string) || '';
  return ['review', 'brands', 'foundry', 'roster'].includes(tab) ? (tab as DevSubroute) : null;
});

const subrouteMeta = computed(() => {
  switch (currentTab.value) {
    case 'review':
      return {
        title: 'Review Gate',
        count: pendingProjects.value.length,
        description: 'Pending brand drop releases and live updates awaiting runway sign-off.'
      };
    case 'brands':
      return {
        title: 'Brand Houses',
        count: brandStore.brands.length,
        description: 'Multi-tenant brand registries, personnel assignments, and active drop portfolios.'
      };
    case 'foundry':
      return {
        title: 'Foundry Blueprints',
        count: brandStore.templates.length,
        description: 'Master layout frameworks, interactive presets, and brand activation blueprints.'
      };
    case 'roster':
      return {
        title: 'Team Roster & Access',
        count: teamUsers.value.length,
        description: 'Studio personnel directory, role permissions, and brand house access control.'
      };
    default:
      return { title: '', description: '' };
  }
});

// ----------------------------------------------------
// Smart Dynamic Dev Welcome Message (Combined A + B + C Package)
// ----------------------------------------------------
const adaptiveDevGreeting = computed(() => {
  const now = new Date();
  const hour = now.getHours();
  const firstName = authStore.currentUser?.name?.trim().split(/\s+/)[0] || '';
  const pendingCount = pendingProjects.value.length;
  const brandCount = brandStore.brands.length;
  const liveDropsCount = editorStore.projects.filter(isLiveProject).length;
  const seed = (hour + now.getDate()) % 3;

  // 1. High Priority: Pending Runway Reviews (Operational Intelligence)
  if (pendingCount > 0) {
    if (firstName && seed === 0) {
      return `${pendingCount} ${pendingCount === 1 ? 'release awaits' : 'releases await'} sign-off, ${firstName}.`;
    }
    if (seed === 1) {
      return `Review gate active with ${pendingCount} ${pendingCount === 1 ? 'drop' : 'drops'} pending approval.`;
    }
    return `${pendingCount} ${pendingCount === 1 ? 'drop awaits' : 'drops await'} runway sign-off.`;
  }

  // 2. High Footfall / Live Drops Running in the Wild
  if (liveDropsCount > 0 && seed === 2) {
    if (firstName) {
      return `${liveDropsCount} ${liveDropsCount === 1 ? 'drop' : 'drops'} live across ${brandCount} brand houses, ${firstName}.`;
    }
    return `${liveDropsCount} live ${liveDropsCount === 1 ? 'drop' : 'drops'} running across brand houses.`;
  }

  // 3. Time-of-Day + Monogram Persona Atmospheric (Luxury Editorial)
  // Morning: 05:00 - 11:59
  if (hour >= 5 && hour < 12) {
    const morning = firstName ? [
      `Good morning, ${firstName}.`,
      `First light in the studio, ${firstName}.`,
      `All brand houses accounted for, ${firstName}.`
    ] : [
      'First light in the studio.',
      'All brand houses accounted for.',
      'Morning briefing across the ecosystem.'
    ];
    return morning[seed % morning.length];
  }

  // Afternoon: 12:00 - 17:59
  if (hour >= 12 && hour < 18) {
    const afternoon = firstName ? [
      `Good afternoon, ${firstName}.`,
      `Master studio architecture, ${firstName}.`,
      `The runway is clear across all brand houses, ${firstName}.`
    ] : [
      'All systems operational across brand houses.',
      'Command the runway.',
      'Master studio architecture.'
    ];
    return afternoon[seed % afternoon.length];
  }

  // Evening: 18:00 - 22:59
  if (hour >= 18 && hour < 23) {
    const evening = firstName ? [
      `Good evening, ${firstName}.`,
      `Golden hour across the brand houses, ${firstName}.`,
      `Blueprint, release, and oversee, ${firstName}.`
    ] : [
      'Golden hour across the brand houses.',
      'Blueprint, release, and oversee.',
      'Curate the ecosystem.'
    ];
    return evening[seed % evening.length];
  }

  // Late Night: 23:00 - 04:59
  const night = firstName ? [
    `After-hours architecture, ${firstName}.`,
    `Nightfall in the studio, ${firstName}.`,
    `Quiet hours on the runway, ${firstName}.`
  ] : [
    'After-hours architecture.',
    'Nightfall in the studio.',
    'Quiet hours on the runway.'
  ];
  return night[seed % night.length];
});

// ----------------------------------------------------
// Search & Filter Collections
// ----------------------------------------------------
const brandSearchQuery = ref('');
const filteredBrands = computed(() => {
  const q = brandSearchQuery.value.trim().toLowerCase();
  if (!q) return brandStore.brands;
  return brandStore.brands.filter(b => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q));
});

const selectedFoundryCategory = ref<string>('all');
const filteredFoundryTemplates = computed(() => {
  if (selectedFoundryCategory.value === 'all') return brandStore.templates;
  return brandStore.templates.filter(t => t.category === selectedFoundryCategory.value);
});

const userSearchQuery = ref('');
const selectedRoleFilter = ref<'all' | 'superadmin' | 'editor' | 'gate'>('all');
const selectedBrandFilter = ref<string>('all');
const rosterViewMode = ref<'grouped' | 'table'>('grouped');

const superadminCount = computed(() => teamUsers.value.filter(u => u.role === 'superadmin').length);
const brandPicCount = computed(() => teamUsers.value.filter(u => u.role === 'editor' || (!u.role && u.role !== 'superadmin' && u.role !== 'gate')).length);
const gatePicCount = computed(() => teamUsers.value.filter(u => u.role === 'gate').length);

const filteredTeamUsers = computed(() => {
  const q = userSearchQuery.value.trim().toLowerCase();
  const role = selectedRoleFilter.value;
  const brand = selectedBrandFilter.value;

  return teamUsers.value.filter(u => {
    // Role filter
    if (role === 'superadmin' && u.role !== 'superadmin') return false;
    if (role === 'editor' && u.role !== 'editor' && u.role) return false;
    if (role === 'gate' && u.role !== 'gate') return false;

    // Brand filter
    if (brand !== 'all') {
      const brands = u.assignedBrands || [];
      if (!brands.includes('all') && !brands.includes(brand)) return false;
    }

    // Search query
    if (q) {
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = (u.role || 'editor').toLowerCase().includes(q);
      const matchBrand = (u.assignedBrands || []).some(b => b.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchRole && !matchBrand) return false;
    }

    return true;
  });
});

const superadminUsers = computed(() => filteredTeamUsers.value.filter(u => u.role === 'superadmin'));
const brandPicUsers = computed(() => filteredTeamUsers.value.filter(u => u.role === 'editor' || (!u.role && u.role !== 'superadmin' && u.role !== 'gate')));
const gateUsers = computed(() => filteredTeamUsers.value.filter(u => u.role === 'gate'));

function formatBrandName(slugOrId: string): string {
  if (slugOrId === 'all') return 'Global (All Brands)';
  const found = brandStore.brands.find(b => b.slug === slugOrId || b.id === slugOrId);
  return found ? found.name : slugOrId;
}

const userInitials = computed(() => {
  const name = authStore.currentUser?.name || 'Superadmin Lead';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

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
  router.push('/login');
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

function getBrandProjects(brand: Brand): ProjectItem[] {
  return editorStore.projects.filter(p => p.brand_id === brand.id || p.brand_slug === brand.slug);
}

function getBrandPics(brand: Brand): UserAccount[] {
  const bId = brand.id;
  const bSlug = brand.slug;
  return teamUsers.value.filter(u => u.assignedBrands?.includes(bId) || u.assignedBrands?.includes(bSlug) || u.assignedBrands?.includes('all'));
}

const teamUsers = computed(() => {
  return authStore.users.filter(u => !u.status || u.status === 'active');
});

// ESC navigation listener
function handleGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (showAddBrandModal.value || showBrandDetailsModal.value || showAddUserModal.value || 
        showEditUserModal.value || showPasswordModal.value || showBuildTemplateModal.value || 
        showEditTemplateModal.value || showUserProfileModal.value || showWhatsNewModal.value) {
      return;
    }
    if (currentTab.value) {
      router.push('/dev');
    }
  }
}

// Initialization & Teardown
onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown);
  await brandStore.loadBrands();
  await brandStore.loadTemplates();
  await authStore.loadUsers();
  await editorStore.loadProjects();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
});

function handleAddPicForBrand(brand: Brand) {
  newUserName.value = '';
  newUserEmail.value = '';
  newUserRole.value = 'editor';
  newUserBrand.value = brand.slug;
  showAddUserModal.value = true;
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
    title: isLiveProject(p) ? 'Publish update?' : 'Approve & launch live?', 
    message: isLiveProject(p) ? `Live visitors of "${p.title}" will see the update immediately.` : `"${p.title}" becomes public immediately.`, 
    confirmLabel: 'Launch Live' 
  }))) return;
  try {
    const res = await editorStore.transitionProject(projectId, 'publish');
    if (res.ok) {
      editorStore.showToast(`Launched "${p.title}" live.`);
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
    message: `Tell the brand what to adjust in "${p?.title || 'this drop'}".`,
    placeholder: 'e.g. Adjust launch date and upload high-res poster',
    confirmLabel: 'Send back'
  });
  if (note === null) return;
  try {
    const res = await editorStore.transitionProject(projectId, 'decline', note);
    if (res.ok) {
      editorStore.showToast(`Sent "${p?.title || 'Drop'}" back to brand.`);
    } else {
      editorStore.showToast(res.error || 'Could not decline project.');
    }
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not decline project.');
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
    router.push('/dev/brands');
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
      showBrandDetailsModal.value = false;
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
    if (!currentTab.value) {
      router.push('/dev/roster');
    }
  } catch (err: any) {
    editorStore.showToast(err?.message || 'Could not create account.');
  }
}

const showEditUserModal = ref(false);
const targetUserForEdit = ref<UserAccount | null>(null);
const editUserName = ref('');
const editUserEmail = ref('');
const editUserRole = ref<UserRole>('editor');
const editUserBrand = ref<string>('all');

function openEditUserModal(user: UserAccount) {
  targetUserForEdit.value = user;
  editUserName.value = user.name;
  editUserEmail.value = user.email;
  editUserRole.value = user.role || 'editor';
  editUserBrand.value = user.assignedBrands?.[0] || 'all';
  showEditUserModal.value = true;
}

async function handleEditUserSubmit() {
  if (!targetUserForEdit.value || !editUserName.value.trim()) return;
  try {
    await authStore.updateUser(targetUserForEdit.value.id, {
      name: editUserName.value.trim(),
      email: editUserEmail.value.trim(),
      role: editUserRole.value,
      assignedBrands: [editUserBrand.value]
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
  router.push('/dev/foundry');

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

<style scoped>
/* Default state: container is completely hidden (no background, no border, no shadow) */
.category-menu-btn {
  background-color: transparent !important;
  border: 0.5px solid transparent !important;
  box-shadow: none !important;
}

/* Hover state: smoked glass container reveals smoothly */
.category-menu-btn:hover:not(.category-menu-btn-disabled) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.14) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
}

.category-menu-btn:active:not(.category-menu-btn-disabled) {
  background-color: rgba(255, 255, 255, 0.14) !important;
}

@keyframes slideLeft {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slide-left {
  animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
