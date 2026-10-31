<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMeetStore } from '../stores/meetStore'
import EventMap from '../components/EventMap.vue'
import EventCalendar from '../components/EventCalendar.vue'
import { MEET_VIBES } from '../data/seedData'

const meetStore = useMeetStore()
const activeTab = ref('split') // 'map' | 'calendar' | 'split'
const selectedRegion = ref('All')
const selectedVibe = ref('All')
const searchQuery = ref('')
const selectedMeet = ref(null)

const allMeets = ref([])

const filteredMeets = computed(() =>
  allMeets.value.filter((m) => {
    if (selectedRegion.value === 'Australia' && m.region !== 'Australia') return false
    if (selectedRegion.value === 'Malaysia' && m.region !== 'Malaysia') return false
    if (selectedRegion.value === 'Kuching' && !`${m.cafe_name} ${m.address}`.toLowerCase().includes('kuching') && !`${m.cafe_name} ${m.address}`.toLowerCase().includes('sarawak')) return false
    if (selectedRegion.value === 'KualaLumpur' && (m.region !== 'Malaysia' || `${m.cafe_name} ${m.address}`.toLowerCase().includes('kuching'))) return false
    if (selectedVibe.value !== 'All' && m.vibe !== selectedVibe.value) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const hay = `${m.title} ${m.cafe_name} ${m.address} ${m.vibe}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
)

function handleSelectMeet(meet) {
  selectedMeet.value = meet
}

function handleRegionFromMap(regionKey) {
  selectedRegion.value = regionKey
}

onMounted(async () => {
  const res = await meetStore.fetchMeets({ limit: 250 })
  allMeets.value = res.data || []
  selectedMeet.value = allMeets.value[0] || null
})
</script>

<template>
  <div class="container">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div>
        <div class="cc-bracket-label">[ 03 // GEOSPATIAL &amp; SCHEDULE RADAR ]</div>
        <h1 class="h2 fw-bold mb-1">Interactive Cafe Map &amp; Meet Calendar</h1>
        <p class="text-secondary small mb-0">
          Explore {{ allMeets.length }}+ Melbourne, Kuala Lumpur, Penang, and Kuching coffee meets on
          OpenStreetMap / CartoDB retina maps or FullCalendar schedule view.
        </p>
      </div>

      <div class="btn-group" role="group" aria-label="Switch between Map, Calendar, and Split View">
        <button
          type="button"
          class="btn btn-sm rounded-start-pill px-3"
          :class="activeTab === 'map' ? 'btn-cc-primary' : 'btn-cc-outline'"
          @click="activeTab = 'map'"
        >
          <i class="bi bi-geo-alt-fill me-1"></i>Map Only
        </button>
        <button
          type="button"
          class="btn btn-sm px-3"
          :class="activeTab === 'calendar' ? 'btn-cc-primary' : 'btn-cc-outline'"
          @click="activeTab = 'calendar'"
        >
          <i class="bi bi-calendar3 me-1"></i>Calendar Only
        </button>
        <button
          type="button"
          class="btn btn-sm rounded-end-pill px-3"
          :class="activeTab === 'split' ? 'btn-cc-primary' : 'btn-cc-outline'"
          @click="activeTab = 'split'"
        >
          <i class="bi bi-layout-split me-1"></i>Split Radar
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="cc-tile p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
      <div class="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
        <div class="input-group input-group-sm" style="max-width: 280px">
          <span class="input-group-text bg-transparent border-end-0">
            <i class="bi bi-search" style="color: var(--cc-accent)"></i>
          </span>
          <input
            v-model="searchQuery"
            type="search"
            class="form-control border-start-0"
            placeholder="Filter cafe, suburb, or title..."
            aria-label="Filter map meets"
          />
        </div>

        <label for="exp-region" class="small fw-semibold ms-1">Region:</label>
        <select id="exp-region" v-model="selectedRegion" class="form-select form-select-sm w-auto rounded-pill">
          <option value="All">All Regions ({{ allMeets.length }})</option>
          <option value="Australia">Melbourne &amp; Victoria (AU)</option>
          <option value="Malaysia">All Malaysia (MY)</option>
          <option value="KualaLumpur">Klang Valley / KL</option>
          <option value="Kuching">Kuching, Sarawak</option>
        </select>

        <label for="exp-vibe" class="small fw-semibold ms-1">Vibe:</label>
        <select id="exp-vibe" v-model="selectedVibe" class="form-select form-select-sm w-auto rounded-pill">
          <option value="All">All Vibes</option>
          <option v-for="v in MEET_VIBES" :key="v.slug" :value="v.name">{{ v.name }}</option>
        </select>
      </div>

      <span class="badge cc-badge-accent font-mono px-3 py-2">
        {{ filteredMeets.length }} Pinned Coffee Meets
      </span>
    </div>

    <!-- Views Rendering -->
    <div v-if="activeTab === 'split'" class="row g-4">
      <div class="col-lg-6">
        <EventMap
          :meets="filteredMeets"
          :initial-region="selectedRegion"
          height="520px"
          @select-meet="handleSelectMeet"
          @region-change="handleRegionFromMap"
        />
      </div>
      <div class="col-lg-6">
        <EventCalendar :meets="filteredMeets" />
      </div>

      <!-- Spotlight Banner under Split View -->
      <div v-if="selectedMeet" class="col-12">
        <div class="cc-tile">
          <div class="row g-3 align-items-center">
            <div class="col-md-3">
              <img
                :src="selectedMeet.image"
                :alt="selectedMeet.title"
                class="w-100 rounded-3"
                style="height: 140px; object-fit: cover"
              />
            </div>
            <div class="col-md-6">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge cc-badge-accent font-mono">{{ selectedMeet.region }}</span>
                <span class="badge text-bg-dark font-mono">{{ selectedMeet.vibe }}</span>
              </div>
              <h2 class="h5 fw-bold mb-1">{{ selectedMeet.title }}</h2>
              <p class="small text-secondary mb-1">
                <i class="bi bi-cup-hot-fill me-1" style="color: var(--cc-accent)"></i>{{ selectedMeet.cafe_name }} &mdash; {{ selectedMeet.address }}
              </p>
              <div class="small font-mono text-secondary">
                <i class="bi bi-calendar-event me-1" style="color: var(--cc-accent)"></i>{{ selectedMeet.meet_datetime }} &middot;
                🚗 {{ selectedMeet.rsvp_count || 0 }} / {{ selectedMeet.capacity || 60 }} in Roll-Call
              </div>
            </div>
            <div class="col-md-3 text-md-end">
              <router-link :to="`/meets/${selectedMeet.id}`" class="btn btn-cc-primary cc-pill-btn">
                Inspect Meet <i class="bi bi-arrow-up-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="row g-4">
      <div :class="selectedMeet ? 'col-lg-8' : 'col-12'">
        <div v-if="activeTab === 'map'">
          <EventMap
            :meets="filteredMeets"
            :initial-region="selectedRegion"
            height="520px"
            @select-meet="handleSelectMeet"
            @region-change="handleRegionFromMap"
          />
        </div>

        <div v-if="activeTab === 'calendar'">
          <EventCalendar :meets="filteredMeets" />
        </div>
      </div>

      <!-- Selected Meet Spotlight Sidebar -->
      <div v-if="selectedMeet" class="col-lg-4">
        <div class="cc-tile sticky-lg-top" style="top: 96px">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="cc-bracket-label mb-0">[ PINNED SPOTLIGHT ]</span>
            <span class="badge cc-badge-accent font-mono">{{ selectedMeet.region }}</span>
          </div>

          <img
            :src="selectedMeet.image"
            :alt="selectedMeet.title"
            class="w-100 rounded-4 mb-3"
            style="height: 175px; object-fit: cover"
          />

          <span class="badge text-bg-dark mb-2">{{ selectedMeet.vibe }}</span>
          <h2 class="h5 fw-bold mb-2">{{ selectedMeet.title }}</h2>
          <p class="small text-secondary mb-3">{{ selectedMeet.description }}</p>

          <ul class="list-unstyled small mb-3 d-flex flex-column gap-2">
            <li>
              <i class="bi bi-cup-hot-fill me-2" style="color: var(--cc-accent)"></i>
              <strong>{{ selectedMeet.cafe_name }}</strong>
              <div class="text-secondary ms-4">{{ selectedMeet.address }}</div>
            </li>
            <li class="font-mono">
              <i class="bi bi-calendar-event me-2" style="color: var(--cc-accent)"></i>
              {{ selectedMeet.meet_datetime }}
            </li>
            <li class="font-mono">
              <i class="bi bi-geo-alt me-2" style="color: var(--cc-accent)"></i>
              GPS: {{ selectedMeet.latitude }}, {{ selectedMeet.longitude }}
            </li>
          </ul>

          <div class="mb-3">
            <div class="d-flex justify-content-between small mb-1">
              <span class="text-secondary">Parking Bay Roll-Call</span>
              <span class="font-mono fw-bold">
                {{ selectedMeet.rsvp_count || 0 }} / {{ selectedMeet.capacity || 60 }}
              </span>
            </div>
            <div class="progress" style="height: 8px">
              <div
                class="progress-bar"
                style="background-color: var(--cc-accent)"
                :style="{
                  width: `${Math.min(100, Math.round(((selectedMeet.rsvp_count || 0) / (selectedMeet.capacity || 60)) * 100))}%`
                }"
              ></div>
            </div>
          </div>

          <router-link :to="`/meets/${selectedMeet.id}`" class="btn btn-cc-primary cc-pill-btn w-100">
            Inspect Full Meet &amp; Roll-Call <i class="bi bi-arrow-up-right ms-1"></i>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
