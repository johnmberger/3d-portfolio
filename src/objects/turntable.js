import * as THREE from 'three'

function markInteractive(mesh) {
  mesh.userData.interactive = 'turntable'
  return mesh
}

function wood(color = 0x6b4a32) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.72,
    metalness: 0.05,
  })
}

function plastic(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.15,
    ...props,
  })
}

/** Long, low mid-century credenza. */
function createCabinet() {
  const cabinet = new THREE.Group()
  cabinet.name = 'musicCabinet'

  const bodyMat = wood(0x5c3d28)
  const doorMat = wood(0x6e482e)
  const trimMat = wood(0x3d2818)
  const accentMat = wood(0x4a301c)

  // Long MCM proportions — wide console, low profile
  const w = 2.15
  const h = 0.58
  const d = 0.44

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), bodyMat)
  body.position.y = h / 2 + 0.1
  body.castShadow = true
  body.receiveShadow = true
  cabinet.add(body)

  // Thin top slab overhang (classic credenza detail)
  const topSlab = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.06, 0.028, d + 0.04),
    trimMat,
  )
  topSlab.position.y = h + 0.1 + 0.014
  topSlab.castShadow = true
  cabinet.add(topSlab)

  // Four door panels across the front
  const doorCount = 4
  const doorGap = 0.012
  const doorInset = 0.04
  const doorH = h - 0.1
  const doorW = (w - doorInset * 2 - doorGap * (doorCount - 1)) / doorCount
  const doorStartX = -w / 2 + doorInset + doorW / 2
  const knobMat = plastic(0xc4a46a, { metalness: 0.65, roughness: 0.32 })

  for (let i = 0; i < doorCount; i++) {
    const x = doorStartX + i * (doorW + doorGap)
    const panel = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, 0.028), doorMat)
    panel.position.set(x, h / 2 + 0.1, d / 2 + 0.004)
    panel.castShadow = true
    cabinet.add(panel)

    // Recessed vertical grain strip
    const reveal = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, doorH * 0.92, 0.006),
      accentMat,
    )
    reveal.position.set(x - doorW * 0.28, h / 2 + 0.1, d / 2 + 0.02)
    cabinet.add(reveal)

    // Small brass pull, centered on each door
    const pull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.055, 10),
      knobMat,
    )
    pull.rotation.z = Math.PI / 2
    pull.position.set(x + doorW * 0.22, h / 2 + 0.1, d / 2 + 0.028)
    cabinet.add(pull)
  }

  // Slim plinth shelf line under doors
  const kick = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.02, 0.02), accentMat)
  kick.position.set(0, 0.1 + 0.03, d / 2 + 0.01)
  cabinet.add(kick)

  // Tapered splayed peg legs
  const legH = 0.12
  const legGeo = new THREE.CylinderGeometry(0.012, 0.022, legH, 8)
  const legSpread = 0.035
  const legInsetX = 0.08
  const legInsetZ = 0.07
  for (const [lx, lz, splayX, splayZ] of [
    [-w / 2 + legInsetX, -d / 2 + legInsetZ, -legSpread, -legSpread],
    [w / 2 - legInsetX, -d / 2 + legInsetZ, legSpread, -legSpread],
    [-w / 2 + legInsetX, d / 2 - legInsetZ, -legSpread, legSpread],
    [w / 2 - legInsetX, d / 2 - legInsetZ, legSpread, legSpread],
  ]) {
    const leg = new THREE.Mesh(legGeo, trimMat)
    leg.position.set(lx + splayX * 0.35, legH / 2, lz + splayZ * 0.35)
    leg.rotation.z = splayX * 1.1
    leg.rotation.x = -splayZ * 1.1
    leg.castShadow = true
    cabinet.add(leg)
  }

  cabinet.userData.topY = h + 0.1 + 0.028
  cabinet.userData.width = w
  return cabinet
}

function createDeck() {
  const deck = new THREE.Group()
  deck.name = 'deck'

  const plinthMat = plastic(0x1a1a1c, { roughness: 0.65 })
  const metalMat = plastic(0xb8b4ae, { metalness: 0.75, roughness: 0.3 })
  const platterMat = plastic(0x222226, { roughness: 0.45, metalness: 0.35 })
  const matMat = plastic(0x2e1a18, { roughness: 0.9 })

  const plinth = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.045, 0.34), plinthMat),
  )
  plinth.position.y = 0.022
  plinth.castShadow = true
  deck.add(plinth)

  const platter = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.012, 48), platterMat),
  )
  platter.name = 'platter'
  platter.position.set(-0.04, 0.052, 0)
  platter.castShadow = true
  deck.add(platter)

  const slipmat = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.132, 0.132, 0.004, 48), matMat),
  )
  slipmat.name = 'slipmat'
  slipmat.position.set(-0.04, 0.06, 0)
  deck.add(slipmat)

  const vinylOnDeck = markInteractive(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.128, 0.128, 0.003, 48),
      plastic(0x0c0c0e, { roughness: 0.4, metalness: 0.2 }),
    ),
  )
  vinylOnDeck.name = 'deckVinyl'
  vinylOnDeck.position.set(-0.04, 0.064, 0)
  deck.add(vinylOnDeck)

  const label = markInteractive(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.0035, 24),
      plastic(0xc45a3a, { roughness: 0.7 }),
    ),
  )
  label.name = 'deckLabel'
  label.position.set(-0.04, 0.066, 0)
  deck.add(label)

  const spindle = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.018, 12), metalMat),
  )
  spindle.position.set(-0.04, 0.075, 0)
  deck.add(spindle)

  const armBase = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.02, 16), metalMat),
  )
  armBase.position.set(0.14, 0.055, 0.08)
  deck.add(armBase)

  const arm = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.008, 0.012), metalMat),
  )
  arm.position.set(0.05, 0.068, 0.04)
  arm.rotation.y = 0.55
  arm.rotation.z = -0.04
  deck.add(arm)

  const headshell = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.01, 0.018), plastic(0x2a2a2c)),
  )
  headshell.position.set(-0.02, 0.062, -0.02)
  headshell.rotation.y = 0.55
  deck.add(headshell)

  for (const [kx, kz] of [
    [0.14, -0.08],
    [0.14, -0.12],
  ]) {
    const knob = markInteractive(
      new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), metalMat),
    )
    knob.position.set(kx, 0.05, kz)
    deck.add(knob)
  }

  return deck
}

