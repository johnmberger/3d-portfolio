import * as THREE from 'three'
import { ROOM_HALF, ROOM_SIZE, WALL_POS } from './roomConstants.js'

function createWindow(wallMat, trimMat) {
  const windowGroup = new THREE.Group()
  windowGroup.name = 'window'

  const winW = 4.2
  const winH = 3.2
  const winY = 2.35
  const wallZ = -ROOM_HALF
  const wallH = 5
  const wallW = ROOM_SIZE
  const frameDepth = 0.1
  const thickness = 0.1

  const sideW = (wallW - winW) / 2

  const left = new THREE.Mesh(new THREE.PlaneGeometry(sideW, wallH), wallMat)
  left.position.set(-(winW / 2 + sideW / 2), wallH / 2, wallZ)
  left.receiveShadow = true
  left.castShadow = true
  windowGroup.add(left)

  const right = new THREE.Mesh(new THREE.PlaneGeometry(sideW, wallH), wallMat)
  right.position.set(winW / 2 + sideW / 2, wallH / 2, wallZ)
  right.receiveShadow = true
  right.castShadow = true
  windowGroup.add(right)

  const topH = wallH - (winY + winH / 2)
  const top = new THREE.Mesh(new THREE.PlaneGeometry(winW, topH), wallMat)
  top.position.set(0, winY + winH / 2 + topH / 2, wallZ)
  top.receiveShadow = true
  top.castShadow = true
  windowGroup.add(top)

  const bottomH = winY - winH / 2
  const bottom = new THREE.Mesh(new THREE.PlaneGeometry(winW, bottomH), wallMat)
  bottom.position.set(0, bottomH / 2, wallZ)
  bottom.receiveShadow = true
  bottom.castShadow = true
  windowGroup.add(bottom)

  // Wood frame
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(winW + thickness * 2, thickness, frameDepth),
    trimMat,
  )
  topFrame.position.set(0, winY + winH / 2, wallZ + frameDepth / 2)
  windowGroup.add(topFrame)

  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(winW + thickness * 2, thickness * 1.4, frameDepth * 1.4),
    trimMat,
  )
  bottomFrame.position.set(0, winY - winH / 2, wallZ + frameDepth / 2 + 0.02)
  bottomFrame.castShadow = true
  windowGroup.add(bottomFrame)

  const sill = new THREE.Mesh(new THREE.BoxGeometry(winW + 0.15, 0.06, 0.28), trimMat)
  sill.position.set(0, winY - winH / 2 - 0.02, wallZ + 0.18)
  sill.castShadow = true
  sill.receiveShadow = true
  windowGroup.add(sill)

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, winH, frameDepth),
    trimMat,
  )
  leftFrame.position.set(-winW / 2, winY, wallZ + frameDepth / 2)
  windowGroup.add(leftFrame)

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(thickness, winH, frameDepth),
    trimMat,
  )
  rightFrame.position.set(winW / 2, winY, wallZ + frameDepth / 2)
  windowGroup.add(rightFrame)

  // Large 4-pane mullions
  const mullionV = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, winH - thickness, 0.06),
    trimMat,
  )
  mullionV.position.set(0, winY, wallZ + 0.04)
  windowGroup.add(mullionV)

  const mullionH = new THREE.Mesh(
    new THREE.BoxGeometry(winW - thickness, 0.05, 0.06),
    trimMat,
  )
  mullionH.position.set(0, winY, wallZ + 0.04)
  windowGroup.add(mullionH)

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8eaf5,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.75,
    thickness: 0.04,
    side: THREE.DoubleSide,
  })
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(winW - 0.08, winH - 0.08), glassMat)
  glass.position.set(0, winY, wallZ + 0.02)
  glass.name = 'glass'
  windowGroup.add(glass)

  // —— Sunset outside the glass ——
  const exterior = new THREE.Group()
  exterior.name = 'windowExterior'
  windowGroup.add(exterior)

  const parallaxLayers = []

  function addParallaxLayer(object, { factorX, factorY, baseX, baseY }) {
    object.userData.parallax = { factorX, factorY, baseX, baseY }
    object.position.x = baseX
    object.position.y = baseY
    parallaxLayers.push(object)
    exterior.add(object)
  }

  const noFog = { fog: false }

  const sunsetTex = createSunsetTexture()
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 10),
    new THREE.MeshBasicMaterial({ map: sunsetTex, ...noFog }),
  )
  sky.name = 'sunsetSky'
  sky.position.z = -8
  addParallaxLayer(sky, { factorX: 0.04, factorY: 0.02, baseX: 0, baseY: winY })

  const sunGroup = new THREE.Group()
  sunGroup.name = 'sunsetSun'
  sunGroup.position.z = -7.5
  sunGroup.add(
    new THREE.Mesh(
      new THREE.CircleGeometry(0.85, 32),
      new THREE.MeshBasicMaterial({
        color: 0xfff0c8,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        ...noFog,
      }),
    ),
  )
  sunGroup.add(
    new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, ...noFog }),
    ),
  )
  addParallaxLayer(sunGroup, {
    factorX: 0.06,
    factorY: 0.03,
    baseX: 1.1,
    baseY: winY - 0.15,
  })

  windowGroup.userData.lightPosition = new THREE.Vector3(0, winY, wallZ + 0.6)
  windowGroup.userData.parallax = {
    layers: parallaxLayers,
    origin: new THREE.Vector3(0, winY, wallZ),
  }

  return windowGroup
}

