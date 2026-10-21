import type { Point, ToolTrace } from '~/stores/editor'
import { PAPER_SIZES, type PaperSize } from '~/lib/pdf'
import { MARKER_INSET_MM } from '~/lib/template'
import { uuid } from '~/lib/uuid'

export interface DetectionResult {
  tools: ToolTrace[]
  paperSizeMm: { width: number; height: number }
  mmPerPx: number
  /** How the calibration quad was found. */
  quadSource: QuadSource
  /** Object URL of the rectified top-down paper image (JPEG). */
  rectifiedImageUrl: string
  /** Debug visualizations (mask overlays). */
  debug?: Record<string, string>
}

/** User-tunable detection parameters (confidence/adjust UI). */
export interface DetectionOptions {
  /** Sensitivity offset (-40…+40): higher catches lighter tools but risks soft shadows. */
  thresholdOffset?: number
  /** Contour simplification scale (0.3…2). Lower = more detail/vertices. Default 1. */
  detailScale?: number
}

/** A rectified top-down scan, ready for (re-)detection with different options. */
export interface PreparedScan {
  /** Rectified grayscale pixels (row-major, 0–255). */
  rect: Uint8Array
  width: number
  height: number
  mmPerPx: number
  paperSizeMm: { width: number; height: number }
  /** How the calibration quad was found. */
  quadSource: QuadSource
  /** Object URL of the rectified top-down paper image (JPEG). */
  rectifiedImageUrl: string
  debug: Record<string, string>
}

export type QuadSource = 'markers' | 'paper' | 'manual'

export interface PrepareOptions {
  /**
   * Manual paper corners in full-resolution image pixels, ordered TL, TR, BR, BL.
   * Skips automatic paper/marker detection.
   */
  manualQuad?: Point[]
  /** Explicit reference-sheet size for marker calibration (overrides the remembered choice). */
  paperSize?: PaperSize
}

