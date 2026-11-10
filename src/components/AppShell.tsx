import { useEffect, useRef, useState } from 'react'
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
import { APP_OVERLAY_ROOT_ID } from '../lib/overlayRoot'
import { Logo } from './Logo'
import { InstallBanner } from './InstallBanner'
import { Sheet } from './ui/Sheet'
import { MobileFloatingNav } from './MobileFloatingNav'
import { ToastViewport } from './ToastProvider'

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
  const scrollRef = useRef<HTMLElement>(null)
  useScrollRestoration()
  useLastTabRestore()
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    persistLastTab(location.pathname)
    setMoreOpen(false)
  }, [location.pathname])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="shell-root flex min-h-dvh flex-col md:flex-row bg-[var(--c-bg)] text-[var(--c-text)]">
      <aside className="shell-desktop-aside md:fixed md:inset-y-0 md:w-64 md:flex-col border-r border-[var(--c-border)] bg-[var(--c-surface)]">
        <div className="flex items-center gap-3 border-b border-[var(--c-border)] p-5">
          <Logo className="h-8 w-8" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{t('app.name')}</p>
            <p className="truncate text-xs t-meta">{t('app.subtitle')}</p>
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
                  isActive
                    ? 'bg-[var(--c-surface-2)] text-[var(--c-accent-text)]'
                    : 'text-[var(--c-text-2)] hover:bg-[var(--c-surface-2)]',
                )
              }
            >
              <item.icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="app app-shell flex min-h-dvh min-w-0 flex-1 flex-col md:ml-64">
        <main ref={scrollRef} className="scroll" data-testid="app-scroll">
          <div className="mx-auto w-full min-w-0 max-w-6xl md:py-8">
            <Outlet />
          </div>
        </main>
        <ToastViewport />
        <MobileFloatingNav
          moreOpen={moreOpen}
          onMoreToggle={() => setMoreOpen((open) => !open)}
          onCloseMore={() => setMoreOpen(false)}
        />
        <div id={APP_OVERLAY_ROOT_ID} className="ds-overlay-anchor" data-testid="app-overlay-root" />
        <Sheet
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          testId="nav-more-menu"
          headerLabel={t('nav.more')}
          title={t('nav.more')}
          aboveTabBar
        >
          <div className="stack">
            {moreMobile.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) => cn('row row--link', isActive && 'row--active')}
              >
                <span className="row-ic" aria-hidden>
                  <item.icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
                </span>
                <span className="row-main">
                  <span className="dname">{t(item.labelKey)}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </Sheet>
      </div>

      <InstallBanner />
    </div>
  )
}
