<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getSummariesByOwner } from '@/services/summaryService';
import bgHomeImage from '@/assets/bg-home.png';
import calendarioImage from '@/assets/calendario.png';
import despertadorImage from '@/assets/despertador.png';
import disciplinaImage from '@/assets/disciplina.png';
import focoImage from '@/assets/foco.png';
import livrosImage from '@/assets/livros.png';
import ritmoImage from '@/assets/ritmo.png';

const authStore = useAuthStore();
const userName = computed(() => authStore.userName || 'Estudante');
const summaries = ref([]);
const loading = ref(false);
const showNotifications = ref(false);

const weekLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const tones = ['blue', 'violet', 'amber', 'mint', 'rose'];
const weekDaysTotal = 7;

const weekStart = computed(() => getWeekStart(new Date()));
const weekSummaries = computed(() => summaries.value.filter((item) => new Date(item.createdAt).getTime() >= weekStart.value.getTime()));
const todaySummaries = computed(() => summaries.value.filter((item) => isSameDay(new Date(item.createdAt), new Date())));
const totalFiles = computed(() => summaries.value.reduce((total, item) => total + (item.files?.length || 0), 0));
const weekFileCount = computed(() => weekSummaries.value.reduce((total, item) => total + (item.files?.length || 0), 0));
const uniqueSubjects = computed(() => new Set(summaries.value.map((item) => item.subject).filter(Boolean)));
const activeWeekDays = computed(() => new Set(weekSummaries.value.map((item) => new Date(item.createdAt).toDateString())));
const weeklyProgress = computed(() => Math.round((activeWeekDays.value.size / weekDaysTotal) * 100));
const dueReminders = computed(() => {
  const now = Date.now();
  return summaries.value.filter((item) => item.reviewReminderAt && new Date(item.reviewReminderAt).getTime() <= now);
});
const pendingReviews = computed(() => summaries.value.filter((item) => item.status !== 'Revisado'));
const notificationCount = computed(() => new Set([...dueReminders.value, ...pendingReviews.value].map((item) => item.id)).size);
const notifications = computed(() => {
  const seen = new Set();
  const items = [];

  dueReminders.value.forEach((summary) => {
    seen.add(summary.id);
    items.push({
      id: `reminder-${summary.id}`,
      title: 'Revisão agendada',
      detail: summary.title,
      meta: summary.subject,
      to: `/abstracts/${summary.id}`,
      tone: 'amber',
    });
  });

  pendingReviews.value.forEach((summary) => {
    if (seen.has(summary.id)) return;
    items.push({
      id: `pending-${summary.id}`,
      title: 'Resumo pendente',
      detail: summary.title,
      meta: summary.status || 'Novo',
      to: `/abstracts/${summary.id}`,
      tone: 'mint',
    });
  });

  return items.slice(0, 5);
});

