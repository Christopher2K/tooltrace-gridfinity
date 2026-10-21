import { describe, expect, it } from 'vitest'
import {
  bboxCenter,
  bboxOf,
  circleOutline,
  cleanPolygon,
  clipPolygonToRect,
  flattenOutline,
  insertVertex,
  nearestEdgeProjection,
  notchOutline,
  offsetPolygon,
  pointInPolygon,
  polygonsIntersect,
  quadPoint,
  rectOutline,
  removeVertex,
  rotatePoint,
  segmentsIntersect,
  setEdgeCurve,
  signedArea,
} from '~/lib/geometry'
import type { Point, ToolTrace } from '~/stores/editor'

const sq = (s: number, at: Point = { x: 0, y: 0 }): Point[] => [
  { x: at.x, y: at.y },
  { x: at.x + s, y: at.y },
  { x: at.x + s, y: at.y + s },
  { x: at.x, y: at.y + s },
]

function makeTool(partial: Partial<ToolTrace> = {}): ToolTrace {
  return {
    id: 't1',
    label: 'T1',
    outline: sq(10),
    position: { x: 0, y: 0 },
    rotationDeg: 0,
    toleranceMm: 0,
    pocketDepthMm: 10,
    ...partial,
  }
}

describe('bbox / signedArea', () => {
  it('computes bounding boxes', () => {
    const pts = sq(10, { x: 5, y: -3 })
    expect(bboxOf(pts)).toEqual({ x: 5, y: -3, w: 10, h: 10 })
    expect(bboxCenter(pts)).toEqual({ x: 10, y: 2 })
  })

  it('signed area: positive for y-down clockwise (screen) winding', () => {
    expect(signedArea(sq(10))).toBeCloseTo(100)
    expect(signedArea([...sq(10)].reverse())).toBeCloseTo(-100)
  })
})

describe('rotatePoint', () => {
  it('rotates 90° about a center', () => {
    const p = rotatePoint({ x: 10, y: 0 }, { x: 0, y: 0 }, 90)
    expect(p.x).toBeCloseTo(0, 6)
    expect(p.y).toBeCloseTo(10, 6)
  })

  it('round-trips ±rotation', () => {
    const p = { x: 3.3, y: -7.1 }
    const c = { x: 1, y: 2 }
    const back = rotatePoint(rotatePoint(p, c, 37), c, -37)
    expect(back.x).toBeCloseTo(p.x, 6)
    expect(back.y).toBeCloseTo(p.y, 6)
  })
})

describe('curves', () => {
  it('quadPoint evaluates the midpoint of a quadratic Bézier', () => {
    const mid = quadPoint({ x: 0, y: 0 }, { x: 5, y: 10 }, { x: 10, y: 0 }, 0.5)
    expect(mid).toEqual({ x: 5, y: 5 })
  })

  it('flattenOutline subdivides curved edges', () => {
    const tool = makeTool({ curves: { 0: { x: 5, y: -5 } } })
    const flat = flattenOutline(tool, 12)
    expect(flat.length).toBe(4 - 1 + 12) // edge 0 replaced by 12 segments
  })

  it('flattenOutline without curves returns the outline', () => {
    expect(flattenOutline(makeTool())).toEqual(sq(10))
  })
})

describe('vertex editing', () => {
  it('setEdgeCurve sets and clears curve control points', () => {
    const tool = makeTool()
    const curved = { ...tool, ...setEdgeCurve(tool, 1, { x: 10, y: 5 }) }
    expect(curved.curves?.[1]).toEqual({ x: 10, y: 5 })
    const cleared = { ...curved, ...setEdgeCurve(curved as ToolTrace, 1, null) }
    expect(cleared.curves).toBeUndefined()
  })

  it('insertVertex remaps curve indices past the split edge', () => {
    const tool = makeTool({ curves: { 2: { x: 5, y: 15 } } })
    const patch = insertVertex(tool, 0, { x: 5, y: 0 })
    expect(patch.outline?.length).toBe(5)
    expect(patch.curves).toEqual({ 3: { x: 5, y: 15 } })
  })

  it('insertVertex drops the curve on the split edge', () => {
    const tool = makeTool({ curves: { 0: { x: 5, y: -5 } } })
    const patch = insertVertex(tool, 0, { x: 5, y: 0 })
    expect(patch.curves).toBeUndefined()
  })

  it('removeVertex refuses to go below 3 vertices', () => {
    expect(removeVertex(makeTool({ outline: sq(10).slice(0, 3) }), 0)).toBeNull()
  })

  it('removeVertex drops curves adjacent to the removed vertex and reindexes', () => {
    const tool = makeTool({
      outline: sq(10),
      curves: { 0: { x: 5, y: -5 }, 2: { x: 10, y: 5 } },
    })
    const patch = removeVertex(tool, 1)
    expect(patch?.outline?.length).toBe(3)
    // old edge 2 (v2→v3) survives as edge 1; edge 0 (v0→v1) and 1 (v1→v2) dropped
    expect(patch?.curves).toEqual({ 1: { x: 10, y: 5 } })
  })
})

