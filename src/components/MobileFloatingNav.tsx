import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { List, Package, SquaresFour, Storefront, TreeStructure } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { UI_ICON_WEIGHT } from './ui/iconStyle'
import { Glass } from './ui/Glass'
import { cn } from '../lib/utils'
import { useNavMinimize } from '../hooks/useNavMinimize'

const tabs = [
  { to: '/', labelKey: 'nav.dashboard', icon: SquaresFour, end: true as const },
  { to: '/progress', labelKey: 'nav.progress', icon: TreeStructure },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Package },
  { to: '/sell', labelKey: 'nav.sell', icon: Storefront },
  { to: 'more', labelKey: 'nav.more', icon: List, isMore: true as const },
] as const

export function MobileFloatingNav({ onMore }: { onMore: () => void }) {
  const { t } = useTranslation()
  const location = useLocation()
  const minimized = useNavMinimize()
  const reducedMotion = useReducedMotion() ?? false
  const navRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const activeIndex = tabs.findIndex((tab) => {
    if ('isMore' in tab && tab.isMore) {
      return ['/droiddex', '/fusion', '/about', '/settings'].includes(location.pathname)
    }
    if ('end' in tab && tab.end) return location.pathname === tab.to
    if (typeof tab.to === 'string' && !('isMore' in tab)) return location.pathname === tab.to
    return false
  })

  useLayoutEffect(() => {
    const el = itemRefs.current[activeIndex >= 0 ? activeIndex : 0]
    const nav = navRef.current
    if (!el || !nav) return
    const navRect = nav.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setIndicator({ left: rect.left - navRect.left, width: rect.width })
  }, [activeIndex, minimized, location.pathname])

  return (
    <nav
      className="md:hidden fixed z-50 inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)]"
      aria-label="Main"
      data-testid="mobile-floating-nav"
      data-nav-minimized={minimized ? '1' : '0'}
    >
      <Glass
        ref={navRef}
        as="div"
        variant="regular"
        className={cn(
          'relative rounded-full shadow-2xl shadow-black/40 transition-[padding] duration-200',
          minimized ? 'p-1' : 'p-1.5',
        )}
      >
        {!reducedMotion ? (
          <motion.span
            className="absolute top-1 bottom-1 rounded-full pointer-events-none bg-holo-500/25 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
            layout={false}
            animate={{ left: indicator.left, width: indicator.width }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            style={{ left: indicator.left, width: indicator.width }}
            aria-hidden
          />
        ) : (
          <span
            className="absolute top-1 bottom-1 rounded-full pointer-events-none bg-holo-500/25 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
            style={{ left: indicator.left, width: indicator.width }}
            aria-hidden
          />
        )}
        <div className={cn('relative grid grid-cols-5 gap-0.5', minimized ? 'min-h-[2.75rem]' : 'min-h-[3.25rem]')}>
          {tabs.map((tab, i) => {
            const isMore = 'isMore' in tab && tab.isMore
            const isActive = i === activeIndex
            const Icon = tab.icon
            const common = cn(
              'relative z-10 flex flex-col items-center justify-center w-full min-h-[2.75rem] rounded-full',
              'text-[10px] gap-0.5 transition-colors',
              isActive ? 'text-holo-100' : 'text-zinc-400',
              minimized ? 'py-1.5' : 'py-2',
            )
            if (isMore) {
              return (
                <button
                  key={tab.labelKey}
                  type="button"
                  ref={(node) => {
                    itemRefs.current[i] = node
                  }}
                  data-testid="mobile-more-nav"
                  aria-label={t('a11y.openMoreNav')}
                  className={common}
                  onClick={onMore}
                >
                  <Icon size={minimized ? 22 : 20} weight={isActive ? 'fill' : UI_ICON_WEIGHT} />
                  {!minimized ? <span className="leading-tight px-0.5">{t(tab.labelKey)}</span> : null}
                </button>
              )
            }
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={'end' in tab ? tab.end : false}
                ref={(node) => {
                  itemRefs.current[i] = node
                }}
                className={common}
              >
                <Icon size={minimized ? 22 : 20} weight={isActive ? 'fill' : UI_ICON_WEIGHT} />
                {!minimized ? <span className="leading-tight px-0.5">{t(tab.labelKey)}</span> : null}
              </NavLink>
            )
          })}
        </div>
      </Glass>
    </nav>
  )
}
