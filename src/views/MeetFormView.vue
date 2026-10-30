<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import {
  searchCafeVenue,
  reverseGeocodeVenue,
  importEventFromUrl
} from '../services/externalApis'
import { MEET_VIBES, SMART_LINK_PRESETS_2026 } from '../data/seedData'
import EventMap from '../components/EventMap.vue'

const route = useRoute()
const router = useRouter()
const meetStore = useMeetStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const isEditMode = computed(() => Boolean(route.params.id))

const importUrlInput = ref('')
const importingLink = ref(false)

const cafeSearchQuery = ref('')
const cafeSuggestions = ref([])
const searchingCafes = ref(false)

const form = ref({
  title: '',
  vibe: 'Morning Coffee',
  region: authStore.user?.region || 'Australia',
  cafe_name: '',
  address: '',
  parking_note: '',
  host_contact: authStore.user ? `${authStore.user.name} (${authStore.user.email})` : '',
  latitude: -37.8136,
  longitude: 144.9631,
  meet_datetime: '2026-11-29T08:00',
  end_datetime: '2026-11-29T11:00',
  capacity: 60,
  image:
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&auto=format&fit=crop&q=80',
  description: '',
  source_url: '',
  status: 'upcoming'
})

async function handleSmartLinkImport(presetUrl = '') {
  const targetUrl = presetUrl || importUrlInput.value.trim()
  if (!targetUrl) {
    showToast('Paste an event URL or select a 2026 community preset first.', 'warning')
    return
  }
  importUrlInput.value = targetUrl
  importingLink.value = true
  try {
    const imported = await importEventFromUrl(targetUrl)
    form.value = {
      ...form.value,
      title: imported.title || form.value.title,
      description: imported.description || form.value.description,
      vibe: imported.vibe || form.value.vibe,
      region: imported.region || form.value.region,
      cafe_name: imported.cafe_name || form.value.cafe_name,
      address: imported.address || form.value.address,
      parking_note: imported.parking_note || form.value.parking_note,
      latitude: Number(imported.latitude) || form.value.latitude,
      longitude: Number(imported.longitude) || form.value.longitude,
      meet_datetime: imported.meet_datetime || form.value.meet_datetime,
      end_datetime: imported.end_datetime || form.value.end_datetime,
      capacity: Number(imported.capacity) || form.value.capacity,
      image: imported.image || form.value.image,
      source_url: targetUrl
    }
    showToast('Auto-filled meet details from link!')
  } catch (err) {
    showToast(err.message || 'Could not import that link.', 'danger')
  } finally {
    importingLink.value = false
  }
}

async function handleCafeSearch() {
  if (cafeSearchQuery.value.trim().length < 2) return
  searchingCafes.value = true
  try {
    cafeSuggestions.value = await searchCafeVenue(cafeSearchQuery.value, form.value.region)
    if (cafeSuggestions.value.length === 0) {
      showToast('No matching cafes found — try clicking directly on the map below.', 'warning')
    }
  } finally {
    searchingCafes.value = false
  }
}

function selectCafeSuggestion(item) {
  form.value.cafe_name = item.cafe_name
  form.value.address = item.address
  form.value.latitude = item.latitude
  form.value.longitude = item.longitude
  form.value.region = item.region
  cafeSuggestions.value = []
  showToast(`Pinned ${item.cafe_name} on the map.`)
}

async function handleMapCoordinatePick({ latitude, longitude }) {
  form.value.latitude = latitude
  form.value.longitude = longitude
  const rev = await reverseGeocodeVenue(latitude, longitude)
  if (rev) {
    if (!form.value.cafe_name) form.value.cafe_name = rev.cafe_name
    form.value.address = rev.address
    form.value.region = rev.region
    showToast(`Pinned coordinates & reverse-geocoded: ${rev.cafe_name}`)
  } else {
    showToast(`Pinned coordinates: ${latitude}, ${longitude}`)
  }
}