/** Shift exterior layers opposite the camera for a depth parallax feel. */
export function updateWindowParallax(room, camera) {
  for (const name of ['window', 'sideWindow']) {
    const win = room.getObjectByName(name)
    const data = win?.userData?.parallax
    if (!data) continue

    const { layers, origin, axis = 'z' } = data
    const dx = camera.position.x - origin.x
    const dy = camera.position.y - origin.y
    const dz = camera.position.z - origin.z

    for (const layer of layers) {
      const p = layer.userData.parallax
      if (axis === 'x') {
        // Side window: layers live in local space facing −X; shift on Y / Z
        layer.position.y = p.baseY - dy * p.factorY
        layer.position.z = p.baseZ - dz * (p.factorZ ?? p.factorX)
      } else {
        layer.position.x = p.baseX - dx * p.factorX
        layer.position.y = p.baseY - dy * p.factorY
      }
    }
  }
}

/** Vertical sunset gradient painted to a canvas texture. */
function createSunsetTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#2a3a6e')
  grad.addColorStop(0.35, '#c45a6a')
  grad.addColorStop(0.55, '#e87840')
  grad.addColorStop(0.72, '#f0b060')
  grad.addColorStop(0.88, '#f5d090')
  grad.addColorStop(1, '#d4a878')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 4, 256)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  return tex
}

export function createRoom() {
  const group = new THREE.Group()
  group.name = 'room'

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xb8956c,
    roughness: 0.85,
    metalness: 0.05,
  })
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe6ebe4,
    roughness: 0.95,
    metalness: 0,
  })
  // Cast shadows from both faces so living-room light can't leak through walls
  wallMat.shadowSide = THREE.DoubleSide
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x8a7355,
    roughness: 0.7,
    metalness: 0.05,
  })

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  group.add(floor)

  group.add(createWindow(wallMat, trimMat))

  // Left wall with bathroom doorway (aligned with bathroom.js)
  group.add(createLeftWall(wallMat, trimMat))

  // Right wall opposite the bathroom — smaller side window
  group.add(createSideWindow(wallMat, trimMat))

  // Front wall (+Z) with closed entrance door — opposite the window
  group.add(createFrontWall(wallMat, trimMat))

  const baseL = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.12, 0.08), trimMat)
  baseL.position.set(-3.25, 0.06, -(WALL_POS - 0.02))
  group.add(baseL)
  const baseR = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.12, 0.08), trimMat)
  baseR.position.set(3.25, 0.06, -(WALL_POS - 0.02))
  group.add(baseR)

  group.add(createModernDesk())

  return group
}

/**
 * Smaller window on the +X wall (opposite the bathroom).
 * Opening sits between the desk and the kitchenette run.
 */
