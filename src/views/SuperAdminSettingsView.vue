<template>
  <div class="min-h-screen w-screen bg-white text-black font-['Helvetica_Neue',sans-serif] flex flex-col select-none">
    <!-- Top Header (Consistent 48px Header Height with 707 Studio) -->
    <header class="w-full h-[48px] px-[20px] md:px-[48px] flex items-center justify-between border-b border-black/10 bg-white shrink-0 sticky top-0 z-30">
      <!-- Left: 707 Logo & Superadmin Studio Identifier -->
      <div class="flex items-center gap-[16px]">
        <router-link to="/" class="h-[15px] w-[48px] relative shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="inset-0 object-contain pointer-events-none size-full"
            @error="logoFailed = true"
          />
          <span v-if="logoFailed" class="font-black text-black text-xs tracking-tighter">707</span>
        </router-link>
        <p class="font-707 text-[13px] md:text-[14px] text-black tracking-[4.03px] font-normal uppercase whitespace-nowrap leading-[18px]">
          DESIGN STUDIO SUPERADMIN
        </p>
      </div>

      <!-- Right: User Avatar & Back to Studio -->
      <div class="flex items-center gap-3">
        <router-link 
          to="/" 
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] border-[0.5px] border-black text-[12px] font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Back to Studio</span>
        </router-link>

        <button 
          @click="handleExitAdmin"
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-[0.5px] border-neutral-300 text-[12px] font-medium cursor-pointer transition-colors"
          title="Sign Out Superadmin Mode"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>
      </div>
    </header>

    <!-- Main Container (Figma Node 295:4068) -->
    <main class="flex-1 w-full flex flex-col gap-[48px] py-[36px] pb-[72px]" data-node-id="295:4068" data-name="Container">
      <!-- 1. Intro Container (Figma Node 295:4069) -->
      <div class="flex flex-col gap-[8px] items-start px-[24px] md:px-[48px] w-full shrink-0 text-black" data-node-id="295:4069" data-name="Intro Container">
        <h1 class="text-[28px] font-normal leading-[34px] tracking-[-0.56px] text-black m-0" data-node-id="295:4070">
          System Governance & Directory
        </h1>
        <p class="text-[14px] leading-[24px] text-black max-w-[646px] m-0" data-node-id="295:4071">
          Review design drops, manage brand PICs, team account passwords, and system-wide configurations.
        </p>
      </div>

      <!-- 2. Navigation Container (Figma Node 295:4072) -->
      <div class="flex gap-[32px] md:gap-[48px] items-center px-[24px] md:px-[48px] text-[18px] leading-[24px] text-black w-full shrink-0 border-b border-black/10 pb-[12px]" data-node-id="295:4072" data-name="Navigation Container">
        <!-- Tab 1: Brands and PIC's -->
        <button 
          @click="activeTab = 'brands'"
          class="bg-transparent border-0 outline-none p-0 cursor-pointer text-[18px] leading-[24px] transition-opacity hover:opacity-80"
          :class="[
            activeTab === 'brands' 
              ? 'font-medium text-black underline decoration-solid underline-offset-8' 
              : 'font-normal text-black opacity-60 hover:opacity-100'
          ]"
          data-node-id="295:4073"
        >
          Brands and PIC’s
        </button>

        <!-- Tab 2: Team Accounts -->
        <button 
          @click="activeTab = 'users'"
          class="bg-transparent border-0 outline-none p-0 cursor-pointer text-[18px] leading-[24px] transition-opacity hover:opacity-80"
          :class="[
            activeTab === 'users' 
              ? 'font-medium text-black underline decoration-solid underline-offset-8' 
              : 'font-normal text-black opacity-60 hover:opacity-100'
          ]"
          data-node-id="295:4074"
        >
          Team Accounts
        </button>

        <!-- Tab 3: Project Lists -->
        <button 
          @click="activeTab = 'projects'"
          class="bg-transparent border-0 outline-none p-0 cursor-pointer text-[18px] leading-[24px] transition-opacity hover:opacity-80 flex items-center gap-1.5"
          :class="[
            activeTab === 'projects' 
              ? 'font-medium text-black underline decoration-solid underline-offset-8' 
              : 'font-normal text-black opacity-60 hover:opacity-100'
          ]"
          data-node-id="295:4075"
        >
          <span>Project Lists</span>
          <span v-if="pendingCount > 0" class="text-[11px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            {{ pendingCount }}
          </span>
        </button>

        <!-- Tab 4: Templates Build -->
        <button 
          @click="activeTab = 'templates'"
          class="bg-transparent border-0 outline-none p-0 cursor-pointer text-[18px] leading-[24px] transition-opacity hover:opacity-80"
          :class="[
            activeTab === 'templates' 
              ? 'font-medium text-black underline decoration-solid underline-offset-8' 
              : 'font-normal text-black opacity-60 hover:opacity-100'
          ]"
          data-node-id="295:4076"
        >
          Templates Build
        </button>
      </div>

      <!-- 3. TAB 1 CONTENT: Brands and PIC's (Exact Figma Layout Node 295:4077) -->
      <div v-if="activeTab === 'brands'" class="flex flex-col gap-[24px] items-start px-[24px] md:px-[48px] w-full shrink-0" data-node-id="295:4077" data-name="Brands List Container">
        <!-- Brands Header (Figma Node 295:4078) -->
        <div class="flex items-center justify-between w-full shrink-0" data-node-id="295:4078" data-name="Brands Header">
          <p class="font-normal text-[18px] leading-[24px] text-black m-0 whitespace-nowrap" data-node-id="295:4079">
            Brands List [{{ brandStore.brands.length }}]
          </p>
          <!-- Add Brand Button (Figma Node 295:4080) -->
          <button 
            @click="showAddBrandModal = true"
            class="border-[0.5px] border-black border-solid flex items-center justify-center px-[24px] py-[8px] rounded-[8px] bg-transparent hover:bg-black hover:text-white transition-all duration-150 cursor-pointer shrink-0 apple-press" 
            data-node-id="295:4080" 
            data-name="Add Brand Container"
          >
            <p class="font-normal text-[18px] leading-[24px] m-0 whitespace-nowrap" data-node-id="295:4081">
              Add Brand
            </p>
          </button>
        </div>

        <!-- Brands List (Figma Node 295:4082) -->
        <div class="border-[#aaa] border-[0.5px] border-solid rounded-[8px] flex flex-col items-start w-full shrink-0 overflow-hidden divide-y divide-[#aaa]" data-node-id="295:4082" data-name="Brands List">
          <div 
            v-for="(brand, bIdx) in brandStore.brands" 
            :key="brand.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-[20px] md:px-[43px] py-[16px] w-full shrink-0 gap-4 hover:bg-black/[0.015] transition-colors"
            data-name="Brand Entry"
            :data-node-id="bIdx === 0 ? '295:4083' : '295:4096'"
          >
            <!-- Left: Brand Info Container (Figma Node 295:4084) -->
            <div class="flex gap-[24px] items-center shrink-0 min-w-[280px]" data-name="Brand Info Container">
              <!-- Brand Logo Avatar Circle (Figma Node 295:4085) -->
              <div 
                class="size-[44px] rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[16px] shadow-xs"
                :style="{ backgroundColor: brand.primary_color || '#000000' }"
              >
                {{ brand.name.charAt(0) }}
              </div>

              <!-- Brand Name & Slug -->
              <div class="flex flex-col gap-[4px] items-start shrink-0" data-name="Brand Info">
                <div class="flex gap-[8px] items-center shrink-0 w-full" data-name="Brand Name Container">
                  <p class="font-medium text-[14px] leading-[20px] text-black whitespace-nowrap m-0" data-node-id="295:4088">
                    {{ brand.name }}
                  </p>
                  <!-- Active Status Pill (Figma Node 295:4089) -->
                  <div class="border border-black border-solid flex items-center justify-center px-[8px] h-[18px] rounded-[100px] shrink-0" data-name="Brand Status Container">
                    <p class="font-normal text-[11px] leading-[14px] text-black text-center whitespace-nowrap m-0">
                      active
                    </p>
                  </div>
                </div>
                <p class="font-normal text-[12px] leading-[16px] text-black m-0" data-node-id="295:4091">
                  events.707.co.id/{{ brand.slug }}
                </p>
              </div>
            </div>

            <!-- Column 1: Ongoing Projects -->
            <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0 shrink-0" data-node-id="295:4092">
              {{ getBrandDropsCount(brand.slug) }} Projects On-going
            </p>

            <!-- Column 2: Last Active / Relative Time -->
            <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0 shrink-0" data-node-id="295:4093">
              {{ getBrandLatestActiveTime(brand.slug) }}
            </p>

            <!-- Column 3: PIC Accounts Count & Avatars -->
            <div class="flex items-center gap-2 shrink-0">
              <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0" data-node-id="295:4094">
                {{ getBrandPics(brand.slug).length }} PIC Accounts
              </p>
              <button 
                @click="openAssignPicModal(brand.slug, brand.name)"
                class="text-[11px] font-medium text-neutral-500 hover:text-black border border-black/20 hover:border-black rounded px-2 py-0.5 transition-colors cursor-pointer"
                title="Assign Designer PIC"
              >
                + Assign
              </button>
            </div>

            <!-- Column 4: Edit Details Action Button (Figma Node 295:4095) -->
            <button 
              @click="openEditBrandModal(brand)"
              class="font-bold text-[14px] leading-[20px] text-black whitespace-nowrap cursor-pointer hover:underline border-0 outline-none bg-transparent p-0 text-left shrink-0" 
              data-node-id="295:4095"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      <!-- 4. TAB 2 CONTENT: Team Accounts & Passwords (Matching Figma Style) -->
      <div v-if="activeTab === 'users'" class="flex flex-col gap-[24px] items-start px-[24px] md:px-[48px] w-full shrink-0">
        <!-- Team Header -->
        <div class="flex items-center justify-between w-full shrink-0">
          <p class="font-normal text-[18px] leading-[24px] text-black m-0 whitespace-nowrap">
            Team Accounts List [{{ authStore.users.length }}]
          </p>
          <button 
            @click="showAddUserModal = true"
            class="border-[0.5px] border-black border-solid flex items-center justify-center px-[24px] py-[8px] rounded-[8px] bg-transparent hover:bg-black hover:text-white transition-all duration-150 cursor-pointer shrink-0 apple-press" 
          >
            <p class="font-normal text-[18px] leading-[24px] m-0 whitespace-nowrap">
              Add Team Member
            </p>
          </button>
        </div>

        <!-- Team Accounts List Table Container -->
        <div class="border-[#aaa] border-[0.5px] border-solid rounded-[8px] flex flex-col items-start w-full shrink-0 overflow-hidden divide-y divide-[#aaa]">
          <div 
            v-for="user in authStore.users" 
            :key="user.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-[20px] md:px-[43px] py-[16px] w-full shrink-0 gap-4 hover:bg-black/[0.015] transition-colors"
          >
            <!-- Member Info -->
            <div class="flex gap-[20px] items-center shrink-0 min-w-[280px]">
              <div class="size-[44px] rounded-full shrink-0 bg-black text-white flex items-center justify-center font-bold text-[16px]">
                {{ user.name.charAt(0) }}
              </div>

              <div class="flex flex-col gap-[2px] items-start">
                <div class="flex gap-[8px] items-center">
                  <p class="font-medium text-[14px] leading-[20px] text-black whitespace-nowrap m-0">
                    {{ user.name }}
                  </p>
                  <div class="border border-black border-solid flex items-center justify-center px-[8px] h-[18px] rounded-[100px]">
                    <p class="font-normal text-[11px] leading-[14px] text-black text-center whitespace-nowrap m-0 uppercase">
                      {{ user.role === 'superadmin' ? 'superadmin' : user.role === 'editor' ? 'designer' : 'viewer' }}
                    </p>
                  </div>
                </div>
                <p class="font-normal text-[12px] leading-[16px] text-neutral-500 m-0">
                  {{ user.email }} · {{ user.phone || '+62 811...' }}
                </p>
              </div>
            </div>

            <!-- Password Column with Toggle -->
            <div class="flex items-center gap-2 shrink-0">
              <span class="text-[12px] text-neutral-400">Password:</span>
              <code class="px-2 py-0.5 rounded bg-black/5 text-[13px] font-mono text-black">
                {{ visiblePasswords[user.id] ? user.password : '••••••••••••' }}
              </code>
              <button 
                @click="togglePasswordVisibility(user.id)"
                class="text-neutral-500 hover:text-black p-1 cursor-pointer"
                :title="visiblePasswords[user.id] ? 'Hide Password' : 'Show Password'"
              >
                <Eye v-if="!visiblePasswords[user.id]" class="w-3.5 h-3.5" />
                <EyeOff v-else class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="openPasswordModal(user)"
                class="text-[12px] text-black font-medium hover:underline cursor-pointer ml-1"
              >
                Reset
              </button>
            </div>

            <!-- Assigned Brands -->
            <div class="flex items-center gap-1.5 flex-wrap shrink-0">
              <span class="text-[12px] text-neutral-400">Brand:</span>
              <span 
                v-for="b in user.assignedBrands" 
                :key="b"
                class="px-2 py-0.5 rounded border border-black/20 text-[11px] text-black font-medium capitalize"
              >
                {{ b }}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3 shrink-0">
              <button 
                v-if="user.role !== 'superadmin'"
                @click="authStore.removeUser(user.id)"
                class="font-normal text-[13px] text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
              >
                Remove
              </button>
              <span v-else class="text-[12px] text-neutral-400 italic">Primary Admin</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. TAB 3 CONTENT: Project Lists & Submissions Queue -->
      <div v-if="activeTab === 'projects'" class="flex flex-col gap-[24px] items-start px-[24px] md:px-[48px] w-full shrink-0">
        <!-- Projects Header -->
        <div class="flex items-center justify-between w-full shrink-0">
          <p class="font-normal text-[18px] leading-[24px] text-black m-0 whitespace-nowrap">
            All Projects & Submissions [{{ editorStore.projects.length }}]
          </p>
          <button 
            @click="editorStore.loadProjects()"
            class="border-[0.5px] border-black border-solid flex items-center justify-center px-[24px] py-[8px] rounded-[8px] bg-transparent hover:bg-black hover:text-white transition-all duration-150 cursor-pointer shrink-0 apple-press" 
          >
            <p class="font-normal text-[18px] leading-[24px] m-0 whitespace-nowrap">
              Refresh Submissions
            </p>
          </button>
        </div>

        <!-- Projects List Table Container -->
        <div class="border-[#aaa] border-[0.5px] border-solid rounded-[8px] flex flex-col items-start w-full shrink-0 overflow-hidden divide-y divide-[#aaa]">
          <div 
            v-for="project in editorStore.projects" 
            :key="project.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-[20px] md:px-[43px] py-[16px] w-full shrink-0 gap-4 hover:bg-black/[0.015] transition-colors"
          >
            <!-- Project Title & Path -->
            <div class="flex flex-col gap-[2px] shrink-0 min-w-[280px]">
              <div class="flex items-center gap-2">
                <span class="font-medium text-[14px] leading-[20px] text-black">{{ project.title }}</span>
                <span 
                  class="px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase"
                  :class="[
                    project.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    project.status === 'pending_review' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-100 text-neutral-600'
                  ]"
                >
                  {{ project.status === 'approved' ? 'Approved / Live' : project.status === 'pending_review' ? 'Pending Review' : 'Draft' }}
                </span>
              </div>
              <p class="font-normal text-[12px] leading-[16px] text-neutral-500 m-0 font-mono">
                events.707.co.id/{{ project.brand_slug || 'atmos' }}/{{ project.slug || 'drop' }}
              </p>
            </div>

            <!-- Page & Widget Stats -->
            <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0 shrink-0">
              {{ project.pages?.length || 1 }} Pages · {{ project.widget_tree?.length || 0 }} Widgets
            </p>

            <!-- Relative Time -->
            <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0 shrink-0">
              {{ editorStore.formatRelativeTime(project.updated_at) }}
            </p>

            <!-- Review Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <button 
                @click="handlePreviewProject(project.id)"
                class="px-3 py-1 rounded-[6px] border border-black text-[12px] font-medium hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                Inspect Canvas
              </button>

              <button 
                v-if="project.status === 'pending_review' || project.status === 'draft'"
                @click="handleApproveProject(project.id)"
                class="px-3 py-1 rounded-[6px] bg-black text-white text-[12px] font-medium hover:bg-neutral-800 transition-colors cursor-pointer shadow-xs"
              >
                Approve Drop
              </button>

              <button 
                v-if="project.status === 'pending_review'"
                @click="handleRejectProject(project.id)"
                class="px-3 py-1 rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[12px] font-medium transition-colors cursor-pointer"
              >
                Revisions
              </button>
            </div>
          </div>

          <div v-if="!editorStore.projects.length" class="p-8 text-center text-neutral-400 text-[14px] w-full">
            No projects in queue.
          </div>
        </div>
      </div>

      <!-- 6. TAB 4 CONTENT: Templates Build -->
      <div v-if="activeTab === 'templates'" class="flex flex-col gap-[24px] items-start px-[24px] md:px-[48px] w-full shrink-0">
        <!-- Templates Header -->
        <div class="flex items-center justify-between w-full shrink-0">
          <p class="font-normal text-[18px] leading-[24px] text-black m-0 whitespace-nowrap">
            Global Templates Directory [{{ brandStore.templates.length }}]
          </p>
          <button 
            @click="editorStore.showToast('Template builder module initialized.')"
            class="border-[0.5px] border-black border-solid flex items-center justify-center px-[24px] py-[8px] rounded-[8px] bg-transparent hover:bg-black hover:text-white transition-all duration-150 cursor-pointer shrink-0 apple-press" 
          >
            <p class="font-normal text-[18px] leading-[24px] m-0 whitespace-nowrap">
              Create Template
            </p>
          </button>
        </div>

        <!-- Templates List Table Container -->
        <div class="border-[#aaa] border-[0.5px] border-solid rounded-[8px] flex flex-col items-start w-full shrink-0 overflow-hidden divide-y divide-[#aaa]">
          <div 
            v-for="tpl in brandStore.templates" 
            :key="tpl.id"
            class="flex flex-col md:flex-row md:items-center justify-between px-[20px] md:px-[43px] py-[16px] w-full shrink-0 gap-4 hover:bg-black/[0.015] transition-colors"
          >
            <div class="flex flex-col gap-[2px] shrink-0 min-w-[280px]">
              <span class="font-medium text-[14px] leading-[20px] text-black">{{ tpl.name }}</span>
              <p class="font-normal text-[12px] leading-[16px] text-neutral-500 m-0">
                {{ tpl.description }}
              </p>
            </div>

            <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0 shrink-0 capitalize">
              {{ tpl.category }} Category
            </p>

            <p class="font-normal text-[14px] leading-[20px] text-black whitespace-nowrap m-0 shrink-0">
              {{ tpl.widget_tree.length }} Presets
            </p>

            <button 
              @click="handleUseTemplate(tpl)"
              class="font-bold text-[14px] leading-[20px] text-black whitespace-nowrap cursor-pointer hover:underline border-0 outline-none bg-transparent p-0 text-left shrink-0"
            >
              Use Preset
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal 1: Add Brand Profile Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAddBrandModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddBrandModal = false"
      >
        <div class="bg-white rounded-[12px] border border-black/20 p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-['Helvetica_Neue',sans-serif]">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-[18px] text-black">Create Brand Profile</h3>
            <button @click="showAddBrandModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleAddBrandSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">Brand Name</label>
              <input 
                v-model="newBrandName" 
                type="text" 
                required 
                placeholder="e.g. Salomon Sportstyle" 
                class="w-full h-[40px] px-3.5 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
                @input="handleBrandNameInput"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">Brand URL Slug</label>
              <div class="flex items-center w-full h-[40px] rounded-[8px] bg-neutral-50 border border-black/20 px-3">
                <span class="text-neutral-400 text-[12px] font-mono">events.707.co.id/</span>
                <input 
                  v-model="newBrandSlug" 
                  type="text" 
                  required 
                  class="w-full h-full bg-transparent border-none outline-none text-[13px] text-black font-mono px-1"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">Brand Accent Color</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="newBrandColor" 
                  type="color" 
                  class="size-10 rounded border border-black/20 cursor-pointer p-0"
                />
                <input 
                  v-model="newBrandColor" 
                  type="text" 
                  class="w-full h-[40px] px-3.5 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black font-mono outline-none focus:border-black"
                />
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showAddBrandModal = false" 
                class="px-4 h-[38px] rounded-[8px] border border-black/20 text-neutral-700 font-medium text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white px-5 h-[38px] rounded-[8px] font-medium text-[13px] hover:bg-neutral-800 transition-colors"
              >
                Create Brand Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 2: Assign PIC to Brand Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAssignPicModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAssignPicModal = false"
      >
        <div class="bg-white rounded-[12px] border border-black/20 p-6 w-full max-w-[420px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-['Helvetica_Neue',sans-serif]">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-[18px] text-black">Assign PIC to {{ targetBrandName }}</h3>
            <button @click="showAssignPicModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <p class="text-[13px] text-neutral-600 leading-relaxed">
            Select an authorized team designer to grant editing rights for <strong>{{ targetBrandName }}</strong>.
          </p>

          <form @submit.prevent="handleAssignPicSubmit" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">Select Designer PIC</label>
              <select 
                v-model="selectedPicUserId" 
                class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
              >
                <option v-for="user in authStore.users" :key="user.id" :value="user.id">
                  {{ user.name }} ({{ user.email }})
                </option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showAssignPicModal = false" 
                class="px-4 h-[38px] rounded-[8px] border border-black/20 text-neutral-700 font-medium text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white px-5 h-[38px] rounded-[8px] font-medium text-[13px] hover:bg-neutral-800 transition-colors"
              >
                Assign PIC
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 3: Add Team Member Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAddUserModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddUserModal = false"
      >
        <div class="bg-white rounded-[12px] border border-black/20 p-6 w-full max-w-[460px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-['Helvetica_Neue',sans-serif]">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-[18px] text-black">Create Team Member Account</h3>
            <button @click="showAddUserModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <form @submit.prevent="handleAddUserSubmit" class="flex flex-col gap-3.5">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">Full Name</label>
              <input 
                v-model="newUserName" 
                type="text" 
                required 
                placeholder="e.g. Maya Chen" 
                class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-black uppercase">Email Address</label>
                <input 
                  v-model="newUserEmail" 
                  type="email" 
                  required 
                  placeholder="maya@atmos.co.id" 
                  class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-black uppercase">Phone Number</label>
                <input 
                  v-model="newUserPhone" 
                  type="tel" 
                  placeholder="+62 812..." 
                  class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
                />
              </div>
            </div>

            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">Account Password</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="newUserPassword" 
                  type="text" 
                  required 
                  placeholder="Set initial password" 
                  class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[13px] text-black font-mono outline-none focus:border-black"
                />
                <button 
                  type="button" 
                  @click="newUserPassword = '707_' + Math.random().toString(36).substring(2, 9)"
                  class="px-3 h-[40px] rounded-[8px] border border-black/20 text-[12px] font-medium hover:bg-neutral-100 whitespace-nowrap cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-black uppercase">Access Role</label>
                <select 
                  v-model="newUserRole" 
                  class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
                >
                  <option value="editor">Brand Designer / Editor</option>
                  <option value="viewer">Viewer / Reviewer</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-[12px] font-semibold text-black uppercase">Primary Assigned Brand</label>
                <select 
                  v-model="newUserBrand" 
                  class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[14px] text-black outline-none focus:border-black"
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
                class="px-4 h-[38px] rounded-[8px] border border-black/20 text-neutral-700 font-medium text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white px-5 h-[38px] rounded-[8px] font-medium text-[13px] hover:bg-neutral-800 transition-colors"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Modal 4: Reset Password Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showPasswordModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showPasswordModal = false"
      >
        <div class="bg-white rounded-[12px] border border-black/20 p-6 w-full max-w-[400px] shadow-2xl flex flex-col gap-4 animate-apple-pop font-['Helvetica_Neue',sans-serif]">
          <div class="flex items-center justify-between">
            <h3 class="font-medium text-[18px] text-black">Reset Sign-in Password</h3>
            <button @click="showPasswordModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <p class="text-[13px] text-neutral-600 leading-relaxed">
            Reset password for <strong>{{ targetUserForPassword?.name }}</strong>.
          </p>

          <form @submit.prevent="handlePasswordUpdateSubmit" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="text-[12px] font-semibold text-black uppercase">New Password</label>
              <div class="flex items-center gap-2">
                <input 
                  v-model="updatedPasswordValue" 
                  type="text" 
                  required 
                  placeholder="Enter new password" 
                  class="w-full h-[40px] px-3 rounded-[8px] bg-neutral-50 border border-black/20 text-[13px] text-black font-mono outline-none focus:border-black"
                />
                <button 
                  type="button" 
                  @click="updatedPasswordValue = '707_' + Math.random().toString(36).substring(2, 8)"
                  class="px-3 h-[40px] rounded-[8px] border border-black/20 text-[12px] font-medium hover:bg-neutral-100 whitespace-nowrap cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showPasswordModal = false" 
                class="px-4 h-[38px] rounded-[8px] border border-black/20 text-neutral-700 font-medium text-[13px]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-black text-white px-5 h-[38px] rounded-[8px] font-medium text-[13px] hover:bg-neutral-800 transition-colors"
              >
                Save New Password
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
  Eye, 
  EyeOff 
} from 'lucide-vue-next';
import { useAuthStore, type UserAccount, type UserRole } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';
import type { GlobalTemplate } from '../types/editor.ts';

