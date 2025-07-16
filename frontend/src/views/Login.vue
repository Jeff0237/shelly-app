<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'
import ButtonDefault from "../components/ButtonDefault.vue";
import IconEyeOpen from "../components/icons/IconEyeOpen.vue";
import IconEyeClose from "../components/icons/IconEyeClose.vue";

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const handleSubmit = async () => {
  try {
    error.value = ''
    isLoading.value = true
    await authStore.login(email.value, password.value)
    location.href = '/'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to login'
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
      <h1 class="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">Login</h1>
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div v-if="error" class="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-center">
          {{ error }}
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Password</label>
          <div class="relative flex items-center">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Enter your password"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
              @click="togglePasswordVisibility"
              :title="showPassword ? 'Hide password' : 'Show password'"
              tabindex="-1"
            >
              <IconEyeOpen v-if="showPassword" />
              <IconEyeClose v-else />
            </button>
          </div>
        </div>
        <ButtonDefault
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow transition disabled:opacity-60"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </ButtonDefault>
      </form>
      <div class="flex flex-col items-center space-y-2 mt-4">
        <RouterLink to="/forgot-password" class="text-blue-600 dark:text-blue-400 hover:underline text-sm">Forgot Password?</RouterLink>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <RouterLink to="/register" class="text-blue-600 dark:text-blue-400 hover:underline">Register</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style> 
