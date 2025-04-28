import type { Sensor } from '../types'

export const mockSensors: Sensor[] = [
  {
    id: 'door-main',
    name: 'Main Entrance',
    type: 'door',
    location: 'First Floor',
    isOpen: false,
    battery: 92,
    signal: 85,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'door-lab1',
    name: 'Lab 1 Door',
    type: 'door',
    location: 'First Floor',
    isOpen: false,
    battery: 78,
    signal: 90,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'door-lab2',
    name: 'Lab 2 Door',
    type: 'door',
    location: 'First Floor',
    isOpen: false,
    battery: 85,
    signal: 92,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'window-lab1-north',
    name: 'Lab 1 North Window',
    type: 'window',
    location: 'First Floor',
    isOpen: false,
    battery: 65,
    signal: 75,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'window-lab1-east',
    name: 'Lab 1 East Window',
    type: 'window',
    location: 'First Floor',
    isOpen: false,
    battery: 89,
    signal: 82,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'window-lab2-south',
    name: 'Lab 2 South Window',
    type: 'window',
    location: 'First Floor',
    isOpen: true,
    battery: 72,
    signal: 78,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'door-storage',
    name: 'Storage Room',
    type: 'door',
    location: 'Basement',
    isOpen: false,
    battery: 54,
    signal: 65,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'window-storage-east',
    name: 'Storage East Window',
    type: 'window',
    location: 'Basement',
    isOpen: false,
    battery: 31,
    signal: 60,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'door-office',
    name: 'Office Door',
    type: 'door',
    location: 'Second Floor',
    isOpen: false,
    battery: 88,
    signal: 95,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'window-office-north',
    name: 'Office North Window',
    type: 'window',
    location: 'Second Floor',
    isOpen: false,
    battery: 91,
    signal: 88,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'window-office-west',
    name: 'Office West Window',
    type: 'window',
    location: 'Second Floor',
    isOpen: false,
    battery: 95,
    signal: 91,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'door-emergency',
    name: 'Emergency Exit',
    type: 'door',
    location: 'First Floor',
    isOpen: false,
    battery: 87,
    signal: 82,
    lastUpdate: new Date().toISOString()
  }
]