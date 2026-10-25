import * as THREE from 'three'
import {
  updatePlants,
  updateCandle,
  updateWindowParallax,
  updateFloorLamp,
  updateHangingPendant,
  updateLightSwitch,
  updateMonitor,
  updateTurntable,
  updateBathroom,
  updateCreditsPlaque,
  updateTV,
} from '../objects/index.js'
import {
  updatePortfolioVisibility,
  updateEarwormsVisibility,
  updateVinylVisibility,
  updatePoopyHoochVisibility,
} from '../ui/index.js'

/** Camera this close → smooth ticker (focus or scroll-zoom). */
const TV_TICKER_NEAR = 4.2

/** Per-frame room animation, focus chrome, and the two renderers. */
export function startLoop({
  device,
  stage,
  rig,
  cameraBounds,
  timeOfDay,
  hoverHighlight,
  focusHelper,
  focusClose,
  focus,
  pieces,
  ui,
  loading,
  interactiveRootList,
}) {
  const { isMobile, isTouchExplore, reduceMotion } = device
  const { camera, controls, renderer, cssRenderer, scene } = stage
  const {
    room,
    plants,
    lamp,
    plantPendant,
    lightSwitch,
    monitor,
    turntable,
    bathroom,
    creditsPlaque,
    tv,
    roundCoffee,
    tvScreen,
  } = pieces
  const {
    portfolioUi,
    earwormsUi,
    vinylUi,
    poopyUi,
    tvNewsUi,
    mobileResumeSheet,
    mobileEarwormsSheet,
    mobileVinylSheet,
    mobilePoopySheet,
  } = ui

  const plantThrottle = isMobile ? 4 : 2
  let plantFrame = 0
  let idleAnimFrame = 0
  let pulseFrame = 0
  const _tvWorld = new THREE.Vector3()
  const timer = new THREE.Timer()
  let loadingFinished = false

  function tick(timestamp) {
    requestAnimationFrame(tick)
    if (document.hidden) return

    timer.update(timestamp)
    const elapsed = timer.getElapsed()
    const delta = timer.getDelta()

    plantFrame = (plantFrame + 1) % plantThrottle
    idleAnimFrame = (idleAnimFrame + 1) % 2
    const animateIdle = !reduceMotion && idleAnimFrame === 0

    if (!reduceMotion && plantFrame === 0) {
      updatePlants(plants, elapsed, { animate: true })
    }
    updateCandle(roundCoffee, elapsed, delta)
    updateWindowParallax(room, camera)
    timeOfDay.update(delta)
    const night = timeOfDay.isNight
    updateFloorLamp(lamp, { night })
    updateHangingPendant(plantPendant, { night })
    updateLightSwitch(lightSwitch, { night })
    const mode = rig.update(delta)
    focus.handleMode(mode)
    const activeFocus = focus.activeFocus

    const focusing = rig.isFocused || mode === 'toFocus'
    if (
      isTouchExplore &&
      !reduceMotion &&
      !rig.isFocused &&
      !rig.isBusy &&
      !focus.isDragging
    ) {
      // Throttle material walks — cue still reads as a soft breathe
      pulseFrame = (pulseFrame + 1) % 3
      if (pulseFrame === 0) {
        const wave = 0.5 + 0.5 * Math.sin(elapsed * 1.6)
        hoverHighlight.pulse(interactiveRootList, wave * wave * 0.045)
      }
    } else if (isTouchExplore) {
      hoverHighlight.clearPulse()
    }
    focusHelper.update(camera)
    focusClose.update(camera)
    updateMonitor(monitor, elapsed, {
      focused: focusing && activeFocus === 'portfolio',
      animate: animateIdle,
    })
    updateTurntable(turntable, elapsed, {
      focused: focusing && activeFocus === 'earworms',
      animate: !reduceMotion && (focusing ? true : animateIdle),
    })
    updateBathroom(bathroom, elapsed, {
      focused: focusing && activeFocus === 'poopyhooch',
      animate: animateIdle,
    })
    updateCreditsPlaque(creditsPlaque, elapsed, {
      focused: focusing && activeFocus === 'credits',
      animate: animateIdle,
    })
    updateTV(tv, elapsed, {
      focused: focusing && activeFocus === 'tv',
      animate: animateIdle,
    })
    tvScreen.getWorldPosition(_tvWorld)
    const tvNear =
      (focusing && activeFocus === 'tv') ||
      camera.position.distanceToSquared(_tvWorld) < TV_TICKER_NEAR * TV_TICKER_NEAR
    tvNewsUi.update(elapsed, delta, {
      paused: (focus.isDragging && !focusing) || reduceMotion,
      focused: tvNear,
    })
    // CSS3D ignores WebGL depth — keep overlays off while the camera is moving so
    // room objects (lamps, furniture) correctly occlude the WebGL stand-ins.
    updatePortfolioVisibility(portfolioUi, camera, pieces.monitorScreen, {
      active: rig.isFocused && activeFocus === 'portfolio' && !mobileResumeSheet,
    })
    updateEarwormsVisibility(earwormsUi, camera, pieces.earwormsScreen, {
      active: rig.isFocused && activeFocus === 'earworms' && !mobileEarwormsSheet,
    })
    updateVinylVisibility(vinylUi, camera, pieces.vinylScreen, {
      active: rig.isFocused && activeFocus === 'vinyl' && !mobileVinylSheet,
    })
    updatePoopyHoochVisibility(poopyUi, camera, pieces.bathroomScreen, {
      active: rig.isFocused && activeFocus === 'poopyhooch' && !mobilePoopySheet,
    })

    if (controls.enabled) controls.update()
    if (!rig.isBusy && !rig.isFocused) {
      cameraBounds.clamp()
    }
    renderer.render(scene, camera)
    // Keep CSS3D in sync during focus transitions even when overlays are hidden,
    // so exit animations don't leave a frozen DOM layer on screen.
    if (
      mode !== 'explore' ||
      portfolioUi.object.visible ||
      earwormsUi.object.visible ||
      vinylUi.object.visible ||
      poopyUi.object.visible
    ) {
      cssRenderer.render(scene, camera)
    }

    if (!loadingFinished) {
      loadingFinished = true
      Promise.allSettled([pieces.dogReady, pieces.diningReady]).then(async () => {
        await loading.finishWhenReady()
        // Warm iframes + bike after the room is up so they don't fight first paint
        portfolioUi.preload()
        if (!isTouchExplore) {
          earwormsUi.preload()
          vinylUi.preload()
          poopyUi.preload()
        }
        pieces.startBikeLoad()
      })
    }
  }

  requestAnimationFrame(tick)
}
