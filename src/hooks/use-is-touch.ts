import { useSyncExternalStore } from 'react'

const QUERY = '(hover: none), (pointer: coarse)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** True on devices without hover / with coarse pointers (phones, tablets). SSR-safe (false). */
export function useIsTouch(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}
