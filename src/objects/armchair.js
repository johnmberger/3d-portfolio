import * as THREE from 'three'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.02,
    ...props,
  })
}

/**
 * Compact lounge chair — same fabric language as the couch/sectional.
 * Pass position/rotation to place variants (TV nook, listening chair, etc.).
 */
export function createArmchair({
  position = [-0.85, 0, -1.55],
  rotationY = 2.45 + Math.PI / 2,
  fabricColor = 0xb8a48c,
  fabricDeepColor = 0xa69078,
  pillowColor = 0x6a7a68,
} = {}) {
  const group = new THREE.Group()
  group.name = 'armchair'

  const fabric = mat(fabricColor)
  const fabricDeep = mat(fabricDeepColor)
  const wood = mat(0x5c4330, { roughness: 0.55, metalness: 0.08 })

  const seatW = 0.72
  const seatD = 0.68
  const seatH = 0.2
  const seatY = 0.36

  const seat = new THREE.Mesh(new THREE.BoxGeometry(seatW, seatH, seatD), fabric)
  seat.position.set(0, seatY, 0)
  seat.castShadow = true
  seat.receiveShadow = true
  group.add(seat)

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(seatW * 0.88, 0.06, seatD * 0.85),
    fabricDeep,
  )
  pad.position.set(0, seatY + seatH / 2 + 0.03, 0.02)
  pad.castShadow = true
  group.add(pad)

  const back = new THREE.Mesh(
    new THREE.BoxGeometry(seatW * 0.95, 0.55, 0.14),
    fabric,
  )
  back.position.set(0, seatY + 0.3, -seatD / 2 + 0.05)
  back.castShadow = true
  group.add(back)

  const cushion = new THREE.Mesh(
    new THREE.BoxGeometry(seatW * 0.82, 0.4, 0.1),
    fabricDeep,
  )
  cushion.position.set(0, seatY + 0.34, -seatD / 2 + 0.12)
  cushion.castShadow = true
  group.add(cushion)

  for (const x of [-seatW / 2 - 0.04, seatW / 2 + 0.04]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.28, seatD * 0.88),
      fabric,
    )
    arm.position.set(x, seatY + 0.1, 0.02)
    arm.castShadow = true
    group.add(arm)
  }

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(seatW * 0.9, 0.07, seatD * 0.82),
    mat(0x3d342c, { roughness: 0.7 }),
  )
  base.position.set(0, seatY - seatH / 2 - 0.045, 0)
  base.castShadow = true
  group.add(base)

  const legGeo = new THREE.CylinderGeometry(0.015, 0.024, 0.2, 8)
  for (const [x, z] of [
    [-seatW * 0.38, -seatD * 0.3],
    [seatW * 0.38, -seatD * 0.3],
    [-seatW * 0.38, seatD * 0.3],
    [seatW * 0.38, seatD * 0.3],
  ]) {
    const leg = new THREE.Mesh(legGeo, wood)
    leg.position.set(x, 0.1, z)
    leg.castShadow = true
    group.add(leg)
  }

  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.22, 0.1),
    mat(pillowColor, { roughness: 0.9 }),
  )
  pillow.position.set(0.12, seatY + 0.28, -0.12)
  pillow.rotation.z = 0.15
  pillow.castShadow = true
  group.add(pillow)

  group.position.set(...position)
  group.rotation.y = rotationY

  return group
}
