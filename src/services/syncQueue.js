/**
 * Cars & Coffee — Offline-First Sync Queue with Conflict Resolution (Jacob's Advanced PWA Feature)
 *
 * Persists every offline mutation (RSVPs, RSVP cancellations, likes, meet edits) to a durable
 * queue in localStorage and replays it, in order, against the PHP/MySQL API on reconnect.
 *
 * Queue rules ("latest intent wins" coalescing):
 *   - RSVP / cancel RSVP for the same meet  -> only the newest intent is kept.
 *   - Like toggles for the same target      -> only the newest desired state is kept.
 *   - Meet edits for the same meet          -> bodies are merged into one PUT; the ORIGINAL
 *                                              base snapshot (version + field values) is preserved.
 *
 * Replay rules:
 *   - Network failure / 5xx / 401 / 429     -> stop and keep the rest of the queue for a later retry.
 *   - 409 on a meet edit (version mismatch) -> field-level three-way merge:
 *         fields nobody else touched are applied ("merged");
 *         fields changed on the server since our base snapshot keep the SERVER value ("server_wins").
 *   - Any other 4xx (meet deleted, forbidden, full, ...) -> action is dropped and reported as a conflict.
 *
 * This module is transport-agnostic: the caller injects `send(method, endpoint, body)`.
 */

export const OUTBOX_STORAGE_KEY = 'cars_and_coffee_offline_outbox_v1'

let idCounter = 0

function newId() {
  idCounter += 1
  return Date.now() * 1000 + (idCounter % 1000)
}

export function readQueue() {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Window event fired whenever the queue changes so stores/UI can stay reactive. */
export const QUEUE_CHANGED_EVENT = 'cars-and-coffee:outbox-changed'

function notifyChanged() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event(QUEUE_CHANGED_EVENT))
  }
}

export function writeQueue(queue) {
  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(queue))
  } catch {
    // ignore quota errors
  }
  notifyChanged()
}

export function clearQueue() {
  try {
    localStorage.removeItem(OUTBOX_STORAGE_KEY)
  } catch {
    // ignore
  }
  notifyChanged()
}

/** Work out what kind of action this is, and the key used for coalescing. */
export function classifyAction(method, endpoint, body = {}) {
  const m = String(method || '').toUpperCase()
  const ep = String(endpoint || '').replace(/^\/+|\/+$/g, '')
  let match = ep.match(/^meets\/(\d+)\/rsvp$/)
  if (match) {
    return {
      type: m === 'DELETE' ? 'cancel_rsvp' : 'rsvp',
      key: `rsvp:${match[1]}`,
      meetId: Number(match[1])
    }
  }
  if (ep === 'likes' && m === 'POST') {
    const targetType = body.target_type === 'post' ? 'post' : 'meet'
    return { type: 'like', key: `like:${targetType}:${Number(body.target_id)}` }
  }
  match = ep.match(/^meets\/(\d+)$/)
  if (match && m === 'PUT') {
    return { type: 'meet_edit', key: `meet:${match[1]}`, meetId: Number(match[1]) }
  }
  return { type: 'other', key: null }
}

/**
 * Add an action to the queue, coalescing with any pending action on the same entity.
 * `meta` may carry: label, desired (likes), base_version / base_values (edits).
 */
export function enqueue(method, endpoint, body = {}, meta = {}) {
  const queue = readQueue()
  const { type, key } = classifyAction(method, endpoint, body)
  const now = new Date().toISOString()
  const entry = {
    id: newId(),
    method: String(method).toUpperCase(),
    endpoint,
    body,
    type,
    key,
    label: meta.label || null,
    desired: meta.desired,
    base_version: meta.base_version ?? null,
    base_values: meta.base_values || {},
    attempts: 0,
    queued_at: now
  }

  const existingIdx = key ? queue.findIndex((q) => q.key === key) : -1
  if (existingIdx >= 0) {
    const old = queue[existingIdx]
    if (type === 'meet_edit' && old.type === 'meet_edit') {
      old.body = { ...old.body, ...body }
      // Earliest snapshot wins: it describes what the server looked like when we first diverged.
      old.base_values = { ...entry.base_values, ...old.base_values }
      old.label = entry.label || old.label
      old.queued_at = now
      writeQueue(queue)
      return queue
    }
    queue.splice(existingIdx, 1)
  }
  queue.push(entry)
  writeQueue(queue)
  return queue
}

function normalise(v) {
  if (v === null || v === undefined) return ''
  const s = String(v).replace('T', ' ').trim()
  if (s !== '' && !Number.isNaN(Number(s))) return String(Number(s))
  return s
}

export function sameValue(a, b) {
  return normalise(a) === normalise(b)
}

