<cursor_untrusted_data_1337 source="CallDynamicTool">

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'

export function NotFoundPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh flex items-center justify-center p-6 bg-ui-bg text-ui-fg">
      <GlassCard className="max-w-md w-full text-center space-y-4" data-testid="not-found-page">
        <h1 className="font-display text-xl tracking-wide">{t('notFound.title')}</h1>
        <p className="text-sm text-ui-muted text-pretty">{t('notFound.body')}</p>
        <Button type="button" onClick={() => navigate('/')}>
          {t('notFound.home')}
        </Button>
      </GlassCard>
    </div>
  )
}


</cursor_untrusted_data_1337>