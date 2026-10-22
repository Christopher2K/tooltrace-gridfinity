import { slate, slateA, slateDark, slateDarkA } from '@radix-ui/colors'
import { defineSemanticTokens } from '@pandacss/dev'

// Cool gray ramp (Radix slate) — replaces the warm `sand` ramp for the
// instrument/blueprint look. Values come straight from @radix-ui/colors.
export const slateRamp = defineSemanticTokens.colors({
  '1': { value: { _light: slate.slate1, _dark: slateDark.slate1 } },
  '2': { value: { _light: slate.slate2, _dark: slateDark.slate2 } },
  '3': { value: { _light: slate.slate3, _dark: slateDark.slate3 } },
  '4': { value: { _light: slate.slate4, _dark: slateDark.slate4 } },
  '5': { value: { _light: slate.slate5, _dark: slateDark.slate5 } },
  '6': { value: { _light: slate.slate6, _dark: slateDark.slate6 } },
  '7': { value: { _light: slate.slate7, _dark: slateDark.slate7 } },
  '8': { value: { _light: slate.slate8, _dark: slateDark.slate8 } },
  '9': { value: { _light: slate.slate9, _dark: slateDark.slate9 } },
  '10': { value: { _light: slate.slate10, _dark: slateDark.slate10 } },
  '11': { value: { _light: slate.slate11, _dark: slateDark.slate11 } },
  '12': { value: { _light: slate.slate12, _dark: slateDark.slate12 } },
  a1: { value: { _light: slateA.slateA1, _dark: slateDarkA.slateA1 } },
  a2: { value: { _light: slateA.slateA2, _dark: slateDarkA.slateA2 } },
  a3: { value: { _light: slateA.slateA3, _dark: slateDarkA.slateA3 } },
  a4: { value: { _light: slateA.slateA4, _dark: slateDarkA.slateA4 } },
  a5: { value: { _light: slateA.slateA5, _dark: slateDarkA.slateA5 } },
  a6: { value: { _light: slateA.slateA6, _dark: slateDarkA.slateA6 } },
  a7: { value: { _light: slateA.slateA7, _dark: slateDarkA.slateA7 } },
  a8: { value: { _light: slateA.slateA8, _dark: slateDarkA.slateA8 } },
  a9: { value: { _light: slateA.slateA9, _dark: slateDarkA.slateA9 } },
  a10: { value: { _light: slateA.slateA10, _dark: slateDarkA.slateA10 } },
  a11: { value: { _light: slateA.slateA11, _dark: slateDarkA.slateA11 } },
  a12: { value: { _light: slateA.slateA12, _dark: slateDarkA.slateA12 } },
  solid: {
    bg: {
      DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } },
      hover: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.white}', _dark: '{colors.white}' } } },
  },
  subtle: {
    bg: {
      DEFAULT: { value: { _light: '{colors.gray.a3}', _dark: '{colors.gray.a3}' } },
      hover: { value: { _light: '{colors.gray.a4}', _dark: '{colors.gray.a4}' } },
      active: { value: { _light: '{colors.gray.a5}', _dark: '{colors.gray.a5}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } } },
  },
  surface: {
    bg: {
      DEFAULT: { value: { _light: '{colors.white}', _dark: '{colors.gray.1}' } },
      hover: { value: { _light: '{colors.gray.2}', _dark: '{colors.gray.2}' } },
      active: { value: { _light: '{colors.gray.3}', _dark: '{colors.gray.3}' } },
    },
    border: {
      DEFAULT: { value: { _light: '{colors.gray.5}', _dark: '{colors.gray.5}' } },
      hover: { value: { _light: '{colors.gray.7}', _dark: '{colors.gray.7}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } } },
  },
  outline: {
    bg: {
      hover: { value: { _light: '{colors.gray.a2}', _dark: '{colors.gray.a2}' } },
      active: { value: { _light: '{colors.gray.a3}', _dark: '{colors.gray.a3}' } },
    },
    // Outline controls (buttons, inputs, select triggers, dropzone) use the
    // strong border step so they read as controls on a white surface.
    border: { DEFAULT: { value: { _light: '{colors.gray.8}', _dark: '{colors.gray.8}' } } },
    fg: { DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } } },
  },
  plain: {
    bg: {
      hover: { value: { _light: '{colors.gray.a3}', _dark: '{colors.gray.a3}' } },
      active: { value: { _light: '{colors.gray.a4}', _dark: '{colors.gray.a4}' } },
    },
    fg: { DEFAULT: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } } },
  },
})
