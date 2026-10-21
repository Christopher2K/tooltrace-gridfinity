import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Camera } from 'lucide-react'
import { useRef, useState } from 'react'
import { css } from '~/styled-system/css'
import { Button, Card, FileUpload, Heading, Spinner, Text } from '~/components/ui'
import { detectTools } from '~/lib/vision'
import { useEditorStore } from '~/stores/editor'

export const Route = createFileRoute('/new')({
  component: NewTrace,
})

function NewTrace() {
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setTools = useEditorStore((s) => s.setTools)
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    setProcessing(true)
    setError(null)
    try {
      const result = await detectTools(file)
      if (result.tools.length === 0) {
        throw new Error('No tools detected. Use a plain white sheet and dark, contrasting tools.')
      }
      setTools(result.tools)
      navigate({ to: '/edit' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Detection failed.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className={css({ display: 'flex', flexDir: 'column', gap: '6', maxW: '3xl', mx: 'auto', w: 'full', py: { base: '4', sm: '8' } })}>
      <Heading textStyle={{ base: '2xl', sm: '3xl' }}>New trace</Heading>
      <Text color="fg.muted">
        Place your tools on a white A4/Letter sheet (darker desk underneath), take a top-down
        photo, and upload it. The app will rectify the image, calibrate scale, and detect tool
        outlines.
      </Text>

      <Card.Root>
        <Card.Header>
          <Card.Title>Upload photo</Card.Title>
          <Card.Description>JPG or PNG, taken straight from above</Card.Description>
        </Card.Header>
        <Card.Body className={css({ display: 'flex', flexDir: 'column', gap: '3' })}>
          <FileUpload.Root
            maxFiles={1}
            accept={['image/jpeg', 'image/png']}
            onFileAccept={(details) => {
              const file = details.files[0]
              if (file) processFile(file)
            }}
          >
            <FileUpload.Dropzone className={css({ cursor: 'pointer', minH: { base: '32', sm: 'auto' } })}>
              <div className={css({ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2', color: 'fg.muted' })}>
                {processing && <Spinner size="sm" />}
                <Text color="fg.muted">
                  {processing ? 'Detecting tools…' : 'Drag & drop your photo here, or click to browse'}
                </Text>
              </div>
            </FileUpload.Dropzone>
            <FileUpload.ItemGroup>
              <FileUpload.Context>
                {({ acceptedFiles }) =>
                  acceptedFiles.map((file) => (
                    <FileUpload.Item key={file.name} file={file}>
                      <FileUpload.ItemPreviewImage />
                      <FileUpload.ItemName />
                      <FileUpload.ItemSizeText />
                      <FileUpload.ItemDeleteTrigger />
                    </FileUpload.Item>
                  ))
                }
              </FileUpload.Context>
            </FileUpload.ItemGroup>
            <FileUpload.HiddenInput />
          </FileUpload.Root>

          {/* Mobile-first path: straight to the camera. On desktop this opens a file picker. */}
          <Button variant="outline" disabled={processing} onClick={() => cameraRef.current?.click()}>
            <Camera size={16} /> Take photo
          </Button>
          <input
            ref={cameraRef}
            type="file"
            name="camera-capture"
            accept="image/*"
            capture="environment"
            className={css({ display: 'none' })}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (file) processFile(file)
            }}
          />
        </Card.Body>
      </Card.Root>

      {error && (
        <Text color="error" textStyle="sm">
          {error}
        </Text>
      )}

      <Text textStyle="sm" color="fg.subtle">
        Detection runs locally in your browser — no photo is uploaded anywhere.
      </Text>
    </div>
  )
}
