<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 select-none"
      :class="isDark ? 'bg-black/75 backdrop-blur-md' : 'apple-frost-backdrop'"
      @click.self="emit('close')"
    >
      <!-- Modal Box (Apple Glass UI Hub) -->
      <div 
        class="flex flex-col items-start rounded-[20px] w-full max-w-[1020px] max-h-[88vh] overflow-hidden apple-modal-box font-sans font-light tracking-normal transition-all duration-200"
        :class="isDark 
          ? 'bg-[#141414] border border-white/15 text-white shadow-[0px_24px_70px_0px_rgba(0,0,0,0.85)]' 
          : 'apple-frost border border-white/60 text-black shadow-[0px_24px_60px_0px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.05)]'"
        data-name="All Projects Hub Modal"
      >
        <!-- Modal Top Header -->
        <div 
          class="flex items-center justify-between px-6 py-5 w-full shrink-0 border-b transition-colors"
          :class="isDark ? 'border-white/10 bg-white/[0.04]' : 'border-black/5 bg-white/40'"
        >
          <div class="flex items-center gap-3">
            <div 
              class="size-9 rounded-xl flex items-center justify-center shadow-xs"
              :class="isDark ? 'bg-white text-black' : 'bg-black text-white'"
            >
              <FolderKanban class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 
                  class="font-sans font-light tracking-normal text-[19px] font-medium leading-[24px]"
                  :class="isDark ? 'text-white' : 'text-black'"
                >
                  My Activations
                </h2>
                <span 
                  class="px-2 py-0.5 rounded-full text-[11px] font-medium border"
                  :class="isDark ? 'bg-white/10 text-white/90 border-white/15' : 'bg-black/5 text-black border-black/5'"
                >
                  {{ filteredProjects.length }} Project{{ filteredProjects.length === 1 ? '' : 's' }}
                </span>
              </div>
              <p 
                class="font-sans font-light tracking-normal text-[12px] mt-0.5"
                :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
              >
                {{ authStore.isSuperAdmin ? 'Master ecosystem drops & brand campaigns' : `Managed projects for ${activeBrandName}` }}
              </p>
            </div>
          </div>

          <!-- Right Actions: Create New & Close -->
          <div class="flex items-center gap-3">
            <button 
              @click="handleCreateNew"
              class="px-3.5 h-[34px] rounded-[8px] font-sans font-light tracking-normal text-[12px] font-medium flex items-center gap-1.5 apple-press cursor-pointer transition-colors shadow-xs"
              :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'apple-glass-btn-dark bg-black text-white hover:bg-neutral-800'"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>

            <button 
              type="button"
              @click="emit('close')"
              class="size-[32px] rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
              :class="isDark ? 'bg-white/10 hover:bg-white/20 active:bg-white/30 text-white' : 'bg-black/5 hover:bg-black/10 active:bg-black/15 text-black'"
              title="Close"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div 
          class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 w-full shrink-0 border-b transition-colors"
          :class="isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/5 bg-white/25'"
        >
          <!-- Left: Search input -->
          <div class="relative flex-1 max-w-[320px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search projects by name or slug..."
              class="w-full h-[34px] pl-9 pr-3 rounded-[8px] text-[12px] font-sans font-light tracking-normal outline-none transition-all"
              :class="isDark 
                ? 'bg-white/[0.06] border border-white/15 text-white placeholder:text-neutral-500 focus:border-white/40 focus:bg-white/[0.08]' 
                : 'bg-white/60 border border-black/10 text-black placeholder:text-neutral-400 focus:border-black focus:bg-white'"
            />
          </div>

          <!-- Middle & Right: Status Filter Pills + View Mode Toggle -->
          <div class="flex items-center gap-3 justify-between sm:justify-end flex-wrap">
            <!-- Status Tabs -->
            <div 
              class="flex items-center gap-1 p-0.5 rounded-[8px] text-[11px] font-sans font-light tracking-normal border"
              :class="isDark ? 'bg-white/[0.05] border-white/10' : 'bg-black/5 border-transparent'"
            >
              <button 
                @click="statusFilter = 'all'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'all' 
                    ? (isDark ? 'bg-white text-black font-semibold shadow-xs' : 'bg-white text-black font-medium shadow-xs') 
                    : (isDark ? 'bg-transparent text-neutral-400 hover:text-white' : 'bg-transparent text-neutral-500 hover:text-black')
                ]"
              >
                All ({{ allCount }})
              </button>
              <button 
                @click="statusFilter = 'approved'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'approved' 
                    ? (isDark ? 'bg-white text-black font-semibold shadow-xs' : 'bg-white text-black font-medium shadow-xs') 
                    : (isDark ? 'bg-transparent text-neutral-400 hover:text-white' : 'bg-transparent text-neutral-500 hover:text-black')
                ]"
              >
                Live ({{ liveCount }})
              </button>
              <button 
                @click="statusFilter = 'pending_review'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'pending_review' 
                    ? (isDark ? 'bg-white text-black font-semibold shadow-xs' : 'bg-white text-black font-medium shadow-xs') 
                    : (isDark ? 'bg-transparent text-neutral-400 hover:text-white' : 'bg-transparent text-neutral-500 hover:text-black')
                ]"
              >
                Review ({{ reviewCount }})
              </button>
              <button 
                @click="statusFilter = 'draft'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'draft' 
                    ? (isDark ? 'bg-white text-black font-semibold shadow-xs' : 'bg-white text-black font-medium shadow-xs') 
                    : (isDark ? 'bg-transparent text-neutral-400 hover:text-white' : 'bg-transparent text-neutral-500 hover:text-black')
                ]"
              >
                Drafts ({{ draftCount }})
              </button>
            </div>

            <!-- View Toggle: Grid vs List -->
            <div 
              class="flex items-center gap-1 p-0.5 rounded-[8px] border"
              :class="isDark ? 'bg-white/[0.05] border-white/10' : 'bg-black/5 border-transparent'"
            >
              <button 
                @click="viewMode = 'grid'"
                :class="[
                  'p-1.5 rounded-[6px] transition-all cursor-pointer border-none flex items-center justify-center',
                  viewMode === 'grid' 
                    ? (isDark ? 'bg-white text-black shadow-xs' : 'bg-white text-black shadow-xs') 
                    : (isDark ? 'bg-transparent text-neutral-400 hover:text-white' : 'bg-transparent text-neutral-400 hover:text-black')
                ]"
                title="Grid Card View"
              >
                <LayoutGrid class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="viewMode = 'list'"
                :class="[
                  'p-1.5 rounded-[6px] transition-all cursor-pointer border-none flex items-center justify-center',
                  viewMode === 'list' 
                    ? (isDark ? 'bg-white text-black shadow-xs' : 'bg-white text-black shadow-xs') 
                    : (isDark ? 'bg-transparent text-neutral-400 hover:text-white' : 'bg-transparent text-neutral-400 hover:text-black')
                ]"
                title="List Table View"
              >
                <List class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Scrollable Projects Container -->
        <div class="flex-1 w-full overflow-y-auto p-6 luxury-scroll-mask">
          <!-- Mode 1: Grid View Cards -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="project in filteredProjects"
              :key="project.id"
              class="group rounded-[14px] p-4 transition-all duration-200 flex flex-col justify-between cursor-pointer apple-press relative border"
              :class="isDark 
                ? 'bg-[#1c1c1c] hover:bg-[#222222] border-white/10 hover:border-white/25 text-white shadow-none' 
                : 'bg-white/60 hover:bg-white/90 border-black/8 hover:border-black/20 text-black shadow-xs hover:shadow-md'"
              @click="handleOpenProject(project.id)"
            >
              <!-- Card Top: Art Preview Thumbnail or Canvas Preview -->
              <div 
                class="w-full h-[120px] rounded-[10px] overflow-hidden mb-3.5 relative flex items-center justify-center border"
                :class="isDark ? 'bg-[#141414] border-white/10' : 'bg-neutral-100 border-black/5'"
              >
                <!-- Cover Image if HeroDrop image exists -->
                <img 
                  v-if="getProjectCover(project)"
                  :src="sizedUrl(getProjectCover(project), 640)" loading="lazy" decoding="async" 
                  alt="Cover"
                  class="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <!-- Default Canvas Art Illustration -->
                <div v-else class="flex flex-col items-center justify-center gap-1.5" :class="isDark ? 'text-neutral-500' : 'text-neutral-400'">
                  <Layers class="w-7 h-7 stroke-[1.5]" />
                  <span class="text-[11px] font-mono">{{ project.pages?.length || 1 }} Page Canvas</span>
                </div>

                <!-- Status Badge Pill -->
                <div class="absolute top-2 right-2">
                  <span 
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-xs"
                    :class="getStatusBadgeClass(project.status)"
                  >
                    <span class="size-1.5 rounded-full" :class="getStatusDotClass(project.status)" />
                    {{ formatStatusLabel(project.status) }}
                  </span>
                </div>

                <!-- Brand tag pill (Top Left) -->
                <div class="absolute top-2 left-2">
                  <span 
                    class="px-2 py-0.5 rounded-[6px] text-[10px] font-mono uppercase"
                    :class="isDark ? 'bg-black/90 text-white border border-white/10' : 'bg-black/70 text-white backdrop-blur-sm'"
                  >
                    {{ project.brand_slug || 'atmos' }}
                  </span>
                </div>
              </div>

              <!-- Card Middle: Project Title & Slug -->
              <div class="flex flex-col gap-1 mb-3">
                <h3 
                  class="font-sans font-light tracking-normal font-medium text-[14px] leading-[18px] truncate"
                  :class="isDark ? 'text-white' : 'text-black group-hover:text-neutral-900'"
                  :title="project.title"
                >
                  {{ project.title }}
                </h3>
                <p 
                  class="font-sans font-light tracking-normal text-[11px] font-mono truncate"
                  :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
                >
                  /{{ project.brand_slug || 'atmos' }}/{{ project.slug }}
                </p>
              </div>

              <!-- Card Bottom: Metadata & Action Buttons -->
              <div 
                class="flex items-center justify-between pt-2.5 border-t text-[11px]"
                :class="isDark ? 'border-white/10 text-neutral-400' : 'border-black/5 text-neutral-500'"
              >
                <span>{{ editorStore.formatRelativeTime(project.updated_at) }}</span>

                <div class="flex items-center gap-1" @click.stop>
                  <button 
                    v-if="isProjectLive(project)"
                    @click="copy(project.id, liveLinkFor(project))"
                    class="p-1.5 rounded-[6px] transition-colors"
                    :class="isDark ? 'hover:bg-white/10 text-neutral-300 hover:text-white' : 'hover:bg-black/5 text-neutral-600 hover:text-black'"
                    :title="copiedKey === project.id ? 'Copied' : `Copy live link: ${liveLinkFor(project)}`"
                  >
                    <Check v-if="copiedKey === project.id" class="w-3.5 h-3.5 text-moss-400" />
                    <LinkIcon v-else class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleDuplicate(project)"
                    class="p-1.5 rounded-[6px] transition-colors"
                    :class="isDark ? 'hover:bg-white/10 text-neutral-300 hover:text-white' : 'hover:bg-black/5 text-neutral-600 hover:text-black'"
                    title="Duplicate Project"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleDelete(project)"
                    class="p-1.5 rounded-[6px] transition-colors"
                    :class="isDark ? 'hover:bg-red-950/50 text-neutral-400 hover:text-red-400' : 'hover:bg-red-50 text-neutral-400 hover:text-red-600'"
                    title="Delete Project"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleOpenProject(project.id)"
                    class="px-2.5 py-1 rounded-[6px] text-[11px] font-medium transition-colors ml-1"
                    :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mode 2: List Table View -->
          <div 
            v-else 
            class="flex flex-col border rounded-[12px] overflow-hidden divide-y transition-colors"
            :class="isDark 
              ? 'border-white/10 bg-[#1c1c1c] divide-white/10 text-white' 
              : 'border-black/10 bg-white/60 divide-black/5 text-black'"
          >
            <div 
              v-for="project in filteredProjects"
              :key="project.id"
              class="flex items-center justify-between px-4 py-3 transition-colors cursor-pointer group"
              :class="isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white/90'"
              @click="handleOpenProject(project.id)"
            >
              <!-- Info -->
              <div class="flex items-center gap-3 min-w-0 flex-1 mr-4">
                <div 
                  class="size-9 rounded-[8px] border shrink-0 overflow-hidden flex items-center justify-center"
                  :class="isDark ? 'bg-[#141414] border-white/10' : 'bg-neutral-100 border-black/5'"
                >
                  <img 
                    v-if="getProjectCover(project)"
                    :src="sizedUrl(getProjectCover(project), 640)" loading="lazy" decoding="async" 
                    alt="Thumbnail"
                    class="size-full object-cover"
                  />
                  <Layers v-else class="w-4 h-4" :class="isDark ? 'text-neutral-500' : 'text-neutral-400'" />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 
                      class="font-sans font-light tracking-normal font-medium text-[13px] truncate"
                      :class="isDark ? 'text-white' : 'text-black'"
                    >
                      {{ project.title }}
                    </h4>
                    <span 
                      class="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase"
                      :class="isDark ? 'bg-white/10 text-white/90' : 'bg-black/5 text-neutral-600'"
                    >
                      {{ project.brand_slug || 'atmos' }}
                    </span>
                  </div>
                  <span 
                    class="font-sans font-light tracking-normal text-[11px] font-mono truncate"
                    :class="isDark ? 'text-neutral-400' : 'text-neutral-400'"
                  >
                    events.707.co.id/{{ project.brand_slug || 'atmos' }}/{{ project.slug }}
                  </span>
                </div>
              </div>

              <!-- Status -->
              <div class="w-[120px] shrink-0 text-center">
                <span 
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border"
                  :class="getStatusBadgeClass(project.status)"
                >
                  <span class="size-1.5 rounded-full" :class="getStatusDotClass(project.status)" />
                  {{ formatStatusLabel(project.status) }}
                </span>
              </div>

              <!-- Last Edited -->
              <div 
                class="w-[110px] shrink-0 text-right font-sans font-light tracking-normal text-[11px]"
                :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
              >
                {{ editorStore.formatRelativeTime(project.updated_at) }}
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0 ml-4" @click.stop>
                <button 
                  v-if="isProjectLive(project)"
                  @click="copy(project.id, liveLinkFor(project))"
                  class="p-1.5 rounded-[6px] transition-colors"
                  :class="isDark ? 'hover:bg-white/10 text-neutral-300 hover:text-white' : 'hover:bg-black/5 text-neutral-500 hover:text-black'"
                  :title="copiedKey === project.id ? 'Copied' : `Copy live link: ${liveLinkFor(project)}`"
                >
                  <Check v-if="copiedKey === project.id" class="w-3.5 h-3.5 text-moss-400" />
                  <LinkIcon v-else class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleDuplicate(project)"
                  class="p-1.5 rounded-[6px] transition-colors"
                  :class="isDark ? 'hover:bg-white/10 text-neutral-300 hover:text-white' : 'hover:bg-black/5 text-neutral-500 hover:text-black'"
                  title="Duplicate"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleDelete(project)"
                  class="p-1.5 rounded-[6px] transition-colors"
                  :class="isDark ? 'hover:bg-red-950/50 text-neutral-400 hover:text-red-400' : 'hover:bg-red-50 text-neutral-400 hover:text-red-600'"
                  title="Delete"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleOpenProject(project.id)"
                  class="px-3 py-1 rounded-[6px] text-[11px] font-medium transition-colors ml-1"
                  :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'"
                >
                  Open
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProjects.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div 
              class="size-12 rounded-full flex items-center justify-center mb-3"
              :class="isDark ? 'bg-white/10 text-white' : 'bg-black/5 text-neutral-400'"
            >
              <FolderKanban class="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 
              class="font-sans font-light tracking-normal font-medium text-[15px] mb-1"
              :class="isDark ? 'text-white' : 'text-black'"
            >
              No projects found
            </h3>
            <p 
              class="font-sans font-light tracking-normal text-[12px] max-w-[320px] mb-4"
              :class="isDark ? 'text-neutral-400' : 'text-neutral-500'"
            >
              {{ searchQuery ? `No matches for "${searchQuery}". Try changing your query or filter.` : 'No campaigns created yet for this brand directory.' }}
            </p>
            <button 
              @click="handleCreateNew"
              class="px-4 h-[36px] rounded-[8px] font-sans font-light tracking-normal text-[12px] font-medium flex items-center gap-1.5 apple-press cursor-pointer"
              :class="isDark ? 'bg-white text-black hover:bg-neutral-200' : 'apple-glass-btn-dark bg-black text-white'"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Create First Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { isProjectLive, liveLinkFor, useCopiedFlag } from '../../services/campaignLink.ts';
