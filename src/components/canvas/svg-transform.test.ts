import { describe, expect, it } from 'vitest'
import { svgContentTransform } from './svg-transform'

// The canvas svg uses preserveAspectRatio="xMidYMid meet" (the default). When the
// element's aspect ratio differs from the view's, the drawn region is letterboxed and
// client→mm math must account for the bands — otherwise absolute-position gestures
// (vertex/midpoint drags) land offset from the pointer.

describe('svgContentTransform', () => {
  it('exact fit: no bands, scale is uniform', () => {
    const t = svgContentTransform({ width: 800, height: 600 }, { x: 0, y: 0, w: 200, h: 150 })
    expect(t.scale).toBe(4)
    expect(t.offX).toBe(0)
    expect(t.offY).toBe(0)
  })

  it('element wider than view: vertical bands, height-driven scale', () => {
    // Element 1000×600, view 200×150 → scale limited by height (4), drawn width 800.
    const t = svgContentTransform({ width: 1000, height: 600 }, { x: 0, y: 0, w: 200, h: 150 })
    expect(t.scale).toBe(4)
    expect(t.offX).toBe(100)
    expect(t.offY).toBe(0)
  })

  it('element taller than view: horizontal bands, width-driven scale', () => {
    // Element 800×800, view 200×150 → scale limited by width (4), drawn height 600.
    const t = svgContentTransform({ width: 800, height: 800 }, { x: 0, y: 0, w: 200, h: 150 })
    expect(t.scale).toBe(4)
    expect(t.offX).toBe(0)
    expect(t.offY).toBe(100)
  })

  it('round-trips a client point through the letterbox mapping', () => {
    const view = { x: 10, y: 20, w: 126, h: 84 }
    const rect = { width: 700, height: 700 } // taller element → horizontal bands
    const t = svgContentTransform(rect, view)
    // mm point at view center → client px
    const mm = { x: view.x + view.w / 2, y: view.y + view.h / 2 }
    const px = { x: (mm.x - view.x) * t.scale + t.offX, y: (mm.y - view.y) * t.scale + t.offY }
    // …and back
    expect(view.x + (px.x - t.offX) / t.scale).toBeCloseTo(mm.x, 10)
    expect(view.y + (px.y - t.offY) / t.scale).toBeCloseTo(mm.y, 10)
    // Naive (broken) mapping would have landed (h - w)/2 * scale px off in y.
    expect(t.offY).toBeCloseTo(((rect.height - (rect.width / view.w) * view.h) / 2) * 1, 10)
  })
})
