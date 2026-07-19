import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { WALL_POS } from './roomConstants.js'

const BASS_URL = '/models/bass/bass.glb'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    ...props,
  })
}

function createWallHanger() {
  const hanger = new THREE.Group()
  hanger.name = 'instrumentHanger'

  const wood = mat(0x5c4a38, { roughness: 0.7 })
  const metal = mat(0x3a3f3c, { roughness: 0.35, metalness: 0.7 })

  const block = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.035), wood)
  block.position.set(0, 0, -0.012)
  block.castShadow = true
  hanger.add(block)

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.09, 10), metal)
  arm.rotation.x = Math.PI / 2
  arm.position.set(0, 0, 0.04)
  arm.castShadow = true
  hanger.add(arm)

  const yoke = new THREE.Mesh(
    new THREE.TorusGeometry(0.032, 0.008, 8, 18, Math.PI),
    metal,
  )
  yoke.rotation.x = Math.PI / 2
  yoke.rotation.z = Math.PI
  yoke.position.set(0, -0.012, 0.08)
  yoke.castShadow = true
  hanger.add(yoke)

  return hanger
}

function createAcousticBodyShape(scale = 1, holeY = -0.12, holeR = 0.038) {
  const s = new THREE.Shape()
  const lower = 0.195 * scale
  const waist = 0.118 * scale
  const upper = 0.148 * scale
  const top = 0.05 * scale
  const upperY = -0.02 * scale
  const waistY = -0.16 * scale
  const lowerY = -0.32 * scale
  const bottom = -0.48 * scale

  s.moveTo(0, top)
  s.bezierCurveTo(upper * 0.55, top, upper, top - 0.04 * scale, upper, upperY)
  s.bezierCurveTo(upper, upperY - 0.06 * scale, waist + 0.02 * scale, waistY + 0.04 * scale, waist, waistY)
  s.bezierCurveTo(waist + 0.02 * scale, waistY - 0.05 * scale, lower, lowerY + 0.08 * scale, lower, lowerY)
  s.bezierCurveTo(lower, lowerY - 0.1 * scale, lower * 0.55, bottom, 0, bottom)
  s.bezierCurveTo(-lower * 0.55, bottom, -lower, lowerY - 0.1 * scale, -lower, lowerY)
  s.bezierCurveTo(-lower, lowerY + 0.08 * scale, -(waist + 0.02 * scale), waistY - 0.05 * scale, -waist, waistY)
  s.bezierCurveTo(-(waist + 0.02 * scale), waistY + 0.04 * scale, -upper, upperY - 0.06 * scale, -upper, upperY)
  s.bezierCurveTo(-upper, top - 0.04 * scale, -upper * 0.55, top, 0, top)

  const hole = new THREE.Path()
  hole.absarc(0, holeY * scale, holeR * scale, 0, Math.PI * 2, true)
  s.holes.push(hole)
  return s
}

