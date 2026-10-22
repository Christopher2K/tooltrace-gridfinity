import { defineTextStyles } from '@pandacss/dev'

export const textStyles = defineTextStyles({
  xs: { value: { fontSize: 'xs', lineHeight: '1.125rem' } },
  sm: { value: { fontSize: 'sm', lineHeight: '1.25rem' } },
  md: { value: { fontSize: 'md', lineHeight: '1.5rem' } },
  lg: { value: { fontSize: 'lg', lineHeight: '1.75rem' } },
  xl: { value: { fontSize: 'xl', lineHeight: '1.875rem' } },
  '2xl': { value: { fontSize: '2xl', lineHeight: '2rem' } },
  '3xl': { value: { fontSize: '3xl', lineHeight: '2.375rem', letterSpacing: '-0.02em' } },
  '4xl': { value: { fontSize: '4xl', lineHeight: '2.75rem', letterSpacing: '-0.02em' } },
  '5xl': { value: { fontSize: '5xl', lineHeight: '3.75rem', letterSpacing: '-0.02em' } },
  '6xl': { value: { fontSize: '6xl', lineHeight: '4.5rem', letterSpacing: '-0.02em' } },
  '7xl': { value: { fontSize: '7xl', lineHeight: '5.75rem', letterSpacing: '-0.02em' } },

  // Design-system roles (see design/DESIGN_SYSTEM.md §2.2)
  display: {
    value: {
      fontFamily: 'display',
      fontSize: '40px',
      lineHeight: '44px',
      fontWeight: 'semibold',
      letterSpacing: '-0.02em',
    },
  },
  h1: {
    value: { fontFamily: 'display', fontSize: '28px', lineHeight: '36px', fontWeight: 'semibold' },
  },
  h2: {
    value: { fontFamily: 'display', fontSize: '20px', lineHeight: '28px', fontWeight: 'semibold' },
  },
  h3: { value: { fontFamily: 'body', fontSize: '15px', lineHeight: '22px', fontWeight: 'semibold' } },
  body: { value: { fontFamily: 'body', fontSize: '14px', lineHeight: '20px' } },
  'body-sm': { value: { fontFamily: 'body', fontSize: '13px', lineHeight: '18px' } },
  label: { value: { fontFamily: 'body', fontSize: '12px', lineHeight: '16px', fontWeight: 'medium' } },
  overline: {
    value: {
      fontFamily: 'mono',
      fontSize: '11px',
      lineHeight: '16px',
      fontWeight: 'medium',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  mono: { value: { fontFamily: 'mono', fontSize: '13px', lineHeight: '20px' } },
  'mono-sm': { value: { fontFamily: 'mono', fontSize: '11px', lineHeight: '16px' } },
})
