import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Camera, Check, Crosshair, FileDown, ImagePlus, Lock, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { css, cx } from '~/styled-system/css'
import { Button, Card, FileUpload, Slider, Spinner, Switch } from '~/components/ui'
import { downloadPdf, type PaperSize } from '~/lib/pdf'
import { generateTemplatePdf } from '~/lib/template'
import { convertIfHeic } from '~/lib/heic'
import { detectInScan, getTemplatePaperSize, prepareScan, setTemplatePaperSize, type PreparedScan, type QuadSource } from '~/lib/vision'
import { bboxOf } from '~/lib/geometry'
import type { Point, ToolTrace } from '~/stores/editor'
import { useEditorStore } from '~/stores/editor'

export const Route = createFileRoute('/new')({
  component: NewTrace,
})

const overlayPoly = css({ fill: 'grass.a3', stroke: 'grass.11' })

const overline = css({ textStyle: 'overline', color: 'grass.11', fontSize: { base: '10px', sm: '11px' } })
const h1 = css({
  textStyle: 'h1',
  fontSize: { base: '24px', sm: '28px' },
  lineHeight: { base: '31px', sm: '36px' },
})

/** Small download chip for the reference-sheet templates. */
function TemplateChip({ paper, label, onClick }: { paper: PaperSize; label: string; onClick: (p: PaperSize) => void }) {
  return (
    <button
      onClick={() => onClick(paper)}
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1',
        h: '[25px]',
        px: '2',
        borderRadius: 'l2',
        borderWidth: '1px',
        borderColor: 'border',
        bg: 'bg.surface',
        fontSize: '12px',
        lineHeight: '15px',
        fontWeight: 'medium',
        color: 'fg.default',
        cursor: 'pointer',
        _hover: { bg: 'gray.a2' },
      })}
    >
      <FileDown size={12} className={css({ color: 'grass.11' })} />
      {label}
    </button>
  )
}

const quadSourceBadge: Record<QuadSource, string> = {
  markers: 'CALIBRATED VIA MARKERS',
  paper: 'CALIBRATED VIA PAPER EDGES',
  manual: 'CALIBRATED VIA MANUAL CORNERS',
}

/** Order 4 clicked points as TL, TR, BR, BL using the sum/diff trick. */
function orderCorners(pts: Point[]): Point[] {
  const bySum = [...pts].sort((a, b) => a.x + a.y - (b.x + b.y))
  const byDiff = [...pts].sort((a, b) => b.x - b.y - (a.x - a.y))
  return [bySum[0], byDiff[0], bySum[3], byDiff[3]]
}

