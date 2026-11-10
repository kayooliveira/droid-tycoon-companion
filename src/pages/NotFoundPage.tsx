import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { droidById } from '../domain/gameData'
import { droidImageSrc } from '../lib/images'
import { isDesignGateCapture } from '../e2e/designGate'
import { useGateTabbarAnchor } from '../hooks/useGateTabbarAnchor'

export function NotFoundPage() {
  useGateTabbarAnchor()
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (isDesignGateCapture()) {
    const r2 = droidById.get('r2')
    return (
      <div className="empty" style={{ paddingTop: 64 }} data-testid="not-found-page">
        <div className="empty-art" aria-hidden>
          {r2 ? (
            <span className="dtile dtile--missing" data-tier="default">
              <span className="dtile-bg" aria-hidden />
              <img
                src={droidImageSrc(r2.id, r2.imageLocal)}
                alt=""
                width={128}
                height={128}
                loading="eager"
              />
              <span className="dtile-q" aria-hidden>
                ?
              </span>
            </span>
          ) : null}
        </div>
        <h1 className="t-h2">Página não encontrada</h1>
        <p className="hint">Esse endereço não existe no app. Volte ao início para continuar.</p>
        <button type="button" className="btn btn--primary" onClick={() => navigate('/')}>
          Ir ao início
        </button>
      </div>
    )
  }

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
