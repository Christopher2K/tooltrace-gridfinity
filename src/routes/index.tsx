import { Link, createFileRoute } from '@tanstack/react-router'
import { css } from '~/styled-system/css'
import { Button, Card, Heading, Text } from '~/components/ui'

export const Route = createFileRoute('/')({
  component: Home,
})

const stepCard = css({ flex: '1', minW: '220px' })

function Home() {
  return (
    <div className={css({ display: 'flex', flexDir: 'column', gap: '8', maxW: '5xl', mx: 'auto', py: '8' })}>
      <section className={css({ textAlign: 'center', display: 'flex', flexDir: 'column', gap: '4', alignItems: 'center' })}>
        <Heading textStyle="4xl">Photo in. Custom insert out.</Heading>
        <Text color="fg.muted" maxW="2xl">
          Snap a photo of your tools on a reference sheet, auto-detect their outlines, arrange them
          in a tray, and export a Gridfinity-ready STL or a 1:1 print-test PDF.
        </Text>
        <Button size="xl" asChild>
          <Link to="/new">Start a new trace</Link>
        </Button>
      </section>

      <section className={css({ display: 'flex', gap: '4', flexWrap: 'wrap' })}>
        <Card.Root className={stepCard}>
          <Card.Header>
            <Card.Title>1. Snap a photo</Card.Title>
          </Card.Header>
          <Card.Body>
            <Text color="fg.muted">Place tools on the printed reference sheet and upload a top-down photo.</Text>
          </Card.Body>
        </Card.Root>
        <Card.Root className={stepCard}>
          <Card.Header>
            <Card.Title>2. Arrange</Card.Title>
          </Card.Header>
          <Card.Body>
            <Text color="fg.muted">Auto-detected outlines become draggable pockets. Set depths and spacing.</Text>
          </Card.Body>
        </Card.Root>
        <Card.Root className={stepCard}>
          <Card.Header>
            <Card.Title>3. Export</Card.Title>
          </Card.Header>
          <Card.Body>
            <Text color="fg.muted">Download an STL for your printer and a 1:1 PDF to test-fit on paper first.</Text>
          </Card.Body>
        </Card.Root>
      </section>
    </div>
  )
}
