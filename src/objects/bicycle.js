import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const BIKE_URL = '/models/bike/bicycle.glb'
const TARGET_LENGTH = 1.55
/** Bottom of lower tire above the floor */
const CLEARANCE = 0.55
/** Shift hanger toward the kitchen (−X world); group is yawed π so +local X → −world X */
const HANGER_RIGHT = 0.12
/** Drop hanger slightly so the peg sits a bit lower on the tire */
const HANGER_DOWN = 0.025

function createWallHook() {
  const hook = new THREE.Group()
  hook.name = 'bikeHook'

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x5c4a38,
    roughness: 0.7,
    metalness: 0.05,
  })
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x2a2e2c,
    roughness: 0.4,
    metalness: 0.65,
  })

  // Block sits mostly below the peg so it doesn’t stick up past the tire
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.05), woodMat)
  block.position.set(0, -0.045, -0.02)
  block.castShadow = true
  hook.add(block)

  // Peg at hook origin — this is the tire contact point
  const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.13, 10), metalMat)
  peg.rotation.x = Math.PI / 2
  peg.position.set(0, 0, 0.05)
  peg.castShadow = true
  hook.add(peg)

  return hook
}

function isWheelMesh(mesh) {
  const n = (mesh.name || '').toLowerCase()
  if (/wheel|tire|tyre|rim/.test(n)) return true
  const box = new THREE.Box3().setFromObject(mesh)
  const s = new THREE.Vector3()
  box.getSize(s)
  const dims = [s.x, s.y, s.z].sort((a, b) => a - b)
  return (
    dims[0] < dims[1] * 0.4 &&
    dims[1] > 0.12 &&
    Math.abs(dims[1] - dims[2]) / Math.max(dims[2], 0.001) < 0.4
  )
}

/**
 * Top-center of the upper wheel AABB — centered on the tire, not a random rim vertex.
 */
function findUpperWheelHangPoint(model, target = new THREE.Vector3()) {
  const wheels = []
  model.traverse((child) => {
    if (!child.isMesh || !isWheelMesh(child)) return
    const box = new THREE.Box3().setFromObject(child)
    const size = new THREE.Vector3()
    box.getSize(size)
    const radius = Math.max(size.x, size.y, size.z) * 0.5
    if (radius < 0.12) return
    wheels.push({ box, radius })
  })

  if (wheels.length > 0) {
    wheels.sort((a, b) => b.box.max.y - a.box.max.y)
    const top = wheels[0].box
    const c = new THREE.Vector3()
    top.getCenter(c)
    // Dead-center top of the tire
    return target.set(c.x, top.max.y, c.z)
  }

  const box = new THREE.Box3().setFromObject(model)
  const c = new THREE.Vector3()
  box.getCenter(c)
  return target.set(c.x, box.max.y, c.z)
}

/**
 * Bicycle by Poly by Google (CC BY 3.0) via Poly Pizza.
 * Hung vertically on the front wall beside the entry door (single hanger).
 * https://poly.pizza/m/19VoUuA2pcN
 *
 * @param {{ defer?: boolean }} [opts] — if defer, call startLoad() after first paint
 */
export function createBicycle({ defer = false } = {}) {
  const group = new THREE.Group()
  group.name = 'bicycle'

  const body = new THREE.Group()
  body.name = 'bikeBody'
  body.position.z = 0.11
  group.add(body)

  const hook = createWallHook()
  group.add(hook)

  // Front wall — centered between entry door (openR≈0.86) and kitchenette (≈2.61)
  group.position.set(1.74, 1.1, 4.42)
  group.rotation.y = Math.PI

  let started = false
  let resolveReady
  let rejectReady
  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })

  function startLoad() {
    if (started) return ready
    started = true
    const loader = new GLTFLoader()
    loader.load(
      BIKE_URL,
      (gltf) => {
        const model = gltf.scene
        model.name = 'bikeModel'

        model.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = true
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          for (const m of mats) {
            if (!m) continue
            if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
            if ('metalness' in m) m.metalness = Math.min(m.metalness ?? 0.2, 0.45)
            if ('roughness' in m) m.roughness = Math.max(m.roughness ?? 0.6, 0.4)
          }
        })

        model.updateMatrixWorld(true)
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        box.getSize(size)

        const longest = Math.max(size.x, size.y, size.z)
        model.scale.setScalar(TARGET_LENGTH / Math.max(longest, 0.001))

        model.updateMatrixWorld(true)
        box.setFromObject(model)
        box.getSize(size)

        // Stand the bike on end (longest axis → Y)
        if (size.x >= size.y && size.x >= size.z) {
          model.rotation.z = Math.PI / 2
        } else if (size.z >= size.y && size.z >= size.x) {
          model.rotation.x = -Math.PI / 2
        }

        model.updateMatrixWorld(true)
        box.setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.sub(center)

        body.add(model)
        group.updateMatrixWorld(true)

        // Hang point = top-center of upper tire (group local)
        const hangWorld = findUpperWheelHangPoint(model)
        const hangLocal = hangWorld.clone()
        group.worldToLocal(hangLocal)

        // Peg at tire top-center, nudged for visual centering; slight drop toward the floor
        const pegRadius = 0.016
        hook.position.set(
          hangLocal.x + HANGER_RIGHT,
          hangLocal.y - pegRadius - HANGER_DOWN,
          0,
        )

        // Drop the whole mount so the lower tire clears the floor by CLEARANCE
        box.setFromObject(model)
        const bottomWorld = box.min.y
        const lift = CLEARANCE - bottomWorld
        group.position.y += lift

        resolveReady(group)
      },
      undefined,
      rejectReady,
    )
    return ready
  }

  if (!defer) startLoad()

  return { group, ready, startLoad }
}

export function updateBicycle(_bike, _elapsed) {
  // Mounted solid — no idle motion
}
