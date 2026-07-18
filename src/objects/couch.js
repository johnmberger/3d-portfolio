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

/** Soft rectangular throw-pillow geometry (no addon import). */
function createPillowGeometry(w, h, d) {
  const hw = w * 0.5
  const hh = h * 0.5
  const r = Math.min(w, h) * 0.22
  const shape = new THREE.Shape()
  shape.moveTo(-hw + r, -hh)
  shape.lineTo(hw - r, -hh)
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r)
  shape.lineTo(hw, hh - r)
  shape.quadraticCurveTo(hw, hh, hw - r, hh)
  shape.lineTo(-hw + r, hh)
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r)
  shape.lineTo(-hw, -hh + r)
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh)

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d * 0.55,
    bevelEnabled: true,
    bevelThickness: d * 0.22,
    bevelSize: Math.min(w, h) * 0.08,
    bevelSegments: 3,
    curveSegments: 8,
  })
  geo.computeBoundingBox()
  const c = new THREE.Vector3()
  geo.boundingBox.getCenter(c)
  geo.translate(-c.x, -c.y, -c.z)
  return geo
}

function addPillow(group, material, { w, h, d, x, y, z, rot = [0, 0, 0] }) {
  const pillow = new THREE.Mesh(createPillowGeometry(w, h, d), material)
  pillow.position.set(x, y, z)
  pillow.rotation.set(rot[0], rot[1], rot[2])
  pillow.castShadow = true
  group.add(pillow)
  return pillow
}

/**
 * L-shaped sectional for the TV nook — continuous seat + L-shaped back.
 * Main run faces the TV; chaise sits on the −X wall side.
 */
export function createCouch() {
  const group = new THREE.Group()
  group.name = 'sectional'

  const fabric = mat(0x2f4a3c)
  const fabricDeep = mat(0x263d32)
  const wood = mat(0x5c4330, { roughness: 0.55, metalness: 0.08 })
  const plinth = mat(0x2a322c, { roughness: 0.7 })

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

  // Seat pads — main run (2) + wall/chaise run (2), same gaps
  const padY = seatY + seatH / 2 + 0.03
  const padH = 0.07
  const mainPadGap = 0.04
  const mainRunW = seatW - chaiseW
  const mainPadCount = 2
  const mainPadW = (mainRunW - mainPadGap * (mainPadCount + 1)) / mainPadCount
  const mainPadD = seatD * 0.86
  const mainRunStart = outerX + chaiseW
  for (let i = 0; i < mainPadCount; i++) {
    const x =
      mainRunStart +
      mainPadGap +
      mainPadW / 2 +
      i * (mainPadW + mainPadGap)
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(mainPadW, padH, mainPadD),
      fabricDeep,
    )
    pad.position.set(x, padY, 0.02)
    pad.castShadow = true
    group.add(pad)
  }

  // Wall / chaise pads — full length to the chaise tip, with a center break
  const chaisePadCount = 2
  const chaisePadW = chaiseW * 0.88
  const chaisePadStart = -seatD / 2 + 0.06
  const chaisePadEnd = chaiseZ + chaiseL / 2 - 0.1
  const chaisePadSpan = chaisePadEnd - chaisePadStart
  const chaisePadLen =
    (chaisePadSpan - mainPadGap * (chaisePadCount + 1)) / chaisePadCount
  for (let i = 0; i < chaisePadCount; i++) {
    const z =
      chaisePadStart +
      mainPadGap +
      chaisePadLen / 2 +
      i * (chaisePadLen + mainPadGap)
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(chaisePadW, padH, chaisePadLen),
      fabricDeep,
    )
    pad.position.set(chaiseX, padY, z)
    pad.castShadow = true
    group.add(pad)
  }

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

  // Back cushions — uniform size, evenly spaced along the rear
  const rearCushCount = 3
  const cushGap = 0.05
  const cushW = (seatW - cushGap * (rearCushCount + 1)) / rearCushCount
  const cushH = 0.36
  const cushD = 0.12
  const cushY = seatY + 0.3
  for (let i = 0; i < rearCushCount; i++) {
    const x = -seatW / 2 + cushGap + cushW / 2 + i * (cushW + cushGap)
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(cushW, cushH, cushD),
      fabricDeep,
    )
    cushion.position.set(x, cushY, -seatD / 2 + 0.14)
    cushion.castShadow = true
    group.add(cushion)
  }

  // Back cushions — wall side, same height/thickness as rear
  const sideCushCount = 3
  const sideSpan = sideBackLen - backT * 0.4
  const sideCushLen = (sideSpan - cushGap * (sideCushCount + 1)) / sideCushCount
  const sideCushStart = -seatD / 2 + backT * 0.6
  for (let i = 0; i < sideCushCount; i++) {
    const z =
      sideCushStart + cushGap + sideCushLen / 2 + i * (sideCushLen + cushGap)
    const cushion = new THREE.Mesh(
      new THREE.BoxGeometry(cushD, cushH, sideCushLen),
      fabricDeep,
    )
    cushion.position.set(outerX + 0.02, cushY, z)
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

  // Throw pillows — white / grey / dark grey, lightly askew, clear of cushions
  const pillowSeatY = padY + padH / 2
  const rearCushFrontZ = -seatD / 2 + 0.14 + cushD / 2
  const sideCushInnerX = outerX + 0.02 + cushD / 2
  const pillowWhite = mat(0xf2f0ec, { roughness: 0.9 })
  const pillowGrey = mat(0x9a9c9e, { roughness: 0.9 })
  const pillowDark = mat(0x4a4e52, { roughness: 0.9 })

  addPillow(group, pillowWhite, {
    w: 0.32,
    h: 0.26,
    d: 0.11,
    x: 0.05,
    y: pillowSeatY + 0.15,
    z: rearCushFrontZ + 0.095,
    rot: [0.015, 0.08, 0.02],
  })
  addPillow(group, pillowGrey, {
    w: 0.3,
    h: 0.26,
    d: 0.11,
    x: 0.55,
    y: pillowSeatY + 0.145,
    z: rearCushFrontZ + 0.09,
    rot: [0.02, -0.12, -0.03],
  })
  addPillow(group, pillowDark, {
    w: 0.28,
    h: 0.24,
    d: 0.1,
    x: 0.95,
    y: pillowSeatY + 0.135,
    z: rearCushFrontZ + 0.09,
    rot: [0.02, 0.08, 0.015],
  })
  addPillow(group, pillowGrey, {
    w: 0.3,
    h: 0.24,
    d: 0.11,
    x: sideCushInnerX + 0.1,
    y: pillowSeatY + 0.14,
    z: chaiseZ - 0.05,
    rot: [0.015, Math.PI / 2 + 0.06, 0.01],
  })

  // Pulled back from the TV for clearer viewing distance
  group.position.set(-2.55, 0, 1.45)
  group.rotation.y = 0

  group.userData.centerX = -2.55
  group.userData.viewZ = 1.45

  return group
}
