import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
// import Dashboard from '../views/Dashboard.vue'
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
import Components from '../views/Components.vue'
import Home from '@/views/Home.vue'
import AddDevice from '@/views/AddDevice.vue'
import DeviceDetails from '@/views/DeviceDetails.vue'
import VerifyOTP from '../views/VerifyOTP.vue'
import OAuthCallback from '../views/OAuthCallback.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
      name: 'home',
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
      path: '/verify-otp',
      name: 'verify-otp',
      component: VerifyOTP,
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      meta: { requiresAuth: false }
    },
    {
      path: '/add-device',
      name: 'add-device',
      component: AddDevice,
      meta: { requiresAuth: true }
    },
    {
      path: '/device/:id',
      name: 'device-details',
      component: DeviceDetails,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: Home,
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
        },
        {
          path: 'components1',
          name: 'components1',
          component: Components
        },
        {
          path: 'settings1',
          name: 'settings1',
          component: Settings
        },
      ]
    },
    {
      path: '/oauth/callback',
      name: 'OAuthCallback',
      meta: { requiresAuth: false },
      component: OAuthCallback,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound
    }
  ]
})


// Navigation guard
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()
    const token = localStorage.getItem('access_token')

    // Only initialize if we have a token and no user data
    if (token && !authStore.user) {
      await authStore.initialize()
    }

    const requiresAuth = to.matched.some((record: {meta?: {requiresAuth?: Boolean}} )=> record.meta?.requiresAuth ?? false)
    
    const isAuthenticated = authStore.isAuthenticated

    if (!token && to.path.startsWith('/dashboard')) {
        next('/login')
    } else if (token && ['/login', '/register'].includes(to.path)) {
      next('/')
    } else if (requiresAuth) {
      if  (!isAuthenticated || !token) {
        next({ name: 'login' })
      } else {
        next()
      }
    } else {
      next()
    }
  } catch (error) {
    console.error('Router guard error:', error)
    // Fallback to login if there's an error
    next('/login')
  }
})

export default router
