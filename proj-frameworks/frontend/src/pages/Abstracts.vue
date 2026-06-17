<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import {
  deleteSummary,
  getSummariesByOwner,
  updateSummary,
  updateSummaryReminder,
  updateSummaryStatus,
} from '@/services/summaryService';

const authStore = useAuthStore();

const loading = ref(false);
const search = ref('');
const selectedSubject = ref('Todos');
const selectedStatus = ref('Todos');
const summaries = ref([]);
const selectedSummary = ref(null);
const saving = ref(false);
const reminderDays = ref(7);

const editForm = reactive({
  title: '',
  subject: '',
  description: '',
  status: 'Novo',
});

const subjects = computed(() => ['Todos', ...new Set(summaries.value.map((item) => item.subject))]);
const statuses = ['Todos', 'Novo', 'Em revisão', 'Revisado'];

const totalFiles = computed(() =>
  summaries.value.reduce((total, item) => total + (Array.isArray(item.files) ? item.files.length : 0), 0),
);

const reviewedCount = computed(
  () => summaries.value.filter((item) => formatStatus(item.status) === 'Revisado').length,
);

const filteredSummaries = computed(() => {
  const query = search.value.trim().toLowerCase();

  return summaries.value.filter((item) => {
    const normalizedStatus = formatStatus(item.status);
    const fileNames = Array.isArray(item.files) ? item.files.map((file) => file.fileName).join(' ') : '';
    const bySubject = selectedSubject.value === 'Todos' || item.subject === selectedSubject.value;
    const byStatus = selectedStatus.value === 'Todos' || normalizedStatus === selectedStatus.value;
    const byQuery = `${item.title} ${item.description} ${item.subject} ${fileNames}`.toLowerCase().includes(query);

    return bySubject && byStatus && byQuery;
  });
});

const pendingReminderCount = computed(() => {
  const now = Date.now();
  return summaries.value.filter((item) => item.reviewReminderAt && new Date(item.reviewReminderAt).getTime() <= now).length;
});

const libraryStats = computed(() => [
  { label: 'Resumos', value: summaries.value.length, detail: 'na biblioteca', tone: 'mint' },
  { label: 'Anexos', value: totalFiles.value, detail: 'arquivos salvos', tone: 'blue' },
  { label: 'Revisados', value: reviewedCount.value, detail: 'conteúdos finalizados', tone: 'amber' },
  { label: 'Lembretes', value: pendingReminderCount.value, detail: 'pendentes hoje', tone: 'rose' },
]);

function statusClass(status) {
  if (status === 'Revisado') return 'revisado';
  if (status === 'Em revisão' || status === 'Em revisao') return 'revisao';
  return 'novo';
}

function formatStatus(status) {
  return status === 'Em revisao' ? 'Em revisão' : status;
}

