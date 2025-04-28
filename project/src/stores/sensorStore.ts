import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Sensor, SensorStatus, ActivityLogEntry } from '../types'
import { mockSensors } from '../data/mockData'

export const useSensorStore = defineStore('sensors', () => {
  const sensors = ref<Sensor[]>([])
  const activityLog = ref<ActivityLogEntry[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Computed properties
  const openSensors = computed(() => 
    sensors.value.filter(sensor => sensor.isOpen)
  )
  
  const closedSensors = computed(() => 
    sensors.value.filter(sensor => !sensor.isOpen)
  )
  
  const isAllClosed = computed(() => 
    sensors.value.length > 0 && openSensors.value.length === 0
  )
  
  const lowBatterySensors = computed(() => 
    sensors.value.filter(sensor => sensor.battery < 20)
  )
  
  const sensorsByLocation = computed(() => {
    const grouped: Record<string, Sensor[]> = {}
    sensors.value.forEach(sensor => {
      if (!grouped[sensor.location]) {
        grouped[sensor.location] = []
      }
      grouped[sensor.location].push(sensor)
    })
    return grouped
  })
  
  // Actions
  function loadSensors() {
    isLoading.value = true
    error.value = null
    
    try {
      // In a real app, we would fetch from an API
      // For now, we'll use mock data
      sensors.value = mockSensors
      isLoading.value = false
    } catch (err) {
      console.error('Failed to load sensors:', err)
      error.value = 'Failed to load sensors'
      isLoading.value = false
    }
  }
  
  function updateSensorStatus(sensorId: string, status: SensorStatus) {
    const sensorIndex = sensors.value.findIndex(s => s.id === sensorId)
    
    if (sensorIndex === -1) return
    
    const oldStatus = sensors.value[sensorIndex].isOpen
    const newStatus = status.isOpen
    
    // Update the sensor
    sensors.value[sensorIndex] = {
      ...sensors.value[sensorIndex],
      ...status
    }
    
    // Log the event if the open/closed status changed
    if (oldStatus !== newStatus) {
      const sensor = sensors.value[sensorIndex]
      logActivity({
        id: Date.now().toString(),
        sensorId: sensor.id,
        sensorName: sensor.name,
        timestamp: new Date().toISOString(),
        event: newStatus ? 'opened' : 'closed'
      })
    }
  }
  
  function logActivity(entry: ActivityLogEntry) {
    activityLog.value.unshift(entry)
    
    // Limit log size to 100 entries
    if (activityLog.value.length > 100) {
      activityLog.value = activityLog.value.slice(0, 100)
    }
  }
  
  return {
    sensors,
    activityLog,
    isLoading,
    error,
    openSensors,
    closedSensors,
    isAllClosed,
    lowBatterySensors,
    sensorsByLocation,
    loadSensors,
    updateSensorStatus,
    logActivity
  }
})