import { defineStore } from 'pinia'
import { ref } from 'vue'
import i18n from '../i18n'

export const useLanguageStore = defineStore('language', () => {
  const currentLanguage = ref(localStorage.getItem('locale') || 'en')

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
  ]

  function setLanguage(lang: string) {
    if (availableLanguages.some(l => l.code === lang)) {
      currentLanguage.value = lang
      i18n.global.locale.value = lang
      localStorage.setItem('locale', lang)
    }
  }

  return {
    currentLanguage,
    availableLanguages,
    setLanguage,
  }
}) 