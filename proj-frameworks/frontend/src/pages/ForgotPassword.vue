<script setup>
import { reactive, ref } from 'vue';
import { forgotPasswordRequest } from '@/services/authService';

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = reactive({
  email: '',
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleForgotPassword() {
  const email = form.email.trim();

  if (!email) {
    errorMessage.value = 'Informe seu e-mail.';
    return;
  }

  if (!emailPattern.test(email)) {
    errorMessage.value = 'Informe um e-mail válido.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await forgotPasswordRequest({ email });
    successMessage.value = response.message || 'Verifique seu e-mail para redefinir sua senha.';
  } catch (error) {
    errorMessage.value = error?.message || 'Não foi possível solicitar a recuperação.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="surface-card auth-card fade-in-up">
    <span class="badge badge-primary">Recuperação BrainLog</span>
    <h1>Recuperar senha</h1>
    <p>Informe o e-mail da sua conta para receber as instruções de redefinição.</p>

    <form @submit.prevent="handleForgotPassword">
      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" v-model.trim="form.email" type="email" placeholder="Digite seu e-mail" />
      </div>

      <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="field-success">{{ successMessage }}</p>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Enviando...' : 'Enviar instruções' }}
      </button>
    </form>

    <p class="auth-footer">
      Lembrou a senha?
      <RouterLink to="/login">Entrar</RouterLink>
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

form .btn {
  width: 100%;
}

.field-success {
  color: var(--bl-success);
  font-size: 0.8rem;
  font-weight: 800;
}

.auth-footer a {
  color: var(--bl-primary);
  font-weight: 800;
}

.auth-footer {
  font-size: 0.9rem;
}
</style>
