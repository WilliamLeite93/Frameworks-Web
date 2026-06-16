<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import brainLogLogo from '@/assets/brainlog-logo.png';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const SIDEBAR_COLLAPSED_KEY = 'brainlog_sidebar_collapsed';
const DARK_MODE_KEY = 'brainlog_dark_mode';
const TODO_LIST_KEY = 'brainlog_sidebar_todos';

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.userName);

const isSidebarCollapsed = ref(false);
const isDarkMode = ref(false);
const authNotice = ref('');
const todoInput = ref('');
const todoItems = ref([]);

let noticeTimer = null;

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function applyTheme() {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('theme-dark', isDarkMode.value);
}

function restorePreferences() {
  if (typeof window === 'undefined') return;

  const storedSidebar = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
  const storedDarkMode = localStorage.getItem(DARK_MODE_KEY);
  const storedTodos = localStorage.getItem(TODO_LIST_KEY);

  if (storedSidebar !== null) {
    isSidebarCollapsed.value = storedSidebar === '1';
  }

  if (storedDarkMode !== null) {
    isDarkMode.value = storedDarkMode === '1';
  }

  if (storedTodos) {
    const parsed = parseJson(storedTodos, []);
    if (Array.isArray(parsed)) {
      todoItems.value = parsed;
    }
  }

  applyTheme();
}

function notifyLogin(message) {
  authNotice.value = message;

  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    authNotice.value = '';
  }, 3000);
}

function goToProtected(routeName, label) {
  if (isAuthenticated.value) {
    router.push({ name: routeName });
    return;
  }

  const targetPath = router.resolve({ name: routeName }).fullPath;
  notifyLogin(`Faça login para acessar ${label}.`);
  router.push({ name: 'Login', query: { redirect: targetPath } });
}

function isActive(routeName) {
  return route.name === routeName;
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  todoItems.value.unshift({
    id: Date.now(),
    text,
    done: false,
  });

  todoInput.value = '';
}

function toggleTodo(itemId) {
  todoItems.value = todoItems.value.map((item) =>
    item.id === itemId
      ? {
          ...item,
          done: !item.done,
        }
      : item,
  );
}

function removeTodo(itemId) {
  todoItems.value = todoItems.value.filter((item) => item.id !== itemId);
}

function handleLogout() {
  authStore.logout();
  router.push({ name: 'Login' });
}

watch(isSidebarCollapsed, (value) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? '1' : '0');
});

watch(isDarkMode, (value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DARK_MODE_KEY, value ? '1' : '0');
  }
  applyTheme();
});

watch(
  todoItems,
  (value) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TODO_LIST_KEY, JSON.stringify(value));
  },
  { deep: true },
);

onMounted(restorePreferences);

onUnmounted(() => {
  if (noticeTimer) clearTimeout(noticeTimer);
});
</script>

