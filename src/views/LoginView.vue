<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import BrandLogo from '../components/BrandLogo.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const email = ref('')
const password = ref('')

const demoAccounts = [
  { label: 'Member (Melbourne AU)', email: 'member@carsandcoffee.com', car: '2023 Toyota GR86' },
  { label: 'Member (Kuching MY)', email: 'amirul@carsandcoffee.com', car: '2010 Proton Satria Neo R3' },
  { label: 'Admin Moderator', email: 'admin@carsandcoffee.com', car: '2024 Honda Civic Type R (FL5)' }
]

async function handleLogin() {
  try {
    const user = await authStore.login(email.value, password.value)
    showToast(`Welcome back, ${user.name}!`)
    const redirect = route.query.redirect || '/meets'
    router.push(String(redirect))
  } catch (err) {
    showToast(err.message || 'Sign in failed.', 'danger')
  }
}

async function handleQuickDemo(demoEmail) {
  email.value = demoEmail
  password.value = 'Password123!'
  await handleLogin()
}
</script>

<template>
  <div class="container" style="max-width: 520px">
    <div class="cc-tile p-4 p-md-5">
      <div class="text-center mb-4">
        <div class="d-flex justify-content-center mb-3">
          <BrandLogo :size="48" :show-text="false" />
        </div>
        <div class="cc-bracket-label">[ MEMBER ACCESS ]</div>
        <h1 class="h3 fw-bold mb-1">Sign In to Roast &amp; Redline</h1>
        <p class="small text-secondary mb-0">
          Unlock member parking bay notes, RSVP to the Car Roll-Call, and host weekend coffee runs.
        </p>
      </div>

      <div
        v-if="route.query.notice === 'auth_required'"
        class="alert alert-warning small py-2 mb-3"
      >
        <i class="bi bi-info-circle me-1"></i>Please sign in to access that page.
      </div>

      <div v-if="authStore.error" class="alert alert-danger small py-2 mb-3" role="alert">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="login-email" class="form-label fw-semibold">Email Address</label>
          <span id="login-email-hint" class="hint">Format: you@carsandcoffee.com</span>
          <input
            id="login-email"
            v-model="email"
            v-focus
            type="email"
            name="email"
            class="form-control"
            required
            autocomplete="email"
            aria-describedby="login-email-hint"
            aria-errormessage="login-email-err"
            placeholder="member@carsandcoffee.com"
          />
          <div id="login-email-err" class="error-msg">
            Please enter a valid email address.
          </div>
        </div>

        <div class="field">
          <label for="login-password" class="form-label fw-semibold">Password</label>
          <span id="login-pass-hint" class="hint">Minimum 8 characters</span>
          <input
            id="login-password"
            v-model="password"
            type="password"
            name="password"
            class="form-control"
            required
            minlength="8"
            autocomplete="current-password"
            aria-describedby="login-pass-hint"
            aria-errormessage="login-pass-err"
            placeholder="••••••••"
          />
          <div id="login-pass-err" class="error-msg">
            Please enter your password (at least 8 characters).
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-cc-primary cc-pill-btn w-100 py-2 mt-2"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- 1-Click Seeded Demo Accounts -->
      <div class="mt-4 pt-3 border-top">
        <div class="small fw-bold text-secondary mb-2">
          <i class="bi bi-lightning-charge-fill text-warning me-1"></i>
          1-Click Demo Accounts (Password: <code>Password123!</code>)
        </div>
        <div class="d-grid gap-2">
          <button
            v-for="acc in demoAccounts"
            :key="acc.email"
            type="button"
            class="btn btn-sm btn-cc-outline rounded-3 text-start d-flex justify-content-between align-items-center p-2 px-3"
            @click="handleQuickDemo(acc.email)"
          >
            <span>
              <strong>{{ acc.label }}</strong>
              <span class="d-block small text-secondary">{{ acc.email }}</span>
            </span>
            <span class="badge cc-badge-accent font-mono">{{ acc.car }}</span>
          </button>
        </div>
      </div>

      <p class="text-center small text-secondary mt-4 mb-0">
        New to the community?
        <router-link to="/register" class="fw-bold text-decoration-none" style="color: var(--cc-accent)">
          Create an Account
        </router-link>
      </p>
    </div>
  </div>
</template>
