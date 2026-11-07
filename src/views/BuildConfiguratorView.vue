<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import Car3DViewer from '../components/Car3DViewer.vue'

const authStore = useAuthStore()
const { showToast } = useToast()

const paintOptions = [
  { name: 'Racing Red', value: '#c7352b' },
  { name: 'Midnight Black', value: '#202329' },
  { name: 'Pearl White', value: '#e8e5df' },
  { name: 'Nardo Grey', value: '#858b91' },
  { name: 'Electric Blue', value: '#1765b7' },
  { name: 'Forest Green', value: '#315b48' },
  { name: 'Sunset Orange', value: '#e87932' },
  { name: 'Violet', value: '#7654a7' }
]
const wheelOptions = [
  { name: 'Classic 5-spoke', value: 'five' },
  { name: 'Sport multi-spoke', value: 'multi' },
  { name: 'Deep dish', value: 'dish' }
]
const modelOptions = ['Realistic Sedan (CC0)']
const defaults = () => ({
  name: 'Weekend Project', model: 'Realistic Sedan (CC0)', year: 2024,
  paint: '#c7352b', wheels: 'five', rideHeight: 'standard',
  spoiler: false, frontSplitter: false, windowTint: false, exhaust: 'street', notes: ''
})
const build = ref(defaults())
const savedBuilds = ref([])
const activeTab = ref('exterior')
const totalPrice = computed(() => {
  let total = 0
  if (build.value.wheels !== 'five') total += build.value.wheels === 'dish' ? 1800 : 1400
  if (build.value.rideHeight !== 'standard') total += 950
  if (build.value.spoiler) total += 1200
  if (build.value.frontSplitter) total += 650
  if (build.value.windowTint) total += 300
  if (build.value.exhaust === 'sport') total += 1600
  if (build.value.exhaust === 'track') total += 2400
  return total
})
const selectedPaint = computed(() => paintOptions.find((p) => p.value === build.value.paint)?.name || 'Custom')
const savedCount = computed(() => savedBuilds.value.length)
const modelViewer = ref(null)
const cameraPresets = [
  { label: 'Front', orbit: '0deg 75deg 4.5m' },
  { label: 'Side', orbit: '90deg 75deg 4.5m' },
  { label: 'Rear', orbit: '180deg 75deg 4.5m' },
  { label: 'Top', orbit: '0deg 15deg 4.5m' }
]
function setCamera(orbit) {
  const preset = orbit.startsWith('90deg') ? 'side' : orbit.startsWith('180deg') ? 'rear' : orbit.includes('15deg') ? 'top' : 'front'
  modelViewer.value?.setCamera(preset)
}
function resetCamera() { modelViewer.value?.setCamera('reset') }

