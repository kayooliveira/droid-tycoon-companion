/** Shared Phosphor icon props for UI chrome (outline by default; mobile nav uses fill when active). */
export const UI_ICON_SIZE = 18
export const UI_ICON_WEIGHT = 'regular' as const

export const uiIconProps = {
  size: UI_ICON_SIZE,
  weight: UI_ICON_WEIGHT,
} as const
