import * as THREE from 'three'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.02,
    ...props,
  })
}

function addLeg(group, wood, x, z, h = 0.22) {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.028, h, 8),
    wood,
  )
  leg.position.set(x, h / 2, z)
  leg.castShadow = true
  group.add(leg)
}

/**
 * L-shaped sectional for the TV nook — continuous seat + L-shaped back.
 * Main run faces the TV; chaise sits on the −X wall side.
 */
export function createCouch() {
  const group = new THREE.Group()
  group.name = 'sectional'

  const fabric = mat(0xc4b09a)
  const fabricDeep = mat(0xb09a82)
  const accent = mat(0x8a9a88, { roughness: 0.9 })
  const wood = mat(0x5c4330, { roughness: 0.55, metalness: 0.08 })
  const plinth = mat(0x3d342c, { roughness: 0.7 })

  const seatW = 2.55
  const seatD = 0.9
  const seatH = 0.22
  const seatY = 0.38
  const chaiseW = 0.95
  const chaiseL = 1.2
  const backT = 0.16
  const backH = 0.52
  const backY = seatY + 0.28

  // Outer −X edge of the L (against the left wall)
  const outerX = -seatW / 2
  // Chaise flush on the left, extending +Z toward the TV wall
  const chaiseX = outerX + chaiseW / 2
  const chaiseZ = seatD / 2 + chaiseL / 2

  // —— Continuous L seat ——
  const seat = new THREE.Mesh(new THREE.BoxGeometry(seatW, seatH, seatD), fabric)
  seat.position.set(0, seatY, 0)
  seat.castShadow = true
  seat.receiveShadow = true
  group.add(seat)

  const chaiseSeat = new THREE.Mesh(
    new THREE.BoxGeometry(chaiseW, seatH, chaiseL + 0.06),
    fabric,
  )
  chaiseSeat.position.set(chaiseX, seatY, chaiseZ - 0.03)
  chaiseSeat.castShadow = true
  chaiseSeat.receiveShadow = true
  group.add(chaiseSeat)

  // Seat pads — main run (right of chaise) + chaise/corner pad
  const padY = seatY + seatH / 2 + 0.03
  const padH = 0.07
  const mainPadW = (seatW - chaiseW) * 0.42
  for (const x of [
    seatW * 0.5 - mainPadW * 0.55 - 0.08,
    seatW * 0.5 - mainPadW * 1.55 - 0.14,
  ]) {
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(mainPadW, padH, seatD * 0.88),
      fabricDeep,
    )
    pad.position.set(x, padY, 0.02)
    pad.castShadow = true
    group.add(pad)
  }

  const chaisePad = new THREE.Mesh(
    new THREE.BoxGeometry(chaiseW * 0.9, padH, seatD * 0.5 + chaiseL * 0.92),
    fabricDeep,
  )
  chaisePad.position.set(chaiseX, padY, seatD * 0.15 + chaiseL * 0.35)
  chaisePad.castShadow = true
  group.add(chaisePad)

  // —— Continuous L backrest ——
  // Rear run (full main width)
  const rearBack = new THREE.Mesh(
    new THREE.BoxGeometry(seatW + 0.02, backH, backT),
    fabric,
  )
  rearBack.position.set(0, backY, -seatD / 2 + backT / 2)
  rearBack.castShadow = true
  group.add(rearBack)

  // Side run along the wall (−X) from rear corner to chaise tip
  const sideBackLen = seatD + chaiseL - backT * 0.5
  const sideBack = new THREE.Mesh(
    new THREE.BoxGeometry(backT, backH, sideBackLen),
    fabric,
  )
  sideBack.position.set(
    outerX - backT / 2 + 0.01,
    backY,
    -seatD / 2 + backT / 2 + sideBackLen / 2,
  )
  sideBack.castShadow = true
  group.add(sideBack)

  // Corner filler at the L join
  const corner = new THREE.Mesh(
    new THREE.BoxGeometry(backT * 1.1, backH, backT * 1.1),
    fabric,
  )
  corner.position.set(outerX + backT * 0.15, backY, -seatD / 2 + backT / 2)
  corner.castShadow = true
  group.add(corner)

  // Back cushions — rear
  const cushW = seatW * 0.28
  for (const x of [-seatW * 0.28, 0, seatW * 0.33]) {
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(cushW * 0.92, 0.38, 0.11),
      fabricDeep,
    )
    cushion.position.set(x, seatY + 0.32, -seatD / 2 + 0.14)
    cushion.castShadow = true
    group.add(cushion)
  }

  // Back cushions — wall side
  const sideCushLen = sideBackLen * 0.28
  for (const t of [0.22, 0.52, 0.82]) {
    const z = -seatD / 2 + backT + t * (sideBackLen - backT)
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.38, sideCushLen * 0.9),
      fabricDeep,
    )
    cushion.position.set(outerX + 0.02, seatY + 0.32, z)
    cushion.castShadow = true
    group.add(cushion)
  }

  // Right arm (room / door side of the main run)
  const rightArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.34, seatD * 0.92),
    fabric,
  )
  rightArm.position.set(seatW / 2 + 0.06, seatY + 0.12, 0.02)
  rightArm.castShadow = true
  group.add(rightArm)

  // Front arm on the chaise tip
  const chaiseArm = new THREE.Mesh(
    new THREE.BoxGeometry(chaiseW * 0.88, 0.3, 0.14),
    fabric,
  )
  chaiseArm.position.set(chaiseX, seatY + 0.1, chaiseZ + chaiseL / 2 - 0.02)
  chaiseArm.castShadow = true
  group.add(chaiseArm)

  // Unified plinth
  const baseMain = new THREE.Mesh(
    new THREE.BoxGeometry(seatW * 0.94, 0.08, seatD * 0.88),
    plinth,
  )
  baseMain.position.set(0, seatY - seatH / 2 - 0.05, 0)
  baseMain.castShadow = true
  group.add(baseMain)

  const baseChaise = new THREE.Mesh(
    new THREE.BoxGeometry(chaiseW * 0.9, 0.08, chaiseL * 0.9),
    plinth,
  )
  baseChaise.position.set(chaiseX, seatY - seatH / 2 - 0.05, chaiseZ)
  baseChaise.castShadow = true
  group.add(baseChaise)

  addLeg(group, wood, -seatW * 0.42, -seatD * 0.32)
  addLeg(group, wood, seatW * 0.42, -seatD * 0.32)
  addLeg(group, wood, seatW * 0.42, seatD * 0.32)
  addLeg(group, wood, chaiseX - chaiseW * 0.3, chaiseZ + chaiseL * 0.35)
  addLeg(group, wood, chaiseX + chaiseW * 0.3, chaiseZ + chaiseL * 0.35)
  addLeg(group, wood, chaiseX - chaiseW * 0.3, chaiseZ - chaiseL * 0.15)

  const pillow1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.26, 0.12),
    accent,
  )
  pillow1.position.set(0.45, seatY + 0.3, -seatD * 0.2)
  pillow1.rotation.set(0.1, -0.25, -0.12)
  pillow1.castShadow = true
  group.add(pillow1)

  const pillow2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.22, 0.1),
    mat(0xa89078, { roughness: 0.9 }),
  )
  pillow2.position.set(chaiseX + 0.1, seatY + 0.28, chaiseZ + 0.15)
  pillow2.rotation.set(0.05, 0.5, 0.1)
  pillow2.castShadow = true
  group.add(pillow2)

  // Pulled back from the TV for clearer viewing distance
  group.position.set(-2.55, 0, 1.45)
  group.rotation.y = 0

  group.userData.centerX = -2.55
  group.userData.viewZ = 1.45

  return group
}
