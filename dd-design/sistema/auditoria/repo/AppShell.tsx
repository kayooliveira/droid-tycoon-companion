<cursor_untrusted_data_1337 source="CallDynamicTool">

import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Backpack,
  Flask,
  Gear,
  Info,
  MapTrifold,
  Sparkle,
  SquaresFour,
  Storefront,
  TreeStructure,
} from '@phosphor-icons/react'
import { UI_ICON_SIZE, UI_ICON_WEIGHT } from './ui/iconStyle'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import { persistLastTab, useLastTabRestore } from '../hooks/useLastTab'
import { cn } from '../lib/utils'
import { Logo } from './Logo'
import { InstallBanner } from './InstallBanner'
import { Modal } from './ui/Modal'
import { MobileFloatingNav } from './MobileFloatingNav'

const desktopNav = [
  { to: '/', labelKey: 'nav.dashboard', icon: SquaresFour, end: true as const },
  { to: '/progress', labelKey: 'nav.progress', icon: TreeStructure },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Backpack },
  { to: '/cycles', labelKey: 'nav.cycles', icon: MapTrifold },
  { to: '/sell', labelKey: 'nav.sell', icon: Storefront },
  { to: '/droiddex', labelKey: 'nav.droiddex', icon: Sparkle },
  { to: '/fusion', labelKey: 'nav.fusion', icon: Flask },
  { to: '/about', labelKey: 'nav.about', icon: Info },
  { to: '/settings', labelKey: 'nav.settings', icon: Gear },
] as const

const moreMobile = desktopNav.filter((item) =>
  ['/sell', '/droiddex', '/fusion', '/about', '/settings'].includes(item.to),
)

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  useScrollRestoration()
  useLastTabRestore()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    persistLastTab(location.pathname)
    setMoreOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-ui bg-ui-elevated">
        <div className="flex items-center gap-3 border-b border-ui p-5">
          <Logo className="h-8 w-8" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ui-fg">{t('app.name')}</p>
            <p className="truncate text-xs text-ui-muted">{t('app.subtitle')}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-ui-accent-soft text-ui-accent' : 'text-ui-secondary hover:bg-ui-hover',
                )
              }
            >
              <item.icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="shell-main-pad flex min-h-dvh min-w-0 flex-1 flex-col overflow-x-hidden md:ml-64 md:pb-6">
        <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1 flex-col px-4 md:py-8">
          <Outlet />
        </div>
      </main>

      <MobileFloatingNav
        moreOpen={moreOpen}
        onMoreToggle={() => setMoreOpen((open) => !open)}
        onCloseMore={() => setMoreOpen(false)}
      />

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={t('nav.more')}
        testId="nav-more-modal"
        anchorAboveMobileNav
      >
        <div className="grid gap-1">
          {moreMobile.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm',
                  isActive ? 'bg-ui-accent-soft text-ui-accent' : 'hover:bg-ui-hover',
                )
              }
            >
              <item.icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </div>
      </Modal>

      <InstallBanner />
    </div>
  )
}


</cursor_untrusted_data_1337>