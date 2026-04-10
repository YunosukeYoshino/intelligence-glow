import { Glowing } from './glowing'
import {
  DEFAULT_VIEWPORT_GLOW_OPTIONS,
  type ViewportGlowController,
  type ViewportGlowOptions,
} from '../shared/types'
import { assertBrowserViewportGlowSupport } from '../shared/browser'
import { removeViewportArtifacts } from '../shared/dom'

const GLOWING_VIEWPORT_DEFAULT_OPTIONS: Required<ViewportGlowOptions> = {
  ...DEFAULT_VIEWPORT_GLOW_OPTIONS,
  blendMode: 'lighten',
  colors: ['#ff7db8', '#8f7dff', '#ffd067', '#ff9a72', '#8f7dff', '#ff7db8'],
  colors2: [
    'rgba(255,173,208,0.96)',
    'rgba(255,255,255,0)',
    'rgba(196,181,253,0.94)',
    'rgba(255,255,255,0)',
    'rgba(255,213,128,0.94)',
    'rgba(255,255,255,0)',
    'rgba(255,173,208,0.96)',
  ],
  glowingBlurRatio: 1.4,
  radius: '0px',
  rotationDuration: 1800,
  width: 9,
}

function toGlowingOptions(options: Required<ViewportGlowOptions>) {
  return {
    blendMode: options.blendMode,
    borderRadius: options.radius,
    colors: options.colors,
    colors2: options.colors2,
    glowingBlurRatio: options.glowingBlurRatio,
    rotationDuration: options.rotationDuration,
    width: options.width,
    zIndex: options.zIndex,
  }
}

function applyTargetGeometry(
  target: HTMLDivElement,
  options: Required<ViewportGlowOptions>,
) {
  target.style.setProperty('position', 'fixed')
  target.style.setProperty('pointer-events', 'none')
  target.style.setProperty('top', `${options.inset}px`)
  target.style.setProperty('left', `${options.inset}px`)
  target.style.setProperty('width', `calc(100vw - (${options.inset}px * 2))`)
  target.style.setProperty('height', `calc(100vh - (${options.inset}px * 2))`)
  target.style.setProperty('border-radius', `${options.radius}`)
}

function syncWrapperVariables(
  glow: Glowing,
  options: Required<ViewportGlowOptions>,
) {
  const element = glow.element
  if (!element) {
    return
  }

  element.classList.add('apple-viewport-glow')
  element.style.setProperty('--apple-glow-inset', `${options.inset}px`)
  element.style.setProperty('--apple-glow-radius', `${options.radius}`)
  element.style.setProperty(
    '--apple-glow-color-1',
    options.colors[1] ?? options.colors[0] ?? '#8f7dff',
  )
  element.style.setProperty(
    '--apple-glow-color-2',
    options.colors[0] ?? options.colors[1] ?? '#ff7db8',
  )
  element.style.setProperty(
    '--apple-glow-color-3',
    options.colors[2] ?? options.colors[3] ?? '#ffd067',
  )
  element.style.setProperty(
    '--apple-glow-color-4',
    options.colors[3] ?? options.colors[2] ?? '#ff9a72',
  )
  element.style.setProperty(
    '--apple-glow-soft-1',
    options.colors2[0] ?? 'rgba(212,176,255,0.34)',
  )
  element.style.setProperty(
    '--apple-glow-soft-2',
    options.colors2[2] ?? 'rgba(255,164,207,0.18)',
  )
  element.style.setProperty(
    '--apple-glow-soft-3',
    options.colors2[4] ?? 'rgba(255,200,142,0.28)',
  )
  element.style.setProperty(
    '--apple-glow-soft-4',
    options.colors2[6] ?? options.colors2[0] ?? 'rgba(212,176,255,0.34)',
  )
}

function scheduleWrapperSync(
  glow: Glowing,
  options: Required<ViewportGlowOptions>,
) {
  setTimeout(() => {
    syncWrapperVariables(glow, options)
  }, 0)
}

export function attachGlowingViewportGlow(
  options: ViewportGlowOptions = {},
): ViewportGlowController {
  assertBrowserViewportGlowSupport()

  const state = {
    active: options.active ?? DEFAULT_VIEWPORT_GLOW_OPTIONS.active,
    destroyed: false,
    glow: null as Glowing | null,
    hideTimer: null as ReturnType<typeof setTimeout> | null,
    shownAt: 0,
    target: null as HTMLDivElement | null,
    token: 0,
    options: {
      ...GLOWING_VIEWPORT_DEFAULT_OPTIONS,
      ...options,
    },
  }

  const clearHideTimer = () => {
    if (!state.hideTimer) {
      return
    }

    clearTimeout(state.hideTimer)
    state.hideTimer = null
  }

  const mountGlow = () => {
    if (state.destroyed || state.target || state.glow) {
      return
    }

    removeViewportArtifacts('.apple-viewport-glow, .apple-viewport-glow-target')

    const target = document.createElement('div')
    target.setAttribute('aria-hidden', 'true')
    target.className = 'apple-viewport-glow-target'
    document.body.append(target)
    applyTargetGeometry(target, state.options)

    const glow = new Glowing(target, toGlowingOptions(state.options))
    state.target = target
    state.glow = glow
    syncWrapperVariables(glow, state.options)
    scheduleWrapperSync(glow, state.options)
  }

  const unmountGlow = () => {
    state.glow?.destroy()
    state.glow = null
    state.target?.remove()
    state.target = null
    removeViewportArtifacts('.apple-viewport-glow, .apple-viewport-glow-target')
  }

  const show = () => {
    if (state.destroyed) {
      return
    }

    clearHideTimer()
    state.active = true
    state.token += 1
    state.shownAt = Date.now()
    mountGlow()
    state.glow?.show()
    if (state.glow) {
      syncWrapperVariables(state.glow, state.options)
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

      state.glow?.hide()
    }, delay)
  }

  const hide = () => {
    if (state.destroyed) {
      return
    }

    clearHideTimer()
    state.active = false
    state.glow?.hide()
  }

  const setActive = (active: boolean) => {
    if (active) {
      show()
      return
    }

    scheduleHide()
  }

  const setOptions = (next: Partial<ViewportGlowOptions>) => {
    state.options = {
      ...state.options,
      ...next,
    }

    if (state.target) {
      applyTargetGeometry(state.target, state.options)
    }

    state.glow?.setOptions(toGlowingOptions(state.options))
    if (state.glow) {
      syncWrapperVariables(state.glow, state.options)
      scheduleWrapperSync(state.glow, state.options)
    }

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
    unmountGlow()
  }

  if (state.active) {
    show()
  }

  return {
    show,
    hide,
    setActive,
    setOptions,
    destroy,
  }
}
