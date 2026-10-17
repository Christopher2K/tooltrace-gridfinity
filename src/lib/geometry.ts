import type { Point, ToolTrace } from '~/stores/editor'

export interface BBox {
  x: number
  y: number
  w: number
  h: number
}

export function bboxOf(pts: Point[]): BBox {
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  return { x: minX, y: minY, w: Math.max(...xs) - minX, h: Math.max(...ys) - minY }
}

export function bboxCenter(pts: Point[]): Point {
  const b = bboxOf(pts)
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 }
}

export function signedArea(pts: Point[]): number {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    const q = pts[(i + 1) % pts.length]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

export function rotatePoint(p: Point, center: Point, deg: number): Point {
  const rad = (deg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dx = p.x - center.x
  const dy = p.y - center.y
  return { x: center.x + dx * cos - dy * sin, y: center.y + dx * sin + dy * cos }
}

/** Tool outline in tray coordinates (position + rotation about bbox center applied). */
export function toolPoints(tool: ToolTrace): Point[] {
  const c = bboxCenter(tool.outline)
  return tool.outline.map((p) => {
    const r = tool.rotationDeg ? rotatePoint(p, c, tool.rotationDeg) : p
    return { x: r.x + tool.position.x, y: r.y + tool.position.y }
  })
}

/**
 * Naive miter-join polygon offset. Positive d expands. Approximate — fine for
 * editor preview; the STL generator uses a robust offsetter.
 */
export function offsetPolygon(pts: Point[], d: number): Point[] {
  if (d === 0 || pts.length < 3) return pts
  // In screen coordinates (y down), positive signed area = visually clockwise,
  // so the outward edge normal is (-dy, dx); otherwise (dy, -dx).
  const ccw = signedArea(pts) < 0
  const n = pts.length
  const out: Point[] = []
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n]
    const cur = pts[i]
    const next = pts[(i + 1) % n]
    const normals = [
      { ex: cur.x - prev.x, ey: cur.y - prev.y },
      { ex: next.x - cur.x, ey: next.y - cur.y },
    ].map(({ ex, ey }) => {
      const len = Math.hypot(ex, ey) || 1
      return ccw ? { x: -ey / len, y: ex / len } : { x: ey / len, y: -ex / len }
    })
    // Average of the two edge normals. |n_avg| = cos(θ/2), so the correct
    // miter length is d / cos(θ/2) = d / |n_avg|, i.e. scale n_avg by
    // d / |n_avg|². Clamped to avoid spikes on sharp corners.
    const nx = (normals[0].x + normals[1].x) / 2
    const ny = (normals[0].y + normals[1].y) / 2
    const len = Math.hypot(nx, ny) || 1e-9
    const scale = Math.min(1 / (len * len), 3) * d
    out.push({ x: cur.x + nx * scale, y: cur.y + ny * scale })
  }
  return out
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
}

export function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1 = cross(p3, p4, p1)
  const d2 = cross(p3, p4, p2)
  const d3 = cross(p1, p2, p3)
  const d4 = cross(p1, p2, p4)
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
}

export function pointInPolygon(p: Point, poly: Point[]): boolean {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]
    const b = poly[j]
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside
    }
  }
  return inside
}

export function polygonsIntersect(a: Point[], b: Point[]): boolean {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (segmentsIntersect(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true
    }
  }
  return pointInPolygon(a[0], b) || pointInPolygon(b[0], a)
}

// ---------------------------------------------------------------------------
// Shape generators (outlines in mm, origin = top-left of bbox)
// ---------------------------------------------------------------------------

export function rectOutline(wMm = 40, hMm = 25): Point[] {
  return [
    { x: 0, y: 0 },
    { x: wMm, y: 0 },
    { x: wMm, y: hMm },
    { x: 0, y: hMm },
  ]
}

export function circleOutline(rMm = 15, segments = 48): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push({ x: rMm + rMm * Math.cos(a), y: rMm + rMm * Math.sin(a) })
  }
  return pts
}

/** Finger notch: a semicircle scoop (flat edge at the top). */
export function notchOutline(rMm = 12, segments = 24): Point[] {
  const pts: Point[] = [{ x: 0, y: 0 }]
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI
    pts.push({ x: rMm + rMm * Math.cos(Math.PI - a), y: rMm * Math.sin(a) })
  }
  pts.push({ x: 0, y: 0 })
  return pts
}
