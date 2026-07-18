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
  topSlab.receiveShadow = true
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

/** Album-sleeve art matching the Earworms CSS placeholder. */
function createSleeveArtTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Background — same 160° wash as .earworms-placeholder
  const bg = ctx.createLinearGradient(0, 0, size * 0.55, size)
  bg.addColorStop(0, '#1a2838')
  bg.addColorStop(0.45, '#0c1018')
  bg.addColorStop(1, '#2a1a14')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  // Soft vignette
  const vignette = ctx.createRadialGradient(
    size * 0.5,
    size * 0.42,
    size * 0.1,
    size * 0.5,
    size * 0.5,
    size * 0.72,
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.35)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, size, size)

  // Vinyl disc (matches .earworms-placeholder::before)
  const cx = size * 0.5
  const cy = size * 0.42
  const r = size * 0.21
  const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  disc.addColorStop(0, '#c45a3a')
  disc.addColorStop(0.18, '#c45a3a')
  disc.addColorStop(0.19, '#1a1210')
  disc.addColorStop(0.22, '#1a1210')
  disc.addColorStop(0.23, '#0a0a0c')
  disc.addColorStop(0.7, '#0a0a0c')
  disc.addColorStop(0.71, '#222222')
  disc.addColorStop(1, '#222222')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = disc
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Groove rings
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  for (const t of [0.35, 0.48, 0.58, 0.66]) {
    ctx.beginPath()
    ctx.arc(cx, cy, r * t, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Title lockup
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e8a05a'
  ctx.font = '600 22px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('NOW PLAYING', cx, size * 0.72)

  ctx.fillStyle = 'rgba(232, 238, 244, 0.7)'
  ctx.font = '500 28px "Fraunces", Georgia, serif'
  ctx.fillText('Earworms', cx, size * 0.8)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
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
  sleeve.receiveShadow = true
  record.add(sleeve)

  const disc = markInteractive(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.145, 0.003, 40),
      plastic(0x0a0a0c, { roughness: 0.35, metalness: 0.25 }),
    ),
  )
  disc.rotation.x = Math.PI / 2
  disc.position.set(0.06, 0, -0.01)
  disc.castShadow = true
  record.add(disc)

  const artMap = createSleeveArtTexture()
  const screenMat = new THREE.MeshStandardMaterial({
    map: artMap,
    color: 0xffffff,
    emissive: 0x1a2838,
    emissiveIntensity: 0.22,
    roughness: 0.85,
    metalness: 0,
  })
  const screen = markInteractive(
    new THREE.Mesh(new THREE.PlaneGeometry(sleeveW * 0.94, sleeveH * 0.94), screenMat),
  )
  screen.position.set(0, 0, sleeveD / 2 + 0.002)
  screen.name = 'screen'
  screen.castShadow = true
  screen.receiveShadow = true
  record.add(screen)

  // Soft contact shadow on the credenza under the upright sleeve
  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(sleeveW * 0.95, 0.09),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  )
  contact.rotation.x = -Math.PI / 2
  contact.position.set(0, -sleeveH / 2 - 0.002, 0.02)
  contact.userData.skipHover = true
  record.add(contact)

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

