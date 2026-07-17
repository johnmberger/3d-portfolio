import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const SHIBA_URL = '/models/shiba/scene.gltf'

function createDogMat() {
  const mat = new THREE.Group()
  mat.name = 'dogMat'

  const fabric = new THREE.MeshStandardMaterial({
    color: 0x8a6a4e,
    roughness: 0.95,
    metalness: 0,
  })
  const trim = new THREE.MeshStandardMaterial({
    color: 0x6b5340,
    roughness: 0.9,
    metalness: 0,
  })
  const cushion = new THREE.MeshStandardMaterial({
    color: 0xa08060,
    roughness: 0.92,
    metalness: 0,
  })

  // Flat oval rug
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.02, 28), fabric)
  base.position.y = 0.01
  base.scale.set(1.15, 1, 0.85)
  base.receiveShadow = true
  base.castShadow = true
  mat.add(base)

  // Raised bolster rim (dog bed lip)
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.32, 0.045, 10, 28),
    trim,
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = 0.04
  rim.scale.set(1.15, 0.85, 1)
  rim.castShadow = true
  mat.add(rim)

  // Soft inner pad
  const pad = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.28, 0.025, 24),
    cushion,
  )
  pad.position.y = 0.028
  pad.scale.set(1.1, 1, 0.8)
  pad.receiveShadow = true
  mat.add(pad)

  return mat
}

/**
 * Loads zixisun02's Shiba (CC BY 4.0) and returns a group that fills in when ready.
 * https://sketchfab.com/3d-models/shiba-faef9fe5ace445e7b2989d1c1ece361c
 *
 * Note: the Sketchfab FBX export names the body mesh "Box002" — do not strip it.
 */
export function createDog() {
  const group = new THREE.Group()
  group.name = 'dog'

  const dogMat = createDogMat()
  group.add(dogMat)

  const body = new THREE.Group()
  body.name = 'dogBody'
  group.add(body)

  // Under the desk, on the mat, facing into the room (+Z)
  group.position.set(0.55, 0, -3.25)
  group.rotation.y = 0

  const ready = new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      SHIBA_URL,
      (gltf) => {
        const model = gltf.scene
        model.name = 'shibaModel'

        model.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = false
          if (child.material) {
            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material]
            for (const m of mats) {
              if (m.map) m.map.colorSpace = THREE.SRGBColorSpace
              m.side = THREE.FrontSide
            }
          }
        })

        // Model units are small — scale up for the room (fits under 0.75 desk)
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        box.getSize(size)
        const targetHeight = 0.36
        const scale = targetHeight / Math.max(size.y, 0.001)
        model.scale.setScalar(scale)

        box.setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.x -= center.x
        model.position.z -= center.z
        // Sit on the mat pad
        model.position.y -= box.min.y
        model.position.y += 0.035

        body.add(model)
        resolve(group)
      },
      undefined,
      reject,
    )
  })

  return { group, ready }
}

export function updateDog(dog, elapsed) {
  const body = dog.userData.dogBody ?? dog.getObjectByName('dogBody')
  dog.userData.dogBody = body
  if (!body) return
  body.position.y = Math.sin(elapsed * 1.2) * 0.004
  body.rotation.y = Math.sin(elapsed * 0.5) * 0.03
}
