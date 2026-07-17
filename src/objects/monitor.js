import * as THREE from 'three'

function markInteractive(mesh) {
  mesh.userData.interactive = 'monitor'
  return mesh
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

  const keyboard = markInteractive(
    new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.025, 0.18), bodyMat),
  )
  keyboard.position.set(0, 0.02, 0.35)
  keyboard.castShadow = true
  group.add(keyboard)

  // Facing into the room — desk sits under the main window
  group.position.set(0.5, 0.75, -3.35)
  group.rotation.y = 0

  return group
}

export function updateMonitor(monitor, elapsed, { focused = false } = {}) {
  const screen = monitor.getObjectByName('screen')
  if (screen?.material) {
    screen.material.emissiveIntensity = focused
      ? 0.15
      : 0.28 + Math.sin(elapsed * 1.4) * 0.08
  }
}
