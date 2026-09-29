<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col bg-[#f5f5f5] text-black font-sans relative">
    <!-- DesktopOnlyGuard deliberately lives in EditorView, not here: the editor
         needs a desktop screen, but the published landing pages are opened by
         guests on phones and must not be blocked. -->
    <ProjectLoadingScreen />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import ProjectLoadingScreen from './components/common/ProjectLoadingScreen.vue';
</script>

