import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import {
  bboxCenter,
  bboxOf,
  clipPolygonToRect,
  flattenOutline,
  offsetPolygon,
  rotatePoint,
} from '~/lib/geometry'
import { GRID_UNIT_MM, type Point, type ToolTrace, type TrayConfig } from '~/stores/editor'

// ---------------------------------------------------------------------------
// Units (pure)
// ---------------------------------------------------------------------------

/** PDF points per millimeter (72 pt/inch, 25.4 mm/inch). */
export const PT_PER_MM = 72 / 25.4

export function mmToPt(mm: number): number {
  return mm * PT_PER_MM
}

export function ptToMm(pt: number): number {
  return pt / PT_PER_MM
}

// ---------------------------------------------------------------------------
// Paper + tiling (pure)
// ---------------------------------------------------------------------------

export type PaperSize = 'a4' | 'letter'

export const PAPER_SIZES: Record<PaperSize, { widthMm: number; heightMm: number; label: string }> =
  {
    a4: { widthMm: 210, heightMm: 297, label: 'A4' },
    letter: { widthMm: 215.9, heightMm: 279.4, label: 'Letter' },
  }

export interface PageSetup {
  paper: PaperSize
  /** Uniform page margin in mm. */
  marginMm: number
  /** Reserved strip at the top of each page for labels/notes, in mm. */
  headerMm: number
}

export const DEFAULT_MARGIN_MM = 10
export const DEFAULT_HEADER_MM = 14

export function pageSetup(paper: PaperSize = 'a4'): PageSetup {
  return { paper, marginMm: DEFAULT_MARGIN_MM, headerMm: DEFAULT_HEADER_MM }
}

/** Usable tray-drawing area per page, in mm. */
export function printableAreaMm(setup: PageSetup): { widthMm: number; heightMm: number } {
  const size = PAPER_SIZES[setup.paper]
  return {
    widthMm: size.widthMm - setup.marginMm * 2,
    heightMm: size.heightMm - setup.marginMm * 2 - setup.headerMm,
  }
}

/** One page's slice of the tray, in tray mm coordinates. */
export interface Tile {
  /** Page order index, row-major (0-based). */
  index: number
  row: number
  col: number
  /** Tray-space origin (top-left) of this tile. */
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
}

/**
 * Partitions a tray of trayWMm × trayHMm into page tiles, row-major.
 * Tiles never exceed the printable area; the last tile in each row/column is
 * clamped to the tray bounds.
 */
export function computeTiles(trayWMm: number, trayHMm: number, setup: PageSetup): Tile[] {
  const { widthMm, heightMm } = printableAreaMm(setup)
  // The epsilon keeps an exactly-page-sized tray on a single tile.
  const cols = Math.max(1, Math.ceil(trayWMm / widthMm - 1e-9))
  const rows = Math.max(1, Math.ceil(trayHMm / heightMm - 1e-9))
  const tiles: Tile[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xMm = col * widthMm
      const yMm = row * heightMm
      tiles.push({
        index: row * cols + col,
        row,
        col,
        xMm,
        yMm,
        widthMm: Math.min(widthMm, trayWMm - xMm),
        heightMm: Math.min(heightMm, trayHMm - yMm),
      })
    }
  }
  return tiles
}

// ---------------------------------------------------------------------------
// Registration marks + labels (pure)
// ---------------------------------------------------------------------------

export interface RegistrationMark {
  /** Crosshair center in tray mm (a tile corner). */
  xMm: number
  yMm: number
  /** Length of each crosshair arm in mm. */
  armMm: number
}

/** Crosshair marks at the four tile corners, for aligning taped pages. */
export function registrationMarks(tile: Tile, armMm = 5): RegistrationMark[] {
  const { xMm, yMm, widthMm, heightMm } = tile
  return [
    { xMm, yMm, armMm },
    { xMm: xMm + widthMm, yMm, armMm },
    { xMm, yMm: yMm + heightMm, armMm },
    { xMm: xMm + widthMm, yMm: yMm + heightMm, armMm },
  ]
}

export interface LabelPlacement {
  text: string
  /** Anchor (text baseline start) in tray mm. */
  xMm: number
  yMm: number
}

/**
 * Places "label — depth mm" annotations near each tool without overlapping the
 * outline: above the bbox top-left, falling back to below the bbox when there
 * is no room above.
 */
export function labelPlacements(tools: ToolTrace[]): LabelPlacement[] {
  const out: LabelPlacement[] = []
  for (const tool of tools) {
    const b = bboxOf(toolTrayOutlines(tool).outline)
    const above = b.y - 2
    const yMm = above >= 3 ? above : b.y + b.h + 3.5
    out.push({
      text: `${tool.label} — ${tool.pocketDepthMm} mm`,
      xMm: b.x,
      yMm,
    })
  }
  return out
}

