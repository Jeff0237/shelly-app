import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import SensorDetails from '../views/SensorDetails.vue'
import FloorPlan from '../views/FloorPlan.vue'
import ActivityLog from '../views/ActivityLog.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/sensor/:id',
      name: 'sensor-details',
      component: SensorDetails,
      props: true
    },
    {
      path: '/floor-plan',
      name: 'floor-plan',
      component: FloorPlan
    },
    {
      path: '/activity',
      name: 'activity',
      component: ActivityLog
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    }
  ]
})

export default router