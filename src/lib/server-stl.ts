import { writeFile } from 'node:fs/promises'
import { createServerFn } from '@tanstack/react-start'

/** Dev/testing helper: saves a base64-encoded STL to a local file. */
export const saveStlFn = createServerFn({ method: 'POST' }).handler(async (ctx: any) => {
  const { b64, path } = ctx.data
  if (typeof b64 !== 'string' || typeof path !== 'string') {
    return { error: 'bad input', b64type: typeof b64, pathType: typeof path, len: b64?.length }
  }
  const buf = Buffer.from(b64, 'base64')
  await writeFile(path, buf)
  return { bytes: buf.length }
})
