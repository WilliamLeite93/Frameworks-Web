<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import bgLogin from '@/assets/bg-login.png';
import brainLogLogo from '@/assets/brainlog-logo.png';

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleRegister() {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    password: String(form.password ?? ''),
    confirmPassword: String(form.confirmPassword ?? ''),
    goal: form.goal,
  };

  if (!payload.name || !payload.email || !payload.password) {
    errorMessage.value = 'Preencha nome, e-mail e senha.';
    return;
  }

  if (payload.name.length < 2) {
    errorMessage.value = 'Informe um nome com pelo menos 2 caracteres.';
    return;
  }

  if (!emailPattern.test(payload.email)) {
    errorMessage.value = 'Informe um e-mail válido.';
    return;
  }

  if (payload.password.length < 6) {
    errorMessage.value = 'A senha precisa ter pelo menos 6 caracteres.';
    return;
  }

  if (!payload.confirmPassword) {
    errorMessage.value = 'Confirme sua senha.';
    return;
  }

  if (payload.password !== payload.confirmPassword) {
    errorMessage.value = 'As senhas não conferem.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    await authStore.register(payload);
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error?.message || 'Não foi possível criar sua conta.';
  } finally {
    loading.value = false;
  }
}
</script>


<template>
  <section class="login-page fade-in-up" :style="{ backgroundImage: `url(${bgLogin})` }">
    <div class="login-copy">
      <RouterLink to="/" class="login-brand" aria-label="BrainLog - página inicial">
        <img :src="brainLogLogo" alt="" class="brand-mark" aria-hidden="true" />
        <span>BrainLog</span>
      </RouterLink>

      <div class="login-heading">
        <h1>
          Comece seu plano.
          <span>Estude com clareza.</span>
        </h1>
        <p>Crie sua conta para centralizar resumos, anexos e acompanhar sua evolução em um só lugar.</p>
      </div>

      <div class="benefit-grid" aria-label="Benefícios do BrainLog">
        <article class="benefit-card">
          <span>RS</span>
          <strong>Salve seus resumos</strong>
        </article>
        <article class="benefit-card">
          <span>AN</span>
          <strong>Organize anexos</strong>
        </article>
        <article class="benefit-card">
          <span>EV</span>
          <strong>Acompanhe evolução</strong>
        </article>
      </div>

      <div class="floating-insights" aria-hidden="true">
        <div class="insight-card chart-card">
          <small>Biblioteca</small>
          <strong>Pronta</strong>
          <span class="mini-chart"></span>
        </div>
        <div class="insight-card goal-card">
          <span class="check-mark">✓</span>
          <div>
            <small>Conta criada</small>
            <strong>em minutos</strong>
          </div>
        </div>
      </div>
    </div>

    <section class="login-panel" aria-labelledby="register-title">
      <span class="access-pill">Cadastro BrainLog</span>
      <header class="panel-header">
        <h2 id="register-title">Criar conta de estudos</h2>
        <p>Preencha seus dados para começar a montar sua biblioteca BrainLog.</p>
      </header>

      <form class="login-form" @submit.prevent="handleRegister">
        <div class="login-field">
          <label for="name">Nome completo</label>
          <div class="input-shell">
            <span aria-hidden="true">ID</span>
            <input id="name" v-model.trim="form.name" type="text" placeholder="Digite seu nome" />
          </div>
        </div>

        <div class="login-field">
          <label for="email">E-mail</label>
          <div class="input-shell">
            <span aria-hidden="true">@</span>
            <input id="email" v-model.trim="form.email" type="email" placeholder="Digite seu e-mail" />
          </div>
        </div>

        <div class="login-field">
          <label for="goal">Objetivo</label>
          <div class="input-shell select-shell">
            <span aria-hidden="true">FO</span>
            <select id="goal" v-model="form.goal">
              <option value="Vestibular ENEM">Vestibular ENEM</option>
              <option value="FUVEST">FUVEST</option>
              <option value="UNICAMP">UNICAMP</option>
              <option value="Vestibulares gerais">Vestibulares gerais</option>
            </select>
          </div>
        </div>

        <div class="register-password-grid">
          <div class="login-field">
            <label for="password">Senha</label>
            <div class="input-shell">
              <span aria-hidden="true">#</span>
              <input id="password" v-model="form.password" type="password" placeholder="Crie sua senha" />
            </div>
          </div>

          <div class="login-field">
            <label for="confirmPassword">Confirmar senha</label>
            <div class="input-shell">
              <span aria-hidden="true">#</span>
              <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="Repita sua senha" />
            </div>
          </div>
        </div>

        <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>

        <button type="submit" class="login-submit" :disabled="loading">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </button>
      </form>

      <p class="auth-footer">
        Já possui conta?
        <RouterLink to="/login">Entrar <span aria-hidden="true">-></span></RouterLink>
      </p>

      <p class="secure-note">
        <span aria-hidden="true">◇</span>
        Seus dados protegidos com criptografia de ponta a ponta.
      </p>
    </section>
  </section>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.8fr);
  gap: clamp(1.5rem, 4vw, 4.5rem);
  align-items: center;
  padding: clamp(2rem, 6vw, 5rem) clamp(1.25rem, 7vw, 6.5rem);
  background-color: #eefcf9;
  background-position: center;
  background-size: cover;
  overflow: hidden;
}

