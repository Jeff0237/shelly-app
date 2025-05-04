<script setup lang="ts">

const currentYear = new Date().getFullYear()

const navItems = [
  { label: 'Dashboard', route: '/' },
  { label: 'Floor Plan', route: '/floor-plan' },
  { label: 'Activity', route: '/activity' },
  { label: 'Settings', route: '/settings' }
]
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <nav class="footer-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.label">
            <RouterLink :to="item.route" class="nav-link">
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </nav>
      
      <div class="footer-info">
        <p>&copy; {{ currentYear }} Laboratory Security System</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-neutral-100);
  border-top: 1px solid var(--color-neutral-200);
  padding: var(--space-4) 0;
  margin-top: auto;
}

.footer-nav {
  margin-bottom: var(--space-4);
}

.nav-list {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  list-style: none;
}

.nav-link {
  color: var(--color-neutral-700);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-base);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
}

.footer-info {
  text-align: center;
  color: var(--color-neutral-600);
  font-size: 0.875rem;
}

@media (prefers-color-scheme: dark) {
  .app-footer {
    background-color: var(--color-neutral-800);
    border-top-color: var(--color-neutral-700);
  }
  
  .nav-link {
    color: var(--color-neutral-400);
  }
  
  .footer-info {
    color: var(--color-neutral-500);
  }
}

@media (max-width: 640px) {
  .nav-list {
    flex-wrap: wrap;
    gap: var(--space-3);
  }
}
</style>