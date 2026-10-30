/**
 * Cars & Coffee — Synchronized Seed Data (Matches `database/seed.sql` 1:1 for Base 8 Meets,
 * plus Deterministic 100+ Extended Meets & 36+ Spotting Posts in Live Application Mode)
 * Default password for all seeded demo accounts: Password123!
 */

export const MEET_VIBES = [
  { name: 'Morning Coffee', slug: 'morning-coffee', icon: 'bi-cup-hot-fill', badge: 'warning' },
  { name: 'JDM & Brews', slug: 'jdm-brews', icon: 'bi-lightning-charge-fill', badge: 'danger' },
  { name: 'Euro & Classics', slug: 'euro-classics', icon: 'bi-gem', badge: 'info' },
  { name: 'Sunset Chill', slug: 'sunset-chill', icon: 'bi-sunset-fill', badge: 'primary' },
  { name: 'Night Meet', slug: 'night-meet', icon: 'bi-moon-stars-fill', badge: 'secondary' }
]

export const REGIONAL_HUBS = {
  All: { label: 'All Regions (AU & MY)', lat: -15.0, lng: 125.0, zoom: 3 },
  Australia: { label: 'Melbourne, Australia', lat: -37.8136, lng: 144.9631, zoom: 11 },
  Malaysia: { label: 'Malaysia (KL & Kuching)', lat: 2.3, lng: 105.8, zoom: 6 },
  Kuching: { label: 'Kuching, Sarawak', lat: 1.5533, lng: 110.3592, zoom: 13 },
  KualaLumpur: { label: 'Klang Valley / KL', lat: 3.0882, lng: 101.5851, zoom: 11 }
}

/**
 * Curated Late-2026 Smart Link Presets for 1-click testing of the Smart Link Importer
 */
export const SMART_LINK_PRESETS_2026 = [
  {
    label: 'Nov 2026 · Melbourne High Country Espresso & Touge',
    url: 'https://carsandcoffee.org.au/events/2026-11-high-country-espresso',
    title: 'High Country Espresso & Black Spur Morning Run',
    description:
      'Gather at Healesville Artisan Roasters at 7:00 AM for flat whites and pastries before a relaxed scenic drive across the Black Spur.',
    vibe: 'Morning Coffee',
    region: 'Australia',
    cafe_name: 'Habituel Coffee & Bakehouse, Healesville',
    address: '218 Maroondah Hwy, Healesville VIC 3777',
    parking_note: 'Park in the rear Nicholson St public lot — smooth entry for lowered cars.',
    latitude: -37.6542,
    longitude: 145.5162,
    meet_datetime: '2026-11-29T07:00',
    end_datetime: '2026-11-29T10:30',
    capacity: 55,
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80'
  },
  {
    label: 'Nov 2026 · Kuching Saradise Specialty Coffee & JDM Night',
    url: 'https://peatix.com/event/saradise-kuching-cars-coffee-nov2026',
    title: 'Saradise Specialty Brews & Borneo JDM Lineup',
    description:
      'Evening specialty coffee hangout in Saradise Kuching featuring Sarawak JDM classics, Proton R3 builds, and pour-over tasting.',
    vibe: 'JDM & Brews',
    region: 'Malaysia',
    cafe_name: 'Earthlings Coffee Workshop, Saradise Kuching',
    address: 'Ground Floor, Block B1, Saradise, 93350 Kuching, Sarawak',
    parking_note: 'Central Saradise Square diagonal bays reserved from 5:30 PM.',
    latitude: 1.5034,
    longitude: 110.3548,
    meet_datetime: '2026-11-21T17:30',
    end_datetime: '2026-11-21T21:00',
    capacity: 65,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80'
  },
  {
    label: 'Dec 2026 · Bangsar Sunday Cortado & Air-Cooled Classics',
    url: 'https://facebook.com/events/bangsar-cortado-classics-dec2026',
    title: 'Bangsar Sunday Cortado & Classic Euro Gathering',
    description:
      'Early Sunday morning gathering in Bangsar for air-cooled Porsches, classic Alfas, BMW M-cars, and artisanal cortados.',
    vibe: 'Euro & Classics',
    region: 'Malaysia',
    cafe_name: 'Pulp by Papa Palheta, Bangsar',
    address: '29-01 Jalan Riong, Bangsar, 59100 Kuala Lumpur',
    parking_note: 'Enter APW Bangsar main courtyard — marshals at gate from 7:15 AM.',
    latitude: 3.1239,
    longitude: 101.6712,
    meet_datetime: '2026-12-06T07:30',
    end_datetime: '2026-12-06T10:30',
    capacity: 50,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80'
  }
]

