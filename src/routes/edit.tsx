import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { css } from '~/styled-system/css'
import { Badge, Card, Heading, NumberInput, Text } from '~/components/ui'
import { useEditorStore, type ToolTrace } from '~/stores/editor'

export const Route = createFileRoute('/edit')({
  component: Editor,
})

const GRID_UNIT_MM = 42

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
const toolRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  px: '2',
  py: '1.5',
  borderRadius: 'l2',
  cursor: 'pointer',
  textAlign: 'left',
  bg: 'transparent',
  _hover: { bg: 'gray.a2' },
})
const toolRowSelected = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  px: '2',
  py: '1.5',
  borderRadius: 'l2',
  cursor: 'pointer',
  textAlign: 'left',
  bg: 'gray.a3',
  _hover: { bg: 'gray.a3' },
})
const canvasCursor = css({ w: 'full', h: 'full', display: 'block', touchAction: 'none', cursor: 'default' })
const canvasCursorDrag = css({ w: 'full', h: 'full', display: 'block', touchAction: 'none', cursor: 'grabbing' })

function Editor() {
  const tools = useEditorStore((s) => s.tools)
  const tray = useEditorStore((s) => s.tray)
  const setTraySize = useEditorStore((s) => s.setTraySize)
  const selectedToolId = useEditorStore((s) => s.selectedToolId)
  const selectTool = useEditorStore((s) => s.selectTool)
  const updateTool = useEditorStore((s) => s.updateTool)

  const trayW = tray.widthUnits * GRID_UNIT_MM
  const trayH = tray.heightUnits * GRID_UNIT_MM

  // View fits the tray plus any tools overflowing it.
  const xs = tools.flatMap((t) => t.outline.map((p) => p.x + t.position.x))
  const ys = tools.flatMap((t) => t.outline.map((p) => p.y + t.position.y))
  const pad = 10
  const viewX = Math.min(0, ...(xs.length ? xs : [0])) - pad
  const viewY = Math.min(0, ...(ys.length ? ys : [0])) - pad
  const viewW = Math.max(trayW, ...(xs.length ? xs : [0])) - viewX + pad
  const viewH = Math.max(trayH, ...(ys.length ? ys : [0])) - viewY + pad

  const svgRef = useRef<SVGSVGElement>(null)
  const [dragging, setDragging] = useState(false)

  function toMm(e: { clientX: number; clientY: number }) {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: viewX + ((e.clientX - rect.left) / rect.width) * viewW,
      y: viewY + ((e.clientY - rect.top) / rect.height) * viewH,
    }
  }

  function onToolPointerDown(e: React.PointerEvent, tool: ToolTrace) {
    e.stopPropagation()
    selectTool(tool.id)
    setDragging(true)
    const start = toMm(e)
    const orig = { ...tool.position }
    const move = (ev: PointerEvent) => {
      const p = toMm(ev)
      updateTool(tool.id, {
        position: {
          x: Math.round((orig.x + p.x - start.x) * 10) / 10,
          y: Math.round((orig.y + p.y - start.y) * 10) / 10,
        },
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

  const gridLines: React.ReactNode[] = []
  for (let i = 1; i < tray.widthUnits; i++) {
    gridLines.push(<line key={`v${i}`} x1={i * GRID_UNIT_MM} y1={0} x2={i * GRID_UNIT_MM} y2={trayH} className={css({ stroke: 'gray.a4' })} strokeWidth={0.3} />)
  }
  for (let i = 1; i < tray.heightUnits; i++) {
    gridLines.push(<line key={`h${i}`} x1={0} y1={i * GRID_UNIT_MM} x2={trayW} y2={i * GRID_UNIT_MM} className={css({ stroke: 'gray.a4' })} strokeWidth={0.3} />)
  }

  return (
    <div className={css({ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '4', h: 'full' })}>
      {/* Left: tray config */}
      <Card.Root>
        <Card.Header>
          <Card.Title>Tray</Card.Title>
          <Card.Description>Gridfinity units (42 mm)</Card.Description>
        </Card.Header>
        <Card.Body className={css({ display: 'flex', flexDir: 'column', gap: '4' })}>
          <NumberInput.Root
            value={String(tray.widthUnits)}
            min={1}
            max={12}
            onValueChange={(d) => setTraySize(d.valueAsNumber || 1, tray.heightUnits)}
          >
            <NumberInput.Label>Width (units)</NumberInput.Label>
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
          <NumberInput.Root
            value={String(tray.heightUnits)}
            min={1}
            max={12}
            onValueChange={(d) => setTraySize(tray.widthUnits, d.valueAsNumber || 1)}
          >
            <NumberInput.Label>Depth (units)</NumberInput.Label>
            <NumberInput.Control />
            <NumberInput.Input />
          </NumberInput.Root>
          <Text textStyle="sm" color="fg.muted">
            {trayW} × {trayH} mm
          </Text>
        </Card.Body>
      </Card.Root>

      {/* Center: canvas */}
      <div
        className={css({
          borderWidth: '1px',
          borderColor: 'border',
          borderRadius: 'l3',
          overflow: 'hidden',
          minH: '480px',
          bg: 'gray.a1',
        })}
      >
        <svg
          ref={svgRef}
          viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
          className={dragging ? canvasCursorDrag : canvasCursor}
          onPointerDown={() => selectTool(null)}
        >
          {/* Tray */}
          <rect x={0} y={0} width={trayW} height={trayH} className={css({ fill: 'gray.a2', stroke: 'gray.7' })} strokeWidth={0.5} />
          {gridLines}

          {/* Tools */}
          {tools.map((tool) => (
            <polygon
              key={tool.id}
              points={tool.outline.map((p) => `${p.x},${p.y}`).join(' ')}
              transform={`translate(${tool.position.x} ${tool.position.y}) rotate(${tool.rotationDeg})`}
              onPointerDown={(e) => onToolPointerDown(e, tool)}
              className={tool.id === selectedToolId ? toolPolySelected : toolPoly}
              strokeWidth={0.5}
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      {/* Right: detected tools */}
      <Card.Root>
        <Card.Header>
          <Card.Title>Tools</Card.Title>
          <Card.Description>{tools.length} detected</Card.Description>
        </Card.Header>
        <Card.Body className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
          {tools.length === 0 && (
            <Text textStyle="sm" color="fg.muted">
              No tools yet. Start from the New Trace flow.
            </Text>
          )}
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => selectTool(tool.id)}
              className={tool.id === selectedToolId ? toolRowSelected : toolRow}
            >
              <Text textStyle="sm">{tool.label}</Text>
              <Badge>{tool.pocketDepthMm} mm</Badge>
            </button>
          ))}
        </Card.Body>
      </Card.Root>
    </div>
  )
}
