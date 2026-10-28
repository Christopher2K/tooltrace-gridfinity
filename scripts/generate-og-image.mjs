/**
 * Generates public/og-image.png (1200×630 Open Graph share image).
 * Run with: pnpm og-image
 *
 * Kept as a script (not a build step) so the artwork is easy to tweak
 * and the committed PNG stays a stable, cacheable asset.
 */
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import sharp from 'sharp'

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/og-image.png')

const W = 1200
const H = 630

// Brand tokens (mirrors src/theme: grass accent + slate ramp).
const GRASS = '#46A758'
const INK = '#15181B'
const BODY = '#4A545E'
const MUTED = '#6B7680'
const GRID_LINE = '#E9ECEF'

// Faint 42-unit Gridfinity-style grid as the backdrop.
const gridLines = []
for (let x = 0; x <= W; x += 84) gridLines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`)
for (let y = 0; y <= H; y += 84) gridLines.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`)

// Lucide "wrench" path (24×24 viewBox), scaled into the logo square.
const WRENCH =
  'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z'

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <g stroke="${GRID_LINE}" stroke-width="1">${gridLines.join('')}</g>

  <!-- Detected-contour motif, right side -->
  <g fill="none" stroke="${GRASS}" stroke-width="4" stroke-dasharray="12 9" opacity="0.9">
    <rect x="836" y="128" width="176" height="120" rx="30" transform="rotate(-6 924 188)"/>
    <circle cx="968" cy="392" r="96"/>
  </g>
  <circle cx="968" cy="392" r="96" fill="${GRASS}" opacity="0.08"/>

  <!-- Logo mark -->
  <rect x="96" y="158" width="112" height="112" rx="24" fill="${GRASS}"/>
  <g transform="translate(124 186) scale(2.3333)" fill="none" stroke="#FFFFFF"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="${WRENCH}"/>
  </g>

  <!-- Wordmark + tagline -->
  <text x="240" y="244" font-family="Arial, Helvetica, sans-serif" font-weight="700"
        font-size="64" fill="${INK}">Tooltrace</text>
  <text x="96" y="372" font-family="Arial, Helvetica, sans-serif" font-size="37" fill="${BODY}">Snap a photo of your tools. Print a bin that fits them.</text>
  <text x="96" y="428" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="${MUTED}">Custom Gridfinity inserts — STL &amp; 1:1 PDF export.</text>

  <!-- Bottom badge -->
  <circle cx="104" cy="534" r="7" fill="${GRASS}"/>
  <text x="124" y="542" font-family="Menlo, monospace" font-size="21" letter-spacing="3" fill="${MUTED}">LOCAL-ONLY · NO ACCOUNT</text>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(out)
console.log(`Wrote ${out} (${W}×${H})`)
