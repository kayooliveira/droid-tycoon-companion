import { FilePdf } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportCycleProgressPdf } from '../lib/exportCycle'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { GlassCard } from './ui/GlassCard'
import { IconButton } from './ui/IconButton'
import { SectionHeader } from './ui/SectionHeader'
import { uiIconProps } from './ui/iconStyle'

async function downloadOrShare(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'application/pdf' })
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

export function ProgressPdfExport() {
  const { t } = useTranslation()
  const progress = useAppStore((s) => s.progress)
  const inventory = useAppStore((s) => s.inventory)
  const locale = useAppStore((s) => s.settings.locale)
  const { push } = useToast()
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    try {
      const blob = await exportCycleProgressPdf({
        pathId: progress.pathId,
        nextRebirth: progress.nextRebirth,
        completedOnPath: progress.completedOnPath,
        inventory,
        locale: locale === 'pt-BR' ? 'pt-BR' : 'en',
      })
      await downloadOrShare(blob, `droiddeck-meu-progresso-${progress.pathId}.pdf`)
      push(t('exportProgress.pdfDone'))
    } catch {
      push(t('exportCycle.failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <GlassCard className="p-4" id="progress-export" data-testid="progress-pdf-export">
      <SectionHeader icon={<FilePdf {...uiIconProps} />} title={t('exportProgress.title')} />
      <p className="text-xs text-ui-muted mb-3 text-pretty">{t('exportProgress.hint')}</p>
      <IconButton
        variant="soft"
        label={t('exportProgress.pdf')}
        disabled={busy}
        data-testid="export-progress-pdf"
        onClick={() => void run()}
      >
        {busy ? '…' : <FilePdf {...uiIconProps} />}
      </IconButton>
    </GlassCard>
  )
}
