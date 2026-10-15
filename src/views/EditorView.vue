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
import { useBrandStore } from '../stores/brandStore.ts';
import { useAuthStore } from '../stores/authStore.ts';
import EditorHeader from '../components/editor/EditorHeader.vue';
import EditorCanvas from '../components/editor/EditorCanvas.vue';
import ReviewSubmitModal from '../components/editor/Modals/ReviewSubmitModal.vue';
import TestFormModal from '../components/editor/Modals/TestFormModal.vue';
import RequestWidgetModal from '../components/editor/Modals/RequestWidgetModal.vue';

const route = useRoute();
const router = useRouter();
const editorStore = useEditorStore();
const brandStore = useBrandStore();
const authStore = useAuthStore();

/** /editor/<brand>/<projectId> or /editor/template/<templateId> for the open canvas */
function canonicalPath(): string | null {
  if (editorStore.isTemplateMode && editorStore.activeTemplateId) {
    return `/editor/template/${encodeURIComponent(editorStore.activeTemplateId)}`;
  }
  const project = editorStore.userProjects.find(p => p.id === editorStore.currentProjectId);
  if (!project) return null;
  const brand = (project.brand_slug || 'brand').toLowerCase();
  return `/editor/${encodeURIComponent(brand)}/${encodeURIComponent(project.id)}`;
}

/**
 * The URL is the source of truth for which project or template is open.
 */
async function syncProjectFromRoute() {
  const templateId = typeof route.params.templateId === 'string' ? route.params.templateId : '';
  if (templateId) {
    if (!authStore.isSuperAdmin) {
      editorStore.showToast('Template Studio is restricted to Superadmin.');
      router.replace('/');
      return;
    }
    if (editorStore.isTemplateMode && editorStore.activeTemplateId === templateId) {
      return;
    }
    if (!brandStore.templates.length) {
      await brandStore.loadTemplates();
    }
    const tpl = brandStore.templates.find(t => t.id === templateId);
    if (!tpl) {
      editorStore.showToast('Template not found.');
      router.replace('/settings?tab=templates');
      return;
    }
    if (editorStore.currentProjectId) await editorStore.flushPendingSave();
    editorStore.openTemplateInStudio(tpl);
    return;
  }

  const projectId = typeof route.params.projectId === 'string' ? route.params.projectId : '';

  if (!projectId) {
    if (editorStore.isTemplateMode && editorStore.activeTemplateId) {
      const path = canonicalPath();
      if (path && path !== route.path) router.replace(path);
      return;
    }
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

watch(() => [route.params.projectId, route.params.templateId], syncProjectFromRoute, { immediate: true });

// Keep the address in step when the project changes from inside the editor
// (new project, duplicate, brand reassigned on save).
watch(
  () => [editorStore.currentProjectId, editorStore.isTemplateMode, editorStore.userProjects.find(p => p.id === editorStore.currentProjectId)?.brand_slug],
  () => {
    if (!String(route.name || '').startsWith('Editor')) return;
    const path = canonicalPath();
    if (path && path !== route.path) router.replace(path);
  }
);
</script>