function maskToDataUrl(mask: Uint8Array, labels: Int32Array | null, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)
  for (let i = 0; i < mask.length; i++) {
    const v = mask[i] ? 255 : 0
    imageData.data[i * 4] = v
    imageData.data[i * 4 + 1] = labels && labels[i] ? 128 : v
    imageData.data[i * 4 + 2] = v
    imageData.data[i * 4 + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

function grayToDataUrl(data: Uint8Array, width: number, height: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)
  for (let i = 0; i < data.length; i++) {
    const v = data[i]
    imageData.data[i * 4] = v
    imageData.data[i * 4 + 1] = v
    imageData.data[i * 4 + 2] = v
    imageData.data[i * 4 + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/jpeg', 0.85)
}

/** Width of the rectified working image in px. */
const WARP_WIDTH = 1200
/** Downscaled width used for paper detection. */
const DETECT_WIDTH = 500
/** Minimum tool area as a fraction of paper area. */
const MIN_AREA_FRACTION = 0.003

/** Summed-area table for O(1) local means (integral image, (w+1)×(h+1)). */
function integralImage(data: Uint8Array, width: number, height: number): Float64Array {
  const sat = new Float64Array((width + 1) * (height + 1))
  const stride = width + 1
  for (let y = 0; y < height; y++) {
    let rowSum = 0
    for (let x = 0; x < width; x++) {
      rowSum += data[y * width + x]
      sat[(y + 1) * stride + x + 1] = sat[y * stride + x + 1] + rowSum
    }
  }
  return sat
}

export interface AdaptiveMaskOptions {
  /** Local window radius in px (~half the smallest tool feature). */
  radius: number
  /** How much darker than the local surround a pixel must be to count as tool. */
  contrast: number
  /** Minimum Sobel edge strength — separates hard tool edges from soft shadows. */
  gradMin: number
}

/**
 * Shadow-robust tool mask. A pixel is tool when ALL of these hold:
 *  1. clearly darker than its LOCAL neighborhood (not merely a global threshold) —
 *     rejects regions that are uniformly dim like the heart of a cast shadow;
 *  2. darker than a global guard just below the paper's white level;
 *  3. EITHER on a strong intensity edge (Sobel) OR near-black.
 *     Tool edges are hard (paper→plastic over a few px); cast-shadow boundaries
 *     are soft (tens of px), so the gradient gate rejects them even when they're
 *     dark enough to pass the local-contrast test.
 *
 * Large tools empty out in the middle (their interior's local mean IS the tool
 * color and has no gradient) — the caller's fillHoles restores interiors.
 */
export function adaptiveToolMask(
  data: Uint8Array,
  width: number,
  height: number,
  { radius, contrast, gradMin }: AdaptiveMaskOptions,
): Uint8Array {
  const sat = integralImage(data, width, height)
  const stride = width + 1

  // Paper level: mean of pixels above the Otsu split (the bright cluster).
  const t = otsuThreshold(data)
  let brightSum = 0
  let brightCount = 0
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= t) {
      brightSum += data[i]
      brightCount++
    }
  }
  const paperLevel = brightCount > 0 ? brightSum / brightCount : 240
  const globalGuard = paperLevel - 6

  const mask = new Uint8Array(data.length)
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - radius)
    const y1 = Math.min(height - 1, y + radius)
    for (let x = 0; x < width; x++) {
      const v = data[y * width + x]
      if (v >= globalGuard) continue
      const x0 = Math.max(0, x - radius)
      const x1 = Math.min(width - 1, x + radius)
      const sum =
        sat[(y1 + 1) * stride + x1 + 1] -
        sat[y0 * stride + x1 + 1] -
        sat[(y1 + 1) * stride + x0] +
        sat[y0 * stride + x0]
      const mean = sum / ((x1 - x0 + 1) * (y1 - y0 + 1))
      if (v >= mean - contrast) continue
      if (v < 60) {
        mask[y * width + x] = 1 // near-black: always tool (markers are pre-erased)
        continue
      }
      // Sobel gradient (3×3). Tool edges are hard; shadow boundaries are soft.
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        const i = y * width + x
        const gx =
          data[i - width + 1] + 2 * data[i + 1] + data[i + width + 1] -
          (data[i - width - 1] + 2 * data[i - 1] + data[i + width - 1])
        const gy =
          data[i + width - 1] + 2 * data[i + width] + data[i + width + 1] -
          (data[i - width - 1] + 2 * data[i - width] + data[i - width + 1])
        if (Math.abs(gx) + Math.abs(gy) >= gradMin) mask[i] = 1
      }
    }
  }
  return mask
}

/** localStorage key recording which template size the user last downloaded. */
const TEMPLATE_PAPER_KEY = 'tooltrace:template-paper'

/** Remember which reference-sheet size the user printed (drives marker-quad calibration). */
export function setTemplatePaperSize(paper: PaperSize) {
  try {
    localStorage.setItem(TEMPLATE_PAPER_KEY, paper)
  } catch {
    /* private mode etc. */
  }
}

function templatePaperSize(): { widthMm: number; heightMm: number } {
  try {
    const v = localStorage.getItem(TEMPLATE_PAPER_KEY)
    if (v === 'letter' || v === 'a4') return PAPER_SIZES[v]
  } catch {
    /* ignore */
  }
  return PAPER_SIZES.a4
}

/** Which reference-sheet size the user last downloaded ('a4' default). */
export function getTemplatePaperSize(): PaperSize {
  try {
    const v = localStorage.getItem(TEMPLATE_PAPER_KEY)
    if (v === 'letter' || v === 'a4') return v
  } catch {
    /* ignore */
  }
  return 'a4'
}

/**
 * Find the 4 printed fiducial markers: compact black squares just inside each
 * paper corner. Returns their centroids (lo-res px, TL/TR/BR/BL) or null.
 *
 * Search is restricted to dark components fully inside the detected paper
 * region, in a corner zone of 18% of the paper bbox, so tools in the middle
 * of the sheet are never mistaken for markers.
 */
