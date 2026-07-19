import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    ...props,
  })
}

/** Keep in sync with createFrontWall door in room.js */
const DOOR_CENTER_X = 0.4
const DOOR_W = 0.92

/**
 * Classic wall rocker switch — click toggles sunset / night.
 * Mounted on the +Z front wall, left of the entrance door.
 */
export function createLightSwitch() {
  const group = new THREE.Group()
  group.name = 'lightSwitch'

  const plateMat = mat(0xe8e4dc, { roughness: 0.7 })
  const rockerMat = mat(0xf4f1ea, { roughness: 0.45 })
  const screwMat = mat(0xc8c4bc, { metalness: 0.35, roughness: 0.4 })
  const s = 1.35 // overall scale bump

  // Wall plate
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.08 * s, 0.125 * s, 0.012 * s),
    plateMat,
  )
  plate.castShadow = true
  plate.receiveShadow = true
  plate.userData.interactive = 'lightSwitch'
  group.add(plate)

  // Slight bevel lip
  const lip = new THREE.Mesh(
    new THREE.BoxGeometry(0.072 * s, 0.115 * s, 0.004 * s),
    mat(0xddd8d0, { roughness: 0.65 }),
  )
  lip.position.z = 0.007 * s
  lip.userData.interactive = 'lightSwitch'
  group.add(lip)

  // Rocker paddle — pivots at center; top pressed = sunset, bottom = night
  const rocker = new THREE.Group()
  rocker.name = 'rocker'
  rocker.position.z = 0.014 * s

  const paddle = new THREE.Mesh(
    new THREE.BoxGeometry(0.048 * s, 0.078 * s, 0.014 * s),
    rockerMat,
  )
  paddle.castShadow = true
  paddle.userData.interactive = 'lightSwitch'
  rocker.add(paddle)

  // Center ridge
  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(0.046 * s, 0.004 * s, 0.015 * s),
    mat(0xd8d2c8, { roughness: 0.5 }),
  )
  ridge.userData.interactive = 'lightSwitch'
  rocker.add(ridge)

  group.add(rocker)
  group.userData.rocker = rocker

  // Screws
  for (const y of [0.048 * s, -0.048 * s]) {
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004 * s, 0.004 * s, 0.003 * s, 10),
      screwMat,
    )
    screw.rotation.x = Math.PI / 2
    screw.position.set(0, y, 0.008 * s)
    screw.userData.interactive = 'lightSwitch'
    group.add(screw)
  }

  // Invisible larger hit target
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14 * s, 0.2 * s),
    new THREE.MeshBasicMaterial({ visible: false }),
  )
  hit.position.z = 0.02 * s
  hit.userData.interactive = 'lightSwitch'
  hit.userData.skipHover = true
  group.add(hit)

  // Front wall (+Z), left of the entrance door, a little farther from the jamb
  const openL = DOOR_CENTER_X - DOOR_W / 2
  group.position.set(openL - 0.18, 1.22, WALL_POS - 0.01)
  group.rotation.y = Math.PI // face into the room (−Z)

  setRockerPose(group, false)
  return group
}

function setRockerPose(switchGroup, isNight) {
  const rocker = switchGroup.userData.rocker
  if (!rocker) return
  // Local +Z faces into the room. Positive rotation.x tips the top toward the room
  // (bottom pressed into the wall). Negative = top pressed in (up / on).
  // Sunset = UP, night = DOWN
  const tilt = 0.32
  rocker.rotation.x = isNight ? tilt : -tilt
}

export function updateLightSwitch(switchGroup, { night = false } = {}) {
  if (switchGroup.userData.switchNight === night) return
  switchGroup.userData.switchNight = night
  setRockerPose(switchGroup, night)
}
