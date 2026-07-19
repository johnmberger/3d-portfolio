import {
  createIframeScreen,
  createMobileIframeSheet,
  updateCss3dFacingVisibility,
} from './css3dScreen.js'

const EARWORMS_URL = 'https://earworms.johnberger.dev'
export { EARWORMS_URL }

const SCREEN_PX = 800
/** Slightly inset from the sleeve so the WebGL rim (and its shadows) stay visible. */
const WORLD_SIZE = 0.376
const PRELOAD_DELAY_MS = 1800

export function createEarwormsScreen(turntable) {
  const upright = turntable.getObjectByName('uprightRecord')
  return createIframeScreen({
    className: 'earworms-screen',
    url: EARWORMS_URL,
    widthPx: SCREEN_PX,
    heightPx: SCREEN_PX,
    worldWidth: WORLD_SIZE,
    worldHeight: WORLD_SIZE,
    parent: turntable,
    attachTo: upright,
    preloadDelayMs: PRELOAD_DELAY_MS,
    iframeTitle: 'Earworms',
    iframeAllow: 'autoplay; encrypted-media',
    placeholderKicker: 'Earworms',
    placeholderCopy: 'Cueing up a record…',
    screenSize: { width: 0.4, height: 0.4, fill: 0.7 },
  })
}

/** Flat panel for touch — CSS3D iframes crash mobile Safari. */
export function createMobileEarwormsSheet(parent = document.getElementById('app')) {
  return createMobileIframeSheet({
    url: EARWORMS_URL,
    title: 'Earworms',
    ariaLabel: 'Earworms',
    className: 'mobile-sheet--earworms',
    iframeAllow: 'autoplay; encrypted-media',
    parent,
  })
}

export function updateEarwormsVisibility(ui, camera, screenMesh, opts) {
  updateCss3dFacingVisibility(ui, camera, screenMesh, opts)
}
