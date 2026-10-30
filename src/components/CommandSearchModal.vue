<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { loadDb } from '../services/localDb'

const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const router = useRouter()
const query = ref('')
const inputRef = ref(null)

const dbSnapshot = computed(() => {
  if (!props.open) return { meets: [], posts: [] }
  return loadDb()
})

const matchedMeets = computed(() => {
  const q = query.value.trim().toLowerCase()
  const all = dbSnapshot.value.meets || []
  if (!q) return all.slice(0, 6)
  return all
    .filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.cafe_name.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.vibe.toLowerCase().includes(q) ||
        m.region.toLowerCase().includes(q)
    )
    .slice(0, 8)
})

const matchedPosts = computed(() => {
  const q = query.value.trim().toLowerCase()
  const all = dbSnapshot.value.posts || []
  if (!q) return all.slice(0, 3)
  return all
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.car_tag.toLowerCase().includes(q) ||
        p.location_tag.toLowerCase().includes(q)
    )
    .slice(0, 4)
})

function goTo(path) {
  emit('close')
  query.value = ''
  router.push(path)
}

function handleKeydown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && typeof window !== 'undefined') {
      window.setTimeout(() => {
        inputRef.value?.focus()
      }, 40)
    }
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    v-if="open"
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-center pt-5 px-3"
    style="z-index: 1095; background: rgba(12, 10, 9, 0.78); backdrop-filter: blur(8px)"
    role="dialog"
    aria-modal="true"
    aria-label="Quick command search"
    @click.self="emit('close')"
  >
    <div class="cc-tile w-100 overflow-hidden shadow-lg p-0" style="max-width: 660px">
      <div class="p-3 border-bottom d-flex align-items-center gap-2">
        <i class="bi bi-search fs-5" style="color: var(--cc-accent)" aria-hidden="true"></i>
        <input
          ref="inputRef"
          v-model="query"
          v-focus
          type="search"
          class="form-control border-0 bg-transparent shadow-none"
          placeholder="Search 108+ meets, cafes, cars, or cities (St Kilda, Bangsar, Kuching, Sepang, R34...)"
          aria-label="Search meets, cafes, and car spotting posts"
        />
        <button
          type="button"
          class="btn btn-sm btn-cc-outline font-mono rounded-pill px-3"
          @click="emit('close')"
        >
          ESC
        </button>
      </div>

      <div class="p-3 overflow-auto" style="max-height: 440px">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <span class="cc-bracket-label mb-0">[ COFFEE RUNS &amp; MEETS ({{ matchedMeets.length }}) ]</span>
          <span class="small font-mono text-secondary">{{ dbSnapshot.meets?.length || 0 }} indexed</span>
        </div>

        <div class="list-group list-group-flush mb-3">
          <button
            v-for="m in matchedMeets"
            :key="m.id"
            type="button"
            class="list-group-item list-group-item-action bg-transparent d-flex justify-content-between align-items-center py-2 px-2 rounded-3"
            @click="goTo(`/meets/${m.id}`)"
          >
            <div class="pe-2">
              <div class="fw-bold small">{{ m.title }}</div>
              <div class="text-secondary" style="font-size: 0.76rem">
                <i class="bi bi-cup-hot-fill me-1" style="color: var(--cc-accent)"></i>{{ m.cafe_name }} &middot;
                {{ m.region }}
              </div>
            </div>
            <span class="badge cc-badge-accent font-mono flex-shrink-0">{{ m.vibe }}</span>
          </button>
        </div>

        <div class="cc-bracket-label mb-2">[ SPOTTING FEED SNAPS ({{ matchedPosts.length }}) ]</div>
        <div class="list-group list-group-flush">
          <button
            v-for="p in matchedPosts"
            :key="p.id"
            type="button"
            class="list-group-item list-group-item-action bg-transparent d-flex justify-content-between align-items-center py-2 px-2 rounded-3"
            @click="goTo('/feed')"
          >
            <div class="pe-2">
              <div class="fw-semibold small">{{ p.title }}</div>
              <div class="text-secondary" style="font-size: 0.76rem">
                <i class="bi bi-car-front-fill me-1" style="color: var(--cc-accent)"></i>{{ p.car_tag }} &middot;
                {{ p.location_tag }}
              </div>
            </div>
            <i class="bi bi-arrow-up-right text-secondary"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