const router = useRouter();
const authStore = useAuthStore();
const editorStore = useEditorStore();
const brandStore = useBrandStore();

const logoFailed = ref(false);
const activeTab = ref<'brands' | 'users' | 'projects' | 'templates'>('brands');

// Modals
const showAddBrandModal = ref(false);
const showAssignPicModal = ref(false);
const showAddUserModal = ref(false);
const showPasswordModal = ref(false);

// Forms
const newBrandName = ref('');
const newBrandSlug = ref('');
const newBrandColor = ref('#000000');

const newUserName = ref('');
const newUserEmail = ref('');
const newUserPhone = ref('');
const newUserPassword = ref('atmos_pass_2026');
const newUserRole = ref<UserRole>('editor');
const newUserBrand = ref('atmos');

const targetBrandSlug = ref('');
const targetBrandName = ref('');
const selectedPicUserId = ref('');

const targetUserForPassword = ref<UserAccount | null>(null);
const updatedPasswordValue = ref('');

const visiblePasswords = reactive<Record<string, boolean>>({});

const pendingCount = computed(() => {
  return editorStore.projects.filter(p => p.status === 'pending_review').length;
});

function getBrandPics(brandSlug: string): UserAccount[] {
  return authStore.getBrandPics(brandSlug);
}

function getBrandDropsCount(brandSlug: string): number {
  return editorStore.projects.filter(p => p.brand_slug === brandSlug).length;
}

