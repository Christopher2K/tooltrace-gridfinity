/**
 * Shared pointer-gesture helper: drag with movement threshold + touch long-press.
 *
 * Used by the pan/zoom canvas and the editor's tool/vertex/edge drags so that
 * mouse and touch behave consistently:
 * - Drag starts on pointerdown and follows pointermove (as before).
 * - On touch, holding still for `delay` ms fires `onLongPress` instead of the drag.
 * - A window-level `PINCH_START_EVENT` aborts the gesture (a second finger landed
 *   and the canvas took over for pinch-zoom).
 */

/** Fired on window when a two-finger pinch takes over the canvas; drags should abort. */
export const PINCH_START_EVENT = 'tooltrace:pinchstart'

// Module-level pinch state so gestures that begin *after* a pinch started
// (e.g. events already in flight) abort immediately instead of fighting the pinch.
let pinchActive = false
export function setPinchActive(active: boolean) {
  pinchActive = active
}
export function isPinchActive() {
  return pinchActive
}

export interface LongPressPoint {
  clientX: number
  clientY: number
}

export interface PointerGestureHandlers {
  /** Fires on every pointermove once past the slop threshold (and not long-pressed). */
  onMove?: (ev: PointerEvent) => void
  /** Fires on pointerup/cancel unless a long-press consumed the gesture. */
  onUp?: (ev: PointerEvent) => void
  /** Touch only: fires when the pointer stays within the slop radius for `delay` ms. */
  onLongPress?: (point: LongPressPoint) => void
  /** Fires when a pinch gesture takes over the canvas mid-drag (second finger landed). */
  onAbort?: () => void
}

export interface PointerGestureOptions {
  /** Long-press delay in ms. Default 500. */
  delay?: number
  /** Movement slop in px before the gesture counts as a drag. Default 6. */
  moveThreshold?: number
}

export function startPointerGesture(
  e: { clientX: number; clientY: number; pointerType: string },
  handlers: PointerGestureHandlers,
  options: PointerGestureOptions = {},
): void {
  const { delay = 500, moveThreshold = 6 } = options
  const startX = e.clientX
  const startY = e.clientY

  // A pinch is already in progress — this gesture arrived too late; abort it.
  if (isPinchActive()) {
    handlers.onAbort?.()
    return
  }
  // Long-press is a touch affordance — mice already have right-click.
  const wantsLongPress = e.pointerType === 'touch' && handlers.onLongPress

  let longPressed = false
  let settled = false

  const timer = wantsLongPress
    ? window.setTimeout(() => {
        longPressed = true
        handlers.onLongPress?.({ clientX: startX, clientY: startY })
      }, delay)
    : null

  function cleanup() {
    if (settled) return
    settled = true
    if (timer !== null) window.clearTimeout(timer)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onUp)
    window.removeEventListener(PINCH_START_EVENT, onAbort)
  }

  function onMove(ev: PointerEvent) {
    if (longPressed) return
    if (timer !== null && Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > moveThreshold) {
      window.clearTimeout(timer)
    }
    handlers.onMove?.(ev)
  }

  function onUp(ev: PointerEvent) {
    const wasLongPress = longPressed
    cleanup()
    if (!wasLongPress) handlers.onUp?.(ev)
  }

  function onAbort() {
    cleanup()
    handlers.onAbort?.()
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  window.addEventListener(PINCH_START_EVENT, onAbort)
}

/** Minimal synthetic event for opening a context menu from a long-press. */
export function longPressMenuEvent(point: LongPressPoint) {
  return {
    clientX: point.clientX,
    clientY: point.clientY,
    preventDefault: () => {},
    stopPropagation: () => {},
  }
}
