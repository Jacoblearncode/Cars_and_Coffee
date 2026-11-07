/**
 * Cars & Coffee — Synchronized Seed Data (Matches `database/seed.sql` 1:1 for Base 8 Meets,
 * plus Deterministic Extended Meets & Spotting Posts in Live Application Mode)
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
    image: 'https://images.unsplash.com/photo-1786811870319-16bef2f27310?w=900&auto=format&fit=crop&q=80'
  },
  {
    label: 'Nov 2026 · Kuching Saradise Specialty Coffee & JDM Night',
    url: 'https://peatix.com/event/saradise-kuching-cars-coffee-nov2026',
    title: 'Saradise Specialty Brews & Borneo JDM Lineup',
    description:
      'Evening specialty coffee hangout in Saradise Kuching featuring Sarawak JDM classics, rotary FD3S builds, and pour-over tasting.',
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
    image: 'https://images.unsplash.com/photo-1774121618515-881ac7896bda?w=900&auto=format&fit=crop&q=80'
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
    image: 'https://images.unsplash.com/photo-1741963244619-10997539b2e7?w=900&auto=format&fit=crop&q=80'
  }
]

const AU_HUB_SPOTS = [
  { city: 'South Melbourne, VIC', cafe: 'ST. ALi Coffee Roasters', addr: '12-18 Yarra Pl, South Melbourne VIC 3205', lat: -37.8314, lng: 144.9602, note: 'Yarra Place wide kerbside bays & Coventry St rear lot.' },
  { city: 'Cremorne, VIC', cafe: 'Veneziano Coffee Richmond', addr: '16 River St, Richmond VIC 3121', lat: -37.8261, lng: 145.0124, note: 'Riverfront warehouse apron — flat concrete entry.' },
  { city: 'Collingwood, VIC', cafe: 'Proud Mary Roasters', addr: '172 Oxford St, Collingwood VIC 3066', lat: -37.8012, lng: 144.9845, note: 'Peel St & Cambridge St early Sunday bays.' },
  { city: 'Brighton Beach, VIC', cafe: 'Green Point Beach Kiosk', addr: '2 Esplanade, Brighton VIC 3186', lat: -37.9245, lng: 144.9868, note: 'Green Point Foreshore Carpark — North Ocean View Row.' },
  { city: 'Williamstown, VIC', cafe: 'Sebastian Beach Espresso', addr: '26 Esplanade, Williamstown VIC 3016', lat: -37.8675, lng: 144.8926, note: 'Esplanade angled beach bays — zero speed humps.' },
  { city: 'Mount Dandenong, VIC', cafe: 'SkyHigh Observatory Kiosk', addr: '26 Observatory Rd, Mount Dandenong VIC 3767', lat: -37.8271, lng: 145.3526, note: 'Upper Summit Lookout Asphalt Lot A.' },
  { city: 'Arthur’s Seat, VIC', cafe: 'Eagle Summit Roastery', addr: '795 Arthurs Seat Rd, Arthurs Seat VIC 3936', lat: -38.3541, lng: 144.9522, note: 'Summit Switchback Lookout Bays 1–60.' },
  { city: 'Lorne, Great Ocean Rd', cafe: 'Bottle of Milk Espresso Bar', addr: '52 Mountjoy Pde, Lorne VIC 3232', lat: -38.5412, lng: 143.9748, note: 'Lorne Foreshore Promenade Lot after coastal run.' },
  { city: 'Geelong Waterfront, VIC', cafe: 'Sailors Rest Espresso Deck', addr: '3 Moorabool St, Geelong VIC 3220', lat: -38.1449, lng: 144.3612, note: 'Eastern Beach Road Pier Carpark.' },
  { city: 'Healesville, VIC', cafe: 'Habituel Coffee & Bakehouse', addr: '218 Maroondah Hwy, Healesville VIC 3777', lat: -37.6542, lng: 145.5162, note: 'Rear Nicholson St public lot — smooth entry for lowered cars.' },
  { city: 'Sorrento, VIC', cafe: 'Buckley’s Chance Roasters', addr: '174 Ocean Beach Rd, Sorrento VIC 3943', lat: -38.3401, lng: 144.7418, note: 'Morce Ave rear public carpark.' },
  { city: 'Albert Park, VIC', cafe: 'Pipis Kiosk Lakeshore', addr: '129A Beaconsfield Pde, Albert Park VIC 3206', lat: -37.8452, lng: 144.9681, note: 'Aughtie Drive lakeside Grand Prix circuit bays.' },
  { city: 'Fitzroy, VIC', cafe: 'Industry Beans Fitzroy', addr: '70-76 Westgarth St, Fitzroy VIC 3065', lat: -37.7941, lng: 144.9819, note: 'Westgarth Street wide morning kerbside bays.' },
  { city: 'Brunswick, VIC', cafe: 'Code Black Coffee HQ', addr: '15-17 Weston St, Brunswick VIC 3056', lat: -37.7745, lng: 144.9612, note: 'Weston St warehouse forecourt & Edward St lot.' },
  { city: 'Mornington, VIC', cafe: 'Commonfolk Coffee Company', addr: '16 Progress St, Mornington VIC 3931', lat: -38.2298, lng: 145.0564, note: 'Progress St industrial court — wide flat bays.' },
  { city: 'Kew Boulevard, VIC', cafe: 'Studley Park Boathouse Brew', addr: '1 Boathouse Rd, Kew VIC 3101', lat: -37.7995, lng: 145.0122, note: 'Lower Yarra Bend Boulevard turnaround bays.' }
]

const MY_HUB_SPOTS = [
  { city: 'Bangsar, KL', cafe: 'Pulp by Papa Palheta', addr: '29-01 Jalan Riong, Bangsar, 59100 Kuala Lumpur', lat: 3.1239, lng: 101.6712, note: 'APW Bangsar inner courtyard — marshals from 7:00 AM.' },
  { city: 'Bukit Bintang, KL', cafe: 'Feeka Coffee Roasters', addr: '19 Jalan Mesui, Bukit Bintang, 50200 Kuala Lumpur', lat: 3.1488, lng: 101.7072, note: 'Changkat public surface lot 60m from cafe.' },
  { city: 'Mont Kiara, KL', cafe: 'VCR Ritchie Specialty Brew', addr: '2 Jalan Nikmat, Mont Kiara, 50480 Kuala Lumpur', lat: 3.1652, lng: 101.6524, note: 'Plaza Mont Kiara Open Boulevard Zone C.' },
  { city: 'Subang Jaya, Selangor', cafe: 'Upstairs Cafe & Roastery SS15', addr: '45 Jalan SS 15/4B, Subang Jaya, 47500 Selangor', lat: 3.0761, lng: 101.5889, note: 'SS15 Multi-Level Lower Ground Wide Bays.' },
  { city: 'Petaling Jaya, Selangor', cafe: 'Bean Brothers PJ Warehouse', addr: 'Jalan PJU 3/50, Sunway Damansara, 47810 PJ', lat: 3.1519, lng: 101.5941, note: 'Industrial courtyard — 90+ wide bays, lip friendly.' },
  { city: 'Genting Sempah, Pahang', cafe: 'R&R Highland Brew Bar', addr: 'Lebuhraya Karak, 28750 Bentong, Pahang', lat: 3.3478, lng: 101.7875, note: 'Genting Sempah Northbound Touge Assembly Bays.' },
  { city: 'Saradise, Kuching', cafe: 'Earthlings Coffee Workshop', addr: 'Block B1, Saradise, 93350 Kuching, Sarawak', lat: 1.5034, lng: 110.3548, note: 'Saradise Central Square diagonal bays.' },
  { city: 'Padungan, Kuching', cafe: 'Bumbung Kopi & Roasters', addr: 'Jalan Padungan, 93100 Kuching, Sarawak', lat: 1.5542, lng: 110.3568, note: 'Padungan Jubilee Ground West Carpark.' },
  { city: 'Damai Beach, Sarawak', cafe: 'Santubong Coastal Espresso', addr: 'Teluk Bandung, Santubong, 93050 Kuching', lat: 1.7495, lng: 110.3156, note: 'Damai Central Seafront Lot.' },
  { city: 'Georgetown, Penang', cafe: 'Norm Micro Roastery', addr: '13 Gat Lebuh Gereja, 10300 George Town, Pulau Pinang', lat: 5.4164, lng: 100.3418, note: 'Weld Quay Heritage Pier Lot.' },
  { city: 'Senibong Cove, JB', cafe: 'Marina Specialty Kopi Bar', addr: 'Persiaran Senibong, 81750 Masai, Johor Bahru', lat: 1.4845, lng: 103.8195, note: 'Senibong Boardwalk Marina VIP Lot.' },
  { city: 'Ipoh Old Town, Perak', cafe: 'Burps & Giggles Roastery', addr: '93 Jalan Sultan Yussuf, 30000 Ipoh, Perak', lat: 4.5952, lng: 101.0778, note: 'Concubine Lane South Open Lot.' },
  { city: 'Desa ParkCity, KL', cafe: 'Kenny Hills Bakers Waterfront', addr: 'GF-06 The Waterfront, Desa ParkCity, 52200 KL', lat: 3.1869, lng: 101.6295, note: 'Waterfront North Outdoor Wing Bays 1–50.' },
  { city: 'Putrajaya Precinct 2', cafe: 'Lakeside Roastery & Kopi', addr: 'Persiaran Perdana, Presint 2, 62100 Putrajaya', lat: 2.9264, lng: 101.6964, note: 'Millennium Monument Lakeside Promenade Lot.' },
  { city: 'Ulu Yam, Selangor', cafe: 'Hulu Tamu Touge Kopi Hut', addr: 'Jalan Ulu Yam Baru, 44300 Batang Kali, Selangor', lat: 3.4572, lng: 101.6621, note: 'B23 Touge Basecamp Paved Assembly Yard.' },
  { city: 'Batu Ferringhi, Penang', cafe: 'Ferringhi Cliffside Brews', addr: 'Jalan Batu Ferringhi, 11100 Pulau Pinang', lat: 5.4709, lng: 100.2453, note: 'North Coastal Lookout Paved Pull-Off.' }
]

/**
 * 40 Visually-Verified Car & Theme Entries.
 * Every image URL has been inspected to guarantee 1:1 subject-matter accuracy between
 * the depicted car/color/setting, the spotting badge (`car_tag`), and the meet theme (`series`).
 */
