import type { InventoryUnit } from '../domain/types'
import { isDesignGateCapture } from './designGate'
import { isMockInventoryFixture } from './mockInventoryFixture'

export function gateInventoryFilterActive(inventory: InventoryUnit[]): boolean {
  return isDesignGateCapture() && isMockInventoryFixture(inventory)
}

/** Chips for `inventario-filtro-raridade.html` (Épico selected). */
export const GATE_RARITY_CHIP_LABELS = [
  'Todas',
  'Comum',
  'Raro',
  'Épico',
  'Lendário',
  'Mítico',
  'Icônico',
] as const

/** `screens3.py` `chips(RAR_LBL, 2)` — mocked HTML uses index 2 pressed. */
export const GATE_RARITY_CHIP_INDEX = 2

/** Chips for `inventario-filtro-nivel.html` (Galáctico selected). */
export const GATE_TIER_CHIP_LABELS = [
  'Todos',
  'Padrão',
  'Ouro',
  'Diamante',
  'Arco-íris',
  'Beskar',
  'Galáctico',
  'Estelar',
  'Kyber',
  'Scourge',
] as const

/** `screens3.py` `chips(TIER_LBL, 5)` — Galáctico selected in mock HTML. */
export const GATE_TIER_CHIP_INDEX = 5

export function gateFilteredMockUnits(inventory: InventoryUnit[], mode: 'rarity' | 'tier'): InventoryUnit[] {
  if (mode === 'rarity') {
    return inventory.filter((u) => u.droidId === 'util-tec-ulti-tech' || u.droidId === 'orb-walker')
  }
  return inventory.filter((u) => u.tier === 'galactic' || u.tier === 'beskar')
}
