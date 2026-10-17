import earcut from 'earcut'
import type { Point, ToolTrace, TrayConfig } from '~/stores/editor'
import { GRID_UNIT_MM } from '~/stores/editor'
import { cleanPolygon, clipPolygonToRect, offsetPolygon, pointInPolygon, segmentsIntersect, toolPoints } from './geometry'
import { MeshBuilder, type Triangle, type Vec3 } from './stl'

/** Gridfinity dimensions (mm). */
export const GF = {
  PITCH: GRID_UNIT_MM, // 42
  CLEARANCE: 0.5, // total, per bin dimension
  BASE_H: 4.75, // solid base block height
  WALL_T: 1.2, // wall thickness
  HEIGHT_UNIT: 7, // per height level
  CORNER_R: 4, // outer corner radius
  CHAMFER: 0.8, // 45° chamfer on every cell edge (mates with the lip below)
  LIP_H: 4.4, // stacking lip height
  LIP_TAPER: 1.9, // stacking lip outward flare per side
} as const

interface Pocket {
  /** Polygon in tray mm coordinates (tolerance applied). */
  polygon: Point[]
  depthMm: number
}

/** Checks a closed polygon for non-adjacent edge intersections. */
function isSelfIntersecting(pts: Point[]): boolean {
  const n = pts.length
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue // adjacent wrap edges
      if (segmentsIntersect(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return true
    }
  }
  return false
}

/** Triangulates a horizontal face (outer polygon + holes) at height z. */
function face(mesh: MeshBuilder, polys: Point[][], z: number, hint: Vec3) {
  const flat: number[] = []
  const holes: number[] = []
  polys.forEach((poly, i) => {
    if (i > 0) holes.push(flat.length / 2)
    for (const p of poly) flat.push(p.x, p.y)
  })
  const idx = earcut(flat, holes.length ? holes : undefined)
  const at = (i: number): Vec3 => ({ x: flat[i * 2], y: flat[i * 2 + 1], z })
  for (let t = 0; t < idx.length; t += 3) {
    mesh.tri(at(idx[t]), at(idx[t + 1]), at(idx[t + 2]), hint)
  }
}

function centroid(pts: Point[]): Point {
  let x = 0
  let y = 0
  for (const p of pts) {
    x += p.x
    y += p.y
  }
  return { x: x / pts.length, y: y / pts.length }
}

/** Vertical quad strip around a polygon between zTop and zBottom. */
function wallStrip(mesh: MeshBuilder, pts: Point[], zTop: number, zBottom: number, inward: boolean) {
  const c = centroid(pts)
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const toCenter = { x: c.x - mid.x, y: c.y - mid.y, z: 0 }
    const hint = inward ? toCenter : { x: -toCenter.x, y: -toCenter.y, z: 0 }
    mesh.quad(
      { x: a.x, y: a.y, z: zTop },
      { x: b.x, y: b.y, z: zTop },
      { x: b.x, y: b.y, z: zBottom },
      { x: a.x, y: a.y, z: zBottom },
      hint,
    )
  }
}

/** Rounded rectangle polygon. Corner arcs use a fixed segment count so
 * profiles at different insets/outsets stay loft-compatible (same point count).
 */
function roundedRect(x0: number, y0: number, x1: number, y1: number, r: number, seg = 6): Point[] {
  const pts: Point[] = []
  const corners = [
    { cx: x1 - r, cy: y0 + r, a0: -Math.PI / 2 }, // top-right
    { cx: x1 - r, cy: y1 - r, a0: 0 }, // bottom-right
    { cx: x0 + r, cy: y1 - r, a0: Math.PI / 2 }, // bottom-left
    { cx: x0 + r, cy: y0 + r, a0: Math.PI }, // top-left
  ]
  for (const { cx, cy, a0 } of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
    }
  }
  return pts
}

