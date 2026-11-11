import { useEffect, useMemo, useRef, useState } from 'react'
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
import { gameData } from '../domain/gameData'
import { analyzeSellCenter, summarizeSellCenter } from '../domain/sellCenter'
import { useAppStore } from '../store/useAppStore'
import { MORE_MENU_ICONS } from './tabBarIcons'
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

const moreMobile = [
  { to: '/sell', labelKey: 'nav.sell', icon: MORE_MENU_ICONS.sell, hintKey: 'nav.moreHintSellCount' },
  { to: '/droiddex', labelKey: 'nav.droiddex', icon: MORE_MENU_ICONS.droiddex, hintKey: 'nav.moreHintDroiddexCount' },
  { to: '/fusion', labelKey: 'nav.fusion', icon: MORE_MENU_ICONS.fusion, hintKey: 'nav.moreHintFusion' },
  { to: '/about', labelKey: 'nav.about', icon: MORE_MENU_ICONS.about, hintKey: 'nav.moreHintAbout' },
  { to: '/settings', labelKey: 'nav.settings', icon: MORE_MENU_ICONS.settings, hintKey: 'nav.moreHintSettings' },
] as const

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  const [moreOpen, setMoreOpen] = useState(false)
  const scrollRef = useRef<HTMLElement>(null)
  useScrollRestoration()
  useLastTabRestore()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)

  const sellableNow = useMemo(() => {
    return summarizeSellCenter(
      analyzeSellCenter(progress.pathId, progress.nextRebirth, inventory),
    ).sellable
  }, [inventory, progress.nextRebirth, progress.pathId])

  const moreHint = (hintKey: string) => {
    if (hintKey === 'nav.moreHintSellCount') {
      return t(hintKey, { count: sellableNow })
    }
    if (hintKey === 'nav.moreHintDroiddexCount') {
      return t(hintKey, { count: gameData.droids.length })
    }
    return t(hintKey)
  }

  useEffect(() => {
    persistLastTab(location.pathname)
    const q = new URLSearchParams(location.search)
    if (q.get('e2e_more') === '1') {
      setMoreOpen(true)
    } else {
      setMoreOpen(false)
    }
  }, [location.pathname, location.search])

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
        <InstallBanner />
        <MobileFloatingNav
          moreOpen={moreOpen}
          onMoreToggle={() => setMoreOpen((open) => !open)}
          onCloseMore={() => setMoreOpen(false)}
        />
        <Sheet
          open={moreOpen}
          onClose={() => setMoreOpen(false)}
          testId="nav-more-menu"
          title={t('nav.more')}
          aboveTabBar
        >
          {moreMobile.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) => cn('row', isActive && 'row--active')}
            >
              <span className="row-ic" aria-hidden>
                {item.icon}
              </span>
              <span className="row-main">
                <span className="dname" style={{ display: 'block' }}>
                  {t(item.labelKey)}
                </span>
                <span className="hint" style={{ display: 'block' }}>
                  {moreHint(item.hintKey)}
                </span>
              </span>
              <span className="chev" aria-hidden>
                <svg className="ic" width={20} height={20} viewBox="0 0 24 24">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </span>
            </NavLink>
          ))}
        </Sheet>
      </div>

      <div id={APP_OVERLAY_ROOT_ID} className="ds-overlay-anchor" data-testid="app-overlay-root" />
    </div>
  )
}
