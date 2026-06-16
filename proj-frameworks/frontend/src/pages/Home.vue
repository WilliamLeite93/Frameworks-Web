<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import bgHomeImage from '@/assets/bg-home.png';

const authStore = useAuthStore();
const userName = computed(() => authStore.userName || 'Gabriel');

const stats = [
  { label: 'Resumos salvos', value: '120+', detail: '26 esta semana', tone: 'mint', icon: 'RS' },
  { label: 'Disciplinas', value: '14', detail: '2 ativas hoje', tone: 'violet', icon: 'DI' },
  { label: 'Horas estudadas', value: '32h', detail: '+5h vs semana passada', tone: 'amber', icon: 'HE' },
  { label: 'Ritmo semanal', value: '5 dias', detail: 'Meta: 6 dias', tone: 'blue', icon: 'RW' },
];

const weekData = [
  { day: 'Seg', hours: 1.4, x: 6, y: 78 },
  { day: 'Ter', hours: 2.4, x: 22, y: 66 },
  { day: 'Qua', hours: 5.8, x: 43, y: 36 },
  { day: 'Qui', hours: 7.2, x: 54, y: 25 },
  { day: 'Sex', hours: 3.3, x: 70, y: 58 },
  { day: 'Sab', hours: 6.1, x: 82, y: 36 },
  { day: 'Dom', hours: 3.8, x: 96, y: 55 },
];

const nextSteps = [
  { title: 'Revisar Matemática', subtitle: 'Funções e equações', time: 'Hoje - 19:00', tone: 'mint', icon: 'MA' },
  { title: 'Revisar Resumo', subtitle: 'História do Brasil', time: 'Amanhã - 10:00', tone: 'violet', icon: 'HI' },
  { title: 'Questões', subtitle: 'Física - Mecânica', time: 'Amanhã - 14:00', tone: 'amber', icon: 'FI' },
];

const subjects = [
  { name: 'Matemática', detail: '6 resumos - 4h estudadas', progress: 75, tone: 'blue' },
  { name: 'Física', detail: '4 resumos - 3h estudadas', progress: 60, tone: 'violet' },
  { name: 'História', detail: '3 resumos - 2h estudadas', progress: 40, tone: 'amber' },
  { name: 'Biologia', detail: '2 resumos - 1h estudada', progress: 25, tone: 'mint' },
];

const activities = [
  { title: 'Resumo salvo', detail: 'Funções do 1º grau - Matemática', time: 'Há 2h', tone: 'mint' },
  { title: 'Arquivo enviado', detail: 'Apostila Física - Mecânica.pdf', time: 'Há 4h', tone: 'rose' },
  { title: 'Questões concluídas', detail: '20 questões de Física', time: 'Há 6h', tone: 'violet' },
  { title: 'Meta semanal atualizada', detail: 'Estudar 6 dias por semana', time: 'Há 1d', tone: 'mint' },
];

const goalDays = [
  { day: 'Seg', done: true },
  { day: 'Ter', done: true },
  { day: 'Qua', done: true },
  { day: 'Qui', done: true },
  { day: 'Sex', done: true },
  { day: 'Sáb', done: false },
  { day: 'Dom', done: false },
];
</script>

