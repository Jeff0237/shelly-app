<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSelector from "../LanguageSelector.vue";

const { t } = useI18n()
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-left">
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
      <div class="footer-right">
        <a href="#" class="footer-link">{{ t('footer.privacyPolicy') }}</a>
        <a href="#" class="footer-link">{{ t('footer.termsOfService') }}</a>
        <a href="#" class="footer-link">{{ t('footer.contactSupport') }}</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: white;
  border-top: 1px solid var(--color-neutral-200);
  padding: var(--space-4) 0;
  margin-top: auto;
  padding-bottom: 1rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: end;
}

.copyright {
  color: var(--color-neutral-600);
  font-size: 0.875rem;
  margin: 0;
}

.footer-right {
  display: flex;
  gap: var(--space-4);
}

.footer-link {
  color: var(--color-neutral-600);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-base);
}

.footer-link:hover {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
    align-items: center !important;
  }

  .footer-right {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (prefers-color-scheme: dark) {
  .app-footer {
    background: var(--color-neutral-800);
    border-top-color: var(--color-neutral-700);
  }

  .copyright,
  .footer-link {
    color: var(--color-neutral-400);
  }

  .footer-link:hover {
    color: var(--color-primary-light);
  }
}
</style>
