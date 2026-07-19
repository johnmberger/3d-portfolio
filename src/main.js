import './style.css'
import { inject } from '@vercel/analytics'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { createRoom, updateWindowParallax } from './objects/room.js'
import { createPlants, updatePlants } from './objects/plants.js'
import { createBicycle } from './objects/bicycle.js'
import { createMonitor, updateMonitor } from './objects/monitor.js'
import { createDiningTable } from './objects/dining.js'
import { createTurntable, updateTurntable } from './objects/turntable.js'
import { createFloorLamp, updateFloorLamp, createHangingPendant, updateHangingPendant } from './objects/lamp.js'
import { createLightSwitch, updateLightSwitch } from './objects/lightSwitch.js'
import { createRug } from './objects/rug.js'
import { createDog } from './objects/dog.js'
import { createWallArt } from './objects/wallArt.js'
import { createBathroom, updateBathroom } from './objects/bathroom.js'
import { createCreditsPlaque, updateCreditsPlaque, CREDITS_ENTRIES } from './objects/credits.js'
import { createCouch } from './objects/couch.js'
import { createArmchair } from './objects/armchair.js'
import { createTV, updateTV } from './objects/tv.js'
import { createKitchenette } from './objects/kitchenette.js'
import { createSideTables } from './objects/sideTables.js'
import { createRoundCoffeeTable, updateCandle } from './objects/coffeeTable.js'
import { createWallInstruments } from './objects/guitar.js'
import { WALL_POS, WALL_H } from './objects/roomConstants.js'
import { createCameraRig } from './interaction/cameraRig.js'
import { createCameraBounds } from './interaction/cameraBounds.js'
import { createTimeOfDay } from './interaction/timeOfDay.js'
import { createHoverHighlight } from './interaction/hoverHighlight.js'
import {
  createCSS3DRenderer,
  createPortfolioScreen,
  createMobileResumeSheet,
  updatePortfolioVisibility,
} from './ui/portfolioScreen.js'
import {
  createEarwormsScreen,
  updateEarwormsVisibility,
  EARWORMS_URL,
} from './ui/earwormsScreen.js'
import {
  createPoopyHoochScreen,
  updatePoopyHoochVisibility,
  POOPYHOOCH_URL,
} from './ui/poopyhoochScreen.js'
import { createTvNewsScreen } from './ui/tvNewsScreen.js'
import { createFocusHelper } from './ui/focusHelper.js'
import { createFocusClose } from './ui/focusClose.js'
import { createLoadingScreen } from './ui/loadingScreen.js'

inject()

RectAreaLightUniformsLib.init()

const isTouchExplore =
  window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
const EXPLORE_HINT = isTouchExplore
  ? 'Tap objects to look closer'
  : 'Drag to look · Scroll to zoom'
const LEAVE_HINT = isTouchExplore ? 'Tap ✕ to leave' : 'Esc to leave'

const loading = createLoadingScreen(document.body)
loading.setProgress(0.15, 'Building the room…')

const app = document.querySelector('#app')
const canvas = document.querySelector('#webgl')
const hud = document.querySelector('.hud')
const hint = document.querySelector('.hint')
const exitBtn = document.querySelector('.focus-close--hud')
const hudActions = document.querySelector('.hud-actions')
const resetBtn = document.querySelector('.reset-view')

const isMobile =
  window.matchMedia('(max-width: 900px), (pointer: coarse)').matches ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
const maxPixelRatio = isMobile ? 1 : 1.75

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: false,
  powerPreference: 'high-performance',
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
renderer.outputColorSpace = THREE.SRGBColorSpace

const cssRenderer = createCSS3DRenderer(app)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xd4c4b0)
scene.fog = new THREE.Fog(0xd4c4b0, 9, 20)

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  80,
)
// Kitchen nook (+X / +Z) — dining readable on the right, living room ahead
camera.position.set(2.75, 1.72, 3.4)

const controls = new OrbitControls(camera, canvas)
controls.target.set(0.85, 1.0, -0.55)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.enablePan = !isTouchExplore
controls.panSpeed = 0.6
controls.screenSpacePanning = true
controls.minDistance = isTouchExplore ? 2.2 : 1.8
controls.maxDistance = 9
controls.minPolarAngle = 0.15
controls.maxPolarAngle = Math.PI / 2 - 0.08
controls.update()

