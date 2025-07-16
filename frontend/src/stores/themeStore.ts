import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const isDark = ref(getInitialTheme() === 'dark')

  // Apply theme to document
  const applyTheme = (dark: boolean) => {
    const html = document.documentElement
    if (dark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  // Toggle theme
  const toggleTheme = () => {
    isDark.value = !isDark.value
  }

  // Set specific theme
  const setTheme = (dark: boolean) => {
    isDark.value = dark
  }

  // Watch for theme changes and apply them
  watch(isDark, (newValue) => {
    applyTheme(newValue)
  }, { immediate: true })

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't manually set a preference
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
    }
  })

  return {
    isDark,
    toggleTheme,
    setTheme
  }
}) 