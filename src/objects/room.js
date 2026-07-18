import * as THREE from 'three'
import { ROOM_HALF, ROOM_SIZE, WALL_POS, WALL_H } from './roomConstants.js'

function createWindow(wallMat, trimMat) {
  const windowGroup = new THREE.Group()
  windowGroup.name = 'window'

  const winW = 4.2
  const winH = 3.2
  const winY = 2.35
  const wallZ = -ROOM_HALF
  const wallH = WALL_H
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

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd8eaf5,
    transparent: true,
    opacity: 0.18,
    roughness: 0.12,
    metalness: 0.05,
    depthWrite: false,
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

/** Hardwood plank albedo + roughness for the living-room floor. */
function createWoodFloorMaps() {
  const w = 1024
  const h = 512
  const plankCount = 6
  const plankW = w / plankCount

  const color = document.createElement('canvas')
  color.width = w
  color.height = h
  const ctx = color.getContext('2d')

  const rough = document.createElement('canvas')
  rough.width = w
  rough.height = h
  const rctx = rough.getContext('2d')
  rctx.fillStyle = '#c8c8c8'
  rctx.fillRect(0, 0, w, h)

  // Warm oak / walnut mix tones
  const tones = [
    [176, 132, 88],
    [158, 118, 78],
    [168, 124, 82],
    [148, 108, 70],
    [184, 140, 96],
    [162, 120, 80],
  ]

  for (let p = 0; p < plankCount; p++) {
    const x0 = Math.floor(p * plankW)
    const x1 = Math.floor((p + 1) * plankW)
    const [br, bg, bb] = tones[p % tones.length]
    const shade = 0.92 + ((p * 17) % 7) * 0.018
    ctx.fillStyle = `rgb(${br * shade | 0},${bg * shade | 0},${bb * shade | 0})`
    ctx.fillRect(x0, 0, x1 - x0, h)

    // Longitudinal grain
    for (let i = 0; i < 90; i++) {
      const gx = x0 + 3 + Math.random() * (plankW - 6)
      const amp = 0.5 + Math.random() * 1.5
      const dark = Math.random() > 0.55
      ctx.strokeStyle = dark
        ? `rgba(70,42,22,${0.04 + Math.random() * 0.08})`
        : `rgba(255,230,190,${0.03 + Math.random() * 0.06})`
      ctx.lineWidth = 0.6 + Math.random() * 1.4
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      let x = gx
      for (let y = 0; y <= h; y += 8) {
        x += (Math.random() - 0.5) * amp
        ctx.lineTo(x, y)
      }
      ctx.stroke()

      rctx.strokeStyle = dark ? '#9a9a9a' : '#d8d8d8'
      rctx.lineWidth = 1
      rctx.beginPath()
      rctx.moveTo(gx, 0)
      x = gx
      for (let y = 0; y <= h; y += 8) {
        x += (Math.random() - 0.5) * amp
        rctx.lineTo(x, y)
      }
      rctx.stroke()
    }

    // Occasional knot
    if (p % 2 === 0) {
      const kx = x0 + plankW * (0.25 + Math.random() * 0.5)
      const ky = h * (0.15 + Math.random() * 0.7)
      const kr = 4 + Math.random() * 7
      const knot = ctx.createRadialGradient(kx, ky, 0, kx, ky, kr)
      knot.addColorStop(0, 'rgba(90,55,30,0.55)')
      knot.addColorStop(0.55, 'rgba(120,75,40,0.25)')
      knot.addColorStop(1, 'rgba(120,75,40,0)')
      ctx.fillStyle = knot
      ctx.beginPath()
      ctx.ellipse(kx, ky, kr * 0.7, kr, Math.random() * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Plank edge bevel / seam
    const seam = ctx.createLinearGradient(x0, 0, x0 + 5, 0)
    seam.addColorStop(0, 'rgba(55,35,18,0.45)')
    seam.addColorStop(1, 'rgba(55,35,18,0)')
    ctx.fillStyle = seam
    ctx.fillRect(x0, 0, 5, h)

    const seamR = ctx.createLinearGradient(x1 - 4, 0, x1, 0)
    seamR.addColorStop(0, 'rgba(55,35,18,0)')
    seamR.addColorStop(1, 'rgba(40,25,12,0.35)')
    ctx.fillStyle = seamR
    ctx.fillRect(x1 - 4, 0, 4, h)

    rctx.fillStyle = '#888888'
    rctx.fillRect(x0, 0, 2, h)
    rctx.fillRect(x1 - 2, 0, 2, h)
  }

  // Soft end-grain breaks so long runs don't look infinite
  for (let i = 0; i < 14; i++) {
    const y = ((i + 0.35) / 14) * h + (Math.random() - 0.5) * 12
    const p = i % plankCount
    const x0 = Math.floor(p * plankW) + 4
    const x1 = Math.floor((p + 1) * plankW) - 4
    ctx.strokeStyle = 'rgba(60,38,20,0.22)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(x0, y)
    ctx.lineTo(x1, y)
    ctx.stroke()
  }

  const map = new THREE.CanvasTexture(color)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 8
  map.needsUpdate = true

  const roughnessMap = new THREE.CanvasTexture(rough)
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.anisotropy = 4
  roughnessMap.needsUpdate = true

  return { map, roughnessMap }
}

export function createRoom() {
  const group = new THREE.Group()
  group.name = 'room'

  const woodMaps = createWoodFloorMaps()
  // Planks run along Z; ~0.18 m wide boards across the room
  const plankRepeatX = ROOM_SIZE / 0.18
  const plankRepeatZ = ROOM_SIZE / 2.4
  woodMaps.map.repeat.set(plankRepeatX / 6, plankRepeatZ)
  woodMaps.roughnessMap.repeat.set(plankRepeatX / 6, plankRepeatZ)

  const floorMat = new THREE.MeshStandardMaterial({
    map: woodMaps.map,
    roughnessMap: woodMaps.roughnessMap,
    roughness: 0.72,
    metalness: 0.02,
    color: 0xffffff,
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

  const ceilingMat = new THREE.MeshStandardMaterial({
    color: 0xf2f0ea,
    roughness: 0.92,
    metalness: 0,
  })
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_SIZE, ROOM_SIZE), ceilingMat)
  ceiling.name = 'ceiling'
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = WALL_H
  ceiling.receiveShadow = true
  group.add(ceiling)

  // HVAC returns — flush to the ceiling underside
  group.add(createCeilingVent(-2.4, 1.6))
  group.add(createCeilingVent(2.2, -1.8, Math.PI / 2))

  group.add(createWindow(wallMat, trimMat))

  // Left wall with bathroom doorway (aligned with bathroom.js)
  group.add(createLeftWall(wallMat, trimMat))

  // Right wall opposite the bathroom — smaller side window
  group.add(createSideWindow(wallMat, trimMat))

  // Front wall (+Z) with closed entrance door — opposite the window
  group.add(createFrontWall(wallMat, trimMat))

  group.add(createRoomBaseboards(trimMat))

  group.add(createModernDesk())

  return group
}

/** Rectangular ceiling grille with louvers, hung just under WALL_H. */
function createCeilingVent(x, z, yaw = 0) {
  const vent = new THREE.Group()
  vent.name = 'ceilingVent'
  vent.position.set(x, WALL_H - 0.012, z)
  vent.rotation.y = yaw

  const metal = new THREE.MeshStandardMaterial({
    color: 0xd8d4cc,
    roughness: 0.45,
    metalness: 0.55,
  })
  const dark = new THREE.MeshStandardMaterial({
    color: 0x3a3c3e,
    roughness: 0.7,
    metalness: 0.2,
  })

  const w = 0.55
  const d = 0.28
  const frameT = 0.018

  const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.008, d), dark)
  vent.add(back)

  // Outer frame
  const framePieces = [
    [w, frameT, 0, d / 2 - frameT / 2],
    [w, frameT, 0, -(d / 2 - frameT / 2)],
    [frameT, d - frameT * 2, w / 2 - frameT / 2, 0],
    [frameT, d - frameT * 2, -(w / 2 - frameT / 2), 0],
  ]
  for (const [fw, fd, fx, fz] of framePieces) {
    const f = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.01, fd), metal)
    f.position.set(fx, -0.006, fz)
    vent.add(f)
  }

  // Louvers across the opening
  const innerW = w - frameT * 2 - 0.01
  const slatCount = 7
  for (let i = 0; i < slatCount; i++) {
    const t = (i + 0.5) / slatCount
    const sz = -d / 2 + frameT + 0.02 + t * (d - frameT * 2 - 0.04)
    const slat = new THREE.Mesh(new THREE.BoxGeometry(innerW, 0.006, 0.016), metal)
    slat.position.set(0, -0.01, sz)
    slat.rotation.x = 0.45
    vent.add(slat)
  }

  return vent
}