.login-copy {
  position: relative;
  min-height: min(760px, calc(100vh - 6rem));
  display: grid;
  align-content: start;
  gap: clamp(1.5rem, 3vw, 2.2rem);
  padding-top: clamp(0rem, 3vw, 2rem);
}

.login-brand {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.72rem;
  color: #08756d;
  font-family: 'Sora', sans-serif;
  font-size: clamp(1.25rem, 2vw, 1.8rem);
  font-weight: 800;
}

.brand-mark {
  width: 2.45rem;
  height: 2.45rem;
  display: block;
  object-fit: contain;
}

.login-heading {
  max-width: 680px;
  display: grid;
  gap: 1.15rem;
}

.login-heading h1 {
  color: #0f1d35;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.25rem, 5vw, 4.4rem);
  line-height: 1.05;
  letter-spacing: 0;
}

.login-heading h1 span {
  display: block;
  color: #0c9f8c;
}

.login-heading p {
  max-width: 620px;
  color: #55657d;
  font-size: clamp(1rem, 1.35vw, 1.24rem);
  line-height: 1.65;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.86rem;
  max-width: 650px;
}

.benefit-card {
  min-height: 76px;
  display: flex;
  align-items: center;
  gap: 0.72rem;
  padding: 0.82rem 0.92rem;
  border: 1px solid rgba(195, 209, 224, 0.88);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 38px rgba(17, 35, 60, 0.09);
  backdrop-filter: blur(12px);
}

.benefit-card span {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: #d7fbf2;
  color: #069a8d;
  font-size: 0.72rem;
  font-weight: 900;
}

.benefit-card strong {
  color: #1c2941;
  font-size: 0.92rem;
  line-height: 1.32;
}

.floating-insights {
  position: absolute;
  top: 12%;
  right: 3%;
  width: 230px;
  height: 260px;
  pointer-events: none;
}

.insight-card {
  position: absolute;
  border: 1px solid rgba(215, 225, 235, 0.88);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 20px 42px rgba(17, 35, 60, 0.11);
  backdrop-filter: blur(10px);
}

.insight-card small {
  display: block;
  color: #50627b;
  font-weight: 800;
  font-size: 0.72rem;
}

.insight-card strong {
  display: block;
  color: #058c81;
  font-size: 0.9rem;
}

.chart-card {
  top: 0;
  right: 0;
  width: 158px;
  padding: 0.84rem;
  transform: rotate(6deg);
}

