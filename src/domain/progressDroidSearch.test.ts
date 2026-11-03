import { describe, expect, it } from 'vitest'
import { droidById, gameData } from './gameData'
import {
  collectDroidProgressNeeds,
  cycleNumberFromPathId,
  groupNeedsByPath,
  isDroidNeverNeededForProgress,
  nextUpcomingNeedRebirth,
  pathIdFromCycleNumber,
  rebirthNeedStatus,
} from './progressDroidSearch'
import { createInitialProgress } from './progress'

describe('progressDroidSearch', () => {
  it('maps ciclo number to path id', () => {
    expect(pathIdFromCycleNumber(1)).toBe('path-1')
    expect(cycleNumberFromPathId('path-3')).toBe(3)
  })

  it('collects MO-TRAK needs across cycles with tiers', () => {
    const hits = collectDroidProgressNeeds('mo-trak')
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.some((h) => h.pathId === 'path-1' && h.tier)).toBe(true)
    const grouped = groupNeedsByPath(hits, createInitialProgress('path-1'))
    expect(grouped[0]!.pathId).toBe('path-1')
  })

  it('marks done vs upcoming from user progress', () => {
    const progress = { pathId: 'path-1', nextRebirth: 10, completedOnPath: 9 }
    expect(rebirthNeedStatus('path-1', 5, progress)).toBe('done')
    expect(rebirthNeedStatus('path-1', 10, progress)).toBe('current')
    expect(rebirthNeedStatus('path-1', 11, progress)).toBe('upcoming')
    expect(rebirthNeedStatus('path-2', 5, progress)).toBe('upcoming')
  })

  it('picks next upcoming on current path first', () => {
    const hits = collectDroidProgressNeeds('mo-trak')
    const progress = { pathId: 'path-1', nextRebirth: 5, completedOnPath: 4 }
    const next = nextUpcomingNeedRebirth(hits, progress)
    expect(next).not.toBeNull()
    expect(next!.pathId).toBe('path-1')
    expect(next!.rebirth).toBeGreaterThanOrEqual(5)
  })

  it('detects droids never needed for progress', () => {
    const never = gameData.droids.find((d) => isDroidNeverNeededForProgress(d.id))
    expect(never).toBeDefined()
    expect(collectDroidProgressNeeds(never!.id)).toHaveLength(0)
    expect(droidById.get(never!.id)?.name).toBeTruthy()
  })
})
