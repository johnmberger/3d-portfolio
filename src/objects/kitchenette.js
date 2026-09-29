import * as THREE from 'three'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    ...props,
  })
}

function box(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function createCoffeeMachine({ steel, steelDark, plastic }) {
  const m = new THREE.Group()
  m.name = 'coffeeMachine'

  const body = box(0.22, 0.28, 0.28, steel)
  body.position.y = 0.14
  m.add(body)

  // Top water / bean hopper
  const hopper = box(0.18, 0.08, 0.16, steelDark)
  hopper.position.set(0, 0.32, -0.02)
  m.add(hopper)

  const lid = box(0.19, 0.012, 0.17, steel)
  lid.position.set(0, 0.365, -0.02)
  m.add(lid)

  // Front panel + buttons
  const face = box(0.2, 0.12, 0.02, steelDark)
  face.position.set(0, 0.2, 0.15)
  m.add(face)

  for (const [x, y] of [
    [-0.05, 0.22],
    [0.05, 0.22],
    [0, 0.17],
  ]) {
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.01, 10),
      plastic,
    )
    btn.rotation.x = Math.PI / 2
    btn.position.set(x, y, 0.162)
    m.add(btn)
  }

  // Group head / spout
  const spout = box(0.06, 0.04, 0.08, steelDark)
  spout.position.set(0, 0.1, 0.12)
  m.add(spout)

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.01, 0.05, 8),
    steel,
  )
  nozzle.position.set(0, 0.07, 0.14)
  m.add(nozzle)

  // Drip tray
  const tray = box(0.2, 0.02, 0.14, steelDark)
  tray.position.set(0, 0.015, 0.08)
  m.add(tray)

  const grate = box(0.18, 0.008, 0.12, steel)
  grate.position.set(0, 0.028, 0.08)
  m.add(grate)

  // Cup
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.022, 0.055, 12),
    plastic,
  )
  cup.position.set(0, 0.055, 0.1)
  cup.castShadow = true
  m.add(cup)

  const cupHandle = box(0.008, 0.03, 0.035, plastic)
  cupHandle.position.set(0.035, 0.055, 0.1)
  m.add(cupHandle)

  return m
}

function createCuttingBoard({ boardMat, knifeMat, handleMat }) {
  const g = new THREE.Group()
  g.name = 'cuttingBoard'

  const board = box(0.38, 0.022, 0.24, boardMat)
  board.position.y = 0.011
  g.add(board)

  // Juice groove
  const groove = box(0.3, 0.004, 0.16, mat(0x6b4a2e, { roughness: 0.9 }))
  groove.position.set(0, 0.02, 0)
  g.add(groove)

  // Chef's knife resting on the board
  const blade = box(0.2, 0.004, 0.035, knifeMat)
  blade.position.set(0.02, 0.028, 0.02)
  blade.rotation.y = -0.35
  g.add(blade)

  const knifeHandle = box(0.09, 0.016, 0.028, handleMat)
  knifeHandle.position.set(-0.12, 0.03, 0.055)
  knifeHandle.rotation.y = -0.35
  g.add(knifeHandle)

  return g
}

function addRoundedRect(path, cx, cy, w, d, r) {
  const hw = w / 2
  const hd = d / 2
  const rr = Math.min(r, hw - 0.001, hd - 0.001)
  const x0 = cx - hw
  const y0 = cy - hd
  const x1 = cx + hw
  const y1 = cy + hd
  path.moveTo(x0 + rr, y0)
  path.lineTo(x1 - rr, y0)
  path.quadraticCurveTo(x1, y0, x1, y0 + rr)
  path.lineTo(x1, y1 - rr)
  path.quadraticCurveTo(x1, y1, x1 - rr, y1)
  path.lineTo(x0 + rr, y1)
  path.quadraticCurveTo(x0, y1, x0, y1 - rr)
  path.lineTo(x0, y0 + rr)
  path.quadraticCurveTo(x0, y0, x0 + rr, y0)
}

