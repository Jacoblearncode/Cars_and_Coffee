import { defineStore } from 'pinia'
import { getOfflineOutbox, flushOfflineOutbox } from '../services/api'
import { QUEUE_CHANGED_EVENT } from '../services/syncQueue'
import { useToast } from '../composables/useToast'

const CONFLICT_STORAGE_KEY = 'cars_and_coffee_sync_conflicts_v1'
const MAX_CONFLICTS = 20
const RETRY_BASE_MS = 15000
const RETRY_MAX_MS = 5 * 60 * 1000

function loadConflicts() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CONFLICT_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Offline sync state: tracks the queue, connectivity, sync progress and conflicts that the
 * conflict-resolving queue (`services/syncQueue.js`) reports after each replay.
 *
 * status: 'idle' (nothing pending) | 'pending' | 'offline' | 'syncing' | 'error'
 */
export const useSyncStore = defineStore('sync', {
  state: () => ({
    queue: getOfflineOutbox(),
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    syncing: false,
    lastError: null,
    lastSyncedAt: null,
    conflicts: loadConflicts(),
    retryCount: 0,
    initialised: false
  }),

  getters: {
    pendingCount: (s) => s.queue.length,
    conflictCount: (s) => s.conflicts.length,
    status(s) {
      if (s.syncing) return 'syncing'
      if (!s.isOnline) return 'offline'
      if (s.lastError) return 'error'
      return s.queue.length > 0 ? 'pending' : 'idle'
    },
    statusLabel() {
      return {
        idle: 'All changes synced',
        pending: `${this.pendingCount} change(s) waiting to sync`,
        offline: `Offline — ${this.pendingCount} change(s) saved locally`,
        syncing: 'Syncing…',
        error: 'Sync paused — will retry'
      }[this.status]
    }
  },

  actions: {
    refreshQueue() {
      this.queue = getOfflineOutbox()
    },

    setOnline(online) {
      this.isOnline = online
      this.refreshQueue()
      if (online) {
        this.flush()
      } else {
        this.clearRetry()
      }
    },

    /** Attach connectivity listeners once (call from App setup). */
    init() {
      if (this.initialised || typeof window === 'undefined') return
      this.initialised = true
      window.addEventListener('online', () => this.setOnline(true))
      window.addEventListener('offline', () => this.setOnline(false))
      window.addEventListener(QUEUE_CHANGED_EVENT, () => this.refreshQueue())
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isOnline) this.flush()
      })
      this.setOnline(navigator.onLine)
    },

    /** Replay the offline queue now. Safe to call repeatedly; concurrent calls are collapsed. */
    async flush() {
      this.refreshQueue()
      if (this.syncing || !this.isOnline || this.queue.length === 0) {
        return { synced: 0, remaining: this.queue.length, conflicts: [] }
      }
      this.syncing = true
      this.lastError = null
      try {
        const res = await flushOfflineOutbox()
        this.refreshQueue()
        if (res.synced > 0 || res.conflicts.length > 0) {
          this.lastSyncedAt = new Date().toISOString()
        }
        if (res.conflicts.length) this.recordConflicts(res.conflicts)
        if (res.stopped) {
          this.lastError = res.stopped
          this.scheduleRetry()
        } else {
          this.retryCount = 0
          this.clearRetry()
          if (res.synced > 0 && res.conflicts.length === 0) {
            useToast().showToast(`Synced ${res.synced} offline change(s).`, 'success')
          }
        }
        return res
      } catch (err) {
        this.lastError = (err && err.message) || 'unknown'
        this.scheduleRetry()
        return { synced: 0, remaining: this.queue.length, conflicts: [] }
      } finally {
        this.syncing = false
      }
    },

    recordConflicts(conflicts) {
      const stamped = conflicts.map((c) => ({ ...c, at: new Date().toISOString() }))
      this.conflicts = [...stamped, ...this.conflicts].slice(0, MAX_CONFLICTS)
      this.persistConflicts()
      const { showToast } = useToast()
      stamped.forEach((c) => showToast(c.message, 'warning', 8000))
    },

    dismissConflict(id) {
      this.conflicts = this.conflicts.filter((c) => c.id !== id)
      this.persistConflicts()
    },

    clearConflicts() {
      this.conflicts = []
      this.persistConflicts()
    },

    persistConflicts() {
      try {
        localStorage.setItem(CONFLICT_STORAGE_KEY, JSON.stringify(this.conflicts))
      } catch {
        // ignore quota errors
      }
    },

    scheduleRetry() {
      this.clearRetry()
      if (typeof window === 'undefined' || !this.isOnline) return
      const delay = Math.min(RETRY_BASE_MS * 2 ** this.retryCount, RETRY_MAX_MS)
      this.retryCount += 1
      this._retryTimer = setTimeout(() => this.flush(), delay)
    },

    clearRetry() {
      if (this._retryTimer) {
        clearTimeout(this._retryTimer)
        this._retryTimer = null
      }
    }
  }
})