<template>
  <div class="home-dashboard fade-in-up" :style="{ '--home-bg-image': `url(${bgHomeImage})` }">
    <header class="home-topbar">
      <div>
        <h1>Bom dia, {{ userName }}!</h1>
        <p>Pronto para mais um dia de foco e conquistas?</p>
      </div>

      <div class="topbar-actions">
        <div class="streak-pill">
          <span class="streak-mark">7</span>
          <div>
            <strong>7 dias</strong>
            <small>Sequência atual</small>
          </div>
        </div>
        <button type="button" class="icon-button" aria-label="Notificações">3</button>
        <RouterLink to="/upload" class="btn btn-primary">+ Nova tarefa</RouterLink>
      </div>
    </header>

    <section class="stats-grid" aria-label="Resumo dos estudos">
      <article v-for="stat in stats" :key="stat.label" class="surface-card stat-tile">
        <span class="tile-icon" :class="stat.tone">{{ stat.icon }}</span>
        <div>
          <small>{{ stat.label }}</small>
          <strong>{{ stat.value }}</strong>
          <p>{{ stat.detail }}</p>
          <span v-if="stat.label === 'Ritmo semanal'" class="mini-progress"><i /></span>
        </div>
      </article>
    </section>

    <section class="dashboard-main">
      <article class="surface-card weekly-card">
        <div class="card-header">
          <h2>Seus estudos esta semana</h2>
          <button type="button" class="filter-button">Esta semana</button>
        </div>

        <div class="chart-wrap" aria-label="Gráfico de horas estudadas na semana">
          <svg viewBox="0 0 520 230" role="img" aria-labelledby="weekly-title">
            <title id="weekly-title">Horas estudadas por dia</title>
            <defs>
              <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#14b8a6" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#14b8a6" stop-opacity="0" />
              </linearGradient>
            </defs>
            <g class="grid-lines">
              <line x1="44" x2="500" y1="36" y2="36" />
              <line x1="44" x2="500" y1="82" y2="82" />
              <line x1="44" x2="500" y1="128" y2="128" />
              <line x1="44" x2="500" y1="174" y2="174" />
            </g>
            <g class="axis-labels">
              <text x="10" y="40">8h</text>
              <text x="10" y="86">6h</text>
              <text x="10" y="132">4h</text>
              <text x="10" y="178">2h</text>
              <text x="10" y="214">0h</text>
            </g>
            <path
              class="chart-area"
              d="M74 178 C112 140, 126 150, 162 152 C202 154, 206 66, 250 66 C284 66, 286 80, 314 50 C340 90, 334 130, 378 140 C416 144, 416 72, 438 82 C466 96, 478 120, 500 132 L500 210 L74 210 Z"
            />
            <path
              class="chart-line"
              d="M74 178 C112 140, 126 150, 162 152 C202 154, 206 66, 250 66 C284 66, 286 80, 314 50 C340 90, 334 130, 378 140 C416 144, 416 72, 438 82 C466 96, 478 120, 500 132"
            />
            <g>
              <circle v-for="point in weekData" :key="point.day" :cx="point.x * 4.44 + 47" :cy="point.y" r="4.5" />
            </g>
            <g class="day-labels">
              <text v-for="point in weekData" :key="`${point.day}-label`" :x="point.x * 4.44 + 42" y="222">
                {{ point.day }}
              </text>
            </g>
          </svg>
        </div>

        <p class="insight-note">Você está acima da sua média. Continue assim!</p>
      </article>

      <article class="surface-card next-card">
        <div class="card-header">
          <h2>Próximos passos</h2>
        </div>

        <div class="step-list">
          <RouterLink v-for="step in nextSteps" :key="step.title" to="/evolution" class="step-row">
            <span class="tile-icon compact" :class="step.tone">{{ step.icon }}</span>
            <span>
              <strong>{{ step.title }}</strong>
              <small>{{ step.subtitle }}</small>
              <em>{{ step.time }}</em>
            </span>
            <b>></b>
          </RouterLink>
        </div>

        <RouterLink to="/evolution" class="text-link">Ver agenda completa ></RouterLink>
      </article>

      <aside class="focus-panel">
        <span>FO</span>
        <h2>Foco hoje, resultado sempre.</h2>
        <p>Disciplina é o que transforma planos em conquistas.</p>
      </aside>
    </section>

    <section class="lower-grid">
      <article class="surface-card focus-subjects">
        <div class="card-header">
          <h2>Disciplinas em foco</h2>
          <RouterLink to="/abstracts">Ver todas</RouterLink>
        </div>

        <div class="subject-list">
          <div v-for="subject in subjects" :key="subject.name" class="subject-row">
            <span class="tile-icon compact" :class="subject.tone">{{ subject.name.slice(0, 2).toUpperCase() }}</span>
            <div>
              <strong>{{ subject.name }}</strong>
              <small>{{ subject.detail }}</small>
            </div>
            <span class="progress-line"><i :style="{ width: `${subject.progress}%` }" /></span>
            <b>{{ subject.progress }}%</b>
          </div>
        </div>
      </article>

      <article class="surface-card activity-card">
        <div class="card-header">
          <h2>Atividade recente</h2>
          <RouterLink to="/dashboard">Ver todas</RouterLink>
        </div>

        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.title" class="activity-row">
            <span class="activity-dot" :class="activity.tone" />
            <div>
              <strong>{{ activity.title }}</strong>
              <small>{{ activity.detail }}</small>
            </div>
            <time>{{ activity.time }}</time>
          </div>
        </div>
      </article>

      <article class="surface-card goals-card">
        <div class="card-header">
          <h2>Metas desta semana</h2>
          <button type="button">Editar</button>
        </div>

        <div class="goal-content">
          <div class="goal-ring">
            <span>83%</span>
          </div>
          <div>
            <strong>Meta: 6 dias de estudo</strong>
            <p>5 de 6 dias concluídos</p>
            <span class="progress-line wide"><i style="width: 83%" /></span>
          </div>
        </div>

        <div class="goal-days">
          <span v-for="item in goalDays" :key="item.day" :class="{ done: item.done }">
            <i>{{ item.done ? '✓' : '' }}</i>
            <small>{{ item.day }}</small>
          </span>
        </div>
      </article>
    </section>

    <footer class="home-footer">
      <p>BrainLog - organização de estudos para vestibulares</p>
    </footer>
  </div>
