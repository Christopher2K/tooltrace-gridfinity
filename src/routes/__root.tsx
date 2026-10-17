/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import * as React from 'react'
import { css } from '~/styled-system/css'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        title: 'Gridfinity Tooltrace — Photo to custom tool inserts',
      },
      {
        name: 'description',
        content:
          'Snap a photo of your tools and generate custom Gridfinity bin inserts. Export STL and print-test PDFs.',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
})

const navLink = css({
  px: '3',
  py: '1.5',
  borderRadius: 'l2',
  fontWeight: 'medium',
  color: 'fg.muted',
  _hover: { color: 'fg.default', bg: 'gray.a2' },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <header
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: '4',
            py: '3',
            borderBottomWidth: '1px',
            borderColor: 'border',
          })}
        >
          <span className={css({ fontWeight: 'bold', mr: '4' })}>🔧 Tooltrace</span>
          <nav className={css({ display: 'flex', gap: '1' })}>
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: css({ color: 'fg.default' }) }} className={navLink}>
              Home
            </Link>
            <Link to="/new" activeProps={{ className: css({ color: 'fg.default' }) }} className={navLink}>
              New Trace
            </Link>
            <Link to="/edit" activeProps={{ className: css({ color: 'fg.default' }) }} className={navLink}>
              Editor
            </Link>
          </nav>
        </header>
        <main className={css({ p: '4' })}>{children}</main>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
