import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, userService } from '../services/api'

interface User {
  email: string
  name: string
  role: string
  created_at: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const resetEmail = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })
      token.value = response.access_token
      user.value = response.user
      
      // Store in localStorage
      localStorage.setItem('access_token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed')
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      await authService.register({ name, email, password })
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed')
    }
  }

  const logout = () => {
    authService.logout()
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }

  const initialize = async () => {
    const storedToken = localStorage.getItem('access_token')
    
    if (storedToken) {
      token.value = storedToken
      try {
        const userData = await userService.getCurrentUser()
        user.value = userData
        localStorage.setItem('user', JSON.stringify(userData))
      } catch (error) {
        // If token is invalid, clear everything
        logout()
      }
    }
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await authService.forgotPassword(email)
      resetEmail.value = email
      return true
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send reset email')
    }
  }

  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await authService.verifyOTP(email, otp)
      return response.reset_token
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'OTP verification failed')
    }
  }

  const resetPassword = async (resetToken: string, newPassword: string) => {
    try {
      await authService.resetPassword(newPassword, resetToken)
      resetEmail.value = null
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset failed')
    }
  }

  return {
    user,
    token,
    resetEmail,
    isAuthenticated,
    login,
    register,
    logout,
    initialize,
    requestPasswordReset,
    verifyOTP,
    resetPassword
  }
}) 