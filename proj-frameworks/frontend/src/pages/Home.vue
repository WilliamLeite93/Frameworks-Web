<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import focoImage from '@/assets/foco.png';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const highlights = [
  {
    title: 'Biblioteca por matéria',
    description: 'Organize os conteúdos por disciplina e encontre revisões em segundos.',
  },
  {
    title: 'Rotina consistente',
    description: 'Acompanhe o que já foi revisado e os próximos passos da semana.',
  },
  {
    title: 'Evolução visível',
    description: 'Use métricas simples para ajustar sua estratégia de vestibular.',
  },
];

const steps = [
  'Cadastre-se e acesse seu painel pessoal.',
  'Faça upload dos seus resumos com descrição e matéria.',
  'Acompanhe evolução e mantenha sua revisão em dia.',
];
</script>

<template>
  <div class="page fade-in-up">
    <section class="surface-card hero-card home-hero">
      <div>
        <span class="badge badge-info">Plataforma de resumos para vestibulandos</span>
        <h1 class="section-title">BrainLog organiza seus estudos com clareza e foco em aprovação.</h1>
        <p class="section-subtitle">
          Centralize materiais, acompanhe seu progresso e mantenha uma rotina de revisão inteligente para ENEM e
          vestibulares.
        </p>

        <div class="hero-actions">
          <RouterLink v-if="!isAuthenticated" to="/register" class="btn btn-primary">Criar conta</RouterLink>
          <RouterLink v-if="!isAuthenticated" to="/login" class="btn btn-secondary">Entrar</RouterLink>
          <RouterLink v-else to="/dashboard" class="btn btn-primary">Abrir dashboard</RouterLink>
        </div>
      </div>

      <div class="hero-focus-card">
        <img :src="focoImage" alt="Foco hoje, resultado sempre." />
      </div>
    </section>

    <section class="grid-3">
      <article v-for="item in highlights" :key="item.title" class="surface-card feature-card">
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
      </article>
    </section>

    <section class="surface-card flow-card">
      <span class="badge badge-primary">Como funciona</span>
      <h2>Fluxo simples para manter constância nos estudos</h2>
      <ol>
        <li v-for="step in steps" :key="step">{{ step }}</li>
      </ol>
    </section>

    <p class="footer-note">BrainLog • organização de estudos para vestibular.</p>
  </div>
</template>

<style scoped>
.home-hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
  align-items: center;
}

.hero-actions {
  margin-top: 1.15rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.hero-focus-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 258px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #023f3b;
}

.hero-focus-card img {
  position: absolute;
  inset: -2.5% -9%;
  width: 118%;
  height: 105%;
  display: block;
  object-fit: cover;
}

.feature-card {
  padding: 1rem;
}

.feature-card h2 {
  font-size: 1.05rem;
}

.feature-card p {
  margin-top: 0.52rem;
  color: var(--bl-muted);
  line-height: 1.6;
}

.flow-card {
  padding: 1rem;
  display: grid;
  gap: 0.72rem;
}

.flow-card h2 {
  font-size: 1.2rem;
}

.flow-card ol {
  margin: 0;
  padding-left: 1.2rem;
  display: grid;
  gap: 0.45rem;
  color: var(--bl-muted);
  line-height: 1.55;
}

@media (max-width: 920px) {
  .home-hero {
    grid-template-columns: 1fr;
  }
}
</style>

