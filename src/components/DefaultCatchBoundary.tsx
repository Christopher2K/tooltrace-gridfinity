import { ErrorComponent, Link, useLocation, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { css } from '~/styled-system/css'
import { Button } from '~/components/ui'

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useLocation({
    select: (location) => location.pathname === '/',
  })

  console.error('DefaultCatchBoundary Error:', error)

  return (
    <div
      className={css({
        minW: '0',
        flex: '1',
        p: '4',
        display: 'flex',
        flexDir: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6',
      })}
    >
      <ErrorComponent error={error} />
      <div className={css({ display: 'flex', gap: '2', alignItems: 'center', flexWrap: 'wrap' })}>
        <Button variant="outline" onClick={() => router.invalidate()}>
          Try again
        </Button>
        {isRoot ? (
          <Button asChild>
            <Link to="/">Home</Link>
          </Button>
        ) : (
          <Button
            asChild
            onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }}
          >
            <Link to="/">Go back</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