/**
 * Tool outline (curves flattened) and tolerance-offset outline in tray
 * coordinates — the same transform the editor canvas applies: rotation about
 * the outline's bbox center, then translation by the tool position.
 */
export function toolTrayOutlines(tool: ToolTrace): {
  outline: Point[]
  offsetOutline: Point[] | null
} {
  const flat = flattenOutline(tool)
  const c = bboxCenter(tool.outline)
  const place = (pts: Point[]): Point[] =>
    pts.map((p) => {
      const r = tool.rotationDeg ? rotatePoint(p, c, tool.rotationDeg) : p
      return { x: r.x + tool.position.x, y: r.y + tool.position.y }
    })
  return {
    outline: place(flat),
    offsetOutline: tool.toleranceMm > 0 ? place(offsetPolygon(flat, tool.toleranceMm)) : null,
  }
}

// ---------------------------------------------------------------------------
// PDF generation (pdf-lib)
// ---------------------------------------------------------------------------

export interface PdfExportOptions {
  paper?: PaperSize
  marginMm?: number
}

const INK = rgb(0.1, 0.1, 0.1)
const GRID_INK = rgb(0.78, 0.78, 0.78)
const TOLERANCE_INK = rgb(0.75, 0.25, 0.2)
const CALIBRATION_INK = rgb(0.15, 0.35, 0.7)
const CALIBRATION_SQUARE_MM = 50

/** SVG path data for a closed polygon in pt, relative to the tile origin. */
function tilePath(pts: Point[], tile: Tile): string {
  const rel = pts.map((p) => ({ x: mmToPt(p.x - tile.xMm), y: mmToPt(p.y - tile.yMm) }))
  return (
    `M ${rel.map((p) => `${r2(p.x)} ${r2(p.y)}`).join(' L ')} Z`
  )
}

/** Rounds to 2 decimals to keep the content stream compact. */
function r2(n: number): number {
  return Math.round(n * 100) / 100
}

/**
 * Builds a true-scale (1 mm = 72/25.4 pt) vector PDF of the tray layout,
 * tiled across pages with registration marks and a calibration square.
 */