async function handleSubmit() {
  try {
    if (isEditMode.value) {
      const updated = await meetStore.updateMeet(route.params.id, form.value)
      showToast('Meet updated!')
      router.push(`/meets/${updated.id}`)
    } else {
      const created = await meetStore.createMeet(form.value)
      showToast('Your Cars & Coffee meet is live!')
      router.push(`/meets/${created.id}`)
    }
  } catch (err) {
    showToast(err.message || 'Failed to save meet.', 'danger')
  }
}

onMounted(async () => {
  if (isEditMode.value) {
    const existing = await meetStore.fetchMeetById(route.params.id)
    if (existing) {
      form.value = {
        title: existing.title,
        vibe: existing.vibe,
        region: existing.region,
        cafe_name: existing.cafe_name,
        address: existing.address,
        parking_note: existing.parking_note,
        host_contact: existing.host_contact,
        latitude: existing.latitude,
        longitude: existing.longitude,
        meet_datetime: String(existing.meet_datetime || '').replace(' ', 'T').slice(0, 16),
        end_datetime: String(existing.end_datetime || '').replace(' ', 'T').slice(0, 16),
        capacity: existing.capacity,
        image: existing.image,
        description: existing.description,
        source_url: existing.source_url || '',
        status: existing.status || 'upcoming'
      }
    }
  }
})
</script>