const ambient = new THREE.AmbientLight(0xe8d5c4, 0.35)
scene.add(ambient)

const sun = new THREE.DirectionalLight(0xffc088, 1.35)
sun.position.set(2.2, 3.5, -7)
sun.target.position.set(0, 1, -0.8)
scene.add(sun.target)
sun.castShadow = true
sun.shadow.mapSize.set(isMobile ? 512 : 1536, isMobile ? 512 : 1536)
sun.shadow.camera.near = 1
sun.shadow.camera.far = 22
sun.shadow.camera.left = -6.5
sun.shadow.camera.right = 6.5
sun.shadow.camera.top = 6.5
sun.shadow.camera.bottom = -6.5
sun.shadow.bias = -0.0003
sun.shadow.normalBias = 0.035
scene.add(sun)

const fill = new THREE.DirectionalLight(0x8fa0c4, 0.22)
fill.position.set(3.2, 3.4, 2.2)
scene.add(fill)

const windowGlow = new THREE.PointLight(0xffb070, 1.05, 8, 2)
windowGlow.position.set(0.9, 2.1, -3.8)
scene.add(windowGlow)

const windowRim = new THREE.RectAreaLight(0xffc090, isMobile ? 2.6 : 5, 4.0, 3.0)
windowRim.position.set(0, 2.35, -(WALL_POS - 0.08))
windowRim.lookAt(0, 2.35, 0)
scene.add(windowRim)

loading.setProgress(0.4, 'Arranging the furniture…')

const room = createRoom({ sideWindowGlow: !isMobile })
const plants = createPlants()
const {
  group: bicycle,
  ready: bikeReady,
  startLoad: startBikeLoad,
} = createBicycle({ defer: true })
const monitor = createMonitor()
const { group: dining, ready: diningReady } = createDiningTable()
const turntable = createTurntable()
// Front-right corner of the lounge rug (open end of the sectional), aimed at the TV
const lamp = createFloorLamp({
  position: [-0.88, 0, 0.78],
  rotationY: -Math.PI / 2,
  name: 'loungeLamp',
})
// Ceiling pendant over the back-right plant corner (where the hanging planter was)
const plantPendant = createHangingPendant({
  position: [WALL_POS - 1.0, WALL_H - 0.01, -(WALL_POS - 1.0)],
  cordLength: 0.9,
  name: 'plantPendant',
})
const lightSwitch = createLightSwitch()
const rug = createRug()
const { group: dog, ready: dogReady } = createDog()
const wallArt = createWallArt()
const bathroom = createBathroom({ vanityFill: !isMobile })
const creditsPlaque = createCreditsPlaque()
const couch = createCouch()
const listeningChair = createArmchair({
  // On the room-side edge of the listening rug, facing the vinyl
  position: [-2.2, 0, -2.05],
  rotationY: Math.PI + 0.35,
  fabricColor: 0xa89880,
  fabricDeepColor: 0x96866e,
  pillowColor: 0x8a8e92,
})
const tv = createTV()
const kitchenette = createKitchenette({ underCabinetLights: !isMobile })
const sideTables = createSideTables()
const roundCoffee = createRoundCoffeeTable({
  position: [-1.85, 0, 2.65],
  staticSmoke: isMobile,
})
const { group: instruments, ready: instrumentsReady } = createWallInstruments({
  fillLight: !isMobile,
})
scene.add(
  room,
  plants,
  bicycle,
  monitor,
  dining,
  turntable,
  lamp,
  plantPendant,
  lightSwitch,
  rug,
  dog,
  wallArt,
  bathroom,
  creditsPlaque,
  couch,
  listeningChair,
  tv,
  kitchenette,
  sideTables,
  roundCoffee,
  instruments,
)

const timeOfDay = createTimeOfDay({
  scene,
  renderer,
  ambient,
  sun,
  fill,
  windowGlow,
  windowRim,
  room,
  windowRimScale: isMobile ? 0.52 : 1,
})

