<template>
  <div class="min-h-screen w-full bg-[#fbfbfb] text-black font-sans font-light tracking-normal selection:bg-black selection:text-white select-none hub-root" data-name="Superadmin Studio Monolith">
    
    <!-- 1. Top Architectural Telemetry Header (48px standard) -->
    <header class="w-full h-[48px] px-6 sm:px-12 flex items-center justify-between border-b border-black/[0.08] bg-white/90 backdrop-blur-md sticky top-0 z-40 select-none">
      <div class="flex items-center gap-3 h-[24px]">
        <!-- 707 Logo linking to /settings -->
        <router-link to="/settings" class="h-[18px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" title="707 Studio Core">
          <img :src="FIGMA_ASSETS.logoDesignStudio" alt="707 Design Studio" class="h-[18px] w-auto object-contain pointer-events-none" />
        </router-link>

        <span class="inline-flex items-center px-1.5 py-[2px] rounded-[4px] bg-black/[0.04] border border-black/10 text-[10px] font-mono font-medium text-neutral-600 leading-none whitespace-nowrap select-none">
          Dev
        </span>

        <div class="w-px h-3.5 bg-black/15 mx-1" />

        <!-- Live Telemetry String -->
        <div class="hidden sm:flex items-center gap-2 text-[11px] font-mono text-neutral-500">
          <span class="size-1.5 rounded-full bg-emerald-500" />
          <span>STUDIO CORE</span>
          <span class="text-neutral-300">·</span>
          <span>{{ brandStore.brands.length }} HOUSES</span>
          <span class="text-neutral-300">·</span>
          <span>{{ editorStore.projects.length }} DROPS ACTIVE</span>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center gap-3 sm:gap-4">
        <button 
          type="button" 
          @click="showAddBrandModal = true" 
          class="hidden md:inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-600 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <span>+ Brand</span>
        </button>

        <button 
          type="button" 
          @click="openBuildTemplateModal" 
          class="hidden md:inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-neutral-600 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          <span>+ Blueprint</span>
        </button>

        <div class="hidden md:block w-px h-3.5 bg-black/10" />

        <button 
          type="button"
          @click="handleExitAdmin"
          class="text-[11px] font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
          title="Sign out of Superadmin"
        >
          Exit Admin
        </button>

        <div class="w-px h-3.5 bg-black/10" />

        <!-- Profile Avatar Container -->
        <div class="relative flex items-center">
          <button 
            type="button"
            @click="showUserProfileModal = !showUserProfileModal"
            class="relative size-[26px] rounded-full border border-black/10 hover:border-black/30 shrink-0 bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Superadmin Profile"
          >
            <div class="relative size-full rounded-full bg-black text-white flex items-center justify-center font-sans text-[10px] font-medium tracking-tight select-none">
              {{ userInitials }}
              <span class="absolute -bottom-0.5 -right-0.5 size-[5px] rounded-full bg-emerald-500 border border-white" />
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

    <!-- 2. Sticky Monospace Index Bar -->
    <nav class="sticky top-[48px] z-30 w-full bg-[#fbfbfb]/90 backdrop-blur-md border-b border-black/[0.08] px-6 sm:px-12 py-2.5 select-none">
      <div class="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-0.5 text-[11px] font-mono tracking-widest uppercase">
          <a 
            v-if="pendingProjects.length > 0"
            href="#runway" 
            class="flex items-center gap-1.5 text-amber-900 font-medium hover:text-black transition-colors"
          >
            <span class="size-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>00 / RUNWAY GATE ({{ pendingProjects.length }})</span>
          </a>

          <a href="#houses" class="text-neutral-500 hover:text-black transition-colors">
            01 / BRAND HOUSES ({{ brandStore.brands.length }})
          </a>

          <a href="#foundry" class="text-neutral-500 hover:text-black transition-colors">
            02 / FOUNDRY BLUEPRINTS ({{ brandStore.templates.length }})
          </a>

          <a href="#roster" class="text-neutral-500 hover:text-black transition-colors">
            03 / ROSTER & ACCESS ({{ teamUsers.length }})
          </a>

          <a href="#system" class="text-neutral-500 hover:text-black transition-colors">
            04 / SYSTEM CORE
          </a>
        </div>

        <div class="hidden lg:flex items-center gap-3 text-[10.5px] font-mono text-neutral-400">
          <span>HIGH-FASHION ACTIVATION ARCHITECTURE</span>
        </div>
      </div>
    </nav>

    <!-- 3. The Studio Monolith Main Canvas (Pure Full-Bleed Swiss Typography) -->
    <main class="w-full max-w-[1240px] mx-auto px-6 sm:px-12 py-10 sm:py-16 flex flex-col gap-16 sm:gap-24">
      
      <!-- ======================================================== -->
      <!-- SECTION 00: RUNWAY REVIEW GATE (Active Submissions)      -->
      <!-- ======================================================== -->
      <section v-if="pendingProjects.length > 0" id="runway" class="flex flex-col gap-5 scroll-mt-28">
        <div class="flex items-baseline justify-between pb-3 border-b border-amber-900/30">
          <div class="flex items-baseline gap-3">
            <span class="text-[11px] font-mono uppercase tracking-[0.2em] text-amber-900 font-medium flex items-center gap-2">
              <span class="size-1.5 rounded-full bg-amber-500 animate-pulse" />
              00 / RUNWAY GATE
            </span>
            <span class="text-[11px] font-mono text-amber-800/80">
              ({{ pendingProjects.length }} Drop{{ pendingProjects.length === 1 ? '' : 's' }} Awaiting Superadmin Sign-off)
            </span>
          </div>
        </div>

        <div class="flex flex-col divide-y divide-black/[0.08] border-b border-black/[0.08]">
          <div 
            v-for="p in pendingProjects" 
            :key="p.id"
            class="py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-black/[0.015] px-2 transition-colors -mx-2 rounded-[6px]"
          >
            <div class="flex flex-col gap-1 min-w-0">
              <div class="flex items-center gap-2.5 flex-wrap">
                <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black text-white font-medium">
                  {{ p.brand_slug || 'atmos' }}
                </span>
                <span class="text-[16px] sm:text-[18px] font-normal text-black truncate tracking-tight">
                  {{ p.title }}
                </span>
                <span class="text-[10.5px] font-mono text-amber-900 bg-amber-100/70 border border-amber-300 px-1.5 py-0.2 rounded">
                  {{ p.pending_update_at ? 'Live Update Pending' : 'New Drop Release' }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-[11.5px] font-mono text-neutral-400">
                <span>Slug: /{{ p.brand_slug || 'atmos' }}/{{ p.slug }}</span>
                <span>·</span>
                <span>Submitted {{ formatDate(p.pending_update_at || p.updated_at) }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <button
                type="button"
                @click="handleInspectProject(p)"
                class="text-[11.5px] font-mono uppercase tracking-wider text-neutral-700 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
              >
                <span>Inspect in Studio</span>
                <ExternalLink class="w-3 h-3" />
              </button>
              <span class="text-neutral-300">·</span>
              <button
                type="button"
                @click="handleDeclineProject(p.id)"
                class="text-[11.5px] font-mono uppercase tracking-wider text-neutral-600 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Request Changes
              </button>
              <button
                type="button"
                @click="handleApproveProject(p.id)"
                class="h-[30px] px-3.5 rounded-[6px] bg-black text-white hover:bg-neutral-800 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none"
              >
                Approve & Launch Live
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- SECTION 01: BRAND HOUSES (Architectural Tenant Matrix)   -->
      <!-- ======================================================== -->
      <section id="houses" class="flex flex-col gap-6 scroll-mt-28">
        <div class="flex items-baseline justify-between pb-3 border-b border-black/[0.12]">
          <div class="flex items-baseline gap-4">
            <span class="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">01 / BRAND HOUSES</span>
            <span class="text-[11px] font-mono text-neutral-400">({{ brandStore.brands.length }} Registered Tenants)</span>
          </div>

          <button
            type="button"
            @click="showAddBrandModal = true"
            class="text-[11px] font-mono uppercase tracking-widest text-black hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
          >
            <span>+ Register Brand House</span>
          </button>
        </div>

        <!-- Full-Bleed Typographic Brand Rows -->
        <div class="flex flex-col divide-y divide-black/[0.08] border-b border-black/[0.08]">
          <div 
            v-for="(brand, idx) in brandStore.brands" 
            :key="brand.id"
            class="flex flex-col transition-colors group"
          >
            <!-- Primary Row -->
            <div class="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-black/[0.015] px-2 -mx-2 rounded-[6px] transition-colors">
              <div class="flex items-center gap-4 sm:gap-6 min-w-0">
                <span class="text-[12px] font-mono text-neutral-400 w-[24px] shrink-0">
                  {{ String(idx + 1).padStart(2, '0') }}
                </span>

                <div class="flex flex-col gap-1 min-w-0">
                  <div class="flex items-center gap-3">
                    <h3 class="text-[19px] sm:text-[22px] font-normal text-black tracking-tight group-hover:text-black transition-colors">
                      {{ brand.name }}
                    </h3>
                    <span class="text-[11px] font-mono text-neutral-400">
                      /{{ brand.slug }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3 text-[11.5px] font-mono text-neutral-400">
                    <span>{{ getBrandDropCount(brand) }} Drops</span>
                    <span>·</span>
                    <span>{{ getBrandPics(brand).length }} Personnel</span>
                  </div>
                </div>
              </div>

              <!-- Inline Row Controls -->
              <div class="flex items-center gap-4 shrink-0 pl-10 md:pl-0">
                <button
                  type="button"
                  @click="toggleBrandExpanded(brand.id)"
                  class="text-[11.5px] font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
                >
                  <span>{{ isBrandExpanded(brand.id) ? 'Collapse' : 'Inspect' }}</span>
                  <span class="text-[10px]">{{ isBrandExpanded(brand.id) ? '▴' : '▾' }}</span>
                </button>

                <span class="text-neutral-300">·</span>

                <button
                  type="button"
                  @click="handleCreateCampaignForBrand(brand)"
                  class="text-[11.5px] font-mono uppercase tracking-wider text-neutral-600 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  + New Drop
                </button>

                <span class="text-neutral-300">·</span>

                <button
                  type="button"
                  @click="openBrandInStudio(brand)"
                  class="h-[30px] px-3.5 rounded-[6px] bg-black text-white hover:bg-neutral-800 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5"
                >
                  <span>Enter Studio</span>
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Kinetic Inline Drawer (Slides down on inspect) -->
            <div 
              v-if="isBrandExpanded(brand.id)" 
              class="pb-6 pt-1 pl-10 sm:pl-12 flex flex-col gap-5 animate-apple-pop"
            >
              <!-- Brand Personnel Chips -->
              <div class="flex items-center flex-wrap gap-2 text-[12px] pt-1">
                <span class="text-[10.5px] font-mono uppercase tracking-wider text-neutral-400 font-medium mr-1">Roster:</span>
                <span 
                  v-for="pic in getBrandPics(brand)" 
                  :key="pic.id"
                  class="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-neutral-100 text-neutral-800 text-[11.5px] font-mono"
                >
                  <span>{{ pic.name }}</span>
                  <span class="text-neutral-400">({{ pic.role }})</span>
                </span>
                <span v-if="getBrandPics(brand).length === 0" class="text-[11.5px] font-mono text-neutral-400 italic">
                  No personnel assigned.
                </span>
                <span class="text-neutral-300 mx-1">·</span>
                <button 
                  type="button" 
                  @click="openBrandDetailsModal(brand)" 
                  class="text-[11px] font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Brand Details & Settings
                </button>
              </div>

              <!-- Brand Drops Table -->
              <div v-if="getBrandProjects(brand).length > 0" class="flex flex-col divide-y divide-black/[0.05] border-t border-b border-black/[0.06]">
                <div 
                  v-for="p in getBrandProjects(brand)" 
                  :key="p.id"
                  class="py-2.5 flex items-center justify-between text-[12.5px] hover:bg-black/[0.015] px-1 transition-colors"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="font-normal text-black truncate">{{ p.title }}</span>
                    <span class="text-[11px] font-mono text-neutral-400">{{ formatDate(p.updated_at) }}</span>
                  </div>

                  <div class="flex items-center gap-4">
                    <span 
                      class="text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase"
                      :class="isLiveProject(p) ? 'bg-moss-50 text-moss-700 border-moss-200' : (isAwaitingReview(p) ? 'bg-amber-50 text-amber-900 border-amber-300' : 'bg-neutral-100 text-neutral-600 border-neutral-200')"
                    >
                      {{ formatProjectStatus(p) }}
                    </span>
                    <button 
                      type="button" 
                      @click="handleInspectProject(p)"
                      class="text-[11px] font-mono uppercase text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      Open
                    </button>
                    <button 
                      type="button" 
                      @click="handleDeleteProject(p.id)"
                      class="text-[11px] font-mono uppercase text-neutral-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-[11.5px] font-mono text-neutral-400 italic py-1">
                No campaigns launched under this house yet.
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- SECTION 02: FOUNDRY (Master Blueprint Engine)             -->
      <!-- ======================================================== -->
      <section id="foundry" class="flex flex-col gap-6 scroll-mt-28">
        <div class="flex items-baseline justify-between pb-3 border-b border-black/[0.12]">
          <div class="flex items-baseline gap-4">
            <span class="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">02 / FOUNDRY BLUEPRINTS</span>
            <span class="text-[11px] font-mono text-neutral-400">({{ brandStore.templates.length }} Master Presets)</span>
          </div>

          <button
            type="button"
            @click="openBuildTemplateModal"
            class="text-[11px] font-mono uppercase tracking-widest text-black hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
          >
            <span>+ Architect Blueprint</span>
          </button>
        </div>

        <div class="flex flex-col divide-y divide-black/[0.08] border-b border-black/[0.08]">
          <div 
            v-for="tpl in brandStore.templates" 
            :key="tpl.id"
            class="py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-black/[0.015] px-2 -mx-2 rounded-[6px] transition-colors"
          >
            <div class="flex flex-col gap-1 min-w-0">
              <div class="flex items-center gap-3">
                <span class="text-[16px] sm:text-[18px] font-normal text-black tracking-tight">
                  {{ tpl.name }}
                </span>
                <span class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/[0.05] text-neutral-600 border border-black/10">
                  {{ tpl.category || 'raffle' }}
                </span>
                <span 
                  class="text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase"
                  :class="tpl.status === 'published' ? 'bg-moss-50 text-moss-700 border-moss-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'"
                >
                  {{ tpl.status || 'published' }}
                </span>
              </div>
              <p class="text-[12px] text-neutral-500 font-light truncate max-w-xl">
                {{ tpl.description || 'Master layout blueprint for high-fashion drops.' }}
              </p>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <button
                type="button"
                @click="openEditTemplateModal(tpl)"
                class="text-[11px] font-mono uppercase tracking-wider text-neutral-600 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Edit
              </button>
              <span class="text-neutral-300">·</span>
              <button
                type="button"
                @click="handleRemoveTemplate(tpl)"
                class="text-[11px] font-mono uppercase tracking-wider text-neutral-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                Remove
              </button>
              <button
                type="button"
                @click="handleEditInStudio(tpl)"
                class="h-[30px] px-3.5 rounded-[6px] bg-black text-white hover:bg-neutral-800 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer border-none flex items-center gap-1.5"
              >
                <span>Open in Studio</span>
                <ExternalLink class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- SECTION 03: ROSTER & ACCESS                              -->
      <!-- ======================================================== -->
      <section id="roster" class="flex flex-col gap-6 scroll-mt-28">
        <div class="flex items-baseline justify-between pb-3 border-b border-black/[0.12]">
          <div class="flex items-baseline gap-4">
            <span class="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">03 / ROSTER & ACCESS</span>
            <span class="text-[11px] font-mono text-neutral-400">({{ teamUsers.length }} Authorized Personnel)</span>
          </div>

          <button
            type="button"
            @click="showAddUserModal = true"
            class="text-[11px] font-mono uppercase tracking-widest text-black hover:opacity-60 transition-opacity cursor-pointer bg-transparent border-none p-0 flex items-center gap-1"
          >
            <span>+ Invite Member</span>
          </button>
        </div>

        <div class="flex flex-col divide-y divide-black/[0.08] border-b border-black/[0.08]">
          <div 
            v-for="user in teamUsers" 
            :key="user.id"
            class="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-black/[0.015] px-2 -mx-2 rounded-[6px] transition-colors"
          >
            <div class="flex items-center gap-4 min-w-0">
              <div class="flex flex-col min-w-0">
                <span class="text-[14.5px] font-normal text-black truncate">{{ user.name }}</span>
                <span class="text-[11.5px] font-mono text-neutral-400">{{ user.email }}</span>
              </div>
            </div>

            <div class="flex items-center gap-4 flex-wrap">
              <span 
                class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                :class="user.role === 'superadmin' ? 'bg-black text-white border-black' : 'bg-neutral-100 text-neutral-700 border-neutral-200'"
              >
                {{ user.role }}
              </span>

              <div class="flex items-center gap-1 text-[11px] font-mono text-neutral-500">
                <span v-for="b in user.assignedBrands" :key="b" class="px-1.5 py-0.5 rounded bg-black/[0.04]">
                  {{ b }}
                </span>
                <span v-if="!user.assignedBrands || user.assignedBrands.length === 0" class="text-neutral-400">—</span>
              </div>

              <div class="inline-flex items-center gap-2 pl-2">
                <button
                  type="button"
                  @click="openPasswordModal(user)"
                  class="text-[11px] font-mono uppercase text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Passkey ↺
                </button>
                <span class="text-neutral-300">·</span>
                <button
                  type="button"
                  @click="openEditUserModal(user)"
                  class="text-[11px] font-mono uppercase text-neutral-500 hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Edit
                </button>
                <span class="text-neutral-300">·</span>
                <button
                  type="button"
                  @click="handleRemoveUser(user)"
                  class="text-[11px] font-mono uppercase text-neutral-400 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- SECTION 04: SYSTEM CORE                                  -->
      <!-- ======================================================== -->
      <section id="system" class="flex flex-col gap-6 scroll-mt-28 pb-20">
        <div class="flex items-baseline justify-between pb-3 border-b border-black/[0.12]">
          <span class="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">04 / SYSTEM CORE</span>
        </div>

        <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.08]">
          <div class="flex flex-col gap-0.5">
            <span class="text-[14px] font-normal text-black">Global Media Storage Maintenance</span>
            <span class="text-[12px] font-mono text-neutral-400">Purges unreferenced asset files across all brand storage buckets.</span>
          </div>

          <button
            type="button"
            @click="handleClearMediaConfirm"
            class="h-[30px] px-3.5 rounded-[6px] border border-red-200 bg-white hover:bg-red-50 text-red-600 text-[11px] font-mono uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Purge Storage
          </button>
        </div>
      </section>

    </main>

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
          <div class="w-full max-w-[440px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">New Brand House</h3>
              <button 
                type="button" 
                @click="showAddBrandModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddBrandSubmit" class="p-5 flex flex-col gap-4">
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

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">URL Slug</label>
                <div class="flex items-center gap-1.5">
                  <span class="text-[12px] font-mono text-neutral-400">events.707.co.id/</span>
                  <input 
                    v-model="newBrandSlug" 
                    type="text" 
                    placeholder="atmos" 
                    class="flex-1 h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showAddBrandModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors cursor-pointer border-none apple-press"
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
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBrandDetailsModal = false"
        >
          <div class="w-full max-w-[440px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Edit Brand Details</h3>
              <button 
                type="button" 
                @click="showBrandDetailsModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleSaveBrandDetails" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand Name</label>
                <input 
                  v-model="editBrandName" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">URL Slug</label>
                <input 
                  v-model="editBrandSlug" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-mono text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                />
              </div>

              <div class="pt-2 flex items-center justify-between">
                <button 
                  type="button" 
                  @click="handleRemoveBrand(targetBrandForDetails)" 
                  class="text-[12px] text-red-500 hover:text-red-700 transition-colors cursor-pointer bg-transparent border-none p-0"
                >
                  Remove House
                </button>
                <div class="flex items-center gap-2">
                  <button 
                    type="button" 
                    @click="showBrandDetailsModal = false" 
                    class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors cursor-pointer border-none apple-press"
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
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showAddUserModal = false"
        >
          <div class="w-full max-w-[440px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Invite Team Member</h3>
              <button 
                type="button" 
                @click="showAddUserModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleAddUserSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Full Name</label>
                <input 
                  v-model="newUserName" 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Jenkins" 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Work Email</label>
                <input 
                  v-model="newUserEmail" 
                  type="email" 
                  required 
                  placeholder="sarah@atmos.co.id" 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Role</label>
                  <select 
                    v-model="newUserRole" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                  >
                    <option value="editor">Editor (Brand PIC)</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                <div class="flex flex-col gap-1">
                  <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Brand House</label>
                  <select 
                    v-model="newUserBrand" 
                    class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
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
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors cursor-pointer border-none apple-press"
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
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditUserModal = false"
        >
          <div class="w-full max-w-[440px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Edit Member</h3>
              <button 
                type="button" 
                @click="showEditUserModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditUserSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Full Name</label>
                <input 
                  v-model="editUserName" 
                  type="text" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Work Email</label>
                <input 
                  v-model="editUserEmail" 
                  type="email" 
                  required 
                  class="w-full h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12.5px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all"
                />
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showEditUserModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors cursor-pointer border-none apple-press"
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
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showPasswordModal = false"
        >
          <div class="w-full max-w-[400px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Reset Passkey</h3>
              <button 
                type="button" 
                @click="showPasswordModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <div class="p-5 flex flex-col gap-4">
              <p class="text-[12px] text-neutral-500">
                New temporary access passkey for <b class="text-black font-medium">{{ targetUserForPassword.name }}</b>:
              </p>

              <div class="flex items-center gap-2">
                <input 
                  v-model="updatedPasswordValue" 
                  type="text" 
                  class="flex-1 h-[36px] px-3 rounded-[8px] bg-black/[0.03] border border-black/12 text-[13px] font-mono text-black outline-none"
                />
                <button 
                  type="button" 
                  @click="copyResetPassword" 
                  class="h-[36px] px-3 rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-800 transition-colors cursor-pointer"
                >
                  Copy
                </button>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showPasswordModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  @click="handlePasswordUpdateSubmit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors cursor-pointer border-none apple-press"
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
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showBuildTemplateModal = false"
        >
          <div class="w-full max-w-[480px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">New Master Blueprint</h3>
              <button 
                type="button" 
                @click="showBuildTemplateModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleBuildTemplateSubmit(false)" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Blueprint Name</label>
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
                    <option value="published">Published (Available)</option>
                    <option value="draft">Draft (Private)</option>
                  </select>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Description</label>
                <textarea 
                  v-model="newTemplateDesc" 
                  rows="2"
                  placeholder="Master framework layout description..." 
                  class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/12 text-[12px] font-sans font-light text-black outline-none focus:border-black/30 focus:bg-white transition-all resize-none"
                />
              </div>

              <div class="pt-2 flex items-center justify-between">
                <button 
                  type="button" 
                  @click="showBuildTemplateModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <div class="flex items-center gap-2">
                  <button 
                    type="submit" 
                    class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-800 transition-colors cursor-pointer"
                  >
                    Save Preset
                  </button>
                  <button 
                    type="button"
                    @click="handleBuildTemplateSubmit(true)"
                    class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors apple-press cursor-pointer border-none flex items-center gap-1.5"
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
          class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans font-light tracking-normal select-none"
          @click.self="showEditTemplateModal = false"
        >
          <div class="w-full max-w-[440px] bg-white rounded-[16px] shadow-[0_24px_70px_rgba(0,0,0,0.22)] border border-black/10 overflow-hidden flex flex-col animate-apple-pop">
            <div class="px-5 py-3.5 border-b border-black/10 flex items-center justify-between">
              <h3 class="text-[15px] font-medium text-black">Edit Blueprint</h3>
              <button 
                type="button" 
                @click="showEditTemplateModal = false" 
                class="size-7 rounded-[6px] hover:bg-black/5 flex items-center justify-center text-neutral-500 hover:text-black cursor-pointer border-none bg-transparent"
              >
                <X class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="handleEditTemplateSubmit" class="p-5 flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-[11px] uppercase tracking-normal text-neutral-500 font-medium">Blueprint Name</label>
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
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  @click="showEditTemplateModal = false" 
                  class="px-3.5 h-[32px] rounded-[8px] border border-black/15 bg-white hover:bg-neutral-50 text-[12px] font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  class="px-4 h-[32px] rounded-[8px] bg-black text-white hover:bg-neutral-800 text-[12px] font-medium transition-colors cursor-pointer border-none apple-press"
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
      @close="showWhatsNewModal = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Plus, Trash2, X, ExternalLink, ChevronRight
} from 'lucide-vue-next';

import { useAuthStore, type UserAccount } from '../stores/authStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import { glassConfirm, glassPrompt } from '../services/glassDialog.ts';
import UserProfileModal from '../components/modals/UserProfileModal.vue';
import WhatsNewModal from '../components/modals/WhatsNewModal.vue';
import type { Brand, GlobalTemplate, ProjectItem } from '../types/editor.ts';

const router = useRouter();
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
  authStore.signOut();
  router.push('/login');
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
  router.push('/login');
}

// ----------------------------------------------------
// Kinetic Inline Brand Expansion Drawer State
// ----------------------------------------------------
const expandedBrandIds = ref<Record<string, boolean>>({});

function isBrandExpanded(brandId: string): boolean {
  return Boolean(expandedBrandIds.value[brandId]);
}

function toggleBrandExpanded(brandId: string) {
  expandedBrandIds.value[brandId] = !expandedBrandIds.value[brandId];
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

// Initialization
onMounted(async () => {
  await brandStore.loadBrands();
  await brandStore.loadTemplates();
  await authStore.loadUsers();
  await editorStore.loadProjects();

  // Automatically expand the first brand house for instant visibility
  if (brandStore.brands.length > 0) {
    expandedBrandIds.value[brandStore.brands[0].id] = true;
  }
});

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

async function handleDeleteProject(projectId: string) {
  if (await glassConfirm({ title: 'Delete drop?', message: 'This will permanently remove the campaign drop from the database.', confirmLabel: 'Delete', danger: true })) {
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
    expandedBrandIds.value[created.id] = true;
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
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
