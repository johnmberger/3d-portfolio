import * as THREE from 'three'

function markInteractive(mesh) {
  mesh.userData.interactive = 'monitor'
  return mesh
}

function createKeyboard(bodyMat, keyMat, accentMat) {
  const keyboard = new THREE.Group()
  keyboard.name = 'keyboard'

  const caseW = 0.52
  const caseD = 0.175
  const caseH = 0.018

  const chassis = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(caseW, caseH, caseD), bodyMat),
  )
  chassis.position.y = caseH / 2
  chassis.castShadow = true
  chassis.receiveShadow = true
  keyboard.add(chassis)

  // Slightly raised rear so the deck reads angled
  const wedge = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(caseW * 0.98, 0.008, caseD * 0.35), bodyMat),
  )
  wedge.position.set(0, caseH + 0.002, -caseD * 0.28)
  keyboard.add(wedge)

  const keyH = 0.007
  const keyY = caseH + keyH / 2 + 0.001
  const rows = [
    { z: -0.055, keys: 14, w: 0.028, gap: 0.004 },
    { z: -0.022, keys: 14, w: 0.028, gap: 0.004 },
    { z: 0.011, keys: 13, w: 0.03, gap: 0.004 },
    { z: 0.044, keys: 12, w: 0.03, gap: 0.004 },
  ]

  for (const row of rows) {
    const span = row.keys * row.w + (row.keys - 1) * row.gap
    const startX = -span / 2 + row.w / 2
    for (let i = 0; i < row.keys; i++) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(row.w * 0.92, keyH, 0.026),
        i === 0 && row.z === -0.055 ? accentMat : keyMat,
      )
      key.position.set(startX + i * (row.w + row.gap), keyY, row.z)
      key.castShadow = true
      keyboard.add(key)
    }
  }

  // Spacebar row
  const space = new THREE.Mesh(new THREE.BoxGeometry(0.2, keyH, 0.028), keyMat)
  space.position.set(0, keyY, 0.075)
  space.castShadow = true
  keyboard.add(space)

  for (const x of [-0.16, 0.16]) {
    const mod = new THREE.Mesh(new THREE.BoxGeometry(0.045, keyH, 0.028), keyMat)
    mod.position.set(x, keyY, 0.075)
    keyboard.add(mod)
  }
  for (const x of [-0.225, 0.225]) {
    const mod = new THREE.Mesh(new THREE.BoxGeometry(0.035, keyH, 0.028), accentMat)
    mod.position.set(x, keyY, 0.075)
    keyboard.add(mod)
  }

  // Slim cable stub out the back
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6),
    new THREE.MeshStandardMaterial({ color: 0x1a1c1b, roughness: 0.8 }),
  )
  cable.rotation.x = Math.PI / 2
  cable.position.set(0, caseH * 0.4, -caseD / 2 - 0.02)
  keyboard.add(cable)

  return keyboard
}

/** Flat aluminum trackpad (Magic Trackpad–style), replaces the old mouse. */
function createTrackpad() {
  const pad = new THREE.Group()
  pad.name = 'trackpad'

  const w = 0.13
  const d = 0.095
  const h = 0.008

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0xd8d6d2,
    roughness: 0.28,
    metalness: 0.65,
  })
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2c,
    roughness: 0.45,
    metalness: 0.15,
  })
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    roughness: 0.85,
    metalness: 0,
  })

  const shell = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(w, h, d), shellMat),
  )
  shell.position.y = h / 2
  shell.castShadow = true
  shell.receiveShadow = true
  pad.add(shell)

  // Slightly inset glass / click surface
  const surface = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(w - 0.01, 0.0015, d - 0.01), surfaceMat),
  )
  surface.position.y = h + 0.0005
  pad.add(surface)

  // Soft highlight strip along the front edge (charging / lip cue)
  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.02, 0.0012, 0.006),
    new THREE.MeshStandardMaterial({
      color: 0xe8e6e2,
      roughness: 0.22,
      metalness: 0.7,
    }),
  )
  lip.position.set(0, h + 0.0008, d / 2 - 0.008)
  pad.add(lip)

  // Tiny rubber feet
  for (const [x, z] of [
    [-w * 0.38, d * 0.35],
    [w * 0.38, d * 0.35],
    [-w * 0.38, -d * 0.35],
    [w * 0.38, -d * 0.35],
  ]) {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.005, 0.005, 0.002, 8),
      footMat,
    )
    foot.position.set(x, 0.001, z)
    pad.add(foot)
  }

  return pad
}

