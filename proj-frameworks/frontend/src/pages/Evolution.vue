<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getSummariesByOwner } from '@/services/summaryService';
import componenteImage from '@/assets/componente.png';

const authStore = useAuthStore();
const summaries = ref([]);
const loading = ref(false);

const total = computed(() => summaries.value.length);
const reviewed = computed(() => summaries.value.filter((item) => item.status === 'Revisado').length);

const reviewedRateNumber = computed(() => {
  if (!summaries.value.length) return 0;
  return Math.round((reviewed.value / summaries.value.length) * 100);
});

const reviewedRate = computed(() => `${reviewedRateNumber.value}%`);

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
    .map(([subject, count]) => ({
      subject,
      count,
      percent: total.value ? Math.round((count / total.value) * 100) : 0,
    }))
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

const weeklyPoints = computed(() => {
  const labels = ['Sex', 'Sáb', 'Dom', 'Seg', 'Ter', 'Qua', 'Hoje'];
  const today = new Date();

  return labels.map((label, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (labels.length - 1 - index));
    const count = summaries.value.filter((item) => new Date(item.createdAt).toDateString() === date.toDateString()).length;
    const y = 170 - Math.min(count, 2) * 58;
    const x = 48 + index * 70;

    return { label, count, x, y };
  });
});

const chartPath = computed(() => {
  if (!weeklyPoints.value.length) return '';
  return weeklyPoints.value.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
});

const chartAreaPath = computed(() => `${chartPath.value} L 468 190 L 48 190 Z`);

const consistencyDays = computed(() => {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const today = new Date();

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (34 - index));
    const count = summaries.value.filter((item) => new Date(item.createdAt).toDateString() === date.toDateString()).length;
    return {
      id: `${date.toISOString()}-${index}`,
      day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
      level: Math.min(count, 4),
    };
  });
});

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
  <div class="evolution-page fade-in-up">
    <section class="evolution-hero" :style="{ '--hero-bg-image': `url(${componenteImage})` }">
      <div>
        <span class="badge badge-primary">Evolução de estudos</span>
        <h1>Acompanhe seu ritmo de aprendizado.</h1>
        <p>Visualize sua consistência semanal e ajuste seu planejamento para manter avanço contínuo.</p>
      </div>
    </section>

    <section class="evolution-stats">
      <article class="surface-card stat-tile">
        <span class="stat-icon mint">TR</span>
        <div>
          <small>Total de resumos</small>
          <strong>{{ total }}</strong>
          <p>+{{ recentCount }} esta semana</p>
        </div>
      </article>

      <article class="surface-card stat-tile">
        <span class="stat-icon violet">RV</span>
        <div>
          <small>Taxa de revisão</small>
          <strong>{{ reviewedRate }}</strong>
          <p>{{ reviewed }} revisados</p>
        </div>
      </article>

      <article class="surface-card stat-tile">
        <span class="stat-icon amber">7D</span>
        <div>
          <small>Últimos 7 dias</small>
          <strong>{{ recentCount }} novo{{ recentCount === 1 ? '' : 's' }}</strong>
          <p>Melhore sua consistência</p>
        </div>
      </article>

      <article class="surface-card stat-tile">
        <span class="stat-icon blue">TE</span>
        <div>
          <small>Tempo de estudo</small>
          <strong>{{ total ? '0h 30m' : '0h' }}</strong>
          <p>Esta semana</p>
        </div>
      </article>
    </section>

    <section class="analysis-grid">
      <article class="surface-card chart-card">
        <div class="card-header">
          <h2>Resumos criados por dia</h2>
          <button type="button">Últimos 7 dias</button>
        </div>

        <svg viewBox="0 0 520 230" role="img" aria-label="Resumos criados por dia">
          <defs>
            <linearGradient id="evolutionFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#14b8a6" stop-opacity="0" />
            </linearGradient>
          </defs>
          <g class="grid-lines">
            <line x1="42" x2="492" y1="54" y2="54" />
            <line x1="42" x2="492" y1="112" y2="112" />
            <line x1="42" x2="492" y1="170" y2="170" />
          </g>
          <g class="axis-labels">
            <text x="18" y="58">2</text>
            <text x="18" y="116">1</text>
            <text x="18" y="174">0</text>
          </g>
          <path class="chart-area" :d="chartAreaPath" />
          <path class="chart-line" :d="chartPath" />
          <g>
            <circle v-for="point in weeklyPoints" :key="point.label" :cx="point.x" :cy="point.y" r="4.5" />
          </g>
          <g class="day-labels">
            <text v-for="point in weeklyPoints" :key="`${point.label}-label`" :x="point.x - 10" y="212">
              {{ point.label }}
            </text>
          </g>
        </svg>

        <p class="insight-note">Continue assim. Cada resumo te aproxima dos seus objetivos.</p>
      </article>

      <article class="surface-card subject-card">
        <h2>Volume por matéria</h2>
        <div class="subject-content">
          <div class="donut" :style="{ '--value': total ? 100 : 0 }">
            <strong>{{ total }}</strong>
            <span>total</span>
          </div>

          <ul v-if="subjectEvolution.length" class="list-reset subject-list">
            <li v-for="item in subjectEvolution" :key="item.subject">
              <span />
              <strong>{{ item.subject }}</strong>
              <em>{{ item.count }} ({{ item.percent }}%)</em>
            </li>
          </ul>
          <p v-else class="empty">Sem dados de matérias por enquanto.</p>
        </div>
        <RouterLink to="/abstracts" class="outline-link">Ver todas as matérias ></RouterLink>
      </article>
    </section>

    <section class="analysis-grid lower">
      <article class="surface-card consistency-card">
        <h2>Sua consistência</h2>
        <div class="heatmap">
          <span v-for="item in consistencyDays" :key="item.id" :class="`level-${item.level}`" />
        </div>
        <div class="heatmap-legend">
          <small>Menos</small>
          <i class="level-0" />
          <i class="level-1" />
          <i class="level-2" />
          <i class="level-3" />
          <i class="level-4" />
          <small>Mais</small>
        </div>
      </article>

      <article class="surface-card month-card">
        <div class="card-header">
          <h2>Evolução mensal</h2>
          <button type="button">{{ new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }}</button>
        </div>

        <div class="month-stats">
          <div>
            <small>Resumos</small>
            <strong>{{ total }}</strong>
            <p>+{{ recentCount }} vs mês anterior</p>
          </div>
          <div>
            <small>Taxa de revisão</small>
            <strong>{{ reviewedRate }}</strong>
            <p>{{ reviewedRate }} vs mês anterior</p>
          </div>
          <div>
            <small>Tempo de estudo</small>
            <strong>{{ total ? '0h 30m' : '0h' }}</strong>
            <p>+0h 30m vs mês anterior</p>
          </div>
        </div>

        <div class="bars">
          <div v-for="item in monthlyEvolution" :key="item.key" class="bar-item">
            <span class="bar" :style="{ height: `${(item.count / maxMonthlyCount) * 100}%` }" />
            <small>{{ item.label }}</small>
            <strong>{{ item.count }}</strong>
          </div>
        </div>

        <p class="gold-tip">Dica de ouro: revise seus resumos regularmente para fixar melhor o conteúdo.</p>
      </article>
    </section>

    <p v-if="loading" class="footer-note">Atualizando indicadores...</p>
  </div>
