/** Normalize droid names for fuzzy search (shared across Progress, Droiddex, Fusion, Inventory). */
export function normalizeDroidSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

export type DroidMatchRank = 'exact' | 'prefix' | 'substring' | 'fuzzy'

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length
  const row = new Array<number>(b.length + 1)
  for (let j = 0; j <= b.length; j++) row[j] = j
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]!
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]!
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost)
      prev = tmp
    }
  }
  return row[b.length]!
}

const RANK_ORDER: Record<DroidMatchRank, number> = {
  exact: 0,
  prefix: 1,
  substring: 2,
  fuzzy: 3,
}

export function rankDroidNameMatch(queryRaw: string, droidName: string): DroidMatchRank | null {
  const q = normalizeDroidSearchText(queryRaw)
  if (!q) return null
  const name = normalizeDroidSearchText(droidName)
  if (!name) return null
  if (q === name) return 'exact'
  if (name.startsWith(q)) return 'prefix'
  if (name.includes(q)) return 'substring'
  if (q.length >= 4) {
    const dist = levenshtein(q, name)
    const threshold = q.length <= 5 ? 1 : 2
    if (dist <= threshold) return 'fuzzy'
    if (name.length >= q.length && levenshtein(q, name.slice(0, q.length + 2)) <= threshold) {
      return 'fuzzy'
    }
  }
  return null
}

export function droidMatchesQuery(queryRaw: string, droidName: string, droidId?: string): boolean {
  if (!queryRaw.trim()) return true
  if (rankDroidNameMatch(queryRaw, droidName)) return true
  if (droidId && normalizeDroidSearchText(droidId).includes(normalizeDroidSearchText(queryRaw))) {
    return true
  }
  return false
}

export function compareDroidMatchRank(a: DroidMatchRank, b: DroidMatchRank): number {
  return RANK_ORDER[a] - RANK_ORDER[b]
}

export function pickBestDroidMatch<T extends { name: string; id: string }>(
  query: string,
  droids: T[],
): T | null {
  let best: { droid: T; rank: DroidMatchRank } | null = null
  for (const droid of droids) {
    const rank = rankDroidNameMatch(query, droid.name)
    if (!rank) continue
    if (
      !best ||
      compareDroidMatchRank(rank, best.rank) < 0 ||
      (rank === best.rank && droid.name.localeCompare(best.droid.name) < 0)
    ) {
      best = { droid, rank }
    }
  }
  return best?.droid ?? null
}

export function findMatchingDroids<T extends { name: string; id: string }>(
  query: string,
  droids: T[],
  limit = 8,
): T[] {
  const scored: Array<{ droid: T; rank: DroidMatchRank }> = []
  for (const droid of droids) {
    const rank = rankDroidNameMatch(query, droid.name)
    if (rank) scored.push({ droid, rank })
  }
  scored.sort((a, b) => {
    const r = compareDroidMatchRank(a.rank, b.rank)
    if (r !== 0) return r
    return a.droid.name.localeCompare(b.droid.name)
  })
  return scored.slice(0, limit).map((s) => s.droid)
}
