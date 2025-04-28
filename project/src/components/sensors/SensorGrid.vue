<script setup lang="ts">
import { useSensorStore } from '../../stores/sensorStore'
import SensorCard from './SensorCard.vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  locationFilter?: string
  typeFilter?: 'door' | 'window' | 'all'
  statusFilter?: 'open' | 'closed' | 'all'
}>()

const router = useRouter()
const sensorStore = useSensorStore()

const navigateToDetails = (sensorId: string) => {
  router.push({ name: 'sensor-details', params: { id: sensorId } })
}

const filteredSensors = computed(() => {
  let result = sensorStore.sensors

  // Apply location filter
  if (props.locationFilter) {
    result = result.filter(sensor => sensor.location === props.locationFilter)
  }

  // Apply type filter
  if (props.typeFilter && props.typeFilter !== 'all') {
    result = result.filter(sensor => sensor.type === props.typeFilter)
  }

  // Apply status filter
  if (props.statusFilter === 'open') {
    result = result.filter(sensor => sensor.isOpen)
  } else if (props.statusFilter === 'closed') {
    result = result.filter(sensor => !sensor.isOpen)
  }

  return result
})
</script>

<template>
  <div class="sensor-grid">
    <div v-if="sensorStore.isLoading" class="loading-state">
      Loading sensors...
    </div>
    
    <div v-else-if="sensorStore.error" class="error-state">
      {{ sensorStore.error }}
    </div>
    
    <div v-else-if="filteredSensors.length === 0" class="empty-state">
      No sensors match the current filters.
    </div>
    
    <div v-else class="grid-container">
      <SensorCard
        v-for="sensor in filteredSensors"
        :key="sensor.id"
        :sensor="sensor"
        @click="navigateToDetails"
      />
    </div>
  </div>
</template>

<style scoped>
.sensor-grid {
  margin-top: var(--space-4);
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-neutral-600);
}

.error-state {
  color: var(--color-error);
}

@media (max-width: 640px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>