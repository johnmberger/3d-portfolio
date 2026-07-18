import * as THREE from 'three'
import { WALL_H } from './roomConstants.js'

function markInteractive(mesh) {
  mesh.userData.interactive = 'bathroom'
  return mesh
}

/** Structural meshes stay clickable but don't get the hover glow. */
function markStructure(mesh) {
  mesh.userData.interactive = 'bathroom'
  mesh.userData.skipHover = true
  return mesh
}

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    ...props,
  })
}

function wallBox(w, h, d, material) {
  const mesh = markStructure(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material))
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * Two-piece toilet roughly based on TOTO Drake proportions
 * (depth ≈ 0.71m, width ≈ 0.49m, seat ≈ 0.40m, tank top ≈ 0.72m).
 * https://www.dimensions.com/element/toto-drake-two-piece-toilet
 */
function createToilet() {
  const toilet = new THREE.Group()
  toilet.name = 'toilet'

  const china = mat(0xf6f4ef, { roughness: 0.22, metalness: 0.04 })
  const seatMat = mat(0xe9e5dc, { roughness: 0.4 })
  const chrome = mat(0xc8cdd2, { metalness: 0.88, roughness: 0.2 })

  // Lathed bowl + concealed trapway — side silhouette, then elongated on Z
  const profile = [
    [0.01, 0.01],
    [0.155, 0.015],
    [0.18, 0.04],
    [0.19, 0.12],
    [0.185, 0.26],
    [0.195, 0.34],
    [0.21, 0.385],
    [0.205, 0.4],
    [0.155, 0.405],
    [0.13, 0.39],
    [0.115, 0.3],
    [0.09, 0.23],
    [0.05, 0.19],
    [0.015, 0.17],
  ].map(([x, y]) => new THREE.Vector2(x, y))

  const body = markInteractive(
    new THREE.Mesh(new THREE.LatheGeometry(profile, 48), china),
  )
  body.scale.set(1, 1, 1.32)
  body.position.set(0, 0, 0.1)
  body.castShadow = true
  body.receiveShadow = true
  toilet.add(body)

  // Water (mostly hidden under the closed lid)
  const water = markInteractive(
    new THREE.Mesh(
      new THREE.CircleGeometry(0.1, 24),
      mat(0x5a8a96, { roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.45 }),
    ),
  )
  water.scale.set(1, 1, 1.25)
  water.rotation.x = -Math.PI / 2
  water.position.set(0, 0.24, 0.14)
  toilet.add(water)

  // Closed seat — flat elongated oval
  const seat = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.022, 32), seatMat),
  )
  seat.scale.set(1.05, 1, 1.45)
  seat.position.set(0, 0.415, 0.12)
  seat.castShadow = true
  toilet.add(seat)

  // Lid — slightly larger oval, rests on seat
  const lid = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.028, 32), seatMat),
  )
  lid.scale.set(1.08, 1, 1.48)
  lid.position.set(0, 0.44, 0.1)
  lid.castShadow = true
  toilet.add(lid)

  // Hinge / seat mounting strip
  const hinge = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.025, 0.045), seatMat),
  )
  hinge.position.set(0, 0.425, -0.08)
  toilet.add(hinge)

  // Tank (separate piece sitting behind the bowl)
  const tankW = 0.46
  const tankH = 0.36
  const tankD = 0.17
  const tank = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(tankW, tankH, tankD), china),
  )
  tank.position.set(0, 0.4 + tankH / 2, -0.22)
  tank.castShadow = true
  toilet.add(tank)

  const tankLid = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(tankW + 0.02, 0.03, tankD + 0.02), china),
  )
  tankLid.position.set(0, 0.4 + tankH + 0.015, -0.22)
  tankLid.castShadow = true
  toilet.add(tankLid)

  // Bowl-to-tank shelf / coupling
  const coupling = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.14), china),
  )
  coupling.position.set(0, 0.38, -0.08)
  toilet.add(coupling)

  // Classic side trip lever
  const leverArm = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.012, 0.018), chrome),
  )
  leverArm.position.set(-tankW / 2 - 0.02, 0.58, -0.22)
  toilet.add(leverArm)

  const leverKnob = markInteractive(
    new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), chrome),
  )
  leverKnob.position.set(-tankW / 2 - 0.06, 0.58, -0.22)
  toilet.add(leverKnob)

  const leverBase = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 10), chrome),
  )
  leverBase.rotation.z = Math.PI / 2
  leverBase.position.set(-tankW / 2 + 0.01, 0.58, -0.22)
  toilet.add(leverBase)

  // Floor bolt caps
  for (const x of [-0.1, 0.1]) {
    const cap = markInteractive(
      new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 12), china),
    )
    cap.position.set(x, 0.025, -0.02)
    toilet.add(cap)
  }

  // Supply shutoff + line
  const valve = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.035, 10), chrome),
  )
  valve.rotation.z = Math.PI / 2
  valve.position.set(0.18, 0.1, -0.2)
  toilet.add(valve)

  const supply = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.28, 8), chrome),
  )
  supply.position.set(0.18, 0.25, -0.2)
  toilet.add(supply)

  return toilet
}

