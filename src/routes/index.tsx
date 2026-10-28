import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, FileDown } from 'lucide-react'
import { css, cx } from '~/styled-system/css'
import { Button, Text } from '~/components/ui'
import { downloadPdf } from '~/lib/pdf'
import { generateTemplatePdf } from '~/lib/template'
import { getTemplatePaperSize } from '~/lib/vision'
import { socialTags } from '~/lib/seo'

export const Route = createFileRoute('/')({
  // Canonical only on the indexable landing page (app routes are noindex).
  head: () => ({ links: [socialTags('/').canonical] }),
  component: Home,
})

const overline = css({
  textStyle: 'overline',
  color: 'grass.11',
  fontSize: { base: '10px', sm: '11px' },
})

// Static class sets per variant — Panda only extracts statically known values,
// so no conditional values inside css() calls.
const figClasses = {
  desktop: {
    frame: css({ position: 'relative', flexShrink: '0', bg: 'canvas.bg', borderRadius: 'l3', overflow: 'hidden', w: '[520px]', h: '[480px]' }),
    photo: css({ position: 'absolute', objectFit: 'cover', borderWidth: '1px', borderColor: 'border.strong', display: 'block', left: '[110px]', top: '[16px]', w: '[300px]', h: '[448px]' }),
    svg: css({ position: 'absolute', pointerEvents: 'none', overflow: 'visible', left: '[162px]', top: '[130px]', w: '[196px]', h: '[82px]' }),
    ellipse: css({ position: 'absolute', borderRadius: 'full', bg: 'grass.a3', borderWidth: '2px', borderColor: 'grass.11', left: '[192px]', top: '[280px]', w: '[150px]', h: '[150px]' }),
    badges: [css({ left: '[150px]', top: '[120px]' }), css({ left: '[180px]', top: '[270px]' })],
  },
  mobile: {
    frame: css({ position: 'relative', flexShrink: '0', bg: 'canvas.bg', borderRadius: 'l3', overflow: 'hidden', w: '[350px]', maxW: 'full', h: '[220px]' }),
    photo: css({ position: 'absolute', objectFit: 'cover', borderWidth: '1px', borderColor: 'border.strong', display: 'block', left: '[105px]', top: '[8px]', w: '[140px]', h: '[204px]' }),
    svg: css({ position: 'absolute', pointerEvents: 'none', overflow: 'visible', left: '[129px]', top: '[61px]', w: '[88px]', h: '[37px]' }),
    ellipse: css({ position: 'absolute', borderRadius: 'full', bg: 'grass.a3', borderWidth: '2px', borderColor: 'grass.11', left: '[143px]', top: '[128px]', w: '[72px]', h: '[72px]' }),
    badges: [css({ left: '[124px]', top: '[57px]' }), css({ left: '[138px]', top: '[124px]' })],
  },
} as const

const figBadgeBase = css({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  w: '[18px]',
  h: '[17px]',
  bg: 'grass.9',
  color: 'fg.inverse',
  borderRadius: 'l1',
  fontFamily: 'mono',
  fontSize: '10px',
})

/** Decorative scan figure: reference photo + fake detection overlays + dim line. */
function ScanFigure({ variant }: { variant: 'desktop' | 'mobile' }) {
  const c = figClasses[variant]
  return (
    <div className={c.frame}>
      <img src="/reference-scan.jpg" alt="Top-down photo of tools on the reference sheet" className={c.photo} />
      {/* Detected outline 1 (magic arm) */}
      <svg className={c.svg} viewBox="0 0 196 82">
        <path
          d="M10 20 Q40 2 96 6 L150 12 Q188 18 192 42 Q194 66 160 74 L60 80 Q16 78 8 56 Q2 34 10 20 Z"
          className={css({ fill: 'grass.a3', stroke: 'grass.11' })}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* Detected outline 2 (suction mount) */}
      <div className={c.ellipse} />
      {['1', '2'].map((n, i) => (
        <span key={n} className={cx(figBadgeBase, c.badges[i])}>
          {n}
        </span>
      ))}
      {/* Dimension line under the sheet (desktop figure only) */}
      {variant === 'desktop' && (
        <div
          className={css({
            position: 'absolute',
            left: '[110px]',
            top: '[452px]',
            w: '[342px]',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5',
          })}
        >
          <span className={css({ display: 'block', h: 'px', w: '[300px]', bg: 'fg.subtle' })} />
          <span className={css({ fontFamily: 'mono', fontSize: '10px', lineHeight: '13px', color: 'fg.muted' })}>
            210 mm
          </span>
        </div>
      )}
    </div>
  )
}

const SPECS = [
  '42 MM GRIDFINITY UNITS',
  '0.5–1 MM FIT TOLERANCE',
  'STL + 1:1 PDF EXPORT',
  'RUNS 100% LOCALLY',
]

const STEPS = [
  { num: '01', title: 'Snap a photo', desc: 'Place tools on the printed reference sheet and upload a top-down photo.' },
  { num: '02', title: 'Arrange', desc: 'Auto-detected outlines become draggable pockets. Set depths and spacing.' },
  { num: '03', title: 'Export', desc: 'Download an STL for your printer and a 1:1 PDF to test-fit on paper first.' },
]

