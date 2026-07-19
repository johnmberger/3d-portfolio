import * as THREE from 'three'

export function createFloorLamp({
  position = [-0.48, 0, 1.2],
  rotationY = -Math.PI / 2,
  name = 'floorLamp',
} = {}) {
  const group = new THREE.Group()
  group.name = name

  const metal = new THREE.MeshStandardMaterial({
    color: 0x3a3834,
    roughness: 0.45,
    metalness: 0.55,
  })
  const brass = new THREE.MeshStandardMaterial({
    color: 0xb8975a,
    roughness: 0.35,
    metalness: 0.7,
  })
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xf0e4c8,
    roughness: 0.85,
    metalness: 0,
    emissive: 0xf0d090,
    emissiveIntensity: 0.35,
    side: THREE.DoubleSide,
  })

  const baseH = 0.04
  const poleH = 1.52
  const poleTop = baseH + poleH

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, baseH, 24),
    metal,
  )
  base.position.y = baseH / 2
  base.castShadow = true
  group.add(base)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, poleH, 12),
    metal,
  )
  pole.position.y = baseH + poleH / 2
  pole.castShadow = true
  group.add(pole)

  // Head assembly — joint, arm, and shade share one origin so they stay connected
  const head = new THREE.Group()
  head.position.y = poleTop
  // Slight upward lift so the arm doesn’t read droopy
  head.rotation.z = 0.22
  group.add(head)

  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), brass)
  joint.position.set(0, 0, 0)
  head.add(joint)

  const armLen = 0.34
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.011, 0.011, armLen, 10),
    metal,
  )
  arm.rotation.z = Math.PI / 2
  arm.position.x = armLen / 2
  arm.castShadow = true
  head.add(arm)

  const armTip = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 10), brass)
  armTip.position.x = armLen
  head.add(armTip)

  const shadeH = 0.28
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.22, shadeH, 24, 1, true),
    shadeMat,
  )
  shade.name = 'lampShade'
  // Hang from the arm tip
  shade.position.set(armLen, -shadeH / 2 + 0.02, 0)
  shade.castShadow = true
  head.add(shade)

  const shadeTop = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 24),
    new THREE.MeshStandardMaterial({
      color: 0xe8dcb8,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
  )
  shadeTop.rotation.x = Math.PI / 2
  shadeTop.position.set(armLen, 0.02, 0)
  head.add(shadeTop)

  // Short stem from arm tip into the shade
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8),
    brass,
  )
  stem.position.set(armLen, -0.02, 0)
  head.add(stem)

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfff2c8,
      emissive: 0xffe08a,
      emissiveIntensity: 1.2,
      roughness: 0.4,
    }),
  )
  bulb.position.set(armLen, -shadeH * 0.35, 0)
  bulb.name = 'lampBulb'
  head.add(bulb)

  const light = new THREE.PointLight(0xffd9a0, 1.1, 6, 2)
  light.position.set(armLen, -shadeH * 0.45, 0)
  light.castShadow = false
  light.name = 'lampLight'
  head.add(light)

  group.position.set(...position)
  group.rotation.y = rotationY

  return group
}

export function updateFloorLamp(lamp, { night = false } = {}) {
  if (lamp.userData.lampNight === night) return
  lamp.userData.lampNight = night

  const light = lamp.userData.lampLight ?? lamp.getObjectByName('lampLight')
  const bulb = lamp.userData.lampBulb ?? lamp.getObjectByName('lampBulb')
  const shade = lamp.userData.lampShade ?? lamp.getObjectByName('lampShade')
  lamp.userData.lampLight = light
  lamp.userData.lampBulb = bulb
  lamp.userData.lampShade = shade

  if (light) light.intensity = night ? 1.85 : 0.55
  if (bulb?.material) bulb.material.emissiveIntensity = night ? 1.8 : 0.6
  if (shade?.material) shade.material.emissiveIntensity = night ? 0.7 : 0.2
}

/**
 * Ceiling pendant — brass canopy, cord, linen shade. Hang from the ceiling
 * (group origin at the ceiling mount).
 */
export function createHangingPendant({
  position = [0, 4.2, 0],
  cordLength = 0.85,
  name = 'hangingPendant',
} = {}) {
  const group = new THREE.Group()
  group.name = name

  const brass = new THREE.MeshStandardMaterial({
    color: 0xb8975a,
    roughness: 0.35,
    metalness: 0.7,
  })
  const brassDark = new THREE.MeshStandardMaterial({
    color: 0x8a6e40,
    roughness: 0.4,
    metalness: 0.65,
  })
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xf0e4c8,
    roughness: 0.85,
    metalness: 0,
    emissive: 0xe8f0d0,
    emissiveIntensity: 0.28,
    side: THREE.DoubleSide,
  })

  // Ceiling canopy / rose
  const canopy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.07, 0.028, 20),
    brassDark,
  )
  canopy.position.y = -0.01
  canopy.castShadow = true
  group.add(canopy)

  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.004, 0.004, cordLength, 6),
    new THREE.MeshStandardMaterial({ color: 0x2a2a28, roughness: 0.85 }),
  )
  cord.position.y = -cordLength / 2 - 0.02
  group.add(cord)

  const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.04, 12), brass)
  socket.position.y = -cordLength - 0.04
  group.add(socket)

  const shadeH = 0.2
  const shadeY = -cordLength - 0.06 - shadeH / 2
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.16, shadeH, 24, 1, true),
    shadeMat,
  )
  shade.name = 'lampShade'
  shade.position.y = shadeY
  shade.castShadow = true
  group.add(shade)

  const shadeTop = new THREE.Mesh(
    new THREE.CircleGeometry(0.07, 24),
    new THREE.MeshStandardMaterial({
      color: 0xe8dcb8,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
  )
  shadeTop.rotation.x = Math.PI / 2
  shadeTop.position.y = shadeY + shadeH / 2 - 0.002
  group.add(shadeTop)

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.032, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xfff2c8,
      emissive: 0xe8f0a0,
      emissiveIntensity: 0.9,
      roughness: 0.4,
    }),
  )
  bulb.name = 'lampBulb'
  bulb.position.y = shadeY + shadeH * 0.1
  group.add(bulb)

  const light = new THREE.PointLight(0xe8f0d0, 0.7, 5.2, 2)
  light.name = 'lampLight'
  light.position.y = shadeY
  light.castShadow = false
  group.add(light)

  group.position.set(...position)
  return group
}

export function updateHangingPendant(pendant, { night = false } = {}) {
  if (pendant.userData.lampNight === night) return
  pendant.userData.lampNight = night

  const light = pendant.userData.lampLight ?? pendant.getObjectByName('lampLight')
  const bulb = pendant.userData.lampBulb ?? pendant.getObjectByName('lampBulb')
  const shade = pendant.userData.lampShade ?? pendant.getObjectByName('lampShade')
  pendant.userData.lampLight = light
  pendant.userData.lampBulb = bulb
  pendant.userData.lampShade = shade

  if (light) light.intensity = night ? 1.15 : 0.6
  if (bulb?.material) bulb.material.emissiveIntensity = night ? 1.4 : 0.75
  if (shade?.material) shade.material.emissiveIntensity = night ? 0.6 : 0.24
}