function createSink() {
  const sink = new THREE.Group()
  sink.name = 'sink'

  const porcelain = mat(0xf4f1ea, { roughness: 0.35 })
  const wood = mat(0x6b4a32, { roughness: 0.75 })
  const chrome = mat(0xc8cdd2, { metalness: 0.85, roughness: 0.25 })

  const vanity = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.42), wood),
  )
  vanity.position.set(0, 0.275, 0)
  vanity.castShadow = true
  vanity.receiveShadow = true
  sink.add(vanity)

  const door = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.02), mat(0x7a5638, { roughness: 0.7 })),
  )
  door.position.set(-0.15, 0.26, 0.22)
  sink.add(door)

  const door2 = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.02), mat(0x7a5638, { roughness: 0.7 })),
  )
  door2.position.set(0.15, 0.26, 0.22)
  sink.add(door2)

  for (const x of [-0.15, 0.15]) {
    const knob = markInteractive(
      new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), chrome),
    )
    knob.position.set(x, 0.26, 0.24)
    sink.add(knob)
  }

  const counter = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.04, 0.46), porcelain),
  )
  counter.position.set(0, 0.57, 0)
  counter.castShadow = true
  sink.add(counter)

  const basin = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.08, 24), porcelain),
  )
  basin.position.set(0, 0.52, 0.02)
  sink.add(basin)

  const spoutBase = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.06, 12), chrome),
  )
  spoutBase.position.set(0, 0.62, -0.1)
  sink.add(spoutBase)

  const spout = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 10), chrome),
  )
  spout.position.set(0, 0.68, -0.04)
  spout.rotation.x = Math.PI / 2.6
  sink.add(spout)

  for (const x of [-0.08, 0.08]) {
    const handle = markInteractive(
      new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 10), chrome),
    )
    handle.position.set(x, 0.62, -0.1)
    sink.add(handle)
  }

  return sink
}

function createMirror() {
  const mirror = new THREE.Group()
  mirror.name = 'bathroomMirror'

  const frameMat = mat(0x3d2e22, { roughness: 0.6, metalness: 0.1 })
  const mirrorW = 0.85
  const mirrorH = 1.05
  const frameT = 0.035
  const depth = 0.035

  const frame = markInteractive(
    new THREE.Mesh(
      new THREE.BoxGeometry(mirrorW + frameT * 2, mirrorH + frameT * 2, depth),
      frameMat,
    ),
  )
  frame.castShadow = true
  mirror.add(frame)

  const glass = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(mirrorW, mirrorH),
      new THREE.MeshStandardMaterial({
        color: 0x1a2228,
        emissive: 0x152028,
        emissiveIntensity: 0.2,
        roughness: 0.15,
        metalness: 0.4,
      }),
    ),
  )
  glass.position.z = depth / 2 + 0.001
  glass.name = 'screen'
  mirror.add(glass)

  const hit = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(mirrorW, mirrorH),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    ),
  )
  hit.position.z = depth / 2 + 0.008
  hit.name = 'screenHit'
  mirror.add(hit)

  mirror.userData.screenSize = { width: mirrorW, height: mirrorH, fill: 0.94 }
  return mirror
}

