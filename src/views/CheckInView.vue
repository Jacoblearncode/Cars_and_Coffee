<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetStore } from '../stores/meetStore'
import { useToast } from '../composables/useToast'
import { useCheckInScanner, parseCheckInPayload } from '../composables/useCheckIn'

const route = useRoute()
const router = useRouter()
const meetStore = useMeetStore()
const { showToast } = useToast()

// idle -> submitting -> success | error
const status = ref('idle')
const message = ref('')
const checkedInMeet = ref(null)
const alreadyDone = ref(false)
const pasted = ref('')

const { videoEl, scanning, error: scanError, supported, start: startScan, stop: stopScan } =
  useCheckInScanner(handleScanned)

const myCar = computed(() => {
  const rsvps = checkedInMeet.value && checkedInMeet.value.rsvps
  if (!rsvps) return ''
  const mine = rsvps.find((r) => r.checked_in_at && Number(r.user_id) === Number(authUserId()))
  return mine ? mine.car_brought : ''
})

function authUserId() {
  try {
    const token = localStorage.getItem('cars_and_coffee_jwt_token')
    return token ? JSON.parse(atob(token.split('.')[1])).id : null
  } catch {
    return null
  }
}

async function submit({ meetId, token }) {
  status.value = 'submitting'
  message.value = ''
  try {
    const res = await meetStore.checkInToMeet(meetId, { token })
    checkedInMeet.value = res.meet
    alreadyDone.value = Boolean(res.already_checked_in)
    status.value = 'success'
    showToast(alreadyDone.value ? 'You were already checked in.' : 'You are checked in. Enjoy the meet!', 'success')
  } catch (err) {
    status.value = 'error'
    message.value = err.message || 'Check-in failed.'
  }
}

function handleScanned(payload) {
  submit(payload)
}

function submitPasted() {
  const payload = parseCheckInPayload(pasted.value)
  if (!payload) {
    status.value = 'error'
    message.value = 'That does not look like a check-in link or code.'
    return
  }
  submit(payload)
}

function reset() {
  status.value = 'idle'
  message.value = ''
  pasted.value = ''
}

onMounted(() => {
  // Arrived from a QR scan with the native camera app: ?m=<meetId>&t=<token>
  const meetId = Number(route.query.m)
  const token = route.query.t
  if (meetId && token) {
    submit({ meetId, token: String(token) })
    // Remove the token from the address bar so it isn't left in history
    router.replace({ path: '/checkin', query: { m: meetId } })
  }
})
</script>

<template>
  <main class="container py-5" style="max-width: 560px">
    <div class="cc-tile p-4">
      <div class="cc-bracket-label">[ ARRIVAL CHECK-IN ]</div>
      <h1 class="h4 fw-bold mb-3">Check In to the Meet</h1>

      <div v-if="status === 'submitting'" class="text-center py-4" role="status">
        <div class="spinner-border text-warning" aria-hidden="true"></div>
        <p class="small text-secondary mt-2 mb-0">Checking you in...</p>
      </div>

      <div v-else-if="status === 'success'" class="text-center py-3" role="status">
        <i class="bi bi-check-circle-fill text-success display-3" aria-hidden="true"></i>
        <h2 class="h5 fw-bold mt-3">{{ alreadyDone ? "You're already in" : "You're checked in!" }}</h2>
        <p v-if="checkedInMeet" class="text-secondary mb-1">{{ checkedInMeet.title }}</p>
        <p v-if="myCar" class="small font-mono mb-3" style="color: var(--cc-accent)">
          <i class="bi bi-car-front-fill me-1"></i>{{ myCar }}
        </p>
        <router-link
          v-if="checkedInMeet"
          :to="`/meets/${checkedInMeet.id}`"
          class="btn btn-cc-primary cc-pill-btn"
        >
          View Roll-Call
        </router-link>
      </div>

      <template v-else>
        <div v-if="status === 'error'" class="alert alert-danger small" role="alert">
          {{ message }}
          <button type="button" class="btn btn-link btn-sm p-0 ms-1 align-baseline" @click="reset">
            Try again
          </button>
        </div>

        <p class="small text-secondary">
          Scan the QR code on the host's screen. You need to have RSVP'd to the meet first.
        </p>

        <div v-if="scanning" class="ratio ratio-1x1 rounded-3 overflow-hidden bg-black mb-3">
          <video ref="videoEl" playsinline muted aria-label="Camera preview for scanning the check-in code"></video>
        </div>

        <button
          v-if="!scanning"
          type="button"
          class="btn btn-cc-primary cc-pill-btn w-100 mb-2"
          :disabled="!supported"
          @click="startScan"
        >
          <i class="bi bi-camera me-1"></i>Scan QR Code
        </button>
        <button v-else type="button" class="btn btn-outline-secondary cc-pill-btn w-100 mb-2" @click="stopScan">
          Stop Camera
        </button>

        <p v-if="!supported" class="small text-secondary">
          This browser can't scan inside the page. Open your phone's camera app and point it at the
          QR code instead.
        </p>
        <p v-if="scanError" class="small text-danger" role="alert">{{ scanError }}</p>

        <hr class="my-3" />

        <label for="checkin-code" class="form-label small">Or paste the check-in link or code</label>
        <div class="input-group">
          <input
            id="checkin-code"
            v-model="pasted"
            type="text"
            class="form-control font-mono"
            placeholder="12.1767225600.abc..."
            autocomplete="off"
            @keyup.enter="submitPasted"
          />
          <button type="button" class="btn btn-cc-primary" :disabled="!pasted.trim()" @click="submitPasted">
            Check In
          </button>
        </div>
      </template>
    </div>
  </main>
</template>
