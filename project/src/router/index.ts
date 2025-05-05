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
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ListComponents from '../views/Components.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
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
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
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
          path: 'components',
          name: 'components',
          component: ListComponents,
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
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state from localStorage
  authStore.initialize()
  let _routeName = '';
  const requiresAuth: boolean|null = to.matched.some(record => {
    _routeName = record.name?.toString() ?? '';
    return record.meta.requiresAuth;
  });

  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    // Redirect to log in if trying to access a protected route while not authenticated
    next({ name: 'login' })
  } else if (_routeName !== 'not-found' && !requiresAuth && isAuthenticated) {
    // Redirect to the dashboard if trying to access auth pages while authenticated
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
