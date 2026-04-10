import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('demo contract', () => {
  test('keeps tuning controls within sane visual ranges', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/demo/app.tsx'),
      'utf8',
    )

    expect(source).toContain('max={12}')
    expect(source).toContain('min={4}')
    expect(source).toContain('max={40}')
    expect(source).toContain('min={0}')
    expect(source).toContain('max={-2}')
    expect(source).toContain('min={-8}')
    expect(source).toContain('max={4200}')
  })

  test('lets the demo switch between glowing and three renderers', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/demo/app.tsx'),
      'utf8',
    )

    expect(source).toContain('THREE_RENDERER_PRESET')
    expect(source).toContain('GLOWING_RENDERER_PRESET')
    expect(source).toContain("renderer === 'glowing'")
    expect(source).toContain("renderer === 'three'")
    expect(source).toContain('attachThreeViewportGlow')
    expect(source).toContain('attachViewportGlow(options)')
    expect(source).toContain('Renderer')
  })

  test('keeps the demo shell styling separate from the glow default radius', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/demo/app.tsx'),
      'utf8',
    )

    expect(source).toContain('radius: 0')
    expect(source).toContain('rounded-[1.75rem] border')
  })

  test('styles the viewport glow by wrapping the glowing package', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/lib/styles/viewport-glow.css'),
      'utf8',
    )

    expect(source).toContain("@import 'glowing/dist/index.css';")
    expect(source).toContain('.apple-glowing-wrapper')
    expect(source).toContain('.apple-viewport-glow')
    expect(source).toContain('.apple-three-viewport-glow')
    expect(source).toContain("[data-boost-state='active']")
    expect(source).not.toContain('.apple-glow-motion')
    expect(source).not.toContain('.ai-viewport-glow__segment')
  })
})
