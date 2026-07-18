import * as THREE from 'three'
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'

const EARWORMS_URL = 'https://earworms.johnberger.dev'
export { EARWORMS_URL }
const SCREEN_PX = 800
/** Slightly inset from the sleeve so the WebGL rim (and its shadows) stay visible. */
const WORLD_SIZE = 0.376
/** Wait for the room to settle before fetching Earworms. */
const PRELOAD_DELAY_MS = 1800

const _screenPos = new THREE.Vector3()
const _screenNormal = new THREE.Vector3()
const _toCamera = new THREE.Vector3()

export function createEarwormsScreen(turntable) {
  const element = document.createElement('div')
  element.className = 'earworms-screen'
  element.style.width = `${SCREEN_PX}px`
  element.style.height = `${SCREEN_PX}px`
  element.style.pointerEvents = 'none'
  element.style.backfaceVisibility = 'hidden'

  element.innerHTML = `
    <div class="earworms-frame">
      <div class="earworms-viewport">
        <div class="earworms-placeholder">
          <p class="earworms-placeholder__kicker">Earworms</p>
          <p class="earworms-placeholder__copy">Cueing up a record…</p>
        </div>
        <iframe
          class="earworms-iframe"
          title="Earworms"
          referrerpolicy="no-referrer-when-downgrade"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
    </div>
  `

  const iframe = element.querySelector('.earworms-iframe')

  let started = false
  let ready = false
  let revealWhenReady = false

  iframe.addEventListener('load', () => {
    if (!iframe.getAttribute('src')) return
    ready = true
    if (revealWhenReady) element.classList.add('is-loaded')
  })

  const object = new CSS3DObject(element)
  object.visible = false
  const screen = turntable.getObjectByName('screen')
  screen.updateWorldMatrix(true, false)
  object.position.copy(screen.position)
  object.position.z += 0.004
  object.scale.set(WORLD_SIZE / SCREEN_PX, WORLD_SIZE / SCREEN_PX, WORLD_SIZE / SCREEN_PX)

  const upright = turntable.getObjectByName('uprightRecord')
  upright.add(object)

  function startLoad() {
    if (started) return
    started = true
    iframe.src = EARWORMS_URL
  }

  /** Warm the iframe after the room has had time to render. */
  function preload() {
    const schedule =
      typeof requestIdleCallback === 'function'
        ? (cb) => requestIdleCallback(cb, { timeout: PRELOAD_DELAY_MS + 1200 })
        : (cb) => setTimeout(cb, PRELOAD_DELAY_MS)

    setTimeout(() => schedule(startLoad), PRELOAD_DELAY_MS)
  }

  /** Reveal the iframe (start load immediately if preload hasn't finished). */
  function show() {
    revealWhenReady = true
    startLoad()
    if (ready) element.classList.add('is-loaded')
  }

  /** Hide the live view but keep the iframe warm for next time. */
  function hide() {
    revealWhenReady = false
    element.classList.remove('is-loaded')
    object.visible = false
    element.style.display = 'none'
  }

  return {
    element,
    object,
    preload,
    show,
    hide,
    screenSize: { width: 0.4, height: 0.4, fill: 0.7 },
  }
}

/** CSS3D ignores WebGL depth — only show once focused (not mid-zoom), and not from behind. */
export function updateEarwormsVisibility(
  { object },
  camera,
  screenMesh,
  { active = false } = {},
) {
  if (!active) {
    object.visible = false
    // CSS3DRenderer only applies display:none during render — do it here so a
    // skipped css pass can't leave the overlay frozen on screen.
    object.element.style.display = 'none'
    return
  }
  screenMesh.getWorldPosition(_screenPos)
  _screenNormal.set(0, 0, 1).transformDirection(screenMesh.matrixWorld)
  _toCamera.subVectors(camera.position, _screenPos)
  object.visible = _toCamera.dot(_screenNormal) > 0.02
  if (!object.visible) object.element.style.display = 'none'
}