const AU_HUB_SPOTS = [
  { city: 'South Melbourne', cafe: 'ST. ALi Coffee Roasters', addr: '12-18 Yarra Pl, South Melbourne VIC 3205', lat: -37.8314, lng: 144.9602, note: 'Yarra Place wide kerbside bays & Coventry St rear lot.' },
  { city: 'Cremorne', cafe: 'Veneziano Coffee Richmond', addr: '16 River St, Richmond VIC 3121', lat: -37.8261, lng: 145.0124, note: 'Riverfront warehouse apron — flat concrete entry.' },
  { city: 'Collingwood', cafe: 'Proud Mary Roasters', addr: '172 Oxford St, Collingwood VIC 3066', lat: -37.8012, lng: 144.9845, note: ' Peel St & Cambridge St early Sunday bays.' },
  { city: 'Brighton Beach', cafe: 'Green Point Beach Kiosk', addr: '2 Esplanade, Brighton VIC 3186', lat: -37.9245, lng: 144.9868, note: 'Green Point Foreshore Carpark — North Ocean View Row.' },
  { city: 'Williamstown', cafe: 'Sebastian Beach Grill & Espresso', addr: '26 Esplanade, Williamstown VIC 3016', lat: -37.8675, lng: 144.8926, note: 'Esplanade angled beach bays — zero speed humps.' },
  { city: 'Mount Dandenong', cafe: 'SkyHigh Mount Dandenong Kiosk', addr: '26 Observatory Rd, Mount Dandenong VIC 3767', lat: -37.8271, lng: 145.3526, note: 'Upper Summit Lookout Asphalt Lot A.' },
  { city: 'Arthur’s Seat', cafe: 'Eagle Summit Roastery', addr: '795 Arthurs Seat Rd, Arthurs Seat VIC 3936', lat: -38.3541, lng: 144.9522, note: 'Summit Switchback Lookout Bays 1–60.' },
  { city: 'Lorne', cafe: 'Bottle of Milk & Espresso Bar', addr: '52 Mountjoy Pde, Lorne VIC 3232', lat: -38.5412, lng: 143.9748, note: 'Lorne Foreshore Promenade Lot after Great Ocean Rd run.' },
  { city: 'Geelong Waterfront', cafe: 'Sailors Rest Espresso Deck', addr: '3 Moorabool St, Geelong VIC 3220', lat: -38.1449, lng: 144.3612, note: 'Eastern Beach Road Pier Carpark.' },
  { city: 'Healesville', cafe: 'Habituel Coffee & Bakehouse', addr: '218 Maroondah Hwy, Healesville VIC 3777', lat: -37.6542, lng: 145.5162, note: 'Rear Nicholson St public lot — smooth entry for lowered cars.' },
  { city: 'Sorrento', cafe: 'Buckley’s Chance Roasters', addr: '174 Ocean Beach Rd, Sorrento VIC 3943', lat: -38.3401, lng: 144.7418, note: 'Morce Ave rear public carpark.' },
  { city: 'Albert Park', cafe: 'Pipis Kiosk Lakeshore', addr: '129A Beaconsfield Pde, Albert Park VIC 3206', lat: -37.8452, lng: 144.9681, note: 'Aughtie Drive lakeside Grand Prix circuit bays.' }
]

