import * as THREE from 'three'

const _center = new THREE.Vector3()
const _leftWorld = new THREE.Vector3()
const _rightWorld = new THREE.Vector3()
const _right = new THREE.Vector3()
const _ndc = new THREE.Vector3()

const EDGE_MARGIN = 16
const SIDE_GAP = 28

function isMobileViewport() {
  return window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
}

/**
 * Floating bubble caption that sits beside a focused 3D screen.
 * On mobile it docks to the bottom so it doesn't cover the view.
 */
export function createFocusHelper(parent = document.getElementById('app')) {
  const el = document.createElement('aside')
  el.className = 'focus-helper'
  el.hidden = true
  el.setAttribute('aria-live', 'polite')
  el.innerHTML = `
    <p class="focus-helper__title"></p>
    <p class="focus-helper__role" hidden></p>
    <p class="focus-helper__blurb"></p>
    <ul class="focus-helper__facts" hidden></ul>
    <div class="focus-helper__links" hidden></div>
    <a class="focus-helper__link" href="#" target="_blank" rel="noreferrer">Open site ↗</a>
  `
  parent.appendChild(el)

  const titleEl = el.querySelector('.focus-helper__title')
  const roleEl = el.querySelector('.focus-helper__role')
  const blurbEl = el.querySelector('.focus-helper__blurb')
  const factsEl = el.querySelector('.focus-helper__facts')
  const linksEl = el.querySelector('.focus-helper__links')
  const linkEl = el.querySelector('.focus-helper__link')
  let anchor = null
  let screenW = 0.4

  function show({
    title,
    role,
    blurb,
    facts,
    href,
    links,
    anchor: nextAnchor,
    width = 0.4,
  }) {
    titleEl.textContent = title
    if (blurb) {
      blurbEl.textContent = blurb
      blurbEl.hidden = false
    } else {
      blurbEl.textContent = ''
      blurbEl.hidden = true
    }

    if (role) {
      roleEl.textContent = role
      roleEl.hidden = false
    } else {
      roleEl.textContent = ''
      roleEl.hidden = true
    }

    factsEl.replaceChildren()
    if (facts?.length) {
      for (const fact of facts) {
        const li = document.createElement('li')
        li.className = 'focus-helper__fact'
        li.innerHTML = `<span class="focus-helper__fact-label">${fact.label}</span><span class="focus-helper__fact-value">${fact.value}</span>`
        factsEl.appendChild(li)
      }
      factsEl.hidden = false
    } else {
      factsEl.hidden = true
    }

    linksEl.replaceChildren()
    if (links?.length) {
      for (const item of links) {
        const a = document.createElement('a')
        a.className = 'focus-helper__credit'
        a.href = item.href
        if (item.href.startsWith('mailto:')) {
          a.removeAttribute('target')
          a.removeAttribute('rel')
        } else {
          a.target = '_blank'
          a.rel = 'noreferrer'
        }
        const meta = [item.by, item.license].filter(Boolean).join(' · ')
        a.innerHTML = `<span class="focus-helper__credit-title">${item.title}</span>${
          meta
            ? `<span class="focus-helper__credit-meta">${meta}</span>`
            : ''
        }`
        linksEl.appendChild(a)
      }
      linksEl.hidden = false
      linkEl.hidden = true
      linkEl.removeAttribute('href')
    } else {
      linksEl.hidden = true
      if (href) {
        linkEl.href = href
        linkEl.hidden = false
      } else {
        linkEl.removeAttribute('href')
        linkEl.hidden = true
      }
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

    if (isMobileViewport()) {
      el.dataset.side = 'bottom'
      el.style.opacity = '1'
      el.style.left = ''
      el.style.top = ''
      el.style.right = ''
      el.style.transform = ''
      return
    }

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
      x = right.x + SIDE_GAP
      x = Math.min(x, window.innerWidth - bubbleW - EDGE_MARGIN)
      x = Math.max(x, EDGE_MARGIN)
      side = 'right'
      el.style.transform = 'translate(0, -50%)'
    } else {
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
    el.style.bottom = ''
  }

  return { element: el, show, hide, update }
}
