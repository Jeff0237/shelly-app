<script setup lang="ts">
interface Option {
  value: string
  label: string
}

defineProps<{
  modelValue: string
  options: Option[]
  label?: string
  required?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="select-wrapper">
    <label v-if="label" class="select-label">
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>
    <select
      :value="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :required="required"
      class="app-select"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.select-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-neutral-700);
}

.required {
  color: var(--color-error);
  margin-left: var(--space-1);
}

.app-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all var(--transition-base);
  background: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right var(--space-2) center;
  background-size: 1rem;
  padding-right: var(--space-8);
}

.app-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

.app-select option {
  padding: var(--space-2);
}
</style> 