function findMarkerQuad(
  gray: Uint8Array,
  width: number,
  height: number,
  paperLabels: Int32Array,
  paperLabel: number,
  paperArea: number,
): Point[] | null {
  // Printed markers are near-black; a fixed threshold keeps us independent of
  // the paper/desk Otsu split (which can shift with lighting).
  const MARKER_T = 100
  const mask = new Uint8Array(width * height)
  let any = false
  for (let i = 0; i < mask.length; i++) {
    if (paperLabels[i] === paperLabel && gray[i] < MARKER_T) {
      mask[i] = 1
      any = true
    }
  }
  if (!any) return null

  const { labels, sizes } = labelComponents(mask, width, height)

  // Paper bbox (for corner zones + plausible marker size).
  let px0 = width
  let py0 = height
  let px1 = 0
  let py1 = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (paperLabels[y * width + x] !== paperLabel) continue
      if (x < px0) px0 = x
      if (x > px1) px1 = x
      if (y < py0) py0 = y
      if (y > py1) py1 = y
    }
  }
  const pw = px1 - px0
  const ph = py1 - py0
  if (pw <= 0 || ph <= 0) return null

  // Expected marker footprint: MARKER_SIZE_MM on a ~210–297 mm sheet, ±generous slack.
  const minArea = paperArea * 0.0004
  const maxArea = paperArea * 0.01
  const zoneX = pw * 0.18
  const zoneY = ph * 0.18

  // Corner zones (lo-res px) in TL/TR/BR/BL order.
  const corners = [
    { cx: px0, cy: py0 },
    { cx: px1, cy: py0 },
    { cx: px1, cy: py1 },
    { cx: px0, cy: py1 },
  ]
  const quad: Point[] = []

  for (const { cx, cy } of corners) {
    let best: { p: Point; dist: number } | null = null
    for (const [label, size] of sizes) {
      if (size < minArea || size > maxArea) continue
      // Bbox + fill ratio + centroid of the component.
      let bx0 = width
      let by0 = height
      let bx1 = 0
      let by1 = 0
      let sx = 0
      let sy = 0
      for (let i = 0; i < labels.length; i++) {
        if (labels[i] !== label) continue
        const x = i % width
        const y = (i / width) | 0
        sx += x
        sy += y
        if (x < bx0) bx0 = x
        if (x > bx1) bx1 = x
        if (y < by0) by0 = y
        if (y > by1) by1 = y
      }
      const bw = bx1 - bx0 + 1
      const bh = by1 - by0 + 1
      const aspect = bw / bh
      if (aspect < 0.6 || aspect > 1.6) continue
      const fill = size / (bw * bh)
      if (fill < 0.55) continue
      const centroid = { x: sx / size, y: sy / size }
      // Must sit in this corner's zone.
      const inX = Math.abs(centroid.x - cx) < zoneX
      const inY = Math.abs(centroid.y - cy) < zoneY
      if (!inX || !inY) continue
      const dist = Math.hypot(centroid.x - cx, centroid.y - cy)
      if (!best || dist < best.dist) best = { p: centroid, dist }
    }
    if (!best) return null // all four markers required
    quad.push(best.p)
  }
  return quad
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loadBitmap(file: File): Promise<ImageBitmap> {
  // createImageBitmap applies EXIF orientation by default in modern browsers,
  // so bitmap.width/height reflect what the user sees.
  return createImageBitmap(file)
}

function drawToGray(img: ImageBitmap, width: number): { data: Uint8Array; width: number; height: number } {
  const height = Math.round((img.height / img.width) * width)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, width, height)
  const rgba = ctx.getImageData(0, 0, width, height).data
  const gray = new Uint8Array(width * height)
  for (let i = 0; i < gray.length; i++) {
    const j = i * 4
    gray[i] = (rgba[j] * 299 + rgba[j + 1] * 587 + rgba[j + 2] * 114) / 1000
  }
  return { data: gray, width, height }
}

