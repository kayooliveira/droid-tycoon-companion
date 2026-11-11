import type { ReactNode } from 'react'

function TabSvg({ children }: { children: ReactNode }) {
  return (
    <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      {children}
    </svg>
  )
}

export const TAB_BAR_ICONS = {
  home: (
    <TabSvg>
      <path d="M3.5 11 12 4l8.5 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M10 20v-5.5h4V20" />
    </TabSvg>
  ),
  progress: (
    <TabSvg>
      <path d="M6 21V3.5" />
      <path d="M6 4.5h12l-2.5 4 2.5 4H6" />
    </TabSvg>
  ),
  inventory: (
    <TabSvg>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z" />
      <path d="M3.5 7.5 12 12l8.5-4.5" />
      <path d="M12 12v9" />
    </TabSvg>
  ),
  cycles: (
    <TabSvg>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20.5 3.5v4.5H16" />
    </TabSvg>
  ),
  more: (
    <TabSvg>
      <circle cx="5.5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18.5" cy="12" r="1.3" />
    </TabSvg>
  ),
} as const

export const MORE_MENU_ICONS = {
  sell: (
    <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z" />
      <circle cx="8" cy="8.5" r="1.2" />
    </svg>
  ),
  droiddex: (
    <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <path d="M5 4h10.5a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
      <path d="M5 17a3 3 0 0 1 3-3h10.5" />
    </svg>
  ),
  fusion: (
    <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <circle cx="8.5" cy="12" r="5" />
      <circle cx="15.5" cy="12" r="5" />
    </svg>
  ),
  about: (
    <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
      <circle cx="12" cy="7.6" r=".6" />
    </svg>
  ),
  settings: (
    <svg className="ic" width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  ),
} as const
