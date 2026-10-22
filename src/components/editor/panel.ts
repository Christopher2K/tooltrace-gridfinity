import { css } from '~/styled-system/css'

// Editor panels render as cards on desktop but as a bare stack on mobile,
// matching the pen mobile editor frame (controls without card chrome).
export const panelRoot = css({
  bg: { base: 'transparent', lg: 'bg.surface' },
  borderWidth: { base: '0', lg: '1px' },
  borderRadius: { base: 'none', lg: 'l3' },
})

export const panelHeader = css({
  px: { base: '0', lg: '4' },
  pt: { base: '0', lg: '3.5' },
})

export const panelBody = css({
  px: { base: '0', lg: '4' },
  pb: { base: '0', lg: '4' },
})
