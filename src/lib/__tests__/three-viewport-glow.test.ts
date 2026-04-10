import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

const rendererInstances: Array<{ render: ReturnType<typeof vi.fn> }> = []

vi.mock('three', () => {
  class Scene {
    add = vi.fn()
  }

  class OrthographicCamera {
    bottom = -1
    left = -1
    position = { z: 1 }
    right = 1
    top = 1
    updateProjectionMatrix = vi.fn()
  }

  class PlaneGeometry {
    constructor(readonly width = 2, readonly height = 2) {}

    dispose = vi.fn()
  }

  class Vector2 {
    constructor(public x = 0, public y = 0) {}

    set = vi.fn((x: number, y: number) => {
      this.x = x
      this.y = y
      return this
    })
  }

  class Color {
    constructor(readonly value: string) {}
  }

  class ShaderMaterial {
    depthWrite
    fragmentShader
    transparent
    uniforms
    vertexShader

    constructor({
      depthWrite,
      fragmentShader,
      transparent,
      uniforms,
      vertexShader,
    }: {
      depthWrite: boolean
      fragmentShader: string
      transparent: boolean
      uniforms: Record<string, unknown>
      vertexShader: string
    }) {
      this.depthWrite = depthWrite
      this.fragmentShader = fragmentShader
      this.transparent = transparent
      this.uniforms = uniforms
      this.vertexShader = vertexShader
    }

    dispose = vi.fn()
  }

  class Mesh {
    position = { x: 0, y: 0, z: 0 }
    scale = { set: vi.fn() }

    constructor(
      readonly geometry: PlaneGeometry,
      readonly material: ShaderMaterial,
    ) {}
  }

  class WebGLRenderer {
    domElement = document.createElement('canvas')
    pixelRatio = 1
    render = vi.fn()
    setClearColor = vi.fn()
    setPixelRatio = vi.fn((ratio: number) => {
      this.pixelRatio = ratio
    })
    setSize = vi.fn((width: number, height: number) => {
      this.domElement.width = Math.round(width * this.pixelRatio)
      this.domElement.height = Math.round(height * this.pixelRatio)
      this.domElement.style.width = `${width}px`
      this.domElement.style.height = `${height}px`
    })
    dispose = vi.fn()

    constructor() {
      this.domElement.className = 'three-renderer-canvas'
      rendererInstances.push(this)
    }
  }

  return {
    Color,
    Mesh,
    OrthographicCamera,
    PlaneGeometry,
    Scene,
    ShaderMaterial,
    Vector2,
    WebGLRenderer,
  }
})

describe('attachThreeViewportGlow', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    rendererInstances.length = 0
    vi.useFakeTimers()
    vi.stubGlobal('devicePixelRatio', 2)
    vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  test('keeps the three glow hidden when active is false', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    attachThreeViewportGlow({ active: false })
    await vi.runAllTimersAsync()

    expect(document.querySelector('.apple-three-viewport-glow')).toBeNull()
  })

  test('shows a canvas wrapper when renderer is three', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    attachThreeViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    const wrapper = document.querySelector<HTMLElement>('.apple-three-viewport-glow')
    const canvas = wrapper?.querySelector('canvas')

    expect(wrapper).toBeTruthy()
    expect(canvas).toBeTruthy()
  })

  test('initializes a short boost when the three glow is shown', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    attachThreeViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    const wrapper = document.querySelector<HTMLElement>('.apple-three-viewport-glow')

    expect(wrapper?.dataset.boostState).toBe('active')
    expect(wrapper?.dataset.boostToken).toBe('1')
  })

  test('uses the shared viewport defaults when no explicit three preset is passed', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    attachThreeViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    const wrapper = document.querySelector<HTMLElement>('.apple-three-viewport-glow')

    expect(wrapper?.style.borderRadius).toBe(DEFAULT_RADIUS)
    expect(wrapper?.style.inset).toBe('-2px')
  })

  test('keeps the three glow visible for the minimum duration before hiding', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    const controller = attachThreeViewportGlow({
      active: true,
      minimumVisibleMs: 520,
    })
    await vi.runAllTimersAsync()

    controller.setActive(false)
    vi.advanceTimersByTime(200)
    expect(document.querySelector('.apple-three-viewport-glow')).toBeTruthy()

    vi.advanceTimersByTime(320)
    expect(document.querySelector('.apple-three-viewport-glow')).toBeNull()
  })

  test('hide removes the three glow immediately', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    const controller = attachThreeViewportGlow({
      active: true,
      minimumVisibleMs: 520,
    })
    await vi.runAllTimersAsync()

    controller.hide()

    expect(document.querySelector('.apple-three-viewport-glow')).toBeNull()
  })

  test('destroy clears timers, canvas, and animation frame listeners', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    const controller = attachThreeViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    controller.destroy()

    expect(document.querySelector('.apple-three-viewport-glow')).toBeNull()
    expect(cancelAnimationFrame).toHaveBeenCalled()
  })

  test('creates a canvas element while active', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    attachThreeViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    expect(
      document.querySelector('.apple-three-viewport-glow__canvas'),
    ).toBeTruthy()
  })

  test('uses drawing buffer resolution on high-DPI displays', async () => {
    const { attachThreeViewportGlow } = await import('../three')

    attachThreeViewportGlow({ active: true })
    await vi.runAllTimersAsync()

    const canvas = document.querySelector<HTMLCanvasElement>(
      '.apple-three-viewport-glow__canvas',
    )

    expect(canvas).toBeTruthy()
    expect(canvas?.width).toBeGreaterThan(window.innerWidth)
    expect(canvas?.height).toBeGreaterThan(window.innerHeight)
  })
})

const DEFAULT_RADIUS = '0px'
