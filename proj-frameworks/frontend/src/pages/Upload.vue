<script setup>
import { computed, reactive, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useFiles } from '@/hooks/useFiles';
import { createSummary, uploadSummaryFiles } from '@/services/summaryService';

const authStore = useAuthStore();
const { files, addFiles, removeFile, clearFiles } = useFiles();

const loading = ref(false);
const feedback = ref('');
const isDragging = ref(false);

const form = reactive({
  title: '',
  subject: 'Matemática',
  description: '',
});

const recentUploads = [
  { title: 'Funções do 1º grau - Resumo', meta: 'Matemática - PDF - 1.2 MB', time: 'Hoje, 10:42', type: 'PDF' },
  { title: 'História do Brasil - Lista de exercícios', meta: 'História - DOCX - 2.4 MB', time: 'Ontem, 18:30', type: 'DOC' },
  { title: 'Mapa mental - Fotossíntese', meta: 'Biologia - PNG - 890 KB', time: 'Ontem, 16:15', type: 'IMG' },
];

const fileCountLabel = computed(() => `${files.value.length} ${files.value.length === 1 ? 'arquivo' : 'arquivos'}`);

function handleSelectFile(event) {
  addFiles(event.target.files);
  event.target.value = '';
}

function handleDrop(event) {
  isDragging.value = false;
  addFiles(event.dataTransfer?.files);
}

