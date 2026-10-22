import { defineConfig } from '@pandacss/dev'

import { animationStyles } from './src/theme/animation-styles'
import { amberRamp } from './src/theme/colors/amber'
import { grass } from './src/theme/colors/grass'
import { red } from './src/theme/colors/red'
import { slateRamp } from './src/theme/colors/slate'
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
        // Local webfonts (@fontsource*, imported in src/routes/__root.tsx).
        fonts: {
          display: { value: "'Space Grotesk Variable', 'Space Grotesk', sans-serif" },
          body: { value: "'Inter Variable', 'Inter', sans-serif" },
          mono: { value: "'IBM Plex Mono', monospace" },
        },
      },
      semanticTokens: {
        colors: {
          grass,
          red,
          amber: amberRamp,
          gray: slateRamp,
          bg: {
            canvas: { value: { _light: '#F7F9FB', _dark: '#F7F9FB' } },
            default: { value: { _light: '{colors.white}', _dark: '{colors.white}' } },
            surface: { value: { _light: '{colors.white}', _dark: '{colors.white}' } },
            subtle: { value: { _light: '{colors.gray.3}', _dark: '{colors.gray.3}' } },
            muted: { value: { _light: '{colors.gray.4}', _dark: '{colors.gray.4}' } },
            inverse: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } },
          },
          fg: {
            default: { value: { _light: '{colors.gray.12}', _dark: '{colors.gray.12}' } },
            muted: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } },
            subtle: { value: { _light: '{colors.gray.9}', _dark: '{colors.gray.9}' } },
            inverse: { value: { _light: '{colors.white}', _dark: '{colors.white}' } },
          },
          border: {
            DEFAULT: { value: { _light: '{colors.gray.5}', _dark: '{colors.gray.5}' } },
            strong: { value: { _light: '{colors.gray.8}', _dark: '{colors.gray.8}' } },
          },
          success: {
            fg: { value: { _light: '{colors.grass.11}', _dark: '{colors.grass.11}' } },
          },
          warning: {
            solid: { value: { _light: '{colors.amber.9}', _dark: '{colors.amber.9}' } },
            fg: { value: { _light: '{colors.amber.11}', _dark: '{colors.amber.11}' } },
            subtle: { value: { _light: '{colors.amber.3}', _dark: '{colors.amber.3}' } },
          },
          error: {
            DEFAULT: { value: { _light: '{colors.red.9}', _dark: '{colors.red.9}' } },
            solid: { value: { _light: '{colors.red.9}', _dark: '{colors.red.9}' } },
            fg: { value: { _light: '{colors.red.11}', _dark: '{colors.red.11}' } },
            subtle: { value: { _light: '{colors.red.3}', _dark: '{colors.red.3}' } },
          },
          // Editor drawing surface (SVG canvas chrome).
          canvas: {
            bg: { value: { _light: '#F5F7F9', _dark: '#F5F7F9' } },
            grid: { value: { _light: '{colors.gray.5}', _dark: '{colors.gray.5}' } },
            gridMajor: { value: { _light: '{colors.gray.7}', _dark: '{colors.gray.7}' } },
            tray: { value: { _light: '{colors.gray.11}', _dark: '{colors.gray.11}' } },
            tool: { value: { _light: '#60646c99', _dark: '#60646c99' } },
            toolFill: { value: { _light: '#1c20240a', _dark: '#1c20240a' } },
            selection: { value: { _light: '{colors.grass.9}', _dark: '{colors.grass.9}' } },
            selectionFill: { value: { _light: '{colors.grass.a3}', _dark: '{colors.grass.a3}' } },
            invalid: { value: { _light: '{colors.red.9}', _dark: '{colors.red.9}' } },
          },
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
