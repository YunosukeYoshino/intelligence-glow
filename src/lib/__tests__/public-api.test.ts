import { afterEach, describe, expect, test, vi } from 'vitest'

const browserGlobals = [
  'document',
  'window',
] as const

function removeBrowserGlobals() {
  for (const key of browserGlobals) {
    vi.stubGlobal(key, undefined)
  }
}

describe('public browser-only API guards', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('attachViewportGlow throws a clear browser-only error outside the DOM', async () => {
    removeBrowserGlobals()
    const { attachViewportGlow } = await import('../viewport-glow')

    expect(() => attachViewportGlow()).toThrowError(
      'apple-intelligence-glow-ui requires a browser environment with window and document.',
    )
  })

  test('attachGlowingViewportGlow throws a clear browser-only error outside the DOM', async () => {
    removeBrowserGlobals()
    const { attachGlowingViewportGlow } = await import('../glowing/controller')

    expect(() => attachGlowingViewportGlow()).toThrowError(
      'apple-intelligence-glow-ui requires a browser environment with window and document.',
    )
  })

  test('attachThreeViewportGlow throws a clear browser-only error outside the DOM', async () => {
    removeBrowserGlobals()
    const { attachThreeViewportGlow } = await import('../three')

    expect(() => attachThreeViewportGlow()).toThrowError(
      'apple-intelligence-glow-ui requires a browser environment with window and document.',
    )
  })
})

describe('public entry points', () => {
  test('keeps the root entry focused on the glowing renderer', async () => {
    const root = await import('../index')
    const threeEntry = await import('../three')

    expect(root.attachViewportGlow).toBeTypeOf('function')
    expect(root.attachGlowingViewportGlow).toBeTypeOf('function')
    expect('attachThreeViewportGlow' in root).toBe(false)
    expect(threeEntry.attachThreeViewportGlow).toBeTypeOf('function')
  })
})
