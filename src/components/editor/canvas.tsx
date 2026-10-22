import { useState } from 'react'
import { EyeOff, Image as ImageIcon, ImageOff, Redo2, Shapes, Undo2 } from 'lucide-react'
import { css, cx } from '~/styled-system/css'
import { IconButton } from '~/components/ui'
import { bboxCenter, bboxOf, flattenOutline, insertVertex, nearestEdgeProjection, offsetPolygon, outlinePath, quadPoint, removeVertex, rotatePoint, setEdgeCurve, toolPoints } from '~/lib/geometry'
import { computeAlignmentSnap, type SnapGuide } from '~/lib/snap'
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
  h: { base: '[330px]', sm: '[50dvh]', lg: 'full' },
  minH: { lg: '0' },
  bg: 'canvas.bg',
})
const toolPoly = css({
  fill: 'canvas.toolFill',
  stroke: 'canvas.tool',
  cursor: 'grab',
  _hover: { fill: '[#1c202414]' },
})
const toolPolySelected = css({
  fill: 'canvas.selectionFill',
  stroke: 'canvas.selection',
  cursor: 'grab',
  _hover: { fill: 'grass.a4' },
})
const toleranceLine = css({ fill: 'none', stroke: 'grass.8', strokeDasharray: '2 2', pointerEvents: 'none' })
const vertexHandle = css({ fill: 'bg.surface', stroke: 'canvas.selection', cursor: 'move' })
const midHandle = css({ fill: 'bg.surface', stroke: 'canvas.selection', cursor: 'copy' })
const snapGuide = css({ stroke: 'canvas.selection', strokeDasharray: '1.5 1.5', pointerEvents: 'none' })