/** Counter slab in XZ, thickness along +Y from the origin. Optional rounded-rect hole. */
function makeCounterSlab(width, depth, thickness, material, hole) {
  const hw = width / 2
  const hd = depth / 2
  const shape = new THREE.Shape()
  shape.moveTo(-hw, -hd)
  shape.lineTo(hw, -hd)
  shape.lineTo(hw, hd)
  shape.lineTo(-hw, hd)
  shape.closePath()

  if (hole) {
    const path = new THREE.Path()
    addRoundedRect(path, hole.x, -hole.z, hole.w, hole.d, hole.r)
    shape.holes.push(path)
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: hole ? 16 : 1,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function makeRoundedRectSlab(w, d, thickness, radius, material) {
  const shape = new THREE.Shape()
  addRoundedRect(shape, 0, 0, w, d, radius)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 12,
  })
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  const mesh = new THREE.Mesh(geo, material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * Square undermount basin with rounded corners + one-piece gooseneck.
 * Origin at the countertop; faucet toward −Z.
 */
function createKitchenSink({ steel, steelDark }) {
  const sink = new THREE.Group()
  sink.name = 'kitchenSink'

  const chrome = mat(0xe6eaee, { metalness: 0.94, roughness: 0.1 })
  const basinMat = mat(0xb4bcc4, {
    metalness: 0.82,
    roughness: 0.22,
    side: THREE.DoubleSide,
  })
  const water = mat(0x6a8a9a, {
    roughness: 0.05,
    metalness: 0.1,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  })

  const innerW = 0.36
  const innerD = 0.28
  const cornerR = 0.055
  const wall = 0.016
  const basinH = 0.115

  const wallShape = new THREE.Shape()
  addRoundedRect(wallShape, 0, 0, innerW + wall * 2, innerD + wall * 2, cornerR + wall)
  const wallHole = new THREE.Path()
  addRoundedRect(wallHole, 0, 0, innerW, innerD, cornerR)
  wallShape.holes.push(wallHole)
  const wallGeo = new THREE.ExtrudeGeometry(wallShape, {
    depth: basinH,
    bevelEnabled: false,
    curveSegments: 12,
  })
  wallGeo.rotateX(-Math.PI / 2)
  wallGeo.computeVertexNormals()
  const walls = new THREE.Mesh(wallGeo, basinMat)
  walls.position.y = -basinH
  walls.castShadow = true
  walls.receiveShadow = true
  sink.add(walls)

  const floor = makeRoundedRectSlab(innerW - 0.01, innerD - 0.01, 0.01, cornerR - 0.008, basinMat)
  floor.position.y = -basinH
  sink.add(floor)

  const poolShape = new THREE.Shape()
  addRoundedRect(poolShape, 0, 0, innerW - 0.04, innerD - 0.04, Math.max(0.02, cornerR - 0.02))
  const poolGeo = new THREE.ShapeGeometry(poolShape)
  poolGeo.rotateX(-Math.PI / 2)
  const pool = new THREE.Mesh(poolGeo, water)
  pool.position.y = -basinH + 0.018
  sink.add(pool)

  const drain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, 0.006, 16),
    steelDark,
  )
  drain.position.y = -basinH + 0.012
  sink.add(drain)

  const faucetZ = -(innerD / 2 + 0.045)
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.032, 0.014, 20),
    chrome,
  )
  deck.position.set(0, 0.007, faucetZ)
  deck.castShadow = true
  sink.add(deck)

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.014, 0.028, 16),
    chrome,
  )
  stem.position.set(0, 0.026, faucetZ)
  sink.add(stem)

  const neck = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 0.038, faucetZ),
    new THREE.Vector3(0, 0.26, faucetZ),
    new THREE.Vector3(0, 0.26, 0.04),
    new THREE.Vector3(0, 0.1, 0.045),
  )
  const spoutGeo = new THREE.TubeGeometry(neck, 64, 0.0115, 14, false)
  spoutGeo.computeVertexNormals()
  const spout = new THREE.Mesh(spoutGeo, chrome)
  spout.castShadow = true
  sink.add(spout)

  const startCap = new THREE.Mesh(new THREE.SphereGeometry(0.0115, 14, 10), chrome)
  startCap.position.copy(neck.getPoint(0))
  sink.add(startCap)

  const aerator = new THREE.Mesh(
    new THREE.CylinderGeometry(0.013, 0.015, 0.018, 14),
    chrome,
  )
  const tip = neck.getPoint(1)
  const tipTan = neck.getTangent(1)
  aerator.position.copy(tip)
  aerator.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tipTan.normalize())
  aerator.castShadow = true
  sink.add(aerator)

  const leverHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.022, 12),
    chrome,
  )
  leverHub.position.set(0.036, 0.028, faucetZ)
  sink.add(leverHub)

  const lever = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.006, 0.038, 4, 8),
    chrome,
  )
  lever.rotation.x = Math.PI / 2.6
  lever.position.set(0.036, 0.04, faucetZ + 0.018)
  sink.add(lever)

  sink.userData.opening = { w: innerW, d: innerD, r: cornerR }
  return sink
}

