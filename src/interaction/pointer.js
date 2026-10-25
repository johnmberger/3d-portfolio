import * as THREE from 'three'

const TAP_MAX_MOVE_PX = 12
const TAP_MAX_MS = 500

/**
 * Hover raycasts and tap-to-focus. A press always orbits; focus opens on pointerup
 * if the gesture stayed inside the tap slop.
 */
export function bindPointer({
  canvas,
  camera,
  interactiveRoots,
  rig,
  hoverHighlight,
  openByKind,
  isTouchExplore,
  setPointer,
  setDragging,
}) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  const interactiveRootList = Object.values(interactiveRoots)
  /** @type {{ x: number, y: number, t: number, kind: string | null } | null} */
  let pointerGesture = null

  function pickInteractive(clientX, clientY) {
    pointer.x = (clientX / window.innerWidth) * 2 - 1
    pointer.y = -(clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    const hits = raycaster.intersectObjects(interactiveRootList, true)
    for (const hit of hits) {
      const kind = hit.object.userData.interactive
      if (kind && (kind in interactiveRoots || kind === 'lightSwitch')) {
        return kind
      }
    }
    return null
  }

  canvas.addEventListener('pointermove', (event) => {
    // Touch discoverability uses pulse — skip expensive hover raycasts while exploring
    if (isTouchExplore) return
    if (rig.isFocused || rig.isBusy) {
      hoverHighlight.clear()
      setPointer(false)
      return
    }
    const hoverTarget = pickInteractive(event.clientX, event.clientY)
    hoverHighlight.set(hoverTarget ? interactiveRoots[hoverTarget] : null)
    setPointer(Boolean(hoverTarget))
  })

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    if (rig.isBusy || rig.isFocused) return
    const kind = pickInteractive(event.clientX, event.clientY)
    pointerGesture = {
      x: event.clientX,
      y: event.clientY,
      t: performance.now(),
      kind,
    }
    // Always allow orbit — focus opens on tap (pointerup), not press
    setDragging(true)
  })

  function endPointerGesture(event) {
    const gesture = pointerGesture
    pointerGesture = null
    setDragging(false)
    if (!gesture?.kind) return
    if (rig.isBusy || rig.isFocused) return
    const dx = event.clientX - gesture.x
    const dy = event.clientY - gesture.y
    if (dx * dx + dy * dy > TAP_MAX_MOVE_PX * TAP_MAX_MOVE_PX) return
    if (performance.now() - gesture.t > TAP_MAX_MS) return
    openByKind(gesture.kind)
  }

  window.addEventListener('pointerup', endPointerGesture)
  window.addEventListener('pointercancel', () => {
    pointerGesture = null
    setDragging(false)
  })

  return { interactiveRootList }
}