function formatFileSize(size) {
  if (!size) return '';
  if (typeof size === 'string') return size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function fileType(name) {
  const extension = String(name || '').split('.').pop()?.toUpperCase();
  return extension?.slice(0, 3) || 'ARQ';
}

async function handleSubmit() {
  if (loading.value) return;

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
  <div class="upload-page fade-in-up">
    <section class="upload-hero">
      <div>
        <span class="badge badge-primary">Upload de resumos</span>
        <h1>Adicione novos materiais ao seu plano de estudos.</h1>
        <p>Centralize arquivos e observações para revisar com agilidade ao longo da semana.</p>
      </div>
      <div class="hero-folder" aria-hidden="true">
        <span>PDF</span>
        <strong>BL</strong>
        <i />
      </div>
    </section>

    <section class="upload-workspace">
      <article class="surface-card form-panel">
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
            <label for="description">Descrição (opcional)</label>
            <textarea
              id="description"
              v-model.trim="form.description"
              placeholder="Descreva rapidamente o conteúdo deste resumo"
            />
          </div>

          <div class="tips-box">
            <strong>Dicas para um bom resumo</strong>
            <span>Seja objetivo e foque no que é mais importante.</span>
            <span>Use tópicos, mapas mentais e exemplos.</span>
            <span>Revise periodicamente para fixar melhor o conteúdo.</span>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar resumo' }}
          </button>
        </form>

        <p v-if="feedback" class="feedback">{{ feedback }}</p>
      </article>

      <article class="surface-card attachment-panel">
        <header>
          <div>
            <h2>Anexos</h2>
            <p>Anexe arquivos para manter o material completo na biblioteca.</p>
          </div>
          <span class="info-pill">{{ fileCountLabel }}</span>
        </header>

        <label
          class="drop-zone"
          :class="{ dragging: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input type="file" multiple @change="handleSelectFile" />
          <span class="upload-cloud">UP</span>
          <strong>Arraste e solte seus arquivos aqui</strong>
          <small>ou</small>
          <b>Selecionar arquivos</b>
          <em>Formatos aceitos: PDF, DOCX, PPTX, TXT, PNG, JPG. Tamanho máximo: 10MB por arquivo.</em>
        </label>

        <div class="sent-files">
          <div class="section-label">
            <h3>Arquivos enviados</h3>
            <span>{{ fileCountLabel }}</span>
          </div>

          <ul v-if="files.length" class="list-reset file-list">
            <li v-for="(file, index) in files" :key="`${file.name}-${index}`">
              <span class="file-type">{{ fileType(file.name) }}</span>
              <div>
                <strong>{{ file.name }}</strong>
                <small>{{ formatFileSize(file.size) }}</small>
              </div>
              <button type="button" @click="removeFile(index)">Remover</button>
            </li>
          </ul>

          <div v-else class="empty-files">
            <span>ARQ</span>
            <strong>Nenhum arquivo enviado ainda.</strong>
            <p>Adicione seus arquivos para começar.</p>
          </div>
        </div>
      </article>
    </section>

    <section class="surface-card recent-card">
      <div class="section-label">
        <h2>Seus uploads recentes</h2>
        <RouterLink to="/abstracts">Ver todos</RouterLink>
      </div>

      <div class="recent-list">
        <article v-for="item in recentUploads" :key="item.title" class="recent-item">
          <span class="file-type">{{ item.type }}</span>
          <div>
            <strong>{{ item.title }}</strong>
            <small>{{ item.meta }}</small>
          </div>
          <time>{{ item.time }}</time>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.upload-page {
  display: grid;
  gap: 1rem;
}

.upload-hero {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  min-height: 170px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background:
    radial-gradient(circle at 100% 0%, rgba(6, 182, 212, 0.1), transparent 34%),
    linear-gradient(145deg, #effcf9, #ffffff);
  box-shadow: var(--shadow-soft);
}

:global(body.theme-dark) .upload-hero {
  background:
    radial-gradient(circle at 100% 0%, rgba(45, 212, 191, 0.18), transparent 34%),
    linear-gradient(145deg, rgba(5, 54, 49, 0.98), rgba(1, 23, 21, 0.96));
}

.upload-hero h1 {
  margin-top: 0.6rem;
  font-size: clamp(1.8rem, 3vw, 2.35rem);
  line-height: 1.12;
}

.upload-hero p {
  margin-top: 0.85rem;
  color: var(--bl-muted);
  line-height: 1.65;
  max-width: 54ch;
}

.hero-folder {
  width: min(220px, 26vw);
  aspect-ratio: 1.2;
  border-radius: 30px;
  position: relative;
  display: grid;
  place-items: center;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0.15)),
    linear-gradient(145deg, #6ee7b7, #14b8a6);
  box-shadow: 0 28px 44px rgba(15, 118, 110, 0.22);
}

.hero-folder::before {
  content: '';
  position: absolute;
  width: 68%;
  height: 24%;
  left: 12%;
  top: -8%;
  border-radius: 18px 18px 0 0;
  background: #a7f3d0;
}

.hero-folder span,
.hero-folder strong,
.hero-folder i {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 14px;
  box-shadow: var(--shadow-soft);
  font-size: 0.72rem;
  font-style: normal;
  font-weight: 900;
}

.hero-folder span {
  width: 3rem;
  height: 3rem;
  top: -1rem;
  left: 18%;
  background: #fee2e2;
  color: #dc2626;
  transform: rotate(-8deg);
}

.hero-folder strong {
  width: 3.2rem;
  height: 3.2rem;
  top: 1rem;
  right: -0.3rem;
  background: #dbeafe;
  color: #2563eb;
  transform: rotate(9deg);
}

.hero-folder i {
  width: 2.8rem;
  height: 2.8rem;
  left: -0.8rem;
  top: 2.2rem;
  background: #ccfbf1;
  color: #0f766e;
}

.upload-workspace {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 0.9rem;
}

.form-panel,
.attachment-panel,
.recent-card {
  padding: 1.15rem;
}

.form-panel h2,
.attachment-panel h2,
.recent-card h2 {
  font-size: 1.05rem;
}

form {
  margin-top: 0.9rem;
  display: grid;
  gap: 0.86rem;
}

form .btn {
  width: 100%;
}

.tips-box {
  border-radius: var(--radius-md);
  padding: 0.82rem;
  display: grid;
  gap: 0.42rem;
  background: linear-gradient(135deg, rgba(204, 251, 241, 0.72), rgba(224, 242, 254, 0.54));
}

:global(body.theme-dark) .tips-box {
  border: 1px solid rgba(45, 212, 191, 0.24);
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.24), rgba(14, 165, 233, 0.14));
}

.tips-box strong {
  color: var(--bl-primary);
  font-size: 0.86rem;
}

:global(body.theme-dark) .tips-box strong {
  color: #5eead4;
}

.tips-box span {
  color: var(--bl-muted);
  font-size: 0.82rem;
}

:global(body.theme-dark) .tips-box span {
  color: #cbd5e1;
}

.tips-box span::before {
  content: '✓';
  margin-right: 0.42rem;
  color: var(--bl-primary);
  font-weight: 900;
}

.feedback {
  margin-top: 0.76rem;
  color: var(--bl-success);
  font-weight: 800;
  font-size: 0.86rem;
}

.attachment-panel header,
.section-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.8rem;
}

.attachment-panel header p {
  margin-top: 0.5rem;
  color: var(--bl-muted);
}