/** Decorative ceramics for the top of the upper cabinets. */
function createVase({
  color = 0xe8e0d4,
  style = 'bottle',
  scale = 1,
} = {}) {
  const vase = new THREE.Group()
  vase.name = 'cabinetVase'

  // Profiles as [radius, height] — lathed into a solid of revolution
  const profiles = {
    bottle: [
      [0.001, 0],
      [0.055, 0],
      [0.062, 0.04],
      [0.058, 0.12],
      [0.048, 0.2],
      [0.032, 0.28],
      [0.026, 0.34],
      [0.028, 0.37],
      [0.036, 0.385],
      [0.034, 0.392],
    ],
    bulb: [
      [0.001, 0],
      [0.07, 0],
      [0.095, 0.06],
      [0.1, 0.13],
      [0.088, 0.2],
      [0.055, 0.24],
      [0.038, 0.26],
      [0.042, 0.275],
      [0.04, 0.282],
    ],
    cylinder: [
      [0.001, 0],
      [0.068, 0],
      [0.072, 0.03],
      [0.07, 0.16],
      [0.068, 0.2],
      [0.074, 0.215],
      [0.07, 0.222],
    ],
  }

  const pts = (profiles[style] || profiles.bottle).map(
    ([r, y]) => new THREE.Vector2(r * scale, y * scale),
  )
  const geo = new THREE.LatheGeometry(pts, 28)
  geo.computeVertexNormals()

  const ceramic = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.42,
    metalness: 0.04,
  })

  const body = new THREE.Mesh(geo, ceramic)
  body.castShadow = true
  body.receiveShadow = true
  vase.add(body)

  return vase
}

function createFridge({ handle, kickMat, width = 0.78, depth = 0.7, height = 1.92 }) {
  const fridge = new THREE.Group()
  fridge.name = 'fridge'

  const fW = width
  const fH = height
  const fD = depth
  const doorT = 0.048
  const gasket = mat(0x1a1c1e, { roughness: 0.9, metalness: 0.05 })
  const bodySteel = mat(0xb8bcc2, { metalness: 0.82, roughness: 0.22 })
  const doorSteel = mat(0xc8ccd2, { metalness: 0.78, roughness: 0.2 })
  const accentSteel = mat(0x9aa0a8, { metalness: 0.75, roughness: 0.32 })

  // Cabinet shell (slightly set back from doors)
  const shell = box(fW, fH - 0.1, fD - 0.04, bodySteel)
  shell.position.set(0, (fH - 0.1) / 2 + 0.1, -0.01)
  fridge.add(shell)

  // Top cap
  const topCap = box(fW + 0.01, 0.04, fD + 0.01, accentSteel)
  topCap.position.set(0, fH - 0.02, 0)
  fridge.add(topCap)

  // Toe kick / vent grille area
  const kick = box(fW - 0.02, 0.1, fD - 0.08, kickMat)
  kick.position.set(0, 0.05, 0.02)
  fridge.add(kick)

  const vent = box(fW - 0.14, 0.028, 0.012, accentSteel)
  vent.position.set(0, 0.055, fD / 2 - 0.02)
  fridge.add(vent)
  for (let i = -3; i <= 3; i++) {
    const slot = box(0.012, 0.02, 0.006, kickMat)
    slot.position.set(i * 0.07, 0.055, fD / 2 - 0.012)
    fridge.add(slot)
  }

  // Door layout: top freezer ~30%, bottom fridge
  const gap = 0.012
  const freezerH = 0.58
  const fridgeDoorH = fH - 0.12 - freezerH - gap - 0.02
  const doorW = fW - 0.06
  const doorZ = fD / 2 - doorT / 2 + 0.012

  function addDoor(height, y) {
    const door = new THREE.Group()

    const panel = box(doorW, height, doorT, doorSteel)
    panel.position.set(0, 0, 0)
    door.add(panel)

    // Slightly recessed face plate
    const face = box(doorW - 0.04, height - 0.04, 0.008, doorSteel)
    face.position.set(0, 0, doorT / 2 + 0.002)
    door.add(face)

    // Dark gasket / reveal around door
    const seal = box(doorW + 0.01, height + 0.01, 0.01, gasket)
    seal.position.set(0, 0, -doorT / 2 - 0.002)
    door.add(seal)

    door.position.set(0, y, doorZ)
    fridge.add(door)
    return door
  }

  const freezerY = 0.1 + fridgeDoorH + gap + freezerH / 2
  const fridgeDoorY = 0.1 + fridgeDoorH / 2
  addDoor(freezerH, freezerY)
  addDoor(fridgeDoorH, fridgeDoorY)

  // Horizontal split trim
  const split = box(doorW + 0.02, 0.014, 0.02, accentSteel)
  split.position.set(0, 0.1 + fridgeDoorH + gap / 2, doorZ + doorT / 2)
  fridge.add(split)

  // Vertical bar handles (right side) — freezer + fridge
  function addBarHandle(y, length) {
    const hx = -doorW / 2 + 0.06
    const hz = doorZ + doorT / 2 + 0.028
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, length, 12),
      handle,
    )
    bar.position.set(hx, y, hz)
    bar.castShadow = true
    fridge.add(bar)

    for (const oy of [-length / 2 + 0.02, length / 2 - 0.02]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.03, 10),
        handle,
      )
      post.rotation.x = Math.PI / 2
      post.position.set(hx, y + oy, hz - 0.015)
      fridge.add(post)
    }
  }

  addBarHandle(freezerY, 0.28)
  addBarHandle(fridgeDoorY + 0.15, 0.72)

  // Side edge trim lines
  for (const sx of [-fW / 2 + 0.008, fW / 2 - 0.008]) {
    const edge = box(0.012, fH - 0.14, 0.01, accentSteel)
    edge.position.set(sx, fH / 2 + 0.02, doorZ - 0.02)
    fridge.add(edge)
  }

  return fridge
}

