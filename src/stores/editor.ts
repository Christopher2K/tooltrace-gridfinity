import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bboxOf, circleOutline, notchOutline, rectOutline } from '~/lib/geometry'

/** A 2D point in millimeters, tray coordinate space. */
export interface Point {
  x: number
  y: number
}

/** A detected (or manually drawn) tool outline placed on the tray. */
export interface ToolTrace {
  id: string
  label: string
  /** Closed polygon outline in mm, relative to the tool's origin. */
  outline: Point[]
  /** Position of the tool origin on the tray, in mm. */
  position: Point
  /** Rotation in degrees, about the outline's bbox center. */
  rotationDeg: number
  /** Fit tolerance applied as outline offset, in mm. Default 0.5. */
  toleranceMm: number
  /** Pocket depth in mm. */
  pocketDepthMm: number
  /** True for generated shapes (rect/circle/notch) rather than traced tools. */
  isShape?: boolean
}

export interface TrayConfig {
  /** Gridfinity width in 42 mm units. */
  widthUnits: number
  /** Gridfinity depth in 42 mm units. */
  heightUnits: number
  /** Bin height units (7 mm per unit, Gridfinity spec). */
  heightLevelUnits: number
  /** Magnet holes in the base. */
  magnetHoles: boolean
}

export type ShapeKind = 'rectangle' | 'circle' | 'notch'

interface EditorState {
  tray: TrayConfig
  tools: ToolTrace[]
  selectedToolId: string | null
  /** Position snap increment in mm; 0 = off. */
  snapMm: number

  setTraySize: (widthUnits: number, heightUnits: number) => void
  setTrayConfig: (config: Partial<TrayConfig>) => void
  addTool: (tool: ToolTrace) => void
  setTools: (tools: ToolTrace[]) => void
  addShape: (kind: ShapeKind) => void
  updateTool: (id: string, patch: Partial<ToolTrace>) => void
  removeTool: (id: string) => void
  duplicateTool: (id: string) => void
  rotateTool: (id: string, deltaDeg: number) => void
  flipTool: (id: string, axis: 'x' | 'y') => void
  selectTool: (id: string | null) => void
  setSnapMm: (mm: number) => void
  reset: () => void
}

const initialTray: TrayConfig = {
  widthUnits: 3,
  heightUnits: 2,
  heightLevelUnits: 3,
  magnetHoles: true,
}

const shapeLabels: Record<ShapeKind, string> = {
  rectangle: 'Rectangle',
  circle: 'Circle',
  notch: 'Finger notch',
}

const shapeOutlines: Record<ShapeKind, () => Point[]> = {
  rectangle: () => rectOutline(),
  circle: () => circleOutline(),
  notch: () => notchOutline(),
}

export const GRID_UNIT_MM = 42

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      tray: initialTray,
      tools: [],
      selectedToolId: null,
      snapMm: 5,

      setTraySize: (widthUnits, heightUnits) =>
        set((s) => ({ tray: { ...s.tray, widthUnits, heightUnits } })),
      setTrayConfig: (config) => set((s) => ({ tray: { ...s.tray, ...config } })),
      addTool: (tool) => set((s) => ({ tools: [...s.tools, tool] })),
      setTools: (tools) => set({ tools, selectedToolId: null }),
      addShape: (kind) =>
        set((s) => {
          const outline = shapeOutlines[kind]()
          const b = bboxOf(outline)
          const trayW = s.tray.widthUnits * GRID_UNIT_MM
          const trayH = s.tray.heightUnits * GRID_UNIT_MM
          const count = s.tools.filter((t) => t.isShape).length + 1
          const tool: ToolTrace = {
            id: crypto.randomUUID(),
            label: `${shapeLabels[kind]} ${count}`,
            outline,
            position: { x: (trayW - b.w) / 2, y: (trayH - b.h) / 2 },
            rotationDeg: 0,
            toleranceMm: 0,
            pocketDepthMm: 10,
            isShape: true,
          }
          return { tools: [...s.tools, tool], selectedToolId: tool.id }
        }),
      updateTool: (id, patch) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTool: (id) =>
        set((s) => ({
          tools: s.tools.filter((t) => t.id !== id),
          selectedToolId: s.selectedToolId === id ? null : s.selectedToolId,
        })),
      duplicateTool: (id) =>
        set((s) => {
          const src = s.tools.find((t) => t.id === id)
          if (!src) return s
          const copy: ToolTrace = {
            ...src,
            id: crypto.randomUUID(),
            label: `${src.label} copy`,
            outline: src.outline.map((p) => ({ ...p })),
            position: { x: src.position.x + 10, y: src.position.y + 10 },
          }
          return { tools: [...s.tools, copy], selectedToolId: copy.id }
        }),
      rotateTool: (id, deltaDeg) =>
        set((s) => ({
          tools: s.tools.map((t) =>
            t.id === id ? { ...t, rotationDeg: ((t.rotationDeg + deltaDeg) % 360 + 360) % 360 } : t,
          ),
        })),
      flipTool: (id, axis) =>
        set((s) => ({
          tools: s.tools.map((t) => {
            if (t.id !== id) return t
            const b = bboxOf(t.outline)
            return {
              ...t,
              outline: t.outline.map((p) =>
                axis === 'x' ? { x: b.w - p.x, y: p.y } : { x: p.x, y: b.h - p.y },
              ),
            }
          }),
        })),
      selectTool: (id) => set({ selectedToolId: id }),
      setSnapMm: (mm) => set({ snapMm: mm }),
      reset: () => set({ tray: initialTray, tools: [], selectedToolId: null, snapMm: 5 }),
    }),
    { name: 'tooltrace-editor' },
  ),
)
