<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type || 'button'"
    :class="[
      'app-button',
      variant || 'primary',
      { disabled }
    ]"
    :disabled="disabled"
  >
    <slot></slot>
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