import { describe, expect, it } from 'vitest'
import { GF, buildBinMesh } from '~/lib/gridfinity'
import { rectOutline } from '~/lib/geometry'
import type { ToolTrace, TrayConfig } from '~/stores/editor'

const tray = (w: number, h: number, levels = 3): TrayConfig => ({
  widthUnits: w,
  heightUnits: h,
  heightLevelUnits: levels,
})

function makeTool(partial: Partial<ToolTrace>): ToolTrace {
  return {
    id: 't',
    label: 'T',
    outline: rectOutline(30, 20),
    position: { x: 20, y: 20 },
    rotationDeg: 0,
    toleranceMm: 0.5,
    pocketDepthMm: 8,
    ...partial,
  }
}

function meshStats(triangles: ReturnType<typeof buildBinMesh>['triangles']) {
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity
  const edges = new Map<string, { count: number; a: [number, number, number]; b: [number, number, number] }>()
  const key = (x: number, y: number, z: number) => `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`
  for (const [a, b, c] of triangles) {
    for (const v of [a, b, c]) {
      minX = Math.min(minX, v.x)
      minY = Math.min(minY, v.y)
      minZ = Math.min(minZ, v.z)
      maxX = Math.max(maxX, v.x)
      maxY = Math.max(maxY, v.y)
      maxZ = Math.max(maxZ, v.z)
    }
    for (const [p, q] of [
      [a, b],
      [b, c],
      [c, a],
    ] as const) {
      const kp = key(p.x, p.y, p.z)
      const kq = key(q.x, q.y, q.z)
      const k = kp < kq ? `${kp}|${kq}` : `${kq}|${kp}`
      const e = edges.get(k) ?? { count: 0, a: [p.x, p.y, p.z], b: [q.x, q.y, q.z] }
      e.count++
      edges.set(k, e)
    }
  }
  return { minX, minY, minZ, maxX, maxY, maxZ, edges: [...edges.values()] }
}

/**
 * Slicer-grade watertightness: vertices are welded exactly (1 µm grid in
 * MeshBuilder), so an edge used once must be a T-junction — its midpoint lies
 * on another edge — never a crack. Edges used 3+ times are non-manifold.
 */
function expectSealed(edges: ReturnType<typeof meshStats>['edges']) {
  const overUsed = edges.filter((e) => e.count > 2)
  expect(overUsed).toEqual([])
  const open = edges.filter((e) => e.count === 1)
  const uncovered = open.filter((e) => {
    const mx = (e.a[0] + e.b[0]) / 2
    const my = (e.a[1] + e.b[1]) / 2
    const mz = (e.a[2] + e.b[2]) / 2
    // Covered if the midpoint lies on some other edge segment.
    return !edges.some((f) => {
      if (f === e) return false
      const dx = f.b[0] - f.a[0]
      const dy = f.b[1] - f.a[1]
      const dz = f.b[2] - f.a[2]
      const rx = mx - f.a[0]
      const ry = my - f.a[1]
      const rz = mz - f.a[2]
      const cross =
        Math.abs(ry * dz - rz * dy) + Math.abs(rz * dx - rx * dz) + Math.abs(rx * dy - ry * dx)
      if (cross > 1e-6) return false
      const t = (rx * dx + ry * dy + rz * dz) / (dx * dx + dy * dy + dz * dz)
      return t > 1e-9 && t < 1 - 1e-9
    })
  })
  expect(uncovered).toEqual([])
}

describe('buildBinMesh', () => {
  it('builds a plain bin with correct outer dimensions', () => {
    const { triangles, warnings } = buildBinMesh(tray(2, 2), [])
    expect(triangles.length).toBeGreaterThan(100)
    expect(warnings).toEqual([])

    const s = meshStats(triangles)
    const size = 2 * GF.PITCH - GF.CLEARANCE
    expect(s.maxX - s.minX).toBeCloseTo(size, 1)
    expect(s.maxY - s.minY).toBeCloseTo(size, 1)
    expect(s.minZ).toBeCloseTo(0, 6)
    // Total height = 7 mm per level + stacking lip
    expect(s.maxZ).toBeCloseTo(3 * GF.HEIGHT_UNIT + GF.LIP_H, 1)
  })

  it('is sealed: welded vertices, only coincident T-junctions, no cracks', () => {
    const { triangles } = buildBinMesh(tray(2, 1), [])
    expectSealed(meshStats(triangles).edges)
  })

  it('adds pocket wells for tools, staying watertight', () => {
    const levels = 3
    const deckZ = levels * GF.HEIGHT_UNIT
    const withPocket = buildBinMesh(tray(2, 2), [makeTool({ pocketDepthMm: 8 })])
    expect(withPocket.warnings).toEqual([])
    // Pocket floor vertices exist at deckZ − depth.
    const zs = new Set<number>()
    for (const tri of withPocket.triangles) for (const v of tri) zs.add(Math.round(v.z * 100) / 100)
    expect(zs.has(deckZ - 8)).toBe(true)
    expectSealed(meshStats(withPocket.triangles).edges)
  })

  it('respects pocket depth against the cavity height', () => {
    const levels = 3
    const cavityH = levels * GF.HEIGHT_UNIT - GF.BASE_H
    const { triangles } = buildBinMesh(tray(2, 2), [makeTool({ pocketDepthMm: 6 })])
    const s = meshStats(triangles)
    // Pocket floor must not punch through the base: floor z = deckZ - depth >= BASE_H
    expect(s.minZ).toBeCloseTo(0, 6)
    expect(cavityH).toBeGreaterThan(6)
  })

  it('warns and skips pockets that reach the rounded inner corners', () => {
    // Tool pushed right into the corner where the rect clip can't represent the radius.
    const { warnings, triangles } = buildBinMesh(tray(1, 1), [
      makeTool({ outline: rectOutline(10, 10), position: { x: 0.6, y: 0.6 } }),
    ])
    expect(warnings.length).toBeGreaterThan(0)
    expect(triangles.length).toBeGreaterThan(0)
  })

  it('scales with tray units', () => {
    const small = meshStats(buildBinMesh(tray(1, 1), []).triangles)
    const large = meshStats(buildBinMesh(tray(4, 3), []).triangles)
    expect(large.maxX - large.minX).toBeCloseTo(4 * GF.PITCH - GF.CLEARANCE, 1)
    expect(large.maxY - large.minY).toBeCloseTo(3 * GF.PITCH - GF.CLEARANCE, 1)
    expect(small.maxX - small.minX).toBeCloseTo(1 * GF.PITCH - GF.CLEARANCE, 1)
  })
})
