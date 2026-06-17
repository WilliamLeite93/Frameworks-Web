<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import AppToast from '@/components/common/AppToast.vue';
import CalendarEventModal from '@/components/calendar/CalendarEventModal.vue';
import CalendarGrid from '@/components/calendar/CalendarGrid.vue';
import CalendarHeader from '@/components/calendar/CalendarHeader.vue';
import CalendarSummary from '@/components/calendar/CalendarSummary.vue';
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
  updateCalendarEvent,
} from '@/services/calendarService';
import { getMonthDays, groupEventsByDate, toDateKey } from '@/utils/calendarUtils';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const today = new Date();

const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());
const events = ref([]);
const loading = ref(true);
const loadError = ref('');
const saving = ref(false);
const modalOpen = ref(false);
const selectedEvent = ref(null);
const selectedDate = ref(toDateKey(today));
const toast = ref({ message: '', type: 'success' });

let toastTimer = null;

const ownerId = computed(() => authStore.user?.id || 'guest');
const days = computed(() => getMonthDays(currentYear.value, currentMonth.value));
const eventsByDate = computed(() => groupEventsByDate(events.value));
const monthEvents = computed(() => {
  const month = String(currentMonth.value + 1).padStart(2, '0');
  const prefix = `${currentYear.value}-${month}`;
  return events.value.filter((event) => event.date?.startsWith(prefix));
});

function showToast(message, type = 'success') {
  toast.value = { message, type };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.value = { message: '', type };
  }, 3200);
}

async function loadEvents() {
  loading.value = true;
  loadError.value = '';

  try {
    events.value = await getCalendarEvents(ownerId.value);
  } catch {
    loadError.value = 'Não foi possível carregar seus eventos agora.';
  } finally {
    loading.value = false;
  }
}

function openCreateModal(dateKey = toDateKey(new Date(currentYear.value, currentMonth.value, 1))) {
  selectedEvent.value = null;
  selectedDate.value = dateKey;
  modalOpen.value = true;
}

function openEventModal(event) {
  selectedEvent.value = event;
  selectedDate.value = event.date;
  modalOpen.value = true;
}

function closeModal() {
  if (saving.value) return;
  modalOpen.value = false;
  selectedEvent.value = null;
}

async function saveEvent(payload) {
  saving.value = true;

  try {
    if (selectedEvent.value?.id) {
      const updatedEvent = await updateCalendarEvent(ownerId.value, selectedEvent.value.id, payload);
      events.value = events.value.map((event) => (event.id === updatedEvent.id ? updatedEvent : event));
      showToast('Evento atualizado com sucesso.');
    } else {
      const createdEvent = await createCalendarEvent(ownerId.value, payload);
      events.value = [...events.value, createdEvent];
      showToast('Evento cadastrado com sucesso.');
    }

    modalOpen.value = false;
    selectedEvent.value = null;
  } catch (error) {
    showToast(error?.message || 'Não foi possível salvar o evento.', 'error');
  } finally {
    saving.value = false;
  }
}

async function removeEvent(event) {
  saving.value = true;

  try {
    await deleteCalendarEvent(ownerId.value, event.id);
    events.value = events.value.filter((item) => item.id !== event.id);
    showToast('Evento excluído com sucesso.');
    modalOpen.value = false;
    selectedEvent.value = null;
  } catch (error) {
    showToast(error?.message || 'Não foi possível excluir o evento.', 'error');
  } finally {
    saving.value = false;
  }
}

async function completeEvent(event) {
  if (!event?.id) return;
  saving.value = true;

  try {
    const updatedEvent = await updateCalendarEvent(ownerId.value, event.id, {
      ...event,
      completed: true,
    });
    events.value = events.value.map((item) => (item.id === updatedEvent.id ? updatedEvent : item));
    selectedEvent.value = updatedEvent;
    showToast('Evento marcado como concluído.');
  } catch (error) {
    showToast(error?.message || 'Não foi possível concluir o evento.', 'error');
  } finally {
    saving.value = false;
  }
}

function previousMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value -= 1;
    return;
  }

  currentMonth.value -= 1;
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value += 1;
    return;
  }

  currentMonth.value += 1;
}

watch(ownerId, loadEvents);

onMounted(loadEvents);
</script>

<template>
  <section class="page calendar-page">
    <CalendarHeader
      v-model:month="currentMonth"
      v-model:year="currentYear"
      @previous="previousMonth"
      @next="nextMonth"
      @add="openCreateModal()"
    />

    <div v-if="loading" class="calendar-state surface-card" role="status">
      Carregando calendário...
    </div>

    <div v-else-if="loadError" class="calendar-state error-state surface-card" role="alert">
      {{ loadError }}
      <button type="button" class="btn btn-secondary" @click="loadEvents">Tentar novamente</button>
    </div>

    <template v-else>
      <CalendarSummary :events="events" />

      <div v-if="!events.length" class="empty-state surface-card">
        <strong>Nenhum evento cadastrado ainda.</strong>
        <span>Use o botão Adicionar evento ou clique em um dia do calendário para começar.</span>
        <button type="button" class="btn btn-primary" @click="openCreateModal()">Adicionar evento</button>
      </div>

      <CalendarGrid
        :days="days"
        :events-by-date="eventsByDate"
        @create="openCreateModal"
        @open="openEventModal"
      />

      <p v-if="events.length && !monthEvents.length" class="month-empty">
        Nenhum evento cadastrado para este mês.
      </p>
    </template>

    <CalendarEventModal
      :model-value="modalOpen"
      :event="selectedEvent"
      :initial-date="selectedDate"
      :saving="saving"
      @close="closeModal"
      @save="saveEvent"
      @delete="removeEvent"
      @complete="completeEvent"
    />

    <AppToast :message="toast.message" :type="toast.type" />
  </section>
</template>

<style scoped>
.calendar-page {
  gap: 1.2rem;
}

.calendar-state,
.empty-state {
  padding: 1.2rem;
}

.calendar-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  color: var(--bl-muted);
  font-weight: 800;
}

.error-state {
  color: var(--bl-danger);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem;
  background:
    radial-gradient(circle at 100% 0%, rgba(15, 118, 110, 0.08), transparent 32%),
    var(--bl-surface);
}

.empty-state strong {
  font-size: 1rem;
}

.empty-state span {
  color: var(--bl-muted);
  flex: 1 1 320px;
}

.month-empty {
  color: var(--bl-muted);
  text-align: center;
  font-weight: 800;
}

:global(body.theme-dark) .empty-state {
  background:
    radial-gradient(circle at 100% 0%, rgba(18, 214, 196, 0.12), transparent 34%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.94), rgba(5, 13, 26, 0.96));
}

@media (max-width: 620px) {
  .calendar-state,
  .empty-state {
    align-items: stretch;
    flex-direction: column;
  }

  .empty-state .btn,
  .calendar-state .btn {
    width: 100%;
  }
}
</style>
