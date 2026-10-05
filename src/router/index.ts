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
  },
  {
    path: '/:brandSlug/:pageSlug',
    name: 'PublicDrop',
    component: () => import('../views/PublicDropView.vue'),
    meta: { public: true }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

// Domain is open to all visitors (brands, users, team).
// /settings and /admin require verified Superadmin access.
// /editor requires authenticated Brand or Superadmin session.
router.beforeEach((to) => {
  const authStore = useAuthStore();
  
  if (to.path === '/settings' || to.path === '/admin') {
    if (!authStore.isSuperAdmin) {
      return { name: 'Login', query: { tab: 'superadmin', redirect: to.fullPath } };
    }
  }

  if (to.path === '/editor') {
    if (!authStore.isAuthenticated) {
      return { path: '/', query: { signin: '1' } };
    }
  }

  return true;
});

export default router;
