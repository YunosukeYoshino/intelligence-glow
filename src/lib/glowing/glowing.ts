import { Glowing as BaseGlowing } from 'glowing'
import type { ViewportGlowBlendMode } from '../shared/types'

export type GlowingBlendMode = ViewportGlowBlendMode

export type GlowingOptions = {
  rotationDuration?: number
  width?: number
  blendMode?: GlowingBlendMode
  colors?: string[]
  colors2?: string[]
  glowingBlurRatio?: number
  timeout?: number
  borderRadius?: string | number
  zIndex?: number
}

type BaseGlowingOptions = Omit<GlowingOptions, 'borderRadius' | 'zIndex'> & {
  borderRadius?: number
}

const APPLE_GLOWING_WRAPPER_CLASS = 'apple-glowing-wrapper'
const VISIBILITY_GUARD_MS = 180
const WRAPPER_ATTACH_DELAY_MS = 0

type BaseGlowingInstance = {
  glowWrapper?: HTMLElement | null
}

function normalizeLength(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value
}

function toBaseOptions(options: GlowingOptions): BaseGlowingOptions {
  const {
    zIndex: _zIndex,
    borderRadius,
    ...rest
  } = options

  const next: BaseGlowingOptions = {
    ...rest,
  }

  if (typeof borderRadius === 'number') {
    next.borderRadius = borderRadius
  } else if (typeof borderRadius === 'string') {
    const parsed = Number.parseFloat(borderRadius)
    next.borderRadius = Number.isFinite(parsed) ? parsed : undefined
  }

  return next
}

export class Glowing {
  private readonly base: BaseGlowing
  private glowElement: HTMLElement | null = null
  private initialAttachTimer: ReturnType<typeof setTimeout> | null = null
  private visibilityGuardTimer: ReturnType<typeof setTimeout> | null = null

  constructor(el: HTMLElement, options: GlowingOptions = {}) {
    this.base = new BaseGlowing(el, toBaseOptions(options))
    this.scheduleInitialAttach(options)
  }

  get element() {
    return this.glowElement
  }

  recalculatePosition = () => {
    this.base.recalculatePosition()
    this.captureWrapper()
  }

  async set(el: HTMLElement, options: GlowingOptions = {}) {
    const cleanup = await this.base.set(el, toBaseOptions(options))
    this.captureWrapper()
    this.applyPersistentOptions(options)
    this.base.recalculatePosition()
    this.syncState('visible')
    return cleanup
  }

  setOptions(options: GlowingOptions) {
    this.base.setOptions(toBaseOptions(options))
    this.captureWrapper()
    this.applyPersistentOptions(options)
  }

  toggle() {
    if (this.getCurrentVisibility()) {
      this.hide()
      return
    }

    this.show()
  }

  show() {
    this.clearVisibilityGuard()
    this.base.show()
    this.captureWrapper()
    if (this.glowElement) {
      this.glowElement.style.setProperty('visibility', 'visible')
    }
    this.syncState('visible')
  }

  hide() {
    this.base.hide()
    this.captureWrapper()
    this.syncState('hidden')

    this.clearVisibilityGuard()
    this.visibilityGuardTimer = setTimeout(() => {
      if (!this.glowElement) {
        return
      }

      this.glowElement.style.setProperty('visibility', 'hidden')
      this.glowElement.dataset.state = 'hidden'
    }, VISIBILITY_GUARD_MS)
  }

  destroy() {
    this.remove()
  }

  remove() {
    this.clearInitialAttach()
    this.clearVisibilityGuard()
    this.base.remove()
    this.glowElement = null
  }

  private applyPersistentOptions(options: GlowingOptions) {
    const element = this.captureWrapper()
    if (!element) {
      return
    }

    if (options.borderRadius !== undefined) {
      element.style.setProperty('border-radius', normalizeLength(options.borderRadius))
    }

    if (options.zIndex !== undefined) {
      element.style.setProperty('z-index', `${options.zIndex}`)
    }
  }

  private captureWrapper() {
    const wrapper =
      (this.base as unknown as BaseGlowingInstance).glowWrapper ?? null
    if (!wrapper) {
      this.glowElement = null
      return null
    }

    wrapper.classList.add(APPLE_GLOWING_WRAPPER_CLASS)
    this.glowElement = wrapper
    return wrapper
  }

  private clearVisibilityGuard() {
    if (!this.visibilityGuardTimer) {
      return
    }

    clearTimeout(this.visibilityGuardTimer)
    this.visibilityGuardTimer = null
  }

  private clearInitialAttach() {
    if (!this.initialAttachTimer) {
      return
    }

    clearTimeout(this.initialAttachTimer)
    this.initialAttachTimer = null
  }

  private getCurrentVisibility() {
    return this.glowElement?.dataset.state !== 'hidden'
  }

  private syncState(state: 'visible' | 'hidden') {
    if (!this.glowElement) {
      return
    }

    this.glowElement.dataset.state = state
    if (state === 'visible') {
      this.glowElement.style.setProperty('visibility', 'visible')
    }
  }

  private scheduleInitialAttach(options: GlowingOptions) {
    this.clearInitialAttach()
    this.initialAttachTimer = setTimeout(() => {
      this.captureWrapper()
      this.applyPersistentOptions(options)
      this.base.recalculatePosition()
      this.syncState('visible')
      this.initialAttachTimer = null
    }, WRAPPER_ATTACH_DELAY_MS)
  }
}
