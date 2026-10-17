import { Copy, FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw, Trash2 } from 'lucide-react'
import { css } from '~/styled-system/css'
import { Badge, Button, Card, IconButton, Input, NumberInput, Text } from '~/components/ui'
import { useEditorStore, type ShapeKind } from '~/stores/editor'

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
const col = css({ display: 'flex', flexDir: 'column', gap: '3' })
const btnRow = css({ display: 'flex', gap: '1', flexWrap: 'wrap' })

const shapeKinds: Array<{ kind: ShapeKind; label: string }> = [
  { kind: 'rectangle', label: '▭ Rectangle' },
  { kind: 'circle', label: '◯ Circle' },
  { kind: 'notch', label: '◡ Notch' },
]

export function ToolsPanel() {
  const tools = useEditorStore((s) => s.tools)
  const selectedToolId = useEditorStore((s) => s.selectedToolId)
  const selectTool = useEditorStore((s) => s.selectTool)
  const updateTool = useEditorStore((s) => s.updateTool)
  const removeTool = useEditorStore((s) => s.removeTool)
  const duplicateTool = useEditorStore((s) => s.duplicateTool)
  const rotateTool = useEditorStore((s) => s.rotateTool)
  const flipTool = useEditorStore((s) => s.flipTool)
  const addShape = useEditorStore((s) => s.addShape)

  const selected = tools.find((t) => t.id === selectedToolId) ?? null

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Tools</Card.Title>
        <Card.Description>{tools.length} on tray</Card.Description>
      </Card.Header>
      <Card.Body className={col}>
        {tools.length === 0 && (
          <Text textStyle="sm" color="fg.muted">
            No tools yet. Start from the New Trace flow or add a shape below.
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

        <div className={btnRow}>
          {shapeKinds.map(({ kind, label }) => (
            <Button key={kind} size="sm" variant="outline" onClick={() => addShape(kind)}>
              {label}
            </Button>
          ))}
        </div>

        {selected && (
          <div className={css({ borderTopWidth: '1px', borderColor: 'border', pt: '3', display: 'flex', flexDir: 'column', gap: '3' })}>
            <Input
              value={selected.label}
              onChange={(e) => updateTool(selected.id, { label: e.target.value })}
              placeholder="Label"
            />

            <NumberInput.Root
              value={String(selected.pocketDepthMm)}
              min={1}
              max={140}
              onValueChange={(d) => updateTool(selected.id, { pocketDepthMm: d.valueAsNumber || 1 })}
            >
              <NumberInput.Label>Pocket depth (mm)</NumberInput.Label>
              <NumberInput.Control />
              <NumberInput.Input />
            </NumberInput.Root>

            <NumberInput.Root
              value={String(selected.toleranceMm)}
              min={0}
              max={3}
              step={0.1}
              onValueChange={(d) =>
                updateTool(selected.id, { toleranceMm: Number.isFinite(d.valueAsNumber) ? d.valueAsNumber : 0 })
              }
            >
              <NumberInput.Label>Fit tolerance (mm)</NumberInput.Label>
              <NumberInput.Control />
              <NumberInput.Input />
            </NumberInput.Root>

            <div className={btnRow}>
              <IconButton size="sm" variant="outline" aria-label="Rotate -90°" onClick={() => rotateTool(selected.id, -90)}>
                <RotateCcw size={16} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Rotate -15°" onClick={() => rotateTool(selected.id, -15)}>
                -15°
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Rotate +15°" onClick={() => rotateTool(selected.id, 15)}>
                +15°
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Rotate +90°" onClick={() => rotateTool(selected.id, 90)}>
                <RotateCw size={16} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Flip horizontal" onClick={() => flipTool(selected.id, 'x')}>
                <FlipHorizontal2 size={16} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Flip vertical" onClick={() => flipTool(selected.id, 'y')}>
                <FlipVertical2 size={16} />
              </IconButton>
            </div>

            <Text textStyle="xs" color="fg.subtle">
              Rotation: {Math.round(selected.rotationDeg)}° · Double-click the outline to edit vertices
            </Text>

            <div className={btnRow}>
              <Button size="sm" variant="outline" onClick={() => duplicateTool(selected.id)}>
                <Copy size={14} /> Duplicate
              </Button>
              <Button size="sm" variant="outline" colorPalette="red" onClick={() => removeTool(selected.id)}>
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        )}
      </Card.Body>
    </Card.Root>
  )
}
