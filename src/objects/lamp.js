import * as THREE from 'three'

export function createFloorLamp() {
  const group = new THREE.Group()
  group.name = 'floorLamp'

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
  })

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.04, 24),
    metal,
  )
  base.position.y = 0.02
  base.castShadow = true
  group.add(base)

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.55, 12), metal)
  pole.position.y = 0.8
  pole.castShadow = true
  group.add(pole)

  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), brass)
  joint.position.y = 1.58
  group.add(joint)

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 10), metal)
  arm.position.set(0.1, 1.62, 0)
  arm.rotation.z = Math.PI / 2.4
  group.add(arm)

  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.22, 0.28, 24, 1, true),
    shadeMat,
  )
  shade.name = 'lampShade'
  shade.position.set(0.22, 1.48, 0)
  shade.castShadow = true
  group.add(shade)

  const shadeTop = new THREE.Mesh(
    new THREE.CircleGeometry(0.08, 24),
    new THREE.MeshStandardMaterial({
      color: 0xe8dcb8,
      roughness: 0.8,
      side: THREE.DoubleSide,
    }),
  )
  shadeTop.rotation.x = Math.PI / 2
  shadeTop.position.set(0.22, 1.62, 0)
  group.add(shadeTop)

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0xfff2c8,
      emissive: 0xffe08a,
      emissiveIntensity: 1.2,
      roughness: 0.4,
    }),
  )
  bulb.position.set(0.22, 1.48, 0)
  bulb.name = 'lampBulb'
  group.add(bulb)

  const light = new THREE.PointLight(0xffd9a0, 1.1, 6, 2)
  light.position.set(0.22, 1.35, 0)
  // Point-light shadows are cube maps — too expensive for this fill light
  light.castShadow = false
  light.name = 'lampLight'
  group.add(light)

  // Beside the TV nook / couch
  group.position.set(-3.95, 0, 1.55)
  group.rotation.y = 0.4

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
