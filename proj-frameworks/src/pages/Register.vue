<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const errorMessage = ref('');

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  goal: 'Vestibular ENEM',
});

async function handleRegister() {
  if (!form.name || !form.email || !form.password) {
    errorMessage.value = 'Preencha nome, e-mail e senha.';
    return;
  }

  if (form.password.length < 6) {
    errorMessage.value = 'A senha precisa ter pelo menos 6 caracteres.';
    return;
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'As senhas não conferem.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.register(form);
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error?.message || 'Não foi possível criar sua conta.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="surface-card auth-card fade-in-up">
    <span class="badge badge-info">Cadastro BrainLog</span>
    <h1>Crie sua conta de estudos</h1>
    <p>Estruture seus resumos, acompanhe sua evolução e mantenha foco no vestibular.</p>

    <form @submit.prevent="handleRegister">
      <div class="field">
        <label for="name">Nome completo</label>
        <input id="name" v-model.trim="form.name" type="text" placeholder="Digite seu nome" />
      </div>

      <div class="field">
        <label for="email">E-mail</label>
        <input id="email" v-model.trim="form.email" type="email" placeholder="Digite seu e-mail" />
      </div>

      <div class="field">
        <label for="goal">Objetivo</label>
        <select id="goal" v-model="form.goal">
          <option value="Vestibular ENEM">Vestibular ENEM</option>
          <option value="FUVEST">FUVEST</option>
          <option value="UNICAMP">UNICAMP</option>
          <option value="Vestibulares gerais">Vestibulares gerais</option>
        </select>
      </div>

      <div class="grid-2">
        <div class="field">
          <label for="password">Senha</label>
          <input id="password" v-model="form.password" type="password" placeholder="Crie sua senha" />
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar senha</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="Repita sua senha" />
        </div>
      </div>

      <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>

      <button type="submit" class="btn btn-primary" :disabled="loading">
        {{ loading ? 'Criando conta...' : 'Criar conta' }}
      </button>
    </form>

    <p class="auth-footer">
      Já possui conta?
      <RouterLink to="/login">Entrar</RouterLink>
    </p>
  </section>
</template>

<style scoped>
.auth-card {
  max-width: 600px;
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

.auth-footer {
  font-size: 0.9rem;
}

.auth-footer a {
  color: var(--bl-primary);
  font-weight: 800;
}
</style>

