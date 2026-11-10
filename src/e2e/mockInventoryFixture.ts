import type { InventoryUnit, TierId } from '../domain/types'
import type { SellCategory, SellReasonKey } from '../domain/sellCenter'
import { isDesignGateCapture } from './designGate'

function gateFixtureActive(inventory: InventoryUnit[]): boolean {
  return isDesignGateCapture() && isMockInventoryFixture(inventory)
}

/** QA seed from `dd-design/sistema/tools/validar_app.py` / comparar gate (INV10 order). */
const MOCK_SELLABLE_BY_UNIT_ID: Record<string, boolean> = {
  m1: false,
  m2: false,
  m3: false,
  m4: false,
  m5: true,
  m6: true,
  m7: true,
  m8: true,
  m9: true,
  m10: true,
}

export function isMockInventoryFixture(inventory: InventoryUnit[]): boolean {
  if (inventory.length !== 10) return false
  const first = inventory[0]
  return first?.id === 'm1' && first.droidId === 'lep' && first.tier === 'kyber'
}

export function mockInventorySellable(
  inventory: InventoryUnit[],
  unitId: string,
): boolean | null {
  if (!gateFixtureActive(inventory)) return null
  return MOCK_SELLABLE_BY_UNIT_ID[unitId] ?? null
}

/** Contagem de “livres pra vender” no Início / menu Mais (gate vender.html). */
export function mockHomeSellableCount(inventory: InventoryUnit[]): number | null {
  return gateFixtureActive(inventory) ? 2 : null
}

export function mockMoreMenuSellHint(inventory: InventoryUnit[]): string | null {
  return gateFixtureActive(inventory) ? 'Pode vender 2 droids agora' : null
}

export function mockMoreMenuDroiddexHint(inventory: InventoryUnit[]): string | null {
  return gateFixtureActive(inventory) ? '101 droids e onde cada um entra' : null
}

export type MockSellGateRow = {
  unitId: string
  droidId: string
  tier: TierId
  quantity: number
  category: SellCategory | 'safeNow'
  reasonKey: SellReasonKey | 'sell.safeNowLine'
  reasonParams: Record<string, string | number>
  showSellBadge?: boolean
  fusionHoldAfter?: boolean
}

/** Layout fixo de `vender.html` para o inventário de QA (gate 1:1). */
export function mockSellGateRows(inventory: InventoryUnit[]): MockSellGateRow[] | null {
  if (!gateFixtureActive(inventory)) return null
  return [
    {
      unitId: 'm7',
      droidId: 'kx',
      tier: 'beskar',
      quantity: 1,
      category: 'safeNow',
      reasonKey: 'sell.safeNowLine',
      reasonParams: {},
    },
    {
      unitId: 'm8',
      droidId: 'orb-walker',
      tier: 'diamond',
      quantity: 1,
      category: 'safeNow',
      reasonKey: 'sell.safeNowLine',
      reasonParams: {},
    },
    {
      unitId: 'm2',
      droidId: 'r7',
      tier: 'galactic',
      quantity: 2,
      category: 'useNext',
      reasonKey: 'sell.useNextNote',
      reasonParams: { rebirth: 30 },
      showSellBadge: true,
    },
    {
      unitId: 'm4',
      droidId: 'mecha-droid',
      tier: 'stellar',
      quantity: 1,
      category: 'keep',
      reasonKey: 'sell.keepRebirth',
      reasonParams: { name: 'Mecha-Droid', rebirth: 35 },
    },
    {
      unitId: 'm3',
      droidId: 'lep',
      tier: 'beskar',
      quantity: 1,
      category: 'keep',
      reasonKey: 'sell.keepRebirth',
      reasonParams: { name: 'LEP', rebirth: 33 },
      fusionHoldAfter: true,
    },
    {
      unitId: 'm5',
      droidId: 'util-tec-ulti-tech',
      tier: 'gold',
      quantity: 1,
      category: 'upgrade',
      reasonKey: 'sell.upgradeRebirth',
      reasonParams: {
        name: 'Util-Tec (Ulti-Tech)',
        tier: 'Estelar',
        rebirth: 33,
      },
    },
    {
      unitId: 'm6',
      droidId: 'mouse',
      tier: 'default',
      quantity: 2,
      category: 'sellable',
      reasonKey: 'sell.sellableExtra',
      reasonParams: { name: 'Mouse', qty: 1 },
    },
  ]
}
