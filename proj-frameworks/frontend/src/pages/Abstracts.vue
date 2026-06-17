<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { getSummariesByOwner } from '@/services/summaryService';

const authStore = useAuthStore();

const loading = ref(false);
const search = ref('');
const selectedSubject = ref('Todos');
const selectedStatus = ref('Todos');
const summaries = ref([]);

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

const libraryStats = computed(() => [
  { label: 'Resumos', value: summaries.value.length, detail: 'na biblioteca', tone: 'mint' },
  { label: 'Anexos', value: totalFiles.value, detail: 'arquivos salvos', tone: 'blue' },
  { label: 'Revisados', value: reviewedCount.value, detail: 'conteúdos finalizados', tone: 'amber' },
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

function firstLetters(value) {
  return String(value || 'RS')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  .no-files {
    grid-column: auto;
    grid-row: auto;
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
