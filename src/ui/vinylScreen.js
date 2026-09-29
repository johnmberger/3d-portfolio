import {
  createIframeScreen,
  createMobileIframeSheet,
  updateCss3dFacingVisibility,
} from './css3dScreen.js'

const VINYL_URL = 'https://vinyl.johnberger.dev'
export { VINYL_URL }

const SCREEN_PX = 800
const PRELOAD_DELAY_MS = 2000

export function createVinylScreen(rack) {
  const front = rack.getObjectByName('frontRecord')
  const screen = front.getObjectByName('screen')
  const artSize = screen?.userData?.artSize ?? { width: 0.278, height: 0.278 }
  return createIframeScreen({
    className: 'vinyl-screen',
    url: VINYL_URL,
    widthPx: SCREEN_PX,
    heightPx: SCREEN_PX,
    worldWidth: artSize.width,
    worldHeight: artSize.height,
    parent: rack,
    attachTo: front,
    preloadDelayMs: PRELOAD_DELAY_MS,
    iframeTitle: 'Vinyl collection',
    placeholderKicker: 'Vinyl',
    placeholderCopy: 'Pulling a record…',
    screenSize: { width: 0.31, height: 0.31, fill: 0.68 },
  })
}

export function createMobileVinylSheet(parent = document.getElementById('app')) {
  return createMobileIframeSheet({
    url: VINYL_URL,
    title: 'Vinyl collection',
    ariaLabel: 'Vinyl collection',
    className: 'mobile-sheet--vinyl',
    parent,
  })
}

export function updateVinylVisibility(ui, camera, screenMesh, opts) {
  updateCss3dFacingVisibility(ui, camera, screenMesh, opts)
}
