<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import bgLogin from '@/assets/bg-login.png';

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
  <section class="login-page fade-in-up" :style="{ backgroundImage: `url(${bgLogin})` }">
    <div class="login-copy" aria-labelledby="login-hero-title">
      <RouterLink to="/" class="login-brand" aria-label="BrainLog - página inicial">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img">
            <path d="M18.4 38.8c-5.7 0-10.3-4.2-10.3-9.6 0-2.4.9-4.5 2.4-6.2a9.4 9.4 0 0 1 9.2-12.2 10.1 10.1 0 0 1 18.1 6.3 10.4 10.4 0 0 1-2.4 20.5H33" />
            <path d="M18.5 19.4c3.1-.8 5.4.3 6.9 3.1 1.1-2.3 3-3.7 5.8-4.1" />
            <path d="M17.2 27.8h5.6l3.4-5.9 4.5 10.3 2.5-4.4h4.4" />
          </svg>
        </span>
        <span>BrainLog</span>
      </RouterLink>

      <div class="login-heading">
        <h1 id="login-hero-title">
          Organize seus estudos.
          <span>Evolua com clareza.</span>
        </h1>
        <p>O BrainLog é o seu espaço para centralizar resumos, acompanhar sua evolução e transformar conhecimento em resultado.</p>
      </div>

      <div class="benefit-grid" aria-label="Benefícios do BrainLog">
        <article class="benefit-card">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 4.5h9.5v13H8z" />
              <path d="M5.5 7H16v12.5H5.5z" />
              <path d="M8.5 10.5h5M8.5 14h5" />
            </svg>
          </span>
          <strong>Organize seus resumos</strong>
        </article>
        <article class="benefit-card">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m4 16 5-5 3.2 3.2L20 6.5" />
              <path d="M16 6.5h4v4" />
            </svg>
          </span>
          <strong>Acompanhe sua evolução</strong>
        </article>
        <article class="benefit-card">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="7.5" />
              <circle cx="12" cy="12" r="3.8" />
              <path d="M12 12h7.5M12 4.5V2M4.5 12H2M12 19.5V22" />
            </svg>
          </span>
          <strong>Estude com foco</strong>
        </article>
      </div>

      <div class="floating-insights" aria-hidden="true">
        <div class="insight-card chart-card">
          <small>Evolução semanal</small>
          <strong>+24%</strong>
          <span class="mini-chart"></span>
        </div>
        <div class="insight-card goal-card">
          <span class="check-mark">✓</span>
          <div>
            <small>Meta diária</small>
            <strong>8/10</strong>
          </div>
        </div>
      </div>
    </div>

    <section class="login-panel" aria-labelledby="login-title">
      <span class="access-pill">Acesso BrainLog</span>
      <header class="panel-header">
        <h2 id="login-title">Entrar na plataforma</h2>
        <p>Acesse sua conta para visualizar seus resumos e acompanhar sua evolução.</p>
      </header>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="login-field">
          <label for="email">E-mail</label>
          <div class="input-shell">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4.5 6.5h15v11h-15z" />
                <path d="m5 7 7 6 7-6" />
              </svg>
            </span>
            <input id="email" v-model.trim="form.email" type="email" placeholder="Digite seu e-mail" />
          </div>
        </div>

        <div class="login-field">
          <label for="password">Senha</label>
          <div class="input-shell">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M7 10h10v9H7z" />
                <path d="M9.2 10V7.8a2.8 2.8 0 0 1 5.6 0V10" />
              </svg>
            </span>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Digite sua senha"
            />
            <button type="button" class="password-toggle" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'" @click="showPassword = !showPassword">
              <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 4l16 16" />
                <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                <path d="M7.4 7.7C5.9 8.7 4.7 10.1 4 12c1.4 3.5 4.1 5.5 8 5.5 1.6 0 3-.3 4.2-1" />
                <path d="M10.7 6.6c.4-.1.9-.1 1.3-.1 3.9 0 6.6 2 8 5.5-.4 1.1-1 2-1.8 2.8" />
              </svg>
              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12c1.4-3.5 4.1-5.5 8-5.5s6.6 2 8 5.5c-1.4 3.5-4.1 5.5-8 5.5s-6.6-2-8-5.5Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="show-password">
            <input v-model="showPassword" type="checkbox" />
            Mostrar senha
          </label>

          <RouterLink class="forgot-link" to="/forgot-password">Esqueci minha senha</RouterLink>
        </div>

        <p v-if="errorMessage" class="field-error">{{ errorMessage }}</p>

        <button type="submit" class="login-submit" :disabled="loading">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 10h10v9H7z" />
              <path d="M9.2 10V7.8a2.8 2.8 0 0 1 5.6 0V10" />
            </svg>
          </span>
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="divider"><span>ou continue com</span></div>

        <div class="social-actions">
          <button type="button"><span>G</span>Continuar com Google</button>
          <button type="button"><span>A</span>Continuar com Apple</button>
        </div>
      </form>

      <p class="auth-footer">
        Ainda não tem conta?
        <RouterLink to="/register">Criar conta <span aria-hidden="true">→</span></RouterLink>
      </p>

      <p class="secure-note">
        <span aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 3.5 18.5 6v5.1c0 4.2-2.6 7.5-6.5 9.4-3.9-1.9-6.5-5.2-6.5-9.4V6z" />
            <path d="m9.2 12.1 1.9 1.9 3.9-4.1" />
          </svg>
        </span>
        Seus dados protegidos com criptografia de ponta a ponta.
      </p>
    </section>
  </section>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(430px, 0.58fr);
  gap: clamp(1.5rem, 5vw, 5.8rem);
  align-items: center;
  padding: clamp(2rem, 5.4vw, 4.8rem) clamp(1.25rem, 6.4vw, 6.8rem);
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
  padding-top: clamp(0rem, 2.4vw, 1.65rem);
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
  letter-spacing: 0;
}

.brand-mark {
  width: 3.2rem;
  height: 3.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #0f9f94;
}

.brand-mark svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.3;
}

.login-heading {
  max-width: 680px;
  display: grid;
  gap: 1.15rem;
}

.login-heading h1 {
  color: #0f1d35;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.45rem, 4.5vw, 4.45rem);
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
  line-height: 1.68;
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
  width: 2.45rem;
  height: 2.45rem;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  background: linear-gradient(135deg, #d7fbf2, #e8f8ff);
  color: #069a8d;
}

.benefit-card svg,
.input-shell svg,
.password-toggle svg,
.login-submit svg,
.secure-note svg {
  width: 1.18rem;
  height: 1.18rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.benefit-card strong {
  color: #1c2941;
  font-size: 0.92rem;
  line-height: 1.32;
}

.floating-insights {
  position: absolute;
  top: 16%;
  right: -1%;
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
  width: min(100%, 610px);
  justify-self: center;
  display: grid;
  gap: 1.3rem;
  padding: clamp(1.55rem, 3vw, 2.85rem);
  border: 1px solid rgba(255, 255, 255, 0.84);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 30px 80px rgba(14, 83, 77, 0.18);
  backdrop-filter: blur(20px);
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
  font-size: clamp(1.72rem, 2.75vw, 2.35rem);
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
  gap: 1.04rem;
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
  display: inline-flex;
  color: #62728a;
}

.input-shell input {
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
  width: 2rem;
  height: 2rem;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #53657c;
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

.login-submit span,
.secure-note span {
  display: inline-flex;
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
</style>
