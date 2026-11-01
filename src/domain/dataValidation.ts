import { droidById, gameData } from './gameData'

export interface ValidationIssue {
  level: 'error' | 'warn'
  message: string
}

export function validateGameData(): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const ids = new Set<string>()

  for (const droid of gameData.droids) {
    if (ids.has(droid.id)) {
      issues.push({ level: 'error', message: `Duplicate droid id: ${droid.id}` })
    }
    ids.add(droid.id)
    if (!droid.imageLocal && !droid.imageMissing) {
      issues.push({
        level: 'warn',
        message: `Droid ${droid.id} has no imageLocal and no imageMissing flag`,
      })
    }
  }

  for (const cycle of gameData.cycles) {
    for (const rebirth of cycle.rebirths) {
      for (const req of rebirth.requirements) {
        if (!droidById.has(req.droidId)) {
          issues.push({
            level: 'error',
            message: `Missing droid ${req.droidId} in ${cycle.id} rebirth ${rebirth.rebirth}`,
          })
        }
      }
    }
  }

  return issues
}