function NewTrace() {
  const [processing, setProcessing] = useState(false)
  const [converting, setConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scan, setScan] = useState<PreparedScan | null>(null)
  const [detected, setDetected] = useState<ToolTrace[]>([])
  const [thresholdOffset, setThresholdOffset] = useState(0)
  const [highDetail, setHighDetail] = useState(false)
  const [showMask, setShowMask] = useState(false)
  const [maskUrl, setMaskUrl] = useState<string | null>(null)
  // Manual corner-picking fallback
  const [manual, setManual] = useState<{ file: File; url: string; points: Point[] } | null>(null)
  const [manualImgSize, setManualImgSize] = useState<{ w: number; h: number } | null>(null)
  const [lastFile, setLastFile] = useState<File | null>(null)
  /** The (possibly HEIC-converted) file behind the current scan — for paper-size re-runs. */
  const [scanFile, setScanFile] = useState<File | null>(null)
  const setTools = useEditorStore((s) => s.setTools)
  const setScanImage = useEditorStore((s) => s.setScanImage)
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)
  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function runDetection(file: File, manualQuad?: Point[], paperSize?: PaperSize) {
    setProcessing(true)
    setError(null)
    setScan(null)
    // HEIC photos (iPhone default) can't be decoded by any browser — convert to JPEG first.
    // Declared outside try so the manual corner-pick fallback can use the converted file too.
    let converted = file
    try {
      setConverting(true)
      converted = await convertIfHeic(file)
      setConverting(false)
      const prepared = await prepareScan(converted, {
        ...(manualQuad ? { manualQuad } : {}),
        ...(paperSize ? { paperSize } : {}),
      })
      const { tools, toolMaskUrl } = detectInScan(prepared)
      if (tools.length === 0) {
        throw new Error('No tools detected. Use a plain white sheet and dark, contrasting tools.')
      }
      setScan(prepared)
      setScanFile(converted)
      setDetected(tools)
      setMaskUrl(toolMaskUrl)
      setThresholdOffset(0)
      setHighDetail(false)
      setManual(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Detection failed.')
      setLastFile(converted)
    } finally {
      setConverting(false)
      setProcessing(false)
    }
  }

  function startManualPick() {
    if (!lastFile) return
    setManual({ file: lastFile, url: URL.createObjectURL(lastFile), points: [] })
    setManualImgSize(null)
    setError(null)
  }

  function onPickPoint(e: React.MouseEvent<HTMLImageElement>) {
    if (!manual || manual.points.length >= 4) return
    const img = e.currentTarget
    const rect = img.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * img.naturalWidth
    const y = ((e.clientY - rect.top) / rect.height) * img.naturalHeight
    setManual({ ...manual, points: [...manual.points, { x, y }] })
  }

  async function downloadTemplate(paper: PaperSize) {
    setTemplatePaperSize(paper)
    const bytes = await generateTemplatePdf(paper)
    downloadPdf(bytes, `tooltrace-reference-sheet-${paper}.pdf`)
  }

  async function changeTemplatePaper(paper: PaperSize) {
    // Tell us which template you printed — re-rectify with the exact sheet dims.
    setTemplatePaperSize(paper)
    if (scanFile && !processing) await runDetection(scanFile, undefined, paper)
  }

  // Re-detect (debounced) whenever the user adjusts sensitivity/detail.
  useEffect(() => {
    if (!scan) return
    if (detectTimer.current) clearTimeout(detectTimer.current)
    detectTimer.current = setTimeout(() => {
      const { tools, toolMaskUrl } = detectInScan(scan, {
        thresholdOffset,
        detailScale: highDetail ? 0.45 : 1,
      })
      setDetected(tools)
      setMaskUrl(toolMaskUrl)
    }, 150)
    return () => {
      if (detectTimer.current) clearTimeout(detectTimer.current)
    }
  }, [scan, thresholdOffset, highDetail])

  function openEditor() {
    if (detected.length === 0 || !scan) return
    setTools(detected)
    setScanImage({ url: scan.rectifiedDataUrl, paperSizeMm: scan.paperSizeMm })
    navigate({ to: '/edit' })
  }

  function reset() {
    setScan(null)
    setDetected([])
    setMaskUrl(null)
    setError(null)
    setManual(null)
    setLastFile(null)
  }

  const mmPerPx = scan?.mmPerPx ?? 1
  const paperLabel = getTemplatePaperSize() === 'a4' ? 'A4' : 'LETTER'

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        flex: '1',
        minH: '0',
        overflowY: 'auto',
        // Bleed past the main padding; the flow centers its own column.
        m: { base: '-3', sm: '-4' },
        p: { base: '5', sm: '6', lg: '12' },
      })}
    >
      {/* ============ Upload state ============ */}
      {!scan && !manual && (
        <div className={css({ display: 'flex', flexDir: 'column', gap: '6', maxW: '[720px]', mx: 'auto', w: 'full' })}>
          <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
            <span className={overline}>STEP 01 · CAPTURE</span>
            <h1 className={h1}>New trace</h1>
            <p className={css({ textStyle: 'body', color: 'fg.muted', display: { base: 'none', sm: 'block' } })}>
              Place your tools on a white A4/Letter sheet with a darker desk underneath, take a
              top-down photo, and upload it.
            </p>
            <p className={css({ textStyle: 'body-sm', color: 'fg.muted', display: { base: 'block', sm: 'none' } })}>
              Tools on a white sheet, darker desk underneath, photo straight from above.
            </p>
          </div>

          <Card.Root>
            <Card.Header>
              <Card.Title>Upload photo</Card.Title>
              <Card.Description>JPG or PNG, taken straight from above</Card.Description>
            </Card.Header>
            <Card.Body>
              <FileUpload.Root
                maxFiles={1}
                accept={['image/jpeg', 'image/png', 'image/heic', 'image/heif']}
                onFileAccept={(details) => {
                  const file = details.files[0]
                  if (file) runDetection(file)
                }}
              >
                <FileUpload.Dropzone className={css({ cursor: 'pointer' })}>
                  {processing ? (
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'fg.muted' })}>
                      <Spinner size="sm" />
                      <span className={css({ textStyle: 'body', color: 'fg.muted' })}>
                        {converting ? 'Converting HEIC photo…' : 'Detecting tools…'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <ImagePlus size={24} className={css({ color: 'grass.11' })} />
                      <span
                        className={css({
                          textStyle: 'body',
                          fontWeight: 'medium',
                          color: 'fg.default',
                          display: { base: 'none', sm: 'block' },
                        })}
                      >
                        Drag & drop your photo here, or click to browse
                      </span>
                      <span
                        className={css({
                          textStyle: 'body',
                          fontWeight: 'medium',
                          color: 'fg.default',
                          display: { base: 'block', sm: 'none' },
                        })}
                      >
                        Tap to browse photos
                      </span>
                      <span
                        className={css({
                          fontFamily: 'mono',
                          fontSize: '10px',
                          lineHeight: '13px',
                          letterSpacing: '0.08em',
                          color: 'fg.subtle',
                          display: { base: 'none', sm: 'block' },
                        })}
                      >
                        JPG / PNG · TOP-DOWN · WHITE SHEET ON DARK DESK
                      </span>
                      <span
                        className={css({
                          fontFamily: 'mono',
                          fontSize: '10px',
                          lineHeight: '13px',
                          letterSpacing: '0.08em',
                          color: 'fg.subtle',
                          display: { base: 'block', sm: 'none' },
                        })}
                      >
                        JPG / PNG · TOP-DOWN
                      </span>
                    </>
                  )}
                </FileUpload.Dropzone>
                <FileUpload.ItemGroup>
                  <FileUpload.Context>
                    {({ acceptedFiles }) =>
                      acceptedFiles.map((file) => (
                        <FileUpload.Item key={file.name} file={file}>
                          <FileUpload.ItemPreviewImage />
                          <FileUpload.ItemName />
                          <FileUpload.ItemSizeText />
                          <FileUpload.ItemDeleteTrigger />
                        </FileUpload.Item>
                      ))
                    }
                  </FileUpload.Context>
                </FileUpload.ItemGroup>
                <FileUpload.HiddenInput />
              </FileUpload.Root>
            </Card.Body>
          </Card.Root>

          <div
            className={css({
              display: 'flex',
              flexDir: { base: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { base: 'stretch', sm: 'center' },
              gap: '3',
              flexWrap: 'wrap',
            })}
          >
            {/* Mobile-first path: straight to the camera. On desktop this opens a file picker. */}
            <Button
              variant="outline"
              disabled={processing}
              onClick={() => cameraRef.current?.click()}
              className={css({ h: { base: '11', sm: '9' } })}
            >
              <Camera size={16} /> Take photo
            </Button>
            <input
              ref={cameraRef}
              type="file"
              name="camera-capture"
              accept="image/*"
              capture="environment"
              className={css({ display: 'none' })}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) runDetection(file)
              }}
            />
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2', flexWrap: 'wrap' })}>
              <span
                className={css({
                  fontFamily: 'mono',
                  fontSize: '10px',
                  lineHeight: '13px',
                  letterSpacing: '0.08em',
                  color: 'fg.subtle',
                })}
              >
                REFERENCE SHEET
              </span>
              <TemplateChip paper="a4" label="A4 PDF" onClick={downloadTemplate} />
              <TemplateChip paper="letter" label="Letter PDF" onClick={downloadTemplate} />
            </div>
          </div>

          <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Lock size={12} className={css({ color: 'fg.subtle', flexShrink: '0' })} />
            <span className={css({ fontSize: '12px', lineHeight: '15px', color: 'fg.subtle', display: { base: 'none', sm: 'block' } })}>
              Detection runs locally in your browser — no photo is uploaded anywhere.
            </span>
            <span className={css({ fontSize: '12px', lineHeight: '15px', color: 'fg.subtle', display: { base: 'block', sm: 'none' } })}>
              No photo leaves your device.
            </span>
          </div>
        </div>
      )}

      {/* ============ Manual corner picking ============ */}
      {manual && (
        <div className={css({ maxW: '[720px]', mx: 'auto', w: 'full' })}>
          <Card.Root>
            <Card.Header>
              <Card.Title>Pick the 4 paper corners</Card.Title>
              <Card.Description>
                Tap the corners of the sheet in any order — {manual.points.length}/4 placed
              </Card.Description>
            </Card.Header>
            <Card.Body>
              <div className={css({ position: 'relative', borderWidth: '1px', borderColor: 'border', borderRadius: 'l3', overflow: 'hidden' })}>
                <img
                  src={manual.url}
                  alt="Uploaded photo — tap the four paper corners"
                  onClick={onPickPoint}
                  onLoad={(e) =>
                    setManualImgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
                  }
                  className={css({ display: 'block', w: 'full', h: 'auto', cursor: 'crosshair' })}
                />
                {manualImgSize &&
                  manual.points.map((p, idx) => (
                    <span
                      key={idx}
                      className={css({
                        position: 'absolute',
                        w: '6',
                        h: '6',
                        borderRadius: 'full',
                        bg: 'grass.9',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textStyle: 'mono-sm',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                      })}
                      style={{
                        left: `${(p.x / manualImgSize.w) * 100}%`,
                        top: `${(p.y / manualImgSize.h) * 100}%`,
                      }}
                    >
                      {idx + 1}
                    </span>
                  ))}
              </div>
              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                <Button
                  size="sm"
                  onClick={() => runDetection(manual.file, orderCorners(manual.points))}
                  disabled={manual.points.length !== 4 || processing}
                >
                  <Crosshair size={14} /> {processing ? 'Detecting…' : 'Detect with these corners'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setManual({ ...manual, points: manual.points.slice(0, -1) })}
                  disabled={manual.points.length === 0}
                >
                  Undo point
                </Button>
                <Button size="sm" variant="plain" onClick={() => setManual(null)}>
                  Cancel
                </Button>
              </div>
            </Card.Body>
          </Card.Root>
        </div>
      )}

      {/* ============ Detection review ============ */}
      {scan && (
        <div className={css({ display: 'flex', flexDir: 'column', gap: { base: '4', lg: '5' }, w: 'full', maxW: '[1320px]', mx: 'auto' })}>
          {/* Title row + calibration badge */}
          <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
            <span className={overline}>STEP 02 · DETECTION</span>
            <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3', flexWrap: 'wrap' })}>
              <h1 className={cx(h1, css({ fontSize: { base: '22px', sm: '28px' }, lineHeight: { base: '28px', sm: '36px' } }))}>
                Review detection
              </h1>
              {/* Compact badge (mobile) */}
              <span
                className={css({
                  display: { base: 'inline-flex', lg: 'none' },
                  alignItems: 'center',
                  gap: '1',
                  px: '2',
                  h: '5',
                  borderRadius: 'l2',
                  bg: 'grass.3',
                  borderWidth: '1px',
                  borderColor: 'grass.7',
                  fontFamily: 'mono',
                  fontSize: '9px',
                  letterSpacing: '0.08em',
                  color: 'grass.11',
                })}
              >
                <Check size={11} /> {paperLabel} CALIBRATED
              </span>
              {/* Full badge (desktop) */}
              <span
                className={css({
                  display: { base: 'none', lg: 'inline-flex' },
                  alignItems: 'center',
                  gap: '1.5',
                  px: '2.5',
                  h: '[23px]',
                  borderRadius: 'l2',
                  bg: 'grass.3',
                  borderWidth: '1px',
                  borderColor: 'grass.7',
                  fontFamily: 'mono',
                  fontSize: '10px',
                  letterSpacing: '0.08em',
                  color: 'grass.11',
                })}
              >
                <Check size={12} /> {quadSourceBadge[scan.quadSource]} · {paperLabel} ·{' '}
                {Math.round(scan.paperSizeMm.width)} × {Math.round(scan.paperSizeMm.height)} MM
              </span>
            </div>
          </div>

          <div className={css({ display: 'flex', flexDir: { base: 'column', lg: 'row' }, gap: { base: '4', lg: '6' }, alignItems: 'stretch' })}>
            {/* Scan view */}
            <div
              className={css({
                position: 'relative',
                flex: '1',
                minW: '0',
                bg: 'canvas.bg',
                borderRadius: 'l3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: { base: '2', sm: '6' },
                h: { base: '[264px]', lg: 'auto' },
                minH: { lg: '[480px]' },
                overflow: 'hidden',
              })}
            >
              <div className={css({ position: 'relative', h: 'full', maxW: 'full' })}>
                <img
                  src={showMask && maskUrl ? maskUrl : scan.rectifiedImageUrl}
                  alt="Rectified scan with detected tool outlines"
                  className={css({ display: 'block', h: 'full', w: 'auto', maxW: 'full', objectFit: 'contain' })}
                />
                <svg
                  viewBox={`0 0 ${scan.width} ${scan.height}`}
                  className={css({ position: 'absolute', inset: '0', w: 'full', h: 'full', pointerEvents: 'none' })}
                >
                  {detected.map((tool) => (
                    <polygon
                      key={tool.id}
                      className={overlayPoly}
                      strokeWidth={scan.width * 0.003}
                      points={tool.outline
                        .map((p) => `${(tool.position.x + p.x) / mmPerPx},${(tool.position.y + p.y) / mmPerPx}`)
                        .join(' ')}
                    />
                  ))}
                </svg>
                {/* Numbered badges at each outline's top-left (percent coords) */}
                {detected.map((tool, i) => {
                  const b = bboxOf(tool.outline)
                  const left = ((tool.position.x + b.x) / scan.paperSizeMm.width) * 100
                  const top = ((tool.position.y + b.y) / scan.paperSizeMm.height) * 100
                  return (
                    <span
                      key={tool.id}
                      className={css({
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        w: '[18px]',
                        h: '[17px]',
                        borderRadius: 'l1',
                        bg: 'grass.9',
                        color: 'fg.inverse',
                        fontFamily: 'mono',
                        fontSize: '10px',
                        transform: 'translate(-35%, -65%)',
                        pointerEvents: 'none',
                      })}
                      style={{ left: `${left}%`, top: `${top}%` }}
                    >
                      {i + 1}
                    </span>
                  )
                })}
              </div>
              {/* Scale pill */}
              <span
                className={css({
                  position: 'absolute',
                  left: '3',
                  bottom: '3',
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: '2.5',
                  py: '1',
                  borderRadius: 'l2',
                  bg: 'bg.surface',
                  borderWidth: '1px',
                  borderColor: 'border.strong',
                  fontFamily: 'mono',
                  fontSize: '10px',
                  lineHeight: '13px',
                  color: 'fg.muted',
                })}
              >
                {mmPerPx.toFixed(3)} mm/px · RECTIFIED
              </span>
            </div>

            {/* Control rail */}
            <Card.Root className={css({ w: { lg: '[340px]' }, flexShrink: { lg: '0' } })}>
              <Card.Header>
                <Card.Title>Detection</Card.Title>
                <Card.Description>Tune until every tool is outlined</Card.Description>
              </Card.Header>
              <Card.Body>
                {/* Stat */}
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '2',
                    pb: { lg: '3' },
                    borderBottomWidth: { lg: '1px' },
                    borderColor: 'border',
                  })}
                >
                  <span
                    className={css({
                      fontFamily: 'mono',
                      fontWeight: 'medium',
                      fontSize: { base: '20px', lg: '32px' },
                      lineHeight: { base: '26px', lg: '42px' },
                      color: 'fg.default',
                    })}
                  >
                    {detected.length}
                  </span>
                  <span className={css({ textStyle: 'body-sm', color: 'fg.muted' })}>tools detected</span>
                </div>

                <Slider.Root
                  value={[thresholdOffset]}
                  min={-40}
                  max={40}
                  step={1}
                  onValueChange={(d) => setThresholdOffset(d.value[0])}
                >
                  <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
                    <Slider.Label>Sensitivity</Slider.Label>
                    <span className={css({ fontFamily: 'mono', fontSize: '12px', lineHeight: '16px', color: 'fg.muted' })}>
                      {thresholdOffset > 0 ? `+${thresholdOffset}` : thresholdOffset}
                    </span>
                  </div>
                  <Slider.Control>
                    <Slider.Track>
                      <Slider.Range />
                    </Slider.Track>
                    <Slider.Thumb index={0} />
                  </Slider.Control>
                </Slider.Root>
                <p className={css({ fontSize: '12px', lineHeight: '17px', color: 'fg.subtle' })}>
                  Raise sensitivity to catch lighter tools; lower it if shadows or paper texture get
                  detected.
                </p>

                <div className={css({ display: 'flex', flexDir: 'column', gap: '2.5' })}>
                  <Switch.Root
                    className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                    checked={highDetail}
                    onCheckedChange={(d) => setHighDetail(d.checked)}
                  >
                    <Switch.Control />
                    <Switch.Label>High detail outlines</Switch.Label>
                    <Switch.HiddenInput />
                  </Switch.Root>
                  <Switch.Root
                    className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                    checked={showMask}
                    onCheckedChange={(d) => setShowMask(d.checked)}
                  >
                    <Switch.Control />
                    <Switch.Label>Show detection mask</Switch.Label>
                    <Switch.HiddenInput />
                  </Switch.Root>
                  {scan.quadSource === 'markers' && (
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <span className={css({ textStyle: 'body-sm', color: 'fg.muted' })}>Printed sheet:</span>
                      {(['a4', 'letter'] as const).map((p) => (
                        <Button
                          key={p}
                          size="xs"
                          variant={getTemplatePaperSize() === p ? 'solid' : 'outline'}
                          disabled={processing}
                          onClick={() => changeTemplatePaper(p)}
                        >
                          {p === 'a4' ? 'A4' : 'Letter'}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
                  <Button
                    colorPalette="grass"
                    onClick={openEditor}
                    disabled={detected.length === 0}
                    className={css({ w: 'full', h: { base: '11', sm: '9' } })}
                  >
                    <ArrowRight size={16} /> Open editor with {detected.length} tool{detected.length === 1 ? '' : 's'}
                  </Button>
                  <Button variant="plain" onClick={reset} className={css({ w: 'full', color: 'fg.muted' })}>
                    <RotateCcw size={16} /> Try another photo
                  </Button>
                  {detected.length === 0 && (
                    <p className={css({ fontSize: '12px', lineHeight: '15px', color: 'error.fg' })}>
                      Nothing detected at this sensitivity — adjust the slider or retake the photo.
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card.Root>
          </div>
        </div>
      )}

      {error && (
        <div className={css({ display: 'flex', flexDir: 'column', gap: '2', maxW: '[720px]', mx: 'auto', w: 'full' })}>
          <p className={css({ textStyle: 'body-sm', color: 'error.fg' })}>{error}</p>
          {lastFile && !manual && (
            <div>
              <Button size="sm" variant="outline" onClick={startManualPick}>
                <Crosshair size={14} /> Pick the paper corners manually
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