export async function generateLayoutPdf(
  tray: TrayConfig,
  tools: ToolTrace[],
  options: PdfExportOptions = {},
): Promise<Uint8Array> {
  const setup = pageSetup(options.paper ?? 'a4')
  if (options.marginMm !== undefined) setup.marginMm = options.marginMm

  const trayWMm = tray.widthUnits * GRID_UNIT_MM
  const trayHMm = tray.heightUnits * GRID_UNIT_MM
  const tiles = computeTiles(trayWMm, trayHMm, setup)
  const paper = PAPER_SIZES[setup.paper]
  const pageWPt = mmToPt(paper.widthMm)
  const pageHPt = mmToPt(paper.heightMm)
  const marginPt = mmToPt(setup.marginMm)
  const headerPt = mmToPt(setup.headerMm)

  const doc = await PDFDocument.create()
  doc.setTitle(`ToolTrace print-test layout ${tray.widthUnits}×${tray.heightUnits}`)
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  const outlines = tools.map((tool) => ({ tool, ...toolTrayOutlines(tool) }))
  const labels = labelPlacements(tools)

  for (const tile of tiles) {
    const page = doc.addPage([pageWPt, pageHPt])
    // Tray-space origin of this tile in page coordinates (pt, y-up).
    const originX = marginPt - mmToPt(tile.xMm)
    const originY = pageHPt - marginPt - headerPt + mmToPt(tile.yMm)
    // Helpers: tray mm → page pt.
    const px = (xMm: number) => originX + mmToPt(xMm)
    const py = (yMm: number) => originY - mmToPt(yMm)

    // Header: tile label + print-scale warning.
    const headerY = pageHPt - marginPt - 10
    page.drawText(
      `ToolTrace tray ${tray.widthUnits}×${tray.heightUnits} (${trayWMm}×${trayHMm} mm)` +
        (tiles.length > 1
          ? ` — Tile ${tile.index + 1} of ${tiles.length} (row ${tile.row + 1}, col ${tile.col + 1})`
          : ''),
      { x: marginPt, y: headerY, size: 9, font: bold, color: INK },
    )
    page.drawText('Print at 100% scale / actual size — do not fit to page.', {
      x: marginPt,
      y: headerY - 11,
      size: 8,
      font,
      color: INK,
    })

    // Calibration square (drawn first so outlines stay visible on top).
    const sqPt = mmToPt(CALIBRATION_SQUARE_MM)
    page.drawRectangle({
      x: marginPt,
      y: marginPt,
      width: sqPt,
      height: sqPt,
      borderColor: CALIBRATION_INK,
      borderWidth: 0.8,
    })
    page.drawText(`${CALIBRATION_SQUARE_MM} × ${CALIBRATION_SQUARE_MM} mm calibration square`, {
      x: marginPt + 3,
      y: marginPt + sqPt + 4,
      size: 7,
      font,
      color: CALIBRATION_INK,
    })

    // Grid lines at 42 mm, clipped to the tile.
    for (let x = GRID_UNIT_MM; x < trayWMm - 1e-9; x += GRID_UNIT_MM) {
      if (x < tile.xMm || x > tile.xMm + tile.widthMm) continue
      page.drawLine({
        start: { x: px(x), y: py(Math.max(tile.yMm, 0)) },
        end: { x: px(x), y: py(Math.min(tile.yMm + tile.heightMm, trayHMm)) },
        thickness: 0.25,
        color: GRID_INK,
      })
    }
    for (let y = GRID_UNIT_MM; y < trayHMm - 1e-9; y += GRID_UNIT_MM) {
      if (y < tile.yMm || y > tile.yMm + tile.heightMm) continue
      page.drawLine({
        start: { x: px(Math.max(tile.xMm, 0)), y: py(y) },
        end: { x: px(Math.min(tile.xMm + tile.widthMm, trayWMm)), y: py(y) },
        thickness: 0.25,
        color: GRID_INK,
      })
    }

    // Tray boundary edges (axis-aligned), clipped to the tile.
    const drawClippedEdge = (vertical: boolean, at: number, from: number, to: number) => {
      const lo = vertical ? tile.yMm : tile.xMm
      const hi = vertical ? tile.yMm + tile.heightMm : tile.xMm + tile.widthMm
      const start = Math.max(from, lo)
      const end = Math.min(to, hi)
      const onTile = vertical
        ? at >= tile.xMm - 1e-9 && at <= tile.xMm + tile.widthMm + 1e-9
        : at >= tile.yMm - 1e-9 && at <= tile.yMm + tile.heightMm + 1e-9
      if (!onTile || end - start <= 1e-9) return
      const a = vertical ? { x: at, y: start } : { x: start, y: at }
      const b = vertical ? { x: at, y: end } : { x: end, y: at }
      page.drawLine({
        start: { x: px(a.x), y: py(a.y) },
        end: { x: px(b.x), y: py(b.y) },
        thickness: 0.8,
        color: INK,
      })
    }
    drawClippedEdge(true, 0, 0, trayHMm)
    drawClippedEdge(true, trayWMm, 0, trayHMm)
    drawClippedEdge(false, 0, 0, trayWMm)
    drawClippedEdge(false, trayHMm, 0, trayWMm)

    // Tool outlines (solid) and tolerance outlines (dashed), clipped to tile.
    for (const { outline, offsetOutline } of outlines) {
      const clipped = clipPolygonToRect(
        outline,
        tile.xMm,
        tile.yMm,
        tile.xMm + tile.widthMm,
        tile.yMm + tile.heightMm,
      )
      if (clipped.length >= 3) {
        page.drawSvgPath(tilePath(clipped, tile), {
          x: marginPt,
          y: pageHPt - marginPt - headerPt,
          borderColor: INK,
          borderWidth: 0.7,
        })
      }
      if (offsetOutline) {
        const clippedOffset = clipPolygonToRect(
          offsetOutline,
          tile.xMm,
          tile.yMm,
          tile.xMm + tile.widthMm,
          tile.yMm + tile.heightMm,
        )
        if (clippedOffset.length >= 3) {
          page.drawSvgPath(tilePath(clippedOffset, tile), {
            x: marginPt,
            y: pageHPt - marginPt - headerPt,
            borderColor: TOLERANCE_INK,
            borderWidth: 0.5,
            borderDashArray: [4, 2],
          })
        }
      }
    }

    // Tool labels — drawn on the tile that contains their anchor point.
    for (const label of labels) {
      const within =
        label.xMm >= tile.xMm - 1e-9 &&
        label.xMm <= tile.xMm + tile.widthMm + 1e-9 &&
        label.yMm >= tile.yMm - 1e-9 &&
        label.yMm <= tile.yMm + tile.heightMm + 1e-9
      if (!within) continue
      page.drawText(label.text, {
        x: px(label.xMm),
        y: py(label.yMm),
        size: 8,
        font,
        color: INK,
      })
    }

    // Registration crosshairs at the tile corners.
    for (const mark of registrationMarks(tile)) {
      const cx = px(mark.xMm)
      const cy = py(mark.yMm)
      const arm = mmToPt(mark.armMm)
      page.drawLine({
        start: { x: cx - arm, y: cy },
        end: { x: cx + arm, y: cy },
        thickness: 0.4,
        color: INK,
      })
      page.drawLine({
        start: { x: cx, y: cy - arm },
        end: { x: cx, y: cy + arm },
        thickness: 0.4,
        color: INK,
      })
    }
  }

  return doc.save()
}

/** Triggers a browser download of the generated PDF bytes. */
export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