function createOpenDoor() {
  const door = new THREE.Group()
  door.name = 'bathroomDoor'

  const wood = mat(0x6b5340, { roughness: 0.7 })
  const chrome = mat(0xc8cdd2, { metalness: 0.85, roughness: 0.25 })
  const hingeMat = mat(0x9a9080, { metalness: 0.7, roughness: 0.35 })

  // Pivot at local origin — sits on the jamb. Leaf extends +X from the hinge edge.
  const leafW = 0.8
  const leaf = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(leafW, 2.05, 0.045), wood),
  )
  leaf.position.set(leafW / 2 + 0.01, 1.05, 0)
  leaf.castShadow = true
  door.add(leaf)

  const panel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.7, 0.02), mat(0x5a4434, { roughness: 0.75 })),
  )
  panel.position.set(leafW / 2 + 0.01, 1.2, 0.03)
  door.add(panel)

  const knob = markInteractive(
    new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), chrome),
  )
  knob.position.set(leafW - 0.1, 1.0, 0.04)
  door.add(knob)

  const knobBack = markInteractive(
    new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), chrome),
  )
  knobBack.position.set(leafW - 0.1, 1.0, -0.04)
  door.add(knobBack)

  // Hinge barrels along the pivot (connects visually to the frame)
  for (const y of [0.35, 1.05, 1.75]) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 0.1, 8),
      hingeMat,
    )
    barrel.position.set(0, y, 0)
    door.add(barrel)

    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.12, 0.01),
      hingeMat,
    )
    plate.position.set(0.025, y, 0)
    door.add(plate)
  }

  return door
}

