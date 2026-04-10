import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

describe('attachViewportGlow', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
    vi.stubGlobal('devicePixelRatio', 2)
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  test('keeps the glow hidden when active is false', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    attachViewportGlow({ active: false })
    await vi.runAllTimersAsync()

    const glow = document.querySelector<HTMLElement>('.apple-viewport-glow')
    const target = document.querySelector<HTMLElement>('.apple-viewport-glow-target')

    expect(glow).toBeNull()
    expect(target).toBeNull()
  })

  test('shows the viewport glow when active is true', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    attachViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    const glow = document.querySelector<HTMLElement>('.apple-viewport-glow')
    const target = document.querySelector<HTMLElement>('.apple-viewport-glow-target')

    expect(glow?.dataset.state).toBe('visible')
    expect(glow?.classList.contains('glowing-wrapper')).toBe(true)
    expect(glow?.style.getPropertyValue('border-radius')).toBe('0px')
    expect(target?.style.getPropertyValue('top')).toBe('-2px')
    expect(target?.style.getPropertyValue('left')).toBe('-2px')
    expect(target?.style.getPropertyValue('width')).toContain('calc(100vw')
    expect(target?.style.getPropertyValue('height')).toContain('calc(100vh')
    expect(target?.style.getPropertyValue('border-radius')).toBe('0px')
  })

  test('keeps the glow visible for the minimum duration before hiding', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    const controller = attachViewportGlow({
      active: true,
      minimumVisibleMs: 520,
    })
    await vi.runAllTimersAsync()
    const glow = document.querySelector<HTMLElement>('.apple-viewport-glow')
    const target = document.querySelector<HTMLElement>('.apple-viewport-glow-target')

    controller.setActive(false)
    vi.advanceTimersByTime(200)
    expect(document.querySelector('.apple-viewport-glow')).toBe(glow)
    expect(glow?.dataset.state).toBe('visible')

    vi.advanceTimersByTime(320)
    expect(document.querySelector('.apple-viewport-glow')).toBe(glow)
    expect(document.querySelector('.apple-viewport-glow-target')).toBe(target)
    expect(glow?.dataset.state).toBe('hidden')
    expect(glow?.style.getPropertyValue('visibility')).toBe('visible')

    vi.advanceTimersByTime(180)
    expect(glow?.style.getPropertyValue('visibility')).toBe('hidden')
  })

  test('updates CSS variables when setOptions is called before showing', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    const controller = attachViewportGlow({ active: false })
    await vi.runAllTimersAsync()

    controller.setOptions({
      colors: ['#111111', '#222222'],
      inset: 10,
      radius: '24px',
      width: 6,
    })
    controller.show()
    await vi.runAllTimersAsync()

    const glow = document.querySelector<HTMLElement>('.apple-viewport-glow')
    const target = document.querySelector<HTMLElement>('.apple-viewport-glow-target')

    expect(glow?.style.getPropertyValue('--glowingColors')).toContain('#111111')
    expect(glow?.style.getPropertyValue('--apple-glow-inset')).toBe('10px')
    expect(glow?.style.getPropertyValue('border-radius')).toBe('24px')
    expect(glow?.style.getPropertyValue('--apple-glow-color-1')).toBe('#222222')
    expect(glow?.style.getPropertyValue('--glowingWidth')).toBe('6px')
    expect(target?.style.getPropertyValue('top')).toBe('10px')
  })

  test('destroy removes the viewport glow and clears pending timers', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    const controller = attachViewportGlow({ active: true, minimumVisibleMs: 520 })
    await vi.runAllTimersAsync()

    controller.hide()
    controller.destroy()
    vi.runAllTimers()

    expect(document.querySelector('.apple-viewport-glow')).toBeNull()
    expect(document.querySelector('.apple-viewport-glow-target')).toBeNull()
  })

  test('hide starts a fade out immediately and keeps geometry mounted', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    const controller = attachViewportGlow({ active: true, minimumVisibleMs: 520 })
    await vi.runAllTimersAsync()
    const glow = document.querySelector<HTMLElement>('.apple-viewport-glow')
    const target = document.querySelector<HTMLElement>('.apple-viewport-glow-target')

    controller.hide()

    expect(document.querySelector('.apple-viewport-glow')).toBe(glow)
    expect(document.querySelector('.apple-viewport-glow-target')).toBe(target)
    expect(glow?.dataset.state).toBe('hidden')

    vi.advanceTimersByTime(180)
    expect(glow?.style.getPropertyValue('visibility')).toBe('hidden')
  })

  test('keeps the root API focused on the glowing renderer DOM output', async () => {
    const { attachViewportGlow } = await import('../viewport-glow')

    const glowingController = attachViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    expect(document.querySelector('.apple-viewport-glow')).toBeTruthy()
    expect(document.querySelector('.apple-three-viewport-glow')).toBeNull()

    glowingController.destroy()
    expect(document.querySelector('.apple-viewport-glow')).toBeNull()
  })

  test('coexists with a standalone Glowing instance', async () => {
    const { Glowing } = await import('../glowing/glowing')
    const { attachViewportGlow } = await import('../viewport-glow')

    const target = document.createElement('div')
    document.body.append(target)
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 120,
      y: 180,
      width: 240,
      height: 120,
      top: 180,
      left: 120,
      right: 360,
      bottom: 300,
      toJSON: () => ({}),
    })

    const viewportGlow = attachViewportGlow({ active: true, inset: 0, radius: '24px' })
    const cardGlow = new Glowing(target, { borderRadius: 28, width: 6, zIndex: 4 })
    await vi.runAllTimersAsync()

    const wrappers = Array.from(
      document.querySelectorAll<HTMLElement>('.glowing-wrapper'),
    )
    const viewportWrapper = document.querySelector<HTMLElement>('.apple-viewport-glow')

    expect(wrappers).toHaveLength(2)
    expect(viewportWrapper).toBeTruthy()
    expect(cardGlow.element).toBeTruthy()
    expect(cardGlow.element).not.toBe(viewportWrapper)
    expect(cardGlow.element?.style.getPropertyValue('top')).toBe('180px')
    expect(cardGlow.element?.style.getPropertyValue('left')).toBe('120px')

    cardGlow.destroy()
    viewportGlow.destroy()
  })
})
