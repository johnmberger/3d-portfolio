import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { createRoom, updateWindowParallax } from './objects/room.js'
import { createPlants, updatePlants } from './objects/plants.js'
import { createBicycle } from './objects/bicycle.js'
import { createMonitor, updateMonitor } from './objects/monitor.js'
import { createDiningTable } from './objects/dining.js'
import { createTurntable, updateTurntable } from './objects/turntable.js'
import { createFloorLamp, updateFloorLamp } from './objects/lamp.js'
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
import { WALL_POS } from './objects/roomConstants.js'
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

RectAreaLightUniformsLib.init()

const isTouchExplore =
  window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
const EXPLORE_HINT = isTouchExplore
  ? 'Tap objects to look closer'
  : 'Drag to look · Scroll to zoom'

const loading = createLoadingScreen(document.body)
loading.setProgress(0.15, 'Building the room…')

const app = document.querySelector('#app')
const canvas = document.querySelector('#webgl')
const hud = document.querySelector('.hud')
const hint = document.querySelector('.hint')
const exitBtn = document.querySelector('.focus-close--hud')
const hudActions = document.querySelector('.hud-actions')

const isMobile =
  window.matchMedia('(max-width: 900px), (pointer: coarse)').matches ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
const maxPixelRatio = isMobile ? 1.25 : 1.75

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: false,
  powerPreference: 'high-performance',
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15
renderer.outputColorSpace = THREE.SRGBColorSpace

const cssRenderer = createCSS3DRenderer(app)

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xd4c4b0)
scene.fog = new THREE.Fog(0xd4c4b0, 9, 20)

// TEMP: set true to unlock orbit limits and disable screen focus
const FREE_CAMERA = false

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
controls.enablePan = true
controls.panSpeed = FREE_CAMERA ? 1.2 : 0.6
controls.screenSpacePanning = true
if (FREE_CAMERA) {
  controls.minDistance = 0.05
  controls.maxDistance = 40
  controls.minPolarAngle = 0
  controls.maxPolarAngle = Math.PI
} else {
  controls.minDistance = 1.8
  controls.maxDistance = 9
  controls.minPolarAngle = 0.15
  controls.maxPolarAngle = Math.PI / 2 - 0.08
}
controls.update()

const ambient = new THREE.AmbientLight(0xe8d5c4, 0.35)
scene.add(ambient)

const sun = new THREE.DirectionalLight(0xffc088, 1.35)
sun.position.set(2.2, 3.5, -7)
sun.target.position.set(0, 1, -0.8)
scene.add(sun.target)
sun.castShadow = true
sun.shadow.mapSize.set(isMobile ? 1024 : 1536, isMobile ? 1024 : 1536)
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

const windowRim = new THREE.RectAreaLight(0xffc090, 5, 4.0, 3.0)
windowRim.position.set(0, 2.35, -(WALL_POS - 0.08))
windowRim.lookAt(0, 2.35, 0)
scene.add(windowRim)

loading.setProgress(0.4, 'Arranging the furniture…')

const room = createRoom()
const plants = createPlants()
const { group: bicycle, ready: bikeReady } = createBicycle()
const monitor = createMonitor()
const { group: dining, ready: diningReady } = createDiningTable()
const turntable = createTurntable()
// Front-right corner of the lounge rug (open end of the sectional), aimed at the TV
const lamp = createFloorLamp({
  position: [-0.88, 0, 0.78],
  rotationY: -Math.PI / 2,
  name: 'loungeLamp',
})
const lightSwitch = createLightSwitch()
const rug = createRug()
const { group: dog, ready: dogReady } = createDog()
const wallArt = createWallArt()
const bathroom = createBathroom()
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
const kitchenette = createKitchenette()
const sideTables = createSideTables()
const roundCoffee = createRoundCoffeeTable({
  position: [-1.85, 0, 2.65],
})
const { group: instruments, ready: instrumentsReady } = createWallInstruments()
scene.add(
  room,
  plants,
  bicycle,
  monitor,
  dining,
  turntable,
  lamp,
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
})

loading.setProgress(0.65, 'Warming the lights…')
Promise.allSettled([dogReady, diningReady, bikeReady, instrumentsReady]).then(() => {
  loading.setProgress(0.85, 'Almost ready…')
})
dogReady.catch((err) => console.warn('Shiba failed to load', err))
diningReady.catch((err) => console.warn('Food models failed to load', err))
bikeReady.catch((err) => console.warn('Bicycle failed to load', err))
instrumentsReady.catch((err) => console.warn('Bass model failed to load', err))

const portfolioUi = createPortfolioScreen(monitor)
portfolioUi.preload()
const mobileResumeSheet = isTouchExplore ? createMobileResumeSheet(app) : null
const earwormsUi = createEarwormsScreen(turntable)
earwormsUi.preload()
const poopyUi = createPoopyHoochScreen(bathroom)
poopyUi.preload()
const tvNewsUi = createTvNewsScreen(tv)
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