</template>

<style scoped>
.evolution-page {
  display: grid;
  gap: 1rem;
}

.evolution-hero {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  min-height: 170px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background:
    linear-gradient(90deg, rgba(239, 252, 249, 0.98) 0%, rgba(239, 252, 249, 0.9) 44%, rgba(239, 252, 249, 0.2) 72%),
    var(--hero-bg-image) center / cover no-repeat,
    radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.1), transparent 34%),
    linear-gradient(145deg, #effcf9, #ffffff);
  box-shadow: var(--shadow-soft);
}

:global(body.theme-dark) .evolution-hero {
  background:
    linear-gradient(90deg, rgba(5, 13, 26, 0.98) 0%, rgba(7, 17, 31, 0.92) 48%, rgba(7, 17, 31, 0.24) 76%),
    var(--hero-bg-image) center / cover no-repeat,
    radial-gradient(circle at 100% 0%, rgba(18, 214, 196, 0.12), transparent 34%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.98), rgba(5, 13, 26, 0.96));
}

.evolution-hero h1 {
  margin-top: 0.55rem;
  font-size: clamp(1.9rem, 3vw, 2.45rem);
  line-height: 1.1;
}

.evolution-hero p {
  margin-top: 0.85rem;
  color: var(--bl-muted);
  line-height: 1.65;
  max-width: 58ch;
}

.evolution-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.82rem;
}

.stat-tile {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.stat-icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 0.78rem;
  font-weight: 900;
}

.mint {
  background: #ccfbf1;
  color: #0f766e;
}

.violet {
  background: #ede9fe;
  color: #7c3aed;
}

.amber {
  background: #fef3c7;
  color: #d97706;
}

.blue {
  background: #dbeafe;
  color: #2563eb;
}

.stat-tile small {
  color: var(--bl-muted);
  font-weight: 800;
}

.stat-tile strong {
  display: block;
  margin-top: 0.2rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.55rem;
}

.stat-tile p {
  margin-top: 0.28rem;
  color: var(--bl-muted);
  font-size: 0.82rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 1fr);
  gap: 0.9rem;
}

.analysis-grid.lower {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 1fr);
}

