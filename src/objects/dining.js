import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const BURGER_URL = '/models/food/burger.glb'
const FRIES_URL = '/models/food/fries.glb'
const SODA_URL = '/models/food/soda.glb'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0, ...props })
}

function prepareFoodModel(scene, { targetHeight, uprightFromZ = false } = {}) {
  // Some Quaternius props are authored Z-up
  if (uprightFromZ) scene.rotation.x = Math.PI / 2

  scene.traverse((child) => {
    if (!child.isMesh) return
    child.castShadow = true
    child.receiveShadow = true
    const mats = Array.isArray(child.material) ? child.material : [child.material]
    for (const m of mats) {
      if (!m) continue
      // Quaternius FBX export is a bit metallic for food
      if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0, 0.08)
      if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.7, 0.65)
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
    }
  })

  scene.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  box.getSize(size)
  const scale = targetHeight / Math.max(size.y, 0.0001)
  scene.scale.setScalar(scale)

  scene.updateMatrixWorld(true)
  box.setFromObject(scene)
  const center = new THREE.Vector3()
  box.getCenter(center)
  scene.position.x -= center.x
  scene.position.z -= center.z
  scene.position.y -= box.min.y

  return scene
}

function loadFood(url, opts) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => resolve(prepareFoodModel(gltf.scene, opts)),
      undefined,
      reject,
    )
  })
}

function createPlate() {
  const plateMat = mat(0xf2f0ea, { roughness: 0.45 })
  const plate = new THREE.Group()

  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.12, 0.012, 24),
    plateMat,
  )
  dish.position.y = 0.006
  dish.castShadow = true
  dish.receiveShadow = true
  plate.add(dish)

  const well = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.004, 24),
    mat(0xe8e4dc, { roughness: 0.5 }),
  )
  well.position.y = 0.01
  plate.add(well)

  return plate
}

