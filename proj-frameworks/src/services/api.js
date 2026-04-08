import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR DE REQUISIÇÃO ---
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      // Adiciona o token no padrão Bearer (padrão de mercado para JWT)
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR DE RESPOSTA (Opcional, mas recomendado) ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se a API retornar 401 (Não autorizado), o token expirou
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      authStore.logout(); // Limpa a store e o localStorage
      window.location.href = '/login'; // Redireciona para o login
    }
    return Promise.reject(error);
  }
);

export default api;