describe('offsetPolygon', () => {
  it('expands a square by d on every side', () => {
    const off = offsetPolygon(sq(10, { x: 5, y: 5 }), 1)
    const b = bboxOf(off)
    expect(b.x).toBeCloseTo(4, 1)
    expect(b.y).toBeCloseTo(4, 1)
    expect(b.w).toBeCloseTo(12, 1)
    expect(b.h).toBeCloseTo(12, 1)
  })

  it('shrinks with negative d', () => {
    const b = bboxOf(offsetPolygon(sq(10), -1))
    expect(b.w).toBeCloseTo(8, 1)
  })

  it('d=0 returns the input unchanged', () => {
    const pts = sq(10)
    expect(offsetPolygon(pts, 0)).toBe(pts)
  })
})

describe('intersections', () => {
  it('segmentsIntersect detects crossings and misses parallels', () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 })).toBe(true)
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 0, y: 5 }, { x: 10, y: 5 })).toBe(false)
  })

  it('pointInPolygon', () => {
    const poly = sq(10)
    expect(pointInPolygon({ x: 5, y: 5 }, poly)).toBe(true)
    expect(pointInPolygon({ x: 15, y: 5 }, poly)).toBe(false)
  })

  it('polygonsIntersect: overlap, containment, separation', () => {
    expect(polygonsIntersect(sq(10), sq(10, { x: 5, y: 5 }))).toBe(true)
    expect(polygonsIntersect(sq(10), sq(2, { x: 4, y: 4 }))).toBe(true) // containment
    expect(polygonsIntersect(sq(10), sq(5, { x: 20, y: 20 }))).toBe(false)
  })
})

describe('clipPolygonToRect', () => {
  it('clips a square sticking out of the rect', () => {
    const clipped = clipPolygonToRect(sq(10, { x: -5, y: 0 }), 0, 0, 20, 20)
    const b = bboxOf(clipped)
    expect(b.x).toBeCloseTo(0, 6)
    expect(b.w).toBeCloseTo(5, 6)
  })

  it('drops polygons fully outside', () => {
    expect(clipPolygonToRect(sq(5, { x: 50, y: 50 }), 0, 0, 20, 20)).toEqual([])
  })
})

describe('cleanPolygon', () => {
  it('removes duplicate and nearly-duplicate points', () => {
    const pts = [...sq(10), { x: 0.001, y: 0.001 }]
    expect(cleanPolygon(pts).length).toBe(4)
  })
})

describe('nearestEdgeProjection', () => {
  it('projects onto the nearest edge', () => {
    const tool = makeTool()
    const { edge, point } = nearestEdgeProjection(tool, { x: 5, y: -3 })
    expect(edge).toBe(0)
    expect(point).toEqual({ x: 5, y: 0 })
  })
})

describe('shape generators', () => {
  it('rectOutline spans w×h from the origin', () => {
    expect(bboxOf(rectOutline(40, 25))).toEqual({ x: 0, y: 0, w: 40, h: 25 })
  })

  it('circleOutline approximates a circle of radius r', () => {
    const pts = circleOutline(15, 48)
    const b = bboxOf(pts)
    expect(b.w).toBeCloseTo(30, 1)
    expect(b.h).toBeCloseTo(30, 1)
    const c = bboxCenter(pts)
    for (const p of pts) {
      expect(Math.hypot(p.x - c.x, p.y - c.y)).toBeCloseTo(15, 1)
    }
  })

  it('notchOutline is a closed semicircular notch shape', () => {
    const pts = notchOutline(12, 24)
    expect(pts.length).toBeGreaterThan(10)
    expect(bboxOf(pts).w).toBeCloseTo(24, 1)
  })
})
