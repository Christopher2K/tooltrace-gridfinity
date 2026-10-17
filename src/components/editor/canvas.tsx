import { useEffect, useRef, useState } from 'react'
import { Redo2, Undo2 } from 'lucide-react'
import { css } from '~/styled-system/css'
import { Button, IconButton } from '~/components/ui'
import { bboxCenter, bboxOf, flattenOutline, insertVertex, nearestEdgeProjection, offsetPolygon, outlinePath, quadPoint, removeVertex, rotatePoint, setEdgeCurve } from '~/lib/geometry'
import { GRID_UNIT_MM, useEditorStore, type Point, type ToolTrace } from '~/stores/editor'

interface View {
  x: number
  y: number
  w: number
  h: number
}

interface MenuItem {
  label: string
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
  separator?: boolean
}

interface MenuState {
  x: number
  y: number
  items: MenuItem[]
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
const midHandle = css({ fill: 'grass.a4', stroke: 'grass.8', cursor: 'copy' })
const menuPopover = css({
  position: 'fixed',
  inset: 'auto',
  m: '0',
  minW: '44',
  py: '1',
  bg: 'bg.default',
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'l2',
  shadow: 'md',
  display: 'flex',
  flexDir: 'column',
})
const menuItem = css({
  px: '3',
  py: '1.5',
  textAlign: 'left',
  textStyle: 'sm',
  cursor: 'pointer',
  bg: 'transparent',
  _hover: { bg: 'gray.a2' },
  _disabled: { color: 'fg.subtle', cursor: 'default', _hover: { bg: 'transparent' } },
})
const menuItemDanger = css({
  px: '3',
  py: '1.5',
  textAlign: 'left',
  textStyle: 'sm',
  cursor: 'pointer',
  bg: 'transparent',
  color: 'red.9',
  _hover: { bg: 'red.a2' },
})
const menuSep = css({ h: 'px', bg: 'border', my: '1' })
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

export function EditorCanvas() {
  const tools = useEditorStore((s) => s.tools)
  const tray = useEditorStore((s) => s.tray)
  const snapMm = useEditorStore((s) => s.snapMm)
  const selectedToolId = useEditorStore((s) => s.selectedToolId)
  const selectTool = useEditorStore((s) => s.selectTool)
  const updateTool = useEditorStore((s) => s.updateTool)
  const updateToolTransient = useEditorStore((s) => s.updateToolTransient)
  const beginTransient = useEditorStore((s) => s.beginTransient)
  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const removeTool = useEditorStore((s) => s.removeTool)
  const duplicateTool = useEditorStore((s) => s.duplicateTool)
  const addShape = useEditorStore((s) => s.addShape)

  const trayW = tray.widthUnits * GRID_UNIT_MM
  const trayH = tray.heightUnits * GRID_UNIT_MM

  const svgRef = useRef<SVGSVGElement>(null)
  const [view, setView] = useState<View | null>(null)
  const [dragging, setDragging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menu, setMenu] = useState<MenuState | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Open the native popover when the menu appears; sync state on light-dismiss.
  useEffect(() => {
    const el = menuRef.current
    if (el && menu && !el.matches(':popover-open')) {
      el.showPopover()
    }
  }, [menu])

  function openMenu(e: { clientX: number; clientY: number; preventDefault: () => void; stopPropagation: () => void }, items: MenuItem[]) {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, items })
  }

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

  const MIN_VIEW_W = 20 // mm — max zoom in
  const MAX_VIEW_W = 2500 // mm — max zoom out, keeps content findable

  /** Zoom by `factor` around a point given in mm view coordinates (default: view center). */
  function zoomBy(factor: number, centerMm?: Point) {
    setView((cur) => {
      const v = cur ?? computeFit()
      const cx = centerMm?.x ?? v.x + v.w / 2
      const cy = centerMm?.y ?? v.y + v.h / 2
      const clamped = Math.min(Math.max(v.w * factor, MIN_VIEW_W), MAX_VIEW_W) / v.w
      return {
        x: cx - (cx - v.x) * clamped,
        y: cy - (cy - v.y) * clamped,
        w: v.w * clamped,
        h: v.h * clamped,
      }
    })
  }

  // Fit view on mount and when the first tools arrive.
  useEffect(() => {
    setView((v) => (v === null ? computeFit() : v))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tools.length === 0])

  // Figma-style controls (non-passive wheel):
  //   scroll        → pan (Shift = horizontal)
  //   pinch / ⌃+scroll → smooth zoom around cursor, dampened & clamped
  useEffect(() => {
    const el = svgRef.current
    if (!el || !view) return
    const ZOOM_INTENSITY = 0.0025
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) {
        // Pinch gesture (trackpad) or Ctrl+wheel (mouse) → zoom
        const mx = view.x + ((e.clientX - rect.left) / rect.width) * view.w
        const my = view.y + ((e.clientY - rect.top) / rect.height) * view.h
        zoomBy(Math.exp(e.deltaY * ZOOM_INTENSITY), { x: mx, y: my })
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
    beginTransient() // one undo entry per drag gesture
    const start = toMm(e)
    const orig = { ...tool.position }
    const move = (ev: PointerEvent) => {
      const p = toMm(ev)
      updateToolTransient(tool.id, {
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

  /** Converts tray mm → tool-local mm (undo position + rotation). */
  function toLocal(tool: ToolTrace, trayP: Point): Point {
    const c = bboxCenter(tool.outline)
    const shifted = { x: trayP.x - tool.position.x, y: trayP.y - tool.position.y }
    return tool.rotationDeg ? rotatePoint(shifted, c, -tool.rotationDeg) : shifted
  }

  // --- vertex drag (edit mode) ---
  function onVertexPointerDown(e: React.PointerEvent, tool: ToolTrace, index: number) {
    e.stopPropagation()
    beginTransient()
    const move = (ev: PointerEvent) => {
      const local = toLocal(tool, toMm(ev))
      const outline = tool.outline.map((p, i) =>
        i === index ? { x: Math.round(local.x * 10) / 10, y: Math.round(local.y * 10) / 10 } : p,
      )
      updateToolTransient(tool.id, { outline })
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

  /** Double-click a vertex → delete it (keeps ≥ 3 vertices). */
  function onVertexDoubleClick(e: React.MouseEvent, tool: ToolTrace, index: number) {
    e.stopPropagation()
    const patch = removeVertex(tool, index)
    if (patch) updateTool(tool.id, patch)
  }

  // --- edge midpoint: drag pulls a curve, double-click inserts a vertex ---
  function onMidPointerDown(e: React.PointerEvent, tool: ToolTrace, edge: number) {
    e.stopPropagation()
    beginTransient()
    const move = (ev: PointerEvent) => {
      const local = toLocal(tool, toMm(ev))
      updateToolTransient(tool.id, setEdgeCurve(tool, edge, local))
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

  function onMidDoubleClick(e: React.MouseEvent, tool: ToolTrace, edge: number) {
    e.stopPropagation()
    const n = tool.outline.length
    const p0 = tool.outline[edge]
    const p1 = tool.outline[(edge + 1) % n]
    const c = tool.curves?.[edge]
    const mid = c ? quadPoint(p0, c, p1, 0.5) : { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 }
    updateTool(tool.id, insertVertex(tool, edge, mid))
  }

  // --- context menus (native contextmenu event + HTML popover) ---
  function onShapeContextMenu(e: React.MouseEvent, tool: ToolTrace) {
    if (editingId === tool.id) {
      const local = toLocal(tool, toMm(e))
      const { edge, point } = nearestEdgeProjection(tool, local)
      openMenu(e, [
        { label: 'Add point here', onSelect: () => updateTool(tool.id, insertVertex(tool, edge, point)) },
        { label: '', onSelect: () => {}, separator: true },
        {
          label: 'Delete tool',
          danger: true,
          onSelect: () => {
            removeTool(tool.id)
            setEditingId(null)
          },
        },
      ])
    } else {
      openMenu(e, [
        {
          label: 'Edit outline',
          onSelect: () => {
            selectTool(tool.id)
            setEditingId(tool.id)
          },
        },
        { label: 'Duplicate', onSelect: () => duplicateTool(tool.id) },
        { label: '', onSelect: () => {}, separator: true },
        { label: 'Delete', danger: true, onSelect: () => removeTool(tool.id) },
      ])
    }
  }

  function onVertexContextMenu(e: React.MouseEvent, tool: ToolTrace, index: number) {
    openMenu(e, [
      {
        label: 'Delete point',
        disabled: tool.outline.length <= 3,
        onSelect: () => {
          const patch = removeVertex(tool, index)
          if (patch) updateTool(tool.id, patch)
        },
      },
      { label: '', onSelect: () => {}, separator: true },
      {
        label: 'Delete tool',
        danger: true,
        onSelect: () => {
          removeTool(tool.id)
          setEditingId(null)
        },
      },
    ])
  }

  function onMidContextMenu(e: React.MouseEvent, tool: ToolTrace, edge: number) {
    const curve = tool.curves?.[edge]
    const local = toLocal(tool, toMm(e))
    openMenu(e, [
      {
        label: 'Add point here',
        onSelect: () => updateTool(tool.id, insertVertex(tool, edge, local)),
      },
      curve
        ? { label: 'Straighten edge', onSelect: () => updateTool(tool.id, setEdgeCurve(tool, edge, null)) }
        : { label: 'Drag handle to curve the edge', disabled: true, onSelect: () => {} },
    ])
  }

  function onBackgroundContextMenu(e: React.MouseEvent) {
    if (e.target !== e.currentTarget && (e.target as Element).tagName !== 'rect') return
    const p = toMm(e)
    openMenu(e, [
      { label: 'Add rectangle here', onSelect: () => addShape('rectangle', p) },
      { label: 'Add circle here', onSelect: () => addShape('circle', p) },
      { label: 'Add notch here', onSelect: () => addShape('notch', p) },
      { label: '', onSelect: () => {}, separator: true },
      { label: 'Zoom to fit', onSelect: () => setView(computeFit()) },
    ])
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
        h: '[calc(100vh - 140px)]',
        minH: '480px',
        bg: 'gray.a1',
      })}
    >
      <div className={zoomControls}>
        <IconButton size="xs" variant="plain" aria-label="Undo" disabled={!canUndo} onClick={undo}>
          <Undo2 size={14} />
        </IconButton>
        <IconButton size="xs" variant="plain" aria-label="Redo" disabled={!canRedo} onClick={redo}>
          <Redo2 size={14} />
        </IconButton>
        <div className={css({ w: 'px', h: '4', bg: 'border', mx: '1' })} />
        <IconButton size="xs" variant="plain" aria-label="Zoom out" onClick={() => zoomBy(1 / 0.8)}>
          −
        </IconButton>
        <button
          className={zoomPct}
          title="Zoom to fit"
          onClick={() => setView(computeFit())}
        >
          {Math.round((computeFit().w / v.w) * 100)}%
        </button>
        <IconButton size="xs" variant="plain" aria-label="Zoom in" onClick={() => zoomBy(0.8)}>
          +
        </IconButton>
        <Button size="xs" variant="outline" onClick={() => setView(computeFit())}>
          Fit
        </Button>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`}
        className={dragging ? canvasCursorDrag : canvasCursor}
        onPointerDown={onBackgroundPointerDown}
        onContextMenu={onBackgroundContextMenu}
      >
        {/* Tray */}
        <rect x={0} y={0} width={trayW} height={trayH} className={css({ fill: 'gray.a2', stroke: 'gray.7' })} strokeWidth={0.5} />
        {gridLines}

        {/* Tools */}
        {tools.map((tool) => {
          const c = bboxCenter(tool.outline)
          const transform = `translate(${tool.position.x} ${tool.position.y}) rotate(${tool.rotationDeg} ${c.x} ${c.y})`
          const selected = tool.id === selectedToolId
          const editing = editingId === tool.id
          const handleR = Math.max(v.w, v.h) * 0.006
          return (
            <g key={tool.id} transform={transform}>
              {tool.toleranceMm > 0 && (
                <polygon
                  points={offsetPolygon(flattenOutline(tool), tool.toleranceMm)
                    .map((p) => `${p.x},${p.y}`)
                    .join(' ')}
                  className={toleranceLine}
                  strokeWidth={0.4}
                />
              )}
              <path
                d={outlinePath(tool.outline, tool.curves)}
                onPointerDown={(e) => onToolPointerDown(e, tool)}
                onContextMenu={(e) => onShapeContextMenu(e, tool)}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  selectTool(tool.id)
                  setEditingId(editing ? null : tool.id)
                }}
                className={selected ? toolPolySelected : toolPoly}
                strokeWidth={0.5}
                strokeLinejoin="round"
              />
              {editing && (
                <>
                  {/* Edge midpoints: drag to curve, double-click to insert vertex */}
                  {tool.outline.map((p, i) => {
                    const n = tool.outline.length
                    const p1 = tool.outline[(i + 1) % n]
                    const curve = tool.curves?.[i]
                    const mid = curve
                      ? quadPoint(p, curve, p1, 0.5)
                      : { x: (p.x + p1.x) / 2, y: (p.y + p1.y) / 2 }
                    return (
                      <circle
                        key={`m${i}`}
                        cx={mid.x}
                        cy={mid.y}
                        r={handleR * 0.75}
                        className={midHandle}
                        strokeWidth={0.4}
                        onPointerDown={(e) => onMidPointerDown(e, tool, i)}
                        onDoubleClick={(e) => onMidDoubleClick(e, tool, i)}
                        onContextMenu={(e) => onMidContextMenu(e, tool, i)}
                      />
                    )
                  })}
                  {/* Vertices: drag to move, double-click to delete */}
                  {tool.outline.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r={handleR}
                      className={vertexHandle}
                      strokeWidth={0.4}
                      onPointerDown={(e) => onVertexPointerDown(e, tool, i)}
                      onDoubleClick={(e) => onVertexDoubleClick(e, tool, i)}
                      onContextMenu={(e) => onVertexContextMenu(e, tool, i)}
                    />
                  ))}
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* Context menu — native HTML popover (top layer, light-dismiss built in) */}
      {menu && (
        <div
          ref={menuRef}
          popover="auto"
          onToggle={(e: any) => {
            if (e.newState === 'closed') setMenu(null)
          }}
          className={menuPopover}
          style={{
            left: Math.min(menu.x, window.innerWidth - 190),
            top: Math.min(menu.y, window.innerHeight - menu.items.length * 36 - 16),
          }}
        >
          {menu.items.map((item, i) =>
            item.separator ? (
              <div key={i} className={menuSep} />
            ) : (
              <button
                key={i}
                className={item.danger ? menuItemDanger : menuItem}
                disabled={item.disabled}
                onClick={() => {
                  item.onSelect()
                  setMenu(null)
                }}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
