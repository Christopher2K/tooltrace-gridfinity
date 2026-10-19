import { describe, expect, it } from 'vitest'
import {
  computeTiles,
  labelPlacements,
  mmToPt,
  pageSetup,
  printableAreaMm,
  ptToMm,
  registrationMarks,
  toolTrayOutlines,
} from '~/lib/pdf'
import { GRID_UNIT_MM, type ToolTrace } from '~/stores/editor'

const a4 = pageSetup('a4')
const letter = pageSetup('letter')

describe('mm/pt conversion', () => {
  it('converts millimeters to PDF points at 72/25.4', () => {
    expect(mmToPt(25.4)).toBeCloseTo(72, 10)
    expect(mmToPt(1)).toBeCloseTo(2.834645669, 6)
    expect(mmToPt(0)).toBe(0)
  })

  it('round-trips pt → mm', () => {
    expect(ptToMm(mmToPt(42))).toBeCloseTo(42, 10)
  })
})

describe('printableAreaMm', () => {
  it('subtracts margins and header from A4', () => {
    expect(printableAreaMm(a4)).toEqual({ widthMm: 190, heightMm: 263 })
  })

  it('subtracts margins and header from Letter', () => {
    const area = printableAreaMm(letter)
    expect(area.widthMm).toBeCloseTo(215.9 - 20, 6)
    expect(area.heightMm).toBeCloseTo(279.4 - 20 - 14, 6)
  })
})

describe('computeTiles', () => {
  it('fits a 3×2 tray (126×84 mm) on a single A4 page', () => {
    const tiles = computeTiles(3 * GRID_UNIT_MM, 2 * GRID_UNIT_MM, a4)
    expect(tiles).toHaveLength(1)
    expect(tiles[0]).toMatchObject({
      index: 0,
      row: 0,
      col: 0,
      xMm: 0,
      yMm: 0,
      widthMm: 126,
      heightMm: 84,
    })
  })

  it('tiles a 5×5 tray (210×210 mm) into 2 tiles on A4', () => {
    const tiles = computeTiles(5 * GRID_UNIT_MM, 5 * GRID_UNIT_MM, a4)
    expect(tiles).toHaveLength(2)
    expect(tiles[0]).toMatchObject({ index: 0, row: 0, col: 0, xMm: 0, widthMm: 190 })
    expect(tiles[1]).toMatchObject({ index: 1, row: 0, col: 1, xMm: 190, widthMm: 20 })
    // The seam must neither overlap nor gap.
    expect(tiles[0].xMm + tiles[0].widthMm).toBe(tiles[1].xMm)
  })

  it('tiles a 6×8 tray (252×336 mm) row-major into 2×2 on A4', () => {
    const tiles = computeTiles(6 * GRID_UNIT_MM, 8 * GRID_UNIT_MM, a4)
    expect(tiles).toHaveLength(4)
    // Row-major: row 0 left-to-right, then row 1.
    expect(tiles.map((t) => [t.row, t.col])).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ])
    expect(tiles.map((t) => t.index)).toEqual([0, 1, 2, 3])
    // Last column/row clamped to the tray bounds.
    expect(tiles[1].widthMm).toBeCloseTo(252 - 190, 10)
    expect(tiles[2].heightMm).toBeCloseTo(336 - 263, 10)
    expect(tiles[3]).toMatchObject({ xMm: 190, yMm: 263 })
    // Full coverage without overlap.
    expect(tiles[2].yMm + tiles[2].heightMm).toBeCloseTo(336, 10)
  })

  it('keeps an exactly-page-sized tray on one tile', () => {
    const area = printableAreaMm(a4)
    expect(computeTiles(area.widthMm, area.heightMm, a4)).toHaveLength(1)
  })

  it('fits a 5×5 tray (210×210 mm) on one Letter page width', () => {
    // Letter printable width = 195.9 mm — still narrower than 210 mm.
    expect(computeTiles(210, 210, letter)).toHaveLength(2)
    // …but a 4×5 tray (168×210 mm) fits Letter in a single tile.
    expect(computeTiles(4 * GRID_UNIT_MM, 5 * GRID_UNIT_MM, letter)).toHaveLength(1)
  })
})

