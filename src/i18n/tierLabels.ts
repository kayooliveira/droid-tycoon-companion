import type { TFunction } from 'i18next'
import en from './locales/en.json'
import pt from './locales/pt-BR.json'
import type { TierId } from '../domain/types'

const TIER_IDS: TierId[] = [
  'default',
  'gold',
  'diamond',
  'rainbow',
  'beskar',
  'galactic',
  'stellar',
  'kyber',
  'scourge',
]

const RARITY_IDS = ['common', 'rare', 'epic', 'legendary', 'mythic', 'iconic'] as const

export function tierLabel(t: TFunction, tier: TierId): string {
  return t(`tier.${tier}`)
}

export function buildI18nTierLabelMap(t: TFunction): Map<string, string> {
  return new Map(TIER_IDS.map((id) => [id, tierLabel(t, id)]))
}

export function rarityLabel(t: TFunction, rarityId: string): string {
  return t(`rarity.${rarityId}`, { defaultValue: rarityId })
}

/** Game JSON uses title-case (`Common`); i18n keys are lowercase ids. */
export function baseRarityIdFromGameValue(value: string): string {
  return value.trim().toLowerCase()
}

export function formatBaseRarity(value: string, t: TFunction): string {
  return rarityLabel(t, baseRarityIdFromGameValue(value))
}

export function buildI18nRarityLabelMapForLocale(locale: 'en' | 'pt-BR'): Map<string, string> {
  const tree = locale === 'pt-BR' ? pt : en
  const rarities = (tree as { rarity?: Record<string, string> }).rarity ?? {}
  return new Map(RARITY_IDS.map((id) => [id, rarities[id] ?? id]))
}

export function formatBaseRarityWithMap(value: string, labels: Map<string, string>): string {
  const id = baseRarityIdFromGameValue(value)
  return labels.get(id) ?? value
}

export function buildI18nTierLabelMapForLocale(locale: 'en' | 'pt-BR'): Map<string, string> {
  const tree = locale === 'pt-BR' ? pt : en
  const tiers = (tree as { tier?: Record<string, string> }).tier ?? {}
  return new Map(TIER_IDS.map((id) => [id, tiers[id] ?? id]))
}

export { TIER_IDS, RARITY_IDS }
