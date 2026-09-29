<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col bg-[#f5f5f5] text-black font-sans relative">
    <DesktopOnlyGuard />
    <ProjectLoadingScreen />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import DesktopOnlyGuard from './components/common/DesktopOnlyGuard.vue';
import ProjectLoadingScreen from './components/common/ProjectLoadingScreen.vue';
</script>

