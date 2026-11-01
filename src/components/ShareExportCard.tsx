import { LinkSimple, ShareNetwork, WhatsappLogo } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_PUBLIC_URL, WHATSAPP_SHARE_BASE } from '../lib/constants'
import { renderShareProgressCard } from '../lib/shareProgressCard'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { GlassCard } from './ui/GlassCard'
import { HelpHint } from './ui/HelpHint'
import { IconButton } from './ui/IconButton'
import { SectionHeader } from './ui/SectionHeader'
import { uiIconProps } from './ui/iconStyle'

async function downloadOrShare(blob: Blob, filename: string, mime: string) {
  const file = new File([blob], filename, { type: mime })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return
    } catch {
      /* fall through */
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ShareExportCard() {
  const { t } = useTranslation()
  const { push } = useToast()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const locale = useAppStore((s) => s.settings.locale)
  const [busy, setBusy] = useState<'card' | null>(null)

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
        /* cancelled */
      }
    }
    await navigator.clipboard.writeText(`${shareText}\n${APP_PUBLIC_URL}`)
    push(t('share.linkCopied'))
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${APP_PUBLIC_URL}`)
    window.open(`${WHATSAPP_SHARE_BASE}${text}`, '_blank', 'noopener,noreferrer')
  }

  const shareProgressImage = async () => {
    setBusy('card')
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
        push(t('share.cardShared'))
        return
      }
      await downloadOrShare(blob, 'droid-tycoon-progress.png', 'image/png')
      push(t('share.cardDownloaded'))
    } catch {
      push(t('share.cardFailed'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <GlassCard className="p-4" data-testid="share-export-card">
      <SectionHeader
        icon={<ShareNetwork {...uiIconProps} />}
        title={t('shareExport.title')}
        action={
          <HelpHint label={t('shareExport.hintLabel')} text={t('shareExport.hint')} />
        }
      />
      <div className="flex flex-wrap gap-2">
        <IconButton variant="soft" label={t('share.shareApp')} data-testid="share-app" onClick={() => void shareApp()}>
          <LinkSimple {...uiIconProps} />
        </IconButton>
        <IconButton variant="soft" label={t('share.whatsapp')} onClick={shareWhatsApp}>
          <WhatsappLogo {...uiIconProps} />
        </IconButton>
        <IconButton
          variant="solid"
          label={t('share.progressCard')}
          disabled={busy !== null}
          data-testid="share-progress-card"
          onClick={() => void shareProgressImage()}
        >
          {busy === 'card' ? '…' : <ShareNetwork {...uiIconProps} />}
        </IconButton>
      </div>
      <p className="text-[11px] text-zinc-500 mt-2 text-pretty">{t('shareExport.footer')}</p>
    </GlassCard>
  )
}
