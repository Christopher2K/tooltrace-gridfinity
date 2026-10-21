/**
 * `crypto.randomUUID()` with a fallback for non-secure contexts.
 *
 * `randomUUID` is only available in secure contexts (HTTPS or localhost), so it
 * is undefined when the app is opened over plain HTTP on a LAN (e.g. testing the
 * dev server from a phone). IDs here only need local uniqueness (tool/object keys),
 * so a Math.random-backed v4 shape is an acceptable fallback.
 */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}
