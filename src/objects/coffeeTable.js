import * as THREE from 'three'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    ...props,
  })
}

function createSoftSmokeTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    2,
    size / 2,
    size / 2,
    size / 2,
  )
  grad.addColorStop(0, 'rgba(200,200,200,0.55)')
  grad.addColorStop(0.4, 'rgba(160,160,160,0.25)')
  grad.addColorStop(1, 'rgba(120,120,120,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * Brown glass cylinder candle with flame, warm point light, and rising smoke.
 * Call updateCandle(group, elapsed) each frame.
 * @param {{ x?: number, y?: number, z?: number, staticSmoke?: boolean }} opts
 *   staticSmoke — fixed wisps (mobile); skips per-frame particle uploads.
 */
function createLitCandle({ x = 0, y = 0, z = 0, staticSmoke = false } = {}) {
  const group = new THREE.Group()
  group.name = 'litCandle'
  group.position.set(x, y, z)

  const glassH = 0.1
  const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, glassH, 20),
    new THREE.MeshPhysicalMaterial({
      color: 0x5c3a28,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.55,
      thickness: 0.04,
      ior: 1.5,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    }),
  )
  glass.position.y = glassH / 2
  glass.castShadow = false
  group.add(glass)

  // Flame sits inside the glass vessel
  const flameY = glassH * 0.55
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xffcc66,
    emissive: 0xff9944,
    emissiveIntensity: 1.4,
    roughness: 0.35,
    metalness: 0,
    transparent: true,
    opacity: 0.95,
  })
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 10), flameMat)
  flame.scale.set(0.7, 1.45, 0.7)
  flame.position.y = flameY
  group.add(flame)

  const flameCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.007, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xfff2c8 }),
  )
  flameCore.scale.set(0.65, 1.2, 0.65)
  flameCore.position.y = flameY - 0.006
  group.add(flameCore)

  const light = new THREE.PointLight(0xffa060, 0.28, 1.6, 2)
  light.position.y = flameY
  group.add(light)

  const smokeBaseY = flameY + 0.02
  const smokeCount = staticSmoke ? 5 : 20
  const positions = new Float32Array(smokeCount * 3)
  const particles = []
  for (let i = 0; i < smokeCount; i++) {
    const t = (i + 0.5) / smokeCount
    particles.push({
      age: t,
      life: 1.4 + Math.random() * 0.8,
      speed: 0.09 + Math.random() * 0.07,
      driftX: (Math.random() - 0.5) * 0.04,
      driftZ: (Math.random() - 0.5) * 0.04,
      wobble: Math.random() * Math.PI * 2,
    })
    if (staticSmoke) {
      // Soft stacked wisps — look like smoke without animating
      positions[i * 3] = (Math.random() - 0.5) * 0.025
      positions[i * 3 + 1] = smokeBaseY + t * 0.11
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.025
    } else {
      positions[i * 3] = 0
      positions[i * 3 + 1] = smokeBaseY
      positions[i * 3 + 2] = 0
    }
  }
  const smokeGeo = new THREE.BufferGeometry()
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const smokeMat = new THREE.PointsMaterial({
    map: createSoftSmokeTexture(),
    color: 0xb0b0b0,
    size: staticSmoke ? 0.06 : 0.07,
    transparent: true,
    opacity: staticSmoke ? 0.28 : 0.45,
    depthWrite: false,
    sizeAttenuation: true,
    blending: THREE.NormalBlending,
  })
  const smoke = new THREE.Points(smokeGeo, smokeMat)
  smoke.frustumCulled = false
  group.add(smoke)

  group.userData.candle = {
    flame,
    flameCore,
    flameMat,
    light,
    smoke,
    smokePositions: positions,
    particles,
    smokeBaseY,
    staticSmoke,
  }

  return group
}

