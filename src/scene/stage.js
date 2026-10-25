import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { WALL_POS } from '../objects/roomConstants.js'
import { createCSS3DRenderer } from '../ui/css3dScreen.js'

/**
 * WebGL renderer, CSS3D overlay, camera, orbit controls, and the room's base lights.
 * Call RectAreaLightUniformsLib.init() before this — the window uses a rect area light.
 */
export function createStage({ canvas, app, isMobile, isTouchExplore, maxPixelRatio }) {
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

  return {
    renderer,
    cssRenderer,
    scene,
    camera,
    controls,
    ambient,
    sun,
    fill,
    windowGlow,
    windowRim,
  }
}
