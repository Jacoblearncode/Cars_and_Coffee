<script setup>
/**
 * Roast & Redline (Cars & Coffee) — Custom Vector SVG Icon System
 *
 * Provides resolution-independent, zero-latency vector icons tailored for the
 * automotive & specialty coffee aesthetic. Completely immune to webfont loading
 * failures, FOIT/FOUT, and font-glyph tofu boxes (`▯`).
 */

defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 16
  },
  strokeWidth: {
    type: [Number, String],
    default: 2
  }
})
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="app-icon"
    aria-hidden="true"
    style="vertical-align: -0.15em; display: inline-block; flex-shrink: 0;"
  >
    <!-- Home / Cafe-Garage Loft -->
    <g v-if="name === 'home'">
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
      <path d="M9 21v-6h6v6" />
      <circle cx="12" cy="8.5" r="1.2" fill="currentColor" />
    </g>

    <!-- Meets / Racing Calendar -->
    <g v-else-if="name === 'meets' || name === 'calendar'">
      <rect x="3" y="4" width="18" height="17" rx="3" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="8" y1="2" x2="8" y2="5" />
      <line x1="16" y1="2" x2="16" y2="5" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 17h2" />
      <path d="M14 17h2" />
    </g>

    <!-- Spotting / Camera Aperture & Wheel Rim -->
    <g v-else-if="name === 'spotting' || name === 'camera'">
      <path d="M4 8h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z" />
      <circle cx="12" cy="14" r="4" />
      <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      <circle cx="18" cy="11" r="0.75" fill="currentColor" />
    </g>

    <!-- Map & Radar / GPS Pin & Sweeping Rings -->
    <g v-else-if="name === 'map' || name === 'radar'">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
      <circle cx="12" cy="9" r="2.5" fill="currentColor" />
    </g>

    <!-- Insights / Telemetry & Boost Gauge -->
    <g v-else-if="name === 'insights' || name === 'telemetry'">
      <path d="M12 21a9 9 0 1 1 9-9" />
      <path d="M12 12l5-5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M18 16v5" />
      <path d="M21 13v8" />
    </g>

    <!-- Vault / Out-of-Signal Offline Safe -->
    <g v-else-if="name === 'vault'">
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 10.5v3" />
      <path d="M10.5 12h3" />
      <circle cx="17.5" cy="8" r="0.8" fill="currentColor" />
      <circle cx="17.5" cy="16" r="0.8" fill="currentColor" />
    </g>

    <!-- Search / Magnifier & Crosshair -->
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </g>

    <!-- Download / PWA Install -->
    <g v-else-if="name === 'download' || name === 'install'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </g>

    <!-- Host Meet / Plus -->
    <g v-else-if="name === 'plus' || name === 'host'">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </g>

    <!-- Garage / Sports Car Front -->
    <g v-else-if="name === 'garage' || name === 'car'">
      <path d="M5 11l2-5h10l2 5" />
      <rect x="3" y="11" width="18" height="8" rx="2" />
      <circle cx="7" cy="15" r="1.5" fill="currentColor" />
      <circle cx="17" cy="15" r="1.5" fill="currentColor" />
      <line x1="10" y1="15" x2="14" y2="15" />
    </g>

    <!-- Logout / Exit -->
    <g v-else-if="name === 'logout'">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </g>

    <!-- Sun / Light Theme -->
    <g v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>

    <!-- Moon / Dark Theme -->
    <g v-else-if="name === 'moon'">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </g>

    <!-- Pagination: Aerodynamic Chevron Left -->
    <g v-else-if="name === 'chevron-left' || name === 'prev'">
      <polyline points="15 18 9 12 15 6" />
    </g>

    <!-- Pagination: Aerodynamic Chevron Right -->
    <g v-else-if="name === 'chevron-right' || name === 'next'">
      <polyline points="9 18 15 12 9 6" />
    </g>

    <!-- Bookmark / Pin -->
    <g v-else-if="name === 'bookmark' || name === 'pin'">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </g>

    <!-- Fallback / generic icon -->
    <g v-else>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </g>
  </svg>
</template>
