<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDeviceStore } from '../stores/deviceStore';
//import { useAuthStore } from '../stores/authStore';
import type { Device } from '../types';

const route = useRoute();
const router = useRouter();
const deviceStore = useDeviceStore();
//const authStore = useAuthStore();

const device = ref<Device | null>(null);
const loading = ref(true);
const error = ref('');

const deviceId = route.params.id as string;

onMounted(async () => {
  await loadDeviceDetails();
  connectWebSocket();
});

onUnmounted(() => {
  deviceStore.disconnectWebSocket();
});

const loadDeviceDetails = async () => {
  try {
    loading.value = true;
    // Find device in store
    const foundDevice = deviceStore.devices.find(d => d.id === deviceId);
    if (foundDevice) {
      device.value = foundDevice;
    } else {
      // If not in store, try to load devices
      await deviceStore.loadDevices();
      const reloadedDevice = deviceStore.devices.find(d => d.id === deviceId);
      if (reloadedDevice) {
        device.value = reloadedDevice;
      } else {
        error.value = 'Device not found';
      }
    }

    // Load real-time device status
    if (device.value) {
      try {
        await deviceStore.fetchDeviceStatus(deviceId);
      } catch (statusError) {
        console.warn('Failed to load device status:', statusError);
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load device details';
  } finally {
    loading.value = false;
  }
};

const connectWebSocket = async () => {
  if (!device.value) return;

  try {
    // Connect to WebSocket for real-time updates
    await deviceStore.connectWebSocket();
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
  }
};

const getDeviceIcon = (type: string) => {
  const icons: Record<string, string> = {
    'SHDW-2': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
    'SHPLG-1': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'SHSW-1': 'M13 10V3L4 14h7v7l9-11h-7z',
    'SHRGBW2': 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z',
    'default': 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
  };
  return icons[type] || icons.default;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'online': 'bg-green-100 text-green-800',
    'offline': 'bg-red-100 text-red-800',
    'error': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || colors.offline;
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="router.push({ name: 'home' })"
          class="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Dashboard
        </button>
        
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {{ device?.name || 'Device Details' }}
            </h1>
            <p class="text-lg text-gray-600">{{ device?.type || 'Loading device information...' }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <span 
              :class="`hidden items-center px-4 py-2 rounded-full text-sm font-semibold ${
                deviceStore.getDeviceStatus(deviceId)?.online 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`"
            >
              <div :class="`w-2 h-2 rounded-full mr-2 ${deviceStore.getDeviceStatus(deviceId)?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`"></div>
              {{ deviceStore.getDeviceStatus(deviceId)?.online ? 'Online' : 'Offline' }}
            </span>
            <span :class="`hidden items-center px-4 py-2 rounded-full text-sm font-semibold ${
              deviceStore.getDeviceStatus(deviceId)?.state === 'open' 
                ? 'bg-red-100 text-red-800 border border-red-200' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`">
              <div :class="`w-2 h-2 rounded-full mr-2 ${deviceStore.getDeviceStatus(deviceId)?.state === 'open' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`"></div>
              {{ deviceStore.getDeviceStatus(deviceId)?.state === 'open' ? 'Open' : 'Closed' }}
            </span>
            <button 
              @click="deviceStore.loadDevices"
              :disabled="deviceStore.loading"
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <svg v-if="deviceStore.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="deviceStore.loading" class="flex justify-center items-center py-16">
        <div class="text-center">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
            </div>
          </div>
          <p class="mt-6 text-lg text-gray-600 font-medium">Loading device details...</p>
        </div>
      </div>

      <!-- Device Content -->
      <div v-else-if="device" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Device Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Device Overview Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <div class="flex items-start justify-between mb-6">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Device Overview</h2>
                <p class="text-gray-600">Real-time status and basic information</p>
              </div>
              <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-sm font-medium text-gray-600">Device ID</span>
                  <span class="text-sm font-mono text-gray-900">{{ device.id }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-sm font-medium text-gray-600">Type</span>
                  <span class="text-sm text-gray-900">{{ device.type }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-sm font-medium text-gray-600">Category</span>
                  <span class="text-sm text-gray-900">{{ device.category || 'Unknown' }}</span>
                </div>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-sm font-medium text-gray-600">Status</span>
                  <span class="flex gap-2">
                    <span 
                      :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        deviceStore.getDeviceStatus(deviceId)?.online 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`"
                    >
                      {{ deviceStore.getDeviceStatus(deviceId)?.online ? 'Online' : 'Offline' }}
                    </span>
                    <span :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      deviceStore.getDeviceStatus(deviceId)?.state === 'closed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`">
                      {{ deviceStore.getDeviceStatus(deviceId)?.state === 'open' ? 'Open' : 'Closed' }}
                    </span>
                  </span>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-sm font-medium text-gray-600">Last Sync</span>
                  <span class="text-sm text-gray-900">{{ device.last_sync ? new Date(device.last_sync).toLocaleString() : 'Never' }}</span>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span class="text-sm font-medium text-gray-600">Connection</span>
                  <span 
                    :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      deviceStore.isConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`"
                  >
                    {{ deviceStore.isConnected ? 'Real-time' : 'Polling' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Real-time Status Card -->
          <div class="hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <div class="flex items-center mb-6 gap-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Real-time Status</h3>
                <p class="text-gray-600">Live device metrics and sensor data</p>
                <div class="flex gap-2 mt-2">
                  <span :class="deviceStore.getDeviceStatus(deviceId)?.online ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs' : 'bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs'">
                    {{ deviceStore.getDeviceStatus(deviceId)?.online ? 'Online' : 'Offline' }}
                  </span>
                  <span :class="deviceStore.getDeviceStatus(deviceId)?.state === 'open' ? 'bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs' : 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs'">
                    {{ deviceStore.getDeviceStatus(deviceId)?.state === 'open' ? 'Open' : 'Closed' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Battery Status -->
              <div v-if="deviceStore.getDeviceStatus(deviceId)?.battery !== undefined" class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span class="text-2xl font-bold text-green-600">{{ Math.round(deviceStore.getDeviceStatus(deviceId)!.battery!) }}%</span>
                </div>
                <h4 class="font-semibold text-gray-900 mb-1">Battery Level</h4>
                <p class="text-sm text-gray-600">Current battery status</p>
              </div>

              <!-- Temperature Status -->
              <div v-if="deviceStore.getDeviceStatus(deviceId)?.temperature !== undefined" class="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span class="text-2xl font-bold text-orange-600">{{ Math.round(deviceStore.getDeviceStatus(deviceId)!.temperature!) }}°C</span>
                </div>
                <h4 class="font-semibold text-gray-900 mb-1">Temperature</h4>
                <p class="text-sm text-gray-600">Current temperature reading</p>
              </div>

              <!-- Humidity Status -->
              <div v-if="deviceStore.getDeviceStatus(deviceId)?.humidity !== undefined" class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
                <div class="flex items-center justify-between mb-4">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                    </svg>
                  </div>
                  <span class="text-2xl font-bold text-blue-600">{{ Math.round(deviceStore.getDeviceStatus(deviceId)!.humidity!) }}%</span>
                </div>
                <h4 class="font-semibold text-gray-900 mb-1">Humidity</h4>
                <p class="text-sm text-gray-600">Current humidity level</p>
              </div>
            </div>

            <!-- No sensors message -->
            <div v-if="!deviceStore.getDeviceStatus(deviceId) || (!deviceStore.getDeviceStatus(deviceId)?.battery && !deviceStore.getDeviceStatus(deviceId)?.temperature && !deviceStore.getDeviceStatus(deviceId)?.humidity)" class="text-center py-8">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">No Sensor Data</h4>
              <p class="text-gray-600">This device doesn't have any active sensors or the data is not available.</p>
            </div>
          </div>

          <!-- Device Control Card -->
          <div class="hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Device Control</h3>
                <p class="text-gray-600">Control your device remotely</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900">Power Control</h4>
                <div class="flex space-x-4">
                  <button class="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200">
                    <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Turn On
                  </button>
                  <button class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200">
                    <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Turn Off
                  </button>
                </div>
              </div>
              
              <div class="space-y-4">
                <h4 class="font-semibold text-gray-900">Settings</h4>
                <div class="space-y-3">
                  <button class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-left">
                    <div class="flex items-center justify-between">
                      <span>Device Settings</span>
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </button>
                  <button class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-left">
                    <div class="flex items-center justify-between">
                      <span>Schedule</span>
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh Status
              </button>
              <button class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200">
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
                Configure
              </button>
              <button class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200">
                <svg class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                View Logs
              </button>
            </div>
          </div>

          <!-- Device Info -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Device Information</h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Device ID:</span>
                <span class="font-mono text-gray-900">{{ device.id }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Type:</span>
                <span class="text-gray-900">{{ device.type }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Category:</span>
                <span class="text-gray-900">{{ device.category || 'Unknown' }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Added:</span>
                <span class="text-gray-900">{{ device.last_sync ? new Date(device.last_sync).toLocaleDateString() : 'Unknown' }}</span>
              </div>
            </div>
          </div>

          <!-- Connection Status -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Connection Status</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">WebSocket:</span>
                <span 
                  :class="`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                    deviceStore.isConnected 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`"
                >
                  {{ deviceStore.isConnected ? 'Connected' : 'Disconnected' }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Last Update:</span>
                <span class="text-sm text-gray-900">{{ deviceStore.getDeviceStatus(deviceId)?.lastUpdate ? new Date(deviceStore.getDeviceStatus(deviceId)!.lastUpdate).toLocaleString() : 'Never' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="deviceStore.error" class="bg-red-50 border border-red-200 rounded-2xl p-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-red-800">Error loading device</h3>
            <div class="mt-2 text-red-700">
              <p>{{ deviceStore.error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Device not found</h3>
          <p class="text-gray-600 mb-8">The device you're looking for doesn't exist or has been removed.</p>
          <button 
            @click="router.push({ name: 'home' })"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template> 