import {
  DEFAULT_VIEWPORT_GLOW_OPTIONS,
  type ThreeViewportGlowController,
  type ThreeViewportGlowOptions,
} from '../shared/types'
import { assertBrowserViewportGlowSupport } from '../shared/browser'
import {
  THREE_DEFAULT_OPTIONS,
  createThreeResources,
  disposeThreeResources,
  refreshThreeResources,
  startThreeLoop,
  triggerThreeBoost,
  type ThreeResources,
} from './resources'

export function attachThreeViewportGlow(
  options: ThreeViewportGlowOptions = {},
): ThreeViewportGlowController {
  assertBrowserViewportGlowSupport()

  const state = {
    active: options.active ?? DEFAULT_VIEWPORT_GLOW_OPTIONS.active,
    destroyed: false,
    hideTimer: null as ReturnType<typeof setTimeout> | null,
    options: {
      ...DEFAULT_VIEWPORT_GLOW_OPTIONS,
      ...THREE_DEFAULT_OPTIONS,
      ...options,
    },
    resources: null as ThreeResources | null,
    shownAt: 0,
    token: 0,
  }

  const clearHideTimer = () => {
    if (!state.hideTimer) {
      return
    }

    clearTimeout(state.hideTimer)
    state.hideTimer = null
  }

  const mount = () => {
    if (state.resources || state.destroyed) {
      return
    }

    state.resources = createThreeResources(state.options)
    window.addEventListener('resize', state.resources.handleResize)
    startThreeLoop(state.resources, () => state.options)
  }

  const unmount = () => {
    disposeThreeResources(state.resources)
    state.resources = null
  }

  const refresh = () => {
    if (!state.resources) {
      return
    }

    refreshThreeResources(state.resources, state.options)
  }

  const show = () => {
    if (state.destroyed) {
      return
    }

    clearHideTimer()
    state.active = true
    state.token += 1
    state.shownAt = Date.now()
    mount()

    if (state.resources) {
      triggerThreeBoost(state.resources)
      refreshThreeResources(state.resources, state.options)
    }
  }

  const scheduleHide = () => {
    if (state.destroyed) {
      return
    }

    clearHideTimer()
    state.active = false

    const elapsed = Date.now() - state.shownAt
    const delay = Math.max(state.options.minimumVisibleMs - elapsed, 0)
    const token = state.token

    state.hideTimer = setTimeout(() => {
      if (state.destroyed || state.active || token !== state.token) {
        return
      }

      unmount()
    }, delay)
  }

  const hide = () => {
    if (state.destroyed) {
      return
    }

    clearHideTimer()
    state.active = false
    unmount()
  }

  const setActive = (active: boolean) => {
    if (active) {
      show()
      return
    }

    scheduleHide()
  }

  const setOptions = (next: Partial<ThreeViewportGlowOptions>) => {
    state.options = {
      ...state.options,
      ...next,
    }

    refresh()

    if (typeof next.active === 'boolean') {
      setActive(next.active)
    }
  }

  const destroy = () => {
    if (state.destroyed) {
      return
    }

    state.destroyed = true
    clearHideTimer()
    unmount()
  }

  if (state.active) {
    show()
  }

  return {
    destroy,
    hide,
    setActive,
    setOptions,
    show,
  }
}
