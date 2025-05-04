<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <button class="home-button" @click="goHome">
        Return to Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-6);
}

.content {
  max-width: 500px;
}

h1 {
  font-size: 6rem;
  color: var(--color-primary);
  margin-bottom: var(--space-2);
  line-height: 1;
}

h2 {
  font-size: 2rem;
  color: var(--color-neutral-800);
  margin-bottom: var(--space-4);
}

p {
  color: var(--color-neutral-600);
  margin-bottom: var(--space-6);
  font-size: 1.1rem;
}

.home-button {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius);
  font-weight: 500;
  transition: background-color var(--transition-base);
}

.home-button:hover {
  background-color: var(--color-primary-dark);
}

@media (prefers-color-scheme: dark) {
  h2 {
    color: var(--color-neutral-200);
  }
  
  p {
    color: var(--color-neutral-400);
  }
}
</style> 