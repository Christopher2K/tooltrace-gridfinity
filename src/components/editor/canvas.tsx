import { useEffect, useRef, useState } from 'react'
import { css } from '~/styled-system/css'
import { IconButton } from '~/components/ui'
import { bboxCenter, bboxOf, offsetPolygon, rotatePoint } from '~/lib/geometry'
import { GRID_UNIT_MM, useEditorStore, type Point, type ToolTrace } from '~/stores/editor'

interface View {
  x: number
  y: number
  w: number
  h: number
}

const canvasCursor = css({ w: 'full', h: 'full', display: 'block', touchAction: 'none', cursor: 'default' })
const canvasCursorDrag = css({ w: 'full', h: 'full', display: 'block', touchAction: 'none', cursor: 'grabbing' })
const toolPoly = css({
  fill: 'grass.a3',
  stroke: 'grass.7',
  cursor: 'grab',
  _hover: { fill: 'grass.a4' },
})
const toolPolySelected = css({
  fill: 'grass.a5',
  stroke: 'grass.9',
  cursor: 'grab',
  _hover: { fill: 'grass.a6' },
})
const toleranceLine = css({ fill: 'none', stroke: 'grass.8', strokeDasharray: '2 2', pointerEvents: 'none' })
const vertexHandle = css({ fill: 'bg.default', stroke: 'grass.9', cursor: 'move' })
const fitBtn = css({ position: 'absolute', top: '2', right: '2' })