const streakDays = computed(() => {
  const activeDays = new Set(summaries.value.map((item) => new Date(item.createdAt).toDateString()));
  const cursor = new Date();
  let streak = 0;

  while (activeDays.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
});

const stats = computed(() => [
  {
    label: 'Resumos salvos',
    value: String(summaries.value.length),
    detail: `${weekSummaries.value.length} ${weekSummaries.value.length === 1 ? 'esta semana' : 'esta semana'}`,
    tone: 'mint',
    icon: 'RS',
    image: livrosImage,
  },
  {
    label: 'Disciplinas',
    value: String(uniqueSubjects.value.size),
    detail: `${todaySummaries.value.length} ${todaySummaries.value.length === 1 ? 'resumo hoje' : 'resumos hoje'}`,
    tone: 'violet',
    icon: 'DI',
    image: disciplinaImage,
  },
  {
    label: 'Anexos enviados',
    value: String(totalFiles.value),
    detail: `${weekFileCount.value} ${weekFileCount.value === 1 ? 'novo esta semana' : 'novos esta semana'}`,
    tone: 'amber',
    icon: 'AN',
    image: despertadorImage,
  },
  {
    label: 'Ritmo semanal',
    value: `${activeWeekDays.value.size} ${activeWeekDays.value.size === 1 ? 'dia' : 'dias'}`,
    detail: 'Semana atual',
    tone: 'blue',
    icon: 'RW',
    image: ritmoImage,
    progress: weeklyProgress.value,
  },
]);

const summariesBySubject = computed(() => {
  const grouped = new Map();

  summaries.value.forEach((summary) => {
    const subject = summary.subject || 'Sem matéria';
    const current = grouped.get(subject) || { name: subject, summaries: 0, files: 0 };
    current.summaries += 1;
    current.files += summary.files?.length || 0;
    grouped.set(subject, current);
  });

  return [...grouped.values()].sort((a, b) => b.summaries - a.summaries);
});

const subjects = computed(() => {
  const max = Math.max(1, ...summariesBySubject.value.map((item) => item.summaries));

  return summariesBySubject.value.slice(0, 4).map((subject, index) => ({
    name: subject.name,
    detail: `${subject.summaries} ${subject.summaries === 1 ? 'resumo' : 'resumos'} - ${subject.files} ${subject.files === 1 ? 'anexo' : 'anexos'}`,
    progress: Math.round((subject.summaries / max) * 100),
    tone: tones[index % tones.length],
  }));
});

const weekData = computed(() => {
  const start = new Date(weekStart.value);
  const maxCount = Math.max(4, ...weekLabels.map((_, index) => countSummariesOn(addDays(start, index))));

  return weekLabels.map((day, index) => {
    const count = countSummariesOn(addDays(start, index));
    const x = 74 + index * 71;
    const y = 210 - (count / maxCount) * 174;

    return { day, count, x, y: Math.max(36, y) };
  });
});

const chartPoints = computed(() => weekData.value.map((point) => `${point.x},${point.y}`).join(' '));
const chartAreaPoints = computed(() => {
  const first = weekData.value[0];
  const last = weekData.value[weekData.value.length - 1];
  if (!first || !last) return '';
  return `${first.x},210 ${chartPoints.value} ${last.x},210`;
});
const chartScale = computed(() => {
  const maxCount = Math.max(4, ...weekData.value.map((item) => item.count));
  return [maxCount, Math.round(maxCount * 0.75), Math.round(maxCount * 0.5), Math.max(1, Math.round(maxCount * 0.25)), 0];
});

const nextSteps = computed(() => {
  return [...summaries.value]
    .filter((item) => item.status !== 'Revisado')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((summary, index) => ({
      title: `Revisar ${summary.subject || 'resumo'}`,
      subtitle: summary.title,
      time: summary.status || 'Novo',
      tone: tones[index % tones.length],
      icon: initials(summary.subject),
    }));
});

const activities = computed(() => {
  const items = [];

  summaries.value.forEach((summary) => {
    items.push({
      id: `summary-${summary.id}`,
      title: 'Resumo salvo',
      detail: `${summary.title} - ${summary.subject}`,
      time: relativeTime(summary.createdAt),
      tone: 'mint',
      date: summary.createdAt,
    });

    summary.files?.forEach((file) => {
      items.push({
        id: `file-${summary.id}-${file.id || file.fileName}`,
        title: 'Arquivo enviado',
        detail: file.fileName,
        time: relativeTime(summary.createdAt),
        tone: 'blue',
        date: summary.createdAt,
      });
    });

    if (summary.status === 'Revisado') {
      items.push({
        id: `reviewed-${summary.id}`,
        title: 'Resumo revisado',
        detail: `${summary.title} - ${summary.subject}`,
        time: relativeTime(summary.createdAt),
        tone: 'amber',
        date: summary.createdAt,
      });
    }
  });

  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
});

const goalDays = computed(() => {
  const start = new Date(weekStart.value);

  return weekLabels.map((day, index) => ({
    day,
    done: activeWeekDays.value.has(addDays(start, index).toDateString()),
  }));
});

const weeklyInsight = computed(() => {
  if (!summaries.value.length) return 'Nenhum resumo registrado ainda.';
  if (!weekSummaries.value.length) return 'Nenhum resumo novo nesta semana.';
  return `${weekSummaries.value.length} ${weekSummaries.value.length === 1 ? 'resumo registrado' : 'resumos registrados'} nesta semana.`;
});

function getWeekStart(date) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - day + 1);
  return start;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isSameDay(left, right) {
  return left.toDateString() === right.toDateString();
}