/** Bookshelf speaker for the credenza ends. */
function createSpeaker() {
  const speaker = new THREE.Group()
  speaker.name = 'speaker'

  const w = 0.2
  const h = 0.34
  const d = 0.22
  const cabMat = wood(0x3a2818)
  const baffleMat = plastic(0x1a1a1c, { roughness: 0.85 })
  const coneMat = plastic(0x2a2420, { roughness: 0.7 })
  const dustMat = plastic(0x4a4038, { roughness: 0.9 })
  const trimMat = plastic(0xb8b4ae, { metalness: 0.7, roughness: 0.35 })

  const cab = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cabMat)
  cab.position.y = h / 2
  cab.castShadow = true
  speaker.add(cab)

  const baffle = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.012, h - 0.012, 0.012),
    baffleMat,
  )
  baffle.position.set(0, h / 2, d / 2 + 0.002)
  speaker.add(baffle)

  // Woofer
  const woofer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.072, 0.014, 28),
    coneMat,
  )
  woofer.rotation.x = Math.PI / 2
  woofer.position.set(0, h * 0.38, d / 2 + 0.012)
  speaker.add(woofer)

  const dustCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.008, 16),
    dustMat,
  )
  dustCap.rotation.x = Math.PI / 2
  dustCap.position.set(0, h * 0.38, d / 2 + 0.02)
  speaker.add(dustCap)

  // Tweeter
  const tweeterRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.028, 0.03, 0.01, 20),
    trimMat,
  )
  tweeterRing.rotation.x = Math.PI / 2
  tweeterRing.position.set(0, h * 0.72, d / 2 + 0.012)
  speaker.add(tweeterRing)

  const tweeter = new THREE.Mesh(
    new THREE.SphereGeometry(0.016, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55),
    plastic(0xd8d4ce, { metalness: 0.4, roughness: 0.4 }),
  )
  tweeter.rotation.x = Math.PI / 2
  tweeter.position.set(0, h * 0.72, d / 2 + 0.018)
  speaker.add(tweeter)

  // Small badge / port hint
  const badge = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.012, 0.004),
    trimMat,
  )
  badge.position.set(0, h * 0.12, d / 2 + 0.01)
  speaker.add(badge)

  return speaker
}

export function createTurntable() {
  const group = new THREE.Group()
  group.name = 'turntable'

  const cabinet = createCabinet()
  group.add(cabinet)

  const topY = cabinet.userData.topY
  const halfW = cabinet.userData.width / 2

  // Bookshelf speakers on each end
  const speakerInset = 0.15
  const speakerW = 0.2
  const leftSpeakerX = -halfW + speakerInset
  const rightSpeakerX = halfW - speakerInset

  const leftSpeaker = createSpeaker()
  leftSpeaker.position.set(leftSpeakerX, topY, 0.01)
  leftSpeaker.rotation.y = 0.18
  group.add(leftSpeaker)

  const rightSpeaker = createSpeaker()
  rightSpeaker.position.set(rightSpeakerX, topY, 0.01)
  rightSpeaker.rotation.y = -0.18
  group.add(rightSpeaker)

  // Turntable + vinyl spaced evenly: speaker | gap | deck | gap | record | gap | speaker
  const deckW = 0.42
  const recordW = 0.4
  const innerLeft = leftSpeakerX + speakerW / 2
  const innerRight = rightSpeakerX - speakerW / 2
  const gap = (innerRight - innerLeft - deckW - recordW) / 3
  const deckX = innerLeft + gap + deckW / 2
  const recordX = deckX + deckW / 2 + gap + recordW / 2

  const deck = createDeck()
  deck.position.set(deckX, topY, 0.02)
  group.add(deck)

  const lid = markInteractive(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.008, 0.34),
      new THREE.MeshStandardMaterial({
        color: 0xb8c4cc,
        transparent: true,
        opacity: 0.28,
        roughness: 0.2,
        metalness: 0.05,
        depthWrite: false,
      }),
    ),
  )
  lid.position.set(deckX, topY + 0.18, -0.12)
  lid.rotation.x = -1.05
  group.add(lid)

  const upright = createUprightRecord()
  upright.position.set(recordX, topY + 0.2, 0.02)
  upright.rotation.y = 0
  upright.rotation.x = 0
  group.add(upright)

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
  const screen = turntable.userData.screen ?? turntable.getObjectByName('screen')
  turntable.userData.screen = screen
  if (screen?.material) {
    screen.material.emissiveIntensity = focused
      ? 0.1
      : 0.22 + Math.sin(elapsed * 1.2) * 0.06
  }

  if (focused) return

  if (!turntable.userData.spinParts) {
    turntable.userData.spinParts = ['platter', 'slipmat', 'deckVinyl', 'deckLabel']
      .map((name) => turntable.getObjectByName(name))
      .filter(Boolean)
  }

  const spin = elapsed * 0.9
  for (const part of turntable.userData.spinParts) {
    part.rotation.y = spin
  }
}
