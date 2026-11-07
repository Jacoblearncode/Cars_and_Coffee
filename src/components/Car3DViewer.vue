<script setup>
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const props = defineProps({
  paint: { type: String, default: '#c7352b' },
  model: { type: String, default: 'Realistic Sedan (CC0)' }
})

const host = ref(null)
const loading = ref(false)
const loadError = ref('')
let renderer, scene, camera, controls, animationFrame, resizeObserver
let currentModel = null
let loadToken = 0
const bodyMaterials = new Set()

// A real-world-scale, unbranded sedan exterior model released under CC0.
// If direct GLB loading is blocked by the host, fall back to its interactive hosted viewer.
const modelAssets = {
  'Realistic Sedan (CC0)': 'https://files.innerscene.com/library/sedan-car-42109739/75c64c1b3c8b03734314/sedan-original.glb'
}
const hostedViewerUrl = 'https://www.innerscene.com/v/191mGsBPQJXk9TKgPKaiNl'
const useHostedViewer = ref(false)

function disposeObject(root) {
  root?.traverse((object) => {
    if (!object.isMesh) return
    object.geometry?.dispose()
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    materials.forEach((material) => material?.dispose())
  })
}

function resize() {
  if (!host.value || !renderer || !camera) return
  const width = host.value.clientWidth
  const height = host.value.clientHeight
  renderer.setSize(width, height, false)
  camera.aspect = width / Math.max(height, 1)
  camera.updateProjectionMatrix()
}

function animate() {
  animationFrame = requestAnimationFrame(animate)
  controls?.update()
  renderer?.render(scene, camera)
}

function setCamera(preset) {
  const positions = {
    front: [0, 1.7, -6],
    side: [6, 1.8, 0],
    rear: [0, 1.7, 6],
    top: [0, 8, 0.1],
    reset: [5, 2.5, -5]
  }
  const p = positions[preset] || positions.reset
  camera.position.set(...p)
  controls.target.set(0, 0.85, 0)
  controls.update()
}

defineExpose({ setCamera })

function recolourBody() {
  bodyMaterials.forEach((material) => {
    if (material.userData.originalColor) material.color.copy(material.userData.originalColor).multiply(new THREE.Color(props.paint))
  })
}

async function loadModel(name) {
  const token = ++loadToken
  const url = modelAssets[name]
  if (!url || !scene) return
  loading.value = true
  loadError.value = ''
  useHostedViewer.value = false
  bodyMaterials.clear()
  if (currentModel) {
    scene.remove(currentModel)
    disposeObject(currentModel)
    currentModel = null
  }

  try {
    const loader = new GLTFLoader()
    const gltf = await loader.loadAsync(url)
    if (token !== loadToken) {
      disposeObject(gltf.scene)
      return
    }

    currentModel = gltf.scene
    currentModel.traverse((object) => {
      if (!object.isMesh) return
      object.castShadow = true
      object.receiveShadow = true
      const materials = Array.isArray(object.material) ? object.material : [object.material]
      materials.forEach((material) => {
        if (!material) return
        const materialName = `${material.name || ''} ${object.name || ''}`.toLowerCase()
        const excludedPart = /(glass|window|tyre|tire|rubber|wheel|rim|brake|carbon|leather|seat|interior|chrome|metal|light|lamp|trim|grille)/.test(materialName)
        if (!excludedPart && material.color) {
          material.userData.originalColor = material.color.clone()
          bodyMaterials.add(material)
        }
      })
    })

    // Centre and scale each downloaded model consistently for the showroom.
    const bounds = new THREE.Box3().setFromObject(currentModel)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const maxDimension = Math.max(size.x, size.y, size.z) || 1
    const scale = 4.2 / maxDimension
    currentModel.scale.setScalar(scale)
    currentModel.rotation.y = Math.PI / 2
    currentModel.position.x = -center.x * scale
    currentModel.position.z = -center.z * scale
    currentModel.position.y = -bounds.min.y * scale + 0.03
    scene.add(currentModel)
    recolourBody()
    setCamera('reset')
  } catch (error) {
    if (token === loadToken) {
      console.error(`Could not load 3D model: ${name}`, error)
      // Keep the actual model visible through the publisher's own interactive viewer
      // when direct GLB requests are blocked by cross-origin or hosting restrictions.
      useHostedViewer.value = true
      loadError.value = ''
    }
  } finally {
    if (token === loadToken) loading.value = false
  }
}

