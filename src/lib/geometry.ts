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
  const flat = flattenOutline(tool)
  const c = bboxCenter(flat)
  return flat.map((p) => {
    const r = tool.rotationDeg ? rotatePoint(p, c, tool.rotationDeg) : p
    return { x: r.x + tool.position.x, y: r.y + tool.position.y }
  })
}

/** Point on a quadratic Bézier at t ∈ [0,1]. */
export function quadPoint(p0: Point, c: Point, p1: Point, t: number): Point {
  const u = 1 - t
  return {
    x: u * u * p0.x + 2 * u * t * c.x + t * t * p1.x,
    y: u * u * p0.y + 2 * u * t * c.y + t * t * p1.y,
  }
}

/** Outline with curved edges subdivided into straight segments (tool-local coords). */
export function flattenOutline(tool: ToolTrace, segmentsPerCurve = 12): Point[] {
  if (!tool.curves || Object.keys(tool.curves).length === 0) return tool.outline
  const n = tool.outline.length
  const out: Point[] = []
  for (let i = 0; i < n; i++) {
    const p0 = tool.outline[i]
    const p1 = tool.outline[(i + 1) % n]
    const c = tool.curves[i]
    out.push(p0)
    if (c) {
      for (let k = 1; k < segmentsPerCurve; k++) {
        out.push(quadPoint(p0, c, p1, k / segmentsPerCurve))
      }
    }
  }
  return out
}

/** SVG path data for an outline with optional quadratic curve edges. */
export function outlinePath(outline: Point[], curves?: Record<number, Point>): string {
  if (outline.length === 0) return ''
  const n = outline.length
  let d = `M ${outline[0].x} ${outline[0].y}`
  for (let i = 0; i < n; i++) {
    const next = outline[(i + 1) % n]
    const c = curves?.[i]
    if (c) d += ` Q ${c.x} ${c.y} ${next.x} ${next.y}`
    else d += ` L ${next.x} ${next.y}`
  }
  return d + ' Z'
}

/**
 * Removes consecutive near-duplicate points and collinear middle points from
 * a closed polygon. Degenerate input like this (from traced/simplified
 * outlines) produces zero-length mesh edges and open seams.
 */
export function cleanPolygon(pts: Point[], minDist = 0.05): Point[] {
  if (pts.length < 3) return pts
  // Pass 1: drop near-duplicate consecutive points (incl. wrap-around).
  const deduped: Point[] = []
  for (const p of pts) {
    const last = deduped[deduped.length - 1]
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > minDist) deduped.push(p)
  }
  if (deduped.length > 1) {
    const first = deduped[0]
    const last = deduped[deduped.length - 1]
    if (Math.hypot(first.x - last.x, first.y - last.y) <= minDist) deduped.pop()
  }
  // Pass 2: drop collinear middle points.
  const out: Point[] = []
  for (let i = 0; i < deduped.length; i++) {
    const prev = deduped[(i - 1 + deduped.length) % deduped.length]
    const cur = deduped[i]
    const next = deduped[(i + 1) % deduped.length]
    const cross = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x)
    const len =
      (Math.hypot(cur.x - prev.x, cur.y - prev.y) * Math.hypot(next.x - cur.x, next.y - cur.y)) || 1
    if (Math.abs(cross) / len > 1e-4) out.push(cur)
  }
  return out.length >= 3 ? out : deduped
}

/** Sutherland–Hodgman clip of a polygon to an axis-aligned rectangle. */
export function clipPolygonToRect(pts: Point[], x0: number, y0: number, x1: number, y1: number): Point[] {
  let poly = clipPolygonToPlane(pts, -1, 0, -x0)
  poly = clipPolygonToPlane(poly, 1, 0, x1)
  poly = clipPolygonToPlane(poly, 0, -1, -y0)
  poly = clipPolygonToPlane(poly, 0, 1, y1)
  return poly
}

/** Clips a polygon to the half-plane nx·x + ny·y ≤ d. */
export function clipPolygonToPlane(pts: Point[], nx: number, ny: number, d: number): Point[] {
  const inside = (p: Point) => nx * p.x + ny * p.y <= d + 1e-9
  const intersect = (a: Point, b: Point): Point => {
    const da = nx * a.x + ny * a.y - d
    const db = nx * b.x + ny * b.y - d
    const t = da / (da - db || 1e-12)
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
  }
  const out: Point[] = []
  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i]
    const prev = pts[(i - 1 + pts.length) % pts.length]
    const curIn = inside(cur)
    const prevIn = inside(prev)
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur))
      out.push(cur)
    } else if (prevIn) {
      out.push(intersect(prev, cur))
    }
  }
  return out
}

/** Finds the nearest edge to a local point and the projected point on it. */
export function nearestEdgeProjection(
  tool: ToolTrace,
  p: Point,
): { edge: number; point: Point; dist: number } {
  const n = tool.outline.length
  let best = { edge: 0, point: { ...tool.outline[0] }, dist: Infinity }
  for (let i = 0; i < n; i++) {
    const a = tool.outline[i]
    const b = tool.outline[(i + 1) % n]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len2 = dx * dx + dy * dy || 1e-9
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2))
    const proj = { x: a.x + t * dx, y: a.y + t * dy }
    const dist = Math.hypot(p.x - proj.x, p.y - proj.y)
    if (dist < best.dist) best = { edge: i, point: proj, dist }
  }
  return best
}

/** Sets or clears the curve on edge i. Returns the patch for updateTool. */
export function setEdgeCurve(tool: ToolTrace, edge: number, control: Point | null): Partial<ToolTrace> {
  const curves = { ...(tool.curves ?? {}) }
  if (control) curves[edge] = control
  else delete curves[edge]
  return { curves: Object.keys(curves).length > 0 ? curves : undefined }
}

/** Inserts a vertex on edge i. Any curve on that edge is straightened. */
export function insertVertex(tool: ToolTrace, edge: number, p: Point): Partial<ToolTrace> {
  const outline = [...tool.outline.slice(0, edge + 1), p, ...tool.outline.slice(edge + 1)]
  const curves: Record<number, Point> = {}
  for (const [k, c] of Object.entries(tool.curves ?? {})) {
    const i = Number(k)
    if (i < edge) curves[i] = c
    else if (i > edge) curves[i + 1] = c
    // curve on the split edge is dropped
  }
  return { outline, curves: Object.keys(curves).length > 0 ? curves : undefined }
}

/** Removes vertex i (keeps at least 3 vertices). Curves on adjacent edges are dropped. */
export function removeVertex(tool: ToolTrace, index: number): Partial<ToolTrace> | null {
  const n = tool.outline.length
  if (n <= 3) return null
  const outline = tool.outline.filter((_, i) => i !== index)
  const curves: Record<number, Point> = {}
  for (const [k, c] of Object.entries(tool.curves ?? {})) {
    const i = Number(k)
    // Old edge i connects v_i → v_{i+1}. Edges touching the removed vertex are dropped.
    if (i === index || i === (index - 1 + n) % n) continue
    const newIdx = i > index ? i - 1 : i
    curves[newIdx] = c
  }
  return { outline, curves: Object.keys(curves).length > 0 ? curves : undefined }
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
