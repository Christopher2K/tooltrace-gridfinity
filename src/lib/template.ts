import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { mmToPt, PAPER_SIZES, type PaperSize } from '~/lib/pdf'

/**
 * Printable reference sheet with 4 corner fiducial markers.
 *
 * Markers are solid black squares centered MARKER_INSET_MM from each sheet
 * edge; detection (`findMarkerQuad` in vision.ts) looks for their centroids,
 * and the homography maps marker centers — not the paper edges — to the known
 * mm anchor points, so scale is exact even if the paper edges are occluded or
 * the sheet isn't perfectly rectangular in the photo.
 */
export const MARKER_SIZE_MM = 12
/** Distance from sheet edge to marker center. */
export const MARKER_INSET_MM = 16

export async function generateTemplatePdf(paper: PaperSize): Promise<Uint8Array> {
  const { widthMm, heightMm } = PAPER_SIZES[paper]
  const doc = await PDFDocument.create()
  const page = doc.addPage([mmToPt(widthMm), mmToPt(heightMm)])
  const font = await doc.embedFont(StandardFonts.Helvetica)

  const black = rgb(0, 0, 0)
  // Keep annotations light enough to stay above the tool-detection threshold.
  const gray = rgb(0.72, 0.72, 0.72)
  const s = mmToPt(MARKER_SIZE_MM)
  const i = mmToPt(MARKER_INSET_MM)

  // Corner fiducials (quiet zone = white paper around each marker — don't
  // draw anything else near the corners).
  const centers: Array<[number, number]> = [
    [i, i],
    [mmToPt(widthMm) - i, i],
    [mmToPt(widthMm) - i, mmToPt(heightMm) - i],
    [i, mmToPt(heightMm) - i],
  ]
  for (const [cx, cy] of centers) {
    page.drawRectangle({ x: cx - s / 2, y: cy - s / 2, width: s, height: s, color: black })
  }

  // Light 10 cm calibration bar + caption (kept away from corners).
  const barY = mmToPt(12)
  const barX = mmToPt(widthMm / 2 - 50)
  page.drawLine({
    start: { x: barX, y: barY },
    end: { x: barX + mmToPt(100), y: barY },
    thickness: 1.5,
    color: gray,
  })
  page.drawText('100 mm', { x: barX + mmToPt(44), y: barY + mmToPt(3), size: 8, font, color: gray })
  page.drawText(
    `Tooltrace reference sheet — ${PAPER_SIZES[paper].label}. Place tools on this sheet, photograph straight from above.`,
    { x: mmToPt(widthMm / 2 - 88), y: mmToPt(heightMm) - mmToPt(12), size: 8, font, color: gray },
  )

  return doc.save()
}
