<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSelector from "../LanguageSelector.vue";

const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="flex bg-white h-auto min-h-20 px-5 py-3 w-full">
    <div class="flex flex-col md:justify-between md:flex-row-reverse w-full">
      <div class="flex flex-col">
        <a href="#" class="footer-link">{{ t('footer.privacyPolicy') }}</a>
        <a href="#" class="footer-link">{{ t('footer.termsOfService') }}</a>
        <a href="#" class="footer-link">{{ t('footer.contactSupport') }}</a>
      </div>
      <div class="mt-2 md:mt-0">
        <div class="language-section">
          <span>
            {{ t('common.choose_language')}} :
          </span>
          <LanguageSelector class="inline-flex" />
        </div>
        <p class="copyright">
          {{ t('footer.copyright', { year: currentYear }) }}
        </p>
      </div>
    </div>
  </footer>
</template>
