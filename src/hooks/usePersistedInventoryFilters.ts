import { useEffect, useState } from 'react'

const STORAGE_KEY = 'droid-companion-inventory-filters'

export type InventoryFilters = {
  search: string
  rarityFilter: string
  tierFilter: string
  neededFilter: 'all' | 'needed' | 'not-needed'
}

const defaults: InventoryFilters = {
  search: '',
  rarityFilter: 'all',
  tierFilter: 'all',
  neededFilter: 'all',
}

function readStored(): InventoryFilters {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<InventoryFilters>
    return {
      search: typeof parsed.search === 'string' ? parsed.search : defaults.search,
      rarityFilter:
        typeof parsed.rarityFilter === 'string' ? parsed.rarityFilter : defaults.rarityFilter,
      tierFilter: typeof parsed.tierFilter === 'string' ? parsed.tierFilter : defaults.tierFilter,
      neededFilter:
        parsed.neededFilter === 'needed' ||
        parsed.neededFilter === 'not-needed' ||
        parsed.neededFilter === 'all'
          ? parsed.neededFilter
          : defaults.neededFilter,
    }
  } catch {
    return defaults
  }
}

export function usePersistedInventoryFilters() {
  const [filters, setFilters] = useState<InventoryFilters>(readStored)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  }, [filters])

  return [filters, setFilters] as const
}
