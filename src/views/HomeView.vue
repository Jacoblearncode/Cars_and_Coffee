<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import { useRealtimePulse } from '../composables/useRealtimePulse'
import { loadDb } from '../services/localDb'
import MeetCard from '../components/MeetCard.vue'
import { MEET_VIBES } from '../data/seedData'

const router = useRouter()
const meetStore = useMeetStore()
const authStore = useAuthStore()
const { showToast } = useToast()
const { isLiveEnabled, liveEventsLog, toggleLiveStream, triggerPulseNow } = useRealtimePulse()

const heroSearch = ref('')
const selectedRegion = ref('All')
const featuredMeets = ref([])
const recentPosts = ref([])
const totalMeetsCount = ref(108)
const totalRsvpsCount = ref(280)

const latestPulse = computed(() => liveEventsLog.value[0] || null)

function handleHeroSearch() {
  router.push({
    path: '/meets',
    query: {
      search: heroSearch.value || undefined,
      region: selectedRegion.value !== 'All' ? selectedRegion.value : undefined
    }
  })
}

async function refreshHomeData() {
  const res = await meetStore.fetchMeets({ status: 'upcoming', limit: 6, sort: 'date' })
  featuredMeets.value = res.data || []
  totalMeetsCount.value = res.total || 108
  const postsRes = await meetStore.fetchPosts({ limit: 3, sort: 'newest' })
  recentPosts.value = postsRes.data || []
  try {
    const db = loadDb()
    totalRsvpsCount.value = db.meet_rsvps?.length || 280
  } catch {
    // ignore
  }
}

async function handleSimulateBurst() {
  await triggerPulseNow()
  await refreshHomeData()
}

async function handleToggleLike(meet) {
  if (!authStore.isAuthenticated) {
    showToast('Sign in to like meets and join the Car Roll-Call.', 'warning')
    router.push('/login')
    return
  }
  await meetStore.toggleLike('meet', meet.id)
  const target = featuredMeets.value.find((m) => Number(m.id) === Number(meet.id))
  if (target) {
    const updated = meetStore.meets.find((m) => Number(m.id) === Number(meet.id))
    if (updated) {
      target.likes_count = updated.likes_count
      target.liked_by = updated.liked_by
    }
  }
}

function handleOfflineNotify({ meet, saved }) {
  showToast(
    saved
      ? `Pinned "${meet.title}" to your Offline Vault.`
      : `Removed "${meet.title}" from your Offline Vault.`
  )
}

onMounted(async () => {
  await refreshHomeData()
})
</script>

