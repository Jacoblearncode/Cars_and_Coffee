<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import { useRealtimePulse } from '../composables/useRealtimePulse'
import MeetCard from '../components/MeetCard.vue'
import PaginationBar from '../components/PaginationBar.vue'
import { MEET_VIBES } from '../data/seedData'

const route = useRoute()
const router = useRouter()
const meetStore = useMeetStore()
const authStore = useAuthStore()
const { showToast } = useToast()
const { isLiveEnabled, liveEventsLog, toggleLiveStream, triggerPulseNow } = useRealtimePulse()

const searchQuery = ref(route.query.search || '')
const selectedVibe = ref(route.query.vibe || 'All')
const selectedRegion = ref(route.query.region || 'All')
const selectedStatus = ref('all')
const sortBy = ref('date')
const perPage = ref(12)
const currentPage = ref(1)

const userCoords = ref({ lat: -37.8136, lng: 144.9631, label: 'Melbourne CBD Default' })

async function loadMeets() {
  await meetStore.fetchMeets({
    search: searchQuery.value,
    vibe: selectedVibe.value,
    region: selectedRegion.value,
    status: selectedStatus.value,
    sort: sortBy.value,
    page: currentPage.value,
    limit: perPage.value,
    lat: userCoords.value.lat,
    lng: userCoords.value.lng
  })
}

async function handleLiveBurst() {
  await triggerPulseNow()
  await loadMeets()
}

function useBrowserLocation() {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    showToast('Geolocation is not supported in this browser.', 'warning')
    return
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userCoords.value = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: 'Your GPS Location'
      }
      sortBy.value = 'distance'
      currentPage.value = 1
      loadMeets()
      showToast('Sorting meets by GPS distance from your location.')
    },
    () => {
      showToast('Could not read GPS location — using default regional hub.', 'warning')
    }
  )
}

function resetFilters() {
  searchQuery.value = ''
  selectedVibe.value = 'All'
  selectedRegion.value = 'All'
  selectedStatus.value = 'all'
  sortBy.value = 'date'
  currentPage.value = 1
  loadMeets()
}

async function handleToggleLike(meet) {
  if (!authStore.isAuthenticated) {
    showToast('Please sign in to like meets.', 'warning')
    router.push('/login')
    return
  }
  await meetStore.toggleLike('meet', meet.id)
}

function handleOfflineNotify({ meet, saved }) {
  showToast(
    saved
      ? `Saved "${meet.title}" to your Offline Vault.`
      : `Removed "${meet.title}" from your Offline Vault.`
  )
}

function handlePageChange(newPage) {
  currentPage.value = newPage
  loadMeets()
}

watch([selectedVibe, selectedRegion, selectedStatus, sortBy, perPage], () => {
  currentPage.value = 1
  loadMeets()
})

onMounted(() => {
  loadMeets()
})
</script>

