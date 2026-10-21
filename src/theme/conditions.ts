export const conditions = {
  extend: {
    light: ':root &, .light &',
    invalid: '&:is(:user-invalid, [data-invalid], [aria-invalid=true])',
    hover: '&:not(:disabled):hover',
    active: '&:not(:disabled):active',
    checked:
      '&:is(:checked, [data-checked], [data-state=checked], [aria-checked=true], [data-state=indeterminate])',
    on: '&:is([data-state=on])',
    pinned: '&:is([data-pinned])',
    // Devices without hover / with coarse pointers (phones, tablets) — enlarge tap targets.
    touch: '@media (hover: none), (pointer: coarse)',
  },
} as const
