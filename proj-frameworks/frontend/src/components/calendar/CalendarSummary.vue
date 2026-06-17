<script setup>
import { computed } from 'vue';
import {
  addDays,
  compareEvents,
  formatDatePt,
  getCurrentWeekRange,
  getTodayKey,
  isDateKeyBetween,
  toDateKey,
} from '@/utils/calendarUtils';

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
});

const todayKey = computed(() => getTodayKey());
const nextSevenDaysKey = computed(() => toDateKey(addDays(new Date(), 7)));
const weekRange = computed(() => getCurrentWeekRange(new Date()));

const upcomingExams = computed(() => {
  return props.events
    .filter((event) => event.type === 'exam' && isDateKeyBetween(event.date, todayKey.value, nextSevenDaysKey.value))
    .sort((a, b) => a.date.localeCompare(b.date) || compareEvents(a, b));
});

const weekAssignments = computed(() => {
  return props.events
    .filter((event) => ['assignment', 'delivery'].includes(event.type))
    .filter((event) => isDateKeyBetween(event.date, weekRange.value.startKey, weekRange.value.endKey))
    .sort((a, b) => a.date.localeCompare(b.date) || compareEvents(a, b));
});

const reminders = computed(() => {
  return props.events
    .filter((event) => event.reminder && !event.completed && event.date >= todayKey.value)
    .sort((a, b) => a.date.localeCompare(b.date) || compareEvents(a, b));
});
</script>

<template>
  <section class="calendar-summary" aria-label="Resumo do calendário acadêmico">
    <article class="summary-card summary-exams">
      <div class="summary-icon" aria-hidden="true">PV</div>
      <div class="summary-main">
        <span>Próximas provas</span>
        <strong>{{ upcomingExams.length }}</strong>
        <small>nos próximos 7 dias</small>
      </div>
      <ul>
        <li v-for="event in upcomingExams.slice(0, 3)" :key="event.id">
          <b>{{ formatDatePt(event.date) }}</b>
          <span>{{ event.title }}</span>
        </li>
        <li v-if="!upcomingExams.length" class="empty-line">Nenhuma prova próxima</li>
      </ul>
    </article>

    <article class="summary-card summary-work">
      <div class="summary-icon" aria-hidden="true">TR</div>
      <div class="summary-main">
        <span>Trabalhos da semana</span>
        <strong>{{ weekAssignments.length }}</strong>
        <small>esta semana</small>
      </div>
      <ul>
        <li v-for="event in weekAssignments.slice(0, 3)" :key="event.id">
          <b>{{ formatDatePt(event.date) }}</b>
          <span>{{ event.title }}</span>
        </li>
        <li v-if="!weekAssignments.length" class="empty-line">Nenhum trabalho na semana</li>
      </ul>
    </article>

    <article class="summary-card summary-reminders">
      <div class="summary-icon" aria-hidden="true">LB</div>
      <div class="summary-main">
        <span>Lembretes</span>
        <strong>{{ reminders.length }}</strong>
        <small>ativos</small>
      </div>
      <ul>
        <li v-for="event in reminders.slice(0, 3)" :key="event.id">
          <b>{{ formatDatePt(event.date) }}</b>
          <span>{{ event.title }}</span>
        </li>
        <li v-if="!reminders.length" class="empty-line">Nenhum lembrete ativo</li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.calendar-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
}

.summary-card {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  min-height: 136px;
  padding: 1rem;
  display: grid;
  grid-template-columns: auto minmax(96px, 0.45fr) minmax(0, 1fr);
  align-items: center;
  gap: 0.9rem;
  background: var(--bl-surface);
  box-shadow: var(--shadow-soft);
}

.summary-exams {
  background: linear-gradient(135deg, rgba(204, 251, 241, 0.55), var(--bl-surface));
}

.summary-work {
  background: linear-gradient(135deg, rgba(221, 214, 254, 0.45), var(--bl-surface));
}

.summary-reminders {
  background: linear-gradient(135deg, rgba(254, 243, 199, 0.58), var(--bl-surface));
}

.summary-icon {
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 118, 110, 0.12);
  color: var(--bl-primary);
  font-size: 0.78rem;
  font-weight: 900;
}

.summary-main {
  display: grid;
  gap: 0.12rem;
}

.summary-main span {
  font-weight: 900;
}

.summary-main strong {
  color: var(--bl-primary);
  font-size: 2rem;
  line-height: 1.05;
}

.summary-main small {
  color: var(--bl-muted);
}

.summary-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.44rem;
  border-left: 1px solid var(--bl-border);
  padding-left: 0.9rem;
}

.summary-card li {
  display: flex;
  gap: 0.56rem;
  color: var(--bl-muted);
  font-size: 0.84rem;
  min-width: 0;
}

.summary-card li span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-card li b {
  color: var(--bl-text);
  flex: 0 0 auto;
}

.empty-line {
  color: var(--bl-muted);
  font-weight: 700;
}

:global(body.theme-dark) .summary-card {
  background: linear-gradient(145deg, rgba(9, 20, 34, 0.94), rgba(5, 13, 26, 0.96));
  border-color: rgba(148, 163, 184, 0.16);
}

:global(body.theme-dark) .summary-icon {
  background: rgba(18, 214, 196, 0.12);
}

@media (max-width: 1100px) {
  .calendar-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .summary-card {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .summary-card ul {
    grid-column: 1 / -1;
    border-left: 0;
    border-top: 1px solid var(--bl-border);
    padding: 0.75rem 0 0;
  }
}
</style>
