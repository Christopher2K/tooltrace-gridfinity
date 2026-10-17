import { defineConfig } from '@pandacss/dev'

import { animationStyles } from './src/theme/animation-styles'
import { grass } from './src/theme/colors/grass'
import { red } from './src/theme/colors/red'
import { sand } from './src/theme/colors/sand'
import { conditions } from './src/theme/conditions'
import { globalCss } from './src/theme/global-css'
import { keyframes } from './src/theme/keyframes'
import { layerStyles } from './src/theme/layer-styles'
import { recipes, slotRecipes } from './src/theme/recipes'
import { textStyles } from './src/theme/text-styles'
import { colors } from './src/theme/tokens/colors'
import { durations } from './src/theme/tokens/durations'
import { shadows } from './src/theme/tokens/shadows'
import { zIndex } from './src/theme/tokens/z-index'

// Removes Panda's default 50-950 color tokens so only Park UI colors exist.
// See https://park-ui.com/docs/installation
const removePandaColors = {
  name: 'Remove Panda Preset Colors',
  hooks: {
    'preset:resolved': ({ utils, preset, name }: any) =>
      name === '@pandacss/preset-panda'
        ? utils.omit(preset, ['theme.tokens.colors', 'theme.semanticTokens.colors'])
        : preset,
  },
}

export default defineConfig({
  preflight: true,
  presets: ['@pandacss/preset-base', '@pandacss/preset-panda'],
  plugins: [removePandaColors],
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  jsxFramework: 'react',
  outdir: 'styled-system',
  importMap: '~/styled-system',
  outExtension: 'js',

  globalCss,
  conditions,
  theme: {
    extend: {
      animationStyles,
      recipes,
      slotRecipes,
      keyframes,
      layerStyles,
      textStyles,
      tokens: {
        colors,
        durations,
        zIndex,
      },
      semanticTokens: {
        colors: {
          grass,
          red,
          gray: sand,
          fg: {
            default: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } },
            muted: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } },
            subtle: { value: { _light: '{colors.gray.10}', _dark: '{colors.gray.10}' } },
          },
          border: { value: { _light: '{colors.gray.4}', _dark: '{colors.gray.4}' } },
          error: { value: { _light: '{colors.red.9}', _dark: '{colors.red.9}' } },
        },
        shadows,
        radii: {
          l1: { value: '{radii.xs}' },
          l2: { value: '{radii.sm}' },
          l3: { value: '{radii.md}' },
        },
      },
    },
  },
})