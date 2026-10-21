import { numberInputAnatomy } from '@ark-ui/react/anatomy'
import { defineSlotRecipe } from '@pandacss/dev'
import { input } from './input'

const trigger = {
  alignItems: 'center',
  color: 'fg.muted',
  cursor: 'pointer',
  display: 'flex',
  flex: '1',
  justifyContent: 'center',
  lineHeight: '1',
  transition: 'common',
  userSelect: 'none',
  _icon: {
    boxSize: '1em',
  },
  _hover: {
    bg: 'gray.surface.bg.hover',
  },
  _active: {
    bg: 'gray.surface.bg.active',
  },
}

export const numberInput = defineSlotRecipe({
  className: 'number-input',
  slots: numberInputAnatomy.keys(),
  base: {
    root: {
      isolation: 'isolate',
      position: 'relative',
      w: 'full',
      _disabled: {
        layerStyle: 'disabled',
      },
    },
    control: {
      borderStartWidth: '1px',
      // Anchor to the root's bottom edge and size to the input height — the root
      // also contains the label, so `top: 0; height: 100%` would stretch the
      // steppers past the input (over the label and below the input's border).
      bottom: '0',
      display: 'flex',
      divideY: '1px',
      flexDirection: 'column',
      height: 'calc(var(--input-height) - 2px)',
      insetEnd: '0px',
      margin: '1px',
      position: 'absolute',
      width: 'var(--stepper-width)',
      zIndex: '1',
    },
    input: {
      ...input.base,
      verticalAlign: 'top',
      pe: 'calc(var(--stepper-width) + 0.5rem)',
    },
    label: {
      color: 'fg.default',
      fontWeight: 'medium',
    },
    incrementTrigger: {
      ...trigger,
      borderTopRightRadius: 'l2',
    },
    decrementTrigger: {
      ...trigger,
      borderBottomRightRadius: 'l2',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'outline',
  },
  variants: {
    size: {
      sm: {
        // Mirror the input's --input-height on the root so the control slot
        // (a child of the root) can size itself to the input, not the root.
        root: {
          '--input-height': 'sizes.9',
        },
        control: {
          '--stepper-width': 'sizes.4.5',
        },
        input: input.variants.size.sm,
      },
      md: {
        root: {
          '--input-height': 'sizes.10',
        },
        control: {
          '--stepper-width': 'sizes.5',
        },
        input: input.variants.size.md,
      },
      lg: {
        root: {
          '--input-height': 'sizes.11',
        },
        control: {
          '--stepper-width': 'sizes.5.5',
        },
        input: input.variants.size.lg,
      },
      xl: {
        root: {
          '--input-height': 'sizes.12',
        },
        control: {
          '--stepper-width': 'sizes.6',
        },
        input: input.variants.size.xl,
      },
    },
    variant: {
      outline: {
        input: input.variants.variant.outline,
      },
      surface: {
        input: input.variants.variant.surface,
      },
    },
  },
})