function createShower() {
  const shower = new THREE.Group()
  shower.name = 'shower'

  const trayMat = mat(0xe8e4dc, { roughness: 0.4, metalness: 0.05 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xd8eef5,
    transparent: true,
    opacity: 0.18,
    roughness: 0.12,
    metalness: 0.05,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const chrome = mat(0xc8cdd2, { metalness: 0.85, roughness: 0.25 })
  const tile = mat(0xd0d8d4, { roughness: 0.55 })
  const darkTile = mat(0x8a9a94, { roughness: 0.5 })

  const stallW = 0.95
  const stallD = 0.9
  const glassH = 1.85

  // Base tray
  const tray = new THREE.Mesh(new THREE.BoxGeometry(stallW, 0.06, stallD), trayMat)
  tray.position.set(0, 0.03, 0)
  tray.receiveShadow = true
  tray.castShadow = true
  shower.add(tray)

  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(stallW + 0.04, 0.04, stallD + 0.04),
    trayMat,
  )
  lip.position.set(0, 0.05, 0)
  shower.add(lip)

  // Tile backer on the two walls of the corner (local −X / −Z)
  const backerA = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, glassH, stallD),
    tile,
  )
  backerA.position.set(-stallW / 2 + 0.01, glassH / 2 + 0.06, 0)
  shower.add(backerA)

  const backerB = new THREE.Mesh(
    new THREE.BoxGeometry(stallW, glassH, 0.02),
    tile,
  )
  backerB.position.set(0, glassH / 2 + 0.06, -stallD / 2 + 0.01)
  shower.add(backerB)

  // Accent tile strip
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.12, stallD * 0.85),
    darkTile,
  )
  strip.position.set(-stallW / 2 + 0.025, 1.1, 0)
  shower.add(strip)

  // Glass panes meet at a shared outer corner
  const t = 0.02
  const paneH = glassH - 0.14
  const glassY = 0.1 + t + paneH / 2
  const frontZ = stallD / 2 - 0.03
  const sideX = stallW / 2 - 0.03
  // Front pane: wall (−X) → corner; side pane: wall (−Z) → corner
  const frontLeft = -stallW / 2 + 0.05
  const sideBack = -stallD / 2 + 0.05
  const frontGlassW = sideX - frontLeft
  const sideGlassD = frontZ - sideBack
  const frontCx = (frontLeft + sideX) / 2
  const sideCz = (sideBack + frontZ) / 2

  const glassFront = new THREE.Mesh(
    new THREE.PlaneGeometry(frontGlassW - t * 0.5, paneH),
    glassMat,
  )
  glassFront.position.set(frontCx, glassY, frontZ)
  glassFront.renderOrder = 2
  shower.add(glassFront)

  const glassSide = new THREE.Mesh(
    new THREE.PlaneGeometry(sideGlassD - t * 0.5, paneH),
    glassMat,
  )
  glassSide.rotation.y = Math.PI / 2
  glassSide.position.set(sideX, glassY, sideCz)
  glassSide.renderOrder = 2
  shower.add(glassSide)

  // Metal border — verticals fill the gap; horizontals own the corners (no double-stack)
  const rail = (w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), chrome)
    m.position.set(x, y, z)
    m.castShadow = true
    shower.add(m)
  }

  const yTop = glassY + paneH / 2 + t / 2
  const yBot = glassY - paneH / 2 - t / 2
  const yMid = glassY

  // Three vertical posts (wall / corner / wall)
  rail(t, paneH, t, frontLeft, yMid, frontZ)
  rail(t, paneH, t, sideX, yMid, frontZ)
  rail(t, paneH, t, sideX, yMid, sideBack)

  // Front horizontals (wall → corner), own the corner cubes
  const frontSpan = sideX - frontLeft + t
  const frontMidX = (frontLeft + sideX) / 2
  rail(frontSpan, t, t, frontMidX, yTop, frontZ)
  rail(frontSpan, t, t, frontMidX, yBot, frontZ)

  // Side horizontals (back wall → just shy of corner)
  const sideSpan = frontZ - sideBack - t
  const sideMidZ = (sideBack + frontZ) / 2
  rail(t, t, sideSpan, sideX, yTop, sideMidZ)
  rail(t, t, sideSpan, sideX, yBot, sideMidZ)

  // Shower arm + head
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.28, 8),
    chrome,
  )
  arm.rotation.z = Math.PI / 2
  arm.position.set(-stallW / 2 + 0.2, 1.85, -stallD / 2 + 0.2)
  shower.add(arm)

  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.1, 0.04, 16),
    chrome,
  )
  head.position.set(-stallW / 2 + 0.34, 1.82, -stallD / 2 + 0.2)
  shower.add(head)

  const face = new THREE.Mesh(
    new THREE.CircleGeometry(0.075, 16),
    mat(0x2a3034, { roughness: 0.4, metalness: 0.3 }),
  )
  face.rotation.x = Math.PI / 2
  face.position.set(-stallW / 2 + 0.34, 1.798, -stallD / 2 + 0.2)
  shower.add(face)

  // Controls
  const plate = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.02), chrome)
  plate.position.set(-stallW / 2 + 0.03, 1.05, 0.1)
  shower.add(plate)

  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), chrome)
  dial.rotation.z = Math.PI / 2
  dial.position.set(-stallW / 2 + 0.05, 1.05, 0.1)
  shower.add(dial)

  // Drain
  const drain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.01, 12),
    mat(0x4a4e52, { metalness: 0.6, roughness: 0.4 }),
  )
  drain.position.set(0.1, 0.065, 0.05)
  shower.add(drain)

  return shower
}