function setHint(text) {
  hint.textContent = text
}

function setPointer(on) {
  document.body.classList.toggle('is-pointer', on)
}

function setDragging(on) {
  document.body.classList.toggle('is-dragging', on)
}

function setPortfolioInteractive(on) {
  portfolioUi.element.classList.toggle('is-interactive', on)
  portfolioUi.element.style.pointerEvents = on ? 'auto' : 'none'
}

function setEarwormsInteractive(on) {
  earwormsUi.element.classList.toggle('is-interactive', on)
  earwormsUi.element.style.pointerEvents = on ? 'auto' : 'none'
}

function setPoopyInteractive(on) {
  poopyUi.element.classList.toggle('is-interactive', on)
  poopyUi.element.style.pointerEvents = on ? 'auto' : 'none'
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

function openPortfolio() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'portfolio'
  portfolioUi.show()
  mobileResumeSheet?.show()
  const size = { width: 0.85, height: 0.48, fill: 0.78 }
  focusClose.show({ anchor: monitorScreen, width: size.width, height: size.height })
  rig.enterFocus(monitorScreen, size)
  setHint('Reading the résumé…')
}

function openEarworms() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'earworms'
  earwormsUi.show()
  focusHelper.show({
    title: 'Earworms',
    blurb: 'What I\'ve been listening to lately.',
    href: EARWORMS_URL,
    anchor: earwormsScreen,
    width: earwormsUi.screenSize.width,
  })
  focusClose.show({
    anchor: earwormsScreen,
    width: earwormsUi.screenSize.width,
    height: earwormsUi.screenSize.height,
  })
  rig.enterFocus(earwormsScreen, earwormsUi.screenSize)
  setHint('Dropping the needle…')
}

function openPoopyHooch() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'poopyhooch'
  poopyUi.show()
  focusHelper.show({
    title: 'Poop the Hooch',
    blurb: 'Is the Chattahoochee Poopy?',
    href: POOPYHOOCH_URL,
    anchor: bathroomScreen,
    width: poopyUi.screenSize.width,
  })
  focusClose.show({
    anchor: bathroomScreen,
    width: poopyUi.screenSize.width,
    height: poopyUi.screenSize.height,
  })
  rig.enterFocus(bathroomScreen, poopyUi.screenSize)
  setHint('Checking the mirror…')
}

function openCredits() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'credits'
  focusHelper.show({
    title: 'Credits',
    blurb: 'Models used in this room — open each for attribution.',
    links: CREDITS_ENTRIES,
    anchor: creditsScreen,
    width: creditsPlaque.userData.screenSize.width,
  })
  focusClose.show({
    anchor: creditsScreen,
    width: creditsPlaque.userData.screenSize.width,
    height: creditsPlaque.userData.screenSize.height,
  })
  rig.enterFocus(creditsScreen, creditsPlaque.userData.screenSize)
  setHint('Reading the plaque…')
}

function openAbout() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'about'
  const size = dining.userData.screenSize
  focusClose.show({
    anchor: aboutScreen,
    width: size.width,
    height: size.height,
  })
  rig.enterFocus(aboutScreen, size)
  setHint('Reading the menu…')
}

function openPhoto() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'photo'
  const size = photoShelf.userData.screenSize
  focusClose.show({
    anchor: photoScreen,
    width: size.width,
    height: size.height,
  })
  rig.enterFocus(photoScreen, size)
  setHint('Looking closer…')
}

function openDog() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'dog'
  const size = dog.userData.screenSize
  focusHelper.show({
    title: 'Good boy',
    anchor: dogScreen,
    width: size.width,
  })
  focusClose.show({
    anchor: dogScreen,
    width: size.width,
    height: size.height,
  })
  rig.enterFocus(dogScreen, size)
  setHint("Who's a good boy…")
}

function openTvNews() {
  if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'tv'
  tvNewsUi.show()
  focusClose.show({
    anchor: tvScreen,
    width: tvNewsUi.screenSize.width,
    height: tvNewsUi.screenSize.height,
  })
  rig.enterFocus(tvScreen, tvNewsUi.screenSize)
  setHint('Watching the news…')
}

function closeFocus() {
  if (rig.isBusy || rig.mode === 'explore' || rig.mode === 'toExplore') return
  setPortfolioInteractive(false)
  setEarwormsInteractive(false)
  setPoopyInteractive(false)
  setFocusedUi(false)
  focusHelper.hide()
  focusClose.hide()
  if (activeFocus === 'portfolio') {
    portfolioUi.hide()
    mobileResumeSheet?.hide()
  }
  if (activeFocus === 'earworms') earwormsUi.hide()
  if (activeFocus === 'poopyhooch') poopyUi.hide()
  if (activeFocus === 'tv') tvNewsUi.hide()
  activeFocus = null
  rig.exitFocus()
  setHint(EXPLORE_HINT)
}

