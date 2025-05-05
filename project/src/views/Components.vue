<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppModal from '../components/ui/AppModal.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'

const { t } = useI18n()

const isModalOpen = ref(false)
const components = ref([
  { id: 1, name: 'Front Door', type: 'door', status: 'active' },
  { id: 2, name: 'Living Room Window', type: 'window', status: 'active' },
  { id: 3, name: 'Kitchen Floor', type: 'floor', status: 'inactive' },
])

const newComponent = ref({
  name: '',
  type: '',
  status: 'active'
})

const componentTypes = [
  { value: 'door', label: t('components.types.door') },
  { value: 'window', label: t('components.types.window') },
  { value: 'floor', label: t('components.types.floor') },
  { value: 'room', label: t('components.types.room') },
]

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const resetForm = () => {
  newComponent.value = {
    name: '',
    type: '',
    status: 'active'
  }
}

const handleSubmit = () => {
  // Here you would typically make an API call to save the component
  components.value.push({
    id: components.value.length + 1,
    ...newComponent.value
  })
  closeModal()
}
</script>

<template>
  <div class="components-page">
    <div class="page-header">
      <h1>{{ t('components.title') }}</h1>
      <AppButton @click="openModal">
        {{ t('components.add_new') }}
      </AppButton>
    </div>

    <div class="components-list">
      <div v-for="component in components" :key="component.id" class="component-card">
        <div class="component-info">
          <h3>{{ component.name }}</h3>
          <p>{{ t(`components.types.${component.type}`) }}</p>
          <span :class="['status-badge', component.status]">
            {{ t(`components.status.${component.status}`) }}
          </span>
        </div>
      </div>
    </div>

    <AppModal
      :is-open="isModalOpen"
      :title="t('components.add_new')"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="component-form">
        <AppInput
          v-model="newComponent.name"
          :label="t('components.form.name')"
          required
        />

        <AppSelect
          v-model="newComponent.type"
          :label="t('components.form.type')"
          :options="componentTypes"
          required
        />

        <div class="form-actions">
          <AppButton type="button" variant="secondary" @click="closeModal">
            {{ t('common.cancel') }}
          </AppButton>
          <AppButton type="submit">
            {{ t('common.save') }}
          </AppButton>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<style scoped>
.components-page {
  padding: var(--space-4);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
}

.components-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.component-card {
  background: var(--color-neutral-100);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius);
  padding: var(--space-4);
  transition: transform var(--transition-base);
}

.component-card:hover {
  transform: translateY(-2px);
}

.component-info h3 {
  margin: 0 0 var(--space-2);
  color: var(--color-neutral-900);
}

.component-info p {
  margin: 0 0 var(--space-2);
  color: var(--color-neutral-600);
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: var(--color-success-100);
  color: var(--color-success-700);
}

.status-badge.inactive {
  background: var(--color-neutral-100);
  color: var(--color-neutral-600);
}

.component-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .components-list {
    grid-template-columns: 1fr;
  }
}
</style> 