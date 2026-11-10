<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../services/api'
import MeetCard from '../components/MeetCard.vue'
import { MEET_VIBES } from '../data/seedData'

const router = useRouter()
const recommendationMeets = ref([])
const loading = ref(true)
const region = ref('Malaysia')
const vibe = ref('All')
const interests = ref(['JDM', 'Coffee'])
const savedKey = 'cars_coffee_smart_pick_preferences'
const interestOptions = ['JDM', 'Euro', 'Classic', 'Track', 'Photography', 'Coffee', 'Scenic Drive']

function loadPreferences() {
  try {
    const saved = JSON.parse(localStorage.getItem(savedKey) || '{}')
    if (saved.region) region.value = saved.region
    if (saved.vibe) vibe.value = saved.vibe
    if (Array.isArray(saved.interests)) interests.value = saved.interests
  } catch { /* use defaults */ }
}

function savePreferences() {
  localStorage.setItem(savedKey, JSON.stringify({ region: region.value, vibe: vibe.value, interests: interests.value }))
}

function toggleInterest(item) {
  interests.value = interests.value.includes(item)
    ? interests.value.filter((x) => x !== item)
    : [...interests.value, item]
  savePreferences()
}

const interestKeywords = {
  JDM: ['jdm', 'nissan', 'honda', 'toyota', 'mazda', 'subaru', 'mitsubishi'],
  Euro: ['euro', 'porsche', 'bmw', 'mercedes', 'audi', 'volkswagen'],
  Classic: ['classic', 'vintage', 'retro', 'air-cooled', 'roadster'],
  Track: ['track', 'sepang', 'paddock', 'circuit', 'performance'],
  Photography: ['photo', 'photography', 'spotting', 'sunset', 'golden hour'],
  Coffee: ['coffee', 'espresso', 'brew', 'cafe', 'kopi', 'latte'],
  'Scenic Drive': ['scenic', 'cruise', 'touge', 'coastal', 'drive', 'run']
}

// Weighted scoring: location 30%, vibe 25%, interests 35%, upcoming status 5%,
// and remaining capacity 5%. Disabled preferences are excluded from the total.
function analyseMeet(meet) {
  const searchableText = `${meet.title || ''} ${meet.description || ''} ${meet.vibe || ''} ${meet.cafe_name || ''} ${meet.address || ''}`.toLowerCase()
  const reasons = []
  let earned = 0
  let possible = 0
  const breakdown = []

  const addCriterion = (label, weight, matched, explanation) => {
    possible += weight
    if (matched) { earned += weight; reasons.push(explanation) }
    breakdown.push({ label, weight, matched })
  }

  if (region.value !== 'All') {
    addCriterion('Region', 30, String(meet.region || '').toLowerCase() === region.value.toLowerCase(),
      `It is in your preferred region (${region.value}).`)
  }
  if (vibe.value !== 'All') {
    addCriterion('Atmosphere', 25, String(meet.vibe || '').toLowerCase() === vibe.value.toLowerCase(),
      `It matches your ${vibe.value} atmosphere preference.`)
  }
  if (interests.value.length) {
    const perInterestWeight = 35 / interests.value.length
    let matchedInterests = 0
    interests.value.forEach((interest) => {
      const matched = (interestKeywords[interest] || []).some((word) => searchableText.includes(word))
      if (matched) { matchedInterests += 1; reasons.push(`Matches your ${interest} interest.`) }
    })
    earned += matchedInterests * perInterestWeight
    possible += 35
    breakdown.push({ label: 'Interests', weight: 35, matched: matchedInterests > 0, detail: `${matchedInterests}/${interests.value.length} matched` })
  }

  const meetDate = new Date(meet.meet_datetime || meet.date || '')
  const isUpcoming = meet.status === 'upcoming' || (!Number.isNaN(meetDate.getTime()) && meetDate >= new Date())
  addCriterion('Upcoming', 5, isUpcoming, 'The meet is upcoming.')

  const capacity = Number(meet.capacity) || 0
  const attending = Number(meet.rsvp_count) || 0
  const hasSpace = capacity > 0 && attending < capacity
  if (capacity > 0) addCriterion('Availability', 5, hasSpace, 'There is still space available.')

  const score = possible ? Math.round((earned / possible) * 100) : 0
  return { matchScore: score, matchReasons: reasons.slice(0, 4), scoreBreakdown: breakdown }
}

const recommendations = computed(() => [...recommendationMeets.value]
  .map((meet) => ({ ...meet, ...analyseMeet(meet) }))
  .sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    const aDate = new Date(a.meet_datetime || a.date || '').getTime() || Number.MAX_SAFE_INTEGER
    const bDate = new Date(b.meet_datetime || b.date || '').getTime() || Number.MAX_SAFE_INTEGER
    return aDate - bDate
  })
  .slice(0, 9))
const topComparisons = computed(() => recommendations.value.slice(0, 3))

async function refreshRecommendations() {
  savePreferences()
  loading.value = true
  try {
    const result = await api.get('meets', { page: 1, limit: 250, status: 'all', sort: 'date' })
    recommendationMeets.value = result.data || []
  } catch (error) {
    console.error('Could not load meet recommendations:', error)
    recommendationMeets.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPreferences()
  refreshRecommendations()
})
</script>