function createBagLabelTexture(name) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 640
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#c4a06a'
  ctx.fillRect(0, 0, 512, 640)

  // Soft kraft grain
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 640
    const a = 0.04 + Math.random() * 0.06
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(90,60,30,${a})` : `rgba(255,235,200,${a})`
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  // Brand band
  ctx.fillStyle = '#6b1f1a'
  ctx.fillRect(48, 120, 416, 280)

  ctx.strokeStyle = '#e8d5b0'
  ctx.lineWidth = 4
  ctx.strokeRect(64, 136, 384, 248)

  const parts = name.trim().split(/\s+/)
  const line1 = (parts[0] || name).toUpperCase()
  const line2 = (parts.slice(1).join(' ') || '').toUpperCase()

  ctx.fillStyle = '#f4ead8'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 64px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText(line1, 256, line2 ? 230 : 260)
  if (line2) {
    ctx.font = '700 58px "Source Sans 3", system-ui, sans-serif'
    ctx.fillText(line2, 256, 310)
  }

  ctx.fillStyle = '#5a3d28'
  ctx.font = '600 22px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('TAKE · OUT', 256, 480)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** Kraft takeout bag with a printed name on the front. */
function createFastFoodBag(name = 'John Berger') {
  const bag = new THREE.Group()
  bag.name = 'fastFoodBag'

  const paperMat = mat(0xc4a06a, { roughness: 0.92, metalness: 0 })
  const creaseMat = mat(0xb08955, { roughness: 0.9 })

  const w = 0.13
  const d = 0.09
  const h = 0.175
  const t = 0.007

  const bottom = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), paperMat)
  bottom.position.y = t / 2
  bottom.castShadow = true
  bottom.receiveShadow = true
  bag.add(bottom)

  const front = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), paperMat)
  front.position.set(0, h / 2 + t, d / 2 - t / 2)
  front.castShadow = true
  bag.add(front)

  const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, t), paperMat)
  back.position.set(0, h / 2 + t, -d / 2 + t / 2)
  back.castShadow = true
  bag.add(back)

  const left = new THREE.Mesh(new THREE.BoxGeometry(t, h, d - t * 2), creaseMat)
  left.position.set(-w / 2 + t / 2, h / 2 + t, 0)
  left.castShadow = true
  bag.add(left)

  const right = new THREE.Mesh(new THREE.BoxGeometry(t, h, d - t * 2), creaseMat)
  right.position.set(w / 2 - t / 2, h / 2 + t, 0)
  right.castShadow = true
  bag.add(right)

  // Folded rim
  const rim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.008, 0.018, d + 0.008), creaseMat)
  rim.position.y = h + t + 0.006
  rim.castShadow = true
  bag.add(rim)

  // Soft interior fill so the open top reads as a bag
  const fill = new THREE.Mesh(
    new THREE.BoxGeometry(w - t * 2.5, h * 0.55, d - t * 2.5),
    mat(0xa88858, { roughness: 0.95 }),
  )
  fill.position.y = t + (h * 0.55) / 2
  bag.add(fill)

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 0.88, h * 0.78),
    new THREE.MeshStandardMaterial({
      map: createBagLabelTexture(name),
      roughness: 0.88,
      metalness: 0,
    }),
  )
  label.position.set(0, h * 0.52 + t, d / 2 + 0.001)
  bag.add(label)

  // Twisted-paper style handles
  const handleMat = mat(0x8a6a40, { roughness: 0.85 })
  const handleGeo = new THREE.TorusGeometry(0.028, 0.004, 6, 12, Math.PI)
  for (const x of [-0.028, 0.028]) {
    const handle = new THREE.Mesh(handleGeo, handleMat)
    handle.rotation.y = Math.PI / 2
    handle.rotation.z = Math.PI
    handle.position.set(x, h + t + 0.03, 0)
    handle.castShadow = true
    bag.add(handle)
  }

  return bag
}

function createDiningChair() {
  const chair = new THREE.Group()
  const wood = mat(0x7a5c42, { roughness: 0.7 })
  const seatMat = mat(0xc4b09a, { roughness: 0.85 })

  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.4), seatMat)
  seat.position.y = 0.45
  seat.castShadow = true
  seat.receiveShadow = true
  chair.add(seat)

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 0.04), wood)
  back.position.set(0, 0.68, -0.18)
  back.castShadow = true
  chair.add(back)

  const slat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.02), wood)
  slat.position.set(0, 0.72, -0.155)
  chair.add(slat)

  const legGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.44, 8)
  for (const [x, z] of [
    [0.15, 0.14],
    [-0.15, 0.14],
    [0.15, -0.14],
    [-0.15, -0.14],
  ]) {
    const leg = new THREE.Mesh(legGeo, wood)
    leg.position.set(x, 0.22, z)
    leg.castShadow = true
    chair.add(leg)
  }

  return chair
}

/**
 * Dining table with Quaternius burger, fries, and soda (CC0).
 * https://quaternius.com/packs/ultimatefood.html
 */
export function createDiningTable() {
  const group = new THREE.Group()
  group.name = 'diningTable'

  const woodMat = mat(0x8a7355, { roughness: 0.65, metalness: 0.05 })
  const legMat = mat(0x6b5840, { roughness: 0.7 })

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.85), woodMat)
  top.position.y = 0.74
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)

  const apron = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.06, 0.77), legMat)
  apron.position.y = 0.695
  group.add(apron)

  const legGeo = new THREE.BoxGeometry(0.06, 0.7, 0.06)
  for (const [x, z] of [
    [0.58, 0.32],
    [-0.58, 0.32],
    [0.58, -0.32],
    [-0.58, -0.32],
  ]) {
    const leg = new THREE.Mesh(legGeo, legMat)
    leg.position.set(x, 0.35, z)
    leg.castShadow = true
    group.add(leg)
  }

  const surfaceY = 0.765

  const plate = createPlate()
  plate.position.set(-0.15, surfaceY, 0.05)
  group.add(plate)

  const burgerSlot = new THREE.Group()
  burgerSlot.name = 'hamburger'
  burgerSlot.position.set(-0.15, surfaceY + 0.012, 0.04)
  burgerSlot.rotation.y = 0.35
  group.add(burgerSlot)

  const friesSlot = new THREE.Group()
  friesSlot.name = 'fries'
  friesSlot.position.set(0.12, surfaceY, 0.08)
  friesSlot.rotation.y = -0.4
  group.add(friesSlot)

  const drinkSlot = new THREE.Group()
  drinkSlot.name = 'drink'
  drinkSlot.position.set(0.28, surfaceY, -0.12)
  group.add(drinkSlot)

  const bag = createFastFoodBag('John Berger')
  bag.position.set(0.48, surfaceY, 0.06)
  bag.rotation.y = -0.55
  group.add(bag)

  const napkin = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.004, 0.16),
    mat(0xe8efe9, { roughness: 0.9 }),
  )
  napkin.position.set(-0.45, surfaceY + 0.002, -0.15)
  napkin.rotation.y = 0.2
  group.add(napkin)

  const cutleryMat = mat(0xc0c4c8, { roughness: 0.3, metalness: 0.8 })
  const knife = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.004, 0.016), cutleryMat)
  knife.position.set(-0.42, surfaceY + 0.006, 0.05)
  knife.rotation.y = 0.15
  group.add(knife)

  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.004, 0.014), cutleryMat)
  fork.position.set(-0.48, surfaceY + 0.006, 0.05)
  fork.rotation.y = 0.15
  group.add(fork)

  // Four chairs around the table
  const chairs = [
    { x: 0, z: 0.62, ry: Math.PI },
    { x: 0, z: -0.62, ry: 0 },
    { x: 0.85, z: 0, ry: -Math.PI / 2 },
    { x: -0.85, z: 0, ry: Math.PI / 2 },
  ]
  for (const { x, z, ry } of chairs) {
    const chair = createDiningChair()
    chair.position.set(x, 0, z)
    chair.rotation.y = ry
    group.add(chair)
  }

  // In front of the smaller side window
  group.position.set(3.0, 0, -0.35)
  group.rotation.y = Math.PI / 2

  const ready = Promise.all([
    loadFood(BURGER_URL, { targetHeight: 0.11 }),
    loadFood(FRIES_URL, { targetHeight: 0.18, uprightFromZ: true }),
    loadFood(SODA_URL, { targetHeight: 0.26 }),
  ]).then(([burger, fries, soda]) => {
    burgerSlot.add(burger)
    friesSlot.add(fries)
    drinkSlot.add(soda)
    return group
  })

  return { group, ready }
}
