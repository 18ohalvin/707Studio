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
import DesktopOnlyGuard from './components/common/DesktopOnlyGuard.vue';
import ProjectLoadingScreen from './components/common/ProjectLoadingScreen.vue';
</script>

