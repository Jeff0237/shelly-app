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
  id?: number | null;
  label: string;
  type: ComponentTypes | null;
  status: StatusTypes | null;
  roomId?: number | null;
  floorId?: number | null;
}

interface Room {
  id: number;
  label: string;
  floorId: number;
}

interface Floor {
  id: number;
  label: string;
}

// Data
const floors = ref<Floor[]>([
  { id: 1, label: 'RDC' }
])

const rooms = ref<Room[]>([
  { id: 1, label: 'Living Room', floorId: 1 },
  { id: 2, label: 'Kitchen', floorId: 1 }
])

const components = ref<ComponentContract[]>([
  { id: 1, label: 'Front Door', type: ComponentTypes.DOOR, status: StatusTypes.ACTIVE, roomId: 1, floorId: 1 },
  { id: 2, label: 'Living Room Window', type: ComponentTypes.WINDOW, status: StatusTypes.ACTIVE, roomId: 1, floorId: 1 },
  { id: 3, label: 'Kitchen Door', type: ComponentTypes.DOOR, status: StatusTypes.ACTIVE, roomId: 1, floorId: 1 },
])

// Forms
const newComponent = ref<ComponentContract>({
  label: '',
  type: null,
  status: StatusTypes.ACTIVE,
  floorId: null,
  roomId: null
})

const newRoom = ref<{ label: string; floorId: string }>({
  label: '',
  floorId: floors.value[0]?.id.toString() || '1'
})

const newFloor = ref<{ label: string }>({
  label: ''
})

// Component types list
const componentTypesList = [
  { value: ComponentTypes.DOOR, label: t('components.types.door') },
  { value: ComponentTypes.WINDOW, label: t('components.types.window') },
  { value: ComponentTypes.FLOOR, label: t('components.types.floor') },
  { value: ComponentTypes.ROOM, label: t('components.types.room') },
]

// Computed logic
const showFloorSelect = computed(() => {
  return floors.value.length > 1 && newComponent.value.type !== ComponentTypes.FLOOR
})

const showRoomSelect = computed(() => {
  const type = newComponent.value.type
  return type === ComponentTypes.DOOR || type === ComponentTypes.WINDOW
})

const availableRooms = computed(() => {
  const floorId = newComponent.value.floorId
  if (!floorId) return []
  return rooms.value
      .filter(room => room.floorId === floorId)
      .map(room => ({ value: room.id.toString(), label: room.label }))
})

const floorOptions = computed(() => {
  return floors.value.map(floor => ({
    value: floor.id.toString(),
    label: floor.label
  }))
})

// Modal handlers
const openModal = () => { isModalOpen.value = true }
const closeModal = () => { isModalOpen.value = false; resetForm() }

const openRoomModal = () => { isRoomModalOpen.value = true }
const closeRoomModal = () => { isRoomModalOpen.value = false; resetRoomForm() }

const openFloorModal = () => { isFloorModalOpen.value = true }
const closeFloorModal = () => { isFloorModalOpen.value = false; resetFloorForm() }

// Form resets
const resetForm = () => {
  newComponent.value = {
    label: '',
    type: null,
    status: StatusTypes.ACTIVE,
    floorId: null,
    roomId: null
  }
}

const resetRoomForm = () => {
  newRoom.value = {
    label: '',
    floorId: floors.value[0]?.id.toString() || '1'
  }
}

const resetFloorForm = () => {
  newFloor.value = {
    label: ''
  }
}

// Submissions
const handleSubmit = () => {
  const type = newComponent.value.type
  if (!type) return

  components.value.push({
    id: components.value.length + 1,
    ...newComponent.value,
    floorId: type === ComponentTypes.FLOOR ? Number(newComponent.value.floorId) : 1,
    roomId: [ComponentTypes.DOOR, ComponentTypes.WINDOW].includes(type) ? Number(newComponent.value.roomId) : null
  })
  closeModal()
}

const handleRoomSubmit = () => {
  rooms.value.push({
    id: rooms.value.length + 1,
    label: newRoom.value.label,
    floorId: Number(newRoom.value.floorId)
  })
  closeRoomModal()
}

const handleFloorSubmit = () => {
  floors.value.push({
    id: floors.value.length + 1,
    label: newFloor.value.label
  })
  closeFloorModal()
}
</script>
