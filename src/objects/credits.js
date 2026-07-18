import * as THREE from 'three'
import { WALL_POS } from './roomConstants.js'

function markInteractive(mesh) {
  mesh.userData.interactive = 'credits'
  return mesh
}

/** Framed wall print with model attributions — clickable, zooms like other hotspots. */
export function createCreditsPlaque() {
  const group = new THREE.Group()
  group.name = 'creditsPlaque'

  const artW = 0.58
  const artH = 0.76
  const frameT = 0.032
  const depth = 0.036

  const wood = new THREE.MeshStandardMaterial({
    color: 0x3d2e22,
    roughness: 0.65,
    metalness: 0.08,
  })
  const matte = new THREE.MeshStandardMaterial({
    color: 0xe8e2d8,
    roughness: 0.9,
    metalness: 0,
  })

  const frame = markInteractive(
    new THREE.Mesh(
      new THREE.BoxGeometry(artW + frameT * 2, artH + frameT * 2, depth),
      wood,
    ),
  )
  frame.castShadow = true
  group.add(frame)

  const mattePlane = markInteractive(
    new THREE.Mesh(new THREE.PlaneGeometry(artW * 0.92, artH * 0.92), matte),
  )
  mattePlane.position.z = depth / 2 + 0.001
  group.add(mattePlane)

  const canvas = document.createElement('canvas')
  canvas.width = 640
  canvas.height = 840
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#f4efe6'
  ctx.fillRect(0, 0, 640, 840)

  const wash = ctx.createRadialGradient(320, 200, 40, 320, 420, 420)
  wash.addColorStop(0, 'rgba(232, 220, 200, 0.55)')
  wash.addColorStop(1, 'rgba(244, 239, 230, 0)')
  ctx.fillStyle = wash
  ctx.fillRect(0, 0, 640, 840)

  ctx.strokeStyle = 'rgba(60, 45, 32, 0.18)'
  ctx.lineWidth = 2
  ctx.strokeRect(36, 36, 568, 768)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#2a221c'
  ctx.font = '600 48px Fraunces, Georgia, serif'
  ctx.fillText('Credits', 320, 120)

  ctx.fillStyle = '#8a7355'
  ctx.font = '500 22px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('Models used in this room', 320, 168)

  const entries = [
    { title: 'Shiba', by: 'zixisun02 · Sketchfab', license: 'CC BY 4.0' },
    { title: 'Bicycle', by: 'Poly by Google', license: 'CC BY 3.0' },
    { title: 'Food', by: 'Quaternius', license: 'CC0' },
  ]

  let y = 250
  for (const entry of entries) {
    ctx.fillStyle = '#c45a3a'
    ctx.font = '600 28px Fraunces, Georgia, serif'
    ctx.fillText(entry.title, 320, y)

    ctx.fillStyle = '#3a322c'
    ctx.font = '500 24px "Source Sans 3", system-ui, sans-serif'
    ctx.fillText(entry.by, 320, y + 42)

    ctx.fillStyle = '#7a6a5e'
    ctx.font = '400 20px "Source Sans 3", system-ui, sans-serif'
    ctx.fillText(entry.license, 320, y + 74)

    ctx.strokeStyle = 'rgba(60, 45, 32, 0.12)'
    ctx.beginPath()
    ctx.moveTo(160, y + 108)
    ctx.lineTo(480, y + 108)
    ctx.stroke()

    y += 160
  }

  ctx.fillStyle = '#9a8a7c'
  ctx.font = '400 18px "Source Sans 3", system-ui, sans-serif'
  ctx.fillText('Thank you to the creators', 320, 780)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const screenMat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.88,
    metalness: 0,
    emissive: 0xf0e8d8,
    emissiveIntensity: 0.12,
  })
  const screen = markInteractive(
    new THREE.Mesh(new THREE.PlaneGeometry(artW * 0.78, artH * 0.78), screenMat),
  )
  screen.position.z = depth / 2 + 0.003
  screen.name = 'screen'
  group.add(screen)

  // Invisible hit plane slightly proud of the frame
  const hit = markInteractive(
    new THREE.Mesh(
      new THREE.PlaneGeometry(artW + frameT * 2, artH + frameT * 2),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    ),
  )
  hit.position.z = depth / 2 + 0.02
  hit.name = 'screenHit'
  hit.userData.skipHover = true
  group.add(hit)

  group.userData.screenSize = {
    width: artW * 0.78,
    height: artH * 0.78,
    fill: 0.82,
  }

  // Left wall (−X), above/beside the vinyl credenza end (credenza on −Z; this wall is perpendicular)
  group.position.set(-(WALL_POS - 0.02), 1.85, -3.35)
  group.rotation.y = Math.PI / 2

  group.traverse((obj) => {
    if (obj.isMesh) markInteractive(obj)
  })

  return group
}

/** Soft idle glow so the plaque reads as interactive from across the room. */
export function updateCreditsPlaque(plaque, elapsed, { focused = false } = {}) {
  const screen = plaque.userData.screen ?? plaque.getObjectByName('screen')
  plaque.userData.screen = screen
  if (!screen?.material) return
  screen.material.emissiveIntensity = focused
    ? 0.06
    : 0.14 + Math.sin(elapsed * 1.4) * 0.05
}
