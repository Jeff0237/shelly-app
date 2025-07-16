<script setup lang="ts">
import { ref, computed } from 'vue'
import SensorStatusSummary from '../components/sensors/SensorStatusSummary.vue'
import SensorGrid from '../components/sensors/SensorGrid.vue'
import { useSensorStore } from '../stores/sensorStore'

const sensorStore = useSensorStore()

const locationFilter = ref<string | undefined>(undefined)
const typeFilter = ref<'door' | 'window' | 'all'>('all')
const statusFilter = ref<'open' | 'closed' | 'all'>('all')

const locations = computed(() => {
  const locationSet = new Set(sensorStore.sensors.map(s => s.location))
  return Array.from(locationSet)
})

const resetFilters = () => {
  locationFilter.value = undefined
  typeFilter.value = 'all'
  statusFilter.value = 'all'
}
</script>

<template>
  <div class="dashboard">
    <SensorStatusSummary />
    
    <div class="sensor-filters">
      <div class="filter-controls">
        <div class="filter-group">
          <label for="location-filter">Location</label>
          <select 
            id="location-filter" 
            v-model="locationFilter"
            class="filter-select"
          >
            <option :value="undefined">All Locations</option>
            <option v-for="location in locations" :key="location" :value="location">
              {{ location }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="type-filter">Type</label>
          <select 
            id="type-filter" 
            v-model="typeFilter"
            class="filter-select"
          >
            <option value="all">All Types</option>
            <option value="door">Doors</option>
            <option value="window">Windows</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="status-filter">Status</label>
          <select 
            id="status-filter" 
            v-model="statusFilter"
            class="filter-select"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        
        <button class="reset-button" @click="resetFilters">
          Reset Filters
        </button>
      </div>
    </div>
    
    <SensorGrid
      :location-filter="locationFilter"
      :type-filter="typeFilter"
      :status-filter="statusFilter"
    />
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.sensor-filters {
  margin-bottom: var(--space-6);
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  border: 1px solid var(--color-neutral-300);
  background-color: white;
  min-width: 150px;
  font-family: var(--font-family);
}

.reset-button {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-800);
  border-radius: var(--radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.reset-button:hover {
  background-color: var(--color-neutral-300);
}

@media (prefers-color-scheme: dark) {
  .filter-select {
    background-color: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }
  
  .reset-button {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }
  
  .reset-button:hover {
    background-color: var(--color-neutral-600);
  }
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
}
</style>