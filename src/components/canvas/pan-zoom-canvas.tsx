import { useEffect, useRef, useState, type ReactNode } from 'react'
import { css, cx } from '~/styled-system/css'
import { Button, IconButton } from '~/components/ui'
import type { Point, View } from './types'

const containerBase = css({ position: 'relative' })
const canvasCursor = css({ w: 'full', h: 'full', display: 'block', touchAction: 'none', cursor: 'default' })
const canvasCursorDrag = css({ w: 'full', h: 'full', display: 'block', touchAction: 'none', cursor: 'grabbing' })
const zoomControls = css({
  position: 'absolute',
  bottom: '3',
  right: '3',
  display: 'flex',
  alignItems: 'center',
  gap: '1',
  bg: 'bg.default',
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'l2',
  p: '1',
  shadow: 'sm',
})
const zoomPct = css({
  minW: '12',
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: 'l1',
  px: '1',
  py: '0.5',
  _hover: { bg: 'gray.a2' },
})

/** Interaction helpers handed to children / callbacks, all in world (mm) coordinates. */
export interface PanZoomContextValue {
  /** Current visible world rect (falls back to `computeFit()` before the first fit). */
  view: View
  /** Convert a client/pointer event position to world (mm) coordinates. */
  toMm: (e: { clientX: number; clientY: number }) => Point
  /** Zoom by `factor` around a point in mm (default: view center). Clamped & dampened. */
  zoomBy: (factor: number, centerMm?: Point) => void
  /** Reset the view to `computeFit()`. */
  zoomToFit: () => void
}

export interface PanZoomCanvasProps {
  /** SVG content in world (mm) coordinates, or a render prop receiving the context value. */
  children: ReactNode | ((ctx: PanZoomContextValue) => ReactNode)
  /** World bounds used for zoom-to-fit and the zoom-% display. Called on every render. */
  computeFit: () => View
  /** When set, the view refits whenever this value changes. Omit to fit only on mount. */
  fitKey?: unknown
  /** Min visible world width in mm (max zoom in). Default 20. */
  minViewW?: number
  /** Max visible world width in mm (max zoom out). Default 2500. */
  maxViewW?: number
  /** Wheel/pinch zoom damping. Default 0.0025. */
  zoomIntensity?: number
  /** Show the grabbing cursor (e.g. while the consumer drags content). */
  grabbing?: boolean
  /** Fired on background click (pointer up without a pan drag). */
  onBackgroundClick?: () => void
  /** Fired on background right-click with the world point and the canvas context. */
  onBackgroundContextMenu?: (worldPoint: Point, e: React.MouseEvent, ctx: PanZoomContextValue) => void
  /** Fired whenever the view changes. */
  onViewChange?: (view: View) => void
  /** Show the zoom control cluster (out / % / in / fit). Default true. */
  showZoomControls?: boolean
  /** Extra controls rendered at the start of the zoom cluster (e.g. undo/redo). */
  controlsSlot?: ReactNode
  /** Decides whether a pointer/contextmenu event target counts as background.
   *  Default: the SVG itself or any plain `rect` (e.g. a background sheet). */
  isBackgroundTarget?: (target: Element, currentTarget: Element) => boolean
  /** Extra Panda class merged onto the container (which is always position:relative). */
  className?: string
}

function defaultIsBackgroundTarget(target: Element, currentTarget: Element): boolean {
  return target === currentTarget || target.tagName === 'rect'
}

/**
 * Generic mm-accurate pan/zoom SVG canvas.
 *
 * Figma-style controls (non-passive wheel): scroll pans (Shift = horizontal),
 * pinch / Ctrl+scroll zooms around the cursor, dampened and clamped.
 * Background pointer-drag pans (3 px threshold); background click without
 * movement fires `onBackgroundClick`.
 */
