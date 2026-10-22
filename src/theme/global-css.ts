export const globalCss = {
  extend: {
    '*': {
      '--global-color-border': 'colors.border',
      '--global-color-placeholder': 'colors.fg.subtle',
      '--global-color-selection': 'colors.colorPalette.subtle.bg',
      '--global-color-focus-ring': 'colors.grass.9',
    },
    html: {
      colorPalette: 'gray',
    },
    body: {
      background: 'bg.canvas',
      color: 'fg.default',
      fontFamily: 'body',
    },
  },
}
