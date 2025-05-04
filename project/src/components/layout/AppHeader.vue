<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSensorStore } from '../../stores/sensorStore'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'

const sensorStore = useSensorStore()
const authStore = useAuthStore()
const router = useRouter()

const currentTime = ref(new Date())

// Update time every minute
setInterval(() => {
  currentTime.value = new Date()
}, 60000)

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
})

const securityStatus = computed(() => {
  if (sensorStore.isAllClosed) {
    return { status: 'secure', text: 'All Secure', color: 'var(--color-success)' }
  } else {
    return { status: 'alert', text: `${sensorStore.openSensors.length} Open`, color: 'var(--color-error)' }
  }
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="container header-container">
      <div class="header-left">
        <h1 class="site-title">Lab Security</h1>
      </div>
      
      <div class="header-center">
        <div v-if="authStore.isAuthenticated" class="security-status" :class="{ 'alert': securityStatus.status === 'alert' }">
          <div class="status-indicator" :style="{ backgroundColor: securityStatus.color }"></div>
          <span class="status-text">{{ securityStatus.text }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div v-if="authStore.isAuthenticated" class="user-section">
          <div class="time-info">
            <div class="current-time">{{ formattedTime }}</div>
            <div class="current-date">{{ formattedDate }}</div>
          </div>
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.name }}</span>
            <button class="logout-button" @click="handleLogout">Logout</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--color-neutral-100);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: var(--space-4) 0;
  box-shadow: var(--shadow-sm);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.site-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.security-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-neutral-100);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  transition: all var(--transition-base);
}

.security-status.alert {
  animation: pulse 2s infinite;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: background-color var(--transition-base);
}

.status-text {
  font-weight: 600;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.time-info {
  text-align: right;
}

.current-time {
  font-size: 1.25rem;
  font-weight: 500;
}

.current-date {
  font-size: 0.875rem;
  color: var(--color-neutral-600);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-name {
  font-weight: 500;
  color: var(--color-neutral-700);
}

.logout-button {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-700);
  border-radius: var(--radius);
  font-weight: 500;
  transition: all var(--transition-base);
}

.logout-button:hover {
  background-color: var(--color-neutral-300);
}

@media (prefers-color-scheme: dark) {
  .app-header {
    background-color: var(--color-neutral-800);
    border-bottom-color: var(--color-neutral-700);
  }
  
  .security-status {
    background-color: var(--color-neutral-800);
  }
  
  .current-date {
    color: var(--color-neutral-400);
  }
  
  .user-name {
    color: var(--color-neutral-300);
  }
  
  .logout-button {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-300);
  }
  
  .logout-button:hover {
    background-color: var(--color-neutral-600);
  }
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .user-section {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .time-info {
    text-align: center;
  }
  
  .user-info {
    flex-direction: column;
    gap: var(--space-2);
  }
}
</style>