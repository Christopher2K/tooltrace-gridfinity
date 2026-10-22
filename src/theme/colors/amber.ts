import { amber, amberDark } from '@radix-ui/colors'
import { defineSemanticTokens } from '@pandacss/dev'

// Warning ramp (Radix amber). Only the ramp — warnings are consumed through the
// `warning.*` semantic tokens in panda.config.ts. Step 3 follows the design
// spec (#FFF0C2, slightly softer than Radix's #FFF7C2).
export const amberRamp = defineSemanticTokens.colors({
  '1': { value: { _light: amber.amber1, _dark: amberDark.amber1 } },
  '2': { value: { _light: amber.amber2, _dark: amberDark.amber2 } },
  '3': { value: { _light: '#fff0c2', _dark: amberDark.amber3 } },
  '4': { value: { _light: amber.amber4, _dark: amberDark.amber4 } },
  '5': { value: { _light: amber.amber5, _dark: amberDark.amber5 } },
  '6': { value: { _light: amber.amber6, _dark: amberDark.amber6 } },
  '7': { value: { _light: amber.amber7, _dark: amberDark.amber7 } },
  '8': { value: { _light: amber.amber8, _dark: amberDark.amber8 } },
  '9': { value: { _light: amber.amber9, _dark: amberDark.amber9 } },
  '10': { value: { _light: amber.amber10, _dark: amberDark.amber10 } },
  '11': { value: { _light: amber.amber11, _dark: amberDark.amber11 } },
  '12': { value: { _light: amber.amber12, _dark: amberDark.amber12 } },
})
