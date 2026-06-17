<script setup>
defineProps({
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'success',
  },
});
</script>

<template>
  <Transition name="toast">
    <div v-if="message" class="app-toast" :class="`app-toast-${type}`" role="status" aria-live="polite">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.app-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 80;
  max-width: min(360px, calc(100vw - 2.5rem));
  border: 1px solid rgba(15, 118, 110, 0.22);
  border-radius: var(--radius-sm);
  background: var(--bl-surface);
  color: var(--bl-text);
  box-shadow: var(--shadow-strong);
  padding: 0.82rem 1rem;
  font-size: 0.88rem;
  font-weight: 800;
}

.app-toast-success {
  border-color: rgba(15, 118, 110, 0.35);
  background: linear-gradient(135deg, var(--bl-primary-soft), var(--bl-surface));
}

.app-toast-error {
  border-color: rgba(220, 38, 38, 0.28);
  background: linear-gradient(135deg, rgba(254, 202, 202, 0.88), var(--bl-surface));
}

:global(body.theme-dark) .app-toast {
  background: linear-gradient(145deg, rgba(9, 20, 34, 0.98), rgba(5, 13, 26, 0.98));
}

:global(body.theme-dark) .app-toast-success {
  border-color: rgba(18, 214, 196, 0.36);
}

:global(body.theme-dark) .app-toast-error {
  border-color: rgba(248, 113, 113, 0.36);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
