import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { RESUME_URL } from '../resumeUrl.js'

const SCREEN_W = 850
const SCREEN_H = 480
/** Wait for the room to settle before fetching the resume. */
const PRELOAD_DELAY_MS = 1600

const _screenPos = new THREE.Vector3()
const _screenNormal = new THREE.Vector3()
const _toCamera = new THREE.Vector3()

export function createPortfolioScreen(monitor) {
  const element = document.createElement('div')
  element.className = 'portfolio-screen'
  element.style.width = `${SCREEN_W}px`
  element.style.height = `${SCREEN_H}px`
  element.style.pointerEvents = 'none'
  element.style.backfaceVisibility = 'hidden'

  element.innerHTML = `
    <div class="folio-frame">
      <button class="folio-close" type="button" aria-label="Close resume">✕</button>
      <div class="folio-viewport">
        <div class="folio-placeholder">
          <p class="folio-placeholder__kicker">Resume</p>
          <p class="folio-placeholder__copy">Loading John Berger…</p>
        </div>
        <iframe
          class="folio-iframe"
          title="John Berger — Resume"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  `

  const iframe = element.querySelector('.folio-iframe')
  const closeBtn = element.querySelector('.folio-close')

  let started = false
  let ready = false

  iframe.addEventListener('load', () => {
    if (!iframe.getAttribute('src')) return
    ready = true
    element.classList.add('is-loaded')
  })

  // 850×480 px → scale 0.001 matches the 0.85×0.48 screen plane
  const object = new CSS3DObject(element)
  object.visible = false
  object.position.set(0, 0.42, 0.032)
  object.scale.set(0.001, 0.001, 0.001)
  monitor.add(object)

  function startLoad() {
    if (started) return
    started = true
    iframe.src = RESUME_URL
  }

  /** Warm the iframe after the room has had time to render. */
  function preload() {
    const schedule =
      typeof requestIdleCallback === 'function'
        ? (cb) => requestIdleCallback(cb, { timeout: PRELOAD_DELAY_MS + 1200 })
        : (cb) => setTimeout(cb, PRELOAD_DELAY_MS)

    setTimeout(() => schedule(startLoad), PRELOAD_DELAY_MS)
  }

  /** Ensure the resume is loading (used when focusing the monitor). */
  function show() {
    startLoad()
    if (ready) element.classList.add('is-loaded')
  }

  /** Keep the iframe warm; visibility is handled by updatePortfolioVisibility. */
  function hide() {
    // no-op — monitor wallpaper stays loaded
  }

  return { element, object, closeBtn, preload, show, hide }
}

/** CSS3D ignores WebGL depth — only show once focused (not mid-zoom), and not from behind. */
export function updatePortfolioVisibility(
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
  object.element.style.display = object.visible ? '' : 'none'
}

export function createCSS3DRenderer(container) {
  const cssRenderer = new CSS3DRenderer()
  cssRenderer.setSize(window.innerWidth, window.innerHeight)
  cssRenderer.domElement.className = 'css3d-layer'
  cssRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(cssRenderer.domElement)
  return cssRenderer
}
