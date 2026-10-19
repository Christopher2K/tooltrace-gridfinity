import { css } from '~/styled-system/css'
import { Card, Text } from '~/components/ui'
import { validateLayout } from '~/lib/validation'
import { useEditorStore } from '~/stores/editor'

const okText = css({ color: 'grass.9' })
const warnText = css({ color: 'red.9' })

export function ValidationPanel() {
  const tools = useEditorStore((s) => s.tools)
  const tray = useEditorStore((s) => s.tray)

  const warnings = validateLayout(tray, tools)

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
