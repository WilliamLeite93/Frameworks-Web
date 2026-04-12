<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getSummariesByOwner } from '@/services/summaryService';

const authStore = useAuthStore();
const summaries = ref([]);
const loading = ref(false);

const totalSummaries = computed(() => summaries.value.length);
const reviewedSummaries = computed(() => summaries.value.filter((item) => item.status === 'Revisado').length);
const weekSummaries = computed(() => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return summaries.value.filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length;
});

const completionRate = computed(() => {
  if (!totalSummaries.value) return '0%';
  return `${Math.round((reviewedSummaries.value / totalSummaries.value) * 100)}%`;
});

const recentSummaries = computed(() => {
  return [...summaries.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
});

function statusClass(status) {
  if (status === 'Revisado') return 'revisado';
  if (status === 'Em revisão' || status === 'Em revisao') return 'revisao';
  return 'novo';
}

async function loadSummaries() {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    summaries.value = await getSummariesByOwner(authStore.user.id);
  } finally {
    loading.value = false;
  }
}

onMounted(loadSummaries);
</script>

<template>
  <div class="page fade-in-up">
    <section class="surface-card hero-card">
      <span class="badge badge-primary">Painel do estudante</span>
      <h1 class="section-title">Olá, {{ authStore.userName }}.</h1>
      <p class="section-subtitle">
        Este é seu painel BrainLog para acompanhar resumos, manter consistência e ajustar prioridades de revisão.
      </p>
    </section>

    <section class="grid-3">
      <article class="surface-card stat-card">
        <small>Total de resumos</small>
        <strong>{{ totalSummaries }}</strong>
      </article>

      <article class="surface-card stat-card">
        <small>Revisados</small>
        <strong>{{ reviewedSummaries }}</strong>
      </article>

      <article class="surface-card stat-card">
        <small>Taxa de conclusão</small>
        <strong>{{ completionRate }}</strong>
      </article>
    </section>

    <section class="grid-2">
      <article class="surface-card panel-card">
        <header>
          <h2>Resumos recentes</h2>
          <span class="badge badge-info">Últimos registros</span>
        </header>

        <ul v-if="!loading && recentSummaries.length" class="list-reset summary-list">
          <li v-for="item in recentSummaries" :key="item.id">
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.subject }}</p>
            </div>
            <span class="status" :class="statusClass(item.status)">{{ item.status }}</span>
          </li>
        </ul>
        <p v-else-if="loading" class="empty">Carregando seus resumos...</p>
        <p v-else class="empty">Você ainda não possui resumos cadastrados.</p>
      </article>

      <article class="surface-card panel-card actions">
        <header>
          <h2>Atalhos rápidos</h2>
          <span class="badge badge-warn">Semana atual</span>
        </header>

        <p>
          Nesta semana você adicionou <strong>{{ weekSummaries }}</strong> novo(s) resumo(s). Continue o ritmo para manter
          seu plano atualizado.
        </p>

        <div>
          <RouterLink to="/upload" class="btn btn-primary">Novo upload</RouterLink>
          <RouterLink to="/abstracts" class="btn btn-secondary">Biblioteca</RouterLink>
          <RouterLink to="/evolution" class="btn btn-secondary">Evolução</RouterLink>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.panel-card {
  padding: 1rem;
}

.panel-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
}

.panel-card h2 {
  font-size: 1.1rem;
}

.summary-list {
  display: grid;
  gap: 0.55rem;
}

.summary-list li {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  padding: 0.68rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.7rem;
}

.summary-list strong {
  display: block;
  font-size: 0.92rem;
}

.summary-list p {
  margin-top: 0.22rem;
  font-size: 0.82rem;
  color: var(--bl-muted);
}

.empty {
  color: var(--bl-muted);
}

.actions p {
  color: var(--bl-muted);
  line-height: 1.58;
}

.actions strong {
  color: var(--bl-primary);
}

.actions div {
  margin-top: 0.85rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.52rem;
}
</style>

