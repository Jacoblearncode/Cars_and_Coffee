<script setup>
import { computed, onMounted } from 'vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ToastContainer from './components/ToastContainer.vue'
import { useThemeStore } from './stores/themeStore'
import { useOfflineSync } from './composables/useOfflineSync'
import { useSyncStore } from './stores/syncStore'

const themeStore = useThemeStore()
const { isOnline } = useOfflineSync()
const syncStore = useSyncStore()

const outboxCount = computed(() => syncStore.pendingCount)
const conflictCount = computed(() => syncStore.conflictCount)
const syncPendingOutbox = () => syncStore.flush()

onMounted(() => {
  themeStore.initThemeListeners()
  syncStore.init()
})
</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Offline / Out-of-Signal Status Banner -->
    <div
      v-if="!isOnline"
      class="bg-warning text-dark py-2 px-3 text-center small fw-semibold border-bottom"
      role="status"
    >
      <i class="bi bi-wifi-off me-1"></i>
      Offline / Out-of-Signal Mode Active — Reading from LocalDB &amp; queuing your RSVPs/posts ({{
        outboxCount
      }}
      queued) to sync when back in range.
    </div>
    <div
      v-else-if="outboxCount > 0"
      class="bg-info text-dark py-2 px-3 text-center small fw-semibold border-bottom d-flex justify-content-center align-items-center gap-2"
      role="status"
    >
      <span>
        <i class="bi bi-arrow-repeat me-1"></i>
        {{ outboxCount }} offline action(s) ready to sync with server.
      </span>
      <button class="btn btn-sm btn-dark py-0 px-2" :disabled="syncStore.syncing" @click="syncPendingOutbox">
        {{ syncStore.syncing ? 'Syncing…' : 'Sync Now' }}
      </button>
    </div>
    <div
      v-if="conflictCount > 0"
      class="bg-warning-subtle text-dark py-2 px-3 small border-bottom d-flex justify-content-center align-items-center gap-2 flex-wrap"
      role="status"
    >
      <span>
        <i class="bi bi-exclamation-triangle-fill me-1"></i>
        {{ conflictCount }} sync conflict(s) resolved: {{ syncStore.conflicts[0].message }}
      </span>
      <button class="btn btn-sm btn-outline-dark py-0 px-2" @click="syncStore.clearConflicts()">Dismiss</button>
    </div>

    <Navbar />

    <main id="main-content" class="flex-grow-1 py-4" tabindex="-1">
      <router-view />
    </main>

    <Footer />
    <ToastContainer />
  </div>
</template>
