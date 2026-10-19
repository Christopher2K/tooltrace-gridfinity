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
  /**
   * Optional curved edges: maps edge index i (vertex i → vertex i+1, wrapping)
   * to a quadratic Bézier control point in tool-local mm.
   */
  curves?: Record<number, Point>
}

export interface TrayConfig {
  /** Gridfinity width in 42 mm units. */
  widthUnits: number
  /** Gridfinity depth in 42 mm units. */
  heightUnits: number
  /** Bin height units (7 mm per unit, Gridfinity spec). */
  heightLevelUnits: number
}

export type ShapeKind = 'rectangle' | 'circle' | 'notch'

interface Snapshot {
  tray: TrayConfig
  tools: ToolTrace[]
}

const HISTORY_LIMIT = 100

interface EditorState {
  tray: TrayConfig
  tools: ToolTrace[]
  selectedToolId: string | null
  /** Position snap increment in mm; 0 = off. */
  snapMm: number
  /** Undo/redo stacks (not persisted). */
  past: Snapshot[]
  future: Snapshot[]

  setTraySize: (widthUnits: number, heightUnits: number) => void
  setTrayConfig: (config: Partial<TrayConfig>) => void
  addTool: (tool: ToolTrace) => void
  setTools: (tools: ToolTrace[]) => void
  /** Replaces tray + tools in one history entry (project file load). */
  loadProject: (tray: TrayConfig, tools: ToolTrace[]) => void
  addShape: (kind: ShapeKind, at?: Point) => void
  updateTool: (id: string, patch: Partial<ToolTrace>) => void
  /** Like updateTool but without recording history — use inside drag gestures. */
  updateToolTransient: (id: string, patch: Partial<ToolTrace>) => void
  /** Records one history entry; call once at the start of a drag gesture. */
  beginTransient: () => void
  removeTool: (id: string) => void
  duplicateTool: (id: string) => void
  rotateTool: (id: string, deltaDeg: number) => void
  flipTool: (id: string, axis: 'x' | 'y') => void
  selectTool: (id: string | null) => void
  setSnapMm: (mm: number) => void
  undo: () => void
  redo: () => void
  reset: () => void
}

const initialTray: TrayConfig = {
  widthUnits: 3,
  heightUnits: 2,
  heightLevelUnits: 3,
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

const snap = (s: Pick<EditorState, 'tray' | 'tools'>): Snapshot => ({
  tray: s.tray,
  tools: s.tools,
})

/** Pushes the current state onto the undo stack and clears redo. */
const record = (s: Pick<EditorState, 'tray' | 'tools' | 'past'>) => ({
  past: [...s.past.slice(-(HISTORY_LIMIT - 1)), snap(s)],
  future: [] as Snapshot[],
})

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      tray: initialTray,
      tools: [],
      selectedToolId: null,
      snapMm: 5,
      past: [],
      future: [],

      setTraySize: (widthUnits, heightUnits) =>
        set((s) => ({ tray: { ...s.tray, widthUnits, heightUnits }, ...record(s) })),
      setTrayConfig: (config) => set((s) => ({ tray: { ...s.tray, ...config }, ...record(s) })),
      addTool: (tool) => set((s) => ({ tools: [...s.tools, tool], ...record(s) })),
      setTools: (tools) => set((s) => ({ tools, selectedToolId: null, ...record(s) })),
      loadProject: (tray, tools) =>
        set((s) => ({ tray, tools, selectedToolId: null, ...record(s) })),
      addShape: (kind, at) =>
        set((s) => {
          const outline = shapeOutlines[kind]()
          const b = bboxOf(outline)
          const trayW = s.tray.widthUnits * GRID_UNIT_MM
          const trayH = s.tray.heightUnits * GRID_UNIT_MM
          const position = at
            ? { x: Math.round((at.x - b.w / 2) * 10) / 10, y: Math.round((at.y - b.h / 2) * 10) / 10 }
            : { x: (trayW - b.w) / 2, y: (trayH - b.h) / 2 }
          const count = s.tools.filter((t) => t.isShape).length + 1
          const tool: ToolTrace = {
            id: crypto.randomUUID(),
            label: `${shapeLabels[kind]} ${count}`,
            outline,
            position,
            rotationDeg: 0,
            toleranceMm: 0,
            pocketDepthMm: 10,
            isShape: true,
          }
          return { tools: [...s.tools, tool], selectedToolId: tool.id, ...record(s) }
        }),
      updateTool: (id, patch) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          ...record(s),
        })),
      updateToolTransient: (id, patch) =>
        set((s) => ({
          tools: s.tools.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      beginTransient: () => set((s) => record(s)),
      removeTool: (id) =>
        set((s) => ({
          tools: s.tools.filter((t) => t.id !== id),
          selectedToolId: s.selectedToolId === id ? null : s.selectedToolId,
          ...record(s),
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
            curves: src.curves ? { ...src.curves } : undefined,
            position: { x: src.position.x + 10, y: src.position.y + 10 },
          }
          return { tools: [...s.tools, copy], selectedToolId: copy.id, ...record(s) }
        }),
      rotateTool: (id, deltaDeg) =>
        set((s) => ({
          tools: s.tools.map((t) =>
            t.id === id ? { ...t, rotationDeg: ((t.rotationDeg + deltaDeg) % 360 + 360) % 360 } : t,
          ),
          ...record(s),
        })),
      flipTool: (id, axis) =>
        set((s) => ({
          tools: s.tools.map((t) => {
            if (t.id !== id) return t
            const b = bboxOf(t.outline)
            const mirror = (p: Point) =>
              axis === 'x' ? { x: b.w - p.x, y: p.y } : { x: p.x, y: b.h - p.y }
            const curves = t.curves
              ? Object.fromEntries(Object.entries(t.curves).map(([k, c]) => [k, mirror(c)]))
              : t.curves
            return { ...t, outline: t.outline.map(mirror), curves }
          }),
          ...record(s),
        })),
      selectTool: (id) => set({ selectedToolId: id }),
      setSnapMm: (mm) => set({ snapMm: mm }),
      undo: () =>
        set((s) => {
          if (s.past.length === 0) return s
          const prev = s.past[s.past.length - 1]
          const selectedAlive = prev.tools.some((t) => t.id === s.selectedToolId)
          return {
            tray: prev.tray,
            tools: prev.tools,
            past: s.past.slice(0, -1),
            future: [snap(s), ...s.future].slice(0, HISTORY_LIMIT),
            selectedToolId: selectedAlive ? s.selectedToolId : null,
          }
        }),
      redo: () =>
        set((s) => {
          if (s.future.length === 0) return s
          const next = s.future[0]
          const selectedAlive = next.tools.some((t) => t.id === s.selectedToolId)
          return {
            tray: next.tray,
            tools: next.tools,
            past: [...s.past.slice(-(HISTORY_LIMIT - 1)), snap(s)],
            future: s.future.slice(1),
            selectedToolId: selectedAlive ? s.selectedToolId : null,
          }
        }),
      reset: () =>
        set((s) => ({
          tray: initialTray,
          tools: [],
          selectedToolId: null,
          snapMm: 5,
          ...record(s),
        })),
    }),
    {
      name: 'tooltrace-editor',
      // History must not be persisted — it would balloon localStorage and
      // restore stale undo stacks across sessions.
      partialize: (s) => ({ tray: s.tray, tools: s.tools, snapMm: s.snapMm }),
    },
  ),
)
