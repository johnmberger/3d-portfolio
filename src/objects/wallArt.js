import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'

function mat(color, props = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    ...props,
  })
}

function paintSunset(ctx, w, h) {
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#2a3a5e')
  bg.addColorStop(0.4, '#c45a58')
  bg.addColorStop(0.7, '#e88840')
  bg.addColorStop(1, '#f0c878')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  for (const [x, y, r, color] of [
    [160, 220, 90, 'rgba(255,240,200,0.35)'],
    [340, 380, 120, 'rgba(255,180,100,0.28)'],
    [280, 160, 50, 'rgba(255,255,255,0.2)'],
  ]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  ctx.fillStyle = 'rgba(40, 30, 50, 0.35)'
  ctx.beginPath()
  ctx.moveTo(0, h * 0.72)
  ctx.bezierCurveTo(w * 0.3, h * 0.68, w * 0.6, h * 0.78, w, h * 0.7)
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.72, h * 0.88)
  ctx.quadraticCurveTo(w * 0.8, h * 0.84, w * 0.88, h * 0.9)
  ctx.stroke()
}

function paintBotanical(ctx, w, h) {
  ctx.fillStyle = '#e8e2d6'
  ctx.fillRect(0, 0, w, h)

  // Soft paper wash
  const wash = ctx.createRadialGradient(w * 0.5, h * 0.4, 20, w * 0.5, h * 0.5, w * 0.7)
  wash.addColorStop(0, 'rgba(210, 220, 200, 0.45)')
  wash.addColorStop(1, 'rgba(232, 226, 214, 0)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#3d5c38'
  ctx.fillStyle = 'rgba(61, 92, 56, 0.55)'
  ctx.lineWidth = 3

  // Stem
  ctx.beginPath()
  ctx.moveTo(w * 0.5, h * 0.92)
  ctx.quadraticCurveTo(w * 0.48, h * 0.55, w * 0.52, h * 0.18)
  ctx.stroke()

  // Leaves
  const leaves = [
    [0.5, 0.35, -0.55, 0.16],
    [0.5, 0.48, 0.6, 0.18],
    [0.5, 0.62, -0.5, 0.15],
    [0.5, 0.75, 0.45, 0.14],
  ]
  for (const [cx, cy, ang, len] of leaves) {
    ctx.save()
    ctx.translate(w * cx, h * cy)
    ctx.rotate(ang)
    ctx.beginPath()
    ctx.ellipse(len * w * 0.5, 0, len * w * 0.55, len * w * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
}

function paintGeometry(ctx, w, h) {
  ctx.fillStyle = '#1e2430'
  ctx.fillRect(0, 0, w, h)

  const shapes = [
    ['#c45a58', w * 0.15, h * 0.2, w * 0.45, h * 0.35],
    ['#e88840', w * 0.4, h * 0.35, w * 0.5, h * 0.4],
    ['#f0c878', w * 0.2, h * 0.55, w * 0.35, h * 0.28],
    ['#6a8aaa', w * 0.55, h * 0.15, w * 0.28, h * 0.55],
  ]
  for (const [color, x, y, rw, rh] of shapes) {
    ctx.fillStyle = color
    ctx.globalAlpha = 0.85
    ctx.fillRect(x, y, rw, rh)
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 2
  ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84)
}

function paintLines(ctx, w, h) {
  ctx.fillStyle = '#f4efe6'
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = '#5c4330'
  ctx.lineWidth = 2.5
  for (let i = 0; i < 9; i++) {
    const y = h * (0.18 + i * 0.08)
    ctx.beginPath()
    ctx.moveTo(w * 0.12, y)
    ctx.bezierCurveTo(
      w * (0.3 + (i % 3) * 0.08),
      y + (i % 2 === 0 ? -18 : 18),
      w * (0.6 - (i % 2) * 0.1),
      y + (i % 2 === 0 ? 22 : -14),
      w * 0.88,
      y,
    )
    ctx.stroke()
  }

  ctx.fillStyle = '#c45a58'
  ctx.beginPath()
  ctx.arc(w * 0.72, h * 0.28, 28, 0, Math.PI * 2)
  ctx.fill()
}

function makeTexture(paintFn, w = 512, h = 640) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  paintFn(canvas.getContext('2d'), w, h)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function createFramedPrint({
  paint,
  artW = 0.55,
  artH = 0.7,
  frameColor = 0x3d2e22,
  matteColor = 0xf2ebe0,
} = {}) {
  const piece = new THREE.Group()
  piece.name = 'framedPrint'

  const frameT = 0.035
  const depth = 0.035
  const frameMat = mat(frameColor, { roughness: 0.65, metalness: 0.1 })
  const matteMat = mat(matteColor, { roughness: 0.9, metalness: 0 })

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(artW + frameT * 2, artH + frameT * 2, depth),
    frameMat,
  )
  frame.castShadow = true
  piece.add(frame)

  const matte = new THREE.Mesh(
    new THREE.PlaneGeometry(artW * 0.92, artH * 0.92),
    matteMat,
  )
  matte.position.z = depth / 2 + 0.001
  piece.add(matte)

  const art = new THREE.Mesh(
    new THREE.PlaneGeometry(artW * 0.78, artH * 0.78),
    new THREE.MeshStandardMaterial({
      map: makeTexture(paint, 512, Math.round(512 * (artH / artW))),
      roughness: 0.75,
      metalness: 0,
    }),
  )
  art.position.z = depth / 2 + 0.003
  piece.add(art)

  return piece
}

/**
 * Scattered framed prints around the living room walls.
 */
export function createWallArt() {
  const group = new THREE.Group()
  group.name = 'wallArt'

  const wall = WALL_POS - 0.02

  const pieces = [
    // Left wall — TV nook gallery
    {
      paint: paintSunset,
      artW: 0.72,
      artH: 0.9,
      pos: [-wall, 2.15, 1.2],
      rotY: Math.PI / 2,
    },
    {
      paint: paintBotanical,
      artW: 0.42,
      artH: 0.55,
      frameColor: 0x5c4330,
      pos: [-wall, 1.85, 2.55],
      rotY: Math.PI / 2,
    },
    {
      paint: paintLines,
      artW: 0.38,
      artH: 0.5,
      frameColor: 0x2a2420,
      pos: [-wall, 2.45, 2.55],
      rotY: Math.PI / 2,
    },
    // Back wall — flanking the main window
    {
      paint: paintGeometry,
      artW: 0.48,
      artH: 0.62,
      frameColor: 0x1a1816,
      matteColor: 0xe8e2d8,
      pos: [-2.75, 2.05, -wall],
      rotY: 0,
    },
    {
      paint: paintBotanical,
      artW: 0.4,
      artH: 0.52,
      frameColor: 0x6b5340,
      pos: [2.55, 2.0, -wall],
      rotY: 0,
    },
    // Front wall — left of the entry / bike
    {
      paint: paintLines,
      artW: 0.5,
      artH: 0.65,
      frameColor: 0x3d2e22,
      pos: [-1.65, 2.1, wall],
      rotY: Math.PI,
    },
    // Right wall — near dining, south of kitchenette
    {
      paint: paintSunset,
      artW: 0.45,
      artH: 0.58,
      frameColor: 0x4a3a2c,
      pos: [wall, 1.95, 1.65],
      rotY: -Math.PI / 2,
    },
  ]

  for (const spec of pieces) {
    const print = createFramedPrint(spec)
    print.position.set(...spec.pos)
    print.rotation.y = spec.rotY
    group.add(print)
  }

  return group
}
