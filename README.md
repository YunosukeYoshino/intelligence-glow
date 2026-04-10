# apple-intelligence-glow-ui

Ambient viewport glow effects for browser UIs.

## What It Does

- Root entry gives you a lightweight `glowing`-based viewport glow
- `three` renderer is available from a separate `apple-intelligence-glow-ui/three` entry
- No React component is required for the public API

## Install

```bash
bun add apple-intelligence-glow-ui
```

```bash
npm install apple-intelligence-glow-ui
```

## Quick Start

Import the stylesheet once, then call `attachViewportGlow()`.

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

window.addEventListener('beforeunload', () => {
  glow.destroy()
})
```

元デモの雰囲気を保ちたいなら、まずは `colors` と `colors2` だけ変えるのがおすすめです。

## Three Renderer

`three` を使いたいときだけ、別 entry から import します。

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

## Usage Notes

- `apple-intelligence-glow-ui/style.css` は 1 回だけ import してください
- 通常は root entry の `attachViewportGlow()` から始めれば十分です
- `three` renderer が必要なときだけ `apple-intelligence-glow-ui/three` を使ってください
- この package は browser 専用です

## Browser-Only Usage

この package は `window` と `document` を前提にしています。SSR では client side だけで初期化してください。

```ts
import { attachViewportGlow } from 'apple-intelligence-glow-ui'

if (typeof window !== 'undefined') {
  const glow = attachViewportGlow({ active: true })
}
```

## Public API

```ts
type ViewportGlowOptions = {
  active?: boolean
  inset?: number
  radius?: string | number
  width?: number
  glowingBlurRatio?: number
  rotationDuration?: number
  colors?: string[]
  colors2?: string[]
  minimumVisibleMs?: number
  zIndex?: number
  blendMode?: 'lighten' | 'screen' | 'color-dodge' | 'color'
}
```

```ts
type ThreeViewportGlowOptions = {
  active?: boolean
  inset?: number
  radius?: string | number
  width?: number
  rotationDuration?: number
  colors?: string[]
  colors2?: string[]
  minimumVisibleMs?: number
  zIndex?: number
}
```

```ts
type ViewportGlowController<TOptions> = {
  show: () => void
  hide: () => void
  setActive: (active: boolean) => void
  setOptions: (next: Partial<TOptions>) => void
  destroy: () => void
}
```

## Release Checks

```bash
bun run check
bun run test
bun run build
bun pm pack --dry-run
bun run smoke:pack
```
