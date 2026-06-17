<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  deleteSummary,
  getSummary,
  updateSummary,
  updateSummaryReminder,
  updateSummaryStatus,
} from '@/services/summaryService';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const summary = ref(null);
const reminderDays = ref(7);
const statuses = ['Novo', 'Em revisão', 'Revisado'];

const form = reactive({
  title: '',
  subject: '',
  description: '',
  status: 'Novo',
});

const summaryId = computed(() => Number(route.params.id));

function fillForm(item) {
  form.title = item.title;
  form.subject = item.subject;
  form.description = item.description || '';
  form.status = item.status;
}

function formatFileSize(size) {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatDateTime(date) {
  if (!date) return 'Sem data';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadSummary() {
  if (!summaryId.value) return;

  loading.value = true;
  try {
    summary.value = await getSummary(summaryId.value);
    fillForm(summary.value);
  } finally {
    loading.value = false;
  }
}

async function saveChanges() {
  if (!summary.value || saving.value) return;

  saving.value = true;
  try {
    summary.value = await updateSummary(summary.value.id, {
      title: form.title,
      subject: form.subject,
      description: form.description,
      status: form.status,
    });
    fillForm(summary.value);
  } finally {
    saving.value = false;
  }
}

async function changeStatus(status) {
  if (!summary.value || saving.value) return;

  saving.value = true;
  try {
    summary.value = await updateSummaryStatus(summary.value.id, status);
    fillForm(summary.value);
  } finally {
    saving.value = false;
  }
}

async function saveReminder() {
  if (!summary.value || saving.value) return;

  const days = Math.max(1, Number(reminderDays.value) || 1);
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + days);
  reminderDate.setHours(9, 0, 0, 0);

  saving.value = true;
  try {
    summary.value = await updateSummaryReminder(summary.value.id, reminderDate.toISOString());
  } finally {
    saving.value = false;
  }
}

async function clearReminder() {
  if (!summary.value || saving.value) return;

  saving.value = true;
  try {
    summary.value = await updateSummaryReminder(summary.value.id, null);
  } finally {
    saving.value = false;
  }
}

async function removeSummary() {
  if (!summary.value || saving.value) return;
  const confirmed = window.confirm(`Excluir "${summary.value.title}"? Esta ação não pode ser desfeita.`);
  if (!confirmed) return;

  saving.value = true;
  try {
    await deleteSummary(summary.value.id);
    router.push('/abstracts');
  } finally {
    saving.value = false;
  }
}

onMounted(loadSummary);
</script>

<template>
  <div class="summary-detail-page fade-in-up">
    <RouterLink to="/abstracts" class="back-link">← Voltar para biblioteca</RouterLink>

    <section v-if="loading" class="surface-card detail-empty">
      <strong>Carregando resumo...</strong>
      <p>Buscando detalhes salvos.</p>
    </section>

    <section v-else-if="summary" class="detail-layout">
      <article class="surface-card detail-main">
        <header>
          <span class="badge badge-primary">{{ summary.subject }}</span>
          <h1>{{ summary.title }}</h1>
          <p>Criado em {{ formatDateTime(summary.createdAt) }}</p>
        </header>

        <form class="detail-form" @submit.prevent="saveChanges">
          <div class="field">
            <label for="title">Título</label>
            <input id="title" v-model.trim="form.title" type="text" />
          </div>

          <div class="field">
            <label for="subject">Matéria</label>
            <input id="subject" v-model.trim="form.subject" type="text" />
          </div>

          <div class="field">
            <label for="status">Status</label>
            <select id="status" v-model="form.status">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>

          <div class="field full">
            <label for="description">Descrição</label>
            <textarea id="description" v-model.trim="form.description" />
          </div>

          <div class="detail-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Salvando...' : 'Salvar alterações' }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="changeStatus('Revisado')">
              Marcar revisado
            </button>
            <button type="button" class="danger-button" :disabled="saving" @click="removeSummary">Excluir resumo</button>
          </div>
        </form>
      </article>

      <aside class="detail-side">
        <section class="surface-card side-panel">
          <h2>Anexos</h2>
          <div v-if="summary.files?.length" class="file-list">
            <a v-for="file in summary.files" :key="file.id" :href="file.url" target="_blank" rel="noopener noreferrer">
              <span>PDF</span>
              <strong>{{ file.fileName }}</strong>
              <small>{{ formatFileSize(file.size) }}</small>
            </a>
          </div>
          <p v-else>Nenhum anexo enviado para este resumo.</p>
        </section>

        <section class="surface-card side-panel">
          <h2>Lembrete de revisão</h2>
          <p>Atual: <strong>{{ summary.reviewReminderAt ? formatDateTime(summary.reviewReminderAt) : 'sem lembrete' }}</strong></p>
          <div class="reminder-control">
            <label for="reminder-days">Lembrar-me em</label>
            <input id="reminder-days" v-model.number="reminderDays" type="number" min="1" max="365" />
            <span>dias</span>
          </div>
          <div class="detail-actions">
            <button type="button" class="btn btn-primary" :disabled="saving" @click="saveReminder">Salvar lembrete</button>
            <button type="button" class="btn btn-secondary" :disabled="saving || !summary.reviewReminderAt" @click="clearReminder">
              Limpar
            </button>
          </div>
        </section>
      </aside>
    </section>

    <section v-else class="surface-card detail-empty">
      <strong>Resumo não encontrado</strong>
      <p>Volte para a biblioteca e escolha outro resumo.</p>
    </section>
  </div>
</template>

<style scoped>
.summary-detail-page {
  display: grid;
  gap: 1rem;
}

.back-link {
  width: fit-content;
  color: var(--bl-primary);
  font-weight: 900;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
  gap: 1rem;
}

.detail-main,
.side-panel,
.detail-empty {
  padding: 1rem;
}

.detail-main header h1 {
  margin-top: 0.58rem;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
}

.detail-main header p,
.side-panel p,
.detail-empty p {
  margin-top: 0.4rem;
  color: var(--bl-muted);
  line-height: 1.55;
}

.detail-form {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.full {
  grid-column: 1 / -1;
}

.full textarea {
  min-height: 170px;
}

.detail-actions {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.danger-button {
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  padding: 0.62rem 1.04rem;
  background: var(--bl-surface);
  color: var(--bl-danger);
  font-weight: 900;
  cursor: pointer;
}

.danger-button:hover {
  border-color: #fecaca;
  background: #fef2f2;
}

.detail-side {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.side-panel h2 {
  font-size: 1rem;
}

.file-list {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.55rem;
}

.file-list a {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.62rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
}

.file-list span {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.62rem;
  font-weight: 900;
}

.file-list strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list small {
  color: var(--bl-muted);
  font-weight: 800;
}

.reminder-control {
  margin-top: 0.8rem;
  display: grid;
  grid-template-columns: 1fr 5.5rem auto;
  align-items: center;
  gap: 0.55rem;
}

.reminder-control label,
.reminder-control span {
  color: var(--bl-muted);
  font-weight: 800;
}

.reminder-control input {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.62rem;
  background: var(--bl-surface);
  color: var(--bl-text);
  font-weight: 900;
}

.detail-empty {
  display: grid;
  justify-items: center;
  text-align: center;
}

@media (max-width: 940px) {
  .detail-layout,
  .detail-form {
    grid-template-columns: 1fr;
  }
}
</style>
