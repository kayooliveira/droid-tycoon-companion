import { describe, expect, it } from 'vitest'
import { formatCycleDisplayName } from './cycleLabel'

describe('formatCycleDisplayName', () => {
  it('maps Path to Ciclo in pt-BR', () => {
    expect(formatCycleDisplayName('Path 1', 'pt-BR')).toBe('Ciclo 1')
  })

  it('keeps English label in en', () => {
    expect(formatCycleDisplayName('Path 1', 'en')).toBe('Path 1')
  })
})
