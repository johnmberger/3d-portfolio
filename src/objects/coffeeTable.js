import * as THREE from 'three'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    ...props,
  })
}

/**
 * Low coffee table for the room center — books, candle, small tray.
 */
export function createCoffeeTable() {
  const group = new THREE.Group()
  group.name = 'coffeeTable'

  const wood = mat(0x6b5340, { roughness: 0.55 })
  const woodDark = mat(0x4a3a2c, { roughness: 0.6 })
  const metal = mat(0x2a2e2c, { metalness: 0.65, roughness: 0.35 })

  const topW = 1.05
  const topD = 0.58
  const topY = 0.38

  const top = new THREE.Mesh(new THREE.BoxGeometry(topW, 0.04, topD), wood)
  top.position.y = topY
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)

  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(topW - 0.08, 0.05, topD - 0.08),
    woodDark,
  )
  apron.position.y = topY - 0.04
  group.add(apron)

  const legGeo = new THREE.CylinderGeometry(0.018, 0.022, topY - 0.02, 8)
  for (const [x, z] of [
    [topW * 0.38, topD * 0.32],
    [-topW * 0.38, topD * 0.32],
    [topW * 0.38, -topD * 0.32],
    [-topW * 0.38, -topD * 0.32],
  ]) {
    const leg = new THREE.Mesh(legGeo, metal)
    leg.position.set(x, (topY - 0.02) / 2, z)
    leg.castShadow = true
    group.add(leg)
  }

  // Stack of books
  const bookColors = [0x3d5a4c, 0x8a5a3c, 0x4a5560]
  bookColors.forEach((c, i) => {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.22 - i * 0.015, 0.03, 0.16 - i * 0.01),
      mat(c, { roughness: 0.85 }),
    )
    book.position.set(-0.22, topY + 0.025 + i * 0.032, 0.05)
    book.rotation.y = -0.15 + i * 0.08
    book.castShadow = true
    group.add(book)
  })

  // Candle
  const candle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.08, 12),
    mat(0xf0e8d8, { roughness: 0.7 }),
  )
  candle.position.set(0.2, topY + 0.05, -0.08)
  group.add(candle)

  const flame = new THREE.PointLight(0xffaa66, 0.35, 2.2, 2)
  flame.position.set(0.2, topY + 0.14, -0.08)
  group.add(flame)

  const wick = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshStandardMaterial({
      color: 0xffcc88,
      emissive: 0xff8844,
      emissiveIntensity: 0.6,
      roughness: 0.4,
    }),
  )
  wick.position.set(0.2, topY + 0.1, -0.08)
  group.add(wick)

  // Ceramic tray / bowl
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.035, 16),
    mat(0xc4b09a, { roughness: 0.45 }),
  )
  bowl.position.set(0.28, topY + 0.03, 0.12)
  bowl.castShadow = true
  group.add(bowl)

  // Between the sectional and dining — slightly toward the TV nook
  group.position.set(-0.35, 0, 1.05)
  group.rotation.y = 0.15

  return group
}