/** Otsu's method — returns the threshold that best separates two brightness classes. */
export function otsuThreshold(data: Uint8Array): number {
  const hist = new Array<number>(256).fill(0)
  for (let i = 0; i < data.length; i++) hist[data[i]]++
  const total = data.length
  let sum = 0
  for (let i = 0; i < 256; i++) sum += i * hist[i]
  let sumB = 0
  let wB = 0
  let best = 0
  let threshold = 127
  for (let i = 0; i < 256; i++) {
    wB += hist[i]
    if (wB === 0) continue
    const wF = total - wB
    if (wF === 0) break
    sumB += i * hist[i]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const between = wB * wF * (mB - mF) * (mB - mF)
    if (between > best) {
      best = between
      threshold = i
    }
  }
  return threshold
}

/** Connected-component labeling (two-pass union-find). Returns label map and sizes. */
function labelComponents(mask: Uint8Array, width: number, height: number): { labels: Int32Array; sizes: Map<number, number> } {
  const labels = new Int32Array(width * height)
  const parent: number[] = []
  const find = (x: number): number => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]
      x = parent[x]
    }
    return x
  }
  const union = (a: number, b: number) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent[rb] = ra
  }
  let next = 1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (!mask[i]) continue
      const up = y > 0 ? labels[i - width] : 0
      const left = x > 0 ? labels[i - 1] : 0
      if (up && left) {
        labels[i] = up
        union(up, left)
      } else if (up) labels[i] = up
      else if (left) labels[i] = left
      else {
        labels[i] = next
        parent[next] = next
        next++
      }
    }
  }
  const sizes = new Map<number, number>()
  for (let i = 0; i < labels.length; i++) {
    if (labels[i]) {
      const root = find(labels[i])
      labels[i] = root
      sizes.set(root, (sizes.get(root) ?? 0) + 1)
    }
  }
  return { labels, sizes }
}

/** Solves the 8x8 DLT system for a homography mapping src quad → dst quad. */
export function homography(src: Point[], dst: Point[]): number[] {
  // Build A h = b
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]
    const { x: u, y: v } = dst[i]
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y])
    b.push(u)
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y])
    b.push(v)
  }
  // Gaussian elimination with partial pivoting
  const n = 8
  for (let col = 0; col < n; col++) {
    let maxRow = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) maxRow = row
    }
    ;[A[col], A[maxRow]] = [A[maxRow], A[col]]
    ;[b[col], b[maxRow]] = [b[maxRow], b[col]]
    for (let row = col + 1; row < n; row++) {
      const f = A[row][col] / A[col][col]
      for (let k = col; k < n; k++) A[row][k] -= f * A[col][k]
      b[row] -= f * b[col]
    }
  }
  const h = new Array<number>(n)
  for (let row = n - 1; row >= 0; row--) {
    let s = b[row]
    for (let k = row + 1; k < n; k++) s -= A[row][k] * h[k]
    h[row] = s / A[row][row]
  }
  return [...h, 1]
}

export function applyH(h: number[], x: number, y: number): Point {
  const d = h[6] * x + h[7] * y + h[8]
  return { x: (h[0] * x + h[1] * y + h[2]) / d, y: (h[3] * x + h[4] * y + h[5]) / d }
}

/** Morphological dilation (4-neighborhood), `iterations` px. Closes small gaps in edge rings. */
function dilate(mask: Uint8Array, width: number, height: number, iterations = 2) {
  let src = mask
  for (let it = 0; it < iterations; it++) {
    const dst = new Uint8Array(src)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        if (src[i]) continue
        if (
          (x > 0 && src[i - 1]) ||
          (x < width - 1 && src[i + 1]) ||
          (y > 0 && src[i - width]) ||
          (y < height - 1 && src[i + width])
        ) {
          dst[i] = 1
        }
      }
    }
    src = dst
  }
  if (src !== mask) mask.set(src)
}

