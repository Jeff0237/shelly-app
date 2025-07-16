<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  text?: string
  icon?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  loadingText: 'Loading...',
  text: '',
  icon: '',
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    danger: 'inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5',
    success: 'inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
  }
  
  const sizeClasses: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  const widthClasses = props.fullWidth ? 'w-full' : ''
  
  return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]} ${widthClasses}`
})
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <svg
      v-else-if="icon"
      class="w-5 h-5 mr-2"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        :d="icon"
      ></path>
    </svg>
    <slot>{{ loading ? loadingText : text }}</slot>
  </button>
</template>

<style scoped>
.app-button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

.app-button.primary {
  background: var(--color-primary);
  color: white;
}

.app-button.primary:hover:not(.disabled) {
  background: var(--color-primary-dark);
}

.app-button.secondary {
  background: var(--color-neutral-200);
  color: var(--color-neutral-700);
}

.app-button.secondary:hover:not(.disabled) {
  background: var(--color-neutral-300);
}

.app-button.danger {
  background: var(--color-error);
  color: white;
}

.app-button.danger:hover:not(.disabled) {
  background: var(--color-error-dark);
}

.app-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style> 