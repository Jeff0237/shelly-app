<script setup lang="ts">
import { useLanguageStore } from '../stores/languageStore'
import {computed, useAttrs} from "vue";

const attrs = useAttrs();
const languageStore = useLanguageStore()

const selectClass = computed(() => {
  return attrs.class || ''
})
</script>

<template>
  <div class="language-selector"
  >
    <select
      :class="['language-select', selectClass]"
      :value="languageStore.currentLanguage"
      @change="(e) => languageStore.setLanguage((e.target as HTMLSelectElement).value)"
    >
      <option
        v-for="lang in languageStore.availableLanguages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.w-full {
  width: 100%;
}

.language-selector {
  display: flex;
  align-items: center;
}
.language-selector.inline-flex {
  display: inline-flex;
  align-items: center;
}

.language-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius);
  background: white;
  color: var(--color-neutral-900);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.language-select:hover {
  border-color: var(--color-primary);
}

.language-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}

@media (prefers-color-scheme: dark) {
  .language-select {
    background: var(--color-neutral-800);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }

  .language-select:hover {
    border-color: var(--color-primary);
  }

  .language-select:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-dark);
  }
}
</style>
