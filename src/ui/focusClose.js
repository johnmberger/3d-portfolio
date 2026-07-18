import * as THREE from 'three'

const _center = new THREE.Vector3()
const _corner = new THREE.Vector3()
const _right = new THREE.Vector3()
const _up = new THREE.Vector3()
const _ndc = new THREE.Vector3()

const EDGE_MARGIN = 12
const GAP = 14

/**
 * Fixed-DOM ✕ that floats beside a focused 3D screen (easy to hit when zoomed in).
 */
export function createFocusClose(button) {
  let anchor = null
  let screenW = 0.4
  let screenH = 0.3

  function show({ anchor: nextAnchor, width = 0.4, height = 0.3 }) {
    anchor = nextAnchor
    screenW = width
    screenH = height
    if (button) button.hidden = false
  }

  function hide() {
    anchor = null
    if (button) button.hidden = true
  }

  function toScreen(vec3, camera) {
    _ndc.copy(vec3).project(camera)
    return {
      x: (_ndc.x * 0.5 + 0.5) * window.innerWidth,
      y: (-_ndc.y * 0.5 + 0.5) * window.innerHeight,
      behind: _ndc.z > 1,
    }
  }

  function update(camera) {
    if (!button || button.hidden || !anchor) return

    anchor.updateWorldMatrix(true, false)
    anchor.getWorldPosition(_center)
    _right.set(1, 0, 0).transformDirection(anchor.matrixWorld).normalize()
    _up.set(0, 1, 0).transformDirection(anchor.matrixWorld).normalize()

    // Top-right corner of the focused plane
    _corner
      .copy(_center)
      .addScaledVector(_right, screenW * 0.5)
      .addScaledVector(_up, screenH * 0.5)

    const corner = toScreen(_corner, camera)
    if (corner.behind) {
      button.style.opacity = '0'
      return
    }
    button.style.opacity = '1'

    const btnW = button.offsetWidth || 40
    const btnH = button.offsetHeight || 40

    // Prefer just outside the top-right; flip if near the viewport edge
    let x = corner.x + GAP
    let y = corner.y - GAP
    if (x + btnW > window.innerWidth - EDGE_MARGIN) {
      x = corner.x - GAP - btnW
    }
    if (y - btnH < EDGE_MARGIN) {
      y = corner.y + GAP + btnH
    }

    x = Math.min(
      Math.max(x, EDGE_MARGIN),
      window.innerWidth - btnW - EDGE_MARGIN,
    )
    y = Math.min(
      Math.max(y, EDGE_MARGIN + btnH),
      window.innerHeight - EDGE_MARGIN,
    )

    button.style.left = `${x}px`
    button.style.top = `${y}px`
    button.style.right = 'auto'
    button.style.transform = 'translate(0, -100%)'
  }

  return { show, hide, update }
}
