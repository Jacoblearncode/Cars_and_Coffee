<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useSyncStore } from '../stores/syncStore'
import { useOfflineSync } from '../composables/useOfflineSync'
import { useToast } from '../composables/useToast'
import MeetCard from '../components/MeetCard.vue'

const meetStore = useMeetStore()
const authStore = useAuthStore()
const syncStore = useSyncStore()
const {
  savedMeets,
  isOnline,
  outboxQueue,
  lastSyncedAt,
  engineStatus,
  canInstallPwa,
  isInstalledPwa,
  promptPwaInstall,
  toggleSaveMeetOffline,
  removeOfflineMeet,
  clearOfflineVault,
  syncPendingOutbox
} = useOfflineSync()
const { showToast } = useToast()

const activeTab = ref('vault')
const allMeets = ref([])

const myRsvpedMeets = computed(() => {
  if (!authStore.user) return []
  const uid = Number(authStore.user.id)
  return allMeets.value.filter(
    (m) => Array.isArray(m.rsvps) && m.rsvps.some((r) => Number(r.user_id) === uid)
  )
})

const myLikedMeets = computed(() => {
  if (!authStore.user) return []
  const uid = Number(authStore.user.id)
  return allMeets.value.filter(
    (m) => Array.isArray(m.liked_by) && m.liked_by.includes(uid)
  )
})

async function refreshAllMeets() {
  const res = await meetStore.fetchMeets({ limit: 250 })
  allMeets.value = res.data || []
}

async function handleManualSync() {
  const res = await syncPendingOutbox()
  await refreshAllMeets()
  showToast(`Synced ${res.synced} queued action(s) with backend.`, 'success')
}

async function handleToggleLike(meet) {
  if (!authStore.isAuthenticated) {
    showToast('Please sign in to like meets.', 'warning')
    return
  }
  await meetStore.toggleLike('meet', meet.id)
  await refreshAllMeets()
}

function handleToggleOffline(meet) {
  const saved = toggleSaveMeetOffline(meet)
  showToast(
    saved
      ? `Saved "${meet.title}" to your PWA Offline Vault.`
      : `Removed "${meet.title}" from Offline Vault.`
  )
}

async function handleInstallApp() {
  if (canInstallPwa.value) {
    const installed = await promptPwaInstall()
    if (installed) {
      showToast('Roast & Redline PWA installed to your home screen!', 'success')
    }
  } else {
    showToast(
      'To install Roast & Redline: click the Install icon in your browser address bar (top right) or browser menu (⋮) > "Install Roast & Redline".',
      'info'
    )
  }
}

onMounted(async () => {
  await refreshAllMeets()
})
</script>

