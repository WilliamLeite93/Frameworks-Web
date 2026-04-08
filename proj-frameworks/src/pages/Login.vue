<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  
  // SIMULAÇÃO: Espera 1 segundo como se fosse uma API
  setTimeout(() => {
    // 1. Dados fakes que viriam do seu backend
    const mockToken = 'meu-token-jwt-gerado-pela-api';
    const mockUser = { id: 1, name: 'William Leite', email: email.value };

    // 2. Usando a nossa Store profissional
    authStore.setToken(mockToken);
    authStore.setUser(mockUser);

    loading.value = false;
    
    // 3. Redireciona para o Dashboard (que agora está protegido e vai deixar passar)
    router.push({ name: 'Dashboard' });
  }, 1000);
};
</script>

<template>
  <div class="login-container">
    <h1>Entrar na Plataforma</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="email" type="email" placeholder="Seu e-mail acadêmico" required />
      <input v-model="password" type="password" placeholder="Sua senha" required />
      
      <button type="submit" :disabled="loading">
        {{ loading ? 'Autenticando...' : 'Entrar' }}
      </button>
    </form>
    
    <p v-if="authStore.isAuthenticated">
      Status: Você já está logado como {{ authStore.userName }}
    </p>
  </div>
</template>

<style scoped>
.login-container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
input { display: block; width: 100%; margin-bottom: 10px; padding: 10px; }
button { width: 100%; padding: 10px; background: #42b883; color: white; border: none; cursor: pointer; }
</style>