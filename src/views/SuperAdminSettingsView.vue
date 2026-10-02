<template>
  <div class="min-h-screen w-screen bg-[#f5f5f5] text-black font-sans flex flex-col select-none">
    <!-- Top Header (Consistent 48px Header Height with Studio) -->
    <header class="w-full h-[48px] px-[20px] flex items-center justify-between border-b border-black/10 bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
      <!-- Left: 707 Logo & Superadmin Studio Identifier -->
      <div class="flex items-center gap-[16px]">
        <router-link to="/" class="h-[15px] w-[48px] relative shrink-0 flex items-center cursor-pointer" title="Back to 707 Home">
          <img 
            :src="FIGMA_ASSETS.logo707" 
            alt="707 Logo" 
            class="inset-0 object-contain pointer-events-none size-full"
          />
        </router-link>
        <div class="flex items-center gap-2">
          <span class="font-707 text-[13px] md:text-[14px] text-black tracking-[3px] font-medium uppercase">
            SUPERADMIN DASHBOARD
          </span>
          <span class="px-2 py-0.5 rounded-full bg-black text-white font-707 text-[10px] font-semibold tracking-wider uppercase">
            MASTER
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
          title="Exit Superadmin Mode"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Exit Superadmin</span>
        </button>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 max-w-[1200px] w-full mx-auto px-6 py-8 flex flex-col gap-6">
      <!-- Header Headline & Subtitle -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="font-707 text-[24px] font-semibold text-black tracking-tight">
            Studio System Settings & Governance
          </h1>
          <p class="font-707 text-[13px] text-neutral-500 mt-0.5">
            Manage multi-user access permissions, review design submissions, and configure brand activation rules.
          </p>
        </div>

        <!-- Quick Summary Metrics -->
        <div class="flex items-center gap-3">
          <div class="bg-white border border-black/10 rounded-xl px-4 py-2 flex flex-col items-center shadow-xs">
            <span class="font-707 text-[18px] font-bold text-black">{{ pendingSubmissionsCount }}</span>
            <span class="font-707 text-[10px] font-medium text-amber-600 uppercase tracking-wider">Pending Review</span>
          </div>
          <div class="bg-white border border-black/10 rounded-xl px-4 py-2 flex flex-col items-center shadow-xs">
            <span class="font-707 text-[18px] font-bold text-black">{{ authStore.users.length }}</span>
            <span class="font-707 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Team Members</span>
          </div>
          <div class="bg-white border border-black/10 rounded-xl px-4 py-2 flex flex-col items-center shadow-xs">
            <span class="font-707 text-[18px] font-bold text-black">{{ brandStore.brands.length }}</span>
            <span class="font-707 text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Active Brands</span>
          </div>
        </div>
      </div>

      <!-- Segmented Tab Navigation -->
      <div class="flex items-center gap-2 border-b border-black/10 pb-2">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-2 px-4 py-2 rounded-lg font-707 text-[13px] font-medium transition-all cursor-pointer"
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

      <!-- TAB 1: Submissions & Approvals Review Hub -->
      <div v-if="activeTab === 'submissions'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-707 text-[16px] font-semibold text-black">Activation Drops Submissions</h2>
            <p class="font-707 text-[12px] text-neutral-500">Review design drops submitted by brand creators before they go live.</p>
          </div>
          <button 
            @click="editorStore.loadProjects()" 
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-black/10 bg-white hover:bg-black/5 text-[12px] font-707 cursor-pointer"
          >
            <RefreshCw class="w-3.5 h-3.5 text-neutral-500" />
            <span>Refresh Queue</span>
          </button>
        </div>

        <div class="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-50/80 border-b border-black/10 text-[11px] font-707 font-semibold text-neutral-500 uppercase tracking-wider">
                  <th class="py-3.5 px-4">Project & Brand</th>
                  <th class="py-3.5 px-4">Live URL Slug</th>
                  <th class="py-3.5 px-4">Pages / Widgets</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4">Last Updated</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/5 text-[13px] font-707">
                <tr 
                  v-for="project in editorStore.projects" 
                  :key="project.id"
                  class="hover:bg-black/[0.02] transition-colors"
                >
                  <td class="py-3.5 px-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-black">{{ project.title }}</span>
                      <span class="text-[11px] text-neutral-400 capitalize">{{ project.brand_slug || 'atmos' }} Drop</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <code class="px-2 py-0.5 rounded bg-black/5 text-[11px] text-neutral-700 font-mono">
                      /{{ project.brand_slug || 'atmos' }}/{{ project.slug || 'drop' }}
                    </code>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="text-neutral-600">
                      {{ project.pages?.length || 1 }} Pages · {{ project.widget_tree?.length || 0 }} Widgets
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider"
                      :class="getStatusBadgeClass(project.status)"
                    >
                      <span class="size-1.5 rounded-full" :class="getStatusDotClass(project.status)" />
                      {{ formatStatusLabel(project.status) }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-neutral-500 text-[12px]">
                    {{ editorStore.formatRelativeTime(project.updated_at) }}
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button 
                        @click="handlePreviewProject(project.id)"
                        class="px-2.5 py-1 rounded-md border border-black/15 text-[11px] font-medium text-neutral-700 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
                        title="Open in Editor"
                      >
                        Inspect
                      </button>

                      <button 
                        v-if="project.status === 'pending_review' || project.status === 'draft'"
                        @click="handleApproveProject(project.id)"
                        class="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Approve & Publish Drop"
                      >
                        <CheckCircle class="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      <button 
                        v-if="project.status === 'pending_review'"
                        @click="handleRejectProject(project.id)"
                        class="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-medium transition-colors cursor-pointer"
                        title="Request Changes"
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

      <!-- TAB 2: User & Team RBAC Management -->
      <div v-if="activeTab === 'users'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-707 text-[16px] font-semibold text-black">Team Members & Role Access (RBAC)</h2>
            <p class="font-707 text-[12px] text-neutral-500">Manage creator accounts, assigned brand permissions, and security roles.</p>
          </div>
          <button 
            @click="showAddUserModal = true"
            class="apple-glass-btn-dark bg-black text-white px-3.5 py-2 rounded-lg font-707 text-[12px] font-medium flex items-center gap-2 cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <UserPlus class="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        </div>

        <div class="bg-white border border-black/10 rounded-2xl overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-neutral-50/80 border-b border-black/10 text-[11px] font-707 font-semibold text-neutral-500 uppercase tracking-wider">
                  <th class="py-3.5 px-4">Member Name</th>
                  <th class="py-3.5 px-4">Email</th>
                  <th class="py-3.5 px-4">Role</th>
                  <th class="py-3.5 px-4">Assigned Brands</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/5 text-[13px] font-707">
                <tr 
                  v-for="user in authStore.users" 
                  :key="user.id"
                  class="hover:bg-black/[0.02] transition-colors"
                >
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="size-7 rounded-full bg-neutral-200 border border-black/10 flex items-center justify-center font-bold text-[11px]">
                        {{ user.name.charAt(0) }}
                      </div>
                      <span class="font-medium text-black">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 text-neutral-600">
                    {{ user.email }}
                  </td>
                  <td class="py-3.5 px-4">
                    <span 
                      class="px-2 py-0.5 rounded-md text-[11px] font-medium"
                      :class="[
                        user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 font-semibold' :
                        user.role === 'editor' ? 'bg-blue-100 text-blue-800' : 'bg-neutral-100 text-neutral-700'
                      ]"
                    >
                      {{ user.role === 'superadmin' ? 'Superadmin' : user.role === 'editor' ? 'Brand Designer' : 'Viewer' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4">
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
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                      <span class="size-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button 
                      v-if="user.role !== 'superadmin'"
                      @click="authStore.removeUser(user.id)"
                      class="text-neutral-400 hover:text-red-600 text-[11px] font-medium transition-colors cursor-pointer px-2 py-1"
                    >
                      Remove
                    </button>
                    <span v-else class="text-[11px] text-neutral-400 italic">Primary Admin</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: Brand Directory -->
      <div v-if="activeTab === 'brands'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-707 text-[16px] font-semibold text-black">Active Brand Ecosystem</h2>
            <p class="font-707 text-[12px] text-neutral-500">Configure brand subdomains, logo assets, and custom styling rules.</p>
          </div>
          <button 
            @click="showAddBrandModal = true"
            class="apple-glass-btn-dark bg-black text-white px-3.5 py-2 rounded-lg font-707 text-[12px] font-medium flex items-center gap-2 cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add New Brand</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="brand in brandStore.brands" 
            :key="brand.id"
            class="bg-white border border-black/10 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-xs"
          >
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="size-10 rounded-xl bg-black text-white flex items-center justify-center font-bold text-[14px]">
                  {{ brand.name.charAt(0) }}
                </div>
                <div>
                  <h3 class="font-707 font-semibold text-[15px] text-black">{{ brand.name }}</h3>
                  <p class="font-707 text-[11px] text-neutral-400 font-mono">/{{ brand.slug }}</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase">
                Active
              </span>
            </div>

            <div class="border-t border-black/5 pt-3 flex items-center justify-between text-[12px] font-707 text-neutral-600">
              <span>Domain: events.707.co.id/{{ brand.slug }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: System Integrations & Webhooks -->
      <div v-if="activeTab === 'system'" class="flex flex-col gap-4">
        <div>
          <h2 class="font-707 text-[16px] font-semibold text-black">System Integrations & Webhooks</h2>
          <p class="font-707 text-[12px] text-neutral-500">Configure Slack review routing and system security credentials.</p>
        </div>

        <div class="bg-white border border-black/10 rounded-2xl p-6 flex flex-col gap-6 shadow-xs max-w-[700px]">
          <!-- Slack Webhook -->
          <div class="flex flex-col gap-2">
            <label class="font-707 text-[12px] font-semibold text-black uppercase tracking-wider">
              Review Slack Webhook URL
            </label>
            <input 
              v-model="slackWebhookUrl" 
              type="text" 
              class="w-full h-[40px] px-3.5 rounded-lg bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black transition-colors"
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
              class="w-full h-[40px] px-3.5 rounded-lg bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black transition-colors"
            />
          </div>

          <div class="flex justify-end">
            <button 
              @click="handleSaveSystemSettings"
              class="apple-glass-btn-dark bg-black text-white px-5 h-[38px] rounded-lg font-707 text-[13px] font-medium apple-press cursor-pointer hover:bg-neutral-800 transition-all shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Team Member Modal -->
    <Transition name="apple-dock-fade">
      <div 
        v-if="showAddUserModal" 
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
        @click.self="showAddUserModal = false"
      >
        <div class="backdrop-blur-2xl bg-white/95 rounded-[16px] border border-white/60 p-6 w-full max-w-[440px] shadow-xl flex flex-col gap-4 animate-apple-pop">
          <div class="flex items-center justify-between">
            <h3 class="font-707 font-medium text-[16px] text-black">Add New Team Member</h3>
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
                class="w-full h-[38px] px-3 rounded-lg bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Email Address</label>
              <input 
                v-model="newUserEmail" 
                type="email" 
                required 
                placeholder="maya@atmos.co.id" 
                class="w-full h-[38px] px-3 rounded-lg bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Access Role</label>
              <select 
                v-model="newUserRole" 
                class="w-full h-[38px] px-3 rounded-lg bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              >
                <option value="editor">Brand Designer / Editor</option>
                <option value="viewer">Viewer / Reviewer</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label class="font-707 text-[11px] font-semibold text-neutral-700 uppercase">Assigned Brand</label>
              <select 
                v-model="newUserBrand" 
                class="w-full h-[38px] px-3 rounded-lg bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black outline-none focus:border-black"
              >
                <option value="atmos">atmos</option>
                <option value="707-standard">707 Standard</option>
                <option value="all">All Brands (Master)</option>
              </select>
            </div>

            <div class="flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                @click="showAddUserModal = false" 
                class="px-4 h-[36px] rounded-lg border border-black/15 text-neutral-600 font-707 text-[12px] font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-lg font-707 text-[12px] font-medium"
              >
                Create Member
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  ShieldCheck, 
  ArrowLeft, 
  LogOut, 
  Layers, 
  Users, 
  Tag, 
  Sliders, 
  RefreshCw, 
  CheckCircle, 
  UserPlus, 
  Plus 
} from 'lucide-vue-next';
import { useAuthStore, type UserRole } from '../stores/authStore.ts';
import { useEditorStore } from '../stores/editorStore.ts';
import { useBrandStore } from '../stores/brandStore.ts';
import { FIGMA_ASSETS } from '../constants/figmaAssets.ts';

const router = useRouter();
const authStore = useAuthStore();
const editorStore = useEditorStore();
const brandStore = useBrandStore();

const activeTab = ref<'submissions' | 'users' | 'brands' | 'system'>('submissions');
const showAddUserModal = ref(false);
const showAddBrandModal = ref(false);

const newUserName = ref('');
const newUserEmail = ref('');
const newUserRole = ref<UserRole>('editor');
const newUserBrand = ref('atmos');

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
  { id: 'users' as const, label: 'Team & RBAC', icon: Users },
  { id: 'brands' as const, label: 'Brand Ecosystem', icon: Tag },
  { id: 'system' as const, label: 'Webhooks & Integrations', icon: Sliders },
]);

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
    role: newUserRole.value,
    assignedBrands: [newUserBrand.value],
    status: 'active'
  });

  newUserName.value = '';
  newUserEmail.value = '';
  showAddUserModal.value = false;
  editorStore.showToast('New team member added successfully.');
}

function handleSaveSystemSettings() {
  editorStore.showToast('System configuration saved.');
}

function handleExitAdmin() {
  authStore.exitSuperAdmin();
  router.push('/');
}
</script>
