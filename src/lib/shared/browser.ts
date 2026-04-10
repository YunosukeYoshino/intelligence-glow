const BROWSER_ENVIRONMENT_ERROR =
  'apple-intelligence-glow-ui requires a browser environment with window and document.'

export function assertBrowserViewportGlowSupport() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error(BROWSER_ENVIRONMENT_ERROR)
  }
}
