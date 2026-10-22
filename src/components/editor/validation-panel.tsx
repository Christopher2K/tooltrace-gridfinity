import { CircleCheck, TriangleAlert } from 'lucide-react'
import { css, cx } from '~/styled-system/css'
import { Card } from '~/components/ui'
import { validateLayout } from '~/lib/validation'
import { useEditorStore } from '~/stores/editor'
import { panelBody, panelHeader, panelRoot } from '~/components/editor/panel'

const checkRow = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  fontSize: '12px',
  lineHeight: '15px',
  color: 'fg.muted',
  _icon: { boxSize: '3.5', flexShrink: '0', mt: 'px' },
})

export function ValidationPanel() {
  const tools = useEditorStore((s) => s.tools)
  const tray = useEditorStore((s) => s.tray)

  const warnings = validateLayout(tray, tools)

  return (
    <Card.Root className={cx(panelRoot, css({ order: { base: '-1', lg: '0' } }))}>
      <Card.Header className={panelHeader}>
        <Card.Title>Checks</Card.Title>
        <Card.Description>Layout validation</Card.Description>
      </Card.Header>
      <Card.Body className={cx(css({ display: 'flex', flexDir: 'column', gap: '2' }), panelBody)}>
        {warnings.length === 0 ? (
          <div className={checkRow}>
            <CircleCheck className={css({ color: 'success.fg' })} />
            <span>All tools fit — no layout issues</span>
          </div>
        ) : (
          warnings.map((w) => (
            <div key={w} className={checkRow}>
              <TriangleAlert className={css({ color: 'warning.fg' })} />
              <span>{w}</span>
            </div>
          ))
        )}
      </Card.Body>
    </Card.Root>
  )
}