function pickInteractive(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1
  pointer.y = -(clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  const hits = raycaster.intersectObjects(
    [
      monitor,
      turntable,
      bathroom,
      creditsPlaque,
      dining,
      photoShelf,
      dog,
      tv,
      lightSwitch,
    ],
    true,
  )
  for (const hit of hits) {
    const kind = hit.object.userData.interactive
    if (
      kind === 'monitor' ||
      kind === 'turntable' ||
      kind === 'bathroom' ||
      kind === 'credits' ||
      kind === 'about' ||
      kind === 'photo' ||
      kind === 'dog' ||
      kind === 'tv' ||
      kind === 'lightSwitch'
    ) {
      return kind
    }
  }
  return null
}

canvas.addEventListener('pointermove', (event) => {
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
  if (!kind) setDragging(true)
  if (kind === 'monitor') {
    event.preventDefault()
    openPortfolio()
  } else if (kind === 'turntable') {
    event.preventDefault()
    openEarworms()
  } else if (kind === 'bathroom') {
    event.preventDefault()
    openPoopyHooch()
  } else if (kind === 'credits') {
    event.preventDefault()
    openCredits()
  } else if (kind === 'about') {
    event.preventDefault()
    openAbout()
  } else if (kind === 'photo') {
    event.preventDefault()
    openPhoto()
  } else if (kind === 'dog') {
    event.preventDefault()
    openDog()
  } else if (kind === 'tv') {
    event.preventDefault()
    openTvNews()
  } else if (kind === 'lightSwitch') {
    event.preventDefault()
    if (FREE_CAMERA || rig.isBusy || rig.isFocused) return
    timeOfDay.toggle()
    updateLightSwitch(lightSwitch, { night: timeOfDay.isNight })
    setHint(timeOfDay.isNight ? 'Lights down…' : 'Sunset mode…')
  }
})

window.addEventListener('pointerup', () => setDragging(false))
window.addEventListener('pointercancel', () => setDragging(false))

exitBtn?.addEventListener('click', () => closeFocus())

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

function tick(timestamp) {
  timer.update(timestamp)
  const elapsed = timer.getElapsed()
  const delta = timer.getDelta()

  updatePlants(plants, elapsed)
  updateCandle(roundCoffee, elapsed, delta)
  updateWindowParallax(room, camera)
  timeOfDay.update(delta)
  updateFloorLamp(lamp, { night: timeOfDay.isNight })
  updateLightSwitch(lightSwitch, { night: timeOfDay.isNight })
  const mode = rig.update(delta)
  if (mode !== prevMode) {
    if (mode === 'focused') {
      setFocusedUi(true)
      if (activeFocus === 'portfolio') {
        if (!mobileResumeSheet) setPortfolioInteractive(true)
        setHint('Esc to leave')
      } else if (activeFocus === 'earworms') {
        setEarwormsInteractive(true)
        setHint('Esc to leave')
      } else if (activeFocus === 'poopyhooch') {
        setPoopyInteractive(true)
        setHint('Esc to leave')
      } else if (activeFocus === 'credits') {
        setHint('Esc to leave')
      } else if (activeFocus === 'about') {
        setHint('Esc to leave')
      } else if (activeFocus === 'photo') {
        setHint('Esc to leave')
      } else if (activeFocus === 'dog') {
        setHint('Esc to leave')
      } else if (activeFocus === 'tv') {
        setHint('Esc to leave')
      }
    } else if (mode === 'explore') {
      setPortfolioInteractive(false)
      setEarwormsInteractive(false)
      setPoopyInteractive(false)
      setFocusedUi(false)
      focusHelper.hide()
      mobileResumeSheet?.hide()
      setHint(EXPLORE_HINT)
    }
    prevMode = mode
  }

  const focusing = rig.isFocused || mode === 'toFocus'
  if (isTouchExplore && !rig.isFocused && !rig.isBusy) {
    // Breathe 0 → subtle so materials stay readable between beats
    const wave = 0.5 + 0.5 * Math.sin(elapsed * 1.6)
    const pulseIntensity = wave * wave * 0.045
    hoverHighlight.pulse(Object.values(interactiveRoots), pulseIntensity)
  } else {
    hoverHighlight.clearPulse()
  }
  focusHelper.update(camera)
  focusClose.update(camera)
  updateMonitor(monitor, elapsed, {
    focused: focusing && activeFocus === 'portfolio',
  })
  updateTurntable(turntable, elapsed, {
    focused: focusing && activeFocus === 'earworms',
  })
  updateBathroom(bathroom, elapsed, {
    focused: focusing && activeFocus === 'poopyhooch',
  })
  updateCreditsPlaque(creditsPlaque, elapsed, {
    focused: focusing && activeFocus === 'credits',
  })
  updateTV(tv, elapsed, {
    focused: focusing && activeFocus === 'tv',
  })
  tvNewsUi.update(elapsed, delta)
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
  if (!FREE_CAMERA && !rig.isBusy && !rig.isFocused) {
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
    Promise.allSettled([dogReady, diningReady, bikeReady]).then(() => loading.finishWhenReady())
  }

  requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