function createAcoustic({ scale = 1, name = 'acousticGuitar' } = {}) {
  const instrument = new THREE.Group()
  instrument.name = name

  const topWood = mat(0xd4a06a, { roughness: 0.42 })
  const sideWood = mat(0x8a5a32, { roughness: 0.5 })
  const darkWood = mat(0x4a2e1a, { roughness: 0.55 })
  const fretboard = mat(0x1e140e, { roughness: 0.7 })
  const metal = mat(0xc9c2b4, { roughness: 0.28, metalness: 0.8 })
  const stringMat = mat(0xe0d8cc, { roughness: 0.3, metalness: 0.6 })

  const depth = 0.095 * scale
  const holeY = -0.12
  const holeR = 0.038
  const bodyGeo = new THREE.ExtrudeGeometry(createAcousticBodyShape(scale, holeY, holeR), {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.005 * scale,
    bevelSize: 0.004 * scale,
    bevelSegments: 2,
    curveSegments: 24,
  })
  bodyGeo.translate(0, 0, -depth / 2)

  const body = new THREE.Mesh(bodyGeo, [sideWood, topWood])
  body.castShadow = true
  body.receiveShadow = true
  instrument.add(body)

  const faceZ = depth / 2 + 0.001
  const hy = holeY * scale
  const hr = holeR * scale

  const cavity = new THREE.Mesh(
    new THREE.CircleGeometry(hr * 0.98, 28),
    mat(0x1a120c, { roughness: 1 }),
  )
  cavity.position.set(0, hy, -depth * 0.15)
  instrument.add(cavity)

  const holeWall = new THREE.Mesh(
    new THREE.CylinderGeometry(hr, hr, depth * 0.55, 24, 1, true),
    mat(0x3a2414, { roughness: 0.85, side: THREE.BackSide }),
  )
  holeWall.rotation.x = Math.PI / 2
  holeWall.position.set(0, hy, 0)
  instrument.add(holeWall)

  const rosette = new THREE.Mesh(
    new THREE.RingGeometry(hr + 0.003 * scale, hr + 0.016 * scale, 32),
    darkWood,
  )
  rosette.position.set(0, hy, faceZ)
  instrument.add(rosette)

  const bridgeY = -0.36 * scale
  const bridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.11 * scale, 0.028 * scale, 0.01 * scale),
    darkWood,
  )
  bridge.position.set(0, bridgeY, faceZ + 0.004)
  bridge.castShadow = true
  instrument.add(bridge)

  const saddle = new THREE.Mesh(
    new THREE.BoxGeometry(0.07 * scale, 0.004 * scale, 0.005 * scale),
    metal,
  )
  saddle.position.set(0, bridgeY + 0.01 * scale, faceZ + 0.01)
  instrument.add(saddle)

  // Neck joints: heel seats into the body; nut meets the headstock
  const bodyTop = 0.05 * scale
  const neckLen = 0.42 * scale
  const neckW = 0.048 * scale
  const neckD = 0.024 * scale
  const neckZ = faceZ - depth * 0.35
  const heelY = bodyTop - 0.04 * scale
  const nutY = heelY + neckLen
  const neck = new THREE.Mesh(new THREE.BoxGeometry(neckW, neckLen, neckD), sideWood)
  neck.position.set(0, (heelY + nutY) / 2, neckZ)
  neck.castShadow = true
  instrument.add(neck)

  // Fretboard on the face, overlapping the upper bout so the joint reads solid
  const boardH = 0.007 * scale
  const boardBottom = bodyTop - 0.07 * scale
  const boardTop = nutY - 0.004 * scale
  const boardLen = boardTop - boardBottom
  const boardZ = neckZ + neckD / 2 + boardH / 2
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(0.044 * scale, boardLen, boardH),
    fretboard,
  )
  board.position.set(0, (boardBottom + boardTop) / 2, boardZ)
  instrument.add(board)

  const stringCount = scale < 0.75 ? 4 : 6
  const fretZ = boardZ + boardH / 2 + 0.0015 * scale
  for (let i = 0; i < 12; i++) {
    const t = i / 11
    const y = boardBottom + boardLen * (1 - (1 - t) ** 1.15) * 0.92
    const fret = new THREE.Mesh(
      new THREE.BoxGeometry(0.042 * scale, 0.002 * scale, 0.003 * scale),
      metal,
    )
    fret.position.set(0, y, fretZ)
    instrument.add(fret)
  }

  const nut = new THREE.Mesh(
    new THREE.BoxGeometry(0.046 * scale, 0.005 * scale, 0.008 * scale),
    metal,
  )
  nut.position.set(0, nutY, boardZ + 0.001 * scale)
  instrument.add(nut)

  // Headstock pivots from the nut so the tilt doesn't open a gap
  const head = new THREE.Group()
  head.position.set(0, nutY, neckZ)
  head.rotation.x = -0.14
  instrument.add(head)

  const headH = 0.11 * scale
  const headMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.07 * scale, headH, 0.016 * scale),
    sideWood,
  )
  headMesh.position.set(0, headH / 2 + 0.002 * scale, 0)
  headMesh.castShadow = true
  head.add(headMesh)

  const pegRows = stringCount === 4 ? 2 : 3
  for (const side of [-1, 1]) {
    for (let i = 0; i < pegRows; i++) {
      const y = (0.02 + i * 0.028) * scale
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004 * scale, 0.004 * scale, 0.02 * scale, 8),
        metal,
      )
      post.rotation.z = Math.PI / 2
      post.position.set(side * 0.03 * scale, y, 0)
      head.add(post)
    }
  }

  const span = 0.016 * scale
  const stringXs =
    stringCount === 4
      ? [-span, -span / 3, span / 3, span]
      : [-span, -span * 0.6, -span * 0.2, span * 0.2, span * 0.6, span]
  const saddleY = bridgeY + 0.01 * scale
  const strLen = nutY - saddleY
  const strMid = (nutY + saddleY) / 2
  const strZ = Math.max(faceZ, fretZ) + 0.004 * scale
  for (let i = 0; i < stringXs.length; i++) {
    const r = (0.0007 + i * 0.00012) * scale
    const str = new THREE.Mesh(new THREE.CylinderGeometry(r, r, strLen, 5), stringMat)
    str.position.set(stringXs[i], strMid, strZ)
    instrument.add(str)
  }

  // Wall hanger cradles the upper neck, just below the nut / headstock
  instrument.userData.neckGripY = nutY - 0.02 * scale
  return instrument
}

