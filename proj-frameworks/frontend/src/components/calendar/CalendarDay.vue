<script setup>
import CalendarEventNote from '@/components/calendar/CalendarEventNote.vue';
import { formatFullDatePt } from '@/utils/calendarUtils';

const props = defineProps({
  day: {
    type: Object,
    required: true,
  },
  events: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['create', 'open']);

function handleKeydown(event) {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  emit('create', props.day.key);
}
</script>

<template>
  <div
    class="calendar-day"
    :class="{ muted: !day.inCurrentMonth, today: day.isToday, empty: !events.length }"
    role="button"
    tabindex="0"
    :aria-label="`Adicionar evento em ${formatFullDatePt(day.key)}`"
    @click="emit('create', day.key)"
    @keydown="handleKeydown"
  >
    <div class="day-top">
      <span>{{ day.dayNumber }}</span>
      <small v-if="day.isToday">Hoje</small>
    </div>

    <div class="day-events" @click.stop>
      <CalendarEventNote
        v-for="event in events.slice(0, 3)"
        :key="event.id"
        :event="event"
        @open="emit('open', $event)"
      />

      <button
        v-if="events.length > 3"
        type="button"
        class="more-events"
        @click.stop="emit('create', day.key)"
      >
        + {{ events.length - 3 }} eventos
      </button>
    </div>
  </div>
</template>

<style scoped>
.calendar-day {
  min-height: 156px;
  border-right: 1px solid var(--bl-border);
  border-bottom: 1px solid var(--bl-border);
  padding: 0.62rem;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0.45rem;
  background: rgba(255, 255, 255, 0.72);
  transition: background-color 0.18s ease, box-shadow 0.18s ease;
  cursor: pointer;
}

.calendar-day:hover,
.calendar-day:focus-visible {
  background: rgba(204, 251, 241, 0.42);
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(15, 118, 110, 0.2);
}

.calendar-day.muted {
  background: rgba(248, 250, 252, 0.52);
  color: #94a3b8;
}

.calendar-day.today {
  box-shadow: inset 0 0 0 2px rgba(6, 182, 212, 0.38);
}

.day-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
  font-weight: 900;
}

.day-top small {
  border-radius: 999px;
  background: var(--bl-primary-soft);
  color: var(--bl-primary);
  padding: 0.15rem 0.42rem;
  font-size: 0.66rem;
}

.day-events {
  display: grid;
  align-content: start;
  gap: 0.46rem;
}

.more-events {
  border: 1px dashed rgba(15, 118, 110, 0.3);
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: var(--bl-primary);
  padding: 0.24rem 0.52rem;
  font-size: 0.72rem;
  font-weight: 900;
  cursor: pointer;
}

:global(body.theme-dark) .calendar-day {
  background: rgba(7, 17, 31, 0.76);
  border-color: rgba(148, 163, 184, 0.14);
}

:global(body.theme-dark) .calendar-day.muted {
  background: rgba(2, 8, 23, 0.48);
  color: #64748b;
}

:global(body.theme-dark) .calendar-day:hover,
:global(body.theme-dark) .calendar-day:focus-visible {
  background: rgba(18, 214, 196, 0.1);
  box-shadow: inset 0 0 0 2px rgba(18, 214, 196, 0.24);
}
</style>
