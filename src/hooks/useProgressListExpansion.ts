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

export function useProgressListExpansion(
  rebirthNumbers: number[],
  pathId: string,
  persistedAllExpanded: boolean,
  onPersistAllExpanded: (value: boolean) => void,
) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() =>
    buildExpandedMap(rebirthNumbers, persistedAllExpanded),
  )

  const rebirthKey = useMemo(() => rebirthNumbers.join(','), [rebirthNumbers])

  useEffect(() => {
    setExpanded(buildExpandedMap(rebirthNumbers, persistedAllExpanded))
  }, [pathId, persistedAllExpanded, rebirthKey, rebirthNumbers])

  const allExpanded = useMemo(
    () => areAllExpanded(rebirthNumbers, expanded),
    [rebirthNumbers, expanded],
  )

  const toggleOne = useCallback((rebirth: number) => {
    setExpanded((prev) => ({ ...prev, [rebirth]: !prev[rebirth] }))
  }, [])

  const toggleAll = useCallback(() => {
    if (areAllExpanded(rebirthNumbers, expanded)) {
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

  return { isExpanded, toggleOne, toggleAll, allExpanded }
}
