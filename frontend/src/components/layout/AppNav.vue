<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useI18n } from 'vue-i18n'
import LanguageSelector from "../LanguageSelector.vue";
import IconClose from "../icons/IconClose.vue";

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const isNavOpen = ref(false)
const navContentRef = ref<HTMLElement | null>(null)

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

/* Computed part */
const isAuthenticated = computed(() => {
  return authStore.isAuthenticated || false;
});

// const authUser = computed(() => {
//   return authStore.user || {};
// });

// --- Close menu on click outside ---
function onClickOutside(event: MouseEvent) {
  if (isNavOpen.value && navContentRef.value && !navContentRef.value.contains(event.target as Node)) {
    closeNav();
  }
}

watch(isNavOpen, (open) => {
  if (open) {
    document.addEventListener('mousedown', onClickOutside)
  } else {
    document.removeEventListener('mousedown', onClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})

// --- Close menu on route change ---
onMounted(() => {
  router.afterEach(() => {
    closeNav();
  })
})
</script>

<template>
  <nav class="app-nav fixed top-0 left-0 w-full z-[2000] pointer-events-none">
    <!-- Toggle Button (always visible on mobile, hidden on desktop) -->
    <button
      class="nav-toggle fixed cursor-pointer top-4 right-4 z-[1100] bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-700 text-white rounded-xl p-3 shadow-lg hover:from-blue-700 hover:to-indigo-800 dark:hover:from-blue-600 dark:hover:to-indigo-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 pointer-events-auto"
      @click="toggleNav"
      :aria-expanded="isNavOpen"
      aria-label="Open navigation menu"
      v-show="!isNavOpen"
    >
      <svg v-if="!isNavOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- Slide-in Nav Content -->
    <teleport to="body">
      <div
        ref="navContentRef"
        class="nav-content fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-gray-900 shadow-2xl z-[3000] transition-transform duration-300 ease-in-out flex flex-col border-l border-gray-200 dark:border-gray-700 pointer-events-auto"
        :class="{ 'translate-x-0 opacity-100 visible': isNavOpen, 'translate-x-full opacity-0 invisible': !isNavOpen }"
      >
        <div class="nav-header flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100 m-0">{{ t('navigation.title') }}</h2>
          <button
            class="close-nav bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-700 text-white rounded-xl p-2 shadow hover:from-blue-700 hover:to-indigo-800 dark:hover:from-blue-600 dark:hover:to-indigo-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            @click="closeNav"
            aria-label="Close navigation menu"
          >
            <IconClose />
          </button>
        </div>

        <div class="flex-1 flex flex-col gap-2 px-6 py-4 h-96 bg-white">
          <template v-if="isAuthenticated">
            <RouterLink :to="{ name: 'home' }" class="nav-link" @click="closeNav" activeClass="router-link-active" exactActiveClass="router-link-exact-active">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              {{ t('navigation.dashboard') }}
            </RouterLink>
            <!-- <RouterLink :to="{ name: 'activities' }" class="nav-link" @click="closeNav">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
              {{ t('navigation.activities') }}
            </RouterLink> -->

            <RouterLink :to="{ name: 'components' }" class="nav-link" @click="closeNav">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              {{ t('navigation.components') }}
            </RouterLink>
            
            <RouterLink :to="{ name: 'settings' }" class="nav-link" @click="closeNav">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              {{ t('navigation.settings') }}
            </RouterLink>
            
            <div class="choose-language flex items-center gap-2 mt-2">
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('common.choose_language')}} :</span>
              <LanguageSelector class="w-full" />
            </div>
            <button class="nav-link logout mt-auto" @click="handleLogout">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              {{ t('auth.logout') }}
            </button>
          </template>
          <template v-else>
            <RouterLink :to="{ name: 'home' }" class="nav-link" @click="closeNav">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              {{ t('navigation.home') }}
            </RouterLink>
            <RouterLink :to="{ name: 'login' }" class="nav-link" @click="closeNav">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              {{ t('auth.login') }}
            </RouterLink>
            <RouterLink :to="{ name: 'register' }" class="nav-link" @click="closeNav">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
              </svg>
              {{ t('auth.register') }}
            </RouterLink>
          </template>
        </div>
      </div>
    </teleport>
  </nav>
</template>

<style scoped>
/* All z-index is now handled by Tailwind classes. */
</style> 
