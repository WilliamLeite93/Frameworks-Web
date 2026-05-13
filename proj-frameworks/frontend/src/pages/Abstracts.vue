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

const filteredSummaries = computed(() => {
  const query = search.value.trim().toLowerCase();

  return summaries.value.filter((item) => {
    const normalizedStatus = item.status === 'Em revisao' ? 'Em revisão' : item.status;
    const bySubject = selectedSubject.value === 'Todos' || item.subject === selectedSubject.value;
    const byStatus = selectedStatus.value === 'Todos' || normalizedStatus === selectedStatus.value;
    const byQuery = `${item.title} ${item.description} ${item.subject}`.toLowerCase().includes(query);

    return bySubject && byStatus && byQuery;
  });
});

function statusClass(status) {
  if (status === 'Revisado') return 'revisado';
  if (status === 'Em revisão' || status === 'Em revisao') return 'revisao';
  return 'novo';
}

function formatStatus(status) {
  return status === 'Em revisao' ? 'Em revisão' : status;
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
  <div class="page fade-in-up">
    <section class="surface-card hero-card">
      <span class="badge badge-info">Biblioteca BrainLog</span>
      <h1 class="section-title">Seus resumos em uma biblioteca organizada.</h1>
      <p class="section-subtitle">
        Filtre por matéria e status, busque por palavras-chave e mantenha sua revisão sempre acessível.
      </p>
    </section>

    <section class="surface-card filter-card">
      <div class="field">
        <label for="search">Buscar</label>
        <input id="search" v-model.trim="search" type="text" placeholder="Busque por título, descrição ou matéria" />
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
    </section>

    <section class="summary-grid">
      <article v-for="item in filteredSummaries" :key="item.id" class="surface-card summary-card">
        <div class="summary-head">
          <strong>{{ item.title }}</strong>
          <span class="status" :class="statusClass(item.status)">{{ formatStatus(item.status) }}</span>
        </div>
        <p>{{ item.description }}</p>
        <small>{{ item.subject }}</small>
      </article>

      <p v-if="loading" class="surface-card empty">Carregando biblioteca...</p>
      <p v-else-if="!filteredSummaries.length" class="surface-card empty">
        Nenhum resumo encontrado para os filtros atuais.
      </p>
    </section>
  </div>
</template>

<style scoped>
.filter-card {
  padding: 0.95rem;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 0.72rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.74rem;
}

.summary-card {
  padding: 0.96rem;
}

.summary-head {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 0.64rem;
}

.summary-head strong {
  font-size: 0.96rem;
}

.summary-card p {
  margin-top: 0.55rem;
  color: var(--bl-muted);
  line-height: 1.55;
  font-size: 0.89rem;
}

.summary-card small {
  display: inline-block;
  margin-top: 0.64rem;
  font-weight: 800;
  color: var(--bl-primary);
}

.empty {
  grid-column: 1 / -1;
  padding: 0.96rem;
  color: var(--bl-muted);
  text-align: center;
}

@media (max-width: 980px) {
  .filter-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

