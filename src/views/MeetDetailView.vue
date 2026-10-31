<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useOfflineSync } from '../composables/useOfflineSync'
import { useToast } from '../composables/useToast'
import { fetchMeetWeather, POPULAR_CAR_MAKES, fetchVehicleModelsForMake } from '../services/externalApis'
import { sendRsvpEmail } from '../services/emailService'
import EventMap from '../components/EventMap.vue'

const route = useRoute()
const router = useRouter()
const meetStore = useMeetStore()
const authStore = useAuthStore()
const { isMeetSavedOffline, getOfflineMeetById, toggleSaveMeetOffline } = useOfflineSync()
const { showToast } = useToast()

const weather = ref(null)
const isOfflineSnapshot = ref(false)
const attendType = ref('bringing_car')
const selectedMake = ref('')
const selectedModel = ref('')
const customCarText = ref('')
const availableModels = ref([])

const commentBody = ref('')
const commentRating = ref(5)

const meet = computed(() => meetStore.currentMeet)

const canModifyMeet = computed(() => {
  if (!authStore.isAuthenticated || !meet.value) return false
  return (
    Number(meet.value.host_id) === Number(authStore.user.id) ||
    authStore.user.role === 'admin'
  )
})

const myRsvp = computed(() => {
  if (!authStore.isAuthenticated || !meet.value || !Array.isArray(meet.value.rsvps)) return null
  return meet.value.rsvps.find((r) => Number(r.user_id) === Number(authStore.user.id)) || null
})

const isLiked = computed(() => {
  if (!authStore.isAuthenticated || !meet.value || !Array.isArray(meet.value.liked_by)) return false
  return meet.value.liked_by.includes(Number(authStore.user.id))
})

const isPinnedOffline = computed(() => (meet.value ? isMeetSavedOffline(meet.value.id) : false))

function formatDateTime(raw) {
  if (!raw) return ''
  const dt = new Date(String(raw).replace(' ', 'T'))
  if (Number.isNaN(dt.getTime())) return raw
  return dt.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadMeetData() {
  const id = route.params.id
  if (!id) return
  isOfflineSnapshot.value = false
  try {
    const m = await meetStore.fetchMeetById(id)
    if (m && m.latitude && m.longitude) {
      weather.value = await fetchMeetWeather(m.latitude, m.longitude, m.region, m.meet_datetime)
    }
    if (authStore.user && authStore.user.car_make) {
      selectedMake.value = authStore.user.car_make
      const res = await fetchVehicleModelsForMake(selectedMake.value)
      availableModels.value = res.models
      selectedModel.value = authStore.user.car_model || res.models[0] || ''
    }
  } catch {
    // Fallback to Pinned PWA Offline Vault Snapshot if out of signal or not in active DB
    const cached = getOfflineMeetById(id)
    if (cached) {
      meetStore.currentMeet = cached
      isOfflineSnapshot.value = true
      showToast('Loaded meet from your PWA Offline Vault snapshot.', 'info')
      return
    }
    showToast('Could not find that meet.', 'danger')
    router.push('/meets')
  }
}

watch(
  () => route.params.id,
  () => {
    loadMeetData()
  }
)

watch(selectedMake, async (newMake) => {
  if (!newMake) {
    availableModels.value = []
    return
  }
  const res = await fetchVehicleModelsForMake(newMake)
  availableModels.value = res.models
  if (!availableModels.value.includes(selectedModel.value)) {
    selectedModel.value = availableModels.value[0] || ''
  }
})

async function handleRsvpSubmit() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  let carLabel = 'Grabbing Coffee / Spectating'
  if (attendType.value === 'bringing_car') {
    carLabel =
      customCarText.value.trim() ||
      `${selectedMake.value} ${selectedModel.value}`.trim() ||
      authStore.userGarageCar
  }
  await meetStore.rsvpToMeet(meet.value.id, attendType.value, carLabel)
  sendRsvpEmail(authStore.user, meet.value, attendType.value, carLabel)
  showToast(
    attendType.value === 'bringing_car'
      ? `Added ${carLabel} to the Car Roll-Call!`
      : 'RSVP saved — see you for coffee!'
  )
}

