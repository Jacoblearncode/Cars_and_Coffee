<script setup>
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  total: { type: Number, default: 0 }
})

const emit = defineEmits(['change'])

function goTo(p, totalPages) {
  if (p >= 1 && p <= totalPages) {
    emit('change', p)
  }
}

/**
 * Intelligent Pagination Window with Ellipsis Truncation
 * e.g. 1 ... 3 4 [5] 6 7 ... 10 or 1 2 3 4 5 6 ... 12 or 1 ... 7 8 9 10 11 12
 */
const visiblePages = computed(() => {
  const total = Number(props.totalPages) || 1
  const current = Number(props.page) || 1

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => ({
      type: 'page',
      number: i + 1,
      key: `page-${i + 1}`
    }))
  }

  const items = []

  let start = Math.max(2, current - 2)
  let end = Math.min(total - 1, current + 2)

  if (current <= 4) {
    start = 2
    end = Math.min(total - 1, 6)
  } else if (current >= total - 3) {
    start = Math.max(2, total - 5)
    end = total - 1
  }

  // Always include page 1
  items.push({ type: 'page', number: 1, key: 'page-1' })

  // Left ellipsis if there is a gap between 1 and start
  if (start > 2) {
    items.push({ type: 'ellipsis', key: 'ellipsis-left' })
  }

  // Middle sliding window of pages
  for (let p = start; p <= end; p++) {
    items.push({ type: 'page', number: p, key: `page-${p}` })
  }

  // Right ellipsis if there is a gap between end and total
  if (end < total - 1) {
    items.push({ type: 'ellipsis', key: 'ellipsis-right' })
  }

  // Always include last page
  items.push({ type: 'page', number: total, key: `page-${total}` })

  return items
})
</script>

<template>
  <nav
    v-if="totalPages > 1"
    aria-label="Pagination navigation"
    class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-4 pt-3 border-top"
  >
    <span class="small text-secondary">
      Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong>
      <template v-if="total"> ({{ total }} total items)</template>
    </span>

    <ul class="pagination pagination-sm mb-0">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <button
          type="button"
          class="page-link"
          :disabled="page <= 1"
          aria-label="Previous page"
          @click="goTo(page - 1, totalPages)"
        >
          <AppIcon name="chevron-left" :size="13" class="me-1" />Prev
        </button>
      </li>

      <template v-for="item in visiblePages" :key="item.key">
        <li
          v-if="item.type === 'page'"
          class="page-item"
          :class="{ active: item.number === page }"
        >
          <button
            type="button"
            class="page-link"
            :aria-current="item.number === page ? 'page' : undefined"
            @click="goTo(item.number, totalPages)"
          >
            {{ item.number }}
          </button>
        </li>
        <li
          v-else
          class="page-item disabled cc-page-ellipsis"
          aria-hidden="true"
        >
          <span class="page-link text-secondary border-0 bg-transparent px-2 user-select-none">…</span>
        </li>
      </template>

      <li class="page-item" :class="{ disabled: page >= totalPages }">
        <button
          type="button"
          class="page-link"
          :disabled="page >= totalPages"
          aria-label="Next page"
          @click="goTo(page + 1, totalPages)"
        >
          Next<AppIcon name="chevron-right" :size="13" class="ms-1" />
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.page-link {
  background-color: var(--cc-surface);
  color: var(--cc-text);
  border-color: var(--cc-border);
  font-weight: 500;
  transition: all 0.15s ease;
}
.page-link:hover:not(:disabled) {
  background-color: var(--cc-surface-hover, rgba(217, 119, 54, 0.1));
  color: var(--cc-accent);
  border-color: var(--cc-accent);
}
.page-item.active .page-link {
  background-color: var(--cc-accent);
  border-color: var(--cc-accent);
  color: #ffffff;
  font-weight: 700;
}
.page-item.disabled .page-link {
  opacity: 0.45;
  background-color: var(--cc-surface);
  color: var(--cc-text);
  border-color: var(--cc-border);
}
.cc-page-ellipsis .page-link {
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--cc-text-muted, #8c827a) !important;
  opacity: 0.7;
  cursor: default;
}
</style>
