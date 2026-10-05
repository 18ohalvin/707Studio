<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col bg-[#f5f5f5] text-black font-sans relative">
    <!-- Every route here is staff tooling (studio home + editor), so the
         desktop guard stays app-wide. When a public route for published pages
         is added, move this guard onto the staff routes only — guests open
         those pages on phones and must not be blocked. -->
    <DesktopOnlyGuard />
    <ProjectLoadingScreen />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import DesktopOnlyGuard from './components/common/DesktopOnlyGuard.vue';
import ProjectLoadingScreen from './components/common/ProjectLoadingScreen.vue';
import { useAuthStore } from './stores/authStore.ts';
import { useBrandStore } from './stores/brandStore.ts';
import { useEditorStore } from './stores/editorStore.ts';

const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();

onMounted(async () => {
  authStore.initAuth();
  try {
    await Promise.allSettled([
      brandStore.loadBrands(),
      brandStore.loadTemplates(),
      authStore.loadUsers(),
      editorStore.loadProjects()
    ]);
  } catch (e) {
    console.warn('[App] Initial cloud store sync error:', e);
  }
});
</script>

