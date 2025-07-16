<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSensorStore } from '../stores/sensorStore'

const route = useRoute()
const router = useRouter()
const sensorStore = useSensorStore()
const sensorId = computed(() => route.params.id as string)

const sensor = computed(() => {
  return sensorStore.sensors.find(s => s.id === sensorId.value)
})

// Line chart data for battery over time (mocked)
const batteryHistory = ref([
  { date: '7 days ago', value: sensor.value?.battery ? sensor.value.battery + 5 : 100 },
  { date: '6 days ago', value: sensor.value?.battery ? sensor.value.battery + 4 : 95 },
  { date: '5 days ago', value: sensor.value?.battery ? sensor.value.battery + 3 : 90 },
  { date: '4 days ago', value: sensor.value?.battery ? sensor.value.battery + 2 : 85 },
  { date: '3 days ago', value: sensor.value?.battery ? sensor.value.battery + 1.5 : 80 },
  { date: '2 days ago', value: sensor.value?.battery ? sensor.value.battery + 1 : 75 },
  { date: '1 day ago', value: sensor.value?.battery ? sensor.value.battery + 0.5 : 70 },
  { date: 'Today', value: sensor.value?.battery || 65 }
])

const recentActivity = computed(() => {
  return sensorStore.activityLog.filter(entry => entry.sensorId === sensorId.value).slice(0, 5)
})

const goBack = () => {
  router.back()
}

onMounted(() => {
  if (!sensor.value) {
    router.push('/')
  }
})
</script>

<template>
  <div v-if="sensor" class="sensor-details">
    <div class="details-header">
      <button class="back-button" @click="goBack">← Back</button>
      <h1>{{ sensor.name }}</h1>
      <div class="sensor-meta">
        <span class="sensor-type">{{ sensor.type === 'door' ? 'Door Sensor' : 'Window Sensor' }}</span>
        <span class="sensor-location">{{ sensor.location }}</span>
      </div>
    </div>
    
    <div class="details-content">
      <div class="status-card" :class="{ 'open': sensor.isOpen }">
        <div class="status-header">
          <h2>Current Status</h2>
          <div class="status-indicator" :class="{ 'open': sensor.isOpen }"></div>
        </div>
        <div class="status-body">
          <div class="status-large">{{ sensor.isOpen ? 'OPEN' : 'CLOSED' }}</div>
          <div class="status-time">Last updated: {{ new Date(sensor.lastUpdate).toLocaleString() }}</div>
        </div>
      </div>
      
      <div class="details-section">
        <h2>Sensor Details</h2>
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-label">ID</div>
            <div class="detail-value">{{ sensor.id }}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Battery</div>
            <div class="detail-value" :class="{ 
              'critical': sensor.battery < 20,
              'warning': sensor.battery >= 20 && sensor.battery < 40,
              'good': sensor.battery >= 40
            }">
              {{ sensor.battery }}%
            </div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Signal</div>
            <div class="detail-value" :class="{ 
              'critical': sensor.signal < 20,
              'warning': sensor.signal >= 20 && sensor.signal < 40,
              'good': sensor.signal >= 40
            }">
              {{ sensor.signal }}%
            </div>
          </div>
        </div>
      </div>
      
      <div class="details-section">
        <h2>Battery History</h2>
        <div class="battery-chart">
          <div 
            v-for="(data, index) in batteryHistory" 
            :key="index"
            class="chart-bar"
            :style="{ height: `${data.value}%` }"
            :title="`${data.date}: ${data.value}%`"
          ></div>
        </div>
        <div class="chart-labels">
          <div v-for="(data, index) in batteryHistory" :key="index" class="chart-label">
            {{ index === 0 || index === batteryHistory.length - 1 ? data.date : '' }}
          </div>
        </div>
      </div>
      
      <div class="details-section">
        <h2>Recent Activity</h2>
        <div v-if="recentActivity.length === 0" class="no-activity">
          No recent activity recorded.
        </div>
        <ul v-else class="activity-list">
          <li v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-event">
              {{ activity.event === 'opened' ? 'Opened' : 'Closed' }}
            </div>
            <div class="activity-time">
              {{ new Date(activity.timestamp).toLocaleString() }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
  <div v-else class="loading-state">
    Loading sensor details...
  </div>
</template>

<style scoped>
.sensor-details {
  max-width: 800px;
  margin: 0 auto;
}

.details-header {
  margin-bottom: var(--space-6);
}

.back-button {
  margin-bottom: var(--space-3);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-neutral-200);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.back-button:hover {
  background-color: var(--color-neutral-300);
}

.sensor-meta {
  display: flex;
  gap: var(--space-3);
  color: var(--color-neutral-600);
}

.details-content {
  display: grid;
  gap: var(--space-6);
}

.status-card {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow);
  border-top: 4px solid var(--color-success);
}

.status-card.open {
  border-top-color: var(--color-error);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: var(--color-success);
}

.status-indicator.open {
  background-color: var(--color-error);
}

.status-body {
  text-align: center;
}

.status-large {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-2);
}

.open .status-large {
  color: var(--color-error);
}

.status-time {
  color: var(--color-neutral-500);
  font-size: 0.875rem;
}

.details-section {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow);
}

.details-section h2 {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-neutral-200);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
  margin-bottom: var(--space-1);
}

.detail-value {
  font-weight: 600;
}

.detail-value.critical {
  color: var(--color-error);
}

.detail-value.warning {
  color: var(--color-warning);
}

.detail-value.good {
  color: var(--color-success);
}

.battery-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 150px;
  gap: 4px;
}

.chart-bar {
  flex: 1;
  background-color: var(--color-primary);
  border-radius: var(--radius) var(--radius) 0 0;
  min-height: 5%;
  transition: height var(--transition-base);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
}

.chart-label {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: var(--color-neutral-500);
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-neutral-200);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-event {
  font-weight: 500;
}

.activity-time {
  font-size: 0.875rem;
  color: var(--color-neutral-500);
}

.no-activity {
  padding: var(--space-4);
  text-align: center;
  color: var(--color-neutral-500);
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: var(--color-neutral-500);
}

@media (prefers-color-scheme: dark) {
  .back-button {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }
  
  .back-button:hover {
    background-color: var(--color-neutral-600);
  }
  
  .sensor-meta {
    color: var(--color-neutral-400);
  }
  
  .status-card,
  .details-section {
    background-color: var(--color-neutral-800);
  }
  
  .details-section h2 {
    border-bottom-color: var(--color-neutral-700);
  }
  
  .status-time,
  .detail-label,
  .chart-label,
  .activity-time {
    color: var(--color-neutral-400);
  }
  
  .activity-item {
    border-bottom-color: var(--color-neutral-700);
  }
}

@media (max-width: 640px) {
  .details-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}
</style>