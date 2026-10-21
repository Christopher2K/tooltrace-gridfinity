import decode from 'heic-decode'
import sharp from 'sharp'

/**
 * Server-side HEIC/HEIF → JPEG conversion (POST /api/convert-heic).
 *
 * Why server-side: browsers can't decode HEIC natively (except Safari), and
 * the WASM build bundled with client converters (heic2any) ships libheif 1.12
 * (2019), which fails on modern iPhone grid/tiled HEICs (48 MP sensors).
 * `heic-decode` bundles libheif 1.19 WASM — modern codec support, no native
 * deps. sharp only re-encodes the decoded RGBA to JPEG (prebuilt sharp reads
 * AVIF but NOT HEVC-in-HEIF, so it can't do the decode step itself).
 *
 * Runs wherever the app server runs — when self-hosted, photos never leave
 * the owner's machine.
 */
export async function convertHeicToJpeg(input: Uint8Array): Promise<Buffer> {
  const { width, height, data } = await decode({ buffer: input })
  if (!width || !height || !data?.length) {
    throw new Error('HEIC decoded to an empty image')
  }
  return sharp(Buffer.from(data.buffer, data.byteOffset, data.byteLength), {
    raw: { width, height, channels: 4 },
  })
    .jpeg({ quality: 92 })
    .toBuffer()
}