function countSummariesOn(date) {
  return summaries.value.filter((item) => isSameDay(new Date(item.createdAt), date)).length;
}

function initials(value) {
  return String(value || 'BL')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function relativeTime(date) {
  const timestamp = new Date(date).getTime();
  if (!timestamp) return 'Agora';

  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `Há ${minutes}min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Há ${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Há ${days}d`;

  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

async function loadHomeData() {
  if (!authStore.user?.id) {
    summaries.value = [];
    return;
  }

  loading.value = true;
  try {
    summaries.value = await getSummariesByOwner(authStore.user.id);
  } finally {
    loading.value = false;
  }
}

onMounted(loadHomeData);
watch(() => authStore.user?.id, loadHomeData);
</script>

<template>
  <div
    class="home-dashboard fade-in-up"
    :style="{ '--home-bg-image': `url(${bgHomeImage})` }"
  >
    <header class="home-topbar">
      <div>
        <h1>Bom dia, <span>{{ userName }}!</span></h1>
        <p>Pronto para mais um dia de foco e conquistas?</p>
      </div>

      <div class="topbar-actions">
        <div class="streak-pill">
          <span class="streak-mark">
            <img
              :src="calendarioImage"
              alt=""
              aria-hidden="true"
            />

            <span class="fallback-text">{{ streakDays }}</span>
          </span>

          <div>
            <strong>{{ streakDays }} {{ streakDays === 1 ? 'dia' : 'dias' }}</strong>
            <small>Sequência atual</small>
          </div>
        </div>

        <div class="notification-wrap">
          <button
            type="button"
            class="icon-button notification-button"
            :aria-label="`${notificationCount} notificações de revisão`"
            :aria-expanded="showNotifications"
            @click="showNotifications = !showNotifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
              />
              <path
                d="M10 21h4"
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-width="2"
              />
            </svg>
            <span v-if="notificationCount" class="notification-badge">{{ notificationCount }}</span>
          </button>

          <div v-if="showNotifications" class="notification-menu">
            <header>
              <strong>Notificações</strong>
              <small>{{ notificationCount }} {{ notificationCount === 1 ? 'item' : 'itens' }}</small>
            </header>

            <div v-if="notifications.length" class="notification-list">
              <RouterLink
                v-for="notification in notifications"
                :key="notification.id"
                :to="notification.to"
                class="notification-item"
                @click="showNotifications = false"
              >
                <span :class="notification.tone">{{ notification.title.slice(0, 2).toUpperCase() }}</span>
                <div>
                  <strong>{{ notification.title }}</strong>
                  <small>{{ notification.detail }}</small>
                  <em>{{ notification.meta }}</em>
                </div>
              </RouterLink>
            </div>

            <p v-else class="notification-empty">Nenhuma notificação no momento.</p>

            <RouterLink to="/abstracts" class="notification-footer" @click="showNotifications = false">
              Ver biblioteca
            </RouterLink>
          </div>
        </div>

        <RouterLink
          to="/upload"
          class="btn btn-primary"
        >
          + Novo resumo
        </RouterLink>
      </div>
    </header>

    <section
      class="stats-grid"
      aria-label="Resumo dos estudos"
    >
      <article
        v-for="stat in stats"
        :key="stat.label"
        class="surface-card stat-tile"
      >
        <span
          class="tile-icon"
          :class="stat.tone"
        >
          <img
            :src="stat.image"
            alt=""
            aria-hidden="true"
          />

          <span class="fallback-text">
            {{ stat.icon }}
          </span>
        </span>

        <div>
          <small>{{ stat.label }}</small>
          <strong>{{ stat.value }}</strong>
          <p>{{ stat.detail }}</p>

          <span
            v-if="stat.label === 'Ritmo semanal'"
            class="mini-progress"
          >
            <i :style="{ width: `${stat.progress}%` }" />
          </span>
        </div>
      </article>
    </section>

    <section class="dashboard-main">
      <article class="surface-card weekly-card">
        <div class="card-header">
          <h2>Seus estudos esta semana</h2>

          <button
            type="button"
            class="filter-button"
          >
            Esta semana
          </button>
        </div>

        <div
          class="chart-wrap"
          aria-label="Gráfico de resumos enviados na semana"
        >
          <svg
            viewBox="0 0 520 230"
            role="img"
            aria-labelledby="weekly-title"
          >
            <title id="weekly-title">
              Resumos enviados por dia
            </title>

            <defs>
              <linearGradient
                id="chartFill"
                x1="0"
                x2="0"
                y1="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stop-color="#14b8a6"
                  stop-opacity="0.28"
                />

                <stop
                  offset="100%"
                  stop-color="#14b8a6"
                  stop-opacity="0"
                />
              </linearGradient>
            </defs>

            <g class="grid-lines">
              <line
                x1="44"
                x2="500"
                y1="36"
                y2="36"
              />

              <line
                x1="44"
                x2="500"
                y1="82"
                y2="82"
              />

              <line
                x1="44"
                x2="500"
                y1="128"
                y2="128"
              />

              <line
                x1="44"
                x2="500"
                y1="174"
                y2="174"
              />
            </g>

            <g class="axis-labels">
              <text
                x="10"
                y="40"
              >
                {{ chartScale[0] }}
              </text>

              <text
                x="10"
                y="86"
              >
                {{ chartScale[1] }}
              </text>

              <text
                x="10"
                y="132"
              >
                {{ chartScale[2] }}
              </text>

              <text
                x="10"
                y="178"
              >
                {{ chartScale[3] }}
              </text>

              <text
                x="10"
                y="214"
              >
                0
              </text>
            </g>

            <polygon
              class="chart-area"
              :points="chartAreaPoints"
            />

            <polyline
              class="chart-line"
              :points="chartPoints"
            />

            <g>
              <circle
                v-for="point in weekData"
                :key="point.day"
                :cx="point.x"
                :cy="point.y"
                r="4.5"
              />
            </g>

            <g class="day-labels">
              <text
                v-for="point in weekData"
                :key="`${point.day}-label`"
                :x="point.x - 8"
                y="222"
              >
                {{ point.day }}
              </text>
            </g>
          </svg>
        </div>

        <p class="insight-note">
          {{ weeklyInsight }}
        </p>
      </article>

      <article class="surface-card next-card">
        <div class="card-header">
          <h2>Próximos passos</h2>
        </div>

        <div v-if="nextSteps.length" class="step-list">
          <RouterLink
            v-for="step in nextSteps"
            :key="`${step.title}-${step.subtitle}`"
            to="/abstracts"
            class="step-row"
          >
            <span
              class="tile-icon compact"
              :class="step.tone"
            >
              {{ step.icon }}
            </span>

            <span>
              <strong>{{ step.title }}</strong>
              <small>{{ step.subtitle }}</small>
              <em>{{ step.time }}</em>
            </span>

            <b>&gt;</b>
          </RouterLink>
        </div>

        <p v-else class="dashboard-empty">Nenhum resumo pendente de revisão.</p>

        <RouterLink
          to="/evolution"
          class="text-link"
        >
          Ver evolução completa &gt;
        </RouterLink>
      </article>

      <aside class="focus-panel">
        <img :src="focoImage" alt="Foco hoje, resultado sempre." />
      </aside>
    </section>

    <section class="lower-grid">
      <article class="surface-card focus-subjects">
        <div class="card-header">
          <h2>Disciplinas em foco</h2>

          <RouterLink to="/abstracts">
            Ver todas
          </RouterLink>
        </div>

        <div v-if="subjects.length" class="subject-list">
          <div
            v-for="subject in subjects"
            :key="subject.name"
            class="subject-row"
          >
            <span
              class="tile-icon compact"
              :class="subject.tone"
            >
              {{ subject.name.slice(0, 2).toUpperCase() }}
            </span>

            <div>
              <strong>{{ subject.name }}</strong>
              <small>{{ subject.detail }}</small>
            </div>

            <span class="progress-line">
              <i :style="{ width: `${subject.progress}%` }" />
            </span>

            <b>{{ subject.progress }}%</b>
          </div>
        </div>

        <p v-else class="dashboard-empty">Nenhuma disciplina registrada ainda.</p>
      </article>

      <article class="surface-card activity-card">
        <div class="card-header">
          <h2>Atividade recente</h2>

          <RouterLink to="/abstracts">
            Ver todas
          </RouterLink>
        </div>

        <div v-if="activities.length" class="activity-list">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-row"
          >
            <span
              class="activity-dot"
              :class="activity.tone"
            />

            <div>
              <strong>{{ activity.title }}</strong>
              <small>{{ activity.detail }}</small>
            </div>

            <time>{{ activity.time }}</time>
          </div>
        </div>

        <p v-else class="dashboard-empty">Nenhuma atividade real registrada ainda.</p>
      </article>

      <article class="surface-card goals-card">
        <div class="card-header">
          <h2>Registro da semana</h2>

          <RouterLink to="/upload">
            Adicionar
          </RouterLink>
        </div>

        <div class="goal-content">
          <div class="goal-ring" :style="{ '--goal-progress': `${weeklyProgress}%` }">
            <span>{{ weeklyProgress }}%</span>
          </div>

          <div>
            <strong>Dias com uploads</strong>
            <p>{{ activeWeekDays.size }} de {{ weekDaysTotal }} dias com resumos</p>

            <span class="progress-line wide">
              <i :style="{ width: `${weeklyProgress}%` }" />
            </span>
          </div>
        </div>

        <div class="goal-days">
          <span
            v-for="item in goalDays"
            :key="item.day"
            :class="{ done: item.done }"
          >
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
    linear-gradient(
      180deg,
      rgba(248, 250, 252, 0.88),
      rgba(248, 250, 252, 0.76)
    ),
    var(--home-bg-image) center / cover no-repeat;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.48);
}

