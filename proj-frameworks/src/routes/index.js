import { createRouter, createWebHistory } from 'vue-router';


import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue';
import Abstracts from '../pages/Abstracts.vue';
import Evolution from '../pages/Evolution.vue';
import Upload from '../pages/Upload.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/abstracts', name: 'Abstracts', component: Abstracts },
  { path: '/evolution', name: 'Evolution', component: Evolution },
  { path: '/upload', name: 'Upload', component: Upload },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;