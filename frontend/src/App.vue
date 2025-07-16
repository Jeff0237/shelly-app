<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useThemeStore } from './stores/themeStore'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initialize()
  
  // Theme store is automatically initialized and applies theme
  // No additional initialization needed
})

</script>

<template>
  <div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
    <AppHeader />
    <main class="main-content min-h-[80vh] pt-4">
      <router-view></router-view>
    </main>
    <AppFooter/>
  </div>
</template>

<style scoped>
</style>
