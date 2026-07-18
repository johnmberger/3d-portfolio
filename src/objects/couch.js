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

/** Equirectangular fabric-style world map for the globe pillow. */
function createGlobePillowTexture() {
  const w = 1024
  const h = 512
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#1a6bb5'
  ctx.fillRect(0, 0, w, h)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, h)
  oceanGrad.addColorStop(0, 'rgba(100, 180, 220, 0.3)')
  oceanGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
  oceanGrad.addColorStop(1, 'rgba(30, 80, 140, 0.3)')
  ctx.fillStyle = oceanGrad
  ctx.fillRect(0, 0, w, h)

  const px = (lon, lat) => [((lon + 180) / 360) * w, ((90 - lat) / 180) * h]

  function land(color, ring) {
    ctx.beginPath()
    ring.forEach(([lon, lat], i) => {
      const [x, y] = px(lon, lat)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
  }

  function countryPatch(color, lon, lat, rw, rh) {
    const [x, y] = px(lon, lat)
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(x, y, (rw / 360) * w, (rh / 180) * h, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Continents
  land('#4aad62', [
    [-168, 68], [-140, 72], [-100, 72], [-60, 65], [-55, 50], [-70, 45],
    [-85, 45], [-100, 48], [-130, 55], [-150, 60], [-168, 68],
  ])
  land('#5cbc70', [
    [-130, 50], [-115, 48], [-100, 50], [-85, 42], [-80, 30], [-82, 25],
    [-97, 16], [-110, 22], [-118, 32], [-125, 42], [-130, 50],
  ])
  land('#3d9a55', [
    [-90, 22], [-85, 18], [-78, 10], [-82, 8], [-90, 15], [-92, 20], [-90, 22],
  ])
  land('#e8c44a', [
    [-80, 12], [-70, 12], [-60, 8], [-50, 2], [-45, -10], [-48, -25],
    [-55, -40], [-68, -55], [-72, -40], [-78, -20], [-80, 0], [-80, 12],
  ])
  land('#d4784a', [
    [-18, 32], [-10, 36], [5, 37], [20, 32], [32, 30], [40, 15], [42, 0],
    [40, -20], [30, -32], [18, -34], [12, -20], [10, 0], [-5, 8], [-15, 16],
    [-18, 28], [-18, 32],
  ])
  land('#c45c6a', [
    [-10, 36], [-9, 44], [-5, 52], [5, 58], [18, 60], [28, 68], [40, 70],
    [30, 55], [20, 48], [10, 44], [0, 42], [-10, 36],
  ])
  land('#e8a04a', [
    [30, 55], [45, 58], [70, 62], [100, 68], [140, 65], [170, 62], [175, 55],
    [140, 50], [120, 48], [90, 50], [60, 52], [40, 50], [30, 55],
  ])
  land('#6bbf7a', [
    [45, 40], [55, 42], [70, 40], [75, 30], [90, 28], [95, 20], [90, 10],
    [78, 8], [70, 20], [60, 28], [50, 32], [45, 40],
  ])
  land('#4a9e6e', [
    [100, 40], [110, 42], [122, 40], [135, 35], [140, 28], [130, 22],
    [115, 20], [105, 28], [100, 40],
  ])
  land('#7ec87a', [
    [95, 18], [105, 15], [115, 10], [120, 5], [110, 0], [100, 5], [95, 12],
    [95, 18],
  ])
  land('#d45c5c', [
    [114, -12], [130, -12], [145, -16], [152, -28], [145, -38], [130, -35],
    [118, -28], [114, -18], [114, -12],
  ])
  land('#7ec8a0', [[166, -38], [175, -36], [178, -45], [170, -47], [166, -38]])
  land('#e8e0d4', [
    [-180, -68], [-90, -65], [0, -70], [90, -66], [180, -68],
    [180, -88], [-180, -88], [-180, -68],
  ])

  // Colorful country-ish patches on top of continents
  const patches = [
    ['#e85d4c', -100, 40, 12, 8],
    ['#f0c040', -90, 35, 8, 6],
    ['#5b8fd9', -110, 45, 10, 7],
    ['#c45c4a', -70, -10, 8, 10],
    ['#5cb86e', -55, -25, 7, 9],
    ['#e8a04a', -62, -40, 6, 8],
    ['#e85d4c', 5, 50, 6, 5],
    ['#e85d4c', 15, 48, 5, 4],
    ['#f0c040', 2, 46, 4, 4],
    ['#5cb86e', 10, 20, 8, 10],
    ['#c45c4a', 25, 0, 7, 9],
    ['#5b8fd9', 20, -15, 6, 8],
    ['#e85d4c', 35, 45, 8, 6],
    ['#6bbf7a', 50, 35, 7, 6],
    ['#f0c040', 75, 35, 10, 7],
    ['#c45c4a', 100, 35, 8, 6],
    ['#5b8fd9', 120, 30, 7, 6],
    ['#e8a04a', 80, 15, 6, 5],
    ['#e85d4c', 135, -22, 8, 6],
    ['#f0c040', 125, -28, 6, 5],
  ]
  for (const [color, lon, lat, rw, rh] of patches) {
    countryPatch(color, lon, lat, rw, rh)
  }

  // Soft fabric grain
  const grain = ctx.getImageData(0, 0, w, h)
  const data = grain.data
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 16
    data[i] = Math.max(0, Math.min(255, data[i] + n))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n))
  }
  ctx.putImageData(grain, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
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

  // Round globe pillow — Earth fabric map on a soft sphere
  const globeR = 0.16
  const globeMap = createGlobePillowTexture()
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(globeR, 48, 32),
    new THREE.MeshStandardMaterial({
      map: globeMap,
      roughness: 0.88,
      metalness: 0,
    }),
  )
  globe.scale.set(1.02, 0.92, 1.02) // slight sit-squash
  globe.rotation.y = 0.55 // Americas facing into the room
  globe.position.set(
    chaiseX + 0.12,
    pillowSeatY + globeR * 0.88,
    chaiseZ + 0.22,
  )
  globe.castShadow = true
  globe.receiveShadow = true
  group.add(globe)

  // Pulled back from the TV for clearer viewing distance
  group.position.set(-2.55, 0, 1.45)
  group.rotation.y = 0

  group.userData.centerX = -2.55
  group.userData.viewZ = 1.45

  return group
}
