import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { persistLastTab } from '../hooks/useLastTab'
import { TAB_BAR_ICONS } from './tabBarIcons'
const tabs = [
  { to: '/', labelKey: 'nav.dashboard', icon: TAB_BAR_ICONS.home, end: true as const },
  { to: '/progress', labelKey: 'nav.progress', icon: TAB_BAR_ICONS.progress },
  { to: '/inventory', labelKey: 'nav.inventory', icon: TAB_BAR_ICONS.inventory },
  { to: '/cycles', labelKey: 'nav.cycles', icon: TAB_BAR_ICONS.cycles },
  { to: 'more', labelKey: 'nav.more', icon: TAB_BAR_ICONS.more, isMore: true as const },
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

  const isMoreRoute = ['/droiddex', '/fusion', '/about', '/settings', '/sell'].some(
    (p) => location.pathname === p || location.pathname.startsWith(`${p}/`),
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
        const label = t(tab.labelKey)

        if (isMore) {
          return (
            <a
              key={tab.labelKey}
              href="#"
              role="button"
              className="tab"
              data-testid="mobile-more-nav"
              aria-label={t('a11y.openMoreNav')}
              aria-expanded={moreOpen}
              aria-current={active ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onMoreToggle()
              }}
            >
              <span className="tab-ic">{tab.icon}</span>
              <span className="tab-lbl">{label}</span>
            </a>
          )
        }

        return (
          <a
            key={tab.labelKey}
            href={tab.to}
            className="tab"
            data-testid={
              tab.to === '/' ? 'mobile-nav-home' : `mobile-nav-${String(tab.to).slice(1)}`
            }
            aria-current={active ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault()
              onCloseMore()
              if (typeof tab.to === 'string') {
                persistLastTab(tab.to)
                navigate(tab.to)
              }
            }}
          >
            <span className="tab-ic">{tab.icon}</span>
            <span className="tab-lbl">{label}</span>
          </a>
        )
      })}
    </nav>
  )
}
