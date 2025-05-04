<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const isLoading = ref(false)

const handleSubmit = async () => {
  try {
    error.value = ''
    success.value = false
    
    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match'
      return
    }
    
    isLoading.value = true
    const token = route.query.token as string
    
    if (!token) {
      throw new Error('Invalid reset token')
    }
    
    await authStore.resetPassword(token, password.value)
    success.value = true
    
    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to reset password'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <h1>Set New Password</h1>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="success" class="success-message">
          Password has been reset successfully. Redirecting to login...
        </div>
        
        <div class="form-group">
          <label for="password">New Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter new password"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="confirm-password">Confirm New Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm new password"
            class="form-input"
          />
        </div>
        
        <button 
          type="submit" 
          class="submit-button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Resetting...' : 'Reset Password' }}
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

.error-message {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
  padding: var(--space-3);
  border-radius: var(--radius);
  text-align: center;
}

.success-message {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
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
}
</style> 