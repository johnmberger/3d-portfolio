import * as THREE from 'three'

const DESKTOP_W = 960
const DESKTOP_H = 540
const MOBILE_W = 640
const MOBILE_H = 360
const TICKER_H_RATIO = 44 / 540
const TICKER_TEXT =
  'Coming up: résumé on the desk · records on the turntable · good boy on the rug · '
const TICKER_SPEED = 55 // px / sec
/** Upload the ticker at most this often while exploring (keeps orbit smooth). */
const TICKER_FPS_EXPLORE = 12
/** Closer / focused — still capped so we don't thrash the GPU on every vsync. */
const TICKER_FPS_FOCUS = 45
const TICKER_FPS_FOCUS_MOBILE = 30

/**
 * Canvas-based news broadcast on the TV (WebGL texture).
 * Avoids CSS3D — CSS ticker animations stutter inside matrix3d parents.
 */
export function createTvNewsScreen(tv, { lowRes = false } = {}) {
  const screen = tv.getObjectByName('screen')
  const W = lowRes ? MOBILE_W : DESKTOP_W
  const H = lowRes ? MOBILE_H : DESKTOP_H
  const TICKER_H = Math.round(H * TICKER_H_RATIO)
  const focusFps = lowRes ? TICKER_FPS_FOCUS_MOBILE : TICKER_FPS_FOCUS

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = lowRes ? 1 : 4

  // Replace the placeholder screen material with the live broadcast canvas
  const mat = screen.material
  mat.map = texture
  mat.emissiveMap = texture
  mat.color.setHex(0xffffff)
  mat.needsUpdate = true

  let tickerOffset = 0
  let tickerWidth = 0
  let staticDrawn = false
  let fontsReady = document.fonts?.status === 'loaded'
  let accum = 0

  function measureTicker() {
    ctx.font = `500 ${Math.round(15 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    tickerWidth = Math.max(1, ctx.measureText(TICKER_TEXT).width)
  }

  function sx(n) {
    return (n * W) / DESKTOP_W
  }
  function sy(n) {
    return (n * H) / DESKTOP_H
  }

  function drawStatic() {
    ctx.textBaseline = 'alphabetic'
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, '#1a2836')
    bg.addColorStop(0.55, '#121c28')
    bg.addColorStop(1, '#0c141c')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const vignette = ctx.createRadialGradient(
      W * 0.35,
      H * 0.35,
      40,
      W * 0.45,
      H * 0.45,
      H * 0.75,
    )
    vignette.addColorStop(0, 'rgba(55, 90, 110, 0.28)')
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, W, H)

    // LIVE bug
    const liveX = sx(28)
    const liveY = sy(24)
    const liveW = sx(64)
    const liveH = sy(26)
    ctx.fillStyle = '#c45c2a'
    ctx.fillRect(liveX, liveY, liveW, liveH)
    ctx.fillStyle = '#fff7f0'
    ctx.font = `700 ${Math.round(13 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('LIVE', liveX + liveW / 2, liveY + liveH / 2)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    ctx.fillStyle = '#e8eef4'
    ctx.font = `600 ${Math.round(22 * (W / DESKTOP_W))}px "Fraunces", Georgia, serif`
    ctx.fillText("John's Studio News", sx(108), sy(43))

    ctx.fillStyle = 'rgba(180, 200, 210, 0.7)'
    ctx.font = `500 ${Math.round(13 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    ctx.fillText('ATLANTA  ·  CH 3', W - sx(168), sy(42))

    ctx.fillStyle = '#c45c2a'
    ctx.font = `600 ${Math.round(14 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    ctx.fillText('TONIGHT ON STUDIO WATCH', sx(28), sy(120))

    ctx.fillStyle = '#f2f6fa'
    ctx.font = `600 ${Math.round(48 * (W / DESKTOP_W))}px "Fraunces", Georgia, serif`
    ctx.fillText('This room is real (ish)', sx(28), sy(178))

    ctx.fillStyle = 'rgba(232, 238, 244, 0.92)'
    ctx.font = `500 ${Math.round(20 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    wrapText(
      ctx,
      "John's Studio is a walkable 3D portfolio inspired by my actual Atlanta apartment — the desk where I ship code, the turntable, the couch, the dog.",
      sx(28),
      sy(220),
      W - sx(56),
      sy(28),
    )

    ctx.fillStyle = 'rgba(180, 200, 210, 0.85)'
    ctx.font = `400 ${Math.round(17 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    wrapText(
      ctx,
      "Look around and tap things. The monitor holds my résumé, the record is what I've been listening to, and the rest is the apartment where the work happens.",
      sx(28),
      sy(310),
      W - sx(56),
      sy(24),
    )
    staticDrawn = true
  }

  function drawTicker() {
    const y = H - TICKER_H
    ctx.fillStyle = '#c45c2a'
    ctx.fillRect(0, y - 3, W, 3)
    ctx.fillStyle = 'rgba(8, 12, 16, 0.94)'
    ctx.fillRect(0, y, W, TICKER_H)

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, y, W, TICKER_H)
    ctx.clip()

    ctx.fillStyle = 'rgba(232, 238, 244, 0.8)'
    ctx.font = `500 ${Math.round(15 * (W / DESKTOP_W))}px "Source Sans 3", system-ui, sans-serif`
    ctx.textBaseline = 'middle'
    const textY = y + TICKER_H / 2
    let x = -((tickerOffset % tickerWidth) + tickerWidth) % tickerWidth
    while (x < W + tickerWidth) {
      ctx.fillText(TICKER_TEXT, x, textY)
      x += tickerWidth
    }
    ctx.restore()
  }

  function paint(_elapsed, delta, { paused = false, focused = false } = {}) {
    if (!fontsReady && document.fonts?.status === 'loaded') {
      fontsReady = true
      staticDrawn = false
      measureTicker()
    }
    if (!tickerWidth) measureTicker()
    if (!staticDrawn) {
      drawStatic()
      drawTicker()
      texture.needsUpdate = true
    }

    if (paused) return

    const dt = Math.min(delta || 1 / 60, 0.05)
    tickerOffset += TICKER_SPEED * (W / DESKTOP_W) * dt
    accum += dt
    const targetFps = focused ? focusFps : TICKER_FPS_EXPLORE
    if (accum < 1 / targetFps) return
    accum %= 1 / targetFps

    drawTicker()
    texture.needsUpdate = true
  }

  // Initial paint (fonts may still load; update will refresh)
  measureTicker()
  paint(0, 0)

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      fontsReady = true
      staticDrawn = false
      measureTicker()
      paint(0, 0)
    })
  }

  function show() {}
  function hide() {}

  return {
    texture,
    show,
    hide,
    update: paint,
    screenSize: tv.userData.screenSize,
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, cy)
      line = word
      cy += lineHeight
    } else {
      line = next
    }
  }
  if (line) ctx.fillText(line, x, cy)
}