function createSideWindow(wallMat, trimMat) {
  const group = new THREE.Group()
  group.name = 'sideWindow'

  const wallX = WALL_POS
  const wallH = 5
  const zMin = -ROOM_HALF
  const zMax = ROOM_HALF

  const winW = 2.6 // spans Z
  const winH = 2.35
  const winY = 2.2
  const winZ = -0.35 // between desk (~-3.5) and kitchenette (~2.5+)
  const openS = winZ - winW / 2
  const openN = winZ + winW / 2
  const frameDepth = 0.09
  const thickness = 0.08

  function wallPlane(length, height, y, z) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wallMat)
    mesh.rotation.y = -Math.PI / 2
    mesh.position.set(wallX, y, z)
    mesh.receiveShadow = true
    mesh.castShadow = true
    group.add(mesh)
    return mesh
  }

  const southLen = openS - zMin
  if (southLen > 0.02) {
    wallPlane(southLen, wallH, wallH / 2, zMin + southLen / 2)
  }
  const northLen = zMax - openN
  if (northLen > 0.02) {
    wallPlane(northLen, wallH, wallH / 2, openN + northLen / 2)
  }

  const topH = wallH - (winY + winH / 2)
  if (topH > 0.02) {
    wallPlane(winW, topH, winY + winH / 2 + topH / 2, winZ)
  }
  const bottomH = winY - winH / 2
  if (bottomH > 0.02) {
    wallPlane(winW, bottomH, bottomH / 2, winZ)
  }

  // Frame (local: thin in X, spans Z / Y)
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, thickness, winW + thickness * 2),
    trimMat,
  )
  topFrame.position.set(wallX - frameDepth / 2, winY + winH / 2, winZ)
  group.add(topFrame)

  const bottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth * 1.3, thickness * 1.35, winW + thickness * 2),
    trimMat,
  )
  bottomFrame.position.set(wallX - frameDepth / 2 - 0.01, winY - winH / 2, winZ)
  bottomFrame.castShadow = true
  group.add(bottomFrame)

  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.05, winW + 0.12),
    trimMat,
  )
  sill.position.set(wallX - 0.16, winY - winH / 2 - 0.02, winZ)
  sill.castShadow = true
  sill.receiveShadow = true
  group.add(sill)

  for (const z of [openS, openN]) {
    const side = new THREE.Mesh(
      new THREE.BoxGeometry(frameDepth, winH, thickness),
      trimMat,
    )
    side.position.set(wallX - frameDepth / 2, winY, z)
    group.add(side)
  }

  // 4-pane mullions
  const mullionV = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, winH - thickness, 0.045),
    trimMat,
  )
  mullionV.position.set(wallX - 0.04, winY, winZ)
  group.add(mullionV)

  const mullionH = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.045, winW - thickness),
    trimMat,
  )
  mullionH.position.set(wallX - 0.04, winY, winZ)
  group.add(mullionH)

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xd8eaf5,
    transparent: true,
    opacity: 0.2,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.75,
    thickness: 0.04,
    side: THREE.DoubleSide,
  })
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(winW - 0.08, winH - 0.08),
    glassMat,
  )
  glass.rotation.y = Math.PI / 2
  glass.position.set(wallX - 0.02, winY, winZ)
  glass.name = 'sideGlass'
  group.add(glass)

  // Exterior sky beyond the glass
  const exterior = new THREE.Group()
  exterior.name = 'sideWindowExterior'
  group.add(exterior)

  const parallaxLayers = []
  const noFog = { fog: false }

  function addParallaxLayer(object, { factorY, factorZ, baseY, baseZ }) {
    object.userData.parallax = { factorY, factorZ, baseY, baseZ }
    object.position.y = baseY
    object.position.z = baseZ
    parallaxLayers.push(object)
    exterior.add(object)
  }

  const sunsetTex = createSunsetTexture()
  // Sky faces the room (−X). Oversized so the frame never catches an edge.
  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 16),
    new THREE.MeshBasicMaterial({
      map: sunsetTex,
      side: THREE.DoubleSide,
      ...noFog,
    }),
  )
  sky.rotation.y = -Math.PI / 2
  sky.position.x = wallX + 3.2
  addParallaxLayer(sky, {
    factorY: 0.015,
    factorZ: 0.025,
    baseY: winY,
    baseZ: winZ,
  })

  // Soft fill from the side window
  const glow = new THREE.PointLight(0xffc090, 0.55, 7, 2)
  glow.position.set(wallX - 0.5, winY, winZ)
  group.add(glow)

  const board = (len, z) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, len), trimMat)
    b.position.set(wallX - 0.02, 0.06, z)
    group.add(b)
  }
  if (southLen > 0.02) board(southLen, zMin + southLen / 2)
  if (northLen > 0.02) board(northLen, openN + northLen / 2)
  // No baseboard across the opening (sill covers the mid)

  group.userData.parallax = {
    layers: parallaxLayers,
    origin: new THREE.Vector3(wallX, winY, winZ),
    axis: 'x',
  }

  return group
}

/**
 * Closed apartment entrance on the +Z wall (opposite the window).
 * Matches bathroom door proportions / trim language.
 */
