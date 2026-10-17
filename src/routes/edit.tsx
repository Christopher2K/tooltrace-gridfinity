import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { css } from '~/styled-system/css'
import { EditorCanvas } from '~/components/editor/canvas'
import { ExportPanel } from '~/components/editor/export-panel'
import { ToolsPanel } from '~/components/editor/tools-panel'
import { TrayPanel } from '~/components/editor/tray-panel'
import { ValidationPanel } from '~/components/editor/validation-panel'
import { useEditorStore } from '~/stores/editor'

export const Route = createFileRoute('/edit')({
  component: Editor,
})

function Editor() {
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
    <div className={css({ display: 'grid', gridTemplateColumns: '240px 1fr 300px', gap: '4', alignItems: 'start' })}>
      <TrayPanel />
      <EditorCanvas />
      <div className={css({ display: 'flex', flexDir: 'column', gap: '4' })}>
        <ExportPanel />
        <ToolsPanel />
        <ValidationPanel />
      </div>
    </div>
  )
}
