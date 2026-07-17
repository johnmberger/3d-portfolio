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

/**
 * L-shaped kitchenette wrapping the front-right corner.
 * Cabinets along the front wall and right wall; fridge finishes the side run.
 */
export function createKitchenette() {
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
  }) {
    const run = new THREE.Group()
    run.position.set(x, 0, z)
    run.rotation.y = yaw

    const base = box(width, cabH, cabD, wood)
    base.position.set(0, cabH / 2, cabD / 2)
    run.add(base)

    const top = box(width + 0.02, 0.035, cabD + 0.03, counterTop)
    top.position.set(0, cabH + 0.018, cabD / 2 + 0.005)
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
      run.add(glow)
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
  })

  // Right wall run → toward the dining / side window
  const sideW = 1.9
  addRun({
    x: 0,
    z: cabD + sideW / 2,
    yaw: Math.PI / 2,
    width: sideW,
    doors: 3,
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
  // Side run counter
  board.position.set(cabD * 0.5, counterY, cabD + 0.85)
  board.rotation.y = Math.PI / 2
  group.add(board)

  // —— Fridge beyond the side run ——
  const fridge = new THREE.Group()
  fridge.name = 'fridge'

  const fW = 0.82
  const fH = 2.05
  const fD = 0.74

  const body = box(fW, fH, fD, steel)
  body.position.y = fH / 2
  fridge.add(body)

  const freezer = box(fW - 0.04, 0.62, 0.04, steelDark)
  freezer.position.set(0, fH - 0.36, fD / 2 + 0.01)
  fridge.add(freezer)

  const fDoor = box(fW - 0.04, 1.28, 0.04, steel)
  fDoor.position.set(0, 0.7, fD / 2 + 0.01)
  fridge.add(fDoor)

  const seam = box(fW - 0.08, 0.012, 0.01, steelDark)
  seam.position.set(0, 1.35, fD / 2 + 0.035)
  fridge.add(seam)

  for (const y of [1.72, 1.05, 0.5]) {
    const h = box(0.02, 0.16, 0.03, handle)
    h.position.set(fW / 2 - 0.1, y, fD / 2 + 0.04)
    fridge.add(h)
  }

  const fKick = box(fW - 0.04, 0.08, fD - 0.06, kickMat)
  fKick.position.set(0, 0.04, 0.02)
  fridge.add(fKick)

  fridge.rotation.y = Math.PI / 2
  fridge.position.set(0, 0, cabD + sideW + fW / 2 + 0.04)
  group.add(fridge)

  // Tuck into the front-right corner
  group.position.set(4.45, 0, 4.45)
  group.rotation.y = Math.PI

  return group
}
