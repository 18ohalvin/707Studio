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
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEditorStore } from '../stores/editorStore.ts';
import EditorHeader from '../components/editor/EditorHeader.vue';
import EditorCanvas from '../components/editor/EditorCanvas.vue';
import ReviewSubmitModal from '../components/editor/Modals/ReviewSubmitModal.vue';
import TestFormModal from '../components/editor/Modals/TestFormModal.vue';
import RequestWidgetModal from '../components/editor/Modals/RequestWidgetModal.vue';

const route = useRoute();
const router = useRouter();
const editorStore = useEditorStore();

/** /editor/<brand>/<projectId> for the project open in the store, if this account can see it. */
function canonicalPath(): string | null {
  const project = editorStore.userProjects.find(p => p.id === editorStore.currentProjectId);
  if (!project) return null;
  const brand = (project.brand_slug || 'brand').toLowerCase();
  return `/editor/${encodeURIComponent(brand)}/${encodeURIComponent(project.id)}`;
}

/**
 * The URL is the source of truth for which project is open. Before, the editor
 * lived at a bare /editor and showed whatever happened to be in memory: a
 * refresh landed on the demo canvas, and the first edit there silently created
 * a new untitled project.
 */
async function syncProjectFromRoute() {
  const projectId = typeof route.params.projectId === 'string' ? route.params.projectId : '';

  if (!projectId) {
    const path = canonicalPath();
    if (path) {
      router.replace(path);
    } else {
      editorStore.showToast('Open a project from the studio to start editing.');
      router.replace('/');
    }
    return;
  }

  if (editorStore.currentProjectId !== projectId) {
    const isVisible = () => editorStore.userProjects.some(p => p.id === projectId);
    if (!isVisible()) await editorStore.loadProjects();
    if (!isVisible()) {
      editorStore.showToast('That project does not exist or is not shared with this account.');
      router.replace('/');
      return;
    }
    if (editorStore.currentProjectId) await editorStore.flushPendingSave();
    editorStore.openProjectById(projectId);
  }

  const path = canonicalPath();
  if (path && path !== route.path) router.replace(path);
}

watch(() => route.params.projectId, syncProjectFromRoute, { immediate: true });

// Keep the address in step when the project changes from inside the editor
// (new project, duplicate, brand reassigned on save).
watch(
  () => [editorStore.currentProjectId, editorStore.userProjects.find(p => p.id === editorStore.currentProjectId)?.brand_slug],
  () => {
    if (!String(route.name || '').startsWith('Editor')) return;
    const path = canonicalPath();
    if (path && path !== route.path) router.replace(path);
  }
);
</script>
