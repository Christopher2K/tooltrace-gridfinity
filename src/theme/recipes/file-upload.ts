import { fileUploadAnatomy } from '@ark-ui/react/anatomy'
import { defineSlotRecipe } from '@pandacss/dev'

export const fileUpload = defineSlotRecipe({
  className: 'file-upload',
  slots: fileUploadAnatomy.keys(),
  base: {
    root: {
      alignItems: 'flex-start',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',
      width: 'full',
    },
    label: {
      textStyle: 'label',
    },
    dropzone: {
      alignItems: 'center',
      background: 'bg.subtle',
      borderRadius: 'l3',
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: 'border.strong',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5',

      focusVisibleRing: 'outside',
      justifyContent: 'center',
      transition: 'backgrounds',
      width: 'full',
      _dragging: {
        background: 'grass.a2',
        borderColor: 'grass.9',
      },
    },
    item: {
      alignItems: 'start',
      animationDuration: 'normal',
      animationName: 'fade-in',
      background: 'gray.surface.bg',
      borderRadius: 'l3',
      borderWidth: '1px',
      display: 'flex',
      pos: 'relative',
      width: 'full',
    },
    itemGroup: {
      display: 'flex',
      alignItems: 'start',
      flexDirection: 'column',
      width: 'full',
    },
    itemName: {
      color: 'fg.default',
      fontWeight: 'medium',
    },
    itemSizeText: {
      color: 'fg.muted',
    },
    itemDeleteTrigger: {
      color: 'fg.subtle',
    },
    itemPreviewImage: {
      aspectRatio: '1',
      objectFit: 'cover',
      maxW: '20',
      borderRadius: 'l2',
    },
  },
  defaultVariants: {
    size: 'md',
  },
  variants: {
    size: {
      md: {
        root: { gap: '4' },
        dropzone: { px: '6', py: '4', minHeight: { base: '160px', sm: '180px' }, gap: '1.5' },
        item: { p: '4', gap: '3', textStyle: 'sm' },
        itemGroup: { gap: '3' },
        itemDeleteTrigger: { _icon: { boxSize: '4' } },
      },
    },
  },
})