<template>
  <div class="app-shell" :class="{ collapsed: isSidebarCollapsed }">
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <button
          type="button"
          class="sidebar-icon-btn"
          :aria-label="isSidebarCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'"
          @click="toggleSidebar"
        >
          {{ isSidebarCollapsed ? '>' : '<' }}
        </button>

        <RouterLink v-if="!isSidebarCollapsed" to="/" class="brand" aria-label="BrainLog - página inicial">
          <img :src="brainLogLogo" alt="BrainLog" class="brand-logo" />
        </RouterLink>
      </div>

      <nav class="sidebar-nav" aria-label="Navegação principal">
        <RouterLink to="/" class="sidebar-link" title="Início">
          <span class="link-tag">IN</span>
          <span v-if="!isSidebarCollapsed">Início</span>
        </RouterLink>

        <button
          type="button"
          class="sidebar-link"
          :class="{ active: isActive('Dashboard') }"
          title="Dashboard"
          @click="goToProtected('Dashboard', 'o Dashboard')"
        >
          <span class="link-tag">DB</span>
          <span v-if="!isSidebarCollapsed">Dashboard</span>
        </button>

        <button
          type="button"
          class="sidebar-link"
          :class="{ active: isActive('Abstracts') }"
          title="Resumos"
          @click="goToProtected('Abstracts', 'Resumos')"
        >
          <span class="link-tag">RS</span>
          <span v-if="!isSidebarCollapsed">Resumos</span>
        </button>

        <button
          type="button"
          class="sidebar-link"
          :class="{ active: isActive('Evolution') }"
          title="Evolução"
          @click="goToProtected('Evolution', 'Evolução')"
        >
          <span class="link-tag">EV</span>
          <span v-if="!isSidebarCollapsed">Evolução</span>
        </button>

        <button
          type="button"
          class="sidebar-link"
          :class="{ active: isActive('Upload') }"
          title="Upload"
          @click="goToProtected('Upload', 'Upload')"
        >
          <span class="link-tag">UP</span>
          <span v-if="!isSidebarCollapsed">Upload</span>
        </button>
      </nav>

      <p v-if="authNotice && !isSidebarCollapsed" class="sidebar-notice">{{ authNotice }}</p>

      <div class="sidebar-footer">
        <button type="button" class="sidebar-link" title="Alternar tema" @click="toggleDarkMode">
          <span class="link-tag">TM</span>
          <span v-if="!isSidebarCollapsed">{{ isDarkMode ? 'Modo claro' : 'Modo escuro' }}</span>
        </button>

        <template v-if="isAuthenticated">
          <div v-if="!isSidebarCollapsed" class="sidebar-user">
            <small>Conectado como</small>
            <strong>{{ userName }}</strong>
          </div>

          <button type="button" class="sidebar-link" title="Sair" @click="handleLogout">
            <span class="link-tag">SX</span>
            <span v-if="!isSidebarCollapsed">Sair</span>
          </button>
        </template>

        <template v-else>
          <RouterLink to="/login" class="sidebar-link" title="Entrar">
            <span class="link-tag">LG</span>
            <span v-if="!isSidebarCollapsed">Entrar</span>
          </RouterLink>

          <RouterLink to="/register" class="sidebar-link" title="Cadastrar">
            <span class="link-tag">CD</span>
            <span v-if="!isSidebarCollapsed">Cadastrar</span>
          </RouterLink>
        </template>

        <section v-if="!isSidebarCollapsed" class="todo-panel">
          <h3>To-do list</h3>

          <form class="todo-form" @submit.prevent="addTodo">
            <input v-model.trim="todoInput" type="text" placeholder="Nova tarefa" />
            <button type="submit" class="btn btn-primary">Adicionar</button>
          </form>

          <ul class="todo-list">
            <li v-for="item in todoItems" :key="item.id" :class="{ done: item.done }">
              <label>
                <input type="checkbox" :checked="item.done" @change="toggleTodo(item.id)" />
                <span>{{ item.text }}</span>
              </label>
              <button type="button" class="todo-remove" aria-label="Remover tarefa" @click="removeTodo(item.id)">
                x
              </button>
            </li>

            <li v-if="!todoItems.length" class="todo-empty">Nenhuma tarefa adicionada.</li>
          </ul>
        </section>
      </div>
    </aside>

    <div class="app-content">
      <main class="content-main">
        <div class="container">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.brand-logo {
  width: 188px;
  height: 58px;
  object-fit: contain;
  object-position: left center;
  display: block;
}

.sidebar-user {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  padding: 0.58rem 0.66rem;
  background: rgba(255, 255, 255, 0.6);
}

:global(body.theme-dark) .sidebar-user {
  background: rgba(15, 23, 42, 0.72);
}

.sidebar-user small {
  display: block;
  color: var(--bl-muted);
  font-size: 0.72rem;
}

.sidebar-user strong {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.86rem;
}

.todo-panel {
  border: 1px solid var(--bl-border);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.65);
  padding: 0.65rem;
  display: grid;
  gap: 0.55rem;
}

:global(body.theme-dark) .todo-panel {
  background: rgba(15, 23, 42, 0.72);
}

.todo-panel h3 {
  font-size: 0.88rem;
}

.todo-form {
  display: grid;
  gap: 0.45rem;
}

.todo-form input {
  width: 100%;
  border: 1px solid var(--bl-border);
  border-radius: 10px;
  padding: 0.5rem 0.62rem;
  background: #ffffff;
}

:global(body.theme-dark) .todo-form input {
  background: var(--bl-surface);
  color: var(--bl-text);
}

.todo-form .btn {
  width: 100%;
  padding: 0.48rem 0.8rem;
  font-size: 0.82rem;
}

.todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.4rem;
  max-height: 210px;
  overflow: auto;
}

.todo-list li {
  border: 1px solid var(--bl-border);
  border-radius: 10px;
  padding: 0.4rem 0.46rem;
  background: #ffffff;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.45rem;
}

:global(body.theme-dark) .todo-list li {
  background: rgba(2, 6, 23, 0.3);
}

.todo-list li.done span {
  text-decoration: line-through;
  color: var(--bl-muted);
}

.todo-list label {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.35rem;
  font-size: 0.78rem;
  line-height: 1.45;
}

.todo-list input[type='checkbox'] {
  margin-top: 0.15rem;
  accent-color: var(--bl-primary);
}

.todo-remove {
  border: 1px solid var(--bl-border);
  border-radius: 999px;
  background: #ffffff;
  color: var(--bl-muted);
  width: 1.35rem;
  height: 1.35rem;
  line-height: 1;
  font-size: 0.75rem;
}

:global(body.theme-dark) .todo-remove {
  background: var(--bl-surface);
}

.todo-remove:hover {
  color: var(--bl-danger);
  border-color: #fecaca;
  background: #fef2f2;
}

:global(body.theme-dark) .todo-remove:hover {
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.42);
  background: rgba(127, 29, 29, 0.24);
}

.todo-empty {
  justify-content: center;
  color: var(--bl-muted);
  font-size: 0.76rem;
}

@media (max-width: 980px) {
  .brand-logo {
    width: 158px;
    height: 52px;
  }
}
</style>
