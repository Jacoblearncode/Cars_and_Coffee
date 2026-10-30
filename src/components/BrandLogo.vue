<script setup>
defineProps({
  size: {
    type: Number,
    default: 36
  },
  showText: {
    type: Boolean,
    default: true
  },
  compact: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <span class="d-inline-flex align-items-center gap-2 text-decoration-none select-none">
    <span
      class="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-3 shadow-sm"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        fill="none"
        :width="size"
        :height="size"
        aria-hidden="true"
      >
        <rect width="120" height="120" rx="28" fill="#11100E" />
        <rect
          x="6"
          y="6"
          width="108"
          height="108"
          rx="22"
          stroke="#FF5500"
          stroke-width="3"
          stroke-opacity="0.45"
        />
        <path
          d="M24 72 A 38 38 0 1 1 96 72"
          stroke="#2D2926"
          stroke-width="7"
          stroke-linecap="round"
        />
        <path
          d="M68 23 A 38 38 0 0 1 96 72"
          stroke="#FF5500"
          stroke-width="7"
          stroke-linecap="round"
        />
        <path d="M40 20 L32 48" stroke="#FF5500" stroke-width="4.5" stroke-linecap="round" />
        <path
          d="M49 20 L41 48"
          stroke="#F4EFE6"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-opacity="0.9"
        />
        <path d="M60 66 L82 36" stroke="#FF5500" stroke-width="5" stroke-linecap="round" />
        <circle cx="60" cy="66" r="6" fill="#F4EFE6" />
        <path
          d="M32 64 H82 V76 C82 88.1503 72.1503 98 60 98 H54 C41.8497 98 32 88.1503 32 76 V64 Z"
          fill="#F4EFE6"
        />
        <path
          d="M82 68 H88 C92.9706 68 97 72.0294 97 77 C97 81.9706 92.9706 86 88 86 H82 V68 Z"
          stroke="#FF5500"
          stroke-width="6"
        />
        <path d="M38 74 H76" stroke="#FF5500" stroke-width="4.5" stroke-linecap="round" />
      </svg>
    </span>

    <span v-if="showText" class="d-flex flex-column lh-1">
      <span
        class="font-display fw-bold text-uppercase"
        :style="{ fontSize: compact ? '0.92rem' : '1.02rem', letterSpacing: '-0.03em' }"
      >
        ROAST <span style="color: var(--cc-accent)">&amp;</span> REDLINE
      </span>
      <span
        class="font-mono text-secondary"
        style="font-size: 0.62rem; letter-spacing: 0.12em; margin-top: 2px"
      >
        CARS &amp; COFFEE CLUB
      </span>
    </span>
  </span>
</template>
