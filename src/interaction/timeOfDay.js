import * as THREE from 'three'

function makeSkyTexture(stops) {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  for (const [t, color] of stops) grad.addColorStop(t, color)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 4, 256)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.magFilter = THREE.LinearFilter
  tex.minFilter = THREE.LinearFilter
  return tex
}

const PRESETS = {
  sunset: {
    label: 'Sunset',
    skyStops: [
      [0, '#2a3a6e'],
      [0.35, '#c45a6a'],
      [0.55, '#e87840'],
      [0.72, '#f0b060'],
      [0.88, '#f5d090'],
      [1, '#d4a878'],
    ],
    bg: 0xd4c4b0,
    fog: 0xd4c4b0,
    fogNear: 8,
    fogFar: 18,
    exposure: 1.15,
    ambient: { color: 0xe8d5c4, intensity: 0.35 },
    sun: { color: 0xffc088, intensity: 1.35 },
    fill: { color: 0x8fa0c4, intensity: 0.22 },
    windowGlow: { color: 0xffb070, intensity: 1.05 },
    windowRim: { color: 0xffc090, intensity: 5 },
    sunVisible: true,
  },
  night: {
    label: 'Night',
    skyStops: [
      [0, '#060812'],
      [0.35, '#0c1428'],
      [0.55, '#152038'],
      [0.75, '#1a2840'],
      [0.9, '#243048'],
      [1, '#2a3040'],
    ],
    bg: 0x1a1e28,
    fog: 0x1a1e28,
    fogNear: 6,
    fogFar: 16,
    exposure: 0.85,
    ambient: { color: 0x6a7a98, intensity: 0.22 },
    sun: { color: 0x8899bb, intensity: 0.2 },
    fill: { color: 0x4a5a78, intensity: 0.15 },
    windowGlow: { color: 0x6a8ac8, intensity: 0.45 },
    windowRim: { color: 0x5a7ab0, intensity: 1.6 },
    sunVisible: false,
  },
}

/**
 * Smoothly blends scene lighting + window sky between sunset and night.
 */
export function createTimeOfDay({
  scene,
  renderer,
  ambient,
  sun,
  fill,
  windowGlow,
  windowRim,
  room,
  windowRimScale = 1,
}) {
  const textures = {
    sunset: makeSkyTexture(PRESETS.sunset.skyStops),
    night: makeSkyTexture(PRESETS.night.skyStops),
  }

  let mode = 'sunset' // sunset | night
  let t = 1
  let from = PRESETS.sunset
  let to = PRESETS.sunset
  const duration = 1.4

  const tmpColor = new THREE.Color()

  function applySky(presetName) {
    room.traverse((obj) => {
      if (obj.name === 'sunsetSky' && obj.material) {
        obj.material.map = textures[presetName]
        obj.material.needsUpdate = true
      }
      if (obj.name === 'sunsetSun') {
        obj.visible = PRESETS[presetName].sunVisible
      }
    })
  }

  function lerpColor(target, a, b, e) {
    tmpColor.set(a).lerp(new THREE.Color(b), e)
    target.copy(tmpColor)
  }

  function toggle() {
    const next = mode === 'sunset' ? 'night' : 'sunset'
    from = PRESETS[mode]
    to = PRESETS[next]
    mode = next
    t = 0
    applySky(mode)
    return mode
  }

  function update(delta) {
    if (t >= 1) return mode
    t = Math.min(1, t + delta / duration)
    const e = t * t * (3 - 2 * t) // smoothstep

    scene.background.set(from.bg).lerp(new THREE.Color(to.bg), e)
    if (scene.fog) {
      scene.fog.color.set(from.fog).lerp(new THREE.Color(to.fog), e)
      scene.fog.near = from.fogNear + (to.fogNear - from.fogNear) * e
      scene.fog.far = from.fogFar + (to.fogFar - from.fogFar) * e
    }
    renderer.toneMappingExposure =
      from.exposure + (to.exposure - from.exposure) * e

    lerpColor(ambient.color, from.ambient.color, to.ambient.color, e)
    ambient.intensity =
      from.ambient.intensity + (to.ambient.intensity - from.ambient.intensity) * e

    lerpColor(sun.color, from.sun.color, to.sun.color, e)
    sun.intensity = from.sun.intensity + (to.sun.intensity - from.sun.intensity) * e

    lerpColor(fill.color, from.fill.color, to.fill.color, e)
    fill.intensity = from.fill.intensity + (to.fill.intensity - from.fill.intensity) * e

    lerpColor(windowGlow.color, from.windowGlow.color, to.windowGlow.color, e)
    windowGlow.intensity =
      from.windowGlow.intensity +
      (to.windowGlow.intensity - from.windowGlow.intensity) * e

    lerpColor(windowRim.color, from.windowRim.color, to.windowRim.color, e)
    windowRim.intensity =
      (from.windowRim.intensity +
        (to.windowRim.intensity - from.windowRim.intensity) * e) *
      windowRimScale

    return mode
  }

  applySky('sunset')

  return {
    toggle,
    update,
    get mode() {
      return mode
    },
    get isNight() {
      return mode === 'night'
    },
  }
}
