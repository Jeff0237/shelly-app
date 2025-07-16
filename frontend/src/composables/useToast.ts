import { ref } from 'vue'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  message: string
  type: ToastType
  id: number
}

const toasts = ref<Toast[]>([])
let nextId = 1

export const useToast = () => {
  const showToast = (message: string, type: ToastType = 'info') => {
    const id = nextId++
    toasts.value.push({ message, type, id })
    
    setTimeout(() => {
      toasts.value = toasts.value.filter(toast => toast.id !== id)
    }, 3000)
  }

  return {
    toasts,
    showToast
  }
} 