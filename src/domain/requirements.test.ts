import { describe, expect, it } from 'vitest'
import { evaluateRequirements, metRequirementCount } from './requirements'
import type { InventoryUnit, Requirement } from './types'

const reqs: Requirement[] = [
  { droidId: 'cb', rarity: 'default', quantity: 1 },
  { droidId: 'pit', rarity: 'default', quantity: 1 },
  { droidId: 'drk-1-probe', rarity: 'default', quantity: 1 },
]

describe('requirements', () => {
  it('marks ready when inventory satisfies tier', () => {
    const inventory: InventoryUnit[] = [
      { id: '1', droidId: 'cb', tier: 'gold', quantity: 1 },
      { id: '2', droidId: 'pit', tier: 'default', quantity: 1 },
      { id: '3', droidId: 'drk-1-probe', tier: 'default', quantity: 1 },
    ]
    const checks = evaluateRequirements(reqs, inventory, true)
    expect(metRequirementCount(checks)).toBe(3)
  })

  it('marks missing when empty', () => {
    const checks = evaluateRequirements(reqs, [], true)
    expect(checks.every((c) => c.status === 'missing')).toBe(true)
  })
})
