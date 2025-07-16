<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSensorStore } from '../stores/sensorStore'

const sensorStore = useSensorStore()

// Filtering options
const sensorFilter = ref<string | undefined>(undefined)
const eventFilter = ref<string | undefined>(undefined)
const dateFilter = ref<string | undefined>(undefined)

const uniqueSensors = computed(() => {
  const sensorSet = new Set(sensorStore.activityLog.map(entry => entry.sensorId))
  return Array.from(sensorSet).map(id => {
    const sensor = sensorStore.sensors.find(s => s.id === id)
    return { id, name: sensor?.name || id }
  })
})

const uniqueEvents = computed(() => {
  const eventSet = new Set(sensorStore.activityLog.map(entry => entry.event))
  return Array.from(eventSet)
})

// Create date ranges for filtering
const today = new Date()
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)
const lastWeek = new Date(today)
lastWeek.setDate(today.getDate() - 7)

const dateRanges = [
  { label: 'Today', value: today.toISOString().split('T')[0] },
  { label: 'Yesterday', value: yesterday.toISOString().split('T')[0] },
  { label: 'Last 7 days', value: lastWeek.toISOString().split('T')[0] }
]

const filteredActivityLog = computed(() => {
  let result = [...sensorStore.activityLog]
  
  // Apply sensor filter
  if (sensorFilter.value) {
    result = result.filter(entry => entry.sensorId === sensorFilter.value)
  }
  
  // Apply event filter
  if (eventFilter.value) {
    result = result.filter(entry => entry.event === eventFilter.value)
  }
  
  // Apply date filter
  if (dateFilter.value) {
    const filterDate = new Date(dateFilter.value)
    result = result.filter(entry => {
      const entryDate = new Date(entry.timestamp)
      return entryDate >= filterDate
    })
  }
  
  return result
})

const clearFilters = () => {
  sensorFilter.value = undefined
  eventFilter.value = undefined
  dateFilter.value = undefined
}

const formatEventName = (event: string) => {
  return event
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getEventClass = (event: string) => {
  switch (event) {
    case 'opened': return 'event-opened'
    case 'closed': return 'event-closed'
    case 'battery_low': return 'event-warning'
    case 'connection_lost': return 'event-error'
    case 'connection_restored': return 'event-success'
    default: return ''
  }
}
</script>

<template>
  <div class="activity-log-view">
    <h1>Activity Log</h1>
    
    <div class="filter-controls">
      <div class="filter-group">
        <label for="sensor-filter">Sensor</label>
        <select id="sensor-filter" v-model="sensorFilter" class="filter-select">
          <option :value="undefined">All Sensors</option>
          <option v-for="sensor in uniqueSensors" :key="sensor.id" :value="sensor.id">
            {{ sensor.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="event-filter">Event Type</label>
        <select id="event-filter" v-model="eventFilter" class="filter-select">
          <option :value="undefined">All Events</option>
          <option v-for="event in uniqueEvents" :key="event" :value="event">
            {{ formatEventName(event) }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="date-filter">Date Range</label>
        <select id="date-filter" v-model="dateFilter" class="filter-select">
          <option :value="undefined">All Time</option>
          <option v-for="range in dateRanges" :key="range.label" :value="range.value">
            {{ range.label }}
          </option>
        </select>
      </div>
      
      <button class="clear-filters-btn" @click="clearFilters">
        Clear Filters
      </button>
    </div>
    
    <div class="activity-log-container">
      <div v-if="filteredActivityLog.length === 0" class="empty-log">
        <p>No activity logs match your current filters.</p>
      </div>
      
      <table v-else class="activity-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Sensor</th>
            <th>Event</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in filteredActivityLog" :key="entry.id">
            <td class="timestamp-cell">
              {{ new Date(entry.timestamp).toLocaleString() }}
            </td>
            <td class="sensor-cell">
              {{ entry.sensorName }}
            </td>
            <td class="event-cell">
              <span class="event-badge" :class="getEventClass(entry.event)">
                {{ formatEventName(entry.event) }}
              </span>
            </td>
            <td class="details-cell">
              {{ entry.details || '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.activity-log-view {
  max-width: 1000px;
  margin: 0 auto;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
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
  min-width: 180px;
  font-family: var(--font-family);
}

.clear-filters-btn {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-800);
  border-radius: var(--radius);
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-filters-btn:hover {
  background-color: var(--color-neutral-300);
}

.activity-log-container {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
}

.empty-log {
  padding: var(--space-8);
  text-align: center;
  color: var(--color-neutral-500);
}

.activity-table {
  width: 100%;
  border-collapse: collapse;
}

.activity-table th,
.activity-table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
}

.activity-table th {
  background-color: var(--color-neutral-100);
  font-weight: 600;
  border-bottom: 1px solid var(--color-neutral-200);
}

.activity-table td {
  border-bottom: 1px solid var(--color-neutral-200);
}

.activity-table tr:last-child td {
  border-bottom: none;
}

.event-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius);
  font-size: 0.75rem;
  font-weight: 500;
}

.event-opened {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.event-closed {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.event-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.event-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.event-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

@media (prefers-color-scheme: dark) {
  .filter-select {
    background-color: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }
  
  .clear-filters-btn {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }
  
  .clear-filters-btn:hover {
    background-color: var(--color-neutral-600);
  }
  
  .activity-log-container {
    background-color: var(--color-neutral-800);
  }
  
  .activity-table th {
    background-color: var(--color-neutral-700);
    border-bottom-color: var(--color-neutral-600);
  }
  
  .activity-table td {
    border-bottom-color: var(--color-neutral-700);
  }
  
  .empty-log {
    color: var(--color-neutral-400);
  }
}

@media (max-width: 768px) {
  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .timestamp-cell {
    font-size: 0.75rem;
  }
  
  .activity-table th,
  .activity-table td {
    padding: var(--space-2);
  }
}
</style>