:global(body.theme-dark) .home-dashboard {
  background:
    linear-gradient(
      180deg,
      rgba(2, 31, 29, 0.92),
      rgba(1, 23, 21, 0.96)
    ),
    var(--home-bg-image) center / cover no-repeat;
  box-shadow: none;
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

:global(body.theme-dark) .home-topbar h1 {
  color: #f8fafc;
}

:global(body.theme-dark) .home-topbar h1 span {
  color: var(--bl-primary);
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

.streak-mark img {
  width: 1.35rem;
  height: 1.35rem;
  object-fit: contain;
}

:global(body.theme-dark) .streak-mark {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--bl-primary);
  font-weight: 900;
}

.notification-wrap {
  position: relative;
}

.notification-button {
  position: relative;
  cursor: pointer;
}

.notification-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.notification-badge {
  position: absolute;
  top: -0.32rem;
  right: -0.32rem;
  min-width: 1.18rem;
  height: 1.18rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  padding: 0 0.28rem;
  background: var(--bl-primary);
  color: #ffffff;
  font-size: 0.68rem;
  line-height: 1;
  box-shadow: 0 0 0 3px var(--bl-surface);
}

.notification-menu {
  position: absolute;
  top: calc(100% + 0.7rem);
  right: 0;
  z-index: 20;
  width: min(340px, calc(100vw - 2rem));
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  background: var(--bl-surface);
  box-shadow: var(--shadow-strong);
  padding: 0.78rem;
}

.notification-menu header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.65rem;
}

