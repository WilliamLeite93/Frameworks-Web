import { defineStore } from 'pinia';
import { ref, computed } from 'vue';


export const useAuthStore = defineStore('auth', () => {
  // --- STATE (Dados) ---
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);

  // --- GETTERS (Dados computados) ---
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || 'Estudante');

  // --- ACTIONS (Funções de lógica) ---
  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function setUser(userData) {
    user.value = userData;
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    isAuthenticated,
    userName,
    setToken,
    setUser,
    logout
  };
});