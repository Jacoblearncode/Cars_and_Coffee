import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { resetLocalDb, haversineKm } from '../../src/services/localDb'
import { api, clearOfflineOutbox, enqueueOfflineAction, getOfflineOutbox } from '../../src/services/api'
import { useAuthStore } from '../../src/stores/authStore'
import { useMeetStore } from '../../src/stores/meetStore'
import { useThemeStore } from '../../src/stores/themeStore'
import { useOfflineSync } from '../../src/composables/useOfflineSync'
import { decodeCruisingWeather, fetchVehicleModelsForMake } from '../../src/services/externalApis'
import PaginationBar from '../../src/components/PaginationBar.vue'

describe('Cars & Coffee — Core Architecture, APIs & Stores Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    resetLocalDb()
    clearOfflineOutbox()
    setActivePinia(createPinia())
  })

  it('masks parking_note and host_contact for unauthenticated Guests and unlocks them for Members', async () => {
    // 1. Guest request
    const guestRes = await api.get('meets/1')
    expect(guestRes.meet.is_masked).toBe(true)
    expect(guestRes.meet.parking_note).toContain('Sign in to unlock')

    // 2. Authenticate as Member
    const authStore = useAuthStore()
    await authStore.login('member@carsandcoffee.com', 'Password123!')
    expect(authStore.isAuthenticated).toBe(true)

    const memberRes = await api.get('meets/1')
    expect(memberRes.meet.is_masked).toBe(false)
    expect(memberRes.meet.parking_note).toContain('Jacka Blvd')
  })

  it('supports search, vibe filter, region filter, sorting, and pagination on /meets', async () => {
    const page1 = await api.get('meets', { page: 1, limit: 3 })
    expect(page1.data.length).toBe(3)
    expect(page1.total).toBe(8)
    expect(page1.total_pages).toBe(3)

    const malaysiaOnly = await api.get('meets', { region: 'Malaysia', limit: 10 })
    expect(malaysiaOnly.data.every((m) => m.region === 'Malaysia')).toBe(true)

    const jdmOnly = await api.get('meets', { vibe: 'JDM & Brews', limit: 10 })
    expect(jdmOnly.data.every((m) => m.vibe === 'JDM & Brews')).toBe(true)

    const kuchingSearch = await api.get('meets', { search: 'Kuching', limit: 10 })
    expect(kuchingSearch.data.length).toBeGreaterThanOrEqual(1)
    expect(kuchingSearch.data[0].title).toContain('Kuching')
  })

  it('allows any logged-in member to create, edit, and delete their own Cars & Coffee meet', async () => {
    const authStore = useAuthStore()
    const meetStore = useMeetStore()
    await authStore.login('member@carsandcoffee.com', 'Password123!')

    const created = await meetStore.createMeet({
      title: 'Albert Park Lake Sunday Flat White Run',
      description: 'Casual lakeside morning coffee and classic JDM/Euro chat.',
      vibe: 'Morning Coffee',
      region: 'Australia',
      cafe_name: 'Pipis Kiosk, Albert Park',
      address: '129A Beaconsfield Pde, Albert Park VIC 3206',
      parking_note: 'Lakeside Aughtie Dr angle bays.',
      latitude: -37.845,
      longitude: 144.968,
      capacity: 40
    })
    expect(created.id).toBeGreaterThan(8)
    expect(created.title).toBe('Albert Park Lake Sunday Flat White Run')

    const updated = await meetStore.updateMeet(created.id, {
      title: 'Albert Park Lake Updated Coffee Meet',
      capacity: 55
    })
    expect(updated.title).toBe('Albert Park Lake Updated Coffee Meet')
    expect(updated.capacity).toBe(55)

    await meetStore.deleteMeet(created.id)
    await expect(api.get(`meets/${created.id}`)).rejects.toThrow()
  })

  it('handles Car Roll-Call RSVPs with vehicle details and updates counts', async () => {
    const authStore = useAuthStore()
    const meetStore = useMeetStore()
    await authStore.login('amirul@carsandcoffee.com', 'Password123!')

    const updatedMeet = await meetStore.rsvpToMeet(
      1,
      'bringing_car',
      '2010 Proton Satria Neo R3 Lotus Racing'
    )
    const found = updatedMeet.rsvps.find((r) => Number(r.user_id) === Number(authStore.user.id))
    expect(found).toBeTruthy()
    expect(found.car_brought).toBe('2010 Proton Satria Neo R3 Lotus Racing')

    const afterCancel = await meetStore.cancelRsvp(1)
    expect(
      afterCancel.rsvps.some((r) => Number(r.user_id) === Number(authStore.user.id))
    ).toBe(false)
  })

  it('supports social feed posts CRUD, likes toggle, and comments', async () => {
    const authStore = useAuthStore()
    const meetStore = useMeetStore()
    await authStore.login('chloe@carsandcoffee.com', 'Password123!')

    const newPost = await meetStore.createPost({
      title: 'Morning mist over the Dandenongs in the NA8C Miata',
      body: 'Top down at 6:45 AM with a hot long black before the traffic.',
      car_tag: '1995 Mazda MX-5 Miata',
      location_tag: 'SkyHigh Mount Dandenong'
    })
    expect(newPost.title).toContain('NA8C Miata')

    const likeRes = await meetStore.toggleLike('post', newPost.id)
    expect(likeRes.liked).toBe(true)
    expect(likeRes.likes_count).toBe(1)

    const comment = await meetStore.addComment('post', newPost.id, 'Love the pop-up headlights!')
    expect(comment.body).toBe('Love the pop-up headlights!')

    await meetStore.deletePost(newPost.id)
  })

  it('imports 2026 event metadata via Smart Event Link Importer (`import-link`)', async () => {
    const res = await api.post('import-link', {
      url: 'https://peatix.com/event/saradise-kuching-cars-coffee-nov2026'
    })
    expect(res.imported).toBeTruthy()
    expect(res.imported.region).toBe('Malaysia')
    expect(res.imported.cafe_name).toContain('Kuching')
  })

  it('pins meets to the PWA Offline Vault and queues offline outbox actions', () => {
    const { savedMeets, isMeetSavedOffline, toggleSaveMeetOffline, clearOfflineVault } =
      useOfflineSync()
    clearOfflineVault()

    const sampleMeet = {
      id: 99,
      title: 'Borneo Highlands Touge & Kopi',
      vibe: 'Morning Coffee',
      region: 'Malaysia',
      cafe_name: 'Highlands Brew',
      address: 'Padawan, Sarawak',
      parking_note: 'Summit Lookout Lot A',
      latitude: 1.12,
      longitude: 110.22,
      meet_datetime: '2026-12-12 07:30:00'
    }

    const saved = toggleSaveMeetOffline(sampleMeet)
    expect(saved).toBe(true)
    expect(isMeetSavedOffline(99)).toBe(true)
    expect(savedMeets.value.length).toBe(1)

    enqueueOfflineAction('POST', 'meets/1/rsvp', { attend_type: 'bringing_car' })
    expect(getOfflineOutbox().length).toBe(1)
  })

  it('computes Haversine GPS distance and decodes cruising weather & domestic AU/MY vehicles', async () => {
    const dist = haversineKm(-37.8136, 144.9631, -37.864, 144.9667)
    expect(dist).toBeGreaterThan(4)
    expect(dist).toBeLessThan(8)

    const sunny = decodeCruisingWeather(0, 5)
    expect(sunny.condition).toContain('Sunny')

    const protonModels = await fetchVehicleModelsForMake('Proton')
    expect(protonModels.models).toContain('Satria Neo R3 Lotus Racing')
  })

  it('manages color-scheme overrides cleanly in themeStore', () => {
    const themeStore = useThemeStore()
    const initial = themeStore.resolvedTheme
    themeStore.toggleTheme()
    expect(themeStore.resolvedTheme).not.toBe(initial)
  })

  it('renders PaginationBar and emits page changes', async () => {
    const wrapper = mount(PaginationBar, {
      props: { page: 1, totalPages: 3, total: 15 }
    })
    expect(wrapper.text()).toContain('Page 1 of 3')
    const buttons = wrapper.findAll('button.page-link')
    await buttons[2].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
  })
})