/**
 * L-shaped kitchenette wrapping the front-right corner.
 * Cabinets along the front wall and right wall; fridge finishes the side run.
 */
export function createKitchenette({ underCabinetLights = true } = {}) {
  const group = new THREE.Group()
  group.name = 'kitchenette'

  const wood = mat(0x7a5c42, { roughness: 0.72 })
  const woodDark = mat(0x5c4430, { roughness: 0.75 })
  const counterTop = mat(0xd8d2c8, { roughness: 0.45, metalness: 0.08 })
  const steel = mat(0xc5c8cc, { metalness: 0.75, roughness: 0.28 })
  const steelDark = mat(0x8a8e94, { metalness: 0.7, roughness: 0.35 })
  const handle = mat(0xb0b4b8, { metalness: 0.85, roughness: 0.25 })
  const kickMat = mat(0x2a2c2e, { roughness: 0.6 })
  const boardWood = mat(0xc4a574, { roughness: 0.85 })
  const knifeSteel = mat(0xd8dde2, { metalness: 0.9, roughness: 0.2 })
  const knifeHandleMat = mat(0x2a1c14, { roughness: 0.7 })
  const cupMat = mat(0xf2ebe3, { roughness: 0.55 })

  const cabH = 0.92
  const cabD = 0.64
  const upH = 0.88
  const upD = 0.36
  const upY = 1.82
  const counterY = cabH + 0.035

  /**
   * A cabinet bank whose face is local +Z.
   * yaw = 0   → along front wall, facing into room
   * yaw = π/2 → along right wall, facing into room
   */
  function addRun({
    x,
    z,
    yaw = 0,
    width,
    doors = 2,
    withUppers = true,
    underCabinetLights = true,
    sinkHole = null,
  }) {
    const run = new THREE.Group()
    run.position.set(x, 0, z)
    run.rotation.y = yaw

    if (sinkHole) {
      const drop = 0.13
      const pad = 0.03
      const left = sinkHole.x - sinkHole.w / 2 - pad
      const right = sinkHole.x + sinkHole.w / 2 + pad
      const xMin = -width / 2
      const xMax = width / 2

      const leftW = left - xMin
      if (leftW > 0.05) {
        const leftBase = box(leftW, cabH, cabD, wood)
        leftBase.position.set(xMin + leftW / 2, cabH / 2, cabD / 2)
        run.add(leftBase)
      }
      const rightW = xMax - right
      if (rightW > 0.05) {
        const rightBase = box(rightW, cabH, cabD, wood)
        rightBase.position.set(right + rightW / 2, cabH / 2, cabD / 2)
        run.add(rightBase)
      }
      const midW = Math.max(0.08, right - left)
      const lowH = cabH - drop
      const midBase = box(midW, lowH, cabD, wood)
      midBase.position.set((left + right) / 2, lowH / 2, cabD / 2)
      run.add(midBase)
    } else {
      const base = box(width, cabH, cabD, wood)
      base.position.set(0, cabH / 2, cabD / 2)
      run.add(base)
    }

    const topW = width + 0.02
    const topD = cabD + 0.03
    const topT = 0.035
    let top
    if (sinkHole) {
      top = makeCounterSlab(topW, topD, topT, counterTop, sinkHole)
      top.position.set(0, cabH, cabD / 2 + 0.005)
    } else {
      top = box(topW, topT, topD, counterTop)
      top.position.set(0, cabH + topT / 2, cabD / 2 + 0.005)
    }
    run.add(top)

    const kick = box(width - 0.04, 0.08, cabD - 0.05, kickMat)
    kick.position.set(0, 0.04, cabD / 2)
    run.add(kick)

    const doorW = (width - 0.05) / doors
    for (let i = 0; i < doors; i++) {
      const dx = -width / 2 + doorW / 2 + 0.015 + i * doorW
      const panel = box(doorW - 0.02, cabH - 0.18, 0.02, woodDark)
      panel.position.set(dx, cabH / 2 + 0.02, cabD + 0.012)
      run.add(panel)

      const pull = box(0.018, 0.1, 0.025, handle)
      const inward = dx < 0 ? 1 : -1
      pull.position.set(dx + inward * doorW * 0.3, cabH / 2 + 0.02, cabD + 0.03)
      run.add(pull)
    }

    if (withUppers) {
      const upper = box(width, upH, upD, wood)
      upper.position.set(0, upY, upD / 2 + 0.02)
      run.add(upper)

      for (let i = 0; i < doors; i++) {
        const dx = -width / 2 + doorW / 2 + 0.015 + i * doorW
        const panel = box(doorW - 0.02, upH - 0.1, 0.02, woodDark)
        panel.position.set(dx, upY, upD + 0.032)
        run.add(panel)

        const pull = box(0.08, 0.016, 0.02, handle)
        pull.position.set(dx, upY - upH * 0.28, upD + 0.048)
        run.add(pull)
      }

      const glow = new THREE.PointLight(0xfff0e0, 0.18, 2.4, 2)
      glow.castShadow = false
      glow.position.set(0, upY - upH / 2 - 0.04, cabD * 0.65)
      if (underCabinetLights) run.add(glow)
    }

    group.add(run)
  }

  // —— Corner block (joins the two base runs) ——
  const corner = box(cabD, cabH, cabD, wood)
  corner.position.set(cabD / 2, cabH / 2, cabD / 2)
  group.add(corner)

  const cornerTop = box(cabD + 0.02, 0.035, cabD + 0.02, counterTop)
  cornerTop.position.set(cabD / 2, cabH + 0.018, cabD / 2)
  group.add(cornerTop)

  const cornerKick = box(cabD - 0.02, 0.08, cabD - 0.04, kickMat)
  cornerKick.position.set(cabD / 2, 0.04, cabD / 2)
  group.add(cornerKick)

  // —— L-shaped upper corner (both legs meet flush) ——
  const upInset = 0.02
  // Leg along the front wall (+Z face)
  const cornerUpFront = box(cabD, upH, upD, wood)
  cornerUpFront.position.set(cabD / 2, upY, upD / 2 + upInset)
  group.add(cornerUpFront)

  // Leg along the side wall (+X face) — skips the overlap already covered above
  const sideLegDepth = cabD - upD
  if (sideLegDepth > 0.02) {
    const cornerUpSide = box(upD, upH, sideLegDepth, wood)
    cornerUpSide.position.set(
      upD / 2 + upInset,
      upY,
      upD + sideLegDepth / 2 + upInset * 0.5,
    )
    group.add(cornerUpSide)
  }

  // Visible door panels on both corner faces
  const cornerDoorF = box(cabD - 0.08, upH - 0.1, 0.02, woodDark)
  cornerDoorF.position.set(cabD / 2, upY, upD + upInset + 0.012)
  group.add(cornerDoorF)

  const cornerDoorS = box(0.02, upH - 0.1, cabD - 0.08, woodDark)
  cornerDoorS.position.set(upD + upInset + 0.012, upY, cabD / 2)
  group.add(cornerDoorS)

  const cornerPullF = box(0.08, 0.016, 0.02, handle)
  cornerPullF.position.set(cabD / 2, upY - upH * 0.28, upD + upInset + 0.028)
  group.add(cornerPullF)

  const cornerPullS = box(0.02, 0.016, 0.08, handle)
  cornerPullS.position.set(upD + upInset + 0.028, upY - upH * 0.28, cabD / 2)
  group.add(cornerPullS)

  // Front wall run → toward the entrance door (+X local)
  const frontW = 1.2
  addRun({
    x: cabD + frontW / 2,
    z: 0,
    yaw: 0,
    width: frontW,
    doors: 2,
    underCabinetLights,
  })

  // Right wall run → toward the dining / side window
  const sideW = 1.9
  const sinkAlong = 1.42
  const sinkDepth = cabD * 0.52
  const sideRunZ = cabD + sideW / 2
  const sinkOpening = { w: 0.36, d: 0.28, r: 0.055 }
  addRun({
    x: 0,
    z: sideRunZ,
    yaw: Math.PI / 2,
    width: sideW,
    doors: 3,
    underCabinetLights,
    sinkHole: {
      x: -(cabD + sinkAlong - sideRunZ),
      z: sinkDepth - (cabD / 2 + 0.005),
      w: sinkOpening.w + 0.012,
      d: sinkOpening.d + 0.012,
      r: sinkOpening.r + 0.004,
    },
  })

  // —— Counter props ——
  const coffee = createCoffeeMachine({
    steel,
    steelDark,
    plastic: cupMat,
  })
  // Front run counter, a bit out from the corner
  coffee.position.set(cabD + 0.55, counterY, cabD * 0.55)
  group.add(coffee)

  const board = createCuttingBoard({
    boardMat: boardWood,
    knifeMat: knifeSteel,
    handleMat: knifeHandleMat,
  })
  // Side run, near the corner — sink takes the rest of the counter
  board.position.set(cabD * 0.5, counterY, cabD + 0.58)
  board.rotation.y = Math.PI / 2
  group.add(board)

  const sink = createKitchenSink({ steel, steelDark })
  sink.position.set(sinkDepth, counterY, cabD + sinkAlong)
  sink.rotation.y = Math.PI / 2
  group.add(sink)

  // Ceramics on top of the upper cabinets
  const cabinetTopY = upY + upH / 2 - 0.002

  const tallVase = createVase({
    color: 0xd4cbc0,
    style: 'bottle',
    scale: 1.15,
  })
  tallVase.position.set(cabD + 0.4, cabinetTopY, upD * 0.48)
  group.add(tallVase)

  const roundVase = createVase({
    color: 0xa87858,
    style: 'bulb',
    scale: 1.2,
  })
  roundVase.position.set(upD * 0.48, cabinetTopY, cabD + 0.55)
  group.add(roundVase)

  const shortVase = createVase({
    color: 0xe8e4dc,
    style: 'cylinder',
    scale: 1.15,
  })
  shortVase.position.set(upD * 0.48, cabinetTopY, cabD + 1.35)
  group.add(shortVase)

  // —— Fridge beyond the side run (back flush with the cabinets, not through the wall) ——
  const fridgeW = 0.78
  const fridgeD = 0.7
  const fridge = createFridge({
    handle,
    kickMat,
    width: fridgeW,
    depth: fridgeD,
  })
  fridge.rotation.y = Math.PI / 2
  fridge.position.set(fridgeD / 2, 0, cabD + sideW + fridgeW / 2 + 0.04)
  group.add(fridge)

  // Tuck into the front-right corner
  group.position.set(4.45, 0, 4.45)
  group.rotation.y = Math.PI

  return group
}
