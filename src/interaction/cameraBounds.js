import * as THREE from 'three'
import { WALL_H, WALL_POS } from '../objects/roomConstants.js'

/**
 * Keeps OrbitControls camera + target inside the living-room volume.
 * Skip while focused / transitioning so dolly shots (e.g. bathroom) can leave the box.
 */
export function createCameraBounds(camera, controls) {
  // Inset from walls so the near plane doesn't clip through them
  const margin = 0.42
  const camMin = new THREE.Vector3(
    -WALL_POS + margin,
    0.45,
    -WALL_POS + margin,
  )
  const camMax = new THREE.Vector3(
    WALL_POS - margin,
    WALL_H - 0.55,
    WALL_POS - margin,
  )

  // Target stays a bit more inset / lower so pans can't yank the camera outside
  const targetMin = new THREE.Vector3(
    -WALL_POS + margin + 0.25,
    0.15,
    -WALL_POS + margin + 0.25,
  )
  const targetMax = new THREE.Vector3(
    WALL_POS - margin - 0.25,
    Math.min(2.4, WALL_H - 1.2),
    WALL_POS - margin - 0.25,
  )

  const _before = new THREE.Vector3()
  const _offset = new THREE.Vector3()

  function clampVec(v, min, max) {
    v.x = THREE.MathUtils.clamp(v.x, min.x, max.x)
    v.y = THREE.MathUtils.clamp(v.y, min.y, max.y)
    v.z = THREE.MathUtils.clamp(v.z, min.z, max.z)
  }

  function clamp() {
    clampVec(controls.target, targetMin, targetMax)

    _before.copy(camera.position)
    clampVec(camera.position, camMin, camMax)

    // If a wall push moved the camera, nudge the target the same way so the
    // view doesn't twist against the wall.
    const dx = camera.position.x - _before.x
    const dy = camera.position.y - _before.y
    const dz = camera.position.z - _before.z
    if (dx !== 0 || dy !== 0 || dz !== 0) {
      controls.target.x += dx
      controls.target.y += dy
      controls.target.z += dz
      clampVec(controls.target, targetMin, targetMax)
    }

    // Keep orbit radius within OrbitControls limits after a wall push
    _offset.subVectors(camera.position, controls.target)
    const dist = _offset.length()
    const minDist = controls.minDistance
    const maxDist = controls.maxDistance
    if (dist < 1e-4) {
      camera.position.set(
        controls.target.x,
        controls.target.y + minDist,
        controls.target.z + minDist * 0.2,
      )
      clampVec(camera.position, camMin, camMax)
    } else if (dist < minDist || dist > maxDist) {
      _offset.setLength(THREE.MathUtils.clamp(dist, minDist, maxDist))
      camera.position.copy(controls.target).add(_offset)
      clampVec(camera.position, camMin, camMax)
    }
  }

  return { clamp }
}
