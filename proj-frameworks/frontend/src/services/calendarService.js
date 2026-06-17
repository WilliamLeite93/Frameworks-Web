const STORAGE_PREFIX = 'brainlog_calendar_events';

function getOwnerKey(ownerId) {
  return `${STORAGE_PREFIX}_${ownerId || 'guest'}`;
}

function readEvents(ownerId) {
  if (typeof window === 'undefined') return [];

  try {
    const storedEvents = window.localStorage.getItem(getOwnerKey(ownerId));
    const parsedEvents = storedEvents ? JSON.parse(storedEvents) : [];
    return Array.isArray(parsedEvents) ? parsedEvents : [];
  } catch {
    return [];
  }
}

function writeEvents(ownerId, events) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getOwnerKey(ownerId), JSON.stringify(events));
}

function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `calendar-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortEvents(events) {
  return [...events].sort((a, b) => {
    const dateComparison = String(a.date || '').localeCompare(String(b.date || ''));
    if (dateComparison !== 0) return dateComparison;
    return String(a.time || '23:59').localeCompare(String(b.time || '23:59'));
  });
}

export async function getCalendarEvents(ownerId) {
  return sortEvents(readEvents(ownerId));
}

export async function createCalendarEvent(ownerId, payload) {
  const now = new Date().toISOString();
  const event = {
    id: createId(),
    title: payload.title,
    type: payload.type,
    subject: payload.subject || '',
    description: payload.description || '',
    date: payload.date,
    time: payload.time || '',
    priority: payload.priority || 'medium',
    reminder: Boolean(payload.reminder),
    completed: Boolean(payload.completed),
    color: payload.color || '',
    createdAt: now,
    updatedAt: now,
  };

  const events = readEvents(ownerId);
  const nextEvents = sortEvents([...events, event]);
  writeEvents(ownerId, nextEvents);
  return event;
}

export async function updateCalendarEvent(ownerId, eventId, payload) {
  const events = readEvents(ownerId);
  const now = new Date().toISOString();
  let updatedEvent = null;

  const nextEvents = events.map((event) => {
    if (event.id !== eventId) return event;

    updatedEvent = {
      ...event,
      ...payload,
      subject: payload.subject || '',
      description: payload.description || '',
      time: payload.time || '',
      color: payload.color || '',
      reminder: Boolean(payload.reminder),
      completed: Boolean(payload.completed),
      updatedAt: now,
    };

    return updatedEvent;
  });

  if (!updatedEvent) {
    throw new Error('Evento não encontrado.');
  }

  const sortedEvents = sortEvents(nextEvents);
  writeEvents(ownerId, sortedEvents);
  return updatedEvent;
}

export async function deleteCalendarEvent(ownerId, eventId) {
  const events = readEvents(ownerId);
  const nextEvents = events.filter((event) => event.id !== eventId);

  if (nextEvents.length === events.length) {
    throw new Error('Evento não encontrado.');
  }

  writeEvents(ownerId, nextEvents);
  return { success: true };
}