.info-pill,
.section-label span {
  border-radius: 999px;
  padding: 0.22rem 0.58rem;
  background: var(--bl-primary-soft);
  color: var(--bl-primary);
  font-size: 0.76rem;
  font-weight: 900;
}

.drop-zone {
  margin-top: 1rem;
  min-height: 210px;
  border: 2px dashed rgba(15, 118, 110, 0.38);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: grid;
  place-items: center;
  gap: 0.5rem;
  text-align: center;
  cursor: pointer;
  background:
    radial-gradient(circle at 50% 8%, rgba(45, 212, 191, 0.16), transparent 32%),
    rgba(240, 253, 250, 0.55);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

:global(body.theme-dark) .drop-zone {
  border-color: rgba(45, 212, 191, 0.42);
  background:
    radial-gradient(circle at 50% 8%, rgba(45, 212, 191, 0.18), transparent 34%),
    rgba(5, 54, 49, 0.72);
}

.drop-zone.dragging,
.drop-zone:hover {
  transform: translateY(-1px);
  border-color: var(--bl-primary);
  background: rgba(204, 251, 241, 0.72);
}

:global(body.theme-dark) .drop-zone.dragging,
:global(body.theme-dark) .drop-zone:hover {
  border-color: #5eead4;
  background: rgba(20, 184, 166, 0.16);
}

.drop-zone input {
  display: none;
}

.upload-cloud {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--bl-primary-soft);
  color: var(--bl-primary);
  font-weight: 900;
}

.drop-zone strong {
  font-size: 1rem;
}

:global(body.theme-dark) .drop-zone strong {
  color: #f8fafc;
}

.drop-zone small,
.drop-zone em {
  color: var(--bl-muted);
}

:global(body.theme-dark) .drop-zone small,
:global(body.theme-dark) .drop-zone em {
  color: #cbd5e1;
}

.drop-zone b {
  border: 1px solid rgba(15, 118, 110, 0.28);
  border-radius: 999px;
  padding: 0.54rem 1.1rem;
  color: var(--bl-primary);
}

:global(body.theme-dark) .drop-zone b {
  border-color: rgba(94, 234, 212, 0.44);
  color: #5eead4;
}

.drop-zone em {
  max-width: 34rem;
  font-size: 0.78rem;
  font-style: normal;
  line-height: 1.5;
}

.sent-files {
  margin-top: 1.05rem;
  padding-top: 1rem;
  border-top: 1px solid var(--bl-border);
}

.file-list {
  margin-top: 0.7rem;
  display: grid;
  gap: 0.55rem;
}

.file-list li,
.recent-item {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.68rem;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.72rem;
}

.file-type {
  width: 2.45rem;
  height: 2.45rem;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #fee2e2;
  color: #dc2626;
  font-size: 0.68rem;
  font-weight: 900;
}

.file-list strong,
.recent-item strong {
  display: block;
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-list small,
.recent-item small,
.recent-item time {
  color: var(--bl-muted);
  font-size: 0.76rem;
}

.file-list button {
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  padding: 0.34rem 0.66rem;
  background: var(--bl-surface);
  color: var(--bl-muted);
  font-weight: 800;
}

.file-list button:hover {
  color: var(--bl-danger);
  border-color: #fecaca;
  background: #fef2f2;
}

:global(body.theme-dark) .file-list button:hover {
  color: #5eead4;
  border-color: rgba(45, 212, 191, 0.42);
  background: rgba(20, 184, 166, 0.16);
}

.empty-files {
  margin-top: 0.7rem;
  min-height: 150px;
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-md);
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 0.34rem;
  color: var(--bl-muted);
  text-align: center;
}

.empty-files span {
  width: 3.6rem;
  height: 3rem;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: #e2e8f0;
  color: #64748b;
  font-weight: 900;
}

.empty-files strong {
  color: var(--bl-text);
}

.recent-list {
  margin-top: 0.9rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.section-label a {
  color: var(--bl-primary);
  font-size: 0.82rem;
  font-weight: 900;
}

@media (max-width: 1060px) {
  .upload-workspace,
  .recent-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .upload-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-folder {
    width: min(220px, 70vw);
  }

  .attachment-panel header,
  .section-label {
    align-items: flex-start;
    flex-direction: column;
  }

  .file-list li,
  .recent-item {
    grid-template-columns: 1fr;
  }
}
</style>
