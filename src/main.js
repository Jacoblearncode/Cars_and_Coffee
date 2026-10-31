import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'leaflet/dist/leaflet.css'
import './style.css'

import App from './App.vue'
import router from './router'
import { vFocus } from './directives/focus'

/*
 * The PWA service worker is registered by vite-plugin-pwa (devOptions.enabled in vite.config.js),
 * so install prompts and the offline vault work on the dev server as well as in production builds.
 */

/**
 * Post-interaction `:user-invalid` WeakMap Fallback & `aria-invalid` Synchronizer
 * (Follows `validate-input-after-interaction` specification)
 */
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap()

  const updateState = (input) => {
    if (!input || typeof input.checkValidity !== 'function') return
    const isValid = input.checkValidity()
    input.classList.toggle('user-invalid-fallback', !isValid)
    input.classList.toggle('user-valid-fallback', isValid)
    if (!isValid) {
      input.setAttribute('aria-invalid', 'true')
    } else {
      input.removeAttribute('aria-invalid')
    }
  }

  const handleEvent = (event) => {
    const input = event.target
    if (!input) return

    if (event.type === 'reset') {
      const controls = input.elements || []
      for (const control of controls) {
        dirtyState.delete(control)
        control.classList.remove('user-invalid-fallback', 'user-valid-fallback')
        control.removeAttribute('aria-invalid')
      }
      return
    }

    if (typeof input.checkValidity !== 'function') return

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false }
      state.hasInteracted = true
      dirtyState.set(input, state)
      if (state.hasBlurred) updateState(input)
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false }
      state.hasBlurred = true
      dirtyState.set(input, state)
      if (state.hasInteracted) updateState(input)
    }
  }

  const init = (root = document) => {
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('selector(:user-invalid)')) {
      return
    }
    root.addEventListener('blur', handleEvent, true)
    root.addEventListener('input', handleEvent)
    root.addEventListener('change', handleEvent)
    root.addEventListener('reset', handleEvent, true)
  }

  return { init }
})()

if (typeof document !== 'undefined') {
  UserInvalidFallback.init(document)

  const syncAria = (el) => {
    if (!el || typeof el.matches !== 'function') return
    try {
      el.setAttribute?.('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false')
    } catch {
      // ignore if browser does not support :user-invalid selector in matches()
    }
  }

  document.addEventListener('blur', (e) => syncAria(e.target), true)
  document.addEventListener('input', (e) => {
    if (e.target && typeof e.target.hasAttribute === 'function' && e.target.hasAttribute('aria-invalid')) {
      syncAria(e.target)
    }
  })
}

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.directive('focus', vFocus)
app.mount('#app')
