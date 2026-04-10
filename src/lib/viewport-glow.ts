import { attachGlowingViewportGlow } from './glowing/controller'
import type {
  ViewportGlowController,
  ViewportGlowOptions,
} from './shared/types'

export {
  type ViewportGlowBlendMode,
  type ViewportGlowController,
  type ViewportGlowOptions,
} from './shared/types'

export function attachViewportGlow(
  options: ViewportGlowOptions = {},
): ViewportGlowController {
  return attachGlowingViewportGlow(options)
}
