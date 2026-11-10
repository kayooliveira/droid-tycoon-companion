import { useCallback, useEffect, useMemo, useState } from 'react'

export function buildExpandedMap(rebirthNumbers: number[], expanded: boolean): Record<number, boolean> {
  const map: Record<number, boolean> = {}
  for (const n of rebirthNumbers) {
    map[n] = expanded
  }
  return map
}

export function areAllExpanded(rebirthNumbers: number[], expanded: Record<number, boolean>): boolean {
  return rebirthNumbers.length > 0 && rebirthNumbers.every((n) => expanded[n] !== false)
}

export function areAnyExpanded(rebirthNumbers: number[], expanded: Record<number, boolean>): boolean {
  return rebirthNumbers.some((n) => expanded[n] !== false)
}

export function useProgressListExpansion(
  rebirthNumbers: number[],
  pathId: string,
  nextRebirth: number,
  _persistedAllExpanded: boolean,
  onPersistAllExpanded: (value: boolean) => void,
  forcedExpanded?: Record<number, boolean> | null,
) {
  const rebirthKey = useMemo(() => rebirthNumbers.join(','), [rebirthNumbers])

  const defaultExpanded = useCallback(() => {
    if (forcedExpanded) {
      const map = buildExpandedMap(rebirthNumbers, false)
      for (const n of rebirthNumbers) {
        if (forcedExpanded[n] === true) map[n] = true
      }
      return map
    }
    if (_persistedAllExpanded) {
      return buildExpandedMap(rebirthNumbers, true)
    }
    const map = buildExpandedMap(rebirthNumbers, false)
    map[nextRebirth] = true
    return map
  }, [_persistedAllExpanded, forcedExpanded, rebirthNumbers, nextRebirth])

  const [expanded, setExpanded] = useState<Record<number, boolean>>(defaultExpanded)

  useEffect(() => {
    setExpanded(defaultExpanded())
    // Only re-seed when the path or step list changes (not when persist toggles in-session).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathId, rebirthKey])

  const allExpanded = useMemo(
    () => areAllExpanded(rebirthNumbers, expanded),
    [rebirthNumbers, expanded],
  )

  const anyExpanded = useMemo(
    () => areAnyExpanded(rebirthNumbers, expanded),
    [rebirthNumbers, expanded],
  )

  const toggleOne = useCallback((rebirth: number) => {
    setExpanded((prev) => ({ ...prev, [rebirth]: !prev[rebirth] }))
  }, [])

  const toggleAll = useCallback(() => {
    if (areAnyExpanded(rebirthNumbers, expanded)) {
      setExpanded(buildExpandedMap(rebirthNumbers, false))
      onPersistAllExpanded(false)
    } else {
      setExpanded(buildExpandedMap(rebirthNumbers, true))
      onPersistAllExpanded(true)
    }
  }, [expanded, onPersistAllExpanded, rebirthNumbers])

  const isExpanded = useCallback(
    (rebirth: number) => expanded[rebirth] !== false,
    [expanded],
  )

  const expandOne = useCallback((rebirth: number) => {
    setExpanded((prev) => ({ ...prev, [rebirth]: true }))
  }, [])

  return { isExpanded, toggleOne, toggleAll, allExpanded, anyExpanded, expandOne }
}
