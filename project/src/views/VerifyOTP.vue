<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const otp = ref('')
const error = ref('')
const isLoading = ref(false)

onMounted(() => {
  // Redirect if no email is stored
  if (!authStore.resetEmail) {
    router.push('/forgot-password')
  }
})

const handleSubmit = async () => {
  try {
    error.value = ''
    isLoading.value = true
    
    if (!authStore.resetEmail) {
      throw new Error('No email found. Please request a new OTP.')
    }
    
    const resetToken = await authStore.verifyOTP(authStore.resetEmail, otp.value)
    
    // Redirect to reset password page with the token
    router.push({
      name: 'reset-password',
      query: { token: resetToken }
    })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to verify OTP'
  } finally {
    isLoading.value = false
  }
}

const handleResendOTP = async () => {
  try {
    error.value = ''
    isLoading.value = true
    
    if (!authStore.resetEmail) {
      throw new Error('No email found. Please request a new OTP.')
    }
    
    await authStore.requestPasswordReset(authStore.resetEmail)
    error.value = 'New OTP has been sent to your email'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to resend OTP'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Verify OTP</h1>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="otp">Enter OTP</label>
          <input
            id="otp"
            v-model="otp"
            type="text"
            required
            placeholder="Enter 6-digit OTP"
            class="form-input"
            maxlength="6"
            pattern="\d{6}"
          />
          <small class="form-help">Enter the 6-digit code sent to your email</small>
        </div>
        
        <button 
          type="submit" 
          class="submit-button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Verifying...' : 'Verify OTP' }}
        </button>
        
        <button 
          type="button" 
          class="resend-button"
          @click="handleResendOTP"
          :disabled="isLoading"
        >
          Resend OTP
        </button>
      </form>
      
      <div class="auth-links">
        <p>
          Remember your password? 
          <RouterLink to="/login" class="auth-link">Login</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background-color: white;
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
}

h1 {
  text-align: center;
  margin-bottom: var(--space-6);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-input {
  padding: var(--space-3);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius);
  font-family: var(--font-family);
  font-size: 1rem;
  transition: border-color var(--transition-base);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-help {
  color: var(--color-neutral-600);
  font-size: 0.875rem;
}

.submit-button {
  background-color: var(--color-primary);
  color: white;
  padding: var(--space-3);
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.resend-button {
  background-color: transparent;
  color: var(--color-primary);
  padding: var(--space-3);
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  border: 1px solid var(--color-primary);
}

.resend-button:hover:not(:disabled) {
  background-color: var(--color-primary-light);
}

.resend-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  padding: var(--space-3);
  border-radius: var(--radius);
  text-align: center;
}

.auth-links {
  margin-top: var(--space-4);
  text-align: center;
}

.auth-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-link:hover {
  text-decoration: underline;
}

@media (prefers-color-scheme: dark) {
  .auth-container {
    background-color: var(--color-neutral-800);
  }
  
  .form-input {
    background-color: var(--color-neutral-700);
    border-color: var(--color-neutral-600);
    color: var(--color-neutral-100);
  }
  
  .form-input:focus {
    border-color: var(--color-primary);
  }
  
  .form-help {
    color: var(--color-neutral-400);
  }
}
</style> 