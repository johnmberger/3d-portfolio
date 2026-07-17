import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { createRoom, updateWindowParallax } from './objects/room.js'
import { createPlants, updatePlants } from './objects/plants.js'
import { createBicycle, updateBicycle } from './objects/bicycle.js'
import { createMonitor, updateMonitor } from './objects/monitor.js'
import { createDiningTable } from './objects/dining.js'
import { createTurntable, updateTurntable } from './objects/turntable.js'
import { createFloorLamp, updateFloorLamp } from './objects/lamp.js'
import { createRug } from './objects/rug.js'
import { createDog, updateDog } from './objects/dog.js'
import { createWallArt } from './objects/wallArt.js'
import { createBathroom, updateBathroom } from './objects/bathroom.js'
import { createCreditsPlaque } from './objects/credits.js'
import { createCouch } from './objects/couch.js'
import { createArmchair } from './objects/armchair.js'
import { createTV, updateTV } from './objects/tv.js'
import { createKitchenette } from './objects/kitchenette.js'
import { createSideTables } from './objects/sideTables.js'
import { WALL_POS } from './objects/roomConstants.js'
import { createCameraRig } from './interaction/cameraRig.js'
import { createTimeOfDay } from './interaction/timeOfDay.js'
import { createHoverHighlight } from './interaction/hoverHighlight.js'
import {
  createCSS3DRenderer,
  createPortfolioScreen,
  updatePortfolioVisibility,
} from './ui/portfolioScreen.js'
import {
  createEarwormsScreen,
  updateEarwormsVisibility,
} from './ui/earwormsScreen.js'
import {
  createPoopyHoochScreen,
  updatePoopyHoochVisibility,
} from './ui/poopyhoochScreen.js'
import { createLoadingScreen } from './ui/loadingScreen.js'

RectAreaLightUniformsLib.init()

const EXPLORE_HINT =
  'Drag to look · Scroll to zoom · Click monitor, turntable, or bathroom'

const loading = createLoadingScreen(document.body)
loading.setProgress(0.15, 'Building the room…')

const app = document.querySelector('#app')
const canvas = document.querySelector('#webgl')
const hud = document.querySelector('.hud')
const hint = document.querySelector('.hint')
const exitBtn = document.querySelector('.exit-screen')
const todBtn = document.querySelector('.tod-toggle')
const hudActions = document.querySelector('.hud-actions')

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

const camera = new THREE.PerspectiveCamera(
  44,
  window.innerWidth / window.innerHeight,
  0.1,
  80,
)
// Hero view: sectional + coffee table readable, room fills the frame
camera.position.set(-0.4, 1.6, 3.55)

const controls = new OrbitControls(camera, canvas)
controls.target.set(0.1, 0.7, 0.35)
controls.enableDamping = true
controls.dampingFactor = 0.06
controls.enablePan = true
controls.panSpeed = 0.6
controls.minDistance = 1.8
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
sun.shadow.mapSize.set(2048, 2048)
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
fill.position.set(3.2, 4, 2.2)
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
const lamp = createFloorLamp()
const rug = createRug()
const { group: dog, ready: dogReady } = createDog()
const wallArt = createWallArt()
const bathroom = createBathroom()
const creditsPlaque = createCreditsPlaque()
const couch = createCouch()
const listeningChair = createArmchair({
  position: [-0.85, 0, -1.55],
  rotationY: 2.45 + Math.PI / 2,
  fabricColor: 0xa89880,
  fabricDeepColor: 0x96866e,
  pillowColor: 0x7a6a58,
})
const tv = createTV()
const kitchenette = createKitchenette()
const sideTables = createSideTables()
scene.add(
  room,
  plants,
  bicycle,
  monitor,
  dining,
  turntable,
  lamp,
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
)

loading.setProgress(0.65, 'Warming the lights…')
Promise.allSettled([dogReady, diningReady, bikeReady]).then(() => {
  loading.setProgress(0.85, 'Almost ready…')
})
dogReady.catch((err) => console.warn('Shiba failed to load', err))
diningReady.catch((err) => console.warn('Food models failed to load', err))
bikeReady.catch((err) => console.warn('Bicycle failed to load', err))

const portfolioUi = createPortfolioScreen(monitor)
const earwormsUi = createEarwormsScreen(turntable)
earwormsUi.preload()
const poopyUi = createPoopyHoochScreen(bathroom)
poopyUi.preload()
const rig = createCameraRig(camera, controls)
const monitorScreen = monitor.getObjectByName('screen')
const earwormsScreen = turntable.getObjectByName('screen')
const bathroomScreen = bathroom.getObjectByName('screen')

const timeOfDay = createTimeOfDay({
  scene,
  renderer,
  ambient,
  sun,
  fill,
  windowGlow,
  windowRim,
  room,
  button: todBtn,
})

todBtn.addEventListener('click', () => {
  if (rig.isFocused || rig.isBusy) return
  timeOfDay.toggle()
})

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
let hoverTarget = null
const hoverHighlight = createHoverHighlight()
const interactiveRoots = {
  monitor,
  turntable,
  bathroom,
}
let activeFocus = null
let prevMode = 'explore'

function setHint(text) {
  hint.textContent = text
}

