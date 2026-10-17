import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  /** Rotation in degrees. */
  rotationDeg: number
  /** Fit tolerance applied as outline offset, in mm. Default 0.5. */
  toleranceMm: number
  /** Pocket depth in mm. */
  pocketDepthMm: number
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

interface EditorState {
  tray: TrayConfig
  tools: ToolTrace[]
  selectedToolId: string | null

  setTraySize: (widthUnits: number, heightUnits: number) => void
  setTrayConfig: (config: Partial<TrayConfig>) => void
  addTool: (tool: ToolTrace) => void
  setTools: (tools: ToolTrace[]) => void
  updateTool: (id: string, patch: Partial<ToolTrace>) => void
  removeTool: (id: string) => void
  selectTool: (id: string | null) => void
  reset: () => void
}

const initialTray: TrayConfig = {
  widthUnits: 3,
  heightUnits: 2,
  heightLevelUnits: 3,
  magnetHoles: true,
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      tray: initialTray,
      tools: [],
      selectedToolId: null,

      setTraySize: (widthUnits, heightUnits) =>
        set((s) => ({ tray: { ...s.tray, widthUnits, heightUnits } })),
      setTrayConfig: (config) => set((s) => ({ tray: { ...s.tray, ...config } })),
      addTool: (tool) => set((s) => ({ tools: [...s.tools, tool] })),
      setTools: (tools) => set({ tools, selectedToolId: null }),
      updateTool: (id, patch) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      removeTool: (id) =>
        set((s) => ({
          tools: s.tools.filter((t) => t.id !== id),
          selectedToolId: s.selectedToolId === id ? null : s.selectedToolId,
        })),
      selectTool: (id) => set({ selectedToolId: id }),
      reset: () => set({ tray: initialTray, tools: [], selectedToolId: null }),
    }),
    { name: 'tooltrace-editor' },
  ),
)
