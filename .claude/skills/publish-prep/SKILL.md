---
name: publish-prep
description: Run the full pre-publish validation pipeline before releasing to npm. Equivalent to what prepublishOnly runs automatically on `bun publish`.
disable-model-invocation: true
---

Run `bun run prepublishOnly` and report the result.

This runs in sequence: type check → tests → library build → smoke pack.

If any step fails, stop and report which step failed and why. Do not proceed with publishing until all steps pass.

Once all steps pass, confirm the package is ready for release and remind the user to push a version tag to trigger the GitHub Actions release workflow.