function loadSaved() {
  try {
    const key = `cc_custom_builds_${authStore.user?.id || 'guest'}`
    const parsed = JSON.parse(localStorage.getItem(key) || '[]')
    savedBuilds.value = Array.isArray(parsed) ? parsed : []
  } catch { savedBuilds.value = [] }
}
function persist() {
  const key = `cc_custom_builds_${authStore.user?.id || 'guest'}`
  localStorage.setItem(key, JSON.stringify(savedBuilds.value))
}
function saveBuild() {
  const entry = { ...build.value, id: Date.now(), paintName: selectedPaint.value, estimatedCost: totalPrice.value, savedAt: new Date().toISOString() }
  savedBuilds.value.unshift(entry)
  persist()
  showToast('Your custom build has been saved!', 'success')
}
function loadBuild(item) {
  const { paintName, estimatedCost, savedAt, id, ...config } = item
  build.value = { ...defaults(), ...config, model: modelOptions.includes(config.model) ? config.model : defaults().model }
  showToast(`Loaded ${item.name || 'custom build'}.`, 'success')
}
function deleteBuild(id) {
  savedBuilds.value = savedBuilds.value.filter((item) => item.id !== id)
  persist()
  showToast('Saved build removed.')
}
function resetBuild() { build.value = defaults() }
function exportBuild() {
  const blob = new Blob([JSON.stringify({ ...build.value, estimatedCost: totalPrice.value }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${build.value.model.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-build.json`
  link.click()
  URL.revokeObjectURL(url)
}
watch(() => authStore.user?.id, loadSaved)
loadSaved()
</script>

<template>
  <div class="container build-configurator py-2">
    <header class="build-heading mb-4">
      <div>
        <div class="cc-bracket-label">[ GARAGE LAB // CUSTOM BUILDS ]</div>
        <h1 class="display-6 fw-bold mb-2">Build your dream ride.</h1>
        <p class="text-secondary mb-0">Choose your spec, preview the look and save your build to your garage.</p>
      </div>
      <span class="build-status"><i class="bi bi-sliders me-1"></i> INTERACTIVE CONFIGURATOR</span>
    </header>

    <div class="row g-4 align-items-start">
      <section class="col-lg-7">
        <div class="cc-card preview-card p-3 p-md-4">
          <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
            <div><div class="small text-secondary text-uppercase fw-bold">Live 3D preview</div><h2 class="h4 mb-0">{{ build.model }}</h2></div>
            <span class="badge cc-badge-accent">{{ build.year }} SPEC</span>
          </div>
          <div class="car-stage" :style="{ '--car-paint': build.paint }">
            <div class="stage-glow"></div>
            <Car3DViewer ref="modelViewer" :paint="build.paint" :model="build.model" />
            <div class="model-controls" aria-label="3D camera views">
              <button v-for="preset in cameraPresets" :key="preset.label" class="btn btn-sm" @click="setCamera(preset.orbit)">{{ preset.label }}</button>
              <button class="btn btn-sm" @click="resetCamera" title="Reset camera"><i class="bi bi-arrow-counterclockwise"></i></button>
            </div>
            <div class="stage-caption"><span><i class="bi bi-palette me-1"></i>{{ selectedPaint }}</span><span><i class="bi bi-mouse me-1"></i>Drag to rotate · Scroll to zoom</span></div>
          </div>
          <div class="preview-footer mt-3"><div><span class="small text-secondary">ESTIMATED MODIFICATION COST</span><div class="h3 mb-0 fw-bold">${{ totalPrice.toLocaleString() }}</div></div><div class="d-flex gap-2"><button class="btn btn-cc-outline btn-sm" @click="resetBuild"><i class="bi bi-arrow-counterclockwise me-1"></i>Reset</button><button class="btn btn-cc-primary btn-sm" @click="saveBuild"><i class="bi bi-bookmark-plus me-1"></i>Save build</button></div></div>
        </div>
        <div class="cc-card p-3 mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3"><h2 class="h5 mb-0">Saved builds <span class="text-secondary">({{ savedCount }})</span></h2><button class="btn btn-sm btn-cc-outline" @click="exportBuild"><i class="bi bi-download me-1"></i>Export current</button></div>
          <div v-if="!savedBuilds.length" class="text-secondary small py-3 text-center">Your saved builds will appear here.</div>
          <div v-for="item in savedBuilds" :key="item.id" class="saved-build-row"><span class="saved-swatch" :style="{ background: item.paint }"></span><div class="flex-grow-1"><div class="fw-semibold">{{ item.name || item.model }}</div><div class="small text-secondary">{{ item.model }} · {{ item.paintName }} · ${{ Number(item.estimatedCost || 0).toLocaleString() }}</div></div><button class="btn btn-sm btn-cc-outline" @click="loadBuild(item)">Load</button><button class="btn btn-sm btn-outline-danger" aria-label="Delete saved build" @click="deleteBuild(item.id)"><i class="bi bi-trash"></i></button></div>
        </div>
      </section>

      <section class="col-lg-5">
        <div class="cc-card p-3 p-md-4 config-panel">
          <div class="d-flex gap-2 mb-4"><button class="config-tab" :class="{ active: activeTab === 'exterior' }" @click="activeTab = 'exterior'"><i class="bi bi-car-front me-1"></i>Exterior</button><button class="config-tab" :class="{ active: activeTab === 'performance' }" @click="activeTab = 'performance'"><i class="bi bi-speedometer2 me-1"></i>Performance</button></div>
          <div class="field mb-3"><label class="form-label fw-semibold">Build name</label><input v-model="build.name" class="form-control" maxlength="40" placeholder="e.g. Weekend Project" /></div>
          <div class="row g-2 mb-4"><div class="col-8"><label class="form-label fw-semibold">Available 3D model</label><select v-model="build.model" class="form-select"><option v-for="model in modelOptions" :key="model" :value="model">{{ model }}</option></select></div><div class="col-4"><label class="form-label fw-semibold">Year</label><input v-model.number="build.year" type="number" min="1960" max="2027" class="form-control" /></div></div><p class="small text-secondary mb-3">Only the available realistic, unbranded sedan model is listed. It is a real-world-scale exterior model, not an exact replica of a named manufacturer or production model.</p>
          <template v-if="activeTab === 'exterior'">
            <div class="config-section"><div class="d-flex justify-content-between mb-2"><h3 class="h6 fw-bold mb-0">Paint colour</h3><span class="small text-secondary">{{ selectedPaint }}</span></div><div class="paint-grid"><button v-for="paint in paintOptions" :key="paint.value" class="paint-swatch" :class="{ selected: build.paint === paint.value }" :style="{ '--swatch': paint.value }" :aria-label="paint.name" :title="paint.name" @click="build.paint = paint.value"></button></div></div>
            <div class="config-section"><h3 class="h6 fw-bold mb-2">Wheel style</h3><div class="choice-list"><label v-for="wheel in wheelOptions" :key="wheel.value" class="choice-card" :class="{ selected: build.wheels === wheel.value }"><input v-model="build.wheels" type="radio" :value="wheel.value" /><span>{{ wheel.name }}</span><i class="bi bi-check-circle-fill ms-auto"></i></label></div></div>
            <div class="config-section"><h3 class="h6 fw-bold mb-2">Ride height</h3><div class="btn-group w-100"><button v-for="height in [{ value: 'standard', label: 'Standard' }, { value: 'lowered', label: 'Lowered' }]" :key="height.value" class="btn" :class="build.rideHeight === height.value ? 'btn-cc-primary' : 'btn-cc-outline'" @click="build.rideHeight = height.value">{{ height.label }}</button></div></div>
            <div class="config-section"><h3 class="h6 fw-bold mb-2">Body options</h3><label class="option-toggle"><span><strong>Rear spoiler</strong><small>Sport-inspired rear wing</small></span><input v-model="build.spoiler" type="checkbox" class="form-check-input" /></label><label class="option-toggle"><span><strong>Front splitter</strong><small>Low-profile front aero lip</small></span><input v-model="build.frontSplitter" type="checkbox" class="form-check-input" /></label><label class="option-toggle"><span><strong>Window tint</strong><small>Darker glass appearance</small></span><input v-model="build.windowTint" type="checkbox" class="form-check-input" /></label></div>
          </template>
          <template v-else>
            <div class="config-section"><h3 class="h6 fw-bold mb-2">Exhaust setup</h3><div class="choice-list"><label v-for="ex in [{ value: 'street', label: 'Street exhaust', price: 'Included' }, { value: 'sport', label: 'Sport exhaust', price: '+$1,600' }, { value: 'track', label: 'Track exhaust', price: '+$2,400' }]" :key="ex.value" class="choice-card" :class="{ selected: build.exhaust === ex.value }"><input v-model="build.exhaust" type="radio" :value="ex.value"/><span>{{ ex.label }}</span><small class="ms-auto text-secondary">{{ ex.price }}</small></label></div></div>
            <div class="cc-panel p-3 mt-4"><div class="small text-secondary fw-bold mb-1">BUILD ESTIMATE</div><div class="display-6 fw-bold">${{ totalPrice.toLocaleString() }}</div><p class="small text-secondary mb-0">Illustrative modification estimate only. Actual workshop prices may vary.</p></div>
          </template>
          <div class="mt-4 small text-secondary"><i class="bi bi-info-circle me-1"></i>Your selections update the preview instantly. Saved builds stay in this browser on this device.</div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.build-heading{display:flex;justify-content:space-between;align-items:end;gap:1rem;flex-wrap:wrap}.build-status{font:700 .7rem var(--cc-font-mono);letter-spacing:.08em;color:var(--cc-accent);border:1px solid var(--cc-border);border-radius:999px;padding:.55rem .8rem}.preview-card{overflow:hidden}.car-stage{position:relative;min-height:300px;border-radius:.85rem;overflow:hidden;background:radial-gradient(ellipse at 50% 60%,#4b443c 0%,#25211e 42%,#151311 78%);display:flex;align-items:center}.stage-glow{position:absolute;width:65%;height:45%;left:18%;top:35%;background:var(--car-paint);filter:blur(75px);opacity:.22}.car-model{position:relative;z-index:1;width:100%;height:360px;background:transparent}.model-controls{position:absolute;z-index:3;top:.75rem;right:.75rem;display:flex;gap:.35rem;flex-wrap:wrap;justify-content:flex-end}.model-controls .btn{background:#111c;color:#fff;border:1px solid #ffffff35;border-radius:2rem;font-size:.7rem;backdrop-filter:blur(8px)}.model-controls .btn:hover{background:#ffffff25}.model-loading{display:flex;flex-direction:column;align-items:center;gap:.5rem;color:#eee;font-size:.85rem}.model-loading i{font-size:2.5rem}.model-progress{position:absolute;bottom:0;left:0;width:100%;height:3px;background:#ffffff22}.model-progress span{display:block;height:100%;background:var(--cc-accent);width:35%;animation:modelLoad 1.2s ease-in-out infinite alternate}@keyframes modelLoad{to{width:90%}}.stage-caption{position:absolute;z-index:2;bottom:.8rem;left:1rem;right:1rem;display:flex;justify-content:space-between;gap:.5rem;color:#eee;font-size:.72rem}.stage-caption span{background:#111a;padding:.35rem .6rem;border-radius:2rem;backdrop-filter:blur(8px)}.preview-footer{display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}.config-panel{position:sticky;top:1rem}.config-tab{flex:1;border:1px solid var(--cc-border);border-radius:.6rem;padding:.65rem;background:transparent;color:var(--cc-text);font-weight:700}.config-tab.active{background:var(--cc-accent-soft);border-color:var(--cc-accent);color:var(--cc-accent)}.config-section{padding:1rem 0;border-top:1px solid var(--cc-border)}.paint-grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:.55rem}.paint-swatch{aspect-ratio:1;border-radius:50%;border:3px solid var(--swatch);background:var(--swatch);box-shadow:inset 0 0 0 2px #0002;cursor:pointer}.paint-swatch.selected{outline:2px solid var(--cc-accent);outline-offset:3px}.choice-list{display:grid;gap:.5rem}.choice-card{display:flex;align-items:center;gap:.7rem;border:1px solid var(--cc-border);border-radius:.65rem;padding:.75rem;cursor:pointer}.choice-card input{accent-color:var(--cc-accent)}.choice-card i{opacity:0;color:var(--cc-accent)}.choice-card.selected{border-color:var(--cc-accent);background:var(--cc-accent-soft)}.choice-card.selected i{opacity:1}.option-toggle{display:flex;justify-content:space-between;align-items:center;padding:.75rem 0;border-top:1px solid var(--cc-border);gap:1rem}.option-toggle small{display:block;color:var(--cc-text-muted);font-size:.78rem}.saved-build-row{display:flex;align-items:center;gap:.65rem;padding:.7rem 0;border-top:1px solid var(--cc-border)}.saved-swatch{width:28px;height:28px;border-radius:50%;border:2px solid var(--cc-border);flex-shrink:0}@media(max-width:991px){.config-panel{position:static}}@media(max-width:575px){.car-stage{min-height:300px}.car-model{height:300px}.model-controls{left:.5rem;right:.5rem;top:.5rem}.model-controls .btn{font-size:.62rem;padding:.25rem .45rem}.paint-grid{grid-template-columns:repeat(4,minmax(0,1fr))}.stage-caption{font-size:.62rem}.preview-footer{align-items:flex-start}}
</style>