const overlayPill = css({
  position: 'absolute',
  // Hidden on phones: the tray pill collides with the touch-sized toolbar up there.
  // (The coords pill never renders on touch anyway — hover only.)
  display: { base: 'none', sm: 'inline-flex' },
  alignItems: 'center',
  px: '2.5',
  py: '1',
  borderRadius: 'l2',
  bg: 'bg.surface',
  borderWidth: '1px',
  borderColor: 'border.strong',
  fontFamily: 'mono',
  fontSize: '10px',
  lineHeight: '13px',
  letterSpacing: '0.04em',
  color: 'fg.muted',
  pointerEvents: 'none',
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

  const [dragging, setDragging] = useState(false)
  const [guides, setGuides] = useState<SnapGuide[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  // Reference-layer visibility: the rectified scan photo and the tool outlines.
  const scanImage = useEditorStore((s) => s.scanImage)
  const [showScan, setShowScan] = useState(true)
  const [showOutlines, setShowOutlines] = useState(true)
  const { menu, openMenu, closeMenu } = useContextMenu()
  const isTouch = useIsTouch()
  // Canvas chrome buttons match the zoom cluster's touch sizing (min 44px targets).
  const chromeSize = isTouch ? 'sm' : 'xs'
  // Live pointer position over the canvas (mm), shown in the bottom-right pill.
  const [hoverMm, setHoverMm] = useState<Point | null>(null)

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

  /** Minor grid (10.5 mm) spanning the visible view + tray cell dividers (42 mm). */
  function renderGrid(v: View, pxToMm: (px: number) => number): React.ReactNode {
    const lines: React.ReactNode[] = []
    const minor = GRID_UNIT_MM / 4
    const thin = pxToMm(1)
    const x0 = Math.floor(v.x / minor) * minor
    const y0 = Math.floor(v.y / minor) * minor
    for (let x = x0; x <= v.x + v.w; x += minor) {
      lines.push(
        <line key={`gv${x.toFixed(2)}`} x1={x} y1={v.y} x2={x} y2={v.y + v.h} className={css({ stroke: 'canvas.grid' })} strokeWidth={thin} />,
      )
    }
    for (let y = y0; y <= v.y + v.h; y += minor) {
      lines.push(
        <line key={`gh${y.toFixed(2)}`} x1={v.x} y1={y} x2={v.x + v.w} y2={y} className={css({ stroke: 'canvas.grid' })} strokeWidth={thin} />,
      )
    }
    // 42 mm cell dividers on the tray surface
    for (let i = 1; i < tray.widthUnits; i++) {
      lines.push(
        <line key={`tv${i}`} x1={i * GRID_UNIT_MM} y1={0} x2={i * GRID_UNIT_MM} y2={trayH} className={css({ stroke: 'canvas.gridMajor' })} strokeWidth={thin} />,
      )
    }
    for (let i = 1; i < tray.heightUnits; i++) {
      lines.push(
        <line key={`th${i}`} x1={0} y1={i * GRID_UNIT_MM} x2={trayW} y2={i * GRID_UNIT_MM} className={css({ stroke: 'canvas.gridMajor' })} strokeWidth={thin} />,
      )
    }
    return lines
  }

  function renderTools({ view: v, toMm, pxToMm }: PanZoomContextValue) {
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
      const endDrag = () => {
        setDragging(false)
        setGuides([])
      }
      // ~8 screen px, clamped to a sane minimum so dense zoom-ins still snap.
      const thresholdMm = Math.max(pxToMm(8), 0.25)
      startPointerGesture(e, {
        onMove: (ev) => {
          const p = toMm(ev)
          // Grid snap is the fallback baseline.
          let x = snap(orig.x + p.x - start.x)
          let y = snap(orig.y + p.y - start.y)
          // Alignment snap (other tools' bbox edges/centers + tray edges/center
          // lines) wins over grid snap when a candidate is within threshold.
          const draggedBBox = bboxOf(toolPoints({ ...tool, position: { x, y } }))
          const otherBBoxes = tools.filter((t) => t.id !== tool.id).map((t) => bboxOf(toolPoints(t)))
          const alignment = computeAlignmentSnap(draggedBBox, otherBBoxes, trayW, trayH, thresholdMm)
          if (alignment) {
            x += alignment.dx
            y += alignment.dy
          }
          setGuides(alignment?.guides ?? [])
          updateToolTransient(tool.id, { position: { x, y } })
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
        <rect x={0} y={0} width={trayW} height={trayH} className={css({ fill: 'bg.surface', stroke: 'canvas.tray' })} strokeWidth={pxToMm(1.5)} />

        {/* Reference photo layer: the rectified scan, in sheet mm coordinates
            (tool positions are sheet mm, so it aligns exactly). Under the grid,
            never interactive. */}
        {scanImage && showScan && (
          <image
            href={scanImage.url}
            x={0}
            y={0}
            width={scanImage.paperSizeMm.width}
            height={scanImage.paperSizeMm.height}
            opacity={0.65}
            preserveAspectRatio="none"
            className={css({ pointerEvents: 'none' })}
          />
        )}
        {renderGrid(v, pxToMm)}

        {/* Tools (selected/editing tools always render, even with outlines hidden) */}
        {tools
          .filter((t) => showOutlines || t.id === selectedToolId || t.id === editingId)
          .map((tool) => {
          const c = bboxCenter(tool.outline)
          const transform = `translate(${tool.position.x} ${tool.position.y}) rotate(${tool.rotationDeg} ${c.x} ${c.y})`
          const selected = tool.id === selectedToolId
          const editing = editingId === tool.id
          // Screen-px-sized chrome: 9 px square handles (bigger on touch).
          const handleSize = pxToMm(isTouch ? 16 : 9)
          const midR = handleSize * 0.32
          return (
            <g key={tool.id} transform={transform}>
              {tool.toleranceMm > 0 && (
                <polygon
                  points={offsetPolygon(flattenOutline(tool), tool.toleranceMm)
                    .map((p) => `${p.x},${p.y}`)
                    .join(' ')}
                  className={toleranceLine}
                  strokeWidth={pxToMm(1)}
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
                strokeWidth={selected ? pxToMm(2) : pxToMm(1.5)}
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
                        r={midR}
                        className={midHandle}
                        strokeWidth={pxToMm(1.25)}
                        onPointerDown={(e) => onMidPointerDown(e, tool, i)}
                        onDoubleClick={(e) => onMidDoubleClick(e, tool, i)}
                        onContextMenu={(e) => onMidContextMenu(e, tool, i)}
                      />
                    )
                  })}
                  {/* Vertices: drag to move, double-click to delete */}
                  {tool.outline.map((p, i) => (
                    <rect
                      key={i}
                      x={p.x - handleSize / 2}
                      y={p.y - handleSize / 2}
                      width={handleSize}
                      height={handleSize}
                      rx={pxToMm(1.5)}
                      className={vertexHandle}
                      strokeWidth={pxToMm(1.5)}
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

        {/* Alignment guides while dragging */}
        {dragging &&
          guides.map((g, i) =>
            g.axis === 'x' ? (
              <line key={i} x1={g.posMm} y1={g.fromMm} x2={g.posMm} y2={g.toMm} className={snapGuide} strokeWidth={pxToMm(1.5)} />
            ) : (
              <line key={i} x1={g.fromMm} y1={g.posMm} x2={g.toMm} y2={g.posMm} className={snapGuide} strokeWidth={pxToMm(1.5)} />
            ),
          )}
      </>
    )
  }

  return (
    <>
      <PanZoomCanvas
        computeFit={computeFit}
        grabbing={dragging}
        className={container}
        onHoverMm={isTouch ? undefined : (p) => setHoverMm(p)}
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
        overlaySlot={
          <>
            {/* Tray info pill — top left (hidden on phones via overlayPill;
                the tray meta pills row below the canvas shows the same info) */}
            <span className={cx(overlayPill, css({ top: '3', left: '3' }))}>
              TRAY {tray.widthUnits} × {tray.heightUnits} · {trayW} × {trayH} MM
            </span>
            {/* Snap/grid note — bottom left */}
            <span
              className={css({
                position: 'absolute',
                bottom: '3',
                left: '3',
                fontFamily: 'mono',
                fontSize: '10px',
                lineHeight: '13px',
                letterSpacing: '0.04em',
                color: 'fg.subtle',
                pointerEvents: 'none',
              })}
            >
              {snapMm > 0 ? `SNAP ${snapMm} MM` : 'SNAP OFF'} · GRID {GRID_UNIT_MM} MM
            </span>
            {/* Live pointer coordinates — bottom right (hidden on touch) */}
            {hoverMm && (
              <span className={cx(overlayPill, css({ bottom: '3', right: '3' }))}>
                X {hoverMm.x.toFixed(1)} · Y {hoverMm.y.toFixed(1)}
              </span>
            )}
          </>
        }
        controlsSlot={
          <>
            <IconButton size={chromeSize} variant="plain" aria-label="Undo" disabled={!canUndo} onClick={undo}>
              <Undo2 size={isTouch ? 16 : 14} />
            </IconButton>
            <IconButton size={chromeSize} variant="plain" aria-label="Redo" disabled={!canRedo} onClick={redo}>
              <Redo2 size={isTouch ? 16 : 14} />
            </IconButton>
            {scanImage && (
              <IconButton
                size={chromeSize}
                variant="plain"
                aria-label={showScan ? 'Hide scan photo' : 'Show scan photo'}
                aria-pressed={showScan}
                onClick={() => setShowScan((v) => !v)}
              >
                {showScan ? <ImageIcon size={isTouch ? 16 : 14} /> : <ImageOff size={isTouch ? 16 : 14} />}
              </IconButton>
            )}
            <IconButton
              size={chromeSize}
              variant="plain"
              aria-label={showOutlines ? 'Hide outlines' : 'Show outlines'}
              aria-pressed={showOutlines}
              onClick={() => setShowOutlines((v) => !v)}
            >
              {showOutlines ? <Shapes size={isTouch ? 16 : 14} /> : <EyeOff size={isTouch ? 16 : 14} />}
            </IconButton>
          </>
        }
      >
        {renderTools}
      </PanZoomCanvas>

      <ContextMenuPopover menu={menu} onClose={closeMenu} />
    </>
  )
}
