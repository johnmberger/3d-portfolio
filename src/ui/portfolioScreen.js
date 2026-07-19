import { RESUME_URL } from '../resumeUrl.js'
import {
  createIframeScreen,
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

/**
 * Flat scrollable résumé panel for touch — CSS3D iframes don't scroll reliably on mobile.
 */
export function createMobileResumeSheet(parent = document.getElementById('app')) {
  const sheet = document.createElement('div')
  sheet.className = 'resume-sheet'
  sheet.hidden = true
  sheet.setAttribute('role', 'dialog')
  sheet.setAttribute('aria-label', 'Résumé')
  sheet.innerHTML = `
    <iframe
      class="resume-sheet__iframe"
      title="John Berger — Résumé"
      referrerpolicy="no-referrer-when-downgrade"
    ></iframe>
  `
  parent.appendChild(sheet)

  const iframe = sheet.querySelector('.resume-sheet__iframe')
  let started = false

  function show() {
    if (!started) {
      started = true
      iframe.src = RESUME_URL
    }
    sheet.hidden = false
  }

  function hide() {
    sheet.hidden = true
  }

  return { element: sheet, show, hide }
}

export function updatePortfolioVisibility(ui, camera, screenMesh, opts) {
  updateCss3dFacingVisibility(ui, camera, screenMesh, opts)
}
