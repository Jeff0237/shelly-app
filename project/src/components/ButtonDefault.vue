<script setup lang="ts">
const props = defineProps<{
  label?: string
}>()
</script>

<template>
  <button>
    <template v-if="props.label">
      {{ props.label }}
    </template>
    <template v-else>
      <slot/>
    </template>
  </button>
</template>

<style scoped>
</style>