import { Check, Link as LinkIcon } from 'lucide-vue-next';
import { sizedUrl } from '../../services/responsiveImage.ts';
import { glassConfirm } from '../../services/glassDialog.ts';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  X, 
  Plus, 
  Search, 
  FolderKanban, 
  LayoutGrid, 
  List, 
  Layers, 
  Copy, 
  Trash2 
} from 'lucide-vue-next';
import { useEditorStore } from '../../stores/editorStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { useBrandStore } from '../../stores/brandStore.ts';
import type { ProjectItem } from '../../types/editor.ts';

const props = withDefaults(defineProps<{
  isOpen: boolean;
  dark?: boolean;
}>(), {
  dark: undefined,
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-setup-modal'): void;
}>();

const router = useRouter();
const route = useRoute();
const editorStore = useEditorStore();
// Live projects get a one-click copy of their public link.
const { copiedKey, copy } = useCopiedFlag();
const authStore = useAuthStore();
const brandStore = useBrandStore();

const isDark = computed(() => {
  if (typeof props.dark === 'boolean') return props.dark;
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && route.path !== '/');
});

watch(() => props.isOpen, (open) => {
  if (open) {
    editorStore.loadProjects();
  }
});

onMounted(() => {
  if (props.isOpen) {
    editorStore.loadProjects();
  }
});

