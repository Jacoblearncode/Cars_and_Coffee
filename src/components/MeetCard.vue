<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useOfflineSync } from '../composables/useOfflineSync'
import { fetchMeetWeather } from '../services/externalApis'

const props = defineProps({
  meet: { type: Object, required: true },
  showDistance: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-like', 'toggle-offline'])

const authStore = useAuthStore()
const { isMeetSavedOffline, toggleSaveMeetOffline } = useOfflineSync()

const weather = ref(null)

const isLiked = computed(() => {
  if (!authStore.user || !Array.isArray(props.meet.liked_by)) return false
  return props.meet.liked_by.includes(Number(authStore.user.id))
})

const isPinnedOffline = computed(() => isMeetSavedOffline(props.meet.id))

const formattedDate = computed(() => {
  const raw = props.meet.meet_datetime
  if (!raw) return 'Upcoming Weekend'
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
})

const dateParts = computed(() => {
  const dt = new Date(String(props.meet.meet_datetime || '').replace(' ', 'T'))
  if (Number.isNaN(dt.getTime())) return null
  return { day: dt.getDate(), mon: dt.toLocaleDateString('en-AU', { month: 'short' }) }
})

const capacityPercent = computed(() => {
  const cap = Number(props.meet.capacity) || 60
  const cur = Number(props.meet.rsvp_count) || 0
  return Math.min(100, Math.round((cur / cap) * 100))
})

function handleOfflineClick() {
  const saved = toggleSaveMeetOffline(props.meet)
  emit('toggle-offline', { meet: props.meet, saved })
}

onMounted(async () => {
  if (props.meet.latitude && props.meet.longitude) {
    weather.value = await fetchMeetWeather(
      props.meet.latitude,
      props.meet.longitude,
      props.meet.region
    )
  }
})
</script>

<template>
  <article class="cc-card cc-card-hover cc-meet h-100 d-flex flex-column overflow-hidden">
    <div class="position-relative" style="height: 195px; overflow: hidden">
      <img
        :src="meet.image || '/meet-hero.jpg'"
        :alt="meet.title"
        class="w-100 h-100"
        style="object-fit: cover"
        loading="lazy"
      />
      <div
        class="position-absolute top-0 start-0 end-0 p-2 d-flex justify-content-between align-items-start"
        style="background: linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 100%)"
      >
        <div class="d-flex flex-wrap gap-1">
          <span class="badge text-bg-dark bg-opacity-75">
            <i class="bi bi-cup-hot-fill text-warning me-1"></i>{{ meet.vibe }}
          </span>
          <span class="badge text-bg-secondary bg-opacity-75">
            <i class="bi bi-globe-asia-australia me-1"></i>{{ meet.region }}
          </span>
        </div>

        <button
          type="button"
          class="btn btn-sm rounded-circle border-0"
          :class="isPinnedOffline ? 'btn-warning text-dark' : 'btn-dark bg-opacity-75 text-white'"
          :aria-label="isPinnedOffline ? 'Remove meet from offline vault' : 'Save meet for offline access'"
          :title="isPinnedOffline ? 'Saved in Offline Vault' : 'Pin to Offline Vault'"
          @click.stop="handleOfflineClick"
        >
          <i class="bi" :class="isPinnedOffline ? 'bi-cloud-check-fill' : 'bi-cloud-arrow-down'"></i>
        </button>
      </div>

      <!-- Live Open-Meteo Cruising Weather Overlay Pill -->
      <div
        v-if="weather"
        class="position-absolute bottom-0 start-0 m-2"
      >
        <span class="weather-pill" :class="weather.badgeClass">
          <i class="bi" :class="weather.icon"></i>
          <span>{{ weather.tempC }}&deg;C &middot; {{ weather.rainProbPercent }}% Rain</span>
        </span>
      </div>
    </div>

    <div class="p-3 d-flex flex-column flex-grow-1">
      <div class="d-flex justify-content-between align-items-center small text-secondary mb-1">
        <span class="d-inline-flex align-items-center gap-2">
          <span v-if="dateParts" class="cc-date-chip"><strong>{{ dateParts.day }}</strong><span>{{ dateParts.mon }}</span></span>
          {{ formattedDate }}
        </span>
        <span v-if="showDistance && meet.distance_km !== undefined" class="font-mono">
          <i class="bi bi-signpost-2 me-1"></i>{{ meet.distance_km }} km
        </span>
      </div>

      <h3 class="h5 fw-bold mb-1">
        <router-link :to="`/meets/${meet.id}`" class="text-reset text-decoration-none">
          {{ meet.title }}
        </router-link>
      </h3>

      <p class="small text-secondary mb-2">
        <i class="bi bi-shop text-warning me-1"></i>
        <strong>{{ meet.cafe_name }}</strong> &mdash; {{ meet.address }}
      </p>

      <p class="small text-secondary flex-grow-1 mb-3" style=" display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
        {{ meet.description }}
      </p>

      <!-- Car Roll-Call & Capacity Bar -->
      <div class="mb-3">
        <div class="d-flex justify-content-between small mb-1">
          <span>
            <i class="bi bi-car-front-fill text-warning me-1"></i>
            <strong>{{ meet.rsvp_count || 0 }}</strong> / {{ meet.capacity || 60 }} Spots
            <span class="text-secondary">({{ meet.cars_bringing_count || 0 }} cars in roll-call)</span>
          </span>
          <span class="font-mono small text-secondary">{{ capacityPercent }}%</span>
        </div>
        <div class="progress" style="height: 6px" role="progressbar" :aria-valuenow="capacityPercent" aria-valuemin="0" aria-valuemax="100">
          <div
            class="progress-bar bg-warning"
            :style="{ width: `${capacityPercent}%` }"
          ></div>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center pt-2 border-top">
        <button
          type="button"
          class="btn btn-sm d-inline-flex align-items-center gap-1"
          :class="isLiked ? 'btn-danger' : 'btn-cc-outline'"
          :aria-label="isLiked ? `Unlike ${meet.title}` : `Like ${meet.title}`"
          @click="emit('toggle-like', meet)"
        >
          <i class="bi" :class="isLiked ? 'bi-heart-fill' : 'bi-heart'"></i>
          <span>{{ meet.likes_count || 0 }}</span>
        </button>

        <router-link :to="`/meets/${meet.id}`" class="btn btn-sm btn-cc-primary rounded-pill px-3">
          View Roll-Call <i class="bi bi-arrow-right ms-1"></i>
        </router-link>
      </div>
    </div>
  </article>
</template>
