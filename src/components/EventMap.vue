<script setup>
/**
 * Roast & Redline (Cars & Coffee) — Interactive Leaflet Map Engine
 * Uses reliable OpenStreetMap tiles (zero API key required) + CartoDB Voyager/Dark switcher,
 * custom vibe markers, regional FlyTo buttons, two-way region sync, and coordinate picking.
 */

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import { useThemeStore } from '../stores/themeStore'
import { REGIONAL_HUBS } from '../data/seedData'

const props = defineProps({
  meets: { type: Array, default: () => [] },
  centerLat: { type: Number, default: -37.8136 },
  centerLng: { type: Number, default: 144.9631 },
  zoom: { type: Number, default: 11 },
  height: { type: String, default: '480px' },
  initialRegion: { type: String, default: 'Australia' },
  interactivePicker: { type: Boolean, default: false },
  pickedLat: { type: Number, default: null },
  pickedLng: { type: Number, default: null },
  showRegionControls: { type: Boolean, default: true }
})

const emit = defineEmits(['pick-coordinates', 'region-change', 'select-meet'])

const themeStore = useThemeStore()
const mapContainer = ref(null)
const activeRegionKey = ref(props.initialRegion || 'Australia')
const tileStyle = ref('osm') // 'osm' | 'carto'

let mapInstance = null
let tileLayerInstance = null
let markersLayer = null
let pickerMarker = null

function getTileUrl() {
  if (tileStyle.value === 'osm') {
    return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }
  return themeStore.isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
}