/** Small potted plant for a bathroom shelf / floor corner. */
function createBathPlant({ scale = 1 } = {}) {
  const plant = new THREE.Group()
  const potMat = mat(0x8a7355, { roughness: 0.75 })
  const soilMat = mat(0x3d342c, { roughness: 0.95 })
  const leafMat = mat(0x4a7a55, { roughness: 0.85 })
  const leafDeep = mat(0x3a6244, { roughness: 0.88 })

  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07 * scale, 0.055 * scale, 0.1 * scale, 12),
    potMat,
  )
  pot.position.y = 0.05 * scale
  pot.castShadow = true
  plant.add(pot)

  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06 * scale, 0.06 * scale, 0.015 * scale, 12),
    soilMat,
  )
  soil.position.y = 0.1 * scale
  plant.add(soil)

  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 * scale, 8, 6),
      i % 2 ? leafMat : leafDeep,
    )
    leaf.scale.set(0.7, 1.35, 0.45)
    leaf.position.set(
      Math.cos(ang) * 0.035 * scale,
      0.16 * scale + (i % 2) * 0.03 * scale,
      Math.sin(ang) * 0.035 * scale,
    )
    leaf.rotation.z = Math.cos(ang) * 0.35
    leaf.castShadow = true
    plant.add(leaf)
  }

  return plant
}

/** Framed wall print — soft abstract wash. */
function createWallPrint({ width = 0.32, height = 0.42 } = {}) {
  const frame = new THREE.Group()
  const wood = mat(0x5c4430, { roughness: 0.65 })
  const matte = mat(0xe8e2d6, { roughness: 0.9 })

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 128, 160)
  g.addColorStop(0, '#d4e0d8')
  g.addColorStop(0.45, '#b8c9c0')
  g.addColorStop(0.7, '#9aada8')
  g.addColorStop(1, '#c8b8a0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 160)
  ctx.fillStyle = 'rgba(90, 120, 100, 0.35)'
  ctx.beginPath()
  ctx.ellipse(70, 90, 38, 55, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(70, 100, 85, 0.25)'
  ctx.beginPath()
  ctx.ellipse(48, 70, 28, 40, 0.4, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace

  const border = 0.028
  const outer = new THREE.Mesh(
    new THREE.BoxGeometry(width + border * 2, height + border * 2, 0.03),
    wood,
  )
  outer.castShadow = true
  frame.add(outer)

  const matBoard = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 0.01),
    matte,
  )
  matBoard.position.z = 0.012
  frame.add(matBoard)

  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 0.88, height * 0.88),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.85,
      metalness: 0,
    }),
  )
  art.position.z = 0.02
  frame.add(art)

  return frame
}

function createTowelBar() {
  const bar = new THREE.Group()
  const chrome = mat(0xc8cdd2, { metalness: 0.85, roughness: 0.25 })
  const towelMat = mat(0xd8cfc4, { roughness: 0.92 })

  for (const x of [-0.22, 0.22]) {
    const bracket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8),
      chrome,
    )
    bracket.rotation.x = Math.PI / 2
    bracket.position.set(x, 0, -0.02)
    bar.add(bracket)
  }

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.48, 8),
    chrome,
  )
  rod.rotation.z = Math.PI / 2
  rod.position.z = 0.01
  bar.add(rod)

  const towel = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.38, 0.04), towelMat)
  towel.position.set(0.02, -0.16, 0.04)
  towel.castShadow = true
  bar.add(towel)

  const fold = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.08, 0.035),
    mat(0xcfc6ba, { roughness: 0.92 }),
  )
  fold.position.set(0.02, 0.02, 0.045)
  bar.add(fold)

  return bar
}

