export interface Sensor {
  id: string
  name: string
  type: 'door' | 'window' | 'other'
  location: string
  isOpen: boolean
  battery: number // 0-100
  signal: number // 0-100
  lastUpdate: string // ISO string
}

export interface SensorStatus {
  isOpen: boolean
  battery?: number
  signal?: number
  lastUpdate?: string
}

export interface SensorGroup {
  id: string
  name: string
  sensorIds: string[]
}

export interface ActivityLogEntry {
  id: string
  sensorId: string
  sensorName: string
  timestamp: string // ISO string
  event: 'opened' | 'closed' | 'battery_low' | 'connection_lost' | 'connection_restored'
  details?: string
}

export interface Settings {
  darkMode: 'auto' | 'light' | 'dark'
  refreshInterval: number // in seconds
  notificationsEnabled: boolean
  batteryWarningThreshold: number // 0-100
}