function createFrontWall(wallMat, trimMat) {
  const wall = new THREE.Group()
  wall.name = 'frontWall'

  const wallZ = WALL_POS
  const wallH = 5
  const xMin = -ROOM_HALF
  const xMax = ROOM_HALF

  const doorW = 0.92
  const doorH = 2.15
  // Toward the right so the table / couch stay clear of the entry
  const doorCenterX = 2.1
  const openL = doorCenterX - doorW / 2
  const openR = doorCenterX + doorW / 2

  const wood = new THREE.MeshStandardMaterial({
    color: 0x6b5340,
    roughness: 0.7,
    metalness: 0.05,
  })
  const woodDark = new THREE.MeshStandardMaterial({
    color: 0x5a4434,
    roughness: 0.75,
    metalness: 0.05,
  })
  const chrome = new THREE.MeshStandardMaterial({
    color: 0xc8cdd2,
    metalness: 0.85,
    roughness: 0.25,
  })

  function wallPlane(width, height, x, y) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat)
    mesh.rotation.y = Math.PI
    mesh.position.set(x, y, wallZ)
    mesh.receiveShadow = true
    mesh.castShadow = true
    wall.add(mesh)
    return mesh
  }

  const leftW = openL - xMin
  if (leftW > 0.02) {
    wallPlane(leftW, wallH, xMin + leftW / 2, wallH / 2)
  }
  const rightW = xMax - openR
  if (rightW > 0.02) {
    wallPlane(rightW, wallH, openR + rightW / 2, wallH / 2)
  }
  const headerH = wallH - doorH
  if (headerH > 0.02) {
    wallPlane(doorW, headerH, doorCenterX, doorH + headerH / 2)
  }

  // Trim frame
  const frameD = 0.08
  const jambL = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorH, frameD), trimMat)
  jambL.position.set(openL, doorH / 2, wallZ - frameD / 2)
  wall.add(jambL)
  const jambR = new THREE.Mesh(new THREE.BoxGeometry(0.08, doorH, frameD), trimMat)
  jambR.position.set(openR, doorH / 2, wallZ - frameD / 2)
  wall.add(jambR)
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(doorW + 0.12, 0.08, frameD),
    trimMat,
  )
  lintel.position.set(doorCenterX, doorH, wallZ - frameD / 2)
  wall.add(lintel)

  // Closed door leaf (flush in the opening)
  const leaf = new THREE.Mesh(new THREE.BoxGeometry(doorW - 0.06, doorH - 0.06, 0.045), wood)
  leaf.position.set(doorCenterX, (doorH - 0.06) / 2 + 0.02, wallZ - 0.04)
  leaf.castShadow = true
  leaf.receiveShadow = true
  wall.add(leaf)

  // Two recessed panels
  for (const y of [1.45, 0.55]) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.28, 0.72, 0.02),
      woodDark,
    )
    panel.position.set(doorCenterX, y, wallZ - 0.065)
    wall.add(panel)
  }

  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), chrome)
  knob.position.set(openR - 0.14, 1.0, wallZ - 0.075)
  wall.add(knob)

  const knobPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.12, 0.01),
    chrome,
  )
  knobPlate.position.set(openR - 0.14, 1.0, wallZ - 0.055)
  wall.add(knobPlate)

  // Baseboard segments (not across the doorway)
  const board = (len, x) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.08), trimMat)
    b.position.set(x, 0.06, wallZ - 0.02)
    wall.add(b)
  }
  if (leftW > 0.02) board(leftW, xMin + leftW / 2)
  if (rightW > 0.02) board(rightW, openR + rightW / 2)

  return wall
}

/**
 * Living-room −X wall with a doorway into the bathroom.
 * Keep these numbers in sync with bathroom placement in bathroom.js
 * (bathroom is yawed 180°, so doorCenterZ is bathZ − localDoorZ).
 */
