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
 * Returns the input unchanged when the browser can decode it directly; converts
 * HEIC/HEIF to a JPEG File otherwise.
 *
 * Strategy: try the native decoder FIRST — Safari (iOS/macOS) decodes HEIC via
 * the OS, which is faster and far more tolerant than the bundled WASM libheif.
 * Only when native decoding fails (Chrome/Firefox) do we load heic2any.
 */
export async function convertIfHeic(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  // 1. Native decode (Safari on Apple platforms supports HEIC system-wide).
  try {
    const probe = await createImageBitmap(file)
    probe.close()
    return file // browser can read it as-is — no conversion needed
  } catch {
    // expected on Chrome/Firefox — fall through to WASM conversion
  }

  // 2. WASM conversion via heic2any (dynamic import keeps libheif out of the
  // initial bundle and out of SSR).
  const { default: heic2any } = await import('heic2any')

  let converted: Blob | Blob[]
  try {
    converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  } catch (e) {
    throw new Error(
      `Could not convert this HEIC photo (${describeError(e)}). ` +
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
