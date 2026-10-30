<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useOfflineSync } from '../composables/useOfflineSync'
import { useRealtimePulse } from '../composables/useRealtimePulse'
import BrandLogo from './BrandLogo.vue'
import CommandSearchModal from './CommandSearchModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { vaultCount, isOnline, canInstallPwa, promptPwaInstall } = useOfflineSync()
const { isLiveEnabled, toggleLiveStream, triggerPulseNow } = useRealtimePulse()

const mobileMenuOpen = ref(false)
const searchModalOpen = ref(false)

function closeMenu() {
  mobileMenuOpen.value = false
}

function handleLogout() {
  authStore.logout()
  closeMenu()
  router.push('/')
}

function handleGlobalShortcut(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchModalOpen.value = !searchModalOpen.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
})
</script>

<template>
  <header class="cc-nav-wrap">
    <nav class="navbar navbar-expand-lg cc-nav py-1" aria-label="Primary navigation">
      <div class="container-fluid px-2">
        <router-link
          to="/"
          class="navbar-brand d-flex align-items-center text-decoration-none py-0"
          @click="closeMenu"
        >
          <BrandLogo :size="36" compact />
        </router-link>

        <div class="d-flex align-items-center gap-2 d-lg-none">
          <button
            type="button"
            class="btn btn-sm btn-cc-outline rounded-pill px-2"
            aria-label="Search meets and cafes"
            @click="searchModalOpen = true"
          >
            <i class="bi bi-search"></i>
          </button>

          <button
            class="navbar-toggler border-0 p-1"
            type="button"
            :aria-expanded="mobileMenuOpen ? 'true' : 'false'"
            aria-label="Toggle navigation menu"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <i class="bi" :class="mobileMenuOpen ? 'bi-x-lg' : 'bi-list'" style="font-size: 1.5rem"></i>
          </button>
        </div>

        <div class="collapse navbar-collapse" :class="{ show: mobileMenuOpen }">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-1">
            <li class="nav-item">
              <router-link to="/" class="nav-link px-3" @click="closeMenu">
                <i class="bi bi-house-door me-1"></i>Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/meets" class="nav-link px-3" @click="closeMenu">
                <i class="bi bi-calendar2-event me-1"></i>Meets
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/feed" class="nav-link px-3" @click="closeMenu">
                <i class="bi bi-camera me-1"></i>Spotting
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/map" class="nav-link px-3" @click="closeMenu">
                <i class="bi bi-geo-alt me-1"></i>Map &amp; Calendar
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/insights" class="nav-link px-3" @click="closeMenu">
                <i class="bi bi-bar-chart-line me-1"></i>Insights
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/saved" class="nav-link px-3" @click="closeMenu">
                <i class="bi bi-cloud-arrow-down me-1"></i>Vault
                <span v-if="vaultCount > 0" class="badge rounded-pill text-bg-warning text-dark ms-1">
                  {{ vaultCount }}
                </span>
              </router-link>
            </li>
          </ul>

          <div class="d-flex flex-wrap align-items-center gap-2 mt-2 mt-lg-0">
            <!-- Ctrl+K Command Search Trigger -->
            <button
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill d-none d-lg-inline-flex align-items-center gap-2 px-3"
              title="Quick Search (Ctrl+K)"
              @click="searchModalOpen = true"
            >
              <i class="bi bi-search" style="color: var(--cc-accent)"></i>
              <span class="small">Search</span>
              <kbd class="font-mono small bg-transparent border rounded px-1" style="font-size: 0.66rem">Ctrl K</kbd>
            </button>

            <!-- Live Event Stream Pill -->
            <div class="btn-group btn-group-sm d-none d-xl-inline-flex" role="group" aria-label="Live community stream controls">
              <button
                type="button"
                class="btn btn-sm rounded-start-pill px-2"
                :class="isLiveEnabled ? 'btn-cc-outline text-success' : 'btn-cc-outline text-secondary'"
                :title="isLiveEnabled ? 'Live Real-Time Event Stream Active (Click to Pause)' : 'Live Stream Paused (Click to Resume)'"
                @click="toggleLiveStream"
              >
                <i class="bi" :class="isLiveEnabled ? 'bi-broadcast-pin' : 'bi-pause-circle'"></i>
                <span class="font-mono ms-1" style="font-size: 0.7rem">{{ isLiveEnabled ? 'LIVE' : 'PAUSED' }}</span>
              </button>
              <button
                type="button"
                class="btn btn-sm btn-cc-outline rounded-end-pill px-2"
                title="Simulate a new real-time meet or RSVP arriving right now"
                @click="triggerPulseNow"
              >
                <i class="bi bi-lightning-charge-fill text-warning"></i>
              </button>
            </div>

            <!-- PWA Install Button (when available) -->
            <button
              v-if="canInstallPwa"
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill d-none d-xxl-inline-flex align-items-center gap-1"
              title="Install Standalone PWA"
              @click="promptPwaInstall"
            >
              <i class="bi bi-download text-warning"></i>
              <span class="small">Install</span>
            </button>

            <!-- Connection status pill -->
            <span
              class="badge rounded-pill d-none d-xxl-inline-flex align-items-center gap-1 py-1 px-2"
              :class="isOnline ? 'text-bg-success bg-opacity-25 text-success' : 'text-bg-warning text-dark'"
              :title="isOnline ? 'Online — Connected' : 'Offline — Using LocalDB Cache'"
            >
              <i class="bi" :class="isOnline ? 'bi-wifi' : 'bi-wifi-off'"></i>
              {{ isOnline ? 'Online' : 'Offline' }}
            </span>

            <!-- Theme toggle button -->
            <button
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill"
              :aria-label="themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
              @click="themeStore.toggleTheme()"
            >
              <i class="bi" :class="themeStore.isDark ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'"></i>
            </button>

            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/meets/new"
                class="btn btn-sm btn-cc-primary rounded-pill px-3"
                @click="closeMenu"
              >
                <i class="bi bi-plus-lg me-1"></i>Host Meet
              </router-link>

              <router-link
                to="/garage"
                class="btn btn-sm btn-cc-outline rounded-pill d-flex align-items-center gap-1 px-3"
                @click="closeMenu"
              >
                <i class="bi bi-car-front-fill" style="color: var(--cc-accent)"></i>
                <span>{{ authStore.user?.name?.split(' ')[0] }}</span>
                <span v-if="authStore.isAdmin" class="badge text-bg-danger ms-1">Admin</span>
              </router-link>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger rounded-pill"
                aria-label="Sign out"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right"></i>
              </button>
            </template>

            <template v-else>
              <router-link to="/login" class="btn btn-sm btn-cc-outline rounded-pill px-3" @click="closeMenu">
                Sign In
              </router-link>
              <router-link to="/register" class="btn btn-sm btn-cc-primary rounded-pill px-3" @click="closeMenu">
                Join Club
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <CommandSearchModal :open="searchModalOpen" @close="searchModalOpen = false" />
  </header>
</template>
