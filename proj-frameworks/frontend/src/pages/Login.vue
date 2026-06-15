<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const errorMessage = ref('');
const showPassword = ref(false);

const form = reactive({
  email: '',
  password: '',
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleLogin() {
  const email = form.email.trim();
  const password = String(form.password ?? '');

  if (!email || !password) {
    errorMessage.value = 'Preencha e-mail e senha.';
    return;
  }

  if (!emailPattern.test(email)) {
    errorMessage.value = 'Informe um e-mail válido.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.login({ email, password });
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    router.push(redirect);
  } catch (error) {
    errorMessage.value = error?.message || 'Não foi possível fazer login.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="surface-card auth-card fade-in-up">
    <span class="badge badge-primary">Acesso BrainLog</span>
    <h1>Entrar na plataforma</h1>
    <p>Acesse sua conta para visualizar seus resumos e evolução de estudos.</p>

    <form @submit.prevent="handleLogin">
      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" v-model.trim="form.email" type="email" placeholder="Digite seu e-mail" />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Digite sua senha"
        />
      </div>

      <label class="show-password">
        <input v-model="showPassword" type="checkbox" />
        Mostrar senha
      </label>

      <RouterLink class="forgot-link" to="/forgot-password">Esqueci minha senha</RouterLink>

      <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>

    <p class="auth-footer">
      Ainda não tem conta?
      <RouterLink to="/register">Criar conta</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 470px;
  margin: 0 auto;
  padding: 1.2rem;
  display: grid;
  gap: 0.8rem;
}

.auth-card h1 {
  font-size: 1.55rem;
}

.auth-card p {
  color: var(--bl-muted);
  line-height: 1.55;
}

form {
  display: grid;
  gap: 0.72rem;
}

.show-password {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  color: var(--bl-muted);
  font-size: 0.84rem;
  font-weight: 700;
}

.show-password input {
  accent-color: var(--bl-primary);
}

.forgot-link {
  justify-self: start;
  color: var(--bl-primary);
  font-size: 0.84rem;
  font-weight: 800;
}

form .btn {
  width: 100%;
}

.auth-footer {
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--bl-primary);
  font-weight: 800;
}
</style>
