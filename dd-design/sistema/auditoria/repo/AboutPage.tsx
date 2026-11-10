<cursor_untrusted_data_1337 source="CallDynamicTool">

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { gameDataSource } from '../data/dataSource'
import { gameData } from '../domain/gameData'
import { APP_PUBLIC_URL } from '../lib/constants'
import { FeedbackWhatsAppLink } from '../components/FeedbackWhatsAppLink'
import { TabScrollLayout } from '../components/layout/TabScrollLayout'
import { InsetGroup } from '../components/ui/InsetGroup'

export function AboutPage() {
  const { t } = useTranslation()
  const meta = gameDataSource.getMeta()
  const stale = gameDataSource.isStale()

  return (
    <TabScrollLayout title={t('about.title')} testId="about-page">
      <InsetGroup footer={t('app.disclaimer')}>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('about.intro')}</span>
          </div>
        </div>
      </InsetGroup>

      <h2 className="dc-section-header">{t('about.dataTitle')}</h2>
      <InsetGroup footer={t('about.disputedNote')}>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('about.dataLine', {
              version: meta.dataVersion,
              game: meta.gameVersion,
              date: meta.lastUpdated,
            })}</span>
            <span className="dc-row-sub">
              {stale
                ? t('settings.dataStale', { days: gameData.staleAfterDays })
                : t('settings.dataFresh')}
            </span>
          </div>
        </div>
      </InsetGroup>

      <h2 className="dc-section-header">{t('about.feedbackTitle')}</h2>
      <InsetGroup>
        <div className="dc-row">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('about.feedbackBody')}</span>
          </div>
        </div>
        <div className="dc-row">
          <FeedbackWhatsAppLink />
        </div>
      </InsetGroup>

      <InsetGroup>
        <Link to="/settings" className="dc-row dc-row-chevron">
          <div className="dc-row-main">
            <span className="dc-row-label">{t('nav.settings')}</span>
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


</cursor_untrusted_data_1337>