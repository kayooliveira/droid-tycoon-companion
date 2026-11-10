import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function MoreBackBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="backbar">
      <button
        type="button"
        className="top-back"
        data-testid="more-back-link"
        onClick={() => navigate(-1)}
      >
        <svg className="ic" width={20} height={20} viewBox="0 0 24 24" aria-hidden>
          <path d="m9 5 7 7-7 7" />
        </svg>
        {t('nav.more')}
      </button>
    </div>
  )
}