function formatFileSize(size) {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(date) {
  if (!date) return 'Sem data';
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(date) {
  if (!date) return 'Sem lembrete';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function firstLetters(value) {
  return String(value || 'RS')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function syncSummary(updated) {
  summaries.value = summaries.value.map((item) => (item.id === updated.id ? updated : item));
  if (selectedSummary.value?.id === updated.id) {
    selectedSummary.value = updated;
  }
}

function openSummary(summary) {
  selectedSummary.value = summary;
  editForm.title = summary.title;
  editForm.subject = summary.subject;
  editForm.description = summary.description || '';
  editForm.status = formatStatus(summary.status);
  reminderDays.value = 7;
}

function closeSummary() {
  if (saving.value) return;
  selectedSummary.value = null;
}

async function saveSummaryChanges() {
  if (!selectedSummary.value || saving.value) return;

  saving.value = true;
  try {
    const updated = await updateSummary(selectedSummary.value.id, {
      title: editForm.title,
      subject: editForm.subject,
      description: editForm.description,
      status: editForm.status,
    });
    syncSummary(updated);
  } finally {
    saving.value = false;
  }
}

async function changeStatus(status) {
  if (!selectedSummary.value || saving.value) return;

  await changeSummaryStatus(selectedSummary.value, status);
}

async function changeSummaryStatus(summary, status) {
  if (!summary || saving.value) return;

  saving.value = true;
  try {
    const updated = await updateSummaryStatus(summary.id, status);
    syncSummary(updated);
    editForm.status = formatStatus(updated.status);
  } finally {
    saving.value = false;
  }
}

async function saveReminder() {
  if (!selectedSummary.value || saving.value) return;

  const days = Math.max(1, Number(reminderDays.value) || 1);
  const reminderDate = new Date();
  reminderDate.setDate(reminderDate.getDate() + days);
  reminderDate.setHours(9, 0, 0, 0);

  saving.value = true;
  try {
    const updated = await updateSummaryReminder(selectedSummary.value.id, reminderDate.toISOString());
    syncSummary(updated);
  } finally {
    saving.value = false;
  }
}

async function clearReminder() {
  if (!selectedSummary.value || saving.value) return;

  saving.value = true;
  try {
    const updated = await updateSummaryReminder(selectedSummary.value.id, null);
    syncSummary(updated);
  } finally {
    saving.value = false;
  }
}

async function removeSelectedSummary() {
  if (!selectedSummary.value || saving.value) return;
  const confirmed = window.confirm(`Excluir "${selectedSummary.value.title}"? Esta ação não pode ser desfeita.`);
  if (!confirmed) return;

  saving.value = true;
  try {
    await deleteSummary(selectedSummary.value.id);
    summaries.value = summaries.value.filter((item) => item.id !== selectedSummary.value.id);
    selectedSummary.value = null;
  } finally {
    saving.value = false;
  }
}

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
  <div class="abstracts-page fade-in-up">
    <section class="library-hero">
      <div>
        <span class="badge badge-info">Biblioteca BrainLog</span>
        <h1>Seus resumos em uma biblioteca organizada.</h1>
        <p>Filtre por matéria, status ou arquivo e abra seus materiais sem sair do fluxo de revisão.</p>
      </div>

      <RouterLink to="/upload" class="btn btn-primary">+ Novo resumo</RouterLink>
    </section>

    <section class="surface-card library-controls">
      <div class="library-stats" aria-label="Indicadores da biblioteca">
        <article v-for="stat in libraryStats" :key="stat.label" class="stat-card">
          <span class="stat-icon" :class="stat.tone">{{ firstLetters(stat.label) }}</span>
          <div>
            <small>{{ stat.label }}</small>
            <strong>{{ stat.value }}</strong>
            <p>{{ stat.detail }}</p>
          </div>
        </article>
      </div>

      <div class="filter-card">
        <div class="field search-field">
          <label for="search">Buscar</label>
          <input id="search" v-model.trim="search" type="text" placeholder="Título, descrição, matéria ou arquivo" />
        </div>

        <div class="field">
          <label for="subject">Matéria</label>
          <select id="subject" v-model="selectedSubject">
            <option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option>
          </select>
        </div>

        <div class="field">
          <label for="status">Status</label>
          <select id="status" v-model="selectedStatus">
            <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
      </div>
    </section>

    <section class="library-toolbar">
      <div>
        <strong>{{ filteredSummaries.length }}</strong>
        <span>{{ filteredSummaries.length === 1 ? 'resumo encontrado' : 'resumos encontrados' }}</span>
      </div>
      <button type="button" @click="loadSummaries">Atualizar</button>
    </section>

    <section class="summary-grid">
      <article v-for="item in filteredSummaries" :key="item.id" class="surface-card summary-card">
        <div class="summary-card-top">
          <span class="summary-avatar">{{ firstLetters(item.subject) }}</span>
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description || 'Sem descrição adicionada.' }}</p>
          </div>
          <span class="status" :class="statusClass(item.status)">{{ formatStatus(item.status) }}</span>
        </div>

        <div class="summary-meta">
          <span>{{ item.subject }}</span>
          <span>{{ item.files?.length || 0 }} {{ item.files?.length === 1 ? 'anexo' : 'anexos' }}</span>
          <span>Criado em {{ formatDate(item.createdAt) }}</span>
          <span v-if="item.reviewReminderAt">Revisar em {{ formatDate(item.reviewReminderAt) }}</span>
        </div>

        <div class="summary-actions">
          <RouterLink :to="`/abstracts/${item.id}`">Detalhes</RouterLink>
          <button type="button" @click="changeSummaryStatus(item, item.status === 'Revisado' ? 'Em revisão' : 'Revisado')">
            {{ item.status === 'Revisado' ? 'Reabrir' : 'Revisado' }}
          </button>
        </div>

        <div v-if="item.files?.length" class="summary-files">
          <a
            v-for="file in item.files"
            :key="file.id"
            class="file-action"
            :href="file.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span class="file-badge">PDF</span>
            <span class="file-name">{{ file.fileName }}</span>
            <small v-if="formatFileSize(file.size)">{{ formatFileSize(file.size) }}</small>
            <strong>Abrir</strong>
          </a>
        </div>

        <p v-else class="no-files">Nenhum anexo enviado para este resumo.</p>
      </article>

      <div v-if="loading" class="surface-card empty-state">
        <strong>Carregando biblioteca...</strong>
        <p>Buscando seus resumos salvos.</p>
      </div>

      <div v-else-if="!filteredSummaries.length" class="surface-card empty-state">
        <strong>Nenhum resumo encontrado</strong>
        <p>Ajuste os filtros ou envie um novo material para a biblioteca.</p>
        <RouterLink to="/upload" class="btn btn-primary">Enviar resumo</RouterLink>
      </div>
    </section>

    <div v-if="selectedSummary" class="summary-modal-backdrop" @click.self="closeSummary">
      <section class="summary-modal" aria-labelledby="summary-detail-title">
        <header class="summary-modal-header">
          <div>
            <span class="badge badge-primary">{{ selectedSummary.subject }}</span>
            <h2 id="summary-detail-title">{{ selectedSummary.title }}</h2>
            <p>Criado em {{ formatDateTime(selectedSummary.createdAt) }}</p>
          </div>
          <button type="button" aria-label="Fechar detalhes" @click="closeSummary">×</button>
        </header>

        <div class="summary-detail-grid">
          <form class="detail-form" @submit.prevent="saveSummaryChanges">
            <div class="field">
              <label for="edit-title">Título</label>
              <input id="edit-title" v-model.trim="editForm.title" type="text" />
            </div>

            <div class="field">
              <label for="edit-subject">Matéria</label>
              <input id="edit-subject" v-model.trim="editForm.subject" type="text" />
            </div>

            <div class="field">
              <label for="edit-status">Status</label>
              <select id="edit-status" v-model="editForm.status">
                <option v-for="status in statuses.filter((item) => item !== 'Todos')" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>

            <div class="field detail-description">
              <label for="edit-description">Descrição</label>
              <textarea id="edit-description" v-model.trim="editForm.description" />
            </div>

            <div class="modal-actions">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                {{ saving ? 'Salvando...' : 'Salvar alterações' }}
              </button>
              <button type="button" class="btn btn-secondary" :disabled="saving" @click="changeStatus('Revisado')">
                Marcar revisado
              </button>
              <button type="button" class="danger-button" :disabled="saving" @click="removeSelectedSummary">
                Excluir resumo
              </button>
            </div>
          </form>

          <aside class="detail-side">
            <section class="detail-box">
              <h3>Anexos</h3>
              <div v-if="selectedSummary.files?.length" class="detail-files">
                <a
                  v-for="file in selectedSummary.files"
                  :key="file.id"
                  :href="file.url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span class="file-badge">PDF</span>
                  <strong>{{ file.fileName }}</strong>
                  <small>{{ formatFileSize(file.size) }}</small>
                </a>
              </div>
              <p v-else class="detail-empty">Nenhum anexo enviado.</p>
            </section>

            <section class="detail-box">
              <h3>Lembrete de revisão</h3>
              <p>
                Atual:
                <strong>{{ selectedSummary.reviewReminderAt ? formatDateTime(selectedSummary.reviewReminderAt) : 'sem lembrete' }}</strong>
              </p>
              <div class="reminder-control">
                <label for="reminder-days">Lembrar-me em</label>
                <input id="reminder-days" v-model.number="reminderDays" type="number" min="1" max="365" />
                <span>dias</span>
              </div>
              <div class="reminder-actions">
                <button type="button" class="btn btn-primary" :disabled="saving" @click="saveReminder">Salvar lembrete</button>
                <button type="button" class="btn btn-secondary" :disabled="saving || !selectedSummary.reviewReminderAt" @click="clearReminder">
                  Limpar
                </button>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.abstracts-page {
  display: grid;
  gap: 1rem;
}

.library-hero {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-lg);
  padding: 1.05rem 1.12rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background:
    radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.1), transparent 34%),
    linear-gradient(145deg, #effcf9, #ffffff);
  box-shadow: var(--shadow-soft);
}