function createLaptop(shellMat, keyMat, accentMat) {
  const laptop = new THREE.Group()
  laptop.name = 'laptop'

  const w = 0.32
  const d = 0.22
  const baseH = 0.012

  const base = new THREE.Mesh(new THREE.BoxGeometry(w, baseH, d), shellMat)
  base.position.y = baseH / 2
  base.castShadow = true
  base.receiveShadow = true
  laptop.add(base)

  // Deck keys (simplified grid)
  const keyH = 0.004
  const keyY = baseH + keyH / 2 + 0.001
  for (let row = 0; row < 4; row++) {
    const cols = row === 3 ? 8 : 11
    const keyW = 0.02
    const span = cols * keyW + (cols - 1) * 0.003
    const startX = -span / 2 + keyW / 2
    const z = -0.02 + row * 0.028
    for (let c = 0; c < cols; c++) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(keyW * 0.9, keyH, 0.018),
        keyMat,
      )
      key.position.set(startX + c * (keyW + 0.003), keyY, z)
      laptop.add(key)
    }
  }

  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.002, 0.065),
    accentMat,
  )
  trackpad.position.set(0, baseH + 0.002, 0.065)
  laptop.add(trackpad)

  // Lid hinged at the back of the base — closed would lie over +Z; tip open toward user
  const lid = new THREE.Group()
  lid.position.set(0, baseH, -d / 2 + 0.002)
  lid.rotation.x = -1.15 // ~66° from flat ≈ open laptop
  laptop.add(lid)

  const lidShell = new THREE.Mesh(new THREE.BoxGeometry(w, 0.008, d), shellMat)
  lidShell.position.set(0, 0, d / 2)
  lidShell.castShadow = true
  lid.add(lidShell)

  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.018, 0.003, d - 0.018),
    accentMat,
  )
  bezel.position.set(0, 0.0055, d / 2)
  lid.add(bezel)

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(w - 0.036, d - 0.036),
    new THREE.MeshStandardMaterial({
      color: 0x142018,
      emissive: 0x2a4a38,
      emissiveIntensity: 0.45,
      roughness: 0.55,
      metalness: 0.05,
      side: THREE.DoubleSide,
    }),
  )
  // Face of lid (+Y in lid space before hinge tip) toward the keyboard / user
  screen.position.set(0, 0.0065, d / 2)
  screen.rotation.x = -Math.PI / 2
  lid.add(screen)

  // Camera bump along the top bezel
  const cam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8),
    accentMat,
  )
  cam.rotation.x = Math.PI / 2
  cam.position.set(0, 0.006, d - 0.012)
  lid.add(cam)

  return laptop
}

export function createMonitor() {
  const group = new THREE.Group()
  group.name = 'monitor'

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x2a2e2c,
    roughness: 0.55,
    metalness: 0.25,
  })
  const standMat = new THREE.MeshStandardMaterial({
    color: 0x3a3f3c,
    roughness: 0.5,
    metalness: 0.3,
  })
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x1a1c1b,
    roughness: 0.7,
    metalness: 0.1,
  })
  const keyMat = new THREE.MeshStandardMaterial({
    color: 0x3a3f3c,
    roughness: 0.65,
    metalness: 0.08,
  })
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x252826,
    roughness: 0.7,
    metalness: 0.05,
  })

  // Dark backing behind the CSS3D portfolio UI (not a zoom hotspot)
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0e1210,
    emissive: 0x1a2820,
    emissiveIntensity: 0.35,
    roughness: 0.85,
    metalness: 0.05,
  })

  const outerW = 0.95
  const outerH = 0.58
  const innerW = 0.85
  const innerH = 0.48
  const frameT = (outerW - innerW) / 2
  const frameDepth = 0.05
  const screenY = 0.42

  // Frame bezel only — screen opening is empty so center clicks miss the monitor
  const topBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(outerW, frameT, frameDepth), bezelMat),
  )
  topBezel.position.set(0, screenY + (innerH + frameT) / 2, 0)
  topBezel.castShadow = true
  group.add(topBezel)

  const bottomBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(outerW, frameT, frameDepth), bezelMat),
  )
  bottomBezel.position.set(0, screenY - (innerH + frameT) / 2, 0)
  bottomBezel.castShadow = true
  group.add(bottomBezel)

  const sideH = innerH
  const leftBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(frameT, sideH, frameDepth), bezelMat),
  )
  leftBezel.position.set(-(innerW + frameT) / 2, screenY, 0)
  leftBezel.castShadow = true
  group.add(leftBezel)

  const rightBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(frameT, sideH, frameDepth), bezelMat),
  )
  rightBezel.position.set((innerW + frameT) / 2, screenY, 0)
  rightBezel.castShadow = true
  group.add(rightBezel)

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), screenMat)
  screen.position.set(0, screenY, 0.028)
  screen.name = 'screen'
  markInteractive(screen)
  group.add(screen)

  // Easy-to-hit plane over the screen face
  const screenHit = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(innerW, innerH),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    ),
  )
  screenHit.position.set(0, screenY, 0.04)
  screenHit.name = 'screenHit'
  group.add(screenHit)

  // Solid rear shell — blocks seeing through the monitor from behind
  const backShell = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(outerW, outerH, 0.06), bodyMat),
  )
  backShell.position.set(0, screenY, -0.04)
  backShell.castShadow = true
  group.add(backShell)

  const neck = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.04), standMat),
  )
  neck.position.set(0, 0.1, -0.02)
  group.add(neck)

  const base = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.03, 24), standMat),
  )
  base.position.y = 0.015
  base.castShadow = true
  group.add(base)

  const keyboard = createKeyboard(bodyMat, keyMat, accentMat)
  keyboard.position.set(0, 0, 0.32)
  group.add(keyboard)

  const trackpad = createTrackpad()
  trackpad.position.set(0.38, 0, 0.34)
  trackpad.rotation.y = -0.08
  group.add(trackpad)

  const laptop = createLaptop(bodyMat, keyMat, accentMat)
  laptop.position.set(-0.68, 0, 0.12)
  laptop.rotation.y = 0.22
  group.add(laptop)

  // Match createModernDesk() center (cx=0.55, cz=-3.5); sit monitor on the rear half
  group.position.set(0.55, 0.75, -3.58)
  group.rotation.y = 0

  return group
}

export function updateMonitor(monitor, elapsed, { focused = false } = {}) {
  const screen = monitor.userData.screen ?? monitor.getObjectByName('screen')
  monitor.userData.screen = screen
  if (screen?.material) {
    screen.material.emissiveIntensity = focused
      ? 0.15
      : 0.28 + Math.sin(elapsed * 1.4) * 0.08
  }
}
