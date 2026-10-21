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

/** Returns the input unchanged for non-HEIC files; converts HEIC/HEIF to a JPEG File otherwise. */
export async function convertIfHeic(file: File): Promise<File> {
  if (!isHeicFile(file)) return file

  // Dynamic import: keeps the libheif WASM out of the initial bundle and out of SSR.
  const { default: heic2any } = await import('heic2any')

  let converted: Blob | Blob[]
  try {
    converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  } catch {
    throw new Error(
      'Could not convert this HEIC photo. On iPhone, try Settings → Camera → Formats → Most Compatible, or retake the photo as JPEG.'
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
