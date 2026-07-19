import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'

function createDiningRugTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Soft ivory field
  ctx.fillStyle = '#e4ddd0'
  ctx.fillRect(0, 0, size, size)

  // Subtle vertical wash stripes
  for (let i = 0; i < 14; i++) {
    const x = (i / 14) * size
    ctx.fillStyle = i % 2 === 0 ? 'rgba(120, 150, 130, 0.07)' : 'rgba(90, 120, 140, 0.05)'
    ctx.fillRect(x, 0, size / 14, size)
  }

  // Sage outer border
  ctx.strokeStyle = '#5a7a68'
  ctx.lineWidth = 22
  ctx.strokeRect(18, 18, size - 36, size - 36)

  // Cream + slate double line
  ctx.strokeStyle = '#f2ebe0'
  ctx.lineWidth = 8
  ctx.strokeRect(32, 32, size - 64, size - 64)
  ctx.strokeStyle = '#6a8498'
  ctx.lineWidth = 3
  ctx.strokeRect(42, 42, size - 84, size - 84)

  // Soft diamond motif in the center
  ctx.save()
  ctx.translate(size / 2, size / 2)
  ctx.rotate(Math.PI / 4)
  ctx.strokeStyle = 'rgba(90, 122, 104, 0.35)'
  ctx.lineWidth = 3
  const d = 70
  ctx.strokeRect(-d, -d, d * 2, d * 2)
  ctx.strokeStyle = 'rgba(106, 132, 152, 0.28)'
  ctx.lineWidth = 2
  ctx.strokeRect(-d * 0.55, -d * 0.55, d * 1.1, d * 1.1)
  ctx.restore()

  // Pile noise
  for (let i = 0; i < 2800; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const a = 0.02 + Math.random() * 0.04
    ctx.fillStyle =
      Math.random() > 0.5 ? `rgba(255,255,250,${a})` : `rgba(60,80,70,${a})`
    ctx.fillRect(x, y, 1.5, 1)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function createLoungeRugTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Cool slate base
  ctx.fillStyle = '#4a5868'
  ctx.fillRect(0, 0, size, size)

  // Kilim-style horizontal bands
  const bands = [
    ['#3a4858', 0.08],
    ['#6a8a9a', 0.05],
    ['#c8b8a8', 0.04],
    ['#5a7a88', 0.1],
    ['#8a9aaa', 0.06],
    ['#d4786a', 0.035],
    ['#4a6070', 0.12],
    ['#7a9aaa', 0.05],
    ['#e8ddd0', 0.04],
    ['#5a7080', 0.1],
    ['#6a8898', 0.08],
    ['#3a4858', 0.09],
  ]
  let y = 28
  for (const [color, hFrac] of bands) {
    const h = size * hFrac
    ctx.fillStyle = color
    ctx.fillRect(28, y, size - 56, h)
    y += h + 4
  }

  // Outer border
  ctx.strokeStyle = '#e8ddd0'
  ctx.lineWidth = 14
  ctx.strokeRect(16, 16, size - 32, size - 32)
  ctx.strokeStyle = '#2a3848'
  ctx.lineWidth = 4
  ctx.strokeRect(28, 28, size - 56, size - 56)

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * size
    const yy = Math.random() * size
    ctx.fillStyle = `rgba(220,230,240,${0.02 + Math.random() * 0.04})`
    ctx.fillRect(x, yy, 2, 1)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function createListeningRugTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2
  // Fill to the UV rim of CircleGeometry (UV edge ≈ radius 0.5) so no floor shows through
  const maxR = size * 0.5

  ctx.clearRect(0, 0, size, size)

  // Concentric rings — sage, cream, slate, soft coral accent
  const rings = [
    [maxR, '#3d5c52'],
    [maxR * 0.9, '#e8e0d4'],
    [maxR * 0.82, '#5a8a9a'],
    [maxR * 0.72, '#c47868'],
    [maxR * 0.64, '#e8e0d4'],
    [maxR * 0.54, '#4a6a78'],
    [maxR * 0.42, '#d4e0d8'],
    [maxR * 0.3, '#6a9a88'],
    [maxR * 0.18, '#f0ebe4'],
    [maxR * 0.08, '#3d5c52'],
  ]
  for (const [r, color] of rings) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(c, c, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Thin dividing lines
  ctx.strokeStyle = 'rgba(255,255,250,0.25)'
  ctx.lineWidth = 2
  for (const r of [0.88, 0.7, 0.5, 0.32]) {
    ctx.beginPath()
    ctx.arc(c, c, maxR * r, 0, Math.PI * 2)
    ctx.stroke()
  }

  for (let i = 0; i < 1600; i++) {
    const a = Math.random() * Math.PI * 2
    const r = Math.random() * maxR
    const x = c + Math.cos(a) * r
    const y = c + Math.sin(a) * r
    ctx.fillStyle = `rgba(255,255,250,${0.02 + Math.random() * 0.05})`
    ctx.fillRect(x, y, 1.5, 1)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function makeRugMesh(w, d, texture, edgeColor = 0x4a3020) {
  const g = new THREE.Group()

  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
    metalness: 0,
  })

  const rug = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat)
  rug.rotation.x = -Math.PI / 2
  rug.position.y = 0.008
  rug.receiveShadow = true
  g.add(rug)

  const edge = new THREE.Mesh(
    new THREE.PlaneGeometry(w + 0.1, d + 0.1),
    new THREE.MeshStandardMaterial({
      color: edgeColor,
      roughness: 1,
      metalness: 0,
    }),
  )
  edge.rotation.x = -Math.PI / 2
  edge.position.y = 0.004
  edge.receiveShadow = true
  g.add(edge)

  return g
}

