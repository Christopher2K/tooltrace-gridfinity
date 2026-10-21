import type { Point, ToolTrace } from '~/stores/editor'
import { uuid } from '~/lib/uuid'

export interface DetectionResult {
  tools: ToolTrace[]
  paperSizeMm: { width: number; height: number }
  mmPerPx: number
  /** Object URL of the rectified top-down paper image (JPEG). */
  rectifiedImageUrl: string
  /** Debug visualizations (mask overlays). */
  debug?: Record<string, string>
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

const A4_SHORT_MM = 210
const A4_LONG_MM = 297
/** Width of the rectified working image in px. */
const WARP_WIDTH = 1200
/** Downscaled width used for paper detection. */
const DETECT_WIDTH = 500
/** Minimum tool area as a fraction of paper area. */
const MIN_AREA_FRACTION = 0.003

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
function otsuThreshold(data: Uint8Array): number {
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
function homography(src: Point[], dst: Point[]): number[] {
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

function applyH(h: number[], x: number, y: number): Point {
  const d = h[6] * x + h[7] * y + h[8]
  return { x: (h[0] * x + h[1] * y + h[2]) / d, y: (h[3] * x + h[4] * y + h[5]) / d }
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
function simplify(points: Point[], epsilon: number): Point[] {
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
 */
export async function detectTools(file: File): Promise<DetectionResult> {
  const img = await loadBitmap(file)

  // --- 1. Paper detection at low resolution ---
  const lo = drawToGray(img, DETECT_WIDTH)
  const paperT = otsuThreshold(lo.data)
  const paperMask = new Uint8Array(lo.data.length)
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
  const { labels: paperLabels, sizes: paperSizes } = labelComponents(paperMask, lo.width, lo.height)

  let paperLabel = 0
  let paperArea = 0
  for (const [label, size] of paperSizes) {
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

  // Paper quad from extreme points of the component (works well for rectangles).
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
      if (paperLabels[y * lo.width + x] !== paperLabel) continue
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

  // Scale quad back to full-resolution image coordinates.
  const fullW = img.width
  const scaleUp = fullW / lo.width
  const quadFull = [tl, tr, br, bl].map((p) => ({ x: p.x * scaleUp, y: p.y * scaleUp }))

  // --- 2. Rectify to top-down at WARP_WIDTH ---
  const quadW = Math.hypot(quadFull[1].x - quadFull[0].x, quadFull[1].y - quadFull[0].y)
  const quadH = Math.hypot(quadFull[3].x - quadFull[0].x, quadFull[3].y - quadFull[0].y)
  const landscape = quadW >= quadH
  const paperWmm = landscape ? A4_LONG_MM : A4_SHORT_MM
  const paperHmm = landscape ? A4_SHORT_MM : A4_LONG_MM

  const dstW = WARP_WIDTH
  const dstH = Math.round((WARP_WIDTH * paperHmm) / paperWmm)
  const mmPerPx = paperWmm / dstW

  // Full-resolution grayscale source.
  const hiWidth = Math.min(img.width, 2400)
  const hi = drawToGray(img, hiWidth)
  const hiScale = hi.width / fullW
  const quadHi = quadFull.map((p) => ({ x: p.x * hiScale, y: p.y * hiScale }))

  // Homography from rectified dst coords → source hi-res coords (for sampling).
  const dstQuad: Point[] = [
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

  // --- 3. Tool detection: dark components on the white rectified paper ---
  const toolT = otsuThreshold(rect)
  const toolMask = new Uint8Array(rect.length)
  for (let i = 0; i < rect.length; i++) toolMask[i] = rect[i] < toolT ? 1 : 0

  fillHoles(toolMask, dstW, dstH)
  const { labels, sizes } = labelComponents(toolMask, dstW, dstH)

  const minArea = dstW * dstH * MIN_AREA_FRACTION
  const tools: ToolTrace[] = []
  const sorted = [...sizes.entries()].sort((a, b) => b[1] - a[1])
  for (const [label, size] of sorted) {
    if (size < minArea) continue
    const boundary = traceContour(labels, dstW, dstH, label)
    if (boundary.length < 8) continue
    const epsilon = Math.max(1.5, Math.sqrt(size) * 0.01)
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

  // Rectified preview image
  const rectifiedImageUrl = grayToDataUrl(rect, dstW, dstH)
  const blob = await (await fetch(rectifiedImageUrl)).blob()

  return {
    tools,
    paperSizeMm: { width: paperWmm, height: paperHmm },
    mmPerPx,
    rectifiedImageUrl: URL.createObjectURL(blob),
    debug: {
      paperMask: maskToDataUrl(paperMask, null, lo.width, lo.height),
      rectified: rectifiedImageUrl,
      toolMask: maskToDataUrl(toolMask, labels, dstW, dstH),
      quad: JSON.stringify([tl, tr, br, bl]),
    },
  }
}
