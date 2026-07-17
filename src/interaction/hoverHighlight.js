/**
 * Soft emissive lift on an interactive root while hovered.
 * Saves/restores each material's emissive so focus/exit cleans up cleanly.
 */
export function createHoverHighlight({ color = 0x8fbf9a, boost = 0.28 } = {}) {
  let activeRoot = null

  function apply(root, on) {
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
          m.emissiveIntensity = Math.min(0.85, base + boost)
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
    if (activeRoot) apply(activeRoot, true)
  }

  function clear() {
    set(null)
  }

  return { set, clear }
}
