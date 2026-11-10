<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useThemeStore } from '../stores/themeStore'
import { useOfflineSync } from '../composables/useOfflineSync'
import { useToast } from '../composables/useToast'
import BrandLogo from './BrandLogo.vue'
import CommandSearchModal from './CommandSearchModal.vue'
import AppIcon from './AppIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { vaultCount, canInstallPwa, isInstalledPwa, promptPwaInstall } = useOfflineSync()
const { showToast } = useToast()

const mobileMenuOpen = ref(false)
const searchModalOpen = ref(false)
const installing = ref(false)

async function handleInstallApp() {
  if (installing.value) return
  installing.value = true
  try {
    if (canInstallPwa.value) {
      const outcome = await promptPwaInstall()
      if (outcome) {
        showToast('Roast & Redline installed successfully!', 'success')
      }
    } else {
      showToast(
        'To install Roast & Redline: click the Install icon in your browser address bar (top right) or browser menu (⋮) > "Install Roast & Redline".',
        'info'
      )
    }
  } catch (err) {
    showToast('Install prompt error: ' + (err.message || err), 'warning')
  } finally {
    installing.value = false
  }
}

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
    <nav class="navbar navbar-expand-xl cc-nav py-1" aria-label="Primary navigation">
      <div class="container-fluid px-1 px-xl-2">
        <router-link
          to="/"
          class="navbar-brand d-flex align-items-center text-decoration-none py-0 me-xl-2 flex-shrink-0"
          @click="closeMenu"
        >
          <BrandLogo :size="34" compact />
        </router-link>

        <div class="d-flex align-items-center gap-2 d-xl-none">
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
          <ul class="navbar-nav mx-xl-auto mb-2 mb-xl-0">
            <li class="nav-item">
              <router-link to="/" class="nav-link" @click="closeMenu">
                <AppIcon name="home" class="me-1" />Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/meets" class="nav-link" @click="closeMenu">
                <AppIcon name="meets" class="me-1" />Meets
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/meet-picks" class="nav-link" @click="closeMenu">
                <i class="bi bi-stars me-1" style="color: var(--cc-accent)"></i>Smart Picks
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/configurator" class="nav-link" @click="closeMenu">
                <i class="bi bi-box me-1" style="color: var(--cc-accent)"></i>3D Lab
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/feed" class="nav-link" @click="closeMenu">
                <AppIcon name="spotting" class="me-1" />Spotting
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/map" class="nav-link" @click="closeMenu">
                <AppIcon name="map" class="me-1" />Map &amp; Calendar
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/insights" class="nav-link" @click="closeMenu">
                <AppIcon name="insights" class="me-1" />Insights
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/saved" class="nav-link" @click="closeMenu">
                <AppIcon name="vault" class="me-1" />Vault
                <span v-if="vaultCount > 0" class="badge rounded-pill text-bg-warning text-dark ms-1">
                  {{ vaultCount }}
                </span>
              </router-link>
            </li>
            <li v-if="!isInstalledPwa" class="nav-item d-sm-none">
              <button
                type="button"
                class="nav-link btn btn-link text-start w-100 border-0 bg-transparent"
                @click="handleInstallApp(); closeMenu();"
              >
                <AppIcon name="download" class="me-1" style="color: var(--cc-accent)" />Install App (PWA)
              </button>
            </li>
          </ul>

          <div class="cc-nav-actions d-flex flex-wrap flex-xl-nowrap align-items-center gap-1 mt-2 mt-xl-0 ms-xl-2 flex-shrink-0">
            <!-- Ctrl+K Command Search Trigger -->
            <button
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill d-none d-xl-inline-flex align-items-center gap-1 px-2 text-nowrap"
              title="Quick Search (Ctrl+K)"
              @click="searchModalOpen = true"
            >
              <AppIcon name="search" style="color: var(--cc-accent)" />
              <span class="small d-none d-xxl-inline">Search</span>
              <kbd class="font-mono small bg-transparent border rounded px-1 d-none d-xxl-inline" style="font-size: 0.65rem; color: var(--cc-text); border-color: var(--cc-border);">Ctrl K</kbd>
            </button>

            <!-- PWA Install Button -->
            <button
              v-if="!isInstalledPwa"
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill d-none d-sm-inline-flex align-items-center gap-1 px-2 text-nowrap"
              title="Install Roast & Redline as an App"
              :disabled="installing"
              @click="handleInstallApp"
            >
              <AppIcon name="download" style="color: var(--cc-accent)" />
              <span class="small d-none d-xxl-inline">{{ canInstallPwa ? 'Install' : 'App' }}</span>
            </button>

            <!-- Theme toggle button -->
            <button
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill px-2"
              :aria-label="themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'"
              @click="themeStore.toggleTheme()"
            >
              <AppIcon :name="themeStore.isDark ? 'sun' : 'moon'" :class="themeStore.isDark ? 'text-warning' : ''" />
            </button>

            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/meets/new"
                class="btn btn-sm btn-cc-primary rounded-pill px-2 px-xxl-3 text-nowrap"
                @click="closeMenu"
              >
                <AppIcon name="plus" class="me-1" />Host Meet
              </router-link>

              <router-link
                to="/garage"
                class="btn btn-sm btn-cc-outline rounded-pill d-inline-flex align-items-center gap-1 px-2 text-nowrap"
                @click="closeMenu"
              >
                <AppIcon name="garage" style="color: var(--cc-accent)" />
                <span class="fw-semibold">{{ authStore.user?.name?.split(' ')[0] }}</span>
                <span v-if="authStore.isAdmin" class="badge rounded-pill text-bg-danger" style="font-size: 0.68rem; padding: 0.2em 0.45em">Admin</span>
              </router-link>

              <button
                type="button"
                class="btn btn-sm btn-outline-danger rounded-pill px-2"
                aria-label="Sign out"
                title="Sign out"
                @click="handleLogout"
              >
                <AppIcon name="logout" />
              </button>
            </template>

            <template v-else>
              <router-link to="/login" class="btn btn-sm btn-cc-outline rounded-pill px-2 px-xxl-3 text-nowrap" @click="closeMenu">
                Sign In
              </router-link>
              <router-link to="/register" class="btn btn-sm btn-cc-primary rounded-pill px-2 px-xxl-3 text-nowrap" @click="closeMenu">
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
