import * as THREE from 'three'

function markInteractive(mesh) {
  mesh.userData.interactive = 'monitor'
  return mesh
}

function keycapMat(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.04,
  })
}

/** Compact mechanical board with a colorful keycap set. */
function createKeyboard() {
  const keyboard = new THREE.Group()
  keyboard.name = 'keyboard'

  const caseW = 0.52
  const caseD = 0.175
  const caseH = 0.02

  const caseMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e22,
    roughness: 0.62,
    metalness: 0.12,
  })
  // GMK-style set: cream alphas, coral mods, teal accents, mustard space
  const alphaMat = keycapMat(0xf2e6d4)
  const modMat = keycapMat(0xe07a5f)
  const accentMat = keycapMat(0x3d9b8f)
  const spaceMat = keycapMat(0xe9c46a)
  const escMat = keycapMat(0xf4a261)

  const chassis = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(caseW, caseH, caseD), caseMat),
  )
  chassis.position.y = caseH / 2
  chassis.castShadow = true
  chassis.receiveShadow = true
  keyboard.add(chassis)

  // Slightly raised rear so the deck reads angled
  const wedge = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(caseW * 0.98, 0.008, caseD * 0.35), caseMat),
  )
  wedge.position.set(0, caseH + 0.002, -caseD * 0.28)
  keyboard.add(wedge)

  const keyH = 0.01
  const keyY = caseH + keyH / 2 + 0.001
  const keyD = 0.027

  function addKey(w, x, z, mat) {
    const key = new THREE.Mesh(new THREE.BoxGeometry(w, keyH, keyD), mat)
    key.position.set(x, keyY, z)
    key.castShadow = true
    keyboard.add(key)
  }

  // Number row — Esc + digits + Backspace
  {
    const z = -0.055
    const specs = [
      { w: 0.032, mat: escMat },
      ...Array.from({ length: 12 }, () => ({ w: 0.028, mat: alphaMat })),
      { w: 0.05, mat: modMat },
    ]
    const gap = 0.0035
    const span = specs.reduce((s, k) => s + k.w, 0) + (specs.length - 1) * gap
    let x = -span / 2
    for (const { w, mat } of specs) {
      addKey(w * 0.94, x + w / 2, z, mat)
      x += w + gap
    }
  }

  // QWERTY — Tab + letters + Enter
  {
    const z = -0.022
    const specs = [
      { w: 0.042, mat: modMat },
      ...Array.from({ length: 12 }, () => ({ w: 0.028, mat: alphaMat })),
      { w: 0.05, mat: accentMat },
    ]
    const gap = 0.0035
    const span = specs.reduce((s, k) => s + k.w, 0) + (specs.length - 1) * gap
    let x = -span / 2
    for (const { w, mat } of specs) {
      addKey(w * 0.94, x + w / 2, z, mat)
      x += w + gap
    }
  }

  // Home row — Caps + letters + Enter
  {
    const z = 0.011
    const specs = [
      { w: 0.05, mat: modMat },
      ...Array.from({ length: 11 }, () => ({ w: 0.028, mat: alphaMat })),
      { w: 0.06, mat: accentMat },
    ]
    const gap = 0.0035
    const span = specs.reduce((s, k) => s + k.w, 0) + (specs.length - 1) * gap
    let x = -span / 2
    for (const { w, mat } of specs) {
      addKey(w * 0.94, x + w / 2, z, mat)
      x += w + gap
    }
  }

  // Bottom letter row — Shift + letters + Shift
  {
    const z = 0.044
    const specs = [
      { w: 0.065, mat: modMat },
      ...Array.from({ length: 10 }, () => ({ w: 0.028, mat: alphaMat })),
      { w: 0.065, mat: modMat },
    ]
    const gap = 0.0035
    const span = specs.reduce((s, k) => s + k.w, 0) + (specs.length - 1) * gap
    let x = -span / 2
    for (const { w, mat } of specs) {
      addKey(w * 0.94, x + w / 2, z, mat)
      x += w + gap
    }
  }

  // Modifier / spacebar row
  const zSpace = 0.075
  addKey(0.04, -0.225, zSpace, accentMat)
  addKey(0.04, -0.175, zSpace, modMat)
  addKey(0.04, -0.125, zSpace, modMat)
  addKey(0.2, 0, zSpace, spaceMat)
  addKey(0.04, 0.125, zSpace, modMat)
  addKey(0.04, 0.175, zSpace, modMat)
  addKey(0.04, 0.225, zSpace, accentMat)

  // Slim coiled-cable stub out the back
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6),
    new THREE.MeshStandardMaterial({ color: 0x3d9b8f, roughness: 0.55, metalness: 0.1 }),
  )
  cable.rotation.x = Math.PI / 2
  cable.position.set(0, caseH * 0.4, -caseD / 2 - 0.02)
  keyboard.add(cable)

  return keyboard
}