const vibeColors = {
  'Morning Coffee': '#d97736',
  'JDM & Brews': '#e63946',
  'Euro & Classics': '#0ea5e9',
  'Sunset Chill': '#f59e0b',
  'Night Meet': '#8b5cf6'
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createCoffeeMarkerIcon(meet) {
  const vibe = typeof meet === 'string' ? meet : meet?.vibe || 'Morning Coffee'
  const color = vibeColors[vibe] || '#d97736'
  const iconClass =
    vibe === 'JDM & Brews'
      ? 'bi-lightning-charge-fill'
      : vibe === 'Euro & Classics'
        ? 'bi-gem'
        : vibe === 'Night Meet'
          ? 'bi-moon-stars-fill'
          : vibe === 'Sunset Chill'
            ? 'bi-sunset-fill'
            : 'bi-cup-hot-fill'

  return L.divIcon({
    className: 'cc-custom-div-icon',
    html: `<div class="cc-map-pin" style="background:${color};border:2px solid #11100E;box-shadow:0 2px 6px rgba(0,0,0,0.3);"><i class="bi ${iconClass}"></i></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34]
  })
}

function renderMarkers() {
  if (!mapInstance || !markersLayer) return
  markersLayer.clearLayers()

  const validBounds = []

  props.meets.forEach((m) => {
    const lat = Number(m.latitude)
    const lng = Number(m.longitude)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return

    validBounds.push([lat, lng])
    const marker = L.marker([lat, lng], {
      icon: createCoffeeMarkerIcon(m),
      title: m.title
    })

    const titleEsc = escapeHtml(m.title)
    const vibeEsc = escapeHtml(m.vibe || 'Cars & Coffee')
    const regionEsc = escapeHtml(m.region || '')
    const cafeEsc = escapeHtml(m.cafe_name || m.address || '')
    const dateEsc = escapeHtml(String(m.meet_datetime || '').slice(0, 16))
    const rsvpCount = Number(m.rsvp_count || 0)
    const capacity = Number(m.capacity || 60)
    const meetId = encodeURIComponent(String(m.id))

    const popupHtml = `
      <div style="min-width: 220px; font-family: system-ui, sans-serif;">
        <div style="font-size: 0.7rem; font-weight: 800; color: #d97736; text-transform: uppercase; letter-spacing: 0.04em;">
          ${vibeEsc} · ${regionEsc}
        </div>
        <div style="font-weight: 700; font-size: 0.94rem; margin: 3px 0 5px; color: #111;">${titleEsc}</div>
        <div style="font-size: 0.78rem; color: #444; margin-bottom: 6px;">
          ☕ ${cafeEsc}<br/>
          📅 ${dateEsc}<br/>
          🚗 <strong>${rsvpCount} / ${capacity}</strong> in Roll-Call
        </div>
        <a href="#/meets/${meetId}" style="display:inline-block; padding: 5px 12px; background:#d97736; color:#fff; text-decoration:none; border-radius:999px; font-size:0.76rem; font-weight:700;">
          Inspect Meet & Roll-Call →
        </a>
      </div>
    `
    marker.bindPopup(popupHtml)
    marker.on('click', () => {
      emit('select-meet', m)
    })
    marker.addTo(markersLayer)
  })

  if (props.meets.length === 1 && validBounds.length === 1) {
    mapInstance.setView(validBounds[0], 14)
  }

  if (props.interactivePicker && props.pickedLat !== null && props.pickedLng !== null) {
    if (pickerMarker) {
      pickerMarker.setLatLng([props.pickedLat, props.pickedLng])
    } else {
      pickerMarker = L.marker([props.pickedLat, props.pickedLng], {
        icon: createCoffeeMarkerIcon('Morning Coffee')
      }).addTo(mapInstance)
    }
  }
}

function setRegionView(key) {
  activeRegionKey.value = key
  if (!mapInstance) return
  const hub = REGIONAL_HUBS[key] || REGIONAL_HUBS.All
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion || typeof mapInstance.flyTo !== 'function') {
    mapInstance.setView([hub.lat, hub.lng], hub.zoom)
  } else {
    mapInstance.flyTo([hub.lat, hub.lng], hub.zoom, { duration: 0.95 })
  }
}

function flyToRegion(key) {
  setRegionView(key)
  emit('region-change', key)
}

function switchTileStyle(nextStyle) {
  tileStyle.value = nextStyle
  if (tileLayerInstance && typeof tileLayerInstance.setUrl === 'function') {
    tileLayerInstance.setUrl(getTileUrl())
  }
}

onMounted(() => {
  if (!mapContainer.value) return
  try {
    const startHub =
      props.showRegionControls && REGIONAL_HUBS[activeRegionKey.value]
        ? REGIONAL_HUBS[activeRegionKey.value]
        : { lat: props.centerLat, lng: props.centerLng, zoom: props.zoom }

    mapInstance = L.map(mapContainer.value, {
      center: [startHub.lat, startHub.lng],
      zoom: startHub.zoom,
      scrollWheelZoom: true
    })

    tileLayerInstance = L.tileLayer(getTileUrl(), {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19
    }).addTo(mapInstance)

    markersLayer = L.layerGroup().addTo(mapInstance)
    renderMarkers()

    if (props.interactivePicker) {
      mapInstance.on('click', (e) => {
        const lat = Math.round(e.latlng.lat * 1000000) / 1000000
        const lng = Math.round(e.latlng.lng * 1000000) / 1000000
        emit('pick-coordinates', { latitude: lat, longitude: lng })
      })
    }
  } catch {
    // Fallback for headless test environments without full canvas/layout
  }
})

watch(
  () => props.initialRegion,
  (newRegion) => {
    if (newRegion && newRegion !== activeRegionKey.value) {
      setRegionView(newRegion)
    }
  }
)

watch(
  () => themeStore.isDark,
  () => {
    if (tileStyle.value === 'carto' && tileLayerInstance && typeof tileLayerInstance.setUrl === 'function') {
      tileLayerInstance.setUrl(getTileUrl())
    }
  }
)

watch(
  () => [props.meets, props.pickedLat, props.pickedLng],
  () => {
    renderMarkers()
  },
  { deep: true }
)

watch(
  () => [props.centerLat, props.centerLng],
  ([newLat, newLng]) => {
    if (mapInstance && newLat && newLng) {
      mapInstance.setView([Number(newLat), Number(newLng)], mapInstance.getZoom())
    }
  }
)

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})
</script>

<template>
  <div class="cc-tile p-0 overflow-hidden">
    <!-- Regional Quick-Jump Bar + Tile Style Switcher -->
    <div
      v-if="showRegionControls"
      class="p-2 px-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2"
      style="background-color: var(--cc-surface-elevated)"
    >
      <div class="d-flex flex-wrap align-items-center gap-1">
        <span class="small fw-bold font-mono me-1">
          <i class="bi bi-compass me-1" style="color: var(--cc-accent)"></i>HUB:
        </span>
        <button
          v-for="(hub, key) in REGIONAL_HUBS"
          :key="key"
          type="button"
          class="btn btn-sm rounded-pill px-2 py-1"
          :class="activeRegionKey === key ? 'btn-cc-primary' : 'btn-cc-outline'"
          style="font-size: 0.76rem"
          @click="flyToRegion(key)"
        >
          {{ hub.label }}
        </button>
      </div>

      <div class="d-flex align-items-center gap-2">
        <div class="btn-group btn-group-sm" role="group" aria-label="Map tile style">
          <button
            type="button"
            class="btn btn-sm"
            :class="tileStyle === 'osm' ? 'btn-cc-primary' : 'btn-cc-outline'"
            @click="switchTileStyle('osm')"
          >
            OSM Street
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="tileStyle === 'carto' ? 'btn-cc-primary' : 'btn-cc-outline'"
            @click="switchTileStyle('carto')"
          >
            Carto Retina
          </button>
        </div>
      </div>
    </div>

    <div
      ref="mapContainer"
      class="w-100"
      :style="{ height }"
      role="region"
      aria-label="Interactive Cars and Coffee meet locations map"
    ></div>

    <div
      v-if="interactivePicker"
      class="p-2 px-3 border-top small text-secondary d-flex justify-content-between align-items-center"
    >
      <span>
        <i class="bi bi-cursor-fill me-1" style="color: var(--cc-accent)"></i>
        Click anywhere on the map to pin the exact cafe or carpark coordinates.
      </span>
      <span v-if="pickedLat !== null && pickedLng !== null" class="font-mono">
        {{ pickedLat }}, {{ pickedLng }}
      </span>
    </div>
  </div>
</template>
