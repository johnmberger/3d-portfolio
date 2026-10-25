import './style.css'
import { inject } from '@vercel/analytics'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { updateFloorLamp, updateHangingPendant } from './objects/index.js'
import { readDevice, createStage, furnishRoom, startLoop } from './scene/index.js'
import {
  createCameraRig,
  createCameraBounds,
  createTimeOfDay,
  createHoverHighlight,
  createFocusSession,
  bindPointer,
} from './interaction/index.js'
import {
  createPortfolioScreen,
  createMobileResumeSheet,
  createEarwormsScreen,
  createMobileEarwormsSheet,
  createVinylScreen,
  createMobileVinylSheet,
  createPoopyHoochScreen,
  createMobilePoopyHoochSheet,
  createTvNewsScreen,
  createFocusHelper,
  createFocusClose,
  createLoadingScreen,
} from './ui/index.js'

inject()

RectAreaLightUniformsLib.init()

const device = readDevice()
const loading = createLoadingScreen(document.body)
loading.setProgress(0.15, 'Building the room…')

const app = document.querySelector('#app')
const canvas = document.querySelector('#webgl')
const hud = document.querySelector('.hud')
const hint = document.querySelector('.hint')
const exitBtn = document.querySelector('.focus-close--hud')
const hudActions = document.querySelector('.hud-actions')
const resetBtn = document.querySelector('.reset-view')

const stage = createStage({
  canvas,
  app,
  isMobile: device.isMobile,
  isTouchExplore: device.isTouchExplore,
  maxPixelRatio: device.maxPixelRatio,
})

loading.setProgress(0.4, 'Arranging the furniture…')

const pieces = furnishRoom(stage.scene, { isMobile: device.isMobile })

const timeOfDay = createTimeOfDay({
  scene: stage.scene,
  renderer: stage.renderer,
  ambient: stage.ambient,
  sun: stage.sun,
  fill: stage.fill,
  windowGlow: stage.windowGlow,
  windowRim: stage.windowRim,
  room: pieces.room,
  windowRimScale: device.isMobile ? 0.52 : 1,
})

loading.setProgress(0.65, 'Warming the lights…')
Promise.allSettled([pieces.dogReady, pieces.diningReady, pieces.instrumentsReady]).then(() => {
  loading.setProgress(0.85, 'Almost ready…')
})
pieces.dogReady.catch((err) => console.warn('Shiba failed to load', err))
pieces.diningReady.catch((err) => console.warn('Food models failed to load', err))
pieces.bikeReady.catch((err) => console.warn('Bicycle failed to load', err))
pieces.instrumentsReady.catch((err) => console.warn('Bass model failed to load', err))

const portfolioUi = createPortfolioScreen(pieces.monitor)
const mobileResumeSheet = device.isTouchExplore ? createMobileResumeSheet(app) : null
const mobileEarwormsSheet = device.isTouchExplore ? createMobileEarwormsSheet(app) : null
const mobileVinylSheet = device.isTouchExplore ? createMobileVinylSheet(app) : null
const mobilePoopySheet = device.isTouchExplore ? createMobilePoopyHoochSheet(app) : null
const earwormsUi = createEarwormsScreen(pieces.turntable)
const vinylUi = createVinylScreen(pieces.vinylRack)
const poopyUi = createPoopyHoochScreen(pieces.bathroom)
const tvNewsUi = createTvNewsScreen(pieces.tv, { lowRes: device.isMobile })
const focusHelper = createFocusHelper(app)
const focusClose = createFocusClose(exitBtn)
const rig = createCameraRig(stage.camera, stage.controls)
const cameraBounds = createCameraBounds(stage.camera, stage.controls)
const hoverHighlight = createHoverHighlight()

const focus = createFocusSession({
  isTouchExplore: device.isTouchExplore,
  exploreHint: device.exploreHint,
  leaveHint: device.leaveHint,
  hint,
  hud,
  hudActions,
  rig,
  hoverHighlight,
  timeOfDay,
  focusHelper,
  focusClose,
  pieces,
  portfolioUi,
  earwormsUi,
  vinylUi,
  poopyUi,
  tvNewsUi,
  mobileResumeSheet,
  mobileEarwormsSheet,
  mobileVinylSheet,
  mobilePoopySheet,
})

const { interactiveRootList } = bindPointer({
  canvas,
  camera: stage.camera,
  interactiveRoots: pieces.interactiveRoots,
  rig,
  hoverHighlight,
  openByKind: focus.openByKind,
  isTouchExplore: device.isTouchExplore,
  setPointer: focus.setPointer,
  setDragging: focus.setDragging,
})

exitBtn?.addEventListener('click', () => focus.closeFocus())
resetBtn?.addEventListener('click', () => focus.resetCameraView())

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') focus.closeFocus()
})

function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  stage.camera.aspect = w / h
  stage.camera.updateProjectionMatrix()
  stage.renderer.setSize(w, h)
  stage.renderer.setPixelRatio(Math.min(window.devicePixelRatio, device.maxPixelRatio))
  stage.cssRenderer.setSize(w, h)
  rig.refocus()
}
window.addEventListener('resize', onResize)

updateFloorLamp(pieces.lamp, { night: false })
updateHangingPendant(pieces.plantPendant, { night: false })

const ui = {
  portfolioUi,
  earwormsUi,
  vinylUi,
  poopyUi,
  tvNewsUi,
  mobileResumeSheet,
  mobileEarwormsSheet,
  mobileVinylSheet,
  mobilePoopySheet,
}

startLoop({
  device,
  stage,
  rig,
  cameraBounds,
  timeOfDay,
  hoverHighlight,
  focusHelper,
  focusClose,
  focus,
  pieces,
  ui,
  loading,
  interactiveRootList,
})
