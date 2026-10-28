/**
 * Central SEO / social metadata.
 *
 * Set `VITE_SITE_URL` at build time to the production origin
 * (e.g. `https://tooltrace.app`) — canonical URLs, Open Graph tags,
 * robots.txt and sitemap.xml all derive from it. See `.env.example`.
 */

const envSiteUrl =
  (typeof import.meta.env !== 'undefined' ? (import.meta.env.VITE_SITE_URL as string | undefined) : undefined) ??
  (typeof process !== 'undefined' ? process.env.VITE_SITE_URL : undefined)

/** Production origin (Coolify deployment), no trailing slash. */
export const SITE_URL = (envSiteUrl ?? 'https://tooltrace.instance1.coolsrv.dev').replace(/\/+$/, '')

export const SITE_NAME = 'Gridfinity Tooltrace'
export const SITE_TITLE = 'Gridfinity Tooltrace — Photo to custom tool inserts'
export const SITE_DESCRIPTION =
  'Snap a photo of your tools and generate custom Gridfinity bin inserts. Export STL and print-test PDFs. Local-only, no account needed.'

export const OG_IMAGE = {
  path: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Tooltrace: turn a top-down photo of your tools into a custom Gridfinity bin insert',
} as const

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

type MetaTag = Record<string, string>

/**
 * Open Graph + Twitter Card tags shared by every page. Canonical is returned
 * separately so only indexable routes emit it (see the `/` route).
 */
export function socialTags(path = '/'): { meta: MetaTag[]; canonical: { rel: string; href: string } } {
  const url = absoluteUrl(path)
  const image = absoluteUrl(OG_IMAGE.path)
  return {
    meta: [
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: String(OG_IMAGE.width) },
      { property: 'og:image:height', content: String(OG_IMAGE.height) },
      { property: 'og:image:alt', content: OG_IMAGE.alt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: OG_IMAGE.alt },
    ],
    canonical: { rel: 'canonical', href: url },
  }
}
