<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useMeetStore } from '../stores/meetStore'
import { useToast } from '../composables/useToast'
import { POPULAR_CAR_MAKES, fetchVehicleModelsForMake } from '../services/externalApis'

const authStore = useAuthStore()
const meetStore = useMeetStore()
const { showToast } = useToast()

const form = ref({
  name: authStore.user?.name || '',
  region: authStore.user?.region || 'Australia',
  car_make: authStore.user?.car_make || 'Toyota',
  car_model: authStore.user?.car_model || 'GR86',
  car_year: authStore.user?.car_year || 2024,
  bio: authStore.user?.bio || ''
})

const availableModels = ref([])
const modelSourceLabel = ref('Vehicle Registry')
const allMeets = ref([])

const myHostedMeets = computed(() => {
  if (!authStore.user) return []
  return allMeets.value.filter((m) => Number(m.host_id) === Number(authStore.user.id))
})

const myPosts = computed(() => {
  if (!authStore.user) return []
  return meetStore.posts.filter((p) => Number(p.user_id) === Number(authStore.user.id))
})

async function loadCarModels(make) {
  if (!make) return
  const res = await fetchVehicleModelsForMake(make)
  availableModels.value = res.models
  modelSourceLabel.value = res.source.includes('NHTSA') ? 'Vehicle Registry' : res.source
  if (!availableModels.value.includes(form.value.car_model)) {
    form.value.car_model = availableModels.value[0] || ''
  }
}

watch(
  () => form.value.car_make,
  (newMake) => {
    loadCarModels(newMake)
  }
)

async function handleSaveProfile() {
  try {
    await authStore.updateProfile(form.value)
    showToast('Updated your profile and primary Garage vehicle!')
  } catch (err) {
    showToast(err.message || 'Failed to save profile.', 'danger')
  }
}

async function handleDeleteHostedMeet(id) {
  await meetStore.deleteMeet(id)
  allMeets.value = allMeets.value.filter((m) => Number(m.id) !== Number(id))
  showToast('Meet deleted.')
}

onMounted(async () => {
  await loadCarModels(form.value.car_make)
  const res = await meetStore.fetchMeets({ limit: 250 })
  allMeets.value = res.data || []
  await meetStore.fetchPosts({ limit: 250 })
})
</script>