/** Vertical/angled quad strip between two loft-compatible profiles. */
function loft(mesh: MeshBuilder, bottom: Point[], top: Point[], zBottom: number, zTop: number, inward: boolean) {
  const c = centroid(top)
  for (let i = 0; i < bottom.length; i++) {
    const a = bottom[i]
    const b = bottom[(i + 1) % bottom.length]
    const a2 = top[i]
    const b2 = top[(i + 1) % top.length]
    const mid = { x: (a2.x + b2.x) / 2, y: (a2.y + b2.y) / 2 }
    const toCenter = { x: c.x - mid.x, y: c.y - mid.y, z: 0 }
    const hint = inward ? toCenter : { x: -toCenter.x, y: -toCenter.y, z: 0 }
    mesh.quad(
      { x: a.x, y: a.y, z: zBottom },
      { x: b.x, y: b.y, z: zBottom },
      { x: b2.x, y: b2.y, z: zTop },
      { x: a2.x, y: a2.y, z: zTop },
      hint,
    )
  }
}

// Corner indices used by cellProfile (matches roundedRect ordering).
const CORNER_TR = 0
const CORNER_BR = 1
const CORNER_BL = 2
const CORNER_TL = 3

/**
 * Square cell-block profile with rounded outer corner(s) — a cell may own two
 * outer corners when the bin is one unit wide/deep. Emits a fixed point count
 * (4 * (seg+1)) so profiles loft cleanly; square corners are repeated points.
 */
function cellProfile(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  roundedCorners: ReadonlySet<number>,
  seg = 6,
): Point[] {
  const corners = [
    { cx: x1 - r, cy: y0 + r, a0: -Math.PI / 2, sx: x1, sy: y0 }, // TR
    { cx: x1 - r, cy: y1 - r, a0: 0, sx: x1, sy: y1 }, // BR
    { cx: x0 + r, cy: y1 - r, a0: Math.PI / 2, sx: x0, sy: y1 }, // BL
    { cx: x0 + r, cy: y0 + r, a0: Math.PI, sx: x0, sy: y0 }, // TL
  ]
  const pts: Point[] = []
  corners.forEach((c, idx) => {
    if (roundedCorners.has(idx)) {
      for (let i = 0; i <= seg; i++) {
        const a = c.a0 + (i / seg) * (Math.PI / 2)
        pts.push({ x: c.cx + r * Math.cos(a), y: c.cy + r * Math.sin(a) })
      }
    } else {
      for (let i = 0; i <= seg; i++) pts.push({ x: c.sx, y: c.sy })
    }
  })
  return pts
}

/**
 * Rim profile, outset by `d` (0 = wall top, LIP_TAPER = lip flare), inset by
 * `inset` (0 = outer surface, WALL_T = inner surface). Straight sides are
 * segmented at every cell boundary so wall/groove edges pair exactly.
 * Corner arc centers are fixed; only the radius changes.
 */
function rimProfile(d: number, inset: number, ux: number, uy: number, seg = 6): Point[] {
  const C = GF.CLEARANCE / 2
  const R = GF.CORNER_R - inset + d
  const x0 = C + inset - d
  const y0 = C + inset - d
  const x1 = ux * GF.PITCH - C - inset + d
  const y1 = uy * GF.PITCH - C - inset + d
  const TL = { x: C + GF.CORNER_R, y: C + GF.CORNER_R }
  const TR = { x: ux * GF.PITCH - C - GF.CORNER_R, y: C + GF.CORNER_R }
  const BR = { x: ux * GF.PITCH - C - GF.CORNER_R, y: uy * GF.PITCH - C - GF.CORNER_R }
  const BL = { x: C + GF.CORNER_R, y: uy * GF.PITCH - C - GF.CORNER_R }

  const pts: Point[] = []
  // earcut drops collinear vertices, which would T-junction faces against the
  // segmented lofts — so groove points get a sub-micron perpendicular jitter.
  const J = 0.0002
  const j = (k: number) => (k % 2 === 0 ? J : -J)
  const arc = (c: Point, a0: number) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2)
      pts.push({ x: c.x + R * Math.cos(a), y: c.y + R * Math.sin(a) })
    }
  }
  arc(TR, -Math.PI / 2)
  // right side, top → bottom
  for (let k = 1; k < uy; k++) pts.push({ x: x1 + j(k), y: k * GF.PITCH - C }, { x: x1 + j(k), y: k * GF.PITCH + C })
  arc(BR, 0)
  // bottom side, right → left
  for (let k = ux - 1; k >= 1; k--) pts.push({ x: k * GF.PITCH + C, y: y1 + j(k) }, { x: k * GF.PITCH - C, y: y1 + j(k) })
  arc(BL, Math.PI / 2)
  // left side, bottom → top
  for (let k = uy - 1; k >= 1; k--) pts.push({ x: x0 + j(k), y: k * GF.PITCH + C }, { x: x0 + j(k), y: k * GF.PITCH - C })
  arc(TL, Math.PI)
  // top side, left → right
  for (let k = 1; k < ux; k++) pts.push({ x: k * GF.PITCH - C, y: y0 + j(k) }, { x: k * GF.PITCH + C, y: y0 + j(k) })
  return pts
}

