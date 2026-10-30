import { ref } from 'vue'
import { loadDb, saveDb } from '../services/localDb'
import { useMeetStore } from '../stores/meetStore'
import { useToast } from './useToast'

/**
 * Roast & Redline (Cars & Coffee) — Real-Time Community Pulse Simulator
 *
 * Simulates a live WebSocket / Server-Sent Events (SSE) stream of community activity
 * across Melbourne and Malaysia:
 *   1. New Pop-Up Meets appearing in real time (growing the 108+ meet catalog)
 *   2. Live Car Roll-Call RSVPs arriving on upcoming meets
 *   3. New Spotting Feed snaps posted by members
 *
 * Can be toggled ON/PAUSE or triggered on demand via "+1 Live Event" for demonstrations.
 */

const isLiveEnabled = ref(true)
const liveEventsLog = ref([])
const pulseCounter = ref(0)
let timerId = null
let initialized = false

const LIVE_MEET_TEMPLATES = [
  {
    title: 'Bukit Tunku Sunrise Touge & Espresso Pop-Up',
    vibe: 'Morning Coffee',
    region: 'Malaysia',
    cafe_name: 'Kenny Hills Bakers, Bukit Tunku KL',
    address: 'Lot B-2, Taman Tunku, Off Jalan Langgak Tunku, 50480 Kuala Lumpur',
    parking_note: 'Upper Tree-Lined Courtyard Bays 1–35 — marshal on duty.',
    latitude: 3.1684,
    longitude: 101.6782,
    capacity: 55,
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Black Rock Clocktower Coastal Flat White Run',
    vibe: 'Euro & Classics',
    region: 'Australia',
    cafe_name: 'Black Rock Beach Kiosk, Bayside',
    address: '30A Beach Rd, Black Rock VIC 3193',
    parking_note: 'Half Moon Bay Foreshore Lower Lot — smooth asphalt entry.',
    latitude: -37.9682,
    longitude: 145.0114,
    capacity: 65,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Saradise Kuching Late-Night Matcha & Rotary Lineup',
    vibe: 'JDM & Brews',
    region: 'Malaysia',
    cafe_name: 'Earthlings Coffee Workshop, Saradise Kuching',
    address: 'Block B1, Saradise, 93350 Kuching, Sarawak',
    parking_note: 'Saradise Square Central Diagonal Bays.',
    latitude: 1.5038,
    longitude: 110.3552,
    capacity: 70,
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Portsea Pier Morning Cortado & Air-Cooled Run',
    vibe: 'Morning Coffee',
    region: 'Australia',
    cafe_name: 'Portsea Village Roasters, Mornington Peninsula',
    address: '3760 Point Nepean Rd, Portsea VIC 3944',
    parking_note: 'Pier Forecourt North Row.',
    latitude: -38.3198,
    longitude: 144.7124,
    capacity: 50,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Desa ParkCity Lakefront Sunset Kopi & GT Cars',
    vibe: 'Sunset Chill',
    region: 'Malaysia',
    cafe_name: 'The Waterfront Roastery, Desa ParkCity',
    address: '5 Persiaran Residen, Desa ParkCity, 52200 Kuala Lumpur',
    parking_note: 'West Wing Open VIP Lot.',
    latitude: 3.1869,
    longitude: 101.6295,
    capacity: 80,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80'
  }
]

const LIVE_RSVP_BUILDS = [
  { driver: 'Harith Z.', car: '1999 Nissan Skyline GT-R (R34 V-Spec)', region: 'Malaysia' },
  { driver: 'Liam O’Connor', car: '2023 Porsche 911 GT3 Touring (992)', region: 'Australia' },
  { driver: 'Farah Nadia', car: '2024 Honda Civic Type R (FL5 Championship White)', region: 'Malaysia' },
  { driver: 'Marcus Chen', car: '1997 Mazda RX-7 Spirit R (FD3S)', region: 'Australia' },
  { driver: 'Darren Wong', car: '2011 Proton Satria Neo R3 Lotus Racing #042', region: 'Malaysia' },
  { driver: 'Elena Rossi', car: '1974 Alfa Romeo GT 1600 Junior', region: 'Australia' }
]

const LIVE_POST_SNAPS = [
  {
    title: 'Steam rising off the flat whites next to two Hakosuka Skylines',
    body: '6:50 AM arrival paid off! Front row bay right outside the espresso bar.',
    car_tag: 'Nissan Skyline 2000GT-R (KPGC10)',
    location_tag: 'Port Melbourne, VIC',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Kuching Sarawak riverfront golden hour lineup is filling up fast',
    body: 'Over 40 cars parked already and the Gula Apong cold brew keg just tapped.',
    car_tag: 'Proton Satria Neo R3',
    location_tag: 'Kuching Waterfront, Sarawak',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80'
  }
]