const MY_HUB_SPOTS = [
  { city: 'Bangsar, KL', cafe: 'Pulp by Papa Palheta', addr: '29-01 Jalan Riong, Bangsar, 59100 Kuala Lumpur', lat: 3.1239, lng: 101.6712, note: 'APW Bangsar inner courtyard — marshals from 7:00 AM.' },
  { city: 'Bukit Bintang, KL', cafe: 'Feeka Coffee Roasters', addr: '19 Jalan Mesui, Bukit Bintang, 50200 Kuala Lumpur', lat: 3.1488, lng: 101.7072, note: 'Changkat public surface lot 60m from cafe.' },
  { city: 'Mont Kiara, KL', cafe: 'VCR Ritchie Specialty Brew', addr: '2 Jalan Nikmat, Taman, Ampang / Mont Kiara, KL', lat: 3.1652, lng: 101.6524, note: 'Plaza Mont Kiara Open Boulevard Zone C.' },
  { city: 'Subang Jaya', cafe: 'Upstairs Cafe & Roastery SS15', addr: '45 Jalan SS 15/4B, Subang Jaya, 47500 Selangor', lat: 3.0761, lng: 101.5889, note: 'SS15 Multi-Level Lower Ground Wide Bays.' },
  { city: 'Petaling Jaya', cafe: 'Bean Brothers PJ Warehouse', addr: 'Jalan PJU 3/50, Sunway Damansara, 47810 PJ', lat: 3.1519, lng: 101.5941, note: 'Industrial courtyard — 90+ wide bays, lip friendly.' },
  { city: 'Genting Sempah', cafe: 'R&R Highland Brew Bar', addr: 'Lebuhraya Karak, 28750 Bentong, Pahang', lat: 3.3478, lng: 101.7875, note: 'Genting Sempah Northbound Touge Assembly Bays.' },
  { city: 'Saradise, Kuching', cafe: 'Earthlings Coffee Workshop', addr: 'Block B1, Saradise, 93350 Kuching, Sarawak', lat: 1.5034, lng: 110.3548, note: 'Saradise Central Square diagonal bays.' },
  { city: 'Padungan, Kuching', cafe: 'Bumbung Kopi & Roasters', addr: 'Jalan Padungan, 93100 Kuching, Sarawak', lat: 1.5542, lng: 110.3568, note: 'Padungan Jubilee Ground West Carpark.' },
  { city: 'Damai Beach, Sarawak', cafe: 'Santubong Coastal Espresso', addr: 'Teluk Bandung, Santubong, 93050 Kuching', lat: 1.7495, lng: 110.3156, note: 'Damai Central Seafront Lot.' },
  { city: 'Georgetown, Penang', cafe: 'Norm Micro Roastery', addr: '13 Gat Lebuh Gereja, 10300 George Town, Pulau Pinang', lat: 5.4164, lng: 100.3418, note: 'Weld Quay Heritage Pier Lot.' },
  { city: 'Senibong Cove, JB', cafe: 'Marina Specialty Kopi Bar', addr: 'Persiaran Senibong, 81750 Masai, Johor Bahru', lat: 1.4845, lng: 103.8195, note: 'Senibong Boardwalk Marina VIP Lot.' },
  { city: 'Ipoh Old Town', cafe: 'Burps & Giggles Roastery', addr: '93 Jalan Sultan Yussuf, 30000 Ipoh, Perak', lat: 4.5952, lng: 101.0778, note: 'Concubine Lane South Open Lot.' }
]

