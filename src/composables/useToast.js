import { ref } from 'vue'

const toasts = ref([])
let nextToastId = 1

export function useToast() {
  function showToast(message, type = 'success', duration = 3500) {
    const id = nextToastId++
    toasts.value.push({ id, message, type })
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id)
      }, duration)
    }
  }

  function dismissToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    showToast,
    dismissToast
  }
}
