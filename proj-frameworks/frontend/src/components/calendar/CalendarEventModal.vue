<script setup>
import { computed, onMounted, onUnmounted, reactive, watch } from 'vue';
import { eventTypeOptions, getEventType, priorityOptions } from '@/utils/calendarUtils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  event: {
    type: Object,
    default: null,
  },
  initialDate: {
    type: String,
    default: '',
  },
  saving: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'save', 'delete', 'complete']);

const form = reactive({
  title: '',
  type: 'exam',
  subject: '',
  date: '',
  time: '',
  description: '',
  priority: 'medium',
  reminder: false,
  completed: false,
  color: '',
});

const touched = reactive({
  title: false,
  type: false,
  date: false,
});

const isEditing = computed(() => Boolean(props.event?.id));
const selectedType = computed(() => getEventType(form.type));

const errors = computed(() => ({
  title: form.title.trim() ? '' : 'Informe o título do evento.',
  type: form.type ? '' : 'Selecione o tipo do evento.',
  date: form.date ? '' : 'Informe a data do evento.',
}));

const hasErrors = computed(() => Boolean(errors.value.title || errors.value.type || errors.value.date));

function resetTouched() {
  touched.title = false;
  touched.type = false;
  touched.date = false;
}

function fillForm() {
  const source = props.event || {};

  form.title = source.title || '';
  form.type = source.type || 'exam';
  form.subject = source.subject || '';
  form.date = source.date || props.initialDate || '';
  form.time = source.time || '';
  form.description = source.description || '';
  form.priority = source.priority || 'medium';
  form.reminder = Boolean(source.reminder);
  form.completed = Boolean(source.completed);
  form.color = source.color || '';
  resetTouched();
}

function markRequiredFields() {
  touched.title = true;
  touched.type = true;
  touched.date = true;
}

function handleSubmit() {
  markRequiredFields();
  if (hasErrors.value || props.saving) return;

  emit('save', {
    title: form.title.trim(),
    type: form.type,
    subject: form.subject.trim(),
    date: form.date,
    time: form.time,
    description: form.description.trim(),
    priority: form.priority,
    reminder: form.reminder,
    completed: form.completed,
    color: form.color,
  });
}

function requestDelete() {
  if (!props.event?.id) return;
  const confirmed = window.confirm('Excluir este evento? Essa ação não pode ser desfeita.');
  if (confirmed) emit('delete', props.event);
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.modelValue && !props.saving) {
    emit('close');
  }
}

