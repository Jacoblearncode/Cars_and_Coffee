<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismissToast } = useToast()
</script>

<template>
  <div
    class="toast-container position-fixed bottom-0 end-0 p-3"
    style="z-index: 2100"
    aria-live="polite"
  >
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast show align-items-center border-0 mb-2 shadow"
      :class="t.type === 'danger' ? 'text-bg-danger' : t.type === 'warning' ? 'text-bg-warning' : 'text-bg-dark'"
      role="alert"
    >
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i
            class="bi"
            :class="
              t.type === 'danger'
                ? 'bi-exclamation-triangle-fill text-warning'
                : 'bi-cup-hot-fill text-warning'
            "
          ></i>
          <span>{{ t.message }}</span>
        </div>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          aria-label="Close notification"
          @click="dismissToast(t.id)"
        ></button>
      </div>
    </div>
  </div>
</template>
