import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { List, Package, SquaresFour, Storefront, TreeStructure } from '@phosphor-icons/react'
import { UI_ICON_WEIGHT } from './ui/iconStyle'
import { Glass } from './ui/Glass'
import { cn } from '../lib/utils'
import { useNavMinimize } from '../hooks/useNavMinimize'

const INDICATOR_INSET_X = 3
const INDICATOR_INSET_Y = 4

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
  const gridRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Array<HTMLDivElement | null>>([])
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
    const grid = gridRef.current
    const idx = activeIndex >= 0 ? activeIndex : 0
    const slot = slotRefs.current[idx]
    if (!grid || !slot) return

    const measure = () => {
      const gridRect = grid.getBoundingClientRect()
      const slotRect = slot.getBoundingClientRect()
      const fullWidth = slotRect.width
      const fullLeft = slotRect.left - gridRect.left
      setIndicator({
        left: fullLeft + INDICATOR_INSET_X,
        width: Math.max(0, fullWidth - INDICATOR_INSET_X * 2),
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(grid)
    ro.observe(slot)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [activeIndex, minimized, location.pathname])

  return (
    <nav
      className="md:hidden fixed z-50 inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)]"
      aria-label="Main"
      data-testid="mobile-floating-nav"
      data-nav-minimized={minimized ? '1' : '0'}
    >
      <Glass
        as="div"
        variant="regular"
        className={cn(
          'glass-nav relative rounded-full shadow-2xl shadow-black/40 transition-[padding] duration-200',
          minimized ? 'p-1' : 'p-1.5',
        )}
      >
        <div
          ref={gridRef}
          className={cn(
            'relative grid grid-cols-5 gap-0.5',
            minimized ? 'min-h-[2.75rem]' : 'min-h-[3.25rem]',
          )}
        >
          <div
            className="nav-tab-indicator pointer-events-none absolute rounded-full bg-holo-500/30 border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] transition-[left,width] duration-300 ease-out"
            style={{
              left: indicator.width > 0 ? indicator.left : 0,
              width: indicator.width,
              top: INDICATOR_INSET_Y,
              bottom: INDICATOR_INSET_Y,
            }}
            aria-hidden
          />
          {tabs.map((tab, i) => {
            const isMore = 'isMore' in tab && tab.isMore
            const isActive = i === activeIndex
            const Icon = tab.icon
            const slotClass = cn(
              'relative z-10 flex flex-col items-center justify-center min-h-[2.75rem] rounded-full',
              'text-[10px] gap-0.5 transition-colors',
              isActive ? 'text-white' : 'text-zinc-500',
              minimized ? 'py-1.5' : 'py-2',
            )
            return (
              <div
                key={tab.labelKey}
                ref={(node) => {
                  slotRefs.current[i] = node
                }}
                className="min-w-0"
              >
                {isMore ? (
                  <button
                    type="button"
                    data-testid="mobile-more-nav"
                    aria-label={t('a11y.openMoreNav')}
                    className={cn(slotClass, 'w-full')}
                    onClick={onMore}
                  >
                    <Icon size={minimized ? 22 : 20} weight={isActive ? 'fill' : UI_ICON_WEIGHT} />
                    {!minimized ? (
                      <span className="leading-tight px-0.5 truncate max-w-full">{t(tab.labelKey)}</span>
                    ) : null}
                  </button>
                ) : (
                  <NavLink
                    to={tab.to}
                    end={'end' in tab ? tab.end : false}
                    className={cn(slotClass, 'w-full')}
                  >
                    <Icon size={minimized ? 22 : 20} weight={isActive ? 'fill' : UI_ICON_WEIGHT} />
                    {!minimized ? (
                      <span className="leading-tight px-0.5 truncate max-w-full">{t(tab.labelKey)}</span>
                    ) : null}
                  </NavLink>
                )}
              </div>
            )
          })}
        </div>
      </Glass>
    </nav>
  )
}
