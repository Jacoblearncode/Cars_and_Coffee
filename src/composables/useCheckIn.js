/**
 * Cars & Coffee — QR Check-In Composables (Advanced Feature)
 *
 * Two halves of one flow:
 *  - useCheckInHost():    the host's screen renders a short-lived signed token as a QR code and
 *                         silently rotates it before it expires, so a screenshot can't be shared.
 *  - useCheckInScanner(): the attendee's camera is read through the browser's BarcodeDetector API.
 *                         Phones without it can still scan with their native camera app, because the
 *                         QR encodes a normal link to the check-in page.
 */

import { ref, computed, onBeforeUnmount } from 'vue'
import QRCode from 'qrcode'
import { useMeetStore } from '../stores/meetStore'

/** Build the link encoded in the QR code (hash-router friendly). */
export function buildCheckInUrl(meetId, token, base = null) {
  const root =
    base ||
    (typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '')
  return `${root}#/checkin?m=${encodeURIComponent(meetId)}&t=${encodeURIComponent(token)}`
}

/**
 * Pull `{ meetId, token }` out of whatever was scanned or pasted:
 * a full check-in link, or a bare `meetId.expiry.signature` token.
 */
export function parseCheckInPayload(text) {
  const raw = String(text || '').trim()
  if (!raw) return null

  const queryStart = raw.indexOf('?')
  if (raw.includes('#/checkin') && queryStart !== -1) {
    const params = new URLSearchParams(raw.slice(queryStart + 1))
    const meetId = Number(params.get('m'))
    const token = params.get('t')
    return meetId && token ? { meetId, token } : null
  }

  const parts = raw.split('.')
  if (parts.length === 3 && /^\d+$/.test(parts[0])) {
    return { meetId: Number(parts[0]), token: raw }
  }
  return null
}

export function useCheckInHost(meetIdRef, { refreshAtSeconds = 15 } = {}) {
  const meetStore = useMeetStore()

  const active = ref(false)
  const loading = ref(false)
  const error = ref('')
  const qrSvg = ref('')
  const manualCode = ref('')
  const secondsLeft = ref(0)

  let expiresAt = 0
  let ticker = null

  const hasQr = computed(() => active.value && Boolean(qrSvg.value))

  async function renderToken() {
    loading.value = true
    error.value = ''
    try {
      const { token, expires_in } = await meetStore.fetchCheckInCode(meetIdRef.value)
      manualCode.value = token
      qrSvg.value = await QRCode.toString(buildCheckInUrl(meetIdRef.value, token), {
        type: 'svg',
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#111111', light: '#ffffff' }
      })
      expiresAt = Date.now() + Number(expires_in || 120) * 1000
      secondsLeft.value = Math.round((expiresAt - Date.now()) / 1000)
    } catch (err) {
      error.value = err.message || 'Could not create a check-in code.'
      stop()
    } finally {
      loading.value = false
    }
  }

  function tick() {
    secondsLeft.value = Math.max(0, Math.round((expiresAt - Date.now()) / 1000))
    if (active.value && !loading.value && secondsLeft.value <= refreshAtSeconds) {
      renderToken()
    }
  }

  async function start() {
    if (active.value) return
    active.value = true
    await renderToken()
    if (active.value) ticker = setInterval(tick, 1000)
  }

  function stop() {
    active.value = false
    qrSvg.value = ''
    manualCode.value = ''
    secondsLeft.value = 0
    if (ticker) clearInterval(ticker)
    ticker = null
  }

  onBeforeUnmount(stop)

  return { active, loading, error, qrSvg, manualCode, secondsLeft, hasQr, start, stop }
}

export function isScannerSupported() {
  return (
    typeof window !== 'undefined' &&
    'BarcodeDetector' in window &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  )
}

export function useCheckInScanner(onDecode) {
  const videoEl = ref(null)
  const scanning = ref(false)
  const error = ref('')
  const supported = ref(isScannerSupported())

  let stream = null
  let detector = null
  let frameId = null
  let busy = false

  async function scanFrame() {
    if (!scanning.value) return
    const video = videoEl.value
    if (video && video.readyState >= 2 && !busy) {
      busy = true
      try {
        const codes = await detector.detect(video)
        const hit = codes.find((c) => parseCheckInPayload(c.rawValue))
        if (hit) {
          const payload = parseCheckInPayload(hit.rawValue)
          stop()
          onDecode(payload)
          return
        }
      } catch {
        // a dropped frame is fine - keep scanning
      } finally {
        busy = false
      }
    }
    frameId = requestAnimationFrame(scanFrame)
  }

  async function start() {
    error.value = ''
    if (!supported.value) {
      error.value = 'In-app scanning is not supported in this browser. Use your phone camera app instead.'
      return
    }
    try {
      detector = new window.BarcodeDetector({ formats: ['qr_code'] })
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      })
      scanning.value = true
      // Wait for the <video> element to exist before attaching the stream
      await Promise.resolve()
      if (videoEl.value) {
        videoEl.value.srcObject = stream
        await videoEl.value.play().catch(() => {})
      }
      frameId = requestAnimationFrame(scanFrame)
    } catch (err) {
      stop()
      error.value =
        err && err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access or paste the code instead.'
          : 'Could not open the camera on this device.'
    }
  }

  function stop() {
    scanning.value = false
    if (frameId) cancelAnimationFrame(frameId)
    frameId = null
    if (stream) stream.getTracks().forEach((t) => t.stop())
    stream = null
    if (videoEl.value) videoEl.value.srcObject = null
  }

  onBeforeUnmount(stop)

  return { videoEl, scanning, error, supported, start, stop }
}
