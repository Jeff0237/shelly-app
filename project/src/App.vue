<script setup lang="ts">
import { onMounted } from 'vue'
import { useSensorStore } from './stores/sensorStore'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import {onBeforeRouteUpdate} from "vue-router";

const sensorStore = useSensorStore()

onMounted(() => {
  sensorStore.loadSensors()
  
  // In a real application, we would connect to the MQTT broker here
  // Instead, we'll simulate random sensor updates
  const simulateUpdates = () => {
    const randomSensorId = Math.floor(Math.random() * sensorStore.sensors.length)
    const sensor = sensorStore.sensors[randomSensorId]
    if (sensor) {
      sensorStore.updateSensorStatus(sensor.id, {
        isOpen: Math.random() > 0.7, // 30% chance of being open
        battery: Math.max(sensor.battery - Math.random() * 0.1, 0),
        lastUpdate: new Date().toISOString()
      })
    }
    
    // Schedule next update
    setTimeout(simulateUpdates, Math.random() * 10000 + 5000) // Between 5-15 seconds
  }
  
  // Start simulation after 3 seconds
  setTimeout(simulateUpdates, 3000)
})

onBeforeRouteUpdate(async (to, from) => {
  console.log('Route changes')
  console.log(to)
  console.log(from)
})
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
  padding: var(--space-4);
}

@media (min-width: 768px) {
  main {
    padding: var(--space-6);
  }
}
</style>