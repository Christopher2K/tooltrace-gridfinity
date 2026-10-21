import { describe, expect, it } from 'vitest'
import { applyH, homography, otsuThreshold, simplify } from '~/lib/vision'
import type { Point } from '~/stores/editor'

describe('otsuThreshold', () => {
  it('separates a clean bimodal distribution', () => {
    // 90% white paper (240–255), 10% black tools (0–15)
    const data = new Uint8Array(10000)
    for (let i = 0; i < data.length; i++) data[i] = i % 10 === 0 ? (i % 16) : 240 + (i % 16)
    const t = otsuThreshold(data)
    // The threshold must land in the gap between the two clusters.
    expect(t).toBeGreaterThanOrEqual(10)
    expect(t).toBeLessThan(240)
  })

  it('handles uniform input without crashing', () => {
    const t = otsuThreshold(new Uint8Array(100).fill(128))
    expect(Number.isFinite(t)).toBe(true)
  })
})

describe('homography', () => {
  const unitSquare: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ]

  it('identity mapping', () => {
    const h = homography(unitSquare, unitSquare)
    for (const p of unitSquare) {
      const q = applyH(h, p.x, p.y)
      expect(q.x).toBeCloseTo(p.x, 6)
      expect(q.y).toBeCloseTo(p.y, 6)
    }
  })

  it('scale + translate mapping', () => {
    const dst: Point[] = [
      { x: 10, y: 20 },
      { x: 110, y: 20 },
      { x: 110, y: 220 },
      { x: 10, y: 220 },
    ]
    const h = homography(unitSquare, dst)
    const q = applyH(h, 0.5, 0.5)
    expect(q.x).toBeCloseTo(60, 4)
    expect(q.y).toBeCloseTo(120, 4)
  })

  it('inverts a perspective warp (round-trip)', () => {
    // Trapezoid: photo of a sheet tilted away from the camera.
    const photo: Point[] = [
      { x: 100, y: 80 },
      { x: 900, y: 120 },
      { x: 980, y: 1100 },
      { x: 60, y: 1050 },
    ]
    const rect: Point[] = [
      { x: 0, y: 0 },
      { x: 1200, y: 0 },
      { x: 1200, y: 1697 },
      { x: 0, y: 1697 },
    ]
    const fwd = homography(photo, rect)
    const inv = homography(rect, photo)
    for (const p of photo) {
      const q = applyH(fwd, p.x, p.y)
      const back = applyH(inv, q.x, q.y)
      expect(back.x).toBeCloseTo(p.x, 2)
      expect(back.y).toBeCloseTo(p.y, 2)
    }
  })
})

describe('simplify (RDP)', () => {
  it('keeps collinear points out', () => {
    const line: Point[] = Array.from({ length: 20 }, (_, i) => ({ x: i, y: i * 0.999 }))
    const out = simplify(line, 0.5)
    expect(out.length).toBeLessThan(6)
  })

  it('preserves sharp corners', () => {
    const zigzag: Point[] = [
      { x: 0, y: 0 },
      { x: 5, y: 0.05 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]
    const out = simplify(zigzag, 0.5)
    expect(out.length).toBeGreaterThanOrEqual(4)
  })
})
