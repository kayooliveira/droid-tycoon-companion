import { useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Backpack, List, MapTrifold, SquaresFour, TreeStructure } from '@phosphor-icons/react'
import { UI_ICON_WEIGHT } from './ui/iconStyle'
import { Glass } from './ui/Glass'
import { cn } from '../lib/utils'
import { persistLastTab } from '../hooks/useLastTab'

const INDICATOR_INSET_X = 3
const INDICATOR_INSET_Y = 4

const tabs = [
  { to: '/', labelKey: 'nav.dashboard', icon: SquaresFour, end: true as const },
  { to: '/progress', labelKey: 'nav.progress', icon: TreeStructure },
  { to: '/inventory', labelKey: 'nav.inventory', icon: Backpack },
  { to: '/cycles', labelKey: 'nav.cycles', icon: MapTrifold },
  { to: 'more', labelKey: 'nav.more', icon: List, isMore: true as const },
] as const

export function MobileFloatingNav({
  moreOpen,
  onMoreToggle,
  onCloseMore,
}: {
  moreOpen: boolean
  onMoreToggle: () => void
  onCloseMore: () => void
}) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const gridRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Array<HTMLDivElement | null>>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  const activeIndex = (() => {
    if (moreOpen) {
      return tabs.findIndex((tab) => 'isMore' in tab && tab.isMore)
    }
    return tabs.findIndex((tab) => {
      if ('isMore' in tab && tab.isMore) {
        return ['/droiddex', '/fusion', '/about', '/settings', '/sell'].includes(location.pathname)
      }
      if ('end' in tab && tab.end) return location.pathname === tab.to
      if (typeof tab.to === 'string' && !('isMore' in tab)) return location.pathname === tab.to
      return false
    })
  })()

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
  }, [activeIndex, location.pathname, moreOpen])

  return (
    <nav
      className="md:hidden fixed z-nav inset-x-3 bottom-[calc(env(safe-area-inset-bottom,0px)+12px)] pointer-events-auto"
      aria-label={t('a11y.mainNav')}
      data-testid="mobile-floating-nav"
    >
      <Glass
        as="div"
        variant="regular"
        className="glass-nav glass-nav-liquid relative rounded-full shadow-2xl shadow-black/25 p-1.5"
      >
        <div ref={gridRef} className="relative grid grid-cols-5 gap-0.5 min-h-[3.25rem]">
          <div
            className="nav-tab-indicator nav-glass-lens pointer-events-none absolute rounded-full transition-[left,width] duration-300 ease-out"
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
              'text-[10px] gap-0.5 transition-colors py-2',
              isActive ? 'text-ui-fg' : 'text-ui-soft',
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
                    aria-expanded={moreOpen}
                    className={cn(slotClass, 'w-full')}
                    onClick={onMoreToggle}
                  >
                    <Icon size={20} weight={isActive ? 'fill' : UI_ICON_WEIGHT} />
                    <span className="leading-tight px-0.5 truncate max-w-full">{t(tab.labelKey)}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid={
                      tab.to === '/'
                        ? 'mobile-nav-home'
                        : `mobile-nav-${String(tab.to).slice(1)}`
                    }
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(slotClass, 'w-full relative z-20 touch-manipulation border-0 bg-transparent')}
                    onClick={() => {
                      onCloseMore()
                      if (typeof tab.to === 'string') {
                        persistLastTab(tab.to)
                        navigate(tab.to)
                      }
                    }}
                  >
                    <Icon size={20} weight={isActive ? 'fill' : UI_ICON_WEIGHT} />
                    <span className="leading-tight px-0.5 truncate max-w-full">{t(tab.labelKey)}</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </Glass>
    </nav>
  )
}
