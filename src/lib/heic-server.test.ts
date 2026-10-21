import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { convertHeicToJpeg } from '~/lib/heic-server'

describe('convertHeicToJpeg (server, libheif 1.19 + sharp)', () => {
  it('decodes a real HEIC file and re-encodes as JPEG', async () => {
    const heic = await readFile(join(__dirname, '__fixtures__', 'scan.heic'))
    const jpeg = await convertHeicToJpeg(new Uint8Array(heic))
    // JPEG magic bytes
    expect(jpeg[0]).toBe(0xff)
    expect(jpeg[1]).toBe(0xd8)
    expect(jpeg[jpeg.length - 2]).toBe(0xff)
    expect(jpeg[jpeg.length - 1]).toBe(0xd9)
    expect(jpeg.length).toBeGreaterThan(1000)
  })

  it('rejects garbage input with a useful error', async () => {
    await expect(convertHeicToJpeg(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow()
  })
})