const searchQuery = ref('');
const statusFilter = ref<'all' | 'approved' | 'pending_review' | 'draft'>('all');
const viewMode = ref<'grid' | 'list'>('grid');

const activeBrandName = computed(() => {
  return brandStore.activeBrand?.name || authStore.currentUser?.assignedBrands?.[0] || 'Brand';
});

const baseProjects = computed<ProjectItem[]>(() => {
  return editorStore.userProjects;
});

const allCount = computed(() => baseProjects.value.length);
const liveCount = computed(() => baseProjects.value.filter(p => p.status === 'approved' || p.status === 'published').length);
const reviewCount = computed(() => baseProjects.value.filter(p => p.status === 'pending_review').length);
const draftCount = computed(() => baseProjects.value.filter(p => p.status === 'draft' || !p.status).length);

const filteredProjects = computed(() => {
  let list = baseProjects.value;

  if (statusFilter.value === 'approved') {
    list = list.filter(p => p.status === 'approved' || p.status === 'published');
  } else if (statusFilter.value === 'pending_review') {
    list = list.filter(p => p.status === 'pending_review');
  } else if (statusFilter.value === 'draft') {
    list = list.filter(p => p.status === 'draft' || !p.status);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) || 
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      (p.brand_slug && p.brand_slug.toLowerCase().includes(q))
    );
  }

  return list;
});

