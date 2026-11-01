import { Buffer } from 'buffer'
import { pdf } from '@react-pdf/renderer'
import type { ExportCycleInput } from '../exportCycle'
import { buildCyclePdfModel } from './buildCyclePdfModel'
import { registerPdfFonts } from './fonts'
import { GuidePdf } from './GuidePdf'
import { buildI18nTierLabelMapForLocale } from '../../i18n/tierLabels'
import { enrichCardRequirements, preprocessPdfImages } from './preprocessImages'
import { progressRebirthCards } from './buildCyclePdfModel'
import { ProgressPdf } from './ProgressPdf'

export async function renderCyclePdfBlob(input: ExportCycleInput): Promise<Blob> {
  const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer }
  if (!g.Buffer) g.Buffer = Buffer

  const model = buildCyclePdfModel(input)
  if (!model) throw new Error('Unknown cycle')

  registerPdfFonts()
  await preprocessPdfImages(model)

  let progressCards
  if (model.mode === 'progress') {
    const tierLabels = buildI18nTierLabelMapForLocale(model.locale)
    progressCards = await enrichCardRequirements(progressRebirthCards(input, tierLabels))
  }

  const doc =
    model.mode === 'guide' ? (
      <GuidePdf model={model} />
    ) : (
      <ProgressPdf model={model} progressCards={progressCards!} />
    )

  return pdf(doc).toBlob()
}
