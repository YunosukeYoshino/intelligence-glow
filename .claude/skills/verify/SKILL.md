---
name: verify
description: Run the full local verification suite (type check + tests + package smoke test). Use before committing or opening a PR.
---

Run the following commands in order. Stop and report the first failure.

1. `bun run check` — TypeScript type check (no emit)
2. `bun run test` — Vitest unit and contract tests (jsdom)
3. `bun run smoke:pack` — Pack a tarball and verify entry-point integrity (export separation, CSS inclusion)

Report each step's outcome. If all pass, confirm the branch is ready to commit.
