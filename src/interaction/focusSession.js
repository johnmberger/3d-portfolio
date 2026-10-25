import { CREDITS_ENTRIES } from '../objects/credits.js'
import { updateLightSwitch } from '../objects/lightSwitch.js'
import { EARWORMS_URL, VINYL_URL, POOPYHOOCH_URL } from '../ui/index.js'

/**
 * Focus mode: zoom into a hotspot, show its chrome, and leave again.
 * The light switch shares the same tap path but toggles time of day instead.
 */
export function createFocusSession({
  isTouchExplore,
  exploreHint,
  leaveHint,
  hint,
  hud,
  hudActions,
  rig,
  hoverHighlight,
  timeOfDay,
  focusHelper,
  focusClose,
  pieces,
  portfolioUi,
  earwormsUi,
  vinylUi,
  poopyUi,
  tvNewsUi,
  mobileResumeSheet,
  mobileEarwormsSheet,
  mobileVinylSheet,
  mobilePoopySheet,
}) {
  const {
    monitor,
    dining,
    creditsPlaque,
    photoShelf,
    dog,
    lightSwitch,
    monitorScreen,
    earwormsScreen,
    vinylScreen,
    bathroomScreen,
    creditsScreen,
    aboutScreen,
    photoScreen,
    dogScreen,
    tvScreen,
  } = pieces

  let activeFocus = null
  let prevMode = 'explore'
  let isDragging = false
  let pendingCloseFocus = false
  /** Chrome shown only after the zoom-in finishes (avoids mid-flight flicker). */
  let pendingFocusHelper = null
  let pendingFocusClose = null

  function setHint(text) {
    hint.textContent = text
  }

  function setPointer(on) {
    document.body.classList.toggle('is-pointer', on)
  }

  function setDragging(on) {
    isDragging = on
    document.body.classList.toggle('is-dragging', on)
  }

  function setScreenInteractive(ui, on) {
    if (!ui?.element) return
    ui.element.classList.toggle('is-interactive', on)
    ui.element.style.pointerEvents = on ? 'auto' : 'none'
  }

  function setFocusedUi(on) {
    hud.classList.toggle('is-dimmed', on)
    document.body.classList.toggle('is-focused', on)
    if (!on) focusClose.hide()
    if (hudActions) hudActions.style.opacity = on ? '0' : '1'
    if (hudActions) hudActions.style.pointerEvents = on ? 'none' : 'auto'
    if (on) {
      setPointer(false)
      setDragging(false)
    }
  }

  function queueFocusChrome({ helper = null, close = null } = {}) {
    pendingFocusHelper = helper
    pendingFocusClose = close
  }

  function revealFocusChrome() {
    if (pendingFocusHelper) {
      focusHelper.show(pendingFocusHelper)
      pendingFocusHelper = null
    }
    if (pendingFocusClose) {
      focusClose.show(pendingFocusClose)
      pendingFocusClose = null
    }
  }

  function clearFocusChrome() {
    pendingFocusHelper = null
    pendingFocusClose = null
    focusHelper.hide()
    focusClose.hide()
  }

  function beginFocus({ id, screen, size, ui = null, helper = null, hint: nextHint }) {
    if (rig.isBusy || rig.isFocused) return
    hoverHighlight.clear()
    activeFocus = id
    ui?.show()
    queueFocusChrome({
      helper,
      close: {
        anchor: screen,
        width: size.width,
        height: size.height,
      },
    })
    rig.enterFocus(screen, size)
    setHint(nextHint)
  }

  function endFocusUi() {
    pendingCloseFocus = false
    setScreenInteractive(portfolioUi, false)
    setScreenInteractive(earwormsUi, false)
    setScreenInteractive(vinylUi, false)
    setScreenInteractive(poopyUi, false)
    setFocusedUi(false)
    clearFocusChrome()
    if (activeFocus === 'portfolio') {
      portfolioUi.hide()
      mobileResumeSheet?.hide()
    }
    if (activeFocus === 'earworms') {
      earwormsUi.hide()
      mobileEarwormsSheet?.hide()
    }
    if (activeFocus === 'vinyl') {
      vinylUi.hide()
      mobileVinylSheet?.hide()
    }
    if (activeFocus === 'poopyhooch') {
      poopyUi.hide()
      mobilePoopySheet?.hide()
    }
    if (activeFocus === 'tv') tvNewsUi.hide()
    activeFocus = null
  }

  function closeFocus() {
    if (rig.mode === 'explore' || rig.mode === 'toExplore' || rig.mode === 'toHome') {
      return
    }
    if (rig.isBusy) {
      pendingCloseFocus = true
      return
    }
    endFocusUi()
    rig.exitFocus()
    setHint(exploreHint)
  }

  function resetCameraView() {
    if (rig.isBusy) return
    endFocusUi()
    if (rig.resetView()) {
      setHint('Back to the room…')
    }
  }

  function focusPortfolio() {
    const size = {
      ...(monitor.userData.screenSize ?? { width: 0.85, height: 0.48 }),
      fill: 0.86,
    }
    beginFocus({
      id: 'portfolio',
      screen: monitorScreen,
      size,
      ui: portfolioUi,
      hint: 'Reading the résumé…',
    })
  }

  function focusEarworms() {
    beginFocus({
      id: 'earworms',
      screen: earwormsScreen,
      size: earwormsUi.screenSize,
      // CSS3D iframes crash mobile Safari — load into a flat sheet instead
      ui: mobileEarwormsSheet ? null : earwormsUi,
      helper: {
        title: 'Earworms',
        blurb: "What I've been listening to lately.",
        href: EARWORMS_URL,
        anchor: earwormsScreen,
        width: earwormsUi.screenSize.width,
      },
      hint: 'Dropping the needle…',
    })
  }

  function focusVinyl() {
    beginFocus({
      id: 'vinyl',
      screen: vinylScreen,
      size: vinylUi.screenSize,
      ui: mobileVinylSheet ? null : vinylUi,
      helper: {
        title: 'Vinyl',
        blurb: 'The records on my shelf.',
        href: VINYL_URL,
        anchor: vinylScreen,
        width: vinylUi.screenSize.width,
      },
      hint: 'Pulling a record…',
    })
  }

  function focusPoopyHooch() {
    beginFocus({
      id: 'poopyhooch',
      screen: bathroomScreen,
      size: poopyUi.screenSize,
      ui: mobilePoopySheet ? null : poopyUi,
      helper: {
        title: 'Poop the Hooch',
        blurb: 'Is the Chattahoochee Poopy?',
        href: POOPYHOOCH_URL,
        anchor: bathroomScreen,
        width: poopyUi.screenSize.width,
      },
      hint: 'Checking the mirror…',
    })
  }

  function focusCredits() {
    const size = {
      ...creditsPlaque.userData.screenSize,
      fill: isTouchExplore ? 0.58 : creditsPlaque.userData.screenSize.fill,
    }
    beginFocus({
      id: 'credits',
      screen: creditsScreen,
      size,
      helper: {
        title: 'Credits',
        blurb: 'Models used in this room — open each for attribution.',
        links: CREDITS_ENTRIES,
        anchor: creditsScreen,
        width: size.width,
        dock: 'top',
      },
      hint: 'Reading the plaque…',
    })
  }

  function focusAbout() {
    beginFocus({
      id: 'about',
      screen: aboutScreen,
      size: dining.userData.screenSize,
      hint: 'Reading the menu…',
    })
  }

  function focusPhoto() {
    beginFocus({
      id: 'photo',
      screen: photoScreen,
      size: photoShelf.userData.screenSize,
      hint: 'Looking closer…',
    })
  }

  function focusDog() {
    const size = dog.userData.screenSize
    beginFocus({
      id: 'dog',
      screen: dogScreen,
      size,
      helper: {
        title: 'Good boy',
        anchor: dogScreen,
        width: size.width,
      },
      hint: "Who's a good boy…",
    })
  }

  function focusTvNews() {
    beginFocus({
      id: 'tv',
      screen: tvScreen,
      size: tvNewsUi.screenSize,
      ui: tvNewsUi,
      hint: 'Watching the news…',
    })
  }

  const FOCUS_BY_KIND = {
    monitor: focusPortfolio,
    turntable: focusEarworms,
    vinylRack: focusVinyl,
    bathroom: focusPoopyHooch,
    credits: focusCredits,
    about: focusAbout,
    photo: focusPhoto,
    dog: focusDog,
    tv: focusTvNews,
  }

  function toggleLightSwitch() {
    if (rig.isBusy || rig.isFocused) return
    timeOfDay.toggle()
    updateLightSwitch(lightSwitch, { night: timeOfDay.isNight })
    setHint(timeOfDay.isNight ? 'Lights down…' : 'Sunset mode…')
  }

  function openByKind(kind) {
    if (!kind) return
    if (kind === 'lightSwitch') {
      toggleLightSwitch()
      return
    }
    FOCUS_BY_KIND[kind]?.()
  }

  function handleMode(mode) {
    if (mode !== prevMode) {
      applyMode(mode)
      prevMode = mode
    }
    if (pendingCloseFocus && mode === 'focused') closeFocus()
  }

  function applyMode(mode) {
    if (mode === 'focused') {
      if (!pendingCloseFocus) {
        setFocusedUi(true)
        revealFocusChrome()
        if (activeFocus === 'portfolio') {
          mobileResumeSheet?.show()
          if (!mobileResumeSheet) setScreenInteractive(portfolioUi, true)
        } else if (activeFocus === 'earworms') {
          mobileEarwormsSheet?.show()
          if (!mobileEarwormsSheet) setScreenInteractive(earwormsUi, true)
        } else if (activeFocus === 'vinyl') {
          mobileVinylSheet?.show()
          if (!mobileVinylSheet) setScreenInteractive(vinylUi, true)
        } else if (activeFocus === 'poopyhooch') {
          mobilePoopySheet?.show()
          if (!mobilePoopySheet) setScreenInteractive(poopyUi, true)
        }
        if (activeFocus) setHint(leaveHint)
      }
    } else if (mode === 'toExplore' || mode === 'toHome') {
      clearFocusChrome()
    } else if (mode === 'explore') {
      setScreenInteractive(portfolioUi, false)
      setScreenInteractive(earwormsUi, false)
      setScreenInteractive(vinylUi, false)
      setScreenInteractive(poopyUi, false)
      setFocusedUi(false)
      clearFocusChrome()
      mobileResumeSheet?.hide()
      mobileEarwormsSheet?.hide()
      mobileVinylSheet?.hide()
      mobilePoopySheet?.hide()
      setHint(exploreHint)
      pendingCloseFocus = false
    }
  }

  setHint(exploreHint)

  return {
    openByKind,
    closeFocus,
    resetCameraView,
    handleMode,
    setPointer,
    setDragging,
    get activeFocus() {
      return activeFocus
    },
    get isDragging() {
      return isDragging
    },
  }
}
