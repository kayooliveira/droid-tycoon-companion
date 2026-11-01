import { Gear } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { uiIconProps } from '../components/ui/iconStyle'
import { gameDataSource } from '../data/dataSource'
import { gameData } from '../domain/gameData'
import { APP_PUBLIC_URL } from '../lib/constants'
import { FeedbackWhatsAppLink } from '../components/FeedbackWhatsAppLink'
import { Badge } from '../components/ui/Badge'
import { GlassCard } from '../components/ui/GlassCard'

export function AboutPage() {
  const { t } = useTranslation()
  const meta = gameDataSource.getMeta()
  const stale = gameDataSource.isStale()

  return (
    <div className="space-y-5 max-w-2xl pb-4" data-testid="about-page">
      <h1 className="hidden md:block font-display text-2xl tracking-wide">{t('about.title')}</h1>
      <p className="text-sm text-ui-muted">{t('about.intro')}</p>

      <GlassCard className="space-y-2 text-sm">
        <h2 className="font-medium">{t('about.dataTitle')}</h2>
        <p>
          {t('about.dataLine', {
            version: meta.dataVersion,
            game: meta.gameVersion,
            date: meta.lastUpdated,
          })}
        </p>
        {stale ? (
          <Badge tone="warn">{t('settings.dataStale', { days: gameData.staleAfterDays })}</Badge>
        ) : (
          <Badge tone="success">{t('settings.dataFresh')}</Badge>
        )}
        <p className="text-xs text-ui-soft">{t('about.disputedNote')}</p>
      </GlassCard>

      <GlassCard className="space-y-3 text-sm">
        <h2 className="font-medium">{t('about.feedbackTitle')}</h2>
        <p className="text-ui-muted">{t('about.feedbackBody')}</p>
        <FeedbackWhatsAppLink />
      </GlassCard>

      <Link to="/settings" className="block">
        <Button
          variant="secondary"
          className="w-full justify-start min-h-12"
          icon={<Gear {...uiIconProps} weight="fill" />}
        >
          {t('nav.settings')}
        </Button>
      </Link>

      <footer
        className="pt-6 space-y-2 text-[10px] leading-relaxed text-ui-soft"
        data-testid="about-credits-footer"
      >
        <p>{t('about.wikiCredits')}</p>
        <p>{t('about.dataSourcesBody')}</p>
        <p>{t('app.disclaimer')}</p>
        <p>
          {t('about.url')}:{' '}
          <a href={APP_PUBLIC_URL} className="text-ui-accent hover:underline">
            {APP_PUBLIC_URL}
          </a>
        </p>
      </footer>
    </div>
  )
}
