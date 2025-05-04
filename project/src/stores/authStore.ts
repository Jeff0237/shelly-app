import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const resetEmail = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  // In a real app, these would make API calls to your backend
  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo purposes, accept any non-empty credentials
    if (!email || !password) {
      throw new Error('Invalid credentials')
    }
    
    // Simulate successful login
    user.value = {
      id: '1',
      name: 'Demo User',
      email: email
    }
    token.value = 'demo-token'
    
    // Store in localStorage
    localStorage.setItem('auth_token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // For demo purposes, accept any non-empty credentials
    if (!name || !email || !password) {
      throw new Error('Invalid registration data')
    }
    
    // Simulate successful registration
    user.value = {
      id: '1',
      name,
      email
    }
    token.value = 'demo-token'
    
    // Store in localStorage
    localStorage.setItem('auth_token', token.value)
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  const initialize = () => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  const requestPasswordReset = async (email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!email) {
      throw new Error('Email is required')
    }
    
    // In a real app, this would:
    // 1. Check if email exists in the database
    // 2. Generate and store OTP
    // 3. Send OTP via email
    
    // For demo purposes, we'll just store the email and simulate success
    resetEmail.value = email
    return true
  }

  const verifyOTP = async (email: string, otp: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!email || !otp) {
      throw new Error('Email and OTP are required')
    }
    
    // In a real app, this would:
    // 1. Verify the OTP matches what was sent
    // 2. Check if OTP is still valid (not expired)
    // 3. Generate a reset token
    
    // For demo purposes, we'll accept any 6-digit OTP
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      throw new Error('Invalid OTP format')
    }
    
    // Generate a reset token
    return 'reset-token-' + Math.random().toString(36).substr(2, 9)
  }

  const resetPassword = async (resetToken: string, newPassword: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!resetToken || !newPassword) {
      throw new Error('Invalid reset data')
    }
    
    // In a real app, this would:
    // 1. Validate the reset token
    // 2. Update the user's password
    // 3. Invalidate the reset token
    
    // For demo purposes, we'll just simulate success
    console.log('Password reset with token:', resetToken)
    resetEmail.value = null
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