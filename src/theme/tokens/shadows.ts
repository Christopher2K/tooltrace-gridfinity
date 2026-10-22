import { defineSemanticTokens } from '@pandacss/dev'

// Elevation scale (design/DESIGN_SYSTEM.md §4):
//   e0 flat   — panels/cards: 1px border, no shadow (recipes omit shadow)
//   e1 raised — dropdowns/popovers/sticky bars: xs + sm
//   e2 overlay— dialogs/drawers: md and up
export const shadows = defineSemanticTokens.shadows({
  xs: {
    value: {
      _light: '0 2px 8px #1c20241a',
      _dark: '0 2px 8px {colors.black.a8}',
    },
  },
  sm: {
    value: {
      _light: '0 2px 8px #1c20241a',
      _dark: '0 2px 8px {colors.black.a8}',
    },
  },
  md: {
    value: {
      _light: '0 8px 24px #1c202426',
      _dark: '0 8px 24px {colors.black.a8}',
    },
  },
  lg: {
    value: {
      _light: '0 8px 24px #1c202426',
      _dark: '0 8px 24px {colors.black.a8}',
    },
  },
  xl: {
    value: {
      _light: '0 8px 24px #1c202426',
      _dark: '0 8px 24px {colors.black.a8}',
    },
  },
  '2xl': {
    value: {
      _light: '0 8px 24px #1c202426',
      _dark: '0 8px 24px {colors.black.a8}',
    },
  },
  inset: {
    value: {
      _light: 'inset 8px 0 12px -8px {colors.gray.a4}',
      _dark: 'inset 8px 0 12px -8px {colors.black.a6}',
    },
  },
})