<template>
  <div class="container">
    <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
      <div>
        <div class="cc-bracket-label">[ 05 // SAVED MEETS &amp; OFFLINE ACCESS ]</div>
        <h1 class="h2 fw-bold mb-1">My Saved Meets &amp; Offline Sync</h1>
        <p class="text-secondary small mb-0">
          Access your pinned meets, cafe parking bay instructions, and saved offline changes even
          in underground carparks or mountain touge runs with zero reception.
        </p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <button
          v-if="!isInstalledPwa"
          type="button"
          class="btn btn-sm btn-cc-primary cc-pill-btn"
          @click="handleInstallApp"
        >
          <i class="bi bi-download me-1"></i>Install PWA App
        </button>
        <span v-else class="badge text-bg-success rounded-pill px-3 py-2">
          <i class="bi bi-phone-fill me-1"></i>Installed App
        </span>

        <div class="cc-tile py-2 px-3 d-flex align-items-center gap-3 small">
          <span>
            <i
              class="bi me-1"
              :class="isOnline ? 'bi-wifi text-success' : 'bi-wifi-off text-warning'"
            ></i>
            <strong>{{ engineStatus.label }}</strong>
          </span>
          <span class="badge cc-badge-accent font-mono">{{ syncStore.statusLabel }}</span>
          <button
            v-if="outboxQueue.length > 0"
            type="button"
            class="btn btn-sm btn-cc-primary rounded-pill py-0 px-3"
            :disabled="syncStore.syncing"
            @click="handleManualSync"
          >
            {{ syncStore.syncing ? 'Syncing…' : `Sync Changes (${outboxQueue.length})` }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sync Queue & Conflict Resolution Status Strip -->
    <div v-if="outboxQueue.length > 0 || syncStore.conflicts.length > 0" class="row g-3 mb-4">
      <div v-if="outboxQueue.length > 0" class="col-lg-6">
        <div class="cc-tile h-100">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="cc-bracket-label mb-0">[ PENDING CHANGES TO SYNC ({{ outboxQueue.length }}) ]</span>
            <button type="button" class="btn btn-sm btn-cc-primary rounded-pill" @click="handleManualSync">
              Sync Now
            </button>
          </div>
          <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
            <li
              v-for="item in outboxQueue"
              :key="item.id"
              class="cc-panel p-2 px-3 d-flex justify-content-between align-items-center"
            >
              <div>
                <span class="badge cc-badge-accent font-mono me-2">{{ item.method }}</span>
                <strong class="font-mono">{{ item.endpoint }}</strong>
                <span v-if="item.label" class="text-secondary ms-1">({{ item.label }})</span>
              </div>
              <span class="text-secondary font-mono" style="font-size: 0.72rem">{{ item.queued_at?.slice(11, 19) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="syncStore.conflicts.length > 0" class="col-lg-6">
        <div class="cc-tile h-100 border-warning">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="cc-bracket-label text-warning mb-0">
              [ SYNC CONFLICT NOTICES ({{ syncStore.conflicts.length }}) ]
            </span>
            <button type="button" class="btn btn-sm btn-outline-warning rounded-pill" @click="syncStore.clearConflicts()">
              Clear All
            </button>
          </div>
          <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
            <li
              v-for="c in syncStore.conflicts"
              :key="c.id"
              class="cc-panel p-2 px-3 d-flex justify-content-between align-items-start gap-2"
            >
              <div>
                <span class="badge text-bg-warning text-dark font-mono me-2">{{ c.resolution }}</span>
                <span>{{ c.message }}</span>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-link text-secondary p-0"
                @click="syncStore.dismissConflict(c.id)"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <ul class="nav nav-pills gap-2 mb-4" role="tablist">
      <li class="nav-item">
        <button
          type="button"
          class="btn btn-sm cc-pill-btn"
          :class="activeTab === 'vault' ? 'btn-cc-primary' : 'btn-cc-outline'"
          @click="activeTab = 'vault'"
        >
          <i class="bi bi-cloud-check-fill me-1"></i>Offline Vault ({{ savedMeets.length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          type="button"
          class="btn btn-sm cc-pill-btn"
          :class="activeTab === 'rsvps' ? 'btn-cc-primary' : 'btn-cc-outline'"
          @click="activeTab = 'rsvps'"
        >
          <i class="bi bi-car-front-fill me-1"></i>My Roll-Call RSVPs ({{ myRsvpedMeets.length }})
        </button>
      </li>
      <li class="nav-item">
        <button
          type="button"
          class="btn btn-sm cc-pill-btn"
          :class="activeTab === 'likes' ? 'btn-cc-primary' : 'btn-cc-outline'"
          @click="activeTab = 'likes'"
        >
          <i class="bi bi-heart-fill me-1"></i>Liked Meets ({{ myLikedMeets.length }})
        </button>
      </li>
    </ul>

    <!-- Tab 1: PWA Offline Vault -->
    <div v-if="activeTab === 'vault'">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <span class="small text-secondary">
          Pinned meets are saved to your device for offline access so full meet details,
          parking ramp notes, and GPS coordinates remain accessible even without mobile reception.
          <template v-if="lastSyncedAt"> Last synced at {{ lastSyncedAt }}.</template>
        </span>
        <button
          v-if="savedMeets.length > 0"
          type="button"
          class="btn btn-sm btn-outline-danger rounded-pill px-3"
          @click="clearOfflineVault"
        >
          Clear Vault
        </button>
      </div>

      <div v-if="savedMeets.length === 0" class="cc-tile p-5 text-center">
        <i class="bi bi-cloud-arrow-down display-6" style="color: var(--cc-accent)"></i>
        <h2 class="h5 fw-bold mt-3">Your Offline Vault is empty</h2>
        <p class="small text-secondary mb-3">
          Click the cloud pin icon on any meet card to cache its cafe coordinates, low-car parking
          ramp notes, and Roll-Call for zero-signal access.
        </p>
        <router-link to="/meets" class="btn btn-sm btn-cc-primary cc-pill-btn">Explore 108+ Meets</router-link>
      </div>

      <div v-else class="row g-3">
        <div v-for="item in savedMeets" :key="item.id" class="col-md-6">
          <div class="cc-tile h-100 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge cc-badge-accent font-mono">{{ item.vibe }} &middot; {{ item.region }}</span>
                <button
                  type="button"
                  class="btn btn-sm btn-link text-danger p-0"
                  aria-label="Remove from offline vault"
                  @click="removeOfflineMeet(item.id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
              <h3 class="h5 fw-bold mb-1">
                <router-link :to="`/meets/${item.id}`" class="text-reset text-decoration-none">
                  {{ item.title }}
                </router-link>
              </h3>
              <p class="small text-secondary mb-2">
                <i class="bi bi-cup-hot-fill me-1" style="color: var(--cc-accent)"></i>{{ item.cafe_name }} &mdash;
                {{ item.address }}
              </p>
              <div class="cc-panel p-2 px-3 small mb-3">
                <div><strong>Parking &amp; Ramp Note:</strong> {{ item.parking_note }}</div>
                <div class="font-mono text-secondary mt-1">
                  GPS: {{ item.latitude }}, {{ item.longitude }} &middot; {{ item.meet_datetime }}
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center pt-2 border-top small">
              <span class="text-success fw-semibold">
                <i class="bi bi-check-circle-fill me-1"></i>Snapshot Cached Offline
              </span>
              <router-link :to="`/meets/${item.id}`" class="btn btn-sm btn-cc-primary rounded-pill px-3">
                Open Snapshot <i class="bi bi-arrow-up-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: My RSVPs -->
    <div v-else-if="activeTab === 'rsvps'">
      <div v-if="myRsvpedMeets.length === 0" class="cc-tile p-5 text-center">
        <i class="bi bi-calendar2-check display-6" style="color: var(--cc-accent)"></i>
        <h2 class="h5 fw-bold mt-3">You haven't joined a Car Roll-Call yet</h2>
        <p class="small text-secondary mb-3">
          Browse upcoming weekend meets and RSVP with the car you're bringing.
        </p>
        <router-link to="/meets" class="btn btn-sm btn-cc-primary cc-pill-btn">Browse Meets</router-link>
      </div>
      <div v-else class="row g-4">
        <div v-for="m in myRsvpedMeets" :key="m.id" class="col-md-6 col-lg-4">
          <MeetCard :meet="m" @toggle-like="handleToggleLike" @toggle-offline="handleToggleOffline" />
        </div>
      </div>
    </div>

    <!-- Tab 3: Liked Meets -->
    <div v-else>
      <div v-if="myLikedMeets.length === 0" class="cc-tile p-5 text-center">
        <i class="bi bi-heart display-6" style="color: var(--cc-accent)"></i>
        <h2 class="h5 fw-bold mt-3">No liked meets yet</h2>
        <router-link to="/meets" class="btn btn-sm btn-cc-primary cc-pill-btn mt-2">Browse Meets</router-link>
      </div>
      <div v-else class="row g-4">
        <div v-for="m in myLikedMeets" :key="m.id" class="col-md-6 col-lg-4">
          <MeetCard :meet="m" @toggle-like="handleToggleLike" @toggle-offline="handleToggleOffline" />
        </div>
      </div>
    </div>
  </div>
</template>
