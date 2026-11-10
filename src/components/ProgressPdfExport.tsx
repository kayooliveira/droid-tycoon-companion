import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportCycleProgressPdf } from '../lib/exportCycle'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'

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
      push(t('exportProgress.pdfDone'), { variant: 'success' })
    } catch {
      push(t('exportCycle.failed'), { variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="sec" id="progress-export" data-testid="progress-pdf-export">
      <div className="sec-h">
        <h2 className="t-h2">{t('exportProgress.title')}</h2>
      </div>
      <p className="hint" style={{ marginBottom: 12 }}>
        {t('exportProgress.hint')}
      </p>
      <button
        type="button"
        className="btn btn--secondary"
        disabled={busy}
        data-testid="export-progress-pdf"
        onClick={() => void run()}
      >
        <svg className="ic" width={22} height={22} viewBox="0 0 24 24" aria-hidden>
          <path d="M6 3.5h8l4 4V20.5H6z" />
          <path d="M14 3.5v4h4" />
        </svg>
        {t('exportProgress.pdf')}
      </button>
    </section>
  )
}
