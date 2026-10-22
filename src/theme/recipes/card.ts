import { defineSlotRecipe } from '@pandacss/dev'

export const card = defineSlotRecipe({
  className: 'card',
  slots: ['root', 'header', 'body', 'footer', 'title', 'description'],
  base: {
    root: {
      borderRadius: 'l3',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    },
    header: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      px: '4',
      pt: '3.5',
      pb: '2.5',
    },
    body: {
      display: 'flex',
      flex: '1',
      flexDirection: 'column',
      gap: '3',
      pb: '4',
      px: '4',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '3',
      pb: '4',
      pt: '2',
      px: '4',
    },
    title: {
      textStyle: 'h3',
    },
    description: {
      color: 'fg.muted',
      textStyle: 'body-sm',
    },
  },
  defaultVariants: {
    variant: 'outline',
  },
  variants: {
    variant: {
      elevated: {
        root: {
          bg: 'gray.surface.bg',
          borderWidth: '1px',
        },
      },
      outline: {
        root: {
          bg: 'gray.surface.bg',
          borderWidth: '1px',
        },
      },
      subtle: {
        root: {
          bg: 'gray.subtle.bg',
        },
      },
    },
  },
})
