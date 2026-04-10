export function removeViewportArtifacts(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
    node.remove()
  })
}

export function toRadiusPx(value: string | number): number {
  if (typeof value === 'number') {
    return value
  }

  if (value.endsWith('rem')) {
    const rem = Number.parseFloat(value)
    const rootSize = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    )
    return rem * (Number.isFinite(rootSize) ? rootSize : 16)
  }

  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}
