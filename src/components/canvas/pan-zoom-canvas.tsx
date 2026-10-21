import { useEffect, useRef, useState, type ReactNode } from 'react'
import { css, cx } from '~/styled-system/css'
import { Button, IconButton } from '~/components/ui'
import { useIsTouch } from '~/hooks/use-is-touch'
import { PINCH_START_EVENT, longPressMenuEvent, setPinchActive, startPointerGesture, type LongPressPoint } from './pointer-gesture'
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
  /** Fired on background touch long-press with the world point and the canvas context. */
  onBackgroundLongPress?: (worldPoint: Point, e: LongPressPoint, ctx: PanZoomContextValue) => void
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

interface TrackedPointer {
  x: number
  y: number
  type: string
}

interface PinchState {
  startDist: number
  /** World (mm) point that was under the finger midpoint when the pinch started. */
  anchorMm: Point
  startView: View
}

/**
 * Generic mm-accurate pan/zoom SVG canvas.
 *
 * Controls (Figma-style):
 * - Mouse/trackpad: scroll pans (Shift = horizontal), pinch / Ctrl+scroll zooms around the cursor.
 * - Touch: one finger on background pans; two fingers pinch-zoom + pan around the midpoint.
 * - Background pointer-drag pans (slop threshold); click without movement fires `onBackgroundClick`.
 * - Touch long-press on background fires `onBackgroundLongPress` (context-menu equivalent).
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
    onBackgroundLongPress,
    onViewChange,
    showZoomControls = true,
    controlsSlot,
    isBackgroundTarget = defaultIsBackgroundTarget,
    className,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState<View | null>(null)
  const isTouch = useIsTouch()
  const computeFitRef = useRef(computeFit)
  computeFitRef.current = computeFit
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange
  const onBackgroundLongPressRef = useRef(onBackgroundLongPress)
  onBackgroundLongPressRef.current = onBackgroundLongPress

  const v = view ?? computeFit()

  const viewRef = useRef(v)
  viewRef.current = v

  // --- touch pinch-zoom (two fingers anywhere on the canvas) ---
  const pointersRef = useRef(new Map<number, TrackedPointer>())
  const pinchRef = useRef<PinchState | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const touchPointers = () => [...pointersRef.current.values()].filter((p) => p.type === 'touch')

    const clientToMm = (cx: number, cy: number): Point => {
      const rect = svgRef.current!.getBoundingClientRect()
      const base = viewRef.current
      return {
        x: base.x + ((cx - rect.left) / rect.width) * base.w,
        y: base.y + ((cy - rect.top) / rect.height) * base.h,
      }
    }

    const onDown = (e: PointerEvent) => {
      if (!container.contains(e.target as Node)) return
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType })
      const pts = touchPointers()
      if (pts.length === 2) {
        // Second finger landed: pinch takes over; any one-finger drag aborts via the event.
        pinchRef.current = {
          startDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          anchorMm: clientToMm((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2),
          startView: viewRef.current,
        }
        setPinchActive(true)
        window.dispatchEvent(new Event(PINCH_START_EVENT))
      }
    }

    const onMove = (e: PointerEvent) => {
      const tracked = pointersRef.current.get(e.pointerId)
      if (tracked) {
        tracked.x = e.clientX
        tracked.y = e.clientY
      }
      const pinch = pinchRef.current
      if (!pinch) return
      const pts = touchPointers()
      if (pts.length < 2) return
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      if (dist === 0 || pinch.startDist === 0) return
      const rect = svgRef.current!.getBoundingClientRect()
      const factor = Math.min(Math.max(pinch.startView.w * (pinch.startDist / dist), minViewW), maxViewW) / pinch.startView.w
      const w = pinch.startView.w * factor
      const h = pinch.startView.h * factor
      // Keep the anchor mm point pinned under the current finger midpoint.
      const midX = (pts[0].x + pts[1].x) / 2
      const midY = (pts[0].y + pts[1].y) / 2
      setView({
        x: pinch.anchorMm.x - ((midX - rect.left) / rect.width) * w,
        y: pinch.anchorMm.y - ((midY - rect.top) / rect.height) * h,
        w,
        h,
      })
    }

    const onUp = (e: PointerEvent) => {
      pointersRef.current.delete(e.pointerId)
      if (touchPointers().length < 2 && pinchRef.current) {
        pinchRef.current = null
        setPinchActive(false)
      }
    }

    // Missed pointerups (touchcancel, focus loss, palm rejection) would otherwise
    // leave stale pointers that poison pinch detection — drop everything.
    const clearAll = () => {
      pointersRef.current.clear()
      pinchRef.current = null
      setPinchActive(false)
    }

    window.addEventListener('pointerdown', onDown, true)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('blur', clearAll)
    document.addEventListener('visibilitychange', clearAll)
    return () => {
      window.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('blur', clearAll)
      document.removeEventListener('visibilitychange', clearAll)
    }
  }, [minViewW, maxViewW])

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

  const ctx: PanZoomContextValue = { view: v, toMm, zoomBy, zoomToFit }

  // --- background pan / click / touch long-press ---
  function onBackgroundPointerDown(e: React.PointerEvent) {
    if (!isBackgroundTarget(e.target as Element, e.currentTarget as Element)) return
    const startView = view ?? computeFitRef.current()
    const start = { x: e.clientX, y: e.clientY }
    let moved = false
    startPointerGesture(
      e,
      {
        onMove: (ev) => {
          const dx = ev.clientX - start.x
          const dy = ev.clientY - start.y
          if (Math.abs(dx) + Math.abs(dy) > 3) moved = true
          const rect = svgRef.current!.getBoundingClientRect()
          setView({
            ...startView,
            x: startView.x - (dx / rect.width) * startView.w,
            y: startView.y - (dy / rect.height) * startView.h,
          })
        },
        onUp: () => {
          if (!moved) onBackgroundClick?.()
        },
        onLongPress: (point) => {
          onBackgroundLongPressRef.current?.(toMm(point), point, ctx)
        },
      },
      { moveThreshold: 3 },
    )
  }

  function handleContextMenu(e: React.MouseEvent) {
    if (!isBackgroundTarget(e.target as Element, e.currentTarget as Element)) return
    onBackgroundContextMenu?.(toMm(e), e, ctx)
  }

  const controlSize = isTouch ? 'sm' : 'xs'

  return (
    <div ref={containerRef} className={className ? cx(containerBase, className) : containerBase}>
      {showZoomControls && (
        <div className={zoomControls}>
          {controlsSlot}
          <IconButton size={controlSize} variant="plain" aria-label="Zoom out" onClick={() => zoomBy(1 / 0.8)}>
            −
          </IconButton>
          <button className={zoomPct} title="Zoom to fit" onClick={zoomToFit}>
            {Math.round((computeFit().w / v.w) * 100)}%
          </button>
          <IconButton size={controlSize} variant="plain" aria-label="Zoom in" onClick={() => zoomBy(0.8)}>
            +
          </IconButton>
          <Button size={controlSize} variant="outline" onClick={zoomToFit}>
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

/** Re-exported for consumers building long-press context menus. */
export { longPressMenuEvent }
