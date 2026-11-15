/// <reference types="vite/client" />
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import { HeadContent, Link, Scripts, createRootRoute, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Menu as MenuIcon, Wrench } from 'lucide-react'
import * as React from 'react'
import { css } from '~/styled-system/css'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import { IconButton, Menu } from '~/components/ui'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL, socialTags } from '~/lib/seo'
import appCss from '~/styles/app.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: SITE_TITLE },
      { name: 'description', content: SITE_DESCRIPTION },
      // Matches `theme_color` in site.webmanifest (grass.9).
      { name: 'theme-color', content: '#46A758' },
      // App routes override this with `noindex` (meta dedupes by name).
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      ...socialTags('/').meta,
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml' },
      { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
    scripts: [
      {
        src: 'https://stats.coolsrv.dev/js/script.js',
        defer: true,
        'data-domain': new URL(SITE_URL).hostname,
      },
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
  fontSize: '13px',
  lineHeight: '16px',
  fontWeight: 'medium',
  color: 'fg.muted',
  _hover: { color: 'fg.default' },
  _currentPage: { color: 'fg.default', bg: 'bg.subtle' },
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
      <body className={css({ display: 'flex', flexDir: 'column', h: '[100dvh]' })}>
        <header
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '6',
            px: { base: '4', sm: '6' },
            // Panda's spacing scale skips 13 — explicit px (design: 52 mobile / 56 desktop).
            h: { base: '[52px]', sm: '[56px]' },
            flexShrink: '0',
            bg: 'bg.surface',
            borderBottomWidth: '1px',
            borderColor: 'border',
          })}
        >
          <Link to="/" className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <span
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSize: '6',
                borderRadius: 'l2',
                bg: 'grass.9',
                color: 'fg.inverse',
              })}
            >
              <Wrench size={14} />
            </span>
            <span
              className={css({
                fontFamily: 'display',
                fontSize: '15px',
                lineHeight: '20px',
                fontWeight: 'semibold',
                color: 'fg.default',
              })}
            >
              Tooltrace
            </span>
          </Link>
          {/* Inline nav from `sm` up; hamburger menu below that. */}
          <nav className={css({ display: { base: 'none', sm: 'flex' }, gap: '1' })}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.to === '/' ? { exact: true } : undefined}
                className={navLink}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div
            className={css({
              display: { base: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: '2',
              ml: 'auto',
            })}
          >
            <span className={css({ boxSize: '1.5', borderRadius: 'full', bg: 'grass.9' })} />
            <span
              className={css({
                fontFamily: 'mono',
                fontSize: '10px',
                lineHeight: '13px',
                letterSpacing: '0.08em',
                color: 'fg.subtle',
              })}
            >
              LOCAL-ONLY · NO ACCOUNT
            </span>
          </div>
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
