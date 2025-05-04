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

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    initialize
  }
}) 