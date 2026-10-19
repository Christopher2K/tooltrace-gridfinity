/** A 2D point in world (mm) coordinates. */
export interface Point {
  x: number
  y: number
}

/** Visible world rectangle: top-left corner plus size, in mm. */
export interface View {
  x: number
  y: number
  w: number
  h: number
}

export interface MenuItem {
  label: string
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
  separator?: boolean
}

export interface MenuState {
  x: number
  y: number
  items: MenuItem[]
}