loading.setProgress(0.65, 'Warming the lights…')
Promise.allSettled([dogReady, diningReady, instrumentsReady]).then(() => {
  loading.setProgress(0.85, 'Almost ready…')
})
dogReady.catch((err) => console.warn('Shiba failed to load', err))
diningReady.catch((err) => console.warn('Food models failed to load', err))
bikeReady.catch((err) => console.warn('Bicycle failed to load', err))
instrumentsReady.catch((err) => console.warn('Bass model failed to load', err))

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const plantThrottle = isMobile ? 4 : 2
let plantFrame = 0
let idleAnimFrame = 0
const _tvWorld = new THREE.Vector3()
/** Camera this close → smooth ticker (focus or scroll-zoom). */
const TV_TICKER_NEAR = 4.2

const portfolioUi = createPortfolioScreen(monitor)
const mobileResumeSheet = isTouchExplore ? createMobileResumeSheet(app) : null
const earwormsUi = createEarwormsScreen(turntable)
const poopyUi = createPoopyHoochScreen(bathroom)
const tvNewsUi = createTvNewsScreen(tv, { lowRes: isMobile })
const focusHelper = createFocusHelper(app)
const focusClose = createFocusClose(exitBtn)
const rig = createCameraRig(camera, controls)
const cameraBounds = createCameraBounds(camera, controls)

const monitorScreen = monitor.getObjectByName('screen')
const earwormsScreen = turntable.getObjectByName('screen')
const bathroomScreen = bathroom.getObjectByName('screen')
const creditsScreen = creditsPlaque.getObjectByName('screen')
const aboutScreen = dining.getObjectByName('screen')
const photoShelf = wallArt.getObjectByName('photoShelf')
const photoScreen = photoShelf.getObjectByName('screen')
const dogScreen = dog.getObjectByName('screen')
const tvScreen = tv.getObjectByName('screen')

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let hoverTarget = null
const hoverHighlight = createHoverHighlight()
const interactiveRoots = {
  monitor,
  turntable,
  bathroom,
  credits: creditsPlaque,
  about: dining,
  photo: photoShelf,
  dog,
  tv,
  lightSwitch,
}
let activeFocus = null
let prevMode = 'explore'
let isDragging = false
let pendingCloseFocus = false
let pulseFrame = 0
/** @type {{ x: number, y: number, t: number, kind: string | null } | null} */
let pointerGesture = null
/** Chrome shown only after the zoom-in finishes (avoids mid-flight flicker). */
let pendingFocusHelper = null
let pendingFocusClose = null
const TAP_MAX_MOVE_PX = 12
const TAP_MAX_MS = 500
const interactiveRootList = Object.values(interactiveRoots)

function setHint(text) {
  hint.textContent = text
}

function setPointer(on) {
  document.body.classList.toggle('is-pointer', on)
}

function setDragging(on) {
  isDragging = on
  document.body.classList.toggle('is-dragging', on)
}

function setScreenInteractive(ui, on) {
  if (!ui?.element) return
  ui.element.classList.toggle('is-interactive', on)
  ui.element.style.pointerEvents = on ? 'auto' : 'none'
}

function setFocusedUi(on) {
  hud.classList.toggle('is-dimmed', on)
  document.body.classList.toggle('is-focused', on)
  if (!on) focusClose.hide()
  if (hudActions) hudActions.style.opacity = on ? '0' : '1'
  if (hudActions) hudActions.style.pointerEvents = on ? 'none' : 'auto'
  if (on) {
    setPointer(false)
    setDragging(false)
  }
}

function queueFocusChrome({ helper = null, close = null } = {}) {
  pendingFocusHelper = helper
  pendingFocusClose = close
}

function revealFocusChrome() {
  if (pendingFocusHelper) {
    focusHelper.show(pendingFocusHelper)
    pendingFocusHelper = null
  }
  if (pendingFocusClose) {
    focusClose.show(pendingFocusClose)
    pendingFocusClose = null
  }
}

function clearFocusChrome() {
  pendingFocusHelper = null
  pendingFocusClose = null
  focusHelper.hide()
  focusClose.hide()
}