/**
 * Fields the user edited that someone else ALSO changed on the server since our base snapshot.
 */
export function findOverlap(body, baseValues, serverMeet) {
  return Object.keys(body).filter((field) => {
    if (field === 'base_version') return false
    if (!(field in baseValues)) return true // no snapshot -> be conservative, trust the server
    return !sameValue(serverMeet[field], baseValues[field]) && !sameValue(serverMeet[field], body[field])
  })
}

function describe(item) {
  const what = {
    rsvp: 'RSVP',
    cancel_rsvp: 'RSVP cancellation',
    like: 'like',
    meet_edit: 'edit',
    other: 'change'
  }[item.type || 'other']
  return item.label ? `${what} for "${item.label}"` : what
}

function isRetryable(err) {
  if (!err) return true
  if (err.network || !err.status) return true
  return err.status >= 500 || err.status === 401 || err.status === 408 || err.status === 429
}

async function replayEdit(item, send, result) {
  const body = { ...item.body }
  const withVersion = (version) => (version ? { ...body, base_version: version } : body)
  try {
    const data = await send(item.method, item.endpoint, withVersion(item.base_version))
    result.serverState.push({ kind: 'meet', data })
    return
  } catch (err) {
    if (!err || err.status !== 409 || !err.data || !err.data.server) throw err
    const serverMeet = err.data.server
    const overlap = findOverlap(body, item.base_values || {}, serverMeet)
    const keep = {}
    Object.keys(body).forEach((k) => {
      if (!overlap.includes(k)) keep[k] = body[k]
    })
    const newVersion = serverMeet.updated_at || serverMeet.created_at

    if (Object.keys(keep).length === 0) {
      result.serverState.push({ kind: 'meet', data: { meet: serverMeet } })
      result.conflicts.push({
        id: item.id,
        type: item.type,
        label: item.label,
        resolution: 'server_wins',
        fields: overlap,
        message: `Your ${describe(item)} conflicted with newer changes (${overlap.join(', ')}). The server version was kept.`
      })
      return
    }

    const data = await send(item.method, item.endpoint, { ...keep, base_version: newVersion })
    result.serverState.push({ kind: 'meet', data })
    result.conflicts.push({
      id: item.id,
      type: item.type,
      label: item.label,
      resolution: overlap.length ? 'server_wins' : 'merged',
      fields: overlap,
      message: overlap.length
        ? `Your ${describe(item)} was partly applied. Newer server values were kept for: ${overlap.join(', ')}.`
        : `Your ${describe(item)} was merged with changes made by someone else.`
    })
  }
}

async function replayLike(item, send, result) {
  let data = await send(item.method, item.endpoint, item.body)
  // The API toggles. If the server state already differed from what the user intended, toggle again.
  if (typeof item.desired === 'boolean' && data && typeof data.liked === 'boolean' && data.liked !== item.desired) {
    data = await send(item.method, item.endpoint, item.body)
  }
  result.serverState.push({ kind: 'like', data })
}

/**
 * Replay the queue in order. Returns { synced, remaining, conflicts, serverState, stopped }.
 * `stopped` is null, or the reason the replay paused ('network' | 'auth' | 'server').
 */
export async function replayQueue(send) {
  const queue = readQueue()
  const result = { synced: 0, remaining: 0, conflicts: [], serverState: [], stopped: null }
  const remaining = []

  for (let i = 0; i < queue.length; i += 1) {
    const item = queue[i]
    if (result.stopped) {
      remaining.push(item)
      continue
    }
    try {
      if (item.type === 'meet_edit') {
        await replayEdit(item, send, result)
      } else if (item.type === 'like') {
        await replayLike(item, send, result)
      } else {
        const data = await send(item.method, item.endpoint, item.body)
        result.serverState.push({ kind: item.type, data })
      }
      result.synced += 1
    } catch (err) {
      if (isRetryable(err)) {
        item.attempts = (item.attempts || 0) + 1
        remaining.push(item)
        result.stopped = err && err.status === 401 ? 'auth' : err && err.status >= 500 ? 'server' : 'network'
      } else {
        const reasons = {
          404: 'it no longer exists',
          403: 'you no longer have permission',
          409: (err && err.message) || 'it conflicts with the current server state'
        }
        result.conflicts.push({
          id: item.id,
          type: item.type,
          label: item.label,
          resolution: 'dropped',
          fields: [],
          message: `Your ${describe(item)} could not be applied because ${
            reasons[err.status] || (err && err.message) || 'the server rejected it'
          }.`
        })
      }
    }
  }

  writeQueue(remaining)
  result.remaining = remaining.length
  return result
}
