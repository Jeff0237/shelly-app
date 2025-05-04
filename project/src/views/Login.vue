<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

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
  <div class="auth-page">
    <div class="auth-container">
      <h1>Login</h1>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="Enter your password"
              class="form-input"
            />
            <button 
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="submit-button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div class="auth-links">
        <p>
          <RouterLink to="/forgot-password" class="auth-link">Forgot Password?</RouterLink>
        </p>
        <p>
          Don't have an account? 
          <RouterLink to="/register" class="auth-link">Register</RouterLink>
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
  padding-right: calc(var(--space-3) * 2 + 20px);
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius);
  font-family: var(--font-family);
  font-size: 1rem;
  transition: border-color var(--transition-base);
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--color-neutral-600);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--transition-base);
  z-index: 1;
}

.password-toggle:hover {
  color: var(--color-primary);
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

.auth-links {
  margin-top: var(--space-4);
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
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
  
  .password-toggle {
    color: var(--color-neutral-400);
  }
  
  .password-toggle:hover {
    color: var(--color-primary);
  }
}
</style> 
