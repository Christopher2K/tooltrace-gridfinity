import { useState } from 'react'
import { Redo2, Undo2 } from 'lucide-react'
import { css } from '~/styled-system/css'
import { IconButton } from '~/components/ui'
import { bboxCenter, bboxOf, flattenOutline, insertVertex, nearestEdgeProjection, offsetPolygon, outlinePath, quadPoint, removeVertex, rotatePoint, setEdgeCurve } from '~/lib/geometry'
import { GRID_UNIT_MM, useEditorStore, type Point, type ToolTrace } from '~/stores/editor'
import { ContextMenuPopover, PanZoomCanvas, longPressMenuEvent, startPointerGesture, useContextMenu, type MenuItem, type PanZoomContextValue, type View } from '~/components/canvas'
import { useIsTouch } from '~/hooks/use-is-touch'

const container = css({
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'l3',
  overflow: 'hidden',
  // Phones/tablets: fixed share of the viewport above the stacked panels.
  // Desktop: fill the grid row (the editor grid stretches to the main area).
  h: { base: '[58dvh]', lg: 'full' },
  minH: { base: '320px', lg: '0' },
  bg: 'gray.a1',
})
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

  const [dragging, setDragging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { menu, openMenu, closeMenu } = useContextMenu()
  const isTouch = useIsTouch()

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

  function snap(v: number): number {
    return snapMm > 0 ? Math.round(v / snapMm) * snapMm : Math.round(v * 10) / 10
  }

  function backgroundMenuItems(p: Point, ctx: PanZoomContextValue): MenuItem[] {
    return [
      { label: 'Add rectangle here', onSelect: () => addShape('rectangle', p) },
      { label: 'Add circle here', onSelect: () => addShape('circle', p) },
      { label: 'Add notch here', onSelect: () => addShape('notch', p) },
      { label: '', onSelect: () => {}, separator: true },
      { label: 'Zoom to fit', onSelect: ctx.zoomToFit },
    ]
  }

  /** Converts tray mm → tool-local mm (undo position + rotation). */
  function toLocal(tool: ToolTrace, trayP: Point): Point {
    const c = bboxCenter(tool.outline)
    const shifted = { x: trayP.x - tool.position.x, y: trayP.y - tool.position.y }
    return tool.rotationDeg ? rotatePoint(shifted, c, -tool.rotationDeg) : shifted
  }

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

  function renderTools({ view: v, toMm }: PanZoomContextValue) {
    // --- context-menu builders (shared by right-click and touch long-press) ---
    function shapeMenuItems(tool: ToolTrace, localPoint?: Point): MenuItem[] {
      if (editingId === tool.id) {
        return [
          ...(localPoint
            ? [
                {
                  label: 'Add point here',
                  onSelect: () => {
                    const { edge, point } = nearestEdgeProjection(tool, localPoint)
                    updateTool(tool.id, insertVertex(tool, edge, point))
                  },
                },
                { label: '', onSelect: () => {}, separator: true },
              ]
            : []),
          { label: 'Done editing', onSelect: () => setEditingId(null) },
          { label: '', onSelect: () => {}, separator: true },
          {
            label: 'Delete tool',
            danger: true,
            onSelect: () => {
              removeTool(tool.id)
              setEditingId(null)
            },
          },
        ]
      }
      return [
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
      ]
    }

    function vertexMenuItems(tool: ToolTrace, index: number): MenuItem[] {
      return [
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
      ]
    }

    function midMenuItems(tool: ToolTrace, edge: number, localPoint: Point): MenuItem[] {
      const curve = tool.curves?.[edge]
      return [
        {
          label: 'Add point here',
          onSelect: () => updateTool(tool.id, insertVertex(tool, edge, localPoint)),
        },
        curve
          ? { label: 'Straighten edge', onSelect: () => updateTool(tool.id, setEdgeCurve(tool, edge, null)) }
          : { label: 'Drag handle to curve the edge', disabled: true, onSelect: () => {} },
      ]
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
      const endDrag = () => setDragging(false)
      startPointerGesture(e, {
        onMove: (ev) => {
          const p = toMm(ev)
          updateToolTransient(tool.id, {
            position: { x: snap(orig.x + p.x - start.x), y: snap(orig.y + p.y - start.y) },
          })
        },
        onUp: endDrag,
        onAbort: endDrag,
        onLongPress: (point) => {
          endDrag()
          openMenu(longPressMenuEvent(point), shapeMenuItems(tool, toLocal(tool, toMm(point))))
        },
      })
    }

    // --- vertex drag (edit mode) ---
    function onVertexPointerDown(e: React.PointerEvent, tool: ToolTrace, index: number) {
      e.stopPropagation()
      beginTransient()
      startPointerGesture(e, {
        onMove: (ev) => {
          const local = toLocal(tool, toMm(ev))
          const outline = tool.outline.map((p, i) =>
            i === index ? { x: Math.round(local.x * 10) / 10, y: Math.round(local.y * 10) / 10 } : p,
          )
          updateToolTransient(tool.id, { outline })
        },
        onLongPress: (point) => openMenu(longPressMenuEvent(point), vertexMenuItems(tool, index)),
      })
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
      startPointerGesture(e, {
        onMove: (ev) => {
          const local = toLocal(tool, toMm(ev))
          updateToolTransient(tool.id, setEdgeCurve(tool, edge, local))
        },
        onLongPress: (point) =>
          openMenu(longPressMenuEvent(point), midMenuItems(tool, edge, toLocal(tool, toMm(point)))),
      })
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
      openMenu(e, shapeMenuItems(tool, editingId === tool.id ? toLocal(tool, toMm(e)) : undefined))
    }

    function onVertexContextMenu(e: React.MouseEvent, tool: ToolTrace, index: number) {
      openMenu(e, vertexMenuItems(tool, index))
    }

    function onMidContextMenu(e: React.MouseEvent, tool: ToolTrace, edge: number) {
      openMenu(e, midMenuItems(tool, edge, toLocal(tool, toMm(e))))
    }

    return (
      <>
        {/* Tray */}
        <rect x={0} y={0} width={trayW} height={trayH} className={css({ fill: 'gray.a2', stroke: 'gray.7' })} strokeWidth={0.5} />
        {gridLines}

        {/* Tools */}
        {tools.map((tool) => {
          const c = bboxCenter(tool.outline)
          const transform = `translate(${tool.position.x} ${tool.position.y}) rotate(${tool.rotationDeg} ${c.x} ${c.y})`
          const selected = tool.id === selectedToolId
          const editing = editingId === tool.id
          const handleR = Math.max(v.w, v.h) * 0.006 * (isTouch ? 1.9 : 1)
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
      </>
    )
  }

  return (
    <>
      <PanZoomCanvas
        computeFit={computeFit}
        grabbing={dragging}
        className={container}
        onBackgroundClick={() => {
          selectTool(null)
          setEditingId(null)
        }}
        onBackgroundContextMenu={(p, e, ctx) => {
          openMenu(e, backgroundMenuItems(p, ctx))
        }}
        onBackgroundLongPress={(p, e, ctx) => {
          openMenu(longPressMenuEvent(e), backgroundMenuItems(p, ctx))
        }}
        controlsSlot={
          <>
            <IconButton size="xs" variant="plain" aria-label="Undo" disabled={!canUndo} onClick={undo}>
              <Undo2 size={14} />
            </IconButton>
            <IconButton size="xs" variant="plain" aria-label="Redo" disabled={!canRedo} onClick={redo}>
              <Redo2 size={14} />
            </IconButton>
            <div className={css({ w: 'px', h: '4', bg: 'border', mx: '1' })} />
          </>
        }
      >
        {renderTools}
      </PanZoomCanvas>

      <ContextMenuPopover menu={menu} onClose={closeMenu} />
    </>
  )
}
