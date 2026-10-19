import { useEffect, useRef, useState } from 'react'
import { css } from '~/styled-system/css'
import type { MenuItem, MenuState } from './types'

const menuPopover = css({
  position: 'fixed',
  inset: 'auto',
  m: '0',
  minW: '44',
  py: '1',
  bg: 'bg.default',
  borderWidth: '1px',
  borderColor: 'border',
  borderRadius: 'l2',
  shadow: 'md',
  display: 'flex',
  flexDir: 'column',
})
const menuItem = css({
  px: '3',
  py: '1.5',
  textAlign: 'left',
  textStyle: 'sm',
  cursor: 'pointer',
  bg: 'transparent',
  _hover: { bg: 'gray.a2' },
  _disabled: { color: 'fg.subtle', cursor: 'default', _hover: { bg: 'transparent' } },
})
const menuItemDanger = css({
  px: '3',
  py: '1.5',
  textAlign: 'left',
  textStyle: 'sm',
  cursor: 'pointer',
  bg: 'transparent',
  color: 'red.9',
  _hover: { bg: 'red.a2' },
})
const menuSep = css({ h: 'px', bg: 'border', my: '1' })

/** Minimal event shape needed to open a menu — any mouse/contextmenu event qualifies. */
export interface ContextMenuEvent {
  clientX: number
  clientY: number
  preventDefault: () => void
  stopPropagation: () => void
}

/**
 * Context menu state (native `contextmenu` event + HTML Popover API).
 * Pair with `<ContextMenuPopover menu={menu} onClose={closeMenu} />`.
 */
export function useContextMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null)

  function openMenu(e: ContextMenuEvent, items: MenuItem[]) {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY, items })
  }

  function closeMenu() {
    setMenu(null)
  }

  return { menu, openMenu, closeMenu }
}

/** Native HTML popover context menu (top layer, light-dismiss built in). */
export function ContextMenuPopover({ menu, onClose }: { menu: MenuState | null; onClose: () => void }) {
  const menuRef = useRef<HTMLDivElement>(null)

  // Open the native popover when the menu appears; sync state on light-dismiss.
  useEffect(() => {
    const el = menuRef.current
    if (el && menu && !el.matches(':popover-open')) {
      el.showPopover()
    }
  }, [menu])

  if (!menu) return null

  return (
    <div
      ref={menuRef}
      popover="auto"
      onToggle={(e: any) => {
        if (e.newState === 'closed') onClose()
      }}
      className={menuPopover}
      style={{
        left: Math.min(menu.x, window.innerWidth - 190),
        top: Math.min(menu.y, window.innerHeight - menu.items.length * 36 - 16),
      }}
    >
      {menu.items.map((item, i) =>
        item.separator ? (
          <div key={i} className={menuSep} />
        ) : (
          <button
            key={i}
            className={item.danger ? menuItemDanger : menuItem}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect()
              onClose()
            }}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  )
}