/** Space Black Magic Trackpad–style. */
function createTrackpad() {
  const pad = new THREE.Group()
  pad.name = 'trackpad'

  const w = 0.135
  const d = 0.1
  const h = 0.007

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    roughness: 0.32,
    metalness: 0.55,
  })
  const surfaceMat = new THREE.MeshStandardMaterial({
    color: 0x0c0c0e,
    roughness: 0.38,
    metalness: 0.2,
  })
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x050506,
    roughness: 0.9,
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

  // Soft front lip
  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.022, 0.001, 0.005),
    new THREE.MeshStandardMaterial({
      color: 0x2a2a2e,
      roughness: 0.28,
      metalness: 0.6,
    }),
  )
  lip.position.set(0, h + 0.0006, d / 2 - 0.007)
  pad.add(lip)

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

/** Open MacBook Pro–style (Space Black). */
function createLaptop() {
  const laptop = new THREE.Group()
  laptop.name = 'laptop'

  // 14" MBP-ish proportions
  const w = 0.31
  const d = 0.22
  const baseH = 0.01
  const lidT = 0.007

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x2c2c2e,
    roughness: 0.28,
    metalness: 0.72,
  })
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    roughness: 0.45,
    metalness: 0.4,
  })
  const keyMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3e,
    roughness: 0.55,
    metalness: 0.25,
  })
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x0a1218,
    emissive: 0x1a3040,
    emissiveIntensity: 0.45,
    roughness: 0.35,
    metalness: 0.05,
  })
  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x0c0c0e,
    roughness: 0.5,
    metalness: 0.2,
  })
  const logoMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3e,
    roughness: 0.22,
    metalness: 0.85,
    emissive: 0x2a2a2e,
    emissiveIntensity: 0.12,
  })

  // Bottom chassis
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, baseH, d), shellMat)
  base.position.y = baseH / 2
  base.castShadow = true
  base.receiveShadow = true
  laptop.add(base)

  // Keyboard deck inset
  const deck = new THREE.Mesh(new THREE.BoxGeometry(w * 0.94, 0.002, d * 0.88), deckMat)
  deck.position.set(0, baseH + 0.001, 0.005)
  laptop.add(deck)

  // Key grid suggestion
  const keyRows = 4
  const keysPerRow = 12
  const keyW = 0.018
  const keyD = 0.014
  const keyGapX = 0.003
  const keyGapZ = 0.004
  const gridW = keysPerRow * keyW + (keysPerRow - 1) * keyGapX
  const keyStartX = -gridW / 2 + keyW / 2
  const keyStartZ = -0.055
  for (let r = 0; r < keyRows; r++) {
    for (let c = 0; c < keysPerRow; c++) {
      const key = new THREE.Mesh(
        new THREE.BoxGeometry(keyW * 0.9, 0.003, keyD * 0.88),
        keyMat,
      )
      key.position.set(
        keyStartX + c * (keyW + keyGapX),
        baseH + 0.0035,
        keyStartZ + r * (keyD + keyGapZ),
      )
      laptop.add(key)
    }
  }

  // Trackpad
  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.0015, 0.07),
    new THREE.MeshStandardMaterial({
      color: 0x242426,
      roughness: 0.35,
      metalness: 0.35,
    }),
  )
  trackpad.position.set(0, baseH + 0.0025, 0.075)
  laptop.add(trackpad)

  // Rubber feet
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a,
    roughness: 0.95,
  })
  for (const [x, z] of [
    [-w * 0.4, d * 0.38],
    [w * 0.4, d * 0.38],
    [-w * 0.4, -d * 0.38],
    [w * 0.4, -d * 0.38],
  ]) {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.002, 8),
      footMat,
    )
    foot.position.set(x, 0.001, z)
    laptop.add(foot)
  }

  // Lid hinged at the rear of the base, open ~105°
  const lid = new THREE.Group()
  lid.name = 'laptopLid'
  lid.position.set(0, baseH, -d / 2)
  lid.rotation.x = -Math.PI * 0.58

  const lidShell = new THREE.Mesh(new THREE.BoxGeometry(w, lidT, d), shellMat)
  lidShell.position.set(0, lidT / 2, d / 2)
  lidShell.castShadow = true
  lidShell.receiveShadow = true
  lid.add(lidShell)

  // Inner bezel + glowing screen (faces the keyboard when open)
  const bezel = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.0012, d * 0.94), bezelMat)
  bezel.position.set(0, -0.0004, d / 2)
  lid.add(bezel)

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.88, 0.001, d * 0.82),
    screenMat,
  )
  screen.position.set(0, -0.0012, d / 2 + 0.004)
  lid.add(screen)

  // Faint Apple-logo cue on the outer lid
  const logo = new THREE.Mesh(new THREE.CircleGeometry(0.012, 20), logoMat)
  logo.rotation.x = Math.PI / 2
  logo.position.set(0, lidT + 0.0005, d / 2)
  lid.add(logo)

  laptop.add(lid)

  return laptop
}

