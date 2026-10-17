import earcut from 'earcut'
import type { Point, ToolTrace, TrayConfig } from '~/stores/editor'
import { GRID_UNIT_MM } from '~/stores/editor'
import { offsetPolygon, toolPoints } from './geometry'
import { MeshBuilder, type Triangle, type Vec3 } from './stl'

/** Gridfinity dimensions (mm). */
export const GF = {
  PITCH: GRID_UNIT_MM, // 42
  BASE_H: 4.75, // solid base block height
  WALL_T: 1.2, // wall thickness
  HEIGHT_UNIT: 7, // per height level
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

const rect = (x0: number, y0: number, x1: number, y1: number): Point[] => [
  { x: x0, y: y0 },
  { x: x1, y: y0 },
  { x: x1, y: y1 },
  { x: x0, y: y1 },
]

/**
 * Builds a Gridfinity bin mesh with pocket wells per tool.
 *
 * Construction (no CSG): outer shell (bottom + outer walls), hollow cavity,
 * a deck slab whose top face has the pocket outlines as holes, and pocket
 * wells descending to their individual floors. Note: square corners (no
 * rounded Gridfinity corner radius or stacking lip yet).
 */
export function buildBinMesh(tray: TrayConfig, tools: ToolTrace[]): Triangle[] {
  const mesh = new MeshBuilder()
  const W = tray.widthUnits * GF.PITCH
  const H = tray.heightUnits * GF.PITCH
  const topZ = GF.BASE_H + tray.heightLevelUnits * GF.HEIGHT_UNIT
  const cavityH = topZ - GF.BASE_H

  const outer = rect(0, 0, W, H)
  const inner = rect(GF.WALL_T, GF.WALL_T, W - GF.WALL_T, H - GF.WALL_T)

  // Pockets: transformed outlines + fit tolerance offset, depth clamped so
  // the pocket floor stays at least 1 mm above the cavity floor.
  const pockets: Pocket[] = tools.map((t) => ({
    polygon: offsetPolygon(toolPoints(t), t.toleranceMm),
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
  face(mesh, [outer, ...magnetHoles], 0, { x: 0, y: 0, z: -1 })
  for (const hole of magnetHoles) {
    wallStrip(mesh, hole, GF.MAGNET_DEPTH, 0, true)
    face(mesh, [hole], GF.MAGNET_DEPTH, { x: 0, y: 0, z: 1 })
  }

  // --- outer walls ---
  wallStrip(mesh, outer, topZ, 0, false)

  if (pockets.length === 0) {
    // Open bin: cavity floor at base top, inner walls up to the rim.
    face(mesh, [inner], GF.BASE_H, { x: 0, y: 0, z: 1 })
    wallStrip(mesh, inner, topZ, GF.BASE_H, true)
    return mesh.triangles
  }

  const maxDepth = Math.max(...pockets.map((p) => p.depthMm))
  const deckBottomZ = topZ - maxDepth

  // --- cavity below the deck ---
  face(mesh, [inner], GF.BASE_H, { x: 0, y: 0, z: 1 }) // cavity floor
  face(mesh, [inner], deckBottomZ, { x: 0, y: 0, z: -1 }) // cavity ceiling (deck underside)
  wallStrip(mesh, inner, deckBottomZ, GF.BASE_H, true)

  // --- deck top with pocket openings ---
  face(mesh, [inner, ...pockets.map((p) => p.polygon)], topZ, { x: 0, y: 0, z: 1 })

  // --- pocket wells ---
  for (const p of pockets) {
    const floorZ = topZ - p.depthMm
    wallStrip(mesh, p.polygon, topZ, floorZ, true)
    face(mesh, [p.polygon], floorZ, { x: 0, y: 0, z: 1 })
  }

  return mesh.triangles
}
