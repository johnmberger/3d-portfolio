/**
 * Soft emissive lift on interactive roots (hover + mobile pulse).
 * Saves/restores each material's emissive so focus/exit cleans up cleanly.
 */
export function createHoverHighlight({ color = 0x8fbf9a, boost = 0.28 } = {}) {
  let activeRoot = null
  /** @type {Set<object>} */
  const pulsed = new Set()

  function apply(root, on, intensityBoost = boost) {
    if (!root) return
    root.traverse((child) => {
      if (!child.isMesh || !child.material) return
      if (child.userData.skipHover) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of mats) {
        if (!m || !('emissive' in m)) continue
        if (on) {
          if (m.userData._hoverSaved == null) {
            m.userData._hoverSaved = {
              color: m.emissive.getHex(),
              intensity: m.emissiveIntensity ?? 0,
            }
          }
          const base = m.userData._hoverSaved.intensity
          m.emissive.setHex(color)
          m.emissiveIntensity = Math.min(0.85, base + intensityBoost)
          m.needsUpdate = true
        } else if (m.userData._hoverSaved) {
          m.emissive.setHex(m.userData._hoverSaved.color)
          m.emissiveIntensity = m.userData._hoverSaved.intensity
          delete m.userData._hoverSaved
          m.needsUpdate = true
        }
      }
    })
  }

  function set(root) {
    if (activeRoot === root) return
    if (activeRoot) apply(activeRoot, false)
    activeRoot = root
    if (activeRoot) {
      pulsed.delete(activeRoot)
      apply(activeRoot, true)
    }
  }

  function clear() {
    set(null)
    clearPulse()
  }

  /**
   * Soft standing cue for touch (no hover). Does not stomp an active hover root.
   * @param {Iterable<object>} roots
   * @param {number} intensity
   */
  function pulse(roots, intensity) {
    const next = new Set()
    for (const root of roots) {
      if (!root || root === activeRoot) continue
      next.add(root)
      apply(root, true, intensity)
    }
    for (const root of pulsed) {
      if (!next.has(root) && root !== activeRoot) apply(root, false)
    }
    pulsed.clear()
    for (const root of next) pulsed.add(root)
  }

  function clearPulse() {
    for (const root of pulsed) {
      if (root !== activeRoot) apply(root, false)
    }
    pulsed.clear()
  }

  return { set, clear, pulse, clearPulse }
}
