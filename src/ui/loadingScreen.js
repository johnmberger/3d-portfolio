/**
 * Fullscreen loading overlay. Fades out once the scene has painted
 * and a short minimum dwell has elapsed.
 */
export function createLoadingScreen(root = document.body) {
  const el = document.createElement('div')
  el.className = 'loading-screen'
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.innerHTML = `
    <div class="loading-screen__inner">
      <p class="loading-screen__brand">John's Studio.</p>
      <p class="loading-screen__status">Opening the room…</p>
      <div class="loading-screen__bar" aria-hidden="true">
        <span class="loading-screen__bar-fill"></span>
      </div>
    </div>
  `
  root.appendChild(el)

  const fill = el.querySelector('.loading-screen__bar-fill')
  const status = el.querySelector('.loading-screen__status')
  const started = performance.now()
  const minDwell = 900
  let progress = 0
  let done = false

  function setProgress(p, message) {
    progress = Math.max(progress, Math.min(1, p))
    if (fill) fill.style.transform = `scaleX(${progress})`
    if (message && status) status.textContent = message
  }

  function dismiss() {
    if (done) return Promise.resolve()
    done = true
    setProgress(1, 'Welcome in')
    el.classList.add('is-done')
    return new Promise((resolve) => {
      const finish = () => {
        el.remove()
        resolve()
      }
      el.addEventListener('transitionend', finish, { once: true })
      setTimeout(finish, 700)
    })
  }

  /** Call after the first render; waits out the minimum dwell. */
  async function finishWhenReady() {
    setProgress(0.85, 'Almost there…')
    const wait = Math.max(0, minDwell - (performance.now() - started))
    await new Promise((r) => setTimeout(r, wait))
    setProgress(1)
    await dismiss()
  }

  // Soft auto-progress while things boot
  const tick = () => {
    if (done) return
    setProgress(Math.min(0.7, progress + 0.02))
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  return { element: el, setProgress, finishWhenReady }
}
