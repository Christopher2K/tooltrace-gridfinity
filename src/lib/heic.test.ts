import { describe, expect, it } from 'vitest'
import { isHeicFile } from '~/lib/heic'

function fakeFile(name: string, type = ''): File {
  return new File([new Uint8Array([0])], name, { type })
}

describe('isHeicFile', () => {
  it('detects HEIC by MIME type', () => {
    expect(isHeicFile(fakeFile('photo.heic', 'image/heic'))).toBe(true)
    expect(isHeicFile(fakeFile('photo.heif', 'image/heif'))).toBe(true)
  })

  it('detects HEIC sequence MIME types', () => {
    expect(isHeicFile(fakeFile('burst.heic', 'image/heic-sequence'))).toBe(true)
    expect(isHeicFile(fakeFile('burst.heif', 'image/heif-sequence'))).toBe(true)
  })

  it('falls back to the file extension when MIME is empty (iOS Safari)', () => {
    expect(isHeicFile(fakeFile('IMG_1234.HEIC'))).toBe(true)
    expect(isHeicFile(fakeFile('IMG_1234.heif', ''))).toBe(true)
  })

  it('falls back to the extension when MIME is generic', () => {
    expect(isHeicFile(fakeFile('photo.heic', 'application/octet-stream'))).toBe(true)
  })

  it('is case-insensitive for both MIME and extension', () => {
    expect(isHeicFile(fakeFile('photo.jpg', 'IMAGE/HEIC'))).toBe(true)
    expect(isHeicFile(fakeFile('PHOTO.HeIc'))).toBe(true)
  })

  it('rejects JPEG and PNG', () => {
    expect(isHeicFile(fakeFile('photo.jpg', 'image/jpeg'))).toBe(false)
    expect(isHeicFile(fakeFile('photo.png', 'image/png'))).toBe(false)
    expect(isHeicFile(fakeFile('photo.jpeg'))).toBe(false)
  })

  it('does not false-positive on extensions that merely contain "hei"', () => {
    expect(isHeicFile(fakeFile('photo.heic.png', 'image/png'))).toBe(false)
    expect(isHeicFile(fakeFile('heights.txt'))).toBe(false)
  })
})
