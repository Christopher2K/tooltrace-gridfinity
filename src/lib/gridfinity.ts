import earcut from 'earcut'
import type { Point, ToolTrace, TrayConfig } from '~/stores/editor'
import { GRID_UNIT_MM } from '~/stores/editor'
import { offsetPolygon, toolPoints } from './geometry'
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

/**
 * Builds a Gridfinity bin mesh with pocket wells per tool.
 *
 * Construction (no CSG): base chamfer (0.8 mm, mates into the stacking lip of
 * the bin below), rounded 4 mm corners, outer walls, hollow cavity, deck slab
 * with pocket openings (earcut holes), pocket wells with individual floors,
 * and a 4.4 mm / 1.9 mm taper stacking lip on top.
 */
export function buildBinMesh(tray: TrayConfig, tools: ToolTrace[]): Triangle[] {
  const mesh = new MeshBuilder()
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
  // coordinates, depth clamped so the floor stays 1 mm above the cavity floor.
  const pockets: Pocket[] = tools.map((t) => ({
    polygon: offsetPolygon(toolPoints(t), t.toleranceMm).map((p) => ({ x: p.x - C, y: p.y - C })),
    depthMm: Math.min(t.pocketDepthMm, cavityH - 1),
  }))

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
    // Open bin: cavity floor at base top, inner walls up to the deck.
    face(mesh, [iMain], GF.BASE_H, { x: 0, y: 0, z: 1 })
    loft(mesh, iMain, iMain, GF.BASE_H, deckZ, true)
    return mesh.triangles
  }

  const maxDepth = Math.max(...pockets.map((p) => p.depthMm))
  const deckBottomZ = deckZ - maxDepth

  // --- cavity below the deck ---
  face(mesh, [iMain], GF.BASE_H, { x: 0, y: 0, z: 1 }) // cavity floor
  face(mesh, [iMain], deckBottomZ, { x: 0, y: 0, z: -1 }) // cavity ceiling (deck underside)
  loft(mesh, iMain, iMain, GF.BASE_H, deckBottomZ, true)

  // --- deck top with pocket openings ---
  face(mesh, [iMain, ...pockets.map((p) => p.polygon)], deckZ, { x: 0, y: 0, z: 1 })

  // --- pocket wells ---
  for (const p of pockets) {
    const floorZ = deckZ - p.depthMm
    wallStrip(mesh, p.polygon, deckZ, floorZ, true)
    face(mesh, [p.polygon], floorZ, { x: 0, y: 0, z: 1 })
  }

  return mesh.triangles
}