.notification-menu header strong {
  font-size: 0.96rem;
}

.notification-menu header small,
.notification-item small,
.notification-item em,
.notification-empty {
  color: var(--bl-muted);
  font-size: 0.78rem;
}

.notification-list {
  display: grid;
  gap: 0.5rem;
}

.notification-item {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.62rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.6rem;
  align-items: center;
}

.notification-item:hover {
  border-color: rgba(15, 118, 110, 0.34);
  background: var(--bl-primary-soft);
}

.notification-item > span {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.68rem;
  font-weight: 900;
}

.notification-item strong,
.notification-item small,
.notification-item em {
  display: block;
}

.notification-item strong {
  font-size: 0.84rem;
}

.notification-item small {
  margin-top: 0.12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-item em {
  margin-top: 0.1rem;
  font-style: normal;
}

.notification-empty {
  border: 1px dashed var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.85rem;
  text-align: center;
  font-weight: 800;
}

.notification-footer {
  margin-top: 0.65rem;
  display: inline-flex;
  color: var(--bl-primary);
  font-size: 0.82rem;
  font-weight: 900;
}

:global(body.theme-dark) .icon-button {
  background: rgba(7, 17, 31, 0.88);
  border-color: rgba(148, 163, 184, 0.16);
  color: var(--bl-primary);
}

:global(body.theme-dark) .notification-badge {
  box-shadow: 0 0 0 3px #07111f;
}

:global(body.theme-dark) .notification-menu {
  background:
    radial-gradient(circle at 12% 0%, rgba(18, 214, 196, 0.07), transparent 30%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.98), rgba(5, 13, 26, 0.99));
  border-color: rgba(148, 163, 184, 0.16);
}

