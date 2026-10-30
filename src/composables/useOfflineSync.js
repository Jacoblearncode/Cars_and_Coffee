/**
 * Cars & Coffee — PWA Offline Vault & Out-of-Signal Sync Composable (Jacob's Advanced Feature)
 *
 * Allows members to:
 * 1. Pin meets (with cafe address, parking notes, GPS coordinates, and Roll-Call) to an Offline Vault
 *    so they remain accessible at remote mountain passes or underground carparks with zero reception.
 * 2. Monitor real-time `navigator.onLine` status and automatically flush queued offline RSVPs/likes/posts
 *    via `flushOfflineOutbox()` as soon as signal returns.
 * 3. Install the app as a standalone PWA via `beforeinstallprompt`.
 */

import { ref, computed, getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { getOfflineOutbox, flushOfflineOutbox, getApiEngineStatus } from '../services/api'
import { QUEUE_CHANGED_EVENT } from '../services/syncQueue'
import { useSyncStore } from '../stores/syncStore'

const OFFLINE_VAULT_KEY = 'cars_and_coffee_offline_vault_v1'

const savedMeets = ref(loadVaultFromStorage())
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)
const outboxQueue = ref(getOfflineOutbox())
const lastSyncedAt = ref(null)
const deferredInstallPrompt = ref(null)
const isInstalledPwa = ref(
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(display-mode: standalone)').matches
    : false
)

function loadVaultFromStorage() {
  try {
    const raw = localStorage.getItem(OFFLINE_VAULT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistVault() {
  try {
    localStorage.setItem(OFFLINE_VAULT_KEY, JSON.stringify(savedMeets.value))
  } catch {
    // ignore quota errors
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt.value = e
  })
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt.value = null
    isInstalledPwa.value = true
  })
}

export function useOfflineSync() {
  function isMeetSavedOffline(meetId) {
    return savedMeets.value.some((m) => Number(m.id) === Number(meetId))
  }

  function getOfflineMeetById(meetId) {
    return savedMeets.value.find((m) => Number(m.id) === Number(meetId)) || null
  }

  function toggleSaveMeetOffline(meet) {
    if (!meet || !meet.id) return false
    const idx = savedMeets.value.findIndex((m) => Number(m.id) === Number(meet.id))
    if (idx >= 0) {
      savedMeets.value.splice(idx, 1)
      persistVault()
      return false
    }
    const snapshot = {
      id: Number(meet.id),
      title: meet.title,
      description: meet.description || 'Pinned offline meet snapshot.',
      vibe: meet.vibe,
      region: meet.region,
      cafe_name: meet.cafe_name,
      address: meet.address,
      parking_note: meet.parking_note,
      host_contact: meet.host_contact,
      host_name: meet.host_name || 'Community Host',
      host_car: meet.host_car || 'Enthusiast Ride',
      latitude: meet.latitude,
      longitude: meet.longitude,
      meet_datetime: meet.meet_datetime,
      end_datetime: meet.end_datetime || meet.meet_datetime,
      capacity: meet.capacity || 60,
      image: meet.image,
      rsvps: Array.isArray(meet.rsvps) ? meet.rsvps : [],
      rsvp_count: meet.rsvp_count || 0,
      cars_bringing_count: meet.cars_bringing_count || 0,
      likes_count: meet.likes_count || 0,
      liked_by: Array.isArray(meet.liked_by) ? meet.liked_by : [],
      comments: Array.isArray(meet.comments) ? meet.comments : [],
      status: meet.status || 'upcoming',
      saved_at: new Date().toISOString()
    }
    savedMeets.value.unshift(snapshot)
    persistVault()
    return true
  }

  function removeOfflineMeet(meetId) {
    savedMeets.value = savedMeets.value.filter((m) => Number(m.id) !== Number(meetId))
    persistVault()
  }

  function clearOfflineVault() {
    savedMeets.value = []
    persistVault()
  }

  async function promptPwaInstall() {
    if (!deferredInstallPrompt.value) return false
    deferredInstallPrompt.value.prompt()
    const choice = await deferredInstallPrompt.value.userChoice
    deferredInstallPrompt.value = null
    return choice?.outcome === 'accepted'
  }

  async function syncPendingOutbox() {
    outboxQueue.value = getOfflineOutbox()
    if (!isOnline.value || outboxQueue.value.length === 0) {
      return { synced: 0, remaining: outboxQueue.value.length, conflicts: [] }
    }
    let res
    try {
      res = await useSyncStore().flush()
    } catch {
      res = await flushOfflineOutbox()
    }
    outboxQueue.value = getOfflineOutbox()
    lastSyncedAt.value = new Date().toLocaleTimeString()
    return res
  }

  function refreshConnectionState() {
    isOnline.value = typeof navigator !== 'undefined' ? navigator.onLine : true
    outboxQueue.value = getOfflineOutbox()
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      if (typeof window !== 'undefined') {
        window.addEventListener('online', refreshConnectionState)
        window.addEventListener('offline', refreshConnectionState)
        window.addEventListener(QUEUE_CHANGED_EVENT, refreshConnectionState)
      }
    })

    onUnmounted(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', refreshConnectionState)
        window.removeEventListener('offline', refreshConnectionState)
        window.removeEventListener(QUEUE_CHANGED_EVENT, refreshConnectionState)
      }
    })
  }

  const vaultCount = computed(() => savedMeets.value.length)
  const outboxCount = computed(() => outboxQueue.value.length)
  const engineStatus = computed(() => getApiEngineStatus())
  const canInstallPwa = computed(() => Boolean(deferredInstallPrompt.value) && !isInstalledPwa.value)

  return {
    savedMeets,
    isOnline,
    outboxQueue,
    vaultCount,
    outboxCount,
    lastSyncedAt,
    engineStatus,
    canInstallPwa,
    isInstalledPwa,
    isMeetSavedOffline,
    getOfflineMeetById,
    toggleSaveMeetOffline,
    removeOfflineMeet,
    clearOfflineVault,
    promptPwaInstall,
    syncPendingOutbox,
    refreshConnectionState
  }
}
