<script setup>
/**
 * Roast & Redline (Cars & Coffee) — Community Insights & Admin Moderation (Chart.js Telemetry)
 * Displays 3 reactive Chart.js visualizations across 108+ meets & 250+ RSVPs:
 * 1. Popular Car Makes in Roll-Calls (Doughnut Chart)
 * 2. RSVPs & Likes per Coffee Meet (Grouped Bar Chart)
 * 3. Meet Vibe Distribution (Doughnut Chart)
 * Plus an Admin Moderation Table when signed in as Admin.
 */

import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import { api } from '../services/api'
import { useMeetStore } from '../stores/meetStore'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

const meetStore = useMeetStore()
const authStore = useAuthStore()
const { showToast } = useToast()

const insights = ref({
  kpis: { total_meets: 0, total_rsvps: 0, total_posts: 0, total_users: 0 },
  vibe_distribution: {},
  make_distribution: {},
  users: []
})

const allMeets = ref([])

const makeChartData = computed(() => {
  const dist = insights.value.make_distribution || {}
  const labels = Object.keys(dist)
  const values = Object.values(dist)
  return {
    labels: labels.length ? labels : ['Toyota', 'Honda', 'Porsche', 'Nissan', 'Proton'],
    datasets: [
      {
        label: 'Cars in Community Roll-Calls',
        data: values.length ? values : [3, 2, 2, 2, 2],
        backgroundColor: ['#ff5500', '#e5534b', '#0ea5e9', '#2ea043', '#a855f7', '#eab308', '#14b8a6']
      }
    ]
  }
})

const meetTurnoutChartData = computed(() => {
  const topMeets = allMeets.value.slice(0, 6)
  return {
    labels: topMeets.map((m) => m.title.slice(0, 20) + '…'),
    datasets: [
      {
        label: 'Roll-Call RSVPs',
        backgroundColor: '#ff5500',
        data: topMeets.map((m) => m.rsvp_count || 0)
      },
      {
        label: 'Likes',
        backgroundColor: '#e5534b',
        data: topMeets.map((m) => m.likes_count || 0)
      }
    ]
  }
})

const vibeChartData = computed(() => {
  const dist = insights.value.vibe_distribution || {}
  return {
    labels: Object.keys(dist),
    datasets: [
      {
        label: 'Meets by Vibe',
        backgroundColor: ['#ff5500', '#e5534b', '#0ea5e9', '#2ea043', '#a855f7'],
        data: Object.values(dist)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

async function loadInsights() {
  const res = await api.get('insights')
  insights.value = res
  const meetsRes = await meetStore.fetchMeets({ limit: 250, sort: 'popular' })
  allMeets.value = meetsRes.data || []
}

async function handleDeleteUser(userId) {
  try {
    await api.delete(`admin/users/${userId}`)
    insights.value.users = insights.value.users.filter((u) => Number(u.id) !== Number(userId))
    showToast('User account removed by Admin.')
  } catch (err) {
    showToast(err.message || 'Could not remove user.', 'danger')
  }
}

onMounted(() => {
  loadInsights()
})
</script>

<template>
  <div class="container">
    <div class="mb-4">
      <div class="cc-bracket-label">[ 04 // CHART.JS TELEMETRY &amp; PADDOCK ANALYTICS ]</div>
      <h1 class="h2 fw-bold mb-1">Community &amp; Car Roll-Call Insights</h1>
      <p class="text-secondary small mb-0">
        Live breakdown of popular car makes at meets, weekend turnout trends, and meet vibes across
        Australia and Malaysia.
      </p>
    </div>

    <!-- KPI Summary Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="cc-tile cc-tile-accent text-center">
          <div class="cc-stat font-mono mb-0">
            {{ insights.kpis.total_meets }}
          </div>
          <div class="small text-secondary">Hosted Coffee Meets</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="cc-tile text-center">
          <div class="cc-stat font-mono mb-0" style="color: var(--cc-accent)">
            {{ insights.kpis.total_rsvps }}
          </div>
          <div class="small text-secondary">Roll-Call RSVPs</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="cc-tile text-center">
          <div class="cc-stat font-mono mb-0" style="color: var(--cc-accent)">
            {{ insights.kpis.total_posts }}
          </div>
          <div class="small text-secondary">Spotting Feed Snaps</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="cc-tile text-center">
          <div class="cc-stat font-mono mb-0" style="color: var(--cc-accent)">
            {{ insights.kpis.total_users }}
          </div>
          <div class="small text-secondary">Core Club Organizers</div>
        </div>
      </div>
    </div>

    <!-- 3 Chart.js Visualizations -->
    <div class="row g-4 mb-5">
      <div class="col-lg-4">
        <div class="cc-tile h-100">
          <div class="cc-bracket-label">[ MAKE BREAKDOWN ]</div>
          <h2 class="h6 fw-bold mb-3">Popular Car Makes in Roll-Calls</h2>
          <div style="height: 260px">
            <Doughnut :data="makeChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="cc-tile h-100">
          <div class="cc-bracket-label">[ TURNOUT LEADERS ]</div>
          <h2 class="h6 fw-bold mb-3">Top Meet RSVPs vs. Likes</h2>
          <div style="height: 260px">
            <Bar :data="meetTurnoutChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="cc-tile h-100">
          <div class="cc-bracket-label">[ VIBE TAXONOMY ]</div>
          <h2 class="h6 fw-bold mb-3">Meets by Coffee Vibe</h2>
          <div style="height: 260px">
            <Doughnut :data="vibeChartData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>

    <!-- Admin Moderation Section (Visible when logged in as Admin) -->
    <section v-if="authStore.isAdmin" class="cc-tile border-danger border-opacity-50">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span class="cc-bracket-label text-danger mb-1">[ ADMIN CONSOLE ]</span>
          <h2 class="h5 fw-bold mb-0">Admin Community Moderation</h2>
        </div>
        <span class="badge text-bg-danger rounded-pill px-3 py-2">Admin Role Active</span>
      </div>

      <div class="table-responsive">
        <table class="table table-sm align-middle mb-0">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Garage Car</th>
              <th>Region</th>
              <th>Role</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in insights.users" :key="u.id">
              <td class="fw-semibold">{{ u.name }}</td>
              <td class="small text-secondary">{{ u.email }}</td>
              <td class="small font-mono">
                {{ u.car_year }} {{ u.car_make }} {{ u.car_model }}
              </td>
              <td>{{ u.region }}</td>
              <td>
                <span
                  class="badge font-mono"
                  :class="u.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'"
                >
                  {{ u.role }}
                </span>
              </td>
              <td class="text-end">
                <button
                  v-if="u.role !== 'admin'"
                  type="button"
                  class="btn btn-sm btn-outline-danger rounded-pill py-0 px-3"
                  @click="handleDeleteUser(u.id)"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
