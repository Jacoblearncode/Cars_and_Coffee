<script setup>
import { computed, ref } from 'vue'
import { getApiEngineStatus } from '../services/api'
import { useOfflineSync } from '../composables/useOfflineSync'
import { useToast } from '../composables/useToast'
import BrandLogo from './BrandLogo.vue'

const engineInfo = computed(() => getApiEngineStatus())
const { canInstallPwa, isInstalledPwa, promptPwaInstall, savedMeets } = useOfflineSync()
const { showToast } = useToast()
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
        'To install Roast & Redline: click the Install icon in your browser address bar, or open the browser menu (⋮) and select "Install Roast & Redline".',
        'info'
      )
    }
  } catch (err) {
    showToast('The install prompt could not open: ' + (err.message || err), 'warning')
  } finally {
    installing.value = false
  }
}
</script>

<template>
  <footer class="border-top py-5 mt-5" style="background-color: var(--cc-surface)">
    <div class="container">
      <div class="row g-4 align-items-start">
        <div class="col-md-5">
          <div class="mb-3">
            <BrandLogo :size="38" />
          </div>
          <p class="small text-secondary mb-3" style="max-width: 400px">
            Community-first car meets, 108+ weekend coffee runs, live cruising telemetry, and
            social car spotting across Melbourne &amp; Malaysia.
          </p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <span class="badge cc-badge-accent font-mono">
              <i class="bi bi-database-check me-1"></i>{{ engineInfo.label }}
            </span>
            <span class="badge text-bg-dark font-mono">
              <i class="bi bi-bookmark me-1"></i>{{ savedMeets.length }} {{ savedMeets.length === 1 ? 'meet' : 'meets' }} saved offline
            </span>
          </div>

          <!-- PWA Install Action -->
          <div v-if="!isInstalledPwa" class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-cc-primary cc-pill-btn d-inline-flex align-items-center gap-2"
              :disabled="installing"
              @click="handleInstallApp"
            >
              <i class="bi bi-download"></i>
              <span>{{ installing ? 'Opening install prompt…' : 'Install Roast & Redline (PWA)' }}</span>
            </button>
          </div>
          <span v-else class="badge text-bg-success rounded-pill px-3 py-2">
            <i class="bi bi-phone-fill me-1"></i>PWA Installed
          </span>
        </div>

        <div class="col-6 col-md-3">
          <div class="cc-bracket-label mb-2">[ DIRECTORY ]</div>
          <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
            <li><router-link to="/meets" class="text-secondary text-decoration-none">Browse 108+ Meets</router-link></li>
            <li><router-link to="/feed" class="text-secondary text-decoration-none">Spotting &amp; Build Feed</router-link></li>
            <li><router-link to="/map" class="text-secondary text-decoration-none">Interactive Map &amp; Split Radar</router-link></li>
            <li><router-link to="/insights" class="text-secondary text-decoration-none">Community Insights &amp; Stats</router-link></li>
          </ul>
        </div>

        <div class="col-6 col-md-4">
          <div class="cc-bracket-label mb-2">[ DRIVER HUB ]</div>
          <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
            <li><router-link to="/meets/new" class="text-secondary text-decoration-none">Host a Meet (Event Auto-Fill)</router-link></li>
            <li><router-link to="/saved" class="text-secondary text-decoration-none">Saved Meets &amp; Offline Vault</router-link></li>
            <li><router-link to="/garage" class="text-secondary text-decoration-none">My Garage &amp; Vehicle Registry</router-link></li>
          </ul>
        </div>
      </div>

      <hr class="my-4 opacity-25" />

      <div class="d-flex flex-wrap justify-content-between align-items-center small text-secondary gap-2">
        <span>&copy; 2026 Roast &amp; Redline (Cars &amp; Coffee Community) — Swinburne COS30043 Project</span>
        <span class="font-mono" style="font-size: 0.75rem">
          Vue 3 · Pinia · Leaflet OSM/Carto · Open-Meteo · Nominatim · NHTSA · Workbox PWA
        </span>
      </div>
    </div>
  </footer>
</template>
