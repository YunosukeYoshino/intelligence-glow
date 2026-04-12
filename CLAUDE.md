# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` — never npm or yarn.

## Key Commands

| Purpose | Command |
|---|---|
| Dev server (demo) | `bun run dev` |
| Library build | `bun run build:lib` |
| Demo build | `bun run build:demo` |
| Type check | `bun run check` |
| Tests | `bun run test` |
| Package integrity | `bun run smoke:pack` |
| Pre-publish validation | `bun run prepublishOnly` |

`build:lib` is a composite command: `vite build --mode lib && tsc -p tsconfig.build.json && bun ./scripts/prepare-package.mjs`. Do not skip any step.

## Export Integrity

The root export (`.`) must NOT include the Three.js renderer. Three.js is only accessible via the `./three` entry point. This separation is enforced by `smoke:pack` — always run it after changing `src/lib/index.ts` or `src/lib/three/index.ts`.

```
import { attachViewportGlow } from 'intelligence-glow'         // ok
import { attachThreeViewportGlow } from 'intelligence-glow/three' // ok
import { attachThreeViewportGlow } from 'intelligence-glow'    // breaks smoke:pack
```

## Browser-Only Library

This library requires a browser environment (`window`, `document`). SSR is not supported. Browser-guard is in `src/lib/shared/browser.ts`.

## CSS Conventions

- All CSS class names use the `apple-*` prefix (e.g., `.apple-viewport-glow`, `.apple-glowing-wrapper`).
- CSS custom properties use the `--apple-glow-*` namespace.

## Testing

- Unit tests live in `src/lib/__tests__/`.
- Contract tests in `src/demo/*.test.ts` enforce architectural constraints (e.g., renderer separation, style isolation) — treat failures as spec violations, not just test failures.
- Test environment is jsdom; do not use real DOM APIs that jsdom does not support.

## Formatting and Linting

Biome is used for formatting and linting. Run `bunx biome check --write .` to format and fix. CI will enforce this.

## Release

Release is automated via GitHub Actions. Push a version tag to trigger publish:

```bash
# Bump version in package.json, then:
git add package.json && git commit -m "chore: bump version to x.y.z"
git tag vx.y.z && git push origin main && git push origin vx.y.z
```

The release workflow runs `bun run prepublishOnly` (check → test → build → smoke) then `npm publish`.

**Required:** `NPM_TOKEN` in GitHub repository secrets must be an **Automation** type token (not Classic or Granular). Automation tokens bypass 2FA for CI. Generate one at npmjs.com → Account → Access Tokens → Classic Token → Automation.

Set it with: `gh secret set NPM_TOKEN --repo YunosukeYoshino/intelligence-glow`
