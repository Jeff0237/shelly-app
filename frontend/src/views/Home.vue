<script setup lang="ts">
import { ref, onMounted, toRaw, onUnmounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore'
import { useDeviceStore } from '../stores/deviceStore';
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

const deviceStore = useDeviceStore();
const authStore = useAuthStore();

const filter = ref<'all' | 'opened' | 'closed'>('all');
const showModal = ref(false);
const selectedDevice = ref<any>(null);
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'error'>('success');

const filteredDevices = computed(() => {
  let devices = [...deviceStore.devices];
  // Show opened first
  devices.sort((a, b) => {
    const aState = deviceStore.deviceStatuses[a.id]?.state;
    const bState = deviceStore.deviceStatuses[b.id]?.state;
    if (aState === 'open' && bState !== 'open') return -1;
    if (aState !== 'open' && bState === 'open') return 1;
    return 0;
  });
  if (filter.value === 'opened') {
    return devices.filter(d => deviceStore.deviceStatuses[d.id]?.state === 'open');
  }
  if (filter.value === 'closed') {
    return devices.filter(d => deviceStore.deviceStatuses[d.id]?.state === 'closed');
  }
  return devices;
});

function openDeviceModal(device: any) {
  selectedDevice.value = device;
  showModal.value = true;
}
function closeDeviceModal() {
  showModal.value = false;
  selectedDevice.value = null;
}

function handleStatusAlert(payload: any) {
  // console.log('Status alert received:', payload);
  const device = deviceStore.devices.find(d => d.id === payload.device_id);
  if (device) {
    const stateText = payload.state === 'open' ? 'opened' : 'closed';
    const isOpen = payload.state === 'open';
    alertMessage.value = `${device.name || device.id} is now ${stateText}`;
    alertType.value = isOpen ? 'error' : 'success';
    showAlert.value = true;
    setTimeout(() => { showAlert.value = false; }, 3000);
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    deviceStore.loadDevices();
    // Connect to WebSocket for real-time updates
    deviceStore.connectWebSocket();
    deviceStore.setStatusAlertCallback(handleStatusAlert);
  }
});

