import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { resetLocalDb, loadDb } from '../../src/services/localDb'
import { clearOfflineOutbox, getOfflineOutbox } from '../../src/services/api'
import { useAuthStore } from '../../src/stores/authStore'
import { useMeetStore } from '../../src/stores/meetStore'
import { buildCheckInUrl, parseCheckInPayload } from '../../src/composables/useCheckIn'

describe('QR check-in — payload helpers', () => {
  it('builds a hash-router link and parses it back', () => {
    const url = buildCheckInUrl(12, '12.1999999999.sig_-x', 'https://example.com/app/')
    expect(url).toBe('https://example.com/app/#/checkin?m=12&t=12.1999999999.sig_-x')
    expect(parseCheckInPayload(url)).toEqual({ meetId: 12, token: '12.1999999999.sig_-x' })
  })

  it('accepts a bare token and rejects junk', () => {
    expect(parseCheckInPayload('7.1999999999.abc')).toEqual({ meetId: 7, token: '7.1999999999.abc' })
    expect(parseCheckInPayload('hello world')).toBeNull()
    expect(parseCheckInPayload('')).toBeNull()
    expect(parseCheckInPayload('https://example.com/#/checkin?m=3')).toBeNull()
  })
})

describe('QR check-in — local engine flow', () => {
  let auth
  let store
  let meet
  let hostEmail

  beforeEach(async () => {
    localStorage.clear()
    resetLocalDb()
    clearOfflineOutbox()
    setActivePinia(createPinia())
    auth = useAuthStore()
    store = useMeetStore()

    const db = loadDb()
    meet = db.meets.find((m) => m.status !== 'cancelled')
    hostEmail = db.users.find((u) => Number(u.id) === Number(meet.host_id)).email
  })

  async function loginAsAttendee() {
    const db = loadDb()
    const attendee = db.users.find((u) => u.role !== 'admin' && Number(u.id) !== Number(meet.host_id))
    await auth.login(attendee.email, 'Password123!')
    return attendee
  }

  it('only the host can fetch a check-in code', async () => {
    await loginAsAttendee()
    await expect(store.fetchCheckInCode(meet.id)).rejects.toMatchObject({ status: 403 })
  })

  it('checks an RSVP\'d attendee in with a valid code, and is idempotent', async () => {
    await auth.login(hostEmail, 'Password123!')
    const { token } = await store.fetchCheckInCode(meet.id)
    auth.logout()

    const attendee = await loginAsAttendee()
    await store.rsvpToMeet(meet.id, 'bringing_car', 'Test Car')

    const first = await store.checkInToMeet(meet.id, { token })
    const mine = first.meet.rsvps.find((r) => Number(r.user_id) === Number(attendee.id))
    expect(mine.checked_in_at).toBeTruthy()
    expect(first.already_checked_in).toBe(false)
    expect(first.meet.checked_in_count).toBeGreaterThanOrEqual(1)

    const second = await store.checkInToMeet(meet.id, { token })
    expect(second.already_checked_in).toBe(true)
  })

  it('rejects invalid codes and attendees without an RSVP', async () => {
    await loginAsAttendee()
    await expect(store.checkInToMeet(meet.id, { token: `${meet.id}.1.forged` })).rejects.toMatchObject({
      status: 400
    })

    await auth.login(hostEmail, 'Password123!')
    const { token } = await store.fetchCheckInCode(meet.id)
    auth.logout()
    await loginAsAttendee()
    await store.cancelRsvp(meet.id)
    await expect(store.checkInToMeet(meet.id, { token })).rejects.toMatchObject({ status: 409 })
  })

  it('lets the host mark an attendee arrived manually and undo it', async () => {
    const attendee = await loginAsAttendee()
    await store.rsvpToMeet(meet.id, 'spectating', '')
    auth.logout()

    await auth.login(hostEmail, 'Password123!')
    const marked = await store.checkInToMeet(meet.id, { userId: attendee.id })
    expect(marked.meet.rsvps.find((r) => Number(r.user_id) === Number(attendee.id)).checked_in_at).toBeTruthy()

    const undone = await store.undoCheckIn(meet.id, attendee.id)
    expect(undone.meet.rsvps.find((r) => Number(r.user_id) === Number(attendee.id)).checked_in_at).toBeNull()
  })

  it('never queues a check-in in the offline outbox', async () => {
    await loginAsAttendee()
    await store.rsvpToMeet(meet.id, 'spectating', '')
    await store.checkInToMeet(meet.id, { token: 'x' }).catch(() => {})
    expect(getOfflineOutbox().some((q) => /checkin/.test(q.endpoint))).toBe(false)
  })
})
