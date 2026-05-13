<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getSummariesByOwner } from '@/services/summaryService';

const authStore = useAuthStore();
const summaries = ref([]);
const loading = ref(false);

const total = computed(() => summaries.value.length);

const reviewedRate = computed(() => {
  if (!summaries.value.length) return '0%';
  const reviewed = summaries.value.filter((item) => item.status === 'Revisado').length;
  return `${Math.round((reviewed / summaries.value.length) * 100)}%`;
});

const recentCount = computed(() => {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return summaries.value.filter((item) => new Date(item.createdAt).getTime() >= weekAgo).length;
});

const subjectEvolution = computed(() => {
  const map = new Map();

  summaries.value.forEach((item) => {
    map.set(item.subject, (map.get(item.subject) || 0) + 1);
  });

  return [...map.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);
});

const monthlyEvolution = computed(() => {
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    months.push({
      key,
      label: date.toLocaleDateString('pt-BR', { month: 'short' }),
      count: 0,
    });
  }

  summaries.value.forEach((item) => {
    const date = new Date(item.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const month = months.find((entry) => entry.key === key);
    if (month) month.count += 1;
  });

  return months;
});

const maxMonthlyCount = computed(() => Math.max(...monthlyEvolution.value.map((item) => item.count), 1));

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
      <span class="badge badge-primary">Evolução de estudos</span>
      <h1 class="section-title">Acompanhe seu ritmo de aprendizagem.</h1>
      <p class="section-subtitle">
        Visualize sua consistência semanal e ajuste seu planejamento para manter avanço contínuo.
      </p>
    </section>

    <section class="grid-3">
      <article class="surface-card stat-card">
        <small>Total de resumos</small>
        <strong>{{ total }}</strong>
      </article>

      <article class="surface-card stat-card">
        <small>Taxa de revisão</small>
        <strong>{{ reviewedRate }}</strong>
      </article>

      <article class="surface-card stat-card">
        <small>Últimos 7 dias</small>
        <strong>{{ recentCount }} novos</strong>
      </article>
    </section>

    <section class="grid-2">
      <article class="surface-card panel-card">
        <h2>Volume por matéria</h2>

        <ul v-if="subjectEvolution.length" class="list-reset evolution-list">
          <li v-for="item in subjectEvolution" :key="item.subject">
            <div>
              <strong>{{ item.subject }}</strong>
              <small>{{ item.count }} resumo(s)</small>
            </div>
            <span>{{ item.count }}</span>
          </li>
        </ul>

        <p v-else class="empty">Sem dados de matérias por enquanto.</p>
      </article>

      <article class="surface-card panel-card">
        <h2>Resumo mensal</h2>

        <div v-if="monthlyEvolution.length" class="bars">
          <div v-for="item in monthlyEvolution" :key="item.key" class="bar-item">
            <span class="bar" :style="{ height: `${(item.count / maxMonthlyCount) * 100}%` }" />
            <small>{{ item.label }}</small>
            <strong>{{ item.count }}</strong>
          </div>
        </div>

        <p v-else class="empty">Sem dados mensais.</p>
      </article>
    </section>

    <p v-if="loading" class="footer-note">Atualizando indicadores...</p>
  </div>
</template>

<style scoped>
.panel-card {
  padding: 1rem;
}

.panel-card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.76rem;
}

.evolution-list {
  display: grid;
  gap: 0.54rem;
}

.evolution-list li {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  padding: 0.66rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evolution-list strong {
  display: block;
  font-size: 0.89rem;
}

.evolution-list small {
  color: var(--bl-muted);
  font-size: 0.76rem;
}

.evolution-list span {
  color: var(--bl-primary);
  font-weight: 800;
}

.bars {
  display: flex;
  align-items: end;
  gap: 0.55rem;
  min-height: 210px;
}

.bar-item {
  flex: 1;
  display: grid;
  gap: 0.3rem;
  justify-items: center;
}

.bar {
  width: 100%;
  max-width: 58px;
  min-height: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--bl-secondary), var(--bl-primary));
}

.bar-item small {
  text-transform: capitalize;
  color: var(--bl-muted);
  font-size: 0.74rem;
}

.bar-item strong {
  font-size: 0.79rem;
}

.empty {
  color: var(--bl-muted);
}
</style>

