<script setup lang="ts">
import { ref, watch } from 'vue'

interface SettingsState {
  darkMode: 'auto' | 'light' | 'dark'
  refreshInterval: number
  notificationsEnabled: boolean
  batteryWarningThreshold: number
}

// Get settings from localStorage or use defaults
const loadSettings = (): SettingsState => {
  try {
    const savedSettings = localStorage.getItem('labSecuritySettings')
    if (savedSettings) {
      return JSON.parse(savedSettings)
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  
  return {
    darkMode: 'auto',
    refreshInterval: 30,
    notificationsEnabled: true,
    batteryWarningThreshold: 20
  }
}

const settings = ref<SettingsState>(loadSettings())

// Save settings when they change
watch(settings, (newSettings) => {
  try {
    localStorage.setItem('labSecuritySettings', JSON.stringify(newSettings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}, { deep: true })

const saveMessage = ref('')

const saveSettings = () => {
  try {
    localStorage.setItem('labSecuritySettings', JSON.stringify(settings.value))
    saveMessage.value = 'Settings saved successfully!'
    
    setTimeout(() => {
      saveMessage.value = ''
    }, 3000)
  } catch (error) {
    console.error('Failed to save settings:', error)
    saveMessage.value = 'Failed to save settings.'
  }
}

const resetToDefaults = () => {
  settings.value = {
    darkMode: 'auto',
    refreshInterval: 30,
    notificationsEnabled: true,
    batteryWarningThreshold: 20
  }
  
  saveMessage.value = 'Settings reset to defaults.'
  
  setTimeout(() => {
    saveMessage.value = ''
  }, 3000)
}
</script>

<template>
  <div class="settings-view">
    <h1>Settings</h1>
    
    <div class="settings-container">
      <div class="setting-group">
        <h2>Appearance</h2>
        
        <div class="setting-item">
          <label for="dark-mode">Theme</label>
          <select id="dark-mode" v-model="settings.darkMode" class="setting-input">
            <option value="auto">Auto (System Preference)</option>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
      </div>
      
      <div class="setting-group">
        <h2>Data & Refresh</h2>
        
        <div class="setting-item">
          <label for="refresh-interval">Refresh Interval (seconds)</label>
          <input 
            id="refresh-interval" 
            v-model="settings.refreshInterval" 
            type="number" 
            min="5" 
            max="300" 
            class="setting-input"
          />
        </div>
      </div>
      
      <div class="setting-group">
        <h2>Notifications</h2>
        
        <div class="setting-item">
          <label for="notifications-enabled">Enable Notifications</label>
          <div class="toggle-switch">
            <input 
              id="notifications-enabled" 
              v-model="settings.notificationsEnabled" 
              type="checkbox" 
              class="toggle-input"
            />
            <label for="notifications-enabled" class="toggle-label"></label>
          </div>
        </div>
        
        <div class="setting-item">
          <label for="battery-threshold">Battery Warning Threshold (%)</label>
          <input 
            id="battery-threshold" 
            v-model="settings.batteryWarningThreshold" 
            type="number" 
            min="5" 
            max="50" 
            class="setting-input"
          />
        </div>
      </div>
      
      <div class="save-controls">
        <button class="save-button" @click="saveSettings">Save Settings</button>
        <button class="reset-button" @click="resetToDefaults">Reset to Defaults</button>
      </div>
      
      <div v-if="saveMessage" class="save-message">
        {{ saveMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
}

.settings-container {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow);
}

.setting-group {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
}

.setting-group:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.setting-group h2 {
  margin-bottom: var(--space-4);
  font-size: 1.25rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-input {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius);
  border: 1px solid var(--color-neutral-300);
  background-color: white;
  font-family: var(--font-family);
  width: 200px;
}

input[type="number"].setting-input {
  width: 100px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-neutral-300);
  transition: var(--transition-base);
  border-radius: 34px;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: var(--transition-base);
  border-radius: 50%;
}

.toggle-input:checked + .toggle-label {
  background-color: var(--color-primary);
}

.toggle-input:checked + .toggle-label:before {
  transform: translateX(24px);
}

.save-controls {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.save-button {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.save-button:hover {
  background-color: var(--color-primary-dark);
}

.reset-button {
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-neutral-200);
  color: var(--color-neutral-800);
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.reset-button:hover {
  background-color: var(--color-neutral-300);
}

.save-message {
  margin-top: var(--space-4);
  padding: var(--space-3);
  border-radius: var(--radius);
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
  text-align: center;
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-color-scheme: dark) {
  .settings-container {
    background-color: var(--color-neutral-800);
  }
  
  .setting-group {
    border-bottom-color: var(--color-neutral-700);
  }
  
  .setting-input {
    background-color: var(--color-neutral-700);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }
  
  .reset-button {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-200);
  }
  
  .reset-button:hover {
    background-color: var(--color-neutral-600);
  }
}

@media (max-width: 640px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .setting-input {
    width: 100% !important;
  }
  
  .save-controls {
    flex-direction: column;
  }
}
</style>