async function handleCancelRsvp() {
  if (!meet.value) return
  await meetStore.cancelRsvp(meet.value.id)
  showToast('Removed your RSVP from this meet.', 'warning')
}

async function handleLike() {
  if (!authStore.isAuthenticated) {
    showToast('Sign in to like this meet.', 'warning')
    router.push('/login')
    return
  }
  await meetStore.toggleLike('meet', meet.value.id)
}

function handleOfflinePin() {
  if (!meet.value) return
  const saved = toggleSaveMeetOffline(meet.value)
  showToast(
    saved
      ? 'Meet & parking notes saved to your Offline Vault.'
      : 'Removed meet from Offline Vault.'
  )
}

async function handleDeleteMeet() {
  if (!meet.value) return
  await meetStore.deleteMeet(meet.value.id)
  showToast('Meet deleted.')
  router.push('/meets')
}

async function handlePostComment() {
  if (!commentBody.value.trim()) return
  const ratingVal = meet.value.status === 'completed' ? Number(commentRating.value) : null
  await meetStore.addComment('meet', meet.value.id, commentBody.value.trim(), ratingVal)
  commentBody.value = ''
  showToast('Comment posted!')
}

async function handleDeleteComment(cid) {
  await meetStore.deleteComment(cid, 'meet', meet.value.id)
  showToast('Comment removed.')
}

onMounted(() => {
  loadMeetData()
})
</script>

