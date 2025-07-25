<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { settingsService } from '../services/api'
import { useDeviceStore } from '../stores/deviceStore'
import { useAuthStore } from '../stores/authStore'
import { useI18n } from 'vue-i18n'

interface Settings {
  userLink: string
  apiKey: string
  jwt?: string
}

const settings = ref<Settings>({
  userLink: '',
  apiKey: '',
  jwt: '',
})
const isLoading = ref(false)
const isDisconnecting = ref(false)
const isResetting = ref(false)
const isSaving = ref(false)
const message = ref<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' })
const showAlert = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'error'>('success');
const deviceStore = useDeviceStore();
const authStore = useAuthStore();
const { t } = useI18n()

const loadSettings = async () => {
  try {
    const data = await settingsService.getUserSettings()
    settings.value = {
      userLink: data.userLink || '',
      apiKey: data.apiKey || '',
      jwt: data.jwt || ''
    }
  } catch (error) {
    message.value = { type: 'error', text: 'Failed to load settings' }
  }
}

const saveSettings = async () => {
  isSaving.value = true
  message.value = { type: '', text: '' }
  try {
    await settingsService.updateUserSettings({
      userLink: settings.value.userLink,
      apiKey: settings.value.apiKey,
      jwt: settings.value.jwt
    })
    message.value = { type: 'success', text: 'Settings saved successfully' }
    await loadSettings()
  } catch (error) {
    message.value = { type: 'error', text: 'Failed to save settings' }
  } finally {
    isSaving.value = false
  }
}

const connectShellyCloud = async () => {
  await saveSettings();
  isLoading.value = true
  message.value = { type: '', text: '' }
  try {
    const response = await settingsService.connectShelly();
    // let newUrl = response.oauth_url.replace("http://localhost:9000/api/webhook/oauth", "https//localhost:5173/oauth/callback");
    let newUrl = response.oauth_url.replace("https://api.shellydashboard.com/api/webhook/oauth", "https://shellydashboard.com/oauth/callback");

    window.location.href = newUrl ?? '/';
  } catch (error) {
    message.value = { type: 'error', text: 'Failed to get OAuth URL' }
  } finally {
    isLoading.value = false
  }
}

const disconnectShelly = async () => {
  isDisconnecting.value = true
  message.value = { type: '', text: '' }
  try {
    const response = await settingsService.disconnectShelly()
    if (response.success) {
      message.value = { type: 'success', text: response.message }
      await loadSettings() // Reload settings to reflect changes
    } else {
      message.value = { type: 'error', text: response.message }
    }
  } catch (error) {
    message.value = { type: 'error', text: 'Failed to disconnect from Shelly Cloud' }
  } finally {
    isDisconnecting.value = false
  }
}

const resetShelly = async () => {
  isResetting.value = true
  message.value = { type: '', text: '' }
  try {
    const response = await settingsService.resetShelly()
    if (response.success) {
      message.value = { type: 'success', text: response.message }
      await loadSettings() // Reload settings to reflect changes
    } else {
      message.value = { type: 'error', text: response.message }
    }
  } catch (error) {
    message.value = { type: 'error', text: 'Failed to reset Shelly Cloud connection' }
  } finally {
    isResetting.value = false
  }
}

function handleStatusAlert(payload: any) {
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
  loadSettings()
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
  <div class="flex items-center justify-center from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8">
    <div class="w-full bg-red-900 max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10">
      <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">{{ t('settings.title') }}</h1>
      <!-- WebSocket Status -->
      <div class="flex items-center justify-center mb-6 hidden">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">{{ t('settings.websocketStatus') }}</span>
        <span :class="deviceStore.isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold">
          {{ deviceStore.isConnected ? t('settings.connected') : t('settings.disconnected') }}
        </span>
      </div>
      <div v-if="message.text" :class="[
        'px-4 py-2 rounded text-center font-medium mb-4',
        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      ]">
        {{ message.text }}
      </div>
      <div class="space-y-8">
        <div class="space-y-2">
          <div v-if="!settings.jwt && settings.userLink && settings.apiKey" class="mb-4">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ t('settings.shellyIntegrationTitle') }}</h2>
            <button
              @click="connectShellyCloud"
              :disabled="isLoading"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-60 mb-2"
            >
              {{ isLoading ? t('settings.connecting') : t('settings.connectWithShelly') }}
            </button>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              {{ t('settings.oauthRecommended') }}
            </p>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ t('settings.apiUrl') }}</label>
            <input v-model="settings.userLink" type="text" :placeholder="t('settings.apiUrlPlaceholder')" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ t('settings.apiKey') }}</label>
            <input v-model="settings.apiKey" type="text" :placeholder="t('settings.apiKeyPlaceholder')" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ t('settings.shellyCloudKey') }}</label>
            <input readonly v-model="settings.jwt" type="text" :placeholder="t('settings.shellyCloudKeyPlaceholder')" class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          <button @click="saveSettings" :disabled="isSaving" class="mt-4 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-60">
            {{ isSaving ? t('settings.saving') : t('settings.saveSettings') }}
          </button>
        </div>
        <div v-if="settings.jwt" class="space-y-3">
          <div class="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium">
            {{ t('settings.shellyCloudKeySet') }}
          </div>
          <div class="mt-4 space-y-3">
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="resetShelly"
                :disabled="isResetting"
                class="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition disabled:opacity-60"
              >
                {{ isResetting ? t('settings.resetting') : t('settings.resetShellyCloudKey') }}
              </button>
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              <p><strong>{{ t('settings.resetShellyCloudKey') }}:</strong> {{ t('settings.resetShellyCloudKeyHelp') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="mt-8 p-6 bg-blue-50 dark:text-white bg-blue-900/20 rounded-xl border-top border-blue-200 dark:border-blue-700">
    <h2 class="text-lg font-bold mb-2">{{ t('settings.helpTitle') }}</h2>
    <ol class="list-decimal ml-6 mb-2">
      <li>
        {{ t('settings.helpStep1') }}
        <a href="https://control.shelly.cloud" target="_blank" class="text-blue-600 underline">https://control.shelly.cloud</a>
        {{ t('settings.helpStep1_2') }}
      </li>
      <li>{{ t('settings.helpStep2') }}</li>
      <li>{{ t('settings.helpStep3') }}</li>
      <li>{{ t('settings.helpStep4') }}</li>
    </ol>
    <p class="mb-2">{{ t('settings.helpKeyPurpose') }}</p>
    <p class="mb-2">
      {{ t('settings.helpMoreInfo') }}
      <a href="https://shelly-api-docs.shelly.cloud/cloud-control-api/" target="_blank" class="text-blue-600 underline" v-html="t('settings.helpMoreInfo2')"></a>.
    </p>
    <p class="mb-2"><span class="font-bold">{{ t('settings.note') }}</span> {{ t('settings.helpNote') }}</p>
    <div class="bg-gray-100 dark:bg-gray-800 rounded p-3 text-xs mt-2">
      <strong>{{ t('settings.exampleKey') }}</strong> <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</code>
    </div>
  </section>
</template>

<style scoped>
/* All styling is now handled by Tailwind classes in the template. */
</style>