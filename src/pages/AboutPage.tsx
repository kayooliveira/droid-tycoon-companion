import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { gameDataSource } from '../data/dataSource'
import { gameData } from '../domain/gameData'
import { APP_PUBLIC_URL } from '../lib/constants'
import { FeedbackWhatsAppLink } from '../components/FeedbackWhatsAppLink'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { MoreBackBar } from '../components/layout/MoreBackBar'
import { InsetGroup } from '../components/ui/InsetGroup'

export function AboutPage() {
  const { t } = useTranslation()
  const meta = gameDataSource.getMeta()
  const stale = gameDataSource.isStale()

  return (
    <TabScrollLayout title={t('about.title')} testId="about-page" backBar={<MoreBackBar />}>
      <InsetGroup footer={t('app.disclaimer')}>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('about.intro')}</span>
          </div>
        </div>
      </InsetGroup>

      <h2 className="sec-h">{t('about.dataTitle')}</h2>
      <InsetGroup footer={t('about.disputedNote')}>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('about.dataLine', {
              version: meta.dataVersion,
              game: meta.gameVersion,
              date: meta.lastUpdated,
            })}</span>
            <span className="hint">
              {stale
                ? t('settings.dataStale', { days: gameData.staleAfterDays })
                : t('settings.dataFresh')}
            </span>
          </div>
        </div>
      </InsetGroup>

      <h2 className="sec-h">{t('about.feedbackTitle')}</h2>
      <InsetGroup>
        <div className="row">
          <div className="row-main">
            <span className="row-title">{t('about.feedbackBody')}</span>
          </div>
        </div>
        <div className="row">
          <FeedbackWhatsAppLink />
        </div>
      </InsetGroup>

      <InsetGroup>
        <Link to="/settings" className="row row row--link">
          <div className="row-main">
            <span className="row-title">{t('nav.settings')}</span>
          </div>
        </Link>
      </InsetGroup>

      <footer
        className="px-4 pt-4 pb-8 space-y-2 text-[11px] leading-relaxed text-ui-muted"
        data-testid="about-credits-footer"
      >
        <p>{t('about.wikiCredits')}</p>
        <p>{t('about.dataSourcesBody')}</p>
        <p>
          {t('about.url')}:{' '}
          <a href={APP_PUBLIC_URL} className="text-ui-accent hover:underline">
            {APP_PUBLIC_URL}
          </a>
        </p>
      </footer>
    </TabScrollLayout>
  )
}
