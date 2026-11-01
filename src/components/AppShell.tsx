import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  FlaskConical,
  LayoutDashboard,
  ListTree,
  Package,
  Settings,
  Sparkles,
  Store,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Logo } from './Logo'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/progress', label: 'Progress', icon: ListTree },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/sell', label: 'Sell', icon: Store },
  { to: '/droiddex', label: 'Droiddex', icon: Sparkles },
  { to: '/fusion', label: 'Fusion', icon: FlaskConical },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-dvh flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-white/10 bg-surface-900/80 backdrop-blur-xl">
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <Logo className="h-10 w-10" />
          <div>
            <p className="font-display text-sm tracking-wider text-gradient-holo">DROID TYCOON</p>
            <p className="text-xs text-zinc-400">Companion</p>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-holo-600/20 text-holo-200' : 'text-zinc-300 hover:bg-white/5',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <footer className="p-4 text-[10px] leading-relaxed text-zinc-500 border-t border-white/10">
          Fan-made companion tool. Not affiliated with Epic Games, Lucasfilm, Disney, or FOAD.
        </footer>
      </aside>

      <main className="flex-1 md:ml-64 pb-20 md:pb-6">
        <header className="md:hidden sticky top-0 z-40 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <p className="font-display text-xs tracking-wider">Droid Tycoon Companion</p>
            <p className="text-[10px] text-zinc-500 truncate">{location.pathname || '/'}</p>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-5 md:py-8">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-surface-900/95 backdrop-blur-xl">
        <div className="flex overflow-x-auto no-scrollbar px-1 py-1 gap-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center min-w-[4.5rem] px-2 py-2 rounded-xl text-[10px] gap-1',
                  isActive ? 'text-holo-300 bg-white/5' : 'text-zinc-400',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
