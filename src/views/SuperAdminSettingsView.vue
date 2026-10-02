<template>
  <div class="h-full w-full bg-white text-black font-707 flex flex-col select-none overflow-y-auto overflow-x-hidden">
    <!-- Top Header (Retaining Existing 48px Header Style as requested) -->
    <header class="w-full h-[48px] px-[20px] flex items-center justify-between border-b border-black/10 bg-white/90 backdrop-blur-md shrink-0 sticky top-0 z-30">
      <!-- Left: 707 Logo & Superadmin Identifier -->
      <div class="flex items-center gap-[16px]">
        <router-link to="/" class="h-[15px] w-[48px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="inset-0 object-contain pointer-events-none size-full"
          />
        </router-link>
        <div class="flex items-center gap-2">
          <span class="font-707 text-[13px] md:text-[14px] text-black tracking-[4.03px] font-normal uppercase">
            SUPERADMIN SETTINGS
          </span>
          <span class="px-2 py-0.5 rounded-[4px] bg-black text-white font-707 text-[10px] font-semibold tracking-wider uppercase">
            MASTER
          </span>
        </div>
      </div>

      <!-- Right: Back to Studio & Exit Superadmin -->
      <div class="flex items-center gap-3">
        <router-link 
          to="/" 
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] border border-black/15 text-[12px] font-707 font-medium hover:bg-black/5 transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Studio</span>
        </router-link>

        <button 
          @click="handleExitAdmin"
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-black border border-black/10 text-[12px] font-707 font-medium cursor-pointer transition-colors"
          title="Exit Superadmin Mode"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>
      </div>
    </header>

    <!-- Main Content Container (Figma Node 295:4068) -->
    <main class="flex-1 w-full max-w-[1280px] mx-auto py-[48px] flex flex-col gap-[40px]">
      <!-- 1. Intro Container (Figma Node 295:4069) -->
      <div class="flex flex-col gap-[8px] items-start px-[48px] w-full" data-node-id="295:4069" data-name="Intro Container">
        <h1 class="font-707 text-[28px] leading-[34px] tracking-[-0.56px] text-black font-normal" data-node-id="295:4070">
          System Governance & Directory
        </h1>
        <p class="font-707 text-[14px] leading-[24px] text-black max-w-[680px]" data-node-id="295:4071">
          Review design drops, manage brand PICs, team account passwords, and system-wide configurations.
        </p>
      </div>

      <!-- 2. Text-Based Navigation Container (Figma Node 295:4072) -->
      <div class="flex gap-[40px] md:gap-[48px] items-center leading-[24px] px-[48px] text-[16px] text-black w-full whitespace-nowrap" data-node-id="295:4072" data-name="Navigation Container">
        <button 
          @click="activeTab = 'brands'"
          class="bg-transparent border-none p-0 cursor-pointer font-707 text-[16px] transition-colors"
          :class="[
            activeTab === 'brands' 
              ? 'font-medium underline decoration-solid underline-offset-[8px] text-black' 
              : 'font-normal text-neutral-500 hover:text-black'
          ]"
        >
          Brands and PIC’s
        </button>

        <button 
          @click="activeTab = 'users'"
          class="bg-transparent border-none p-0 cursor-pointer font-707 text-[16px] transition-colors"
          :class="[
            activeTab === 'users' 
              ? 'font-medium underline decoration-solid underline-offset-[8px] text-black' 
              : 'font-normal text-neutral-500 hover:text-black'
          ]"
        >
          Team Accounts
        </button>

        <button 
          @click="activeTab = 'submissions'"
          class="bg-transparent border-none p-0 cursor-pointer font-707 text-[16px] transition-colors flex items-center gap-2"
          :class="[
            activeTab === 'submissions' 
              ? 'font-medium underline decoration-solid underline-offset-[8px] text-black' 
              : 'font-normal text-neutral-500 hover:text-black'
          ]"
        >
          <span>Project Lists</span>
          <span v-if="pendingSubmissionsCount > 0" class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
            {{ pendingSubmissionsCount }} review
          </span>
        </button>

        <button 
          @click="activeTab = 'templates'"
          class="bg-transparent border-none p-0 cursor-pointer font-707 text-[16px] transition-colors"
          :class="[
            activeTab === 'templates' 
              ? 'font-medium underline decoration-solid underline-offset-[8px] text-black' 
              : 'font-normal text-neutral-500 hover:text-black'
          ]"
        >
          Templates Build
        </button>
      </div>

      <!-- TAB 1: BRANDS AND PIC'S (Figma Node 295:4077) -->
      <div v-if="activeTab === 'brands'" class="flex flex-col gap-[20px] items-start px-[48px] w-full" data-node-id="295:4077" data-name="Brands List Container">
        <!-- Brands Header (Figma Node 295:4078) -->
        <div class="flex items-center justify-between w-full" data-node-id="295:4078" data-name="Brands Header">
          <p class="font-707 text-[16px] leading-[22px] text-black font-normal" data-node-id="295:4079">
            Brands List [{{ brandStore.brands.length }}]
          </p>

          <div class="flex items-center gap-2.5">
            <button 
              @click="handleResetBrandDatabase"
              class="border-[0.5px] border-black/20 flex items-center justify-center px-[12px] py-[6px] rounded-[8px] bg-white hover:bg-neutral-100 transition-all cursor-pointer font-707 text-[12px] leading-[16px] font-medium text-neutral-700 gap-1.5"
              title="Reset brands directory to default 20 brand accounts"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset Brand DB</span>
            </button>

            <button 
              @click="showAddBrandModal = true"
              class="border-[0.5px] border-black border-solid flex items-center justify-center px-[16px] py-[6px] rounded-[8px] bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[12px] leading-[16px] font-medium text-black gap-1.5"
              data-node-id="295:4080"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add Brand</span>
            </button>
          </div>
        </div>

        <!-- Brands Stacked List (Figma Node 295:4082) -->
        <div class="flex flex-col items-start w-full border-[#d9d9d9] border-[0.5px] border-solid rounded-[8px] overflow-hidden divide-y divide-[#d9d9d9]" data-node-id="295:4082">
          <div 
            v-for="(brand, bIdx) in brandStore.brands" 
            :key="brand.id"
            class="flex items-center justify-between px-[36px] md:px-[43px] py-[16px] w-full bg-white hover:bg-neutral-50/75 transition-colors group"
            :data-node-id="bIdx === 0 ? '295:4083' : '295:4096'"
          >
            <!-- Left: Brand Avatar, Name, Status Pill & Slug -->
            <div class="flex gap-[20px] md:gap-[24px] items-center shrink-0" data-name="Brand Info Container">
              <!-- Avatar Circle -->
              <div 
                class="size-[38px] rounded-full text-white flex items-center justify-center font-bold text-[14px] shrink-0 border border-black/10 shadow-xs"
                :style="{ backgroundColor: brand.primary_color || '#000000' }"
              >
                {{ brand.name.charAt(0) }}
              </div>

              <!-- Brand Name & Link -->
              <div class="flex flex-col gap-[2px] items-start w-[180px] shrink-0">
                <div class="flex gap-[8px] items-center w-full">
                  <p class="font-707 font-medium text-[12px] leading-[18px] text-black whitespace-nowrap">
                    {{ brand.name }}
                  </p>
                  <div class="border border-black border-solid flex items-center justify-center px-[6px] rounded-[100px] shrink-0 h-[16px]">
                    <span class="font-707 text-[10px] leading-[12px] text-black text-center whitespace-nowrap">
                      active
                    </span>
                  </div>
                </div>
                <p class="font-707 text-[11px] leading-[15px] text-neutral-500 font-mono">
                  events.707.co.id/{{ brand.slug }}
                </p>
              </div>
            </div>

            <!-- Col 2: On-going Projects -->
            <p class="font-707 text-[12px] leading-[18px] text-black whitespace-nowrap">
              {{ getBrandDropsCount(brand.slug) }} Projects On-going
            </p>

            <!-- Col 3: Last Activity -->
            <p class="font-707 text-[12px] leading-[18px] text-neutral-600 whitespace-nowrap">
              {{ getBrandLastActivity(brand.slug) }}
            </p>

            <!-- Col 4: PIC Accounts Count & Avatars -->
            <div class="flex items-center gap-2 whitespace-nowrap">
              <span class="font-707 text-[12px] leading-[18px] text-black">
                {{ getBrandPics(brand.slug).length }} PIC Account{{ getBrandPics(brand.slug).length === 1 ? '' : 's' }}
              </span>
              <div class="flex -space-x-1.5 overflow-hidden">
                <div 
                  v-for="pic in getBrandPics(brand.slug).slice(0, 3)" 
                  :key="pic.id" 
                  class="inline-block size-4.5 rounded-full ring-1 ring-white bg-neutral-200 text-[9px] font-bold text-center leading-4.5 text-black"
                  :title="pic.name"
                >
                  {{ pic.name.charAt(0) }}
                </div>
              </div>
            </div>

            <!-- Col 5: Action Button (Edit Details) & Remove Brand Icon Button -->
            <div class="flex items-center gap-2.5 shrink-0">
              <button 
                @click="openBrandDetailsModal(brand)"
                class="font-707 font-medium text-[12px] leading-[18px] text-black hover:opacity-75 cursor-pointer bg-transparent border-none p-0 transition-opacity whitespace-nowrap"
              >
                Edit Details
              </button>
              <button 
                @click="handleRemoveBrand(brand)"
                class="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer bg-transparent border-none flex items-center justify-center rounded-[4px] hover:bg-red-50"
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
          <p class="font-707 text-[16px] leading-[22px] text-black font-normal">
            Team Accounts [{{ authStore.users.length }}]
          </p>

          <div class="flex items-center gap-2.5">
            <button 
              @click="handleResetUserDatabase"
              class="border-[0.5px] border-black/20 flex items-center justify-center px-[12px] py-[6px] rounded-[8px] bg-white hover:bg-neutral-100 transition-all cursor-pointer font-707 text-[12px] leading-[16px] font-medium text-neutral-700 gap-1.5"
              title="Reset user database to clean seed state"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span>Reset User DB</span>
            </button>

            <button 
              @click="showAddUserModal = true"
              class="border-[0.5px] border-black border-solid flex items-center justify-center px-[16px] py-[6px] rounded-[8px] bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[12px] leading-[16px] font-medium text-black gap-1.5"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>
        </div>

        <!-- Users Table -->
        <div class="flex flex-col items-start w-full border-[#d9d9d9] border-[0.5px] border-solid rounded-[8px] overflow-hidden divide-y divide-[#d9d9d9]">
          <div 
            v-for="user in authStore.users" 
            :key="user.id"
            class="flex items-center justify-between px-[36px] md:px-[43px] py-[16px] w-full bg-white hover:bg-neutral-50/75 transition-colors"
          >
            <!-- Member Info -->
            <div class="flex gap-[16px] items-center shrink-0 w-[240px]">
              <div class="size-[36px] rounded-full bg-black text-white flex items-center justify-center font-bold text-[13px] shrink-0 shadow-xs">
                {{ user.name.charAt(0) }}
              </div>
              <div class="flex flex-col gap-[2px]">
                <span class="font-707 font-medium text-[12px] text-black">{{ user.name }}</span>
                <span class="font-707 text-[11px] text-neutral-500 font-mono">{{ user.email }}</span>
              </div>
            </div>

            <!-- Role Badge -->
            <div class="w-[140px]">
              <div class="border border-black border-solid inline-flex items-center justify-center px-[8px] py-[1px] rounded-[100px]">
                <span class="font-707 text-[10px] text-black capitalize">
                  {{ user.role === 'superadmin' ? 'Superadmin' : user.role === 'editor' ? 'Brand Designer' : 'Viewer' }}
                </span>
              </div>
            </div>

            <!-- Sign-in Password Management -->
            <div class="flex items-center gap-2 w-[220px]">
              <code class="px-2 py-0.5 rounded bg-black/5 text-[11px] font-mono text-black">
                {{ visiblePasswords[user.id] ? (user.password || '707studio') : '••••••••••••' }}
              </code>
              <button 
                @click="togglePasswordVisibility(user.id)"
                class="text-neutral-500 hover:text-black p-1 cursor-pointer bg-transparent border-none"
                :title="visiblePasswords[user.id] ? 'Hide password' : 'Show password'"
              >
                <Eye v-if="!visiblePasswords[user.id]" class="w-3.5 h-3.5" />
                <EyeOff v-else class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="openPasswordModal(user)"
                class="font-707 text-[11px] text-black underline font-medium hover:opacity-75 cursor-pointer bg-transparent border-none ml-1"
              >
                Reset
              </button>
            </div>

            <!-- Assigned Brands -->
            <div class="flex items-center gap-1.5 flex-wrap w-[180px]">
              <span 
                v-for="b in user.assignedBrands" 
                :key="b"
                class="px-2 py-0.5 rounded bg-black/5 text-[10px] text-neutral-700 capitalize font-mono"
              >
                {{ b }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 w-[120px] text-right">
              <button 
                v-if="user.role !== 'superadmin'"
                @click="authStore.removeUser(user.id)"
                class="font-707 text-[12px] text-red-600 hover:underline cursor-pointer bg-transparent border-none"
              >
                Remove
              </button>
              <span v-else class="font-707 text-[11px] text-neutral-400 italic">Primary Admin</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: PROJECT LISTS / SUBMISSIONS QUEUE -->
      <div v-if="activeTab === 'submissions'" class="flex flex-col gap-[20px] items-start px-[48px] w-full">
        <!-- Projects Header -->
        <div class="flex items-center justify-between w-full">
          <p class="font-707 text-[16px] leading-[22px] text-black font-normal">
            Project Submissions [{{ editorStore.projects.length }}]
          </p>

          <button 
            @click="editorStore.loadProjects()" 
            class="border-[0.5px] border-black border-solid flex items-center justify-center px-[16px] py-[6px] rounded-[8px] bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[12px] leading-[16px] font-medium text-black gap-1.5"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Refresh Queue</span>
          </button>
        </div>

        <!-- Project Entries -->
        <div class="flex flex-col items-start w-full border-[#d9d9d9] border-[0.5px] border-solid rounded-[8px] overflow-hidden divide-y divide-[#d9d9d9]">
          <div 
            v-for="project in editorStore.projects" 
            :key="project.id"
            class="flex items-center justify-between px-[36px] md:px-[43px] py-[16px] w-full bg-white hover:bg-neutral-50/75 transition-colors"
          >
            <!-- Project Title & Brand -->
            <div class="flex flex-col w-[260px] gap-[2px]">
              <span class="font-707 font-medium text-[12px] text-black truncate">{{ project.title }}</span>
              <span class="font-707 text-[11px] text-neutral-500 font-mono">/{{ project.brand_slug || 'atmos' }}/{{ project.slug }}</span>
            </div>

            <!-- Layout Info -->
            <span class="font-707 text-[12px] text-neutral-700">
              {{ project.pages?.length || 1 }} Pages · {{ project.widget_tree?.length || 0 }} Widgets
            </span>

            <!-- Status Badge -->
            <div>
              <span 
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[100px] text-[10px] font-medium border"
                :class="getStatusBadgeClass(project.status)"
              >
                <span class="size-1.5 rounded-full" :class="getStatusDotClass(project.status)" />
                {{ formatStatusLabel(project.status) }}
              </span>
            </div>

            <!-- Last Updated -->
            <span class="font-707 text-[12px] text-neutral-500">
              {{ editorStore.formatRelativeTime(project.updated_at) }}
            </span>

            <!-- Review Actions -->
            <div class="flex items-center gap-2">
              <button 
                @click="handlePreviewProject(project.id)"
                class="border-[0.5px] border-black px-2.5 py-1 rounded-[6px] text-[11px] font-707 font-medium text-black hover:bg-black hover:text-white transition-all cursor-pointer"
              >
                Inspect
              </button>

              <button 
                v-if="project.status === 'pending_review' || project.status === 'draft'"
                @click="handleApproveProject(project.id)"
                class="bg-black text-white px-3 py-1 rounded-[6px] text-[11px] font-707 font-medium hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1"
              >
                <CheckCircle class="w-3 h-3" />
                <span>Approve</span>
              </button>

              <button 
                v-if="project.status === 'pending_review'"
                @click="handleRejectProject(project.id)"
                class="bg-neutral-100 hover:bg-neutral-200 text-black px-2.5 py-1 rounded-[6px] text-[11px] font-707 cursor-pointer"
              >
                Revisions
              </button>
            </div>
          </div>

          <div v-if="!editorStore.projects.length" class="p-8 text-center text-neutral-400 font-707 text-[12px] w-full">
            No project submissions found.
          </div>
        </div>
      </div>

      <!-- TAB 4: TEMPLATES BUILD (Superadmin Template Governance) -->
      <div v-if="activeTab === 'templates'" class="flex flex-col gap-[20px] items-start px-[48px] w-full">
        <!-- Templates Header with Filter & Build Action -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div class="flex items-center gap-4">
            <p class="font-707 text-[16px] leading-[22px] text-black font-normal">
              Activation Template Presets [{{ filteredTemplates.length }}]
            </p>

            <!-- Status Filter Tabs -->
            <div class="flex items-center gap-1.5 p-0.5 rounded-[6px] bg-black/[0.04] border border-black/5 text-[11px] font-707">
              <button 
                @click="templateFilter = 'all'"
                class="px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
                :class="templateFilter === 'all' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black'"
              >
                All ({{ brandStore.templates.length }})
              </button>
              <button 
                @click="templateFilter = 'published'"
                class="px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
                :class="templateFilter === 'published' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black'"
              >
                Published ({{ publishedTemplatesCount }})
              </button>
              <button 
                @click="templateFilter = 'draft'"
                class="px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
                :class="templateFilter === 'draft' ? 'bg-white text-black font-medium shadow-xs' : 'text-neutral-500 hover:text-black'"
              >
                Drafts ({{ draftTemplatesCount }})
              </button>
            </div>
          </div>

          <button 
            @click="openBuildTemplateModal" 
            class="border-[0.5px] border-black border-solid flex items-center justify-center px-[16px] py-[6px] rounded-[8px] bg-white hover:bg-black hover:text-white transition-all cursor-pointer font-707 text-[12px] leading-[16px] font-medium text-black gap-1.5 shrink-0"
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
            class="border-[#d9d9d9] border-[0.5px] border-solid rounded-[8px] p-5 flex flex-col justify-between gap-4 bg-white hover:border-black/30 transition-colors group"
          >
            <!-- Top: Header Info & Badges -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-707 font-medium text-[14px] text-black">{{ tpl.name }}</h3>
                  <!-- Category Pill -->
                  <span class="px-2 py-0.5 rounded-[100px] border border-black/20 text-[10px] font-707 uppercase text-neutral-700 bg-neutral-50">
                    {{ tpl.category || 'custom' }}
                  </span>
                </div>
                <p class="font-707 text-[12px] text-neutral-500 leading-relaxed line-clamp-2">{{ tpl.description }}</p>
              </div>

              <!-- Draft / Published Status Badge -->
              <button 
                @click="brandStore.toggleTemplateStatus(tpl.id)"
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[100px] text-[10px] font-707 font-medium border shrink-0 transition-colors cursor-pointer"
                :class="tpl.status === 'published' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'"
                :title="tpl.status === 'published' ? 'Click to unpublish to draft' : 'Click to publish for designers'"
              >
                <span class="size-1.5 rounded-full" :class="tpl.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'" />
                <span>{{ tpl.status === 'published' ? 'Published' : 'Draft' }}</span>
              </button>
            </div>

            <!-- Middle Summary -->
            <div class="flex items-center justify-between text-[11px] font-707 text-neutral-500">
              <span class="flex items-center gap-1">
                <Layers class="w-3.5 h-3.5 text-neutral-400" />
                <span>{{ tpl.widget_tree.length }} Widgets configured</span>
              </span>
              <span>By {{ tpl.created_by || 'Superadmin' }}</span>
            </div>

            <!-- Bottom: Action Bar -->
            <div class="border-t border-black/10 pt-3 flex items-center justify-between gap-2">
              <div class="flex items-center gap-3">
                <button 
                  @click="openEditTemplateModal(tpl)"
                  class="font-707 font-medium text-[12px] text-black hover:opacity-75 cursor-pointer bg-transparent border-none p-0 transition-opacity"
                >
                  Edit Details
                </button>
                <button 
                  @click="brandStore.toggleTemplateStatus(tpl.id)"
                  class="font-707 text-[11px] text-neutral-500 hover:text-black cursor-pointer bg-transparent border-none p-0"
                >
                  {{ tpl.status === 'published' ? 'Set to Draft' : 'Publish' }}
                </button>
                <button 
                  @click="handleRemoveTemplate(tpl)"
                  class="font-707 text-[11px] text-red-500 hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  Remove
                </button>
              </div>

              <button 
                @click="handleEditInStudio(tpl)"
                class="border-[0.5px] border-black px-3 py-1 rounded-[6px] text-[11px] font-707 font-medium text-black hover:bg-black hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Edit in Builder</span>
                <ExternalLink class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="!filteredTemplates.length" class="p-8 text-center text-neutral-400 font-707 text-[12px] w-full border border-dashed border-neutral-300 rounded-[8px]">
          No templates found in this view. Click "Build New Template" to create one.
        </div>
      </div>
    </main>

    <!-- Modal 1: Edit Brand Details & PICs Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showBrandDetailsModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showBrandDetailsModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[480px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div 
                class="size-8 rounded-[6px] text-white flex items-center justify-center font-bold text-[14px]"
                :style="{ backgroundColor: targetBrand?.primary_color || '#000' }"
              >
                {{ targetBrand?.name.charAt(0) }}
              </div>
              <div>
                <h3 class="font-707 font-medium text-[16px] text-black">{{ targetBrand?.name }}</h3>
                <p class="font-707 text-[11px] text-neutral-500 font-mono">events.707.co.id/{{ targetBrand?.slug }}</p>
              </div>
            </div>
            <button @click="showBrandDetailsModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleSaveBrandDetails" class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Brand Name</label>
              <input 
                v-model="editBrandName" 
                type="text" 
                required 
                class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Description</label>
              <textarea 
                v-model="editBrandDesc" 
                rows="2"
                class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black resize-none"
              />
            </div>

            <!-- Assigned PICs for this brand -->
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">
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
                  class="flex items-center justify-between bg-black/[0.03] px-3 py-1.5 rounded-[6px] border border-black/5 text-[12px]"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-black">{{ pic.name }}</span>
                    <span class="text-neutral-400 font-mono text-[11px]">({{ pic.email }})</span>
                  </div>
                  <button 
                    v-if="pic.role !== 'superadmin'"
                    type="button" 
                    @click="authStore.unassignBrandPic(targetBrand?.slug || '', pic.id)"
                    class="text-neutral-400 hover:text-red-600 font-bold"
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
                class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[12px] font-medium"
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
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddUserModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Create Team Member Account</h3>
            <button @click="showAddUserModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleAddUserSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Full Name</label>
              <input 
                v-model="newUserName" 
                type="text" 
                required 
                placeholder="e.g. Maya Chen" 
                class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Email Address</label>
                <input 
                  v-model="newUserEmail" 
                  type="email" 
                  required 
                  placeholder="maya@atmos.co.id" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Phone Number</label>
                <input 
                  v-model="newUserPhone" 
                  type="tel" 
                  placeholder="+62 812..." 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Sign-in Password</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="newUserPassword" 
                  type="text" 
                  required 
                  placeholder="Set initial password" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black font-mono"
                />
                <button 
                  type="button" 
                  @click="generateRandomPassword"
                  class="px-3 h-[38px] rounded-[8px] border border-black/15 text-[11px] font-707 font-medium hover:bg-black/5 whitespace-nowrap cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Access Role</label>
                <select 
                  v-model="newUserRole" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
                >
                  <option value="editor">Brand Designer / Editor</option>
                  <option value="viewer">Viewer / Reviewer</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Primary Assigned Brand</label>
                <select 
                  v-model="newUserBrand" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
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
                class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[12px] font-medium"
              >
                Create Account
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
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showPasswordModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[400px] shadow-xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Reset Sign-in Password</h3>
            <button @click="showPasswordModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <p class="font-707 text-[12px] text-neutral-600">
            Resetting password for <strong>{{ targetUserForPassword?.name }}</strong> ({{ targetUserForPassword?.email }}).
          </p>

          <form @submit.prevent="handlePasswordUpdateSubmit" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">New Password</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="updatedPasswordValue" 
                  type="text" 
                  required 
                  placeholder="Enter new password" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black font-mono"
                />
                <button 
                  type="button" 
                  @click="updatedPasswordValue = '707_' + Math.random().toString(36).substring(2, 8)"
                  class="px-3 h-[38px] rounded-[8px] border border-black/15 text-[11px] font-707 font-medium hover:bg-black/5 whitespace-nowrap cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showPasswordModal = false" 
                class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[12px] font-medium"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 5: Build New Template Modal (Superadmin) -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showBuildTemplateModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showBuildTemplateModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[500px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Build Master Activation Template</h3>
            <button @click="showBuildTemplateModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <p class="font-707 text-[12px] text-neutral-600">
            Configure a reusable layout preset for Brand Designers. You can launch it directly in the editor canvas to customize widgets.
          </p>

          <form @submit.prevent="handleBuildTemplateSubmit(false)" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Template Name</label>
              <input 
                v-model="newTemplateName" 
                type="text" 
                required 
                placeholder="e.g. VIP Secret Drop & Guest E-Pass" 
                class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Category</label>
                <select 
                  v-model="newTemplateCategory" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
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
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Initial Status</label>
                <select 
                  v-model="newTemplateStatus" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
                >
                  <option value="draft">Draft (Private Superadmin)</option>
                  <option value="published">Published (Available for Brands)</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Description</label>
              <textarea 
                v-model="newTemplateDesc" 
                rows="2"
                placeholder="Provide guidelines or activation instructions..." 
                class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black resize-none"
              />
            </div>

            <!-- Starter Widget Architecture Base -->
            <div class="flex flex-col gap-1.5">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Starting Architecture</label>
              <div class="grid grid-cols-2 gap-2 text-[12px] font-707">
                <label 
                  class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'blank' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="blank" class="hidden" />
                  <span>Blank Canvas</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Clean slate mobile screen</span>
                </label>

                <label 
                  class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'raffle' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="raffle" class="hidden" />
                  <span>Raffle Drop</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Hero + Timer + Sizing + Terms</span>
                </label>

                <label 
                  class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-1 transition-colors"
                  :class="starterPresetBase === 'rsvp' ? 'border-black bg-black/[0.03] font-medium' : 'border-black/10 hover:border-black/30'"
                >
                  <input type="radio" v-model="starterPresetBase" value="rsvp" class="hidden" />
                  <span>RSVP Pass</span>
                  <span class="text-[10px] text-neutral-400 font-normal">Hero + Pass Form + Venue Map</span>
                </label>

                <label 
                  class="p-2.5 rounded-[8px] border cursor-pointer flex flex-col gap-1 transition-colors"
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
                class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="px-4 h-[36px] rounded-[8px] border border-black text-black font-707 text-[12px] font-medium hover:bg-neutral-100"
              >
                Save Preset
              </button>
              <button 
                type="button" 
                @click="handleBuildTemplateSubmit(true)"
                class="apple-glass-btn-dark bg-black text-white px-4 h-[36px] rounded-[8px] font-707 text-[12px] font-medium flex items-center gap-1.5"
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
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showEditTemplateModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-707">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Edit Template Details</h3>
            <button @click="showEditTemplateModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleEditTemplateSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Template Name</label>
              <input 
                v-model="editTemplateName" 
                type="text" 
                required 
                class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Category</label>
                <select 
                  v-model="editTemplateCategory" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
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
                <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Status</label>
                <select 
                  v-model="editTemplateStatus" 
                  class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
                >
                  <option value="draft">Draft (Work in Progress)</option>
                  <option value="published">Published (Live for Brands)</option>
                </select>
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Description</label>
              <textarea 
                v-model="editTemplateDesc" 
                rows="3"
                class="w-full p-2.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black resize-none"
              />
            </div>

            <div class="flex items-center justify-end gap-2.5 mt-2">
              <button 
                type="button" 
                @click="showEditTemplateModal = false" 
                class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[12px] font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ArrowLeft, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  RotateCcw
} from 'lucide-vue-next';
import { useAuthStore, type UserAccount, type UserRole } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import type { Brand, GlobalTemplate, WidgetItem } from '../types/editor.ts';

const router = useRouter();
const authStore = useAuthStore();
const editorStore = useEditorStore();
const brandStore = useBrandStore();

const activeTab = ref<'brands' | 'users' | 'submissions' | 'templates'>('brands');
const templateFilter = ref<'all' | 'published' | 'draft'>('all');

// Modal States
const showAddBrandModal = ref(false);
const showBrandDetailsModal = ref(false);
const showAddUserModal = ref(false);
const showPasswordModal = ref(false);
const showAssignPicModal = ref(false);
const showBuildTemplateModal = ref(false);
const showEditTemplateModal = ref(false);

// Form States
const targetBrand = ref<Brand | null>(null);
const editBrandName = ref('');
const editBrandDesc = ref('');

const newUserName = ref('');
const newUserEmail = ref('');
const newUserPhone = ref('');
const newUserPassword = ref('atmos_pass_2026');
const newUserRole = ref<UserRole>('editor');
const newUserBrand = ref('atmos');

const targetUserForPassword = ref<UserAccount | null>(null);
const updatedPasswordValue = ref('');

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

const visiblePasswords = reactive<Record<string, boolean>>({});

const pendingSubmissionsCount = computed(() => {
  return editorStore.projects.filter(p => p.status === 'pending_review').length;
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

function togglePasswordVisibility(userId: string) {
  visiblePasswords[userId] = !visiblePasswords[userId];
}

function generateRandomPassword() {
  newUserPassword.value = '707_' + Math.random().toString(36).substring(2, 9);
}

function openBrandDetailsModal(brand: Brand) {
  targetBrand.value = brand;
  editBrandName.value = brand.name;
  editBrandDesc.value = brand.description || '';
  showBrandDetailsModal.value = true;
}

function handleSaveBrandDetails() {
  if (targetBrand.value) {
    targetBrand.value.name = editBrandName.value;
    targetBrand.value.description = editBrandDesc.value;
    editorStore.showToast(`Updated details for ${editBrandName.value}.`);
    showBrandDetailsModal.value = false;
  }
}

function handleRemoveBrand(brand: Brand) {
  if (confirm(`Are you sure you want to remove the "${brand.name}" brand account from the directory?`)) {
    brandStore.removeBrand(brand.id);
    editorStore.showToast(`Brand "${brand.name}" removed from ecosystem.`);
  }
}

function handleResetBrandDatabase() {
  if (confirm('Are you sure you want to reset the brands database to the official 20 brand accounts?')) {
    brandStore.resetBrands();
    editorStore.showToast('Brand directory reset to official 20 brand accounts.');
  }
}

function openPasswordModal(user: UserAccount) {
  targetUserForPassword.value = user;
  updatedPasswordValue.value = user.password || '';
  showPasswordModal.value = true;
}

function handlePasswordUpdateSubmit() {
  if (targetUserForPassword.value && updatedPasswordValue.value) {
    authStore.updateUserPassword(targetUserForPassword.value.id, updatedPasswordValue.value);
    editorStore.showToast(`Password updated for ${targetUserForPassword.value.name}.`);
    showPasswordModal.value = false;
  }
}

function handleResetUserDatabase() {
  if (confirm('Are you sure you want to reset the entire user accounts database to clean default seed state?')) {
    authStore.resetUsers();
    editorStore.showToast('User accounts database reset to default seed state.');
  }
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

function handleApproveProject(projectId: string) {
  editorStore.updateProjectStatus(projectId, 'approved');
  editorStore.showToast('Project approved and unlocked for live distribution.');
}

function handleRejectProject(projectId: string) {
  editorStore.updateProjectStatus(projectId, 'draft');
  editorStore.showToast('Revision request sent to designer.');
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

function handleRemoveTemplate(tpl: GlobalTemplate) {
  if (confirm(`Remove template "${tpl.name}" from presets?`)) {
    brandStore.removeTemplate(tpl.id);
    editorStore.showToast(`Template "${tpl.name}" removed.`);
  }
}

function handleEditInStudio(tpl: GlobalTemplate) {
  editorStore.createNewProject(`Template: ${tpl.name}`, undefined, tpl.widget_tree);
  editorStore.showToast(`Loaded "${tpl.name}" in Builder mode.`);
  router.push('/editor');
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