/** Upright LP sleeve — front face is the zoom / iframe target. */
function createUprightRecord() {
  const record = new THREE.Group()
  record.name = 'uprightRecord'

  const sleeveW = 0.4
  const sleeveH = 0.4
  const sleeveD = 0.012

  const sleeveMat = new THREE.MeshStandardMaterial({
    color: 0x1a2430,
    roughness: 0.75,
    metalness: 0.05,
  })
  const sleeve = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(sleeveW, sleeveH, sleeveD), sleeveMat),
  )
  sleeve.castShadow = true
  record.add(sleeve)

  const stripe = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(sleeveW * 0.92, 0.06),
      new THREE.MeshStandardMaterial({
        color: 0xe8a05a,
        roughness: 0.6,
        metalness: 0.05,
        emissive: 0x3a2010,
        emissiveIntensity: 0.15,
      }),
    ),
  )
  stripe.position.set(0, 0.08, sleeveD / 2 + 0.001)
  record.add(stripe)

  const titleBand = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(sleeveW * 0.7, 0.035),
      new THREE.MeshStandardMaterial({
        color: 0xd8e0e8,
        roughness: 0.7,
        metalness: 0,
      }),
    ),
  )
  titleBand.position.set(0, -0.12, sleeveD / 2 + 0.001)
  record.add(titleBand)

  const disc = markInteractive(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.145, 0.003, 40),
      plastic(0x0a0a0c, { roughness: 0.35, metalness: 0.25 }),
    ),
  )
  disc.rotation.x = Math.PI / 2
  disc.position.set(0.06, 0, -0.01)
  record.add(disc)

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0c1018,
    emissive: 0x152030,
    emissiveIntensity: 0.25,
    roughness: 0.9,
    metalness: 0,
  })
  const screen = markInteractive(
    new THREE.Mesh(new THREE.PlaneGeometry(sleeveW, sleeveH), screenMat),
  )
  screen.position.set(0, 0, sleeveD / 2 + 0.002)
  screen.name = 'screen'
  record.add(screen)

  const screenHit = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(sleeveW, sleeveH),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    ),
  )
  screenHit.position.set(0, 0, sleeveD / 2 + 0.01)
  screenHit.name = 'screenHit'
  record.add(screenHit)

  return record
}

function createExtraSleeve(color, lean = 0) {
  const sleeve = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.32, 0.01),
    wood(color),
  )
  sleeve.castShadow = true
  sleeve.rotation.y = lean
  return sleeve
}

export function createTurntable() {
  const group = new THREE.Group()
  group.name = 'turntable'

  const cabinet = createCabinet()
  group.add(cabinet)

  const topY = cabinet.userData.topY
  const halfW = cabinet.userData.width / 2

  // Deck sits on the left third of the long top
  const deck = createDeck()
  deck.position.set(-halfW + 0.38, topY, 0.02)
  group.add(deck)

  const lid = markInteractive(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.008, 0.34),
      new THREE.MeshPhysicalMaterial({
        color: 0xb8c4cc,
        transparent: true,
        opacity: 0.35,
        roughness: 0.15,
        metalness: 0.05,
        transmission: 0.4,
        thickness: 0.02,
      }),
    ),
  )
  lid.position.set(-halfW + 0.38, topY + 0.18, -0.12)
  lid.rotation.x = -1.05
  group.add(lid)

  // Interactive upright LP toward the right
  const upright = createUprightRecord()
  upright.position.set(halfW - 0.42, topY + 0.2, 0.02)
  upright.rotation.y = 0
  upright.rotation.x = 0
  group.add(upright)

  // Extra decorative sleeves stacked beside it
  const stack = new THREE.Group()
  stack.position.set(halfW - 0.78, topY + 0.16, 0)
  const sleeveA = createExtraSleeve(0x2a3a48, 0.08)
  sleeveA.position.set(0.02, 0, -0.01)
  stack.add(sleeveA)
  const sleeveB = createExtraSleeve(0x5a3028, -0.06)
  sleeveB.position.set(-0.04, 0, 0.01)
  stack.add(sleeveB)
  const sleeveC = createExtraSleeve(0x3a4a30, 0.14)
  sleeveC.position.set(0.08, 0, -0.02)
  stack.add(sleeveC)
  group.add(stack)

  // Against the back wall, left of the window — vinyl faces into the room
  group.position.set(-2.85, 0, -3.45)
  group.rotation.y = 0

  // Whole unit is a hotspot: credenza, deck, lids, and records
  group.traverse((obj) => {
    if (obj.isMesh) markInteractive(obj)
  })

  return group
}

export function updateTurntable(turntable, elapsed, { focused = false } = {}) {
  const screen = turntable.getObjectByName('screen')
  if (screen?.material) {
    screen.material.emissiveIntensity = focused
      ? 0.1
      : 0.22 + Math.sin(elapsed * 1.2) * 0.06
  }

  if (focused) return

  const spin = elapsed * 0.9
  for (const name of ['platter', 'slipmat', 'deckVinyl', 'deckLabel']) {
    const part = turntable.getObjectByName(name)
    if (part) part.rotation.y = spin
  }
}