<template>
  <div class="container" style="max-width: 920px">
    <div class="d-flex justify-content-between align-items-end mb-4">
      <div>
        <div class="cc-bracket-label">[ COMMUNITY DISPATCH // HOST A MEET ]</div>
        <h1 class="h2 fw-bold mb-0">
          {{ isEditMode ? 'Edit Cars & Coffee Meet' : 'Host a Cars & Coffee Meet' }}
        </h1>
      </div>
      <router-link to="/meets" class="btn btn-sm btn-cc-outline cc-pill-btn">Cancel</router-link>
    </div>

    <!-- Smart Event Link Importer Box (2026 Events) -->
    <section v-if="!isEditMode" class="cc-tile mb-4 border-warning border-opacity-50">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div>
          <span class="cc-bracket-label mb-1">[ AUTO-SCRAPER ]</span>
          <h2 class="h6 fw-bold mb-0">Smart Event Link Importer (Optional)</h2>
        </div>
        <span class="badge cc-badge-accent font-mono">PHP OpenGraph + 2026 Presets</span>
      </div>
      <p class="small text-secondary mb-3">
        Found a Cars &amp; Coffee flyer on Instagram, Facebook Events, or Peatix? Paste the link
        below (or click a late-2026 preset) to auto-fill the form.
      </p>

      <div class="input-group input-group-sm mb-2">
        <span class="input-group-text"><i class="bi bi-link-45deg"></i></span>
        <input
          v-model="importUrlInput"
          type="url"
          class="form-control"
          placeholder="https://carsandcoffee.org.au/events/2026-11-high-country-espresso"
          aria-label="Event URL to import"
        />
        <button
          type="button"
          class="btn btn-cc-primary"
          :disabled="importingLink"
          @click="handleSmartLinkImport()"
        >
          {{ importingLink ? 'Importing...' : 'Auto-Fill Form' }}
        </button>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2 mt-2">
        <span class="small text-secondary">Try a 2026 link:</span>
        <button
          v-for="p in SMART_LINK_PRESETS_2026"
          :key="p.url"
          type="button"
          class="btn btn-sm btn-cc-outline rounded-pill py-0 px-2"
          style="font-size: 0.76rem"
          @click="handleSmartLinkImport(p.url)"
        >
          <i class="bi bi-lightning-charge text-warning me-1"></i>{{ p.label }}
        </button>
      </div>
    </section>

    <!-- Main Validated Form -->
    <form class="cc-tile" @submit.prevent="handleSubmit">
      <div class="row g-3">
        <div class="col-md-8 field">
          <label for="meet-title" class="form-label fw-semibold">Meet Title *</label>
          <span id="meet-title-hint" class="hint">
            Give your coffee run a clear name (at least 4 characters).
          </span>
          <input
            id="meet-title"
            v-model="form.title"
            v-focus
            type="text"
            class="form-control"
            required
            minlength="4"
            aria-describedby="meet-title-hint"
            aria-errormessage="meet-title-err"
            placeholder="e.g. St Kilda Pier Sunrise Espresso & Classics"
          />
          <div id="meet-title-err" class="error-msg">
            Please enter a meet title (minimum 4 characters).
          </div>
        </div>

        <div class="col-md-4 field">
          <label for="meet-vibe" class="form-label fw-semibold">Meet Vibe *</label>
          <span class="hint">Primary style of this gathering</span>
          <select id="meet-vibe" v-model="form.vibe" class="form-select" required>
            <option v-for="v in MEET_VIBES" :key="v.slug" :value="v.name">{{ v.name }}</option>
          </select>
        </div>

        <!-- Nominatim Live Cafe & Parking Venue Lookup -->
        <div class="col-12">
          <div class="cc-panel p-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label for="cafe-lookup" class="form-label small fw-bold mb-0">
                <i class="bi bi-search text-warning me-1"></i>
                Live "Find a Cafe / Parking Spot" Search (OpenStreetMap Nominatim API)
              </label>
              <span class="badge cc-badge-accent font-mono">AU &amp; MY Geocoder</span>
            </div>
            <div class="input-group input-group-sm">
              <input
                id="cafe-lookup"
                v-model="cafeSearchQuery"
                type="search"
                class="form-control"
                placeholder="Type a cafe or suburb (e.g. Industry Beans Melbourne, Black Bean Kuching, Glenmarie)..."
                @keydown.enter.prevent="handleCafeSearch"
              />
              <button
                type="button"
                class="btn btn-cc-outline"
                :disabled="searchingCafes"
                @click="handleCafeSearch"
              >
                {{ searchingCafes ? 'Searching...' : 'Search Cafe' }}
              </button>
            </div>

            <ul v-if="cafeSuggestions.length > 0" class="list-group list-group-flush mt-2 rounded-3 overflow-hidden">
              <li
                v-for="(item, idx) in cafeSuggestions"
                :key="idx"
                class="list-group-item list-group-item-action d-flex justify-content-between align-items-center small"
                style="cursor: pointer"
                @click="selectCafeSuggestion(item)"
              >
                <div>
                  <strong>{{ item.cafe_name }}</strong>
                  <div class="text-secondary">{{ item.address }}</div>
                </div>
                <span class="badge text-bg-warning text-dark">Use Spot</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="col-md-5 field">
          <label for="meet-cafe" class="form-label fw-semibold">Cafe / Roastery Name *</label>
          <span id="meet-cafe-hint" class="hint">Name of the coffee shop or meetup landmark</span>
          <input
            id="meet-cafe"
            v-model="form.cafe_name"
            type="text"
            class="form-control"
            required
            minlength="2"
            aria-describedby="meet-cafe-hint"
            aria-errormessage="meet-cafe-err"
            placeholder="e.g. Little Blue Roasters"
          />
          <div id="meet-cafe-err" class="error-msg">Please enter the cafe or venue name.</div>
        </div>

        <div class="col-md-4 field">
          <label for="meet-address" class="form-label fw-semibold">Street Address &amp; Suburb *</label>
          <span id="meet-addr-hint" class="hint">Visible publicly to all browsers</span>
          <input
            id="meet-address"
            v-model="form.address"
            type="text"
            class="form-control"
            required
            minlength="4"
            aria-describedby="meet-addr-hint"
            aria-errormessage="meet-addr-err"
            placeholder="e.g. Pier Rd, St Kilda VIC 3182"
          />
          <div id="meet-addr-err" class="error-msg">Please enter a valid street address.</div>
        </div>

        <div class="col-md-3 field">
          <label for="meet-region" class="form-label fw-semibold">Region *</label>
          <span class="hint">Regional Hub</span>
          <select id="meet-region" v-model="form.region" class="form-select" required>
            <option value="Australia">Australia</option>
            <option value="Malaysia">Malaysia</option>
          </select>
        </div>

        <!-- Interactive Map Coordinate Picker -->
        <div class="col-12">
          <EventMap
            :meets="[]"
            :center-lat="Number(form.latitude)"
            :center-lng="Number(form.longitude)"
            :picked-lat="Number(form.latitude)"
            :picked-lng="Number(form.longitude)"
            :interactive-picker="true"
            height="270px"
            @pick-coordinates="handleMapCoordinatePick"
          />
        </div>

        <div class="col-md-4 field">
          <label for="meet-start" class="form-label fw-semibold">Start Date &amp; Time *</label>
          <input
            id="meet-start"
            v-model="form.meet_datetime"
            type="datetime-local"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-4 field">
          <label for="meet-end" class="form-label fw-semibold">End Date &amp; Time *</label>
          <input
            id="meet-end"
            v-model="form.end_datetime"
            type="datetime-local"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-4 field">
          <label for="meet-capacity" class="form-label fw-semibold">Parking Bay Capacity *</label>
          <input
            id="meet-capacity"
            v-model.number="form.capacity"
            type="number"
            min="5"
            max="500"
            class="form-control"
            required
          />
        </div>

        <div class="col-md-6 field">
          <label for="meet-parking" class="form-label fw-semibold">
            Member-Only Parking &amp; Low-Car Ramp Note *
          </label>
          <span class="hint">Hidden from Guests; unlocked for signed-in Members</span>
          <input
            id="meet-parking"
            v-model="form.parking_note"
            type="text"
            class="form-control"
            required
            placeholder="e.g. Enter via North Foreshore Ramp — splitter friendly"
          />
          <div class="error-msg">Please enter parking or entry instructions for members.</div>
        </div>

        <div class="col-md-6 field">
          <label for="meet-contact" class="form-label fw-semibold">Host Contact / Social Handle *</label>
          <span class="hint">Shown only to signed-in Members</span>
          <input
            id="meet-contact"
            v-model="form.host_contact"
            type="text"
            class="form-control"
            required
            placeholder="e.g. @melb_espresso_runs | +61 412 889 102"
          />
          <div class="error-msg">Please provide a contact handle or phone/email.</div>
        </div>

        <div class="col-12 field">
          <label for="meet-image" class="form-label fw-semibold">Cover Photo URL</label>
          <input
            id="meet-image"
            v-model="form.image"
            type="url"
            class="form-control"
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        <div class="col-12 field">
          <label for="meet-desc" class="form-label fw-semibold">Meet Description &amp; Etiquette *</label>
          <span id="meet-desc-hint" class="hint">
            Describe the coffee spot, car themes, and parking etiquette (min 10 characters).
          </span>
          <textarea
            id="meet-desc"
            v-model="form.description"
            rows="3"
            class="form-control"
            required
            minlength="10"
            aria-describedby="meet-desc-hint"
            aria-errormessage="meet-desc-err"
            placeholder="Share what kind of coffee is served, whether there is an optional cruise afterwards, and parking rules..."
          ></textarea>
          <div id="meet-desc-err" class="error-msg">
            Please provide a description (at least 10 characters).
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3 pt-3 border-top">
        <router-link to="/meets" class="btn btn-cc-outline cc-pill-btn">Cancel</router-link>
        <button type="submit" class="btn btn-cc-primary cc-pill-btn px-4">
          <i class="bi bi-check2-circle me-1"></i>
          {{ isEditMode ? 'Save Changes' : 'Publish Cars & Coffee Meet' }}
        </button>
      </div>
    </form>
  </div>
</template>
