import * as THREE from 'three'

const _center = new THREE.Vector3()
const _leftWorld = new THREE.Vector3()
const _rightWorld = new THREE.Vector3()
const _right = new THREE.Vector3()
const _ndc = new THREE.Vector3()

const EDGE_MARGIN = 16
const SIDE_GAP = 28

/**
 * Floating bubble caption that sits beside a focused 3D screen.
 */
export function createFocusHelper(parent = document.getElementById('app')) {
  const el = document.createElement('aside')
  el.className = 'focus-helper'
  el.hidden = true
  el.setAttribute('aria-live', 'polite')
  el.innerHTML = `
    <p class="focus-helper__title"></p>
    <p class="focus-helper__blurb"></p>
    <a class="focus-helper__link" href="#" target="_blank" rel="noreferrer">Open site ↗</a>
  `
  parent.appendChild(el)

  const titleEl = el.querySelector('.focus-helper__title')
  const blurbEl = el.querySelector('.focus-helper__blurb')
  const linkEl = el.querySelector('.focus-helper__link')
  let anchor = null
  let screenW = 0.4

  function show({ title, blurb, href, anchor: nextAnchor, width = 0.4 }) {
    titleEl.textContent = title
    blurbEl.textContent = blurb
    if (href) {
      linkEl.href = href
      linkEl.hidden = false
    } else {
      linkEl.removeAttribute('href')
      linkEl.hidden = true
    }
    anchor = nextAnchor
    screenW = width
    el.hidden = false
  }

  function hide() {
    anchor = null
    el.hidden = true
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
    if (!anchor || el.hidden) return

    anchor.updateWorldMatrix(true, false)
    anchor.getWorldPosition(_center)
    _right.set(1, 0, 0).transformDirection(anchor.matrixWorld).normalize()

    const halfW = screenW * 0.5
    _leftWorld.copy(_center).addScaledVector(_right, -halfW)
    _rightWorld.copy(_center).addScaledVector(_right, halfW)

    const mid = toScreen(_center, camera)
    const left = toScreen(_leftWorld, camera)
    const right = toScreen(_rightWorld, camera)

    if (mid.behind) {
      el.style.opacity = '0'
      return
    }
    el.style.opacity = '1'

    const bubbleW = el.offsetWidth || 240
    const bubbleH = el.offsetHeight || 100
    const spaceRight = window.innerWidth - right.x
    const spaceLeft = left.x
    const placeRight =
      spaceRight >= spaceLeft && spaceRight > bubbleW + SIDE_GAP + EDGE_MARGIN

    let x
    let side
    if (placeRight) {
      // left edge of bubble just past the screen's right edge
      x = right.x + SIDE_GAP
      x = Math.min(x, window.innerWidth - bubbleW - EDGE_MARGIN)
      x = Math.max(x, EDGE_MARGIN)
      side = 'right'
      el.style.transform = 'translate(0, -50%)'
    } else {
      // with translate(-100%), `left` is the bubble's right edge
      x = left.x - SIDE_GAP
      x = Math.max(x, bubbleW + EDGE_MARGIN)
      x = Math.min(x, window.innerWidth - EDGE_MARGIN)
      side = 'left'
      el.style.transform = 'translate(-100%, -50%)'
    }

    const halfH = bubbleH * 0.5
    const y = Math.min(
      Math.max(mid.y, EDGE_MARGIN + halfH),
      window.innerHeight - EDGE_MARGIN - halfH,
    )

    el.dataset.side = side
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  }

  return { element: el, show, hide, update }
}