function beginFocus({ id, screen, size, ui = null, helper = null, hint }) {
  if (rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = id
  ui?.show()
  queueFocusChrome({
    helper,
    close: {
      anchor: screen,
      width: size.width,
      height: size.height,
    },
  })
  rig.enterFocus(screen, size)
  setHint(hint)
}

function endFocusUi() {
  pendingCloseFocus = false
  setScreenInteractive(portfolioUi, false)
  setScreenInteractive(earwormsUi, false)
  setScreenInteractive(poopyUi, false)
  setFocusedUi(false)
  clearFocusChrome()
  if (activeFocus === 'portfolio') {
    portfolioUi.hide()
    mobileResumeSheet?.hide()
  }
  if (activeFocus === 'earworms') earwormsUi.hide()
  if (activeFocus === 'poopyhooch') poopyUi.hide()
  if (activeFocus === 'tv') tvNewsUi.hide()
  activeFocus = null
}

function closeFocus() {
  if (rig.mode === 'explore' || rig.mode === 'toExplore' || rig.mode === 'toHome') {
    return
  }
  if (rig.isBusy) {
    pendingCloseFocus = true
    return
  }
  endFocusUi()
  rig.exitFocus()
  setHint(EXPLORE_HINT)
}

function resetCameraView() {
  if (rig.isBusy) return
  endFocusUi()
  if (rig.resetView()) {
    setHint('Back to the room…')
  }
}

function focusPortfolio() {
  const size = {
    ...(monitor.userData.screenSize ?? { width: 0.85, height: 0.48 }),
    fill: 0.86,
  }
  beginFocus({
    id: 'portfolio',
    screen: monitorScreen,
    size,
    ui: portfolioUi,
    hint: 'Reading the résumé…',
  })
}

function focusEarworms() {
  beginFocus({
    id: 'earworms',
    screen: earwormsScreen,
    size: earwormsUi.screenSize,
    ui: earwormsUi,
    helper: {
      title: 'Earworms',
      blurb: "What I've been listening to lately.",
      href: EARWORMS_URL,
      anchor: earwormsScreen,
      width: earwormsUi.screenSize.width,
    },
    hint: 'Dropping the needle…',
  })
}

function focusPoopyHooch() {
  beginFocus({
    id: 'poopyhooch',
    screen: bathroomScreen,
    size: poopyUi.screenSize,
    ui: poopyUi,
    helper: {
      title: 'Poop the Hooch',
      blurb: 'Is the Chattahoochee Poopy?',
      href: POOPYHOOCH_URL,
      anchor: bathroomScreen,
      width: poopyUi.screenSize.width,
    },
    hint: 'Checking the mirror…',
  })
}

function focusCredits() {
  const size = {
    ...creditsPlaque.userData.screenSize,
    fill: isTouchExplore ? 0.58 : creditsPlaque.userData.screenSize.fill,
  }
  beginFocus({
    id: 'credits',
    screen: creditsScreen,
    size,
    helper: {
      title: 'Credits',
      blurb: 'Models used in this room — open each for attribution.',
      links: CREDITS_ENTRIES,
      anchor: creditsScreen,
      width: size.width,
      dock: 'top',
    },
    hint: 'Reading the plaque…',
  })
}

function focusAbout() {
  beginFocus({
    id: 'about',
    screen: aboutScreen,
    size: dining.userData.screenSize,
    hint: 'Reading the menu…',
  })
}

function focusPhoto() {
  beginFocus({
    id: 'photo',
    screen: photoScreen,
    size: photoShelf.userData.screenSize,
    hint: 'Looking closer…',
  })
}

function focusDog() {
  const size = dog.userData.screenSize
  beginFocus({
    id: 'dog',
    screen: dogScreen,
    size,
    helper: {
      title: 'Good boy',
      anchor: dogScreen,
      width: size.width,
    },
    hint: "Who's a good boy…",
  })
}

function focusTvNews() {
  beginFocus({
    id: 'tv',
    screen: tvScreen,
    size: tvNewsUi.screenSize,
    ui: tvNewsUi,
    hint: 'Watching the news…',
  })
}

const FOCUS_BY_KIND = {
  monitor: focusPortfolio,
  turntable: focusEarworms,
  bathroom: focusPoopyHooch,
  credits: focusCredits,
  about: focusAbout,
  photo: focusPhoto,
  dog: focusDog,
  tv: focusTvNews,
}

function toggleLightSwitch() {
  if (rig.isBusy || rig.isFocused) return
  timeOfDay.toggle()
  updateLightSwitch(lightSwitch, { night: timeOfDay.isNight })
  setHint(timeOfDay.isNight ? 'Lights down…' : 'Sunset mode…')
}

function openByKind(kind) {
  if (!kind) return
  if (kind === 'lightSwitch') {
    toggleLightSwitch()
    return
  }
  FOCUS_BY_KIND[kind]?.()
}

function handleFocusModeTransition(mode) {
  if (mode === prevMode) return
  if (mode === 'focused') {
    if (!pendingCloseFocus) {
      setFocusedUi(true)
      revealFocusChrome()
      if (activeFocus === 'portfolio') {
        mobileResumeSheet?.show()
        if (!mobileResumeSheet) setScreenInteractive(portfolioUi, true)
      } else if (activeFocus === 'earworms') {
        setScreenInteractive(earwormsUi, true)
      } else if (activeFocus === 'poopyhooch') {
        setScreenInteractive(poopyUi, true)
      }
      if (activeFocus) setHint(LEAVE_HINT)
    }
  } else if (mode === 'toExplore' || mode === 'toHome') {
    clearFocusChrome()
  } else if (mode === 'explore') {
    setScreenInteractive(portfolioUi, false)
    setScreenInteractive(earwormsUi, false)
    setScreenInteractive(poopyUi, false)
    setFocusedUi(false)
    clearFocusChrome()
    mobileResumeSheet?.hide()
    setHint(EXPLORE_HINT)
    pendingCloseFocus = false
  }
  prevMode = mode
}

function pickInteractive(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1
  pointer.y = -(clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  const hits = raycaster.intersectObjects(interactiveRootList, true)
  for (const hit of hits) {
    const kind = hit.object.userData.interactive
    if (kind && (kind in interactiveRoots || kind === 'lightSwitch')) {
      return kind
    }
  }
  return null
}

canvas.addEventListener('pointermove', (event) => {
  // Touch discoverability uses pulse — skip expensive hover raycasts while exploring
  if (isTouchExplore) return
  if (rig.isFocused || rig.isBusy) {
    hoverTarget = null
    hoverHighlight.clear()
    setPointer(false)
    return
  }
  hoverTarget = pickInteractive(event.clientX, event.clientY)
  hoverHighlight.set(hoverTarget ? interactiveRoots[hoverTarget] : null)
  setPointer(Boolean(hoverTarget))
})

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return
  if (rig.isBusy || rig.isFocused) return
  const kind = pickInteractive(event.clientX, event.clientY)
  pointerGesture = {
    x: event.clientX,
    y: event.clientY,
    t: performance.now(),
    kind,
  }
  // Always allow orbit — focus opens on tap (pointerup), not press
  setDragging(true)
})

