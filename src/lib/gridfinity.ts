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
  CHAMFER: 0.8, // 45° chamfer at the very bottom (mates with the lip below)
  LIP_H: 4.4, // stacking lip height
  LIP_TAPER: 1.9, // stacking lip outward flare per side
  MAGNET_D: 6.5,
  MAGNET_DEPTH: 2.4,
  MAGNET_INSET: 8, // from each cell corner
} as const

interface Pocket {
  /** Polygon in tray mm coordinates (tolerance applied). */
  polygon: Point[]
  depthMm: number
}

function circlePoly(cx: number, cy: number, r: number, segments = 16): Point[] {
  const pts: Point[] = []
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
  }
  return pts
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
  const oBottom = roundedRect(C + GF.CHAMFER, C + GF.CHAMFER, C + W - GF.CHAMFER, C + H - GF.CHAMFER, R - GF.CHAMFER)
  const oMain = roundedRect(C, C, C + W, C + H, R)
  const oLip = roundedRect(C - GF.LIP_TAPER, C - GF.LIP_TAPER, C + W + GF.LIP_TAPER, C + H + GF.LIP_TAPER, R + GF.LIP_TAPER)
  const iMain = roundedRect(C + GF.WALL_T, C + GF.WALL_T, C + W - GF.WALL_T, C + H - GF.WALL_T, R - GF.WALL_T)
  const iLip = roundedRect(
    C + GF.WALL_T - GF.LIP_TAPER,
    C + GF.WALL_T - GF.LIP_TAPER,
    C + W - GF.WALL_T + GF.LIP_TAPER,
    C + H - GF.WALL_T + GF.LIP_TAPER,
    R - GF.WALL_T + GF.LIP_TAPER,
  )

  // Pockets: transformed outlines + fit tolerance offset, shifted into bin
  // coordinates, depth clamped so the floor stays 1 mm above the cavity floor.
  const pockets: Pocket[] = tools.map((t) => ({
    polygon: offsetPolygon(toolPoints(t), t.toleranceMm).map((p) => ({ x: p.x - C, y: p.y - C })),
    depthMm: Math.min(t.pocketDepthMm, cavityH - 1),
  }))

  // --- bottom face (+ optional magnet holes per cell corner) ---
  const magnetHoles: Point[][] = []
  if (tray.magnetHoles) {
    for (let cx = 0; cx < tray.widthUnits; cx++) {
      for (let cy = 0; cy < tray.heightUnits; cy++) {
        const ox = cx * GF.PITCH
        const oy = cy * GF.PITCH
        for (const [ix, iy] of [
          [GF.MAGNET_INSET, GF.MAGNET_INSET],
          [GF.PITCH - GF.MAGNET_INSET, GF.MAGNET_INSET],
          [GF.PITCH - GF.MAGNET_INSET, GF.PITCH - GF.MAGNET_INSET],
          [GF.MAGNET_INSET, GF.PITCH - GF.MAGNET_INSET],
        ]) {
          magnetHoles.push(circlePoly(ox + ix, oy + iy, GF.MAGNET_D / 2))
        }
      }
    }
  }
  face(mesh, [oBottom, ...magnetHoles], 0, { x: 0, y: 0, z: -1 })
  for (const hole of magnetHoles) {
    wallStrip(mesh, hole, GF.MAGNET_DEPTH, 0, true)
    face(mesh, [hole], GF.MAGNET_DEPTH, { x: 0, y: 0, z: 1 })
  }

  // --- base chamfer + outer walls + stacking lip ---
  loft(mesh, oBottom, oMain, 0, GF.CHAMFER, false)
  loft(mesh, oMain, oMain, GF.CHAMFER, deckZ, false)
  loft(mesh, oMain, oLip, deckZ, rimZ, false) // lip outer flare
  loft(mesh, iMain, iLip, deckZ, rimZ, true) // lip inner flare
  face(mesh, [oLip, iLip], rimZ, { x: 0, y: 0, z: 1 }) // lip top ring

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