function makeRoundRugMesh(diameter, texture, edgeColor = 0x4a3020) {
  const g = new THREE.Group()
  const r = diameter / 2

  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.95,
    metalness: 0,
  })

  const rug = new THREE.Mesh(new THREE.CircleGeometry(r, 64), mat)
  rug.rotation.x = -Math.PI / 2
  rug.position.y = 0.009
  rug.receiveShadow = true
  g.add(rug)

  const edge = new THREE.Mesh(
    new THREE.RingGeometry(r - 0.01, r + 0.045, 64),
    new THREE.MeshStandardMaterial({
      color: edgeColor,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    }),
  )
  edge.rotation.x = -Math.PI / 2
  edge.position.y = 0.005
  edge.receiveShadow = true
  g.add(edge)

  return g
}

/**
 * Dining rug + lounge rug under the sectional + round listening rug by the vinyl.
 */
export function createRug() {
  const group = new THREE.Group()
  group.name = 'rugs'

  const dining = makeRugMesh(3.8, 3.2, createDiningRugTexture(), 0x5a7a68)
  dining.name = 'diningRug'
  dining.position.set(3.0, 0, -0.35)
  dining.rotation.y = Math.PI / 2
  group.add(dining)

  // Cooler tonal rug under the TV sectional — runs to the TV wall
  const loungeFront = 0.55
  const loungeBack = WALL_POS - 0.04
  const loungeD = loungeBack - loungeFront
  const lounge = makeRugMesh(3.5, loungeD, createLoungeRugTexture(), 0x2e3a48)
  lounge.name = 'loungeRug'
  lounge.position.set(-2.4, 0, (loungeFront + loungeBack) / 2)
  lounge.rotation.y = 0
  group.add(lounge)

  // Round rug under the listening chair + side table (facing the vinyl credenza)
  const listening = makeRoundRugMesh(1.85, createListeningRugTexture(), 0x3d5c52)
  listening.name = 'listeningRug'
  listening.position.set(-2.35, 0, -2.85)
  group.add(listening)

  return group
}
