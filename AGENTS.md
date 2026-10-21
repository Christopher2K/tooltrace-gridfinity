# AGENTS.md

Guidance for AI agents (and humans) working in this repo.

## Project

Gridfinity Tooltrace — a web app that turns a top-down photo of tools on a reference sheet into
custom Gridfinity bin inserts. See `PRODUCT_SPEC.md` for the full product spec, scope, and
milestones (M1–M4).

## Stack

- **Framework:** TanStack Start (React 19, file-based routes in `src/routes`, Vite + Nitro)
- **Styling:** Panda CSS v2 (build-time CSS-in-JS) + Park UI component recipes
- **UI primitives:** Park UI components (`src/components/ui`, built on Ark UI + Lucide icons)
- **Client state:** Zustand (`src/stores/`)
- **CV pipeline:** `src/lib/vision.ts` — pure Canvas2D/JS (Otsu threshold, connected components,
  homography rectify, Moore contour tracing, RDP simplification). No WASM/OpenCV — the bundled
  OpenCV.js builds blocked the main thread indefinitely in this setup. HEIC photos are converted
  server-side (`POST /api/convert-heic`, libheif 1.19 via heic-decode + sharp). A Python CV
  sidecar may be introduced later for harder cases (e.g. cast shadows on the sheet — the
  threshold pipeline can't separate them from dark tools).

## Commands

| Command | Purpose |
|---|---|
| `pnpm dev` | Start dev server (port 3000) |
| `pnpm build` | Production build + typecheck |
| `pnpm codegen` | Regenerate `styled-system` from `panda.config.ts` |
| `pnpm install` | Install dependencies (pnpm only — do not use npm/yarn) |
| `pnpm dlx @park-ui/cli add <component>` | Add a Park UI component (e.g. `button`) |

> **Park UI CLI caveat:** the CLI requires `"baseUrl": "."` in `tsconfig.json`, but TypeScript 7
> (used for typechecking) removed that option. If `@park-ui/cli` refuses to run, temporarily add
> `"baseUrl": "."` back, run it, then remove it again before `pnpm build`.

## Conventions

- **Styling:** always use Panda's `css()` / patterns from `~/styled-system/*` — no inline styles,
  no Tailwind classes, no other CSS-in-JS.
- **Components:** use Park UI components from `~/components/ui` (e.g. `Button`, `Card`,
  `NumberInput`). If a component is missing, add it with the Park UI CLI rather than hand-rolling.
- **Theme:** design tokens live in `src/theme` (Park UI colors: `grass` accent, `sand` gray, `red`).
  After editing `panda.config.ts` or `src/theme`, run `pnpm codegen`.
- **State:** shared client state goes in Zustand stores under `src/stores`. The editor store
  (`src/stores/editor.ts`) is the source of truth for tray config and tool traces; it persists to
  localStorage.
- **Units:** all geometry is in **millimeters**. Gridfinity grid unit = 42 mm.
- **Routes:** file-based in `src/routes`. `src/routeTree.gen.ts` is auto-generated — never edit it.
- **Imports:** use the `~/*` alias for `src/*` (also `~/styled-system/*`).

## Key files

- `panda.config.ts` — Panda + Park UI theme configuration
- `components.json` — Park UI CLI config (aliases into `src/`)
- `src/stores/editor.ts` — editor state model (ToolTrace, TrayConfig)
- `src/lib/vision.ts` — photo → outline detection (pure JS CV)
- `src/lib/geometry.ts` — polygon math (offset, curves, intersection, vertex ops)
- `src/lib/gridfinity.ts` — Gridfinity bin mesh builder (earcut triangulation, no CSG)
- `src/lib/stl.ts` — binary STL writer
- `PRODUCT_SPEC.md` — product requirements and milestones

## Docs for agents

Local copies of LLM-friendly docs live in `docs/llms/`:

- `panda-get-started.md`, `panda-styling.md`, `panda-theming.md`, `panda-reference.md`
- `tanstack-start-index.md`, `tanstack-router-index.md` (indexes — fetch linked pages as needed)

Park UI has no llms.txt; use https://park-ui.com/docs (installation, theming, per-component pages).
