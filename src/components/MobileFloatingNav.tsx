import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Backpack, List, MapTrifold, SquaresFour, TreeStructure } from '@phosphor-icons/react'
import { UI_ICON_WEIGHT } from './ui/iconStyle'
import { persistLastTab } from '../hooks/useLastTab'

const tabs = [
  { to: '/', labelKey: 'nav.dashboard', Icon: SquaresFour, end: true as const },
  { to: '/progress', labelKey: 'nav.progress', Icon: TreeStructure },
  { to: '/inventory', labelKey: 'nav.inventory', Icon: Backpack },
  { to: '/cycles', labelKey: 'nav.cycles', Icon: MapTrifold },
  { to: 'more', labelKey: 'nav.more', Icon: List, isMore: true as const },
] as const

function TabIcon({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <span className="tab-ic">
      <span
        className="ic inline-flex"
        style={{ color: active ? undefined : 'currentColor' }}
        aria-hidden
      >
        {children}
      </span>
    </span>
  )
}

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

  const isMoreRoute = ['/droiddex', '/fusion', '/about', '/settings', '/sell'].includes(
    location.pathname,
  )

  const isActive = (tab: (typeof tabs)[number]) => {
    if ('isMore' in tab && tab.isMore) return moreOpen || isMoreRoute
    if (moreOpen) return false
    if ('end' in tab && tab.end) return location.pathname === tab.to
    return location.pathname === tab.to
  }

  return (
    <nav className="tabbar" aria-label={t('a11y.mainNav')} data-testid="mobile-floating-nav">
      {tabs.map((tab) => {
        const active = isActive(tab)
        const isMore = 'isMore' in tab && tab.isMore
        const weight = active ? 'fill' : UI_ICON_WEIGHT
        const label = t(tab.labelKey)

        if (isMore) {
          return (
            <button
              key={tab.labelKey}
              type="button"
              className="tab"
              data-testid="mobile-more-nav"
              aria-label={t('a11y.openMoreNav')}
              aria-expanded={moreOpen}
              aria-current={active ? 'page' : undefined}
              onClick={onMoreToggle}
            >
              <TabIcon active={active}>
                <tab.Icon size={24} weight={weight} />
              </TabIcon>
              {label}
            </button>
          )
        }

        return (
          <button
            key={tab.labelKey}
            type="button"
            className="tab"
            data-testid={
              tab.to === '/' ? 'mobile-nav-home' : `mobile-nav-${String(tab.to).slice(1)}`
            }
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              onCloseMore()
              if (typeof tab.to === 'string') {
                persistLastTab(tab.to)
                navigate(tab.to)
              }
            }}
          >
            <TabIcon active={active}>
              <tab.Icon size={24} weight={weight} />
            </TabIcon>
            {label}
          </button>
        )
      })}
    </nav>
  )
}
