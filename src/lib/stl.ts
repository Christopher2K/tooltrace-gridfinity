/** Binary STL writer for triangle soup. Coordinates in millimeters. */

export interface Vec3 {
  x: number
  y: number
  z: number
}

export type Triangle = [Vec3, Vec3, Vec3]

export class MeshBuilder {
  triangles: Triangle[] = []

  /**
   * Adds a triangle, fixing winding so the geometric normal points along
   * `normalHint` (keeps the mesh consistently outward-facing regardless of
   * input polygon winding).
   */
  tri(a: Vec3, b: Vec3, c: Vec3, normalHint: Vec3) {
    const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
    const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
    const n = {
      x: ab.y * ac.z - ab.z * ac.y,
      y: ab.z * ac.x - ab.x * ac.z,
      z: ab.x * ac.y - ab.y * ac.x,
    }
    // Skip degenerate (zero-area) triangles — they break manifoldness checks.
    if (Math.hypot(n.x, n.y, n.z) < 1e-9) return
    if (n.x * normalHint.x + n.y * normalHint.y + n.z * normalHint.z < 0) {
      this.triangles.push([a, c, b])
    } else {
      this.triangles.push([a, b, c])
    }
  }

  /** Quad a→b→c→d (two triangles), normal along hint. */
  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, normalHint: Vec3) {
    this.tri(a, b, c, normalHint)
    this.tri(a, c, d, normalHint)
  }
}

function normalOf([a, b, c]: Triangle): Vec3 {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
  const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
  const n = {
    x: ab.y * ac.z - ab.z * ac.y,
    y: ab.z * ac.x - ab.x * ac.z,
    z: ab.x * ac.y - ab.y * ac.x,
  }
  const len = Math.hypot(n.x, n.y, n.z) || 1
  return { x: n.x / len, y: n.y / len, z: n.z / len }
}

/** Serializes triangles to a binary STL. */
export function toBinaryStl(triangles: Triangle[]): ArrayBuffer {
  const buffer = new ArrayBuffer(84 + triangles.length * 50)
  const view = new DataView(buffer)
  view.setUint32(80, triangles.length, true)
  let offset = 84
  for (const t of triangles) {
    const n = normalOf(t)
    for (const v of [n, ...t]) {
      view.setFloat32(offset, v.x, true)
      view.setFloat32(offset + 4, v.y, true)
      view.setFloat32(offset + 8, v.z, true)
      offset += 12
    }
    view.setUint16(offset, 0, true)
    offset += 2
  }
  return buffer
}

export function downloadStl(triangles: Triangle[], filename: string) {
  const blob = new Blob([toBinaryStl(triangles)], { type: 'model/stl' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
