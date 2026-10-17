# Product Spec: Gridfinity Tooltrace (working title)

## 1. Overview

**Problem:** Creating custom foam shadowbox inserts or Gridfinity bins requires CAD skills and manual measuring/tracing of each tool.

**Solution:** A web app where users photograph tools on a reference sheet, auto-detect outlines, arrange them in a tray editor, and export ready-to-use files (STL for 3D printing, PDF for print-test layouts).

**Target users:** Makers / 3D printing hobbyists (Gridfinity), workshop organizers, 5S/lean manufacturing users.

## 2. MVP Scope (v1)

**In scope:**
- Photo upload with reference-sheet calibration
- Automatic tool outline detection
- Interactive editor (move/rotate/scale tools, edit outlines, set pocket depth, add simple shapes)
- Gridfinity bin generation → STL export
- Printable layout → PDF export (for paper test-fitting before committing)
- Local project save/load (no accounts in v1)

**Out of scope (v2+):** accounts/billing, community sharing, tool database, foam ordering, DXF/SVG CNC export, multi-layer foam.

## 3. User Flow

1. **Capture** — User places tools on an A4/Letter sheet (printed marker template), photographs top-down, uploads.
2. **Calibrate** — App detects the sheet/marker corners → perspective-corrects and establishes mm-per-pixel scale.
3. **Detect** — Segmentation finds each tool; contours extracted, smoothed, simplified. Each becomes a draggable "trace" object.
4. **Edit** — User arranges traces on a tray canvas: move/rotate, nudge outline points, set per-tool pocket depth, add rectangles/circles/finger cutouts, choose Gridfinity grid size.
5. **Generate** — Backend builds a parametric Gridfinity bin with pockets booleaned out.
6. **Export** — Download STL; download PDF of the 1:1 layout for print-testing fit on paper.

## 4. Functional Requirements

### 4.1 Calibration
- Detect printed template (4 corner markers or ArUco-style fiducials).
- Homography to rectify to top-down view; scale from known sheet dimensions.
- Fallback: manual corner picking + manual scale entry (e.g., coin/credit card).

### 4.2 Outline Detection
- Pipeline: rectify → background removal (threshold/grabcut against paper) → contour extraction → polygon simplification (Douglas-Peucker) → smoothing.
- Configurable outline **offset/expansion** (fit tolerance, default ~0.5–1 mm).
- "Detail mode" toggle: higher-fidelity contours vs. simplified.
- Confidence UI: highlight detected tools; user can re-threshold, merge/split, or hand-trace.

### 4.3 Editor
- Canvas (WebGL/Canvas2D) with mm-accurate coordinates.
- Tray config: width/height or Gridfinity units (42 mm grid, standard bin heights).
- Tool objects: translate, rotate, flip, duplicate, delete; per-tool pocket depth (mm); label text.
- Outline editing: drag vertices, smooth, offset slider.
- Shapes: rectangle, circle, finger-notch semicircle.
- Snapping: to grid, to other tools, min-spacing enforcement.
- Validation: tools out of bounds, overlapping pockets, min wall thickness warnings.

### 4.4 Gridfinity Generation
- Parametric bin: base (Zach Freedman spec — 42 mm units, magnet holes optional, stacking lip), walls, and pocket voids = tool outline extruded to pocket depth, offset by tolerance.
- Finger relief optional per pocket.
- Output: single STL (3MF optional later). Server-side generation, job-based (async with progress).

### 4.5 PDF Export
- 1:1 scale vector PDF of tray layout (outlines + labels + depth annotations), tiled across A4/Letter pages with registration marks for large trays.

## 5. Architecture

**Frontend — TanStack Start (React)**
- Routes: `/` landing, `/new` upload+calibrate, `/edit/[project]` editor, `/export`
- Editor canvas: Canvas2D or PixiJS/Konva; state via Zustand; geometry helpers with a polygon lib (e.g., polyclip/flatten-js).

**Backend — TanStack Start server functions (Node)**
- `/api/detect`: accepts rectified image, runs CV, returns polygons. Options: (a) call OpenCV.js in a worker for simple cases, (b) sidecar Python service (FastAPI + OpenCV) for robust segmentation — **recommend Python sidecar**.
- `/api/generate-stl`: takes project JSON (tray dims, polygons, depths) → geometry engine → STL. Options: **CadQuery (Python)** or trimesh + manifold boolean; recommend CadQuery in the same sidecar service.
- `/api/export-pdf`: server-rendered PDF (pdf-lib or reportlab) at true scale.

**Storage (v1):** project JSON + images in browser IndexedDB / local file download; no DB needed until accounts.

**Geometry notes:** All polygon ops in mm, 2D space; pocket = extrude(offset(poly, tolerance), depth) boolean-subtracted from bin solid. Use manifold-kernel or CGAL-backed booleans for reliability.

## 6. Key Risks

| Risk | Mitigation |
|---|---|
| Segmentation accuracy on glossy/dark tools | Manual refine tools; threshold controls; later ML segmentation |
| Mesh booleans failing on complex polygons | Simplify/validate polygons; robust kernel (manifold); fall back to 2.5D heightmap approach |
| STL generation latency | Async job queue; simplify meshes; cache |
| PDF true-scale printing | Embed calibration square; disable "fit to page" guidance |

## 7. Milestones

1. **M1 – Calibration & detection:** template print, upload, rectify, detect, show polygons.
2. **M2 – Editor:** arrange/edit tools, tray config, depths, shapes.
3. **M3 – STL generation:** Gridfinity bin + pockets, download.
4. **M4 – PDF export + polish:** print-test flow, validation, save/load.
