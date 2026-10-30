/**
 * Cars & Coffee — Theme Store (`dark-mode-toggle` Compliant)
 * Synchronizes `<meta name="color-scheme">` and `data-bs-theme` while respecting
 * system preference and reverting `localStorage` when matching OS scheme.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const SCHEME_KEY = 'color-scheme'

function getSystemScheme() {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    if (mq && mq.matches) return 'light'
  }
  return 'dark'
}

function getInitialStoredOverride() {
  try {
    const val = localStorage.getItem(SCHEME_KEY)
    if (val === 'light' || val === 'dark') return val
  } catch {
    // ignore
  }
  return null
}

export const useThemeStore = defineStore('theme', () => {
  const storedOverride = ref(getInitialStoredOverride())
  const systemScheme = ref(getSystemScheme())

  const resolvedTheme = computed(() => storedOverride.value || systemScheme.value)
  const isDark = computed(() => resolvedTheme.value === 'dark')

  function applyToDom() {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="color-scheme"]')
    if (meta) {
      meta.setAttribute('content', storedOverride.value ?? 'light dark')
    }
    document.documentElement.setAttribute('data-bs-theme', resolvedTheme.value)
  }

  function toggleTheme() {
    const currentSys = getSystemScheme()
    systemScheme.value = currentSys
    const target = resolvedTheme.value === 'dark' ? 'light' : 'dark'

    // Per `dark-mode-toggle`: If target matches current system preference, remove stored override
    // so the page returns to following the system scheme ('light dark').
    if (target === currentSys) {
      storedOverride.value = null
      try {
        localStorage.removeItem(SCHEME_KEY)
      } catch {
        // ignore
      }
    } else {
      storedOverride.value = target
      try {
        localStorage.setItem(SCHEME_KEY, target)
      } catch {
        // ignore
      }
    }
    applyToDom()
  }

  function initThemeListeners() {
    applyToDom()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === SCHEME_KEY) {
          storedOverride.value =
            e.newValue === 'light' || e.newValue === 'dark' ? e.newValue : null
          applyToDom()
        }
      })
    }
  }

  applyToDom()

  return {
    storedOverride,
    resolvedTheme,
    isDark,
    toggleTheme,
    initThemeListeners
  }
})
