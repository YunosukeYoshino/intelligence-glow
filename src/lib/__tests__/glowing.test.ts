import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { Glowing } from '../glowing/glowing'

class ResizeObserverMock {
  observe = vi.fn()
  disconnect = vi.fn()
}

describe('Glowing wrapper', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.useFakeTimers()
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  test('creates a glowing wrapper around the target element', async () => {
    const target = document.createElement('div')
    target.style.borderRadius = '28px'
    document.body.append(target)
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 12,
      y: 34,
      width: 320,
      height: 240,
      top: 34,
      left: 12,
      right: 332,
      bottom: 274,
      toJSON: () => ({}),
    })

    const glow = new Glowing(target, { width: 9, zIndex: 44 })
    await vi.runAllTimersAsync()

    const wrapper = document.querySelector<HTMLElement>('.glowing-wrapper')

    expect(wrapper).toBeTruthy()
    expect(wrapper?.classList.contains('apple-glowing-wrapper')).toBe(true)
    expect(wrapper?.dataset.state).toBe('visible')
    expect(wrapper?.style.getPropertyValue('top')).toBe('34px')
    expect(wrapper?.style.getPropertyValue('left')).toBe('12px')
    expect(wrapper?.style.getPropertyValue('width')).toBe('320px')
    expect(wrapper?.style.getPropertyValue('height')).toBe('240px')
    expect(wrapper?.style.getPropertyValue('--glowingWidth')).toBe('9px')
    expect(wrapper?.style.getPropertyValue('z-index')).toBe('44')
    expect(glow.element).toBe(wrapper)

    glow.destroy()
  })

  test('supports show hide and toggle', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      right: 100,
      bottom: 50,
      toJSON: () => ({}),
    })

    const glow = new Glowing(target, { width: 6 })
    await vi.runAllTimersAsync()
    const wrapper = document.querySelector<HTMLElement>('.glowing-wrapper')

    glow.hide()
    expect(wrapper?.dataset.state).toBe('hidden')
    expect(wrapper?.style.getPropertyValue('visibility')).toBe('visible')

    vi.advanceTimersByTime(180)
    expect(wrapper?.style.getPropertyValue('visibility')).toBe('hidden')

    glow.show()
    expect(wrapper?.dataset.state).toBe('visible')
    expect(wrapper?.style.getPropertyValue('visibility')).toBe('visible')

    glow.toggle()
    expect(wrapper?.dataset.state).toBe('hidden')

    vi.advanceTimersByTime(180)
    glow.toggle()
    expect(wrapper?.dataset.state).toBe('visible')
  })

  test('updates options and can retarget with set()', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)

    vi.spyOn(first, 'getBoundingClientRect').mockReturnValue({
      x: 10,
      y: 20,
      width: 120,
      height: 60,
      top: 20,
      left: 10,
      right: 130,
      bottom: 80,
      toJSON: () => ({}),
    })
    vi.spyOn(second, 'getBoundingClientRect').mockReturnValue({
      x: 40,
      y: 80,
      width: 240,
      height: 140,
      top: 80,
      left: 40,
      right: 280,
      bottom: 220,
      toJSON: () => ({}),
    })

    const glow = new Glowing(first, {
      colors: ['#111111', '#222222', '#333333', '#444444'],
    })
    await vi.runAllTimersAsync()

    glow.setOptions({
      borderRadius: 36,
      colors2: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'],
      glowingBlurRatio: 1.4,
      rotationDuration: 1800,
      width: 8,
      zIndex: 55,
    })

    let wrapper = document.querySelector<HTMLElement>('.glowing-wrapper')
    expect(wrapper?.style.getPropertyValue('--glowingWidth')).toBe('8px')
    expect(wrapper?.style.getPropertyValue('border-radius')).toBe('36px')
    expect(wrapper?.style.getPropertyValue('--glowingColors')).toContain('#111111')
    expect(wrapper?.style.getPropertyValue('z-index')).toBe('55')

    await glow.set(second, { width: 10 })
    await vi.runAllTimersAsync()

    wrapper = document.querySelector<HTMLElement>('.glowing-wrapper')
    expect(wrapper?.style.getPropertyValue('top')).toBe('80px')
    expect(wrapper?.style.getPropertyValue('left')).toBe('40px')
    expect(wrapper?.style.getPropertyValue('width')).toBe('240px')
    expect(wrapper?.style.getPropertyValue('--glowingWidth')).toBe('10px')
  })

  test('keeps multiple glowing instances isolated', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    document.body.append(first, second)

    vi.spyOn(first, 'getBoundingClientRect').mockReturnValue({
      x: 10,
      y: 20,
      width: 120,
      height: 60,
      top: 20,
      left: 10,
      right: 130,
      bottom: 80,
      toJSON: () => ({}),
    })
    vi.spyOn(second, 'getBoundingClientRect').mockReturnValue({
      x: 220,
      y: 180,
      width: 200,
      height: 120,
      top: 180,
      left: 220,
      right: 420,
      bottom: 300,
      toJSON: () => ({}),
    })

    const firstGlow = new Glowing(first, { width: 4, zIndex: 10 })
    const secondGlow = new Glowing(second, { width: 8, zIndex: 20 })
    await vi.runAllTimersAsync()

    const wrappers = Array.from(
      document.querySelectorAll<HTMLElement>('.glowing-wrapper'),
    )

    expect(wrappers).toHaveLength(2)
    expect(firstGlow.element).toBeTruthy()
    expect(secondGlow.element).toBeTruthy()
    expect(firstGlow.element).not.toBe(secondGlow.element)
    expect(firstGlow.element?.style.getPropertyValue('top')).toBe('20px')
    expect(firstGlow.element?.style.getPropertyValue('left')).toBe('10px')
    expect(firstGlow.element?.style.getPropertyValue('z-index')).toBe('10')
    expect(secondGlow.element?.style.getPropertyValue('top')).toBe('180px')
    expect(secondGlow.element?.style.getPropertyValue('left')).toBe('220px')
    expect(secondGlow.element?.style.getPropertyValue('z-index')).toBe('20')
  })

  test('remove tears down DOM and listeners', async () => {
    const target = document.createElement('div')
    document.body.append(target)
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      right: 100,
      bottom: 50,
      toJSON: () => ({}),
    })

    const glow = new Glowing(target)
    await vi.runAllTimersAsync()

    glow.remove()

    expect(document.querySelector('.glowing-wrapper')).toBeNull()
  })
})
