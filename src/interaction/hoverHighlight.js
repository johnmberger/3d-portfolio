/**
 * Soft emissive lift on interactive roots (hover + mobile pulse).
 * Saves/restores each material's emissive so focus/exit cleans up cleanly.
 */
export function createHoverHighlight({ color = 0x8fbf9a, boost = 0.28 } = {}) {
  let activeRoot = null
  /** @type {Set<object>} */
  const pulsed = new Set()

  function ensureSaved(m) {
    if (m.userData._hoverSaved == null) {
      m.userData._hoverSaved = {
        color: m.emissive.getHex(),
        intensity: m.emissiveIntensity ?? 0,
      }
    }
    return m.userData._hoverSaved
  }

  function restore(m) {
    if (!m.userData._hoverSaved) return
    m.emissive.setHex(m.userData._hoverSaved.color)
    m.emissiveIntensity = m.userData._hoverSaved.intensity
    delete m.userData._hoverSaved
    m.needsUpdate = true
  }

  function applyHover(root, on) {
    if (!root) return
    root.traverse((child) => {
      if (!child.isMesh || !child.material) return
      if (child.userData.skipHover) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of mats) {
        if (!m || !('emissive' in m)) continue
        if (on) {
          const saved = ensureSaved(m)
          m.emissive.setHex(color)
          m.emissiveIntensity = Math.min(0.85, saved.intensity + boost)
          m.needsUpdate = true
        } else {
          restore(m)
        }
      }
    })
  }

  /** Gentle intensity breathe — keeps original emissive color so materials stay readable. */
  function applyPulse(root, amount) {
    if (!root) return
    root.traverse((child) => {
      if (!child.isMesh || !child.material) return
      if (child.userData.skipHover) return
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      for (const m of mats) {
        if (!m || !('emissive' in m)) continue
        if (amount <= 0.001) {
          restore(m)
          continue
        }
        const saved = ensureSaved(m)
        // Keep the material’s own emissive; only nudge intensity (and a whisper of sage if none).
        if (saved.color === 0x000000) {
          m.emissive.setHex(color)
          m.emissiveIntensity = amount * 0.55
        } else {
          m.emissive.setHex(saved.color)
          m.emissiveIntensity = saved.intensity + amount
        }
        // Intensity/color only — no needsUpdate (avoids material recompile thrash)
      }
    })
  }

  function set(root) {
    if (activeRoot === root) return
    if (activeRoot) applyHover(activeRoot, false)
    activeRoot = root
    if (activeRoot) {
      pulsed.delete(activeRoot)
      applyHover(activeRoot, true)
    }
  }

  function clear() {
    set(null)
    clearPulse()
  }

  /**
   * Soft standing cue for touch (no hover). Does not stomp an active hover root.
   * @param {Iterable<object>} roots
   * @param {number} intensity 0–~0.1 recommended
   */
  function pulse(roots, intensity) {
    const next = new Set()
    for (const root of roots) {
      if (!root || root === activeRoot) continue
      next.add(root)
      applyPulse(root, intensity)
    }
    for (const root of pulsed) {
      if (!next.has(root) && root !== activeRoot) applyPulse(root, 0)
    }
    pulsed.clear()
    for (const root of next) pulsed.add(root)
  }

  function clearPulse() {
    for (const root of pulsed) {
      if (root !== activeRoot) applyPulse(root, 0)
    }
    pulsed.clear()
  }

  return { set, clear, pulse, clearPulse }
}
