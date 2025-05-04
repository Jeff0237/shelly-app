<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useI18n } from 'vue-i18n'
import LanguageSelector from "../LanguageSelector.vue";

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const isNavOpen = ref(false)

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const closeNav = () => {
  isNavOpen.value = false
}
</script>

<template>
  <nav class="app-nav">
    <button class="nav-toggle" @click="toggleNav" :aria-expanded="isNavOpen">
      <svg v-if="!isNavOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>

    <div class="nav-content" :class="{ 'is-open': isNavOpen }">
      <div class="nav-header">
        <h2>{{ t('navigation.title') }}</h2>
        <button class="close-nav" @click="closeNav">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="nav-links">
        <RouterLink :to="{ name: 'dashboard' }" :exact="true" class="nav-link" @click="closeNav" activeClass=""
                    exactActiveClass="router-link-active router-link-exact-active">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          {{ t('navigation.dashboard') }}
        </RouterLink>

        <RouterLink :to="{ name: 'floor-plan' }" class="nav-link" @click="closeNav">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          {{ t('navigation.floorPlan') }}
        </RouterLink>

        <RouterLink :to="{ name: 'activities' }" class="nav-link" @click="closeNav">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20v-6M6 20V10M18 20V4"></path>
          </svg>
          {{ t('navigation.activities') }}
        </RouterLink>

        <RouterLink :to="{ name: 'settings' }" class="nav-link" @click="closeNav">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          {{ t('navigation.settings') }}
        </RouterLink>

        <div>
          <span>
            {{ t('common.choose_language')}} :
          </span>
          <LanguageSelector class="w-full" />
        </div>

        <button class="nav-link logout" @click="handleLogout">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {{ t('auth.logout') }}
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
}

.nav-toggle {
  position: fixed;
  top: var(--space-5);
  right: var(--space-4);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: var(--space-2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-base);
  z-index: 1001;
}

.nav-toggle:hover {
  background: var(--color-primary-dark);
}

.nav-content {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100vh;
  background: white;
  box-shadow: var(--shadow);
  transition: transform var(--transition-base);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.nav-content.is-open {
  transform: translateX(-300px);
}

.nav-header {
  padding: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-neutral-200);
}

.nav-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-neutral-900);
}

.close-nav {
  background: none;
  border: none;
  padding: var(--space-2);
  cursor: pointer;
  color: var(--color-neutral-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-base);
}

.close-nav:hover {
  color: var(--color-primary);
}

.nav-links {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  color: var(--color-neutral-700);
  text-decoration: none;
  border-radius: var(--radius);
  transition: all var(--transition-base);
}

.nav-link:hover {
  background: var(--color-neutral-100);
  color: var(--color-primary);
}

.nav-link.router-link-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.nav-link svg {
  width: 20px;
  height: 20px;
}

.logout {
  margin-top: auto;
  color: var(--color-error);
}

.logout:hover {
  background: var(--color-error-light);
  color: #fff;
}

@media (prefers-color-scheme: dark) {
  .nav-content {
    background: var(--color-neutral-800);
  }

  .nav-header {
    border-bottom-color: var(--color-neutral-700);
  }

  .nav-header h2 {
    color: var(--color-neutral-100);
  }

  .close-nav {
    color: var(--color-neutral-400);
  }

  .nav-link {
    color: var(--color-neutral-300);
  }

  .nav-link:hover {
    background: var(--color-neutral-700);
  }

  .nav-link.router-link-active {
    background: var(--color-primary-dark);
    color: var(--color-primary-light);
  }
}
</style> 