import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'
import { createSnakePlant } from './plants.js'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.15,
    ...props,
  })
}

function markInteractive(mesh) {
  mesh.userData.interactive = 'tv'
  return mesh
}

/**
 * Slim wall-mounted TV with a soft screen glow and a low media shelf.
 * Front-left nook — faces into the room from the +Z wall.
 * Clickable: zooms into a news-broadcast explainer about the apartment.
 */
export function createTV() {
  const group = new THREE.Group()
  group.name = 'tv'

  const frame = mat(0x1a1c1e, { roughness: 0.4, metalness: 0.35 })
  const bezel = mat(0x0c0d0e, { roughness: 0.35, metalness: 0.25 })
  const wood = mat(0x6b5340, { roughness: 0.7, metalness: 0.05 })

  const screenW = 1.95
  const screenH = 1.1
  const panelW = screenW - 0.04
  const panelH = screenH - 0.04
  const screenY = 1.5

  group.userData.screenSize = { width: panelW, height: panelH, fill: 0.82 }

  // Outer frame
  const chassis = markInteractive(
    new THREE.Mesh(
      new THREE.BoxGeometry(screenW + 0.06, screenH + 0.06, 0.05),
      frame,
    ),
  )
  chassis.position.set(0, screenY, 0)
  chassis.castShadow = true
  group.add(chassis)

  const inset = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(screenW, screenH, 0.02), bezel),
  )
  inset.position.set(0, screenY, 0.018)
  group.add(inset)

  const screen = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(panelW, panelH),
      new THREE.MeshStandardMaterial({
        color: 0x1a2838,
        emissive: 0x3a6a8a,
        emissiveIntensity: 0.22,
        roughness: 0.35,
        metalness: 0.12,
      }),
    ),
  )
  screen.position.set(0, screenY, 0.032)
  screen.name = 'screen'
  group.add(screen)

  // Soft fill into the room (+Z local; group faces into room after Math.PI yaw)
  const glow = new THREE.PointLight(0x6a9abb, 0.55, 5.2, 2)
  glow.position.set(0, screenY, 0.55)
  group.add(glow)

  // Wall mount bracket (barely visible, toward the wall)
  const bracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.14, 0.04),
    mat(0x2a2c2e, { metalness: 0.6, roughness: 0.35 }),
  )
  bracket.position.set(0, screenY, -0.03)
  group.add(bracket)

  // Low media console under the TV
  const consoleW = 1.65
  const consoleH = 0.4
  const consoleD = 0.38
  const mediaConsole = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(consoleW, consoleH, consoleD), wood),
  )
  mediaConsole.position.set(0, consoleH / 2, 0.14)
  mediaConsole.castShadow = true
  mediaConsole.receiveShadow = true
  group.add(mediaConsole)

  // Slim drawer line
  const drawer = new THREE.Mesh(
    new THREE.BoxGeometry(consoleW - 0.12, 0.015, 0.01),
    mat(0x4a3a2c, { roughness: 0.65 }),
  )
  drawer.position.set(0, consoleH * 0.55, 0.14 + consoleD / 2 + 0.004)
  group.add(drawer)

  for (const x of [-0.32, 0.32]) {
    const pull = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.012, 0.012),
      mat(0xc8cdd2, { metalness: 0.8, roughness: 0.3 }),
    )
    pull.position.set(x, consoleH * 0.55, 0.14 + consoleD / 2 + 0.014)
    group.add(pull)
  }

  // Soundbar
  const bar = markInteractive(
    new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.055, 0.09),
      mat(0x1e2022, { roughness: 0.45, metalness: 0.3 }),
    ),
  )
  bar.position.set(0, consoleH + 0.04, 0.14 + consoleD / 2 - 0.02)
  bar.castShadow = true
  group.add(bar)

  // Xbox Series X — tall tower on the right end of the console
  const xbox = createXboxSeriesX()
  xbox.position.set(0.72, consoleH, 0.14)
  group.add(xbox)

  // Small plant on the opposite end
  const tvPlant = createSnakePlant({
    potColor: 0xc4683a,
    leafCount: 5,
    potScale: 0.38,
    height: 0.36,
  })
  tvPlant.name = 'tvConsolePlant'
  tvPlant.position.set(-0.72, consoleH, 0.14)
  tvPlant.rotation.y = -0.4
  group.add(tvPlant)

  // Centered on the sectional’s main run (the seats facing the TV, opposite the chaise)
  group.position.set(-2.05, 0, WALL_POS - 0.08)
  group.rotation.y = Math.PI

  return group
}

