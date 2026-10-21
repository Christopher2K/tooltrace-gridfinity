/**
 * HEIC/HEIF support: iPhones shoot HEIC by default ("High Efficiency" mode), and no
 * browser except Safari can decode it. Conversion happens on the app server
 * (POST /api/convert-heic, modern libheif 1.19) — when self-hosted, photos never
 * leave the owner's machine. If the browser can decode the file natively we skip
 * the roundtrip entirely.
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

/** Extract a readable message from whatever a decoder throws (often {code, message} objects). */
function describeError(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e) return String((e as { message: unknown }).message)
  return String(e)
}

/**
 * Returns the input unchanged when the browser can decode it directly; otherwise
 * sends it to the app server for HEIC → JPEG conversion and returns the JPEG File.
 */
export async function convertIfHeic(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  // Native decode probe (Safari on Apple platforms reads HEIC system-wide).
  try {
    const probe = await createImageBitmap(file)
    probe.close()
    return file
  } catch {
    // expected on Chrome/Firefox — convert server-side
  }

  const name = file.name.replace(/\.[^.]*$/, '') || 'photo'
  let res: Response
  try {
    res = await fetch('/api/convert-heic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: file,
    })
  } catch (e) {
    throw new Error(`Could not reach the conversion server (${describeError(e)}).`)
  }
  if (!res.ok) {
    let detail = `HTTP ${res.status}`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) detail = body.error
    } catch {
      /* non-JSON error body */
    }
    throw new Error(
      `Could not convert this HEIC photo (${detail}). ` +
        'On iPhone, try Settings → Camera → Formats → Most Compatible, or retake the photo as JPEG.',
    )
  }
  const blob = await res.blob()
  return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
}
