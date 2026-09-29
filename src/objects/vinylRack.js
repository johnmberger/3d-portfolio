import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'
import { mat, markInteractive } from './objectUtils.js'

const KIND = 'vinylRack'
const SLEEVE = 0.31

function hit(mesh) {
  return markInteractive(mesh, KIND)
}

function createCrateArtTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, size, size)
  bg.addColorStop(0, '#2a2420')
  bg.addColorStop(0.55, '#161310')
  bg.addColorStop(1, '#3a3028')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  const cx = size * 0.5
  const cy = size * 0.46
  const r = size * 0.22
  const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  disc.addColorStop(0, '#d8c8b0')
  disc.addColorStop(0.16, '#d8c8b0')
  disc.addColorStop(0.17, '#1a1410')
  disc.addColorStop(0.22, '#0c0a08')
  disc.addColorStop(0.72, '#0c0a08')
  disc.addColorStop(0.73, '#2a2622')
  disc.addColorStop(1, '#2a2622')
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = disc
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (const t of [0.38, 0.52, 0.64]) {
    ctx.beginPath()
    ctx.arc(cx, cy, r * t, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = '#d4c4b0'
  ctx.font = '600 20px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('COLLECTION', cx, size * 0.74)
  ctx.fillStyle = 'rgba(232, 224, 212, 0.75)'
  ctx.font = '500 30px "Fraunces", Georgia, serif'
  ctx.fillText('Vinyl', cx, size * 0.82)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

function createStandingSleeve(color) {
  const sleeve = hit(new THREE.Mesh(
    new THREE.BoxGeometry(SLEEVE, SLEEVE, 0.01),
    mat(color, { roughness: 0.82 }),
  ))
  sleeve.castShadow = true
  sleeve.receiveShadow = true
  return sleeve
}

function createFrontRecord() {
  const record = new THREE.Group()
  record.name = 'frontRecord'

  const sleeveD = 0.012
  const sleeve = hit(new THREE.Mesh(
    new THREE.BoxGeometry(SLEEVE, SLEEVE, sleeveD),
    mat(0x1c1814, { roughness: 0.78 }),
  ))
  sleeve.castShadow = true
  sleeve.receiveShadow = true
  record.add(sleeve)

  const disc = hit(new THREE.Mesh(
    new THREE.CylinderGeometry(0.118, 0.118, 0.003, 36),
    mat(0x0a0a0c, { roughness: 0.35, metalness: 0.25 }),
  ))
  disc.rotation.x = Math.PI / 2
  disc.position.set(0.04, 0.05, -0.006)
  disc.castShadow = true
  record.add(disc)

  const border = 0.016
  const artW = SLEEVE - border * 2
  const jacket = new THREE.Mesh(
    new THREE.PlaneGeometry(SLEEVE, SLEEVE),
    mat(0xc8b49a, { roughness: 0.84 }),
  )
  jacket.position.z = sleeveD / 2 + 0.001
  jacket.receiveShadow = true
  record.add(jacket)

  const screen = hit(new THREE.Mesh(
    new THREE.PlaneGeometry(artW, artW),
    new THREE.MeshStandardMaterial({
      map: createCrateArtTexture(),
      color: 0xffffff,
      emissive: 0x3a3028,
      emissiveIntensity: 0.18,
      roughness: 0.85,
      metalness: 0,
    }),
  ))
  screen.position.z = sleeveD / 2 + 0.003
  screen.name = 'screen'
  screen.userData.artSize = { width: artW, height: artW }
  screen.castShadow = true
  screen.receiveShadow = true
  record.add(screen)

  const screenHit = hit(new THREE.Mesh(
    new THREE.PlaneGeometry(SLEEVE, SLEEVE),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  ))
  screenHit.position.z = sleeveD / 2 + 0.01
  screenHit.userData.skipHover = true
  record.add(screenHit)

  return record
}

/**
 * Floor crate of LPs beside the turntable.
 * Dummy sleeves stay packed in the crate; the interactive LP leans in front
 * so the iframe never has to punch through the slats.
 */
export function createVinylRack() {
  const group = new THREE.Group()
  group.name = 'vinylRack'

  const wood = mat(0x8a6238, { roughness: 0.76 })
  const woodDark = mat(0x5c3d24, { roughness: 0.8 })
  const woodLight = mat(0xa07848, { roughness: 0.74 })

  const post = 0.024
  const slatH = 0.02
  const slatT = 0.009
  const innerW = SLEEVE + 0.036
  const innerD = 0.2
  const crateH = 0.23
  const outerW = innerW + post * 2
  const outerD = innerD + post * 2

  function plank(w, h, d, material) {
    const mesh = hit(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material))
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const corner = plank(post, crateH, post, woodDark)
      corner.position.set(
        sx * (outerW / 2 - post / 2),
        crateH / 2,
        sz * (outerD / 2 - post / 2),
      )
      group.add(corner)
    }
  }

  const rows = 4
  const margin = 0.016
  const rowSpan = crateH - margin * 2 - slatH
  for (let i = 0; i < rows; i++) {
    const y = margin + slatH / 2 + (i / (rows - 1)) * rowSpan
    const tone = i % 2 === 0 ? wood : woodLight
    for (const sz of [-1, 1]) {
      const s = plank(innerW, slatH, slatT, tone)
      s.position.set(0, y, sz * (outerD / 2 - slatT / 2))
      group.add(s)
    }
    // Skip one row on the sides so it reads as a hand-hold
    if (i === 2) continue
    for (const sx of [-1, 1]) {
      const s = plank(slatT, slatH, innerD, tone)
      s.position.set(sx * (outerW / 2 - slatT / 2), y, 0)
      group.add(s)
    }
  }

  const floorSlats = 5
  for (let i = 0; i < floorSlats; i++) {
    const t = i / (floorSlats - 1)
    const s = plank(innerW, slatT, 0.026, woodDark)
    s.position.set(0, slatT / 2, -innerD / 2 + 0.016 + t * (innerD - 0.032))
    group.add(s)
  }

  const colors = [
    0x1a1c22, 0x3a2820, 0xc4b49a, 0x243848, 0x5a2828,
    0xe4dcc8, 0x2c2018, 0x4a5560, 0x7a3a2a, 0xd8c8b0, 0x1c2830,
  ]
  const pack = 0.0115
  const z0 = -innerD / 2 + 0.028
  for (let i = 0; i < colors.length; i++) {
    const sleeve = createStandingSleeve(colors[i])
    sleeve.position.set(0, SLEEVE / 2 + slatT + 0.002, z0 + i * pack)
    sleeve.rotation.x = -0.045
    group.add(sleeve)
  }

  // Pulled out and leaning on the crate so the cover (and iframe) stay in front of the slats
  const lean = -0.16
  const front = createFrontRecord()
  front.position.set(
    0,
    (SLEEVE / 2) * Math.cos(lean) + 0.004,
    outerD / 2 + 0.055,
  )
  front.rotation.x = lean
  group.add(front)

  const sleeveContact = new THREE.Mesh(
    new THREE.PlaneGeometry(SLEEVE * 0.92, 0.07),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    }),
  )
  sleeveContact.rotation.x = -Math.PI / 2
  sleeveContact.position.set(0, 0.002, outerD / 2 + 0.05)
  sleeveContact.userData.skipHover = true
  group.add(sleeveContact)

  const contact = new THREE.Mesh(
    new THREE.PlaneGeometry(outerW * 1.12, outerD * 1.18),
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  )
  contact.rotation.x = -Math.PI / 2
  contact.position.set(0, 0.002, 0)
  contact.userData.skipHover = true
  group.add(contact)

  group.traverse((obj) => {
    if (obj.isMesh) hit(obj)
  })

  const cabW = 2.15
  const cabD = 0.44
  const turntableX = -3.35
  const turntableZ = -(WALL_POS - 0.01) + (cabD + 0.04) / 2
  const cabRight = turntableX + cabW / 2
  group.position.set(cabRight + outerW / 2 + 0.05, 0, turntableZ + 0.02)
  group.rotation.y = 0
  group.userData.screenSize = { width: SLEEVE, height: SLEEVE, fill: 0.68 }

  return group
}