/** Tall matte-black Series X tower (approx. 1:1 desk-scale proportions). */
function createXboxSeriesX() {
  const xbox = new THREE.Group()
  xbox.name = 'xboxSeriesX'

  const chassisMat = mat(0x1a1a1c, { roughness: 0.55, metalness: 0.2 })
  const darkMat = mat(0x0e0e10, { roughness: 0.45, metalness: 0.25 })
  const ventMat = mat(0x2a2a2e, { roughness: 0.4, metalness: 0.35 })
  const slotMat = mat(0x050506, { roughness: 0.85 })
  // Power button — dark Xbox pill, subtle on glow (not a big green badge)
  const powerMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c1e,
    emissive: 0x1a3a1a,
    emissiveIntensity: 0.2,
    roughness: 0.35,
    metalness: 0.25,
  })

  // Body ~15×15×30 cm
  const w = 0.15
  const d = 0.15
  const h = 0.3
  const frontZ = d / 2 + 0.002

  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), chassisMat)
  body.position.y = h / 2
  body.castShadow = true
  body.receiveShadow = true
  xbox.add(body)

  // Front face plate (slight inset)
  const face = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.94, h * 0.97, 0.004),
    darkMat,
  )
  face.position.set(0, h / 2, frontZ - 0.001)
  xbox.add(face)

  // Power button — top-left of the front (real Series X placement)
  const power = new THREE.Mesh(new THREE.CircleGeometry(0.009, 20), powerMat)
  power.position.set(-w * 0.28, h * 0.88, frontZ + 0.002)
  xbox.add(power)

  // Thin horizontal disc slot under the power button
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.42, 0.0035, 0.005),
    slotMat,
  )
  slot.position.set(-w * 0.12, h * 0.78, frontZ + 0.002)
  xbox.add(slot)

  // Small eject nub beside the slot
  const eject = new THREE.Mesh(
    new THREE.CircleGeometry(0.004, 12),
    mat(0x18181a, { roughness: 0.5, metalness: 0.3 }),
  )
  eject.position.set(w * 0.14, h * 0.78, frontZ + 0.002)
  xbox.add(eject)

  // Pairing button + USB cue near bottom-right
  const sync = new THREE.Mesh(
    new THREE.CircleGeometry(0.005, 12),
    mat(0x222226, { roughness: 0.45 }),
  )
  sync.position.set(w * 0.28, h * 0.12, frontZ + 0.002)
  xbox.add(sync)

  const usb = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, 0.008, 0.004),
    slotMat,
  )
  usb.position.set(w * 0.12, h * 0.12, frontZ + 0.002)
  xbox.add(usb)

  // Top vent — Series X “X” grille cue
  const ventPlate = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.92, 0.004, d * 0.92),
    ventMat,
  )
  ventPlate.position.y = h + 0.002
  xbox.add(ventPlate)

  const ventBarMat = mat(0x121214, { roughness: 0.5, metalness: 0.3 })
  for (const angle of [Math.PI / 4, -Math.PI / 4]) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.78, 0.005, 0.018),
      ventBarMat,
    )
    bar.position.y = h + 0.005
    bar.rotation.y = angle
    xbox.add(bar)
  }

  // Side intake slits (left)
  for (let i = 0; i < 5; i++) {
    const slit = new THREE.Mesh(
      new THREE.BoxGeometry(0.004, h * 0.1, d * 0.55),
      darkMat,
    )
    slit.position.set(-w / 2 - 0.001, h * (0.25 + i * 0.12), 0)
    xbox.add(slit)
  }

  return xbox
}

export function updateTV(tv, elapsed, { focused = false } = {}) {
  const screen = tv.userData.tvScreen ?? tv.getObjectByName('screen')
  tv.userData.tvScreen = screen
  if (screen?.material) {
    screen.material.emissiveIntensity = focused
      ? 0.32
      : 0.2 + Math.sin(elapsed * 0.7) * 0.035
  }
}
