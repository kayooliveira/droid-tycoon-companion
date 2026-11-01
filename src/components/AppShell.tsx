import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Flask,
  Gear,
  Info,
  List,
  Package,
  Sparkle,
  SquaresFour,
  Storefront,
  TreeStructure,
} from '@phosphor-icons/react'
import { UI_ICON_SIZE, UI_ICON_WEIGHT } from './ui/iconStyle'
import { useScrollRestoration } from '../hooks/useScrollRestoration'
import { cn } from '../lib/utils'
import { Logo } from './Logo'
import { InstallBanner } from './InstallBanner'
import { Modal } from './ui/Modal'

const primaryMobile = [
  { to: '/', labelKey: 'nav.dashboard', icon: SquaresFour, end: true },
  { to: '/progress', labelKey: 'nav.progress', icon: TreeStructure },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Package },
  { to: '/sell', labelKey: 'nav.sell', icon: Storefront },
] as const

const moreMobile = [
  { to: '/droiddex', labelKey: 'nav.droiddex', icon: Sparkle },
  { to: '/fusion', labelKey: 'nav.fusion', icon: Flask },
  { to: '/about', labelKey: 'nav.about', icon: Info },
  { to: '/settings', labelKey: 'nav.settings', icon: Gear },
] as const

const desktopNav = [...primaryMobile, ...moreMobile]

const routeTitleKeys: Record<string, string> = {
  '/': 'nav.dashboard',
  '/progress': 'nav.progress',
  '/inventory': 'nav.inventory',
  '/sell': 'nav.sell',
  '/droiddex': 'nav.droiddex',
  '/fusion': 'nav.fusion',
  '/settings': 'nav.settings',
  '/about': 'about.title',
}

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  useScrollRestoration()
  const [moreOpen, setMoreOpen] = useState(false)
  const titleKey = routeTitleKeys[location.pathname] ?? 'app.name'

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-white/10 bg-surface-900/80 backdrop-blur-xl">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <Logo className="h-8 w-8" />
          <div className="min-w-0">
            <p className="font-display text-sm tracking-wider text-gradient-holo truncate">{t('app.name')}</p>
            <p className="text-xs text-zinc-400 truncate">{t('app.subtitle')}</p>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {desktopNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item && item.end === true}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-holo-600/20 text-holo-200' : 'text-zinc-300 hover:bg-white/5',
                )
              }
            >
              <item.icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
        <footer className="p-4 text-[10px] leading-relaxed text-zinc-500 border-t border-white/10">
          {t('app.disclaimer')}
        </footer>
      </aside>

      <main className="flex-1 md:ml-64 pb-[4.75rem] md:pb-6">
        <header className="sticky-mobile-header md:hidden sticky top-0 z-40 border-b border-white/10 bg-surface-950/90 backdrop-blur-xl px-4 py-3 flex items-center gap-3 min-h-[3.25rem]">
          <Logo className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-sm tracking-wide truncate">{t(titleKey)}</h1>
            <p className="text-[10px] text-zinc-500 truncate">{t('app.shortName')}</p>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-8 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <Outlet />
        </div>
      </main>

      <nav
        className="mobile-bottom-nav md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-surface-900/98 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
        aria-label="Main"
      >
        <div className="grid grid-cols-5 gap-0.5 px-1 py-1">
          {primaryMobile.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-2 rounded-xl text-[10px] gap-0.5 min-h-[3rem]',
                  isActive ? 'text-holo-300 bg-white/5' : 'text-zinc-400',
                )
              }
            >
              <item.icon size={20} weight={UI_ICON_WEIGHT} />
              <span className="leading-tight text-center px-0.5">{t(item.labelKey)}</span>
            </NavLink>
          ))}
          <button
            type="button"
            data-testid="mobile-more-nav"
            aria-label={t('a11y.openMoreNav')}
            onClick={() => setMoreOpen(true)}
            className={cn(
              'flex flex-col items-center justify-center py-2 rounded-xl text-[10px] gap-0.5 min-h-[3rem] text-zinc-400',
              moreMobile.some((m) => location.pathname === m.to) && 'text-holo-300 bg-white/5',
            )}
          >
            <List size={20} weight={UI_ICON_WEIGHT} />
            <span>{t('nav.more')}</span>
          </button>
        </div>
      </nav>

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title={t('nav.more')}>
        <div className="grid gap-1">
          {moreMobile.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm',
                  isActive ? 'bg-holo-600/20 text-holo-200' : 'hover:bg-white/5',
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
