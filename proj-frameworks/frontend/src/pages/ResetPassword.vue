<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPasswordRequest } from '@/services/authService';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const showPassword = ref(false);

const form = reactive({
  token: typeof route.query.token === 'string' ? route.query.token : '',
  password: '',
  confirmPassword: '',
});

async function handleResetPassword() {
  const payload = {
    token: form.token.trim(),
    password: String(form.password ?? ''),
    confirmPassword: String(form.confirmPassword ?? ''),
  };

  if (!payload.token) {
    errorMessage.value = 'Informe o token de recuperação.';
    return;
  }

  if (payload.password.length < 6) {
    errorMessage.value = 'A senha precisa ter pelo menos 6 caracteres.';
    return;
  }

  if (payload.password !== payload.confirmPassword) {
    errorMessage.value = 'As senhas não conferem.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await resetPasswordRequest(payload);
    successMessage.value = response.message || 'Senha atualizada com sucesso.';
    setTimeout(() => {
      router.push('/login');
    }, 1400);
  } catch (error) {
    errorMessage.value = error?.message || 'Não foi possível redefinir sua senha.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="surface-card auth-card fade-in-up">
    <span class="badge badge-info">Nova senha</span>
    <h1>Redefinir senha</h1>
    <p>Crie uma nova senha para voltar a acessar sua conta.</p>

    <form @submit.prevent="handleResetPassword">
    
      <div class="field">
        <label for="password">Nova senha</label>
        <input
          id="password"
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Digite sua nova senha"
        />
      </div>

      <div class="field">
        <label for="confirmPassword">Confirmar nova senha</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Repita sua nova senha"
        />
      </div>

      <label class="show-password">
        <input v-model="showPassword" type="checkbox" />
        Mostrar senha
      </label>

      <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="field-success">{{ successMessage }}</p>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Salvando...' : 'Salvar nova senha' }}
      </button>
    </form>

    <p class="auth-footer">
      Precisa de outro token?
      <RouterLink to="/forgot-password">Solicitar recuperação</RouterLink>
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

form .btn {
  width: 100%;
}

.field-success {
  color: var(--bl-success);
  font-size: 0.8rem;
  font-weight: 800;
}

.auth-footer {
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--bl-primary);
  font-weight: 800;
}
</style>