export function EditorCanvas() {
  const tools = useEditorStore((s) => s.tools)
  const tray = useEditorStore((s) => s.tray)
  const snapMm = useEditorStore((s) => s.snapMm)
  const selectedToolId = useEditorStore((s) => s.selectedToolId)
  const selectTool = useEditorStore((s) => s.selectTool)
  const updateTool = useEditorStore((s) => s.updateTool)

  const trayW = tray.widthUnits * GRID_UNIT_MM
  const trayH = tray.heightUnits * GRID_UNIT_MM

  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState<View | null>(null)
  const [dragging, setDragging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  /** Bounds of tray + all tools, padded. */
  function computeFit(): View {
    const xs: number[] = [0, trayW]
    const ys: number[] = [0, trayH]
    for (const t of tools) {
      const b = bboxOf(t.outline)
      xs.push(t.position.x + b.x - 5, t.position.x + b.x + b.w + 5)
      ys.push(t.position.y + b.y - 5, t.position.y + b.y + b.h + 5)
    }
    const pad = 10
    const x = Math.min(...xs) - pad
    const y = Math.min(...ys) - pad
    const w = Math.max(...xs) + pad - x
    const h = Math.max(...ys) + pad - y
    return { x, y, w, h }
  }

  // Fit view on mount and when the first tools arrive.
  useEffect(() => {
    setView((v) => (v === null ? computeFit() : v))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools.length === 0])

  // Non-passive wheel zoom centered on the cursor.
  useEffect(() => {
    const el = svgRef.current
    if (!el || !view) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const mx = view.x + ((e.clientX - rect.left) / rect.width) * view.w
      const my = view.y + ((e.clientY - rect.top) / rect.height) * view.h
      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15
      setView({
        x: mx - (mx - view.x) * factor,
        y: my - (my - view.y) * factor,
        w: Math.min(Math.max(view.w * factor, 40), 3000),
        h: Math.min(Math.max(view.h * factor, 40), 3000),
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [view])

  function toMm(e: { clientX: number; clientY: number }): Point {
    const rect = svgRef.current!.getBoundingClientRect()
    const v = view ?? computeFit()
    return {
      x: v.x + ((e.clientX - rect.left) / rect.width) * v.w,
      y: v.y + ((e.clientY - rect.top) / rect.height) * v.h,
    }
  }

  function snap(v: number): number {
    return snapMm > 0 ? Math.round(v / snapMm) * snapMm : Math.round(v * 10) / 10
  }

  // --- background pan / deselect ---
  function onBackgroundPointerDown(e: React.PointerEvent) {
    if (e.target !== e.currentTarget && (e.target as Element).tagName !== 'rect') return
    const v = view ?? computeFit()
    const start = { x: e.clientX, y: e.clientY }
    let moved = false
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - start.x
      const dy = ev.clientY - start.y
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true
      const rect = svgRef.current!.getBoundingClientRect()
      setView({
        ...v,
        x: v.x - (dx / rect.width) * v.w,
        y: v.y - (dy / rect.height) * v.h,
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!moved) {
        selectTool(null)
        setEditingId(null)
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // --- tool drag ---
  function onToolPointerDown(e: React.PointerEvent, tool: ToolTrace) {
    if (editingId === tool.id) return // vertex editing mode handles its own drags
    e.stopPropagation()
    selectTool(tool.id)
    setDragging(true)
    const start = toMm(e)
    const orig = { ...tool.position }
    const move = (ev: PointerEvent) => {
      const p = toMm(ev)
      updateTool(tool.id, {
        position: { x: snap(orig.x + p.x - start.x), y: snap(orig.y + p.y - start.y) },
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      setDragging(false)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // --- vertex drag (edit mode) ---
  function onVertexPointerDown(e: React.PointerEvent, tool: ToolTrace, index: number) {
    e.stopPropagation()
    const c = bboxCenter(tool.outline)
    const move = (ev: PointerEvent) => {
      const trayP = toMm(ev)
      // Convert tray coords → tool-local coords (undo position + rotation).
      const shifted = { x: trayP.x - tool.position.x, y: trayP.y - tool.position.y }
      const local = tool.rotationDeg ? rotatePoint(shifted, c, -tool.rotationDeg) : shifted
      const outline = tool.outline.map((p, i) =>
        i === index ? { x: Math.round(local.x * 10) / 10, y: Math.round(local.y * 10) / 10 } : p,
      )
      updateTool(tool.id, { outline })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const v = view ?? computeFit()

  const gridLines: React.ReactNode[] = []
  for (let i = 1; i < tray.widthUnits; i++) {
    gridLines.push(
      <line key={`v${i}`} x1={i * GRID_UNIT_MM} y1={0} x2={i * GRID_UNIT_MM} y2={trayH} className={css({ stroke: 'gray.a4' })} strokeWidth={0.3} />,
    )
  }
  for (let i = 1; i < tray.heightUnits; i++) {
    gridLines.push(
      <line key={`h${i}`} x1={0} y1={i * GRID_UNIT_MM} x2={trayW} y2={i * GRID_UNIT_MM} className={css({ stroke: 'gray.a4' })} strokeWidth={0.3} />,
    )
  }

  return (
    <div
      className={css({
        position: 'relative',
        borderWidth: '1px',
        borderColor: 'border',
        borderRadius: 'l3',
        overflow: 'hidden',
        minH: '480px',
        bg: 'gray.a1',
      })}
    >
      <div className={fitBtn}>
        <IconButton size="sm" variant="outline" aria-label="Fit view" onClick={() => setView(computeFit())}>
          Fit
        </IconButton>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`}
        className={dragging ? canvasCursorDrag : canvasCursor}
        onPointerDown={onBackgroundPointerDown}
      >
        {/* Tray */}
        <rect x={0} y={0} width={trayW} height={trayH} className={css({ fill: 'gray.a2', stroke: 'gray.7' })} strokeWidth={0.5} />
        {gridLines}

        {/* Tools */}
        {tools.map((tool) => {
          const c = bboxCenter(tool.outline)
          const transform = `translate(${tool.position.x} ${tool.position.y}) rotate(${tool.rotationDeg} ${c.x} ${c.y})`
          const points = tool.outline.map((p) => `${p.x},${p.y}`).join(' ')
          const selected = tool.id === selectedToolId
          return (
            <g key={tool.id} transform={transform}>
              {tool.toleranceMm > 0 && (
                <polygon
                  points={offsetPolygon(tool.outline, tool.toleranceMm).map((p) => `${p.x},${p.y}`).join(' ')}
                  className={toleranceLine}
                  strokeWidth={0.4}
                />
              )}
              <polygon
                points={points}
                onPointerDown={(e) => onToolPointerDown(e, tool)}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  selectTool(tool.id)
                  setEditingId(editingId === tool.id ? null : tool.id)
                }}
                className={selected ? toolPolySelected : toolPoly}
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
              {editingId === tool.id &&
                tool.outline.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r={Math.max(v.w, v.h) * 0.006}
                    className={vertexHandle}
                    strokeWidth={0.4}
                    onPointerDown={(e) => onVertexPointerDown(e, tool, i)}
                  />
                ))}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
