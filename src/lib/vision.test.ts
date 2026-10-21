import { describe, expect, it } from 'vitest'
import { adaptiveToolMask, applyH, homography, otsuThreshold, simplify } from '~/lib/vision'
import type { Point } from '~/stores/editor'

describe('adaptiveToolMask (shadow rejection)', () => {
  // 200×200 sheet at ~235. A light-gray tool (like the DJI gimbal: ~165) with a
  // genuinely SOFT shadow beside it (235→200 over 40px, like a blurred cast shadow),
  // plus a dark tool.
  const W = 200
  const H = 200
  function scene(): Uint8Array {
    const img = new Uint8Array(W * H).fill(235)
    // soft shadow: rows 40-120; ramps 235→200 across cols 100-139, flat 200 to col 190
    for (let y = 40; y < 120; y++) {
      for (let x = 100; x < 190; x++) {
        const d = Math.min(1, (x - 100) / 40)
        img[y * W + x] = Math.round(235 - 35 * d)
      }
    }
    // light-gray tool (rows 40-120, cols 30-95) — hard edges
    for (let y = 40; y < 120; y++) for (let x = 30; x < 95; x++) img[y * W + x] = 165
    // dark tool (rows 140-180, cols 30-70)
    for (let y = 140; y < 180; y++) for (let x = 30; x < 70; x++) img[y * W + x] = 60
    return img
  }
  const OPTS = { radius: 20, contrast: 16, gradMin: 28 }

  it('keeps light-gray tools but rejects soft shadows', () => {
    const mask = adaptiveToolMask(scene(), W, H, OPTS)
    // Tool edge pixels flagged (interior may be a hole — fillHoles handles it)
    expect(mask[80 * W + 30]).toBe(1) // light tool, ON its left edge (mask = edge ring)
    expect(mask[145 * W + 30]).toBe(1) // dark tool, on its left edge
    // Shadow rejected everywhere — even its darkest, hardest part
    for (let x = 100; x < 190; x += 5) {
      expect(mask[80 * W + x]).toBe(0)
    }
    // Paper untouched
    expect(mask[10 * W + 10]).toBe(0)
  })

  it('higher contrast rejects a light tool (sensitivity tradeoff)', () => {
    const mask = adaptiveToolMask(scene(), W, H, { ...OPTS, contrast: 90 })
    expect(mask[80 * W + 30]).toBe(0) // light tool (Δ≈70) now rejected
    expect(mask[145 * W + 30]).toBe(1) // dark tool still caught
  })

  it('a HARD dark shadow edge passes the gate (honest limitation)', () => {
    // A hard-edged dark shape is indistinguishable from a tool — that IS a tool
    // as far as any threshold method can tell. Sanity-check the gate opens.
    const img = new Uint8Array(W * H).fill(235)
    for (let y = 60; y < 120; y++) for (let x = 60; x < 140; x++) img[y * W + x] = 140
    const mask = adaptiveToolMask(img, W, H, OPTS)
    expect(mask[90 * W + 60]).toBe(1)
  })
})

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
