<script setup lang="ts">
import { computed, ref, toRaw } from 'vue'
import { useSensorStore } from '../../stores/sensorStore'
import { useAuthStore } from '../../stores/authStore'
// import { useThemeStore } from '../../stores/themeStore'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppNav from './AppNav.vue'
//import ThemeToggle from '../ui/ThemeToggle.vue'
import { useDeviceStore } from '../../stores/deviceStore';

const deviceStore = useDeviceStore();

// interface User {
//   email: string
//   name: string
//   role: string
//   created_at: string
//   id?: string
// }

const sensorStore = useSensorStore()
const authStore = useAuthStore()
// const themeStore = useThemeStore()
const router = useRouter()
const { t } = useI18n()

const currentTime = ref(new Date())

// Update time every minute
setInterval(() => {
  currentTime.value = new Date()
}, 60000)

// const formattedTime = computed(() => {
//   return currentTime.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// })

// const formattedDate = computed(() => {
//   return currentTime.value.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
// })

const securityStatus = computed(() => {
  if (sensorStore.isAllClosed) {
    return { status: 'secure', text: 'All Secure', color: 'var(--color-success)' }
  } else {
    // return { status: 'alert', text: `${sensorStore.openSensors.length} Open`, color: 'var(--color-error)' }
    return { status: 'alert', text: ` open${openCount.value > 1 ? 's' : ''}`, color: 'var(--color-error)' }
  }
})

// const handleLogout = async () => {
//   try {
//     await authStore.logout()
//     router.push('/login')
//   } catch (error) {
//     console.error('Logout failed:', error)
//   }
// }

/* Computed part */

const isAuthenticated = computed(() => {
  return authStore.isAuthenticated || false;
});

// const authUser = computed<User | null>(() => authStore.user)

const openCount = computed(() => [...toRaw(deviceStore.devices)].filter(d => toRaw(deviceStore.deviceStatuses)[d.id]?.state === 'open').length);
</script>

<template>
  <header class="app-header bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <RouterLink to="/" class="flex items-center">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {{ t('common.appName') }}
            </h1>
          </RouterLink>
        </div>
        
        <div class="flex items-center space-x-1 mr-12">
          <!-- Security Status -->
          <div v-if="isAuthenticated && openCount > -1" class="mt-1.5 flex items-center px-4 py-2 rounded-xl border bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-700/50 ml-12">
            <span v-if="openCount > 0" class="mx-2 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{{ openCount }}</span>
            <span v-else class="mx-2">0</span>
            <span class="text-sm font-semibold pr-2"> {{ securityStatus.text }}</span>
          </div>


          <!-- User Section -->
          <!-- <div v-if="isAuthenticated && authUser && authUser.id" class="flex items-center space-x-4">
            <div class="hidden md:flex flex-col items-end">
              <div class="text-sm text-gray-600 dark:text-gray-400">{{ formattedTime }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-500">{{ formattedDate }}</div>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="hidden sm:flex flex-col">
                <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ authUser?.email }}</span>
              </div>
              
              <button 
                @click="handleLogout"
                class="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                <span class="hidden sm:inline">{{ t('auth.logout') }}</span>
              </button>
            </div>
          </div> -->

          <!-- <div class="relative w-16 mr-12 mt-0.5"> -->
            <!-- Theme Toggle -->
            <!-- <ThemeToggle /> -->
          <!-- </div> -->

          <!-- Navigation -->
          <!-- <div class="relative z-2000"> -->
            <AppNav />
          <!-- </div> -->
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Additional custom styles if needed */
</style>