function getBrandLatestActiveTime(brandSlug: string): string {
  const proj = editorStore.projects.find(p => p.brand_slug === brandSlug);
  return proj ? editorStore.formatRelativeTime(proj.updated_at) : '2 days ago';
}

function togglePasswordVisibility(userId: string) {
  visiblePasswords[userId] = !visiblePasswords[userId];
}

function handleBrandNameInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  newBrandSlug.value = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function handleAddBrandSubmit() {
  if (!newBrandName.value.trim()) return;

  brandStore.brands.unshift({
    id: `brand_${Date.now()}`,
    name: newBrandName.value.trim(),
    slug: newBrandSlug.value.trim() || 'brand',
    description: `Official ${newBrandName.value.trim()} drops.`,
    primary_color: newBrandColor.value || '#000000'
  });

  newBrandName.value = '';
  newBrandSlug.value = '';
  showAddBrandModal.value = false;
  editorStore.showToast('New brand profile created.');
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

function openEditBrandModal(brand: any) {
  editorStore.showToast(`Editing ${brand.name} configuration.`);
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

function handlePreviewProject(projectId: string) {
  editorStore.openProjectById(projectId);
  router.push('/editor');
}

function handleApproveProject(projectId: string) {
  editorStore.updateProjectStatus(projectId, 'approved');
  editorStore.showToast('Project approved and authorized for live distribution.');
}

function handleRejectProject(projectId: string) {
  editorStore.updateProjectStatus(projectId, 'draft');
  editorStore.showToast('Revision request sent to designer.');
}

function handleUseTemplate(tpl: GlobalTemplate) {
  editorStore.createNewProject(tpl.name, tpl.slug, tpl.widget_tree);
  router.push('/editor');
}

function handleExitAdmin() {
  authStore.exitSuperAdmin();
  router.push('/');
}
</script>
