import type { View } from './types'

/**
 * Content transform for the default `preserveAspectRatio="xMidYMid meet"`: when the
 * SVG element's aspect ratio differs from the viewBox's, the drawn region is
 * letterboxed (centered, with bands on one axis). Naive client→mm mapping against the
 * full element size is then off by the band width — vertex handles jump on grab, etc.
 *
 * Returns `scale` (px per mm) and `offX/offY` (letterbox band sizes in px), so that
 * `mm = view.origin + (clientPx - rect.origin - off) / scale`.
 */
export function svgContentTransform(
  rect: { width: number; height: number },
  view: View,
): { scale: number; offX: number; offY: number } {
  const scale = Math.min(rect.width / view.w, rect.height / view.h)
  return {
    scale,
    offX: (rect.width - view.w * scale) / 2,
    offY: (rect.height - view.h * scale) / 2,
  }
}
