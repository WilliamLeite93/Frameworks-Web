import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { loginRequest, registerRequest } from '@/services/authService';
import {
  clearSessionStorage,
  getStoredToken,
  getStoredUser,
  saveSession,
} from '@/services/storage.service';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getStoredToken() || null);
  const user = ref(getStoredUser());

  const isAuthenticated = computed(() => Boolean(token.value));
  const userName = computed(() => user.value?.name || 'Estudante');

  function hydrate() {
    token.value = getStoredToken() || null;
    user.value = getStoredUser();
  }

  function setSession(userData) {
    const newToken = `brainlog-token-${userData.id}-${Date.now()}`;
    token.value = newToken;
    user.value = userData;
    saveSession(newToken, userData);
  }

  async function login(credentials) {
    const loggedUser = await loginRequest(credentials);
    setSession(loggedUser);
    return loggedUser;
  }

  async function register(payload) {
    const newUser = await registerRequest(payload);
    setSession(newUser);
    return newUser;
  }

  function logout() {
    token.value = null;
    user.value = null;
    clearSessionStorage();
  }

  return {
    user,
    token,
    isAuthenticated,
    userName,
    hydrate,
    login,
    register,
    logout,
  };
});