/** Horizontal ring between two loft-compatible profiles at height z. */
function ring(mesh: MeshBuilder, outer: Point[], inner: Point[], z: number, hint: Vec3) {
  for (let i = 0; i < outer.length; i++) {
    const a = outer[i]
    const b = outer[(i + 1) % outer.length]
    const a2 = inner[i]
    const b2 = inner[(i + 1) % inner.length]
    mesh.quad(
      { x: a.x, y: a.y, z },
      { x: b.x, y: b.y, z },
      { x: b2.x, y: b2.y, z },
      { x: a2.x, y: a2.y, z },
      hint,
    )
  }
}

export interface BinMesh {
  triangles: Triangle[]
  /** Pockets skipped during construction (degenerate or corner conflicts). */
  warnings: string[]
}

/**
 * Builds a Gridfinity bin mesh with pocket wells per tool.
 *
 * Construction (no CSG): per-cell chamfered base blocks (V-groove underside),
 * rounded 4 mm corners, outer walls, a deck slab with pocket openings
 * (earcut holes), pocket wells with individual floors, and a 4.4 mm / 1.9 mm
 * taper stacking lip. The interior under the deck is solid — a hollow cavity
 * would print as an unsupported floating bridge. With no tools, an open
 * (hollow) bin is produced instead.
 */
