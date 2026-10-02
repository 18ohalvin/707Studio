import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from '../views/LandingPageView.vue';
import EditorView from '../views/EditorView.vue';
import LoginView from '../views/LoginView.vue';
import { isAuthenticated } from '../services/apiClient.ts';

import SuperAdminSettingsView from '../views/SuperAdminSettingsView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { public: true }
  },
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

// The studio and everything it can reach is staff-only, so routes are closed
// unless explicitly marked public. This is a convenience gate for the UI — the
// API enforces the same rule server-side, which is what actually protects data.
router.beforeEach((to) => {
  if (to.meta.public) {
    return true;
  }

  if (!isAuthenticated()) {
    return { name: 'Login', query: { redirect: to.fullPath } };
  }

  return true;
});

export default router;
