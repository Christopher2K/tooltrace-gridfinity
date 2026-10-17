import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { css } from '~/styled-system/css'
import { Card, FileUpload, Heading, Spinner, Text } from '~/components/ui'
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
    <div className={css({ display: 'flex', flexDir: 'column', gap: '6', maxW: '3xl', mx: 'auto', py: '8' })}>
      <Heading textStyle="3xl">New trace</Heading>
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
        <Card.Body>
          <FileUpload.Root
            maxFiles={1}
            accept={['image/jpeg', 'image/png']}
            onFileAccept={(details) => {
              const file = details.files[0]
              if (file) processFile(file)
            }}
          >
            <FileUpload.Dropzone className={css({ cursor: 'pointer' })}>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'fg.muted' })}>
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