:global(body.theme-dark) .notification-item {
  border-color: rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.42);
}

:global(body.theme-dark) .notification-item:hover {
  border-color: rgba(18, 214, 196, 0.32);
  background: rgba(18, 214, 196, 0.1);
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

.tile-icon img {
  width: 2.15rem;
  height: 2.15rem;
  object-fit: contain;
}

.fallback-text {
  display: none;
}

.tile-icon.compact {
  width: 2.55rem;
  height: 2.55rem;
  font-size: 0.7rem;
}

.tile-icon.compact img {
  width: 1.55rem;
  height: 1.55rem;
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
  color: var(--bl-primary);
}

:global(body.theme-dark) .stat-tile {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    radial-gradient(circle at 8% 20%, rgba(18, 214, 196, 0.08), transparent 34%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.94), rgba(5, 13, 26, 0.96));
}

:global(body.theme-dark) .stat-tile strong,
:global(body.theme-dark) .goal-ring span,
:global(body.theme-dark) .goal-content strong,
:global(body.theme-dark) .subject-row b {
  color: #f8fafc;
}

:global(body.theme-dark) .mint {
  background: linear-gradient(145deg, rgba(18, 214, 196, 0.2), rgba(18, 214, 196, 0.06));
  color: #67f8e8;
  border: 1px solid rgba(18, 214, 196, 0.24);
}

:global(body.theme-dark) .violet {
  background: linear-gradient(145deg, rgba(139, 92, 246, 0.22), rgba(139, 92, 246, 0.07));
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.22);
}

:global(body.theme-dark) .amber {
  background: linear-gradient(145deg, rgba(245, 158, 11, 0.24), rgba(245, 158, 11, 0.08));
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.22);
}

:global(body.theme-dark) .blue {
  background: linear-gradient(145deg, rgba(59, 130, 246, 0.24), rgba(59, 130, 246, 0.08));
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.22);
}