export function updateCandle(candleRoot, elapsed, delta = 1 / 60) {
  const roots = candleRoot?.userData?.candles
    ? candleRoot.userData.candles
    : candleRoot?.userData?.candle
      ? [candleRoot]
      : []

  for (const root of roots) {
    const c = root.userData.candle
    if (!c) continue

    // Lighter flicker on static-smoke (mobile) candles
    const flicker = c.staticSmoke
      ? 0.92 + Math.sin(elapsed * 6.5) * 0.05
      : 0.85 + Math.sin(elapsed * 11.3) * 0.08 + Math.sin(elapsed * 17.7) * 0.06
    c.light.intensity = 0.22 + flicker * 0.12
    c.flame.scale.set(0.65 * flicker, 1.35 + flicker * 0.2, 0.65 * flicker)
    c.flameCore.scale.set(0.6 * flicker, 1.15 + flicker * 0.15, 0.6 * flicker)
    c.flameMat.emissiveIntensity = 1.1 + flicker * 0.5
    if (!c.staticSmoke) {
      c.flame.position.x = Math.sin(elapsed * 9.2) * 0.002
      c.flame.position.z = Math.cos(elapsed * 7.4) * 0.002
    }

    if (c.staticSmoke) continue

    const pos = c.smokePositions
    for (let i = 0; i < c.particles.length; i++) {
      const p = c.particles[i]
      p.age += delta / p.life
      if (p.age >= 1) {
        p.age = 0
        p.life = 1.3 + Math.random() * 0.9
        p.speed = 0.08 + Math.random() * 0.08
        p.driftX = (Math.random() - 0.5) * 0.05
        p.driftZ = (Math.random() - 0.5) * 0.05
        p.wobble = Math.random() * Math.PI * 2
      }
      const t = p.age
      const rise = t * p.speed * p.life * 1.15
      const spread = t * t * 0.06
      const baseY = c.smokeBaseY ?? 0.12
      pos[i * 3] =
        p.driftX * t * 2.2 + Math.sin(elapsed * 1.4 + p.wobble) * spread
      pos[i * 3 + 1] = baseY + rise
      pos[i * 3 + 2] =
        p.driftZ * t * 2.2 + Math.cos(elapsed * 1.2 + p.wobble) * spread
    }
    c.smoke.geometry.attributes.position.needsUpdate = true
    c.smoke.material.opacity = 0.32 + Math.sin(elapsed * 0.8) * 0.04
    c.smoke.material.size = 0.055 + Math.sin(elapsed * 1.1) * 0.008
  }
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
    book.castShadow = false
    group.add(book)
  })

  const candle = createLitCandle({ x: 0.2, y: topY + 0.01, z: -0.08 })
  group.add(candle)
  group.userData.candles = [candle]

  // Ceramic tray / bowl
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.06, 0.035, 16),
    mat(0xc4b09a, { roughness: 0.45 }),
  )
  bowl.position.set(0.28, topY + 0.03, 0.12)
  bowl.castShadow = false
  group.add(bowl)

  // Between the sectional and dining — slightly toward the TV nook
  group.position.set(-0.35, 0, 1.05)
  group.rotation.y = 0.15

  return group
}

/**
 * Small round coffee table for the sectional L-nook.
 */
export function createRoundCoffeeTable({
  position = [-1.85, 0, 2.65],
  radius = 0.34,
  topY = 0.34,
  staticSmoke = false,
} = {}) {
  const group = new THREE.Group()
  group.name = 'roundCoffeeTable'

  const wood = mat(0x7a5c42, { roughness: 0.5 })
  const woodDark = mat(0x5c4430, { roughness: 0.58 })
  const metal = mat(0x2a2e2c, { metalness: 0.65, roughness: 0.35 })

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, 0.032, 28),
    wood,
  )
  top.position.y = topY
  top.castShadow = true
  top.receiveShadow = true
  group.add(top)

  // Soft bevel ring under the top
  const lip = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.92, radius * 0.88, 0.022, 24),
    woodDark,
  )
  lip.position.y = topY - 0.024
  group.add(lip)

  // Tripod legs splayed slightly
  const legH = topY - 0.04
  const legGeo = new THREE.CylinderGeometry(0.014, 0.018, legH, 8)
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4
    const r = radius * 0.55
    const leg = new THREE.Mesh(legGeo, metal)
    leg.position.set(Math.cos(a) * r, legH / 2 + 0.015, Math.sin(a) * r)
    leg.rotation.z = Math.cos(a) * 0.12
    leg.rotation.x = Math.sin(a) * 0.12
    leg.castShadow = true
    group.add(leg)
  }

  const foot = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.42, 0.012, 8, 24),
    metal,
  )
  foot.rotation.x = Math.PI / 2
  foot.position.y = 0.02
  group.add(foot)

  // Small book + coaster with lit candle
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.02, 0.12),
    mat(0x3d5a4c, { roughness: 0.85 }),
  )
  book.position.set(-0.08, topY + 0.025, 0.05)
  book.rotation.y = 0.25
  book.castShadow = false
  group.add(book)

  const coaster = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.008, 16),
    mat(0xc4a06a, { roughness: 0.7 }),
  )
  coaster.position.set(0.1, topY + 0.02, -0.06)
  group.add(coaster)

  const candle = createLitCandle({
    x: 0.1,
    y: topY + 0.024,
    z: -0.06,
    staticSmoke,
  })
  group.add(candle)
  group.userData.candles = [candle]

  group.position.set(...position)
  return group
}
