<script setup lang="ts">
import { useSensorStore } from '../../stores/sensorStore'

const sensorStore = useSensorStore()
</script>

<template>
  <div class="status-summary">
    <div v-if="sensorStore.isAllClosed" class="all-secure">
      <div class="status-icon secure"></div>
      <h2>All Secure</h2>
      <p>All {{ sensorStore.sensors.length }} sensors are reporting closed status.</p>
    </div>
    
    <div v-else class="alert-status">
      <div class="status-icon alert"></div>
      <h2>Security Alert</h2>
      <div class="open-sensors">
        <h3>{{ sensorStore.openSensors.length }} Open {{ sensorStore.openSensors.length === 1 ? 'Entry' : 'Entries' }}</h3>
        <ul class="open-list">
          <li v-for="sensor in sensorStore.openSensors" :key="sensor.id">
            <router-link :to="`/sensor/${sensor.id}`" class="open-sensor-link">
              {{ sensor.name }} ({{ sensor.location }})
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    
    <div v-if="sensorStore.lowBatterySensors.length > 0" class="low-battery-alert">
      <h3>Low Battery Warning</h3>
      <ul class="low-battery-list">
        <li v-for="sensor in sensorStore.lowBatterySensors" :key="sensor.id">
          {{ sensor.name }}: {{ sensor.battery }}%
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.status-summary {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow);
  margin-bottom: var(--space-6);
}

.all-secure, .alert-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.status-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-bottom: var(--space-3);
}

.status-icon.secure {
  background-color: var(--color-success);
  box-shadow: 0 0 0 8px rgba(48, 209, 88, 0.2);
}

.status-icon.alert {
  background-color: var(--color-error);
  box-shadow: 0 0 0 8px rgba(255, 69, 58, 0.2);
  animation: pulse 2s infinite;
}

.all-secure h2 {
  color: var(--color-success);
  margin-bottom: var(--space-2);
}

.alert-status h2 {
  color: var(--color-error);
  margin-bottom: var(--space-2);
}

.open-sensors {
  margin-top: var(--space-4);
  width: 100%;
}

.open-list {
  text-align: left;
  list-style: none;
  padding: 0;
  margin-top: var(--space-3);
}

.open-list li {
  margin-bottom: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-neutral-100);
  border-radius: var(--radius);
  border-left: 4px solid var(--color-error);
}

.open-sensor-link {
  display: block;
  color: var(--color-neutral-900);
  text-decoration: none;
  font-weight: 500;
}

.open-sensor-link:hover {
  color: var(--color-error);
}

.low-battery-alert {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-neutral-200);
}

.low-battery-alert h3 {
  color: var(--color-warning);
  margin-bottom: var(--space-3);
}

.low-battery-list {
  list-style: none;
  padding: 0;
}

.low-battery-list li {
  margin-bottom: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-neutral-100);
  border-radius: var(--radius);
  border-left: 4px solid var(--color-warning);
}

@media (prefers-color-scheme: dark) {
  .status-summary {
    background-color: var(--color-neutral-800);
  }
  
  .open-list li, .low-battery-list li {
    background-color: var(--color-neutral-700);
  }
  
  .open-sensor-link {
    color: var(--color-neutral-100);
  }
}
</style>