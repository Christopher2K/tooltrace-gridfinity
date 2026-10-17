import { useState } from 'react'
import { Download } from 'lucide-react'
import { css } from '~/styled-system/css'
import { Button, Card, Text } from '~/components/ui'
import { buildBinMesh } from '~/lib/gridfinity'
import { downloadStl } from '~/lib/stl'
import { useEditorStore } from '~/stores/editor'

const col = css({ display: 'flex', flexDir: 'column', gap: '2' })

export function ExportPanel() {
  const tray = useEditorStore((s) => s.tray)
  const tools = useEditorStore((s) => s.tools)
  const [busy, setBusy] = useState(false)
  const [stats, setStats] = useState<string | null>(null)

  function exportStl() {
    setBusy(true)
    // Let the UI paint the busy state before the (synchronous) mesh build.
    setTimeout(() => {
      try {
        const { triangles, warnings } = buildBinMesh(tray, tools)
        downloadStl(triangles, `gridfinity-${tray.widthUnits}x${tray.heightUnits}-tray.stl`)
        setStats(
          `${triangles.length.toLocaleString()} triangles` +
            (warnings.length ? ` — ${warnings.join('; ')}` : ''),
        )
      } finally {
        setBusy(false)
      }
    }, 10)
  }

  return (
    <Card.Root>
      <Card.Header>
        <Card.Title>Export</Card.Title>
        <Card.Description>3D-printable Gridfinity bin</Card.Description>
      </Card.Header>
      <Card.Body className={col}>
        <Button onClick={exportStl} disabled={busy}>
          <Download size={14} /> {busy ? 'Building…' : 'Download STL'}
        </Button>
        {stats && (
          <Text textStyle="xs" color="fg.subtle">
            {stats}
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  )
}
