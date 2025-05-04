<script setup lang="ts">
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

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
    <div class="header-content">
      <div class="header-left">
        <h1 class="app-title">Shelly App</h1>
      </div>
      <div class="header-right">
        <div class="user-info">
          <span class="user-email">{{ authStore.user?.email }}</span>
          <button class="logout-button" @click="handleLogout">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  box-shadow: var(--shadow);
  z-index: 999;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-primary);
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.user-email {
  color: var(--color-neutral-600);
  font-size: 0.875rem;
}

.logout-button {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-error-light);
  color: var(--color-error);
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.logout-button-old {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-700);
  border-radius: var(--radius);
  font-weight: 500;
  transition: all var(--transition-base);
}

.logout-button:hover {
  background: var(--color-error);
  color: white;
}

.logout-button-old:hover {
  background-color: var(--color-neutral-300);
}


@media (prefers-color-scheme: dark) {
  .app-header {
    background: var(--color-neutral-800);
  }

  .user-email {
    color: var(--color-neutral-400);
  }
}
</style> 