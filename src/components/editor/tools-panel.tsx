import { Circle, CircleDashed, Copy, FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw, Square, Trash2 } from 'lucide-react'
import { css, cx } from '~/styled-system/css'
import { Button, Card, IconButton, Input, NumberInput, Text } from '~/components/ui'
import { useEditorStore, type ShapeKind } from '~/stores/editor'
import { panelBody, panelHeader, panelRoot } from '~/components/editor/panel'

const toolRow = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  px: '2',
  py: '[7px]',
  minH: '8',
  borderRadius: 'l2',
  cursor: 'pointer',
  textAlign: 'left',
  bg: 'transparent',
  color: 'fg.default',
  fontSize: '13px',
  lineHeight: '16px',
  _hover: { bg: 'gray.a2' },
  _touch: { py: '2.5' },
})
const toolRowSelected = css({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
  px: '2',
  py: '[7px]',
  minH: '8',
  borderRadius: 'l2',
  cursor: 'pointer',
  textAlign: 'left',
  fontSize: '13px',
  lineHeight: '16px',
  bg: 'grass.3',
  color: 'grass.11',
  fontWeight: 'medium',
  // 2 px accent left bar
  boxShadow: 'inset 2px 0 0 var(--colors-grass-9)',
  _hover: { bg: 'grass.3' },
  _touch: { py: '2.5' },
})
const col = css({ display: 'flex', flexDir: 'column', gap: '3' })
const btnRow = css({ display: 'flex', gap: '1', flexWrap: 'wrap' })

const depthBadge = css({
  ml: 'auto',
  px: '2',
  py: '0.5',
  borderRadius: 'l2',
  bg: 'bg.subtle',
  fontFamily: 'mono',
  fontSize: '11px',
  lineHeight: '14px',
  color: 'fg.muted',
})

const shapeChip = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1.5',
  h: '[25px]',
  px: '2',
  borderRadius: 'l2',
  borderWidth: '1px',
  borderColor: 'border.strong',
  bg: 'bg.surface',
  fontSize: '12px',
  lineHeight: '15px',
  fontWeight: 'medium',
  color: 'fg.default',
  cursor: 'pointer',
  _hover: { bg: 'gray.a2' },
  _icon: { boxSize: '3', color: 'fg.muted' },
})

const shapeKinds: Array<{ kind: ShapeKind; label: string; icon: typeof Square }> = [
  { kind: 'rectangle', label: 'Rectangle', icon: Square },
  { kind: 'circle', label: 'Circle', icon: Circle },
  { kind: 'notch', label: 'Notch', icon: CircleDashed },
]

const transformBtn = css({ h: '[30px]', minW: '[30px]', w: '[30px]', p: '0' })

export function ToolsPanel() {
  const tools = useEditorStore((s) => s.tools)
  const selectedToolId = useEditorStore((s) => s.selectedToolId)
  const selectTool = useEditorStore((s) => s.selectTool)
  const updateTool = useEditorStore((s) => s.updateTool)
  const removeTool = useEditorStore((s) => s.removeTool)
  const duplicateTool = useEditorStore((s) => s.duplicateTool)
  const rotateTool = useEditorStore((s) => s.rotateTool)
  const flipTool = useEditorStore((s) => s.flipTool)
  const centerTool = useEditorStore((s) => s.centerTool)
  const addShape = useEditorStore((s) => s.addShape)

  const selected = tools.find((t) => t.id === selectedToolId) ?? null

  return (
    <Card.Root className={cx(panelRoot, css({ order: { base: '-2', lg: '0' } }))}>
      <Card.Header className={panelHeader}>
        <Card.Title>Tools</Card.Title>
        <Card.Description>{tools.length} on tray</Card.Description>
      </Card.Header>
      <Card.Body className={cx(col, panelBody)}>
        {tools.length === 0 && (
          <Text textStyle="body-sm" color="fg.muted">
            No tools yet. Start from the New Trace flow or add a shape below.
          </Text>
        )}

        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => selectTool(tool.id)}
            className={tool.id === selectedToolId ? toolRowSelected : toolRow}
          >
            <span className={css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
              {tool.label}
            </span>
            <span className={depthBadge}>{tool.pocketDepthMm} mm</span>
          </button>
        ))}

        <div className={btnRow}>
          {shapeKinds.map(({ kind, label, icon: Icon }) => (
            <button key={kind} className={shapeChip} onClick={() => addShape(kind)}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {selected && (
          <div className={css({ borderTopWidth: '1px', borderColor: 'border', pt: '3', display: 'flex', flexDir: 'column', gap: '3' })}>
            <Input
              size="sm"
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
              <IconButton size="sm" variant="outline" aria-label="Rotate -90°" className={transformBtn} onClick={() => rotateTool(selected.id, -90)}>
                <RotateCcw size={14} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Rotate +90°" className={transformBtn} onClick={() => rotateTool(selected.id, 90)}>
                <RotateCw size={14} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Flip horizontal" className={transformBtn} onClick={() => flipTool(selected.id, 'x')}>
                <FlipHorizontal2 size={14} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Flip vertical" className={transformBtn} onClick={() => flipTool(selected.id, 'y')}>
                <FlipVertical2 size={14} />
              </IconButton>
              <IconButton size="sm" variant="outline" aria-label="Duplicate" className={transformBtn} onClick={() => duplicateTool(selected.id)}>
                <Copy size={14} />
              </IconButton>
              <IconButton
                size="sm"
                variant="outline"
                aria-label="Delete"
                className={cx(transformBtn, css({ color: 'error.fg' }))}
                onClick={() => removeTool(selected.id)}
              >
                <Trash2 size={14} />
              </IconButton>
            </div>

            <div className={btnRow}>
              <Button size="xs" variant="outline" onClick={() => rotateTool(selected.id, -15)}>
                −15°
              </Button>
              <Button size="xs" variant="outline" onClick={() => rotateTool(selected.id, 15)}>
                +15°
              </Button>
              <Button size="xs" variant="outline" onClick={() => centerTool(selected.id, 'x')}>
                Center H
              </Button>
              <Button size="xs" variant="outline" onClick={() => centerTool(selected.id, 'y')}>
                Center V
              </Button>
              <Button size="xs" variant="outline" onClick={() => centerTool(selected.id, 'both')}>
                Center both
              </Button>
            </div>

            <Text textStyle="body-sm" color="fg.subtle" fontSize="12px">
              Rotation: {Math.round(selected.rotationDeg)}° · Double-click (or long-press) the outline
              to edit: drag vertices, drag edge midpoints to curve, use the menu to add/remove points
            </Text>
          </div>
        )}
      </Card.Body>
    </Card.Root>
  )
}
