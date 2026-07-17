import * as THREE from 'three'

/** Small wall plaque crediting the Shiba model (CC BY 4.0). */
export function createCreditsPlaque() {
  const group = new THREE.Group()
  group.name = 'creditsPlaque'

  const wood = new THREE.MeshStandardMaterial({
    color: 0x5c3d28,
    roughness: 0.7,
    metalness: 0.05,
  })

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.03), wood)
  frame.castShadow = true
  group.add(frame)

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#f2ebe0'
  ctx.fillRect(0, 0, 512, 320)
  ctx.fillStyle = '#2a221c'
  ctx.font = '600 42px Georgia, serif'
  ctx.textAlign = 'center'
  ctx.fillText('Shiba', 256, 90)
  ctx.fillStyle = '#d4783a'
  ctx.font = '500 28px system-ui, sans-serif'
  ctx.fillText('by zixisun02', 256, 150)
  ctx.fillStyle = '#6a5a4e'
  ctx.font = '400 22px system-ui, sans-serif'
  ctx.fillText('CC BY 4.0 · Sketchfab', 256, 210)
  ctx.fillStyle = '#8a7a6e'
  ctx.font = '400 18px system-ui, sans-serif'
  ctx.fillText('skfb.ly/o7XBB', 256, 255)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.22),
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.85,
      metalness: 0,
    }),
  )
  label.position.z = 0.017
  group.add(label)

  // On the left wall, below the art / north of the bathroom
  group.position.set(-4.46, 1.35, 2.15)
  group.rotation.y = Math.PI / 2

  return group
}
