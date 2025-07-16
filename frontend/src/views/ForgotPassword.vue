<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const error = ref('')
const isLoading = ref(false)
const success = ref(false)

const handleSubmit = async () => {
  try {
    error.value = ''
    isLoading.value = true
    await authStore.requestPasswordReset(email.value)
    success.value = true
    router.push('/verify-otp')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to request password reset'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div class="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col items-center">
      <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c1.104 0 2-.896 2-2V7a2 2 0 10-4 0v2c0 1.104.896 2 2 2zm6 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5a6 6 0 1112 0z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot your password?</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-xs">Enter your email address and we'll send you a link to reset your password.</p>
      <form @submit.prevent="handleSubmit" class="w-full flex flex-col gap-4">
        <div v-if="error" class="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-3 rounded-lg text-center text-sm font-medium">
          {{ error }}.
        </div>
        <div v-if="success" class="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200 p-3 rounded-lg text-center text-sm font-medium">
          If an account exists for <b>{{ email }}</b>, a reset link has been sent.
        </div>
        <div v-else>
          <div class="flex flex-col gap-1 mb-2">
            <label for="email" class="text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="Enter your email"
              class="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              :disabled="isLoading"
            />
          </div>
          <button 
            type="submit" 
            class="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl text-base shadow-md transition disabled:opacity-70 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Sending...' : 'Get OTP' }}
          </button>
        </div>
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