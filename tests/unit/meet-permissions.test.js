
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import MeetDetailView from '../../src/views/MeetDetailView.vue'
import { useAuthStore } from '../../src/stores/authStore'
import { useMeetStore } from '../../src/stores/meetStore'

vi.mock('../../src/services/externalApis', () => ({
  fetchMeetWeather: vi.fn().mockResolvedValue(null),
  POPULAR_CAR_MAKES: [],
  fetchVehicleModelsForMake: vi.fn().mockResolvedValue({ models: [] })
}))

vi.mock('../../src/services/emailService', () => ({
  sendRsvpEmail: vi.fn().mockResolvedValue(true)
}))

describe('Meet Detail — Editing Permissions & Privacy Preview', () => {
  let router
  let authStore
  let meetStore

  beforeEach(async () => {
    setActivePinia(createPinia())

    authStore = useAuthStore()
    meetStore = useMeetStore()

    meetStore.fetchMeetById = vi.fn(async () => {
      meetStore.currentMeet = {
        id: 1,
        host_id: 10,
        title: 'Test Coffee Meet',
        latitude: null,
        longitude: null,
        parking_note: 'TEST PRIVATE PARKING BAY A12',
        host_contact: 'TEST HOST CONTACT 0123456789',
        comments: [],
        rsvps: [],
        likes: []
      }

      return meetStore.currentMeet
    })

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/meets/:id', component: MeetDetailView },
        { path: '/meets/:id/edit', component: { template: '<div>Edit</div>' } },
        { path: '/meets', component: { template: '<div>Meets</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })

    await router.push('/meets/1')
    await router.isReady()
  })

  async function mountMeetDetail(user) {
    authStore.user = user
    authStore.token = user ? 'test-auth-token' : null

    const wrapper = mount(MeetDetailView, {
      global: {
        plugins: [router],
        stubs: {
          EventMap: true
        }
      }
    })

    await flushPromises()
    return wrapper
  }

  it('hides editing buttons from guests', async () => {
    const view = await mountMeetDetail(null)

    expect(view.text()).not.toContain('Edit Meet')
    expect(view.text()).not.toContain('Delete')
    expect(view.text()).not.toContain('Privacy Shield Preview')
  })

  it('allows the host to edit and delete their own meet', async () => {
    const view = await mountMeetDetail({
      id: 10,
      role: 'member'
    })

    expect(view.text()).toContain('Edit Meet')
    expect(view.text()).toContain('Delete')
    expect(view.text()).toContain('Privacy Shield Preview')
  })

  it('hides editing buttons from other members', async () => {
    const view = await mountMeetDetail({
      id: 20,
      role: 'member'
    })

    expect(view.text()).not.toContain('Edit Meet')
    expect(view.text()).not.toContain('Delete')
    expect(view.text()).not.toContain('Privacy Shield Preview')
  })

  it('allows admins to edit and delete any meet', async () => {
    const view = await mountMeetDetail({
      id: 30,
      role: 'admin'
    })

    expect(view.text()).toContain('Edit Meet')
    expect(view.text()).toContain('Delete')
    expect(view.text()).toContain('Privacy Shield Preview')
  })

  it('hides private details when the host selects Guest Preview', async () => {
    const view = await mountMeetDetail({
      id: 10,
      role: 'member'
    })

    expect(view.text()).toContain('TEST PRIVATE PARKING BAY A12')
    expect(view.text()).toContain('TEST HOST CONTACT 0123456789')

    const guestButton = view.findAll('button').find((button) =>
      button.text().includes('Guest Preview')
    )

    expect(guestButton).toBeTruthy()

    await guestButton.trigger('click')
    await flushPromises()

    expect(view.text()).toContain('Member Privacy Shield')
    expect(view.text()).not.toContain('TEST PRIVATE PARKING BAY A12')
    expect(view.text()).not.toContain('TEST HOST CONTACT 0123456789')

    view.unmount()
  })

  it('restores private details when the host selects Member Preview', async () => {
    const view = await mountMeetDetail({
      id: 10,
      role: 'member'
    })

    const guestButton = view.findAll('button').find((button) =>
      button.text().includes('Guest Preview')
    )

    expect(guestButton).toBeTruthy()

    await guestButton.trigger('click')
    await flushPromises()

    expect(view.text()).not.toContain('TEST PRIVATE PARKING BAY A12')

    const memberButton = view.findAll('button').find((button) =>
      button.text().includes('Member Preview')
    )

    expect(memberButton).toBeTruthy()

    await memberButton.trigger('click')
    await flushPromises()

    expect(view.text()).toContain('TEST PRIVATE PARKING BAY A12')
    expect(view.text()).toContain('TEST HOST CONTACT 0123456789')
    expect(view.text()).not.toContain('Member Privacy Shield')

    view.unmount()
  })
})
