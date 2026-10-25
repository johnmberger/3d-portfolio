/** Viewport and motion flags shared by the renderer, input, and animation loop. */
export function readDevice() {
  const isTouchExplore = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
  const isMobile =
    isTouchExplore ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)

  return {
    isTouchExplore,
    isMobile,
    maxPixelRatio: isMobile ? 1 : 1.75,
    reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    exploreHint: isTouchExplore ? 'Tap objects to look closer' : 'Drag to look · Scroll to zoom',
    leaveHint: isTouchExplore ? 'Tap ✕ to leave' : 'Esc to leave',
  }
}
