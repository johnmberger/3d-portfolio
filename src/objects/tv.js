import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.15,
    ...props,
  })
}

/**
 * Slim wall-mounted TV with a soft screen glow and a low media shelf.
 * Front-left nook — faces into the room from the +Z wall.
 */
export function createTV() {
  const group = new THREE.Group()
  group.name = 'tv'

  const frame = mat(0x1a1c1e, { roughness: 0.4, metalness: 0.35 })
  const bezel = mat(0x0c0d0e, { roughness: 0.35, metalness: 0.25 })
  const wood = mat(0x6b5340, { roughness: 0.7, metalness: 0.05 })

  const screenW = 1.95
  const screenH = 1.1
  const screenY = 1.5

  // Outer frame
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(screenW + 0.06, screenH + 0.06, 0.05),
    frame,
  )
  chassis.position.set(0, screenY, 0)
  chassis.castShadow = true
  group.add(chassis)

  const inset = new THREE.Mesh(
    new THREE.BoxGeometry(screenW, screenH, 0.02),
    bezel,
  )
  inset.position.set(0, screenY, 0.018)
  group.add(inset)

  // Screen — subtle cool emissive so it reads as “on”
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW - 0.04, screenH - 0.04),
    new THREE.MeshStandardMaterial({
      color: 0x1a2838,
      emissive: 0x3a6a8a,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.15,
    }),
  )
  screen.position.set(0, screenY, 0.032)
  screen.name = 'tvScreen'
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
  const console = new THREE.Mesh(
    new THREE.BoxGeometry(consoleW, consoleH, consoleD),
    wood,
  )
  console.position.set(0, consoleH / 2, 0.14)
  console.castShadow = true
  console.receiveShadow = true
  group.add(console)

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
  const bar = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.055, 0.09),
    mat(0x1e2022, { roughness: 0.45, metalness: 0.3 }),
  )
  bar.position.set(0, consoleH + 0.04, 0.14 + consoleD / 2 - 0.02)
  bar.castShadow = true
  group.add(bar)

  // Slightly left of the sectional center, on the +Z wall
  group.position.set(-2.9, 0, WALL_POS - 0.08)
  group.rotation.y = Math.PI

  return group
}

export function updateTV(tv, elapsed) {
  const screen = tv.getObjectByName('tvScreen')
  if (screen?.material) {
    screen.material.emissiveIntensity = 0.32 + Math.sin(elapsed * 0.7) * 0.04
  }
}
