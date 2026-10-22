import { css, cx } from '~/styled-system/css'
import { Card, NumberInput, Switch } from '~/components/ui'
import { GRID_UNIT_MM, useEditorStore } from '~/stores/editor'
import { panelBody, panelHeader, panelRoot } from '~/components/editor/panel'

const fieldCol = css({ display: 'flex', flexDir: 'column', gap: '4' })
const switchRow = css({ display: 'flex', alignItems: 'center', gap: '2' })

export function TrayPanel() {
  const tray = useEditorStore((s) => s.tray)
  const setTraySize = useEditorStore((s) => s.setTraySize)
  const setTrayConfig = useEditorStore((s) => s.setTrayConfig)
  const snapMm = useEditorStore((s) => s.snapMm)
  const setSnapMm = useEditorStore((s) => s.setSnapMm)

  const trayW = tray.widthUnits * GRID_UNIT_MM
  const trayH = tray.heightUnits * GRID_UNIT_MM
  const binHeightMm = tray.heightLevelUnits * 7 + 4.4 // 7U + stacking lip

  return (
    <Card.Root className={panelRoot}>
      <Card.Header className={panelHeader}>
        <Card.Title>Tray</Card.Title>
        <Card.Description>Gridfinity units · 42 mm</Card.Description>
      </Card.Header>
      <Card.Body className={cx(fieldCol, panelBody)}>
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
        <NumberInput.Root
          value={String(tray.heightLevelUnits)}
          min={1}
          max={20}
          onValueChange={(d) => setTrayConfig({ heightLevelUnits: d.valueAsNumber || 1 })}
        >
          <NumberInput.Label>Height (7 mm units)</NumberInput.Label>
          <NumberInput.Control />
          <NumberInput.Input />
        </NumberInput.Root>

        <Switch.Root
          className={switchRow}
          checked={snapMm > 0}
          onCheckedChange={(d) => setSnapMm(d.checked ? 5 : 0)}
        >
          <Switch.Control />
          <Switch.Label>Snap to 5 mm</Switch.Label>
          <Switch.HiddenInput />
        </Switch.Root>

        <div className={css({ borderTopWidth: '1px', borderColor: 'border', pt: '3', display: 'flex', flexDir: 'column', gap: '1' })}>
          <span className={css({ fontFamily: 'mono', fontSize: '12px', lineHeight: '16px', color: 'fg.default' })}>
            {trayW} × {trayH} mm
          </span>
          <span className={css({ fontFamily: 'mono', fontSize: '11px', lineHeight: '14px', color: 'fg.subtle' })}>
            {binHeightMm} mm tall · 0.5 mm tol
          </span>
        </div>
      </Card.Body>
    </Card.Root>
  )
}
