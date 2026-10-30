<script setup>
import { getApiEngineStatus } from '../services/api'
import { computed } from 'vue'
import BrandLogo from './BrandLogo.vue'

const engineInfo = computed(() => getApiEngineStatus())
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
          <div class="d-flex flex-wrap gap-2">
            <span class="badge cc-badge-accent font-mono">
              <i class="bi bi-database-check me-1"></i>{{ engineInfo.label }}
            </span>
            <span class="badge text-bg-dark font-mono">PWA Offline Vault Ready</span>
          </div>
        </div>

        <div class="col-6 col-md-3">
          <div class="cc-bracket-label mb-2">[ DIRECTORY ]</div>
          <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
            <li><router-link to="/meets" class="text-secondary text-decoration-none">Browse 108+ Meets</router-link></li>
            <li><router-link to="/feed" class="text-secondary text-decoration-none">Spotting &amp; Build Feed</router-link></li>
            <li><router-link to="/map" class="text-secondary text-decoration-none">Interactive Map &amp; Split Radar</router-link></li>
            <li><router-link to="/insights" class="text-secondary text-decoration-none">Community Telemetry</router-link></li>
          </ul>
        </div>

        <div class="col-6 col-md-4">
          <div class="cc-bracket-label mb-2">[ PADDOCK &amp; APIs ]</div>
          <ul class="list-unstyled small mb-0 d-flex flex-column gap-2">
            <li><router-link to="/meets/new" class="text-secondary text-decoration-none">Host a Meet (Smart Link Importer)</router-link></li>
            <li><router-link to="/saved" class="text-secondary text-decoration-none">PWA Offline Vault &amp; Sync Queue</router-link></li>
            <li><router-link to="/garage" class="text-secondary text-decoration-none">My Garage (NHTSA + AU/MY Registry)</router-link></li>
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
