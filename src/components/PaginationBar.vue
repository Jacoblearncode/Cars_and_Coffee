<script setup>
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
          <i class="bi bi-chevron-left"></i> Prev
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
          Next <i class="bi bi-chevron-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>