function nowIsoSql() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export function useRealtimePulse() {
  const { showToast } = useToast()

  async function emitPulseEvent(options = { notifyToast: false }) {
    const db = loadDb()
    const step = pulseCounter.value
    pulseCounter.value += 1

    const mode = step % 3 // 0 = new meet, 1 = new RSVP, 2 = new spotting post
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    if (mode === 0) {
      const tpl = LIVE_MEET_TEMPLATES[step % LIVE_MEET_TEMPLATES.length]
      const newId = db.meets.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1
      const dayNum = 10 + (step % 18)
      const newMeet = {
        id: newId,
        title: `${tpl.title}`,
        description: `Live community pop-up meet at ${tpl.cafe_name}. Verified low-car parking access and specialty pour-over bar open from 7:00 AM.`,
        vibe: tpl.vibe,
        region: tpl.region,
        cafe_name: tpl.cafe_name,
        address: tpl.address,
        parking_note: tpl.parking_note,
        host_contact: 'Live Community Dispatch — @roast_and_redline',
        latitude: Number((tpl.latitude + ((step % 5) - 2) * 0.0012).toFixed(4)),
        longitude: Number((tpl.longitude + ((step % 5) - 2) * 0.0012).toFixed(4)),
        meet_datetime: `2026-12-${String(dayNum).padStart(2, '0')} 07:30:00`,
        end_datetime: `2026-12-${String(dayNum).padStart(2, '0')} 10:30:00`,
        capacity: tpl.capacity,
        image: tpl.image,
        source_url: null,
        host_id: (step % 6) + 1,
        status: 'upcoming',
        created_at: nowIsoSql()
      }
      db.meets.unshift(newMeet)
      saveDb(db)

      const entry = {
        id: `pulse-${Date.now()}-${step}`,
        kind: 'meet',
        badge: 'NEW MEET',
        region: tpl.region,
        text: `${tpl.title} (${tpl.cafe_name})`,
        targetRoute: `/meets/${newId}`,
        time: timestamp
      }
      liveEventsLog.value = [entry, ...liveEventsLog.value].slice(0, 12)
      if (options.notifyToast) {
        showToast(`Live Meet Posted: ${tpl.title}`, 'success', 3500)
      }
    } else if (mode === 1) {
      const build = LIVE_RSVP_BUILDS[step % LIVE_RSVP_BUILDS.length]
      const targetMeet = db.meets[step % Math.min(12, db.meets.length)] || db.meets[0]
      if (targetMeet) {
        const nextRsvpId = db.meet_rsvps.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1
        db.meet_rsvps.push({
          id: nextRsvpId,
          meet_id: targetMeet.id,
          user_id: (step % 6) + 1,
          attend_type: 'bringing_car',
          car_brought: build.car,
          created_at: nowIsoSql()
        })
        saveDb(db)

        const entry = {
          id: `pulse-${Date.now()}-${step}`,
          kind: 'rsvp',
          badge: 'ROLL-CALL RSVP',
          region: targetMeet.region,
          text: `${build.driver} locked in ${build.car} for "${targetMeet.title}"`,
          targetRoute: `/meets/${targetMeet.id}`,
          time: timestamp
        }
        liveEventsLog.value = [entry, ...liveEventsLog.value].slice(0, 12)
        if (options.notifyToast) {
          showToast(`Live Roll-Call: ${build.car} joined ${targetMeet.title}`, 'info', 3500)
        }
      }
    } else {
      const snap = LIVE_POST_SNAPS[step % LIVE_POST_SNAPS.length]
      const nextPostId = db.posts.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1
      db.posts.unshift({
        id: nextPostId,
        user_id: (step % 6) + 1,
        meet_id: 1,
        title: snap.title,
        body: snap.body,
        car_tag: snap.car_tag,
        location_tag: snap.location_tag,
        image: snap.image,
        created_at: nowIsoSql()
      })
      saveDb(db)

      const entry = {
        id: `pulse-${Date.now()}-${step}`,
        kind: 'post',
        badge: 'LIVE SPOTTING',
        region: snap.location_tag.includes('Sarawak') ? 'Malaysia' : 'Australia',
        text: `${snap.car_tag} spotted at ${snap.location_tag}`,
        targetRoute: '/feed',
        time: timestamp
      }
      liveEventsLog.value = [entry, ...liveEventsLog.value].slice(0, 12)
      if (options.notifyToast) {
        showToast(`Live Spotting: ${snap.car_tag} at ${snap.location_tag}`, 'success', 3500)
      }
    }

    try {
      const meetStore = useMeetStore()
      await meetStore.fetchMeets()
    } catch {
      // ignore if store not active
    }
  }

  function startTimer() {
    stopTimer()
    if (typeof window === 'undefined') return
    timerId = window.setInterval(() => {
      if (isLiveEnabled.value && document.visibilityState === 'visible') {
        emitPulseEvent({ notifyToast: false })
      }
    }, 14000)
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function toggleLiveStream() {
    isLiveEnabled.value = !isLiveEnabled.value
    if (isLiveEnabled.value) {
      startTimer()
    } else {
      stopTimer()
    }
  }

  async function triggerPulseNow() {
    await emitPulseEvent({ notifyToast: true })
  }

  function init() {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    // Seed 2 initial live stream ticker items immediately so the ticker looks populated on load
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    liveEventsLog.value = [
      {
        id: 'init-1',
        kind: 'rsvp',
        badge: 'ROLL-CALL RSVP',
        region: 'Australia',
        text: 'Syed A. locked in 2019 Porsche 911 Carrera S for St Kilda Pier Sunrise Espresso',
        targetRoute: '/meets/1',
        time: nowStr
      },
      {
        id: 'init-2',
        kind: 'meet',
        badge: '108+ MEETS LIVE',
        region: 'Malaysia',
        text: 'Glenmarie Artisan Roast & Kuching Waterfront Kopi rosters open for registration',
        targetRoute: '/meets',
        time: nowStr
      }
    ]
    startTimer()
  }

  return {
    isLiveEnabled,
    liveEventsLog,
    pulseCounter,
    init,
    toggleLiveStream,
    triggerPulseNow
  }
}
