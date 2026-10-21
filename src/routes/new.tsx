import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Camera, Crosshair, FileDown, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { css } from '~/styled-system/css'
import { Button, Card, FileUpload, Heading, Slider, Spinner, Switch, Text } from '~/components/ui'
import { downloadPdf, type PaperSize } from '~/lib/pdf'
import { generateTemplatePdf } from '~/lib/template'
import { convertIfHeic } from '~/lib/heic'
import { detectInScan, prepareScan, setTemplatePaperSize, type PreparedScan, type QuadSource } from '~/lib/vision'
import type { Point, ToolTrace } from '~/stores/editor'
import { useEditorStore } from '~/stores/editor'

export const Route = createFileRoute('/new')({
  component: NewTrace,
})

const overlayPoly = css({ fill: 'grass.a3', stroke: 'grass.9' })

const quadSourceLabel: Record<QuadSource, string> = {
  markers: 'Calibrated via printed markers ✓',
  paper: 'Calibrated via paper edges (markers not found)',
  manual: 'Calibrated via manually picked corners',
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
  const setTools = useEditorStore((s) => s.setTools)
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)
  const detectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function runDetection(file: File, manualQuad?: Point[]) {
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
      const prepared = await prepareScan(converted, manualQuad ? { manualQuad } : {})
      const { tools, toolMaskUrl } = detectInScan(prepared)
      if (tools.length === 0) {
        throw new Error('No tools detected. Use a plain white sheet and dark, contrasting tools.')
      }
      setScan(prepared)
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
    if (detected.length === 0) return
    setTools(detected)
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

  return (
    <div className={css({ display: 'flex', flexDir: 'column', gap: '6', maxW: '3xl', mx: 'auto', w: 'full', py: { base: '4', sm: '8' } })}>
      <Heading textStyle={{ base: '2xl', sm: '3xl' }}>New trace</Heading>

      {!scan && !manual && (
        <>
          <Text color="fg.muted">
            Place your tools on a white A4/Letter sheet (darker desk underneath), take a top-down
            photo, and upload it. The app will rectify the image, calibrate scale, and detect tool
            outlines.
          </Text>

          <Card.Root>
            <Card.Header>
              <Card.Title>Upload photo</Card.Title>
              <Card.Description>JPG, PNG or HEIC, taken straight from above</Card.Description>
            </Card.Header>
            <Card.Body className={css({ display: 'flex', flexDir: 'column', gap: '3' })}>
              <FileUpload.Root
                maxFiles={1}
                accept={['image/jpeg', 'image/png', 'image/heic', 'image/heif']}
                onFileAccept={(details) => {
                  const file = details.files[0]
                  if (file) runDetection(file)
                }}
              >
                <FileUpload.Dropzone className={css({ cursor: 'pointer', minH: { base: '32', sm: 'auto' } })}>
                  <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', color: 'fg.muted' })}>
                    {processing && <Spinner size="sm" />}
                    <Text color="fg.muted">
                      {processing
                        ? converting
                          ? 'Converting HEIC photo…'
                          : 'Detecting tools…'
                        : 'Drag & drop your photo here, or click to browse'}
                    </Text>
                  </div>
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

              {/* Mobile-first path: straight to the camera. On desktop this opens a file picker. */}
              <Button variant="outline" disabled={processing} onClick={() => cameraRef.current?.click()}>
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

              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap', alignItems: 'center' })}>
                <Text textStyle="xs" color="fg.subtle">
                  Best results with the reference sheet:
                </Text>
                <Button size="xs" variant="plain" onClick={() => downloadTemplate('a4')}>
                  <FileDown size={14} /> A4 PDF
                </Button>
                <Button size="xs" variant="plain" onClick={() => downloadTemplate('letter')}>
                  <FileDown size={14} /> Letter PDF
                </Button>
              </div>
            </Card.Body>
          </Card.Root>
        </>
      )}

      {manual && (
        <Card.Root>
          <Card.Header>
            <Card.Title>Pick the 4 paper corners</Card.Title>
            <Card.Description>
              Tap the corners of the sheet in any order — {manual.points.length}/4 placed
            </Card.Description>
          </Card.Header>
          <Card.Body className={css({ display: 'flex', flexDir: 'column', gap: '3' })}>
            <div className={css({ position: 'relative', borderWidth: '1px', borderColor: 'border', borderRadius: 'l2', overflow: 'hidden' })}>
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
                      textStyle: 'xs',
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
      )}

      {scan && (
        <>
          <Card.Root>
            <Card.Header>
              <Card.Title>Detected tools: {detected.length}</Card.Title>
              <Card.Description>
                {quadSourceLabel[scan.quadSource]} · {scan.paperSizeMm.width} × {scan.paperSizeMm.height} mm —
                adjust sensitivity until every tool is outlined, then continue to the editor.
              </Card.Description>
            </Card.Header>
            <Card.Body className={css({ display: 'flex', flexDir: 'column', gap: '4' })}>
              {/* Rectified scan with detected outlines overlayed */}
              <div className={css({ position: 'relative', borderWidth: '1px', borderColor: 'border', borderRadius: 'l2', overflow: 'hidden' })}>
                <img
                  src={showMask && maskUrl ? maskUrl : scan.rectifiedImageUrl}
                  alt="Rectified scan with detected tool outlines"
                  className={css({ display: 'block', w: 'full', h: 'auto' })}
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
                  <Slider.ValueText />
                </div>
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0} />
                </Slider.Control>
              </Slider.Root>
              <Text textStyle="xs" color="fg.subtle">
                Raise sensitivity to catch lighter tools, lower it if shadows or paper texture get
                detected.
              </Text>

              <div className={css({ display: 'flex', gap: '6', flexWrap: 'wrap' })}>
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
              </div>

              <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
                <Button onClick={openEditor} disabled={detected.length === 0}>
                  Open editor with {detected.length} tool{detected.length === 1 ? '' : 's'}
                </Button>
                <Button variant="outline" onClick={reset}>
                  <RotateCcw size={14} /> Try another photo
                </Button>
              </div>
              {detected.length === 0 && (
                <Text textStyle="sm" color="error">
                  Nothing detected at this sensitivity — adjust the slider or retake the photo.
                </Text>
              )}
            </Card.Body>
          </Card.Root>
        </>
      )}

      {error && (
        <div className={css({ display: 'flex', flexDir: 'column', gap: '2' })}>
          <Text color="error" textStyle="sm">
            {error}
          </Text>
          {lastFile && !manual && (
            <div>
              <Button size="sm" variant="outline" onClick={startManualPick}>
                <Crosshair size={14} /> Pick the paper corners manually
              </Button>
            </div>
          )}
        </div>
      )}

      <Text textStyle="sm" color="fg.subtle">
        Detection runs locally in your browser — no photo is uploaded anywhere.
      </Text>
    </div>
  )
}