const VERIFIED_CAR_CATALOG = [
  {
    car: '2019 Honda Civic Type R (FK8)',
    car_tag: 'Honda Civic Type R (FK8)',
    detail: 'Championship White FK8 Type R with red Honda emblem and yellow JDM fog lamps',
    series: 'VTEC Turbo Type-R & Underground Espresso',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1572471372724-a7c1c9450c21?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2020 Honda Civic RS Turbo Hatchback (FK7)',
    car_tag: 'Honda Civic RS Hatchback (FK7)',
    detail: 'FK7 Civic Turbo Hatchback bathed in red and blue neon street reflections',
    series: 'Neon Civic Hatch & Midnight Cold Brew',
    vibe: 'Night Meet',
    img: 'https://images.unsplash.com/photo-1605816988069-b11383b50717?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2005 Mitsubishi Lancer Evolution IX MR (CT9A)',
    car_tag: 'Mitsubishi Lancer Evolution IX MR',
    detail: 'Graphite Grey CT9A Evo IX MR sporting an exposed GReddy front-mount intercooler by the lighthouse pier',
    series: '4G63 Turbo Harbor Run & Artisan Kopi',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1660209336030-ea4d2d0e0412?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1999 Mitsubishi Lancer Evolution VI GSR (CP9A)',
    car_tag: 'Mitsubishi Lancer Evolution VI GSR',
    detail: 'Scotia White CP9A Evo VI twin-blade rear wing cutting through thick highland fog',
    series: 'Highland Mist Evo VI Touge & Pour-Over',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1760405503561-08152ac42cce?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2019 Subaru WRX STI Spec-R (VA)',
    car_tag: 'Subaru WRX STI (VA)',
    detail: 'World Rally Blue VA WRX STI on a crisp rolling run with custom halo headlights',
    series: 'Rally Blue Boxer & Forest Flat White',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1636074641063-1c2152f1b31e?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2004 Subaru Impreza WRX STI (GDB)',
    car_tag: 'Subaru Impreza WRX STI (GDB)',
    detail: 'Midnight Blue Blobeye GDB STI sitting flush on bronze Volk TE37s under twilight lamps',
    series: 'Blobeye STI Twilight Stance & Nitro Brew',
    vibe: 'Night Meet',
    img: 'https://images.unsplash.com/photo-1773384654744-e35345aab559?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1998 Mazda RX-7 Type RS (FD3S)',
    car_tag: 'Mazda RX-7 Type RS (FD3S)',
    detail: 'Chaste White FD3S RX-7 with open bonnet revealing a big single-turbo 13B rotary and front-mount intercooler',
    series: '13B Single-Turbo Rotary & Matcha Social',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1780653313486-589171c0cdc5?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1999 Mazda RX-7 Spirit R (FD3S)',
    car_tag: 'Mazda RX-7 Spirit R (FD3S)',
    detail: 'Innocent Blue Mica FD3S RX-7 with adjustable aero wing and burnt-tip titanium exhaust',
    series: '90s Rotary Icons & Rainy Day Espresso',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1762095217899-edbc3ee9c44a?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1997 Mazda RX-7 Type RB Bathurst (FD3S)',
    car_tag: 'Mazda RX-7 Bathurst (FD3S)',
    detail: 'Chaste White FD3S RX-7 on white Evo Regamaster wheels lined up in the sunny paddock',
    series: 'Paddock Rotary Classics & Iced Long Black',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1774121618515-881ac7896bda?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1996 Mazda RX-7 Efini (FD3S)',
    car_tag: 'Mazda RX-7 Efini (FD3S)',
    detail: 'Montego Blue Efini FD3S RX-7 with sleek pop-up headlights and OEM front lip',
    series: 'Efini Rotary & Morning Pastry Lineup',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1770275215496-246d40f4d2fe?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1995 Mazda MX-5 Miata M-Edition (NA8C)',
    car_tag: 'Mazda MX-5 Miata (NA8C)',
    detail: 'Montego Blue NA8C Miata roadster with tan soft-top parked along a leafy morning lane',
    series: 'NA Roadster Top-Down & Sourdough Run',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1747197413754-dc600f71f3d6?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2023 Toyota GR Yaris Rallye (GXPA16)',
    car_tag: 'Toyota GR Yaris Rallye',
    detail: 'Emotional Red GR Yaris AWD 3-cylinder turbo kicking up morning mist on the forest stage',
    series: 'GR-Four Rally Hatch & Timberland Brews',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1611580568660-28050c1d5b5c?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2022 Toyota GR Supra RZ (A90)',
    car_tag: 'Toyota GR Supra RZ (A90)',
    detail: 'White Metallic A90 GR Supra sitting on 3-piece deep-dish wheels and carbon canards',
    series: 'B58 Inline-Six Supra & Roastery Roll-Call',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1749449387749-cb689efd21fe?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1992 Honda NSX Coupe (NA1)',
    car_tag: 'Honda NSX (NA1)',
    detail: 'Formula Red NA1 Honda NSX with pop-up headlights and polished BBS mesh wheels',
    series: 'Golden Era Mid-Engine NSX & Cortado',
    vibe: 'JDM & Brews',
    img: 'https://images.unsplash.com/photo-1619925840813-da56acb9e26e?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2020 Honda NSX Twin-Turbo Hybrid (NC1)',
    car_tag: 'Honda NSX Hybrid (NC1)',
    detail: 'Berlina Black NC1 NSX hybrid supercar centered in a clean asphalt bay',
    series: 'Precision Hybrid NSX & Filter Coffee',
    vibe: 'Night Meet',
    img: 'https://images.unsplash.com/photo-1579102991149-86ed58fff188?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2018 Audi R8 V10 Plus Coupe',
    car_tag: 'Audi R8 V10 Plus',
    detail: 'Matte Daytona Grey Audi R8 V10 Plus on bronze-lip forged wheels along the mountain ridge',
    series: 'Mountain Pass V10 Plus & Single-Origin',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2017 Nissan GT-R Premium (R35)',
    car_tag: 'Nissan GT-R Premium (R35)',
    detail: 'Pearl White R35 GT-R iconic quad tail rings chasing golden hour down the open highway',
    series: 'Golden Hour GT-R Highway & Sunset Brew',
    vibe: 'Sunset Chill',
    img: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '1973 Porsche 911 Carrera RS 2.7',
    car_tag: 'Porsche 911 Carrera RS 2.7',
    detail: 'Classic air-cooled Grand Prix White 911 Carrera RS on period-correct Fuchs wheels',
    series: 'Air-Cooled 911 RS & Single-Origin Espresso',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1741963244619-10997539b2e7?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2018 Porsche 911 GT3 (991.2)',
    car_tag: 'Porsche 911 GT3 (991.2)',
    detail: 'Chalk White 991.2 GT3 on satin black center-lock wheels against an alpine pass backdrop',
    series: 'Alpine Flat-Six GT3 & Warm Flat White',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2023 Porsche 911 GT3 Touring (992)',
    car_tag: 'Porsche 911 GT3 Touring (992)',
    detail: 'Arctic Grey 992 GT3 Touring on silver forged wheels parked on a cobblestone roastery plaza',
    series: 'GT3 Touring Courtyard & Artisan Cortado',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1786811870319-16bef2f27310?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2019 Porsche 911 GT3 RS Weissach (991.2)',
    car_tag: 'Porsche 911 GT3 RS (991.2)',
    detail: 'Chalk White 991.2 GT3 RS showcasing carbon-fiber fender louvers and yellow ceramic calipers',
    series: 'Weissach GT3 RS Kerbside & Batch Brew',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1776163803072-3c24c1b8a295?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2018 Porsche 911 GT3 Clubsport (991.2)',
    car_tag: 'Porsche 911 GT3 Clubsport',
    detail: 'Guards Red 991.2 GT3 fixed rear wing rolling through a sunlit avenue',
    series: 'Guards Red Stuttgart Run & Espresso Bar',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1613921568487-7156e89f2b5d?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2019 Porsche Panamera Turbo (971)',
    car_tag: 'Porsche Panamera Turbo',
    detail: 'Jet Black Metallic Panamera Turbo with full-width LED light bar on an early dawn highway run',
    series: 'Autobahn Fastback Dawn Run & Long Black',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2023 BMW M4 Competition Coupe (G82)',
    car_tag: 'BMW M4 Competition (G82)',
    detail: 'Toronto Red Metallic G82 M4 Competition on forged black wheels outside a modern glass roastery',
    series: 'S58 Twin-Turbo Bavarian & Morning Roast',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2018 BMW M4 CS Track Spec (F82)',
    car_tag: 'BMW M4 CS (F82)',
    detail: 'Alpine White F82 M4 CS wearing #123 track numbers on the open-air rooftop deck at night',
    series: 'Rooftop Track-Spec M4 & Decaf Latte',
    vibe: 'Night Meet',
    img: 'https://images.unsplash.com/photo-1744519322632-9bdf5e977e87?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2020 BMW M4 Competition Heritage (F82)',
    car_tag: 'BMW M4 Competition (F82)',
    detail: 'Mineral White F82 M4 Competition carbon trunk lip and OLED tail lamps under studio lights',
    series: 'M-Division Detail Bay & Specialty Pour-Over',
    vibe: 'Night Meet',
    img: 'https://images.unsplash.com/photo-1744223647422-da9a70f9aac8?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2017 BMW M4 Coupe (F82)',
    car_tag: 'BMW M4 Coupe (F82)',
    detail: 'Sakhir Orange Metallic F82 M4 with carbon roof parked under a palm-lined boulevard',
    series: 'Palm Boulevard Euro Coupe & Sunset Chill',
    vibe: 'Sunset Chill',
    img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2016 BMW 435i M-Sport Coupe (F32)',
    car_tag: 'BMW 435i M-Sport (F32)',
    detail: 'Estoril Blue Metallic F32 coupe on M double-spoke wheels parked outside a brick warehouse',
    series: 'Warehouse District Euro & Sourdough',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2017 Volkswagen Golf GTI Performance (Mk7)',
    car_tag: 'Volkswagen Golf GTI (Mk7)',
    detail: 'Pure White Mk7 Golf GTI with signature red honeycomb grille stripe inside a warehouse bay',
    series: 'Wolfsburg Hot-Hatch & Industrial Espresso',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1605475300127-0a31e8273bc2?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2019 Volkswagen Golf R Final Edition (Mk7.5)',
    car_tag: 'Volkswagen Golf R (Mk7.5)',
    detail: 'Oryx White Mk7.5 Golf R on black Pretoria wheels climbing the multi-level carpark ramp',
    series: 'Multi-Deck AWD Hot-Hatch & Cold Brew',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1572811298797-9eecadf6cb24?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2018 Mercedes-AMG C63 S Edition 1 (C205)',
    car_tag: 'Mercedes-AMG C63 S Coupe',
    detail: 'Selenite Grey Magno C63 S Edition 1 with yellow racing stripe and twin-blade AMG grille',
    series: 'Affalterbach BiTurbo V8 & Dark Roast',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2020 Mercedes-AMG GT R Pro (C190)',
    car_tag: 'Mercedes-AMG GT R Pro',
    detail: 'Selenite Grey Magno AMG GT R Pro with yellow splitter accents and ceramic brakes',
    series: 'Green Hell AMG GT R & Paddock Espresso',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2019 Mercedes-AMG GT R (C190)',
    car_tag: 'Mercedes-AMG GT R',
    detail: 'Designo Cardinal Red AMG GT R with Panamericana grille on a pine-fringed ridge road',
    series: 'Highland Ridge GT R & Sunset Filter Coffee',
    vibe: 'Sunset Chill',
    img: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2021 Audi R8 V10 Performance Quattro',
    car_tag: 'Audi R8 V10 Performance',
    detail: 'Tango Red Audi R8 V10 Performance carbon rear diffuser and gooseneck wing',
    series: 'Naturally Aspirated V10 & Roastery Social',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1783803116539-03b5750c0708?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2020 Audi R8 V10 Coupe (Type 4S)',
    car_tag: 'Audi R8 V10 Coupe',
    detail: 'Miami Blue Audi R8 V10 sitting on brushed silver forged wheels at the lawn showcase',
    series: 'Concours Lawn Exotics & Iced Matcha',
    vibe: 'Sunset Chill',
    img: 'https://images.unsplash.com/photo-1753658479067-d845486e7933?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2018 Lamborghini Huracán Performante',
    car_tag: 'Lamborghini Huracán Performante',
    detail: 'Bianco Monocerus matte white Huracán Performante with ALA forged carbon aero at the mountain lookout',
    series: 'Sant’Agata V10 Overlook & Italian Ristretto',
    vibe: 'Sunset Chill',
    img: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2019 Lamborghini Aventador S LP 740-4',
    car_tag: 'Lamborghini Aventador S',
    detail: 'Blu Nethuns metallic Aventador S V12 parked kerbside outside a sunlit cafe terrace',
    series: 'Bespoke V12 Boulevard & Sunday Macchiato',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2015 Ferrari LaFerrari Coupe',
    car_tag: 'Ferrari LaFerrari',
    detail: 'Rosso Corsa Ferrari LaFerrari HY-KERS V12 parked inside the collector gallery',
    series: 'Maranello Collector Gallery & Cortado',
    vibe: 'Euro & Classics',
    img: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2014 McLaren 12C Spider',
    car_tag: 'McLaren 12C Spider',
    detail: 'Volcano Red McLaren 12C Spider rear deck glistening after a brief morning shower',
    series: 'British Carbon Supercar & Morning Flat White',
    vibe: 'Morning Coffee',
    img: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=900&auto=format&fit=crop&q=80'
  },
  {
    car: '2017 Ford Mustang Shelby GT350',
    car_tag: 'Ford Mustang Shelby GT350',
    detail: 'Magnetic Grey Shelby GT350 Cobra badge centered on the open tarmac apron',
    series: 'Voodoo V8 Tarmac Roll-Call & Black Coffee',
    vibe: 'Night Meet',
    img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=900&auto=format&fit=crop&q=80'
  }
]

