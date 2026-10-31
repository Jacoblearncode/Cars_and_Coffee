import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { enqueue, readQueue, clearQueue, replayQueue, classifyAction } from '../../src/services/syncQueue'
import { useSyncStore } from '../../src/stores/syncStore'

function httpError(status, data = {}) {
  const err = new Error(data.error || `HTTP ${status}`)
  err.status = status
  err.data = data
  return err
}

describe('Offline sync queue — coalescing', () => {
  beforeEach(() => {
    localStorage.clear()
    clearQueue()
  })

  it('classifies RSVP, like and edit actions', () => {
    expect(classifyAction('POST', 'meets/4/rsvp').type).toBe('rsvp')
    expect(classifyAction('DELETE', 'meets/4/rsvp').key).toBe('rsvp:4')
    expect(classifyAction('POST', 'likes', { target_type: 'post', target_id: 2 }).key).toBe('like:post:2')
    expect(classifyAction('PUT', 'meets/4').type).toBe('meet_edit')
  })

  it('keeps only the latest RSVP intent per meet', () => {
    enqueue('POST', 'meets/1/rsvp', { attend_type: 'bringing_car' })
    enqueue('DELETE', 'meets/1/rsvp', {})
    const q = readQueue()
    expect(q).toHaveLength(1)
    expect(q[0].type).toBe('cancel_rsvp')
  })

  it('merges edits to the same meet and preserves the original base snapshot', () => {
    enqueue('PUT', 'meets/1', { title: 'B' }, { base_version: 'v1', base_values: { title: 'A' } })
    enqueue('PUT', 'meets/1', { title: 'C', capacity: 80 }, { base_version: 'v1', base_values: { title: 'B', capacity: 60 } })
    const q = readQueue()
    expect(q).toHaveLength(1)
    expect(q[0].body).toEqual({ title: 'C', capacity: 80 })
    expect(q[0].base_values).toEqual({ title: 'A', capacity: 60 })
  })
})

describe('Offline sync queue — replay & conflict resolution', () => {
  beforeEach(() => {
    localStorage.clear()
    clearQueue()
  })

  it('replays in order and empties the queue on success', async () => {
    enqueue('POST', 'meets/1/rsvp', {})
    enqueue('PUT', 'meets/2', { title: 'X' }, { base_version: 'v1', base_values: { title: 'Y' } })
    const send = vi.fn().mockResolvedValue({ meet: { id: 1 } })
    const res = await replayQueue(send)
    expect(res.synced).toBe(2)
    expect(res.conflicts).toHaveLength(0)
    expect(send.mock.calls.map((c) => c[1])).toEqual(['meets/1/rsvp', 'meets/2'])
    expect(readQueue()).toHaveLength(0)
  })

  it('stops and keeps the queue on network failure', async () => {
    enqueue('POST', 'meets/1/rsvp', {})
    enqueue('POST', 'meets/2/rsvp', {})
    const err = new Error('down')
    err.network = true
    const res = await replayQueue(vi.fn().mockRejectedValue(err))
    expect(res.stopped).toBe('network')
    expect(res.remaining).toBe(2)
    expect(readQueue()[0].attempts).toBe(1)
  })

  it('reports a conflict and drops an RSVP to a full meet', async () => {
    enqueue('POST', 'meets/1/rsvp', {}, { label: 'Sunday Run' })
    const res = await replayQueue(vi.fn().mockRejectedValue(httpError(409, { error: 'This meet is now full.' })))
    expect(res.conflicts[0].resolution).toBe('dropped')
    expect(res.conflicts[0].message).toContain('full')
    expect(readQueue()).toHaveLength(0)
  })

  it('auto-merges an edit when the server changed different fields', async () => {
    enqueue('PUT', 'meets/1', { title: 'New' }, { base_version: 'v1', base_values: { title: 'Old' } })
    const server = { id: 1, title: 'Old', capacity: 99, updated_at: 'v2' }
    const send = vi
      .fn()
      .mockRejectedValueOnce(httpError(409, { server }))
      .mockResolvedValueOnce({ meet: { ...server, title: 'New' } })
    const res = await replayQueue(send)
    expect(res.conflicts[0].resolution).toBe('merged')
    expect(send.mock.calls[1][2]).toEqual({ title: 'New', base_version: 'v2' })
  })

  it('keeps the server value on overlapping fields (field-level server-wins)', async () => {
    enqueue(
      'PUT',
      'meets/1',
      { title: 'Mine', capacity: 70 },
      { base_version: 'v1', base_values: { title: 'Old', capacity: 60 } }
    )
    const server = { id: 1, title: 'Theirs', capacity: 60, updated_at: 'v2' }
    const send = vi
      .fn()
      .mockRejectedValueOnce(httpError(409, { server }))
      .mockResolvedValueOnce({ meet: server })
    const res = await replayQueue(send)
    expect(res.conflicts[0].resolution).toBe('server_wins')
    expect(res.conflicts[0].fields).toEqual(['title'])
    expect(send.mock.calls[1][2]).toEqual({ capacity: 70, base_version: 'v2' })
  })

  it('toggles a like again if the server state differs from the user intent', async () => {
    enqueue('POST', 'likes', { target_type: 'meet', target_id: 1 }, { desired: true })
    const send = vi.fn().mockResolvedValueOnce({ liked: false }).mockResolvedValueOnce({ liked: true })
    const res = await replayQueue(send)
    expect(send).toHaveBeenCalledTimes(2)
    expect(res.synced).toBe(1)
  })

  it('scopes queue replay to current user_id and leaves other users actions queued', async () => {
    // User 10 enqueues an RSVP
    enqueue('POST', 'meets/1/rsvp', { attend_type: 'spectator' }, { user_id: 10 })
    // User 20 enqueues an RSVP
    enqueue('POST', 'meets/2/rsvp', { attend_type: 'bringing_car' }, { user_id: 20 })

    expect(readQueue()).toHaveLength(2)

    const send = vi.fn().mockResolvedValue({ success: true })
    // Replay only for User 10
    const res = await replayQueue(send, { userId: 10 })

    expect(res.synced).toBe(1)
    expect(send).toHaveBeenCalledTimes(1)
    expect(send.mock.calls[0][1]).toBe('meets/1/rsvp')

    // User 20's item remains in queue safely
    const remaining = readQueue()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].user_id).toBe(20)
    expect(remaining[0].endpoint).toBe('meets/2/rsvp')
  })
})

describe('Sync store', () => {
  beforeEach(() => {
    localStorage.clear()
    clearQueue()
    setActivePinia(createPinia())
  })

  it('tracks pending count and reports offline status', () => {
    const store = useSyncStore()
    enqueue('POST', 'meets/1/rsvp', {})
    store.refreshQueue()
    expect(store.pendingCount).toBe(1)
    store.isOnline = false
    expect(store.status).toBe('offline')
    store.isOnline = true
    expect(store.status).toBe('pending')
  })

  it('records conflicts and raises a toast', async () => {
    const { useToast } = await import('../../src/composables/useToast')
    const { toasts } = useToast()
    toasts.value = []
    const store = useSyncStore()
    store.recordConflicts([{ id: 1, message: 'Your edit conflicted.', resolution: 'server_wins' }])
    expect(store.conflictCount).toBe(1)
    expect(toasts.value.some((t) => t.message === 'Your edit conflicted.' && t.type === 'warning')).toBe(true)
    store.clearConflicts()
    expect(store.conflictCount).toBe(0)
  })
})
