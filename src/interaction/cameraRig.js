import * as THREE from 'three'

const DEFAULT_FOCUS_FILL = 0.94 // slightly under 1 so the full screen fits with a slim margin
const FOCUS_MIN_DISTANCE = 0.05

/**
 * Smoothly eases camera + OrbitControls target between explore and focus poses.
 */
export function createCameraRig(camera, controls) {
  const explore = {
    position: camera.position.clone(),
    target: controls.target.clone(),
  }

  const focus = {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
  }

  let mode = 'explore' // explore | toFocus | focused | toExplore
  let t = 1
  const duration = 1.05
  let screenW = 0.85
  let screenH = 0.48
  let focusFill = DEFAULT_FOCUS_FILL
  let minFocusDistance = 0
  let activeScreen = null
  let exploreMinDistance = controls.minDistance
  let exploreAngleLimits = null

  const fromPos = new THREE.Vector3()
  const fromTarget = new THREE.Vector3()
  const toPos = new THREE.Vector3()
  const toTarget = new THREE.Vector3()
  const _normal = new THREE.Vector3()

  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
  }

  function focusDistance() {
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
    const dHeight = screenH / (2 * focusFill * tanHalf)
    const dWidth = screenW / (2 * focusFill * tanHalf * camera.aspect)
    // max → fit the whole screen in view (letterbox the shorter axis)
    return Math.max(dHeight, dWidth, minFocusDistance)
  }

  function unlockOrbitLimits() {
    exploreAngleLimits = {
      minAzimuthAngle: controls.minAzimuthAngle,
      maxAzimuthAngle: controls.maxAzimuthAngle,
      minPolarAngle: controls.minPolarAngle,
      maxPolarAngle: controls.maxPolarAngle,
    }
    controls.minAzimuthAngle = -Infinity
    controls.maxAzimuthAngle = Infinity
    controls.minPolarAngle = 0
    controls.maxPolarAngle = Math.PI
  }

  function restoreOrbitLimits() {
    if (!exploreAngleLimits) return
    controls.minAzimuthAngle = exploreAngleLimits.minAzimuthAngle
    controls.maxAzimuthAngle = exploreAngleLimits.maxAzimuthAngle
    controls.minPolarAngle = exploreAngleLimits.minPolarAngle
    controls.maxPolarAngle = exploreAngleLimits.maxPolarAngle
    exploreAngleLimits = null
  }

  function setFocusFromScreen(screenMesh) {
    screenMesh.updateWorldMatrix(true, false)
    screenMesh.getWorldPosition(focus.target)

    _normal.set(0, 0, 1).transformDirection(screenMesh.matrixWorld).normalize()
    focus.position.copy(focus.target).addScaledVector(_normal, focusDistance())
  }

  function rememberExplore() {
    explore.position.copy(camera.position)
    explore.target.copy(controls.target)
  }

  function beginTransition(nextMode, destination) {
    fromPos.copy(camera.position)
    fromTarget.copy(controls.target)
    toPos.copy(destination.position)
    toTarget.copy(destination.target)
    mode = nextMode
    t = 0
    controls.enabled = false
  }

  function enterFocus(
    screenMesh,
    {
      width = 0.85,
      height = 0.48,
      fill = DEFAULT_FOCUS_FILL,
      minDistance = 0,
    } = {},
  ) {
    if (mode === 'focused' || mode === 'toFocus') return
    screenW = width
    screenH = height
    focusFill = fill
    minFocusDistance = minDistance
    activeScreen = screenMesh
    exploreMinDistance = controls.minDistance
    // OrbitControls.update() clamps distance + angles — free them for a straight-on approach
    controls.minDistance = FOCUS_MIN_DISTANCE
    unlockOrbitLimits()
    rememberExplore()
    setFocusFromScreen(screenMesh)
    // Ease from the current explore pose — no snap onto the approach axis
    beginTransition('toFocus', focus)
  }

  function exitFocus() {
    if (mode === 'explore' || mode === 'toExplore') return
    beginTransition('toExplore', explore)
  }

  /** Keep framing tight after viewport resize while focused. */
  function refocus(screenMesh = activeScreen) {
    if (!screenMesh) return
    if (mode !== 'focused' && mode !== 'toFocus') return
    setFocusFromScreen(screenMesh)
    toPos.copy(focus.position)
    toTarget.copy(focus.target)
    if (mode === 'focused') {
      camera.position.copy(focus.position)
      controls.target.copy(focus.target)
      controls.update()
    }
  }

  function update(delta) {
    if (mode !== 'toFocus' && mode !== 'toExplore') return mode

    t = Math.min(1, t + delta / duration)
    const e = easeInOutCubic(t)
    camera.position.lerpVectors(fromPos, toPos, e)
    controls.target.lerpVectors(fromTarget, toTarget, e)
    controls.update()

    if (t >= 1) {
      if (mode === 'toFocus') {
        mode = 'focused'
      } else {
        mode = 'explore'
        activeScreen = null
        controls.minDistance = exploreMinDistance
        restoreOrbitLimits()
        controls.enabled = true
      }
    }

    return mode
  }

  return {
    enterFocus,
    exitFocus,
    refocus,
    update,
    get mode() {
      return mode
    },
    get isFocused() {
      return mode === 'focused'
    },
    get isBusy() {
      return mode === 'toFocus' || mode === 'toExplore'
    },
    get activeScreen() {
      return activeScreen
    },
  }
}
