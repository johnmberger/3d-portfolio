import { createIframeScreen, updateCss3dFacingVisibility } from './css3dScreen.js'

const POOPYHOOCH_URL = 'https://www.poopthehooch.com'
export { POOPYHOOCH_URL }

const SCREEN_PX_W = 850
const SCREEN_PX_H = 1050
const WORLD_W = 0.85
const WORLD_H = 1.05
const PRELOAD_DELAY_MS = 2400

export function createPoopyHoochScreen(bathroom) {
  const mirror = bathroom.getObjectByName('bathroomMirror')
  return createIframeScreen({
    className: 'poopyhooch-screen',
    url: POOPYHOOCH_URL,
    widthPx: SCREEN_PX_W,
    heightPx: SCREEN_PX_H,
    worldWidth: WORLD_W,
    worldHeight: WORLD_H,
    parent: bathroom,
    attachTo: mirror,
    preloadDelayMs: PRELOAD_DELAY_MS,
    iframeTitle: 'Poop the Hooch',
    iframeAllow: 'autoplay; encrypted-media',
    placeholderKicker: 'Poop the Hooch',
    placeholderCopy: 'Checking the water…',
    screenSize: { width: WORLD_W, height: WORLD_H, fill: 0.72, minDistance: 2.6 },
  })
}

export function updatePoopyHoochVisibility(ui, camera, screenMesh, opts) {
  updateCss3dFacingVisibility(ui, camera, screenMesh, opts)
}
