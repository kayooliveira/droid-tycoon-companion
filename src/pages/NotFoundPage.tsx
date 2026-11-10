import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="app min-h-dvh">
      <main className="scroll">
        <div className="empty" data-testid="not-found-page">
          <h1 className="t-h2">{t('notFound.title')}</h1>
          <p className="hint">{t('notFound.body')}</p>
          <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
            {t('notFound.home')}
          </button>
        </div>
      </main>
    </div>
  )
}
