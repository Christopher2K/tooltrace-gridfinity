import { css } from '~/styled-system/css'
import { Card, Text } from '~/components/ui'
import { bboxOf, polygonsIntersect, toolPoints } from '~/lib/geometry'
import { GRID_UNIT_MM, useEditorStore } from '~/stores/editor'

const okText = css({ color: 'grass.9' })
const warnText = css({ color: 'red.9' })

export function ValidationPanel() {
  const tools = useEditorStore((s) => s.tools)
  const tray = useEditorStore((s) => s.tray)

  const trayW = tray.widthUnits * GRID_UNIT_MM
  const trayH = tray.heightUnits * GRID_UNIT_MM
  const deckZ = tray.heightLevelUnits * 7 // pocket openings sit at the top of the walls (7U)
  const warnings: string[] = []

  const transformed = tools.map((t) => ({ tool: t, pts: toolPoints(t) }))

  for (const { tool, pts } of transformed) {
    const b = bboxOf(pts)
    if (b.x < -0.01 || b.y < -0.01 || b.x + b.w > trayW + 0.01 || b.y + b.h > trayH + 0.01) {
      warnings.push(`"${tool.label}" extends outside the tray`)
    }
    if (tool.pocketDepthMm >= deckZ - 2) {
      warnings.push(`"${tool.label}" pocket depth (${tool.pocketDepthMm} mm) is too deep for a ${deckZ} mm deck`)
    }
  }

  for (let i = 0; i < transformed.length; i++) {
    for (let j = i + 1; j < transformed.length; j++) {
      const a = transformed[i]
      const b = transformed[j]
      const ba = bboxOf(a.pts)
      const bb = bboxOf(b.pts)
      const bboxOverlap =
        ba.x < bb.x + bb.w && bb.x < ba.x + ba.w && ba.y < bb.y + bb.h && bb.y < ba.y + ba.h
      if (bboxOverlap && polygonsIntersect(a.pts, b.pts)) {
        warnings.push(`"${a.tool.label}" overlaps "${b.tool.label}"`)
      }
    }
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Checks</Card.Title>
      </Card.Header>
      <Card.Body>
        {warnings.length === 0 ? (
          <Text textStyle="sm" className={okText}>
            ✓ No issues
          </Text>
        ) : (
          <ul className={css({ display: 'flex', flexDir: 'column', gap: '1', pl: '4', listStyle: 'disc' })}>
            {warnings.map((w) => (
              <li key={w}>
                <Text textStyle="sm" className={warnText}>
                  {w}
                </Text>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card.Root>
  )
}
