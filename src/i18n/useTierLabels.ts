import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { buildI18nTierLabelMap } from './tierLabels'

export function useTierLabels(): Map<string, string> {
  const { t, i18n } = useTranslation()
  return useMemo(() => buildI18nTierLabelMap(t), [t, i18n.language])
}