export function PanZoomCanvas(props: PanZoomCanvasProps) {
  const {
    children,
    computeFit,
    fitKey,
    minViewW = 20,
    maxViewW = 2500,
    zoomIntensity = 0.0025,
    grabbing = false,
    onBackgroundClick,
    onBackgroundContextMenu,
    onViewChange,
    showZoomControls = true,
    controlsSlot,
    isBackgroundTarget = defaultIsBackgroundTarget,
    className,
  } = props

  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState<View | null>(null)
  const computeFitRef = useRef(computeFit)
  computeFitRef.current = computeFit
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange

  const v = view ?? computeFit()

  // Fit view on mount; refit when fitKey changes (if provided).
  useEffect(() => {
    if (fitKey === undefined) setView((cur) => cur ?? computeFitRef.current())
    else setView(computeFitRef.current())
  }, [fitKey])

  useEffect(() => {
    onViewChangeRef.current?.(v)
  }, [v])

  /** Zoom by `factor` around a point given in mm view coordinates (default: view center). */
  function zoomBy(factor: number, centerMm?: Point) {
    setView((cur) => {
      const base = cur ?? computeFitRef.current()
      const cx = centerMm?.x ?? base.x + base.w / 2
      const cy = centerMm?.y ?? base.y + base.h / 2
      const clamped = Math.min(Math.max(base.w * factor, minViewW), maxViewW) / base.w
      return {
        x: cx - (cx - base.x) * clamped,
        y: cy - (cy - base.y) * clamped,
        w: base.w * clamped,
        h: base.h * clamped,
      }
    })
  }

  function zoomToFit() {
    setView(computeFitRef.current())
  }

  // Figma-style controls (non-passive wheel):
  //   scroll           → pan (Shift = horizontal)
  //   pinch / ⌃+scroll → smooth zoom around cursor, dampened & clamped
  useEffect(() => {
    const el = svgRef.current
    if (!el || !view) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        // Pinch gesture (trackpad) or Ctrl+wheel (mouse) → zoom
        const mx = view.x + ((e.clientX - rect.left) / rect.width) * view.w
        const my = view.y + ((e.clientY - rect.top) / rect.height) * view.h
        zoomBy(Math.exp(e.deltaY * zoomIntensity), { x: mx, y: my })
      } else {
        // Scroll → pan
        const dxMm = (e.deltaX / rect.width) * view.w
        const dyMm = (e.deltaY / rect.height) * view.h
        setView({
          ...view,
          x: view.x + (e.shiftKey ? dyMm : dxMm),
          y: view.y + (e.shiftKey ? dxMm : dyMm),
        })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, minViewW, maxViewW, zoomIntensity])

  function toMm(e: { clientX: number; clientY: number }): Point {
    const rect = svgRef.current!.getBoundingClientRect()
    const base = view ?? computeFitRef.current()
    return {
      x: base.x + ((e.clientX - rect.left) / rect.width) * base.w,
      y: base.y + ((e.clientY - rect.top) / rect.height) * base.h,
    }
  }

  // --- background pan / click ---
  function onBackgroundPointerDown(e: React.PointerEvent) {
    if (!isBackgroundTarget(e.target as Element, e.currentTarget as Element)) return
    const startView = view ?? computeFitRef.current()
    const start = { x: e.clientX, y: e.clientY }
    let moved = false
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true
      const rect = svgRef.current!.getBoundingClientRect()
      setView({
        ...startView,
        x: startView.x - (dx / rect.width) * startView.w,
        y: startView.y - (dy / rect.height) * startView.h,
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!moved) onBackgroundClick?.()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const ctx: PanZoomContextValue = { view: v, toMm, zoomBy, zoomToFit }

  function handleContextMenu(e: React.MouseEvent) {
    if (!isBackgroundTarget(e.target as Element, e.currentTarget as Element)) return
    onBackgroundContextMenu?.(toMm(e), e, ctx)
  }

  return (
    <div className={className ? cx(containerBase, className) : containerBase}>
      {showZoomControls && (
        <div className={zoomControls}>
          {controlsSlot}
          <IconButton size="xs" variant="plain" aria-label="Zoom out" onClick={() => zoomBy(1 / 0.8)}>
            −
          </IconButton>
          <button className={zoomPct} title="Zoom to fit" onClick={zoomToFit}>
            {Math.round((computeFit().w / v.w) * 100)}%
          </button>
          <IconButton size="xs" variant="plain" aria-label="Zoom in" onClick={() => zoomBy(0.8)}>
            +
          </IconButton>
          <Button size="xs" variant="outline" onClick={zoomToFit}>
            Fit
          </Button>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`}
        className={grabbing ? canvasCursorDrag : canvasCursor}
        onPointerDown={onBackgroundPointerDown}
        onContextMenu={handleContextMenu}
      >
        {typeof children === 'function' ? children(ctx) : children}
      </svg>
    </div>
  )
}
