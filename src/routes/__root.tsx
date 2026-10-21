/// <reference types="vite/client" />
import { HeadContent, Link, Scripts, createRootRoute, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Menu as MenuIcon } from 'lucide-react'
import * as React from 'react'
import { css } from '~/styled-system/css'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { IconButton, Menu } from '~/components/ui'
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

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/new', label: 'New Trace' },
  { to: '/edit', label: 'Editor' },
] as const

function RootDocument({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className={css({ display: 'flex', flexDir: 'column', minH: '[100dvh]' })}>
        <header
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            px: { base: '3', sm: '4' },
            py: '3',
            borderBottomWidth: '1px',
            borderColor: 'border',
          })}
        >
          <span className={css({ fontWeight: 'bold', mr: '4' })}>🔧 Tooltrace</span>
          {/* Inline nav from `sm` up; hamburger menu below that. */}
          <nav className={css({ display: { base: 'none', sm: 'flex' }, gap: '1' })}>
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
          <div className={css({ display: { base: 'block', sm: 'none' }, ml: 'auto' })}>
            <Menu.Root onSelect={(d) => navigate({ to: d.value as '/' | '/new' | '/edit' })}>
              <Menu.Trigger asChild>
                <IconButton variant="plain" aria-label="Open navigation menu">
                  <MenuIcon size={20} />
                </IconButton>
              </Menu.Trigger>
              <Menu.Positioner>
                <Menu.Content>
                  {NAV_ITEMS.map((item) => (
                    <Menu.Item key={item.to} value={item.to}>
                      {item.label}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Menu.Root>
          </div>
        </header>
        <main className={css({ flex: '1', minH: '0', display: 'flex', flexDir: 'column', p: { base: '3', sm: '4' } })}>
          {children}
        </main>
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  )
}
