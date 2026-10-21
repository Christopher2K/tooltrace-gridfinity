declare module 'heic-decode' {
  export interface DecodedImage {
    width: number
    height: number
    /** RGBA pixel data, row-major. */
    data: Uint8ClampedArray
  }
  function decode(options: { buffer: ArrayBuffer | Uint8Array }): Promise<DecodedImage>
  export default decode
}