const POST_HEADLINE_TEMPLATES = [
  (item, hub) => `Spotted: ${item.car} outside ${hub.cafe}`,
  (item, hub) => `${item.car_tag} steals the morning lineup at ${hub.city}`,
  (item, hub) => `Dialed fitment on this ${item.car_tag} at ${hub.cafe}`,
  (item, hub) => `Fresh espresso & a clean ${item.car} in ${hub.city}`,
  (item, hub) => `Weekend roll-call highlight: ${item.car_tag} at ${hub.cafe}`,
  (item, hub) => `Golden light on the ${item.car_tag} during our ${hub.city} stop`,
  (item, hub) => `Early bird arrival: ${item.car} parked at ${hub.cafe}`,
  (item, hub) => `Coffee run gem — ${item.car_tag} spotted in ${hub.city}`,
  (item, hub) => `Zero scrape entry for this ${item.car_tag} at ${hub.cafe}`,
  (item, hub) => `Paddock talk & pour-overs with a ${item.car} at ${hub.city}`
]

const POST_BODY_TEMPLATES = [
  (item, hub) =>
    `Caught this ${item.detail} while queuing for single-origin flat whites at ${hub.cafe} in ${hub.city}. Super respectful arrival and a great chat with the owner about suspension geometry.`,
  (item, hub) =>
    `Nothing beats early morning crema paired with a ${item.detail} at ${hub.city}. Plenty of wide bays at ${hub.cafe} and zero anti-social revving.`,
  (item, hub) =>
    `Highlight of the ${hub.city} session: ${item.detail}. Grabbed an iced batch brew from ${hub.cafe} and spent twenty minutes admiring the brake and wheel spec.`,
  (item, hub) =>
    `Pulled into ${hub.cafe} just as this ${item.detail} backed into the front row. The ${hub.city} crowd always brings out properly maintained driver's cars.`,
  (item, hub) =>
    `Quick 35mm snapshot from ${hub.city} — ${item.detail}. If you are heading to ${hub.cafe} next weekend, arrive before 7:45 AM for the shaded kerbside row.`,
  (item, hub) =>
    `Cleanest spec at ${hub.cafe} this week was easily this ${item.detail}. Smooth entry apron in ${hub.city} made it effortless even for low front splitters.`
]

