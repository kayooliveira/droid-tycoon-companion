import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
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
    <div className="space-y-5 max-w-2xl pb-10">
      <h1 className="font-display text-2xl tracking-wide">{t('about.title')}</h1>
      <p className="text-sm text-zinc-400">{t('about.intro')}</p>

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
        <p className="text-xs text-zinc-500">{t('about.disputedNote')}</p>
        <ul className="list-disc pl-5 text-xs text-zinc-400 space-y-1">
          {(gameData.sources as Array<{ url?: string; name?: string }>).slice(0, 6).map((s, i) => (
            <li key={i}>
              {s.url ? (
                <a href={s.url} className="text-holo-300 hover:underline" target="_blank" rel="noreferrer">
                  {s.name ?? s.url}
                </a>
              ) : (
                s.name
              )}
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="space-y-3 text-sm">
        <h2 className="font-medium">{t('about.feedbackTitle')}</h2>
        <p className="text-zinc-400">{t('about.feedbackBody')}</p>
        <FeedbackWhatsAppLink />
      </GlassCard>

      <GlassCard className="text-xs text-zinc-500 space-y-2">
        <p>{t('app.disclaimer')}</p>
        <p>
          {t('about.url')}:{' '}
          <a href={APP_PUBLIC_URL} className="text-holo-300 hover:underline">
            {APP_PUBLIC_URL}
          </a>
        </p>
        <Link to="/settings" className="text-holo-300 hover:underline inline-block pt-2">
          {t('nav.settings')} →
        </Link>
      </GlassCard>
    </div>
  )
}