:global(body.theme-dark) .library-hero {
  background:
    radial-gradient(circle at 100% 0%, rgba(18, 214, 196, 0.12), transparent 34%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.96), rgba(5, 13, 26, 0.98));
}

:global(body.theme-dark) .library-hero .badge-info {
  color: #7dd3fc;
}

.library-hero h1 {
  margin-top: 0.46rem;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  line-height: 1.12;
}

.library-hero p {
  margin-top: 0.58rem;
  color: var(--bl-muted);
  line-height: 1.55;
  max-width: 66ch;
}

.library-controls {
  padding: 0.9rem;
  display: grid;
  gap: 0.85rem;
}

.library-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
}

.stat-card {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  padding: 0.72rem;
  display: flex;
  align-items: center;
  gap: 0.68rem;
  background: rgba(248, 250, 252, 0.55);
}

:global(body.theme-dark) .stat-card {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(148, 163, 184, 0.16);
}

.stat-icon,
.summary-avatar,
.file-badge {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-weight: 900;
}

.stat-icon {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  font-size: 0.74rem;
}

.mint {
  background: #ccfbf1;
  color: #0f766e;
}

.blue {
  background: #dbeafe;
  color: #2563eb;
}

.amber {
  background: #fef3c7;
  color: #d97706;
}

