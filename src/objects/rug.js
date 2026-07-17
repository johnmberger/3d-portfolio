import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'

function createRugTexture({
  base = '#6b4a38',
  mid = '#8a5e45',
  deep = '#5a3a2a',
  border = '#c4a06a',
  inner = '#3d2818',
} = {}) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    20,
    size / 2,
    size / 2,
    size * 0.7,
  )
  grad.addColorStop(0, mid)
  grad.addColorStop(1, deep)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = border
  ctx.lineWidth = 18
  ctx.strokeRect(22, 22, size - 44, size - 44)
  ctx.strokeStyle = inner
  ctx.lineWidth = 5
  ctx.strokeRect(36, 36, size - 72, size - 72)

  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillStyle = `rgba(255,220,180,${0.02 + Math.random() * 0.04})`
    ctx.fillRect(x, y, 2, 1)
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

/**
 * Dining rug + lounge rug under the sectional.
 */
export function createRug() {
  const group = new THREE.Group()
  group.name = 'rugs'

  const dining = makeRugMesh(
    3.8,
    3.2,
    createRugTexture(),
    0x4a3020,
  )
  dining.name = 'diningRug'
  dining.position.set(3.0, 0, -0.35)
  dining.rotation.y = Math.PI / 2
  group.add(dining)

  // Cooler tonal rug under the TV sectional — runs to the TV wall
  const loungeFront = 0.55
  const loungeBack = WALL_POS - 0.04
  const loungeD = loungeBack - loungeFront
  const lounge = makeRugMesh(
    3.5,
    loungeD,
    createRugTexture({
      base: '#4a5560',
      mid: '#6a7888',
      deep: '#3a4450',
      border: '#c8b8a0',
      inner: '#2a3038',
    }),
    0x2e343c,
  )
  lounge.name = 'loungeRug'
  lounge.position.set(-2.4, 0, (loungeFront + loungeBack) / 2)
  lounge.rotation.y = 0
  group.add(lounge)

  return group
}
