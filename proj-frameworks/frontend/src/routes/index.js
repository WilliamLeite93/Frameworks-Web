import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import Home from '@/pages/Home.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/pages/ForgotPassword.vue') },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('@/pages/ResetPassword.vue') },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('@/pages/Upload.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/abstracts',
    name: 'Abstracts',
    component: () => import('@/pages/Abstracts.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/abstracts/:id',
    name: 'SummaryDetail',
    component: () => import('@/pages/SummaryDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/evolution',
    name: 'Evolution',
    component: () => import('@/pages/Evolution.vue'),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const authStore = useAuthStore();
  authStore.hydrate();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'Login',
      query: { redirect: to.fullPath },
    };
  }

  if (['Login', 'Register', 'ForgotPassword', 'ResetPassword'].includes(to.name) && authStore.isAuthenticated) {
    return { name: 'Dashboard' };
  }

  return true;
});

router.afterEach((to) => {
  const titleMap = {
    Home: 'BrainLog | Plataforma de Resumos para Vestibular',
    Login: 'BrainLog | Login',
    Register: 'BrainLog | Cadastro',
    ForgotPassword: 'BrainLog | Recuperar senha',
    ResetPassword: 'BrainLog | Redefinir senha',
    Dashboard: 'BrainLog | Dashboard',
    Upload: 'BrainLog | Upload',
    Abstracts: 'BrainLog | Biblioteca de Resumos',
    SummaryDetail: 'BrainLog | Detalhes do Resumo',
    Evolution: 'BrainLog | Evolução',
  };

  document.title = titleMap[to.name] || 'BrainLog';
});

export default router;