/** Fills holes in a binary mask (pixels not reachable from the border become foreground). */
function fillHoles(mask: Uint8Array, width: number, height: number) {
  const seen = new Uint8Array(mask.length)
  const stack: number[] = []
  const push = (i: number) => {
    if (!mask[i] && !seen[i]) {
      seen[i] = 1
      stack.push(i)
    }
  }
  for (let x = 0; x < width; x++) {
    push(x)
    push((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    push(y * width)
    push(y * width + width - 1)
  }
  while (stack.length) {
    const i = stack.pop()!
    const x = i % width
    const y = (i / width) | 0
    if (x > 0) push(i - 1)
    if (x < width - 1) push(i + 1)
    if (y > 0) push(i - width)
    if (y < height - 1) push(i + width)
  }
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] && !seen[i]) mask[i] = 1
  }
}

/** Moore-neighbor boundary tracing for one labeled component. Returns ordered boundary pixels. */
function traceContour(labels: Int32Array, width: number, height: number, label: number): Point[] {
  let start = -1
  for (let i = 0; i < labels.length; i++) {
    if (labels[i] === label) {
      start = i
      break
    }
  }
  if (start < 0) return []

  // Clockwise neighbor offsets: E, SE, S, SW, W, NW, N, NE
  const dirs = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1],
  ]

  const isFg = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && labels[y * width + x] === label

  const sx = start % width
  const sy = (start / width) | 0
  let cx = sx
  let cy = sy
  // For the topmost-leftmost pixel of a component, the pixel to the west is
  // guaranteed background — that's our initial backtrack direction (index 4).
  let back = 4

  const boundary: Point[] = []
  const maxSteps = width * height * 4

  for (let steps = 0; steps < maxSteps; steps++) {
    boundary.push({ x: cx, y: cy })
    // Moore: search clockwise starting from the neighbor just after the
    // backtrack pixel; the first foreground neighbor is the next boundary pixel.
    let moved = false
    for (let k = 1; k <= 8; k++) {
      const d = (back + k) % 8
      const nx = cx + dirs[d][0]
      const ny = cy + dirs[d][1]
      if (isFg(nx, ny)) {
        back = (d + 4) % 8 // direction from the new pixel back to the current one
        cx = nx
        cy = ny
        moved = true
        break
      }
    }
    if (!moved) break // isolated pixel
    if (cx === sx && cy === sy) break // closed the loop
  }

  return boundary
}

/** Ramer–Douglas–Peucker polygon simplification. */
export function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points
  const first = points[0]
  const last = points[points.length - 1]
  let maxDist = 0
  let index = 0
  const dx = last.x - first.x
  const dy = last.y - first.y
  const len = Math.hypot(dx, dy) || 1
  for (let i = 1; i < points.length - 1; i++) {
    const dist = Math.abs(dy * points[i].x - dx * points[i].y + last.x * first.y - last.y * first.x) / len
    if (dist > maxDist) {
      maxDist = dist
      index = i
    }
  }
  if (maxDist > epsilon) {
    const left = simplify(points.slice(0, index + 1), epsilon)
    const right = simplify(points.slice(index), epsilon)
    return [...left.slice(0, -1), ...right]
  }
  return [first, last]
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Detects the paper sheet and dark tool outlines in a top-down photo.
 * Pure Canvas2D/JS implementation (no WASM). Client-side only.
 * Returns tool outlines in millimeters (origin = paper top-left).
 * Prepare a photo for detection: find the paper, rectify to top-down, calibrate scale.
 * Detection itself (`detectInScan`) is separate so users can re-run it with
 * adjusted threshold/detail settings without repeating the expensive warp.
 */