<template>
  <div class="container">
    <header class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3 cc-rise">
      <div>
        <span class="cc-bracket-label">[ 02 // COMMUNITY DIRECTORY &amp; LIVE DISPATCH ]</span>
        <h1 class="display-6 fw-bold mt-1 mb-1">
          Meets Board ({{ meetStore.pagination.total }} Listings)
        </h1>
        <p class="text-secondary small mb-0">
          Morning espresso runs, rooftop golden-hour meets, and JDM/Euro gatherings across Melbourne
          &amp; Malaysia.
        </p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button
          type="button"
          class="btn btn-sm btn-cc-outline rounded-pill"
          @click="handleLiveBurst"
        >
          <i class="bi bi-lightning-charge-fill text-warning me-1"></i>Simulate Live Event
        </button>
        <button type="button" class="btn btn-sm btn-cc-outline rounded-pill" @click="useBrowserLocation">
          <i class="bi bi-crosshair me-1 text-warning"></i>Near me
        </button>
        <router-link to="/meets/new" class="btn btn-sm btn-cc-primary rounded-pill">
          <i class="bi bi-plus-lg me-1"></i>Host a meet
        </router-link>
      </div>
    </header>

    <!-- Recent Real-Time Activity Strip -->
    <div
      v-if="liveEventsLog.length > 0"
      class="cc-tile py-2 px-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
    >
      <div class="d-flex align-items-center gap-2 overflow-hidden">
        <span
          class="badge rounded-pill font-mono"
          :class="isLiveEnabled ? 'text-bg-success' : 'text-bg-secondary'"
        >
          <i class="bi me-1" :class="isLiveEnabled ? 'bi-broadcast-pin' : 'bi-pause-fill'"></i>
          {{ isLiveEnabled ? 'REAL-TIME STREAM' : 'STREAM PAUSED' }}
        </span>
        <span class="badge cc-badge-accent font-mono">{{ liveEventsLog[0].badge }}</span>
        <router-link
          :to="liveEventsLog[0].targetRoute"
          class="small fw-semibold text-reset text-decoration-none text-truncate"
        >
          {{ liveEventsLog[0].text }}
        </router-link>
      </div>
      <button
        type="button"
        class="btn btn-sm btn-cc-outline rounded-pill py-0 px-2 font-mono"
        style="font-size: 0.72rem"
        @click="toggleLiveStream"
      >
        {{ isLiveEnabled ? 'Pause Auto-Stream' : 'Resume Auto-Stream' }}
      </button>
    </div>

    <div class="row g-4">
      <!-- Filter sidebar -->
      <aside class="col-lg-3" aria-label="Search and filter meets">
        <div class="cc-tile cc-filter-side">
          <label for="filter-search" class="form-label small fw-semibold">Search</label>
          <div class="input-group input-group-sm mb-3">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input
              id="filter-search"
              v-model="searchQuery"
              type="search"
              class="form-control"
              placeholder="St Kilda, Kuching, Bangsar, JDM..."
              @input="
                () => {
                  currentPage = 1
                  loadMeets()
                }
              "
            />
          </div>

          <div class="small fw-semibold mb-2">Vibe</div>
          <div class="d-flex flex-wrap gap-2 mb-3" role="group" aria-label="Meet vibe">
            <button type="button" class="cc-pill-btn" :class="{ active: selectedVibe === 'All' }" @click="selectedVibe = 'All'">All</button>
            <button
              v-for="v in MEET_VIBES"
              :key="v.slug"
              type="button"
              class="cc-pill-btn"
              :class="{ active: selectedVibe === v.name }"
              :aria-pressed="selectedVibe === v.name"
              @click="selectedVibe = v.name"
            >
              {{ v.name }}
            </button>
          </div>

          <label for="filter-region" class="form-label small fw-semibold">Region</label>
          <select id="filter-region" v-model="selectedRegion" class="form-select form-select-sm mb-3">
            <option value="All">All regions</option>
            <option value="Australia">Australia (VIC)</option>
            <option value="Malaysia">Malaysia (KL, Penang &amp; Sarawak)</option>
          </select>

          <label for="filter-status" class="form-label small fw-semibold">Status</label>
          <select id="filter-status" v-model="selectedStatus" class="form-select form-select-sm mb-3">
            <option value="all">Upcoming &amp; past</option>
            <option value="upcoming">Upcoming only</option>
            <option value="completed">Past meets</option>
          </select>

          <label for="filter-sort" class="form-label small fw-semibold">Sort by</label>
          <select id="filter-sort" v-model="sortBy" class="form-select form-select-sm mb-3">
            <option value="date">Date (soonest)</option>
            <option value="popular">Popularity (roll-call)</option>
            <option value="distance">GPS distance (km)</option>
          </select>

          <label for="filter-per-page" class="form-label small fw-semibold">Cards per page</label>
          <select id="filter-per-page" v-model.number="perPage" class="form-select form-select-sm mb-3">
            <option :value="9">9 per page</option>
            <option :value="12">12 per page</option>
            <option :value="24">24 per page</option>
            <option :value="48">48 per page</option>
          </select>

          <div class="d-flex justify-content-between align-items-center pt-2 border-top small text-secondary">
            <span><strong>{{ meetStore.meets.length }}</strong> of <strong>{{ meetStore.pagination.total }}</strong></span>
            <button type="button" class="btn btn-link btn-sm text-warning p-0 text-decoration-none" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
            </button>
          </div>
        </div>
      </aside>

      <!-- Results -->
      <div class="col-lg-9">
        <div v-if="meetStore.loading" class="text-center py-5">
          <div class="spinner-border text-warning" role="status"></div>
          <p class="small text-secondary mt-2">Brewing meet roster...</p>
        </div>

        <div v-else-if="meetStore.meets.length === 0" class="cc-tile p-5 text-center">
          <i class="bi bi-cup-hot display-5 text-warning"></i>
          <h2 class="h5 fw-bold mt-3">No meets match your filter</h2>
          <p class="small text-secondary mb-3">Clear your filters or host a new weekend meet.</p>
          <div class="d-flex justify-content-center gap-2">
            <button type="button" class="btn btn-sm btn-cc-outline rounded-pill" @click="resetFilters">Reset filters</button>
            <router-link to="/meets/new" class="btn btn-sm btn-cc-primary rounded-pill">Host a meet</router-link>
          </div>
        </div>

        <div v-else class="row g-4">
          <div v-for="m in meetStore.meets" :key="m.id" class="col-md-6 col-xl-4">
            <MeetCard
              :meet="m"
              :show-distance="sortBy === 'distance'"
              @toggle-like="handleToggleLike"
              @toggle-offline="handleOfflineNotify"
            />
          </div>
        </div>

        <PaginationBar
          :page="meetStore.pagination.page"
          :total-pages="meetStore.pagination.total_pages"
          :total="meetStore.pagination.total"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
