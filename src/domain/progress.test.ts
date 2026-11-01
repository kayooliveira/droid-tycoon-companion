import { describe, expect, it } from 'vitest'
import {
  canSuperRebirth,
  completeRebirth,
  createInitialProgress,
  superRebirth,
  undoRebirth,
} from './progress'

describe('progress', () => {
  it('advances rebirth', () => {
    const p = createInitialProgress('path-1')
    const next = completeRebirth(p)
    expect(next.completedOnPath).toBe(1)
    expect(next.nextRebirth).toBe(2)
  })

  it('undoes rebirth', () => {
    let p = createInitialProgress('path-1')
    p = completeRebirth(p)
    p = undoRebirth(p)
    expect(p.completedOnPath).toBe(0)
    expect(p.nextRebirth).toBe(1)
  })

  it('super rebirth moves to next path after 12', () => {
    let p = createInitialProgress('path-1')
    for (let i = 0; i < 12; i++) p = completeRebirth(p)
    expect(canSuperRebirth(p)).toBe(true)
    const next = superRebirth(p)
    expect(next.pathId).toBe('path-2')
    expect(next.nextRebirth).toBe(1)
  })
})
