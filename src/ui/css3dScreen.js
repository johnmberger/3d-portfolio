import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'

const _screenPos = new THREE.Vector3()
const _screenNormal = new THREE.Vector3()
const _toCamera = new THREE.Vector3()

/**
 * CSS3D iframe overlay aligned to a named screen mesh on a 3D parent.
 */
export function createIframeScreen({
  className,
  url,
  widthPx,
  heightPx,
  worldWidth,
  worldHeight,
  parent,
  attachTo = null,
  screenName = 'screen',
  zOffset = 0.004,
  preloadDelayMs = 1600,
  iframeTitle = '',
  iframeAllow = '',
  placeholderKicker = '',
  placeholderCopy = '',
  warmLoad = false,
  /** If true, hide() keeps the iframe loaded (portfolio). Otherwise clears is-loaded. */
  persistOnHide = false,
  screenSize = null,
}) {
  const element = document.createElement('div')
  element.className = `css3d-screen ${className}`.trim()
  element.style.width = `${widthPx}px`
  element.style.height = `${heightPx}px`
  element.style.pointerEvents = 'none'
  element.style.backfaceVisibility = 'hidden'

  const allowAttr = iframeAllow ? ` allow="${iframeAllow}"` : ''
  element.innerHTML = `
    <div class="css3d-frame">
      <div class="css3d-viewport">
        <div class="css3d-placeholder">
          <p class="css3d-placeholder__kicker">${placeholderKicker}</p>
          <p class="css3d-placeholder__copy">${placeholderCopy}</p>
        </div>
        <iframe
          class="css3d-iframe"
          title="${iframeTitle}"
          referrerpolicy="no-referrer-when-downgrade"${allowAttr}
        ></iframe>
      </div>
    </div>
  `

  const iframe = element.querySelector('.css3d-iframe')
  let started = false
  let ready = false
  let revealWhenReady = false
  let warmIframe = null

  iframe.addEventListener('load', () => {
    if (!iframe.getAttribute('src')) return
    ready = true
    if (persistOnHide || revealWhenReady) element.classList.add('is-loaded')
  })

  const screen = parent.getObjectByName(screenName)
  screen.updateWorldMatrix?.(true, false)
  const object = new CSS3DObject(element)
  object.visible = false
  object.position.copy(screen.position)
  object.position.z += zOffset
  object.scale.set(worldWidth / widthPx, worldHeight / heightPx, 1)
  ;(attachTo ?? parent).add(object)

  function startLoad() {
    if (started) return
    started = true
    iframe.src = url
  }

  function preload() {
    if (warmLoad) {
      if (!document.querySelector(`link[data-css3d-prefetch="${url}"]`)) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = url
        link.dataset.css3dPrefetch = url
        document.head.appendChild(link)
      }
      if (!warmIframe) {
        warmIframe = document.createElement('iframe')
        warmIframe.src = url
        warmIframe.title = `${iframeTitle || className} preload`
        warmIframe.setAttribute('aria-hidden', 'true')
        warmIframe.tabIndex = -1
        Object.assign(warmIframe.style, {
          position: 'fixed',
          width: '1px',
          height: '1px',
          left: '-100vw',
          top: '0',
          opacity: '0',
          pointerEvents: 'none',
          border: '0',
        })
        document.body.appendChild(warmIframe)
      }
    }

    const schedule =
      typeof requestIdleCallback === 'function'
        ? (cb) => requestIdleCallback(cb, { timeout: preloadDelayMs + 1200 })
        : (cb) => setTimeout(cb, preloadDelayMs)

    setTimeout(() => schedule(startLoad), preloadDelayMs)
  }

  function show() {
    if (!persistOnHide) revealWhenReady = true
    startLoad()
    if (ready) element.classList.add('is-loaded')
  }

  function hide() {
    if (persistOnHide) return
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
    screenSize:
      screenSize ??
      ({
        width: worldWidth,
        height: worldHeight,
      }),
  }
}

/** CSS3D ignores WebGL depth — only show once focused (not mid-zoom), and not from behind. */
export function updateCss3dFacingVisibility(
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