:global(body.theme-dark) .rose {
  background: linear-gradient(145deg, rgba(248, 113, 113, 0.22), rgba(248, 113, 113, 0.07));
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.2);
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
  grid-template-columns:
    minmax(0, 1.55fr)
    minmax(280px, 0.95fr)
    minmax(230px, 0.78fr);
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
  color: var(--bl-primary);
}

:global(body.theme-dark) .filter-button {
  background: rgba(7, 17, 31, 0.82);
  border-color: rgba(148, 163, 184, 0.16);
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
  background: rgba(18, 214, 196, 0.1);
  border-color: rgba(18, 214, 196, 0.2);
  color: var(--bl-primary);
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
  border-color: rgba(18, 214, 196, 0.32);
  background: rgba(18, 214, 196, 0.1);
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

.dashboard-empty {
  min-height: 5rem;
  border: 1px dashed var(--bl-border);
  border-radius: var(--radius-sm);
  display: grid;
  place-items: center;
  padding: 0.8rem;
  color: var(--bl-muted);
  font-size: 0.84rem;
  font-weight: 800;
  text-align: center;
}

:global(body.theme-dark) .dashboard-empty {
  background: rgba(2, 8, 23, 0.34);
  border-color: rgba(148, 163, 184, 0.16);
}

.focus-panel {
  min-height: 290px;
  border-radius: var(--radius-lg);
  padding: 0;
  overflow: hidden;
  background: #020817;
  box-shadow: var(--shadow-strong);
}

.focus-panel img {
  width: 100%;
  height: 100%;
  min-height: 290px;
  display: block;
  object-fit: cover;
}

.lower-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr)
    minmax(300px, 1.05fr);
  gap: 0.9rem;
}

.subject-row {
  grid-template-columns:
    auto
    minmax(0, 1fr)
    minmax(80px, 120px)
    42px;
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
  background: conic-gradient(
    var(--bl-primary) 0 var(--goal-progress, 0%),
    var(--bl-border) var(--goal-progress, 0%) 100%
  );
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
  color: var(--bl-primary);
}

:global(body.theme-dark) .weekly-card,
:global(body.theme-dark) .next-card,
:global(body.theme-dark) .focus-subjects,
:global(body.theme-dark) .activity-card,
:global(body.theme-dark) .goals-card {
  border-color: rgba(148, 163, 184, 0.16);
  background:
    radial-gradient(circle at 12% 0%, rgba(18, 214, 196, 0.07), transparent 30%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.94), rgba(5, 13, 26, 0.96));
}

:global(body.theme-dark) .card-header h2,
:global(body.theme-dark) .step-row strong,
:global(body.theme-dark) .subject-row strong,
:global(body.theme-dark) .activity-row strong {
  color: #f8fafc;
}

:global(body.theme-dark) .step-row {
  border-color: rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.4);
}

:global(body.theme-dark) .step-row b {
  color: #cbd5e1;
}

:global(body.theme-dark) .focus-panel {
  border: 0;
  background: #020817;
  box-shadow: 0 22px 50px rgba(0, 0, 0, 0.38);
}

:global(body.theme-dark) .mini-progress,
:global(body.theme-dark) .progress-line {
  background: rgba(148, 163, 184, 0.14);
}

:global(body.theme-dark) .mini-progress i,
:global(body.theme-dark) .progress-line i {
  background: linear-gradient(90deg, #12d6c4, #0aa99b);
}

:global(body.theme-dark) .goal-ring::after {
  background: #07111f;
}

:global(body.theme-dark) .goal-days .done i {
  background: rgba(18, 214, 196, 0.16);
  border-color: rgba(18, 214, 196, 0.18);
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
      linear-gradient(
        180deg,
        rgba(248, 250, 252, 0.92),
        rgba(248, 250, 252, 0.82)
      ),
      var(--home-bg-image) center top / cover no-repeat;
  }

  :global(body.theme-dark) .home-dashboard {
    background:
      linear-gradient(
        180deg,
        rgba(2, 31, 29, 0.94),
        rgba(1, 23, 21, 0.98)
      ),
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
