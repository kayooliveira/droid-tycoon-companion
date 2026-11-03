import type { TierId } from '../../domain/types'

/** Solid approximations of web tier gradients for @react-pdf chips. */
const TIER_PDF: Record<
  TierId,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  default: { backgroundColor: '#64748b', color: '#f8fafc', borderColor: '#475569' },
  gold: { backgroundColor: '#f5b942', color: '#422006', borderColor: '#d97706' },
  diamond: { backgroundColor: '#3b82f6', color: '#eff6ff', borderColor: '#1d4ed8' },
  rainbow: { backgroundColor: '#8b5cf6', color: '#ffffff', borderColor: '#6d28d9' },
  beskar: { backgroundColor: '#a8a29e', color: '#1c1917', borderColor: '#57534e' },
  galactic: { backgroundColor: '#6d28d9', color: '#f5f3ff', borderColor: '#4c1d95' },
  stellar: { backgroundColor: '#fbbf24', color: '#422006', borderColor: '#b45309' },
  kyber: { backgroundColor: '#059669', color: '#ecfdf5', borderColor: '#2563eb' },
  scourge: { backgroundColor: '#be123c', color: '#ffe4e6', borderColor: '#881337' },
}

export function tierPdfChipStyle(tierId: TierId) {
  return TIER_PDF[tierId] ?? TIER_PDF.default
}
