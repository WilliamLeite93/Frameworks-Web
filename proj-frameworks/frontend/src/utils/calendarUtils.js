export const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const weekDayLabels = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const eventTypeOptions = [
  { value: 'exam', label: 'Prova', shortLabel: 'PV', color: '#fecaca' },
  { value: 'assignment', label: 'Trabalho', shortLabel: 'TR', color: '#ddd6fe' },
  { value: 'delivery', label: 'Entrega', shortLabel: 'EN', color: '#fde68a' },
  { value: 'review', label: 'Revisão', shortLabel: 'RV', color: '#bfdbfe' },
  { value: 'seminar', label: 'Seminário', shortLabel: 'SM', color: '#bbf7d0' },
  { value: 'other', label: 'Outro', shortLabel: 'OT', color: '#e2e8f0' },
];

export const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

export function getEventType(type) {
  return eventTypeOptions.find((option) => option.value === type) || eventTypeOptions[eventTypeOptions.length - 1];
}

export function parseDateKey(dateKey) {
  if (!dateKey) return null;
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toDateKey(date) {
  const parsedDate = date instanceof Date ? date : new Date(date);
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return toDateKey(new Date());
}

export function addDays(date, amount) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function getMonthDays(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const startDate = addDays(firstDay, -firstDay.getDay());
  const todayKey = getTodayKey();

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(startDate, index);
    const key = toDateKey(date);

    return {
      key,
      date,
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === monthIndex,
      isToday: key === todayKey,
    };
  });
}

export function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    if (!groups[event.date]) groups[event.date] = [];
    groups[event.date].push(event);
    groups[event.date].sort(compareEvents);
    return groups;
  }, {});
}

export function compareEvents(a, b) {
  return String(a.time || '23:59').localeCompare(String(b.time || '23:59'));
}

export function isDateKeyBetween(dateKey, startKey, endKey) {
  return dateKey >= startKey && dateKey <= endKey;
}

export function getCurrentWeekRange(referenceDate = new Date()) {
  const start = addDays(referenceDate, -referenceDate.getDay());
  const end = addDays(start, 6);
  return {
    startKey: toDateKey(start),
    endKey: toDateKey(end),
  };
}

export function formatDatePt(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function formatFullDatePt(dateKey) {
  const date = parseDateKey(dateKey);
  if (!date) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