function mountInstrument(instrument, { x, y, hangerY, neckGripY }) {
  const group = new THREE.Group()
  const gripY = neckGripY ?? instrument.userData.neckGripY
  if (gripY != null) {
    instrument.position.y = hangerY - gripY
  }
  instrument.position.z = 0.1
  group.add(instrument)

  const hanger = createWallHanger()
  hanger.position.set(0, hangerY, 0)
  group.add(hanger)

  group.position.set(x, y, -(WALL_POS - 0.06))
  group.rotation.y = 0
  return group
}

/**
 * Electric bass by Zsky (CC BY 3.0) via Poly Pizza.
 * https://poly.pizza/m/ByBoHTCdYZ
 *
 * The GLB node is already upright (rotX −90°, scale 100) but authored with
 * near-black materials — only lift albedo and fit height; don't re-rotate.
 */
function createElectricBassMount() {
  const body = new THREE.Group()
  body.name = 'bassModelRoot'

  // Yoke grips the neck just below the headstock
  const hangerY = 0.42
  const mount = mountInstrument(body, {
    x: -3.8,
    y: 1.86,
    hangerY,
  })
  mount.name = 'bassMount'

  const ready = new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      BASS_URL,
      (gltf) => {
        const model = gltf.scene
        model.name = 'bassModel'

        model.traverse((child) => {
          if (!child.isMesh) return
          child.castShadow = true
          child.receiveShadow = true
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          for (const m of mats) {
            if (!m) continue
            if (m.map) m.map.colorSpace = THREE.SRGBColorSpace

            const name = (m.name || '').toLowerCase()
            if (name.includes('wood2')) {
              m.color.set(0xb85a28) // body
            } else if (name.includes('wood1')) {
              m.color.set(0x8a4a22) // neck
            } else if (name.includes('wood3')) {
              m.color.set(0x1a1a1c) // headstock
            } else if (name.includes('cover')) {
              m.color.set(0xd4c8b0) // pickguard
            } else if (name.includes('metal')) {
              m.color.set(0xc0c0c0)
            } else {
              m.color.r = Math.min(1, m.color.r * 8 + 0.12)
              m.color.g = Math.min(1, m.color.g * 8 + 0.08)
              m.color.b = Math.min(1, m.color.b * 8 + 0.05)
            }

            if ('metalness' in m) {
              m.metalness = name.includes('metal') ? 0.65 : 0.08
            }
            if ('roughness' in m) {
              m.roughness = name.includes('metal') ? 0.35 : 0.55
            }
            m.needsUpdate = true
          }
        })

        // Asset node already stands the bass upright — only fit + center
        model.updateMatrixWorld(true)
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        box.getSize(size)

        const targetH = 1.14
        const scale = targetH / Math.max(size.y, 0.001)
        model.scale.setScalar(scale)

        model.updateMatrixWorld(true)
        box.setFromObject(model)
        const center = new THREE.Vector3()
        box.getCenter(center)
        model.position.sub(center)

        // Align neck (just below headstock, ~80% up from bottom) with the hanger yoke
        const neckGripFromBottom = 0.8
        const gripY = -targetH / 2 + targetH * neckGripFromBottom
        model.position.y = hangerY - gripY

        body.add(model)
        resolve(mount)
      },
      undefined,
      reject,
    )
  })

  return { mount, ready }
}

