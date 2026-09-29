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
import { ExternalLink } from 'lucide-vue-next';

const editorStore = useEditorStore();
const brandStore = useBrandStore();

function openLivePreview() {
  const url = `https://events.707.co.id/${brandStore.activeBrand.slug}/${editorStore.currentPage.slug}`;
  window.open(url, '_blank');
}
</script>
