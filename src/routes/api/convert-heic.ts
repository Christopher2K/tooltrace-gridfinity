import { createFileRoute } from '@tanstack/react-router'

/** Max upload size: 64 MB (48 MP HEICs are typically 3–8 MB). */
const MAX_BYTES = 64 * 1024 * 1024

export const Route = createFileRoute('/api/convert-heic')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = new Uint8Array(await request.arrayBuffer())
        if (body.length === 0) {
          return Response.json({ error: 'Empty request body' }, { status: 400 })
        }
        if (body.length > MAX_BYTES) {
          return Response.json({ error: 'File too large' }, { status: 413 })
        }
        try {
          const { convertHeicToJpeg } = await import('~/lib/heic-server')
          const jpeg = await convertHeicToJpeg(body)
          return new Response(jpeg, {
            headers: {
              'Content-Type': 'image/jpeg',
              'Cache-Control': 'no-store',
            },
          })
        } catch (e) {
          const detail = e instanceof Error ? e.message : String(e)
          return Response.json({ error: `HEIC conversion failed: ${detail}` }, { status: 422 })
        }
      },
    },
  },
})