<template>
  <div class="container">
    <div class="mb-4">
      <div class="cc-bracket-label">[ 06 // DRIVER &amp; BUILD HUB ]</div>
      <h1 class="h2 fw-bold mb-1">My Garage &amp; Profile</h1>
      <p class="text-secondary small mb-0">
        Configure the ride that appears in Car Roll-Calls and manage your hosted meets &amp; posts.
      </p>
    </div>

    <div class="row g-4">
      <!-- Left Column: Profile & NHTSA Garage Form -->
      <div class="col-lg-6">
        <form class="cc-tile" @submit.prevent="handleSaveProfile">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="cc-bracket-label mb-1">[ PRIMARY GARAGE SPEC ]</span>
              <h2 class="h5 fw-bold mb-0">Primary Garage Ride &amp; Bio</h2>
            </div>
            <span class="badge cc-badge-accent font-mono">{{ modelSourceLabel }}</span>
          </div>

          <div class="field">
            <label for="prof-name" class="form-label small fw-semibold">Display Name *</label>
            <input
              id="prof-name"
              v-model="form.name"
              type="text"
              class="form-control"
              required
              minlength="2"
            />
            <div class="error-msg">Please enter your display name.</div>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-md-4">
              <label for="prof-year" class="form-label small fw-semibold">Model Year</label>
              <input
                id="prof-year"
                v-model.number="form.car_year"
                type="number"
                min="1955"
                max="2027"
                class="form-control"
              />
            </div>

            <div class="col-md-4">
              <label for="prof-make" class="form-label small fw-semibold">Car Make</label>
              <select id="prof-make" v-model="form.car_make" class="form-select">
                <option v-for="mk in POPULAR_CAR_MAKES" :key="mk" :value="mk">{{ mk }}</option>
              </select>
            </div>

            <div class="col-md-4">
              <label for="prof-model" class="form-label small fw-semibold">Car Model</label>
              <select id="prof-model" v-model="form.car_model" class="form-select">
                <option v-for="mdl in availableModels" :key="mdl" :value="mdl">{{ mdl }}</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label for="prof-region" class="form-label small fw-semibold">Home Region Hub</label>
            <select id="prof-region" v-model="form.region" class="form-select">
              <option value="Australia">Australia (Melbourne / VIC)</option>
              <option value="Malaysia">Malaysia (KL &amp; Kuching)</option>
            </select>
          </div>

          <div class="field">
            <label for="prof-bio" class="form-label small fw-semibold">Enthusiast Bio &amp; Coffee Order</label>
            <textarea
              id="prof-bio"
              v-model="form.bio"
              rows="3"
              class="form-control"
              placeholder="Tell the community about your car build and your go-to morning coffee order..."
            ></textarea>
          </div>

          <button type="submit" class="btn btn-cc-primary cc-pill-btn w-100">
            <i class="bi bi-check2-circle me-1"></i>Save Garage &amp; Profile
          </button>
        </form>
      </div>

      <!-- Right Column: My Hosted Meets & My Spotting Posts -->
      <div class="col-lg-6">
        <div class="cc-tile mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="cc-bracket-label mb-1">[ ORGANIZER ROSTER ]</span>
              <h2 class="h5 fw-bold mb-0">My Hosted Meets ({{ myHostedMeets.length }})</h2>
            </div>
            <router-link to="/meets/new" class="btn btn-sm btn-cc-primary cc-pill-btn">
              + Host New Meet
            </router-link>
          </div>

          <div v-if="myHostedMeets.length === 0" class="small text-secondary">
            You haven't hosted a meet yet. Any member can organize a morning coffee run!
          </div>

          <div v-else class="d-flex flex-column gap-2 overflow-auto" style="max-height: 290px">
            <div
              v-for="m in myHostedMeets"
              :key="m.id"
              class="cc-panel p-2 px-3 d-flex justify-content-between align-items-center"
            >
              <div class="pe-2">
                <router-link :to="`/meets/${m.id}`" class="fw-bold small text-reset text-decoration-none">
                  {{ m.title }}
                </router-link>
                <div class="small text-secondary">
                  {{ m.cafe_name }} &middot; {{ m.rsvp_count }} RSVPs
                </div>
              </div>
              <div class="d-flex gap-2 flex-shrink-0">
                <router-link :to="`/meets/${m.id}/edit`" class="btn btn-sm btn-cc-outline rounded-pill px-3">
                  Edit
                </router-link>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill px-3"
                  @click="handleDeleteHostedMeet(m.id)"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="cc-tile">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <span class="cc-bracket-label mb-1">[ PHOTOGRAPHY &amp; LOGS ]</span>
              <h2 class="h5 fw-bold mb-0">My Spotting Posts ({{ myPosts.length }})</h2>
            </div>
            <router-link to="/feed" class="btn btn-sm btn-cc-outline cc-pill-btn">
              Go to Feed
            </router-link>
          </div>

          <div v-if="myPosts.length === 0" class="small text-secondary">
            You haven't shared any car spotting photos yet.
          </div>

          <div v-else class="d-flex flex-column gap-2 overflow-auto" style="max-height: 260px">
            <div
              v-for="p in myPosts"
              :key="p.id"
              class="cc-panel p-2 px-3 d-flex justify-content-between align-items-center"
            >
              <div class="pe-2">
                <div class="fw-bold small">{{ p.title }}</div>
                <div class="small text-secondary">
                  {{ p.car_tag }} &middot; {{ p.likes_count }} likes
                </div>
              </div>
              <router-link to="/feed" class="btn btn-sm btn-cc-outline rounded-pill px-3">Manage</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