function Home() {
  async function printReferenceSheet() {
    const bytes = await generateTemplatePdf(getTemplatePaperSize())
    downloadPdf(bytes, `tooltrace-reference-sheet-${getTemplatePaperSize()}.pdf`)
  }

  return (
    <div
      className={css({
        display: 'flex',
        flexDir: 'column',
        flex: '1',
        minH: '0',
        overflowY: 'auto',
        // Bleed past the main padding so strips/footer span the full width.
        m: { base: '-3', sm: '-4' },
      })}
    >
      {/* Hero */}
      <section
        className={css({
          display: 'flex',
          flexDir: { base: 'column', lg: 'row' },
          alignItems: { base: 'stretch', lg: 'center' },
          justifyContent: 'center',
          gap: { base: '6', lg: '12' },
          px: { base: '5', lg: '16' },
          py: { base: '8', lg: '10' },
        })}
      >
        <div className={css({ display: 'flex', flexDir: 'column', gap: '6', maxW: { lg: '3xl' } })}>
          <span className={overline}>PHOTO → DETECT → ARRANGE → PRINT</span>
          <h1
            className={css({
              fontFamily: 'display',
              fontWeight: 'semibold',
              letterSpacing: '-0.02em',
              color: 'fg.default',
              fontSize: { base: '34px', lg: '48px' },
              lineHeight: { base: '38px', lg: '52px' },
            })}
          >
            Photo in. Custom insert out.
          </h1>
          <Text color="fg.muted" fontSize={{ base: '14px', lg: '15px' }} lineHeight={{ base: '21px', lg: '23px' }}>
            Snap a photo of your tools on a reference sheet. Tooltrace detects their outlines,
            arranges them in a tray, and exports a Gridfinity STL and a 1:1 print-test PDF.
          </Text>
          {/* Mobile: figure sits between the copy and the CTAs (Landing · Mobile frame). */}
          <div className={css({ display: { base: 'flex', lg: 'none' }, justifyContent: 'center' })}>
            <ScanFigure variant="mobile" />
          </div>
          <div
            className={css({
              display: 'flex',
              flexDir: { base: 'column', sm: 'row' },
              alignItems: { base: 'stretch', sm: 'center' },
              gap: '3',
            })}
          >
            <Button size="xl" colorPalette="grass" asChild>
              <Link to="/new">
                <ArrowRight size={18} /> Start a new trace
              </Link>
            </Button>
            <Button
              size="md"
              variant="plain"
              onClick={printReferenceSheet}
              className={css({ color: 'fg.muted', w: { base: 'full', sm: 'auto' } })}
            >
              <FileDown size={16} /> Print reference sheet
            </Button>
          </div>
        </div>
        <div className={css({ display: { base: 'none', lg: 'block' } })}>
          <ScanFigure variant="desktop" />
        </div>
      </section>

      {/* Spec strip */}
      <section
        className={css({
          display: { base: 'none', sm: 'flex' },
          gap: '6',
          flexWrap: 'wrap',
          px: { sm: '6', lg: '16' },
          py: '3',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
          borderColor: 'border',
        })}
      >
        {SPECS.map((s) => (
          <span key={s} className={css({ textStyle: 'overline', color: 'fg.subtle' })}>
            {s}
          </span>
        ))}
      </section>

      {/* Steps */}
      <section
        className={css({
          display: 'flex',
          flexDir: { base: 'column', sm: 'row' },
          gap: { base: '5', sm: '8' },
          px: { base: '5', sm: '6', lg: '16' },
          py: { base: '6', sm: '8' },
        })}
      >
        {STEPS.map((step) => (
          <div
            key={step.num}
            className={css({
              display: 'flex',
              flexDir: { base: 'row', sm: 'column' },
              gap: { base: '3', sm: '2' },
              flex: '1',
              minW: '0',
            })}
          >
            <span className={css({ fontFamily: 'mono', fontSize: '13px', lineHeight: '17px', color: 'grass.11' })}>
              {step.num}
            </span>
            <div className={css({ display: 'flex', flexDir: 'column', gap: { base: '1', sm: '2' }, minW: '0' })}>
              <span
                className={css({
                  fontSize: { base: '14px', sm: '15px' },
                  lineHeight: { base: '17px', sm: '18px' },
                  fontWeight: 'semibold',
                  color: 'fg.default',
                })}
              >
                {step.title}
              </span>
              <Text color="fg.muted" fontSize={{ base: '12px', sm: '13px' }} lineHeight={{ base: '17px', sm: '19px' }}>
                {step.desc}
              </Text>
            </div>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer
        className={css({
          display: { base: 'none', sm: 'flex' },
          justifyContent: 'space-between',
          px: { sm: '6', lg: '16' },
          py: '4',
          mt: 'auto',
          borderTopWidth: '1px',
          borderColor: 'border',
        })}
      >
        <span className={css({ fontFamily: 'mono', fontSize: '10px', lineHeight: '13px', color: 'fg.subtle' })}>
          GRIDFINITY TOOLTRACE
        </span>
        <span className={css({ fontFamily: 'mono', fontSize: '10px', lineHeight: '13px', color: 'fg.subtle' })}>
          M4 · STL + PDF
        </span>
      </footer>
    </div>
  )
}
