<script setup>
import { computed } from 'vue';
import CalendarDay from '@/components/calendar/CalendarDay.vue';
import CalendarEventNote from '@/components/calendar/CalendarEventNote.vue';
import { formatFullDatePt, weekDayLabels } from '@/utils/calendarUtils';

const props = defineProps({
  days: {
    type: Array,
    default: () => [],
  },
  eventsByDate: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['create', 'open']);

const mobileDays = computed(() => {
  return props.days
    .filter((day) => day.inCurrentMonth)
    .map((day) => ({
      ...day,
      events: props.eventsByDate[day.key] || [],
    }))
    .filter((day) => day.events.length || day.isToday);
});
</script>

<template>
  <section class="calendar-panel surface-card" aria-label="Calendário mensal">
    <div class="calendar-grid-scroll">
      <div class="weekday-grid" aria-hidden="true">
        <span v-for="label in weekDayLabels" :key="label">{{ label }}</span>
      </div>

      <div class="calendar-grid">
        <CalendarDay
          v-for="day in days"
          :key="day.key"
          :day="day"
          :events="eventsByDate[day.key] || []"
          @create="emit('create', $event)"
          @open="emit('open', $event)"
        />
      </div>
    </div>

    <div class="mobile-agenda" aria-label="Eventos do mês em lista">
      <article v-if="!mobileDays.length" class="mobile-empty">
        Nenhum evento cadastrado neste mês.
      </article>

      <article v-for="day in mobileDays" :key="day.key" class="mobile-day">
        <button type="button" class="mobile-day-header" @click="emit('create', day.key)">
          <span>{{ formatFullDatePt(day.key) }}</span>
          <small>{{ day.events.length }} evento{{ day.events.length === 1 ? '' : 's' }}</small>
        </button>

        <div v-if="day.events.length" class="mobile-day-events">
          <CalendarEventNote
            v-for="event in day.events"
            :key="event.id"
            :event="event"
            @open="emit('open', $event)"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.calendar-panel {
  overflow: hidden;
}

.calendar-grid-scroll {
  overflow-x: auto;
}

.weekday-grid,
.calendar-grid {
  min-width: 920px;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.weekday-grid {
  border-bottom: 1px solid var(--bl-border);
  background: rgba(248, 250, 252, 0.86);
}

.weekday-grid span {
  padding: 0.82rem 0.62rem;
  text-align: center;
  font-weight: 900;
  color: var(--bl-text);
}

.calendar-grid {
  border-top: 0;
}

.mobile-agenda {
  display: none;
}

.mobile-empty {
  border: 1px dashed var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 1rem;
  color: var(--bl-muted);
  font-weight: 800;
  text-align: center;
}

:global(body.theme-dark) .weekday-grid {
  background: rgba(15, 23, 42, 0.64);
  border-color: rgba(148, 163, 184, 0.16);
}

@media (max-width: 640px) {
  .calendar-grid-scroll {
    display: none;
  }

  .calendar-panel {
    padding: 0.8rem;
  }

  .mobile-agenda {
    display: grid;
    gap: 0.75rem;
  }

  .mobile-day {
    border: 1px solid var(--bl-border);
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.7);
    overflow: hidden;
  }

  .mobile-day-header {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--bl-text);
    padding: 0.78rem;
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    text-align: left;
    font-weight: 900;
    cursor: pointer;
  }

  .mobile-day-header small {
    color: var(--bl-primary);
    flex-shrink: 0;
  }

  .mobile-day-events {
    display: grid;
    gap: 0.52rem;
    padding: 0 0.78rem 0.78rem;
  }

  :global(body.theme-dark) .mobile-day {
    background: rgba(7, 17, 31, 0.76);
    border-color: rgba(148, 163, 184, 0.16);
  }
}
</style>
