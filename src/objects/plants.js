import * as THREE from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'

const geoCache = new Map()

/**
 * Monstera leaf silhouette adapted from Delapouite / game-icons.net
 * https://game-icons.net/1x1/delapouite/monstera-leaf.html (CC BY 3.0)
 * Real fenestrations + pinnae splits.
 */
const MONSTERA_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <path fill="#2f6b3c" d="M332.9 17.37c-11.7-.1-24.2 1.23-37.5 4.13-33.1 7.21-48.6 28.49-56.2 54.09 11.2 22.86 20.1 46.01 25 71.91-9.6-6.9-19.7-1.7-22.6 5-4.3-22.4-10-42.9-17.8-62.93-48.8-34.88-83-20.9-89.6-18.76C49.64 98.12 25.54 165.7 39.84 239.1c19.32-43.4 86.56-68.7 113.56-68.6 6.9.1 47 9.5 13.6 20-54.8 17.3-98.29 48.7-116.81 86 8.78 24.5 21.34 49.1 36.89 72.4 14.42-42 40.22-89 96.72-125.1 14.5-9.3 23.8.7 12.2 13.2-53.5 57.4-75.1 104.2-81 148.6 17.4 20.3 37.2 38.9 58.5 54.7 1.6-54.4 20.3-117.7 56.3-164.6 3.7-6.6 22-2.7 15.6 9-27.9 50.9-43.2 119.9-44.5 174 25.6 15.2 52.9 26.3 80.9 31.9-15.1-35.2-18.5-80.5-6.9-120.8 5.1-17.8 20.8-8.1 17.6 4.2-10 38.8 8.6 87.5 28.1 120.6 20.7.1 41.6-3.1 62.3-10.2 11.8-4 22.7-12.3 32.7-23.8-11.3-22.8-27-44.1-46.6-57.2-7.4-5-3.2-23.6 10.2-14.8 19.1 12.6 37.6 29.7 52.8 48.7 9.8-16.8 18.2-37 25-59.4-29.7-34.7-83.3-82-128.8-101.7-9.6-4.1-8.7-21.5 7.6-16.4 47.8 14.8 98 46.2 131.1 78 3.9-19.9 6.7-40.8 8.1-61.9-39-27.6-95.5-67.2-147.1-74.8-9.5-1.4-13.6-18.6 3-17.8 58.3 2.7 109.8 23.5 145.1 50.5-.5-28.6-3.6-56.7-9.7-82.9-41.7-13.6-113.5-18.5-141.5-6.1-11.1 4.9-29.9-4.8-6.8-16.6 37.6-22.1 94.5-22.8 138.3-11-21.3-57.97-60.7-99.32-123.4-99.83z"/>
</svg>`

function applyLeafCurl(geo, { curl = 0.4, tipLift = 0.06 } = {}) {
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    pos.setZ(i, -x * x * curl + y * y * tipLift)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

function shapeToLeafGeometry(shapeOrShapes, {
  curveSegments = 20,
  curl = 0.4,
  tipLift = 0.06,
} = {}) {
  const geo = new THREE.ShapeGeometry(shapeOrShapes, curveSegments)
  geo.computeBoundingBox()
  const box = geo.boundingBox
  const size = new THREE.Vector3()
  box.getSize(size)
  const center = new THREE.Vector3()
  box.getCenter(center)

  const s = 1 / Math.max(size.y, 0.001)
  geo.translate(-center.x, -box.min.y, 0)
  geo.scale(s, s, s)

  return applyLeafCurl(geo, { curl, tipLift })
}

function geometryFromShapeBuilder(cacheKey, buildShape, options = {}) {
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey).clone()
  const shape = buildShape()
  const geo = shapeToLeafGeometry(shape, options)
  geoCache.set(cacheKey, geo)
  return geo.clone()
}

/** Game-icons SVG → ShapeGeometry, with curl. Safe against empty/null shapes. */
function geometryFromSvg(svg, cacheKey, options = {}) {
  if (geoCache.has(cacheKey)) return geoCache.get(cacheKey).clone()

  const data = new SVGLoader().parse(svg)
  const shapes = []
  for (const path of data.paths) {
    const fromPath = typeof path.toShapes === 'function'
      ? path.toShapes()
      : SVGLoader.createShapes(path)
    for (const shape of fromPath) {
      if (shape) shapes.push(shape)
    }
  }
  if (shapes.length === 0) {
    throw new Error(`SVGLoader produced no shapes for "${cacheKey}"`)
  }

  const geo = new THREE.ShapeGeometry(shapes, options.curveSegments ?? 24)
  // SVG is Y-down — flip so tip points +Y
  geo.scale(1, -1, 1)
  geo.computeBoundingBox()
  const box = geo.boundingBox
  const size = new THREE.Vector3()
  box.getSize(size)
  const center = new THREE.Vector3()
  box.getCenter(center)

  const s = 1 / Math.max(size.y, 0.001)
  geo.translate(-center.x, -box.min.y, 0)
  geo.scale(s, s, s)

  applyLeafCurl(geo, {
    curl: options.curl ?? 0.55,
    tipLift: options.tipLift ?? 0.08,
  })

  geoCache.set(cacheKey, geo)
  return geo.clone()
}

/** Violin / guitar body — Ficus lyrata */
function buildFiddleLeafShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(-0.04, 0.05, -0.08, 0.12, -0.1, 0.22)
  s.bezierCurveTo(-0.18, 0.28, -0.28, 0.38, -0.3, 0.52)
  s.bezierCurveTo(-0.32, 0.68, -0.22, 0.82, -0.12, 0.9)
  s.bezierCurveTo(-0.06, 0.96, -0.02, 1.0, 0, 1.02)
  s.bezierCurveTo(0.02, 1.0, 0.06, 0.96, 0.12, 0.9)
  s.bezierCurveTo(0.22, 0.82, 0.32, 0.68, 0.3, 0.52)
  s.bezierCurveTo(0.28, 0.38, 0.18, 0.28, 0.1, 0.22)
  s.bezierCurveTo(0.08, 0.12, 0.04, 0.05, 0, 0)
  return s
}

/** Tall sword blade — Sansevieria / snake plant */
function buildSnakeLeafShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(-0.06, 0.02, -0.09, 0.08, -0.08, 0.2)
  s.bezierCurveTo(-0.1, 0.45, -0.09, 0.7, -0.05, 0.9)
  s.bezierCurveTo(-0.03, 0.97, -0.01, 1.01, 0, 1.02)
  s.bezierCurveTo(0.01, 1.01, 0.03, 0.97, 0.05, 0.9)
  s.bezierCurveTo(0.09, 0.7, 0.1, 0.45, 0.08, 0.2)
  s.bezierCurveTo(0.09, 0.08, 0.06, 0.02, 0, 0)
  return s
}

/** Long paddle — Strelitzia / bird of paradise */
function buildBirdLeafShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(-0.05, 0.04, -0.12, 0.15, -0.16, 0.32)
  s.bezierCurveTo(-0.22, 0.5, -0.24, 0.7, -0.18, 0.88)
  s.bezierCurveTo(-0.12, 0.98, -0.04, 1.04, 0, 1.05)
  s.bezierCurveTo(0.04, 1.04, 0.12, 0.98, 0.18, 0.88)
  s.bezierCurveTo(0.24, 0.7, 0.22, 0.5, 0.16, 0.32)
  s.bezierCurveTo(0.12, 0.15, 0.05, 0.04, 0, 0)
  return s
}

function createMonsteraLeafGeometry() {
  return geometryFromSvg(MONSTERA_SVG, 'monstera', {
    curl: 0.55,
    tipLift: 0.08,
    curveSegments: 24,
  })
}

function createFiddleLeafGeometry() {
  return geometryFromShapeBuilder('fiddle', buildFiddleLeafShape, {
    curl: 0.35,
    tipLift: 0.04,
    curveSegments: 28,
  })
}

function createSnakeLeafGeometry() {
  return geometryFromShapeBuilder('snake', buildSnakeLeafShape, {
    curl: 0.15,
    tipLift: 0.02,
    curveSegments: 16,
  })
}

function createBirdLeafGeometry() {
  return geometryFromShapeBuilder('bird', buildBirdLeafShape, {
    curl: 0.45,
    tipLift: 0.1,
    curveSegments: 24,
  })
}

function createPot({ potColor, potScale = 1, tall = false }) {
  const group = new THREE.Group()
  const potMat = new THREE.MeshStandardMaterial({
    color: potColor,
    roughness: 0.8,
    metalness: 0.05,
  })
  const soilMat = new THREE.MeshStandardMaterial({ color: 0x3a2f24, roughness: 1 })

  const h = (tall ? 0.48 : 0.38) * potScale
  const topR = 0.28 * potScale
  const botR = 0.22 * potScale

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(topR, botR, h, 20), potMat)
  pot.position.y = h / 2
  pot.castShadow = true
  pot.receiveShadow = true
  group.add(pot)

  const rim = new THREE.Mesh(new THREE.TorusGeometry(topR, 0.02 * potScale, 8, 24), potMat)
  rim.rotation.x = Math.PI / 2
  rim.position.y = h
  group.add(rim)

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(topR * 0.86, topR * 0.86, 0.04, 16),
    soilMat,
  )
  soil.position.y = h
  group.add(soil)

  group.userData.soilY = h
  return group
}

function createBladeLeaf(geometryFn, leafMat, veinMat, scale, bend = 0.1, {
  lateralVeins = false,
} = {}) {
  const leaf = new THREE.Group()
  const blade = new THREE.Mesh(geometryFn(), leafMat)
  blade.scale.setScalar(scale)
  blade.castShadow = true
  blade.receiveShadow = true
  blade.rotation.x = -bend
  leaf.add(blade)

  if (veinMat) {
    const midribLen = 0.9 * scale
    const midrib = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005 * scale, 0.009 * scale, midribLen, 6),
      veinMat,
    )
    midrib.position.set(0, midribLen / 2, 0.01 * scale)
    midrib.rotation.x = -bend
    leaf.add(midrib)

    if (lateralVeins) {
      for (const [side, y, len, ang] of [
        [-1, 0.32, 0.2, 0.55],
        [1, 0.32, 0.2, -0.55],
        [-1, 0.52, 0.26, 0.7],
        [1, 0.52, 0.26, -0.7],
        [-1, 0.7, 0.18, 0.85],
        [1, 0.7, 0.18, -0.85],
      ]) {
        const vein = new THREE.Mesh(
          new THREE.CylinderGeometry(0.003 * scale, 0.004 * scale, len * scale, 4),
          veinMat,
        )
        vein.position.set(side * 0.055 * scale, y * scale, 0.008 * scale)
        vein.rotation.z = ang
        vein.rotation.x = -bend
        leaf.add(vein)
      }
    }
  }

  return leaf
}

function createShoot(leafMat, veinMat, stemMat, geometryFn, {
  leafScale,
  petioleLen,
  bend,
  petioleThin = 0.009,
  petioleThick = 0.014,
  lateralVeins = false,
}) {
  const shoot = new THREE.Group()

  const petiole = new THREE.Mesh(
    new THREE.CylinderGeometry(petioleThin, petioleThick, petioleLen, 8),
    stemMat,
  )
  petiole.position.y = petioleLen / 2
  petiole.castShadow = true
  shoot.add(petiole)

  const joint = new THREE.Mesh(
    new THREE.SphereGeometry(petioleThick * 0.9, 8, 8),
    stemMat,
  )
  joint.position.y = petioleLen
  shoot.add(joint)

  const leaf = createBladeLeaf(geometryFn, leafMat, veinMat, leafScale, bend, {
    lateralVeins,
  })
  leaf.position.y = petioleLen
  shoot.add(leaf)

  return shoot
}

function leafMaterials(leafColor, leafColorAlt, veinColor = 0x1e4a28) {
  const leafMat = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.72,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  const leafMatAlt = new THREE.MeshStandardMaterial({
    color: leafColorAlt,
    roughness: 0.72,
    metalness: 0,
    side: THREE.DoubleSide,
  })
  const veinMat = new THREE.MeshStandardMaterial({
    color: veinColor,
    roughness: 0.85,
  })
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x3d5c38,
    roughness: 0.85,
  })
  return { leafMat, leafMatAlt, veinMat, stemMat }
}

// —— Monstera ——

function createMonstera({
  potColor = 0xc4a484,
  leafColor = 0x2f6b3c,
  leafColorAlt = 0x3a7a45,
  height = 1.4,
  leafCount = 7,
  potScale = 1,
} = {}) {
  const plant = new THREE.Group()
  plant.name = 'monstera'
  const pot = createPot({ potColor, potScale })
  plant.add(pot)

  const { leafMat, leafMatAlt, veinMat, stemMat } = leafMaterials(leafColor, leafColorAlt)
  const stemBaseY = pot.userData.soilY

  const mainStem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, height, 8),
    stemMat,
  )
  mainStem.position.y = stemBaseY + height / 2
  mainStem.castShadow = true
  plant.add(mainStem)

  for (let i = 0; i < 4; i++) {
    const nub = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), stemMat)
    nub.position.set(
      Math.sin(i * 1.7) * 0.04,
      stemBaseY + height * (0.25 + i * 0.18),
      Math.cos(i * 1.7) * 0.04,
    )
    plant.add(nub)
  }

  const foliage = new THREE.Group()
  foliage.name = 'foliage'
  const yAxis = new THREE.Vector3(0, 1, 0)
  const shootDir = new THREE.Vector3()

  for (let i = 0; i < leafCount; i++) {
    const t = i / Math.max(leafCount - 1, 1)
    const shoot = createShoot(
      i % 2 === 0 ? leafMat : leafMatAlt,
      veinMat,
      stemMat,
      createMonsteraLeafGeometry,
      {
        leafScale: 0.42 + t * 0.48 + (i % 2) * 0.06,
        petioleLen: 0.22 + t * 0.28,
        bend: 0.08 + (i % 3) * 0.04,
        lateralVeins: true,
      },
    )

    const angle = t * Math.PI * 1.65 + (i % 2) * 0.95 - 0.35
    const lean = 0.55 + t * 0.35
    const attachY = stemBaseY + height * (0.12 + t * 0.78)
    shoot.position.set(Math.cos(angle) * 0.045, attachY, Math.sin(angle) * 0.045)
    shootDir.set(Math.cos(angle) * Math.sin(lean), Math.cos(lean), Math.sin(angle) * Math.sin(lean))
    shoot.quaternion.setFromUnitVectors(yAxis, shootDir)
    shoot.rotateY((i % 2 === 0 ? -0.15 : 0.15) + t * 0.1)
    foliage.add(shoot)
  }

  plant.add(foliage)
  return plant
}

// —— Snake plant (Sansevieria) ——

function createSnakePlant({
  potColor = 0xcfc6b8,
  leafCount = 7,
  potScale = 1,
  height = 0.95,
} = {}) {
  const plant = new THREE.Group()
  plant.name = 'snakePlant'
  const pot = createPot({ potColor, potScale, tall: true })
  plant.add(pot)

  const green = new THREE.MeshStandardMaterial({
    color: 0x2d5a38,
    roughness: 0.65,
    side: THREE.DoubleSide,
  })
  const greenAlt = new THREE.MeshStandardMaterial({
    color: 0x3f6b45,
    roughness: 0.65,
    side: THREE.DoubleSide,
  })
  const margin = new THREE.MeshStandardMaterial({
    color: 0xc9b86a,
    roughness: 0.7,
    side: THREE.DoubleSide,
  })

  const foliage = new THREE.Group()
  foliage.name = 'foliage'
  const soilY = pot.userData.soilY

  for (let i = 0; i < leafCount; i++) {
    const t = i / leafCount
    const angle = t * Math.PI * 2 + 0.2
    const lean = 0.08 + (i % 3) * 0.04
    const leafH = height * (0.7 + (i % 4) * 0.1)
    const mat = i % 2 === 0 ? green : greenAlt

    const blade = new THREE.Mesh(createSnakeLeafGeometry(), mat)
    blade.scale.set(0.55 + (i % 3) * 0.08, leafH, 1)
    blade.castShadow = true
    blade.receiveShadow = true

    // Yellow margin strip (read as variegation at a glance)
    const edge = new THREE.Mesh(createSnakeLeafGeometry(), margin)
    edge.scale.set(0.58 + (i % 3) * 0.08, leafH * 0.98, 0.92)
    edge.position.z = -0.002

    const shoot = new THREE.Group()
    shoot.add(blade, edge)
    shoot.position.set(Math.cos(angle) * 0.08, soilY, Math.sin(angle) * 0.08)
    shoot.rotation.order = 'YXZ'
    shoot.rotation.y = angle
    shoot.rotation.x = lean
    shoot.rotation.z = (i % 2 === 0 ? -0.05 : 0.05)
    foliage.add(shoot)
  }

  plant.add(foliage)
  return plant
}

// —— Fiddle-leaf fig ——

function createFiddleLeafFig({
  potColor = 0xb08968,
  leafColor = 0x1f4d2e,
  leafColorAlt = 0x2f6b3c,
  height = 1.35,
  leafCount = 6,
  potScale = 1.1,
} = {}) {
  const plant = new THREE.Group()
  plant.name = 'fiddleLeaf'
  const pot = createPot({ potColor, potScale })
  plant.add(pot)

  const { leafMat, leafMatAlt, veinMat, stemMat } = leafMaterials(
    leafColor,
    leafColorAlt,
    0x163820,
  )
  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x5a4634,
    roughness: 0.75,
  })

  const soilY = pot.userData.soilY
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.04, height, 8),
    woodMat,
  )
  trunk.position.y = soilY + height / 2
  trunk.castShadow = true
  plant.add(trunk)

  const foliage = new THREE.Group()
  foliage.name = 'foliage'
  const yAxis = new THREE.Vector3(0, 1, 0)
  const shootDir = new THREE.Vector3()

  for (let i = 0; i < leafCount; i++) {
    const t = i / Math.max(leafCount - 1, 1)
    const shoot = createShoot(
      i % 2 === 0 ? leafMat : leafMatAlt,
      veinMat,
      stemMat,
      createFiddleLeafGeometry,
      {
        leafScale: 0.55 + t * 0.35,
        petioleLen: 0.12 + t * 0.1,
        bend: 0.12 + (i % 2) * 0.05,
        petioleThin: 0.008,
        petioleThick: 0.012,
      },
    )

    const angle = t * Math.PI * 1.8 + i * 0.7
    const lean = 0.7 + t * 0.25
    const attachY = soilY + height * (0.45 + t * 0.5)
    shoot.position.set(Math.cos(angle) * 0.03, attachY, Math.sin(angle) * 0.03)
    shootDir.set(Math.cos(angle) * Math.sin(lean), Math.cos(lean), Math.sin(angle) * Math.sin(lean))
    shoot.quaternion.setFromUnitVectors(yAxis, shootDir)
    foliage.add(shoot)
  }

  plant.add(foliage)
  return plant
}

// —— Bird of paradise ——

function createBirdOfParadise({
  potColor = 0xd4b896,
  leafColor = 0x2a6338,
  leafColorAlt = 0x3d7a48,
  height = 1.2,
  leafCount = 5,
  potScale = 1.2,
} = {}) {
  const plant = new THREE.Group()
  plant.name = 'birdOfParadise'
  const pot = createPot({ potColor, potScale, tall: true })
  plant.add(pot)

  const { leafMat, leafMatAlt, veinMat, stemMat } = leafMaterials(leafColor, leafColorAlt)
  const soilY = pot.userData.soilY

  const foliage = new THREE.Group()
  foliage.name = 'foliage'
  const yAxis = new THREE.Vector3(0, 1, 0)
  const shootDir = new THREE.Vector3()

  for (let i = 0; i < leafCount; i++) {
    const t = i / Math.max(leafCount - 1, 1)
    const petioleLen = 0.45 + t * 0.55
    const shoot = createShoot(
      i % 2 === 0 ? leafMat : leafMatAlt,
      veinMat,
      stemMat,
      createBirdLeafGeometry,
      {
        leafScale: 0.7 + t * 0.35,
        petioleLen,
        bend: 0.2 + (i % 2) * 0.08,
        petioleThin: 0.012,
        petioleThick: 0.02,
      },
    )

    const angle = (i / leafCount) * Math.PI * 2 + 0.3
    const lean = 0.35 + t * 0.2
    shoot.position.set(Math.cos(angle) * 0.06, soilY, Math.sin(angle) * 0.06)
    shootDir.set(Math.cos(angle) * Math.sin(lean), Math.cos(lean), Math.sin(angle) * Math.sin(lean))
    shoot.quaternion.setFromUnitVectors(yAxis, shootDir)
    // Fan the leaves open
    shoot.rotateY((i - leafCount / 2) * 0.15)
    foliage.add(shoot)
  }

  // Unused height kept for API consistency with other plants
  void height
  plant.add(foliage)
  return plant
}

function createHangingPlanter({
  potColor = 0xc4a484,
  leafColor = 0x2f6b3c,
  leafColorAlt = 0x4a8a55,
  trailLength = 0.55,
  cordLength = 0.45,
} = {}) {
  const plant = new THREE.Group()
  plant.name = 'hangingPlant'

  const potMat = new THREE.MeshStandardMaterial({
    color: potColor,
    roughness: 0.8,
  })
  const cordMat = new THREE.MeshStandardMaterial({
    color: 0xd4c4a8,
    roughness: 0.9,
  })
  const leafMat = new THREE.MeshStandardMaterial({
    color: leafColor,
    roughness: 0.75,
    side: THREE.DoubleSide,
  })
  const leafMatAlt = new THREE.MeshStandardMaterial({
    color: leafColorAlt,
    roughness: 0.75,
    side: THREE.DoubleSide,
  })

  // Ceiling hook
  const hook = new THREE.Mesh(
    new THREE.TorusGeometry(0.025, 0.006, 8, 16),
    new THREE.MeshStandardMaterial({
      color: 0x8a8e94,
      metalness: 0.7,
      roughness: 0.35,
    }),
  )
  hook.rotation.x = Math.PI / 2
  hook.position.y = 0
  plant.add(hook)

  // Three cords to the rim
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, cordLength, 5),
      cordMat,
    )
    cord.position.set(
      Math.cos(a) * 0.06,
      -cordLength / 2,
      Math.sin(a) * 0.06,
    )
    // Slight splay
    cord.rotation.z = Math.cos(a) * 0.12
    cord.rotation.x = Math.sin(a) * 0.12
    plant.add(cord)
  }

  const potY = -cordLength - 0.04
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.08, 0.12, 14),
    potMat,
  )
  pot.position.y = potY
  pot.castShadow = true
  plant.add(pot)

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.012, 8, 20),
    potMat,
  )
  rim.rotation.x = Math.PI / 2
  rim.position.y = potY + 0.055
  plant.add(rim)

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.02, 12),
    new THREE.MeshStandardMaterial({ color: 0x3a2f24, roughness: 1 }),
  )
  soil.position.y = potY + 0.05
  plant.add(soil)

  // Trailing foliage
  const foliage = new THREE.Group()
  foliage.name = 'foliage'
  foliage.position.y = potY

  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.2
    const trail = new THREE.Group()
    const segments = 4 + (i % 3)
    for (let s = 0; s < segments; s++) {
      const leaf = new THREE.Mesh(
        new THREE.PlaneGeometry(0.07 + (s % 2) * 0.02, 0.1),
        i % 2 === 0 ? leafMat : leafMatAlt,
      )
      leaf.position.set(
        Math.cos(a) * (0.05 + s * 0.015),
        -0.08 - s * (trailLength / segments),
        Math.sin(a) * (0.05 + s * 0.015),
      )
      leaf.rotation.y = a
      leaf.rotation.x = 0.4 + s * 0.15
      leaf.rotation.z = (i % 2 === 0 ? -0.2 : 0.2) + s * 0.05
      leaf.castShadow = true
      trail.add(leaf)
    }
    foliage.add(trail)
  }

  // A few upright leaves from the pot
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const upright = new THREE.Mesh(
      new THREE.PlaneGeometry(0.08, 0.16),
      i % 2 === 0 ? leafMat : leafMatAlt,
    )
    upright.position.set(Math.cos(a) * 0.04, 0.12, Math.sin(a) * 0.04)
    upright.rotation.y = a
    upright.rotation.x = -0.35
    upright.castShadow = true
    foliage.add(upright)
  }

  plant.add(foliage)
  return plant
}

export function createPlants() {
  const group = new THREE.Group()
  group.name = 'plants'

  // Corner between the desk and dining table (back-right)
  const monstera = createMonstera({
    potColor: 0xc4a484,
    height: 1.55,
    leafCount: 8,
    potScale: 1.15,
  })
  monstera.position.set(2.2, 0, -2.35)
  monstera.rotation.y = -0.55
  group.add(monstera)

  const bird = createBirdOfParadise({
    potColor: 0xd4b896,
    leafCount: 5,
    potScale: 1.15,
  })
  bird.position.set(1.95, 0, -3.7)
  bird.rotation.y = -0.45
  group.add(bird)

  // On the desk surface
  const deskSnake = createSnakePlant({
    potColor: 0x8f6b52,
    leafCount: 5,
    potScale: 0.45,
    height: 0.42,
  })
  deskSnake.position.set(1.25, 0.75, -3.45)
  deskSnake.rotation.y = 0.6
  group.add(deskSnake)

  // Near the turntable / vinyl
  const fiddle = createFiddleLeafFig({
    potColor: 0xb08968,
    height: 1.35,
    leafCount: 7,
    potScale: 1.05,
  })
  fiddle.position.set(-3.6, 0, -2.15)
  fiddle.rotation.y = 0.55
  group.add(fiddle)

  // By the kitchenette / entry — clear of the longer side run
  const snake = createSnakePlant({
    potColor: 0xcfc6b8,
    leafCount: 8,
    potScale: 0.95,
    height: 1.05,
  })
  snake.position.set(3.0, 0, 1.35)
  snake.rotation.y = -0.4
  group.add(snake)

  // TV nook — near the chaise tip against the wall
  const miniMonstera = createMonstera({
    potColor: 0xa67c52,
    height: 0.85,
    leafCount: 5,
    potScale: 0.75,
  })
  miniMonstera.position.set(-3.85, 0, 2.95)
  miniMonstera.rotation.y = 1.1
  group.add(miniMonstera)

  // Hanging planters — suspended near the window and lounge corners
  const hangA = createHangingPlanter({
    potColor: 0xb08968,
    trailLength: 0.65,
    cordLength: 0.5,
  })
  hangA.position.set(-2.15, 2.85, -4.15)
  group.add(hangA)

  const hangB = createHangingPlanter({
    potColor: 0xc4a484,
    leafColor: 0x3d7a48,
    leafColorAlt: 0x2a6338,
    trailLength: 0.5,
    cordLength: 0.4,
  })
  hangB.position.set(2.0, 2.9, -4.15)
  hangB.rotation.y = 0.6
  group.add(hangB)

  const hangC = createHangingPlanter({
    potColor: 0x8f6b52,
    leafColor: 0x4a6b3c,
    leafColorAlt: 0x3a5a32,
    trailLength: 0.7,
    cordLength: 0.55,
  })
  hangC.position.set(-3.9, 2.75, 0.35)
  hangC.rotation.y = 1.1
  group.add(hangC)

  return group
}

export function updatePlants(plants, elapsed) {
  plants.traverse((child) => {
    if (child.name === 'foliage') {
      child.rotation.z = Math.sin(elapsed * 0.7 + child.id) * 0.025
      child.rotation.x = Math.cos(elapsed * 0.5 + child.id) * 0.015
    }
  })
}