watch(
  () => [props.modelValue, props.event, props.initialDate],
  () => {
    if (props.modelValue) fillForm();
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="modelValue" class="modal-backdrop" role="presentation" @click.self="emit('close')">
      <section class="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
        <header class="modal-header">
          <div>
            <span class="modal-kicker">{{ isEditing ? 'Editar compromisso' : 'Novo compromisso' }}</span>
            <h2 id="event-modal-title">{{ isEditing ? event.title : 'Adicionar evento acadêmico' }}</h2>
          </div>
          <button type="button" class="modal-close" aria-label="Fechar modal" :disabled="saving" @click="emit('close')">
            ×
          </button>
        </header>

        <form class="event-form" novalidate @submit.prevent="handleSubmit">
          <div class="field">
            <label for="event-title">Título</label>
            <input
              id="event-title"
              v-model="form.title"
              type="text"
              autocomplete="off"
              :aria-invalid="Boolean(touched.title && errors.title)"
              @blur="touched.title = true"
            />
            <span v-if="touched.title && errors.title" class="field-error">{{ errors.title }}</span>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="event-type">Tipo do evento</label>
              <select
                id="event-type"
                v-model="form.type"
                :aria-invalid="Boolean(touched.type && errors.type)"
                @blur="touched.type = true"
              >
                <option v-for="type in eventTypeOptions" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
              <span v-if="touched.type && errors.type" class="field-error">{{ errors.type }}</span>
            </div>

            <div class="field">
              <label for="event-subject">Matéria</label>
              <input id="event-subject" v-model="form.subject" type="text" autocomplete="off" />
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="event-date">Data</label>
              <input
                id="event-date"
                v-model="form.date"
                type="date"
                :aria-invalid="Boolean(touched.date && errors.date)"
                @blur="touched.date = true"
              />
              <span v-if="touched.date && errors.date" class="field-error">{{ errors.date }}</span>
            </div>

            <div class="field">
              <label for="event-time">Horário opcional</label>
              <input id="event-time" v-model="form.time" type="time" />
            </div>
          </div>

          <div class="form-grid">
            <div class="field">
              <label for="event-priority">Prioridade</label>
              <select id="event-priority" v-model="form.priority">
                <option v-for="priority in priorityOptions" :key="priority.value" :value="priority.value">
                  {{ priority.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="event-color">Cor opcional</label>
              <input id="event-color" v-model="form.color" type="color" :title="`Cor sugerida: ${selectedType.label}`" />
            </div>
          </div>

          <div class="field">
            <label for="event-description">Descrição opcional</label>
            <textarea id="event-description" v-model="form.description" rows="4"></textarea>
          </div>

          <div class="option-grid">
            <label class="check-option">
              <input v-model="form.reminder" type="checkbox" />
              <span>Lembrete ativo</span>
            </label>

            <label class="check-option">
              <input v-model="form.completed" type="checkbox" />
              <span>Concluído</span>
            </label>
          </div>

          <footer class="modal-footer">
            <button v-if="isEditing" type="button" class="btn btn-secondary danger-button" :disabled="saving" @click="requestDelete">
              Excluir
            </button>

            <button
              v-if="isEditing && !form.completed"
              type="button"
              class="btn btn-secondary"
              :disabled="saving"
              @click="emit('complete', event)"
            >
              Marcar como concluído
            </button>

            <span class="footer-spacer"></span>

            <button type="button" class="btn btn-secondary" :disabled="saving" @click="emit('close')">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar evento' }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </Transition>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
}

.event-modal {
  width: min(720px, 100%);
  max-height: min(92vh, 840px);
  overflow: auto;
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-lg);
  background: var(--bl-surface);
  color: var(--bl-text);
  box-shadow: var(--shadow-strong);
}

.modal-header {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid var(--bl-border);
  background: var(--bl-surface);
  padding: 1rem 1.12rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.modal-kicker {
  color: var(--bl-primary);
  font-size: 0.78rem;
  font-weight: 900;
}

.modal-header h2 {
  margin-top: 0.18rem;
  font-size: 1.25rem;
}

.modal-close {
  width: 2.1rem;
  height: 2.1rem;
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  background: var(--bl-surface);
  color: var(--bl-muted);
  font-size: 1.35rem;
  line-height: 1;
  cursor: pointer;
}

.event-form {
  padding: 1.12rem;
  display: grid;
  gap: 0.9rem;
}

.form-grid,
.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.82rem;
}

input[type='color'] {
  min-height: 2.95rem;
  padding: 0.28rem;
}

.check-option {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.78rem 0.84rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--bl-text);
  font-weight: 800;
}

.check-option input {
  accent-color: var(--bl-primary);
}

.modal-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.62rem;
  border-top: 1px solid var(--bl-border);
  padding-top: 0.95rem;
}

.footer-spacer {
  flex: 1 1 auto;
}

.danger-button {
  color: var(--bl-danger);
  border-color: rgba(220, 38, 38, 0.24);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

:global(body.theme-dark) .event-modal,
:global(body.theme-dark) .modal-header,
:global(body.theme-dark) .modal-close {
  background: #07111f;
  border-color: rgba(148, 163, 184, 0.18);
}

:global(body.theme-dark) .check-option {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(2, 8, 23, 0.35);
}

@media (max-width: 620px) {
  .form-grid,
  .option-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer .btn,
  .footer-spacer {
    width: 100%;
  }
}
</style>