/**
 * Continuous wood baseboard around the living room — under windows too,
 * with gaps only at the entry and bathroom doorways.
 */
function createRoomBaseboards(trimMat) {
  const group = new THREE.Group()
  group.name = 'baseboards'

  const h = 0.12
  const t = 0.08
  const y = h / 2
  const inset = 0.02

  // Keep in sync with createFrontWall / createLeftWall door openings
  const entryDoorX = 0.4
  const entryDoorW = 0.92
  const entryL = entryDoorX - entryDoorW / 2
  const entryR = entryDoorX + entryDoorW / 2

  const bathZ = -0.85
  const bathDoorW = 0.88
  const bathDoorZ = bathZ - 0.12
  const bathL = bathDoorZ - bathDoorW / 2
  const bathR = bathDoorZ + bathDoorW / 2

  const zWall = WALL_POS - inset
  const xWall = WALL_POS - inset

  function boardX(len, x, z) {
    if (len < 0.02) return
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, h, t), trimMat)
    b.position.set(x, y, z)
    b.castShadow = true
    b.receiveShadow = true
    group.add(b)
  }

  function boardZ(len, x, z) {
    if (len < 0.02) return
    const b = new THREE.Mesh(new THREE.BoxGeometry(t, h, len), trimMat)
    b.position.set(x, y, z)
    b.castShadow = true
    b.receiveShadow = true
    group.add(b)
  }

  // Back wall (−Z) — full run including under the main window
  boardX(ROOM_SIZE, 0, -zWall)

  // Front wall (+Z) — gap for entry door
  const frontLeftLen = entryL - (-ROOM_HALF)
  boardX(frontLeftLen, -ROOM_HALF + frontLeftLen / 2, zWall)
  const frontRightLen = ROOM_HALF - entryR
  boardX(frontRightLen, entryR + frontRightLen / 2, zWall)

  // Left wall (−X) — gap for bathroom door
  const leftSouthLen = bathL - (-ROOM_HALF)
  boardZ(leftSouthLen, -xWall, -ROOM_HALF + leftSouthLen / 2)
  const leftNorthLen = ROOM_HALF - bathR
  boardZ(leftNorthLen, -xWall, bathR + leftNorthLen / 2)

  // Right wall (+X) — full run including under the side window
  boardZ(ROOM_SIZE, xWall, 0)

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
  const wallH = WALL_H
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

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd8eaf5,
    transparent: true,
    opacity: 0.18,
    roughness: 0.12,
    metalness: 0.05,
    depthWrite: false,
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
  sky.name = 'sunsetSky'
  addParallaxLayer(sky, {
    factorY: 0.015,
    factorZ: 0.025,
    baseY: winY,
    baseZ: winZ,
  })

  // Soft fill from the side window
  const glow = new THREE.PointLight(0xffc090, 0.55, 7, 2)
  glow.castShadow = false
  glow.position.set(wallX - 0.5, winY, winZ)
  group.add(glow)

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
  const wallH = WALL_H
  const xMin = -ROOM_HALF
  const xMax = ROOM_HALF

  const doorW = 0.92
  const doorH = 2.15
  // Centered between TV (~−2.9) and kitchenette front run (~3+)
  const doorCenterX = 0.4
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
  const wallH = WALL_H
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

  return wall
}

/** Floating slab desk with black steel frame — sits under the monitor. */
function createModernDesk() {
  const desk = new THREE.Group()
  desk.name = 'desk'

  const topMat = new THREE.MeshStandardMaterial({
    color: 0xf4f2ee,
    roughness: 0.12,
    metalness: 0.55,
  })
  const edgeMat = new THREE.MeshStandardMaterial({
    color: 0xe4e2de,
    roughness: 0.18,
    metalness: 0.5,
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