function getProjectCover(project: ProjectItem): string | undefined {
  if (project.widget_tree && project.widget_tree.length > 0) {
    const hero = project.widget_tree.find(w => w.type === 'HeroDrop' && w.props?.imageUrl);
    if (hero && hero.props.imageUrl) {
      return hero.props.imageUrl;
    }
  }
  if (project.pages && project.pages.length > 0) {
    const firstPage = project.pages[0];
    const hero = firstPage.widget_tree?.find(w => w.type === 'HeroDrop' && w.props?.imageUrl);
    if (hero && hero.props.imageUrl) {
      return hero.props.imageUrl;
    }
  }
  return undefined;
}

function getStatusBadgeClass(status?: string): string {
  switch (status) {
    case 'approved':
    case 'published':
      return 'bg-moss-50 text-moss-800 border-moss-300';
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
      return 'bg-moss-500';
    case 'pending_review':
      return 'bg-amber-500 animate-ping';
    default:
      return 'bg-neutral-400';
  }
}

function formatStatusLabel(status?: string): string {
  switch (status) {
    case 'approved':
    case 'published':
      return 'Live';
    case 'pending_review':
      return 'In Review';
    default:
      return 'Draft';
  }
}

function handleOpenProject(projectId: string) {
  emit('close');
  editorStore.openProjectById(projectId);
  router.push('/editor');
}

function handleCreateNew() {
  emit('close');
  emit('open-setup-modal');
}

async function handleDuplicate(project: ProjectItem) {
  const duplicated = await editorStore.duplicateProject(project.id);
  if (duplicated) {
    editorStore.showToast(`Duplicated "${project.title}" with all campaign pages.`);
  }
}

async function handleDelete(project: ProjectItem) {
  if (await glassConfirm({ title: 'Delete project?', message: `"${project.title}" is permanently deleted for everyone.`, confirmLabel: 'Delete', danger: true })) {
    await editorStore.deleteProject(project.id);
    editorStore.showToast(`Deleted "${project.title}".`);
  }
}
</script>
