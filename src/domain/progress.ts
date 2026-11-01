import { getNextPathId, getRebirth } from './gameData'
import { rebirthIsComplete } from './requirements'
import type { InventoryUnit } from './types'

export const SUPER_REBIRTH_UNLOCK_AFTER = 12
export const REBIRTHS_PER_PATH = 40

export interface ProgressState {
  pathId: string
  nextRebirth: number
  completedOnPath: number
}

export function createInitialProgress(pathId: string): ProgressState {
  return { pathId, nextRebirth: 1, completedOnPath: 0 }
}

export function canCompleteRebirth(
  pathId: string,
  rebirthNumber: number,
  inventory: InventoryUnit[],
  trackInventory: boolean,
): boolean {
  if (!trackInventory) return true
  return rebirthIsComplete(pathId, rebirthNumber, inventory, trackInventory)
}

export function completeRebirth(progress: ProgressState): ProgressState {
  const entry = getRebirth(progress.pathId, progress.nextRebirth)
  if (!entry) return progress

  const completedOnPath = progress.completedOnPath + 1
  const nextRebirth =
    progress.nextRebirth >= REBIRTHS_PER_PATH ? REBIRTHS_PER_PATH + 1 : progress.nextRebirth + 1

  return {
    ...progress,
    completedOnPath,
    nextRebirth,
  }
}

export function undoRebirth(progress: ProgressState): ProgressState {
  if (progress.completedOnPath <= 0) {
    return { ...progress, nextRebirth: 1, completedOnPath: 0 }
  }
  return {
    ...progress,
    completedOnPath: progress.completedOnPath - 1,
    nextRebirth: Math.max(1, progress.nextRebirth - 1),
  }
}

export function canSuperRebirth(progress: ProgressState): boolean {
  return progress.completedOnPath >= SUPER_REBIRTH_UNLOCK_AFTER
}

export function superRebirth(progress: ProgressState): ProgressState {
  const nextPath = getNextPathId(progress.pathId)
  return createInitialProgress(nextPath)
}

export function pathProgressPercent(progress: ProgressState): number {
  return Math.min(100, (progress.completedOnPath / REBIRTHS_PER_PATH) * 100)
}

export function isPathComplete(progress: ProgressState): boolean {
  return progress.completedOnPath >= REBIRTHS_PER_PATH
}