const CAR_THEMES = [
  { series: '90s Golden Era JDM & Matcha', vibe: 'JDM & Brews', img: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80' },
  { series: 'Air-Cooled 911 & Single-Origin Espresso', vibe: 'Euro & Classics', img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80' },
  { series: 'Sunrise Flat White & Touge Warmup', vibe: 'Morning Coffee', img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80' },
  { series: 'Golden Hour Rotary & Roadster Run', vibe: 'Sunset Chill', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80' },
  { series: 'Neon Espresso & Underground Street Spec', vibe: 'Night Meet', img: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&auto=format&fit=crop&q=80' },
  { series: 'Track-Day Brake Check & Cold Brew', vibe: 'JDM & Brews', img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&auto=format&fit=crop&q=80' },
  { series: 'Italian Coachbuilders & Cortado Social', vibe: 'Euro & Classics', img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80' },
  { series: 'Hot Hatch Roll-Call & Artisan Pour-Over', vibe: 'Morning Coffee', img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80' }
]

const SAMPLE_CARS = [
  '2024 Honda Civic Type R (FL5)',
  '2019 Porsche 911 Carrera S (991.2)',
  '2000 Nissan Skyline GT-R (R34)',
  '2023 Toyota GR86 Hakone Spec',
  '1995 Mazda MX-5 Miata (NA8C)',
  '2010 Proton Satria Neo R3 Lotus Racing',
  '1998 Mazda RX-7 Type RS (FD3S)',
  '2022 BMW M3 Competition Touring (G81)',
  '1992 Honda NSX Type-R (NA1)',
  '2024 Toyota GR Yaris Rallye',
  '1989 Porsche 911 Carrera 3.2 (G-Series)',
  '2005 Mitsubishi Lancer Evolution IX MR'
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

function appendExtendedDataset(base) {
  // Generate 100 additional curated meets (IDs 9..108 -> total 108 meets)
  for (let i = 0; i < 100; i += 1) {
    const id = 9 + i
    const isMalaysia = i % 2 === 1
    const hubList = isMalaysia ? MY_HUB_SPOTS : AU_HUB_SPOTS
    const hub = hubList[i % hubList.length]
    const theme = CAR_THEMES[i % CAR_THEMES.length]
    const hostId = (i % 6) + 1

    // Spread dates across Oct, Nov, Dec 2026 & Jan 2027
    const dayOffset = i - 8
    const dt = new Date(Date.UTC(2026, 9, 28, 7, 30, 0))
    dt.setUTCDate(dt.getUTCDate() + dayOffset)
    const year = dt.getUTCFullYear()
    const month = pad2(dt.getUTCMonth() + 1)
    const day = pad2(dt.getUTCDate())
    const startHour = theme.vibe === 'Night Meet' ? '19:00:00' : theme.vibe === 'Sunset Chill' ? '17:00:00' : i % 3 === 0 ? '07:00:00' : '08:00:00'
    const endHour = theme.vibe === 'Night Meet' ? '22:00:00' : theme.vibe === 'Sunset Chill' ? '20:00:00' : '11:00:00'

    const latJitter = (((i * 17) % 19) - 9) * 0.0018
    const lngJitter = (((i * 23) % 19) - 9) * 0.0018
    const status = dayOffset < -3 ? 'completed' : 'upcoming'

    base.meets.push({
      id,
      title: `${hub.city} — ${theme.series} #${Math.floor(i / 8) + 1}`,
      description: `Curated ${theme.vibe.toLowerCase()} session at ${hub.cafe} in ${hub.city}. Open to enthusiasts bringing JDM icons, Euro classics, and clean daily drivers. Specialty espresso bar opens early with dedicated marshal-guided parking.`,
      vibe: theme.vibe,
      region: isMalaysia ? 'Malaysia' : 'Australia',
      cafe_name: `${hub.cafe}, ${hub.city}`,
      address: hub.addr,
      parking_note: hub.note,
      host_contact: `Community Marshal Desk — +${isMalaysia ? '60 12-389' : '61 418'} ${pad2((i * 7) % 99)} ${pad2((i * 13) % 99)}`,
      latitude: Number((hub.lat + latJitter).toFixed(4)),
      longitude: Number((hub.lng + lngJitter).toFixed(4)),
      meet_datetime: `${year}-${month}-${day} ${startHour}`,
      end_datetime: `${year}-${month}-${day} ${endHour}`,
      capacity: 45 + ((i * 5) % 75),
      image: theme.img,
      source_url: null,
      host_id: hostId,
      status,
      created_at: '2026-10-15 09:00:00'
    })

    // Add 2–4 RSVPs per generated meet so popularity sorting & insights charts look rich
    const rsvpCount = 2 + (i % 3)
    for (let r = 0; r < rsvpCount; r += 1) {
      const uid = ((i + r) % 6) + 1
      base.meet_rsvps.push({
        id: base.meet_rsvps.length + 1,
        meet_id: id,
        user_id: uid,
        attend_type: r === 2 && i % 4 === 0 ? 'spectating' : 'bringing_car',
        car_brought:
          r === 2 && i % 4 === 0
            ? 'Grabbing Coffee / 35mm Film Camera'
            : SAMPLE_CARS[(i + r) % SAMPLE_CARS.length],
        created_at: '2026-10-24 10:00:00'
      })
    }

    // Add likes
    const likeUsers = [((i + 1) % 6) + 1, ((i + 3) % 6) + 1]
    likeUsers.forEach((uid) => {
      base.likes.push({
        id: base.likes.length + 1,
        user_id: uid,
        target_type: 'meet',
        target_id: id,
        created_at: '2026-10-24 11:00:00'
      })
    })
  }

  // Generate 32 additional spotting feed posts (IDs 5..36 -> total 36 posts)
  for (let p = 0; p < 32; p += 1) {
    const postId = 5 + p
    const isMalaysia = p % 2 === 1
    const hubList = isMalaysia ? MY_HUB_SPOTS : AU_HUB_SPOTS
    const hub = hubList[p % hubList.length]
    const theme = CAR_THEMES[p % CAR_THEMES.length]
    const car = SAMPLE_CARS[p % SAMPLE_CARS.length]
    const uid = (p % 6) + 1
    const linkedMeetId = 9 + (p * 3)

    base.posts.push({
      id: postId,
      user_id: uid,
      meet_id: linkedMeetId,
      title: `Spotted: ${car} parked outside ${hub.cafe}`,
      body: `Early morning crema and crisp exhaust notes at ${hub.city}. Dialed fitment, zero rev-bombing, and a packed line for single-origin pour-overs.`,
      car_tag: car.replace(/^\d{4}\s+/, ''),
      location_tag: hub.city,
      image: theme.img,
      created_at: `2026-10-${pad2(10 + (p % 18))} ${pad2(7 + (p % 12))}:${pad2((p * 7) % 60)}:00`
    })
  }
}

export function createInitialSeedDatabase(options = {}) {
  const isTestEnv =
    options.minimal === true ||
    (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE === 'test')

  const base = {
    users: [
      {
        id: 1,
        name: 'Jacob Pillai',
        email: 'admin@carsandcoffee.com',
        password: 'Password123!',
        role: 'admin',
        car_make: 'Honda',
        car_model: 'Civic Type R (FL5)',
        car_year: 2024,
        region: 'Australia',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        bio: 'Community Founder & flat-white enthusiast splitting time between Melbourne and Kuching.',
        created_at: '2026-09-01 08:00:00'
      },
      {
        id: 2,
        name: 'Syed Adam',
        email: 'syed@carsandcoffee.com',
        password: 'Password123!',
        role: 'member',
        car_make: 'Porsche',
        car_model: '911 Carrera S (991.2)',
        car_year: 2019,
        region: 'Australia',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=160&auto=format&fit=crop&q=80',
        bio: 'Sunday morning espresso runner & air/water-cooled Porsche collector in Melbourne.',
        created_at: '2026-09-03 09:15:00'
      },
      {
        id: 3,
        name: 'Naveed Khan',
        email: 'naveed@carsandcoffee.com',
        password: 'Password123!',
        role: 'member',
        car_make: 'Nissan',
        car_model: 'Skyline GT-R (R34)',
        car_year: 2000,
        region: 'Malaysia',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        bio: 'Hosting weekend Kopi & JDM mornings across Kuching Waterfront and Glenmarie KL.',
        created_at: '2026-09-05 10:30:00'
      },
      {
        id: 4,
        name: 'Gibson Tan',
        email: 'member@carsandcoffee.com',
        password: 'Password123!',
        role: 'member',
        car_make: 'Toyota',
        car_model: 'GR86',
        car_year: 2023,
        region: 'Australia',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
        bio: 'Daily-driven Hakone Green GR86 on Volk TE37s. Always down for a coastal coffee run.',
        created_at: '2026-09-07 14:20:00'
      },
      {
        id: 5,
        name: 'Chloe Vance',
        email: 'chloe@carsandcoffee.com',
        password: 'Password123!',
        role: 'member',
        car_make: 'Mazda',
        car_model: 'MX-5 Miata (NA8C)',
        car_year: 1995,
        region: 'Australia',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80',
        bio: '35mm film car spotter & classic roadster fan.',
        created_at: '2026-09-10 16:45:00'
      },
      {
        id: 6,
        name: 'Amirul Hakim',
        email: 'amirul@carsandcoffee.com',
        password: 'Password123!',
        role: 'member',
        car_make: 'Proton',
        car_model: 'Satria Neo R3 Lotus Racing',
        car_year: 2010,
        region: 'Malaysia',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=160&auto=format&fit=crop&q=80',
        bio: 'Keeping Malaysian hot-hatch heritage alive at KL & Sarawak coffee meets.',
        created_at: '2026-09-12 19:00:00'
      }
    ],
    meets: [
      {
        id: 1,
        title: 'St Kilda Pier Sunrise Espresso & Classics',
        description:
          'Bring your classic, restomod, or weekend cruiser down by the bay for fresh single-origin espresso and croissants before Melbourne traffic wakes up. Relaxed family-friendly vibe—no revving or loud stereos near the boardwalk.',
        vibe: 'Euro & Classics',
        region: 'Australia',
        cafe_name: 'Little Blue Roasters, St Kilda Pier',
        address: 'Pier Rd, St Kilda VIC 3182',
        parking_note:
          'Enter via Jacka Blvd Lower Foreshore Carpark, North Row Bays 1–45 reserved for low-clearance cars.',
        host_contact: 'Syed Adam — @melb_espresso_runs | +61 412 889 102',
        latitude: -37.864,
        longitude: 144.9667,
        meet_datetime: '2026-11-01 07:30:00',
        end_datetime: '2026-11-01 10:30:00',
        capacity: 60,
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://carsandcoffee.org.au/melbourne-bay-run-2026',
        host_id: 2,
        status: 'upcoming',
        created_at: '2026-10-15 09:00:00'
      },
      {
        id: 2,
        title: 'Port Melbourne Roastery JDM & Pour-Over',
        description:
          "Monthly Sunday morning gathering inside Port Melbourne's brick warehouse district. Specialty V60 pour-overs, matcha lattes, and 80+ bays of 90s/00s Japanese icons and modern GR/Type-R builds.",
        vibe: 'JDM & Brews',
        region: 'Australia',
        cafe_name: 'Industry Beans Warehouse, Port Melbourne',
        address: '345 Plummer St, Port Melbourne VIC 3207',
        parking_note: 'Use Rear Loading Courtyard off Salmon St — concrete ramp is lip-spoiler friendly.',
        host_contact: 'Gibson Tan — @gr86_gibson | +61 421 774 019',
        latitude: -37.8285,
        longitude: 144.929,
        meet_datetime: '2026-11-08 08:00:00',
        end_datetime: '2026-11-08 11:30:00',
        capacity: 85,
        image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://instagram.com/p/portmelb-jdm-coffee-2026',
        host_id: 4,
        status: 'upcoming',
        created_at: '2026-10-18 11:00:00'
      },
      {
        id: 3,
        title: 'Kuching Waterfront Kopi O & Borneo Builds',
        description:
          "Saturday evening chill meet along the Sarawak River breeze. Local artisanal Gula Apong lattes, iced Kopi O, and a laid-back showcase of Sarawak's cleanest JDM, Proton R3, and stance builds.",
        vibe: 'Sunset Chill',
        region: 'Malaysia',
        cafe_name: 'Black Bean Coffee & Tea Co., Kuching',
        address: '87 Ewe Hai St, 93000 Kuching, Sarawak',
        parking_note:
          'Meet at Padungan South Open Plaza Zone B (5-min walk or group park along Carpenter St East Deck).',
        host_contact: 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105',
        latitude: 1.5574,
        longitude: 110.3468,
        meet_datetime: '2026-11-07 17:00:00',
        end_datetime: '2026-11-07 20:30:00',
        capacity: 70,
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://peatix.com/event/kuching-kopi-cars-2026',
        host_id: 3,
        status: 'upcoming',
        created_at: '2026-10-19 14:00:00'
      },
      {
        id: 4,
        title: 'Glenmarie Artisan Roast & Morning Throttle',
        description:
          "Klang Valley's signature Sunday morning Cars & Coffee! Freshly pulled flat whites, sourdough toasties, and wide shaded tree-lined parking for everything from Myvi turbo sleeper builds to GT3 Touring.",
        vibe: 'Morning Coffee',
        region: 'Malaysia',
        cafe_name: 'Suburbia Coffee Roasters, Glenmarie',
        address: '12 Jalan Presiden F U1/F, Glenmarie, 40150 Shah Alam, Selangor',
        parking_note:
          'Park along Lot U1 North Perimeter (Bays A1–A60). Marshals in orange vests will guide low cars.',
        host_contact: 'Amirul Hakim — @kv_morning_roast | +60 17-291 6604',
        latitude: 3.0882,
        longitude: 101.5851,
        meet_datetime: '2026-11-15 07:30:00',
        end_datetime: '2026-11-15 11:00:00',
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://facebook.com/events/glenmarie-coffee-2026',
        host_id: 6,
        status: 'upcoming',
        created_at: '2026-10-20 10:00:00'
      },
      {
        id: 5,
        title: 'Yarra Valley Cold Brew & Healesville Hills Run',
        description:
          'Meet for cold brew and bacon & egg rolls in Warrandyte before an optional scenic morning cruise up through Christmas Hills to Healesville.',
        vibe: 'Morning Coffee',
        region: 'Australia',
        cafe_name: 'Cocoa Moon Cafe, Warrandyte',
        address: '168 Yarra St, Warrandyte VIC 3113',
        parking_note: 'Assemble at Riverbank Lower Gravel-Free Lot behind Yarra St Bakery at 7:15 AM sharp.',
        host_contact: 'Jacob Pillai — @jacob_fl5 | +61 409 331 440',
        latitude: -37.7442,
        longitude: 145.2136,
        meet_datetime: '2026-11-22 07:15:00',
        end_datetime: '2026-11-22 11:00:00',
        capacity: 45,
        image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 1,
        status: 'upcoming',
        created_at: '2026-10-21 15:00:00'
      },
      {
        id: 6,
        title: 'Docklands Rooftop Golden Hour & Decaf',
        description:
          'Twilight rooftop photography session and decaf lattes overlooking Bolte Bridge. Open to all clean street builds, roadsters, and daily drivers.',
        vibe: 'Night Meet',
        region: 'Australia',
        cafe_name: 'District Brewer & Rooftop Deck, Docklands',
        address: 'Level 3 East Carpark, 440 Docklands Dr, Docklands VIC 3008',
        parking_note:
          'Take East Spiral Ramp to Level 3 Open Air Deck — ticket validation code COFFEE26 at exit.',
        host_contact: 'Chloe Vance — @chloe_35mm | +61 433 118 902',
        latitude: -37.8136,
        longitude: 144.9385,
        meet_datetime: '2026-11-28 18:00:00',
        end_datetime: '2026-11-28 21:00:00',
        capacity: 75,
        image: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 5,
        status: 'upcoming',
        created_at: '2026-10-22 12:00:00'
      },
      {
        id: 7,
        title: 'Sepang Paddock Kopi & Track-Prepped Street Cars',
        description:
          'Casual morning coffee hangout outside the Sepang Welcome Centre before the public track day starts. Great spot to inspect brake setups, wheel fitment, and grab nasi lemak & iced latte.',
        vibe: 'JDM & Brews',
        region: 'Malaysia',
        cafe_name: 'Paddock Brew House, Sepang',
        address: 'Jalan Pekeliling, 64000 KLIA, Selangor',
        parking_note: 'Public Welcome Centre Visitor Lot C (free parking until 12:00 PM).',
        host_contact: 'Naveed Khan — @borneo_kopi_meets | +60 16-882 4105',
        latitude: 2.7608,
        longitude: 101.7383,
        meet_datetime: '2026-12-05 08:00:00',
        end_datetime: '2026-12-05 11:30:00',
        capacity: 80,
        image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 3,
        status: 'upcoming',
        created_at: '2026-10-24 09:30:00'
      },
      {
        id: 8,
        title: 'Lygon Street Autumn Espresso & Italian Classics (Past Meet)',
        description:
          'Completed Sunday morning celebration of Italian coachbuilding, air-cooled classics, and Lygon Street espresso culture. Thank you to all 52 owners who attended!',
        vibe: 'Euro & Classics',
        region: 'Australia',
        cafe_name: 'Brunetti Classico, Carlton',
        address: '380 Lygon St, Carlton VIC 3053',
        parking_note: 'Faraday St Kerbside & Elgin St Carpark Level 1.',
        host_contact: 'Syed Adam — @melb_espresso_runs | +61 412 889 102',
        latitude: -37.7984,
        longitude: 144.9672,
        meet_datetime: '2026-10-18 07:30:00',
        end_datetime: '2026-10-18 10:30:00',
        capacity: 55,
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 2,
        status: 'completed',
        created_at: '2026-10-01 10:00:00'
      }
    ],
    meet_rsvps: [
      { id: 1, meet_id: 1, user_id: 1, attend_type: 'bringing_car', car_brought: '2024 Honda Civic Type R (FL5)', created_at: '2026-10-20 10:15:00' },
      { id: 2, meet_id: 1, user_id: 4, attend_type: 'bringing_car', car_brought: '2023 Toyota GR86', created_at: '2026-10-20 11:20:00' },
      { id: 3, meet_id: 1, user_id: 5, attend_type: 'bringing_car', car_brought: '1995 Mazda MX-5 Miata (NA8C)', created_at: '2026-10-21 09:00:00' },
      { id: 4, meet_id: 2, user_id: 1, attend_type: 'bringing_car', car_brought: '2024 Honda Civic Type R (FL5)', created_at: '2026-10-21 14:10:00' },
      { id: 5, meet_id: 2, user_id: 2, attend_type: 'spectating', car_brought: 'Grabbing Coffee / Camera Only', created_at: '2026-10-22 08:30:00' },
      { id: 6, meet_id: 2, user_id: 5, attend_type: 'bringing_car', car_brought: '1995 Mazda MX-5 Miata (NA8C)', created_at: '2026-10-22 10:45:00' },
      { id: 7, meet_id: 3, user_id: 3, attend_type: 'bringing_car', car_brought: '2000 Nissan Skyline GT-R (R34)', created_at: '2026-10-22 16:00:00' },
      { id: 8, meet_id: 3, user_id: 6, attend_type: 'bringing_car', car_brought: '2010 Proton Satria Neo R3 Lotus Racing', created_at: '2026-10-23 12:00:00' },
      { id: 9, meet_id: 4, user_id: 3, attend_type: 'bringing_car', car_brought: '2000 Nissan Skyline GT-R (R34)', created_at: '2026-10-23 15:00:00' },
      { id: 10, meet_id: 4, user_id: 6, attend_type: 'bringing_car', car_brought: '2010 Proton Satria Neo R3 Lotus Racing', created_at: '2026-10-24 09:00:00' },
      { id: 11, meet_id: 8, user_id: 2, attend_type: 'bringing_car', car_brought: '2019 Porsche 911 Carrera S (991.2)', created_at: '2026-10-10 09:00:00' },
      { id: 12, meet_id: 8, user_id: 4, attend_type: 'bringing_car', car_brought: '2023 Toyota GR86', created_at: '2026-10-11 10:00:00' }
    ],
    posts: [
      {
        id: 1,
        user_id: 5,
        meet_id: 8,
        title: 'Golden light on the air-cooled 911 lineup at Lygon Street',
        body: "Shot a roll of Kodak Portra 400 at last Sunday's Carlton espresso meet. Nothing beats the sound of flat-sixes echoing past the coffee machines at 7:30 AM!",
        car_tag: 'Porsche 911 Carrera',
        location_tag: 'Carlton, Melbourne',
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-19 11:30:00'
      },
      {
        id: 2,
        user_id: 6,
        meet_id: 3,
        title: 'Fresh bronze CE28N fitment ready for Kuching Waterfront Kopi night',
        body: 'Finally dialed in the alignment and mounted fresh 205/45R16 Advan Neova AD09s on the Satria Neo R3. Who else is coming down to Ewe Hai Street next Saturday for Gula Apong lattes?',
        car_tag: 'Proton Satria Neo R3',
        location_tag: 'Kuching, Sarawak',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-23 18:15:00'
      },
      {
        id: 3,
        user_id: 4,
        meet_id: 2,
        title: 'Port Melbourne pour-over scouting — ramp clearance verified!',
        body: 'Dropped by Industry Beans this morning to test the rear courtyard entry ramp with my lowered GR86. Zero scraping even with a front lip! See everyone there on Nov 8.',
        car_tag: 'Toyota GR86',
        location_tag: 'Port Melbourne, VIC',
        image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-25 09:40:00'
      },
      {
        id: 4,
        user_id: 3,
        meet_id: 4,
        title: 'Bayside Blue R34 + Iced Oat Latte = Perfect Sunday',
        body: 'Quick morning warmup through Shah Alam before setting up the November Glenmarie roster. Drop your car make in the Roll-Call if you need wide bay parking!',
        car_tag: 'Nissan Skyline GT-R (R34)',
        location_tag: 'Glenmarie, Selangor',
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-26 08:20:00'
      }
    ],
    likes: [
      { id: 1, user_id: 1, target_type: 'meet', target_id: 1, created_at: '2026-10-20 10:16:00' },
      { id: 2, user_id: 4, target_type: 'meet', target_id: 1, created_at: '2026-10-20 11:21:00' },
      { id: 3, user_id: 5, target_type: 'meet', target_id: 1, created_at: '2026-10-21 09:05:00' },
      { id: 4, user_id: 1, target_type: 'meet', target_id: 2, created_at: '2026-10-21 14:12:00' },
      { id: 5, user_id: 2, target_type: 'meet', target_id: 2, created_at: '2026-10-22 08:32:00' },
      { id: 6, user_id: 3, target_type: 'meet', target_id: 3, created_at: '2026-10-22 16:05:00' },
      { id: 7, user_id: 6, target_type: 'meet', target_id: 3, created_at: '2026-10-23 12:05:00' },
      { id: 8, user_id: 3, target_type: 'meet', target_id: 4, created_at: '2026-10-23 15:02:00' },
      { id: 9, user_id: 1, target_type: 'post', target_id: 1, created_at: '2026-10-19 12:00:00' },
      { id: 10, user_id: 2, target_type: 'post', target_id: 1, created_at: '2026-10-19 13:10:00' },
      { id: 11, user_id: 4, target_type: 'post', target_id: 1, created_at: '2026-10-19 14:00:00' },
      { id: 12, user_id: 3, target_type: 'post', target_id: 2, created_at: '2026-10-23 19:00:00' },
      { id: 13, user_id: 1, target_type: 'post', target_id: 3, created_at: '2026-10-25 10:00:00' }
    ],
    comments: [
      {
        id: 1,
        user_id: 4,
        target_type: 'meet',
        target_id: 1,
        body: 'Bringing the GR86 and my camera! Are dogs on leashes welcome near the outdoor espresso cart?',
        rating: null,
        created_at: '2026-10-21 10:30:00'
      },
      {
        id: 2,
        user_id: 2,
        target_type: 'meet',
        target_id: 1,
        body: 'Yes! Outdoor boardwalk seating is 100% dog-friendly.',
        rating: null,
        created_at: '2026-10-21 11:05:00'
      },
      {
        id: 3,
        user_id: 6,
        target_type: 'meet',
        target_id: 3,
        body: 'Cannot wait! Bringing two Satria Neos and a Civic FD2R from Petra Jaya.',
        rating: null,
        created_at: '2026-10-24 14:20:00'
      },
      {
        id: 4,
        user_id: 4,
        target_type: 'meet',
        target_id: 8,
        body: 'Best espresso and cleanest classic Alfa & Porsche turnout all year. Easy parking too!',
        rating: 5,
        created_at: '2026-10-18 12:15:00'
      },
      {
        id: 5,
        user_id: 5,
        target_type: 'meet',
        target_id: 8,
        body: 'Loved the chill morning atmosphere and zero anti-social behavior.',
        rating: 5,
        created_at: '2026-10-18 14:00:00'
      },
      {
        id: 6,
        user_id: 2,
        target_type: 'post',
        target_id: 1,
        body: 'Those Portra tones on the Guards Red 911 are incredible Chloe!',
        rating: null,
        created_at: '2026-10-19 15:20:00'
      },
      {
        id: 7,
        user_id: 1,
        target_type: 'post',
        target_id: 3,
        body: 'Legend for checking the ramp clearance Gibson—my FL5 front splitter thanks you.',
        rating: null,
        created_at: '2026-10-25 11:00:00'
      }
    ]
  }

  if (!isTestEnv) {
    appendExtendedDataset(base)
  }

  return base
}
