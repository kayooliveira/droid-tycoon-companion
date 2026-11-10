import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { isDesignGateCapture } from '../../e2e/designGate'

export function MoreBackBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const gate = isDesignGateCapture()
  const label = gate ? 'Mais' : t('nav.more')
  const icon = (
    <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
  return (
    <div className="backbar">
      {gate ? (
        <a className="top-back" href="#" data-testid="more-back-link" onClick={(e) => e.preventDefault()}>
          {icon}
          {label}
        </a>
      ) : (
        <button type="button" className="top-back" data-testid="more-back-link" onClick={() => navigate(-1)}>
          {icon}
          {label}
        </button>
      )}
    </div>
  )
}
