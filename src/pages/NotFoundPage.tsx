import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { droidById } from '../domain/gameData'
import { DroidImage } from '../components/DroidImage'
import { isDesignGateCapture } from '../e2e/designGate'
import { useGateTabbarAnchor } from '../hooks/useGateTabbarAnchor'

const GATE_EMPTY_DROIDS = ['r2', 'bb', 'mouse'] as const

export function NotFoundPage() {
  useGateTabbarAnchor()
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (isDesignGateCapture()) {
    return (
      <div className="app min-h-dvh">
        <main className="scroll">
          <div className="empty" style={{ paddingTop: 64 }} data-testid="not-found-page">
            <div className="empty-art" aria-hidden>
              {GATE_EMPTY_DROIDS.map((id) => {
                const d = droidById.get(id)
                return d ? <DroidImage key={id} droid={d} tier="default" missing priority /> : null
              })}
            </div>
            <h1 className="t-h2">Página não encontrada</h1>
            <p className="hint">Esse endereço não existe no app. Volte ao início para continuar.</p>
            <button
              type="button"
              className="btn btn--primary"
              style={{ width: '100%', maxWidth: 312 }}
              onClick={() => navigate('/')}
            >
              Ir ao início
            </button>
          </div>
        </main>
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
