import { ref } from 'vue'

const toasts = ref([])
let counter = 0

export function useToast() {
  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  function push(message, type = 'success', timeout = 4500) {
    const id = ++counter
    toasts.value = [...toasts.value, { id, message, type }]
    if (timeout) setTimeout(() => dismiss(id), timeout)
    return id
  }

  return {
    toasts,
    dismiss,
    notify: push,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error', 6500),
    info: (message) => push(message, 'info'),
  }
}
