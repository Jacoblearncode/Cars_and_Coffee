/**
 * Cars & Coffee — Unified Dual-Mode REST API Client + Out-of-Signal Fallback (Jacob's Feature)
 *
 * 1. Primary Mode (Mercury / `VITE_USE_PHP_API=true`): Calls the PHP + MySQL REST API
 *    (`api/index.php?endpoint=...`) and caches GET snapshots into `localDb.js`.
 * 2. Offline / Out-of-Range / Local Fallback Mode: When `navigator.onLine === false`,
 *    when the PHP server is unreachable (out of range at a mountain pass / basement meet),
 *    or during local Vite development, requests route seamlessly to `localDb.js` and
 *    offline mutations are queued in an Outbox to sync when signal returns.
 */

import { handleLocalRequest, syncServerResponseToLocalDb, loadDb } from './localDb'
import { readQueue, enqueue, clearQueue, replayQueue } from './syncQueue'

const TOKEN_STORAGE_KEY = 'cars_and_coffee_jwt_token'

let activeBackendEngine = 'local-db'
let totalApiRequests = 0

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

export function getOfflineOutbox() {
  return readQueue()
}

export function enqueueOfflineAction(method, endpoint, body = {}, meta = {}) {
  try {
    return enqueue(method, endpoint, body, meta)
  } catch {
    return []
  }
}

export function getCurrentUserId() {
  const token = getStoredToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length >= 2) {
      const payload = JSON.parse(atob(parts[1]))
      return payload && payload.id ? Number(payload.id) : null
    }
  } catch {
    return null
  }
  return null
}

export function clearOfflineOutbox() {
  clearQueue()
}
export function shouldAttemptPhpApi() {
  if (typeof window === 'undefined') return false
  if (import.meta.env && import.meta.env.VITE_USE_PHP_API === 'true') return true
  const host = window.location.hostname || ''
  return host.includes('swin.edu.au') || host.includes('mercury')
}

export function getApiEngineStatus() {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  const outboxCount = getOfflineOutbox().length
  return {
    mode: activeBackendEngine,
    label:
      activeBackendEngine === 'php-mysql'
        ? 'Live Community Server'
        : !isOnline
          ? 'Offline Mode (Saved Locally)'
          : 'Local Demo Storage',
    online: isOnline,
    outboxCount,
    totalApiRequests
  }
}

/**
 * Raw call to the PHP + MySQL API. Throws on ANY failure:
 *  - `err.status` / `err.data` are set for HTTP error responses,
 *  - `err.network === true` when the server was unreachable or returned a non-JSON body.
 */
async function phpFetch(method, endpoint, { params = {}, body = null } = {}) {
  const token = getStoredToken()
  const baseUrl = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || './api/index.php'
  const url = new URL(baseUrl, window.location.href)
  url.searchParams.set('endpoint', endpoint)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v))
    }
  })

  const headers = { 'Content-Type': 'application/json' }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  let res
  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    })
  } catch (cause) {
    const err = new Error('Network unreachable')
    err.network = true
    err.cause = cause
    throw err
  } finally {
    clearTimeout(timer)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const err = new Error('Unexpected non-JSON response')
    err.network = true
    throw err
  }
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.error || data.message || `API Error (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

/** Capture what the UI needs to later detect and resolve a conflict for this queued action. */
async function snapshotBeforeLocalWrite(method, endpoint, body, token) {
  const match = endpoint.match(/^meets\/(\d+)$/)
  if (method !== 'PUT' || !match) return null
  try {
    const { meet } = await handleLocalRequest('GET', endpoint, {}, {}, token)
    const baseValues = {}
    Object.keys(body || {}).forEach((k) => {
      baseValues[k] = meet[k]
    })
    return {
      base_version: meet.updated_at || meet.created_at || null,
      base_values: baseValues
    }
  } catch {
    return null
  }
}

function meetLabelFor(endpoint, body) {
  const match = endpoint.match(/^meets\/(\d+)/)
  const targetId = match ? Number(match[1]) : body && body.target_type !== 'post' ? Number(body.target_id) : null
  if (!targetId) return null
  try {
    const meet = loadDb().meets.find((m) => Number(m.id) === targetId)
    return meet ? meet.title : `meet #${targetId}`
  } catch {
    return null
  }
}

async function request(method, endpoint, { params = {}, body = null } = {}) {
  const token = getStoredToken()
  totalApiRequests += 1
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
  let serverUnreachable = false

  if (shouldAttemptPhpApi() && isOnline) {
    try {
      const data = await phpFetch(method, endpoint, { params, body })
      activeBackendEngine = 'php-mysql'
      if (method === 'GET') {
        syncServerResponseToLocalDb(endpoint, data)
      }
      return data
    } catch (err) {
      // If server returned an explicit 4xx validation/auth error, surface it directly
      if (err && err.status && err.status >= 400 && err.status < 500) {
        throw err
      }
      // Otherwise network/server is unreachable -> fall back to LocalDB seamlessly
      serverUnreachable = true
    }
  }

  // Fallback to LocalDB when offline, out of signal, or running local Vite dev
  activeBackendEngine = 'local-db'
  const isQueueable = method !== 'GET' && !endpoint.startsWith('auth/')
  const shouldQueue = isQueueable && (!isOnline || serverUnreachable)
  const snapshot = shouldQueue ? await snapshotBeforeLocalWrite(method, endpoint, body, token) : null
  const result = await handleLocalRequest(method, endpoint, params, body || {}, token)
  if (shouldQueue) {
    enqueueOfflineAction(method, endpoint, body || {}, {
      user_id: getCurrentUserId(),
      label: meetLabelFor(endpoint, body),
      desired: result && typeof result.liked === 'boolean' ? result.liked : undefined,
      ...(snapshot || {})
    })
  }
  return result
}

/**
 * Replay the offline queue against the PHP API with conflict resolution.
 * Resolves to `{ synced, remaining, conflicts, stopped }`.
 */
let flushInFlight = null

export function flushOfflineOutbox() {
  if (flushInFlight) return flushInFlight
  flushInFlight = (async () => {
    const queue = readQueue()
    if (!queue.length) return { synced: 0, remaining: 0, conflicts: [], stopped: null }
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true
    if (!isOnline) return { synced: 0, remaining: queue.length, conflicts: [], stopped: 'network' }

    if (!shouldAttemptPhpApi()) {
      clearQueue()
      return { synced: queue.length, remaining: 0, conflicts: [], stopped: null }
    }

    const currentUserId = getCurrentUserId()
    const result = await replayQueue((method, endpoint, body) => phpFetch(method, endpoint, { body }), {
      userId: currentUserId
    })
    if (result.synced > 0 || result.conflicts.length > 0) activeBackendEngine = 'php-mysql'
    // Refresh the LocalDB cache with whatever the server says is now true.
    result.serverState.forEach(({ data }) => {
      if (data && data.meet) syncServerResponseToLocalDb('meets', { data: [data.meet] })
    })
    const { serverState, ...summary } = result
    return summary
  })().finally(() => {
    flushInFlight = null
  })
  return flushInFlight
}

export const api = {
  get(endpoint, params = {}) {
    return request('GET', endpoint, { params })
  },
  post(endpoint, body = {}, params = {}) {
    return request('POST', endpoint, { params, body })
  },
  put(endpoint, body = {}, params = {}) {
    return request('PUT', endpoint, { params, body })
  },
  delete(endpoint, params = {}) {
    return request('DELETE', endpoint, { params })
  }
}
