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
