<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useFiles } from '@/hooks/useFiles';
import { createSummary, uploadSummaryFiles } from '@/services/summaryService';

const authStore = useAuthStore();
const { files, addFiles, removeFile, clearFiles } = useFiles();

const loading = ref(false);
const feedback = ref('');

const form = reactive({
  title: '',
  subject: 'Matemática',
  description: '',
});

function handleSelectFile(event) {
  addFiles(event.target.files);
  event.target.value = '';
}

async function handleSubmit() {
  if (!form.title || !form.subject) {
    feedback.value = 'Informe pelo menos título e matéria.';
    return;
  }

  loading.value = true;
  feedback.value = '';

  try {
    const summary = await createSummary({
      ownerId: authStore.user.id,
      title: form.title,
      subject: form.subject,
      description: form.description,
      fileNames: [],
    });

    await uploadSummaryFiles(summary.id, files.value);

    form.title = '';
    form.subject = 'Matemática';
    form.description = '';
    clearFiles();
    feedback.value = 'Resumo enviado com sucesso para sua biblioteca.';
  } catch {
    feedback.value = 'Falha ao enviar resumo.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page fade-in-up">
    <section class="surface-card hero-card">
      <span class="badge badge-primary">Upload de resumos</span>
      <h1 class="section-title">Adicione novos materiais ao seu plano de estudos.</h1>
      <p class="section-subtitle">Centralize arquivos e observações para revisar com agilidade ao longo da semana.</p>
    </section>

    <section class="grid-2">
      <article class="surface-card panel-card">
        <h2>Novo resumo</h2>

        <form @submit.prevent="handleSubmit">
          <div class="field">
            <label for="title">Título</label>
            <input id="title" v-model.trim="form.title" type="text" placeholder="Ex: Geometria plana" />
          </div>

          <div class="field">
            <label for="subject">Matéria</label>
            <select id="subject" v-model="form.subject">
              <option value="Matemática">Matemática</option>
              <option value="História">História</option>
              <option value="Química">Química</option>
              <option value="Física">Física</option>
              <option value="Biologia">Biologia</option>
              <option value="Português">Português</option>
              <option value="Redação">Redação</option>
            </select>
          </div>

          <div class="field">
            <label for="description">Descrição</label>
            <textarea
              id="description"
              v-model.trim="form.description"
              placeholder="Descreva rapidamente o conteúdo deste resumo"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Salvar resumo' }}
          </button>
        </form>

        <p v-if="feedback" class="feedback">{{ feedback }}</p>
      </article>

      <article class="surface-card panel-card">
        <h2>Anexos</h2>
        <p class="panel-subtitle">Anexe arquivos para manter o material completo na biblioteca.</p>

        <label class="file-picker">
          <input type="file" multiple @change="handleSelectFile" />
          <span>Selecionar arquivos</span>
        </label>

        <ul class="list-reset file-list">
          <li v-for="(file, index) in files" :key="`${file.name}-${index}`">
            <div>
              <strong>{{ file.name }}</strong>
              <small>{{ file.size }}</small>
            </div>
            <button type="button" @click="removeFile(index)">Remover</button>
          </li>
          <li v-if="!files.length" class="empty">Nenhum arquivo selecionado.</li>
        </ul>
      </article>
    </section>
  </div>
</template>

<style scoped>
.panel-card {
  padding: 1rem;
}

.panel-card h2 {
  font-size: 1.1rem;
  margin-bottom: 0.72rem;
}

.panel-subtitle {
  color: var(--bl-muted);
  margin-bottom: 0.62rem;
}

form {
  display: grid;
  gap: 0.72rem;
}

form .btn {
  width: 100%;
}

.feedback {
  margin-top: 0.76rem;
  color: var(--bl-success);
  font-weight: 800;
  font-size: 0.86rem;
}

.file-picker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 2px dashed var(--bl-border);
  border-radius: var(--radius-md);
  padding: 1.05rem;
  cursor: pointer;
  background: #f8fafc;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.file-picker:hover {
  border-color: rgba(15, 118, 110, 0.45);
  background: #f0fdfa;
}

.file-picker input {
  display: none;
}

.file-picker span {
  color: var(--bl-primary);
  font-weight: 800;
}

.file-list {
  margin-top: 0.84rem;
  display: grid;
  gap: 0.55rem;
}

.file-list li {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  padding: 0.6rem;
  display: flex;
  justify-content: space-between;
  gap: 0.66rem;
  align-items: center;
}

.file-list strong {
  display: block;
  font-size: 0.89rem;
}

.file-list small {
  font-size: 0.76rem;
  color: var(--bl-muted);
}

.file-list button {
  border: 1px solid var(--bl-border);
  background: #fff;
  border-radius: 10px;
  padding: 0.28rem 0.6rem;
  color: var(--bl-muted);
}

.file-list button:hover {
  color: var(--bl-danger);
  border-color: #fecaca;
  background: #fef2f2;
}

.file-list .empty {
  justify-content: center;
  color: var(--bl-muted);
  font-size: 0.86rem;
}
</style>

