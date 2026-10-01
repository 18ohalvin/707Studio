<template>
  <div class="h-screen w-screen overflow-hidden flex flex-col bg-white text-black font-sans relative">
    <!-- Top Navigation Header (Figma Node 63:38) -->
    <EditorHeader />

    <!-- Main Workspace (Editor Canvas) -->
    <div class="h-full w-full flex overflow-hidden relative">
      <EditorCanvas />
    </div>

    <!-- Modals -->
    <ReviewSubmitModal />
    <TestFormModal />
    <RequestWidgetModal />
    <ProjectSettingsModal />
  </div>
</template>

<script setup lang="ts">
import EditorHeader from '../components/editor/EditorHeader.vue';
import EditorCanvas from '../components/editor/EditorCanvas.vue';
import ReviewSubmitModal from '../components/editor/Modals/ReviewSubmitModal.vue';
import TestFormModal from '../components/editor/Modals/TestFormModal.vue';
import RequestWidgetModal from '../components/editor/Modals/RequestWidgetModal.vue';
import ProjectSettingsModal from '../components/editor/Modals/ProjectSettingsModal.vue';
</script>
