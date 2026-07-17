import * as THREE from 'three'
import { CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js'

const POOPYHOOCH_URL = 'https://www.poopthehooch.com'
const SCREEN_PX_W = 550
const SCREEN_PX_H = 700
const WORLD_W = 0.55
const WORLD_H = 0.7
const PRELOAD_DELAY_MS = 2400

const _screenPos = new THREE.Vector3()
const _screenNormal = new THREE.Vector3()
const _toCamera = new THREE.Vector3()

export function createPoopyHoochScreen(bathroom) {
  const element = document.createElement('div')
  element.className = 'poopyhooch-screen'
  element.style.width = `${SCREEN_PX_W}px`
  element.style.height = `${SCREEN_PX_H}px`
  element.style.pointerEvents = 'none'
  element.style.backfaceVisibility = 'hidden'

  element.innerHTML = `
    <div class="poopyhooch-frame">
      <header class="poopyhooch-chrome">
        <p class="poopyhooch-chrome__title">PoopyHooch</p>
        <button class="poopyhooch-close" type="button" aria-label="Close PoopyHooch">✕</button>
      </header>
      <div class="poopyhooch-viewport">
        <div class="poopyhooch-placeholder">
          <p class="poopyhooch-placeholder__kicker">Mirror mirror</p>
          <p class="poopyhooch-placeholder__copy">Click the bathroom to take a look</p>
        </div>
        <iframe
          class="poopyhooch-iframe"
          title="PoopyHooch"
          referrerpolicy="no-referrer-when-downgrade"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
    </div>
  `

  const iframe = element.querySelector('.poopyhooch-iframe')
  const closeBtn = element.querySelector('.poopyhooch-close')

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
  const screen = bathroom.getObjectByName('screen')
  object.position.copy(screen.position)
  object.position.z += 0.004
  object.scale.set(WORLD_W / SCREEN_PX_W, WORLD_H / SCREEN_PX_H, 1)

  const mirror = bathroom.getObjectByName('bathroomMirror')
  mirror.add(object)

  function startLoad() {
    if (started) return
    started = true
    iframe.src = POOPYHOOCH_URL
  }

  function preload() {
    const schedule =
      typeof requestIdleCallback === 'function'
        ? (cb) => requestIdleCallback(cb, { timeout: PRELOAD_DELAY_MS + 1200 })
        : (cb) => setTimeout(cb, PRELOAD_DELAY_MS)

    setTimeout(() => schedule(startLoad), PRELOAD_DELAY_MS)
  }

  function show() {
    revealWhenReady = true
    startLoad()
    if (ready) element.classList.add('is-loaded')
  }

  function hide() {
    revealWhenReady = false
    element.classList.remove('is-loaded')
  }

  return {
    element,
    object,
    closeBtn,
    preload,
    show,
    hide,
    screenSize: { width: WORLD_W, height: WORLD_H, fill: 0.78, minDistance: 2.85 },
  }
}

/** CSS3D ignores WebGL depth — only show while focused, and not from behind. */
export function updatePoopyHoochVisibility(
  { object },
  camera,
  screenMesh,
  { active = false } = {},
) {
  if (!active) {
    object.visible = false
    return
  }
  screenMesh.getWorldPosition(_screenPos)
  _screenNormal.set(0, 0, 1).transformDirection(screenMesh.matrixWorld)
  _toCamera.subVectors(camera.position, _screenPos)
  object.visible = _toCamera.dot(_screenNormal) > 0.02
}
