<script setup>
import { computed, toRef } from 'vue'
import { useCheckInHost } from '../composables/useCheckIn'

const props = defineProps({
  meetId: { type: [Number, String], required: true },
  checkedIn: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
})

const meetIdRef = toRef(props, 'meetId')
const { active, loading, error, qrSvg, manualCode, secondsLeft, hasQr, start, stop } =
  useCheckInHost(meetIdRef)

const progress = computed(() => (props.total ? Math.round((props.checkedIn / props.total) * 100) : 0))
</script>

<template>
  <div class="cc-tile mb-4">
    <div class="cc-bracket-label">[ GATE CHECK-IN ]</div>
    <h2 class="h5 fw-bold mb-2">Check-In QR Code</h2>
    <p class="small text-secondary mb-3">
      Show this at the entrance. Attendees scan it to confirm they arrived. The code refreshes
      itself every couple of minutes.
    </p>

    <div class="mb-3">
      <div class="d-flex justify-content-between small mb-1">
        <span><strong>{{ checkedIn }}</strong> / {{ total }} checked in</span>
        <span class="text-secondary">{{ progress }}%</span>
      </div>
      <div
        class="progress"
        style="height: 6px"
        role="progressbar"
        :aria-valuenow="progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Attendees checked in"
      >
        <div class="progress-bar bg-success" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <Transition name="fade" mode="out-in">
      <div v-if="hasQr" key="qr" class="text-center">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div
          class="bg-white rounded-3 p-2 d-inline-block checkin-qr"
          role="img"
          aria-label="Check-in QR code for this meet"
          v-html="qrSvg"
        ></div>
        <div class="small font-mono text-secondary mt-2" aria-live="polite">
          Refreshes in {{ secondsLeft }}s
        </div>
        <details class="small mt-2 text-start">
          <summary class="text-secondary">Can't scan? Share the code</summary>
          <code class="d-block text-break mt-1 user-select-all">{{ manualCode }}</code>
        </details>
      </div>
    </Transition>

    <div v-if="error" class="alert alert-danger small py-2 mt-2 mb-0" role="alert">{{ error }}</div>

    <button
      v-if="!active"
      type="button"
      class="btn btn-cc-primary cc-pill-btn w-100 mt-2"
      :disabled="loading"
      @click="start"
    >
      <i class="bi bi-qr-code me-1"></i>
      {{ loading ? 'Generating...' : 'Open Check-In' }}
    </button>
    <button
      v-else
      type="button"
      class="btn btn-outline-secondary cc-pill-btn w-100 mt-3"
      @click="stop"
    >
      Close Check-In
    </button>
  </div>
</template>

<style scoped>
.checkin-qr :deep(svg) {
  width: min(240px, 60vw);
  height: auto;
  display: block;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