export async function prepareScan(file: File, options: PrepareOptions = {}): Promise<PreparedScan> {
  const img = await loadBitmap(file)

  // --- 1. Paper detection at low resolution (skipped for manual corner picks) ---
  const lo = drawToGray(img, DETECT_WIDTH)
  let paperMask: Uint8Array | null = null
  let paperLabels: Int32Array | null = null
  let paperLabel = 0
  let paperArea = 0
  if (!options.manualQuad) {
    const paperT = otsuThreshold(lo.data)
    paperMask = new Uint8Array(lo.data.length)
    for (let i = 0; i < lo.data.length; i++) paperMask[i] = lo.data[i] > paperT ? 1 : 0

    // Polarity: paper should be the bright region; check the four corners.
    const cornerVals = [
      paperMask[0],
      paperMask[lo.width - 1],
      paperMask[(lo.height - 1) * lo.width],
      paperMask[lo.height * lo.width - 1],
    ]
    const cornerMean = cornerVals.reduce((a, b) => a + b, 0) / 4
    if (cornerMean > 0.5) {
      for (let i = 0; i < paperMask.length; i++) paperMask[i] ^= 1
    }

    fillHoles(paperMask, lo.width, lo.height)
    const labeled = labelComponents(paperMask, lo.width, lo.height)
    paperLabels = labeled.labels

    for (const [label, size] of labeled.sizes) {
      if (size > paperArea) {
        paperArea = size
        paperLabel = label
      }
    }
    if (!paperLabel || paperArea < lo.width * lo.height * 0.2) {
      throw new Error(
        'Could not find the paper sheet. Make sure the whole sheet is visible on a darker background.',
      )
    }
  }

  // Paper quad from extreme points of the component (works well for rectangles).
  function paperBlobQuad(labels: Int32Array): Point[] {
    let tl: Point = { x: 0, y: 0 }
    let tr: Point = { x: 0, y: 0 }
    let br: Point = { x: 0, y: 0 }
    let bl: Point = { x: 0, y: 0 }
    let minSum = Infinity
    let maxSum = -Infinity
    let minDiff = Infinity
    let maxDiff = -Infinity
    for (let y = 0; y < lo.height; y++) {
      for (let x = 0; x < lo.width; x++) {
        if (labels[y * lo.width + x] !== paperLabel) continue
        const sum = x + y
        const diff = x - y
        if (sum < minSum) {
          minSum = sum
          tl = { x, y }
        }
        if (sum > maxSum) {
          maxSum = sum
          br = { x, y }
        }
        if (diff > maxDiff) {
          maxDiff = diff
          tr = { x, y }
        }
        if (diff < minDiff) {
          minDiff = diff
          bl = { x, y }
        }
      }
    }
    return [tl, tr, br, bl]
  }

  // Scale quad back to full-resolution image coordinates.
  const fullW = img.width
  const scaleUp = fullW / lo.width

  // Quad source priority: manual corner picks > printed fiducial markers > paper blob.
  let quadFull: Point[]
  let quadSource: QuadSource
  if (options.manualQuad) {
    quadFull = options.manualQuad
    quadSource = 'manual'
  } else {
    const markerQuadLo = findMarkerQuad(lo.data, lo.width, lo.height, paperLabels!, paperLabel, paperArea)
    if (markerQuadLo) {
      quadFull = markerQuadLo.map((p) => ({ x: p.x * scaleUp, y: p.y * scaleUp }))
      quadSource = 'markers'
    } else {
      quadFull = paperBlobQuad(paperLabels!).map((p) => ({ x: p.x * scaleUp, y: p.y * scaleUp }))
      quadSource = 'paper'
    }
  }

  // --- 2. Rectify to top-down at WARP_WIDTH ---
  const quadW = Math.hypot(quadFull[1].x - quadFull[0].x, quadFull[1].y - quadFull[0].y)
  const quadH = Math.hypot(quadFull[3].x - quadFull[0].x, quadFull[3].y - quadFull[0].y)
  const landscape = quadW >= quadH

  // Paper size: markers ⇒ the template the user printed (remembered at download);
  // otherwise guess A4 vs Letter from the quad aspect ratio.
  let paperWmm: number
  let paperHmm: number
  if (quadSource === 'markers') {
    const printed = options.paperSize ? PAPER_SIZES[options.paperSize] : templatePaperSize()
    paperWmm = landscape ? Math.max(printed.widthMm, printed.heightMm) : Math.min(printed.widthMm, printed.heightMm)
    paperHmm = landscape ? Math.min(printed.widthMm, printed.heightMm) : Math.max(printed.widthMm, printed.heightMm)
  } else {
    const aspect = Math.max(quadW, quadH) / Math.min(quadW, quadH)
    const size = Math.abs(aspect - 1.294) < Math.abs(aspect - 1.414) ? PAPER_SIZES.letter : PAPER_SIZES.a4
    paperWmm = landscape ? Math.max(size.widthMm, size.heightMm) : Math.min(size.widthMm, size.heightMm)
    paperHmm = landscape ? Math.min(size.widthMm, size.heightMm) : Math.max(size.widthMm, size.heightMm)
  }

  const dstW = WARP_WIDTH
  const dstH = Math.round((WARP_WIDTH * paperHmm) / paperWmm)
  const mmPerPx = paperWmm / dstW

  // Full-resolution grayscale source.
  const hiWidth = Math.min(img.width, 2400)
  const hi = drawToGray(img, hiWidth)
  const hiScale = hi.width / fullW
  const quadHi = quadFull.map((p) => ({ x: p.x * hiScale, y: p.y * hiScale }))

  // Homography from rectified dst coords → source hi-res coords (for sampling).
  // Marker quads anchor at the marker centers, which sit MARKER_INSET_MM inside
  // the sheet — map to those inset positions rather than the image corners.
  const pxPerMm = dstW / paperWmm
  const insetPx = MARKER_INSET_MM * pxPerMm
  const dstQuad: Point[] =
    quadSource === 'markers'
      ? [
          { x: insetPx, y: insetPx },
          { x: dstW - insetPx, y: insetPx },
          { x: dstW - insetPx, y: dstH - insetPx },
          { x: insetPx, y: dstH - insetPx },
        ]
      : [
          { x: 0, y: 0 },
          { x: dstW, y: 0 },
          { x: dstW, y: dstH },
          { x: 0, y: dstH },
        ]
  const Hinv = homography(dstQuad, quadHi)

  const rect = new Uint8Array(dstW * dstH)
  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const s = applyH(Hinv, x, y)
      const sx = Math.round(s.x)
      const sy = Math.round(s.y)
      if (sx >= 0 && sy >= 0 && sx < hi.width && sy < hi.height) {
        rect[y * dstW + x] = hi.data[sy * hi.width + sx]
      } else {
        rect[y * dstW + x] = 255
      }
    }
  }

  // Erase the fiducial markers from the rectified scan so they can never be
  // detected as tools (the template keeps a quiet zone there anyway).
  if (quadSource === 'markers') {
    const erasePx = Math.round((MARKER_INSET_MM + 10) * pxPerMm)
    for (const [ox, oy] of [
      [0, 0],
      [dstW - erasePx, 0],
      [dstW - erasePx, dstH - erasePx],
      [0, dstH - erasePx],
    ]) {
      for (let y = oy; y < oy + erasePx; y++) {
        for (let x = ox; x < ox + erasePx; x++) {
          if (x >= 0 && y >= 0 && x < dstW && y < dstH) rect[y * dstW + x] = 255
        }
      }
    }
  }

  // Rectified preview image
  const rectifiedImageUrl = grayToDataUrl(rect, dstW, dstH)
  const blob = await (await fetch(rectifiedImageUrl)).blob()

  return {
    rect,
    width: dstW,
    height: dstH,
    mmPerPx,
    paperSizeMm: { width: paperWmm, height: paperHmm },
    quadSource,
    rectifiedImageUrl: URL.createObjectURL(blob),
    debug: {
      ...(paperMask ? { paperMask: maskToDataUrl(paperMask, null, lo.width, lo.height) } : {}),
      rectified: rectifiedImageUrl,
      quad: JSON.stringify(quadFull),
    },
  }
}

