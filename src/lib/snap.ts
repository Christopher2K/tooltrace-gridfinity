import type { BBox } from '~/lib/geometry'

/** A visual alignment guide shown while dragging (world mm coordinates). */
export interface SnapGuide {
  /** 'x' → vertical line at posMm; 'y' → horizontal line at posMm. */
  axis: 'x' | 'y'
  posMm: number
  fromMm: number
  toMm: number
}

export interface AlignmentSnap {
  /** Delta to add to the dragged bbox position on each axis (0 when unsnapped). */
  dx: number
  dy: number
  guides: SnapGuide[]
}

/** Snap target on one axis; from/to span the target on the perpendicular axis. */
interface AxisTarget {
  pos: number
  from: number
  to: number
}

interface AxisSnap {
  delta: number
  guide: Omit<SnapGuide, 'axis'>
}

/**
 * Finds the nearest alignment of the dragged bbox's min/center/max to any
 * target position, within thresholdMm. The guide spans the overlap between
 * the dragged bbox and the target on the perpendicular axis (falling back to
 * the dragged bbox's own extent when they don't overlap).
 */
function snapAxis(
  draggedMin: number,
  draggedMax: number,
  draggedPerpMin: number,
  draggedPerpMax: number,
  targets: AxisTarget[],
  thresholdMm: number,
): AxisSnap | null {
  const center = (draggedMin + draggedMax) / 2
  const values = [draggedMin, center, draggedMax]
  let best: { delta: number; target: AxisTarget } | null = null
  for (const t of targets) {
    for (const v of values) {
      const delta = t.pos - v
      if (Math.abs(delta) <= thresholdMm && (!best || Math.abs(delta) < Math.abs(best.delta))) {
        best = { delta, target: t }
      }
    }
  }
  if (!best) return null
  const lo = Math.max(draggedPerpMin, best.target.from)
  const hi = Math.min(draggedPerpMax, best.target.to)
  const [fromMm, toMm] = hi >= lo ? [lo, hi] : [draggedPerpMin, draggedPerpMax]
  return { delta: best.delta, guide: { posMm: best.target.pos, fromMm, toMm } }
}

/**
 * Alignment snapping for tool drags: snaps the dragged bbox's min/center/max
 * (per axis, independently) to other tools' bbox min/center/max and to the
 * tray edges (0, W, H) and center lines (W/2, H/2). The nearest candidate
 * within thresholdMm wins on each axis. Returns null when nothing is near —
 * the caller then keeps plain grid snapping.
 */
export function computeAlignmentSnap(
  dragged: BBox,
  others: BBox[],
  trayW: number,
  trayH: number,
  thresholdMm: number,
): AlignmentSnap | null {
  if (thresholdMm <= 0) return null
  const xTargets: AxisTarget[] = []
  const yTargets: AxisTarget[] = []
  for (const o of others) {
    for (const pos of [o.x, o.x + o.w / 2, o.x + o.w]) {
      xTargets.push({ pos, from: o.y, to: o.y + o.h })
    }
    for (const pos of [o.y, o.y + o.h / 2, o.y + o.h]) {
      yTargets.push({ pos, from: o.x, to: o.x + o.w })
    }
  }
  // Tray edges + center lines; guides span the dragged bbox's perpendicular extent.
  for (const pos of [0, trayW / 2, trayW]) {
    xTargets.push({ pos, from: dragged.y, to: dragged.y + dragged.h })
  }
  for (const pos of [0, trayH / 2, trayH]) {
    yTargets.push({ pos, from: dragged.x, to: dragged.x + dragged.w })
  }

  const sx = snapAxis(dragged.x, dragged.x + dragged.w, dragged.y, dragged.y + dragged.h, xTargets, thresholdMm)
  const sy = snapAxis(dragged.y, dragged.y + dragged.h, dragged.x, dragged.x + dragged.w, yTargets, thresholdMm)
  if (!sx && !sy) return null
  const guides: SnapGuide[] = []
  if (sx) guides.push({ axis: 'x', ...sx.guide })
  if (sy) guides.push({ axis: 'y', ...sy.guide })
  return { dx: sx?.delta ?? 0, dy: sy?.delta ?? 0, guides }
}
