import * as THREE from 'three'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    ...props,
  })
}

function box(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/**
 * Compact round or square side table with a small prop on top.
 */
function createSideTable({
  style = 'round',
  topY = 0.48,
  radius = 0.22,
  width = 0.4,
  depth = 0.4,
  woodColor = 0x6b5340,
  prop = 'book',
} = {}) {
  const group = new THREE.Group()
  group.name = 'sideTable'

  const wood = mat(woodColor, { roughness: 0.55 })
  const woodDark = mat(0x4a3a2c, { roughness: 0.6 })
  const metal = mat(0x2a2e2c, { metalness: 0.65, roughness: 0.35 })

  if (style === 'round') {
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 0.035, 24),
      wood,
    )
    top.position.y = topY
    top.castShadow = true
    top.receiveShadow = true
    group.add(top)

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.05, topY - 0.06, 12),
      woodDark,
    )
    pedestal.position.y = (topY - 0.06) / 2 + 0.02
    pedestal.castShadow = true
    group.add(pedestal)

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.55, radius * 0.6, 0.03, 20),
      woodDark,
    )
    base.position.y = 0.02
    base.castShadow = true
    group.add(base)
  } else {
    const top = box(width, 0.035, depth, wood)
    top.position.y = topY
    group.add(top)

    const apron = box(width - 0.06, 0.04, depth - 0.06, woodDark)
    apron.position.y = topY - 0.035
    group.add(apron)

    const legGeo = new THREE.CylinderGeometry(0.014, 0.018, topY - 0.02, 8)
    for (const [x, z] of [
      [width * 0.35, depth * 0.35],
      [-width * 0.35, depth * 0.35],
      [width * 0.35, -depth * 0.35],
      [-width * 0.35, -depth * 0.35],
    ]) {
      const leg = new THREE.Mesh(legGeo, metal)
      leg.position.set(x, (topY - 0.02) / 2, z)
      leg.castShadow = true
      group.add(leg)
    }
  }

  if (prop === 'book') {
    const book = box(0.14, 0.025, 0.1, mat(0x7a4a3a, { roughness: 0.85 }))
    book.position.set(0.02, topY + 0.03, -0.02)
    book.rotation.y = 0.35
    group.add(book)
  } else if (prop === 'mug') {
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.03, 0.07, 12),
      mat(0xe8ddd0, { roughness: 0.55 }),
    )
    mug.position.set(0.04, topY + 0.05, 0.02)
    mug.castShadow = true
    group.add(mug)
    const handle = box(0.012, 0.035, 0.04, mat(0xe8ddd0, { roughness: 0.55 }))
    handle.position.set(0.08, topY + 0.05, 0.02)
    group.add(handle)
  } else if (prop === 'lamp') {
    const ceramic = mat(0xd8d0c4, { roughness: 0.55 })
    const brass = mat(0xb8975a, { metalness: 0.7, roughness: 0.35 })
    const shadeMat = new THREE.MeshStandardMaterial({
      color: 0xf2ead8,
      roughness: 0.85,
      metalness: 0,
      emissive: 0xf0d090,
      emissiveIntensity: 0.25,
      side: THREE.DoubleSide,
    })

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 0.04, 16),
      ceramic,
    )
    base.position.set(0, topY + 0.025, 0)
    base.castShadow = true
    group.add(base)

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.01, 0.18, 10),
      brass,
    )
    stem.position.set(0, topY + 0.13, 0)
    stem.castShadow = true
    group.add(stem)

    const shade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.09, 0.1, 16, 1, true),
      shadeMat,
    )
    shade.position.set(0, topY + 0.26, 0)
    shade.castShadow = true
    group.add(shade)

    const shadeTop = new THREE.Mesh(
      new THREE.CircleGeometry(0.065, 16),
      shadeMat,
    )
    shadeTop.rotation.x = -Math.PI / 2
    shadeTop.position.set(0, topY + 0.31, 0)
    group.add(shadeTop)

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 10, 10),
      new THREE.MeshStandardMaterial({
        color: 0xfff2d0,
        emissive: 0xffd080,
        emissiveIntensity: 0.7,
        roughness: 0.4,
      }),
    )
    bulb.position.set(0, topY + 0.24, 0)
    group.add(bulb)

    const light = new THREE.PointLight(0xffd9a0, 0.35, 2.2, 2)
    light.position.set(0, topY + 0.24, 0)
    group.add(light)
  }

  return group
}

export function createSideTables() {
  const group = new THREE.Group()
  group.name = 'sideTables'

  // Left of the sectional / chaise tip, near the wall
  const lounge = createSideTable({
    style: 'round',
    radius: 0.24,
    topY: 0.5,
    woodColor: 0x7a5c42,
    prop: 'book',
  })
  lounge.position.set(-3.55, 0, 2.75)
  group.add(lounge)

  // Outside the main-run right arm (room side) — aligned with the sectional
  const chaise = createSideTable({
    style: 'square',
    width: 0.38,
    depth: 0.38,
    topY: 0.46,
    woodColor: 0x5c4330,
    prop: 'mug',
  })
  chaise.position.set(-0.95, 0, 1.45)
  group.add(chaise)

  // Right of the listening chair (facing turntable), offset along the chair's right
  // Chair at (-0.85, -1.55), yaw ≈ 4.02 → local +X ≈ (-0.65, 0.76)
  const listening = createSideTable({
    style: 'round',
    radius: 0.2,
    topY: 0.52,
    woodColor: 0x6b5340,
    prop: 'lamp',
  })
  listening.position.set(-1.45, 0, -0.85)
  group.add(listening)

  return group
}