/**
 * Detect tool outlines in a prepared scan. Cheap enough to re-run live while
 * the user adjusts `thresholdOffset` / `detailScale`.
 */
export function detectInScan(
  scan: PreparedScan,
  options: DetectionOptions = {},
): { tools: ToolTrace[]; toolMaskUrl: string } {
  const { thresholdOffset = 0, detailScale = 1 } = options
  const { rect, width: dstW, height: dstH, mmPerPx } = scan

  // --- Tool detection: shadow-robust local-contrast mask ---
  // Sensitivity slider maps to the local contrast delta: default 16 gray
  // levels, higher sensitivity lowers it (catches lighter tools, risks soft
  // shadows), lower sensitivity raises it.
  const contrast = Math.min(64, Math.max(4, 16 - thresholdOffset))
  const radius = Math.round(dstW / 10)
  // Sobel gate: tool edges score ≥ ~150 even with slight defocus; soft cast
  // shadows score ~15. 28 separates them with room on both sides.
  const toolMask = adaptiveToolMask(rect, dstW, dstH, { radius, contrast, gradMin: 28 })

  // The mask is an edge ring: dilate to close antialiasing gaps, then fill the
  // enclosed tool interiors.
  dilate(toolMask, dstW, dstH, 2)
  fillHoles(toolMask, dstW, dstH)
  const { labels, sizes } = labelComponents(toolMask, dstW, dstH)

  const minArea = dstW * dstH * MIN_AREA_FRACTION
  const tools: ToolTrace[] = []
  const sorted = [...sizes.entries()].sort((a, b) => b[1] - a[1])
  for (const [label, size] of sorted) {
    if (size < minArea) continue
    const boundary = traceContour(labels, dstW, dstH, label)
    if (boundary.length < 8) continue
    // Skip anything touching the frame edge: it touches the paper edge, so
    // it's desk spill or a shadow at the sheet border — never a usable tool.
    let bx0 = Infinity
    let by0 = Infinity
    let bx1 = -Infinity
    let by1 = -Infinity
    for (const p of boundary) {
      if (p.x < bx0) bx0 = p.x
      if (p.x > bx1) bx1 = p.x
      if (p.y < by0) by0 = p.y
      if (p.y > by1) by1 = p.y
    }
    if (bx0 <= 1 || by0 <= 1 || bx1 >= dstW - 2 || by1 >= dstH - 2) continue
    const epsilon = Math.max(1.5, Math.sqrt(size) * 0.01) * detailScale
    const simplified = simplify(boundary, epsilon)

    const mmPts = simplified.map((p) => ({ x: p.x * mmPerPx, y: p.y * mmPerPx }))
    const minX = Math.min(...mmPts.map((p) => p.x))
    const minY = Math.min(...mmPts.map((p) => p.y))

    tools.push({
      id: uuid(),
      label: `Tool ${tools.length + 1}`,
      outline: mmPts.map((p) => ({ x: p.x - minX, y: p.y - minY })),
      position: { x: minX, y: minY },
      rotationDeg: 0,
      toleranceMm: 0.5,
      pocketDepthMm: 10,
    })
  }

  return { tools, toolMaskUrl: maskToDataUrl(toolMask, labels, dstW, dstH) }
}

/** One-shot convenience wrapper: prepare + detect with default options. */
export async function detectTools(
  file: File,
  options: DetectionOptions & PrepareOptions = {},
): Promise<DetectionResult> {
  const scan = await prepareScan(file, options)
  const { tools, toolMaskUrl } = detectInScan(scan, options)
  return {
    tools,
    paperSizeMm: scan.paperSizeMm,
    mmPerPx: scan.mmPerPx,
    quadSource: scan.quadSource,
    rectifiedImageUrl: scan.rectifiedImageUrl,
    debug: { ...scan.debug, toolMask: toolMaskUrl },
  }
}
