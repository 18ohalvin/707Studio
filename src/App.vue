<template>
  <div 
    class="w-full relative"
    :class="isPublicDrop 
      ? 'min-h-[100dvh] bg-white text-black overflow-y-auto' 
      : (isDevMode ? 'h-screen w-screen overflow-hidden flex flex-col bg-[#0a0a0a] text-white font-sans' : 'h-screen w-screen overflow-hidden flex flex-col bg-[#f5f5f5] text-black font-sans')"
  >
    <DesktopOnlyGuard v-if="!isPublicDrop" />
    <ProjectLoadingScreen v-if="!isPublicDrop" />
    <router-view v-slot="{ Component, route: currentRoute }">
      <Transition name="apple-page" mode="out-in">
        <component :is="Component" :key="currentRoute.path" />
      </Transition>
    </router-view>
    <GlassDialog />
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SESSION_EXPIRED_EVENT } from './services/apiClient.ts';
import DesktopOnlyGuard from './components/common/DesktopOnlyGuard.vue';
import ProjectLoadingScreen from './components/common/ProjectLoadingScreen.vue';
import GlassDialog from './components/common/GlassDialog.vue';
import { useAuthStore } from './stores/authStore.ts';
import { useBrandStore } from './stores/brandStore.ts';
import { useEditorStore } from './stores/editorStore.ts';
import { useThemeStore, applyDocumentTheme } from './stores/themeStore.ts';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const brandStore = useBrandStore();
const editorStore = useEditorStore();
const themeStore = useThemeStore();

const isPublicDrop = computed(() => {
  return route.name === 'PublicDrop' || (Boolean(route.meta?.public) && route.name !== 'Login' && route.name !== 'AboutStudio');
});

const isDevMode = computed(() => {
  return route.path.startsWith('/dev') || (authStore.isSuperAdmin && (route.path.startsWith('/hub') || route.path.startsWith('/dev')));
});

watch(
  [isPublicDrop, isDevMode, () => route.name, () => themeStore.theme],
  ([pub, dev, routeName, userTheme]) => {
    if (typeof document === 'undefined') return;
    if (pub) {
      applyDocumentTheme('light');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
      return;
    }
    if (routeName === 'Login') {
      applyDocumentTheme(userTheme);
      document.body.style.backgroundColor = userTheme === 'dark' ? '#000000' : '#f2f2f2';
      document.body.style.color = userTheme === 'dark' ? '#f3f4f6' : '#111111';
      return;
    }
    if (dev) {
      applyDocumentTheme('dark');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#f3f4f6';
    } else {
      applyDocumentTheme('light');
      document.body.style.backgroundColor = '#f2f2f2';
      document.body.style.color = '#000000';
    }
  },
  { immediate: true }
);

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

