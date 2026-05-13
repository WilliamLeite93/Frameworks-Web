import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.message || error.response?.data?.issues?.[0]?.message;

    if (apiMessage) {
      error.message = apiMessage;
    } else if (!error.response) {
      error.message = 'Não foi possível conectar ao servidor. Verifique se a API está rodando.';
    } else if (error.response.status >= 500) {
      error.message = 'Ocorreu um erro no servidor. Tente novamente em alguns instantes.';
    }

    const requestUrl = error.config?.url || '';
    const isAuthFormRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/users');

    if (error.response && error.response.status === 401 && !isAuthFormRequest) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);

export default api;
