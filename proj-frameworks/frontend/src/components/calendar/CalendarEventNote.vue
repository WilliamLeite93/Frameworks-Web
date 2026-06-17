<script setup>
import { computed } from 'vue';
import { getEventType } from '@/utils/calendarUtils';

const props = defineProps({
  event: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['open']);

const eventType = computed(() => getEventType(props.event.type));
</script>

<template>
  <button
    type="button"
    class="event-note"
    :class="[`event-note-${event.type}`, `priority-${event.priority}`, { completed: event.completed, 'has-custom-color': event.color }]"
    :style="event.color ? { '--note-custom-color': event.color } : null"
    :title="`${event.title} - ${eventType.label}`"
    @click.stop="emit('open', event)"
  >
    <span class="note-pin" aria-hidden="true"></span>
    <span v-if="event.priority === 'high'" class="priority-mark" aria-label="Prioridade alta"></span>
    <strong>{{ event.title }}</strong>
    <small>
      <span class="note-type">{{ eventType.shortLabel }}</span>
      {{ eventType.label }}<template v-if="event.time"> · {{ event.time }}</template>
    </small>
  </button>
</template>

<style scoped>
.event-note {
  position: relative;
  width: 100%;
  min-height: 4.45rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 6px 6px 12px 6px;
  padding: 1rem 0.62rem 0.52rem;
  display: grid;
  gap: 0.28rem;
  color: #102033;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.13);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  overflow: hidden;
}

.event-note::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  width: 1rem;
  height: 1rem;
  background: rgba(255, 255, 255, 0.42);
  clip-path: polygon(100% 0, 0 100%, 100% 100%);
}

.event-note:hover,
.event-note:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 14px 22px rgba(15, 23, 42, 0.18);
  outline: none;
  filter: saturate(1.04);
}

.event-note strong {
  font-size: 0.78rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.event-note small {
  display: flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.68rem;
  color: rgba(15, 23, 42, 0.72);
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-type {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  padding: 0.08rem 0.22rem;
  font-size: 0.58rem;
  font-weight: 900;
}

.note-pin {
  position: absolute;
  top: 0.28rem;
  left: 50%;
  width: 0.68rem;
  height: 0.68rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.26);
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.24);
  transform: translateX(-50%);
}

.priority-mark {
  position: absolute;
  top: 0.42rem;
  right: 0.48rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #dc2626;
}

.event-note-exam {
  background: linear-gradient(145deg, #fecaca, #fed7d0);
}

.event-note-assignment {
  background: linear-gradient(145deg, #ddd6fe, #ede9fe);
}

.event-note-delivery {
  background: linear-gradient(145deg, #fde68a, #fef3c7);
}

.event-note-review {
  background: linear-gradient(145deg, #bfdbfe, #dbeafe);
}

.event-note-seminar {
  background: linear-gradient(145deg, #bbf7d0, #dcfce7);
}

.event-note-other {
  background: linear-gradient(145deg, #e2e8f0, #f1f5f9);
}

.event-note.has-custom-color {
  background: linear-gradient(145deg, color-mix(in srgb, var(--note-custom-color) 72%, white), var(--note-custom-color));
}

.event-note.completed {
  opacity: 0.68;
}

.event-note.completed strong {
  text-decoration: line-through;
}
</style>