onUnmounted(() => {
  // Clean up WebSocket connection
  deviceStore.disconnectWebSocket();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Alert Toast -->
      <transition name="fade">
        <div v-if="showAlert" :class="[
          'fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg animate-pulse-glow text-white',
          alertType === 'success' ? 'bg-green-600' : 'bg-red-600'
        ]">
          {{ alertMessage }}
        </div>
      </transition>
      <!-- Header Section -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          {{ t('home.title') }}
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          {{ t('home.subtitle') }}
        </p>
      </div>

      <!-- Device Map Visualization -->
      <div v-if="authStore.isAuthenticated && deviceStore.devices.length > 0" class="flex flex-col items-center mb-12">
        <div class="flex gap-4 mb-6">
          <button @click="filter = 'all'" :class="['px-4 py-2 rounded-lg font-semibold', filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border border-blue-600']">All</button>
                          <button @click="filter = 'opened'" :class="['px-4 py-2 rounded-lg font-semibold', filter === 'opened' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-600']">Opened</button>
                      <button @click="filter = 'closed'" :class="['px-4 py-2 rounded-lg font-semibold', filter === 'closed' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-600']">Closed</button>
        </div>
        <div class="w-full max-w-2xl mx-auto rounded-3xl border-4 border-blue-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 shadow-lg p-6 relative flex flex-col items-center">
          <div class="relative w-full max-w-2xl h-96 flex items-center justify-center">
            <!-- <svg :width="400" :height="400" viewBox="0 0 400 400" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <circle cx="200" cy="200" r="180" fill="#f3f4f6" />
            </svg> -->
            <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex flex-wrap items-center justify-center">
              <template v-for="(device, idx) in filteredDevices" :key="device.id">
                <div
                  :style="{
                    position: 'absolute',
                    left: `${200 + 140 * Math.cos((2 * Math.PI * idx) / filteredDevices.length) - 32}px`,
                    top: `${200 + 140 * Math.sin((2 * Math.PI * idx) / filteredDevices.length) - 32}px`,
                    zIndex: 10 + (deviceStore.deviceStatuses[device.id]?.state === 'open' ? 1 : 0)
                  }"
                  class="w-16 h-16 flex items-center justify-center cursor-pointer transition-all duration-200"
                  @click="openDeviceModal(device)"
                >
                  <div :class="['w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-lg border-4 text-white text-[10px] font-bold',
                    deviceStore.getDeviceStatus(device.id)?.state === 'open' ? 'border-red-500' : 'border-green-500',
                    deviceStore.deviceStatuses[device.id]?.state === 'open' ? 'bg-red-500' : 'bg-green-300']">
                    <span class="truncate">{{ device.name || device.id }}</span>
                    <span class="text-[6px] mt-1 px-0.5 rounded-full" :class="deviceStore.deviceStatuses[device.id]?.state === 'open' ? 'bg-white/80 text-red-700' : 'bg-white/80 text-gray-700'">
                      {{ deviceStore.deviceStatuses[device.id]?.state === 'open' ? 'Open' : 'Closed' }}
                    </span>
                    <span class="text-[6px] mt-0.5 px-0.5 rounded-full" :class="deviceStore.getDeviceStatus(device.id)?.online ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                      {{ deviceStore.getDeviceStatus(device.id)?.online ? 'Online' : 'Offline' }}
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Device Details -->
      <transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button @click="closeDeviceModal" class="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl">&times;</button>
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Device Details</h2>
            <div v-if="selectedDevice">
              <div class="mb-2"><span class="font-semibold">Name:</span> {{ selectedDevice.name || selectedDevice.id }}</div>
              <div class="mb-2"><span class="font-semibold">Type:</span> {{ selectedDevice.type }}</div>
              <div class="mb-2"><span class="font-semibold">Category:</span> {{ selectedDevice.category }}</div>
              <div class="mb-2 flex gap-2 items-center">
                <span class="font-semibold">Status:</span>
                <span :class="deviceStore.getDeviceStatus(selectedDevice.id)?.online === true ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs' : deviceStore.getDeviceStatus(selectedDevice.id)?.online === false ? 'bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs' : 'bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs'">
                  {{ deviceStore.getDeviceStatus(selectedDevice.id)?.online === true ? 'Online' : deviceStore.getDeviceStatus(selectedDevice.id)?.online === false ? 'Offline' : 'Unknown' }}
                </span>
              </div>
              <div class="mb-2 flex gap-2 items-center">
                <span class="font-semibold">State:</span>
                <span :class="deviceStore.getDeviceStatus(selectedDevice.id)?.state === 'open' ? 'bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs' : deviceStore.getDeviceStatus(selectedDevice.id)?.state === 'closed' ? 'bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs' : 'bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs'">
                  {{ deviceStore.getDeviceStatus(selectedDevice.id)?.state === 'open' ? 'Open' : deviceStore.getDeviceStatus(selectedDevice.id)?.state === 'closed' ? 'Closed' : 'Unknown' }}
                </span>
              </div>
              <div class="mb-2"><span class="font-semibold">Last Update:</span> {{ deviceStore.deviceStatuses[selectedDevice.id]?.lastUpdate }}</div>
            </div>
          </div>
        </div>
      </transition>

      <!-- Authenticated Content -->
      <div v-if="authStore.isAuthenticated">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ t('home.totalDevices') }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ deviceStore.devices.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ t('home.online') }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ deviceStore.onlineDevices.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ t('home.offline') }}</p>
                <p class="text-2xl font-bold text-gray-900">{{ deviceStore.offlineDevices.length }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">{{ t('home.realtime') }}</p>
                <div class="flex items-center">
                  <div :class="`w-2 h-2 rounded-full mr-2 ${deviceStore.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`"></div>
                  <span class="text-sm font-medium" :class="deviceStore.isConnected ? 'text-green-600' : 'text-red-600'">
                    {{ deviceStore.isConnected ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Controls Section -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ t('home.deviceManagement') }}</h2>
              <p class="text-gray-600">{{ t('home.deviceControl') }}</p>
            </div>
            <div class="flex gap-3">
              <button 
                @click="deviceStore.loadDevices" 
                :disabled="deviceStore.loading"
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg v-if="deviceStore.loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                {{ deviceStore.loading ? 'Synchronizing...' : 'Sync Devices' }}
              </button>
              <button 
                @click="router.push({ name: 'add-device' })"
                class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {{ t('home.addDevice') }}
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
            <p class="mt-6 text-lg text-gray-600 font-medium">{{ t('home.loadingDevices') }}</p>
            <p class="mt-2 text-gray-500">{{ t('home.loadingMessage') }}</p>
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
              <h3 class="text-lg font-semibold text-red-800">{{ t('home.errorLoadingDevices') }}</h3>
              <div class="mt-2 text-red-700">
                <!-- <p class="mb-4">{{ deviceStore.error }}</p> -->
                <p>
                  {{ t('home.errorMessage') }}
                  <RouterLink :to="{ name: 'settings' }" class="font-medium underline hover:text-red-600 ml-1">{{ t('home.viewSettings') }}</RouterLink>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Grid -->
        <div v-else-if="deviceStore.devices.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="device in deviceStore.devices" 
            :key="device.id"
            class="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/90 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            @click="router.push({ name: 'device-details', params: { id: device.id }})"
          >
            <!-- Device Header -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ device.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">{{ device.type }}</p>
                </div>
                <div class="flex-shrink-0 ml-3 flex gap-2">
                  <span 
                    :class="`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      deviceStore.getDeviceStatus(device.id)?.online 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`"
                  >
                    <div :class="`w-2 h-2 rounded-full mr-2 ${deviceStore.getDeviceStatus(device.id)?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`"></div>
                    {{ deviceStore.getDeviceStatus(device.id)?.online ? 'Online' : 'Offline' }}
                  </span>
                  <span :class="`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    deviceStore.deviceStatuses[device.id]?.state === 'open' 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-green-100 text-green-800 border border-green-200'
                  }`">
                    <div :class="`w-2 h-2 rounded-full mr-2 ${deviceStore.deviceStatuses[device.id]?.state === 'open' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`"></div>
                    {{ deviceStore.deviceStatuses[device.id]?.state === 'open' ? 'Open' : 'Closed' }}
                  </span>
                </div>
              </div>
              
              <!-- Device Icon -->
              <div class="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
                </svg>
              </div>
              
              <!-- Device Info -->
              <div class="space-y-3">
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span>{{ device.category || 'Unknown Category' }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>{{ device.last_sync ? new Date(device.last_sync).toLocaleString() : 'Never' }}</span>
                </div>
                <!-- Real-time status indicators -->
                <div v-if="deviceStore.getDeviceStatus(device.id)" class="flex items-center justify-between text-xs">
                  <span v-if="deviceStore.getDeviceStatus(device.id)?.battery !== undefined" class="flex items-center text-green-600 font-medium">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clip-rule="evenodd"></path>
                    </svg>
                    {{ Math.round(deviceStore.getDeviceStatus(device.id)!.battery!) }}%
                  </span>
                  <span v-if="deviceStore.getDeviceStatus(device.id)?.temperature !== undefined" class="flex items-center text-orange-600 font-medium">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
                    </svg>
                    {{ Math.round(deviceStore.getDeviceStatus(device.id)!.temperature!) }}°C
                  </span>
                </div>
              </div>
            </div>

            <!-- Device Actions -->
            <div class="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl border-t border-gray-200/50">
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500 font-mono">ID: {{ device.id }}</span>
                <button 
                  @click.stop="router.push({ name: 'device-details', params: { id: device.id }})"
                  class="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center group-hover:underline transition-all"
                >
                  {{ t('home.viewDetails') }}
                  <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div class="max-w-md mx-auto">
            <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg class="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ t('home.noDevicesFound') }}</h3>
            <p class="text-gray-600 mb-8">{{ t('home.noDevicesMessage') }}</p>
            <button 
              @click="router.push({ name: 'add-device' })"
              class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              {{ t('home.addFirstDevice') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Not Authenticated -->
      <div v-else class="text-center py-16">
        <div class="max-w-md mx-auto">
          <div class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ t('home.signInRequired') }}</h3>
          <p class="text-gray-600 mb-8">{{ t('home.signInMessage') }}</p>
          <RouterLink 
            :to="{ name: 'login' }"
            class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
            </svg>
            {{ t('auth.login') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