describe('registrationMarks', () => {
  it('marks the four tile corners with default 5 mm arms', () => {
    const tile = computeTiles(126, 84, a4)[0]
    const marks = registrationMarks(tile)
    expect(marks).toHaveLength(4)
    expect(marks.map((m) => [m.xMm, m.yMm])).toEqual([
      [0, 0],
      [126, 0],
      [0, 84],
      [126, 84],
    ])
    expect(marks.every((m) => m.armMm === 5)).toBe(true)
  })

  it('marks tile corners in tray space for tiled trays', () => {
    const tiles = computeTiles(5 * GRID_UNIT_MM, 5 * GRID_UNIT_MM, a4)
    const second = registrationMarks(tiles[1])
    expect(second.map((m) => [m.xMm, m.yMm])).toEqual([
      [190, 0],
      [210, 0],
      [190, 210],
      [210, 210],
    ])
  })
})

describe('toolTrayOutlines', () => {
  const rect: ToolTrace = {
    id: 't1',
    label: 'Rect',
    outline: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 0, y: 10 },
    ],
    position: { x: 100, y: 50 },
    rotationDeg: 0,
    toleranceMm: 1,
    pocketDepthMm: 8,
  }

  it('translates the outline by the tool position', () => {
    const { outline } = toolTrayOutlines(rect)
    expect(outline[0]).toEqual({ x: 100, y: 50 })
    expect(outline[2]).toEqual({ x: 120, y: 60 })
  })

  it('rotates 90° about the bbox center, preserving the center', () => {
    const { outline } = toolTrayOutlines({ ...rect, rotationDeg: 90 })
    const xs = outline.map((p) => p.x)
    const ys = outline.map((p) => p.y)
    // Center stays at position + (10, 5).
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(110, 6)
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(55, 6)
    // 20×10 rect rotated 90° → 10×20 bbox.
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(10, 6)
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(20, 6)
  })

  it('produces a tolerance outline expanded about the same center', () => {
    const { outline, offsetOutline } = toolTrayOutlines(rect)
    expect(offsetOutline).not.toBeNull()
    const b = (pts: { x: number; y: number }[]) => ({
      minX: Math.min(...pts.map((p) => p.x)),
      maxX: Math.max(...pts.map((p) => p.x)),
      minY: Math.min(...pts.map((p) => p.y)),
      maxY: Math.max(...pts.map((p) => p.y)),
    })
    const inner = b(outline)
    const outer = b(offsetOutline!)
    expect(outer.minX).toBeLessThan(inner.minX)
    expect(outer.maxX).toBeGreaterThan(inner.maxX)
    expect(outer.minY).toBeLessThan(inner.minY)
    expect(outer.maxY).toBeGreaterThan(inner.maxY)
  })

  it('returns no offset outline when tolerance is zero', () => {
    expect(toolTrayOutlines({ ...rect, toleranceMm: 0 }).offsetOutline).toBeNull()
  })
})

describe('labelPlacements', () => {
  const tool: ToolTrace = {
    id: 't1',
    label: 'Screwdriver',
    outline: [
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 30, y: 8 },
      { x: 0, y: 8 },
    ],
    position: { x: 20, y: 30 },
    rotationDeg: 0,
    toleranceMm: 0,
    pocketDepthMm: 12,
  }

  it('annotates label and pocket depth above the bbox top-left', () => {
    const [label] = labelPlacements([tool])
    expect(label.text).toBe('Screwdriver — 12 mm')
    expect(label.xMm).toBe(20)
    expect(label.yMm).toBeLessThan(30) // above the outline
  })

  it('falls back to below the bbox when there is no room above', () => {
    const [label] = labelPlacements([{ ...tool, position: { x: 20, y: 0 } }])
    expect(label.yMm).toBeGreaterThan(8) // below the outline
  })
})
