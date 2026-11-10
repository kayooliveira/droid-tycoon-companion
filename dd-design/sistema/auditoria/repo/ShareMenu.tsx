<cursor_untrusted_data_1337 source="CallDynamicTool">

import { ShareNetwork } from '@phosphor-icons/react'
import { uiIconProps } from './ui/iconStyle'
import { useTranslation } from 'react-i18next'
import { APP_PUBLIC_URL, WHATSAPP_SHARE_BASE } from '../lib/constants'
import { renderShareProgressCard } from '../lib/shareProgressCard'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { Button } from './ui/Button'
import { GlassCard } from './ui/GlassCard'

export function ShareMenu({ compact }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { push } = useToast()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const locale = useAppStore((s) => s.settings.locale)

  const shareText = t('share.message', { url: APP_PUBLIC_URL })

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('app.name'),
          text: shareText,
          url: APP_PUBLIC_URL,
        })
        return
      } catch {
        /* user cancelled */
      }
    }
    await navigator.clipboard.writeText(`${shareText}\n${APP_PUBLIC_URL}`)
    push(t('share.linkCopied'), { variant: 'success' })
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${APP_PUBLIC_URL}`)
    window.open(`${WHATSAPP_SHARE_BASE}${text}`, '_blank', 'noopener,noreferrer')
  }

  const shareProgressImage = async () => {
    try {
      const blob = await renderShareProgressCard({
        pathId: progress.pathId,
        nextRebirth: progress.nextRebirth,
        completedOnPath: progress.completedOnPath,
        inventory,
        locale: locale === 'pt-BR' ? 'pt-BR' : 'en',
      })
      const file = new File([blob], 'droid-tycoon-progress.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t('share.cardTitle'),
          text: APP_PUBLIC_URL,
        })
        push(t('share.cardShared'), { variant: 'success' })
        return
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'droid-tycoon-progress.png'
      a.click()
      URL.revokeObjectURL(url)
      push(t('share.cardDownloaded'), { variant: 'success' })
    } catch {
      push(t('share.cardFailed'), { variant: 'error' })
    }
  }

  return (
    <div data-testid="share-menu">
    <GlassCard className="space-y-3">
      <div className="flex items-center gap-2">
        <ShareNetwork {...uiIconProps} className="text-ui-accent" />
        <h2 className="font-medium text-sm">{t('share.title')}</h2>
      </div>
      <p className="text-xs text-ui-muted">{t('share.hint')}</p>
      <div className={`flex flex-wrap gap-2 ${compact ? '' : ''}`}>
        <Button variant="secondary" className="min-h-11" data-testid="share-app" onClick={shareApp}>
          {t('share.shareApp')}
        </Button>
        <Button variant="secondary" className="min-h-11" onClick={shareWhatsApp}>
          {t('share.whatsapp')}
        </Button>
        <Button variant="primary" className="min-h-11" data-testid="share-progress-card" onClick={shareProgressImage}>
          {t('share.progressCard')}
        </Button>
      </div>
    </GlassCard>
    </div>
  )
}


</cursor_untrusted_data_1337>