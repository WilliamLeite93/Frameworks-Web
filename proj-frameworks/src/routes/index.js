import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/store/auth';

// A Home (página de entrada) é importada de forma síncrona para melhor UX
import Home from '@/pages/Home.vue'; 

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue') },
  // Rotas Privadas
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: () => import('@/pages/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/upload', 
    name: 'Upload', 
    component: () => import('@/pages/Upload.vue'),
    meta: { requiresAuth: true }
  },
  { 
    path: '/abstracts', 
    name: 'Abstracts', 
    component: () => import('@/pages/Abstracts.vue') 
  },
  { 
    path: '/evolution', 
    name: 'Evolution', 
    component: () => import('@/pages/Evolution.vue') 
  },
];

const router = createRouter({
  // Use a variável de ambiente do Vite para a Base URL (boa prática)
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore(); // Acessando a store
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});
export default router;