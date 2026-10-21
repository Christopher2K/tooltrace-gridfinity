import { describe, expect, it } from 'vitest'
import type { BBox } from '~/lib/geometry'
import { computeAlignmentSnap } from '~/lib/snap'

const bb = (x: number, y: number, w: number, h: number): BBox => ({ x, y, w, h })

// Far-away tray so tray targets never interfere unless a test wants them.
const TRAY_W = 1000
const TRAY_H = 1000

describe('computeAlignmentSnap', () => {
  it('aligns a dragged edge to another tool edge within threshold', () => {
    // Dragged min x = 10.3, other min x = 10 → dx = -0.3
    const r = computeAlignmentSnap(bb(10.3, 200, 20, 10), [bb(10, 100, 30, 15)], TRAY_W, TRAY_H, 1)
    expect(r).not.toBeNull()
    expect(r!.dx).toBeCloseTo(-0.3)
    expect(r!.dy).toBe(0)
    const g = r!.guides.find((g) => g.axis === 'x')
    expect(g).toBeDefined()
    expect(g!.posMm).toBe(10)
  })

  it('aligns centers', () => {
    // Dragged center x = 25.4 (15.4 + 20/2), other center x = 25 (10 + 30/2)
    const r = computeAlignmentSnap(bb(15.4, 200, 20, 10), [bb(10, 100, 30, 15)], TRAY_W, TRAY_H, 1)
    expect(r!.dx).toBeCloseTo(-0.4)
  })

  it('aligns max edge to max edge', () => {
    // Dragged max x = 45.2 (25.2 + 20), other max x = 45 (15 + 30)
    const r = computeAlignmentSnap(bb(25.2, 200, 20, 10), [bb(15, 100, 30, 15)], TRAY_W, TRAY_H, 1)
    expect(r!.dx).toBeCloseTo(-0.2)
  })

  it('nearest candidate wins', () => {
    const dragged = bb(10.3, 200, 30, 10) // min 10.3, center 25.3, max 40.3
    // other1 offers min 10 (delta -0.3 from dragged min); other2 offers max
    // 40.4 (delta +0.1 from dragged max). +0.1 is nearer and must win.
    const other1 = bb(10, 100, 8, 15) // x targets: 10, 14, 18
    const other2 = bb(32.4, 300, 8, 15) // x targets: 32.4, 36.4, 40.4
    const r = computeAlignmentSnap(dragged, [other1, other2], TRAY_W, TRAY_H, 1)
    expect(r!.dx).toBeCloseTo(0.1)
    expect(r!.guides.find((g) => g.axis === 'x')!.posMm).toBe(40.4)
  })

  it('returns null when nothing is within threshold', () => {
    const r = computeAlignmentSnap(bb(50, 200, 20, 10), [bb(10, 100, 20, 10)], TRAY_W, TRAY_H, 1)
    expect(r).toBeNull()
  })

  it('returns null for non-positive threshold', () => {
    expect(computeAlignmentSnap(bb(10.1, 0, 20, 10), [bb(10, 0, 20, 10)], TRAY_W, TRAY_H, 0)).toBeNull()
  })

  it('snaps to tray edges and center lines', () => {
    // Left edge near tray left edge.
    let r = computeAlignmentSnap(bb(0.4, 300, 20, 10), [], 200, 200, 1)
    expect(r!.dx).toBeCloseTo(-0.4)
    expect(r!.guides.find((g) => g.axis === 'x')!.posMm).toBe(0)

    // Right edge near tray right edge: max = 199.6 → dx = +0.4.
    r = computeAlignmentSnap(bb(179.6, 300, 20, 10), [], 200, 200, 1)
    expect(r!.dx).toBeCloseTo(0.4)
    expect(r!.guides.find((g) => g.axis === 'x')!.posMm).toBe(200)

    // Center near tray center x = 100: center = 99.5 → dx = +0.5.
    r = computeAlignmentSnap(bb(89.5, 300, 20, 10), [], 200, 200, 1)
    expect(r!.dx).toBeCloseTo(0.5)
    expect(r!.guides.find((g) => g.axis === 'x')!.posMm).toBe(100)

    // Top edge near tray top.
    r = computeAlignmentSnap(bb(300, -0.6, 20, 10), [], 200, 200, 1)
    expect(r!.dy).toBeCloseTo(0.6)
    expect(r!.guides.find((g) => g.axis === 'y')!.posMm).toBe(0)
  })

  it('snaps axes independently', () => {
    // x aligns with another tool edge, y is far from anything.
    const r = computeAlignmentSnap(bb(10.2, 300, 20, 10), [bb(10, 100, 30, 15)], TRAY_W, TRAY_H, 0.5)
    expect(r!.dx).toBeCloseTo(-0.2)
    expect(r!.dy).toBe(0)
    expect(r!.guides).toHaveLength(1)
    expect(r!.guides[0].axis).toBe('x')
  })

  it('can snap both axes at once', () => {
    const r = computeAlignmentSnap(bb(10.2, 100.3, 20, 10), [bb(10, 100, 30, 15)], TRAY_W, TRAY_H, 0.5)
    expect(r!.dx).toBeCloseTo(-0.2)
    expect(r!.dy).toBeCloseTo(-0.3)
    expect(r!.guides).toHaveLength(2)
  })

  it('guide spans the perpendicular overlap of dragged and target bboxes', () => {
    // Dragged y: 105..115, other y: 100..120 → overlap 105..115.
    const r = computeAlignmentSnap(bb(10.2, 105, 20, 10), [bb(10, 100, 30, 20)], TRAY_W, TRAY_H, 0.5)
    const g = r!.guides.find((g) => g.axis === 'x')!
    expect(g.fromMm).toBe(105)
    expect(g.toMm).toBe(115)

    // Partial overlap: dragged y 115..125, other y 100..120 → overlap 115..120.
    const r2 = computeAlignmentSnap(bb(10.2, 115, 20, 10), [bb(10, 100, 30, 20)], TRAY_W, TRAY_H, 0.5)
    const g2 = r2!.guides.find((g) => g.axis === 'x')!
    expect(g2.fromMm).toBe(115)
    expect(g2.toMm).toBe(120)
  })

  it('guide falls back to the dragged extent when bboxes do not overlap perpendicularly', () => {
    const r = computeAlignmentSnap(bb(10.2, 200, 20, 10), [bb(10, 100, 30, 20)], TRAY_W, TRAY_H, 0.5)
    const g = r!.guides.find((g) => g.axis === 'x')!
    expect(g.fromMm).toBe(200)
    expect(g.toMm).toBe(210)
  })
})