/** Compact bar webcam that clips onto the top of a monitor. */
function createWebcam() {
  const cam = new THREE.Group()
  cam.name = 'webcam'

  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1c,
    roughness: 0.4,
    metalness: 0.35,
  })
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0c,
    roughness: 0.55,
    metalness: 0.2,
  })
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1a2830,
    roughness: 0.15,
    metalness: 0.4,
    emissive: 0x0a1520,
    emissiveIntensity: 0.15,
  })
  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2e,
    emissive: 0x3a8a4a,
    emissiveIntensity: 0.55,
    roughness: 0.4,
  })

  // Main bar body
  const body = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.028, 0.028), shellMat),
  )
  body.position.y = 0.02
  body.castShadow = true
  cam.add(body)

  // Rounded lens housing
  const lensRing = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.008, 16), darkMat),
  )
  lensRing.rotation.x = Math.PI / 2
  lensRing.position.set(0, 0.02, 0.016)
  cam.add(lensRing)

  const lens = markInteractive(
    new THREE.Mesh(new THREE.CircleGeometry(0.008, 16), glassMat),
  )
  lens.position.set(0, 0.02, 0.021)
  cam.add(lens)

  // Activity LED
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.0025, 10), ledMat)
  led.position.set(0.028, 0.02, 0.015)
  cam.add(led)

  // Clip that hooks over the top bezel
  const clipBack = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.018, 0.012), shellMat),
  )
  clipBack.position.set(0, 0.004, -0.016)
  cam.add(clipBack)

  const clipHook = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.022), shellMat),
  )
  clipHook.position.set(0, -0.006, -0.01)
  cam.add(clipHook)

  return cam
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
  // Nudge display toward the back edge of the desk (keyboard stays forward)
  const monitorZ = -0.08

  // Frame bezel only — screen opening is empty so center clicks miss the monitor
  const topBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(outerW, frameT, frameDepth), bezelMat),
  )
  topBezel.position.set(0, screenY + (innerH + frameT) / 2, monitorZ)
  topBezel.castShadow = true
  group.add(topBezel)

  const bottomBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(outerW, frameT, frameDepth), bezelMat),
  )
  bottomBezel.position.set(0, screenY - (innerH + frameT) / 2, monitorZ)
  bottomBezel.castShadow = true
  group.add(bottomBezel)

  const sideH = innerH
  const leftBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(frameT, sideH, frameDepth), bezelMat),
  )
  leftBezel.position.set(-(innerW + frameT) / 2, screenY, monitorZ)
  leftBezel.castShadow = true
  group.add(leftBezel)

  const rightBezel = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(frameT, sideH, frameDepth), bezelMat),
  )
  rightBezel.position.set((innerW + frameT) / 2, screenY, monitorZ)
  rightBezel.castShadow = true
  group.add(rightBezel)

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(innerW, innerH), screenMat)
  screen.position.set(0, screenY, monitorZ + 0.028)
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
  screenHit.position.set(0, screenY, monitorZ + 0.04)
  screenHit.name = 'screenHit'
  group.add(screenHit)

  // Solid rear shell — blocks seeing through the monitor from behind
  const backShell = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(outerW, outerH, 0.06), bodyMat),
  )
  backShell.position.set(0, screenY, monitorZ - 0.04)
  backShell.castShadow = true
  group.add(backShell)

  const neck = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.04), standMat),
  )
  neck.position.set(0, 0.1, monitorZ - 0.02)
  group.add(neck)

  const base = markInteractive(
    new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.025, 24), standMat),
  )
  base.position.set(0, 0.0125, monitorZ)
  base.castShadow = true
  group.add(base)

  // Webcam perched on the top bezel
  const topBezelY = screenY + (innerH + frameT) / 2
  const webcam = createWebcam()
  webcam.position.set(0, topBezelY + frameT / 2, monitorZ + 0.01)
  group.add(webcam)

  const keyboard = createKeyboard()
  keyboard.position.set(0, 0, 0.32)
  group.add(keyboard)

  const trackpad = createTrackpad()
  trackpad.position.set(0.38, 0, 0.34)
  trackpad.rotation.y = -0.08
  group.add(trackpad)

  const laptop = createLaptop()
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
