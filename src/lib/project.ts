import { z } from 'zod'
import type { ToolTrace, TrayConfig } from '~/stores/editor'

/**
 * Local project save/load (spec §2). Projects are plain JSON files; the schema
 * below is the contract — bump PROJECT_FORMAT_VERSION on breaking changes.
 */

export const PROJECT_FORMAT_VERSION = 1

const pointSchema = z.object({ x: z.number(), y: z.number() })

const toolTraceSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  outline: z.array(pointSchema).min(3),
  position: pointSchema,
  rotationDeg: z.number(),
  toleranceMm: z.number().min(0),
  pocketDepthMm: z.number().min(0),
  isShape: z.boolean().optional(),
  // JSON object keys are always strings; converted back to numbers on load.
  curves: z.record(z.string(), pointSchema).optional(),
})

const trayConfigSchema = z.object({
  widthUnits: z.number().int().min(1).max(24),
  heightUnits: z.number().int().min(1).max(24),
  heightLevelUnits: z.number().min(1).max(40),
})

const projectSchema = z.object({
  app: z.literal('tooltrace'),
  version: z.literal(PROJECT_FORMAT_VERSION),
  tray: trayConfigSchema,
  tools: z.array(toolTraceSchema),
})

export interface ProjectData {
  tray: TrayConfig
  tools: ToolTrace[]
}

export function serializeProject(tray: TrayConfig, tools: ToolTrace[]): string {
  return JSON.stringify({ app: 'tooltrace', version: PROJECT_FORMAT_VERSION, tray, tools }, null, 2)
}

/** Parses a project JSON file. Throws an Error with a friendly message. */
export function parseProject(json: string): ProjectData {
  let data: unknown
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const result = projectSchema.safeParse(data)
  if (!result.success) {
    const issue = result.error.issues[0]
    const where = issue?.path.join('.')
    throw new Error(
      'That file is not a valid ToolTrace project' +
        (issue ? ` (${where ? `${where}: ` : ''}${issue.message})` : '.'),
    )
  }
  const { tray, tools } = result.data
  return {
    tray,
    tools: tools.map((t) => ({
      ...t,
      curves: t.curves
        ? Object.fromEntries(Object.entries(t.curves).map(([k, v]) => [Number(k), v]))
        : undefined,
    })),
  }
}

/** Triggers a browser download of the current project as a JSON file. */
export function downloadProject(tray: TrayConfig, tools: ToolTrace[]) {
  const blob = new Blob([serializeProject(tray, tools)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tooltrace-project-${tray.widthUnits}x${tray.heightUnits}.json`
  a.click()
  URL.revokeObjectURL(url)
}