/** Warm picture light above the instruments, washing the vinyl credenza below. */
function createVinylWallLight({ fillLight = true } = {}) {
  const fixture = new THREE.Group()
  fixture.name = 'vinylWallLight'

  const brass = mat(0xb8975a, { roughness: 0.35, metalness: 0.72 })
  const brassDark = mat(0x8a6e40, { roughness: 0.4, metalness: 0.65 })
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0xfff0d8,
    emissive: 0xffd9a0,
    emissiveIntensity: 0.55,
    roughness: 0.45,
    metalness: 0.05,
  })

  // Flush backplate on the −Z wall
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.02), brassDark)
  plate.position.z = 0.01
  plate.castShadow = true
  fixture.add(plate)

  // Arm out into the room
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 10), brass)
  arm.rotation.x = Math.PI / 2
  arm.position.set(0, 0, 0.09)
  arm.castShadow = true
  fixture.add(arm)

  // Hooded shade aimed downward
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.07, 0.055, 16, 1, true),
    brass,
  )
  shade.position.set(0, -0.02, 0.16)
  shade.castShadow = true
  fixture.add(shade)

  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), glowMat)
  bulb.position.set(0, -0.012, 0.16)
  fixture.add(bulb)

  // Soft fill near the fixture (skipped on low-power)
  if (fillLight) {
    const fill = new THREE.PointLight(0xffd9a0, 0.35, 2.8, 2)
    fill.position.set(0, -0.05, 0.18)
    fixture.add(fill)
  }

  // Main wash onto the credenza top
  const spot = new THREE.SpotLight(0xffe2b8, fillLight ? 2.4 : 2.8, 4.5, Math.PI / 5, 0.45, 1.4)
  spot.position.set(0, -0.04, 0.17)
  spot.castShadow = false
  fixture.add(spot)

  const target = new THREE.Object3D()
  target.position.set(0, -1.55, 0.55)
  fixture.add(target)
  spot.target = target

  return fixture
}

/**
 * Acoustic, electric bass (GLB), and ukulele hung on the back wall above the vinyl cabinet.
 */
export function createWallInstruments({ fillLight = true } = {}) {
  const group = new THREE.Group()
  group.name = 'wallInstruments'

  const { mount: bass, ready: bassReady } = createElectricBassMount()
  group.add(bass)

  const uke = mountInstrument(createAcoustic({ scale: 0.55, name: 'ukulele' }), {
    x: -3.2,
    y: 1.75,
    hangerY: 0.3,
  })
  uke.name = 'ukuleleMount'
  group.add(uke)

  const acoustic = mountInstrument(createAcoustic({ scale: 1 }), {
    x: -2.65,
    y: 1.92,
    hangerY: 0.52,
  })
  acoustic.name = 'acousticMount'
  group.add(acoustic)

  // Centered over the instrument trio / vinyl run
  const wallLight = createVinylWallLight({ fillLight })
  wallLight.position.set(-3.25, 2.58, -(WALL_POS - 0.04))
  group.add(wallLight)

  return { group, ready: bassReady }
}

/** @deprecated use createWallInstruments */
export function createGuitar() {
  return createWallInstruments().group
}
