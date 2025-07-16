<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useDeviceStore } from '../stores/deviceStore';

const router = useRouter();
const deviceStore = useDeviceStore();

const formData = ref({
  name: '',
  type: '',
  category: '',
  room_id: null as number | null,
  device_id: ''
});

const loading = ref(false);
const error = ref('');

const deviceTypes = [
  { value: 'SHDW-2', label: 'Shelly Door/Window 2' },
  { value: 'SHPLG-1', label: 'Shelly Plug' },
  { value: 'SHSW-1', label: 'Shelly Switch 1' },
  { value: 'SHSW-21', label: 'Shelly Switch 2.1' },
  { value: 'SHSW-25', label: 'Shelly Switch 2.5' },
  { value: 'SHRGBW2', label: 'Shelly RGBW2' },
  { value: 'SHHT-1', label: 'Shelly H&T' },
  { value: 'SHWT-1', label: 'Shelly Water' },
  { value: 'other', label: 'Other' }
];

const categories = [
  { value: 'sensor', label: 'Sensor' },
  { value: 'switch', label: 'Switch' },
  { value: 'light', label: 'Light' },
  { value: 'plug', label: 'Plug' },
  { value: 'other', label: 'Other' }
];

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.type) {
    error.value = 'Please fill in all required fields';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    // For now, we'll just redirect to sync devices
    // In a real implementation, you'd call an API to add the device
    await deviceStore.loadDevices();
    router.push({ name: 'home' });
  } catch (err: any) {
    error.value = err.message || 'Failed to add device';
  } finally {
    loading.value = false;
  }
};

const handleSyncFromCloud = async () => {
  loading.value = true;
  error.value = '';

  try {
    await deviceStore.loadDevices();
    router.push({ name: 'home' });
  } catch (err: any) {
    error.value = err.message || 'Failed to sync devices';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-6">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
          Add New Device
        </h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          Connect your Shelly devices and start monitoring them in real-time
        </p>
        <p class="text-lg text-gray-600 font-bold max-w-2xl mx-auto">
          Add item on your phone dashboard
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Add Device Form -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8 hidden">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Device Information</h2>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="deviceName" class="block text-sm font-semibold text-gray-700 mb-2">
                Device Name
              </label>
              <input
                id="deviceName"
                v-model="formData.name"
                type="text"
                required
                placeholder="Enter device name"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <label for="deviceType" class="block text-sm font-semibold text-gray-700 mb-2">
                Device Type
              </label>
              <select
                id="deviceType"
                v-model="formData.type"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Select device type</option>
                <option v-for="type in deviceTypes" :key="type.value" :value="type.value">
                  {{ type.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="deviceCategory" class="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <select
                id="deviceCategory"
                v-model="formData.category"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              >
                <option value="">Select category</option>
                <option v-for="category in categories" :key="category.value" :value="category.value">
                  {{ category.label }}
                </option>
              </select>
            </div>

            <div>
              <label for="deviceDescription" class="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="deviceDescription"
                v-model="formData.device_id"
                rows="3"
                placeholder="Enter device description"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
              ></textarea>
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                {{ loading ? 'Adding Device...' : 'Add Device' }}
              </button>
              <button
                type="button"
                @click="router.push({ name: 'home' })"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Sync Devices Section -->
        <div class="space-y-6">
          <!-- Sync Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <div class="flex items-center mb-6">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Sync from Shelly Cloud</h3>
                <p class="text-gray-600">Automatically discover and add devices</p>
              </div>
            </div>
            
            <p class="text-gray-600 mb-6">
              Synchronize your devices from Shelly Cloud to automatically discover and add all your connected devices to the dashboard.
            </p>
            
            <button 
              @click="handleSyncFromCloud"
              :disabled="loading"
              class="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              {{ loading ? 'Synchronizing...' : 'Sync Devices' }}
            </button>
          </div>

          <!-- Device Types Info -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
            <h3 class="text-xl font-bold text-gray-900 mb-6">Supported Device Types</h3>
            <div class="space-y-4">
              <div class="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Switches & Relays</h4>
                  <p class="text-sm text-gray-600">Control lights, appliances, and other devices</p>
                </div>
              </div>
              
              <div class="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Sensors</h4>
                  <p class="text-sm text-gray-600">Temperature, humidity, motion, and more</p>
                </div>
              </div>
              
              <div class="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900">Lights</h4>
                  <p class="text-sm text-gray-600">RGB, white, and dimmable lighting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 