<template>
  <div 
    class="w-full relative"
    :class="isPublicDrop ? 'min-h-[100dvh] bg-white text-black overflow-y-auto' : 'h-screen w-screen overflow-hidden flex flex-col bg-[#f5f5f5] text-black font-sans'"
  >
    <DesktopOnlyGuard v-if="!isPublicDrop" />
    <ProjectLoadingScreen v-if="!isPublicDrop" />
    <router-view />
    <GlassDialog />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SESSION_EXPIRED_EVENT } from './services/apiClient.ts';
import DesktopOnlyGuard from './components/common/DesktopOnlyGuard.vue';
import ProjectLoadingScreen from './components/common/ProjectLoadingScreen.vue';
import GlassDialog from './components/common/GlassDialog.vue';
import { useAuthStore } from './stores/authStore.ts';
import { useBrandStore } from './stores/brandStore.ts';
import { useEditorStore } from './stores/editorStore.ts';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();

const isPublicDrop = computed(() => {
  return route.name === 'PublicDrop' || (Boolean(route.meta?.public) && route.name !== 'Login');
});

function handleSessionExpired() {
  if (!authStore.isAuthenticated) return;
  authStore.signOut();
  if (isPublicDrop.value) return;
  editorStore.showToast('Your session expired — sign in again. Unsaved edits are kept on this device.', 6000);
  router.push({ path: '/', query: { signin: '1', redirect: route.fullPath } });
}

onUnmounted(() => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired));

onMounted(async () => {
  window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  authStore.initAuth();

  // Nothing to fetch until someone is signed in. Firing these on the login
  // screen produced a burst of 401s, and a 401 sends the app back to /login —
  // which risks bouncing a user straight out of a session they just started.
  if (!authStore.isAuthenticated) return;

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

