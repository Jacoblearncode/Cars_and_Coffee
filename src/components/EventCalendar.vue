<script setup>
/**
 * Roast & Redline (Cars & Coffee) — FullCalendar v6 Coffee-Run Schedule Explorer
 * Toggles between Month Grid (`dayGridMonth`) and Chronological Schedule (`listMonth`)
 * with full Dark & Light theme CSS variable styling.
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'

const props = defineProps({
  meets: { type: Array, default: () => [] }
})

const router = useRouter()

const initialDate = computed(() => {
  if (props.meets && props.meets.length > 0) {
    const sorted = [...props.meets].sort((a, b) =>
      String(a.meet_datetime || '').localeCompare(String(b.meet_datetime || ''))
    )
    if (sorted[0]?.meet_datetime) {
      return String(sorted[0].meet_datetime).slice(0, 10)
    }
  }
  return undefined
})

const calendarEvents = computed(() =>
  props.meets.map((m) => ({
    id: String(m.id),
    title: m.title,
    start: String(m.meet_datetime || '').replace(' ', 'T'),
    end: String(m.end_datetime || '').replace(' ', 'T'),
    textColor: '#ffffff',
    backgroundColor:
      m.vibe === 'JDM & Brews'
        ? '#e5534b'
        : m.vibe === 'Euro & Classics'
          ? '#0ea5e9'
          : m.vibe === 'Night Meet'
            ? '#8b5cf6'
            : m.vibe === 'Sunset Chill'
              ? '#f59e0b'
              : '#d97736',
    borderColor: 'transparent',
    extendedProps: {
      cafe: m.cafe_name,
      region: m.region,
      vibe: m.vibe
    }
  }))
)

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, listPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  initialDate: initialDate.value,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,listMonth'
  },
  buttonText: {
    today: 'Today',
    dayGridMonth: 'Month Grid',
    listMonth: 'Schedule List'
  },
  noEventsContent: 'No coffee meets scheduled for this period.',
  events: calendarEvents.value,
  height: 'auto',
  eventClick(info) {
    info.jsEvent?.preventDefault()
    if (info.event && info.event.id) {
      router.push(`/meets/${info.event.id}`)
    }
  }
}))
</script>

<template>
  <div class="cc-event-calendar cc-tile">
    <p class="small text-secondary mb-3">
      Select any coffee run or weekend meet on the schedule to inspect its cafe coordinates, weather forecast, and Car Roll-Call.
    </p>
    <FullCalendar :options="calendarOptions" />
  </div>
</template>

<style scoped>
.cc-event-calendar {
  --calendar-bg: #141210;
  --calendar-surface: #1d1916;
  --calendar-text: #f5efe6;
  --calendar-muted: #a69c91;
  --calendar-border: rgba(255, 255, 255, 0.12);
  --calendar-accent: #ff5500;
  --calendar-today: rgba(255, 85, 0, 0.14);
  min-width: 0;
  color: var(--calendar-text);
  background: var(--calendar-bg);
}

[data-bs-theme='light'] .cc-event-calendar {
  --calendar-bg: #ffffff;
  --calendar-surface: #f4efe6;
  --calendar-text: #141210;
  --calendar-muted: #685f56;
  --calendar-border: rgba(20, 18, 16, 0.12);
  --calendar-accent: #e04800;
  --calendar-today: rgba(255, 85, 0, 0.1);
}

.cc-event-calendar :deep(.fc) {
  --fc-border-color: var(--calendar-border);
  --fc-page-bg-color: var(--calendar-bg);
  --fc-neutral-bg-color: var(--calendar-surface);
  --fc-neutral-text-color: var(--calendar-muted);
  --fc-today-bg-color: var(--calendar-today);
  --fc-list-event-hover-bg-color: var(--calendar-surface);
  --fc-event-selected-overlay-color: transparent;
  --fc-button-bg-color: var(--calendar-surface);
  --fc-button-text-color: var(--calendar-text);
  --fc-button-border-color: var(--calendar-border);
  --fc-button-hover-bg-color: var(--calendar-accent);
  --fc-button-hover-border-color: var(--calendar-accent);
  --fc-button-active-bg-color: var(--calendar-accent);
  --fc-button-active-border-color: var(--calendar-accent);
  font-family: inherit;
  font-size: 0.85rem;
}

.cc-event-calendar :deep(.fc-toolbar-title) {
  font-size: clamp(1.15rem, 2.5vw, 1.55rem);
  font-weight: 700;
  letter-spacing: -0.03em;
}

.cc-event-calendar :deep(.fc-button) {
  border-radius: 999px;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  box-shadow: none !important;
}

.cc-event-calendar :deep(.fc-col-header-cell-cushion),
.cc-event-calendar :deep(.fc-daygrid-day-number),
.cc-event-calendar :deep(.fc-list-day-cushion a) {
  color: var(--calendar-text);
  text-decoration: none;
}

.cc-event-calendar :deep(.fc-daygrid-event) {
  border-radius: 6px;
  padding: 1px 4px;
  cursor: pointer;
}
</style>
