import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Flask,
  Gear,
  Info,
  MapTrifold,
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
import { Glass } from './ui/Glass'
import { MobileFloatingNav } from './MobileFloatingNav'

const desktopNav = [
  { to: '/', labelKey: 'nav.dashboard', icon: SquaresFour, end: true as const },
  { to: '/progress', labelKey: 'nav.progress', icon: TreeStructure },
  { to: '/cycles', labelKey: 'nav.cycles', icon: MapTrifold },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Package },
  { to: '/sell', labelKey: 'nav.sell', icon: Storefront },
  { to: '/droiddex', labelKey: 'nav.droiddex', icon: Sparkle },
  { to: '/fusion', labelKey: 'nav.fusion', icon: Flask },
  { to: '/about', labelKey: 'nav.about', icon: Info },
  { to: '/settings', labelKey: 'nav.settings', icon: Gear },
] as const

const routeTitleKeys: Record<string, string> = {
  '/': 'nav.dashboard',
  '/progress': 'nav.progress',
  '/cycles': 'nav.cycles',
  '/inventory': 'nav.inventory',
  '/sell': 'nav.sell',
  '/droiddex': 'nav.droiddex',
  '/fusion': 'nav.fusion',
  '/settings': 'nav.settings',
  '/about': 'about.title',
}

const moreMobile = desktopNav.filter((item) =>
  ['/sell', '/droiddex', '/fusion', '/about', '/settings'].includes(item.to),
)

export function AppShell() {
  const { t } = useTranslation()
  const location = useLocation()
  useScrollRestoration()
  const [moreOpen, setMoreOpen] = useState(false)
  const titleKey = routeTitleKeys[location.pathname] ?? 'app.name'

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-white/10 bg-surface-900">
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
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors min-h-11',
                  isActive ? 'bg-holo-600/20 text-holo-200' : 'text-zinc-300 hover:bg-white/5',
                )
              }
            >
              <item.icon size={UI_ICON_SIZE} weight={UI_ICON_WEIGHT} />
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 md:ml-64 shell-main-pad md:pb-6">
        <Glass
          as="header"
          variant="regular"
          className="glass-nav md:hidden sticky top-0 z-40 mx-3 mt-2 rounded-2xl px-4 py-3 flex items-center gap-3 min-h-[3.25rem]"
        >
          <Logo className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-sm tracking-wide truncate">{t(titleKey)}</h1>
            <p className="text-[10px] text-zinc-500 truncate">{t('app.shortName')}</p>
          </div>
        </Glass>
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-8 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Outlet />
        </div>
      </main>

      <MobileFloatingNav onMore={() => setMoreOpen(true)} />

      <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title={t('nav.more')}>
        <div className="grid gap-1">
          {moreMobile.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMoreOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm min-h-11',
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