<template>
  <div class="container">
    <div class="mb-4">
      <div class="cc-bracket-label">[ 03 // PERSONALISED DISCOVERY ]</div>
      <h1 class="h2 fw-bold mb-1">Smart Meet Picks</h1>
      <p class="text-secondary small mb-0">
        Tell us what you enjoy. The recommendation engine scores upcoming meets against your location, preferred event vibe, and car interests.
      </p>
    </div>

    <section class="cc-tile mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <label class="form-label small fw-semibold">Preferred region</label>
          <select v-model="region" class="form-select" @change="savePreferences">
            <option>Malaysia</option><option>Australia</option><option>All</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-semibold">Meet atmosphere</label>
          <select v-model="vibe" class="form-select" @change="savePreferences">
            <option value="All">Any atmosphere</option>
            <option v-for="item in MEET_VIBES" :key="item.slug" :value="item.name">{{ item.name }}</option>
          </select>
        </div>
        <div class="col-md-4">
          <button class="btn btn-cc-primary w-100 rounded-pill" @click="refreshRecommendations">
            <i class="bi bi-stars me-2"></i>Find my meets
          </button>
        </div>
      </div>
      <hr class="my-4 opacity-25">
      <label class="form-label small fw-semibold">Choose your interests</label>
      <div class="d-flex flex-wrap gap-2">
        <button
          v-for="item in interestOptions"
          :key="item"
          type="button"
          class="btn rounded-pill btn-sm"
          :class="interests.includes(item) ? 'btn-dark' : 'btn-outline-secondary'"
          @click="toggleInterest(item)"
        >
          <i v-if="interests.includes(item)" class="bi bi-check2 me-1"></i>{{ item }}
        </button>
      </div>
      <p class="small text-secondary mt-3 mb-0">
        <i class="bi bi-shield-check me-1"></i>Your preferences are saved only in this browser.
      </p>
    </section>

    <section class="cc-tile mb-4">
      <h2 class="h6 fw-bold mb-3">
        <i class="bi bi-calculator me-2" style="color:var(--cc-accent)"></i>How the match score is calculated
      </h2>
      <div class="row g-3 small">
        <div class="col-6 col-md"><strong>30%</strong><div class="text-secondary">Preferred region</div></div>
        <div class="col-6 col-md"><strong>25%</strong><div class="text-secondary">Meet atmosphere</div></div>
        <div class="col-6 col-md"><strong>35%</strong><div class="text-secondary">Selected interests</div></div>
        <div class="col-6 col-md"><strong>5%</strong><div class="text-secondary">Upcoming event</div></div>
        <div class="col-6 col-md"><strong>5%</strong><div class="text-secondary">Space available</div></div>
      </div>
      <p class="small text-secondary mt-3 mb-0">
        The system adds the weights for matched criteria and divides by the weights that apply to your selected preferences. If you choose “All” for a filter, that criterion is left out of the calculation.
      </p>
    </section>

    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <h2 class="h4 fw-bold mb-1">Recommended for you</h2>
        <p class="small text-secondary mb-0">Ranked by your preference match score</p>
      </div>
      <span class="badge rounded-pill text-bg-dark font-mono">{{ recommendations.length }} matches</span>
    </div>

    <div v-if="loading" class="py-5 text-center">
      <div class="spinner-border" role="status"></div>
      <p class="mt-2">Finding your best meets…</p>
    </div>
    <div v-else-if="!recommendations.length" class="alert alert-info">
      No meets found. Try changing your region or interests.
    </div>
    <div v-else class="row g-4 mb-5">
      <div v-for="meet in recommendations" :key="meet.id" class="col-md-6 col-xl-4 d-flex">
        <div class="d-flex flex-column w-100">
          <div class="position-relative flex-grow-1 d-flex flex-column">
            <div class="position-absolute top-0 end-0 m-2 badge text-bg-success shadow-sm" style="z-index:2">
              {{ meet.matchScore }}% match
            </div>
            <MeetCard :meet="meet" class="flex-grow-1" />
          </div>
          <div class="rounded-4 p-3 mt-2 small" style="background:var(--cc-surface);border:1px solid var(--cc-border)">
            <div class="fw-semibold mb-2">
              <i class="bi bi-lightbulb me-1" style="color:var(--cc-accent)"></i>Why this matches
            </div>
            <ul v-if="meet.matchReasons.length" class="mb-2 ps-3 text-secondary">
              <li v-for="reason in meet.matchReasons" :key="reason">{{ reason }}</li>
            </ul>
            <p v-else class="text-secondary mb-2">It is a general suggestion based on your current filters.</p>
            <button
              type="button"
              class="btn btn-sm btn-cc-outline rounded-pill w-100 mt-1"
              @click="router.push(`/meets/${meet.id}`)"
            >
              View meet details <i class="bi bi-arrow-right ms-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <section v-if="topComparisons.length" class="cc-tile mb-4">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <span class="cc-bracket-label">[ TOP 3 // SIDE-BY-SIDE COMPARISON ]</span>
          <h3 class="h5 fw-bold mb-0">Compare your top 3</h3>
          <p class="small text-secondary mb-0">A quick side-by-side look at your strongest matches.</p>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table align-middle mb-0">
          <thead>
            <tr class="small text-secondary">
              <th>Meet</th>
              <th>Match</th>
              <th>Region</th>
              <th>Atmosphere</th>
              <th>Interest match</th>
              <th class="text-end">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="meet in topComparisons" :key="`compare-${meet.id}`">
              <td class="fw-semibold">
                <router-link :to="`/meets/${meet.id}`" class="text-reset text-decoration-none">
                  {{ meet.title }}
                </router-link>
              </td>
              <td><span class="badge text-bg-success">{{ meet.matchScore }}%</span></td>
              <td>{{ meet.region || 'Not specified' }}</td>
              <td>{{ meet.vibe || 'Not specified' }}</td>
              <td>{{ meet.scoreBreakdown.find((item) => item.label === 'Interests')?.detail || 'Not selected' }}</td>
              <td class="text-end">
                <router-link :to="`/meets/${meet.id}`" class="btn btn-sm btn-cc-outline rounded-pill px-3 text-nowrap">
                  View details <i class="bi bi-arrow-right ms-1"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