.rose {
  background: #fee2e2;
  color: #dc2626;
}

.stat-card small {
  color: var(--bl-muted);
  font-weight: 800;
}

.stat-card strong {
  display: block;
  font-family: 'Sora', sans-serif;
  font-size: 1.18rem;
}

.stat-card p {
  color: var(--bl-muted);
  font-size: 0.76rem;
}

.filter-card {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(190px, 0.85fr) minmax(190px, 0.85fr);
  gap: 0.72rem;
}

.library-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  color: var(--bl-muted);
  font-weight: 800;
}

.library-toolbar strong {
  color: var(--bl-text);
}

.library-toolbar button {
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  padding: 0.48rem 0.78rem;
  background: var(--bl-surface);
  color: var(--bl-primary);
  font-weight: 900;
}

:global(body.theme-dark) .library-toolbar button {
  color: var(--bl-primary);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}

.summary-card {
  padding: 0.85rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.78fr);
  gap: 0.85rem;
  align-items: center;
}

.summary-card-top {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 0.78rem;
  align-items: start;
}

.summary-avatar {
  width: 2.55rem;
  height: 2.55rem;
  border-radius: 14px;
  background: var(--bl-primary-soft);
  color: var(--bl-primary);
  font-size: 0.78rem;
}

.summary-card h2 {
  font-size: 1rem;
}

.summary-card-top p,
.no-files {
  margin-top: 0.38rem;
  color: var(--bl-muted);
  line-height: 1.55;
  font-size: 0.88rem;
}

.summary-meta {
  grid-column: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.48rem;
}

.summary-actions {
  grid-column: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.summary-actions a,
.summary-actions button,
.danger-button {
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  padding: 0.42rem 0.72rem;
  background: var(--bl-surface);
  color: var(--bl-primary);
  font-weight: 900;
  cursor: pointer;
}

.summary-actions a:hover,
.summary-actions button:hover {
  border-color: rgba(15, 118, 110, 0.36);
  background: var(--bl-primary-soft);
}

.danger-button {
  color: var(--bl-danger);
}

.danger-button:hover {
  border-color: #fecaca;
  background: #fef2f2;
}

.summary-meta span {
  border-radius: 999px;
  padding: 0.22rem 0.58rem;
  background: rgba(15, 118, 110, 0.08);
  color: var(--bl-primary);
  font-size: 0.76rem;
  font-weight: 900;
}

:global(body.theme-dark) .summary-meta span {
  background: rgba(18, 214, 196, 0.12);
  color: var(--bl-primary);
}

.summary-files {
  grid-column: 2;
  grid-row: 1 / span 2;
  display: grid;
  gap: 0.52rem;
}

.file-action {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.58rem;
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.58rem 0.66rem;
  background: rgba(248, 250, 252, 0.78);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

:global(body.theme-dark) .file-action {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(148, 163, 184, 0.14);
}

.file-action:hover {
  transform: translateY(-1px);
  border-color: rgba(15, 118, 110, 0.4);
  background: var(--bl-primary-soft);
}

:global(body.theme-dark) .file-action:hover {
  border-color: rgba(18, 214, 196, 0.36);
  background: rgba(18, 214, 196, 0.1);
}

.file-badge {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.62rem;
}

.file-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--bl-text);
  font-size: 0.86rem;
  font-weight: 900;
}

