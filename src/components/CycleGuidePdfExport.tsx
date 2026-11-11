import { FilePdf } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exportCycleGuidePdf } from '../lib/exportCycle'
import { useAppStore } from '../store/useAppStore'
import { useToast } from './ToastProvider'
import { uiIconProps } from './ui/iconStyle'

async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function CycleGuidePdfExport({
  pathId,
  cycleName,
}: {
  pathId: string
  cycleName: string
}) {
  const { t } = useTranslation()
  const locale = useAppStore((s) => s.settings.locale)
  const { push } = useToast()
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    try {
      const blob = await exportCycleGuidePdf({
        pathId,
        locale: locale === 'pt-BR' ? 'pt-BR' : 'en',
      })
      const slug = pathId.replace(/[^a-z0-9]+/gi, '-')
      await downloadBlob(blob, `droiddeck-ciclo-guia-${slug}.pdf`)
      push(t('cycles.exportGuideDone'), { variant: 'success' })
    } catch {
      push(t('exportCycle.failed'), { variant: 'error' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn--secondary"
        data-testid="export-cycle-guide-pdf"
        disabled={busy}
        onClick={() => void run()}
      >
        <FilePdf {...uiIconProps} className="ic" />
        {busy ? '…' : t('cycles.exportGuidePdf')}
      </button>
      <p className="hint" style={{ marginTop: 8 }}>
        {t('cycles.exportGuideHint', { name: cycleName })}
      </p>
    </>
  )
}
