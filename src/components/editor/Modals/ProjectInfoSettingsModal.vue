<template>
  <Transition name="apple-dock-fade">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 z-50 bg-white/50 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-apple-fade select-none"
      @click.self="emit('close')"
    >
      <div class="backdrop-blur-2xl bg-white/70 rounded-[16px] border border-white/60 p-6 w-full max-w-[440px] shadow-[0px_20px_50px_rgba(0,0,0,0.15),0_1px_3px_rgba(0,0,0,0.06)] flex flex-col gap-4 animate-apple-pop">
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
            <p class="font-707 text-[11px] text-neutral-500">
              Live link: <code class="text-neutral-707 font-mono font-medium">events.707.co.id/{{ brandSlug }}/{{ slug || 'your-slug' }}</code>
            </p>
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
import { Sliders } from 'lucide-vue-next';
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
