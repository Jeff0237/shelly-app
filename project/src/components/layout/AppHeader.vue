<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSensorStore } from '../../stores/sensorStore'
import { useAuthStore } from '../../stores/authStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSelector from '../LanguageSelector.vue'

const sensorStore = useSensorStore()
const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

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

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <header class="app-header">
    <div class="container header-container">
      <div class="header-left">
        <RouterLink to="/">
          <h1 class="app-title">
            {{ t('common.appName') }}
          </h1>
        </RouterLink>
      </div>
      
      <div class="header-center">
        <div v-if="authStore.isAuthenticated" class="security-status" :class="{ 'alert': securityStatus.status === 'alert' }">
          <div class="status-indicator" :style="{ backgroundColor: securityStatus.color }"></div>
          <span class="status-text">{{ securityStatus.text }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <div v-if="authStore.isAuthenticated" class="user-section">
          <div class="user-info">
            <div class="flex-column">
              <div class="time-info">
                <div class="current-time">{{ formattedTime }}</div>
                <div class="current-date">{{ formattedDate }}</div>
              </div>
              <span class="user-name">{{ authStore.user?.email }}</span>
            </div>
            <button class="logout-button" v-show="false" @click="handleLogout">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {{ t('auth.logout') }}
            </button>
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
  padding-right: 4rem;
}

.app-title {
  font-size: 1.5rem;
  color: var(--color-primary);
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
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: end;
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

.flex-column {
  display: flex;
  flex-direction: column;
  line-height: 1.35rem;
}

.user-name {
  font-weight: 500;
  color: var(--color-neutral-700);
}

.logout-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-error-light);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.logout-button:hover {
  background: var(--color-error);
  color: white;
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