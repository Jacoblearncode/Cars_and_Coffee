/**
 * Cars & Coffee — Pinia Persisted Authentication Store (Syed's Advanced Feature)
 * Manages Guest vs. Member vs. Admin session state, Garage car details, and JWT persistence.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, setStoredToken, getStoredToken } from '../services/api'

const USER_STORAGE_KEY = 'cars_and_coffee_auth_user_v1'

function loadCachedUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(loadCachedUser())
  const token = ref(getStoredToken())
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(user.value && token.value))
  const userRole = computed(() => (user.value ? user.value.role : 'guest'))
  const isAdmin = computed(() => userRole.value === 'admin')
  const userGarageCar = computed(() => {
    if (!user.value || !user.value.car_make) return 'No Car Set'
    return `${user.value.car_year || ''} ${user.value.car_make} ${user.value.car_model || ''}`.trim()
  })

  function persistSession(userData, jwtToken) {
    user.value = userData
    token.value = jwtToken
    setStoredToken(jwtToken)
    try {
      if (userData) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData))
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    } catch {
      // ignore storage errors
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('auth/login', { email, password })
      persistSession(res.user, res.token)
      return res.user
    } catch (err) {
      error.value = err.message || 'Sign in failed.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('auth/register', payload)
      persistSession(res.user, res.token)
      return res.user
    } catch (err) {
      error.value = err.message || 'Registration failed.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload) {
    loading.value = true
    error.value = null
    try {
      const res = await api.put('profile', payload)
      user.value = res.user
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user))
      } catch {
        // ignore
      }
      return res.user
    } catch (err) {
      error.value = err.message || 'Failed to update profile.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    persistSession(null, null)
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    userGarageCar,
    login,
    register,
    updateProfile,
    logout
  }
})