<template>
  <div class="container">
    <!-- Live Community Pulse Ticker Strip -->
    <div
      class="cc-tile py-2 px-3 mb-3 d-flex flex-wrap justify-content-between align-items-center gap-2"
      role="region"
      aria-label="Real-time community activity ticker"
    >
      <div class="d-flex align-items-center gap-2 overflow-hidden">
        <span
          class="badge rounded-pill font-mono d-inline-flex align-items-center gap-1"
          :class="isLiveEnabled ? 'text-bg-success' : 'text-bg-secondary'"
        >
          <i class="bi" :class="isLiveEnabled ? 'bi-broadcast-pin' : 'bi-pause-fill'"></i>
          {{ isLiveEnabled ? 'LIVE PULSE' : 'PAUSED' }}
        </span>

        <template v-if="latestPulse">
          <span class="badge cc-badge-accent font-mono">{{ latestPulse.badge }}</span>
          <router-link
            :to="latestPulse.targetRoute"
            class="small fw-semibold text-reset text-decoration-none text-truncate"
          >
            {{ latestPulse.text }}
          </router-link>
          <span class="small text-secondary font-mono d-none d-md-inline">({{ latestPulse.time }})</span>
        </template>
      </div>

      <div class="d-flex align-items-center gap-2 ms-auto">
        <button
          type="button"
          class="btn btn-sm btn-cc-outline rounded-pill py-0 px-2 font-mono"
          style="font-size: 0.72rem"
          @click="handleSimulateBurst"
        >
          <i class="bi bi-lightning-charge-fill text-warning me-1"></i>+1 Live Event
        </button>
        <button
          type="button"
          class="btn btn-sm btn-cc-outline rounded-pill py-0 px-2 font-mono"
          style="font-size: 0.72rem"
          @click="toggleLiveStream"
        >
          {{ isLiveEnabled ? 'Pause' : 'Resume' }}
        </button>
      </div>
    </div>

    <!-- Hero -->
    <section class="cc-hero2 mb-3 cc-rise" aria-labelledby="home-title">
      <div class="cc-hero2-wordmark" aria-hidden="true">ROAST &amp; REDLINE</div>
      <div class="cc-hero2-body">
        <div class="row g-4 align-items-end">
          <div class="col-lg-7">
            <span class="cc-bracket-label">[ 01 // MELBOURNE &amp; MALAYSIA PADDOCK ]</span>
            <h1 id="home-title" class="display-5 fw-bold mt-2 mb-3">
              Early morning espresso.<br />Good cars. Zero ego.
            </h1>
            <form class="cc-glass cc-search-pill" @submit.prevent="handleHeroSearch">
              <label for="hero-search" class="visually-hidden">Search meets, cafes, or suburbs</label>
              <i class="bi bi-search text-warning ms-3"></i>
              <input
                id="hero-search"
                v-model="heroSearch"
                type="search"
                class="form-control flex-grow-1 w-auto"
                style="min-width: 160px"
                placeholder="Search 108+ meets, cafes, JDM, Euro, Kuching..."
              />
              <label for="hero-region" class="visually-hidden">Region</label>
              <select id="hero-region" v-model="selectedRegion" class="form-select w-auto">
                <option value="All">All regions</option>
                <option value="Australia">Melbourne / AU</option>
                <option value="Malaysia">KL &amp; Kuching / MY</option>
              </select>
              <button type="submit" class="btn btn-cc-primary rounded-pill px-4">Find meets</button>
            </form>
            <div class="d-flex flex-wrap gap-2 mt-3">
              <router-link
                v-for="v in MEET_VIBES"
                :key="v.slug"
                :to="{ path: '/meets', query: { vibe: v.name } }"
                class="badge rounded-pill text-decoration-none cc-glass px-3 py-2"
              >
                <i class="bi text-warning me-1" :class="v.icon"></i>{{ v.name }}
              </router-link>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="cc-glass p-4">
              <p class="small mb-3" style="color: rgba(245, 239, 232, 0.88)">
                Browse <strong>{{ totalMeetsCount }}+</strong> verified weekend coffee runs across
                Victoria, Klang Valley, Penang, and Sarawak—or host your own meet with 1-click Smart
                Link Import.
              </p>
              <div class="d-flex flex-wrap gap-2">
                <router-link to="/meets/new" class="btn btn-cc-primary rounded-pill">
                  <i class="bi bi-plus-lg me-1"></i>Host a meet
                </router-link>
                <router-link to="/map" class="btn btn-outline-light rounded-pill">
                  <i class="bi bi-map me-1"></i>Split Radar Map
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Bento: pulse + upcoming -->
    <section class="cc-bento mb-4" aria-labelledby="upcoming-meets-heading">
      <div class="cc-tile cc-tile-accent cc-span-3 d-flex flex-column justify-content-between">
        <span class="cc-bracket-label text-white">[ LIVE ROSTER ]</span>
        <div>
          <div class="cc-stat">{{ totalMeetsCount }}+</div>
          <div class="small text-secondary">Active coffee runs &amp; meets</div>
        </div>
      </div>
      <div class="cc-tile cc-span-3 d-flex flex-column justify-content-between">
        <span class="cc-bracket-label">[ ROLL-CALL ]</span>
        <div>
          <div class="cc-stat">{{ totalRsvpsCount }}<span class="text-warning">+</span></div>
          <div class="small text-secondary">Confirmed paddock RSVPs (AU &amp; MY)</div>
        </div>
      </div>
      <div class="cc-tile cc-span-6">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <span class="cc-bracket-label">[ WEEKEND LINEUP ]</span>
            <h2 id="upcoming-meets-heading" class="h4 fw-bold mt-1 mb-0">Upcoming coffee runs</h2>
          </div>
          <router-link to="/meets" class="btn btn-sm btn-cc-outline rounded-pill">
            All {{ totalMeetsCount }} meets <i class="bi bi-arrow-right ms-1"></i>
          </router-link>
        </div>
        <ul class="list-unstyled mb-0">
          <li v-for="m in featuredMeets.slice(0, 4)" :key="m.id" class="py-2 border-top">
            <router-link :to="`/meets/${m.id}`" class="d-flex justify-content-between text-reset text-decoration-none">
              <span class="fw-semibold">{{ m.title }}</span>
              <span class="small text-secondary">{{ m.cafe_name }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </section>

    <div class="row g-4 mb-5">
      <div v-for="m in featuredMeets" :key="m.id" class="col-md-6 col-lg-4">
        <MeetCard :meet="m" @toggle-like="handleToggleLike" @toggle-offline="handleOfflineNotify" />
      </div>
    </div>

    <!-- Social wall -->
    <section class="mb-4" aria-labelledby="spotting-feed-heading">
      <div class="d-flex flex-wrap justify-content-between align-items-end mb-3">
        <div>
          <span class="cc-bracket-label">[ SOCIAL WALL // 36+ SNAPS ]</span>
          <h2 id="spotting-feed-heading" class="h3 fw-bold mt-1 mb-0">Latest spotting &amp; builds</h2>
        </div>
        <router-link to="/feed" class="btn btn-sm btn-cc-outline rounded-pill">
          Open feed <i class="bi bi-arrow-right ms-1"></i>
        </router-link>
      </div>
      <div class="row g-3">
        <div v-for="post in recentPosts" :key="post.id" class="col-md-4">
          <article class="cc-tile p-0 h-100 d-flex flex-column">
            <div class="d-flex align-items-center gap-2 p-3 pb-2">
              <span class="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold text-white" style="width: 34px; height: 34px; background: var(--cc-accent)">
                {{ (post.author_name || '?').charAt(0) }}
              </span>
              <div class="small lh-sm">
                <strong>{{ post.author_name }}</strong>
                <div class="text-secondary"><i class="bi bi-geo-alt me-1"></i>{{ post.location_tag }}</div>
              </div>
            </div>
            <img :src="post.image" :alt="post.title" class="w-100" style="height: 220px; object-fit: cover" loading="lazy" />
            <div class="p-3 d-flex flex-column flex-grow-1">
              <span class="badge cc-badge-accent align-self-start mb-2">{{ post.car_tag }}</span>
              <h3 class="h6 fw-bold">{{ post.title }}</h3>
              <p class="small text-secondary flex-grow-1 mb-2">{{ post.body }}</p>
              <div class="small text-secondary">
                <i class="bi bi-heart-fill text-danger me-1"></i>{{ post.likes_count }}
                <i class="bi bi-chat-dots ms-3 me-1"></i>{{ post.comments_count }}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
