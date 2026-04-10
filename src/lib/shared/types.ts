export type ViewportGlowBlendMode =
  | 'lighten'
  | 'screen'
  | 'color-dodge'
  | 'color'

type SharedViewportGlowOptions = {
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

export type ViewportGlowOptions = SharedViewportGlowOptions & {
  glowingBlurRatio?: number
  blendMode?: ViewportGlowBlendMode
}

export type ThreeViewportGlowOptions = SharedViewportGlowOptions

export type ViewportGlowController<TOptions extends object = ViewportGlowOptions> = {
  show: () => void
  hide: () => void
  setActive: (active: boolean) => void
  setOptions: (next: Partial<TOptions>) => void
  destroy: () => void
}

export type ThreeViewportGlowController =
  ViewportGlowController<ThreeViewportGlowOptions>

export const DEFAULT_VIEWPORT_GLOW_OPTIONS: Required<ViewportGlowOptions> = {
  active: true,
  inset: -2,
  radius: '0px',
  width: 8,
  glowingBlurRatio: 1.18,
  rotationDuration: 2400,
  colors: ['#cd96ff', '#ff89bd', '#ffad84', '#ffc291', '#cd96ff'],
  colors2: [
    'rgba(212,176,255,0.34)',
    'rgba(255,255,255,0)',
    'rgba(255,164,207,0.18)',
    'rgba(255,255,255,0)',
    'rgba(255,200,142,0.28)',
    'rgba(255,255,255,0)',
    'rgba(212,176,255,0.34)',
  ],
  minimumVisibleMs: 520,
  zIndex: 50,
  blendMode: 'lighten',
}