</template>

<style scoped>
.home-dashboard {
  min-height: calc(100vh - 4.4rem);
  margin: -0.6rem;
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: grid;
  gap: 1rem;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.88), rgba(248, 250, 252, 0.76)),
    var(--home-bg-image) center / cover no-repeat;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48);
}

:global(body.theme-dark) .home-dashboard {
  background:
    linear-gradient(180deg, rgba(2, 6, 23, 0.78), rgba(15, 23, 42, 0.86)),
    var(--home-bg-image) center / cover no-repeat;
  box-shadow: inset 0 1px 0 rgba(148, 163, 184, 0.12);
}

.home-topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.home-topbar h1 {
  font-size: clamp(1.75rem, 3vw, 2.45rem);
  line-height: 1.1;
}

.home-topbar p {
  margin-top: 0.44rem;
  color: var(--bl-muted);
  font-weight: 700;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.streak-pill,
.icon-button {
  border: 1px solid var(--bl-border);
  background: var(--bl-surface);
  box-shadow: var(--shadow-soft);
}

.streak-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  border-radius: var(--radius-lg);
  padding: 0.52rem 0.8rem;
}

.streak-mark {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--bl-accent-soft);
  color: #b45309;
  font-weight: 900;
}

:global(body.theme-dark) .streak-mark {
  color: #fcd34d;
}

.streak-pill strong,
.streak-pill small {
  display: block;
}

.streak-pill small {
  color: var(--bl-muted);
  font-size: 0.75rem;
}

.icon-button {
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 14px;
  color: var(--bl-primary);
  font-weight: 900;
}

:global(body.theme-dark) .icon-button {
  color: #5eead4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.stat-tile {
  min-height: 120px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.tile-icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 0.78rem;
  font-weight: 900;
}

