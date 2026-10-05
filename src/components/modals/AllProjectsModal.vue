<template>
  <Transition name="apple-modal-fade">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4 md:p-8 select-none"
      @click.self="emit('close')"
    >
      <!-- Modal Box (Apple Glass UI Hub) -->
      <div 
        class="backdrop-blur-2xl bg-white/70 border border-white/60 flex flex-col items-start rounded-[20px] shadow-[0px_24px_60px_0px_rgba(0,0,0,0.16),0_1px_3px_rgba(0,0,0,0.05)] w-full max-w-[1020px] max-h-[88vh] overflow-hidden apple-modal-box font-707"
        data-name="All Projects Hub Modal"
      >
        <!-- Modal Top Header -->
        <div class="flex items-center justify-between px-6 py-5 w-full border-b border-black/5 shrink-0 bg-white/40">
          <div class="flex items-center gap-3">
            <div class="size-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <FolderKanban class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-707 text-[19px] font-medium leading-[24px] text-black">
                  All Projects
                </h2>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-black/5 text-black border border-black/5">
                  {{ filteredProjects.length }} Project{{ filteredProjects.length === 1 ? '' : 's' }}
                </span>
              </div>
              <p class="font-707 text-[12px] text-neutral-500 mt-0.5">
                {{ authStore.isSuperAdmin ? 'Master ecosystem drops & brand campaigns' : `Managed projects for ${activeBrandName}` }}
              </p>
            </div>
          </div>

          <!-- Right Actions: Create New & Close -->
          <div class="flex items-center gap-3">
            <button 
              @click="handleCreateNew"
              class="apple-glass-btn-dark bg-black text-white px-3.5 h-[34px] rounded-[8px] font-707 text-[12px] font-medium flex items-center gap-1.5 apple-press cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>

            <button 
              type="button"
              @click="emit('close')"
              class="size-[32px] bg-black/5 hover:bg-black/10 active:bg-black/15 rounded-full flex items-center justify-center apple-press cursor-pointer transition-colors shrink-0 border-0 outline-none"
              title="Close"
            >
              <X class="w-4 h-4 text-black" />
            </button>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 w-full border-b border-black/5 shrink-0 bg-white/25">
          <!-- Left: Search input -->
          <div class="relative flex-1 max-w-[320px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input 
              v-model="searchQuery"
              type="text"
              placeholder="Search projects by name or slug..."
              class="w-full h-[34px] pl-9 pr-3 rounded-[8px] bg-white/60 border border-black/10 text-[12px] font-707 text-black placeholder:text-neutral-400 outline-none focus:border-black focus:bg-white transition-all"
            />
          </div>

          <!-- Middle & Right: Status Filter Pills + View Mode Toggle -->
          <div class="flex items-center gap-3 justify-between sm:justify-end flex-wrap">
            <!-- Status Tabs -->
            <div class="flex items-center gap-1 p-0.5 rounded-[8px] bg-black/5 text-[11px] font-707">
              <button 
                @click="statusFilter = 'all'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'all' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-transparent text-neutral-500 hover:text-black'
                ]"
              >
                All ({{ allCount }})
              </button>
              <button 
                @click="statusFilter = 'approved'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'approved' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-transparent text-neutral-500 hover:text-black'
                ]"
              >
                Live ({{ liveCount }})
              </button>
              <button 
                @click="statusFilter = 'pending_review'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'pending_review' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-transparent text-neutral-500 hover:text-black'
                ]"
              >
                Review ({{ reviewCount }})
              </button>
              <button 
                @click="statusFilter = 'draft'"
                :class="[
                  'px-2.5 py-1 rounded-[6px] transition-all cursor-pointer border-none',
                  statusFilter === 'draft' ? 'bg-white text-black font-semibold shadow-xs' : 'bg-transparent text-neutral-500 hover:text-black'
                ]"
              >
                Drafts ({{ draftCount }})
              </button>
            </div>

            <!-- View Toggle: Grid vs List -->
            <div class="flex items-center gap-1 p-0.5 rounded-[8px] bg-black/5">
              <button 
                @click="viewMode = 'grid'"
                :class="[
                  'p-1.5 rounded-[6px] transition-all cursor-pointer border-none flex items-center justify-center',
                  viewMode === 'grid' ? 'bg-white text-black shadow-xs' : 'bg-transparent text-neutral-400 hover:text-black'
                ]"
                title="Grid Card View"
              >
                <LayoutGrid class="w-3.5 h-3.5" />
              </button>
              <button 
                @click="viewMode = 'list'"
                :class="[
                  'p-1.5 rounded-[6px] transition-all cursor-pointer border-none flex items-center justify-center',
                  viewMode === 'list' ? 'bg-white text-black shadow-xs' : 'bg-transparent text-neutral-400 hover:text-black'
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
              class="group bg-white/60 hover:bg-white/90 border border-black/8 hover:border-black/20 rounded-[14px] p-4 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between cursor-pointer apple-press relative"
              @click="handleOpenProject(project.id)"
            >
              <!-- Card Top: Art Preview Thumbnail or Canvas Preview -->
              <div class="w-full h-[120px] rounded-[10px] bg-neutral-100 border border-black/5 overflow-hidden mb-3.5 relative flex items-center justify-center">
                <!-- Cover Image if HeroDrop image exists -->
                <img 
                  v-if="getProjectCover(project)"
                  :src="getProjectCover(project)" 
                  alt="Cover"
                  class="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <!-- Default Canvas Art Illustration -->
                <div v-else class="flex flex-col items-center justify-center gap-1.5 text-neutral-400">
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
                  <span class="px-2 py-0.5 rounded-[6px] text-[10px] font-mono bg-black/70 text-white backdrop-blur-sm uppercase">
                    {{ project.brand_slug || 'atmos' }}
                  </span>
                </div>
              </div>

              <!-- Card Middle: Project Title & Slug -->
              <div class="flex flex-col gap-1 mb-3">
                <h3 class="font-707 font-medium text-[14px] leading-[18px] text-black truncate group-hover:text-neutral-900" :title="project.title">
                  {{ project.title }}
                </h3>
                <p class="font-707 text-[11px] text-neutral-500 font-mono truncate">
                  /{{ project.brand_slug || 'atmos' }}/{{ project.slug }}
                </p>
              </div>

              <!-- Card Bottom: Metadata & Action Buttons -->
              <div class="flex items-center justify-between pt-2.5 border-t border-black/5 text-[11px] text-neutral-500">
                <span>{{ editorStore.formatRelativeTime(project.updated_at) }}</span>

                <div class="flex items-center gap-1" @click.stop>
                  <button 
                    @click="handleDuplicate(project)"
                    class="p-1.5 rounded-[6px] hover:bg-black/5 text-neutral-600 hover:text-black transition-colors"
                    title="Duplicate Project"
                  >
                    <Copy class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleDelete(project)"
                    class="p-1.5 rounded-[6px] hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                  <button 
                    @click="handleOpenProject(project.id)"
                    class="px-2.5 py-1 rounded-[6px] bg-black text-white text-[11px] font-medium hover:bg-neutral-800 transition-colors ml-1"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mode 2: List Table View -->
          <div v-else class="flex flex-col border border-black/10 rounded-[12px] overflow-hidden bg-white/60 divide-y divide-black/5">
            <div 
              v-for="project in filteredProjects"
              :key="project.id"
              class="flex items-center justify-between px-4 py-3 hover:bg-white/90 transition-colors cursor-pointer group"
              @click="handleOpenProject(project.id)"
            >
              <!-- Info -->
              <div class="flex items-center gap-3 min-w-0 flex-1 mr-4">
                <div class="size-9 rounded-[8px] bg-neutral-100 border border-black/5 shrink-0 overflow-hidden flex items-center justify-center">
                  <img 
                    v-if="getProjectCover(project)"
                    :src="getProjectCover(project)" 
                    alt="Thumbnail"
                    class="size-full object-cover"
                  />
                  <Layers v-else class="w-4 h-4 text-neutral-400" />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="font-707 font-medium text-[13px] text-black truncate">{{ project.title }}</h4>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-black/5 text-neutral-600 uppercase">
                      {{ project.brand_slug || 'atmos' }}
                    </span>
                  </div>
                  <span class="font-707 text-[11px] text-neutral-400 font-mono truncate">
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
              <div class="w-[110px] shrink-0 text-right font-707 text-[11px] text-neutral-500">
                {{ editorStore.formatRelativeTime(project.updated_at) }}
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0 ml-4" @click.stop>
                <button 
                  @click="handleDuplicate(project)"
                  class="p-1.5 rounded-[6px] hover:bg-black/5 text-neutral-500 hover:text-black transition-colors"
                  title="Duplicate"
                >
                  <Copy class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleDelete(project)"
                  class="p-1.5 rounded-[6px] hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click="handleOpenProject(project.id)"
                  class="px-3 py-1 rounded-[6px] bg-black text-white text-[11px] font-medium hover:bg-neutral-800 transition-colors ml-1"
                >
                  Open
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProjects.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="size-12 rounded-full bg-black/5 flex items-center justify-center text-neutral-400 mb-3">
              <FolderKanban class="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 class="font-707 font-medium text-[15px] text-black mb-1">
              No projects found
            </h3>
            <p class="font-707 text-[12px] text-neutral-500 max-w-[320px] mb-4">
              {{ searchQuery ? `No matches for "${searchQuery}". Try changing your query or filter.` : 'No campaigns created yet for this brand directory.' }}
            </p>
            <button 
              @click="handleCreateNew"
              class="apple-glass-btn-dark bg-black text-white px-4 h-[36px] rounded-[8px] font-707 text-[12px] font-medium flex items-center gap-1.5 apple-press cursor-pointer"
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'open-setup-modal'): void;
}>();

const router = useRouter();
const editorStore = useEditorStore();
const authStore = useAuthStore();
const brandStore = useBrandStore();

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
      return 'bg-emerald-500';
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

function handleDuplicate(project: ProjectItem) {
  const newTitle = `${project.title} (Copy)`;
  editorStore.createNewProject(newTitle, undefined, project.widget_tree, project.brand_slug);
  editorStore.showToast(`Duplicated "${project.title}".`);
}

async function handleDelete(project: ProjectItem) {
  if (confirm(`Permanently delete project "${project.title}"?`)) {
    await editorStore.deleteProject(project.id);
    editorStore.showToast(`Deleted "${project.title}".`);
  }
}
</script>
