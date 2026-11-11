<cursor_untrusted_data_1337 source="CallDynamicTool">

import { DownloadSimple } from '@phosphor-icons/react'
import { uiIconProps } from './ui/iconStyle'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { Button } from './ui/Button'
import { GlassCard } from './ui/GlassCard'

export function DownloadCycleMenu({ compact }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { push } = useToast()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const locale = useAppStore((s) => s.settings.locale)
  const [busy, setBusy] = useState<'pdf' | 'png' | null>(null)

  const runExport = async (format: 'pdf' | 'png') => {
    setBusy(format)
    try {
      const { exportCyclePdf, exportCyclePngChunks } = await import('../lib/exportCycle')
      if (format === 'pdf') {
        const blob = await exportCyclePdf({
          pathId: progress.pathId,
          nextRebirth: progress.nextRebirth,
          completedOnPath: progress.completedOnPath,
          inventory,
          locale: locale === 'pt-BR' ? 'pt-BR' : 'en',
        })
        await downloadOrShare(blob, `droid-ciclo-${progress.pathId}.pdf`, 'application/pdf')
        push(t('exportCycle.pdfDone'), { variant: 'success' })
      } else {
        const blobs = await exportCyclePngChunks({
          pathId: progress.pathId,
          nextRebirth: progress.nextRebirth,
          completedOnPath: progress.completedOnPath,
          inventory,
          locale: locale === 'pt-BR' ? 'pt-BR' : 'en',
        })
        for (let i = 0; i < blobs.length; i++) {
          await downloadOrShare(
            blobs[i]!,
            `droid-ciclo-${progress.pathId}-${i + 1}.png`,
            'image/png',
          )
        }
        push(t('exportCycle.pngDone', { count: blobs.length }), { variant: 'success' })
      }
    } catch {
      push(t('exportCycle.failed'), { variant: 'error' })
    } finally {
      setBusy(null)
    }
  }

  const body = (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        className="min-h-11"
        disabled={busy !== null}
        data-testid="export-cycle-pdf"
        onClick={() => void runExport('pdf')}
      >
        {busy === 'pdf' ? '…' : t('exportCycle.pdf')}
      </Button>
      <Button
        variant="secondary"
        className="min-h-11"
        disabled={busy !== null}
        data-testid="export-cycle-png"
        onClick={() => void runExport('png')}
      >
        {busy === 'png' ? '…' : t('exportCycle.png')}
      </Button>
    </div>
  )

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center" data-testid="download-cycle-menu">
        <DownloadSimple {...uiIconProps} className="text-ui-accent shrink-0" />
        {body}
      </div>
    )
  }

  return (
    <GlassCard className="space-y-3" data-testid="download-cycle-menu">
      <div className="flex items-center gap-2">
        <DownloadSimple {...uiIconProps} className="text-ui-accent" />
        <h2 className="font-medium text-sm">{t('exportCycle.title')}</h2>
      </div>
      <p className="text-xs text-ui-muted">{t('exportCycle.hint')}</p>
      {body}
    </GlassCard>
  )
}

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


</cursor_untrusted_data_1337>