/** Cool ceramic floor tiles — albedo + roughness canvases. */
function createBathFloorMaps() {
  const size = 512
  const tiles = 8
  const cell = size / tiles
  const grout = 3

  const color = document.createElement('canvas')
  color.width = size
  color.height = size
  const ctx = color.getContext('2d')

  const rough = document.createElement('canvas')
  rough.width = size
  rough.height = size
  const rctx = rough.getContext('2d')

  // Grout base
  ctx.fillStyle = '#9aa4a0'
  ctx.fillRect(0, 0, size, size)
  rctx.fillStyle = '#b0b0b0'
  rctx.fillRect(0, 0, size, size)

  const tones = [
    [210, 216, 212],
    [200, 208, 204],
    [218, 222, 218],
    [192, 200, 196],
    [206, 214, 210],
  ]

  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      const [br, bg, bb] = tones[(tx * 3 + ty * 5) % tones.length]
      const shade = 0.94 + (((tx * 17 + ty * 13) % 9) * 0.012)
      const x = tx * cell + grout
      const y = ty * cell + grout
      const w = cell - grout * 2
      const h = cell - grout * 2

      ctx.fillStyle = `rgb(${(br * shade) | 0},${(bg * shade) | 0},${(bb * shade) | 0})`
      ctx.fillRect(x, y, w, h)

      // Soft ceramic mottling
      for (let i = 0; i < 28; i++) {
        const a = 0.03 + Math.random() * 0.05
        ctx.fillStyle =
          Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(60,70,65,${a})`
        ctx.fillRect(
          x + Math.random() * w,
          y + Math.random() * h,
          1 + Math.random() * 2.5,
          1 + Math.random() * 2.5,
        )
      }

      // Slight edge bevel highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1)

      // Tile faces smoother than grout
      rctx.fillStyle = '#e8e8e8'
      rctx.fillRect(x, y, w, h)
      rctx.fillStyle = '#9a9a9a'
      rctx.fillRect(tx * cell, ty * cell, cell, grout)
      rctx.fillRect(tx * cell, ty * cell, grout, cell)
    }
  }

  const map = new THREE.CanvasTexture(color)
  map.colorSpace = THREE.SRGBColorSpace
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.anisotropy = 8

  const roughnessMap = new THREE.CanvasTexture(rough)
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping
  roughnessMap.anisotropy = 4

  return { map, roughnessMap }
}

function createBathroomCeilingLight() {
  const fixture = new THREE.Group()
  fixture.name = 'bathroomCeilingLight'

  const chrome = mat(0xc8cdd2, { metalness: 0.8, roughness: 0.3 })
  const glass = new THREE.MeshStandardMaterial({
    color: 0xfff6e8,
    emissive: 0xffe8c8,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.05,
  })

  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.04, 20),
    chrome,
  )
  canopy.position.y = -0.02
  canopy.castShadow = true
  fixture.add(canopy)

  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass)
  dome.rotation.x = Math.PI
  dome.position.y = -0.04
  fixture.add(dome)

  const light = new THREE.PointLight(0xfff0dd, 1.15, 6.5, 1.6)
  light.position.y = -0.2
  light.castShadow = false
  light.name = 'bathroomLight'
  fixture.add(light)

  return fixture
}

/**
 * Enclosed bathroom past the living-room's −X edge.
 * Doorway opens into the main room; interior is fully walled.
 */
export function createBathroom() {
  const group = new THREE.Group()
  group.name = 'bathroom'

  // Match living-room walls exactly (same hex + roughness as room.js)
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xe6ebe4,
    roughness: 0.95,
    metalness: 0,
  })
  wallMat.shadowSide = THREE.DoubleSide

  const roomW = 3.3
  const roomD = 3.2
  // Match living-room wall height so the far wall reads congruent through the doorway
  const wallH = WALL_H
  const wallT = 0.1

  const floorMaps = createBathFloorMaps()
  // ~0.28m tiles across the bathroom footprint
  const tileRepeatX = roomW / 0.28
  const tileRepeatZ = roomD / 0.28
  floorMaps.map.repeat.set(tileRepeatX, tileRepeatZ)
  floorMaps.roughnessMap.repeat.set(tileRepeatX, tileRepeatZ)
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorMaps.map,
    roughnessMap: floorMaps.roughnessMap,
    roughness: 0.72,
    metalness: 0.04,
  })
  const trim = new THREE.MeshStandardMaterial({
    color: 0x8a7355,
    roughness: 0.7,
    metalness: 0.05,
  })

  const floor = markStructure(
    new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), floorMat),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.set(roomW / 2, 0.01, 0)
  floor.receiveShadow = true
  group.add(floor)

  const ceiling = markStructure(
    new THREE.Mesh(new THREE.PlaneGeometry(roomW, roomD), wallMat),
  )
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(roomW / 2, wallH, 0)
  ceiling.receiveShadow = true
  ceiling.castShadow = true
  group.add(ceiling)

  // Back wall
  const backWall = wallBox(wallT, wallH, roomD, wallMat)
  backWall.position.set(roomW - wallT / 2, wallH / 2, 0)
  group.add(backWall)

  // Side walls
  const sideL = wallBox(roomW, wallH, wallT, wallMat)
  sideL.position.set(roomW / 2, wallH / 2, -roomD / 2 + wallT / 2)
  group.add(sideL)

  const sideR = wallBox(roomW, wallH, wallT, wallMat)
  sideR.position.set(roomW / 2, wallH / 2, roomD / 2 - wallT / 2)
  group.add(sideR)

  // Front wall with doorway — inset slightly so the living-room left wall
  // owns the exterior face (avoids z-fighting bright seams at the opening).
  const doorW = 0.88
  const doorH = 2.1
  const doorCenterZ = 0.12
  const frontX = wallT / 2 + 0.04
  const openingLeft = doorCenterZ - doorW / 2
  const openingRight = doorCenterZ + doorW / 2
  const leftPanelW = openingLeft - (-roomD / 2)
  const rightPanelW = roomD / 2 - openingRight

  const leftPanel = wallBox(wallT, wallH, leftPanelW, wallMat)
  leftPanel.position.set(frontX, wallH / 2, -roomD / 2 + leftPanelW / 2)
  group.add(leftPanel)

  const rightPanel = wallBox(wallT, wallH, rightPanelW, wallMat)
  rightPanel.position.set(frontX, wallH / 2, roomD / 2 - rightPanelW / 2)
  group.add(rightPanel)

  const headerH = wallH - doorH
  const header = wallBox(wallT, headerH, doorW, wallMat)
  header.position.set(frontX, doorH + headerH / 2, doorCenterZ)
  group.add(header)

  const jambL = wallBox(0.08, doorH, 0.08, trim)
  jambL.position.set(frontX, doorH / 2, openingLeft)
  group.add(jambL)

  const jambR = wallBox(0.08, doorH, 0.08, trim)
  jambR.position.set(frontX, doorH / 2, openingRight)
  group.add(jambR)

  const lintel = wallBox(0.08, 0.08, doorW + 0.1, trim)
  lintel.position.set(frontX, doorH, doorCenterZ)
  group.add(lintel)

  // Hinge on the living-room face of the opening (bathroom is yawed π, so
  // −X local is into the living room). Swing past 90° so the leaf clears the wall.
  const openDoor = createOpenDoor()
  openDoor.position.set(-0.08, 0, openingLeft)
  openDoor.rotation.y = Math.PI / 2 + 0.18
  group.add(openDoor)

  const toilet = createToilet()
  toilet.position.set(roomW - 0.65, 0, 1.05)
  toilet.rotation.y = -Math.PI / 2
  group.add(toilet)

  // Align vanity with the doorway so the focus dolly passes through the opening
  const vanityZ = doorCenterZ + 0.08

  const sinkX = roomW - 0.6
  const sink = createSink()
  sink.position.set(sinkX, 0, vanityZ)
  sink.rotation.y = -Math.PI / 2
  group.add(sink)

  const mirror = createMirror()
  mirror.position.set(roomW - wallT - 0.02, 1.55, vanityZ)
  mirror.rotation.y = -Math.PI / 2
  group.add(mirror)

  // Bath mat — larger, centered on the vanity (long axis along Z)
  const bathMat = markStructure(
    new THREE.Mesh(
      new THREE.PlaneGeometry(0.58, 0.95),
      mat(0x5f8a72, { roughness: 0.95 }),
    ),
  )
  bathMat.rotation.x = -Math.PI / 2
  bathMat.position.set(sinkX - 0.48, 0.014, vanityZ)
  bathMat.receiveShadow = true
  group.add(bathMat)

  const vanityLight = new THREE.PointLight(0xe8efe9, 0.18, 3.5, 2)
  vanityLight.position.set(roomW - 0.5, 1.95, vanityZ)
  group.add(vanityLight)

  // Ceiling fixture — primary bathroom light (keeps the room lit without living-room bleed)
  const ceilingLight = createBathroomCeilingLight()
  ceilingLight.position.set(roomW * 0.45, wallH - 0.02, 0.1)
  group.add(ceilingLight)

  // Shower in the south-back corner (clear of toilet / vanity)
  const shower = createShower()
  shower.position.set(roomW - 0.62, 0, -(roomD / 2 - 0.58))
  // −π/2 puts tile backers on south (−Z) + back (+X); glass opens into the room
  shower.rotation.y = -Math.PI / 2
  group.add(shower)

  // —— Side-wall decor (visible through the open doorway) ——
  // North wall (+Z): floating shelf + plant (clear of toilet)
  const shelf = markStructure(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.04, 0.16),
      mat(0x6b5340, { roughness: 0.7 }),
    ),
  )
  shelf.position.set(roomW * 0.45, 1.15, roomD / 2 - wallT - 0.1)
  shelf.castShadow = true
  shelf.receiveShadow = true
  group.add(shelf)

  const shelfBracket = markStructure(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.02),
      mat(0x5a4430, { roughness: 0.65 }),
    ),
  )
  shelfBracket.position.set(roomW * 0.45, 1.1, roomD / 2 - wallT - 0.03)
  group.add(shelfBracket)

  const shelfPlant = createBathPlant({ scale: 0.95 })
  shelfPlant.position.set(roomW * 0.45, 1.17, roomD / 2 - wallT - 0.1)
  group.add(shelfPlant)

  const print = createWallPrint({ width: 0.28, height: 0.36 })
  print.position.set(roomW * 0.72, 1.65, roomD / 2 - wallT - 0.025)
  print.rotation.y = Math.PI
  group.add(print)

  // South wall (−Z): towel bar (kept clear of the shower in the back corner)
  const towels = createTowelBar()
  towels.position.set(roomW * 0.32, 1.35, -roomD / 2 + wallT + 0.04)
  group.add(towels)

  const print2 = createWallPrint({ width: 0.24, height: 0.3 })
  print2.position.set(roomW * 0.32, 1.85, -roomD / 2 + wallT + 0.025)
  group.add(print2)

  const floorPlant = createBathPlant({ scale: 1.15 })
  floorPlant.position.set(0.45, 0, -roomD / 2 + wallT + 0.22)
  group.add(floorPlant)

  // Living-room −X edge, shifted toward the window wall; yaw so the doorway faces in
  group.position.set(-4.5, 0, -0.85)
  group.rotation.y = Math.PI

  return group
}

export function updateBathroom(bathroom, elapsed, { focused = false } = {}) {
  const screen = bathroom.getObjectByName('screen')
  if (screen?.material) {
    screen.material.emissiveIntensity = focused
      ? 0.08
      : 0.18 + Math.sin(elapsed * 1.1) * 0.05
  }
}
