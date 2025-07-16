<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import IconEyeClose from '@/components/icons/IconEyeClose.vue'
import IconEyeOpen from '@/components/icons/IconEyeOpen.vue'

const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const success = ref(false)

const handleResetPassword = async () => {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  const resetToken = localStorage.getItem('reset_token')
  if (!resetToken) {
    error.value = 'Reset token missing. Please restart the reset process.'
    return
  }
  isLoading.value = true
  try {
    await authStore.resetPassword(resetToken, password.value)
    localStorage.removeItem('reset_token')
    success.value = true
    setTimeout(() => {
      router.push('/login') // Change to '/connect' if that's the intended page
    }, 1500)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to reset password'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Reset Password</h1>
      <form @submit.prevent="handleResetPassword" class="w-full flex flex-col gap-4">
        <div v-if="error" class="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-3 rounded-lg text-center text-sm font-medium">
          {{ error }}
        </div>
        <div v-if="success" class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 p-3 rounded-lg text-center text-sm font-medium">
          Password has been reset successfully. Redirecting to login...
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label for="password" class="text-sm font-medium text-gray-700 dark:text-gray-200">New Password</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Enter new password"
              class="pl-4 pr-8 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
              :disabled="isLoading"
            />
            <button type="button" @click="showPassword = !showPassword" tabindex="-1" class="absolute top-4 right-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <IconEyeOpen v-if="showPassword"/>
              <IconEyeClose v-else/>
            </button>
          </div>
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label for="confirmPassword" class="text-sm font-medium text-gray-700 dark:text-gray-200">Confirm New Password</label>
          <div class="relative">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              required
              placeholder="Confirm new password"
              class="pl-4 pr-8 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
              :disabled="isLoading"
            />
            <button type="button" @click="showConfirmPassword = !showConfirmPassword" tabindex="-1" class="absolute top-4 right-3 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
              <IconEyeOpen v-if="showConfirmPassword"/>
              <IconEyeClose v-else/>
            </button>
          </div>
        </div>
        <button type="submit" class="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl text-base shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed" :disabled="isLoading">
          {{ isLoading ? 'Resetting...' : 'Reset Password' }}
        </button>
      </form>
      <div class="my-6 w-full flex items-center">
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <span class="mx-3 text-xs text-gray-400">or</span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div class="w-full text-center">
        <RouterLink to="/login" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium transition underline underline-offset-2">Back to Login</RouterLink>
      </div>
    </div>
  </div>
</template> 