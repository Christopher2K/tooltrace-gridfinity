/**
 * HEIC/HEIF support: iPhones shoot HEIC by default ("High Efficiency" mode), and no browser
 * can decode it natively via createImageBitmap. `heic2any` wraps libheif (WASM) to convert
 * HEIC → JPEG client-side. It is imported dynamically so the WASM only loads when a HEIC
 * file is actually uploaded, and never during SSR.
 */

/** True when the file looks like HEIC/HEIF — by MIME type or, as a fallback, by extension
 * (iOS Safari often reports an empty or generic MIME type for HEIC files). */
export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase()
  if (type === 'image/heic' || type === 'image/heif' || type === 'image/heic-sequence' || type === 'image/heif-sequence') {
    return true
  }
  return /\.hei[cf]$/i.test(file.name)
}

/** Extract a readable message from whatever heic2any throws (often {code, message} objects). */
function describeError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

/**
 * Decode a HEIC via the browser's <img> decoder (Safari on iOS/macOS uses the
 * system decoder here even when createImageBitmap rejects the format) and
 * re-encode as JPEG through a canvas. Also applies EXIF orientation, which
 * heic2any notoriously ignores (sideways photos).
 */
async function decodeViaImageElement(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('image element decode failed'))
      img.src = url
    })
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('image decoded to 0×0')
    // Cap canvas size to avoid memory blowups on 48 MP sensors.
    const maxEdge = 6000
    const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
    if (!blob) throw new Error('canvas JPEG export failed')
    return blob
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Returns the input unchanged when the browser can decode it directly; converts
 * HEIC/HEIF to a JPEG File otherwise.
 *
 * Strategy, in order:
 *  1. createImageBitmap probe — if the browser decodes HEIC natively, keep the
 *     original file (fast path, no quality loss).
 *  2. <img> + canvas JPEG re-encode — Safari's system decoder handles iPhone
 *     grid/tiled HEICs (48 MP) that WASM libheif can't, and applies EXIF rotation.
 *  3. heic2any (WASM libheif) — last resort for Chrome/Firefox; dynamic import
 *     keeps libheif out of the initial bundle and out of SSR.
 */
export async function convertIfHeic(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  // 1. Native decode probe.
  try {
    const probe = await createImageBitmap(file)
    probe.close()
    return file // browser can read it as-is — no conversion needed
  } catch {
    // expected on Chrome/Firefox — fall through
  }

  // 2. <img> decode → JPEG (Safari system decoder; handles grid HEICs).
  let imgErr: unknown = null
  try {
    const blob = await decodeViaImageElement(file)
    const name = file.name.replace(/\.[^.]*$/, '') || 'photo'
    return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
  } catch (e) {
    imgErr = e
  }

  // 3. WASM conversion via heic2any.
  const { default: heic2any } = await import('heic2any')
  let converted: Blob | Blob[]
  try {
    converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  } catch (e) {
    throw new Error(
      `Could not convert this HEIC photo (native: ${describeError(imgErr)}; libheif: ${describeError(e)}). ` +
        'On iPhone, try Settings → Camera → Formats → Most Compatible, or retake the photo as JPEG.',
    )
  }

  // heic2any may return an array for multi-image HEIC files — use the first image.
  const blob = Array.isArray(converted) ? converted[0] : converted
  if (!blob) {
    throw new Error('Could not convert this HEIC photo — the file appears to be empty.')
  }

  const name = file.name.replace(/\.[^.]*$/, '') || 'photo'
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}
