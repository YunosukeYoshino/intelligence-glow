import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

const consumerMainSource = readFileSync(
  resolve(process.cwd(), 'verification/consumer-smoke/src/main.js'),
  'utf8',
)

describe('consumer smoke fixture', () => {
  test('uses viewport glow only and keeps the demo preset calm', () => {
    expect(consumerMainSource).toContain(
      "import { attachViewportGlow } from 'intelligence-glow'",
    )
    expect(consumerMainSource).not.toContain('new Glowing')
    expect(consumerMainSource).not.toContain('data-toggle-card')
    expect(consumerMainSource).toContain('const APPLE_COLORS = [')
    expect(consumerMainSource).toContain('const APPLE_COLORS_2 = [')
    expect(consumerMainSource).toContain('inset: -2')
    expect(consumerMainSource).toContain("radius: '0px'")
    expect(consumerMainSource).toContain('rotationDuration: 1800')
    expect(consumerMainSource).toContain('width: 9')
    expect(consumerMainSource).not.toContain("renderer: 'glowing'")
  })
})
