<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
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

      <li
        v-for="p in totalPages"
        :key="p"
        class="page-item"
        :class="{ active: p === page }"
      >
        <button
          type="button"
          class="page-link"
          :aria-current="p === page ? 'page' : undefined"
          @click="goTo(p, totalPages)"
        >
          {{ p }}
        </button>
      </li>

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
</style>
