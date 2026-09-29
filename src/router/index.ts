import { createRouter, createWebHistory } from 'vue-router';
import LandingPageView from '../views/LandingPageView.vue';
import EditorView from '../views/EditorView.vue';

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
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