function createLeftWall(wallMat, trimMat) {
  const wall = new THREE.Group()
  wall.name = 'leftWall'

  const wallX = -WALL_POS
  const wallH = 5
  const zMin = -ROOM_HALF
  const zMax = ROOM_HALF

  // Must match createBathroom(): position.z, roomD, doorW/H; door Z mirrored by π yaw
  const bathZ = -0.85
  const bathD = 3.2
  const doorW = 0.88
  const doorH = 2.1
  const doorCenterZ = bathZ - 0.12
  const openL = doorCenterZ - doorW / 2
  const openR = doorCenterZ + doorW / 2
  const bathSouth = bathZ - bathD / 2
  const bathNorth = bathZ + bathD / 2

  function wallPlane(length, height, y, z) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wallMat)
    mesh.rotation.y = Math.PI / 2
    mesh.position.set(wallX, y, z)
    mesh.receiveShadow = true
    mesh.castShadow = true
    wall.add(mesh)
    return mesh
  }

  const southLen = bathSouth - zMin
  if (southLen > 0.02) {
    wallPlane(southLen, wallH, wallH / 2, zMin + southLen / 2)
  }

  const northLen = zMax - bathNorth
  if (northLen > 0.02) {
    wallPlane(northLen, wallH, wallH / 2, bathNorth + northLen / 2)
  }

  const leftOfDoor = openL - bathSouth
  if (leftOfDoor > 0.02) {
    wallPlane(leftOfDoor, wallH, wallH / 2, bathSouth + leftOfDoor / 2)
  }
  const rightOfDoor = bathNorth - openR
  if (rightOfDoor > 0.02) {
    wallPlane(rightOfDoor, wallH, wallH / 2, openR + rightOfDoor / 2)
  }

  const headerH = wallH - doorH
  if (headerH > 0.02) {
    wallPlane(doorW, headerH, doorH + headerH / 2, doorCenterZ)
  }

  const board = (len, z) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, len), trimMat)
    b.position.set(wallX + 0.02, 0.06, z)
    wall.add(b)
  }
  if (southLen > 0.02) board(southLen, zMin + southLen / 2)
  if (northLen > 0.02) board(northLen, bathNorth + northLen / 2)
  if (leftOfDoor > 0.02) board(leftOfDoor, bathSouth + leftOfDoor / 2)
  if (rightOfDoor > 0.02) board(rightOfDoor, openR + rightOfDoor / 2)

  return wall
}

/** Floating slab desk with black steel frame — sits under the monitor. */
function createModernDesk() {
  const desk = new THREE.Group()
  desk.name = 'desk'

  const topMat = new THREE.MeshStandardMaterial({
    color: 0x2e2924,
    roughness: 0.48,
    metalness: 0.12,
  })
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0x1f1b17,
    roughness: 0.55,
    metalness: 0.1,
  })
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e1d,
    roughness: 0.35,
    metalness: 0.75,
  })

  const cx = 0.55
  const cz = -3.5
  const surfaceY = 0.75
  const topT = 0.038
  const topW = 2.05
  const topD = 0.9

  // Main slab
  const top = new THREE.Mesh(new THREE.BoxGeometry(topW, topT, topD), topMat)
  top.position.set(cx, surfaceY - topT / 2, cz)
  top.castShadow = true
  top.receiveShadow = true
  desk.add(top)

  // Subtle front edge bevel strip
  const bevel = new THREE.Mesh(new THREE.BoxGeometry(topW, 0.012, 0.018), edgeMat)
  bevel.position.set(cx, surfaceY - topT - 0.004, cz + topD / 2 - 0.01)
  desk.add(bevel)

  // Slim recessed steel apron
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(topW - 0.16, 0.04, topD - 0.14),
    steelMat,
  )
  apron.position.set(cx, surfaceY - topT - 0.028, cz)
  desk.add(apron)

  // End frames: uprights + floor rail (modern trestle)
  const uprightH = surfaceY - topT - 0.04
  const railY = 0.04
  const frameZ = topD / 2 - 0.1
  const frameX = topW / 2 - 0.12

  for (const side of [-1, 1]) {
    const fx = cx + side * frameX

    for (const z of [-frameZ, frameZ]) {
      const upright = new THREE.Mesh(
        new THREE.BoxGeometry(0.028, uprightH, 0.028),
        steelMat,
      )
      upright.position.set(fx, uprightH / 2 + 0.01, cz + z)
      upright.castShadow = true
      desk.add(upright)
    }

    // Floor foot
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, topD - 0.14), steelMat)
    foot.position.set(fx, railY, cz)
    foot.castShadow = true
    desk.add(foot)

    // Cross brace near top of legs
    const brace = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.022, topD - 0.18),
      steelMat,
    )
    brace.position.set(fx, uprightH * 0.72, cz)
    desk.add(brace)
  }

  // Thin rear cable rail under the top
  const cableRail = new THREE.Mesh(
    new THREE.BoxGeometry(topW - 0.4, 0.016, 0.05),
    steelMat,
  )
  cableRail.position.set(cx, surfaceY - topT - 0.055, cz - topD / 2 + 0.08)
  desk.add(cableRail)

  return desk
}
