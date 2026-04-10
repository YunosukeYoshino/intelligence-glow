import { describe, expect, test } from 'vitest'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

describe('source layout', () => {
  test('keeps src/lib top-level focused on public entry points and domains', () => {
    const entries = readdirSync(resolve(process.cwd(), 'src/lib')).sort()

    expect(entries).toEqual([
      '__tests__',
      'glowing',
      'index.ts',
      'shared',
      'styles',
      'three',
      'viewport-glow.ts',
    ])
  })
})
