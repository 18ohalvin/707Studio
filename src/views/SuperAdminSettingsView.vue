<template>
  <div class="min-h-screen w-screen bg-[#f5f5f5] text-black font-sans flex flex-col select-none">
    <!-- Top Header (Consistent 48px Header Height with 707 Design Studio) -->
    <header class="w-full h-[48px] px-[20px] flex items-center justify-between border-b border-black/10 bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
      <!-- Left: 707 Logo & Superadmin Studio Identifier -->
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
          <span class="px-2 py-0.5 rounded-[6px] bg-black text-white font-707 text-[10px] font-semibold tracking-wider uppercase">
            MASTER ACCESS
          </span>
        </div>
      </div>

      <!-- Right: User Avatar & Back to Studio -->
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
          class="flex items-center gap-1.5 px-3 h-[30px] rounded-[6px] bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[12px] font-707 font-medium cursor-pointer transition-colors"
          title="Sign Out Superadmin Mode"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Exit Admin</span>
        </button>
      </div>
    </header>

    <!-- Main Workspace Container -->
    <main class="flex-1 max-w-[1240px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
      <!-- Header Headline & Subtitle -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="font-707 text-[26px] font-normal text-black tracking-[-0.5px]">
            System Governance & Directory
          </h1>
          <p class="font-707 text-[13px] text-neutral-500 mt-0.5">
            Review design drops, manage brand PICs, team account passwords, and system-wide configurations.
          </p>
        </div>

        <!-- Quick Summary Metric Pills (707 Apple-Glass Style) -->
        <div class="flex items-center gap-3">
          <div class="bg-white border border-black/10 rounded-[10px] px-4 py-2 flex flex-col items-center shadow-xs">
            <span class="font-707 text-[17px] font-semibold text-black">{{ pendingSubmissionsCount }}</span>
            <span class="font-707 text-[10px] font-medium text-amber-600 uppercase tracking-wider">Pending Review</span>
          </div>
          <div class="bg-white border border-black/10 rounded-[10px] px-4 py-2 flex flex-col items-center shadow-xs">
            <span class="font-707 text-[17px] font-semibold text-black">{{ brandStore.brands.length }}</span>
            <span class="font-707 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Brands & PICs</span>
          </div>
          <div class="bg-white border border-black/10 rounded-[10px] px-4 py-2 flex flex-col items-center shadow-xs">
            <span class="font-707 text-[17px] font-semibold text-black">{{ authStore.users.length }}</span>
            <span class="font-707 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Team Accounts</span>
          </div>
        </div>
      </div>

      <!-- Segmented Tab Navigation -->
      <div class="flex items-center gap-2 border-b border-black/10 pb-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-[8px] font-707 text-[13px] font-medium transition-all cursor-pointer"
          :class="[
            activeTab === tab.id 
              ? 'bg-black text-white shadow-sm' 
              : 'text-neutral-600 hover:text-black hover:bg-black/5'
          ]"
        >
          <component :is="tab.icon" class="w-4 h-4" />
          <span>{{ tab.label }}</span>
          <span 
            v-if="tab.badge" 
            class="px-1.5 py-0.2 rounded-full text-[10px] font-bold ml-1"
            :class="activeTab === tab.id ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-800'"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- TAB 1: Submissions & Approvals Hub -->
      <div v-if="activeTab === 'submissions'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-707 text-[16px] font-semibold text-black">Activation Submissions Queue</h2>
            <p class="font-707 text-[12px] text-neutral-500">Review creative submissions from brand designers. Approving unlocks live distribution.</p>
          </div>
          <button 
            @click="editorStore.loadProjects()" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-black/10 bg-white hover:bg-black/5 text-[12px] font-707 cursor-pointer transition-colors"
          >
            <RefreshCw class="w-3.5 h-3.5 text-neutral-500" />
            <span>Refresh Submissions</span>
          </button>
        </div>

        <div class="bg-white border border-black/10 rounded-[12px] overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-50 border-b border-black/10 text-[11px] font-707 font-semibold text-neutral-500 uppercase tracking-wider">
                  <th class="py-3 px-4">Project & Brand</th>
                  <th class="py-3 px-4">Live Domain Path</th>
                  <th class="py-3 px-4">Layout Info</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Last Updated</th>
                  <th class="py-3 px-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/5 text-[13px] font-707">
                <tr 
                  v-for="project in editorStore.projects" 
                  :key="project.id"
                  class="hover:bg-black/[0.02] transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-black">{{ project.title }}</span>
                      <span class="text-[11px] text-neutral-400 capitalize">{{ project.brand_slug || 'atmos' }} Drop</span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <code class="px-2 py-0.5 rounded-[4px] bg-black/5 text-[11px] text-neutral-700 font-mono">
                      /{{ project.brand_slug || 'atmos' }}/{{ project.slug || 'drop' }}
                    </code>
                  </td>
                  <td class="py-3 px-4">
                    <span class="text-neutral-600">
                      {{ project.pages?.length || 1 }} Pages · {{ project.widget_tree?.length || 0 }} Widgets
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                      :class="getStatusBadgeClass(project.status)"
                    >
                      <span class="size-1.5 rounded-full" :class="getStatusDotClass(project.status)" />
                      {{ formatStatusLabel(project.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-neutral-500 text-[12px]">
                    {{ editorStore.formatRelativeTime(project.updated_at) }}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        @click="handlePreviewProject(project.id)"
                        class="px-2.5 py-1 rounded-[6px] border border-black/15 text-[11px] font-medium text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                        title="Open in Canvas Editor"
                      >
                        Inspect
                      </button>

                      <button 
                        v-if="project.status === 'pending_review' || project.status === 'draft'"
                        @click="handleApproveProject(project.id)"
                        class="px-3 py-1 rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Approve & Authorize Live Drop"
                      >
                        <CheckCircle class="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      <button 
                        v-if="project.status === 'pending_review'"
                        @click="handleRejectProject(project.id)"
                        class="px-2.5 py-1 rounded-[6px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Request Changes from Designer"
                      >
                        Revisions
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!editorStore.projects.length">
                  <td colspan="6" class="py-8 text-center text-neutral-400 font-707 text-[13px]">
                    No project submissions found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: Brand Ecosystem & Assigned PICs (MERGED) -->
      <div v-if="activeTab === 'brands'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-707 text-[16px] font-semibold text-black">Brand Ecosystem & PIC Governance</h2>
            <p class="font-707 text-[12px] text-neutral-500">Manage brand identities and assign authorized Persons In Charge (PICs) with login credentials.</p>
          </div>
          <button 
            @click="showAddBrandModal = true"
            class="apple-glass-btn-dark bg-black text-white px-3.5 py-2 rounded-[8px] font-707 text-[12px] font-medium flex items-center gap-2 cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Brand Profile</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="brand in brandStore.brands" 
            :key="brand.id"
            class="bg-white border border-black/10 rounded-[12px] p-5 flex flex-col justify-between gap-4 shadow-xs hover:border-black/25 transition-all"
          >
            <!-- Brand Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div 
                  class="size-10 rounded-[8px] text-white flex items-center justify-center font-bold text-[14px] shadow-xs"
                  :style="{ backgroundColor: brand.primary_color || '#000000' }"
                >
                  {{ brand.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-707 font-semibold text-[15px] text-black">{{ brand.name }}</h3>
                  <p class="font-707 text-[11px] text-neutral-400 font-mono">events.707.co.id/{{ brand.slug }}</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase">
                Active
              </span>
            </div>

            <!-- Description -->
            <p class="font-707 text-[12px] text-neutral-600 line-clamp-2">
              {{ brand.description || 'Official 707 activation brand profile.' }}
            </p>

            <!-- Assigned Brand PICs Section -->
            <div class="bg-black/[0.02] border border-black/5 rounded-[8px] p-3 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="font-707 text-[11px] font-semibold text-neutral-700 uppercase tracking-wider">
                  Assigned PICs ({{ getBrandPics(brand.slug).length }})
                </span>
                <button 
                  @click="openAssignPicModal(brand.slug, brand.name)"
                  class="text-neutral-500 hover:text-black text-[11px] font-707 font-medium cursor-pointer hover:underline"
                >
                  + Assign PIC
                </button>
              </div>

              <!-- PICs List -->
              <div v-if="getBrandPics(brand.slug).length" class="flex flex-col gap-1.5">
                <div 
                  v-for="pic in getBrandPics(brand.slug)" 
                  :key="pic.id"
                  class="flex items-center justify-between bg-white px-2 py-1 rounded-[6px] border border-black/5 text-[12px]"
                >
                  <div class="flex items-center gap-2">
                    <div class="size-5 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold">
                      {{ pic.name.charAt(0) }}
                    </div>
                    <div class="flex flex-col">
                      <span class="font-medium text-black truncate max-w-[130px]">{{ pic.name }}</span>
                      <span class="text-[10px] text-neutral-400 font-mono">{{ pic.email }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <button 
                      v-if="pic.role !== 'superadmin'"
                      @click="openPasswordModal(pic)"
                      class="text-[10px] font-medium text-neutral-500 hover:text-black p-1 hover:bg-black/5 rounded"
                      title="Manage Sign-in Password"
                    >
                      <Key class="w-3 h-3" />
                    </button>
                    <button 
                      v-if="pic.role !== 'superadmin'"
                      @click="authStore.unassignBrandPic(brand.slug, pic.id)"
                      class="text-[10px] text-neutral-400 hover:text-red-500 p-1"
                      title="Unassign PIC"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-[11px] text-neutral-400 italic py-1">
                No specific PIC assigned. Click "+ Assign PIC" to link a designer.
              </div>
            </div>

            <!-- Footer Meta -->
            <div class="border-t border-black/5 pt-2 flex items-center justify-between text-[11px] font-707 text-neutral-500">
              <span>{{ getBrandDropsCount(brand.slug) }} Active Drops</span>
              <button 
                @click="editorStore.showToast(`Brand ${brand.name} configuration updated.`)"
                class="hover:text-black font-medium cursor-pointer"
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: Team Accounts & Password Management -->
      <div v-if="activeTab === 'users'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-707 text-[16px] font-semibold text-black">Team Members & Account Passwords</h2>
            <p class="font-707 text-[12px] text-neutral-500">Manage creator accounts, view/reset login passwords, and grant brand permissions.</p>
          </div>
          <button 
            @click="showAddUserModal = true"
            class="apple-glass-btn-dark bg-black text-white px-3.5 py-2 rounded-[8px] font-707 text-[12px] font-medium flex items-center gap-2 cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        </div>

        <div class="bg-white border border-black/10 rounded-[12px] overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-50 border-b border-black/10 text-[11px] font-707 font-semibold text-neutral-500 uppercase tracking-wider">
                  <th class="py-3 px-4">Member Name</th>
                  <th class="py-3 px-4">Email / Phone</th>
                  <th class="py-3 px-4">Sign-in Password</th>
                  <th class="py-3 px-4">Role</th>
                  <th class="py-3 px-4">Assigned Brands</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/5 text-[13px] font-707">
                <tr 
                  v-for="user in authStore.users" 
                  :key="user.id"
                  class="hover:bg-black/[0.02] transition-colors"
                >
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="size-7 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px]">
                        {{ user.name.charAt(0) }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-medium text-black">{{ user.name }}</span>
                        <span v-if="user.role === 'superadmin'" class="text-[10px] text-purple-600 font-semibold">Master Admin</span>
                      </div>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-neutral-600">
                    <div class="flex flex-col">
                      <span>{{ user.email }}</span>
                      <span class="text-[11px] text-neutral-400">{{ user.phone || '-' }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-2">
                      <code class="px-2 py-0.5 rounded bg-black/5 text-[12px] font-mono text-neutral-700">
                        {{ visiblePasswords[user.id] ? user.password : '••••••••••••' }}
                      </code>
                      <button 
                        @click="togglePasswordVisibility(user.id)"
                        class="text-neutral-400 hover:text-black p-1 transition-colors cursor-pointer"
                        :title="visiblePasswords[user.id] ? 'Hide Password' : 'Show Password'"
                      >
                        <Eye v-if="!visiblePasswords[user.id]" class="w-3.5 h-3.5" />
                        <EyeOff v-else class="w-3.5 h-3.5" />
                      </button>
                      <button 
                        @click="openPasswordModal(user)"
                        class="text-[11px] text-blue-600 hover:underline cursor-pointer ml-1"
                        title="Change / Reset Password"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-2 py-0.5 rounded-[4px] text-[11px] font-medium"
                      :class="[
                        user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 font-semibold' :
                        user.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-700'
                      ]"
                    >
                      {{ user.role === 'superadmin' ? 'Superadmin' : user.role === 'editor' ? 'Brand Designer' : 'Viewer' }}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-1 flex-wrap">
                      <span 
                        v-for="b in user.assignedBrands" 
                        :key="b"
                        class="px-2 py-0.5 rounded bg-black/5 text-[11px] text-neutral-700 capitalize"
                      >
                        {{ b }}
                      </span>
                    </div>
                  </td>
                  <td class="py-3 px-4 text-right">
                    <button 
                      v-if="user.role !== 'superadmin'"
                      @click="authStore.removeUser(user.id)"
                      class="text-neutral-400 hover:text-red-600 text-[11px] font-medium transition-colors cursor-pointer px-2 py-1"
                    >
                      Remove
                    </button>
                    <span v-else class="text-[11px] text-neutral-400 italic">Primary Account</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 4: System Integrations & Webhooks -->
      <div v-if="activeTab === 'system'" class="flex flex-col gap-4">
        <div>
          <h2 class="font-707 text-[16px] font-semibold text-black">System Integrations & Webhooks</h2>
          <p class="font-707 text-[12px] text-neutral-500">Configure Slack review routing and system security credentials.</p>
        </div>

        <div class="bg-white border border-black/10 rounded-[12px] p-6 flex flex-col gap-6 shadow-xs max-w-[700px]">
          <!-- Slack Webhook -->
          <div class="flex flex-col gap-2">
            <label class="font-707 text-[12px] font-semibold text-black uppercase tracking-wider">
              Review Slack Webhook URL
            </label>
            <input 
              v-model="slackWebhookUrl" 
              type="text" 
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black transition-colors"
            />
            <p class="font-707 text-[11px] text-neutral-500">
              When a designer clicks "Submit for Review", notifications with project links are sent here.
            </p>
          </div>

          <!-- Default Review Channel -->
          <div class="flex flex-col gap-2">
            <label class="font-707 text-[12px] font-semibold text-black uppercase tracking-wider">
              Default Slack Channel
            </label>
            <input 
              v-model="slackChannel" 
              type="text" 
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black transition-colors"
            />
          </div>

          <div class="flex justify-end">
            <button 
              @click="handleSaveSystemSettings"
              class="apple-glass-btn-dark bg-black text-white px-5 h-[38px] rounded-[8px] font-707 text-[13px] font-medium apple-press cursor-pointer hover:bg-neutral-800 transition-all shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal 1: Add Team Member Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAddUserModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddUserModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[460px] shadow-xl flex flex-col gap-4 animate-apple-pop">
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

    <!-- Modal 2: Reset Password Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showPasswordModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showPasswordModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[400px] shadow-xl flex flex-col gap-4 animate-apple-pop">
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

    <!-- Modal 3: Assign PIC to Brand Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAssignPicModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAssignPicModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[420px] shadow-xl flex flex-col gap-4 animate-apple-pop">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Assign PIC to {{ targetBrandName }}</h3>
            <button @click="showAssignPicModal = false" class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer">×</button>
          </div>

          <p class="font-707 text-[12px] text-neutral-600">
            Select an authorized team designer to grant editing access to <strong>{{ targetBrandName }}</strong>.
          </p>

          <form @submit.prevent="handleAssignPicSubmit" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Select Team Member</label>
              <select 
                v-model="selectedPicUserId" 
                class="w-full h-[38px] px-3 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
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
                class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[12px] font-medium"
              >
                Assign PIC
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
  Layers, 
  Tag, 
  Users, 
  Sliders, 
  RefreshCw, 
  CheckCircle, 
  UserPlus, 
  Plus, 
  Key, 
  Eye, 
  EyeOff 
} from 'lucide-vue-next';
import { useAuthStore, type UserAccount, type UserRole } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';

const router = useRouter();
const authStore = useAuthStore();
const editorStore = useEditorStore();
const brandStore = useBrandStore();

const activeTab = ref<'submissions' | 'brands' | 'users' | 'system'>('submissions');

// Modal States
const showAddUserModal = ref(false);
const showAddBrandModal = ref(false);
const showPasswordModal = ref(false);
const showAssignPicModal = ref(false);

// Form States
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

const visiblePasswords = reactive<Record<string, boolean>>({});

const slackWebhookUrl = ref('https://hooks.slack.com/services/T0707/B0707/BRANDREVIEWS');
const slackChannel = ref('#brand-design-reviews');

const pendingSubmissionsCount = computed(() => {
  return editorStore.projects.filter(p => p.status === 'pending_review').length;
});

const tabs = computed(() => [
  { 
    id: 'submissions' as const, 
    label: 'Submissions & Approvals', 
    icon: Layers, 
    badge: pendingSubmissionsCount.value > 0 ? String(pendingSubmissionsCount.value) : undefined 
  },
  { id: 'brands' as const, label: 'Brand Ecosystem & PICs', icon: Tag },
  { id: 'users' as const, label: 'Team Accounts & Passwords', icon: Users },
  { id: 'system' as const, label: 'Webhooks & Integrations', icon: Sliders },
]);

function getBrandPics(brandSlug: string): UserAccount[] {
  return authStore.getBrandPics(brandSlug);
}

function getBrandDropsCount(brandSlug: string): number {
  return editorStore.projects.filter(p => p.brand_slug === brandSlug).length;
}

function togglePasswordVisibility(userId: string) {
  visiblePasswords[userId] = !visiblePasswords[userId];
}

function generateRandomPassword() {
  newUserPassword.value = '707_' + Math.random().toString(36).substring(2, 9);
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
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'pending_review':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    default:
      return 'bg-neutral-100 text-neutral-600 border border-neutral-200';
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

function handleSaveSystemSettings() {
  editorStore.showToast('System configuration saved.');
}

function handleExitAdmin() {
  authStore.exitSuperAdmin();
  router.push('/');
}
</script>
