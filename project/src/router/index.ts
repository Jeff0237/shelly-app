import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import SensorDetails from '../views/SensorDetails.vue'
import FloorPlan from '../views/FloorPlan.vue'
import ActivityLog from '../views/ActivityLog.vue'
import Settings from '../views/Settings.vue'
import NotFound from '../views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      children: [
        {
          path: '',
          name: 'index',
          component: Dashboard
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
          path: 'activity',
          name: 'activity',
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

export default router