.file-action small {
  color: var(--bl-muted);
  font-size: 0.76rem;
  font-weight: 800;
}

.file-action strong {
  color: var(--bl-primary);
  font-size: 0.82rem;
}

:global(body.theme-dark) .file-action strong {
  color: var(--bl-primary);
}

.no-files {
  grid-column: 2;
  grid-row: 1 / span 2;
  margin: 0;
  border: 1px dashed var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.7rem;
  text-align: center;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 1.15rem;
  display: grid;
  justify-items: center;
  gap: 0.48rem;
  color: var(--bl-muted);
  text-align: center;
}

.empty-state strong {
  color: var(--bl-text);
}

.summary-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgba(2, 6, 23, 0.68);
  backdrop-filter: blur(10px);
}

.summary-modal {
  width: min(1040px, 100%);
  max-height: min(860px, calc(100vh - 2rem));
  overflow: auto;
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-lg);
  background: var(--bl-surface);
  box-shadow: var(--shadow-strong);
}

:global(body.theme-dark) .summary-modal {
  background:
    radial-gradient(circle at 12% 0%, rgba(18, 214, 196, 0.07), transparent 30%),
    linear-gradient(145deg, rgba(9, 20, 34, 0.98), rgba(5, 13, 26, 0.99));
  border-color: rgba(148, 163, 184, 0.16);
}

.summary-modal-header {
  border-bottom: 1px solid var(--bl-border);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.summary-modal-header h2 {
  margin-top: 0.5rem;
  font-size: 1.45rem;
}

.summary-modal-header p {
  margin-top: 0.32rem;
  color: var(--bl-muted);
  font-weight: 800;
}

.summary-modal-header button {
  width: 2.4rem;
  height: 2.4rem;
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  background: var(--bl-surface);
  color: var(--bl-muted);
  font-size: 1.35rem;
  font-weight: 900;
  cursor: pointer;
}

.summary-detail-grid {
  padding: 1rem;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 1rem;
}

.detail-form,
.detail-side,
.detail-box {
  display: grid;
  gap: 0.8rem;
}

.detail-description {
  grid-column: 1 / -1;
}

.detail-description textarea {
  min-height: 150px;
}

.modal-actions,
.reminder-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.detail-box {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  padding: 0.9rem;
  background: rgba(248, 250, 252, 0.55);
}

:global(body.theme-dark) .detail-box {
  background: rgba(15, 23, 42, 0.42);
  border-color: rgba(148, 163, 184, 0.14);
}

.detail-box h3 {
  font-size: 0.98rem;
}

.detail-box p,
.detail-empty {
  color: var(--bl-muted);
  line-height: 1.5;
}

.detail-box strong {
  color: var(--bl-text);
}

.detail-files {
  display: grid;
  gap: 0.5rem;
}

.detail-files a {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.58rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
}

.detail-files strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-files small {
  color: var(--bl-muted);
  font-weight: 800;
}

.reminder-control {
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

@media (max-width: 980px) {
  .library-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .library-stats,
  .filter-card,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    grid-template-columns: 1fr;
  }

  .summary-files,
  .no-files,
  .summary-actions {
    grid-column: auto;
    grid-row: auto;
  }

  .summary-detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .summary-card-top,
  .file-action {
    grid-template-columns: 1fr;
  }

  .summary-avatar,
  .file-badge {
    display: none;
  }
}
</style>
