<template>
  <div class="absolute bottom-6 right-6 z-30 flex items-center gap-2 apple-glass-modal rounded-xl p-1.5 shadow-2xl select-none">
    <button 
      @click="openLivePreview" 
      class="apple-glass-btn-dark flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
    >
      <ExternalLink class="w-3.5 h-3.5 text-white" />
      <span>Live Link</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '../../stores/editorStore.ts';
import { useBrandStore } from '../../stores/brandStore.ts';
import { useAuthStore } from '../../stores/authStore.ts';
import { ExternalLink } from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();

function openLivePreview() {
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
  const brandSlug = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'events';
  const currentProj = editorStore.projects.find(p => p.id === editorStore.currentProjectId);
  const campaignSlug = currentProj?.slug || editorStore.pages[0]?.slug || editorStore.currentPage?.slug || '';
  const url = `https://events.707.co.id/${brandSlug}/${campaignSlug}`;
  window.open(url, '_blank');
}
</script>
