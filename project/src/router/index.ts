import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import Dashboard from '../views/Dashboard.vue'
import SensorDetails from '../views/SensorDetails.vue'
import FloorPlan from '../views/FloorPlan.vue'
import ActivityLog from '../views/ActivityLog.vue'
import Settings from '../views/Settings.vue'
import NotFound from '../views/NotFound.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Dashboard,
          meta: { exact: true }
        },
        {
          path: 'sensor/:id',
          name: 'sensor-details',
          component: SensorDetails,
          props: true
        },
        {
          path: 'floor-plan',
          name: 'floor-plan',
          component: FloorPlan
        },
        {
          path: 'activities',
          name: 'activities',
          component: ActivityLog
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  authStore.initialize()
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authStore.isAuthenticated
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route while not authenticated
    next({ name: 'login' })
  } else if (!requiresAuth && isAuthenticated) {
    // Redirect to dashboard if trying to access auth pages while authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router