function pad2(n) {
  return String(n).padStart(2, '0')
}

function appendExtendedDataset(base) {
  const allHubs = [
    ...AU_HUB_SPOTS.map((h) => ({ ...h, region: 'Australia' })),
    ...MY_HUB_SPOTS.map((h) => ({ ...h, region: 'Malaysia' }))
  ]

  // 1. Generate 104 additional curated meets (IDs 9..112 -> total 112 meets = 10 pages @ 12/page)
  // Using coprime strides across 32 hubs and 40 verified car themes so:
  // - Every theme/image appears only 2-3 times across all 104 generated meets
  // - Every cafe location appears only 3-4 times across all 104 generated meets
  // - Every (hub, theme) pair is 100% unique (never repeated)
  for (let i = 0; i < 104; i += 1) {
    const id = 9 + i
    const hubIdx = (i * 7 + Math.floor(i / 32) * 5) % allHubs.length
    const themeIdx = (i * 11 + Math.floor(i / 40) * 3) % VERIFIED_CAR_CATALOG.length
    const hub = allHubs[hubIdx]
    const theme = VERIFIED_CAR_CATALOG[themeIdx]
    const isMalaysia = hub.region === 'Malaysia'
    const hostId = ((i * 5) % 6) + 1

    // Spread dates across Oct, Nov, Dec 2026 & Jan 2027
    const dayOffset = i - 6
    const dt = new Date(Date.UTC(2026, 9, 28, 7, 30, 0))
    dt.setUTCDate(dt.getUTCDate() + dayOffset)
    const year = dt.getUTCFullYear()
    const month = pad2(dt.getUTCMonth() + 1)
    const day = pad2(dt.getUTCDate())
    const startHour =
      theme.vibe === 'Night Meet'
        ? '19:00:00'
        : theme.vibe === 'Sunset Chill'
          ? '17:00:00'
          : i % 3 === 0
            ? '07:00:00'
            : '08:00:00'
    const endHour =
      theme.vibe === 'Night Meet'
        ? '22:00:00'
        : theme.vibe === 'Sunset Chill'
          ? '20:00:00'
          : '11:00:00'

    const latJitter = (((i * 17) % 19) - 9) * 0.0018
    const lngJitter = (((i * 23) % 19) - 9) * 0.0018
    const status = dayOffset < -3 ? 'completed' : 'upcoming'

    base.meets.push({
      id,
      title: `${hub.city.split(',')[0]} — ${theme.series}`,
      description: `Curated ${theme.vibe.toLowerCase()} gathering at ${hub.cafe} in ${hub.city}, headlined by ${theme.detail}. Open to enthusiasts bringing JDM icons, Euro classics, and clean daily drivers with dedicated marshal-guided parking.`,
      vibe: theme.vibe,
      region: hub.region,
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
      const rsvpCar = VERIFIED_CAR_CATALOG[(themeIdx + r * 7) % VERIFIED_CAR_CATALOG.length].car
      base.meet_rsvps.push({
        id: base.meet_rsvps.length + 1,
        meet_id: id,
        user_id: uid,
        attend_type: r === 2 && i % 4 === 0 ? 'spectating' : 'bringing_car',
        car_brought: r === 2 && i % 4 === 0 ? 'Grabbing Coffee / 35mm Film Camera' : rsvpCar,
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

  // 2. Generate 80 additional spotting feed posts (IDs 5..84 -> total 84 posts = 11 pages @ 8/page)
  // Using coprime strides across 40 verified cars and 32 hubs so:
  // - Each of the 40 cars & verified photos appears exactly 2 times across the 80 posts (2-3 times total with base)
  // - Each of the 32 cafe hubs appears 2-3 times across the 80 posts
  // - Every (car, hub) combination is 100% unique (never repeated!)
  // - Every post has a unique timestamp so adjacent posts on /feed never collide
  for (let p = 0; p < 80; p += 1) {
    const postId = 5 + p
    // Stride by 13 (coprime to 40) so consecutive posts never share the same car/photo
    const carIdx = ((p * 13) + Math.floor(p / 40) * 7) % VERIFIED_CAR_CATALOG.length
    // Stride by 9 (coprime to 32) + shift on second pass of 40 so (carIdx, hubIdx) never repeats
    const hubIdx = (p * 9 + Math.floor(p / 32) * 5) % allHubs.length

    const item = VERIFIED_CAR_CATALOG[carIdx]
    const hub = allHubs[hubIdx]
    const uid = ((p * 5 + Math.floor(p / 6)) % 6) + 1
    const linkedMeetId = 9 + (p % 104)

    const headlineFn = POST_HEADLINE_TEMPLATES[(p * 3 + Math.floor(p / 10)) % POST_HEADLINE_TEMPLATES.length]
    const bodyFn = POST_BODY_TEMPLATES[(p * 5 + Math.floor(p / 6)) % POST_BODY_TEMPLATES.length]

    // Monotonically spaced timestamps across 40 days (Sept 18 to Oct 27, 2026) so sorting by newest preserves the coprime stride order
    const tsDate = new Date(Date.UTC(2026, 8, 18, 7, 0, 0))
    tsDate.setUTCHours(tsDate.getUTCHours() + p * 12)
    const tsYear = tsDate.getUTCFullYear()
    const tsMonth = pad2(tsDate.getUTCMonth() + 1)
    const tsDay = pad2(tsDate.getUTCDate())
    const tsHour = pad2(7 + ((p * 5) % 13))
    const tsMin = pad2((p * 11 + 7) % 60)

    base.posts.push({
      id: postId,
      user_id: uid,
      meet_id: linkedMeetId,
      title: headlineFn(item, hub),
      body: bodyFn(item, hub),
      car_tag: item.car_tag,
      location_tag: hub.city,
      image: item.img,
      created_at: `${tsYear}-${tsMonth}-${tsDay} ${tsHour}:${tsMin}:00`
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
        bio: 'Keeping Malaysian hot-hatch & 4G63 heritage alive at KL & Sarawak coffee meets.',
        created_at: '2026-09-12 19:00:00'
      }
    ],
    meets: [
      {
        id: 1,
        title: 'St Kilda Pier Sunrise Espresso & Classics',
        description:
          'Bring your classic air-cooled 911, restomod, or weekend cruiser down by the bay for fresh single-origin espresso and croissants before Melbourne traffic wakes up. Relaxed family-friendly vibe—no revving or loud stereos near the boardwalk.',
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
        image: 'https://images.unsplash.com/photo-1741963244619-10997539b2e7?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://carsandcoffee.org.au/melbourne-bay-run-2026',
        host_id: 2,
        status: 'upcoming',
        created_at: '2026-10-15 09:00:00'
      },
      {
        id: 2,
        title: 'Port Melbourne Roastery JDM & Pour-Over',
        description:
          "Monthly Sunday morning gathering inside Port Melbourne's brick warehouse district. Specialty V60 pour-overs, matcha lattes, and 80+ bays of Japanese GT-R, rotary, and modern GR/Type-R builds.",
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
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://instagram.com/p/portmelb-jdm-coffee-2026',
        host_id: 4,
        status: 'upcoming',
        created_at: '2026-10-18 11:00:00'
      },
      {
        id: 3,
        title: 'Kuching Waterfront Kopi O & Borneo Builds',
        description:
          "Saturday evening chill meet along the Sarawak River breeze. Local artisanal Gula Apong lattes, iced Kopi O, and a laid-back showcase of Sarawak's cleanest Evolution IX, JDM turbo, and hot-hatch builds.",
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
        image: 'https://images.unsplash.com/photo-1660209336030-ea4d2d0e0412?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://peatix.com/event/kuching-kopi-cars-2026',
        host_id: 3,
        status: 'upcoming',
        created_at: '2026-10-19 14:00:00'
      },
      {
        id: 4,
        title: 'Glenmarie Artisan Roast & Morning Throttle',
        description:
          "Klang Valley's signature Sunday morning Cars & Coffee! Freshly pulled flat whites, sourdough toasties, and wide shaded stone plaza parking headlined by 992 GT3 Touring and JDM builds.",
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
        image: 'https://images.unsplash.com/photo-1786811870319-16bef2f27310?w=900&auto=format&fit=crop&q=80',
        source_url: 'https://facebook.com/events/glenmarie-coffee-2026',
        host_id: 6,
        status: 'upcoming',
        created_at: '2026-10-20 10:00:00'
      },
      {
        id: 5,
        title: 'Yarra Valley Cold Brew & Healesville Hills Run',
        description:
          'Meet for cold brew and bacon & egg rolls in Warrandyte with our Type R and hot-hatch crew before an optional scenic morning cruise up through Christmas Hills to Healesville.',
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
        image: 'https://images.unsplash.com/photo-1572471372724-a7c1c9450c21?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 1,
        status: 'upcoming',
        created_at: '2026-10-21 15:00:00'
      },
      {
        id: 6,
        title: 'Docklands Rooftop Golden Hour & Decaf',
        description:
          'Twilight rooftop photography session and decaf lattes overlooking Bolte Bridge. Open to track-prepped M-cars, clean street builds, roadsters, and daily drivers.',
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
        image: 'https://images.unsplash.com/photo-1744519322632-9bdf5e977e87?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 5,
        status: 'upcoming',
        created_at: '2026-10-22 12:00:00'
      },
      {
        id: 7,
        title: 'Sepang Paddock Kopi & Track-Prepped Street Cars',
        description:
          'Casual morning coffee hangout outside the Sepang Welcome Centre before the public track day starts. Great spot to inspect FD3S rotary setups, wheel fitment, and grab nasi lemak & iced latte.',
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
        image: 'https://images.unsplash.com/photo-1774121618515-881ac7896bda?w=900&auto=format&fit=crop&q=80',
        source_url: null,
        host_id: 3,
        status: 'upcoming',
        created_at: '2026-10-24 09:30:00'
      },
      {
        id: 8,
        title: 'Lygon Street Autumn Espresso & Italian Classics (Past Meet)',
        description:
          'Completed Sunday morning celebration of Maranello supercars, Italian coachbuilding, and Lygon Street espresso culture. Thank you to all 52 owners who attended!',
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
        image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=900&auto=format&fit=crop&q=80',
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
      { id: 8, meet_id: 3, user_id: 6, attend_type: 'bringing_car', car_brought: '2005 Mitsubishi Lancer Evolution IX MR', created_at: '2026-10-23 12:00:00' },
      { id: 9, meet_id: 4, user_id: 3, attend_type: 'bringing_car', car_brought: '2020 Nissan GT-R Recaro Edition (R35)', created_at: '2026-10-23 15:00:00' },
      { id: 10, meet_id: 4, user_id: 6, attend_type: 'bringing_car', car_brought: '2010 Proton Satria Neo R3 Lotus Racing', created_at: '2026-10-24 09:00:00' },
      { id: 11, meet_id: 8, user_id: 2, attend_type: 'bringing_car', car_brought: '1973 Porsche 911 Carrera RS 2.7', created_at: '2026-10-10 09:00:00' },
      { id: 12, meet_id: 8, user_id: 4, attend_type: 'bringing_car', car_brought: '2022 Toyota GR Supra RZ (A90)', created_at: '2026-10-11 10:00:00' }
    ],
    posts: [
      {
        id: 1,
        user_id: 5,
        meet_id: 1,
        title: 'Reflections on the air-cooled 1973 Porsche 911 Carrera RS 2.7',
        body: "Shot a roll of Kodak Portra 400 at Sunday's classic espresso meet. Nothing beats seeing a Grand Prix White Carrera RS 2.7 on Fuchs wheels parked by the coffee machine at 7:30 AM!",
        car_tag: 'Porsche 911 Carrera RS 2.7',
        location_tag: 'St Kilda Pier, Melbourne',
        image: 'https://images.unsplash.com/photo-1741963244619-10997539b2e7?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-28 08:15:00'
      },
      {
        id: 2,
        user_id: 6,
        meet_id: 3,
        title: 'Graphite Grey Evo IX MR & GReddy intercooler ready for Kuching Waterfront Kopi night',
        body: 'Dialed in the alignment and checked the front-mount GReddy intercooler piping on the CT9A Evolution IX MR by the harbour lighthouse. Who else is heading to Ewe Hai Street for Gula Apong lattes?',
        car_tag: 'Mitsubishi Lancer Evolution IX MR',
        location_tag: 'Kuching, Sarawak',
        image: 'https://images.unsplash.com/photo-1660209336030-ea4d2d0e0412?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-28 11:30:00'
      },
      {
        id: 3,
        user_id: 4,
        meet_id: 2,
        title: 'Port Melbourne pour-over scouting in the White A90 GR Supra — ramp clearance verified!',
        body: 'Dropped by Industry Beans this morning to test the rear courtyard entry apron with the lowered White Metallic GR Supra on 3-piece deep-dish wheels. Zero scraping even with front canards!',
        car_tag: 'Toyota GR Supra RZ (A90)',
        location_tag: 'Port Melbourne, VIC',
        image: 'https://images.unsplash.com/photo-1749449387749-cb689efd21fe?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-28 14:40:00'
      },
      {
        id: 4,
        user_id: 3,
        meet_id: 4,
        title: 'Pearl White R35 GT-R highway warmup + Iced Oat Latte = Perfect Sunday',
        body: 'Quick morning warmup down the open highway with the VR38 twin-turbo R35 GT-R before setting up the November Glenmarie roster. Drop your car make in the Roll-Call if you need wide bay parking!',
        car_tag: 'Nissan GT-R Premium (R35)',
        location_tag: 'Glenmarie, Selangor',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=80',
        created_at: '2026-10-28 17:20:00'
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
        body: 'Cannot wait! Bringing the Evo IX MR and a Satria Neo R3 from Petra Jaya.',
        rating: null,
        created_at: '2026-10-24 14:20:00'
      },
      {
        id: 4,
        user_id: 4,
        target_type: 'meet',
        target_id: 8,
        body: 'Best espresso and cleanest classic Ferrari & Porsche turnout all year. Easy parking too!',
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
        body: 'Those Portra tones on the classic Carrera RS 2.7 are incredible Chloe!',
        rating: null,
        created_at: '2026-10-19 15:20:00'
      },
      {
        id: 7,
        user_id: 1,
        target_type: 'post',
        target_id: 3,
        body: 'Legend for checking the ramp clearance Gibson—my front splitter thanks you.',
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