.tile-icon.compact {
  width: 2.55rem;
  height: 2.55rem;
  font-size: 0.7rem;
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

.rose {
  background: #fee2e2;
  color: #dc2626;
}

.stat-tile small {
  color: var(--bl-muted);
  font-weight: 800;
}

.stat-tile strong {
  display: block;
  margin-top: 0.22rem;
  font-family: 'Sora', sans-serif;
  font-size: 1.65rem;
}

.stat-tile p {
  margin-top: 0.35rem;
  color: var(--bl-primary);
  font-size: 0.82rem;
  font-weight: 800;
}

:global(body.theme-dark) .stat-tile p {
  color: #5eead4;
}

.mini-progress,
.progress-line {
  display: block;
  overflow: hidden;
  height: 0.26rem;
  border-radius: 999px;
  background: var(--bl-border);
}

.mini-progress {
  width: 8rem;
  margin-top: 0.62rem;
}

.mini-progress i,
.progress-line i {
  display: block;
  width: 82%;
  height: 100%;
  border-radius: inherit;
  background: var(--bl-primary);
}

.dashboard-main {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.95fr) minmax(230px, 0.78fr);
  gap: 0.9rem;
}

.weekly-card,
.next-card,
.focus-subjects,
.activity-card,
.goals-card {
  padding: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-bottom: 0.85rem;
}

.card-header h2 {
  font-size: 1rem;
}

.card-header a,
.card-header button,
.filter-button,
.text-link {
  border: 0;
  background: transparent;
  color: var(--bl-primary);
  font-size: 0.78rem;
  font-weight: 900;
}

.filter-button {
  border: 1px solid var(--bl-border);
  border-radius: 10px;
  padding: 0.42rem 0.68rem;
  color: var(--bl-muted);
  background: var(--bl-surface);
}

:global(body.theme-dark) .card-header a,
:global(body.theme-dark) .card-header button,
:global(body.theme-dark) .text-link {
  color: #5eead4;
}

:global(body.theme-dark) .filter-button {
  color: #cbd5e1;
}

.chart-wrap {
  min-height: 250px;
}

.chart-wrap svg {
  width: 100%;
  height: 250px;
  display: block;
}

.grid-lines line {
  stroke: var(--bl-border);
  stroke-width: 1;
}

.axis-labels text,
.day-labels text {
  fill: var(--bl-muted);
  font-size: 11px;
  font-weight: 800;
}

