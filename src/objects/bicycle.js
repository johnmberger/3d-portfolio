import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const BIKE_URL = '/models/bike/bicycle.glb'

function createWallHooks() {
  const hooks = new THREE.Group()
  hooks.name = 'bikeHooks'

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

  // Local Z is into the room after the wall yaw — hangers sit on −Z (wall side)
  for (const x of [-0.55, 0.55]) {
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.05), woodMat)
    block.position.set(x, 0, -0.02)
    block.castShadow = true
    hooks.add(block)

    const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.12, 10), metalMat)
    peg.rotation.x = Math.PI / 2
    peg.position.set(x, 0, 0.05)
    peg.castShadow = true
    hooks.add(peg)
  }

  return hooks
}

/**
 * Bicycle by Poly by Google (CC BY 3.0) via Poly Pizza.
 * Hung on the front wall beside the entry door, Seinfeld-style.
 * https://poly.pizza/m/19VoUuA2pcN
 */
export function createBicycle() {
  const group = new THREE.Group()
  group.name = 'bicycle'

  const body = new THREE.Group()
  body.name = 'bikeBody'
  // Sit on the pegs, slightly off the wall
  body.position.z = 0.1
  group.add(body)

  // Front wall, just left of the entry door — side profile facing into the room
  group.position.set(0.35, 1.75, 4.42)
  group.rotation.y = Math.PI

  const hooks = createWallHooks()
  hooks.position.set(0, 0.08, 0)
  group.add(hooks)

  const ready = new Promise((resolve, reject) => {
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

        const targetLength = 1.55
        const longest = Math.max(size.x, size.y, size.z)
        const scale = targetLength / Math.max(longest, 0.001)
        model.scale.setScalar(scale)

        // Center on mount point (not grounded)
        model.updateMatrixWorld(true)
        box.setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.sub(center)

        body.add(model)
        resolve(group)
      },
      undefined,
      reject,
    )
  })

  return { group, ready }
}

export function updateBicycle(_bike, _elapsed) {
  // Mounted solid — no idle motion
}