<template>
  <div class="container">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <router-link to="/meets" class="btn btn-sm btn-cc-outline cc-pill-btn">
        <i class="bi bi-arrow-left me-1"></i>Back to Meets Board
      </router-link>

      <span v-if="isOfflineSnapshot" class="badge text-bg-warning text-dark rounded-pill px-3 py-2">
        <i class="bi bi-cloud-check-fill me-1"></i>Viewing Pinned Offline Vault Snapshot
      </span>
    </div>

    <div v-if="meetStore.loading && !meet" class="text-center py-5">
      <div class="spinner-border text-warning" role="status"></div>
    </div>

    <template v-else-if="meet">
      <div class="row g-4">
        <!-- Left Column: Meet Editorial Details, Roll-Call & Comments -->
        <div class="col-lg-8">
          <article class="cc-tile p-0 overflow-hidden mb-4">
            <div class="position-relative" style="height: 320px">
              <img
                :src="meet.image || '/meet-hero.jpg'"
                :alt="meet.title"
                class="w-100 h-100"
                style="object-fit: cover"
              />
              <div
                class="position-absolute bottom-0 start-0 end-0 p-4"
                style="background: linear-gradient(0deg, rgba(14,12,10,0.95) 0%, transparent 100%)"
              >
                <div class="d-flex flex-wrap gap-2 mb-2">
                  <span class="badge cc-badge-accent font-mono">{{ meet.vibe }}</span>
                  <span class="badge text-bg-dark font-mono">{{ meet.region }}</span>
                  <span
                    class="badge font-mono"
                    :class="meet.status === 'completed' ? 'text-bg-secondary' : 'text-bg-success'"
                  >
                    {{ meet.status }}
                  </span>
                </div>
                <h1 class="h2 fw-bold text-white mb-0">{{ meet.title }}</h1>
              </div>
            </div>

            <div class="p-4">
              <!-- Action Toolbar -->
              <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-3 border-bottom">
                <div class="d-flex flex-wrap align-items-center gap-2">
                  <button
                    type="button"
                    class="btn btn-sm cc-pill-btn"
                    :class="isLiked ? 'btn-danger' : 'btn-cc-outline'"
                    @click="handleLike"
                  >
                    <i class="bi me-1" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
                    Like ({{ meet.likes_count || 0 }})
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm cc-pill-btn"
                    :class="isPinnedOffline ? 'btn-warning text-dark' : 'btn-cc-outline'"
                    @click="handleOfflinePin"
                  >
                    <i
                      class="bi me-1"
                      :class="isPinnedOffline ? 'bi-cloud-check-fill' : 'bi-cloud-arrow-down'"
                    ></i>
                    {{ isPinnedOffline ? 'Pinned in Offline Vault' : 'Pin to Offline Vault' }}
                  </button>
                </div>

                <div v-if="canModifyMeet" class="d-flex gap-2">
                  <router-link :to="`/meets/${meet.id}/edit`" class="btn btn-sm btn-cc-outline cc-pill-btn">
                    <i class="bi bi-pencil-square me-1"></i>Edit Meet
                  </router-link>
                  <button type="button" class="btn btn-sm btn-outline-danger cc-pill-btn" @click="handleDeleteMeet">
                    <i class="bi bi-trash me-1"></i>Delete
                  </button>
                </div>
              </div>

              <div class="cc-bracket-label">[ 01 // BRIEFING &amp; VENUE NOTES ]</div>
              <p class="text-secondary mb-4">{{ meet.description }}</p>

              <!-- Cafe & Member-Gated Parking Bay Box -->
              <div class="cc-panel p-3 mb-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="small text-secondary">Coffee Spot / Venue</div>
                    <div class="fw-bold">
                      <i class="bi bi-cup-hot-fill me-1" style="color: var(--cc-accent)"></i>{{ meet.cafe_name }}
                    </div>
                    <div class="small text-secondary">{{ meet.address }}</div>
                  </div>
                  <div class="col-md-6">
                    <div class="small text-secondary">Date &amp; Time</div>
                    <div class="fw-bold font-mono">
                      <i class="bi bi-clock me-1" style="color: var(--cc-accent)"></i>{{ formatDateTime(meet.meet_datetime) }}
                    </div>
                    <div class="small text-secondary">Hosted by {{ meet.host_name }} ({{ meet.host_car }})</div>
                  </div>
                </div>

                <hr class="my-3 opacity-25" />

                <!-- Authenticated Member vs Guest Visibility Check -->
                <div v-if="authStore.isAuthenticated || isOfflineSnapshot" class="row g-3">
                  <div class="col-md-7">
                    <span class="badge text-bg-success mb-1">
                      <i class="bi bi-unlock-fill me-1"></i>Member Parking &amp; Ramp Notes
                    </span>
                    <p class="small mb-0">{{ meet.parking_note }}</p>
                  </div>
                  <div class="col-md-5">
                    <span class="badge text-bg-info mb-1">Host Direct Contact</span>
                    <p class="small mb-0 font-mono">{{ meet.host_contact }}</p>
                  </div>
                </div>

                <div
                  v-else
                  class="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 rounded-3 border"
                  style="background-color: var(--cc-surface); border-color: rgba(217, 119, 54, 0.4) !important;"
                >
                  <div class="small">
                    <i class="bi bi-shield-lock-fill me-1" style="color: var(--cc-accent)"></i>
                    <strong>Member Privacy Shield:</strong> Exact parking bay entry notes, low-car
                    ramp guidance, and host contact are reserved for signed-in members.
                  </div>
                  <router-link to="/login" class="btn btn-sm btn-cc-primary cc-pill-btn">
                    Sign In to Unlock
                  </router-link>
                </div>
              </div>

              <!-- Car Roll-Call List -->
              <section aria-labelledby="roll-call-heading">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div class="cc-bracket-label mb-1">[ 02 // CONFIRMED PADDOCK LINEUP ]</div>
                    <h2 id="roll-call-heading" class="h5 fw-bold mb-0">
                      Parking Lot Car Roll-Call ({{ meet.rsvp_count || 0 }} / {{ meet.capacity }})
                    </h2>
                  </div>
                  <span class="badge cc-badge-accent font-mono">
                    {{ meet.cars_bringing_count || 0 }} Cars Confirmed
                  </span>
                </div>

                <div v-if="!meet.rsvps || meet.rsvps.length === 0" class="cc-panel p-3 text-center small text-secondary">
                  No cars registered yet — be the first to add your build to the Roll-Call!
                </div>

                <div v-else class="row g-2">
                  <div v-for="rv in meet.rsvps" :key="rv.id" class="col-md-6">
                    <div class="cc-panel p-2 px-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div class="fw-semibold small">{{ rv.user_name }}</div>
                        <div class="small font-mono" style="color: var(--cc-accent)">
                          <i
                            class="bi me-1"
                            :class="
                              rv.attend_type === 'bringing_car' ? 'bi-car-front-fill' : 'bi-cup-hot'
                            "
                          ></i>
                          {{ rv.car_brought }}
                        </div>
                      </div>
                      <span
                        class="badge font-mono"
                        :class="
                          rv.attend_type === 'bringing_car' ? 'text-bg-warning text-dark' : 'text-bg-secondary'
                        "
                      >
                        {{ rv.attend_type === 'bringing_car' ? 'Bringing Car' : 'Spectating' }}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </article>

          <!-- Discussion Comments & Ratings -->
          <section class="cc-tile" aria-labelledby="comments-heading">
            <div class="cc-bracket-label">[ 03 // CONVOY CHATTER &amp; RECAPS ]</div>
            <h2 id="comments-heading" class="h5 fw-bold mb-3">
              Meet Discussion &amp; Recaps ({{ meet.comments?.length || 0 }})
            </h2>

            <form v-if="authStore.isAuthenticated" class="mb-4" @submit.prevent="handlePostComment">
              <div v-if="meet.status === 'completed'" class="mb-2">
                <label for="meet-rating" class="form-label small fw-semibold me-2">Rate this past meet:</label>
                <select id="meet-rating" v-model="commentRating" class="form-select form-select-sm d-inline-block w-auto">
                  <option :value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                  <option :value="4">⭐⭐⭐⭐ (4/5)</option>
                  <option :value="3">⭐⭐⭐ (3/5)</option>
                  <option :value="2">⭐⭐ (2/5)</option>
                  <option :value="1">⭐ (1/5)</option>
                </select>
              </div>
              <div class="field mb-2">
                <label for="comment-input" class="form-label small fw-semibold">Add a comment or convoy question</label>
                <textarea
                  id="comment-input"
                  v-model="commentBody"
                  rows="2"
                  class="form-control"
                  required
                  minlength="2"
                  placeholder="Ask about parking clearance, convoy meetup points, or coffee recommendations..."
                ></textarea>
                <div class="error-msg">Please enter at least 2 characters.</div>
              </div>
              <button type="submit" class="btn btn-sm btn-cc-primary cc-pill-btn">Post Comment</button>
            </form>

            <div v-else class="alert alert-secondary small py-2">
              <router-link to="/login" class="fw-bold">Sign in</router-link> to post a question or rate this meet.
            </div>

            <div class="d-flex flex-column gap-3">
              <div
                v-for="c in meet.comments"
                :key="c.id"
                class="cc-panel p-3"
              >
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <div>
                    <strong class="small">{{ c.user_name }}</strong>
                    <span v-if="c.rating" class="badge text-bg-warning text-dark ms-2">
                      ★ {{ c.rating }}/5
                    </span>
                    <span class="text-secondary small ms-2 font-mono">{{ formatDateTime(c.created_at) }}</span>
                  </div>
                  <button
                    v-if="
                      authStore.isAuthenticated &&
                      (Number(c.user_id) === Number(authStore.user.id) || authStore.isAdmin)
                    "
                    type="button"
                    class="btn btn-sm btn-link text-danger p-0"
                    aria-label="Delete comment"
                    @click="handleDeleteComment(c.id)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
                <p class="small mb-0">{{ c.body }}</p>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Column: Live Weather, RSVP Roll-Call Form & Interactive Map -->
        <div class="col-lg-4">
          <!-- RSVP & Car Roll-Call Card -->
          <div class="cc-tile mb-4">
            <div class="cc-bracket-label">[ LOCK IN YOUR BAY ]</div>
            <h2 class="h5 fw-bold mb-3">Join the Car Roll-Call</h2>

            <template v-if="authStore.isAuthenticated">
              <div v-if="myRsvp" class="alert alert-success small py-2 mb-3">
                <i class="bi bi-check-circle-fill me-1"></i>
                You are RSVPed: <strong>{{ myRsvp.car_brought }}</strong>
              </div>

              <form @submit.prevent="handleRsvpSubmit">
                <div class="mb-3">
                  <label class="form-label small fw-semibold">How are you attending?</label>
                  <div class="btn-group w-100" role="group">
                    <input
                      id="rsvp-car"
                      v-model="attendType"
                      type="radio"
                      class="btn-check"
                      value="bringing_car"
                    />
                    <label class="btn btn-sm btn-outline-warning" for="rsvp-car">
                      <i class="bi bi-car-front-fill me-1"></i>Bringing My Car
                    </label>

                    <input
                      id="rsvp-spec"
                      v-model="attendType"
                      type="radio"
                      class="btn-check"
                      value="spectating"
                    />
                    <label class="btn btn-sm btn-outline-warning" for="rsvp-spec">
                      <i class="bi bi-cup-hot me-1"></i>Just Coffee
                    </label>
                  </div>
                </div>

                <div v-if="attendType === 'bringing_car'" class="mb-3">
                  <label for="rsvp-make" class="form-label small fw-semibold">
                    Select Car Make (NHTSA + AU/MY Registry)
                  </label>
                  <select id="rsvp-make" v-model="selectedMake" class="form-select form-select-sm mb-2">
                    <option value="">-- Choose Make --</option>
                    <option v-for="mk in POPULAR_CAR_MAKES" :key="mk" :value="mk">{{ mk }}</option>
                  </select>

                  <label for="rsvp-model" class="form-label small fw-semibold">Model</label>
                  <select id="rsvp-model" v-model="selectedModel" class="form-select form-select-sm mb-2">
                    <option v-for="mdl in availableModels" :key="mdl" :value="mdl">{{ mdl }}</option>
                  </select>

                  <label for="rsvp-custom" class="form-label small fw-semibold">
                    Or type custom year &amp; build spec
                  </label>
                  <input
                    id="rsvp-custom"
                    v-model="customCarText"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="e.g. 1998 Nissan Stagea 260RS"
                  />
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-cc-primary cc-pill-btn">
                    {{ myRsvp ? 'Update Roll-Call RSVP' : 'Confirm Roll-Call Spot' }}
                  </button>
                  <button
                    v-if="myRsvp"
                    type="button"
                    class="btn btn-sm btn-outline-danger cc-pill-btn"
                    @click="handleCancelRsvp"
                  >
                    Cancel RSVP
                  </button>
                </div>
              </form>
            </template>

            <template v-else>
              <p class="small text-secondary mb-3">
                Sign in to RSVP, add your car to the parking bay Roll-Call, and unlock exact ramp
                instructions.
              </p>
              <router-link to="/login" class="btn btn-cc-primary cc-pill-btn w-100">
                Sign In to RSVP
              </router-link>
            </template>
          </div>

          <!-- Live Open-Meteo Cruising Weather Card -->
          <div v-if="weather" class="cc-tile mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="cc-bracket-label mb-0">[ CRUISING WEATHER ]</span>
              <span class="badge cc-badge-accent font-mono">{{ weather.source || 'Weather Telemetry' }}</span>
            </div>

            <div class="d-flex align-items-center gap-3 my-3">
              <div class="display-6" style="color: var(--cc-accent)">
                <i class="bi" :class="weather.icon"></i>
              </div>
              <div>
                <div class="h3 fw-bold mb-0 font-mono">{{ weather.tempC }}&deg;C</div>
                <div class="small fw-semibold">{{ weather.condition }}</div>
              </div>
            </div>

            <div class="row g-2 small mb-2">
              <div class="col-6">
                <div class="cc-panel p-2 text-center">
                  <div class="text-secondary">Rain Risk</div>
                  <div class="fw-bold font-mono">{{ weather.rainProbPercent }}%</div>
                </div>
              </div>
              <div class="col-6">
                <div class="cc-panel p-2 text-center">
                  <div class="text-secondary">Wind</div>
                  <div class="fw-bold font-mono">{{ weather.windSpeedKmh }} km/h</div>
                </div>
              </div>
            </div>

            <p class="small text-secondary mb-0">
              <i class="bi bi-info-circle me-1" style="color: var(--cc-accent)"></i>{{ weather.cruisingAdvice }}
            </p>
          </div>

          <!-- Venue Map Pin -->
          <EventMap
            :meets="[meet]"
            :center-lat="meet.latitude"
            :center-lng="meet.longitude"
            :zoom="14"
            height="270px"
            :show-region-controls="false"
          />
        </div>
      </div>
    </template>
  </div>
</template>