.chart-area {
  fill: url(#chartFill);
}

.chart-line {
  fill: none;
  stroke: var(--bl-primary);
  stroke-width: 3;
  stroke-linecap: round;
}

.chart-wrap circle {
  fill: var(--bl-primary);
  stroke: var(--bl-surface);
  stroke-width: 2;
}

.insight-note {
  margin-top: 0.4rem;
  border: 1px solid rgba(15, 118, 110, 0.25);
  border-radius: var(--radius-sm);
  padding: 0.56rem 0.72rem;
  background: var(--bl-primary-soft);
  color: var(--bl-primary);
  font-size: 0.82rem;
  font-weight: 800;
}

:global(body.theme-dark) .insight-note {
  border-color: rgba(45, 212, 191, 0.24);
  color: #5eead4;
}

.step-list,
.subject-list,
.activity-list {
  display: grid;
  gap: 0.58rem;
}

.step-row,
.subject-row,
.activity-row {
  display: grid;
  align-items: center;
  gap: 0.65rem;
}

.step-row {
  grid-template-columns: auto minmax(0, 1fr) auto;
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.62rem;
}

.step-row:hover {
  border-color: rgba(15, 118, 110, 0.35);
  background: rgba(204, 251, 241, 0.45);
}

:global(body.theme-dark) .step-row:hover {
  border-color: rgba(94, 234, 212, 0.38);
  background: rgba(20, 184, 166, 0.16);
}

.step-row strong,
.step-row small,
.step-row em,
.subject-row strong,
.subject-row small,
.activity-row strong,
.activity-row small {
  display: block;
}

.step-row strong,
.subject-row strong,
.activity-row strong {
  font-size: 0.85rem;
}

.step-row small,
.subject-row small,
.activity-row small,
.activity-row time {
  color: var(--bl-muted);
  font-size: 0.76rem;
  font-style: normal;
}

.step-row em {
  margin-top: 0.12rem;
  color: var(--bl-muted);
  font-size: 0.76rem;
}

.text-link {
  display: inline-flex;
  margin-top: 0.82rem;
}

.focus-panel {
  min-height: 290px;
  border-radius: var(--radius-lg);
  padding: 2.2rem;
  display: grid;
  align-content: center;
  gap: 1.05rem;
  color: #f8fafc;
  background:
    radial-gradient(circle at 26% 22%, rgba(45, 212, 191, 0.42), transparent 18%),
    radial-gradient(circle at 100% 78%, rgba(6, 182, 212, 0.22), transparent 28%),
    linear-gradient(145deg, #064e49, #042f2e);
  box-shadow: var(--shadow-strong);
}

.focus-panel span {
  width: 3.7rem;
  height: 3.7rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(45, 212, 191, 0.3);
  font-weight: 900;
}

.focus-panel h2 {
  max-width: 12rem;
  font-size: 1.35rem;
}

.focus-panel p {
  max-width: 14rem;
  color: rgba(248, 250, 252, 0.82);
  line-height: 1.6;
}

.lower-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(300px, 1.05fr);
  gap: 0.9rem;
}

.subject-row {
  grid-template-columns: auto minmax(0, 1fr) minmax(80px, 120px) 42px;
}

.progress-line.wide {
  width: min(260px, 100%);
  margin-top: 0.72rem;
}

.activity-row {
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.activity-dot {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
}

.goals-card {
  display: grid;
  gap: 0.9rem;
}

.goal-content {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 1rem;
}

.goal-ring {
  width: 5.2rem;
  height: 5.2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: conic-gradient(var(--bl-primary) 0 83%, var(--bl-border) 83% 100%);
  position: relative;
}

.goal-ring::after {
  content: '';
  position: absolute;
  inset: 0.58rem;
  border-radius: inherit;
  background: var(--bl-surface);
}

.goal-ring span {
  position: relative;
  z-index: 1;
  font-weight: 900;
}

.goal-content strong,
.goal-content p {
  display: block;
}

.goal-content p {
  margin-top: 0.25rem;
  color: var(--bl-muted);
  font-size: 0.84rem;
}

.goal-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.42rem;
}

.goal-days span {
  display: grid;
  justify-items: center;
  gap: 0.36rem;
}

.goal-days i {
  width: 1.85rem;
  height: 1.85rem;
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: var(--bl-primary);
  font-style: normal;
  font-weight: 900;
}

:global(body.theme-dark) .goal-days i {
  color: #5eead4;
}

.goal-days .done i {
  border-color: transparent;
  background: var(--bl-primary-soft);
}

.goal-days small {
  color: var(--bl-muted);
  font-size: 0.72rem;
  font-weight: 800;
}

.home-footer {
  text-align: center;
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .stats-grid,
  .dashboard-main,
  .lower-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .weekly-card,
  .goals-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .home-dashboard {
    min-height: calc(100vh - 3rem);
    margin: -0.3rem;
    padding: 0.8rem;
    background:
      linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(248, 250, 252, 0.82)),
      var(--home-bg-image) center top / cover no-repeat;
  }

  :global(body.theme-dark) .home-dashboard {
    background:
      linear-gradient(180deg, rgba(2, 6, 23, 0.82), rgba(15, 23, 42, 0.9)),
      var(--home-bg-image) center top / cover no-repeat;
  }

  .home-topbar,
  .topbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-grid,
  .dashboard-main,
  .lower-grid {
    grid-template-columns: 1fr;
  }

  .stat-tile,
  .goal-content {
    align-items: start;
  }

  .subject-row {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .subject-row .progress-line,
  .subject-row b {
    grid-column: 2;
  }
}
</style>
