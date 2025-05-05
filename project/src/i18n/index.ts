import { createI18n } from 'vue-i18n'
import en from './translations/en'
import fr from './translations/fr'
import de from './translations/de'

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    fr,
    de,
  },
})

export default i18n
