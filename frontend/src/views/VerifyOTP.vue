<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref(authStore.resetEmail || '')
const otp = ref('')
const error = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true
  try {
    const resetToken = await authStore.verifyOTP(email.value, otp.value)
    // Store the reset token for the next step
    localStorage.setItem('reset_token', resetToken)
    router.push('/reset-password')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'OTP verification failed'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center">
      <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12v1a4 4 0 01-8 0v-1m8 0V7a4 4 0 00-8 0v5m8 0a4 4 0 01-8 0" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify OTP</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-xs">Enter the OTP code sent to your email to continue.</p>
      <form @submit.prevent="handleSubmit" class="w-full flex flex-col gap-4">
        <div v-if="error" class="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-3 rounded-lg text-center text-sm font-medium">
          {{ error }}
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            :disabled="true"
          />
        </div>
        <div class="flex flex-col gap-1 mb-2">
          <label for="otp" class="text-sm font-medium text-gray-700 dark:text-gray-200">OTP Code</label>
          <input
            id="otp"
            v-model="otp"
            type="text"
            required
            maxlength="6"
            minlength="6"
            placeholder="Enter OTP code"
            class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition tracking-widest text-center"
            :disabled="isLoading"
          />
        </div>
        <button 
          type="submit" 
          class="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl text-base shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Verifying...' : 'Verify OTP' }}
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