export function buildBinMesh(tray: TrayConfig, tools: ToolTrace[]): BinMesh {
  const mesh = new MeshBuilder()
  const warnings: string[] = []
  const C = GF.CLEARANCE / 2
  const W = tray.widthUnits * GF.PITCH - GF.CLEARANCE
  const H = tray.heightUnits * GF.PITCH - GF.CLEARANCE
  const deckZ = GF.BASE_H + tray.heightLevelUnits * GF.HEIGHT_UNIT
  const rimZ = deckZ + GF.LIP_H
  const cavityH = deckZ - GF.BASE_H
  const R = GF.CORNER_R

  // Profiles (outer surface is inset by CLEARANCE/2 from the cell pitch box,
  // so pocket polygons in tray coordinates shift by -C to match).
  const oMain = rimProfile(0, 0, tray.widthUnits, tray.heightUnits)
  const oLip = rimProfile(GF.LIP_TAPER, 0, tray.widthUnits, tray.heightUnits)
  const iMain = rimProfile(0, GF.WALL_T, tray.widthUnits, tray.heightUnits)
  const iLip = rimProfile(GF.LIP_TAPER, GF.WALL_T, tray.widthUnits, tray.heightUnits)

  // Pockets: transformed outlines + fit tolerance offset, shifted into bin
  // coordinates, then cleaned (traced outlines can carry duplicate/collinear
  // points) and clipped inside the inner wall with a printable clearance so
  // the deck triangulation stays valid (no micron-wide slivers at the wall).
  // Pockets reaching into a rounded inner corner zone are skipped with a
  // warning (moving the tool slightly off the corner fixes it) — the rounded
  // corner can't be represented by the rect clip.
  const MARGIN = 0.4
  const innerR = R - GF.WALL_T
  const ix0 = C + GF.WALL_T + MARGIN
  const iy0 = C + GF.WALL_T + MARGIN
  const ix1 = C + W - GF.WALL_T - MARGIN
  const iy1 = C + H - GF.WALL_T - MARGIN
  const iw0 = C + GF.WALL_T
  const iw1 = C + W - GF.WALL_T
  const ih0 = C + GF.WALL_T
  const ih1 = C + H - GF.WALL_T
  const cornerZones: Point[][] = ([
    [iw0, ih0, iw0 + innerR + MARGIN, ih0 + innerR + MARGIN], // TL
    [iw1 - innerR - MARGIN, ih0, iw1, ih0 + innerR + MARGIN], // TR
    [iw0, ih1 - innerR - MARGIN, iw0 + innerR + MARGIN, ih1], // BL
    [iw1 - innerR - MARGIN, ih1 - innerR - MARGIN, iw1, ih1], // BR
  ] as const).map(([x0, y0, x1, y1]) => [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ])
  const hitsCornerZone = (poly: Point[]): boolean =>
    cornerZones.some((zone) => {
      if (poly.some((p) => pointInPolygon(p, zone))) return true
      for (let i = 0; i < poly.length; i++) {
        for (let j = 0; j < zone.length; j++) {
          if (segmentsIntersect(poly[i], poly[(i + 1) % poly.length], zone[j], zone[(j + 1) % zone.length])) return true
        }
      }
      return false
    })

  const pockets: Pocket[] = []
  for (const t of tools) {
    const base = toolPoints(t)
    // The naive miter offset can self-intersect on concave outlines; fall
    // back to the un-offset outline if it does.
    let polygon = offsetPolygon(base, t.toleranceMm)
    if (isSelfIntersecting(polygon)) polygon = base
    polygon = polygon.map((p) => ({ x: p.x - C, y: p.y - C }))
    polygon = cleanPolygon(clipPolygonToRect(polygon, ix0, iy0, ix1, iy1))
    if (polygon.length < 3 || isSelfIntersecting(polygon)) {
      warnings.push(`"${t.label}" was skipped (outline too small or self-intersecting)`)
      continue
    }
    if (hitsCornerZone(polygon)) {
      warnings.push(`"${t.label}" was skipped (too close to a rounded inner corner — nudge it away from the tray corner)`)
      continue
    }
    pockets.push({ polygon, depthMm: Math.min(t.pocketDepthMm, cavityH - 1) })
  }

  // --- underside: per-cell chamfered base blocks (V-groove grid) ---
  // Each cell gets a block chamfered on all 4 edges; blocks fuse above the
  // chamfer top, leaving the characteristic grooves along every cell edge.
  const cellCorners = (cx: number, cy: number): Set<number> => {
    const s = new Set<number>()
    if (cx === 0 && cy === 0) s.add(CORNER_TL)
    if (cx === tray.widthUnits - 1 && cy === 0) s.add(CORNER_TR)
    if (cx === 0 && cy === tray.heightUnits - 1) s.add(CORNER_BL)
    if (cx === tray.widthUnits - 1 && cy === tray.heightUnits - 1) s.add(CORNER_BR)
    return s
  }
  for (let cx = 0; cx < tray.widthUnits; cx++) {
    for (let cy = 0; cy < tray.heightUnits; cy++) {
      const x0 = cx * GF.PITCH + C
      const y0 = cy * GF.PITCH + C
      const x1 = (cx + 1) * GF.PITCH - C
      const y1 = (cy + 1) * GF.PITCH - C
      const rc = cellCorners(cx, cy)
      const block = cellProfile(x0, y0, x1, y1, R, rc)
      const bottom = cellProfile(x0 + GF.CHAMFER, y0 + GF.CHAMFER, x1 - GF.CHAMFER, y1 - GF.CHAMFER, R - GF.CHAMFER, rc)
      face(mesh, [bottom], 0, { x: 0, y: 0, z: -1 }) // block underside
      loft(mesh, bottom, block, 0, GF.CHAMFER, false) // 45° chamfer walls
    }
  }
  // Groove tops at chamfer height, tiled so every edge pairs exactly:
  // vertical strips per (boundary, row), horizontal strips per column,
  // plus squares at groove crossings.
  for (let k = 1; k < tray.widthUnits; k++) {
    for (let cy = 0; cy < tray.heightUnits; cy++) {
      face(mesh, [[
        { x: k * GF.PITCH - C, y: cy * GF.PITCH + C },
        { x: k * GF.PITCH + C, y: cy * GF.PITCH + C },
        { x: k * GF.PITCH + C, y: (cy + 1) * GF.PITCH - C },
        { x: k * GF.PITCH - C, y: (cy + 1) * GF.PITCH - C },
      ]], GF.CHAMFER, { x: 0, y: 0, z: -1 })
    }
  }
  for (let k = 1; k < tray.heightUnits; k++) {
    for (let cx = 0; cx < tray.widthUnits; cx++) {
      face(mesh, [[
        { x: cx * GF.PITCH + C, y: k * GF.PITCH - C },
        { x: (cx + 1) * GF.PITCH - C, y: k * GF.PITCH - C },
        { x: (cx + 1) * GF.PITCH - C, y: k * GF.PITCH + C },
        { x: cx * GF.PITCH + C, y: k * GF.PITCH + C },
      ]], GF.CHAMFER, { x: 0, y: 0, z: -1 })
    }
  }
  for (let kx = 1; kx < tray.widthUnits; kx++) {
    for (let ky = 1; ky < tray.heightUnits; ky++) {
      face(mesh, [[
        { x: kx * GF.PITCH - C, y: ky * GF.PITCH - C },
        { x: kx * GF.PITCH + C, y: ky * GF.PITCH - C },
        { x: kx * GF.PITCH + C, y: ky * GF.PITCH + C },
        { x: kx * GF.PITCH - C, y: ky * GF.PITCH + C },
      ]], GF.CHAMFER, { x: 0, y: 0, z: -1 })
    }
  }

  // --- outer walls + stacking lip ---
  loft(mesh, oMain, oMain, GF.CHAMFER, deckZ, false)
  loft(mesh, oMain, oLip, deckZ, rimZ, false) // lip outer flare
  loft(mesh, iMain, iLip, deckZ, rimZ, true) // lip inner flare
  ring(mesh, oLip, iLip, rimZ, { x: 0, y: 0, z: 1 }) // lip top ring

  if (pockets.length === 0) {
    // Open bin: hollow cavity down to the base top, inner walls up to the deck.
    face(mesh, [iMain], GF.BASE_H, { x: 0, y: 0, z: 1 })
    loft(mesh, iMain, iMain, GF.BASE_H, deckZ, true)
    return { triangles: mesh.triangles, warnings }
  }

  // Solid interior from the base up to the deck — only the pocket wells are
  // carved out. (A hollow under-deck cavity would print as an unsupported
  // floating bridge, and tool inserts want the material anyway.)
  //
  // The region between the inner wall and the pocket polygons is solid, so
  // no inner-wall or ceiling faces are emitted here at all.

  // --- deck top with pocket openings ---
  face(mesh, [iMain, ...pockets.map((p) => p.polygon)], deckZ, { x: 0, y: 0, z: 1 })

  // --- pocket wells ---
  for (const p of pockets) {
    const floorZ = deckZ - p.depthMm
    wallStrip(mesh, p.polygon, deckZ, floorZ, true)
    face(mesh, [p.polygon], floorZ, { x: 0, y: 0, z: 1 })
  }

  return { triangles: mesh.triangles, warnings }
}
