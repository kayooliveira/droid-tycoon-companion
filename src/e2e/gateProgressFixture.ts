import type { ProgressState } from '../domain/progress'
import type { InventoryUnit } from '../domain/types'
import { isDesignGateCapture } from './designGate'
import { isMockInventoryFixture } from './mockInventoryFixture'

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

export function gateCycleMeter(progress: ProgressState, inventory: InventoryUnit[]) {
  if (isGateSuperModalBackdrop(progress, inventory)) {
    return { completedOnPath: 40, nextRebirth: 40 }
  }
  return { completedOnPath: progress.completedOnPath, nextRebirth: progress.nextRebirth }
}

/** Accordion “Atual” / `.item` rows in `modal-super-renascimento.html` stay on #30. */
export function gateRebirthListNextRebirth(
  progress: ProgressState,
  inventory: InventoryUnit[],
): number {
  if (isGateSuperModalBackdrop(progress, inventory)) return 30
  return progress.nextRebirth
}