function setPointer(on) {
  document.body.classList.toggle('is-pointer', on)
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
  exitBtn.hidden = !on
  if (hudActions) hudActions.style.opacity = on ? '0' : '1'
  if (hudActions) hudActions.style.pointerEvents = on ? 'none' : 'auto'
  const credits = document.querySelector('.credits')
  if (credits) credits.style.opacity = on ? '0' : '1'
}

function openPortfolio() {
  if (rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'portfolio'
  portfolioUi.showList()
  rig.enterFocus(monitorScreen, { width: 0.85, height: 0.48, fill: 0.94 })
  setHint('Reading the screen…')
}

function openEarworms() {
  if (rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'earworms'
  earwormsUi.show()
  rig.enterFocus(earwormsScreen, earwormsUi.screenSize)
  setHint('Dropping the needle…')
}

function openPoopyHooch() {
  if (rig.isBusy || rig.isFocused) return
  hoverHighlight.clear()
  activeFocus = 'poopyhooch'
  poopyUi.show()
  rig.enterFocus(bathroomScreen, poopyUi.screenSize)
  setHint('Checking the mirror…')
}

function closeFocus() {
  if (rig.isBusy || rig.mode === 'explore' || rig.mode === 'toExplore') return
  setPortfolioInteractive(false)
  setEarwormsInteractive(false)
  setPoopyInteractive(false)
  setFocusedUi(false)
  if (activeFocus === 'portfolio') portfolioUi.showList()
  if (activeFocus === 'earworms') earwormsUi.hide()
  if (activeFocus === 'poopyhooch') poopyUi.hide()
  activeFocus = null
  rig.exitFocus()
  setHint(EXPLORE_HINT)
}

function pickInteractive(clientX, clientY) {
  pointer.x = (clientX / window.innerWidth) * 2 - 1
  pointer.y = -(clientY / window.innerHeight) * 2 + 1
  raycaster.setFromCamera(pointer, camera)

  const hits = raycaster.intersectObjects([monitor, turntable, bathroom], true)
  for (const hit of hits) {
    const kind = hit.object.userData.interactive
    if (kind === 'monitor' || kind === 'turntable' || kind === 'bathroom') {
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
  if (hoverTarget === 'monitor') setHint('Click to open resume')
  else if (hoverTarget === 'turntable') setHint('Click to open Earworms')
  else if (hoverTarget === 'bathroom') setHint('Click to open PoopyHooch')
  else setHint(EXPLORE_HINT)
})

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return
  if (rig.isBusy || rig.isFocused) return
  const kind = pickInteractive(event.clientX, event.clientY)
  if (kind === 'monitor') {
    event.preventDefault()
    openPortfolio()
  } else if (kind === 'turntable') {
    event.preventDefault()
    openEarworms()
  } else if (kind === 'bathroom') {
    event.preventDefault()
    openPoopyHooch()
  }
})

exitBtn.addEventListener('click', () => closeFocus())

portfolioUi.closeBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  closeFocus()
})

earwormsUi.closeBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  closeFocus()
})

poopyUi.closeBtn.addEventListener('click', (e) => {
  e.stopPropagation()
  closeFocus()
})

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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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
  updateBicycle(bicycle, elapsed)
  updateDog(dog, elapsed)
  updateWindowParallax(room, camera)
  timeOfDay.update(delta)
  updateFloorLamp(lamp, { night: timeOfDay.isNight })

  const mode = rig.update(delta)
  if (mode !== prevMode) {
    if (mode === 'focused') {
      setFocusedUi(true)
      if (activeFocus === 'portfolio') {
        setPortfolioInteractive(true)
        setHint('Back to room · Esc')
      } else if (activeFocus === 'earworms') {
        setEarwormsInteractive(true)
        setHint('Back to room · Esc')
      } else if (activeFocus === 'poopyhooch') {
        setPoopyInteractive(true)
        setHint('Back to room · Esc')
      }
    } else if (mode === 'explore') {
      setPortfolioInteractive(false)
      setEarwormsInteractive(false)
      setPoopyInteractive(false)
      setFocusedUi(false)
      setHint(EXPLORE_HINT)
    }
    prevMode = mode
  }

  const focusing = rig.isFocused || mode === 'toFocus'
  updateMonitor(monitor, elapsed, {
    focused: focusing && activeFocus === 'portfolio',
  })
  updateTurntable(turntable, elapsed, {
    focused: focusing && activeFocus === 'earworms',
  })
  updateBathroom(bathroom, elapsed, {
    focused: focusing && activeFocus === 'poopyhooch',
  })
  updateTV(tv, elapsed)
  updatePortfolioVisibility(portfolioUi, camera, monitorScreen)
  updateEarwormsVisibility(earwormsUi, camera, earwormsScreen, {
    active: focusing && activeFocus === 'earworms',
  })
  updatePoopyHoochVisibility(poopyUi, camera, bathroomScreen, {
    active: focusing && activeFocus === 'poopyhooch',
  })

  if (controls.enabled) controls.update()
  renderer.render(scene, camera)
  cssRenderer.render(scene, camera)

  if (!loadingFinished) {
    loadingFinished = true
    Promise.allSettled([dogReady, diningReady, bikeReady]).then(() => loading.finishWhenReady())
  }

  requestAnimationFrame(tick)
}

requestAnimationFrame(tick)
