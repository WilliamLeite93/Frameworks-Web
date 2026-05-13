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

  function setSession(userData, authToken) {
    const newToken = authToken || `brainlog-token-${userData.id}-${Date.now()}`;
    token.value = newToken;
    user.value = userData;
    saveSession(newToken, userData);
  }

  async function login(credentials) {
    const session = await loginRequest(credentials);
    setSession(session.user, session.token);
    return session.user;
  }

  async function register(payload) {
    const session = await registerRequest(payload);
    setSession(session.user, session.token);
    return session.user;
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
