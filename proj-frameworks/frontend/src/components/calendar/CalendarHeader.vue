<script setup>
import { computed } from 'vue';
import { monthNames } from '@/utils/calendarUtils';

const props = defineProps({
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:month', 'update:year', 'previous', 'next', 'add']);

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const startYear = Math.min(currentYear - 3, props.year - 3);
  const endYear = Math.max(currentYear + 5, props.year + 3);
  return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);
});
</script>

<template>
  <header class="calendar-header">
    <div>
      <h1>Calendário de provas e trabalhos</h1>
      <p>Organize prazos e datas importantes e nunca perca um compromisso.</p>
    </div>

    <div class="calendar-actions" aria-label="Controles do calendário">
      <div class="month-nav">
        <button type="button" class="icon-nav" aria-label="Mês anterior" @click="emit('previous')">
          ‹
        </button>
        <button type="button" class="icon-nav" aria-label="Próximo mês" @click="emit('next')">
          ›
        </button>
      </div>

      <label class="select-field">
        <span>Mês</span>
        <select :value="month" @change="emit('update:month', Number($event.target.value))">
          <option v-for="(monthName, index) in monthNames" :key="monthName" :value="index">
            {{ monthName }}
          </option>
        </select>
      </label>

      <label class="select-field">
        <span>Ano</span>
        <select :value="year" @change="emit('update:year', Number($event.target.value))">
          <option v-for="yearOption in yearOptions" :key="yearOption" :value="yearOption">
            {{ yearOption }}
          </option>
        </select>
      </label>

      <button type="button" class="btn btn-primary add-event-button" @click="emit('add')">
        <span aria-hidden="true">+</span>
        Adicionar evento
      </button>
    </div>
  </header>
</template>

<style scoped>
.calendar-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 1rem;
}

.calendar-header h1 {
  font-size: clamp(1.8rem, 3vw, 2.65rem);
  line-height: 1.08;
}

.calendar-header p {
  margin-top: 0.65rem;
  color: var(--bl-muted);
  line-height: 1.6;
}

.calendar-actions {
  display: flex;
  align-items: end;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 0.72rem;
}

.month-nav {
  display: flex;
  gap: 0.42rem;
}

.icon-nav {
  width: 2.45rem;
  height: 2.45rem;
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  background: var(--bl-surface);
  color: var(--bl-text);
  font-size: 1.55rem;
  line-height: 1;
  cursor: pointer;
}

.icon-nav:hover,
.icon-nav:focus-visible {
  border-color: rgba(15, 118, 110, 0.42);
  color: var(--bl-primary);
  outline: none;
}

.select-field {
  display: grid;
  gap: 0.32rem;
  min-width: 132px;
}

.select-field span {
  color: var(--bl-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.select-field select {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  background: var(--bl-surface);
  color: var(--bl-text);
  min-height: 2.7rem;
  padding: 0.62rem 2.25rem 0.62rem 0.82rem;
  box-shadow: var(--shadow-soft);
  cursor: pointer;
}

.select-field select:focus-visible {
  outline: none;
  border-color: rgba(6, 182, 212, 0.6);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.14);
}

.add-event-button {
  min-height: 2.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.add-event-button span {
  font-size: 1.35rem;
  line-height: 1;
}

:global(body.theme-dark) .icon-nav,
:global(body.theme-dark) .select-field select {
  background: rgba(15, 23, 42, 0.66);
  border-color: rgba(148, 163, 184, 0.18);
}

@media (max-width: 920px) {
  .calendar-header {
    grid-template-columns: 1fr;
  }

  .calendar-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .select-field,
  .add-event-button {
    width: 100%;
  }

  .month-nav {
    width: 100%;
  }

  .icon-nav {
    flex: 1;
  }
}
</style>
