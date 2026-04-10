import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type PackageJson = {
  bugs?: { url?: string }
  dependencies?: Record<string, string>
  exports?: Record<string, unknown>
  files?: string[]
  homepage?: string
  license?: string
  main?: string
  module?: string
  private?: boolean
  repository?: { type?: string; url?: string }
  scripts?: Record<string, string>
  sideEffects?: string[]
  types?: string
}

function readPackageJson(): PackageJson {
  return JSON.parse(
    readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
  ) as PackageJson
}

describe('package contract', () => {
  test('publishes built library assets instead of source files', () => {
    const packageJson = readPackageJson()

    expect(packageJson.private).not.toBe(true)
    expect(packageJson.main).toBe('./dist/lib/index.js')
    expect(packageJson.module).toBe('./dist/lib/index.js')
    expect(packageJson.types).toBe('./dist/lib/index.d.ts')
    expect(packageJson.exports).toEqual({
      '.': {
        types: './dist/lib/index.d.ts',
        import: './dist/lib/index.js',
      },
      './three': {
        types: './dist/lib/three/index.d.ts',
        import: './dist/lib/three/index.js',
      },
      './style.css': './dist/lib/style.css',
    })
    expect(packageJson.files).toEqual(['dist/lib', 'LICENSE', 'README.md'])
    expect(packageJson.sideEffects).toEqual(['**/*.css'])
  })

  test('exposes publish validation scripts', () => {
    const packageJson = readPackageJson()

    expect(packageJson.scripts?.['smoke:pack']).toBeDefined()
    expect(packageJson.scripts?.prepublishOnly).toContain('bun run check')
    expect(packageJson.scripts?.prepublishOnly).toContain('bun run test')
    expect(packageJson.scripts?.prepublishOnly).toContain('bun run build')
    expect(packageJson.scripts?.prepublishOnly).toContain('bun run smoke:pack')
  })

  test('keeps runtime dependencies limited to the published library needs', () => {
    const packageJson = readPackageJson()

    expect(packageJson.dependencies).toEqual({
      glowing: expect.any(String),
      three: expect.any(String),
    })
  })

  test('declares public metadata for npm consumers', () => {
    const packageJson = readPackageJson()

    expect(packageJson.license).toBe('MIT')
    expect(packageJson.homepage).toBe(
      'https://github.com/YunosukeYoshino/apple-intelligence-glow-ui#readme',
    )
    expect(packageJson.bugs?.url).toBe(
      'https://github.com/YunosukeYoshino/apple-intelligence-glow-ui/issues',
    )
    expect(packageJson.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/YunosukeYoshino/apple-intelligence-glow-ui.git',
    })
  })
})
