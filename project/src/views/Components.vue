<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppModal from '../components/ui/AppModal.vue'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppSelect from '../components/ui/AppSelect.vue'

const { t } = useI18n()

const isModalOpen = ref(false)
const isRoomModalOpen = ref(false)
const isFloorModalOpen = ref(false)

// Enums
export enum StatusTypes {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ComponentTypes {
  FLOOR = 'floor',
  DOOR = 'door',
  WINDOW = 'window',
  ROOM = 'room'
}

// Interfaces
export interface ComponentContract {
  id: number|string;
  label: string;
  type: ComponentTypes|string;
  status: StatusTypes|string;
  roomId: string;
  floorId: string;
}

interface Room {
  id: number|string;
  label: string;
  floorId: string;
}

interface Floor {
  id: number|string;
  label: string;
}

// Data
const floors = ref<Floor[]>([
  { id: 1, label: 'RDC' }
])

const rooms = ref<Room[]>([
  { id: 1, label: 'Living Room', floorId: '1' },
  { id: 2, label: 'Kitchen', floorId: '1' }
])

const components = ref<ComponentContract[]>([
  { id: 1, label: 'Front Door', type: ComponentTypes.DOOR, status: StatusTypes.ACTIVE, roomId: '1', floorId: '1' },
  { id: 2, label: 'Living Room Window', type: ComponentTypes.WINDOW, status: StatusTypes.ACTIVE, roomId: '1', floorId: '1' },
  { id: 3, label: 'Kitchen Door', type: ComponentTypes.DOOR, status: StatusTypes.ACTIVE, roomId: '1', floorId: '1' },
])


// Form states
const newComponent = ref<ComponentContract>({
  id: '',
  label: '',
  type: '',
  status: StatusTypes.ACTIVE,
  floorId: '',
  roomId: ''
})

const newRoom = ref({
  label: '',
  floorId: ''
})

const newFloor = ref({
  label: ''
})

// Computed properties
const componentTypesList = [
  { value: ComponentTypes.DOOR, label: t('components.types.door') },
  { value: ComponentTypes.WINDOW, label: t('components.types.window') },
  { value: ComponentTypes.FLOOR, label: t('components.types.floor') },
  { value: ComponentTypes.ROOM, label: t('components.types.room') },
]

const showFloorSelect = computed(() => {
  return floors.value.length > 1 && newComponent.value.type !== 'floor'
})

const showRoomSelect = computed(() => {
  let _type = newComponent.value.type;
  if (! _type) {
    return false
  }
  return [ComponentTypes.DOOR, ComponentTypes.WINDOW].includes(_type as ComponentTypes)
})

const availableRooms = computed(() => {
  if (!newComponent.value.floorId) return []
  return rooms.value
    .filter(room => room.floorId === newComponent.value.floorId)
    .map(room => ({ value: room.id.toString(), label: room.label }))
})

const floorOptions = computed(() => {
  return floors.value.map(floor => ({
    value: floor.id.toString(),
    label: floor.label
  }))
})


// Modal handlers
const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const openRoomModal = () => {
  isRoomModalOpen.value = true
}

const closeRoomModal = () => {
  isRoomModalOpen.value = false
  resetRoomForm()
}

const openFloorModal = () => {
  isFloorModalOpen.value = true
}

const closeFloorModal = () => {
  isFloorModalOpen.value = false
  resetFloorForm()
}

// Form resets
const resetForm = () => {
  newComponent.value = {
    id: '',
    label: '',
    type: '',
    status: StatusTypes.ACTIVE,
    floorId: '',
    roomId: ''
  }
}

const resetRoomForm = () => {
  newRoom.value = {
    label: '',
    floorId: floors.value[0].id.toString()
  }
}

const resetFloorForm = () => {
  newFloor.value = {
    label: ''
  }
}

// Form submissions
const handleSubmit = () => {
  let _type = newComponent.value.type;
  if (! _type) {
    return;
  }
  // Here you would typically make an API call to save the component
  components.value.push({
    ...newComponent.value,
    // id: components.value.length + 1,
    floorId: newComponent.value.type === ComponentTypes.FLOOR ? newComponent.value.floorId : '1',
    roomId: [ComponentTypes.DOOR, ComponentTypes.WINDOW].includes(_type as ComponentTypes) ? newComponent.value.roomId : '1'
  })
  closeModal()
}

const handleRoomSubmit = () => {
  rooms.value.push({
    id: rooms.value.length + 1,
    label: newRoom.value.label,
    floorId: newRoom.value.floorId
  })
  closeRoomModal()
}

const handleFloorSubmit = () => {
  floors.value.push({
    id: floors.value.length,
    label: newFloor.value.label
  })
  closeFloorModal()
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
          <h3>{{ component.label }}</h3>
          <p>{{ t(`components.types.${component.type?.toString()}`) }}</p>
          <span :class="['status-badge', component.status?.toString()]">
            {{ t(`components.status.${component.status?.toString()}`) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Component Modal -->
    <AppModal
      :is-open="isModalOpen"
      :title="t('components.add_new')"
      @close="closeModal"
    >
      <form @submit.prevent="handleSubmit" class="component-form">
        <AppInput
          v-model="newComponent.label"
          :label="t('components.form.label')"
          required
        />

        <AppSelect
          v-model="newComponent.type"
          :label="t('components.form.type')"
          :options="componentTypesList"
          required
        />

        <div v-if="showFloorSelect" class="form-row">
          <AppSelect
            v-model="newComponent.floorId"
            :label="t('components.form.floor')"
            :options="floorOptions"
            required
          />
          <AppButton type="button" variant="secondary" @click="openFloorModal">
            {{ t('components.add_floor') }}
          </AppButton>
        </div>

        <div v-if="showRoomSelect" class="form-row">
          <AppSelect
            v-model="newComponent.roomId"
            :label="t('components.form.room')"
            :options="availableRooms"
            required
          />
          <AppButton type="button" variant="secondary" @click="openRoomModal">
            {{ t('components.add_room') }}
          </AppButton>
        </div>

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

    <!-- Room Modal -->
    <AppModal
      :is-open="isRoomModalOpen"
      :title="t('components.add_room')"
      @close="closeRoomModal"
    >
      <form @submit.prevent="handleRoomSubmit" class="component-form">
        <AppInput
          v-model="newRoom.label"
          :label="t('components.form.room_name')"
          required
        />

        <AppSelect
          v-model="newRoom.floorId"
          :label="t('components.form.floor')"
          :options="floorOptions"
          required
        />

        <div class="form-actions">
          <AppButton type="button" variant="secondary" @click="closeRoomModal">
            {{ t('common.cancel') }}
          </AppButton>
          <AppButton type="submit">
            {{ t('common.save') }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Floor Modal -->
    <AppModal
      :is-open="isFloorModalOpen"
      :title="t('components.add_floor')"
      @close="closeFloorModal"
    >
      <form @submit.prevent="handleFloorSubmit" class="component-form">
        <AppInput
          v-model="newFloor.label"
          :label="t('components.form.floor_name')"
          required
        />

        <div class="form-actions">
          <AppButton type="button" variant="secondary" @click="closeFloorModal">
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

.form-row {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.form-row .app-select {
  flex: 1;
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

  .form-row {
    flex-direction: column;
    gap: var(--space-4);
  }
}
</style>