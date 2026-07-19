import { RESUME_URL } from '../resumeUrl.js'
import {
  createIframeScreen,
  createMobileIframeSheet,
  updateCss3dFacingVisibility,
  createCSS3DRenderer,
} from './css3dScreen.js'

export { createCSS3DRenderer }

const SCREEN_W = 850
const SCREEN_H = 480
const PRELOAD_DELAY_MS = 1600

export function createPortfolioScreen(monitor) {
  const { width: worldW, height: worldH } = monitor.userData.screenSize ?? {
    width: 0.85,
    height: 0.48,
  }
  return createIframeScreen({
    className: 'portfolio-screen',
    url: RESUME_URL,
    widthPx: SCREEN_W,
    heightPx: SCREEN_H,
    worldWidth: worldW,
    worldHeight: worldH,
    parent: monitor,
    preloadDelayMs: PRELOAD_DELAY_MS,
    iframeTitle: 'John Berger — Résumé',
    placeholderKicker: 'Résumé',
    placeholderCopy: 'Loading...',
    warmLoad: true,
    persistOnHide: true,
  })
}

/** Flat scrollable résumé panel for touch — CSS3D iframes crash / don't scroll on mobile. */
export function createMobileResumeSheet(parent = document.getElementById('app')) {
  return createMobileIframeSheet({
    url: RESUME_URL,
    title: 'John Berger — Résumé',
    ariaLabel: 'Résumé',
    className: 'mobile-sheet--resume',
    parent,
  })
}

export function updatePortfolioVisibility(ui, camera, screenMesh, opts) {
  updateCss3dFacingVisibility(ui, camera, screenMesh, opts)
}