function endPointerGesture(event) {
  const gesture = pointerGesture
  pointerGesture = null
  setDragging(false)
  if (!gesture?.kind) return
  if (rig.isBusy || rig.isFocused) return
  const dx = event.clientX - gesture.x
  const dy = event.clientY - gesture.y
  if (dx * dx + dy * dy > TAP_MAX_MOVE_PX * TAP_MAX_MOVE_PX) return
  if (performance.now() - gesture.t > TAP_MAX_MS) return
  openByKind(gesture.kind)
}

window.addEventListener('pointerup', endPointerGesture)
window.addEventListener('pointercancel', () => {
  pointerGesture = null
  setDragging(false)
})

exitBtn?.addEventListener('click', () => closeFocus())
resetBtn?.addEventListener('click', () => resetCameraView())

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeFocus()
})

const timer = new THREE.Timer()
let loadingFinished = false

function onResize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
  cssRenderer.setSize(w, h)
  rig.refocus()
}
window.addEventListener('resize', onResize)

setHint(EXPLORE_HINT)
updateFloorLamp(lamp, { night: false })
updateHangingPendant(plantPendant, { night: false })

function tick(timestamp) {
  requestAnimationFrame(tick)
  if (document.hidden) return

  timer.update(timestamp)
  const elapsed = timer.getElapsed()
  const delta = timer.getDelta()

  plantFrame = (plantFrame + 1) % plantThrottle
  idleAnimFrame = (idleAnimFrame + 1) % 2
  const animateIdle = !reduceMotion && idleAnimFrame === 0

  if (!reduceMotion && plantFrame === 0) {
    updatePlants(plants, elapsed, { animate: true })
  }
  updateCandle(roundCoffee, elapsed, delta)
  updateWindowParallax(room, camera)
  timeOfDay.update(delta)
  const night = timeOfDay.isNight
  updateFloorLamp(lamp, { night })
  updateHangingPendant(plantPendant, { night })
  updateLightSwitch(lightSwitch, { night })
  const mode = rig.update(delta)
  handleFocusModeTransition(mode)

  if (pendingCloseFocus && mode === 'focused') {
    closeFocus()
  }

  const focusing = rig.isFocused || mode === 'toFocus'
  if (
    isTouchExplore &&
    !reduceMotion &&
    !rig.isFocused &&
    !rig.isBusy &&
    !isDragging
  ) {
    // Throttle material walks — cue still reads as a soft breathe
    pulseFrame = (pulseFrame + 1) % 3
    if (pulseFrame === 0) {
      const wave = 0.5 + 0.5 * Math.sin(elapsed * 1.6)
      hoverHighlight.pulse(interactiveRootList, wave * wave * 0.045)
    }
  } else if (isTouchExplore) {
    hoverHighlight.clearPulse()
  }
  focusHelper.update(camera)
  focusClose.update(camera)
  updateMonitor(monitor, elapsed, {
    focused: focusing && activeFocus === 'portfolio',
    animate: animateIdle,
  })
  updateTurntable(turntable, elapsed, {
    focused: focusing && activeFocus === 'earworms',
    animate: !reduceMotion && (focusing ? true : animateIdle),
  })
  updateBathroom(bathroom, elapsed, {
    focused: focusing && activeFocus === 'poopyhooch',
    animate: animateIdle,
  })
  updateCreditsPlaque(creditsPlaque, elapsed, {
    focused: focusing && activeFocus === 'credits',
    animate: animateIdle,
  })
  updateTV(tv, elapsed, {
    focused: focusing && activeFocus === 'tv',
    animate: animateIdle,
  })
  tvScreen.getWorldPosition(_tvWorld)
  const tvNear =
    (focusing && activeFocus === 'tv') ||
    camera.position.distanceToSquared(_tvWorld) < TV_TICKER_NEAR * TV_TICKER_NEAR
  tvNewsUi.update(elapsed, delta, {
    paused: (isDragging && !focusing) || reduceMotion,
    focused: tvNear,
  })
  // CSS3D ignores WebGL depth — keep overlays off while the camera is moving so
  // room objects (lamps, furniture) correctly occlude the WebGL stand-ins.
  updatePortfolioVisibility(portfolioUi, camera, monitorScreen, {
    active:
      rig.isFocused && activeFocus === 'portfolio' && !mobileResumeSheet,
  })
  updateEarwormsVisibility(earwormsUi, camera, earwormsScreen, {
    active: rig.isFocused && activeFocus === 'earworms',
  })
  updatePoopyHoochVisibility(poopyUi, camera, bathroomScreen, {
    active: rig.isFocused && activeFocus === 'poopyhooch',
  })

  if (controls.enabled) controls.update()
  if (!rig.isBusy && !rig.isFocused) {
    cameraBounds.clamp()
  }
  renderer.render(scene, camera)
  // Keep CSS3D in sync during focus transitions even when overlays are hidden,
  // so exit animations don't leave a frozen DOM layer on screen.
  if (
    mode !== 'explore' ||
    portfolioUi.object.visible ||
    earwormsUi.object.visible ||
    poopyUi.object.visible
  ) {
    cssRenderer.render(scene, camera)
  }

  if (!loadingFinished) {
    loadingFinished = true
    Promise.allSettled([dogReady, diningReady]).then(async () => {
      await loading.finishWhenReady()
      // Warm iframes + bike after the room is up so they don't fight first paint
      portfolioUi.preload()
      earwormsUi.preload()
      poopyUi.preload()
      startBikeLoad()
    })
  }
}

requestAnimationFrame(tick)
