import { Link } from '@tanstack/react-router'
import { css } from '~/styled-system/css'
import { Button, Text } from '~/components/ui'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className={css({ display: 'flex', flexDir: 'column', gap: '4', p: '4' })}>
      <Text color="fg.muted">{children || <p>The page you are looking for does not exist.</p>}</Text>
      <div className={css({ display: 'flex', gap: '2', flexWrap: 'wrap' })}>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go back
        </Button>
        <Button asChild>
          <Link to="/">Start over</Link>
        </Button>
      </div>
    </div>
  )
}
