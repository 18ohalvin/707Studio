import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from '../views/LandingPageView.vue';
import EditorView from '../views/EditorView.vue';
import LoginView from '../views/LoginView.vue';
import SuperAdminSettingsView from '../views/SuperAdminSettingsView.vue';
import { useAuthStore } from '../stores/authStore.ts';

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPageView
  },
  {
    path: '/editor',
    name: 'Editor',
    component: EditorView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/settings',
    name: 'SuperAdminSettings',
    component: SuperAdminSettingsView
  },
  {
    path: '/admin',
    redirect: '/settings'
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

// Domain is open to all visitors (brands, users, team).
// Only /settings and /admin require verified Superadmin access.
router.beforeEach((to) => {
  if (to.path === '/settings' || to.path === '/admin') {
    const authStore = useAuthStore();
    if (!authStore.isSuperAdmin) {
      return { name: 'Login', query: { redirect: to.fullPath } };
    }
  }
  return true;
});

export default router;