onMounted(() => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#211e1b')
  scene.fog = new THREE.Fog('#211e1b', 12, 25)
  camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
  camera.position.set(5, 2.5, -5)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  host.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.06
  controls.minDistance = 3
  controls.maxDistance = 12
  controls.maxPolarAngle = Math.PI * 0.49
  controls.target.set(0, 0.85, 0)

  scene.add(new THREE.HemisphereLight('#dce9ff', '#57483a', 2.0))
  const key = new THREE.DirectionalLight('#fff1dc', 3.2)
  key.position.set(-4, 7, -5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  scene.add(key)
  const fill = new THREE.DirectionalLight('#8ebdff', 1.3)
  fill.position.set(5, 3, 4)
  scene.add(fill)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#292725', roughness: 0.8, metalness: 0.08 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0
  floor.receiveShadow = true
  scene.add(floor)

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host.value)
  resize()
  animate()
  loadModel(props.model)
})

watch(() => props.model, (value) => loadModel(value))
watch(() => props.paint, recolourBody)

onBeforeUnmount(() => {
  loadToken++
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  controls?.dispose()
  if (currentModel) disposeObject(currentModel)
  renderer?.dispose()
})
</script>

<template>
  <div class="viewer-wrap">
    <div ref="host" class="car-3d-canvas" aria-label="Interactive 3D car model"></div>
    <div v-if="loading" class="viewer-message"><span class="spinner-border spinner-border-sm" role="status"></span><span>Loading 3D car model…</span></div>
    <iframe v-if="useHostedViewer" class="hosted-model-viewer" :src="hostedViewerUrl" title="Interactive realistic sedan 3D model" allow="fullscreen; xr-spatial-tracking" allowfullscreen loading="eager"></iframe>
    <div v-if="useHostedViewer" class="hosted-viewer-note">Interactive model hosted by Innerscene · drag to rotate and scroll to zoom · <a :href="hostedViewerUrl" target="_blank" rel="noopener">Open model separately</a></div>
    <div v-else-if="loadError" class="viewer-message viewer-error"><i class="bi bi-exclamation-triangle"></i><span>{{ loadError }}</span><button class="btn btn-sm btn-light" @click="loadModel(model)">Retry</button></div>
  </div>
</template>

<style scoped>
.viewer-wrap{position:relative;width:100%;height:360px;min-height:300px}
.car-3d-canvas{width:100%;height:100%;overflow:hidden;cursor:grab;touch-action:pan-y}
.car-3d-canvas:active{cursor:grabbing}
.car-3d-canvas :deep(canvas){display:block;width:100%;height:100%;outline:none}
.hosted-model-viewer{position:absolute;inset:0;width:100%;height:100%;border:0;background:#211e1b}
.hosted-viewer-note{position:absolute;z-index:2;bottom:.5rem;left:.6rem;right:.6rem;text-align:center;color:#fff;background:#111c;padding:.35rem .5rem;border-radius:.5rem;font-size:.7rem;pointer-events:none}
.hosted-viewer-note a{color:#fff;pointer-events:auto;text-decoration:underline}
.viewer-message{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:.65rem;flex-wrap:wrap;padding:1rem;color:#fff;background:#171411a8;text-align:center;pointer-events:none}
.viewer-error{background:#171411e8;color:#ffd4c9;pointer-events:auto}
.viewer-error button{pointer-events:auto}
@media(max-width:575px){.viewer-wrap{height:300px}}
</style>
