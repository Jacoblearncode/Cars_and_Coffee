<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import { POPULAR_CAR_MAKES, fetchVehicleModelsForMake } from '../services/externalApis'
import { sendWelcomeEmail } from '../services/emailService'
import BrandLogo from '../components/BrandLogo.vue'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  region: 'Australia',
  car_make: 'Toyota',
  car_model: 'GR86',
  car_year: 2023,
  bio: ''
})

const availableModels = ref([])
const confirmMismatch = ref(false)

async function loadModels(make) {
  const res = await fetchVehicleModelsForMake(make)
  availableModels.value = res.models
  if (!availableModels.value.includes(form.value.car_model)) {
    form.value.car_model = availableModels.value[0] || ''
  }
}

watch(
  () => form.value.car_make,
  (mk) => {
    loadModels(mk)
  }
)

async function handleRegister() {
  if (form.value.password !== form.value.confirmPassword) {
    confirmMismatch.value = true
    return
  }
  confirmMismatch.value = false

  try {
    const user = await authStore.register(form.value)
    sendWelcomeEmail(user)
    showToast(`Welcome to Roast & Redline (Cars & Coffee), ${user.name}!`)
    router.push('/meets')
  } catch (err) {
    showToast(err.message || 'Registration failed.', 'danger')
  }
}

onMounted(() => {
  loadModels(form.value.car_make)
})
</script>

<template>
  <div class="container" style="max-width: 640px">
    <div class="cc-tile p-4 p-md-5">
      <div class="text-center mb-4">
        <div class="d-flex justify-content-center mb-3">
          <BrandLogo :size="48" :show-text="false" />
        </div>
        <div class="cc-bracket-label">[ NEW DRIVER REGISTRATION ]</div>
        <h1 class="h3 fw-bold mb-1">Join the Cars &amp; Coffee Club</h1>
        <p class="small text-secondary mb-0">
          Register your ride, join weekend coffee runs, and post your own local meets.
        </p>
      </div>

      <div v-if="authStore.error" class="alert alert-danger small py-2 mb-3" role="alert">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="row g-3">
          <div class="col-md-6 field">
            <label for="reg-name" class="form-label fw-semibold">Full Name *</label>
            <span id="reg-name-hint" class="hint">At least 2 characters</span>
            <input
              id="reg-name"
              v-model="form.name"
              v-focus
              type="text"
              class="form-control"
              required
              minlength="2"
              autocomplete="name"
              aria-describedby="reg-name-hint"
              aria-errormessage="reg-name-err"
              placeholder="Alex Mercer"
            />
            <div id="reg-name-err" class="error-msg">Please enter your name.</div>
          </div>

          <div class="col-md-6 field">
            <label for="reg-region" class="form-label fw-semibold">Home Region Hub *</label>
            <span class="hint">Default map &amp; meet region</span>
            <select id="reg-region" v-model="form.region" class="form-select" required>
              <option value="Australia">Australia (Melbourne / VIC)</option>
              <option value="Malaysia">Malaysia (Kuching / KL)</option>
            </select>
          </div>

          <div class="col-12 field">
            <label for="reg-email" class="form-label fw-semibold">Email Address *</label>
            <span id="reg-email-hint" class="hint">Format: you@example.com</span>
            <input
              id="reg-email"
              v-model="form.email"
              type="email"
              class="form-control"
              required
              autocomplete="email"
              aria-describedby="reg-email-hint"
              aria-errormessage="reg-email-err"
              placeholder="alex@carsandcoffee.com"
            />
            <div id="reg-email-err" class="error-msg">Please enter a valid email address.</div>
          </div>

          <div class="col-md-6 field">
            <label for="reg-password" class="form-label fw-semibold">Password *</label>
            <ul id="password-rules" class="rules-list">
              <li>At least 8 characters</li>
              <li>One uppercase &amp; one lowercase letter</li>
              <li>One number</li>
            </ul>
            <input
              id="reg-password"
              v-model="form.password"
              type="password"
              class="form-control"
              required
              minlength="8"
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              autocomplete="new-password"
              aria-describedby="password-rules"
              aria-errormessage="reg-pass-err"
              placeholder="••••••••"
            />
            <div id="reg-pass-err" class="error-msg">
              Password must be 8+ characters with uppercase, lowercase, and a number.
            </div>
          </div>

          <div class="col-md-6 field">
            <label for="reg-confirm" class="form-label fw-semibold">Confirm Password *</label>
            <span class="hint">Re-enter your password</span>
            <input
              id="reg-confirm"
              v-model="form.confirmPassword"
              type="password"
              class="form-control"
              required
              minlength="8"
              autocomplete="new-password"
              placeholder="••••••••"
            />
            <div v-if="confirmMismatch" class="text-danger small mt-1">
              Passwords do not match.
            </div>
          </div>

          <!-- My Garage NHTSA + AU/MY Car Picker -->
          <div class="col-12">
            <div class="cc-panel p-3">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="small fw-bold">
                  <i class="bi bi-car-front-fill text-warning me-1"></i>
                  Your Primary Ride (For Meet Car Roll-Calls)
                </span>
                <span class="badge cc-badge-accent font-mono">NHTSA + AU/MY Registry</span>
              </div>
              <div class="row g-2">
                <div class="col-4">
                  <label for="reg-year" class="form-label small mb-1">Year</label>
                  <input
                    id="reg-year"
                    v-model.number="form.car_year"
                    type="number"
                    min="1955"
                    max="2027"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-4">
                  <label for="reg-make" class="form-label small mb-1">Make</label>
                  <select id="reg-make" v-model="form.car_make" class="form-select form-select-sm">
                    <option v-for="mk in POPULAR_CAR_MAKES" :key="mk" :value="mk">{{ mk }}</option>
                  </select>
                </div>
                <div class="col-4">
                  <label for="reg-model" class="form-label small mb-1">Model</label>
                  <select id="reg-model" v-model="form.car_model" class="form-select form-select-sm">
                    <option v-for="mdl in availableModels" :key="mdl" :value="mdl">{{ mdl }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 field">
            <label for="reg-bio" class="form-label fw-semibold">Short Bio &amp; Coffee Order</label>
            <textarea
              id="reg-bio"
              v-model="form.bio"
              rows="2"
              class="form-control"
              placeholder="e.g. Weekend flat white runner in a Hakone Green GR86..."
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-cc-primary cc-pill-btn w-100 py-2 mt-3"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Creating Account...' : 'Create Community Account' }}
        </button>
      </form>

      <p class="text-center small text-secondary mt-4 mb-0">
        Already have an account?
        <router-link to="/login" class="text-warning fw-bold text-decoration-none">
          Sign In
        </router-link>
      </p>
    </div>
  </div>
</template>
