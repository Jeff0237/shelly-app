<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useSensorStore } from './stores/sensorStore'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const authStore = useAuthStore()
const sensorStore = useSensorStore()

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initialize()
  
  // Load sensors if authenticated
  if (authStore.isAuthenticated) {
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
  }
})
</script>

<template>
  <div class="app">
    <AppHeader v-if="authStore.isAuthenticated" />
    <main class="main-content" :class="{ 'with-nav': authStore.isAuthenticated }">
      <RouterView />
    </main>
    <AppFooter v-if="authStore.isAuthenticated" />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Adjust this value based on your header height */
  padding-bottom: var(--space-8);
}

.main-content.with-nav {
  padding-top: calc(var(--space-4) * 2 + 24px);
}

@media (max-width: 768px) {
  .main-content {
    padding-top: calc(80px + var(--space-4));
  }

  .main-content.with-nav {
    padding-top: calc(var(--space-4) * 3 + 24px);
  }
}

@media (prefers-color-scheme: dark) {
  .app {
    background-color: var(--color-neutral-900);
    color: var(--color-neutral-100);
  }
}
</style>