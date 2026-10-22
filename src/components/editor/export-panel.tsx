import { createListCollection } from '@ark-ui/react'
import { useRef, useState } from 'react'
import { Download, FileDown, FileUp, TriangleAlert } from 'lucide-react'
import { css, cx } from '~/styled-system/css'
import { Button, Card, Select, Text } from '~/components/ui'
import { panelBody, panelHeader, panelRoot } from '~/components/editor/panel'
import { buildBinMesh } from '~/lib/gridfinity'
import { downloadPdf, generateLayoutPdf, PAPER_SIZES, type PaperSize } from '~/lib/pdf'
import { downloadProject, parseProject } from '~/lib/project'
import { downloadStl } from '~/lib/stl'
import { validateLayout } from '~/lib/validation'
import { useEditorStore } from '~/stores/editor'

const col = css({ display: 'flex', flexDir: 'column', gap: '2' })
const hiddenInput = css({ display: 'none' })
const issueNote = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1.5',
  fontSize: '12px',
  lineHeight: '15px',
  color: 'warning.fg',
  _icon: { boxSize: '3', flexShrink: '0', mt: 'px' },
})

const paperCollection = createListCollection({
  items: (Object.keys(PAPER_SIZES) as PaperSize[]).map((value) => ({
    value,
    label: `${PAPER_SIZES[value].label} · ${PAPER_SIZES[value].widthMm} × ${PAPER_SIZES[value].heightMm} mm`,
  })),
})

type BusyKind = 'stl' | 'pdf' | null

export function ExportPanel() {
  const tray = useEditorStore((s) => s.tray)
  const tools = useEditorStore((s) => s.tools)
  const loadProject = useEditorStore((s) => s.loadProject)
  const [busy, setBusy] = useState<BusyKind>(null)
  const [paper, setPaper] = useState<PaperSize>('a4')
  const [stats, setStats] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const issues = validateLayout(tray, tools)

  /** Gates exports on layout validation; returns false if the user bails. */
  function confirmIssues(): boolean {
    if (issues.length === 0) return true
    return window.confirm(
      `The layout has ${issues.length} issue(s):\n\n${issues
        .map((i) => `• ${i}`)
        .join('\n')}\n\nExport anyway?`,
    )
  }

  function exportStl() {
    if (!confirmIssues()) return
    setBusy('stl')
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
        setBusy(null)
      }
    }, 10)
  }

  function exportPdf() {
    if (!confirmIssues()) return
    setBusy('pdf')
    setTimeout(() => {
      generateLayoutPdf(tray, tools, { paper })
        .then((bytes) => {
          downloadPdf(bytes, `tooltrace-${tray.widthUnits}x${tray.heightUnits}-print-test.pdf`)
          setStats(`${(bytes.length / 1024).toFixed(1)} KB PDF`)
        })
        .finally(() => setBusy(null))
    }, 10)
  }

  async function onLoadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-loading the same file
    if (!file) return
    try {
      const project = parseProject(await file.text())
      loadProject(project.tray, project.tools)
      setLoadError(null)
      setStats(
        `Loaded "${file.name}" — ${project.tools.length} tool(s), ` +
          `${project.tray.widthUnits}×${project.tray.heightUnits} tray`,
      )
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load that file.')
    }
  }

  return (
    <>
      <Card.Root className={panelRoot}>
        <Card.Header className={panelHeader}>
          <Card.Title>Export</Card.Title>
          <Card.Description>3D-printable bin and 1:1 print-test layout</Card.Description>
        </Card.Header>
        <Card.Body className={cx(col, panelBody)}>
          <Button colorPalette="grass" onClick={exportStl} disabled={busy !== null} className={css({ w: 'full' })}>
            <Download size={16} /> {busy === 'stl' ? 'Building…' : 'Download STL'}
          </Button>

          <Select.Root
            collection={paperCollection}
            value={[paper]}
            onValueChange={(d) => setPaper((d.value[0] as PaperSize) ?? 'a4')}
            size="sm"
          >
            <Select.Label>Paper size</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText />
                <Select.Indicator />
              </Select.Trigger>
            </Select.Control>
            <Select.Positioner>
              <Select.Content>
                {paperCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    <Select.ItemText>{item.label}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
            <Select.HiddenSelect name="paper-size" />
          </Select.Root>

          <Button onClick={exportPdf} disabled={busy !== null} variant="outline" className={css({ w: 'full' })}>
            <Download size={16} /> {busy === 'pdf' ? 'Building…' : 'Download print-test PDF'}
          </Button>

          {issues.length > 0 && (
            <p className={issueNote}>
              <TriangleAlert />
              <span>
                {issues.length} layout issue{issues.length === 1 ? '' : 's'} — see Checks
              </span>
            </p>
          )}
          {stats && (
            <Text textStyle="mono-sm" color="fg.subtle">
              {stats}
            </Text>
          )}
        </Card.Body>
      </Card.Root>

      <Card.Root className={panelRoot}>
        <Card.Header className={panelHeader}>
          <Card.Title>Project</Card.Title>
          <Card.Description>Save or load a local project file</Card.Description>
        </Card.Header>
        <Card.Body className={cx(col, panelBody)}>
          <Button variant="outline" onClick={() => downloadProject(tray, tools)}>
            <FileDown size={14} /> Download project JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <FileUp size={14} /> Load project…
          </Button>
          <input
            ref={fileRef}
            type="file"
            name="project-file"
            accept="application/json,.json"
            className={hiddenInput}
            onChange={onLoadFile}
          />
          {loadError && (
            <Text textStyle="body-sm" color="error.fg">
              {loadError}
            </Text>
          )}
        </Card.Body>
      </Card.Root>
    </>
  )
}