.chart-card,
.subject-card,
.consistency-card,
.month-card {
  padding: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.card-header h2,
.subject-card h2,
.consistency-card h2 {
  font-size: 1rem;
}

.card-header button {
  border: 1px solid var(--bl-border);
  border-radius: 10px;
  padding: 0.42rem 0.68rem;
  background: var(--bl-surface);
  color: var(--bl-muted);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: capitalize;
}

:global(body.theme-dark) .card-header button {
  color: #cbd5e1;
}

.chart-card svg {
  width: 100%;
  height: 250px;
  display: block;
}

.grid-lines line {
  stroke: var(--bl-border);
}

.axis-labels text,
.day-labels text {
  fill: var(--bl-muted);
  font-size: 11px;
  font-weight: 800;
}

.chart-area {
  fill: url(#evolutionFill);
}

.chart-line {
  fill: none;
  stroke: var(--bl-primary);
  stroke-width: 3;
}

.chart-card circle {
  fill: var(--bl-primary);
  stroke: var(--bl-surface);
  stroke-width: 2;
}

.insight-note,
.gold-tip {
  margin-top: 0.62rem;
  border-radius: var(--radius-sm);
  padding: 0.66rem 0.78rem;
  background: var(--bl-primary-soft);
  color: var(--bl-primary);
  font-size: 0.82rem;
  font-weight: 800;
}

:global(body.theme-dark) .insight-note,
:global(body.theme-dark) .gold-tip {
  border: 1px solid rgba(18, 214, 196, 0.22);
  background: rgba(18, 214, 196, 0.1);
  color: var(--bl-primary);
}

.subject-content {
  min-height: 230px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1.2rem;
}

.donut {
  width: 10.5rem;
  height: 10.5rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--bl-primary) 0 calc(var(--value) * 1%), var(--bl-border) 0 100%);
  position: relative;
}

.donut::after {
  content: '';
  position: absolute;
  inset: 1.45rem;
  border-radius: inherit;
  background: var(--bl-surface);
}

.donut strong,
.donut span {
  position: relative;
  z-index: 1;
}

.donut strong {
  align-self: end;
  font-size: 1.5rem;
}

.donut span {
  align-self: start;
  color: var(--bl-muted);
}

.subject-list {
  display: grid;
  gap: 0.72rem;
}

.subject-list li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
}

.subject-list li span {
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 999px;
  background: var(--bl-primary);
}

.subject-list em {
  color: var(--bl-muted);
  font-style: normal;
  font-weight: 800;
}

.outline-link {
  display: inline-flex;
  margin-top: 0.86rem;
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  padding: 0.58rem 1rem;
  color: var(--bl-primary);
  font-weight: 900;
}

:global(body.theme-dark) .outline-link {
  color: var(--bl-primary);
}

.heatmap {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.3rem;
}

.heatmap span,
.heatmap-legend i {
  height: 1.2rem;
  border-radius: 5px;
}

.level-0 {
  background: #f1f5f9;
}

:global(body.theme-dark) .level-0 {
  background: rgba(148, 163, 184, 0.14);
}

.level-1 {
  background: #d9f8ef;
}

.level-2 {
  background: #9debd5;
}

.level-3 {
  background: #48cfad;
}

.level-4 {
  background: var(--bl-primary);
}

.heatmap-legend {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.48rem;
}

.heatmap-legend i {
  width: 1.6rem;
}

.heatmap-legend small {
  color: var(--bl-muted);
  font-size: 0.76rem;
  font-weight: 800;
}

.month-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.month-stats div {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.78rem;
}

.month-stats small {
  color: var(--bl-muted);
  font-weight: 800;
}

.month-stats strong {
  display: block;
  margin-top: 0.26rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.25rem;
}

.month-stats p {
  margin-top: 0.25rem;
  color: var(--bl-primary);
  font-size: 0.76rem;
  font-weight: 800;
}

:global(body.theme-dark) .month-stats p {
  color: var(--bl-primary);
}

.bars {
  margin-top: 1rem;
  min-height: 120px;
  display: flex;
  align-items: end;
  gap: 0.55rem;
}

.bar-item {
  flex: 1;
  display: grid;
  justify-items: center;
  gap: 0.24rem;
}

.bar {
  width: 100%;
  max-width: 42px;
  min-height: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--bl-secondary), var(--bl-primary));
}

.bar-item small {
  color: var(--bl-muted);
  font-size: 0.72rem;
  text-transform: capitalize;
}

.bar-item strong {
  font-size: 0.76rem;
}

.empty {
  color: var(--bl-muted);
}

@media (max-width: 1100px) {
  .evolution-stats,
  .analysis-grid,
  .analysis-grid.lower {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chart-card,
  .consistency-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .evolution-hero {
    align-items: stretch;
    flex-direction: column;
    background:
      linear-gradient(180deg, rgba(239, 252, 249, 0.98) 0%, rgba(239, 252, 249, 0.88) 58%, rgba(239, 252, 249, 0.24) 100%),
      var(--hero-bg-image) center / cover no-repeat,
      radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.1), transparent 34%),
      linear-gradient(145deg, #effcf9, #ffffff);
  }

  :global(body.theme-dark) .evolution-hero {
    background:
      linear-gradient(180deg, rgba(5, 13, 26, 0.98) 0%, rgba(7, 17, 31, 0.92) 60%, rgba(7, 17, 31, 0.28) 100%),
      var(--hero-bg-image) center / cover no-repeat,
      radial-gradient(circle at 100% 0%, rgba(18, 214, 196, 0.12), transparent 34%),
      linear-gradient(145deg, rgba(9, 20, 34, 0.98), rgba(5, 13, 26, 0.96));
  }

  .evolution-stats,
  .analysis-grid,
  .analysis-grid.lower,
  .subject-content,
  .month-stats {
    grid-template-columns: 1fr;
  }
}
</style>
