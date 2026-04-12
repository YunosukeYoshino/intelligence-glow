# apple-intelligence-glow-ui

[![npm version](https://img.shields.io/npm/v/apple-intelligence-glow-ui)](https://www.npmjs.com/package/apple-intelligence-glow-ui)
[![CI](https://github.com/YunosukeYoshino/apple-intelligence-glow-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/YunosukeYoshino/apple-intelligence-glow-ui/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/YunosukeYoshino/apple-intelligence-glow-ui)](LICENSE)
[![types](https://img.shields.io/badge/types-TypeScript-3178c6)](https://www.typescriptlang.org/)

Ambient viewport glow effects inspired by Apple Intelligence — a rotating, corner-hugging color gradient that wraps the browser viewport. Vanilla TypeScript with no framework dependency. Two renderers: a lightweight CSS-blend `glowing` renderer and a WebGL Three.js aurora renderer.

## Features

- **Framework-agnostic** — plain TypeScript, works in any browser project
- **Two renderers** — `glowing` (CSS blend modes, low overhead) and `three` (WebGL aurora, richer visuals)
- **Minimum-visible guard** — prevents flicker on fast show/hide cycles
- **Fully imperative API** — call `show()`, `hide()`, `setOptions()`, `destroy()` from anywhere
- **Tree-shakeable** — Three.js is isolated behind a separate entry point; it is never bundled unless you import it
- **Typed** — ships with TypeScript declarations

## Installation

```bash
bun add apple-intelligence-glow-ui
```

```bash
npm install apple-intelligence-glow-ui
```

## Quick Start

Import the stylesheet once, then call `attachViewportGlow()`:

```ts
import 'apple-intelligence-glow-ui/style.css'
import { attachViewportGlow } from 'apple-intelligence-glow-ui'

const glow = attachViewportGlow({
  active: true,
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
  inset: -2,
  minimumVisibleMs: 520,
  radius: '0px',
  rotationDuration: 1800,
  width: 9,
})

// Tie the lifecycle to your app's teardown
window.addEventListener('beforeunload', () => glow.destroy())
```

The function returns a controller immediately. Call `glow.show()` / `glow.hide()` in response to user actions, or call `glow.setActive(true)` to keep it on continuously.

> [!TIP]
> Start by tuning only `colors` and `colors2`. The defaults for everything else are calibrated to match the original Apple Intelligence feel.

## Renderers

### `glowing` renderer (default)

Uses the [`glowing`](https://www.npmjs.com/package/glowing) package, which paints a rotating conic gradient onto the viewport edge using CSS blend modes. It is the lightest option and degrades gracefully on older browsers.

```ts
import 'apple-intelligence-glow-ui/style.css'
import { attachViewportGlow } from 'apple-intelligence-glow-ui'

const glow = attachViewportGlow({ active: true })
```

### `three` renderer

Uses Three.js and a custom GLSL shader to paint an aurora that stays on the perimeter and briefly boosts intensity whenever `show()` is called. Import it from the dedicated entry point to avoid pulling Three.js into your main bundle.

```ts
import 'apple-intelligence-glow-ui/style.css'
import { attachThreeViewportGlow } from 'apple-intelligence-glow-ui/three'

const glow = attachThreeViewportGlow({
  active: true,
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
  inset: -2,
  minimumVisibleMs: 520,
  radius: '0px',
  rotationDuration: 2200,
  width: 5,
})
```

> [!IMPORTANT]
> The root entry (`apple-intelligence-glow-ui`) never re-exports anything from Three.js. If you need to verify this invariant after touching either index file, run `bun run smoke:pack`.

## API Reference

### Options

Both renderers share a common set of options. Defaults may differ between renderers — the columns below show `glowing / three` where they diverge.

| Option | Type | Default | Description |
|---|---|---|---|
| `active` | `boolean` | `true` | Whether the glow is visible on mount |
| `colors` | `string[]` | Apple palette | Primary glow colors (conic gradient stops) |
| `colors2` | `string[]` | Apple palette | Secondary soft-wash colors |
| `inset` | `number` | `-2` | Pixel inset — negative values bleed outside the viewport edge |
| `radius` | `string \| number` | `'0px'` | Border radius of the glow frame |
| `width` | `number` | `9 / 5` | Glow width in pixels |
| `rotationDuration` | `number` | `1800 / 2600` | Full rotation cycle in milliseconds |
| `minimumVisibleMs` | `number` | `520` | Minimum time the glow stays visible after `show()`, to prevent flicker |
| `zIndex` | `number` | `50` | CSS `z-index` of the glow overlay |
| `glowingBlurRatio` | `number` | `1.4` | Blur multiplier — **glowing renderer only** |
| `blendMode` | `'lighten' \| 'screen' \| 'color-dodge' \| 'color'` | `'lighten'` | CSS blend mode — **glowing renderer only** |

### Controller

Both `attachViewportGlow` and `attachThreeViewportGlow` return a `ViewportGlowController`:

```ts
type ViewportGlowController<TOptions> = {
  show: () => void
  hide: () => void
  setActive: (active: boolean) => void
  setOptions: (next: Partial<TOptions>) => void
  destroy: () => void
}
```

| Method | Description |
|---|---|
| `show()` | Make the glow visible immediately |
| `hide()` | Hide the glow immediately |
| `setActive(active)` | Toggle visibility — `setActive(false)` schedules hide, respecting `minimumVisibleMs` |
| `setOptions(next)` | Merge partial options at runtime; changes take effect immediately |
| `destroy()` | Remove all DOM elements and cancel all timers |

### Exports

```ts
// Root entry — apple-intelligence-glow-ui
export { attachViewportGlow, attachGlowingViewportGlow, Glowing }
export type { ViewportGlowOptions, ViewportGlowController, ViewportGlowBlendMode, GlowingOptions, GlowingBlendMode }

// Three entry — apple-intelligence-glow-ui/three
export { attachThreeViewportGlow }
export type { ThreeViewportGlowOptions, ThreeViewportGlowController }
```

## Browser-Only

This package requires `window` and `document`. It throws at runtime in Node.js or any SSR context. Initialise it conditionally when targeting SSR frameworks:

```ts
import { attachViewportGlow } from 'apple-intelligence-glow-ui'

if (typeof window !== 'undefined') {
  const glow = attachViewportGlow({ active: true })
}
```

## CSS Conventions

- All class names use the `apple-*` prefix: `.apple-viewport-glow`, `.apple-viewport-glow-target`, `.apple-three-viewport-glow`
- CSS custom properties use the `--apple-glow-*` namespace
- Import the stylesheet exactly once — it is safe to import in the entry file of your application

## Development

| Command | Description |
|---|---|
| `bun run dev` | Start the interactive demo at `localhost:5173` |
| `bun run build:lib` | Build the distributable library |
| `bun run build:demo` | Build the static demo site |
| `bun run check` | TypeScript type check (no emit) |
| `bun run test` | Run unit and contract tests with Vitest |
| `bun run smoke:pack` | Pack the tarball and verify export integrity |
| `bun run prepublishOnly` | Full pre-release gate (check → test → build → smoke) |

> [!NOTE]
> `build:lib` is a composite step: `vite build --mode lib && tsc -p tsconfig.build.json && bun ./scripts/prepare-package.mjs`. Do not skip any step manually.

Formatting and linting use [Biome](https://biomejs.dev):

```bash
bunx biome check --write .
```

## Release

Releases are automated via GitHub Actions. Push a version tag to publish to npm:

```bash
# Bump version in package.json first, then:
git add package.json
git commit -m "chore: bump version to x.y.z"
git tag vx.y.z
git push origin main && git push origin vx.y.z
```

The [release workflow](.github/workflows/release.yml) runs `prepublishOnly` and publishes to npm automatically. Requires `NPM_TOKEN` to be set in repository secrets.

CI runs on every push and pull request to `main` — check type, test, build, and smoke-pack must all pass.