.mini-chart {
  height: 44px;
  margin-top: 0.55rem;
  display: block;
  border-radius: 6px;
  background:
    linear-gradient(to top, #6ba8f5 42%, transparent 42%) 0 100% / 18% 100% no-repeat,
    linear-gradient(to top, #82b7fb 58%, transparent 58%) 26% 100% / 18% 100% no-repeat,
    linear-gradient(to top, #6ba8f5 50%, transparent 50%) 52% 100% / 18% 100% no-repeat,
    linear-gradient(to top, #82b7fb 82%, transparent 82%) 78% 100% / 18% 100% no-repeat;
}

.goal-card {
  left: 0;
  bottom: 38px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 170px;
  padding: 0.82rem 0.92rem;
  transform: rotate(4deg);
}

.check-mark {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #c7fbf1;
  color: #088f85;
  font-weight: 900;
}

.login-panel {
  width: min(100%, 560px);
  justify-self: center;
  display: grid;
  gap: 1.28rem;
  padding: clamp(1.45rem, 3vw, 2.7rem);
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 28px 70px rgba(14, 83, 77, 0.18);
  backdrop-filter: blur(18px);
}

.access-pill {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.52rem 1.3rem;
  border-radius: 999px;
  background: #e3f8f3;
  color: #067a72;
  font-weight: 900;
  font-size: 0.88rem;
}

.panel-header {
  display: grid;
  gap: 0.72rem;
  text-align: center;
}

.panel-header h2 {
  color: #0f1d35;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  letter-spacing: 0;
}

.panel-header p {
  max-width: 430px;
  justify-self: center;
  color: #64728a;
  line-height: 1.55;
  font-size: 1rem;
}

.login-form {
  display: grid;
  gap: 1.02rem;
}

.login-field {
  display: grid;
  gap: 0.48rem;
}

.login-field label {
  color: #13243d;
  font-weight: 900;
  font-size: 0.92rem;
}

.input-shell {
  height: 58px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.72rem;
  border: 1px solid #cad8e8;
  border-radius: 8px;
  padding: 0 1rem;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.92), 0 10px 20px rgba(15, 31, 55, 0.04);
}

.input-shell:focus-within {
  border-color: rgba(6, 182, 212, 0.72);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.12);
}

.input-shell > span {
  color: #62728a;
  font-weight: 900;
}

.input-shell input,
.input-shell select {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: #13243d;
  font-size: 1rem;
}

.input-shell input::placeholder {
  color: #8a98ad;
}

.password-toggle {
  border: 0;
  background: transparent;
  color: #53657c;
  font-size: 0.82rem;
  font-weight: 900;
  cursor: pointer;
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.show-password {
  display: inline-flex;
  align-items: center;
  gap: 0.48rem;
  color: #50617a;
  font-size: 0.9rem;
  font-weight: 800;
}

.show-password input {
  width: 1rem;
  height: 1rem;
  accent-color: #087f76;
}

.forgot-link {
  color: #087f76;
  font-size: 0.86rem;
  font-weight: 900;
}

.field-error {
  margin: 0;
  color: #dc2626;
  font-size: 0.86rem;
  font-weight: 800;
}

.login-submit {
  min-height: 58px;
  border: 0;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.62rem;
  background: linear-gradient(135deg, #07907f, #057368);
  color: #ffffff;
  box-shadow: 0 18px 34px rgba(4, 119, 108, 0.24);
  font-weight: 900;
  font-size: 1rem;
  cursor: pointer;
}

.login-submit:disabled {
  opacity: 0.68;
  cursor: not-allowed;
}

.divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.8rem;
  color: #738198;
  font-size: 0.88rem;
}

.divider::before,
.divider::after {
  content: '';
  height: 1px;
  background: #dde6f0;
}

.social-actions {
  display: grid;
  gap: 0.72rem;
}

.social-actions button {
  min-height: 52px;
  border: 1px solid #d4dfec;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.72rem;
  background: rgba(255, 255, 255, 0.84);
  color: #101d33;
  font-weight: 850;
  font-size: 1rem;
  cursor: pointer;
}

.social-actions span {
  font-weight: 950;
}

.auth-footer {
  margin: 0;
  text-align: center;
  color: #68768d;
  font-size: 0.98rem;
}

.auth-footer a {
  color: #067a72;
  font-weight: 900;
}

.secure-note {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  color: #64728a;
  font-size: 0.86rem;
  line-height: 1.4;
}

.secure-note span {
  color: #069a8d;
  font-weight: 900;
}

@media (max-width: 1180px) {
  .login-page {
    grid-template-columns: 1fr;
    background-position: left center;
  }

  .login-copy {
    min-height: auto;
  }

  .floating-insights {
    display: none;
  }

  .login-panel {
    justify-self: start;
  }
}

@media (max-width: 720px) {
  .login-page {
    padding: 1rem;
  }

  .benefit-grid {
    grid-template-columns: 1fr;
  }

  .login-panel {
    width: 100%;
  }

  .form-options {
    align-items: flex-start;
    flex-direction: column;
  }
}


.input-shell select {
  appearance: none;
  cursor: pointer;
}

.select-shell {
  grid-template-columns: auto 1fr;
}

.register-password-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.86rem;
}

@media (max-width: 720px) {
  .register-password-grid {
    grid-template-columns: 1fr;
  }
}

</style>