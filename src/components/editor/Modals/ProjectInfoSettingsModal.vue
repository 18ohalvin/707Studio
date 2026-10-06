<template>
  <Transition name="apple-dock-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 apple-frost-backdrop flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
      @click.self="emit('close')"
    >
      <div class="apple-frost rounded-[16px] border border-white/60 p-6 w-full max-w-[440px] shadow-[0px_20px_50px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-4 animate-apple-pop">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="size-8 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
              <Sliders class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-707 font-medium text-[15px] text-black">Project Settings</h3>
              <p class="font-707 text-[11px] text-neutral-500">Artwork & Publishing Details</p>
            </div>
          </div>
          <button 
            type="button"
            @click="emit('close')" 
            class="text-neutral-400 hover:text-black text-xl font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <form @submit.prevent="handleSave" class="flex flex-col gap-4">
          <!-- 1. Project Title -->
          <div class="flex flex-col gap-1.5">
            <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
              Project Title
            </label>
            <input 
              v-model="title"
              type="text"
              required
              placeholder="e.g. atmos Exclusive RSVP Activation"
              class="w-full h-[40px] px-3.5 rounded-[8px] bg-black/[0.03] border border-black/15 text-[13px] font-707 text-black focus:border-black focus:bg-white outline-none transition-all placeholder:text-neutral-400"
            />
          </div>

          <!-- 2. Project Slug -->
          <div class="flex flex-col gap-1.5">
            <label class="font-707 text-[11px] font-semibold text-neutral-700 tracking-wider uppercase">
              Custom URL Slug
            </label>
            <div class="flex items-center w-full h-[40px] rounded-[8px] bg-black/[0.03] border border-black/15 px-3 focus-within:border-black focus-within:bg-white transition-all">
              <span class="text-neutral-400 font-mono text-[12px] shrink-0">/{{ brandSlug }}/</span>
              <input 
                v-model="slug"
                type="text"
                required
                placeholder="project-slug"
                class="w-full h-full bg-transparent border-none outline-none text-[13px] font-707 text-black font-mono px-1 placeholder:text-neutral-400"
                @input="handleSlugInput"
              />
            </div>
            <!-- The real public link, copyable once the campaign is live -->
            <div class="flex items-center gap-2 w-full rounded-[8px] bg-black/[0.04] border border-black/5 px-3 py-2">
              <div class="flex flex-col min-w-0 flex-1">
                <span class="font-707 text-[10.5px] uppercase tracking-wider" :class="projectIsLive ? 'text-emerald-700' : 'text-neutral-500'">
                  {{ projectIsLive ? 'Live link' : 'Link — works once published' }}
                </span>
                <span class="font-707 text-[12px] text-black truncate font-mono" :title="publicLink">{{ publicLink }}</span>
              </div>
              <button
                type="button"
                :disabled="!projectIsLive"
                @click="copy('settings', publicLink)"
                class="shrink-0 h-[30px] px-3 rounded-[7px] text-[12px] font-707 font-medium flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
                :class="projectIsLive ? 'bg-black text-white hover:bg-neutral-800' : 'bg-black/5 text-neutral-400'"
                :title="projectIsLive ? 'Copy the public link' : 'Only published campaigns have a public link'"
              >
                <Check v-if="copiedKey === 'settings'" class="w-3.5 h-3.5" />
                <LinkIcon v-else class="w-3.5 h-3.5" />
                {{ copiedKey === 'settings' ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-2.5 mt-2">
            <button 
              type="button"
              @click="emit('close')"
              class="px-4 h-[36px] rounded-[8px] border border-black/15 text-neutral-600 hover:text-black font-707 text-[13px] font-medium cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="apple-glass-btn-dark bg-black text-white px-5 h-[36px] rounded-[8px] font-707 text-[13px] font-medium apple-press cursor-pointer hover:bg-neutral-800 transition-all shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Sliders, Check, Link as LinkIcon } from 'lucide-vue-next';
import { isProjectLive, liveLinkFor, absoluteLink, campaignPath, useCopiedFlag } from '../../../services/campaignLink.ts';
import { useEditorStore } from '../../../stores/editorStore.ts';
import { useBrandStore } from '../../../stores/brandStore.ts';
import { useAuthStore } from '../../../stores/authStore.ts';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const editorStore = useEditorStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();

const title = ref('');
const slug = ref('');

const currentProject = computed(() => editorStore.projects.find(p => p.id === editorStore.currentProjectId) || null);
const projectIsLive = computed(() => isProjectLive(currentProject.value));
// Live: the address visitors use today. Not yet live: where it will be.
const publicLink = computed(() =>
  projectIsLive.value && currentProject.value
    ? liveLinkFor(currentProject.value)
    : absoluteLink(campaignPath(currentProject.value?.brand_slug || brandSlug.value, slug.value || 'your-slug'))
);
const { copiedKey, copy } = useCopiedFlag();

const brandSlug = computed(() => {
  const userBrand = authStore.currentUser?.assignedBrands?.[0];
  let raw = '';
  if (!authStore.isSuperAdmin && userBrand && userBrand !== 'all') {
    raw = userBrand;
  } else if (editorStore.currentPage?.brand_slug && editorStore.currentPage.brand_slug !== 'atmos') {
    raw = editorStore.currentPage.brand_slug;
  } else if (brandStore.activeBrand?.slug) {
    raw = brandStore.activeBrand.slug;
  } else if (editorStore.currentPage?.brand_slug) {
    raw = editorStore.currentPage.brand_slug;
  } else {
    raw = userBrand || 'events';
  }
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'events';
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      title.value = editorStore.projectTitle;
      const proj = editorStore.projects.find(p => p.id === editorStore.currentProjectId);
      slug.value = proj?.slug || editorStore.pages[0]?.slug || editorStore.currentPage?.slug || '';
    }
  },
  { immediate: true }
);

function handleSlugInput(e: Event) {
  const target = e.target as HTMLInputElement;
  slug.value = target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
}

function handleSave() {
  if (!title.value.trim()) return;

  const cleanSlug = slug.value.trim() || 'drop';
  editorStore.projectTitle = title.value.trim();

  // Always keep master landing page slug aligned with project slug
  if (editorStore.pages[0]) {
    editorStore.pages[0].slug = cleanSlug;
    if (editorStore.pages[0].page_settings) {
      editorStore.pages[0].page_settings.seoTitle = title.value.trim();
    }
  }

  // Update projects list entry
  const proj = editorStore.projects.find(p => p.id === editorStore.currentProjectId);
  if (proj) {
    proj.title = title.value.trim();
    proj.slug = cleanSlug;
    proj.updated_at = new Date().toISOString();
  }

  editorStore.saveCurrentProject();
  editorStore.showToast('Project title and campaign slug saved.');
  emit('close');
}
</script>
