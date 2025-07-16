<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Sensor } from '../../types'

const props = defineProps<{
  sensor: Sensor
}>()

const emit = defineEmits<{
  (e: 'click', sensorId: string): void
}>()

const hasStatusChanged = ref(false)
const previousStatus = ref(props.sensor.isOpen)

// Show animation when status changes
watch(() => props.sensor.isOpen, (newStatus, oldStatus) => {
  if (newStatus !== oldStatus) {
    hasStatusChanged.value = true
    previousStatus.value = oldStatus
    
    setTimeout(() => {
      hasStatusChanged.value = false
    }, 500)
  }
}, { immediate: true })

const statusClass = computed(() => {
  return props.sensor.isOpen ? 'open' : 'closed'
})

const statusText = computed(() => {
  return props.sensor.isOpen ? 'Open' : 'Closed'
})

const batteryClass = computed(() => {
  if (props.sensor.battery < 20) return 'critical'
  if (props.sensor.battery < 40) return 'low'
  return 'good'
})

const batteryIcon = computed(() => {
  if (props.sensor.battery < 20) return '🔴'
  if (props.sensor.battery < 40) return '🟠'
  return '🟢'
})

const formattedLastUpdate = computed(() => {
  const date = new Date(props.sensor.lastUpdate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  // If less than a minute ago
  if (diffMs < 60000) {
    return 'just now'
  }
  
  // If less than an hour ago
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  }
  
  // Otherwise show full date/time
  return date.toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
})

const handleClick = () => {
  emit('click', props.sensor.id)
}

const typeIcon = computed(() => {
  switch (props.sensor.type) {
    case 'door': return '🚪'
    case 'window': return '🪟'
    default: return '📱'
  }
})
</script>

<template>
  <div 
    class="sensor-card" 
    :class="[statusClass, { 'status-changed': hasStatusChanged }]"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="sensor-icon">{{ typeIcon }}</div>
      <h3 class="sensor-name">{{ sensor.name }}</h3>
      <div class="sensor-location">{{ sensor.location }}</div>
    </div>
    
    <div class="card-content">
      <div class="status-display">
        <div class="status-icon" :class="statusClass"></div>
        <div class="status-text">{{ statusText }}</div>
      </div>
      
      <div class="sensor-meta">
        <div class="battery-status" :class="batteryClass">
          <span class="battery-icon">{{ batteryIcon }}</span>
          <span class="battery-level">{{ sensor.battery }}%</span>
        </div>
        
        <div class="last-update">
          Updated: {{ formattedLastUpdate }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sensor-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow);
  transition: all var(--transition-base);
  cursor: pointer;
  border-left: 4px solid var(--color-neutral-300);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.sensor-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.sensor-card.open {
  border-left-color: var(--color-error);
}

.sensor-card.closed {
  border-left-color: var(--color-success);
}

.sensor-card.status-changed {
  animation: status-change 0.5s var(--transition-bounce);
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sensor-icon {
  font-size: 1.5rem;
  margin-bottom: var(--space-1);
}

.sensor-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.sensor-location {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.status-display {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-icon {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-icon.open {
  background-color: var(--color-error);
  box-shadow: 0 0 0 4px rgba(255, 69, 58, 0.2);
}

.status-icon.closed {
  background-color: var(--color-success);
}

.status-text {
  font-weight: 500;
}

.open .status-text {
  color: var(--color-error);
}

.closed .status-text {
  color: var(--color-success);
}

.sensor-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  margin-top: var(--space-2);
}

.battery-status {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.battery-status.critical .battery-level {
  color: var(--color-error);
}

.battery-status.low .battery-level {
  color: var(--color-warning);
}

.last-update {
  color: var(--color-neutral-500);
  font-size: 0.75rem;
}

@media (prefers-color-scheme: dark) {
  .sensor-card {
    background-color: var(--color-neutral-800);
  }
  
  .sensor-location {
    color: var(--color-neutral-400);
  }
  
  .last-update {
    color: var(--color-neutral-400);
  }
}
</style>