import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { css, cx } from '~/styled-system/css'
import { EditorCanvas } from '~/components/editor/canvas'
import { ExportPanel } from '~/components/editor/export-panel'
import { ToolsPanel } from '~/components/editor/tools-panel'
import { TrayPanel } from '~/components/editor/tray-panel'
import { ValidationPanel } from '~/components/editor/validation-panel'
import { GRID_UNIT_MM, useEditorStore } from '~/stores/editor'

export const Route = createFileRoute('/edit')({
  head: () => ({
    meta: [
      { title: 'Editor — Gridfinity Tooltrace' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: Editor,
})

const metaPill = css({
  display: 'inline-flex',
  alignItems: 'center',
  px: '2.5',
  py: '1',
  borderRadius: 'l2',
  fontFamily: 'mono',
  lineHeight: '13px',
  whiteSpace: 'nowrap',
})

function Editor() {
  const tray = useEditorStore((s) => s.tray)
  const tools = useEditorStore((s) => s.tools)
  const snapMm = useEditorStore((s) => s.snapMm)

  const trayW = tray.widthUnits * GRID_UNIT_MM
  const trayH = tray.heightUnits * GRID_UNIT_MM
  const binHeightMm = Math.round((tray.heightLevelUnits * 7 + 4.4) * 10) / 10

  // Keyboard shortcuts: Delete removes selection, arrows nudge it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      const s = useEditorStore.getState()
      // Undo / redo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        s.redo()
        return
      }
      const tool = s.tools.find((t) => t.id === s.selectedToolId)
      if (!tool) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        s.removeTool(tool.id)
        return
      }
      const step = s.snapMm > 0 ? s.snapMm : 1
      const deltas: Record<string, { x: number; y: number }> = {
        ArrowLeft: { x: -step, y: 0 },
        ArrowRight: { x: step, y: 0 },
        ArrowUp: { x: 0, y: -step },
        ArrowDown: { x: 0, y: step },
      }
      const d = deltas[e.key]
      if (d) {
        e.preventDefault()
        s.updateTool(tool.id, { position: { x: tool.position.x + d.x, y: tool.position.y + d.y } })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        flex: { lg: '1' },
        minH: { lg: '0' },
        // Bleed past main padding so the status bar spans the full width.
        m: { base: '-3', sm: '-4' },
      })}
    >
      <div
        className={css({
          display: 'grid',
          gap: '4',
          p: { base: '3', sm: '4' },
          // Desktop: items stretch to the single grid row; each region then
          // scrolls independently (minH: 0 + overflowY) instead of growing
          // the page.
          alignItems: { base: 'start', lg: 'stretch' },
          // Desktop: tray | canvas | side panels, filling the viewport height.
          // Below lg: single column with the canvas first, panels stacked underneath.
          gridTemplateColumns: { base: '1fr', lg: '240px minmax(0, 1fr) 300px' },
          gridTemplateRows: { lg: 'minmax(0, 1fr)' },
          flex: { lg: '1' },
          minH: { lg: '0' },
        })}
      >
        <div className={css({ minH: { lg: '0' }, overflowY: { lg: 'auto' }, order: { base: '4', lg: '0' } })}>
          <TrayPanel />
        </div>
        {/* Canvas first on mobile via `order`; middle column at lg (DOM order). */}
        <div
          className={css({
            order: { base: '-1', lg: '0' },
            alignSelf: { lg: 'stretch' },
            minW: '0',
            minH: { lg: '0' },
            h: { lg: 'full' },
          })}
        >
          <EditorCanvas />
          {/* Tray meta pills — mobile only (desktop has the tray panel + status bar) */}
          <div className={css({ display: { base: 'flex', lg: 'none' }, gap: '2', mt: '2', flexWrap: 'wrap' })}>
            <span className={cx(metaPill, css({ bg: 'bg.surface', borderWidth: '1px', borderColor: 'border.strong', fontSize: '10px', color: 'fg.default' }))}>
              {tray.widthUnits} × {tray.heightUnits} · {trayW} × {trayH} MM
            </span>
            <span className={cx(metaPill, css({ bg: 'bg.subtle', fontSize: '11px', color: 'fg.muted' }))}>
              {binHeightMm} mm tall
            </span>
            <span className={cx(metaPill, css({ bg: 'bg.subtle', fontSize: '11px', color: 'fg.muted' }))}>
              {snapMm > 0 ? `snap ${snapMm}` : 'snap off'}
            </span>
          </div>
        </div>
        <div
          className={css({
            display: 'flex',
            flexDir: 'column',
            gap: '4',
            minH: { lg: '0' },
            overflowY: { lg: 'auto' },
            // Don't let the cards shrink-and-clip inside the constrained
            // column; keep natural height so the column itself scrolls.
            '& > *': { flexShrink: { lg: 0 } },
          })}
        >
          <ExportPanel />
          <ToolsPanel />
          <ValidationPanel />
        </div>
      </div>

      {/* Status bar — desktop only */}
      <footer
        className={css({
          display: { base: 'none', lg: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: '0',
          h: '8',
          px: '4',
          bg: 'bg.surface',
          borderTopWidth: '1px',
          borderColor: 'border',
          fontFamily: 'mono',
          fontSize: '10px',
          lineHeight: '13px',
          letterSpacing: '0.04em',
          color: 'fg.subtle',
        })}
      >
        <span>
          {trayW} × {trayH} MM · {binHeightMm} MM TALL · {snapMm > 0 ? `SNAP ${snapMm} MM` : 'SNAP OFF'} ·{' '}
          {tools.length} TOOL{tools.length === 1 ? '' : 'S'}
        </span>
        <span>⌘Z UNDO · DEL REMOVE · ARROWS NUDGE 1 MM</span>
      </footer>
    </div>
  )
}
