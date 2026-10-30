# Cars & Coffee — Community Car Meets & Social Spotting (`COS30043`)

A streamlined, social-media-style **Car Meet & Weekend Coffee Run Web Application** built with **Vue 3 (`<script setup>`), Vite 5, Vue Router 4, Pinia, Bootstrap 5.3, Leaflet (CartoDB Retina Tiles), FullCalendar v6, Chart.js 4, Vite PWA, Vitest, and a Dual-Mode PHP + MySQL / LocalDB Backend** for Swinburne University's **COS30043 (Interface Design and Development)** group project.

---

## 1. Quick Start & Commands (`D:\Cars_and_Coffee`)

```powershell
cd D:\Cars_and_Coffee

# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run automated Vitest unit & component test suite
npm test

# 4. Build production bundle + PWA Service Worker for Swinburne Mercury
npm run build
```

---

## 2. Seeded Demo Accounts (Password: `Password123!`)

| Role | Email | Primary Garage Ride | Capabilities |
| :--- | :--- | :--- | :--- |
| **Guest** | *(Unauthenticated)* | — | Browse public meets, map, calendar, and spotting feed. Exact parking bay / low-car ramp notes and host contact details are masked behind a Member Privacy Shield. |
| **Member (AU)** | `member@carsandcoffee.com` | `2023 Toyota GR86` | Unlock exact parking bay notes & host contacts; host/edit/delete own meets; RSVP to the **Car Roll-Call**; post/edit/delete on the **Social Spotting Feed**; pin meets to the **Offline Vault**. |
| **Member (MY)** | `amirul@carsandcoffee.com` | `2010 Proton Satria Neo R3` | Malaysian member account defaulted to Kuching / Klang Valley hub. |
| **Admin** | `admin@carsandcoffee.com` | `2024 Honda Civic Type R (FL5)` | All Member capabilities plus community moderation across meets, posts, comments, and users on `/insights`. |

---

## 3. Complete 10 Interconnected Pages (COS30043 Rubric)

| # | Route | View Component | Description & Rubric Alignment |
| :--- | :--- | :--- | :--- |
| **1** | `/` | `src/views/HomeView.vue` | Hero search, vibe pills, featured upcoming Nov/Dec 2026 coffee runs, and social spotting feed highlights. |
| **2** | `/meets` | `src/views/MeetsListView.vue` | Searchable, filterable, sortable, and paginated Cars & Coffee directory with GPS Haversine distance sorting. |
| **3** | `/meets/:id` | `src/views/MeetDetailView.vue` | Meet details, live **Open-Meteo Cruising Weather**, **Guest vs. Member parking note unlock**, **Parking Lot Car Roll-Call**, and comments/ratings. |
| **4** | `/meets/new`<br>`/meets/:id/edit` | `src/views/MeetFormView.vue` | Social-style Host/Edit Meet form with **Smart Event Link Importer**, **OpenStreetMap Nominatim Cafe Search**, and click-to-pin map. |
| **5** | `/login`<br>`/register` | `src/views/LoginView.vue`<br>`src/views/RegisterView.vue` | Accessible `:user-invalid` validated authentication forms with NHTSA Car Make/Model picker & 1-click Demo Login. |
| **6** | `/feed` | `src/views/FeedView.vue` | Social media car-spotting & build feed where members share photos, link meets, like (`♥`), comment, and edit/delete their own posts. |
| **7** | `/map` | `src/views/ExploreMapView.vue` | Enhanced **Leaflet Map with CartoDB Retina Tiles** (`Dark Matter` / `Voyager`) + **FullCalendar** monthly & schedule explorer. |
| **8** | `/saved` | `src/views/SavedMeetsView.vue` | User's RSVPs, liked meets, and **PWA Offline Vault + Out-of-Signal Outbox Sync**. |
| **9** | `/garage` | `src/views/GarageProfileView.vue` | User profile, **"My Garage"** car builder (NHTSA vPIC API + Proton/Perodua/Holden registry), and management of hosted meets & posts. |
| **10** | `/insights` | `src/views/InsightsView.vue` | **Chart.js** visual analytics (Popular Car Makes in Roll-Calls, RSVPs vs. Likes, Meets by Vibe) + **Admin Moderation Panel**. |

---

## 4. 4-Member Team Split & Week 12 Interview Guide

| Member | Role | Advanced Vue Feature & Interview Files |
| :--- | :--- | :--- |
| **Jacob** | Full-Stack Lead | **PWA Service Worker + Offline Vault & Out-of-Signal Sync (`vite.config.js`, `src/composables/useOfflineSync.js`, `src/services/api.js`, `src/services/localDb.js`):** Caches map tiles, weather, and pinned meets; automatically routes to `localDb.js` when offline or out of cell range and queues RSVPs/likes/posts to sync when reconnected. |
| **Syed** | Backend & State Lead | **Pinia Persisted State + Pure-PHP HMAC-SHA256 JWT Auth & Privacy Masking (`src/stores/authStore.js`, `src/router/index.js`, `api/index.php`, `api/jwt.php`, `database/schema.sql`):** Enforces Guest vs. Member parking-note masking, author-only edit/delete permissions, and MariaDB 5.5 6-table schema. |
| **Naveed** | Geospatial & API Lead | **Enhanced Leaflet Map (CartoDB Retina Tiles) + Nominatim Cafe Search + FullCalendar (`src/components/EventMap.vue`, `src/components/EventCalendar.vue`, `src/services/externalApis.js`):** Theme-reactive vector-styled tiles, custom Coffee/Car SVG pins, Haversine distance calculator, and live OpenStreetMap cafe geocoding. |
| **Gibson** | Analytics & QA Lead | **Reactive Chart.js Community Insights + Vitest Automated Test Suite & WCAG 2.1 AA Validation (`src/views/InsightsView.vue`, `tests/unit/carsAndCoffee.spec.js`, `src/style.css`):** Visualizes Car Roll-Call make distribution, turnout trends, and post-interaction `:user-invalid` form validation. |
