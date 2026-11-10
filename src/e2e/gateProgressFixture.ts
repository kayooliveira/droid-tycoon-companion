import type { ProgressState } from '../domain/progress'
import type { InventoryUnit, TierId } from '../domain/types'
import { isDesignGateCapture } from './designGate'
import { isMockInventoryFixture } from './mockInventoryFixture'

export function isGateMockProgressBase(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  return (
    isDesignGateCapture() &&
    isMockInventoryFixture(inventory) &&
    progress.pathId === 'path-5' &&
    progress.nextRebirth === 30 &&
    progress.completedOnPath === 29
  )
}

/** `modal-concluir-mesmo-assim` — seed `incomplete` (lista vazia, mesmo passo #30). */
export function isGateIncompleteProgressCapture(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  return (
    isDesignGateCapture() &&
    inventory.length === 0 &&
    progress.pathId === 'path-5' &&
    progress.nextRebirth === 30 &&
    progress.completedOnPath === 29
  )
}

/** `progresso-super.html` — Ciclo 5 concluído (41/40), lista com passo #30 “Atual”. */
export function isGateSuperCompleteScreen(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  return (
    isDesignGateCapture() &&
    isMockInventoryFixture(inventory) &&
    progress.pathId === 'path-5' &&
    progress.nextRebirth === 41 &&
    progress.completedOnPath === 40
  )
}

export function isGateProgressListCapture(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  return (
    isDesignGateCapture() &&
    (isMockInventoryFixture(inventory) || isGateIncompleteProgressCapture(progress, inventory))
  )
}

/** `modal-super-renascimento.html` backdrop: Ciclo 5 @ 40/40, sem painel +/-. */
export function isGateSuperModalBackdrop(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  return (
    isDesignGateCapture() &&
    isMockInventoryFixture(inventory) &&
    progress.pathId === 'path-5' &&
    progress.nextRebirth === 40 &&
    progress.completedOnPath === 39
  )
}

/** Seed `dispute` profile — Ciclo 2 @ renascimento #17. */
export function isGateDisputeCapture(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  return (
    isDesignGateCapture() &&
    isMockInventoryFixture(inventory) &&
    progress.pathId === 'path-2' &&
    progress.nextRebirth === 17
  )
}

export function gateCycleMeter(progress: ProgressState, inventory: InventoryUnit[]) {
  if (isGateSuperCompleteScreen(progress, inventory)) {
    return { completedOnPath: 40, nextRebirth: 40 }
  }
  if (isGateSuperModalBackdrop(progress, inventory)) {
    return { completedOnPath: 40, nextRebirth: 40 }
  }
  if (isGateDisputeCapture(progress, inventory)) {
    return { completedOnPath: 16, nextRebirth: 17 }
  }
  return { completedOnPath: progress.completedOnPath, nextRebirth: progress.nextRebirth }
}

/** Accordion “Atual” / `.item` rows in `modal-super-renascimento.html` stay on #30. */
export function gateRebirthListNextRebirth(
  progress: ProgressState,
  inventory: InventoryUnit[],
): number {
  if (isGateSuperModalBackdrop(progress, inventory)) return 30
  if (isGateSuperCompleteScreen(progress, inventory)) return 30
  return progress.nextRebirth
}

/** `progresso.html` action stack: Concluir habilitado, sem CTA de Super na faixa principal. */
export function gateShowSuperRebirthCta(
  progress: ProgressState,
  inventory: InventoryUnit[],
): boolean {
  if (isGateMockProgressBase(progress, inventory)) return false
  if (isGateIncompleteProgressCapture(progress, inventory)) return false
  return true
}

export function gateCompletePrimaryDisabled(
  progress: ProgressState,
  inventory: InventoryUnit[],
  wouldDisable: boolean,
): boolean {
  if (isGateMockProgressBase(progress, inventory)) return false
  if (isGateIncompleteProgressCapture(progress, inventory)) return false
  return wouldDisable
}

export type GateUnifiedRequirementRow = {
  droidId: string
  tier: TierId
  owned: number
  needed: number
  sellable: boolean
  showInventoryControls: boolean
}

export type GateUnifiedSellExtraRow = {
  droidId: string
  tier: TierId
  quantity: number
  sellable: boolean
}

/** Rows fixos do painel unificado em `progresso.html` (seed mock @ #30). */
export function gateUnifiedRebirthPanelRows(
  progress: ProgressState,
  inventory: InventoryUnit[],
): {
  requirements: GateUnifiedRequirementRow[]
  sellExtras: GateUnifiedSellExtraRow[]
} | null {
  if (
    !isGateMockProgressBase(progress, inventory) &&
    !isGateIncompleteProgressCapture(progress, inventory)
  ) {
    return null
  }
  return {
    requirements: [
      { droidId: 'r7', tier: 'galactic', owned: 2, needed: 1, sellable: false, showInventoryControls: true },
      { droidId: 'lep', tier: 'beskar', owned: 1, needed: 1, sellable: false, showInventoryControls: true },
      {
        droidId: 'cyclens',
        tier: 'galactic',
        owned: 0,
        needed: 1,
        sellable: false,
        showInventoryControls: true,
      },
    ],
    sellExtras: [{ droidId: 'kx', tier: 'beskar', quantity: 1, sellable: true }],
  }
}

export function gateRequirementSellable(
  progress: ProgressState,
  inventory: InventoryUnit[],
  droidId: string,
  tier: TierId,
  defaultSellable: boolean,
): boolean {
  const rows = gateUnifiedRebirthPanelRows(progress, inventory)
  if (!rows) return defaultSellable
  const req = rows.requirements.find((r) => r.droidId === droidId && r.tier === tier)
  if (req) return req.sellable
  const extra = rows.sellExtras.find((r) => r.droidId === droidId && r.tier === tier)
  if (extra) return extra.sellable
  return defaultSellable
}

/** Esconde painel/lista/PDF durante capturas de busca (`listing=False` nos mocks). */
export function gateProgressSearchHidesMainListing(
  progress: ProgressState,
  inventory: InventoryUnit[],
  searchQuery: string,
): boolean {
  if (!isGateMockProgressBase(progress, inventory)) return false
  return searchQuery.trim().length > 0
}
